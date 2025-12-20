import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireWritePermission } from '@/lib/apiProtection'

/**
 * Genera un ID único similar a CUID
 */
function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

/**
 * POST /api/backups/restore
 * Restaura datos desde un backup
 * Requiere: backups.restore
 */
export async function POST(request: NextRequest) {
  const { session, error } = await requireWritePermission('backups.restore')
  if (error) return error

  try {
    const body = await request.json()
    const { backupId } = body

    if (!backupId) {
      return NextResponse.json(
        { success: false, error: 'ID de backup requerido' },
        { status: 400 }
      )
    }

    // Obtener backup
    const backup = await prisma.userBackup.findUnique({
      where: { id: backupId }
    })

    if (!backup) {
      return NextResponse.json(
        { success: false, error: 'Backup no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN'
    if (backup.userId !== session.user.id && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para restaurar este backup' },
        { status: 403 }
      )
    }

    // Verificar que el backup está completado
    if (backup.estado !== 'completado') {
      return NextResponse.json(
        { success: false, error: 'No se puede restaurar un backup incompleto o con errores' },
        { status: 400 }
      )
    }

    // Extraer datos del backup
    const backupData = backup.data as any
    const userData = backupData.user

    // 1. Restaurar preferencias del usuario
    if (userData.userPreferences) {
      await prisma.userPreferences.upsert({
        where: { userId: backup.userId },
        update: {
          cerrarModalAlGuardar: userData.userPreferences.cerrarModalAlGuardar,
          mostrarConfirmacionGuardado: userData.userPreferences.mostrarConfirmacionGuardado,
          validarDatosAntes: userData.userPreferences.validarDatosAntes,
          limpiarFormulariosAlCrear: userData.userPreferences.limpiarFormulariosAlCrear,
          mantenerDatosAlCrearCotizacion: userData.userPreferences.mantenerDatosAlCrearCotizacion,
          destinoGuardado: userData.userPreferences.destinoGuardado,
          intervaloVerificacionConexion: userData.userPreferences.intervaloVerificacionConexion,
          unidadIntervaloConexion: userData.userPreferences.unidadIntervaloConexion,
          sincronizarAlRecuperarConexion: userData.userPreferences.sincronizarAlRecuperarConexion,
          mostrarNotificacionCacheLocal: userData.userPreferences.mostrarNotificacionCacheLocal
        },
        create: {
          userId: backup.userId,
          ...userData.userPreferences
        }
      })
    }

    // 2. Restaurar quotations y snapshots
    const restoredQuotations = []
    if (backupData.quotations && Array.isArray(backupData.quotations)) {
      for (const quota of backupData.quotations) {
        // Calcular fecha de vencimiento si no existe
        const fechaEmision = quota.fechaEmision ? new Date(quota.fechaEmision) : new Date()
        const fechaVencimiento = quota.fechaVencimiento ? new Date(quota.fechaVencimiento) : new Date(fechaEmision.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        const restored = await prisma.quotationConfig.upsert({
          where: { id: quota.id },
          update: {
            numero: quota.numero,
            empresa: quota.empresa,
            sector: quota.sector,
            profesional: quota.profesional,
            packagesSnapshot: quota.packagesSnapshot
          },
          create: {
            id: quota.id,
            numero: quota.numero,
            empresa: quota.empresa,
            sector: quota.sector,
            profesional: quota.profesional,
            packagesSnapshot: quota.packagesSnapshot,
            fechaEmision,
            fechaVencimiento
          }
        })
        restoredQuotations.push(restored.id)
      }
    }

    // 3. Restaurar snapshots
    let restoredSnapshots = 0
    if (backupData.snapshots && Array.isArray(backupData.snapshots)) {
      for (const snapshot of backupData.snapshots) {
        await prisma.packageSnapshot.upsert({
          where: { id: snapshot.id },
          update: {
            nombre: snapshot.nombre,
            serviciosBase: snapshot.serviciosBase,
            desarrollo: snapshot.desarrollo,
            descuento: snapshot.descuento,
            activo: snapshot.activo
          },
          create: {
            id: snapshot.id,
            nombre: snapshot.nombre,
            quotationConfigId: snapshot.quotationConfigId,
            serviciosBase: snapshot.serviciosBase,
            otrosServicios: snapshot.otrosServicios,
            desarrollo: snapshot.desarrollo,
            descuento: snapshot.descuento,
            costoInicial: snapshot.costoInicial,
            costoAño1: snapshot.costoAño1,
            costoAño2: snapshot.costoAño2
          }
        })
        restoredSnapshots++
      }
    }

    // 4. Restaurar permisos
    let restoredPermissions = 0
    if (backupData.permissions && Array.isArray(backupData.permissions)) {
      for (const perm of backupData.permissions) {
        const permission = await prisma.permission.findUnique({
          where: { code: perm.permissionCode }
        })
        if (permission) {
          await prisma.userPermission.upsert({
            where: {
              userId_permissionId: {
                userId: backup.userId,
                permissionId: permission.id
              }
            },
            update: { granted: perm.granted },
            create: {
              id: generateId(),
              userId: backup.userId,
              permissionId: permission.id,
              granted: perm.granted
            }
          })
          restoredPermissions++
        }
      }
    }

    // 5. Restaurar plantillas financieras
    let restoredTemplates = 0
    if (backupData.financialTemplates && Array.isArray(backupData.financialTemplates)) {
      for (const template of backupData.financialTemplates) {
        await prisma.financialTemplate.upsert({
          where: { id: template.id },
          update: {
            nombre: template.nombre,
            desarrollo: template.desarrollo,
            descuento: template.descuento
          },
          create: {
            id: template.id,
            userId: backup.userId,
            nombre: template.nombre,
            desarrollo: template.desarrollo,
            descuento: template.descuento,
            updatedAt: new Date()
          }
        })
        restoredTemplates++
      }
    }

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        action: 'backup.restored',
        entityType: 'UserBackup',
        entityId: backupId,
        userId: session.user.id,
        userName: session.user.nombre || session.user.username || 'Usuario',
        details: {
          backupId,
          nombre: backup.nombre,
          backupDate: backup.createdAt
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Backup restaurado exitosamente',
      data: {
        restored: {
          preferences: !!userData.userPreferences,
          quotations: restoredQuotations.length,
          snapshots: restoredSnapshots,
          permissions: restoredPermissions,
          financialTemplates: restoredTemplates
        }
      }
    })
  } catch (error) {
    console.error('[API Backups Restore] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al restaurar backup' },
      { status: 500 }
    )
  }
}
