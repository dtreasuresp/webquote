/**
 * Helpers para proteger API Routes con validación de permisos
 * 
 * Estos helpers simplifican la implementación de seguridad en API routes
 * proporcionando validación automática de sesión, permisos y Access Levels.
 * 
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const { session, error } = await requirePermission('users.view')
 *   if (error) return error
 *   
 *   // Código protegido - usuario tiene permiso
 *   const users = await prisma.user.findMany()
 *   return NextResponse.json({ users })
 * }
 * ```
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission, getAccessLevel, type AccessLevel } from '@/lib/permissions'

// ==================== TIPOS ====================
// NOTE: Usamos una unión discriminada por `error` para que TypeScript
// pueda inferir que `session` NO es null cuando `error` es null.
export type ProtectedRouteResult =
  | { session: Session; error: null }
  | { session: Session | null; error: NextResponse }

export type PermissionCheckResult =
  | { session: Session; accessLevel?: AccessLevel; error: null }
  | { session: Session | null; accessLevel?: AccessLevel; error: NextResponse }

export interface ProtectedRouteOptions {
  /** Mensaje de error personalizado para 401 */
  unauthorizedMessage?: string
  /** Mensaje de error personalizado para 403 */
  forbiddenMessage?: string
  /** Nivel de acceso mínimo requerido */
  requireAccessLevel?: AccessLevel
  /** Si true, permite SUPER_ADMIN sin verificar permisos */
  allowSuperAdmin?: boolean
}

// ==================== CONSTANTES ====================

const DEFAULT_UNAUTHORIZED_MESSAGE = 'No autenticado. Por favor inicie sesión.'
const DEFAULT_FORBIDDEN_MESSAGE = 'No tiene permisos para realizar esta operación.'

// ==================== HELPERS PRINCIPALES ====================

/**
 * Verifica que el usuario esté autenticado
 * Retorna sesión o error 401
 */
export async function requireAuth(
  options?: Pick<ProtectedRouteOptions, 'unauthorizedMessage'>
): Promise<ProtectedRouteResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { 
          success: false, 
          error: options?.unauthorizedMessage || DEFAULT_UNAUTHORIZED_MESSAGE 
        },
        { status: 401 }
      ),
    }
  }

  return {
    session,
    error: null,
  }
}

/**
 * Verifica que el usuario tenga un rol específico
 * Retorna sesión o error 403
 */
