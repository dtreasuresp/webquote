/**
 * Hook para sincronización entre pestañas del navegador
 */

import { useEffect, useCallback, useRef } from 'react'
import { tabSync } from '@/lib/cache'
import type { TabSyncEvent } from '@/lib/cache/types'

export interface UseTabSyncOptions {
  /** ID de la cotización a monitorear (null para todas) */
  quotationId?: string | null
  /** Callback cuando hay actualización de otra pestaña */
  onQuotationUpdate?: (event: TabSyncEvent) => void
  /** Callback cuando otra pestaña completó sincronización */
  onSyncCompleted?: (event: TabSyncEvent) => void
  /** Callback cuando se detecta conflicto */
  onConflictDetected?: (event: TabSyncEvent) => void
  /** Callback cuando se resuelve conflicto */
  onConflictResolved?: (event: TabSyncEvent) => void
  /** Si la sincronización está habilitada */
  enabled?: boolean
}

export interface UseTabSyncReturn {
  /** Notifica actualización local a otras pestañas */
  notifyUpdate: (fields?: string[]) => void
  /** Notifica sincronización completada */
  notifySyncCompleted: () => void
  /** Solicita estado a otras pestañas */
  requestStateFromOtherTabs: () => void
  /** ID único de esta pestaña */
  tabId: string
  /** Si la sincronización está activa */
  isActive: boolean
}

export function useTabSync(options: UseTabSyncOptions = {}): UseTabSyncReturn {
  const {
    quotationId = null,
    onQuotationUpdate,
    onSyncCompleted,
    onConflictDetected,
    onConflictResolved,
    enabled = true
  } = options

  const isInitializedRef = useRef(false)

  // Inicializar canal al montar
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    if (!isInitializedRef.current) {
      tabSync.initTabSync()
      isInitializedRef.current = true
    }

    // Suscribirse a eventos
    const handleEvent = (event: TabSyncEvent) => {
      // Si hay quotationId específico, filtrar
      if (quotationId && event.quotationId !== quotationId) {
        return
      }

      switch (event.type) {
        case 'quotation_updated':
          onQuotationUpdate?.(event)
          break
        case 'sync_completed':
          onSyncCompleted?.(event)
          break
        case 'conflict_detected':
          onConflictDetected?.(event)
          break
        case 'conflict_resolved':
          onConflictResolved?.(event)
          break
      }
    }

    const unsubscribe = tabSync.onTabSync(handleEvent)

    return () => {
      unsubscribe()
    }
  }, [enabled, quotationId, onQuotationUpdate, onSyncCompleted, onConflictDetected, onConflictResolved])

  // Notificar actualización
  const notifyUpdate = useCallback((fields?: string[]) => {
    if (!quotationId) return
    tabSync.broadcastQuotationUpdate(quotationId, fields)
  }, [quotationId])

  // Notificar sincronización completada
  const notifySyncCompleted = useCallback(() => {
    if (!quotationId) return
    tabSync.broadcastSyncCompleted(quotationId)
  }, [quotationId])

  // Solicitar estado a otras pestañas
  const requestStateFromOtherTabs = useCallback(() => {
    if (!quotationId) return
    tabSync.requestStateSync(quotationId)
  }, [quotationId])

  return {
    notifyUpdate,
    notifySyncCompleted,
    requestStateFromOtherTabs,
    tabId: tabSync.getCurrentTabId(),
    isActive: enabled && tabSync.isTabSyncActive()
  }
}

export default useTabSync
