import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/quotations/[id]/status
 * Cambia el estado activo/inactivo de una quotation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { activo, isGlobal } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    // Si quiere ponerla como global, desactivar las demás
    if (isGlobal) {
      await prisma.quotationConfig.updateMany({
        where: { isGlobal: true },
        data: { isGlobal: false },
      })
    }

    const result = await prisma.quotationConfig.update({
      where: { id },
      data: {
        ...(activo !== undefined && { activo }),
        ...(isGlobal !== undefined && { isGlobal }),
        updatedAt: new Date(),
      },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Quotation status updated successfully',
    })
  } catch (error) {
    console.error('Error updating quotation status:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating quotation status' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/quotations/[id]
 * Elimina una quotation y todos sus snapshots asociados
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    // Eliminar la cotización (cascade elimina los snapshots)
    await prisma.quotationConfig.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Error deleting quotation' },
      { status: 500 }
    )
  }
}
