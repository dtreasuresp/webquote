import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('📋 Limpiando estado vacío y poblando desde activo...\n')
    
    // Paso 1: Limpiar cadenas vacías convirtiéndolas a NULL manualmente
    // Lo hacemos con una query raw más cuidadosa
    console.log('1️⃣ Paso 1: Identificar cotizaciones con estado vacío...')
    const emptyStateQuotations: any[] = await (prisma as any).$queryRaw`
      SELECT id, numero, activo 
      FROM "QuotationConfig"
      WHERE "estado"::text = '' OR "estado" IS NULL
      LIMIT 5;
    `
    console.log(`   → Encontradas ${emptyStateQuotations.length} cotizaciones para actualizar`)
    
    // Paso 2: Actualizar una por una de forma segura
    console.log('\n2️⃣ Paso 2: Actualizando estado...')
    let updated = 0
    for (const q of emptyStateQuotations) {
      const newState = q.activo ? 'ACTIVA' : 'INACTIVA'
      try {
        await (prisma as any).$executeRaw`
          UPDATE "QuotationConfig"
          SET "estado" = ${newState}::"QuotationState"
          WHERE id = ${q.id}
        `
        updated++
      } catch (err: any) {
        console.error(`   ⚠️ Error actualizando ${q.numero}:`, err.message)
      }
    }
    console.log(`   ✅ Actualizadas ${updated} cotizaciones`)
    
    // Paso 3: Estadísticas finales
    console.log('\n3️⃣ Paso 3: Estadísticas finales...')
    const stats: any[] = await (prisma as any).$queryRaw`
      SELECT 
        COALESCE("estado"::text, 'NULL') as estado,
        COUNT(*) as total
      FROM "QuotationConfig"
      GROUP BY "estado"
      ORDER BY "estado";
    `
    
    console.log('   📊 Resumen por estado:')
    stats.forEach((s: any) => {
      console.log(`      - ${s.estado}: ${s.total} cotizaciones`)
    })
    
    console.log('\n✅ ¡Proceso completado exitosamente!')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
