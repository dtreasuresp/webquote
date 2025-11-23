import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Generar número de cotización: #NNN.YY.HHSS
const generarNumeroCotizacion = (): string => {
  const ahora = new Date()
  const numero = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const año = ahora.getFullYear().toString().slice(-2)
  const hh = ahora.getHours().toString().padStart(2, '0')
  const ss = ahora.getSeconds().toString().padStart(2, '0')
  return `#${numero}.${año}.${hh}${ss}`
}

// Calcular fecha vencimiento: fechaEmision + tiempoValidez (días)
const calcularFechaVencimiento = (fechaEmision: Date, dias: number): Date => {
  const vencimiento = new Date(fechaEmision)
  vencimiento.setDate(vencimiento.getDate() + dias)
  return vencimiento
}

// GET: Obtener la cotización más reciente
export async function GET(request: NextRequest) {
  try {
    const cotizacion = await prisma.quotationConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!cotizacion) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json({
      ...cotizacion,
      fechaEmision: cotizacion.fechaEmision.toISOString(),
      fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
      createdAt: cotizacion.createdAt.toISOString(),
      updatedAt: cotizacion.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error en GET /api/quotation-config:', error)
    return NextResponse.json(
      { error: 'Error al obtener cotización', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST: Crear nueva cotización
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const numeroGenerado = generarNumeroCotizacion()
    const fechaEmision = new Date(data.fechaEmision || new Date())
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || 30)

    const cotizacion = await prisma.quotationConfig.create({
      data: {
        numero: numeroGenerado,
        version: data.version || '1.0',
        fechaEmision,
        tiempoValidez: data.tiempoValidez || 30,
        fechaVencimiento,
        presupuesto: data.presupuesto || '',
        moneda: data.moneda || 'USD',
        empresa: data.empresa || '',
        sector: data.sector || '',
        ubicacion: data.ubicacion || '',
        profesional: data.profesional || '',
        empresaProveedor: data.empresaProveedor || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        ubicacionProveedor: data.ubicacionProveedor || '',
        tiempoVigenciaValor: data.tiempoVigenciaValor || 12,
        tiempoVigenciaUnidad: data.tiempoVigenciaUnidad || 'meses',
        heroTituloMain: data.heroTituloMain || 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: data.heroTituloSub || 'PÁGINA CATÁLOGO DINÁMICA',
      },
    })

    return NextResponse.json(
      {
        ...cotizacion,
        fechaEmision: cotizacion.fechaEmision.toISOString(),
        fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
        createdAt: cotizacion.createdAt.toISOString(),
        updatedAt: cotizacion.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en POST /api/quotation-config:', error)
    return NextResponse.json(
      { error: 'Error al crear cotización', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT: Actualizar cotización existente
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const data = await request.json()

    const numeroGenerado = generarNumeroCotizacion()
    const fechaEmision = new Date(data.fechaEmision || new Date())
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || 30)

    const cotizacion = await prisma.quotationConfig.update({
      where: { id },
      data: {
        numero: numeroGenerado,
        version: data.version || '1.0',
        fechaEmision,
        tiempoValidez: data.tiempoValidez || 30,
        fechaVencimiento,
        presupuesto: data.presupuesto || '',
        moneda: data.moneda || 'USD',
        empresa: data.empresa || '',
        sector: data.sector || '',
        ubicacion: data.ubicacion || '',
        profesional: data.profesional || '',
        empresaProveedor: data.empresaProveedor || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        ubicacionProveedor: data.ubicacionProveedor || '',
        tiempoVigenciaValor: data.tiempoVigenciaValor || 12,
        tiempoVigenciaUnidad: data.tiempoVigenciaUnidad || 'meses',
        heroTituloMain: data.heroTituloMain || 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: data.heroTituloSub || 'PÁGINA CATÁLOGO DINÁMICA',
      },
    })

    return NextResponse.json({
      ...cotizacion,
      fechaEmision: cotizacion.fechaEmision.toISOString(),
      fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
      createdAt: cotizacion.createdAt.toISOString(),
      updatedAt: cotizacion.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error en PUT /api/quotation-config:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cotización', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
