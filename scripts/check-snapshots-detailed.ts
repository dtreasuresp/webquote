import { prisma } from '../src/lib/prisma'

async function checkDetailed() {
  try {
    const quotations = await prisma.quotationConfig.findMany({
      select: {
        numero: true,
        packagesSnapshot: true,
        packagesSnapshotAt: true,
        _count: { select: { snapshots: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('='.repeat(80))
    console.log('📊 ANÁLISIS DETALLADO: packagesSnapshot (JSON) vs snapshots (relación)')
    console.log('='.repeat(80))
    
    quotations.forEach(q => {
      const jsonSnapshots = q.packagesSnapshot 
        ? (typeof q.packagesSnapshot === 'string' 
            ? JSON.parse(q.packagesSnapshot) 
            : q.packagesSnapshot) 
        : []
      
      const jsonCount = Array.isArray(jsonSnapshots) ? jsonSnapshots.length : 0
      
      console.log(`${q.numero}`)
      console.log(`   📦 Relación snapshots: ${q._count.snapshots}`)
      console.log(`   📋 JSON packagesSnapshot: ${jsonCount} paquetes`)
      console.log(`   📅 packagesSnapshotAt: ${q.packagesSnapshotAt ? q.packagesSnapshotAt : 'null'}`)
      
      if (jsonCount > 0 && Array.isArray(jsonSnapshots)) {
        console.log(`   📝 Nombres: ${jsonSnapshots.map((s: any) => s.nombre).join(', ')}`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDetailed()
