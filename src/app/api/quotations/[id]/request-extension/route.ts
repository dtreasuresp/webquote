import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit/auditHelper'

/**
 * POST /api/quotations/[id]/request-extension
 * Permite a un cliente solicitar una prórroga para responder a una cotización
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
      clientName,
      clientEmail,
      diasSolicitados, // Número de días adicionales solicitados
      razon, // Razón de la prórroga
      clientUserId,
    } = body

    // Validar campos requeridos
    if (!clientName || !clientEmail || !diasSolicitados) {
      return NextResponse.json(
        { success: false, error: 'clientName, clientEmail, and diasSolicitados are required' },
        { status: 400 }
      )
    }

    // Validar diasSolicitados es un número positivo
    if (typeof diasSolicitados !== 'number' || diasSolicitados <= 0) {
      return NextResponse.json(
        { success: false, error: 'diasSolicitados must be a positive number' },
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

    // Crear respuesta de cliente con tipo NUEVA_PROPUESTA (que interpretamos como solicitud de prórroga)
    const extensionRequest = await prisma.clientResponse.create({
      data: {
        quotationConfigId: quotationId,
        clientUserId: clientUserId || null,
        clientName,
        clientEmail,
        responseType: 'NUEVA_PROPUESTA', // Reutilizamos este tipo para extensiones
        mensaje: `SOLICITUD DE PRÓRROGA: ${diasSolicitados} días - Razón: ${razon || 'No especificada'}`,
        respondidoEn: new Date(),
        diasRestantes: diasSolicitados,
        ipAddress,
        userAgent,
      },
    })

    // Registrar en auditoría
    await createAuditLog({
      action: 'QUOTATION_EXTENSION_REQUESTED',
      entityType: 'CLIENT_RESPONSE',
      entityId: extensionRequest.id,
      actorName: clientName,
      details: {
        quotationId,
        diasSolicitados,
        razon: razon || 'No especificada',
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
    for (const user of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          clientResponseId: extensionRequest.id,
          titulo: `Solicitud de prórroga: ${clientName}`,
          descripcion: `${clientName} solicita ${diasSolicitados} días adicionales. Razón: ${razon || 'No especificada'}`,
          tipoNotificacion: 'CLIENTE_PROPUESTA',
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
        clientResponseId: extensionRequest.id,
        extensionRequest: true,
        notificationsCreated: adminUsers.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: extensionRequest,
      message: 'Extension request submitted successfully',
    })
  } catch (error) {
    console.error('Error requesting extension:', error)
    return NextResponse.json(
      { success: false, error: 'Error requesting extension' },
      { status: 500 }
    )
  }
}
