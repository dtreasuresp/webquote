import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit/auditHelper'
import { getServerSession } from 'next-auth/next'

/**
 * PATCH /api/notifications/[id]/mark-as-read
 * Marca una notificación como leída
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'notificationId is required' },
        { status: 400 }
      )
    }

    // Obtener sesión
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const userName = (session.user as any).name || 'Unknown'

    // Obtener la notificación
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el propietario de la notificación
    if (notification.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Si ya estaba leída, retornar sin cambios
    if (notification.leida) {
      return NextResponse.json({
        success: true,
        data: notification,
        message: 'Notification was already marked as read',
      })
    }

    // Marcar como leída
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        leida: true,
        leidoEn: new Date(),
      },
    })

    // Registrar en auditoría
    await createAuditLog({
      action: 'NOTIFICATION_MARKED_READ',
      entityType: 'NOTIFICATION',
      entityId: notificationId,
      actorId: userId,
      actorName: userName,
      details: {
        notificationTitle: notification.titulo,
        previousState: 'unread',
        currentState: 'read',
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Notification marked as read',
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { success: false, error: 'Error marking notification as read' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Elimina una notificación
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'notificationId is required' },
        { status: 400 }
      )
    }

    // Obtener sesión
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const userName = (session.user as any).name || 'Unknown'

    // Obtener la notificación
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el propietario de la notificación
    if (notification.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Eliminar la notificación
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    // Registrar en auditoría
    await createAuditLog({
      action: 'NOTIFICATION_MARKED_READ', // Reutilizar acción existente
      entityType: 'NOTIFICATION',
      entityId: notificationId,
      actorId: userId,
      actorName: userName,
      details: {
        notificationTitle: notification.titulo,
        action: 'deleted',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { success: false, error: 'Error deleting notification' },
      { status: 500 }
    )
  }
}
