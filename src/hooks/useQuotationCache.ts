/**
 * Hook principal para manejo de caché de cotizaciones
 * Integra carga rápida, auto-guardado, sincronización y resolución de conflictos
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  quotationCache, 
  snapshotCache, 
  syncManager,
  tabSync 
} from '@/lib/cache'
import type { 
  ConflictInfo, 
  SyncStatus 
} from '@/lib/cache/types'
import type { QuotationConfig, PackageSnapshot } from '@/lib/types'
import { useOfflineStatus } from './useOfflineStatus'
import { useAutoSave } from './useAutoSave'
import { useTabSync } from './useTabSync'

export interface UseQuotationCacheOptions {
  /** ID de la cotización */
  quotationId: string | null
  /** Si el caché está habilitado */
  enabled?: boolean
  /** Intervalo de auto-guardado en ms */
  autoSaveInterval?: number
  /** Callback cuando se detecta conflicto */
  onConflict?: (conflict: ConflictInfo) => void
  /** Callback cuando hay actualización de otra pestaña */
  onRemoteUpdate?: () => void
}

export interface UseQuotationCacheReturn {
  // Estado
  /** Datos de la cotización (de caché o servidor) */
  quotation: QuotationConfig | null
  /** Snapshots en caché */
  snapshots: PackageSnapshot[]
  /** Si está cargando del servidor */
  isLoading: boolean
  /** Si hay cambios sin guardar en BD */
  isDirty: boolean
  /** Estado de sincronización */
  syncStatus: SyncStatus | null
  /** Si está online */
  isOnline: boolean
  /** Error actual */
  error: string | null
  /** Conflicto pendiente */
  pendingConflict: ConflictInfo | null
  
  // Acciones
  /** Actualiza la cotización en caché */
  updateQuotation: (data: Partial<QuotationConfig>) => void
  /** Guarda en servidor */
  saveToServer: () => Promise<boolean>
  /** Recarga del servidor */
  refreshFromServer: () => Promise<void>
  /** Resuelve conflicto */
  resolveConflict: (resolution: 'keep-local' | 'keep-server' | 'merge' | 'cancel') => Promise<void>
  /** Limpia el caché local */
  clearCache: () => void
}

