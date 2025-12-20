/**
 * BACKUP SCHEDULER - Ejecuta backups automáticos en horarios programados
 * 
 * Este módulo maneja:
 * - Ejecución de backups automáticos según nextAutoBackup
 * - Limpieza de backups antiguos según autoBackupRetention
 * - Logs de auditoría
 */

import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit/auditHelper'

interface BackupScheduleResult {
  success: boolean
  backupsCreated: number
  backupsDeleted: number
  errors: string[]
}

/**
 * Ejecuta un backup automático para un usuario
 */
async function executeAutoBackup(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        UserPermission: {
          include: { Permission: true }
        }
      }
    })

    if (!user) {
      console.error(`[BackupScheduler] Usuario no encontrado: ${userId}`)
      return false
    }

    // Obtener TODOS los datos asociados al usuario en paralelo
    const [quotationAssigned, snapshots, preferences, permissions, financialTemplates] = await Promise.all([
      prisma.quotationConfig.findUnique({
        where: { id: user.quotationAssignedId || '' },
        include: { snapshots: true }
      }),
      prisma.packageSnapshot.findMany({
        where: { quotationConfig: { User: { id: userId } } }
      }),
      prisma.userPreferences.findUnique({
        where: { userId }
      }),
      prisma.userPermission.findMany({
        where: { userId },
        include: { Permission: true }
      }),
      prisma.financialTemplate.findMany({
        where: { userId }
      })
    ])

    // Preparar datos COMPLETOS
    const { passwordHash, ...userData } = user
    const backupData = {
      user: userData,
      quotation: quotationAssigned,
      snapshots: snapshots.filter(s => s.activo),
      preferences,
      permissions: permissions.map(p => ({
        permissionCode: p.Permission.code,
        granted: p.granted
      })),
      financialTemplates,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      dataTypes: {
        user: true,
        quotation: !!quotationAssigned,
        snapshots: snapshots.length > 0,
        preferences: !!preferences,
        permissions: permissions.length > 0,
        financialTemplates: financialTemplates.length > 0
      }
    }

    const dataString = JSON.stringify(backupData)
    const size = Buffer.byteLength(dataString, 'utf8')

    // Crear backup automático
    const backup = await prisma.userBackup.create({
      data: {
        userId,
        nombre: `Auto-backup ${new Date().toLocaleString('es-ES')}`,
        descripcion: 'Backup automático programado',
        tipo: 'auto-scheduled',
        version: backupData.version,
        data: backupData as any,
        size,
        estado: 'completado'
      }
    })

    // Registrar en audit
    await createAuditLog({
      action: 'BACKUP_CREATED',
      entityType: 'BACKUP',
      entityId: backup.id,
      actorId: userId,
      actorName: user.nombre || user.username || 'Sistema',
      details: {
        tipo: 'auto-scheduled',
        size,
        dataIncluded: {
          quotation: !!quotationAssigned,
          snapshots: snapshots.filter(s => s.activo).length,
          permissions: permissions.length
        }
      }
    })

    console.log(`[BackupScheduler] ✅ Backup automático creado para ${user.username}`)
    return true
  } catch (error) {
    console.error(`[BackupScheduler] Error al ejecutar backup para ${userId}:`, error)
    return false
  }
}

/**
 * Limpia backups antiguos según la configuración del usuario
 */
async function cleanOldBackups(userId: string): Promise<number> {
  try {
    const config = await prisma.backupConfig.findUnique({
      where: { userId }
    })

    if (!config) return 0

    let deletedCount = 0

    // Eliminar por límite de máximo backups (autoBackupRetention)
    if (config.autoBackupRetention > 0) {
      const backups = await prisma.userBackup.findMany({
        where: { userId, tipo: 'auto-scheduled' },
        orderBy: { createdAt: 'desc' },
        skip: config.autoBackupRetention // Saltar los N más recientes
      })

      if (backups.length > 0) {
        const deleteResult = await prisma.userBackup.deleteMany({
          where: {
            userId,
            id: { in: backups.map(b => b.id) }
          }
        })
        deletedCount += deleteResult.count
      }
    }

    if (deletedCount > 0) {
      console.log(`[BackupScheduler] 🗑️ ${deletedCount} backups antiguos eliminados para ${userId}`)
    }

    return deletedCount
  } catch (error) {
    console.error(`[BackupScheduler] Error limpiando backups para ${userId}:`, error)
    return 0
  }
}

/**
 * Calcula la próxima fecha de backup según la frecuencia
 */
function calculateNextBackupDate(frequency: string): Date {
  const now = new Date()
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      return now
    case 'weekly':
      now.setDate(now.getDate() + 7)
      return now
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      return now
    default:
      return now
  }
}

/**
 * FUNCIÓN PRINCIPAL: Ejecuta backups automáticos pendientes
 * Se debe llamar periódicamente (cada 1-5 minutos) por un cron job
 */
export async function runBackupScheduler(): Promise<BackupScheduleResult> {
  const result: BackupScheduleResult = {
    success: true,
    backupsCreated: 0,
    backupsDeleted: 0,
    errors: []
  }

  try {
    const now = new Date()

    // Obtener usuarios con backups automáticos habilitados que deben ejecutarse YA
    const pendingBackups = await prisma.backupConfig.findMany({
      where: {
        autoBackupEnabled: true,
        nextAutoBackup: {
          lte: now // nextAutoBackup <= ahora
        }
      },
      include: { User: true }
    })

    console.log(
      `[BackupScheduler] 📋 ${pendingBackups.length} backups pendientes para ejecutar`
    )

    // Ejecutar cada backup
    for (const config of pendingBackups) {
      const success = await executeAutoBackup(config.userId)

      if (success) {
        result.backupsCreated++

        // Actualizar nextAutoBackup
        const nextDate = calculateNextBackupDate(config.autoBackupFrequency)
        await prisma.backupConfig.update({
          where: { userId: config.userId },
          data: {
            nextAutoBackup: nextDate,
            lastAutoBackup: now
          }
        })

        // Limpiar backups antiguos
        const deleted = await cleanOldBackups(config.userId)
        result.backupsDeleted += deleted
      } else {
        result.success = false
        result.errors.push(`Error ejecutando backup para ${config.User.username}`)
      }
    }

    console.log(
      `[BackupScheduler] ✅ Ciclo completado - ${result.backupsCreated} creados, ${result.backupsDeleted} eliminados`
    )

    return result
  } catch (error) {
    console.error('[BackupScheduler] Error crítico:', error)
    result.success = false
    result.errors.push(
      error instanceof Error ? error.message : 'Error desconocido'
    )
    return result
  }
}

/**
 * Inicializar scheduler al arrancar la aplicación
 * Se llama una vez desde middleware o en el arranque del servidor
 */
export async function initializeBackupScheduler() {
  console.warn('[BackupScheduler] initializeBackupScheduler() is deprecated. Use runBackupScheduler() in cron endpoint instead.')
}