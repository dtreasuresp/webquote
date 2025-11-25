/**
 * Script para hacer backup usando SQL directo
 * Ejecutar con: node scripts/backup-sql.js
 */

const sqlite3 = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

async function backupData() {
  console.log('🚀 Iniciando backup de datos con SQL...\n')

  try {
    // Abrir conexión a la base de datos
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    
    if (!fs.existsSync(dbPath)) {
      console.error('No se encontró la base de datos en:', dbPath)
      return
    }

    const db = sqlite3(dbPath)
    
    // Obtener todos los snapshots
    const snapshots = db.prepare('SELECT * FROM PackageSnapshot').all()
    
    console.log(`📊 Total de snapshots encontrados: ${snapshots.length}\n`)

    if (snapshots.length === 0) {
      console.log('ℹ️  No hay datos para respaldar')
      db.close()
      return
    }

    // Crear directorio de backups
    const backupDir = path.join(process.cwd(), 'prisma', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Guardar backup original
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
      console.log(`    - Dominio: $${snapshot.dominioPrice}\n`)

      return {
        id: snapshot.id,
        nombre: snapshot.nombre,
        serviciosBase: JSON.stringify(serviciosBase),
        gestionPrecio: snapshot.gestionPrecio,
        gestionMesesGratis: snapshot.gestionMesesGratis,
        gestionMesesPago: snapshot.gestionMesesPago,
        desarrollo: snapshot.desarrollo,
        descuento: snapshot.descuento,
        otrosServicios: snapshot.otrosServicios,
        costoInicial: snapshot.costoInicial,
        costoAño1: snapshot.costoAño1,
        costoAño2: snapshot.costoAño2,
        activo: snapshot.activo ? 1 : 0,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      }
    })

    // Guardar datos convertidos
    const convertedFile = path.join(backupDir, `converted-${timestamp}.json`)
    fs.writeFileSync(convertedFile, JSON.stringify(datosConvertidos, null, 2))
    console.log(`✅ Datos convertidos guardados en: ${convertedFile}\n`)

    db.close()

    console.log('📈 Resumen:')
    console.log(`   - Total snapshots: ${snapshots.length}`)
    console.log(`   - Backup original: ✅`)
    console.log(`   - Datos convertidos: ✅`)
    console.log('\n⚠️  SIGUIENTES PASOS:')
    console.log('   1. Ejecuta: npx prisma db push --force-reset')
    console.log('   2. Ejecuta: npx prisma generate')
    console.log('   3. Ejecuta: node scripts/restore-data.js\n')

  } catch (error) {
    console.error('Error durante el backup:', error)
  }
}

backupData()
