import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PATCH /api/quotations/deactivate-others
 * Desactiva todas las quotaciones excepto la especificada
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { exceptoId } = body

    if (!exceptoId) {
      return NextResponse.json(
        { success: false, error: 'exceptoId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la cotización excepto existe
    const quotationExists = await prisma.quotationConfig.findUnique({
      where: { id: exceptoId },
    })

    if (!quotationExists) {
      return NextResponse.json(
        { success: false, error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    // Desactivar todas las demás
    await prisma.quotationConfig.updateMany({
      where: {
        id: {
          not: exceptoId,
        },
      },
      data: {
        isGlobal: false,
        activo: false,
      },
    })

    // Activar la especificada
    const updated = await prisma.quotationConfig.update({
      where: { id: exceptoId },
      data: {
        isGlobal: true,
        activo: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Cotización activada y demás desactivadas',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error desactivando cotizaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar solicitud' },
      { status: 500 }
    )
  }
}
