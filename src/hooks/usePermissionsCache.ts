/**
 * Hook para usar el sistema de caché de permisos
 * Simplifica el acceso al caché desde componentes
 * 
 * @example
 * ```tsx
 * const { getCached, setCached, invalidate } = usePermissionsCache()
 * 
 * // En useEffect o manejador:
 * const cached = getCached('users', userId)
 * if (!cached) {
 *   const perms = await fetchPermissions('users')
 *   setCached('users', userId, perms)
 * }
 * ```
 */

import React, { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  getCachedPermissions,
  setCachedPermissions,
  invalidateCache,
  cleanExpiredCache,
  getCacheStats,
} from '@/lib/permissionsCache'

export interface UsePermissionsCacheResult {
  /** Obtiene permisos del caché si son válidos */
  getCached: (resourceCode: string) => any | null
  
  /** Almacena permisos en caché */
  setCached: (resourceCode: string, permissions: any) => void
  
  /** Invalida el caché de un recurso específico o todo si no especifica */
  invalidate: (resourceCode?: string) => void
  
  /** Limpia entradas expiradas del caché */
  cleanExpired: () => void
  
  /** Obtiene estadísticas del caché */
  getStats: () => { total: number; expired: number; valid: number }
}

/**
 * Hook principal para acceder al caché de permisos
 * Automáticamente sincroniza con el userId de la sesión
 */
export function usePermissionsCache(): UsePermissionsCacheResult {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const getCached = useCallback(
    (resourceCode: string) => {
      if (!userId) return null
      return getCachedPermissions(resourceCode, userId)
    },
    [userId]
  )

  const setCached = useCallback(
    (resourceCode: string, permissions: any) => {
      if (!userId) return
      setCachedPermissions(resourceCode, userId, permissions)
    },
    [userId]
  )

  const invalidate = useCallback((resourceCode?: string) => {
    invalidateCache(resourceCode)
  }, [])

  const cleanExpired = useCallback(() => {
    cleanExpiredCache()
  }, [])

  const getStats = useCallback(() => {
    return getCacheStats()
  }, [])

  return {
    getCached,
    setCached,
    invalidate,
    cleanExpired,
    getStats,
  }
}

/**
 * Hook especializado para mantener caché de permisos
 * Invalida automáticamente al cambiar el usuario
 * 
 * @param resourceCodes - Códigos de recursos a mantener en caché
 * @param onInvalidate - Callback cuando se invalida el caché
 */
export function usePermissionsCacheManager(
  resourceCodes: string[],
  onInvalidate?: () => void
) {
  const { data: session, status } = useSession()
  const { invalidate, cleanExpired } = usePermissionsCache()

  // Invalidar caché cuando el usuario cambia o se logout
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      // Usuario deslogueó - limpiar todo
      invalidate()
      onInvalidate?.()
    }
  }, [status, invalidate, onInvalidate])

  // Invalidar recursos específicos si cambia el usuario
  React.useEffect(() => {
    const currentUserId = session?.user?.id
    const storedUserId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('_currentUserId')
      : null

    if (currentUserId && storedUserId && currentUserId !== storedUserId) {
      // Usuario cambió - invalidar todos los permisos
      invalidate()
      onInvalidate?.()
    }

    if (currentUserId && typeof window !== 'undefined') {
      sessionStorage.setItem('_currentUserId', currentUserId)
    }
  }, [session?.user?.id, invalidate, onInvalidate])

  return {
    invalidate,
    cleanExpired,
  }
}

// Re-exportar para acceso directo si se necesita
export { invalidateCache, cleanExpiredCache, getCacheStats }
