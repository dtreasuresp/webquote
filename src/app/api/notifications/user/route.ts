import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

/**
 * GET /api/notifications/user
 * Obtiene las notificaciones del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener sesión
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      )
    }

    // Parámetros opcionales de paginación
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

    // Construir filtro
    const whereClause: any = {
      userId,
    }

    if (unreadOnly) {
      whereClause.leida = false
    }

    // Obtener notificaciones
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        clientResponse: {
          include: {
            quotationConfig: {
              select: {
                id: true,
                numero: true,
                empresa: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Contar total de notificaciones
    const total = await prisma.notification.count({
      where: whereClause,
    })

    // Contar notificaciones no leídas
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        leida: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        limit,
        offset,
        total,
        unreadCount,
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching notifications' },
      { status: 500 }
    )
  }
}
