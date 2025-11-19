import prisma from '@/lib/prisma'

const opcionesPagoConfiguracion = {
  'Constructor': {
    opcionesPago: [
      { nombre: 'Pago 1', porcentaje: 50, descripcion: 'Al iniciar' },
      { nombre: 'Pago 2', porcentaje: 50, descripcion: 'Al publicar' },
    ],
    descuentoPagoUnico: 0,
  },
  'Imperio Digital': {
    opcionesPago: [
      { nombre: 'Pago 1', porcentaje: 40, descripcion: 'Al iniciar' },
      { nombre: 'Pago 2', porcentaje: 40, descripcion: 'Al diseño' },
      { nombre: 'Pago 3', porcentaje: 13, descripcion: 'Pruebas' },
      { nombre: 'Pago 4', porcentaje: 7, descripcion: 'Publicar' },
    ],
    descuentoPagoUnico: 15,
  },
  'Obra Maestra': {
    opcionesPago: [
      { nombre: 'Pago 1', porcentaje: 40, descripcion: 'Al iniciar' },
      { nombre: 'Pago 2', porcentaje: 40, descripcion: 'Al diseño' },
      { nombre: 'Pago 3', porcentaje: 20, descripcion: 'Entrega' },
    ],
    descuentoPagoUnico: 10,
  },
}

export async function migratePaymentOptions() {
  try {
    console.log('Iniciando migración de opciones de pago...')

    for (const [nombre, config] of Object.entries(opcionesPagoConfiguracion)) {
      const snapshot = await prisma.packageSnapshot.findFirst({
        where: { nombre },
      })

      if (snapshot) {
        await prisma.packageSnapshot.update({
          where: { id: snapshot.id },
          data: {
            opcionesPago: config.opcionesPago,
            descuentoPagoUnico: config.descuentoPagoUnico,
          },
        })
        console.log(`✅ Actualizado: ${nombre}`)
      } else {
        console.log(`⚠️  No encontrado: ${nombre}`)
      }
    }

    console.log('✅ Migración completada')
  } catch (error) {
    console.error('❌ Error en migración:', error)
    throw error
  }
}

// Para ejecutar: npx ts-node prisma/migrate-payment-options.ts
if (require.main === module) {
  migratePaymentOptions()
    .catch(console.error)
    .finally(() => process.exit(0))
}
