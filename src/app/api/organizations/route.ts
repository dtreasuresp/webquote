import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'
import { createAuditLog } from '@/lib/audit/auditHelper'
import { calculateOrganizationLevel, validateHierarchyTransition } from '@/lib/organizationHelper'

/**
 * GET /api/organizations
 * Lista organizaciones con jerarquía opcional
 */
export async function GET(request: NextRequest) {
  const { session, error } = await requireReadPermission('org.view')
  if (error) return error

  try {
    const searchParams = new URL(request.url).searchParams
    const includeHierarchy = searchParams.get('includeHierarchy') === 'true'

    if (includeHierarchy) {
      // Obtener solo raíces con conteos
      const roots = await prisma.organization.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              children: {
                include: {
                  _count: {
                    select: {
                      users: true,
                      quotations: true
                    }
                  }
                }
              },
              _count: {
                select: {
                  users: true,
                  quotations: true
                }
              }
            }
          },
          _count: {
            select: {
              users: true,
              quotations: true
            }
          }
        },
        orderBy: { nombre: 'asc' }
      })
      return NextResponse.json(roots)
    }

    // Lista plana con conteos
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            quotations: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    })
    return NextResponse.json(orgs)
  } catch (error) {
    console.error('[API Organizations] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener organizaciones' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations
 * Crea nueva organización
 */
export async function POST(request: NextRequest) {
  const { session, error, accessLevel } = await requireWritePermission('org.create')
  if (error) return error

  try {
    const body = await request.json()
    const { nombre, sector, descripcion, parentId, email, telefono } = body

    // Validaciones
    if (!nombre?.trim()) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    if (!sector?.trim()) {
      return NextResponse.json(
        { error: 'Sector requerido' },
        { status: 400 }
      )
    }

    // Validar parent si existe
    if (parentId) {
      const parent = await prisma.organization.findUnique({
        where: { id: parentId }
      })
      if (!parent) {
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
    }

    // Calcular nivel automáticamente
    const nivel = await calculateOrganizationLevel(parentId)

    // Crear organización
    const org = await prisma.organization.create({
      data: {
        nombre,
        sector,
        descripcion,
        parentId,
        email,
        telefono,
        nivel,
        createdBy: session?.user?.id || 'SYSTEM',
        updatedBy: session?.user?.id || 'SYSTEM'
      }
    })

    // Auditar creación
    await createAuditLog({
      action: 'ORG_CREATED',
      entityType: 'ORGANIZATION',
      entityId: org.id,
      actorId: session?.user?.id,
      actorName: session?.user?.username || 'Sistema',
      details: {
        nombre: org.nombre,
        sector: org.sector,
        parentId: org.parentId
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined
    })

    return NextResponse.json(org, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[API Organizations POST] Error:', errorMessage, error)
    return NextResponse.json(
      { error: errorMessage || 'Error al crear organización' },
      { status: 500 }
    )
  }
}
