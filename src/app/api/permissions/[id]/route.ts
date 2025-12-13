import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/permissions/[id]
 * Obtiene un permiso específico
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const permission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permiso no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(permission)
  } catch (error) {
    console.error('[API Permissions] Error fetching permission:', error)
    return NextResponse.json(
      { error: 'Error al obtener permiso' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/permissions/[id]
 * Actualiza un permiso
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, category } = body

    const existing = await prisma.permission.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Permiso no encontrado' },
        { status: 404 }
      )
    }

    // No permitir editar permisos del sistema
    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'No se pueden editar permisos del sistema' },
        { status: 403 }
      )
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description === undefined ? existing.description : description,
        category: category || existing.category,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'permission.updated',
        entityType: 'Permission',
        entityId: permission.id,
        userName: 'SYSTEM',
        details: { 
          before: { name: existing.name },
          after: { name: permission.name },
        },
      },
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error('[API Permissions] Error updating permission:', error)
    return NextResponse.json(
      { error: 'Error al actualizar permiso' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/permissions/[id]
 * Elimina un permiso
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.permission.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Permiso no encontrado' },
        { status: 404 }
      )
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'No se pueden eliminar permisos del sistema' },
        { status: 403 }
      )
    }

    // Eliminar asociaciones primero
    await prisma.rolePermissions.deleteMany({
      where: { permissionId: id },
    })

    await prisma.userPermission.deleteMany({
      where: { permissionId: id },
    })

    await prisma.permission.delete({ where: { id } })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'permission.deleted',
        entityType: 'Permission',
        entityId: id,
        userName: 'SYSTEM',
        details: { name: existing.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Permissions] Error deleting permission:', error)
    return NextResponse.json(
      { error: 'Error al eliminar permiso' },
      { status: 500 }
    )
  }
}
