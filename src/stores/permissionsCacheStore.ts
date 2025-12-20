/**
 * Permissions Cache Store (Zustand)
 * 
 * Store global para mantener el caché de permisos sincronizado
 * en toda la aplicación y entre pestañas.
 * 
 * Fase 12: Sistema de Caché de Permisos Frontend
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invalidateCache } from '@/lib/permissionsCache'

export interface PermissionsCacheState {
  // Cache data
  cache: Map<string, { resource: string; userId: string; timestamp: number }>
  
  // Cache management
  addToCache: (resource: string, userId: string) => void
  removeFromCache: (resource: string) => void
  invalidateAll: () => void
  
  // Stats
  getCacheSize: () => number
}

/**
 * Store de Zustand para gestionar el caché de permisos
 * Sincroniza automáticamente entre pestañas via localStorage
 */
export const usePermissionsCacheStore = create<PermissionsCacheState>()(
  persist(
    (set, get) => ({
      cache: new Map(),

      addToCache: (resource: string, userId: string) => {
        set((state) => {
          const newCache = new Map(state.cache)
          newCache.set(resource, {
            resource,
            userId,
            timestamp: Date.now(),
          })
          return { cache: newCache }
        })
        console.log(`[CacheStore] ✅ Agregado a caché: ${resource}`)
      },

      removeFromCache: (resource: string) => {
        set((state) => {
          const newCache = new Map(state.cache)
          newCache.delete(resource)
          return { cache: newCache }
        })
        invalidateCache(resource)
        console.log(`[CacheStore] 🗑️  Removido del caché: ${resource}`)
      },

      invalidateAll: () => {
        set({ cache: new Map() })
        invalidateCache()
        console.log(`[CacheStore] 🗑️  Caché completamente invalidado`)
      },

      getCacheSize: () => {
        return get().cache.size
      },
    }),
    {
      name: 'permissions-cache-store',
      partialize: (state) => ({
        // Solo persistir metadata, no los permisos mismos (eso va en localStorage)
        cache: Array.from(state.cache.entries()).map(([key, value]) => [key, value]),
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        cache: new Map(
          (persistedState as any).cache?.map(([key, value]: any) => [key, value]) || []
        ),
      }),
    }
  )
)

/**
 * Hook derivado para invalidar permisos cuando cambia el usuario
 */
export const usePermissionsCacheInvalidator = () => {
  const invalidateAll = usePermissionsCacheStore((state) => state.invalidateAll)

  return {
    invalidateAll,
  }
}
