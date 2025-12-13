import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnoseStructure() {
  console.log('🔍 Diagnosticando estructura de snapshots...\n')

  const snapshots = await prisma.packageSnapshot.findMany({
    take: 3,
  })

  for (const snapshot of snapshots) {
    console.log(`\n📦 Snapshot: ${snapshot.nombre}`)
    console.log('Estructura completa:')
    console.log(JSON.stringify(snapshot, null, 2))
  }

  await prisma.$disconnect()
}

diagnoseStructure().catch(console.error)
