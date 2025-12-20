/**
 * Custom Hooks para Quotation Sync
 * 
 * Proporcionan una forma limpia y Reactiva de usar el sync store
 * en componentes React.
 */

import { useEffect, useCallback, useRef } from 'react'
import { useQuotationSyncStore } from '@/stores/quotationSyncStore'
import type { QuotationSyncEvent } from '@/stores/types/quotationSync.types'

/**
 * Hook para escuchar cambios en una cotización específica
 * 
 * Ejemplo:
 * ```tsx
 * function MyComponent() {
 *   useQuotationListener('quotation:updated', () => {
 *     console.log('Cotización actualizada!')
 *     // Refrescar datos
 *   })
 * }
 * ```
 */
export function useQuotationListener(
  eventType: QuotationSyncEvent['type'] | QuotationSyncEvent['type'][],
  callback: (event: QuotationSyncEvent) => void,
  enabled = true
) {
  const subscribe = useQuotationSyncStore((s) => s.subscribe)
  const unsubscribeAllFn = useQuotationSyncStore((s) => s.unsubscribeAll)
  const unsubscribesRef = useRef<Array<() => void>>([])

  useEffect(() => {
    if (!enabled) return

    // Soportar un solo evento o un array de eventos
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType]

    // Subscribirse a todos los eventos
    eventTypes.forEach((type) => {
      const unsubscribe = subscribe(type, callback)
      unsubscribesRef.current.push(unsubscribe)
    })

    // Cleanup: unsubscribirse cuando el componente se desmonta
    return () => {
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe())
      unsubscribesRef.current = []
    }
  }, [eventType, callback, subscribe, enabled])
}

/**
 * Hook para emitir eventos de sincronización
 * 
 * Ejemplo:
 * ```tsx
 * function AdminPanel() {
 *   const emitSync = useQuotationSync()
 *   
 *   const handleSave = async () => {
 *     // Guardar en BD
 *     const result = await saveQuotation(data)
 *     
 *     // Notificar a otros componentes
 *     emitSync('quotation:updated', {
 *       quotationId: result.id,
 *       data: result
 *     })
 *   }
 * }
 * ```
 */
export function useQuotationSync() {
  const emit = useQuotationSyncStore((s) => s.emit)

  return useCallback(
    (
      type: QuotationSyncEvent['type'],
      {
        quotationId,
        quotationNumber,
        versionId,
        data,
      }: {
        quotationId: string
        quotationNumber?: string
        versionId?: string
        data?: any
      }
    ) => {
      emit({
        type,
        quotationId,
        quotationNumber,
        versionId,
        timestamp: Date.now(),
        data,
      })
    },
    [emit]
  )
}

/**
 * Hook para marcar cotizaciones para refresh
 * 
 * Útil cuando necesitas que otros componentes recarguen datos
 */
export function useQuotationRefresh() {
  const markForRefresh = useQuotationSyncStore((s) => s.markForRefresh)
  const getQuotationsToRefresh = useQuotationSyncStore((s) => s.getQuotationsToRefresh)
  const clearRefreshQueue = useQuotationSyncStore((s) => s.clearRefreshQueue)

  return {
    markForRefresh,
    getQuotationsToRefresh,
    clearRefreshQueue,
  }
}

/**
 * Hook para sincronización con estado de carga
 * 
 * Combina emit + startSync + endSync en un flujo completo
 */
export function useQuotationSyncFlow() {
  const emit = useQuotationSyncStore((s) => s.emit)
  const startSync = useQuotationSyncStore((s) => s.startSync)
  const endSync = useQuotationSyncStore((s) => s.endSync)

  return useCallback(
    async <T,>(
      eventType: QuotationSyncEvent['type'],
      asyncOperation: () => Promise<T>,
      eventData: {
        quotationId: string
        quotationNumber?: string
        versionId?: string
      }
    ): Promise<T> => {
      startSync()
      try {
        const result = await asyncOperation()
        
        // Emitir evento de éxito
        emit({
          type: eventType,
          quotationId: eventData.quotationId,
          quotationNumber: eventData.quotationNumber,
          versionId: eventData.versionId,
          timestamp: Date.now(),
          data: result,
        })
        
        endSync()
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        endSync(errorMessage)
        throw error
      }
    },
    [emit, startSync, endSync]
  )
}

/**
 * Hook para observar el último evento emitido
 * (Útil para debugging o para UI que reaccione a cambios recientes)
 */
export function useLastQuotationEvent() {
  return useQuotationSyncStore((s) => s.lastEvent)
}

/**
 * Hook para obtener estadísticas de sincronización
 */
export function useQuotationSyncStats() {
  return useQuotationSyncStore((s) => ({
    listenersCount: s.listenersCount,
    isSyncing: s.isSyncing,
    lastSyncTime: s.lastSyncTime,
    lastSyncError: s.lastSyncError,
    quotationsToRefresh: s.quotationsToRefresh,
  }))
}
