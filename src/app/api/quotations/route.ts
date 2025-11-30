import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/quotations
 * Obtiene todas las QuotationConfig ordenadas por fecha
 */
export async function GET(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    const quotations = await prisma.quotationConfig.findMany({
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: quotations,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error fetching quotations:', msg)
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Error fetching quotations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/quotations
 * Crea o actualiza una QuotationConfig
 * Body: { quotationConfig: QuotationConfig, packageSnapshotId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quotationConfig, packageSnapshotId } = body

    if (!quotationConfig) {
      return NextResponse.json(
        { success: false, error: 'quotationConfig is required' },
        { status: 400 }
      )
    }

    let result
    const { id, ...configData } = quotationConfig

    if (id) {
      // Actualizar cotización existente
      // Incrementar versión
      const versionNumber = (configData.versionNumber || 1) + 1

      result = await prisma.quotationConfig.update({
        where: { id },
        data: {
          ...configData,
          versionNumber,
          updatedAt: new Date(),
        },
        include: {
          snapshots: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    } else {
      // Crear nueva cotización
      // Si es nueva, desactivar las demás y ponerla como global
      await prisma.quotationConfig.updateMany({
        where: { isGlobal: true },
        data: { isGlobal: false },
      })

      result = await prisma.quotationConfig.create({
        data: {
          ...configData,
          versionNumber: 1,
          activo: true,
          isGlobal: true,
        },
        include: {
          snapshots: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    // Vincular PackageSnapshot si se proporciona
    if (packageSnapshotId && result.id) {
      await prisma.packageSnapshot.update({
        where: { id: packageSnapshotId },
        data: { quotationConfigId: result.id },
      })
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Quotation ${id ? 'updated' : 'created'} successfully`,
    })
  } catch (error) {
    console.error('Error saving quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Error saving quotation' },
      { status: 500 }
    )
  }
}
