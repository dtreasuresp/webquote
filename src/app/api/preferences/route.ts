import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/preferences
 * Obtiene las preferencias del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`
    
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

    return NextResponse.json({
      success: true,
      data: preferences,
    })
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

    return NextResponse.json({
      success: true,
      data: preferences,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating preferences' },
      { status: 500 }
    )
  }
}
