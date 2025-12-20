import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission, requireFullPermission } from '@/lib/apiProtection'
import { createAuditLog } from '@/lib/audit/auditHelper'
import { calculateOrganizationLevel, validateHierarchyTransition } from '@/lib/organizationHelper'

/**
 * GET /api/organizations/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireReadPermission('org.view')
  if (error) return error

  try {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        children: true,
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            roleId: true
          }
        }
      }
    })

    if (!org) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(org)
  } catch (error) {
    console.error('[API Organizations GET] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener organización' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/organizations/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireWritePermission('org.update')
  if (error) return error

  try {
    const body = await request.json()
    const { nombre, sector, descripcion, email, telefono, parentId } = body

    // Verificar que existe
    const existing = await prisma.organization.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // Si se intenta cambiar parentId, validar la transición
    if (parentId !== undefined && parentId !== existing.parentId) {
      // Validar que el nuevo padre existe
      if (parentId) {
        const newParent = await prisma.organization.findUnique({
          where: { id: parentId }
        })
        if (!newParent) {
          return NextResponse.json(
            { error: 'Organización padre no existe' },
            { status: 404 }
          )
        }

        // Validar que la transición es válida
        const { valid, reason } = await validateHierarchyTransition(parentId)
        if (!valid) {
          return NextResponse.json(
            { error: reason || 'Transición jerárquica inválida' },
            { status: 400 }
          )
        }

        // Calcular nuevo nivel basado en el nuevo padre
        const newNivel = await calculateOrganizationLevel(parentId)
        
        // Actualizar con nuevo parentId y nivel
        const org = await prisma.organization.update({
          where: { id },
          data: {
            ...(nombre !== undefined && { nombre }),
            ...(sector !== undefined && { sector }),
            ...(descripcion !== undefined && { descripcion }),
            ...(email !== undefined && { email }),
            ...(telefono !== undefined && { telefono }),
            parentId,
            nivel: newNivel,
            updatedBy: session?.user?.id || 'SYSTEM'
          }
        })

        // Auditar cambios
        const cambios = Object.keys(body).filter(key => body[key] !== existing[key as keyof typeof existing])
        
        if (cambios.length > 0) {
          await createAuditLog({
            action: 'ORG_UPDATED',
            entityType: 'ORGANIZATION',
            entityId: org.id,
            actorId: session?.user?.id,
            actorName: session?.user?.username || 'Sistema',
            details: {
              cambios,
              valores: body,
              parentIdChanged: true,
              newParentId: parentId,
              newNivel: newNivel
            },
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            userAgent: request.headers.get('user-agent') || undefined
          })
        }

        return NextResponse.json(org)
      } else {
        // Cambiar a RAIZ (sin padre)
        const org = await prisma.organization.update({
          where: { id },
          data: {
            ...(nombre !== undefined && { nombre }),
            ...(sector !== undefined && { sector }),
            ...(descripcion !== undefined && { descripcion }),
            ...(email !== undefined && { email }),
            ...(telefono !== undefined && { telefono }),
            parentId: null,
            nivel: 'RAIZ',
            updatedBy: session?.user?.id || 'SYSTEM'
          }
        })

        // Auditar cambios
        const cambios = Object.keys(body).filter(key => body[key] !== existing[key as keyof typeof existing])
        
        if (cambios.length > 0) {
          await createAuditLog({
            action: 'ORG_UPDATED',
            entityType: 'ORGANIZATION',
            entityId: org.id,
            actorId: session?.user?.id,
            actorName: session?.user?.username || 'Sistema',
            details: {
              cambios,
              valores: body,
              parentIdChanged: true,
              newParentId: null,
              newNivel: 'RAIZ'
            },
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            userAgent: request.headers.get('user-agent') || undefined
          })
        }

        return NextResponse.json(org)
      }
    }

    // Actualizar sin cambiar parentId
    const org = await prisma.organization.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(sector !== undefined && { sector }),
        ...(descripcion !== undefined && { descripcion }),
        ...(email !== undefined && { email }),
        ...(telefono !== undefined && { telefono }),
        updatedBy: session?.user?.id || 'SYSTEM'
      }
    })

    // Auditar cambios
    const cambios = Object.keys(body).filter(key => body[key] !== existing[key as keyof typeof existing])
    
    if (cambios.length > 0) {
      await createAuditLog({
        action: 'ORG_UPDATED',
        entityType: 'ORGANIZATION',
        entityId: org.id,
        actorId: session?.user?.id,
        actorName: session?.user?.username || 'Sistema',
        details: {
          cambios,
          valores: body
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      })
    }

    return NextResponse.json(org)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[API Organizations PUT] Error:', errorMessage, error)
    return NextResponse.json(
      { error: errorMessage || 'Error al actualizar organización' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organizations/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { session, error } = await requireFullPermission('org.delete')
  if (error) return error

  try {
    // Verificar existencia
    const existing = await prisma.organization.findUnique({
      where: { id },
      include: { children: true, users: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // No permitir eliminar si tiene hijos o usuarios
    if (existing.children.length > 0 || existing.users.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar. La organización tiene hijos o usuarios asignados.' },
        { status: 409 }
      )
    }

    // Eliminar
    await prisma.organization.delete({
      where: { id }
    })

    // Auditar eliminación
    await createAuditLog({
      action: 'ORG_DELETED',
      entityType: 'ORGANIZATION',
      entityId: id,
      actorId: session?.user?.id,
      actorName: session?.user?.username || 'Sistema',
      details: {
        nombre: existing.nombre,
        sector: existing.sector
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Organizations DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar organización' },
      { status: 500 }
    )
  }
}
