/**
 * Hook para cargar permisos de usuario con caché
 * 
 * Este hook se encarga de:
 * 1. Intentar obtener permisos desde localStorage (caché)
 * 2. Si no hay caché o expiró, hacer fetch a la API
 * 3. Almacenar resultado en caché para futuras llamadas
 * 4. Proporcionar función para invalidar caché
 * 
 * @module usePermissionLoader
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  getCachedPermissions, 
  setCachedPermissions, 
  invalidateCache 
} from '@/lib/permissionsCache'

export interface UserPermissions {
  permissions: Array<{ code: string; accessLevel: string }>
  role: string
  userId: string
}

export interface UsePermissionLoaderResult {
  /** Permisos del usuario */
  permissions: UserPermissions | null
  /** Está cargando permisos */
  isLoading: boolean
  /** Error al cargar permisos */
  error: Error | null
  /** Función para recargar permisos (invalida caché) */
  reload: () => Promise<void>
  /** Función para invalidar caché sin recargar */
  clearCache: () => void
}

/**
 * Hook para cargar permisos de usuario con sistema de caché
 * 
 * @param resourceCode - Código del recurso (opcional). Si se omite, carga todos los permisos
 * @param options - Opciones de configuración
 * @returns Estado de carga de permisos con funciones de control
 * 
 * @example
 * ```tsx
 * function UserManagement() {
 *   const { permissions, isLoading, reload } = usePermissionLoader('users')
 *   
 *   if (isLoading) return <Spinner />
 *   if (!permissions?.permissions.some(p => p.code === 'users.view')) {
 *     return <AccessDenied />
 *   }
 *   
 *   return <UserList onPermissionChange={reload} />
 * }
 * ```
 */
export function usePermissionLoader(
  resourceCode?: string,
  options: {
    /** Deshabilitar caché para este hook */
    skipCache?: boolean
    /** Auto-recargar permisos al montar */
    autoLoad?: boolean
  } = {}
): UsePermissionLoaderResult {
  const { skipCache = false, autoLoad = true } = options
  const { data: session } = useSession()
  
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Carga permisos desde API o caché
   */
  const loadPermissions = useCallback(async (forceReload = false) => {
    if (!session?.user?.id) {
      setPermissions(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const cacheKey = resourceCode || 'all'
      
      // Intentar obtener desde caché si no está forzando recarga
      if (!forceReload && !skipCache) {
        const cached = getCachedPermissions(cacheKey, session.user.id)
        if (cached) {
          setPermissions(cached)
          setIsLoading(false)
          return
        }
      }

      // Fetch desde API
      const url = resourceCode 
        ? `/api/user-permissions?resource=${resourceCode}`
        : '/api/user-permissions'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error desconocido al cargar permisos')
      }

      const permissionsData: UserPermissions = {
        permissions: data.permissions || [],
        role: data.role || session.user.role || 'CLIENT',
        userId: session.user.id
      }

      setPermissions(permissionsData)

      // Guardar en caché si no está deshabilitado
      if (!skipCache) {
        setCachedPermissions(cacheKey, session.user.id, permissionsData)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      console.error('[usePermissionLoader] Error loading permissions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session, resourceCode, skipCache])

  /**
   * Recarga permisos (invalida caché y hace fetch nuevo)
   */
  const reload = useCallback(async () => {
    const cacheKey = resourceCode || 'all'
    invalidateCache(cacheKey)
    await loadPermissions(true)
  }, [loadPermissions, resourceCode])

  /**
   * Limpia caché sin recargar
   */
  const clearCache = useCallback(() => {
    const cacheKey = resourceCode || 'all'
    invalidateCache(cacheKey)
  }, [resourceCode])

  // Auto-cargar permisos al montar si autoLoad está habilitado
  useEffect(() => {
    if (autoLoad && session?.user?.id) {
      loadPermissions()
    }
  }, [session?.user?.id, autoLoad]) // Solo ejecutar cuando cambie el userId

  return {
    permissions,
    isLoading,
    error,
    reload,
    clearCache
  }
}

/**
 * Hook simplificado para verificar si usuario tiene un permiso específico
 * Usa caché automáticamente
 * 
 * @param permissionCode - Código completo del permiso (ej: 'users.view', 'logs.export')
 * @returns Si el usuario tiene el permiso
 * 
 * @example
 * ```tsx
 * function DeleteButton({ userId }) {
 *   const canDelete = useHasPermission('users.delete')
 *   
 *   if (!canDelete) return null
 *   return <Button onClick={() => deleteUser(userId)}>Eliminar</Button>
 * }
 * ```
 */
export function useHasPermission(permissionCode: string): boolean {
  const { data: session } = useSession()
  const [resourceCode] = permissionCode.split('.')
  const { permissions } = usePermissionLoader(resourceCode)

  if (session?.user?.role === 'SUPER_ADMIN') return true
  if (!permissions) return false

  return permissions.permissions.some(p => p.code === permissionCode)
}

/**
 * Hook para invalidar caché globalmente
 * Útil después de cambios en permisos/roles
 * 
 * @example
 * ```tsx
 * function RoleManager() {
 *   const { invalidateAllPermissions } = usePermissionCacheManager()
 *   
 *   async function updateRole(roleId: string) {
 *     await updateRoleAPI(roleId)
 *     invalidateAllPermissions() // Limpia caché de todos los usuarios
 *   }
 * }
 * ```
 */
export function usePermissionCacheManager() {
  const invalidateAllPermissions = useCallback(() => {
    invalidateCache() // Sin parámetro = invalida todos
  }, [])

  const invalidateResourcePermissions = useCallback((resourceCode: string) => {
    invalidateCache(resourceCode)
  }, [])

  return {
    invalidateAllPermissions,
    invalidateResourcePermissions
  }
}
