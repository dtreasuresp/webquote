import prisma from '@/lib/prisma'
import type { Session } from 'next-auth'

/**
 * Verifica si un usuario tiene un permiso específico
 * Primero verifica permisos directos del usuario, luego permisos del rol
 */
export async function hasPermission(
  session: Session | null,
  permissionCode: string
): Promise<boolean> {
  if (!session?.user?.id) return false

  // SUPER_ADMIN siempre tiene todos los permisos
  if (session.user.role === 'SUPER_ADMIN') return true

  try {
    // Buscar el permiso por código
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode },
    })

    if (!permission) return false

    // Obtener el usuario completo con su roleId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { roleId: true, role: true },
    })

    if (!user) return false

    // 1. Verificar permisos directos del usuario (UserPermission)
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: session.user.id,
        permissionId: permission.id,
      },
    })

    if (userPermission) return true

    // 2. Verificar permisos del rol en la tabla NUEVA (RolePermissions)
    if (user.roleId) {
      const rolePermission = await prisma.rolePermissions.findFirst({
        where: {
          roleId: user.roleId,
          permissionId: permission.id,
          // accessLevel puede ser: 'none', 'read', 'write', 'full'
          accessLevel: { not: 'none' },
        },
      })

      if (rolePermission) return true
    }

    return false
  } catch (error) {
    console.error(`[hasPermission] Error verificando permiso ${permissionCode}:`, error)
    return false
  }
}

/**
 * Verifica múltiples permisos a la vez (OR lógico)
 * Retorna true si el usuario tiene AL MENOS UNO de los permisos
 */
export async function hasAnyPermission(
  session: Session | null,
  permissionCodes: string[]
): Promise<boolean> {
  if (!session?.user) return false
  if (session.user.role === 'SUPER_ADMIN') return true

  for (const code of permissionCodes) {
    if (await hasPermission(session, code)) {
      return true
    }
  }

  return false
}

/**
 * Verifica múltiples permisos a la vez (AND lógico)
 * Retorna true si el usuario tiene TODOS los permisos
 */
export async function hasAllPermissions(
  session: Session | null,
  permissionCodes: string[]
): Promise<boolean> {
  if (!session?.user) return false
  if (session.user.role === 'SUPER_ADMIN') return true

  for (const code of permissionCodes) {
    if (!(await hasPermission(session, code))) {
      return false
    }
  }

  return true
}
