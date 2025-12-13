import { prisma } from '../src/lib/prisma'

async function checkSnapshots() {
  try {
    // Obtener todos los snapshots con info relevante
    const snapshots = await prisma.packageSnapshot.findMany({
      select: {
        id: true,
        nombre: true,
        quotationConfigId: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('='.repeat(60))
    console.log('📊 ANÁLISIS DE SNAPSHOTS EN LA BD')
    console.log('='.repeat(60))
    
    console.log(`\n📦 Total de snapshots: ${snapshots.length}`)
    
    // Agrupar por nombre
    const byName: Record<string, number> = {}
    snapshots.forEach(s => {
      byName[s.nombre] = (byName[s.nombre] || 0) + 1
    })
    
    console.log('\n📋 Snapshots agrupados por nombre:')
    Object.entries(byName)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`   "${name}": ${count} versiones`)
      })
    
    // Snapshots con quotationConfigId
    const withQuotation = snapshots.filter(s => s.quotationConfigId)
    const withoutQuotation = snapshots.filter(s => !s.quotationConfigId)
    
    console.log(`\n🔗 Snapshots CON quotationConfigId: ${withQuotation.length}`)
    console.log(`🔓 Snapshots SIN quotationConfigId: ${withoutQuotation.length}`)
    
    // Ver quotationConfigs únicas
    const uniqueQuotationIds = [...new Set(withQuotation.map(s => s.quotationConfigId))]
    console.log(`\n📄 Cotizaciones únicas con snapshots: ${uniqueQuotationIds.length}`)
    
    // Obtener TODAS las cotizaciones
    const allQuotations = await prisma.quotationConfig.findMany({
      select: {
        id: true,
        empresa: true,
        numero: true,
        isGlobal: true,
        createdAt: true,
        _count: { select: { snapshots: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📑 TODAS las cotizaciones (${allQuotations.length}):`)
    allQuotations.forEach(q => {
      console.log(`   #${q.numero} - ${q.empresa} | global: ${q.isGlobal} | snapshots: ${q._count.snapshots}`)
    })
    
    // Snapshots activos vs inactivos
    const activos = snapshots.filter(s => s.activo).length
    const inactivos = snapshots.filter(s => !s.activo).length
    console.log(`\n✅ Snapshots activos: ${activos}`)
    console.log(`❌ Snapshots inactivos: ${inactivos}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSnapshots()
