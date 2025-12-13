import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🔄 Reseteando descuentos a 0%...\n')

  try {
    const snapshotsActualizar = [
      'cmivdyoxl000nylzcbexrlyvv', // Gran Hogar - 8%
      'cmivdyotd000lylzc46yn23jd', // Puertas Abiertas - 7%
      'cmivdyokx000jylzclp4b0895', // Cimientos - 5%
    ]

    for (const id of snapshotsActualizar) {
      const snapshot = await prisma.packageSnapshot.update({
        where: { id },
        data: {
          descuento: 0,
          descuentoPagoUnico: 0,
          descuentosGenerales: null,
          descuentosPorServicio: null,
          configDescuentos: null,
        },
      })

      console.log(`✅ ${snapshot.nombre}: descuentos reseteados a 0%`)
    }

    console.log('\n✅ Todos los descuentos han sido reseteados correctamente')
  } catch (error) {
    console.error('Error al resetear descuentos:', error)
  }
}

main()
  .finally(() => prisma.$disconnect())
