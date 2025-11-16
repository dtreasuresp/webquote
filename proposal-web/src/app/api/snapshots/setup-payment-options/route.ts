import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const opcionesPagoConfiguracion = {
  'Constructor': {
    opcionesPago: [
      { nombre: 'Pago 1', porcentaje: 50, descripcion: 'Al iniciar' },
      { nombre: 'Pago 2', porcentaje: 50, descripcion: 'Al publicar' },
    ],
    descuentoPagoUnico: 0,
  },
  'Imperio Digital': {
    opcionesPago: [
      { nombre: 'Pago 1', porcentaje: 40, descripcion: 'Al iniciar' },
      { nombre: 'Pago 2', porcentaje: 40, descripcion: 'Al diseño' },
      { nombre: 'Pago 3', porcentaje: 13, descripcion: 'Pruebas' },
      { nombre: 'Pago 4', porcentaje: 7, descripcion: 'Publicar' },
    ],
    descuentoPagoUnico: 15,
  },
  'Obra Maestra': {
    opcionesPago: [
      { nombre: 'Pago 1', porcentaje: 40, descripcion: 'Al iniciar' },
      { nombre: 'Pago 2', porcentaje: 40, descripcion: 'Al diseño' },
      { nombre: 'Pago 3', porcentaje: 20, descripcion: 'Entrega' },
    ],
    descuentoPagoUnico: 10,
  },
}

export async function POST(request: NextRequest) {
  try {
    const results = []

    for (const [nombre, config] of Object.entries(opcionesPagoConfiguracion)) {
      const snapshot = await prisma.packageSnapshot.findFirst({
        where: { nombre },
      })

      if (snapshot) {
        const updated = await prisma.packageSnapshot.update({
          where: { id: snapshot.id },
          data: {
            opcionesPago: config.opcionesPago,
            descuentoPagoUnico: config.descuentoPagoUnico,
          },
        })
        results.push({ paquete: nombre, status: 'actualizado', id: updated.id })
      } else {
        results.push({ paquete: nombre, status: 'no encontrado' })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error actualizando opciones de pago:', error)
    return NextResponse.json(
      { error: 'Error al actualizar opciones de pago', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
