import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DE BD\n')

  // 1. Obtener todas las cotizaciones
  const quotations = await prisma.quotationConfig.findMany({
    select: {
      id: true,
      numero: true,
      isGlobal: true,
      activo: true,
    },
    orderBy: { numero: 'asc' },
  })

  console.log('📋 QUOTATIONCONFIG:')
  console.table(quotations)

  // 2. Obtener todos los snapshots
  const snapshots = await prisma.packageSnapshot.findMany({
    select: {
      id: true,
      nombre: true,
      quotationConfigId: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log('\n📦 PACKAGESNAPSHOT:')
  console.table(snapshots)

  // 3. Verificar relaciones rotas
  console.log('\n🔗 ANÁLISIS DE RELACIONES:')
  const snapshotsConQuotationId = snapshots.filter(s => s.quotationConfigId)
  const snapshotsSinQuotationId = snapshots.filter(s => !s.quotationConfigId)

  console.log(`✅ Snapshots con quotationConfigId: ${snapshotsConQuotationId.length}`)
  console.log(`Snapshots SIN quotationConfigId: ${snapshotsSinQuotationId.length}`)

  // 4. Verificar si los quotationConfigId existen
  const quotationIds = quotations.map(q => q.id)
  const invalidReferences = snapshotsConQuotationId.filter(
    s => !quotationIds.includes(s.quotationConfigId!)
  )

  if (invalidReferences.length > 0) {
    console.log(`\n⚠️ Snapshots con quotationConfigId INVÁLIDO: ${invalidReferences.length}`)
    console.table(invalidReferences)
  } else {
    console.log('\n✅ Todos los quotationConfigId son válidos')
  }

  // 5. Mostrar qué snapshots NO tienen cotización asociada
  if (snapshotsSinQuotationId.length > 0) {
    console.log(`\n⚠️ Snapshots huérfanos (sin cotización):`)
    console.table(snapshotsSinQuotationId)
  }

  console.log('\n✨ Diagnóstico completado')
}

diagnose()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => process.exit(0))
