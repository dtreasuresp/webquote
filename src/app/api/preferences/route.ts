import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/preferences
 * Obtiene las preferencias del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión y permisos
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    const userId = 'default-user'
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
          // Preferencias de sincronización
          destinoGuardado: 'ambos',
          intervaloVerificacionConexion: 30,
          unidadIntervaloConexion: 'segundos',
          sincronizarAlRecuperarConexion: true,
          mostrarNotificacionCacheLocal: true,
        },
      })
    }

    const res = NextResponse.json({
      success: true,
      data: preferences,
    })
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
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión y permisos
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const userId = 'default-user'

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        // Preferencias generales
        cerrarModalAlGuardar: body.cerrarModalAlGuardar,
        mostrarConfirmacionGuardado: body.mostrarConfirmacionGuardado,
        validarDatosAntes: body.validarDatosAntes,
        limpiarFormulariosAlCrear: body.limpiarFormulariosAlCrear,
        mantenerDatosAlCrearCotizacion: body.mantenerDatosAlCrearCotizacion,
        // Preferencias de sincronización
        destinoGuardado: body.destinoGuardado,
        intervaloVerificacionConexion: body.intervaloVerificacionConexion,
        unidadIntervaloConexion: body.unidadIntervaloConexion,
        sincronizarAlRecuperarConexion: body.sincronizarAlRecuperarConexion,
        mostrarNotificacionCacheLocal: body.mostrarNotificacionCacheLocal,
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
        // Preferencias de sincronización
        destinoGuardado: body.destinoGuardado ?? 'ambos',
        intervaloVerificacionConexion: body.intervaloVerificacionConexion ?? 30,
        unidadIntervaloConexion: body.unidadIntervaloConexion ?? 'segundos',
        sincronizarAlRecuperarConexion: body.sincronizarAlRecuperarConexion ?? true,
        mostrarNotificacionCacheLocal: body.mostrarNotificacionCacheLocal ?? true,
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
