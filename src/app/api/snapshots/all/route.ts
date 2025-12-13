import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // ✅ Verificar sesión - Este endpoint es solo para administradores
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('[AUTH] GET /api/snapshots/all - Sin sesión, acceso denegado')
      return NextResponse.json(
        { error: 'No autenticado. Por favor inicie sesión.' },
        { status: 401 }
      )
    }

    // Solo SUPER_ADMIN y ADMIN pueden acceder a todos los snapshots
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      console.log('[AUTH] Usuario sin permisos para ver todos los snapshots:', session.user.username)
      return NextResponse.json(
        { error: 'No tiene permisos para acceder a este recurso' },
        { status: 403 }
      )
    }

    console.log('[AUDIT] Admin accediendo a todos los snapshots:', session.user.username)
    
    const snapshots = await prisma.packageSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(snapshots)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error en GET /api/snapshots/all:', msg)
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Error al obtener snapshots' },
      { status: 500 }
    )
  }
}
