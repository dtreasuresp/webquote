/**
 * Hook mejorado para verificar permisos con Access Levels
 * 
 * Este hook proporciona información detallada sobre los permisos del usuario
 * incluyendo el AccessLevel (none, read, write, full) y operaciones permitidas.
 * 
 * @example
 * ```tsx
 * const userPerms = usePermission('users')
 * 
 * if (!userPerms.canView) return <AccessDenied />
 * 
 * return (
 *   <div>
 *     <UserList />
 *     {userPerms.canCreate && <Button>Crear</Button>}
 *     {userPerms.canEdit && <Button>Editar</Button>}
 *     {userPerms.canDelete && <Button>Eliminar</Button>}
 *   </div>
 * )
 * ```
 */

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

// ==================== TIPOS ====================

export type AccessLevel = 'none' | 'read' | 'write' | 'full'

export interface PermissionInfo {
  /** Usuario autenticado */
  isAuthenticated: boolean
  /** Cargando estado de sesión */
  isLoading: boolean
  /** Usuario es SUPER_ADMIN */
  isSuperAdmin: boolean
  /** Rol del usuario */
  userRole: string | undefined
  
  // Access Level
  /** Nivel de acceso actual (none, read, write, full) */
  accessLevel: AccessLevel
  
  // Operaciones básicas
  /** Puede ver el recurso (read+) */
  canView: boolean
  /** Puede crear nuevos recursos (write+) */
  canCreate: boolean
  /** Puede editar recursos existentes (write+) */
  canEdit: boolean
  /** Puede eliminar recursos (full) */
  canDelete: boolean
  
  // Operaciones avanzadas
  /** Puede exportar datos (read+) */
  canExport: boolean
  /** Puede importar datos (write+) */
  canImport: boolean
  /** Puede asignar recursos (write+) */
  canAssign: boolean
  /** Puede desasignar recursos (write+) */
  canUnassign: boolean
  /** Puede restaurar recursos eliminados (write+) */
  canRestore: boolean
  /** Puede gestionar configuración avanzada (full) */
  canManage: boolean
  
  // Operaciones de acceso
  /** Puede ver recursos propios */
  canViewOwn: boolean
  /** Puede ver todos los recursos */
  canViewAll: boolean
  
  /** Lista de todos los permisos del usuario */
  allPermissions: string[]
}

// ==================== HELPERS ====================

/**
 * Convierte código de permiso + operación a código completo
 * Ej: 'users' + 'view' → 'users.view'
 */
function buildPermissionCode(resource: string, operation: string): string {
  return `${resource}.${operation}`
}

/**
 * Verifica si el usuario tiene un permiso específico en su lista
 */
function hasPermissionInList(
  permissions: Array<string | { code: string; granted?: boolean }>,
  permissionCode: string
): boolean {
  return permissions.some(permission => {
    if (typeof permission === 'string') {
      return permission === permissionCode
    }
    if (permission && typeof permission === 'object' && 'code' in permission) {
      return permission.code === permissionCode && permission.granted !== false
    }
    return false
  })
}

/**
 * Determina el AccessLevel basándose en los permisos del usuario
 * Sigue jerarquía: none < read < write < full
 */
function determineAccessLevel(
  permissions: Array<string | { code: string; granted?: boolean }>,
  resource: string,
  isSuperAdmin: boolean
): AccessLevel {
  if (isSuperAdmin) return 'full'

  // Verificar operaciones clave para determinar nivel
  const hasView = hasPermissionInList(permissions, `${resource}.view`) ||
                  hasPermissionInList(permissions, `${resource}.view_own`)
  const hasEdit = hasPermissionInList(permissions, `${resource}.edit`)
  const hasDelete = hasPermissionInList(permissions, `${resource}.delete`)
  const hasManage = hasPermissionInList(permissions, `${resource}.manage`)

  // Determinar nivel según operaciones disponibles
  if (hasManage || hasDelete) return 'full'
  if (hasEdit) return 'write'
  if (hasView) return 'read'
  
  return 'none'
}

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook para obtener información detallada de permisos sobre un recurso
 * 
 * @param resource - Código del recurso (ej: 'users', 'quotations', 'packages')
 * @returns Objeto con información completa de permisos y operaciones permitidas
 */
