/**
 * Hook para manejar la invalidación de caché en eventos críticos
 * 
 * Fase 12: Integración con caché de permisos
 * 
 * Invalida automáticamente el caché cuando:
 * - El usuario hace logout
 * - El usuario cambia
 * - Se modifica un permiso (puede ser llamado manualmente)
 */

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { invalidateCache } from '@/lib/permissionsCache'
import { usePermissionsCacheStore } from '@/stores/permissionsCacheStore'

/**
 * Hook que invalida automáticamente el caché cuando el usuario cambia o desloguea
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   useInvalidatePermissionsCacheOnLogout()
 *   
 *   return <div>Content</div>
 * }
 * ```
 */
export function useInvalidatePermissionsCacheOnLogout() {
  const { status } = useSession()
  const invalidateAll = usePermissionsCacheStore((state) => state.invalidateAll)

  useEffect(() => {
    // Cuando el usuario desloguea
    if (status === 'unauthenticated') {
      console.log('[CacheInvalidator] 🚪 Usuario deslogueado - invalidando caché')
      invalidateAll()
      invalidateCache()
    }
  }, [status, invalidateAll])
}

/**
 * Hook que invalida el caché cuando cambia el usuario
 * Útil para detectar cambios de usuario (por ej, en ambiente compartido)
 * 
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   useInvalidatePermissionsCacheOnUserChange()
 *   
 *   return <div>Dashboard</div>
 * }
 * ```
 */
export function useInvalidatePermissionsCacheOnUserChange() {
  const { data: session } = useSession()
  const invalidateAll = usePermissionsCacheStore((state) => state.invalidateAll)

  useEffect(() => {
    const currentUserId = session?.user?.id
    const storedUserId =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('_permissionsCacheUserId')
        : null

    if (currentUserId && storedUserId && currentUserId !== storedUserId) {
      console.log(
        `[CacheInvalidator] 👤 Usuario cambió (${storedUserId} → ${currentUserId}) - invalidando caché`
      )
      invalidateAll()
      invalidateCache()
    }

    if (currentUserId && typeof window !== 'undefined') {
      sessionStorage.setItem('_permissionsCacheUserId', currentUserId)
    }
  }, [session?.user?.id, invalidateAll])
}

/**
 * Hook para invalidar manualmente permisos específicos
 * Útil cuando se modifica un permiso de usuario
 * 
 * @example
 * ```tsx
 * function UserPermissionsEditor() {
 *   const { invalidateUserPermissions } = useInvalidatePermissions()
 *   
 *   async function handleSave() {
 *     await updatePermissions()
 *     invalidateUserPermissions(userId)
 *   }
 * }
 * ```
 */
export function useInvalidatePermissions() {
  const removeFromCache = usePermissionsCacheStore((state) => state.removeFromCache)

  const invalidateResource = (resource: string) => {
    console.log(`[CacheInvalidator] 🔄 Invalidando recurso: ${resource}`)
    removeFromCache(resource)
  }

  const invalidateAllForUser = () => {
    console.log(`[CacheInvalidator] 🔄 Invalidando TODOS los permisos`)
    invalidateCache()
  }

  return {
    invalidateResource,
    invalidateAllForUser,
  }
}
