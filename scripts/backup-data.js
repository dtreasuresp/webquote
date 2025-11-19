/**
 * Script para hacer backup de datos
 * Ejecutar con: node scripts/backup-data.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupData() {
  console.log('🚀 Iniciando backup de datos...\n')

  try {
    // Obtener todos los snapshots
    const snapshots = await prisma.packageSnapshot.findMany()
    
    console.log(`📊 Total de snapshots encontrados: ${snapshots.length}\n`)

    // Crear directorio de backups si no existe
    const backupDir = path.join(process.cwd(), 'prisma', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Guardar backup con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`)
    
    fs.writeFileSync(backupFile, JSON.stringify(snapshots, null, 2))
    console.log(`✅ Backup guardado en: ${backupFile}\n`)

    // Convertir al nuevo formato
    console.log('🔄 Convirtiendo datos al nuevo formato...\n')
    const datosConvertidos = snapshots.map((snapshot) => {
      const serviciosBase = [
        {
          id: '1',
          nombre: 'Hosting',
          precio: snapshot.hostingPrice || 0,
          mesesGratis: snapshot.mesesGratis || 0,
          mesesPago: snapshot.mesesPago || 12,
        },
        {
          id: '2',
          nombre: 'Mailbox',
          precio: snapshot.mailboxPrice || 0,
          mesesGratis: snapshot.mesesGratis || 0,
          mesesPago: snapshot.mesesPago || 12,
        },
        {
          id: '3',
          nombre: 'Dominio',
          precio: snapshot.dominioPrice || 0,
          mesesGratis: snapshot.mesesGratis || 0,
          mesesPago: snapshot.mesesPago || 12,
        },
      ]

      console.log(`  ✓ "${snapshot.nombre}"`)
      console.log(`    - Hosting: $${snapshot.hostingPrice}`)
      console.log(`    - Mailbox: $${snapshot.mailboxPrice}`)
      console.log(`    - Dominio: $${snapshot.dominioPrice}`)
      console.log(`    - Meses: ${snapshot.mesesGratis} gratis, ${snapshot.mesesPago} pago\n`)

      return {
        ...snapshot,
        serviciosBase,
      }
    })

    // Guardar datos convertidos
    const convertedFile = path.join(backupDir, `converted-${timestamp}.json`)
    fs.writeFileSync(convertedFile, JSON.stringify(datosConvertidos, null, 2))
    console.log(`✅ Datos convertidos guardados en: ${convertedFile}\n`)

    console.log('📈 Resumen:')
    console.log(`   - Total snapshots: ${snapshots.length}`)
    console.log(`   - Backup original: ✅`)
    console.log(`   - Datos convertidos: ✅`)
    console.log('\n⚠️  SIGUIENTES PASOS:')
    console.log('   1. Ejecuta: npx prisma db push --force-reset')
    console.log('   2. Ejecuta: node scripts/restore-data.js\n')

  } catch (error) {
    console.error('❌ Error durante el backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
