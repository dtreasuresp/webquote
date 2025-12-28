import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit/auditHelper'

/**
 * POST /api/quotations/[id]/client-response
 * Registra la respuesta de un cliente a una cotización
 * (ACEPTACIÓN, RECHAZO O SOLICITUD DE NUEVA PROPUESTA)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quotationId } = await params

    if (!quotationId) {
      return NextResponse.json(
        { success: false, error: 'quotationId is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      responseType, // "ACEPTADA" | "RECHAZADA" | "NUEVA_PROPUESTA"
      clientUserId,
      clientName,
      clientEmail,
      mensaje,
    } = body

    // Validar campos requeridos
    if (!responseType || !clientName || !clientEmail) {
      return NextResponse.json(
        { success: false, error: 'responseType, clientName, and clientEmail are required' },
        { status: 400 }
      )
    }

    // Validar responseType
    if (!['ACEPTADA', 'RECHAZADA', 'NUEVA_PROPUESTA'].includes(responseType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid responseType' },
        { status: 400 }
      )
    }

    // Verificar que la cotización existe
    const quotation = await prisma.quotationConfig.findUnique({
      where: { id: quotationId },
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Obtener IP y User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Calcular días restantes
    const now = new Date()
    const expirationDate = quotation.fechaVencimiento
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Crear respuesta del cliente
    const clientResponse = await prisma.clientResponse.create({
      data: {
        quotationConfigId: quotationId,
        clientUserId: clientUserId || null,
        clientName,
        clientEmail,
        responseType,
        mensaje: mensaje || null,
        respondidoEn: now,
        diasRestantes: Math.max(0, daysRemaining),
        ipAddress,
        userAgent,
      },
    })

    // Registrar en auditoría
    await createAuditLog({
      action: 'CLIENT_RESPONSE_CREATED',
      entityType: 'CLIENT_RESPONSE',
      entityId: clientResponse.id,
      actorName: clientName,
      details: {
        quotationId,
        responseType,
        clientEmail,
      },
      ipAddress,
      userAgent,
    })

    // Obtener todos los usuarios para crear notificaciones
    // Por ahora, notificamos a todos los usuarios (mejor implementar permisos después)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
      },
    })

    const adminUsers = allUsers

    // Crear notificaciones para cada usuario admin
    const tipoNotificacionMap = {
      'ACEPTADA': 'CLIENTE_ACEPTACION',
      'RECHAZADA': 'CLIENTE_RECHAZO',
      'NUEVA_PROPUESTA': 'CLIENTE_PROPUESTA',
    } as const

    const tipoNotificacion = tipoNotificacionMap[responseType as keyof typeof tipoNotificacionMap]

    for (const user of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          clientResponseId: clientResponse.id,
          titulo: `Nueva respuesta de cliente: ${responseType}`,
          descripcion: `${clientName} ha respondido a la cotización: ${responseType}`,
          tipoNotificacion: tipoNotificacion as any,
          leida: false,
        },
      })
    }

    // Registrar creación de notificaciones en auditoría
    await createAuditLog({
      action: 'NOTIFICATION_CREATED',
      entityType: 'NOTIFICATION',
      actorName: 'SYSTEM',
      details: {
        clientResponseId: clientResponse.id,
        notificationsCreated: adminUsers.length,
        tipoNotificacion,
      },
    })

    return NextResponse.json({
      success: true,
      data: clientResponse,
      message: 'Client response recorded successfully',
    })
  } catch (error) {
    console.error('Error creating client response:', error)
    return NextResponse.json(
      { success: false, error: 'Error creating client response' },
      { status: 500 }
    )
  }
}
