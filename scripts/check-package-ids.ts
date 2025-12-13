import { prisma } from '../src/lib/prisma'

async function checkPackageIds() {
  try {
    const quotations = await prisma.quotationConfig.findMany({
      select: {
        numero: true,
        id: true,
        packagesSnapshot: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3 // Solo las últimas 3 para ver el patrón
    })

    console.log('='.repeat(60))
    console.log('📊 VERIFICANDO IDs EN packagesSnapshot')
    console.log('='.repeat(60))
    
    quotations.forEach(q => {
      console.log(`\n${q.numero} (quotationId: ${q.id})`)
      const packages = q.packagesSnapshot as any[] | null
      if (packages && Array.isArray(packages)) {
        packages.forEach((pkg, idx) => {
          console.log(`  [${idx}] nombre: "${pkg.nombre}", id: "${pkg.id || 'undefined'}"`)
        })
      }
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPackageIds()
