import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

/**
 * GET /api/roles
 * Lista todos los roles con conteo de usuarios y permisos
 */
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { hierarchy: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('[API Roles] Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Error al obtener roles' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/roles
 * Crea un nuevo rol personalizado
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, displayName, description, hierarchy, color, isSystem } = body

    // Verificar sesión y permisos
    const session = await getServerSession(authOptions)
    const canManageRoles = await hasPermission(session, 'security.roles.manage')
    
    if (!canManageRoles) {
      return NextResponse.json(
        { error: 'No tiene permisos para gestionar roles' },
        { status: 403 }
      )
    }

    const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

    // Solo SUPER_ADMIN puede crear roles del sistema
    if (isSystem && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Solo SUPER_ADMIN puede crear roles del sistema' },
        { status: 403 }
      )
    }

    // Validaciones
    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Nombre y nombre para mostrar son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que no sea un nombre del sistema
    if (['SUPER_ADMIN', 'ADMIN', 'CLIENT'].includes(name)) {
      return NextResponse.json(
        { error: 'No se puede crear un rol con nombre reservado del sistema' },
        { status: 400 }
      )
    }

    // Verificar que hierarchy no sea 100 (reservado para SUPER_ADMIN)
    if (hierarchy >= 100) {
      return NextResponse.json(
        { error: 'La jerarquía máxima es 99' },
        { status: 400 }
      )
    }

    // Verificar unicidad
    const existing = await prisma.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un rol con ese nombre' },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description: description || null,
        hierarchy: hierarchy || 50,
        color: color || null,
        isSystem: isSystem || false,
        isActive: true,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'role.created',
        entityType: 'Role',
        entityId: role.id,
        userName: 'SYSTEM',
        details: { name, displayName, hierarchy },
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('[API Roles] Error creating role:', error)
    return NextResponse.json(
      { error: 'Error al crear rol' },
      { status: 500 }
    )
  }
}
