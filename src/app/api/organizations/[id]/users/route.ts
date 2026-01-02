import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission } from '@/lib/apiProtection'

/**
 * GET /api/organizations/[id]/users
 * Obtiene todos los usuarios de una organización específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireReadPermission('org.view')
  if (error) return error

  try {
    const { id: orgId } = await params

    // Verificar que la organización existe
    const org = await prisma.organization.findUnique({
      where: { id: orgId }
    })

    if (!org) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // Obtener usuarios de la organización
    const users = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        username: true,
        nombre: true,
        email: true,
        telefono: true,
        role: true,
        roleRef: {
          select: {
            color: true,
            displayName: true
          }
        },
        activo: true,
        lastLogin: true,
        quotationAssigned: {
          select: {
            id: true,
            empresa: true,
            numero: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { nombre: 'asc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[API Organizations Users] Error:', errorMessage, error)
    return NextResponse.json(
      { error: errorMessage || 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}
