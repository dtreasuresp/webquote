import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const snapshots = await prisma.packageSnapshot.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(snapshots)
  } catch (error) {
    console.error('Error en GET /api/snapshots:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    console.error('Message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Error al obtener snapshots', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // Nuevo esquema: serviciosBase (JSON) + gestion* + desarrollo/ descuento + costos
    const snapshot = await prisma.packageSnapshot.create({
      data: {
        nombre: data.nombre || '',
        serviciosBase: data.serviciosBase || [],
        gestionPrecio: data.gestionPrecio || 0,
        gestionMesesGratis: data.gestionMesesGratis || 0,
        gestionMesesPago: data.gestionMesesPago || 0,
        desarrollo: data.desarrollo || 0,
        descuento: data.descuento || 0,
        tipo: data.tipo || '',
        descripcion: data.descripcion || '',
        otrosServicios: data.otrosServicios || [],
        costoInicial: data.costoInicial || 0,
        costoAño1: data.costoAño1 || data.costoAnio1 || 0,
        costoAño2: data.costoAño2 || data.costoAnio2 || 0,
        activo: data.activo !== false,
      },
    })

    return NextResponse.json(snapshot, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/snapshots:', error)
    return NextResponse.json({ error: 'Error al crear snapshot' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const data = await request.json()

    const snapshot = await prisma.packageSnapshot.update({
      where: { id },
      data: {
        nombre: data.nombre || '',
        serviciosBase: data.serviciosBase || [],
        gestionPrecio: data.gestionPrecio || 0,
        gestionMesesGratis: data.gestionMesesGratis || 0,
        gestionMesesPago: data.gestionMesesPago || 0,
        desarrollo: data.desarrollo || 0,
        descuento: data.descuento || 0,
        tipo: data.tipo || '',
        descripcion: data.descripcion || '',
        otrosServicios: data.otrosServicios || [],
        costoInicial: data.costoInicial || 0,
        costoAño1: data.costoAño1 || data.costoAnio1 || 0,
        costoAño2: data.costoAño2 || data.costoAnio2 || 0,
      },
    })

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Error en PUT /api/snapshots:', error)
    return NextResponse.json({ error: 'Error al actualizar snapshot' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const snapshot = await prisma.packageSnapshot.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Error en DELETE /api/snapshots:', error)
    return NextResponse.json({ error: 'Error al eliminar snapshot' }, { status: 500 })
  }
}
