import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireReadPermission, requireFullPermission } from '@/lib/apiProtection'

/**
 * GET /api/role-permissions
 * Obtiene la matriz de permisos por rol
 * Formato: { roleId: { permissionId: accessLevel } }
 * Require: security.matrix.view (read+)
 */
export async function GET() {
  try {
    // ✅ Verificar permiso de lectura
    const { error } = await requireReadPermission('security.matrix.view')
    if (error) return error

    console.log('[API RolePermissions] Iniciando consulta...')
    
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

    console.log('[API RolePermissions] Permisos encontrados:', rolePermissions.length)

    // Construir matriz { roleId: { permissionId: accessLevel } }
    const matrix: Record<string, Record<string, string>> = {}
    
    for (const rp of rolePermissions) {
      if (!matrix[rp.roleId]) {
        matrix[rp.roleId] = {}
      }
      matrix[rp.roleId][rp.permissionId] = rp.accessLevel
    }

    console.log('[API RolePermissions] Matriz construida con', Object.keys(matrix).length, 'roles')

    return NextResponse.json({
      matrix,
      rolePermissions, // También enviar lista plana para referencia
    })
  } catch (error) {
    console.error('[API RolePermissions] Error fetching matrix:', error)
    return NextResponse.json(
      { error: 'Error al obtener matriz de permisos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/role-permissions
 * Actualiza múltiples permisos de rol en batch
 * Body: { updates: [{ roleId, permissionId, accessLevel }] }
 * Require: security.matrix.manage (full)
 */
export async function PUT(request: Request) {
  try {
    // ✅ Verificar permiso completo
    const { session, error } = await requireFullPermission('security.matrix.manage')
    if (error) return error

    const isSuperAdmin = session!.user.role === 'SUPER_ADMIN'
    
    const body = await request.json()
    const { updates } = body
    
    console.log('[PUT RolePermissions] Received updates:', updates?.length || 0)
    console.log('[PUT RolePermissions] User role:', session!.user.role)
    console.log('[PUT RolePermissions] First update:', updates?.[0])

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates debe ser un array' },
        { status: 400 }
      )
    }

    // Obtener todos los roleIds únicos
    const roleIds = [...new Set(updates.map((u: { roleId: string }) => u.roleId))]

    // Verificar que ningún rol sea del sistema (SOLO si NO es SUPER_ADMIN)
    if (!isSuperAdmin) {
      console.log('[PUT RolePermissions] Checking roles:', roleIds)
      
      const systemRoles = await prisma.role.findMany({
        where: { 
          id: { in: roleIds },
          isSystem: true,
        },
      })
      
      console.log('[PUT RolePermissions] System roles found:', systemRoles.length)

      if (systemRoles.length > 0) {
        return NextResponse.json(
          { error: 'No se pueden modificar permisos de roles del sistema' },
          { status: 403 }
        )
      }
    } else {
      console.log('[PUT RolePermissions] SUPER_ADMIN - Permitiendo modificación de roles del sistema')
    }

    // Procesar updates en paralelo para máxima velocidad
    console.log('[PUT RolePermissions] Processing', updates.length, 'updates in parallel')
    
    // Separar updates en deletes y upserts
    const deletePromises: Promise<any>[] = []
    const upsertPromises: Promise<any>[] = []
    
    for (const update of updates) {
      const { roleId, permissionId, accessLevel } = update

      if (!roleId || !permissionId || !accessLevel) {
        console.log('[PUT RolePermissions] Skipping invalid update:', update)
        continue
      }

      if (accessLevel === 'none') {
        // Eliminar si existe
        deletePromises.push(
          prisma.rolePermissions.deleteMany({
            where: { roleId, permissionId },
          })
        )
      } else {
        // Upsert en paralelo
        upsertPromises.push(
          prisma.rolePermissions.upsert({
            where: {
              roleId_permissionId: { roleId, permissionId },
            },
            update: { accessLevel },
            create: { roleId, permissionId, accessLevel },
          })
        )
      }
    }

    console.log('[PUT RolePermissions] Parallel operations:', { 
      deletes: deletePromises.length, 
      upserts: upsertPromises.length 
    })

    // Ejecutar todas las operaciones en paralelo
    const [deleteResults, upsertResults] = await Promise.all([
      Promise.all(deletePromises),
      Promise.all(upsertPromises),
    ])

    const deletedCount = deleteResults.reduce((sum, r) => sum + (r.count || 0), 0)
    const upsertedCount = upsertResults.length

    console.log('[PUT RolePermissions] Completed:', { 
      deleted: deletedCount, 
      upserted: upsertedCount 
    })

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
          deleted: deletedCount,
          upserted: upsertedCount,
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      deleted: deletedCount,
      upserted: upsertedCount,
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
    // ✅ Verificar permiso completo
    const { session, error } = await requireFullPermission('security.matrix.manage')
    if (error) return error

    const body = await request.json()
    const { roleId, permissionId, accessLevel } = body

    if (!roleId || !permissionId || !accessLevel) {
      return NextResponse.json(
        { error: 'roleId, permissionId y accessLevel son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar rol
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN'

    // Verificar que el rol no sea del sistema (excepto SUPER_ADMIN)
    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (role?.isSystem && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Solo SUPER_ADMIN puede modificar permisos de roles del sistema' },
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
