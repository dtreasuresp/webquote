import prisma from '@/lib/prisma'
import type { Session } from 'next-auth'

// ==================== TIPOS ====================

export type AccessLevel = 'none' | 'read' | 'write' | 'full'

export interface PermissionCheckOptions {
  /**
   * Nivel de acceso mínimo requerido
   * Si se especifica, verifica que el usuario tenga AL MENOS este nivel
   */
  requireAccessLevel?: AccessLevel
  
  /**
   * Función para verificar propiedad del recurso
   * Útil para validar que el usuario solo modifique sus propios recursos
   */
  checkOwnership?: (resource: any) => boolean | Promise<boolean>
  
  /**
   * Si true, SUPER_ADMIN bypassa todas las validaciones (default: true)
   */
  allowSuperAdmin?: boolean
}

export interface PermissionWithLevel {
  hasPermission: boolean
  accessLevel: AccessLevel | null
  canRead: boolean
  canWrite: boolean
  canFull: boolean
}

// ==================== HELPERS INTERNOS ====================

/**
 * Convierte un AccessLevel a valor numérico para comparaciones
 * none=0, read=1, write=2, full=3
 */
function accessLevelToNumber(level: AccessLevel): number {
  const map: Record<AccessLevel, number> = {
    none: 0,
    read: 1,
    write: 2,
    full: 3,
  }
  return map[level] || 0
}

/**
 * Verifica si un AccessLevel cumple con el nivel mínimo requerido
 */
function meetsAccessLevel(
  currentLevel: AccessLevel,
  requiredLevel: AccessLevel
): boolean {
  return accessLevelToNumber(currentLevel) >= accessLevelToNumber(requiredLevel)
}

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Obtiene el AccessLevel de un usuario para un permiso específico
 * Retorna el nivel más alto entre permisos directos y permisos de rol
 */
export async function getAccessLevel(
  session: Session | null,
  permissionCode: string
): Promise<AccessLevel> {
  if (!session?.user?.id) return 'none'
  
  // SUPER_ADMIN siempre tiene acceso completo
  if (session.user.role === 'SUPER_ADMIN') return 'full'

  try {
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode },
    })

    if (!permission) return 'none'

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { roleId: true },
    })

    if (!user) return 'none'

    // Buscar en permisos directos (UserPermission no tiene accessLevel, asume 'full')
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: session.user.id,
        permissionId: permission.id,
      },
    })

    if (userPermission) return 'full'

    // Buscar en permisos de rol (RolePermissions)
    if (user.roleId) {
      const rolePermission = await prisma.rolePermissions.findFirst({
        where: {
          roleId: user.roleId,
          permissionId: permission.id,
        },
      })

      if (rolePermission) {
        return rolePermission.accessLevel as AccessLevel
      }
    }

    return 'none'
  } catch (error) {
    console.error(`[getAccessLevel] Error obteniendo nivel de acceso para ${permissionCode}:`, error)
    return 'none'
  }
}

/**
 * Verifica si un usuario tiene un permiso específico con AccessLevel
 * @param session - Sesión del usuario
 * @param permissionCode - Código del permiso (ej: 'users.edit')
 * @param options - Opciones de validación (AccessLevel mínimo, ownership, etc.)
 */
export async function hasPermission(
  session: Session | null,
  permissionCode: string,
  options?: PermissionCheckOptions
): Promise<boolean> {
  if (!session?.user?.id) return false

  const { 
    requireAccessLevel = 'read', 
    checkOwnership,
    allowSuperAdmin = true 
  } = options || {}

  // SUPER_ADMIN siempre tiene todos los permisos (a menos que se desactive)
  if (allowSuperAdmin && session.user.role === 'SUPER_ADMIN') return true

  try {
    // Obtener el AccessLevel actual del usuario para este permiso
    const currentLevel = await getAccessLevel(session, permissionCode)

    // Verificar que cumpla con el nivel mínimo requerido
    if (!meetsAccessLevel(currentLevel, requireAccessLevel)) {
      return false
    }

    // Si hay validación de propiedad, ejecutarla
    if (checkOwnership && typeof checkOwnership === 'function') {
      const ownershipResult = await Promise.resolve(checkOwnership(null))
      if (!ownershipResult) return false
    }

    return true
  } catch (error) {
    console.error(`[hasPermission] Error verificando permiso ${permissionCode}:`, error)
    return false
  }
}

/**
 * Obtiene información completa del permiso incluyendo AccessLevel
 * Útil para decisiones complejas en la UI
 */
export async function getPermissionInfo(
  session: Session | null,
  permissionCode: string
): Promise<PermissionWithLevel> {
  const accessLevel = await getAccessLevel(session, permissionCode)
  
  return {
    hasPermission: accessLevel !== 'none',
    accessLevel: accessLevel !== 'none' ? accessLevel : null,
    canRead: meetsAccessLevel(accessLevel, 'read'),
    canWrite: meetsAccessLevel(accessLevel, 'write'),
    canFull: accessLevel === 'full',
  }
}

/**
 * Verifica múltiples permisos a la vez (OR lógico)
 * Retorna true si el usuario tiene AL MENOS UNO de los permisos con el nivel requerido
 */
export async function hasAnyPermission(
  session: Session | null,
  permissionCodes: string[],
  options?: PermissionCheckOptions
): Promise<boolean> {
  if (!session?.user) return false
  
  const { allowSuperAdmin = true } = options || {}
  if (allowSuperAdmin && session.user.role === 'SUPER_ADMIN') return true

  for (const code of permissionCodes) {
    if (await hasPermission(session, code, options)) {
      return true
    }
  }

  return false
}

/**
 * Verifica múltiples permisos a la vez (AND lógico)
 * Retorna true si el usuario tiene TODOS los permisos con el nivel requerido
 */
export async function hasAllPermissions(
  session: Session | null,
  permissionCodes: string[],
  options?: PermissionCheckOptions
): Promise<boolean> {
  if (!session?.user) return false
  
  const { allowSuperAdmin = true } = options || {}
  if (allowSuperAdmin && session.user.role === 'SUPER_ADMIN') return true

  for (const code of permissionCodes) {
    if (!(await hasPermission(session, code, options))) {
      return false
    }
  }

  return true
}
