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

// GET: Obtener la cotización ACTIVA (isGlobal: true)
export async function GET(request: NextRequest) {
  try {
    // [AUDIT] Buscar cotización activa
    console.log('[AUDIT] GET /api/quotation-config - Buscando cotización activa (isGlobal: true)')
    
    const cotizacion = await prisma.quotationConfig.findFirst({
      where: { isGlobal: true },
      orderBy: { updatedAt: 'desc' },
    })
    
    console.log('[AUDIT] Cotización encontrada:', cotizacion?.id, cotizacion?.numero, 'isGlobal:', cotizacion?.isGlobal)

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
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error en GET /api/quotation-config:', msg)
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Error al obtener cotización' },
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

    // [AUDIT] Log de creación de cotización
    console.log('[AUDIT] POST /api/quotation-config - Creando nueva cotización')
    console.log('[AUDIT] Número generado:', numeroGenerado)
    console.log('[AUDIT] Stack trace:', new Error('AUDIT_TRACE').stack?.split('\n').slice(0, 5).join('\n'))
    
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
        metodosPreferidos: data.metodosPreferidos || null,
        estilosConfig: data.estilosConfig || null,
        // Contenido General Dinámico
        contenidoGeneral: data.contenidoGeneral || null,
      },
    })
    
    console.log('[AUDIT] Cotización creada:', cotizacion.id, cotizacion.numero)

    // FIX: Devolver estructura {success, data} consistente con otros endpoints
    return NextResponse.json(
      {
        success: true,
        data: {
          ...cotizacion,
          fechaEmision: cotizacion.fechaEmision.toISOString(),
          fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
          createdAt: cotizacion.createdAt.toISOString(),
          updatedAt: cotizacion.updatedAt.toISOString(),
        }
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
    // Priorizar cotización activa/global; si no hay, tomar la más reciente
    let cotizacion = await prisma.quotationConfig.findFirst({
      where: {
        OR: [{ isGlobal: true }, { activo: true }],
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!cotizacion) {
      cotizacion = await prisma.quotationConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      })
    }

    const data = await request.json()
    
    // Obtener cotización actual para mantener número e incrementar versión
    const id = cotizacion?.id

    if (!id) {
      return NextResponse.json({ error: 'Cotización activa no encontrada' }, { status: 404 })
    }

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

    const cotizacionActualizada = await prisma.quotationConfig.update({
      where: { id },
      data: {
        numero: numeroActualizado,
        versionNumber: nuevaVersion,
        fechaEmision,
        tiempoValidez: data.tiempoValidez || 30,
        fechaVencimiento,
        presupuesto: data.presupuesto ?? cotizacion?.presupuesto ?? '',
        moneda: data.moneda ?? cotizacion?.moneda ?? 'USD',
        empresa: data.empresa ?? cotizacion?.empresa ?? '',
        sector: data.sector ?? cotizacion?.sector ?? '',
        ubicacion: data.ubicacion ?? cotizacion?.ubicacion ?? '',
        profesional: data.profesional ?? cotizacion?.profesional ?? '',
        empresaProveedor: data.empresaProveedor ?? cotizacion?.empresaProveedor ?? '',
        emailProveedor: data.emailProveedor ?? cotizacion?.emailProveedor ?? '',
        whatsappProveedor: data.whatsappProveedor ?? cotizacion?.whatsappProveedor ?? '',
        ubicacionProveedor: data.ubicacionProveedor ?? cotizacion?.ubicacionProveedor ?? '',
        tiempoVigenciaValor: data.tiempoVigenciaValor ?? cotizacion?.tiempoVigenciaValor ?? 12,
        tiempoVigenciaUnidad: data.tiempoVigenciaUnidad ?? cotizacion?.tiempoVigenciaUnidad ?? 'meses',
        heroTituloMain: data.heroTituloMain ?? cotizacion?.heroTituloMain ?? 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: data.heroTituloSub ?? cotizacion?.heroTituloSub ?? 'PÁGINA CATÁLOGO DINÁMICA',
      },
    })

    return NextResponse.json({
      ...cotizacionActualizada,
      fechaEmision: cotizacionActualizada.fechaEmision.toISOString(),
      fechaVencimiento: cotizacionActualizada.fechaVencimiento.toISOString(),
      createdAt: cotizacionActualizada.createdAt.toISOString(),
      updatedAt: cotizacionActualizada.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error en PUT /api/quotation-config:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cotización', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
