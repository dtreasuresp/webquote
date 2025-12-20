import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'

/**
 * GET /api/backup-config
 * Obtiene la configuración de backups del usuario actual
 * Requiere: backups.view_config
 */
export async function GET(request: NextRequest) {
  const { session, error } = await requireReadPermission('backups.view_config')
  if (error) return error

  try {
    let config = await prisma.backupConfig.findUnique({
      where: { userId: session.user.id }
    })

    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await prisma.backupConfig.create({
        data: {
          userId: session.user.id,
          autoBackupEnabled: false,
          autoBackupFrequency: 'weekly',
          autoBackupRetention: 5,
          notifyOnBackup: true,
          notifyOnRestore: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('[API BackupConfig GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración de backups' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/backup-config
 * Actualiza la configuración de backups del usuario
 * Requiere: backups.edit_config
 */
export async function PUT(request: NextRequest) {
  const { session, error } = await requireWritePermission('backups.edit_config')
  if (error) return error

  try {
    const body = await request.json()
    const {
      autoBackupEnabled,
      autoBackupFrequency,
      autoBackupRetention,
      notifyOnBackup,
      notifyOnRestore
    } = body

    const normalizedAutoBackupRetention =
      typeof autoBackupRetention === 'string'
        ? Number.parseInt(autoBackupRetention, 10)
        : autoBackupRetention

    if (
      normalizedAutoBackupRetention !== undefined &&
      normalizedAutoBackupRetention !== null &&
      (typeof normalizedAutoBackupRetention !== 'number' ||
        !Number.isFinite(normalizedAutoBackupRetention) ||
        !Number.isInteger(normalizedAutoBackupRetention))
    ) {
      return NextResponse.json(
        { success: false, error: 'Retención inválida: debe ser un número entero' },
        { status: 400 }
      )
    }

    // Calcular próximo backup si está habilitado
    let nextAutoBackup = null
    if (autoBackupEnabled && autoBackupFrequency) {
      const now = new Date()
      switch (autoBackupFrequency) {
        case 'daily':
          nextAutoBackup = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case 'weekly':
          nextAutoBackup = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          nextAutoBackup = new Date(now.setMonth(now.getMonth() + 1))
          break
      }
    }

    const config = await prisma.backupConfig.upsert({
      where: { userId: session.user.id },
      update: {
        autoBackupEnabled,
        autoBackupFrequency,
        autoBackupRetention: normalizedAutoBackupRetention,
        notifyOnBackup,
        notifyOnRestore,
        nextAutoBackup
      },
      create: {
        userId: session.user.id,
        autoBackupEnabled: autoBackupEnabled ?? false,
        autoBackupFrequency: autoBackupFrequency ?? 'weekly',
        autoBackupRetention: normalizedAutoBackupRetention ?? 5,
        notifyOnBackup: notifyOnBackup ?? true,
        notifyOnRestore: notifyOnRestore ?? true,
        nextAutoBackup
      }
    })

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        action: 'backup_config.updated',
        entityType: 'BackupConfig',
        entityId: config.id,
        userId: session.user.id,
        userName: session.user.nombre || session.user.username || 'Usuario',
        details: {
          autoBackupEnabled,
          autoBackupFrequency,
          autoBackupRetention: normalizedAutoBackupRetention
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Configuración actualizada exitosamente'
    })
  } catch (error) {
    console.error('[API BackupConfig PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
