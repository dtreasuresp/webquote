import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateNextQuotationNumber, updateQuotationVersion } from '@/lib/utils/quotationNumber'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Obtener último número para generar el siguiente
    const ultimaCotizacion = await prisma.quotationConfig.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { numero: true }
    })
    const numeroGenerado = generateNextQuotationNumber(ultimaCotizacion?.numero || null)
    
    const fechaEmision = new Date(data.fechaEmision || new Date())
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || 30)

    const cotizacion = await prisma.quotationConfig.create({
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
        profesional: data.profesional || '',
        empresaProveedor: data.empresaProveedor || '',
        emailProveedor: data.emailProveedor || '',
        whatsappProveedor: data.whatsappProveedor || '',
        ubicacionProveedor: data.ubicacionProveedor || '',
        tiempoVigenciaValor: data.tiempoVigenciaValor || 12,
        tiempoVigenciaUnidad: data.tiempoVigenciaUnidad || 'meses',
        heroTituloMain: data.heroTituloMain || 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: data.heroTituloSub || 'PÁGINA CATÁLOGO DINÁMICA',
        // Templates reutilizables
        serviciosBaseTemplate: data.serviciosBaseTemplate || null,
        serviciosOpcionalesTemplate: data.serviciosOpcionalesTemplate || null,
        opcionesPagoTemplate: data.opcionesPagoTemplate || null,
        configDescuentosTemplate: data.configDescuentosTemplate || null,
        descripcionesPaqueteTemplates: data.descripcionesPaqueteTemplates || null,
        metodoPagoPreferido: data.metodoPagoPreferido || '',
        notasPago: data.notasPago || '',
        estilosConfig: data.estilosConfig || null,
        // Contenido General Dinámico
        contenidoGeneral: data.contenidoGeneral || null,
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

// PUT: Actualizar cotización existente (mantiene número, incrementa versión)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const data = await request.json()
    
    // Obtener cotización actual para mantener número e incrementar versión
    const cotizacionActual = await prisma.quotationConfig.findUnique({
      where: { id },
      select: { numero: true, versionNumber: true }
    })
    
    if (!cotizacionActual) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }
    
    // Usar la versión que viene del frontend (ya incrementada) o mantener la actual
    const nuevaVersion = data.versionNumber || cotizacionActual.versionNumber || 1
    
    // Actualizar versión en el número de cotización usando utilidad
    const numeroActualizado = updateQuotationVersion(cotizacionActual.numero, nuevaVersion)
    
    const fechaEmision = new Date(data.fechaEmision || new Date())
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || 30)

    const cotizacion = await prisma.quotationConfig.update({
      where: { id },
      data: {
        numero: numeroActualizado,
        versionNumber: nuevaVersion,
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
