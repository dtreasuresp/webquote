import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRelationships() {
  console.log('🔧 REPARANDO RELACIONES\n')

  // Obtener todas las cotizaciones y snapshots
  const quotations = await prisma.quotationConfig.findMany({
    orderBy: { numero: 'asc' },
  })

  const snapshots = await prisma.packageSnapshot.findMany({
    orderBy: { nombre: 'asc' },
  })

  console.log(`Cotizaciones: ${quotations.length}`)
  console.log(`Snapshots: ${snapshots.length}\n`)

  // Estrategia: Asignar los 3 snapshots a las cotizaciones de forma balanceada
  // Si hay 2 cotizaciones y 3 snapshots:
  // - Cotización 1: Constructor + Obra Maestra
  // - Cotización 2: Imperio Digital

  if (quotations.length === 2 && snapshots.length === 3) {
    const [quote1, quote2] = quotations
    const [imperio, obra, constructor] = snapshots

    console.log(`📌 Asignando snapshots a cotizaciones:\n`)

    // Opción A: Todos los snapshots a la primera cotización
    console.log(`Asignando todos los snapshots a: ${quote1.numero}`)
    
    await prisma.packageSnapshot.update({
      where: { id: imperio.id },
      data: { quotationConfigId: quote1.id },
    })
    console.log(`  ✓ Imperio Digital → ${quote1.numero}`)

    await prisma.packageSnapshot.update({
      where: { id: obra.id },
      data: { quotationConfigId: quote1.id },
    })
    console.log(`  ✓ Obra Maestra → ${quote1.numero}`)

    await prisma.packageSnapshot.update({
      where: { id: constructor.id },
      data: { quotationConfigId: quote1.id },
    })
    console.log(`  ✓ Constructor → ${quote1.numero}`)

    console.log(`\n✨ Relaciones reparadas exitosamente`)
    console.log(`Todos los 3 snapshots están ahora asociados a: ${quote1.numero}`)
  } else {
    console.log(`⚠️  Caso no previsto: ${quotations.length} cotizaciones, ${snapshots.length} snapshots`)
  }

  // Verificar resultado
  console.log('\n🔍 Verificando resultado:\n')
  const updatedSnapshots = await prisma.packageSnapshot.findMany({
    select: {
      nombre: true,
      quotationConfigId: true,
    },
  })
  console.table(updatedSnapshots)
}

fixRelationships()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
    process.exit(0)
  })
