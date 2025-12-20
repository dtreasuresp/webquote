/**
 * Sistema de Caché de Permisos para Frontend
 * 
 * Almacena permisos del usuario en localStorage para reducir llamadas a la API.
 * Implementa invalidación automática después de 5 minutos.
 * 
 * @module permissionsCache
 */

export interface CachedPermissions {
  data: any
  timestamp: number
  userId: string
}

const CACHE_PREFIX = 'permissions:'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene permisos desde el caché
 * @param resourceCode - Código del recurso (ej: 'users', 'logs', etc.)
 * @param userId - ID del usuario actual
 * @returns Permisos cacheados o null si no existe o expiró
 */
export function getCachedPermissions(resourceCode: string, userId: string): any | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${resourceCode}`
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const { data, timestamp, userId: cachedUserId } = JSON.parse(cached) as CachedPermissions
    
    // Verificar que es del mismo usuario
    if (cachedUserId !== userId) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    // Verificar si expiró
    const now = Date.now()
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    return data
  } catch (error) {
    console.error('[PermissionsCache] Error reading cache:', error)
    return null
  }
}

/**
 * Almacena permisos en el caché
 * @param resourceCode - Código del recurso
 * @param userId - ID del usuario actual
 * @param permissions - Permisos a cachear
 */
export function setCachedPermissions(resourceCode: string, userId: string, permissions: any): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${resourceCode}`
    const cached: CachedPermissions = {
      data: permissions,
      timestamp: Date.now(),
      userId
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cached))
  } catch (error) {
    console.error('[PermissionsCache] Error writing cache:', error)
  }
}

/**
 * Invalida el caché de un recurso específico
 * @param resourceCode - Código del recurso a invalidar
 */
export function invalidateCache(resourceCode?: string): void {
  try {
    if (resourceCode) {
      // Invalidar solo un recurso específico
      const cacheKey = `${CACHE_PREFIX}${resourceCode}`
      localStorage.removeItem(cacheKey)
    } else {
      // Invalidar todos los permisos
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.error('[PermissionsCache] Error invalidating cache:', error)
  }
}

/**
 * Limpia caché expirado (útil para mantenimiento)
 */
export function cleanExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const { timestamp } = JSON.parse(cached) as CachedPermissions
            if (now - timestamp > CACHE_DURATION) {
              localStorage.removeItem(key)
            }
          }
        } catch {
          // Si hay error parseando, eliminar el item
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.error('[PermissionsCache] Error cleaning cache:', error)
  }
}

/**
 * Obtiene estadísticas del caché (para debugging)
 */
export function getCacheStats(): { total: number; expired: number; valid: number } {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
  const now = Date.now()
  let expired = 0
  let valid = 0
  
  keys.forEach(key => {
    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const { timestamp } = JSON.parse(cached) as CachedPermissions
        if (now - timestamp > CACHE_DURATION) {
          expired++
        } else {
          valid++
        }
      }
    } catch {
      expired++
    }
  })
  
  return { total: keys.length, expired, valid }
}