export function usePermission(resource: string): PermissionInfo {
  const { data: session, status } = useSession()

  return useMemo(() => {
    const isLoading = status === 'loading'
    const isAuthenticated = status === 'authenticated' && !!session?.user
    const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
    const userRole = session?.user?.role
    const userPermissions = session?.user?.permissions || []

    // Si no está autenticado, retornar sin permisos
    if (!isAuthenticated) {
      return {
        isAuthenticated: false,
        isLoading,
        isSuperAdmin: false,
        userRole: undefined,
        accessLevel: 'none' as AccessLevel,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canImport: false,
        canAssign: false,
        canUnassign: false,
        canRestore: false,
        canManage: false,
        canViewOwn: false,
        canViewAll: false,
        allPermissions: [],
      }
    }

    // Determinar AccessLevel
    const accessLevel = determineAccessLevel(userPermissions, resource, isSuperAdmin)

    // Helper para verificar permisos individuales
    const hasPerm = (operation: string) => {
      if (isSuperAdmin) return true
      return hasPermissionInList(userPermissions, buildPermissionCode(resource, operation))
    }

    // Calcular operaciones permitidas
    const canView = hasPerm('view') || hasPerm('view_own') || hasPerm('view_all')
    const canViewOwn = hasPerm('view_own')
    const canViewAll = hasPerm('view_all') || hasPerm('view')
    const canCreate = hasPerm('create')
    const canEdit = hasPerm('edit')
    const canDelete = hasPerm('delete')
    const canExport = hasPerm('export') || canView // Por defecto, si puede ver, puede exportar
    const canImport = hasPerm('import')
    const canAssign = hasPerm('assign')
    const canUnassign = hasPerm('unassign')
    const canRestore = hasPerm('restore')
    const canManage = hasPerm('manage')

    // Extraer lista plana de todos los permisos
    const allPermissions = userPermissions
      .map(p => (typeof p === 'string' ? p : p.code))
      .filter(Boolean) as string[]

    return {
      isAuthenticated,
      isLoading,
      isSuperAdmin,
      userRole,
      accessLevel,
      canView,
      canCreate,
      canEdit,
      canDelete,
      canExport,
      canImport,
      canAssign,
      canUnassign,
      canRestore,
      canManage,
      canViewOwn,
      canViewAll,
      allPermissions,
    }
  }, [session, status, resource])
}

/**
 * Hook para verificar múltiples recursos a la vez
 * Útil cuando un componente necesita validar permisos sobre varios recursos
 * 
 * @param resources - Array de códigos de recursos
 * @returns Objeto con información de permisos por recurso
 * 
 * @example
 * ```tsx
 * const perms = useMultiplePermissions(['users', 'roles', 'permissions'])
 * if (!perms.users.canView) return <AccessDenied />
 * ```
 */
export function useMultiplePermissions(
  resources: string[]
): Record<string, PermissionInfo> {
  const { data: session, status } = useSession()

  return useMemo(() => {
    const result: Record<string, PermissionInfo> = {}
    
    resources.forEach(resource => {
      const isLoading = status === 'loading'
      const isAuthenticated = status === 'authenticated' && !!session?.user
      const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
      const userRole = session?.user?.role
      const userPermissions = session?.user?.permissions || []

      if (!isAuthenticated) {
        result[resource] = {
          isAuthenticated: false,
          isLoading,
          isSuperAdmin: false,
          userRole: undefined,
          accessLevel: 'none' as AccessLevel,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
          canImport: false,
          canAssign: false,
          canUnassign: false,
          canRestore: false,
          canManage: false,
          canViewOwn: false,
          canViewAll: false,
          allPermissions: [],
        }
        return
      }

      const accessLevel = determineAccessLevel(userPermissions, resource, isSuperAdmin)
      const hasPerm = (operation: string) => {
        if (isSuperAdmin) return true
        return hasPermissionInList(userPermissions, buildPermissionCode(resource, operation))
      }

      const canView = hasPerm('view') || hasPerm('view_own') || hasPerm('view_all')
      const canViewOwn = hasPerm('view_own')
      const canViewAll = hasPerm('view_all') || hasPerm('view')

      result[resource] = {
        isAuthenticated,
        isLoading,
        isSuperAdmin,
        userRole,
        accessLevel,
        canView,
        canCreate: hasPerm('create'),
        canEdit: hasPerm('edit'),
        canDelete: hasPerm('delete'),
        canExport: hasPerm('export') || canView,
        canImport: hasPerm('import'),
        canAssign: hasPerm('assign'),
        canUnassign: hasPerm('unassign'),
        canRestore: hasPerm('restore'),
        canManage: hasPerm('manage'),
        canViewOwn,
        canViewAll,
        allPermissions: userPermissions
          .map(p => (typeof p === 'string' ? p : p.code))
          .filter(Boolean) as string[],
      }
    })

    return result
  }, [session, status, resources])
}

export default usePermission
