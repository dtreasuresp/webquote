import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractBaseQuotationNumber } from '@/lib/utils/quotationNumber'

/**
 * GET /api/quotation-config/versions?numero=CZ0001.251703V1
 * Obtener todas las versiones de una cotización por su número
 * Agrupa versiones que comparten el mismo número base
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const numero = searchParams.get('numero')

    if (!numero) {
      return NextResponse.json({ 
        success: false,
        error: 'Parámetro "numero" requerido' 
      }, { status: 400 })
    }

    // Extraer número base (sin versión)
    const numeroBase = extractBaseQuotationNumber(numero)

    // Buscar todas las cotizaciones que empiecen con el número base
    const versiones = await prisma.quotationConfig.findMany({
      where: {
        numero: {
          startsWith: numeroBase
        }
      },
      orderBy: {
        versionNumber: 'desc' // Más reciente primero
      },
      select: {
        id: true,
        numero: true,
        versionNumber: true,
        isGlobal: true,
        empresa: true,
        profesional: true,
        fechaEmision: true,
        fechaVencimiento: true,
        presupuesto: true,
        moneda: true,
        createdAt: true,
        updatedAt: true,
        // Incluir templates para comparación
        serviciosBaseTemplate: true,
        serviciosOpcionalesTemplate: true,
        opcionesPagoTemplate: true,
        configDescuentosTemplate: true,
        contenidoGeneral: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: versiones.map(v => ({
        ...v,
        fechaEmision: v.fechaEmision.toISOString(),
        fechaVencimiento: v.fechaVencimiento.toISOString(),
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      })),
      total: versiones.length,
      numeroBase,
    })
  } catch (error) {
    console.error('Error en GET /api/quotation-config/versions:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener versiones',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
