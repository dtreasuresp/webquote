import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Migration: Migrar descuentos legacy a ConfigDescuentos
 * 
 * Convierte:
 * - paquete.descuento → configDescuentos.descuentoDirecto
 * - paquete.descuentosPorServicio → configDescuentos.descuentosGranulares
 * - paquete.descuentosGenerales → configDescuentos.descuentoGeneral
 * - paquete.descuentoPagoUnico → configDescuentos.descuentoPagoUnico (ya estaba aquí)
 */
async function migrateDiscountsToConfigDescuentos() {
  console.log('🚀 Iniciando migración de descuentos legacy a ConfigDescuentos...\n')

  const snapshots = await prisma.packageSnapshot.findMany()
  let migrados = 0
  let errores = 0

  for (const snapshot of snapshots) {
    try {
      const paquete = snapshot.paquete as any
      
      // Si ya tiene configDescuentos bien configurado, saltar
      if (paquete.configDescuentos?.tipoDescuento !== 'ninguno') {
        console.log(`⏭️  ${snapshot.nombre}: Ya tiene configDescuentos configurado`)
        continue
      }

      // Detectar qué descuentos legacy tiene
      const tieneDescuentoDirecto = (paquete.descuento || 0) > 0
      const tieneDescuentosGranulares = paquete.descuentosPorServicio?.aplicarAServiciosBase || paquete.descuentosPorServicio?.aplicarAOtrosServicios || false
      const tieneDescuentoGeneral = paquete.descuentosGenerales?.aplicarAlDesarrollo || paquete.descuentosGenerales?.aplicarAServiciosBase || paquete.descuentosGenerales?.aplicarAOtrosServicios || false

      let nuevoTipo = 'ninguno'
      let configDescuentosNueva = {
        tipoDescuento: 'ninguno',
        descuentoGeneral: {
          porcentaje: 0,
          aplicarA: {
            desarrollo: false,
            serviciosBase: false,
            otrosServicios: false,
          },
        },
        descuentosGranulares: {
          desarrollo: 0,
          serviciosBase: {},
          otrosServicios: {},
        },
        descuentoPagoUnico: paquete.descuentoPagoUnico || 0,
        descuentoDirecto: 0,
      }

      // Migrar descuentos granulares
      if (tieneDescuentosGranulares) {
        nuevoTipo = 'granular'
        
        if (paquete.descuentosPorServicio?.serviciosBase) {
          const serviciosBaseMap: any = {}
          for (const s of paquete.descuentosPorServicio.serviciosBase) {
            if (s.aplicarDescuento) {
              serviciosBaseMap[s.servicioId] = s.porcentajeDescuento
            }
          }
          configDescuentosNueva.descuentosGranulares.serviciosBase = serviciosBaseMap
        }

        if (paquete.descuentosPorServicio?.otrosServicios) {
          const otrosServiciosMap: any = {}
          for (const s of paquete.descuentosPorServicio.otrosServicios) {
            if (s.aplicarDescuento) {
              otrosServiciosMap[s.servicioId] = s.porcentajeDescuento
            }
          }
          configDescuentosNueva.descuentosGranulares.otrosServicios = otrosServiciosMap
        }
      }
      // Migrar descuentos generales
      else if (tieneDescuentoGeneral) {
        nuevoTipo = 'general'
        configDescuentosNueva.descuentoGeneral = {
          porcentaje: paquete.descuentosGenerales?.porcentaje || 0,
          aplicarA: {
            desarrollo: paquete.descuentosGenerales?.aplicarAlDesarrollo || false,
            serviciosBase: paquete.descuentosGenerales?.aplicarAServiciosBase || false,
            otrosServicios: paquete.descuentosGenerales?.aplicarAOtrosServicios || false,
          },
        }
      }
      // Migrar descuento directo (último, es el campo descuento viejo)
      if (tieneDescuentoDirecto) {
        configDescuentosNueva.descuentoDirecto = paquete.descuento || 0
      }

      configDescuentosNueva.tipoDescuento = nuevoTipo

      // Actualizar snapshot
      const paqueteActualizado = {
        ...paquete,
        configDescuentos: configDescuentosNueva,
        descuento: 0, // Limpiar legacy
        descuentosGenerales: null, // Limpiar legacy
        descuentosPorServicio: null, // Limpiar legacy
      }

      await prisma.packageSnapshot.update({
        where: { id: snapshot.id },
        data: {
          paquete: paqueteActualizado as any,
        },
      })

      console.log(`✅ ${snapshot.nombre}:`)
      console.log(`   Tipo: ${nuevoTipo}`)
      if (tieneDescuentoDirecto) console.log(`   Descuento directo: ${paquete.descuento}%`)
      if (tieneDescuentoGeneral) console.log(`   Descuento general: ${paquete.descuentosGenerales?.porcentaje}%`)
      if (tieneDescuentosGranulares) console.log(`   Descuentos granulares detectados`)
      migrados++
    } catch (error) {
      console.error(`❌ Error migrando ${snapshot.nombre}:`, error)
      errores++
    }
  }

  console.log(`\n✅ Migración completada: ${migrados} migrados, ${errores} errores`)
}

migrateDiscountsToConfigDescuentos()
  .catch(e => {
    console.error('Error fatal:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
