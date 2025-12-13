import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'node:crypto'

/**
 * GET /api/user-permissions
 * Lista permisos de usuario con filtros opcionales
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (userId) {
      where.userId = userId
    }

    const userPermissions = await prisma.userPermission.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            email: true,
          },
        },
        Permission: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json(userPermissions)
  } catch (error) {
    console.error('[API UserPermissions] Error fetching:', error)
    return NextResponse.json(
      { error: 'Error al obtener permisos de usuario' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user-permissions
 * Crea un override de permiso para un usuario
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, permissionId, granted } = body

    if (!userId || !permissionId || granted === undefined) {
      return NextResponse.json(
        { error: 'userId, permissionId y granted son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existing = await prisma.userPermission.findFirst({
      where: { userId, permissionId },
    })

    let result
    if (existing) {
      // Actualizar
      result = await prisma.userPermission.update({
        where: { id: existing.id },
        data: { granted },
      })
    } else {
      // Crear
      result = await prisma.userPermission.create({
        data: { 
          id: randomUUID(),
          userId, 
          permissionId, 
          granted 
        },
      })
    }

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: granted ? 'user-permission.granted' : 'user-permission.revoked',
        entityType: 'UserPermission',
        entityId: result.id,
        userId,
        userName: 'SYSTEM',
        details: { permissionId, granted },
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[API UserPermissions] Error creating:', error)
    return NextResponse.json(
      { error: 'Error al crear permiso de usuario' },
      { status: 500 }
    )
  }
}
