import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixQuotationsState() {
  try {
    console.log('🔄 Limpiando estados inválidos en BD...')

    // Usar SQL directo para no parsear enums inválidos
    // Cast a text para poder comparar con strings
    await prisma.$executeRawUnsafe(`
      UPDATE "QuotationConfig" 
      SET "estado" = 'CARGADA'
      WHERE "estado" IS NULL 
         OR "estado"::text = '' 
         OR "estado"::text NOT IN ('CARGADA', 'ACTIVA', 'INACTIVA', 'ACEPTADA', 'RECHAZADA', 'NUEVA_PROPUESTA', 'EXPIRADA')
    `)

    console.log('✅ Estados limpiados')

    // Ahora ver la distribución con consulta segura
    const result = await prisma.$queryRaw<Array<{ estado: string | null; count: bigint }>>`
      SELECT "estado", COUNT(*) as count FROM "QuotationConfig" GROUP BY "estado" ORDER BY count DESC
    `

    console.log('\n📊 Distribución de estados en BD:')
    result.forEach((r) => {
      console.log(`  ${r.estado || '(NULL)'}: ${r.count}`)
    })

    const total = result.reduce((sum, r) => sum + Number(r.count), 0)
    console.log(`\n✅ Total cotizaciones: ${total}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixQuotationsState()
