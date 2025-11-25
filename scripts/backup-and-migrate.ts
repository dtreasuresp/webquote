/**
 * Script para hacer backup de datos y migrar a nuevo formato
 * Ejecutar con: npx tsx scripts/backup-and-migrate.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

async function backupAndMigrate() {
  console.log('🚀 Iniciando backup y migración...\n')

  try {
    // 1. Hacer backup de datos existentes
    console.log('📦 Haciendo backup de datos existentes...')
    const snapshots = await prisma.$queryRaw`SELECT * FROM PackageSnapshot` as any[]
    
    const backupDir = path.join(process.cwd(), 'prisma', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`)
    
    fs.writeFileSync(backupFile, JSON.stringify(snapshots, null, 2))
    console.log(`✅ Backup guardado en: ${backupFile}\n`)

    // 2. Convertir datos al nuevo formato
    console.log('🔄 Convirtiendo datos al nuevo formato...')
    const datosConvertidos = snapshots.map((snapshot: any) => {
      const serviciosBase: ServicioBase[] = [
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
        activo: snapshot.activo,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      }
    })

    // Guardar datos convertidos
    const convertedFile = path.join(backupDir, `converted-${timestamp}.json`)
    fs.writeFileSync(convertedFile, JSON.stringify(datosConvertidos, null, 2))
    console.log(`✅ Datos convertidos guardados en: ${convertedFile}\n`)

    console.log('📊 Resumen:')
    console.log(`   - Total snapshots: ${snapshots.length}`)
    console.log(`   - Backup completado: ✅`)
    console.log(`   - Conversión completada: ✅`)
    console.log('\n⚠️  SIGUIENTE PASO:')
    console.log('   1. Ejecuta: npx prisma db push --force-reset')
    console.log('   2. Ejecuta: npx tsx scripts/restore-data.ts\n')

  } catch (error) {
    console.error('Error durante el proceso:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

backupAndMigrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
