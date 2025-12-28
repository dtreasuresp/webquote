import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script para actualizar todas las cotizaciones sin estado o con estado inválido
 */
async function fixQuotationsState() {
  try {
    console.log('🔄 Verificando cotizaciones...')

    // Ver la distribución actual
    const all = await prisma.quotationConfig.findMany({
      select: {
        id: true,
        numero: true,
        estado: true,
      },
      take: 5,
    })

    console.log('Cotizaciones actuales:')
    all.forEach((q) => {
      console.log(`  ${q.numero}: estado = ${q.estado}`)
    })

    // Actualizar usando raw SQL para cualquier estado inválido
    // Primero limpiar vacíos y NULLs
    const forceUpdate = await prisma.$executeRawUnsafe(`
      UPDATE "QuotationConfig" 
      SET "estado" = $1::text 
      WHERE "estado" IS NULL OR "estado" = '' OR "estado" NOT IN (
        'CARGADA', 'ACTIVA', 'INACTIVA', 'ACEPTADA', 'RECHAZADA', 'NUEVA_PROPUESTA', 'EXPIRADA'
      )
    `, 'CARGADA')
    console.log(`✅ Actualizado: ${forceUpdate}`)

    // Ver resultado
    const result = await prisma.quotationConfig.groupBy({
      by: ['estado'],
      _count: { id: true },
    })

    console.log('\nDistribución de estados:')
    result.forEach((r) => {
      console.log(`  ${r.estado}: ${r._count.id}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixQuotationsState()
