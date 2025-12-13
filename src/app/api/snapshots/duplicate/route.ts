import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/snapshots/duplicate
 * Duplica los paquetes activos de una cotización a otra
 * 
 * Body:
 * - sourceQuotationId: ID de la cotización origen (puede ser null para duplicar todos los activos)
 * - targetQuotationId: ID de la cotización destino (nueva versión)
 * - onlyActive: boolean (default: true) - Solo duplicar paquetes activos
 * - snapshotIds: array de IDs específicos a duplicar (opcional, prioridad sobre sourceQuotationId)
 * 
 * Returns:
 * - duplicatedCount: número de paquetes duplicados
 * - snapshots: array de nuevos snapshots creados
 */
export async function POST(request: NextRequest) {
  try {
    const { sourceQuotationId, targetQuotationId, onlyActive = true, snapshotIds } = await request.json()

    if (!targetQuotationId) {
      return NextResponse.json(
        { error: 'targetQuotationId es requerido' },
        { status: 400 }
      )
    }

    console.log(`[API] Duplicando snapshots a cotización ${targetQuotationId}`)
    console.log(`[API] sourceQuotationId: ${sourceQuotationId}, onlyActive: ${onlyActive}, snapshotIds: ${snapshotIds?.length || 'none'}`)

    let snapshotsOrigen

    // Si se proporcionan IDs específicos, usarlos
    if (snapshotIds && Array.isArray(snapshotIds) && snapshotIds.length > 0) {
      console.log(`[API] Buscando snapshots por IDs específicos: ${snapshotIds.join(', ')}`)
      snapshotsOrigen = await prisma.packageSnapshot.findMany({
        where: {
          id: { in: snapshotIds },
        },
      })
    } 
    // Si hay sourceQuotationId, buscar por ese ID
    else if (sourceQuotationId) {
      const whereClause: { quotationConfigId: string; activo?: boolean } = {
        quotationConfigId: sourceQuotationId,
      }
      
      if (onlyActive) {
        whereClause.activo = true
      }

      console.log(`[API] Buscando snapshots con quotationConfigId: ${sourceQuotationId}`)
      snapshotsOrigen = await prisma.packageSnapshot.findMany({
        where: whereClause,
      })
    }
    // Si no hay ni IDs ni sourceQuotationId, duplicar TODOS los paquetes activos
    else if (onlyActive) {
      console.log(`[API] Buscando TODOS los snapshots activos`)
      snapshotsOrigen = await prisma.packageSnapshot.findMany({
        where: { activo: true },
      })
    }
    else {
      return NextResponse.json(
        { error: 'Debe proporcionar sourceQuotationId, snapshotIds, o onlyActive=true' },
        { status: 400 }
      )
    }

    console.log(`[API] Encontrados ${snapshotsOrigen.length} snapshots para duplicar`)
    snapshotsOrigen.forEach((s: { nombre: string; quotationConfigId: string | null }) => {
      console.log(`[API]   - "${s.nombre}" (quotationConfigId: ${s.quotationConfigId})`)
    })

    if (snapshotsOrigen.length === 0) {
      return NextResponse.json({
        success: true,
        duplicatedCount: 0,
        snapshots: [],
        message: 'No hay paquetes para duplicar',
      })
    }

    // Crear copias de cada snapshot
    const nuevosSnapshots = await Promise.all(
      snapshotsOrigen.map(async (snapshot) => {
        // Crear copia con nuevo quotationConfigId
        const nuevoSnapshot = await prisma.packageSnapshot.create({
          data: {
            nombre: snapshot.nombre,
            quotationConfigId: targetQuotationId,
            serviciosBase: snapshot.serviciosBase as Prisma.InputJsonValue,
            desarrollo: snapshot.desarrollo,
            descuento: snapshot.descuento,
            tipo: snapshot.tipo,
            descripcion: snapshot.descripcion,
            emoji: snapshot.emoji,
            tagline: snapshot.tagline,
            tiempoEntrega: snapshot.tiempoEntrega,
            opcionesPago: snapshot.opcionesPago as Prisma.InputJsonValue ?? undefined,
            tituloSeccionPago: snapshot.tituloSeccionPago,
            subtituloSeccionPago: snapshot.subtituloSeccionPago,
            descuentoPagoUnico: snapshot.descuentoPagoUnico,
            configDescuentos: snapshot.configDescuentos as Prisma.InputJsonValue ?? undefined,
            metodoPagoPreferido: snapshot.metodoPagoPreferido,
            notasPago: snapshot.notasPago,
            metodosPreferidos: snapshot.metodosPreferidos as Prisma.InputJsonValue ?? undefined,
            descuentosGenerales: snapshot.descuentosGenerales as Prisma.InputJsonValue ?? undefined,
            descuentosPorServicio: snapshot.descuentosPorServicio as Prisma.InputJsonValue ?? undefined,
            otrosServicios: snapshot.otrosServicios as Prisma.InputJsonValue,
            costoInicial: snapshot.costoInicial,
            costoAño1: snapshot.costoAño1,
            costoAño2: snapshot.costoAño2,
            activo: true, // Los nuevos siempre activos
          },
        })

        console.log(`[API] Duplicado: "${snapshot.nombre}" → nuevo ID: ${nuevoSnapshot.id}`)
        return nuevoSnapshot
      })
    )

    console.log(`[API] ✅ ${nuevosSnapshots.length} snapshots duplicados exitosamente`)

    return NextResponse.json({
      success: true,
      duplicatedCount: nuevosSnapshots.length,
      snapshots: nuevosSnapshots,
      message: `${nuevosSnapshots.length} paquete(s) duplicado(s) a la nueva versión`,
    })
  } catch (error) {
    console.error('Error en POST /api/snapshots/duplicate:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al duplicar snapshots',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
