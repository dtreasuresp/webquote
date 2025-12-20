import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'

/**
 * GET /api/preferences
 * Obtiene las preferencias del usuario actual
 * Requiere: config.view (read)
 */
export async function GET(request: NextRequest) {
  // Protección: Requiere permiso de lectura de configuración
  const { session, error } = await requireReadPermission('config.view')
  if (error) return error

  try {
    const userId = session.user.id
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    })

    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          cerrarModalAlGuardar: false,
          mostrarConfirmacionGuardado: true,
          validarDatosAntes: true,
          limpiarFormulariosAlCrear: true,
          mantenerDatosAlCrearCotizacion: false,
          guardarAutomaticamente: true,
          // Preferencias de sincronización
          destinoGuardado: 'ambos',
          intervaloVerificacionConexion: 30,
          unidadIntervaloConexion: 'segundos',
          sincronizarAlRecuperarConexion: true,
          mostrarNotificacionCacheLocal: true,
          // Preferencias de auditoría
          auditRetentionDays: 90,
          auditAutoPurgeEnabled: false,
          auditAutoPurgeFrequency: 'weekly',
          auditAutoReportEnabled: false,
          auditAutoReportPeriod: 'weekly',
          // Auto-report scheduling
          auditAutoReportHour: 1,
          auditAutoReportMinute: 0,
          auditReportRetentionDays: 90,
          notifyOnManualReport: true,
          notifyOnAutoReport: true,
          // Auto-backup scheduling
          autoBackupEnabled: false,
          autoBackupPeriod: 'weekly',
          autoBackupHour: 2,
          autoBackupMinute: 0,
          autoBackupRetentionDays: 30,
        },
      })
    }

    const res = NextResponse.json(preferences)
    res.headers.set('x-user-id', session.user.id || '')
    res.headers.set('x-user-role', session.user.role || '')
    return res
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error fetching preferences:', msg)
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Error fetching preferences' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/preferences
 * Actualiza las preferencias del usuario
 * Requiere: config.edit_general (write)
 */
