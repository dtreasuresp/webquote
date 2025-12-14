import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST /api/auth/logout
 * Registra el logout en auditoría antes de cerrar sesión
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user) {
      // Crear log de auditoría para logout
      await prisma.auditLog.create({
        data: {
          action: 'logout',
          entityType: 'auth',
          entityId: session.user.id,
          userId: session.user.id,
          userName: session.user.username,
          details: {
            timestamp: new Date().toISOString(),
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Logout] Error:', error)
    return NextResponse.json(
      { error: 'Error al registrar logout' },
      { status: 500 }
    )
  }
}
