import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateQuotationVersion } from '@/lib/utils/quotationNumber'

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
    
    // DEBUG: Log para verificar qué datos llegan
    console.log('[DEBUG API PUT] contenidoGeneral recibido:', JSON.stringify(data.contenidoGeneral, null, 2))
    console.log('[DEBUG API PUT] seccionesColapsadas:', data.contenidoGeneral?.seccionesColapsadas)

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    // Obtener cotización actual para mantener número base
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
        // Templates reutilizables
        ...(data.serviciosBaseTemplate !== undefined && { serviciosBaseTemplate: data.serviciosBaseTemplate }),
        ...(data.serviciosOpcionalesTemplate !== undefined && { serviciosOpcionalesTemplate: data.serviciosOpcionalesTemplate }),
        ...(data.opcionesPagoTemplate !== undefined && { opcionesPagoTemplate: data.opcionesPagoTemplate }),
        ...(data.configDescuentosTemplate !== undefined && { configDescuentosTemplate: data.configDescuentosTemplate }),
        ...(data.descripcionesPaqueteTemplates !== undefined && { descripcionesPaqueteTemplates: data.descripcionesPaqueteTemplates }),
        ...(data.metodoPagoPreferido !== undefined && { metodoPagoPreferido: data.metodoPagoPreferido }),
        ...(data.notasPago !== undefined && { notasPago: data.notasPago }),
        ...(data.estilosConfig !== undefined && { estilosConfig: data.estilosConfig }),
        // Contenido General Dinámico
        ...(data.contenidoGeneral !== undefined && { contenidoGeneral: data.contenidoGeneral }),
        // Estado del Editor (secciones colapsadas, gestión, paqueteActual)
        ...(data.editorState !== undefined && { editorState: data.editorState }),
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
