/**
 * Script para restaurar datos migrados
 * Ejecutar con: npx tsx scripts/restore-data.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function restoreData() {
  console.log('🚀 Iniciando restauración de datos...\n')

  try {
    // Buscar el archivo de datos convertidos más reciente
    const backupDir = path.join(process.cwd(), 'prisma', 'backups')
    
    if (!fs.existsSync(backupDir)) {
      console.error('No se encontró el directorio de backups')
      return
    }

    const files = fs.readdirSync(backupDir)
    const convertedFiles = files.filter(f => f.startsWith('converted-'))
    
    if (convertedFiles.length === 0) {
      console.error('No se encontraron archivos de datos convertidos')
      return
    }

    // Ordenar por fecha (más reciente primero)
    convertedFiles.sort().reverse()
    const latestFile = convertedFiles[0]
    const filePath = path.join(backupDir, latestFile)

    console.log(`📂 Leyendo datos de: ${latestFile}`)
    const datos = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    console.log(`📊 Total de registros a restaurar: ${datos.length}\n`)

    // Restaurar cada snapshot
    let restaurados = 0
    for (const snapshot of datos) {
      try {
        await prisma.packageSnapshot.create({
          data: {
            id: snapshot.id,
            nombre: snapshot.nombre,
            serviciosBase: JSON.parse(snapshot.serviciosBase),
            gestionPrecio: snapshot.gestionPrecio,
            gestionMesesGratis: snapshot.gestionMesesGratis,
            gestionMesesPago: snapshot.gestionMesesPago,
            desarrollo: snapshot.desarrollo,
            descuento: snapshot.descuento,
            otrosServicios: JSON.parse(snapshot.otrosServicios),
            costoInicial: snapshot.costoInicial,
            costoAño1: snapshot.costoAño1,
            costoAño2: snapshot.costoAño2,
            activo: snapshot.activo,
            createdAt: new Date(snapshot.createdAt),
            updatedAt: new Date(snapshot.updatedAt),
          },
        })
        
        console.log(`✅ Restaurado: "${snapshot.nombre}"`)
        restaurados++
      } catch (error) {
        console.error(`Error al restaurar "${snapshot.nombre}":`, error)
      }
    }

    console.log('\n📈 Resumen de restauración:')
    console.log(`   ✅ Restaurados: ${restaurados}`)
    console.log(`   📊 Total: ${datos.length}`)
    console.log('\n✨ Restauración completada!')

  } catch (error) {
    console.error('Error durante la restauración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

restoreData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
