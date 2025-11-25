/**
 * Script de migración para convertir snapshots del formato antiguo al nuevo
 * Ejecutar con: npx ts-node prisma/migrate-servicios-base.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

async function migrarServiciosBase() {
  console.log('🚀 Iniciando migración de serviciosBase...\n')

  try {
    // Obtener todos los snapshots
    const snapshots = await prisma.packageSnapshot.findMany()
    
    console.log(`📊 Total de snapshots encontrados: ${snapshots.length}\n`)

    if (snapshots.length === 0) {
      console.log('✅ No hay snapshots para migrar.')
      return
    }

    let migrados = 0
    let sinCambios = 0

    for (const snapshot of snapshots) {
      const data = snapshot as any

      // Si ya tiene serviciosBase en formato array, skip
      if (Array.isArray(data.serviciosBase)) {
        console.log(`⏭️  Snapshot "${snapshot.nombre}" ya está en el nuevo formato`)
        sinCambios++
        continue
      }

      // Si tiene los campos antiguos (hostingPrice, mailboxPrice, dominioPrice)
      if (data.hostingPrice !== undefined || data.mailboxPrice !== undefined || data.dominioPrice !== undefined) {
        const serviciosBase: ServicioBase[] = [
          {
            id: '1',
            nombre: 'Hosting',
            precio: data.hostingPrice || 0,
            mesesGratis: data.mesesGratis || 0,
            mesesPago: data.mesesPago || 12,
          },
          {
            id: '2',
            nombre: 'Mailbox',
            precio: data.mailboxPrice || 0,
            mesesGratis: data.mesesGratis || 0,
            mesesPago: data.mesesPago || 12,
          },
          {
            id: '3',
            nombre: 'Dominio',
            precio: data.dominioPrice || 0,
            mesesGratis: data.mesesGratis || 0,
            mesesPago: data.mesesPago || 12,
          },
        ]

        // Actualizar el snapshot con el nuevo formato
        await prisma.packageSnapshot.update({
          where: { id: snapshot.id },
          data: {
            serviciosBase: serviciosBase as any,
          },
        })

        console.log(`✅ Migrado: "${snapshot.nombre}"`)
        console.log(`   - Hosting: $${data.hostingPrice}`)
        console.log(`   - Mailbox: $${data.mailboxPrice}`)
        console.log(`   - Dominio: $${data.dominioPrice}`)
        console.log(`   - Meses Gratis: ${data.mesesGratis}, Meses Pago: ${data.mesesPago}\n`)
        
        migrados++
      } else {
        console.log(`⚠️  Snapshot "${snapshot.nombre}" no tiene datos para migrar`)
        sinCambios++
      }
    }

    console.log('\n📈 Resumen de migración:')
    console.log(`   ✅ Migrados: ${migrados}`)
    console.log(`   ⏭️  Sin cambios: ${sinCambios}`)
    console.log(`   📊 Total: ${snapshots.length}`)
    console.log('\n✨ Migración completada exitosamente!')

  } catch (error) {
    console.error('Error durante la migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar migración
migrarServiciosBase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
