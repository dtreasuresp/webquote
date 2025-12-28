import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'

// Forzar que esta ruta sea dinámica (no cacheada)
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/quotations
 * Obtiene todas las QuotationConfig ordenadas por fecha
 * OPTIMIZADO: Solo campos esenciales para listado (excluye JSON pesados como contenidoGeneral)
 */
export async function GET(request: NextRequest) {
  const { session, error, accessLevel } = await requireReadPermission('quotations.view')
  if (error) return error

  try {
    // Seleccionar solo campos necesarios para el listado
    // Excluimos: contenidoGeneral (~463KB por versión), packagesSnapshot, estilosConfig, etc.
    const quotations = await prisma.quotationConfig.findMany({
      select: {
        id: true,
        numero: true,
        versionNumber: true,
        isGlobal: true,
        activo: true,
        respondidoEn: true,
        expiradoEn: true,
        diasParaAceptar: true,
        // Datos del cliente
        empresa: true,
        sector: true,
        ubicacion: true,
        // Usuario asignado (relación inversa)
        User: {
          select: {
            username: true,
            nombre: true,
            email: true
          }
        },
        emailCliente: true,
        whatsappCliente: true,
        // Datos del proveedor
        profesional: true,
        empresaProveedor: true,
        emailProveedor: true,
        whatsappProveedor: true,
        ubicacionProveedor: true,
        // Fechas y configuración básica
        fechaEmision: true,
        fechaVencimiento: true,
        tiempoValidez: true,
        tiempoVigenciaValor: true,
        tiempoVigenciaUnidad: true,
        presupuesto: true,
        moneda: true,
        // Estado de la cotización
        estado: true,
        activadoEn: true,
        inactivadoEn: true,
        // Hero
        heroTituloMain: true,
        heroTituloSub: true,
        // Timestamps
        createdAt: true,
        updatedAt: true,
        // Templates ligeros (necesarios para edición)
        serviciosBaseTemplate: true,
        serviciosOpcionalesTemplate: true,
        opcionesPagoTemplate: true,
        configDescuentosTemplate: true,
        descripcionesPaqueteTemplates: true,
        metodoPagoPreferido: true,
        notasPago: true,
        metodosPreferidos: true,
        // Nota: Excluimos intencionalmente:
        // - contenidoGeneral (contiene imagen base64 de ~463KB)
        // - packagesSnapshot (JSON histórico pesado)
        // - estilosConfig (raramente necesario en listado)
        // - editorState (estado interno del editor)
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
  const { session, error, accessLevel } = await requireWritePermission('quotations.manage')
  if (error) return error

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
