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
    return NextResponse.json({ error: 'Error al obtener snapshots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const snapshot = await prisma.packageSnapshot.create({
      data: {
        nombre: data.nombre,
        hostingPrice: data.hostingPrice,
        mailboxPrice: data.mailboxPrice,
        dominioPrice: data.dominioPrice,
        mesesGratis: data.mesesGratis,
        mesesPago: data.mesesPago,
        gestionPrecio: data.gestionPrecio,
        gestionMesesGratis: data.gestionMesesGratis,
        gestionMesesPago: data.gestionMesesPago,
        desarrollo: data.desarrollo,
        descuento: data.descuento,
        otrosServicios: data.otrosServicios || [],
        costoInicial: data.costoInicial,
        costoAño1: data.costoAño1,
        costoAño2: data.costoAño2,
        activo: true,
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
        nombre: data.nombre,
        hostingPrice: data.hostingPrice,
        mailboxPrice: data.mailboxPrice,
        dominioPrice: data.dominioPrice,
        mesesGratis: data.mesesGratis,
        mesesPago: data.mesesPago,
        gestionPrecio: data.gestionPrecio,
        gestionMesesGratis: data.gestionMesesGratis,
        gestionMesesPago: data.gestionMesesPago,
        desarrollo: data.desarrollo,
        descuento: data.descuento,
        otrosServicios: data.otrosServicios || [],
        costoInicial: data.costoInicial,
        costoAño1: data.costoAño1,
        costoAño2: data.costoAño2,
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
