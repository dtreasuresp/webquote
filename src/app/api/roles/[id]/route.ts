import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/roles/[id]
 * Obtiene un rol específico
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error('[API Roles] Error fetching role:', error)
    return NextResponse.json(
      { error: 'Error al obtener rol' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/roles/[id]
 * Actualiza un rol completamente
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, displayName, description, hierarchy, color } = body

    // Buscar rol existente
    const existing = await prisma.role.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 404 }
      )
    }

    // No permitir editar roles del sistema
    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'No se pueden editar roles del sistema' },
        { status: 403 }
      )
    }

    // Validar jerarquía
    if (hierarchy >= 100) {
      return NextResponse.json(
        { error: 'La jerarquía máxima es 99' },
        { status: 400 }
      )
    }

    // Verificar unicidad de nombre si cambió
    if (name && name !== existing.name) {
      const nameExists = await prisma.role.findUnique({ where: { name } })
      if (nameExists) {
        return NextResponse.json(
          { error: 'Ya existe un rol con ese nombre' },
          { status: 400 }
        )
      }
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name: name || existing.name,
        displayName: displayName || existing.displayName,
        description: description !== undefined ? description : existing.description,
        hierarchy: hierarchy !== undefined ? hierarchy : existing.hierarchy,
        color: color !== undefined ? color : existing.color,
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'role.updated',
        entityType: 'Role',
        entityId: role.id,
        userId: null,
        userName: 'SYSTEM',
        details: { 
          before: { name: existing.name, displayName: existing.displayName },
          after: { name: role.name, displayName: role.displayName },
        },
      },
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error('[API Roles] Error updating role:', error)
    return NextResponse.json(
      { error: 'Error al actualizar rol' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/roles/[id]
 * Actualiza parcialmente (ej: toggle isActive)
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.role.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 404 }
      )
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'No se pueden modificar roles del sistema' },
        { status: 403 }
      )
    }

    const role = await prisma.role.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error('[API Roles] Error patching role:', error)
    return NextResponse.json(
      { error: 'Error al actualizar rol' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/roles/[id]
 * Elimina un rol personalizado
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.role.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 404 }
      )
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'No se pueden eliminar roles del sistema' },
        { status: 403 }
      )
    }

    if (existing._count.users > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: hay ${existing._count.users} usuario(s) con este rol` },
        { status: 400 }
      )
    }

    await prisma.role.delete({ where: { id } })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'role.deleted',
        entityType: 'Role',
        entityId: id,
        userId: null,
        userName: 'SYSTEM',
        details: { name: existing.name, displayName: existing.displayName },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Roles] Error deleting role:', error)
    return NextResponse.json(
      { error: 'Error al eliminar rol' },
      { status: 500 }
    )
  }
}
