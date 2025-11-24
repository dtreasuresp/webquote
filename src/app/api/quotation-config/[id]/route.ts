import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const generarNumeroCotizacion = (): string => {
  const ahora = new Date()
  const numero = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const año = ahora.getFullYear().toString().slice(-2)
  const hh = ahora.getHours().toString().padStart(2, '0')
  const ss = ahora.getSeconds().toString().padStart(2, '0')
  return `#${numero}.${año}.${hh}${ss}`
}

const calcularFechaVencimiento = (fechaEmision: Date, dias: number): Date => {
  const vencimiento = new Date(fechaEmision)
  vencimiento.setDate(vencimiento.getDate() + dias)
  return vencimiento
}

/**
 * PUT /api/quotation-config/[id]
 * Actualizar cotización por ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const numeroGenerado = generarNumeroCotizacion()
    const fechaEmision = new Date(data.fechaEmision || new Date())
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || 30)

    const cotizacion = await prisma.quotationConfig.update({
      where: { id },
      data: {
        numero: numeroGenerado,
        versionNumber: data.versionNumber || 1,
        fechaEmision,
        tiempoValidez: data.tiempoValidez || 30,
        fechaVencimiento,
        presupuesto: data.presupuesto || '',
        moneda: data.moneda || 'USD',
        empresa: data.empresa || '',
        sector: data.sector || '',
        ubicacion: data.ubicacion || '',
        emailCliente: data.emailCliente || '',
        whatsappCliente: data.whatsappCliente || '',
        profesional: data.profesional || '',
        empresaProveedor: data.empresaProveedor || '',
        emailProveedor: data.emailProveedor || '',
        whatsappProveedor: data.whatsappProveedor || '',
        ubicacionProveedor: data.ubicacionProveedor || '',
        tiempoVigenciaValor: data.tiempoVigenciaValor || 12,
        tiempoVigenciaUnidad: data.tiempoVigenciaUnidad || 'meses',
        heroTituloMain: data.heroTituloMain || 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: data.heroTituloSub || 'PÁGINA CATÁLOGO DINÁMICA',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...cotizacion,
        fechaEmision: cotizacion.fechaEmision.toISOString(),
        fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
        createdAt: cotizacion.createdAt.toISOString(),
        updatedAt: cotizacion.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error en PUT /api/quotation-config/[id]:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar cotización',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/quotation-config/[id]
 * Obtener cotización por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const cotizacion = await prisma.quotationConfig.findUnique({
      where: { id },
    })

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...cotizacion,
        fechaEmision: cotizacion.fechaEmision.toISOString(),
        fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
        createdAt: cotizacion.createdAt.toISOString(),
        updatedAt: cotizacion.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error en GET /api/quotation-config/[id]:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener cotización',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
