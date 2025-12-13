import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface RolePermissionItem {
  permission: {
    id: string
    name: string
    description: string | null
    category: string
  }
  accessLevel: string
}

interface UserPermissionItem {
  id: string
  Permission: {
    id: string
    name: string
    description: string | null
    category: string
  }
  granted: boolean
}

/**
 * GET /api/user-permissions/[id]
 * Obtiene permisos de un usuario específico
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Obtener usuario con su rol y permisos individuales
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roleRef: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        UserPermission: {
          include: {
            Permission: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Construir lista de permisos efectivos
    const rolePermissions = user.roleRef?.permissions.map((rp: RolePermissionItem) => ({
      permissionId: rp.permission.id,
      permissionName: rp.permission.name,
      description: rp.permission.description,
      category: rp.permission.category,
      accessLevel: rp.accessLevel,
      source: 'role' as const,
    })) || []

    const userOverrides = user.UserPermission.map((up: UserPermissionItem) => ({
      id: up.id,
      permissionId: up.Permission.id,
      permissionName: up.Permission.name,
      description: up.Permission.description,
      category: up.Permission.category,
      granted: up.granted,
      source: 'override' as const,
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        roleId: user.roleId,
        roleName: user.roleRef?.displayName || null,
      },
      rolePermissions,
      userOverrides,
    })
  } catch (error) {
    console.error('[API UserPermissions] Error fetching user permissions:', error)
    return NextResponse.json(
      { error: 'Error al obtener permisos de usuario' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user-permissions/[id]
 * Elimina un override de permiso de usuario
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.userPermission.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, nombre: true } },
        Permission: { select: { name: true } },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Permiso de usuario no encontrado' },
        { status: 404 }
      )
    }

    await prisma.userPermission.delete({ where: { id } })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'user-permission.removed',
        entityType: 'UserPermission',
        entityId: id,
        userId: existing.userId,
        userName: existing.User?.nombre || 'UNKNOWN',
        details: { 
          permissionName: existing.Permission.name,
          wasGranted: existing.granted,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API UserPermissions] Error deleting:', error)
    return NextResponse.json(
      { error: 'Error al eliminar permiso de usuario' },
      { status: 500 }
    )
  }
}