export async function requireRole(
  allowedRoles: string | string[],
  options?: Pick<ProtectedRouteOptions, 'unauthorizedMessage' | 'forbiddenMessage'>
): Promise<ProtectedRouteResult> {
  const { session, error } = await requireAuth(options)
  if (error) return { session: null, error }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  if (!session?.user.role || !roles.includes(session.user.role)) {
    return {
      session,
      error: NextResponse.json(
        { 
          success: false, 
          error: options?.forbiddenMessage || DEFAULT_FORBIDDEN_MESSAGE,
          details: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`
        },
        { status: 403 }
      ),
    }
  }

  return {
    session,
    error: null,
  }
}

/**
 * Verifica que el usuario tenga un permiso específico con AccessLevel
 * Retorna sesión, accessLevel o error 403
 */
export async function requirePermission(
  permissionCode: string,
  options?: ProtectedRouteOptions
): Promise<PermissionCheckResult> {
  const { session, error } = await requireAuth(options)
  if (error) return { session: null, error }

  const {
    requireAccessLevel = 'read',
    allowSuperAdmin = true,
    forbiddenMessage,
  } = options || {}

  // Verificar permiso con Access Level
  const hasRequiredPermission = await hasPermission(session, permissionCode, {
    requireAccessLevel,
    allowSuperAdmin,
  })

  if (!hasRequiredPermission) {
    const accessLevel = await getAccessLevel(session, permissionCode)
    
    return {
      session,
      accessLevel,
      error: NextResponse.json(
        { 
          success: false, 
          error: forbiddenMessage || DEFAULT_FORBIDDEN_MESSAGE,
          details: {
            required: permissionCode,
            requiredLevel: requireAccessLevel,
            currentLevel: accessLevel,
          }
        },
        { status: 403 }
      ),
    }
  }

  const accessLevel = await getAccessLevel(session, permissionCode)

  return {
    session,
    accessLevel,
    error: null,
  }
}

/**
 * Verifica que el usuario tenga AL MENOS UNO de los permisos especificados
 */
export async function requireAnyPermission(
  permissionCodes: string[],
  options?: ProtectedRouteOptions
): Promise<PermissionCheckResult> {
  const { session, error } = await requireAuth(options)
  if (error) return { session: null, error }

  const {
    requireAccessLevel = 'read',
    allowSuperAdmin = true,
    forbiddenMessage,
  } = options || {}

  // Verificar si tiene al menos uno de los permisos
  for (const code of permissionCodes) {
    const hasRequiredPermission = await hasPermission(session, code, {
      requireAccessLevel,
      allowSuperAdmin,
    })

    if (hasRequiredPermission) {
      const accessLevel = await getAccessLevel(session, code)
      return {
        session,
        accessLevel,
        error: null,
      }
    }
  }

  // No tiene ninguno de los permisos requeridos
  return {
    session,
    error: NextResponse.json(
      { 
        success: false, 
        error: forbiddenMessage || DEFAULT_FORBIDDEN_MESSAGE,
        details: {
          required: `Uno de: ${permissionCodes.join(', ')}`,
          requiredLevel: requireAccessLevel,
        }
      },
      { status: 403 }
    ),
  }
}

/**
 * Verifica que el usuario tenga TODOS los permisos especificados
 */
export async function requireAllPermissions(
  permissionCodes: string[],
  options?: ProtectedRouteOptions
): Promise<PermissionCheckResult> {
  const { session, error } = await requireAuth(options)
  if (error) return { session: null, error }

  const {
    requireAccessLevel = 'read',
    allowSuperAdmin = true,
    forbiddenMessage,
  } = options || {}

  // Verificar que tenga todos los permisos
  const missingPermissions: string[] = []

  for (const code of permissionCodes) {
    const hasRequiredPermission = await hasPermission(session, code, {
      requireAccessLevel,
      allowSuperAdmin,
    })

    if (!hasRequiredPermission) {
      missingPermissions.push(code)
    }
  }

  if (missingPermissions.length > 0) {
    return {
      session,
      error: NextResponse.json(
        { 
          success: false, 
          error: forbiddenMessage || DEFAULT_FORBIDDEN_MESSAGE,
          details: {
            required: permissionCodes,
            missing: missingPermissions,
            requiredLevel: requireAccessLevel,
          }
        },
        { status: 403 }
      ),
    }
  }

  return {
    session,
    error: null,
  }
}

// ==================== HELPERS DE CONVENIENCIA ====================

/**
 * Verifica permiso de solo lectura (read+)
 */
export async function requireReadPermission(
  permissionCode: string,
  options?: Omit<ProtectedRouteOptions, 'requireAccessLevel'>
): Promise<PermissionCheckResult> {
  return requirePermission(permissionCode, {
    ...options,
    requireAccessLevel: 'read',
  })
}

/**
 * Verifica permiso de escritura (write+)
 */
export async function requireWritePermission(
  permissionCode: string,
  options?: Omit<ProtectedRouteOptions, 'requireAccessLevel'>
): Promise<PermissionCheckResult> {
  return requirePermission(permissionCode, {
    ...options,
    requireAccessLevel: 'write',
  })
}

/**
 * Verifica permiso completo (full)
 */
export async function requireFullPermission(
  permissionCode: string,
  options?: Omit<ProtectedRouteOptions, 'requireAccessLevel'>
): Promise<PermissionCheckResult> {
  return requirePermission(permissionCode, {
    ...options,
    requireAccessLevel: 'full',
  })
}

// ==================== TIPOS DE AUDITORÍA ====================

export interface AuditLogData {
  userId: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Registra una acción en el log de auditoría
 * NOTA: Implementación pendiente de modelo AuditLog en Prisma
 */
export async function logAuditAction(data: AuditLogData): Promise<void> {
  try {
    // TODO: Implementar cuando esté el modelo AuditLog en Prisma
    console.log('[AUDIT]', {
      timestamp: new Date().toISOString(),
      ...data,
    })
  } catch (error) {
    console.error('[AUDIT] Error registrando acción:', error)
  }
}
