import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forzar que esta ruta sea dinámica (no cacheada)
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/quotations/packages-history
 * Obtiene el historial de paquetes (packagesSnapshot) de TODAS las cotizaciones
 * Para usar en la comparación histórica de paquetes
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener packagesSnapshot y metadata de TODAS las cotizaciones
    const quotationsWithSnapshots = await prisma.quotationConfig.findMany({
      select: {
        id: true,
        numero: true,
        versionNumber: true,
        isGlobal: true,
        createdAt: true,
        packagesSnapshot: true,
        packagesSnapshotAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Extraer y aplanar todos los paquetes de cada cotización
    interface PackageFromJSON {
      id?: string
      nombre: string
      serviciosBase?: unknown[]
      desarrollo?: number
      descuento?: number
      tipo?: string
      descripcion?: string
      emoji?: string
      tagline?: string
      tiempoEntrega?: string
      opcionesPago?: unknown[]
      descuentoPagoUnico?: number
      otrosServicios?: unknown[]
      costoInicial?: number
      costoAño1?: number
      costoAño2?: number
      activo?: boolean
      [key: string]: unknown
    }

    interface HistoricalPackage extends PackageFromJSON {
      _quotationId: string
      _quotationNumero: string
      _quotationVersionNumber: number
      _quotationCreatedAt: Date
      _isCurrentVersion: boolean
    }

    const allHistoricalPackages: HistoricalPackage[] = []
    const globalQuotation = quotationsWithSnapshots.find(q => q.isGlobal)

    for (const quotation of quotationsWithSnapshots) {
      const packagesSnapshot = quotation.packagesSnapshot as PackageFromJSON[] | null
      
      if (packagesSnapshot && Array.isArray(packagesSnapshot)) {
        for (const pkg of packagesSnapshot) {
          allHistoricalPackages.push({
            ...pkg,
            // Añadir metadata de la cotización origen
            _quotationId: quotation.id,
            _quotationNumero: quotation.numero,
            _quotationVersionNumber: quotation.versionNumber ?? 0,
            _quotationCreatedAt: quotation.createdAt,
            _isCurrentVersion: quotation.id === globalQuotation?.id,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        // Lista de todos los paquetes históricos aplanados
        packages: allHistoricalPackages,
        // Info resumida de cotizaciones
        quotations: quotationsWithSnapshots.map(q => ({
          id: q.id,
          numero: q.numero,
          versionNumber: q.versionNumber,
          isGlobal: q.isGlobal,
          createdAt: q.createdAt,
          packagesCount: Array.isArray(q.packagesSnapshot) 
            ? (q.packagesSnapshot as unknown[]).length 
            : 0,
        })),
        totalPackages: allHistoricalPackages.length,
        totalQuotations: quotationsWithSnapshots.length,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error fetching packages history:', msg)
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Error al obtener historial de paquetes' },
      { status: 500 }
    )
  }
}