export async function POST(request: NextRequest) {
  // Protección: Requiere permiso de escritura en configuración
  const { session, error } = await requireWritePermission('config.edit_general')
  if (error) return error

  try {
    const body = await request.json()
    const userId = session.user.id

    // Validar horas (0-23) y minutos (0-59) si se proporcionan
    if (body.auditAutoReportHour !== undefined && (body.auditAutoReportHour < 0 || body.auditAutoReportHour > 23)) {
      return NextResponse.json(
        { success: false, error: 'auditAutoReportHour must be between 0 and 23' },
        { status: 400 }
      )
    }
    if (body.auditAutoReportMinute !== undefined && (body.auditAutoReportMinute < 0 || body.auditAutoReportMinute > 59)) {
      return NextResponse.json(
        { success: false, error: 'auditAutoReportMinute must be between 0 and 59' },
        { status: 400 }
      )
    }
    if (body.autoBackupHour !== undefined && (body.autoBackupHour < 0 || body.autoBackupHour > 23)) {
      return NextResponse.json(
        { success: false, error: 'autoBackupHour must be between 0 and 23' },
        { status: 400 }
      )
    }
    if (body.autoBackupMinute !== undefined && (body.autoBackupMinute < 0 || body.autoBackupMinute > 59)) {
      return NextResponse.json(
        { success: false, error: 'autoBackupMinute must be between 0 and 59' },
        { status: 400 }
      )
    }
    if (body.autoBackupRetentionDays !== undefined && body.autoBackupRetentionDays < 1) {
      return NextResponse.json(
        { success: false, error: 'autoBackupRetentionDays must be at least 1' },
        { status: 400 }
      )
    }
    if (body.auditReportRetentionDays !== undefined && (body.auditReportRetentionDays < 1 || body.auditReportRetentionDays > 730)) {
      return NextResponse.json(
        { success: false, error: 'auditReportRetentionDays must be between 1 and 730' },
        { status: 400 }
      )
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        // Preferencias generales
        cerrarModalAlGuardar: body.cerrarModalAlGuardar,
        mostrarConfirmacionGuardado: body.mostrarConfirmacionGuardado,
        validarDatosAntes: body.validarDatosAntes,
        limpiarFormulariosAlCrear: body.limpiarFormulariosAlCrear,
        mantenerDatosAlCrearCotizacion: body.mantenerDatosAlCrearCotizacion,
        guardarAutomaticamente: body.guardarAutomaticamente,
        // Preferencias de sincronización
        destinoGuardado: body.destinoGuardado,
        intervaloVerificacionConexion: body.intervaloVerificacionConexion,
        unidadIntervaloConexion: body.unidadIntervaloConexion,
        sincronizarAlRecuperarConexion: body.sincronizarAlRecuperarConexion,
        mostrarNotificacionCacheLocal: body.mostrarNotificacionCacheLocal,
        // Preferencias de auditoría
        auditRetentionDays: body.auditRetentionDays,
        auditAutoPurgeEnabled: body.auditAutoPurgeEnabled,
        auditAutoPurgeFrequency: body.auditAutoPurgeFrequency,
        auditAutoReportEnabled: body.auditAutoReportEnabled,
        auditAutoReportPeriod: body.auditAutoReportPeriod,
        // Auto-report scheduling
        auditAutoReportHour: body.auditAutoReportHour,
        auditAutoReportMinute: body.auditAutoReportMinute,
        auditReportRetentionDays: body.auditReportRetentionDays,
        notifyOnManualReport: body.notifyOnManualReport,
        notifyOnAutoReport: body.notifyOnAutoReport,
        // Auto-backup scheduling
        autoBackupEnabled: body.autoBackupEnabled,
        autoBackupPeriod: body.autoBackupPeriod,
        autoBackupHour: body.autoBackupHour,
        autoBackupMinute: body.autoBackupMinute,
        autoBackupRetentionDays: body.autoBackupRetentionDays,
        updatedAt: new Date(),
      },
      create: {
        userId,
        // Preferencias generales
        cerrarModalAlGuardar: body.cerrarModalAlGuardar ?? false,
        mostrarConfirmacionGuardado: body.mostrarConfirmacionGuardado ?? true,
        validarDatosAntes: body.validarDatosAntes ?? true,
        limpiarFormulariosAlCrear: body.limpiarFormulariosAlCrear ?? true,
        mantenerDatosAlCrearCotizacion: body.mantenerDatosAlCrearCotizacion ?? false,
        guardarAutomaticamente: body.guardarAutomaticamente ?? true,
        // Preferencias de sincronización
        destinoGuardado: body.destinoGuardado ?? 'ambos',
        intervaloVerificacionConexion: body.intervaloVerificacionConexion ?? 30,
        unidadIntervaloConexion: body.unidadIntervaloConexion ?? 'segundos',
        sincronizarAlRecuperarConexion: body.sincronizarAlRecuperarConexion ?? true,
        mostrarNotificacionCacheLocal: body.mostrarNotificacionCacheLocal ?? true,
        // Preferencias de auditoría
        auditRetentionDays: body.auditRetentionDays ?? 90,
        auditAutoPurgeEnabled: body.auditAutoPurgeEnabled ?? false,
        auditAutoPurgeFrequency: body.auditAutoPurgeFrequency ?? 'weekly',
        auditAutoReportEnabled: body.auditAutoReportEnabled ?? false,
        auditAutoReportPeriod: body.auditAutoReportPeriod ?? 'weekly',
        // Auto-report scheduling
        auditAutoReportHour: body.auditAutoReportHour ?? 1,
        auditAutoReportMinute: body.auditAutoReportMinute ?? 0,
        auditReportRetentionDays: body.auditReportRetentionDays ?? 90,
        notifyOnManualReport: body.notifyOnManualReport ?? true,
        notifyOnAutoReport: body.notifyOnAutoReport ?? true,
        // Auto-backup scheduling
        autoBackupEnabled: body.autoBackupEnabled ?? false,
        autoBackupPeriod: body.autoBackupPeriod ?? 'weekly',
        autoBackupHour: body.autoBackupHour ?? 2,
        autoBackupMinute: body.autoBackupMinute ?? 0,
        autoBackupRetentionDays: body.autoBackupRetentionDays ?? 30,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'preferences.updated',
        entityType: 'UserPreferences',
        entityId: preferences.id,
        userId: session?.user?.id,
        userName: session?.user?.username || 'Sistema',
        details: {
          cambios: Object.keys(body),
          destinoGuardado: body.destinoGuardado,
          sincronizacionActiva: body.sincronizarAlRecuperarConexion,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    const res = NextResponse.json({
      success: true,
      data: preferences,
      message: 'Preferences updated successfully',
    })
    res.headers.set('x-user-id', session.user.id || '')
    res.headers.set('x-user-role', session.user.role || '')
    return res
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating preferences' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/preferences
 * Actualiza parcialmente las preferencias del usuario
 * Requiere: config.edit_general (write)
 */
export async function PATCH(request: NextRequest) {
  // Protección: Requiere permiso de escritura en configuración
  const { session, error } = await requireWritePermission('config.edit_general')
  if (error) return error

  try {
    const body = await request.json()
    const userId = session.user.id

    // Validar horas (0-23) y minutos (0-59) si se proporcionan
    if (body.auditAutoReportHour !== undefined && (body.auditAutoReportHour < 0 || body.auditAutoReportHour > 23)) {
      return NextResponse.json(
        { success: false, error: 'auditAutoReportHour must be between 0 and 23' },
        { status: 400 }
      )
    }
    if (body.auditAutoReportMinute !== undefined && (body.auditAutoReportMinute < 0 || body.auditAutoReportMinute > 59)) {
      return NextResponse.json(
        { success: false, error: 'auditAutoReportMinute must be between 0 and 59' },
        { status: 400 }
      )
    }
    if (body.autoBackupHour !== undefined && (body.autoBackupHour < 0 || body.autoBackupHour > 23)) {
      return NextResponse.json(
        { success: false, error: 'autoBackupHour must be between 0 and 23' },
        { status: 400 }
      )
    }
    if (body.autoBackupMinute !== undefined && (body.autoBackupMinute < 0 || body.autoBackupMinute > 59)) {
      return NextResponse.json(
        { success: false, error: 'autoBackupMinute must be between 0 and 59' },
        { status: 400 }
      )
    }
    if (body.autoBackupRetentionDays !== undefined && body.autoBackupRetentionDays < 1) {
      return NextResponse.json(
        { success: false, error: 'autoBackupRetentionDays must be at least 1' },
        { status: 400 }
      )
    }

    // Build dynamic update object, only including provided fields
    const updateData: any = {}
    
    // Preferencias generales
    if (body.cerrarModalAlGuardar !== undefined) updateData.cerrarModalAlGuardar = body.cerrarModalAlGuardar
    if (body.mostrarConfirmacionGuardado !== undefined) updateData.mostrarConfirmacionGuardado = body.mostrarConfirmacionGuardado
    if (body.validarDatosAntes !== undefined) updateData.validarDatosAntes = body.validarDatosAntes
    if (body.limpiarFormulariosAlCrear !== undefined) updateData.limpiarFormulariosAlCrear = body.limpiarFormulariosAlCrear
    if (body.mantenerDatosAlCrearCotizacion !== undefined) updateData.mantenerDatosAlCrearCotizacion = body.mantenerDatosAlCrearCotizacion
    if (body.guardarAutomaticamente !== undefined) updateData.guardarAutomaticamente = body.guardarAutomaticamente
    
    // Preferencias de sincronización
    if (body.destinoGuardado !== undefined) updateData.destinoGuardado = body.destinoGuardado
    if (body.intervaloVerificacionConexion !== undefined) updateData.intervaloVerificacionConexion = body.intervaloVerificacionConexion
    if (body.unidadIntervaloConexion !== undefined) updateData.unidadIntervaloConexion = body.unidadIntervaloConexion
    if (body.sincronizarAlRecuperarConexion !== undefined) updateData.sincronizarAlRecuperarConexion = body.sincronizarAlRecuperarConexion
    if (body.mostrarNotificacionCacheLocal !== undefined) updateData.mostrarNotificacionCacheLocal = body.mostrarNotificacionCacheLocal
    
    // Preferencias de auditoría
    if (body.auditRetentionDays !== undefined) updateData.auditRetentionDays = body.auditRetentionDays
    if (body.auditAutoPurgeEnabled !== undefined) updateData.auditAutoPurgeEnabled = body.auditAutoPurgeEnabled
    if (body.auditAutoPurgeFrequency !== undefined) updateData.auditAutoPurgeFrequency = body.auditAutoPurgeFrequency
    if (body.auditAutoReportEnabled !== undefined) updateData.auditAutoReportEnabled = body.auditAutoReportEnabled
    if (body.auditAutoReportPeriod !== undefined) updateData.auditAutoReportPeriod = body.auditAutoReportPeriod
    // Auto-report scheduling
    if (body.auditAutoReportHour !== undefined) updateData.auditAutoReportHour = body.auditAutoReportHour
    if (body.auditAutoReportMinute !== undefined) updateData.auditAutoReportMinute = body.auditAutoReportMinute
    // Auto-backup scheduling
    if (body.autoBackupEnabled !== undefined) updateData.autoBackupEnabled = body.autoBackupEnabled
    if (body.autoBackupPeriod !== undefined) updateData.autoBackupPeriod = body.autoBackupPeriod
    if (body.autoBackupHour !== undefined) updateData.autoBackupHour = body.autoBackupHour
    if (body.autoBackupMinute !== undefined) updateData.autoBackupMinute = body.autoBackupMinute
    if (body.autoBackupRetentionDays !== undefined) updateData.autoBackupRetentionDays = body.autoBackupRetentionDays
    
    updateData.updatedAt = new Date()

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'preferences.updated',
        entityType: 'UserPreferences',
        entityId: preferences.id,
        userId: session?.user?.id,
        userName: session?.user?.username || 'Sistema',
        details: {
          cambios: Object.keys(body),
          camposActualizados: Object.keys(updateData),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    const res = NextResponse.json(preferences)
    res.headers.set('x-user-id', session.user.id || '')
    res.headers.set('x-user-role', session.user.role || '')
    return res
  } catch (error) {
    console.error('Error patching preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating preferences' },
      { status: 500 }
    )
  }
}
