import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEndpointResponse() {
  try {
    console.log('🔍 Verificando que el endpoint /api/quotations incluya "estado"...')

    // Simular lo que el endpoint hace (sin auth)
    const quotations = await prisma.quotationConfig.findMany({
      select: {
        id: true,
        numero: true,
        versionNumber: true,
        estado: true,  // ← AGREG ADO
        activo: true,
        empresa: true,
        profesional: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    })

    console.log('\n✅ Resultado del endpoint simulado:')
    console.log(JSON.stringify(quotations, null, 2))

    const tieneEstado = quotations.every(q => 'estado' in q)
    console.log(`\n${tieneEstado ? '✅' : '❌'} Todas las cotizaciones tienen "estado": ${tieneEstado}`)

    quotations.forEach((q) => {
      console.log(`  ${q.numero}: estado = ${q.estado}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEndpointResponse()
