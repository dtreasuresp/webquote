import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/preferences
 * Obtiene las preferencias del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    // Por ahora usamos un userId genérico
    // En producción, obtenerlo de la sesión del usuario
    const userId = 'default-user'

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    })

    // Si no existe, crear una por defecto
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          cerrarModalAlGuardar: false,
          mostrarConfirmacionGuardado: true,
          validarDatosAntes: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
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
        cerrarModalAlGuardar: body.cerrarModalAlGuardar,
        mostrarConfirmacionGuardado: body.mostrarConfirmacionGuardado,
        validarDatosAntes: body.validarDatosAntes,
        updatedAt: new Date(),
      },
      create: {
        userId,
        cerrarModalAlGuardar: body.cerrarModalAlGuardar ?? false,
        mostrarConfirmacionGuardado: body.mostrarConfirmacionGuardado ?? true,
        validarDatosAntes: body.validarDatosAntes ?? true,
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
