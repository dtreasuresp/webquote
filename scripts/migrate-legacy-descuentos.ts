import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Migration: Convertir descuento legacy a descuentoDirecto en configDescuentos
 * 
 * Si un snapshot tiene:
 * - descuento: 5, 7, 8 (etc)
 * - configDescuentos.tipoDescuento: 'ninguno'
 * 
 * Lo convertirá a:
 * - descuento: 0 (limpiado)
 * - configDescuentos.tipoDescuento: 'directo'
 * - configDescuentos.descuentoDirecto: 5, 7, 8 (etc)
 */
async function migrateLegacyDescuentos() {
  console.log('🚀 Iniciando migración de descuentos legacy a ConfigDescuentos.descuentoDirecto...\n')

  const snapshots = await prisma.packageSnapshot.findMany()
  let migrados = 0
  let saltados = 0

  for (const snapshot of snapshots) {
    try {
      const descuentoLegacy = snapshot.descuento || 0
      const config = snapshot.configDescuentos as any

      // Si no hay descuento legacy o ya está migrado, saltar
      if (descuentoLegacy === 0) {
        console.log(`⏭️  ${snapshot.nombre}: Sin descuento legacy`)
        saltados++
        continue
      }

      // Si ya tiene descuentoDirecto > 0, es que ya fue migrado
      if (config?.descuentoDirecto && config.descuentoDirecto > 0) {
        console.log(`⏭️  ${snapshot.nombre}: Ya tiene descuentoDirecto configurado (${config.descuentoDirecto}%)`)
        saltados++
        continue
      }

      // Migrar
      console.log(`\n🔄 Migrando ${snapshot.nombre}...`)
      console.log(`   - descuento legacy: ${descuentoLegacy}% → descuentoDirecto: ${descuentoLegacy}%`)

      const configNueva = {
        ...(config || {}),
        tipoDescuento: 'directo',
        descuentoDirecto: descuentoLegacy,
      }

      await prisma.packageSnapshot.update({
        where: { id: snapshot.id },
        data: {
          descuento: 0, // Limpiar campo legacy
          configDescuentos: configNueva,
        },
      })

      console.log(`✅ ${snapshot.nombre}: Migrado exitosamente`)
      migrados++
    } catch (error) {
      console.error(`❌ Error migrando ${snapshot.nombre}:`, error)
    }
  }

  console.log(`\n✅ Migración completada:`)
  console.log(`   - Migrados: ${migrados}`)
  console.log(`   - Saltados: ${saltados}`)
  console.log(`   - Total: ${snapshots.length}`)

  await prisma.$disconnect()
}

migrateLegacyDescuentos().catch(console.error)
