// Script para verificar fechas de cotizaciones
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    const cotizaciones = await prisma.quotationConfig.findMany({
      select: {
        id: true,
        numero: true,
        versionNumber: true,
        createdAt: true,
        updatedAt: true,
        isGlobal: true
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    })
    
    console.log('\n📊 ÚLTIMAS 15 VERSIONES DE COTIZACIONES:')
    console.log('=' .repeat(120))
    console.log('Número'.padEnd(20) + ' | ' + 'Version'.padEnd(8) + ' | ' + 'createdAt'.padEnd(22) + ' | ' + 'updatedAt'.padEnd(22) + ' | ' + 'Status'.padEnd(12) + ' | ' + 'isGlobal')
    console.log('-'.repeat(120))
    
    cotizaciones.forEach(q => {
      const created = new Date(q.createdAt).toLocaleString('es-CO')
      const updated = new Date(q.updatedAt).toLocaleString('es-CO')
      const match = created === updated ? '⚠️ IGUALES' : '✅ DIFERENTES'
      
      console.log(
        q.numero.padEnd(20) + ' | ' + 
        ('v' + q.versionNumber).padEnd(8) + ' | ' + 
        created.padEnd(22) + ' | ' + 
        updated.padEnd(22) + ' | ' + 
        match.padEnd(12) + ' | ' + 
        q.isGlobal
      )
    })
    
    // Resumen
    const iguales = cotizaciones.filter(q => 
      new Date(q.createdAt).toLocaleString('es-CO') === new Date(q.updatedAt).toLocaleString('es-CO')
    ).length
    
    console.log('\n📈 RESUMEN:')
    console.log(`   - Total cotizaciones: ${cotizaciones.length}`)
    console.log(`   - Con fechas iguales: ${iguales}`)
    console.log(`   - Con fechas diferentes: ${cotizaciones.length - iguales}`)
    
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
