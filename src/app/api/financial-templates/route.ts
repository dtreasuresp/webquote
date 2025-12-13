import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Listar todas las plantillas financieras de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'admin' // Hardcoded temporalmente

    const templates = await prisma.financialTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error en GET /api/financial-templates:', error)
    return NextResponse.json(
      { error: 'Error al obtener plantillas financieras' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva plantilla financiera
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const userId = data.userId || 'admin' // Hardcoded temporalmente

    const template = await prisma.financialTemplate.create({
      data: {
        id: randomUUID(),
        userId,
        nombre: data.nombre || 'Nueva Plantilla',
        desarrollo: data.desarrollo || 0,
        descuento: data.descuento || 0,
        opcionesPago: data.opcionesPago || null,
        tituloSeccionPago: data.tituloSeccionPago || 'Opciones de Pago',
        subtituloSeccionPago: data.subtituloSeccionPago || null,
        metodosPreferidos: data.metodosPreferidos || null,
        configDescuentos: data.configDescuentos || null,
        descuentoPagoUnico: data.descuentoPagoUnico || 0,
        notasPago: data.notasPago || null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/financial-templates:', error)
    return NextResponse.json(
      { error: 'Error al crear plantilla financiera' },
      { status: 500 }
    )
  }
}
