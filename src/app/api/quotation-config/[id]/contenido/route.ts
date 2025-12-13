import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * PATCH /api/quotation-config/[id]/contenido
 * Actualizar SOLO una sección específica del contenidoGeneral
 * Payload optimizado: { seccion: string, datos: any, timestamp?: string, visibilidad?: Record<string, boolean> }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { seccion, datos, timestamp, visibilidad } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    if (!seccion) {
      return NextResponse.json({ error: 'Sección requerida' }, { status: 400 })
    }

    // Obtener el contenidoGeneral actual de la BD
    const cotizacionActual = await prisma.quotationConfig.findUnique({
      where: { id },
      select: { contenidoGeneral: true }
    })

    if (!cotizacionActual) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    // Merge del contenido actual con los nuevos datos de la sección
    const contenidoActual = (cotizacionActual.contenidoGeneral as Record<string, unknown>) || {}
    
    // Mapeo de sección a campo en contenidoGeneral
    const seccionToField: Record<string, string> = {
      'resumen': 'textos',
      'faq': 'faq',
      'garantias': 'garantias',
      'contacto': 'contacto',
      'terminos': 'terminos',
      'analisis': 'analisisRequisitos',
      'fortalezas': 'fortalezas',
      'dinamico': 'dinamicoVsEstatico',
      'presupuesto': 'presupuestoCronograma',
      'cuotas': 'cuotas',
      'tabla': 'tablaComparativa',
      'observaciones': 'observaciones',
      'conclusion': 'conclusion',
    }

    const field = seccionToField[seccion]
    if (!field) {
      return NextResponse.json({ error: `Sección inválida: ${seccion}` }, { status: 400 })
    }

    // Construir el nuevo contenidoGeneral con solo la sección actualizada
    let nuevoContenido: Record<string, unknown>

    if (seccion === 'resumen') {
      // Caso especial: resumen está anidado en textos.resumenEjecutivo
      nuevoContenido = {
        ...contenidoActual,
        textos: {
          ...(contenidoActual.textos as Record<string, unknown> || {}),
          resumenEjecutivo: datos,
        },
      }
    } else {
      nuevoContenido = {
        ...contenidoActual,
        [field]: datos,
      }
    }

    // Actualizar timestamp si se proporciona
    if (timestamp) {
      const updatedTimestamps = (nuevoContenido.updatedTimestamps as Record<string, string>) || {}
      nuevoContenido.updatedTimestamps = {
        ...updatedTimestamps,
        [seccion]: timestamp,
      }
    }

    // Actualizar visibilidad si se proporciona
    if (visibilidad && Object.keys(visibilidad).length > 0) {
      // Detectar si es visibilidad de secciones nuevas (campos directos) o antiguas (anidadas en .visibilidad)
      const camposVisibilidadDirectos = [
        'visibilidadAnalisis', 'visibilidadFortalezas', 'visibilidadDinamico',
        'visibilidadPresupuesto', 'visibilidadTabla', 'visibilidadObservaciones', 'visibilidadConclusion'
      ]
      
      const visibilidadDirecta: Record<string, boolean> = {}
      const visibilidadAnidada: Record<string, boolean> = {}
      
      Object.entries(visibilidad).forEach(([key, value]) => {
        if (camposVisibilidadDirectos.includes(key)) {
          visibilidadDirecta[key] = value as boolean
        } else {
          visibilidadAnidada[key] = value as boolean
        }
      })
      
      // Aplicar campos directos al nivel raíz
      if (Object.keys(visibilidadDirecta).length > 0) {
        Object.assign(nuevoContenido, visibilidadDirecta)
        console.log(`[API PATCH] Visibilidad directa actualizada:`, visibilidadDirecta)
      }
      
      // Aplicar campos anidados a .visibilidad
      if (Object.keys(visibilidadAnidada).length > 0) {
        const currentVisibilidad = (nuevoContenido.visibilidad as Record<string, boolean>) || {}
        nuevoContenido.visibilidad = {
          ...currentVisibilidad,
          ...visibilidadAnidada,
        }
        console.log(`[API PATCH] Visibilidad anidada actualizada:`, visibilidadAnidada)
      }
    }

    // Actualizar solo el contenidoGeneral en la BD
    const cotizacion = await prisma.quotationConfig.update({
      where: { id },
      data: {
        contenidoGeneral: nuevoContenido as unknown as Prisma.InputJsonValue,
      },
    })

    console.log(`[API PATCH] Sección "${seccion}" actualizada. Payload size: ${JSON.stringify(datos).length} bytes`)

    return NextResponse.json({
      success: true,
      data: {
        ...cotizacion,
        fechaEmision: cotizacion.fechaEmision.toISOString(),
        fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
        createdAt: cotizacion.createdAt.toISOString(),
        updatedAt: cotizacion.updatedAt.toISOString(),
      },
      meta: {
        seccionActualizada: seccion,
        payloadSize: JSON.stringify(datos).length,
      }
    })
  } catch (error) {
    console.error('Error en PATCH /api/quotation-config/[id]/contenido:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar contenido',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
