import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'

/**
 * GET /api/permissions
 * Lista todos los permisos
 * Requiere: security.permissions.view (read)
 */
export async function GET() {
  // Protección: Requiere permiso de lectura de permisos
  const { error } = await requireReadPermission('security.permissions.view')
  if (error) return error

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('[API Permissions] Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Error al obtener permisos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/permissions
 * Crea un nuevo permiso
 * Requiere: security.permissions.create (write) - Solo SUPER_ADMIN
 */
export async function POST(request: Request) {
  // Protección: Requiere permiso de escritura para crear permisos
  const { session, error } = await requireWritePermission('security.permissions.create')
  if (error) return error

  try {
    const body = await request.json()
    const { code, name, description, category } = body

    // Validaciones
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Código y nombre son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existing = await prisma.permission.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un permiso con ese código' },
        { status: 400 }
      )
    }

    const permission = await prisma.permission.create({
      data: {
        code,
        name,
        description: description || null,
        category: category || 'general',
        isSystem: false, // Los permisos creados por usuario no son del sistema
      },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'permission.created',
        entityType: 'Permission',
        entityId: permission.id,
        userId: session.user.id,
        userName: session.user.nombre || session.user.username || session.user.email || 'SYSTEM',
        details: { code: permission.code, name: permission.name, category: permission.category },
      },
    })

    return NextResponse.json(permission, { status: 201 })
  } catch (error) {
    console.error('[API Permissions] Error creating permission:', error)
    return NextResponse.json(
      { error: 'Error al crear permiso' },
      { status: 500 }
    )
  }
}