export function useQuotationCache(
  options: UseQuotationCacheOptions
): UseQuotationCacheReturn {
  const {
    quotationId,
    enabled = true,
    autoSaveInterval = 5000,
    onConflict,
    onRemoteUpdate
  } = options

  // Estados
  const [quotation, setQuotation] = useState<QuotationConfig | null>(null)
  const [snapshots, setSnapshots] = useState<PackageSnapshot[]>([])
  // CRÍTICO: isLoading debe ser false si no hay quotationId o no está habilitado
  // De lo contrario, el indicador de carga se queda atascado indefinidamente
  const [isLoading, setIsLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingConflict, setPendingConflict] = useState<ConflictInfo | null>(null)

  // Hooks auxiliares
  const { isOnline } = useOfflineStatus()
  
  // Ref para evitar carreras de condición
  const loadingRef = useRef(false)

  // Calcular si hay cambios
  const isDirty = quotationId ? quotationCache.isDirty(quotationId) : false

  // Auto-guardado local
  useAutoSave(quotation, {
    interval: autoSaveInterval,
    enabled: enabled && !!quotationId,
    onSave: (success) => {
      if (success && quotationId) {
        setSyncStatus(quotationCache.getSyncStatus(quotationId))
      }
    }
  })

  // Sincronización entre pestañas
  useTabSync({
    quotationId,
    enabled,
    onQuotationUpdate: () => {
      // Otra pestaña actualizó la cotización
      if (quotationId) {
        const cached = quotationCache.getQuotation(quotationId)
        if (cached) {
          setQuotation(cached)
          onRemoteUpdate?.()
        }
      }
    },
    onSyncCompleted: () => {
      // Otra pestaña sincronizó, recargar
      if (quotationId) {
        const cached = quotationCache.getQuotation(quotationId)
        if (cached) {
          setQuotation(cached)
          setSyncStatus('synced')
        }
      }
    },
    onConflictDetected: () => {
      // Otra pestaña detectó conflicto
      if (quotationId) {
        setSyncStatus('conflict')
      }
    }
  })

  // Cargar datos inicial
  const loadData = useCallback(async () => {
    if (!quotationId || !enabled || loadingRef.current) return

    loadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      // 1. Primero intentar cargar del caché (instantáneo)
      const cachedData = quotationCache.getQuotationWithMeta(quotationId)
      
      if (cachedData) {
        setQuotation(cachedData.data)
        setSyncStatus(cachedData.metadata.syncStatus)
        
        // También cargar snapshots del caché
        const cachedSnapshots = snapshotCache.getSnapshots(quotationId)
        setSnapshots(cachedSnapshots)
        
        // Si estamos offline y hay caché, usar caché sin intentar sincronizar
        if (!isOnline) {
          setIsLoading(false)
          loadingRef.current = false
          return
        }
        
        // Si hay caché y hay cambios locales, no recargar del servidor
        if (cachedData.metadata.isDirty) {
          setIsLoading(false)
          loadingRef.current = false
          return
        }
      }

      // 2. Si estamos online y no hay caché, intentar cargar del servidor
      if (isOnline) {
        // Si hay caché pero NO hay cambios locales, sincronizar en background
        // pero establecer isLoading a false inmediatamente
        if (cachedData && !cachedData.metadata.isDirty) {
          setIsLoading(false)
          loadingRef.current = false
          
          // Sincronizar en background sin bloquear la UI
          syncManager.pullFromServer(quotationId).then(result => {
            if (result.success && result.quotation) {
              setQuotation(result.quotation)
              setSyncStatus('synced')
              
              // También cargar snapshots del servidor
              fetch(`/api/snapshots?quotationId=${quotationId}`)
                .then(snapshotsResponse => {
                  if (snapshotsResponse.ok) {
                    return snapshotsResponse.json()
                  }
                })
                .then(serverSnapshots => {
                  if (serverSnapshots) {
                    setSnapshots(serverSnapshots)
                    snapshotCache.saveSnapshots(quotationId, serverSnapshots)
                  }
                })
                .catch(snapshotError => {
                  console.debug('Error cargando snapshots del servidor, usando caché:', snapshotError)
                })
            }
          }).catch(err => {
            console.debug('Error sincronizando en background:', err)
          })
          return
        }
        
        // Si NO hay caché, cargar del servidor (bloqueante)
        const result = await syncManager.pullFromServer(quotationId)
        
        if (result.success && result.quotation) {
          setQuotation(result.quotation)
          setSyncStatus('synced')
          
          // También cargar snapshots del servidor
          try {
            const snapshotsResponse = await fetch(`/api/snapshots?quotationId=${quotationId}`)
            if (snapshotsResponse.ok) {
              const serverSnapshots: PackageSnapshot[] = await snapshotsResponse.json()
              setSnapshots(serverSnapshots)
              snapshotCache.saveSnapshots(quotationId, serverSnapshots)
            }
          } catch (snapshotError) {
            console.debug('Error cargando snapshots del servidor, usando caché:', snapshotError)
          }
        } else if (!cachedData) {
          // No hay caché y falló el servidor
          setError(result.error || 'Error al cargar datos')
        }
      } else if (!cachedData) {
        // Offline sin caché
        setError('Sin conexión y no hay datos en caché')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [quotationId, enabled, isOnline])

  // Efecto para cargar datos
  useEffect(() => {
    loadData()
  }, [loadData])

  // Actualizar cotización en caché
  const updateQuotation = useCallback((data: Partial<QuotationConfig>) => {
    if (!quotationId || !quotation) return

    const updated: QuotationConfig = {
      ...quotation,
      ...data
    }

    setQuotation(updated)
    quotationCache.saveQuotationDirty(updated)
    setSyncStatus('pending')
    
    // Notificar a otras pestañas
    tabSync.broadcastQuotationUpdate(quotationId, Object.keys(data))
  }, [quotationId, quotation])

  // Guardar en servidor
  const saveToServer = useCallback(async (): Promise<boolean> => {
    if (!quotationId || !quotation) return false

    setError(null)

    const result = await syncManager.syncQuotation(
      quotationId,
      async (conflict) => {
        // Mostrar conflicto al usuario
        setPendingConflict(conflict)
        onConflict?.(conflict)
        
        // Retornar 'cancel' para pausar la sincronización
        // El usuario resolverá con resolveConflict()
        return 'cancel'
      }
    )

    if (result.success) {
      setSyncStatus('synced')
      if (result.quotation) {
        setQuotation(result.quotation)
      }
      return true
    } else {
      if (result.conflict) {
        setSyncStatus('conflict')
        setPendingConflict(result.conflict)
      } else {
        setSyncStatus('error')
        setError(result.error || 'Error al guardar')
      }
      return false
    }
  }, [quotationId, quotation, onConflict])

  // Recargar del servidor
  const refreshFromServer = useCallback(async () => {
    if (!quotationId) return

    setIsLoading(true)
    const result = await syncManager.pullFromServer(quotationId)
    
    if (result.success && result.quotation) {
      setQuotation(result.quotation)
      setSyncStatus('synced')
    } else {
      setError(result.error || 'Error al recargar')
    }
    
    setIsLoading(false)
  }, [quotationId])

  // Resolver conflicto
  const resolveConflict = useCallback(async (
    resolution: 'keep-local' | 'keep-server' | 'merge' | 'cancel'
  ) => {
    if (!quotationId || !pendingConflict) return

    const result = await syncManager.syncQuotation(
      quotationId,
      async () => resolution
    )

    if (result.success) {
      setPendingConflict(null)
      setSyncStatus('synced')
      if (result.quotation) {
        setQuotation(result.quotation)
      }
    } else if (resolution !== 'cancel') {
      setError(result.error || 'Error al resolver conflicto')
    }
  }, [quotationId, pendingConflict])

  // Limpiar caché
  const clearCache = useCallback(() => {
    if (!quotationId) return
    
    quotationCache.removeQuotation(quotationId)
    snapshotCache.removeSnapshots(quotationId)
    setQuotation(null)
    setSnapshots([])
    setSyncStatus(null)
  }, [quotationId])

  return {
    // Estado
    quotation,
    snapshots,
    isLoading,
    isDirty,
    syncStatus,
    isOnline,
    error,
    pendingConflict,
    
    // Acciones
    updateQuotation,
    saveToServer,
    refreshFromServer,
    resolveConflict,
    clearCache
  }
}

export default useQuotationCache
