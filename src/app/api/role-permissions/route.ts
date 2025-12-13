import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/role-permissions
 * Obtiene la matriz de permisos por rol
 * Formato: { roleId: { permissionId: accessLevel } }
 */
export async function GET() {
  try {
    const rolePermissions = await prisma.rolePermissions.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            isSystem: true,
          },
        },
        permission: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
          },
        },
      },
    })

    // Construir matriz { roleId: { permissionId: accessLevel } }
    const matrix: Record<string, Record<string, string>> = {}
    
    for (const rp of rolePermissions) {
      if (!matrix[rp.roleId]) {
        matrix[rp.roleId] = {}
      }
      matrix[rp.roleId][rp.permissionId] = rp.accessLevel
    }

    return NextResponse.json({
      matrix,
      rolePermissions, // También enviar lista plana para referencia
    })
  } catch (error) {
    console.error('[API RolePermissions] Error fetching matrix:', error)
    return NextResponse.json(
      { error: 'Error al obtener matriz de permisos' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/role-permissions
 * Actualiza múltiples permisos de rol en batch
 * Body: { updates: [{ roleId, permissionId, accessLevel }] }
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates debe ser un array' },
        { status: 400 }
      )
    }

    // Verificar que ningún rol sea del sistema
    const roleIds = [...new Set(updates.map((u: { roleId: string }) => u.roleId))]
    const systemRoles = await prisma.role.findMany({
      where: { 
        id: { in: roleIds },
        isSystem: true,
      },
    })

    if (systemRoles.length > 0) {
      return NextResponse.json(
        { error: 'No se pueden modificar permisos de roles del sistema' },
        { status: 403 }
      )
    }

    // Procesar updates
    const results = []
    
    for (const update of updates) {
      const { roleId, permissionId, accessLevel } = update

      if (!roleId || !permissionId || !accessLevel) {
        continue
      }

      // Verificar si ya existe
      const existing = await prisma.rolePermissions.findUnique({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
      })

      if (accessLevel === 'none') {
        // Si es 'none', eliminar la asociación si existe
        if (existing) {
          await prisma.rolePermissions.delete({
            where: { id: existing.id },
          })
        }
      } else {
        // Upsert
        const result = await prisma.rolePermissions.upsert({
          where: {
            roleId_permissionId: { roleId, permissionId },
          },
          update: { accessLevel },
          create: { roleId, permissionId, accessLevel },
        })
        results.push(result)
      }
    }

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'role-permissions.batch-updated',
        entityType: 'RolePermissions',
        entityId: 'batch',
        userId: null,
        userName: 'SYSTEM',
        details: { 
          count: updates.length,
          roleIds,
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      updated: results.length,
    })
  } catch (error) {
    console.error('[API RolePermissions] Error updating matrix:', error)
    return NextResponse.json(
      { error: 'Error al actualizar matriz de permisos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/role-permissions
 * Crea o actualiza un permiso de rol individual
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roleId, permissionId, accessLevel } = body

    if (!roleId || !permissionId || !accessLevel) {
      return NextResponse.json(
        { error: 'roleId, permissionId y accessLevel son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar que el rol no sea del sistema
    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (role?.isSystem) {
      return NextResponse.json(
        { error: 'No se pueden modificar permisos de roles del sistema' },
        { status: 403 }
      )
    }

    const result = await prisma.rolePermissions.upsert({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
      update: { accessLevel },
      create: { roleId, permissionId, accessLevel },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[API RolePermissions] Error creating:', error)
    return NextResponse.json(
      { error: 'Error al crear permiso de rol' },
      { status: 500 }
    )
  }
}
