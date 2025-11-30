import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: Obtener el estado del editor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const cotizacion = await prisma.quotationConfig.findUnique({
      where: { id },
      select: { editorState: true },
    })

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return NextResponse.json(cotizacion.editorState || {})
  } catch (error) {
    console.error('Error en GET /api/quotation-config/editor-state:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado del editor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT: Actualizar el estado del editor
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const data = await request.json()

    // Obtener estado actual
    const cotizacion = await prisma.quotationConfig.findUnique({
      where: { id },
      select: { editorState: true },
    })

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Merge del estado actual con el nuevo
    const currentState = (cotizacion.editorState as Record<string, unknown>) || {}
    const newState = {
      ...currentState,
      ...data,
    }

    // Actualizar en BD
    const updated = await prisma.quotationConfig.update({
      where: { id },
      data: {
        editorState: newState,
      },
      select: { editorState: true },
    })

    return NextResponse.json(updated.editorState)
  } catch (error) {
    console.error('Error en PUT /api/quotation-config/editor-state:', error)
    return NextResponse.json(
      { error: 'Error al guardar estado del editor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
