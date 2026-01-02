import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/quotations/[id]
 * Obtiene una cotización por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 [API] Fetching quotation:', id)

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const quotation = await prisma.quotationConfig.findUnique({
      where: { id },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
        },
        documentTemplate: true,
      },
    })

    if (!quotation) {
      console.log('⚠️ [API] Quotation not found:', id)
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    console.log('✅ [API] Quotation found:', quotation.numero)
    return NextResponse.json({
      success: true,
      data: quotation,
    })
  } catch (error) {
    console.error('❌ [API] Error fetching quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching quotation' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/quotations/[id]/status
 * Cambia el estado activo/inactivo de una quotation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
