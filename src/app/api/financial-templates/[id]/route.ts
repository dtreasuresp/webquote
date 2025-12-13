import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Obtener una plantilla específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await prisma.financialTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error en GET /api/financial-templates/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener plantilla financiera' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar plantilla financiera
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const template = await prisma.financialTemplate.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.desarrollo !== undefined && { desarrollo: data.desarrollo }),
        ...(data.descuento !== undefined && { descuento: data.descuento }),
        ...(data.opcionesPago !== undefined && { opcionesPago: data.opcionesPago }),
        ...(data.tituloSeccionPago !== undefined && { tituloSeccionPago: data.tituloSeccionPago }),
        ...(data.subtituloSeccionPago !== undefined && { subtituloSeccionPago: data.subtituloSeccionPago }),
        ...(data.metodosPreferidos !== undefined && { metodosPreferidos: data.metodosPreferidos }),
        ...(data.configDescuentos !== undefined && { configDescuentos: data.configDescuentos }),
        ...(data.descuentoPagoUnico !== undefined && { descuentoPagoUnico: data.descuentoPagoUnico }),
        ...(data.notasPago !== undefined && { notasPago: data.notasPago }),
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error en PUT /api/financial-templates/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar plantilla financiera' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar plantilla financiera
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.financialTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/financial-templates/[id]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar plantilla financiera' },
      { status: 500 }
    )
  }
}
