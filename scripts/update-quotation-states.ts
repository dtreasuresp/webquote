import { prisma } from '@/lib/prisma'

/**
 * Script para actualizar todas las cotizaciones sin estado
 * Asigna CARGADA como estado por defecto
 */
async function updateQuotationsState() {
  try {
    console.log('🔄 Actualizando cotizaciones sin estado...')

    // Contar cuántas tienen estado NULL
    const countNull = await prisma.quotationConfig.count({
      where: {
        estado: null,
      },
    })

    console.log(`Found ${countNull} quotations with NULL estado`)

    // Actualizar todas las que tienen estado NULL a CARGADA
    const updated = await prisma.quotationConfig.updateMany({
      where: {
        estado: null,
      },
      data: {
        estado: 'CARGADA',
      },
    })

    console.log(`✅ Updated ${updated.count} quotations`)

    // Verificar resultado
    const result = await prisma.quotationConfig.groupBy({
      by: ['estado'],
      _count: {
        id: true,
      },
    })

    console.log('Estado distribution:')
    result.forEach((r) => {
      console.log(`  ${r.estado}: ${r._count.id}`)
    })
  } catch (error) {
    console.error('❌ Error updating quotations:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateQuotationsState()
