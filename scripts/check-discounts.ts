import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n📊 Investigando descuentos en snapshots...\n')

  try {
    const snapshots = await prisma.packageSnapshot.findMany({
      select: {
        id: true,
        nombre: true,
        descuento: true,
        descuentoPagoUnico: true,
        createdAt: true,
        updatedAt: true,
        quotationConfigId: true,
        configDescuentos: true,
        descuentosGenerales: true,
        descuentosPorServicio: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (snapshots.length === 0) {
      console.log('❌ No hay snapshots en la base de datos')
      return
    }

    console.log(`✅ Total de snapshots: ${snapshots.length}\n`)

    console.log('═══════════════════════════════════════════════════\n')
    console.log('ANÁLISIS COMPLETO DE DESCUENTOS EN SNAPSHOTS')
    console.log('═══════════════════════════════════════════════════\n')

    snapshots.forEach((s, idx) => {
      console.log(`${idx + 1}. ${s.nombre}`)
      console.log(`   ID: ${s.id}`)
      console.log(`   Creado: ${new Date(s.createdAt).toLocaleDateString('es-MX')} ${new Date(s.createdAt).toLocaleTimeString('es-MX')}`)
      console.log(`   Actualizado: ${new Date(s.updatedAt).toLocaleDateString('es-MX')} ${new Date(s.updatedAt).toLocaleTimeString('es-MX')}`)
      console.log(`   Config ID: ${s.quotationConfigId || 'N/A'}`)
      console.log(`   `)
      console.log(`   📊 DESCUENTOS:`)
      console.log(`      • Campo descuento directo: ${s.descuento || 0}%`)
      console.log(`      • Campo descuentoPagoUnico: ${s.descuentoPagoUnico || 0}%`)
      console.log(`   `)
      console.log(`   🔍 CONFIGURACIÓN DE DESCUENTOS (Legacy):`)
      console.log(`      • descuentosGenerales: ${JSON.stringify(s.descuentosGenerales || 'null')}`)
      console.log(`      • descuentosPorServicio: ${JSON.stringify(s.descuentosPorServicio || 'null')}`)
      console.log(`   `)
      console.log(`   🆕 CONFIGURACIÓN DE DESCUENTOS (Nuevo):`)
      if (s.configDescuentos) {
        console.log(`      ${JSON.stringify(s.configDescuentos, null, 2).split('\n').map((line: string, i: number) => i === 0 ? line : '      ' + line).join('\n')}`)
      } else {
        console.log(`      null`)
      }
      console.log('')
    })
  } catch (error) {
    console.error('Error al consultar:', error)
  }
}

main()
  .finally(() => prisma.$disconnect())
