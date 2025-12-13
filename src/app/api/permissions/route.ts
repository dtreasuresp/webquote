import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/permissions
 * Lista todos los permisos
 */
export async function GET() {
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
 */
export async function POST(request: Request) {
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
        userName: 'SYSTEM',
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
