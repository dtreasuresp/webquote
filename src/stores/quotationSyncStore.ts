/**
 * Quotation Sync Store
 * 
 * Proporciona un sistema de eventos para sincronizar cambios
 * en cotizaciones a través de toda la aplicación.
 * 
 * Utiliza Zustand como base, igual que otros stores del proyecto.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { QuotationSyncStore, QuotationSyncEvent, QuotationSyncState } from './types/quotationSync.types'

const DEFAULT_SYNC_STATE: QuotationSyncState = {
  lastEvent: null,
  listenersCount: 0,
  listeners: new Map(),
  isSyncing: false,
  quotationsToRefresh: new Set(),
  lastSyncTime: null,
  lastSyncError: null,
}

export const useQuotationSyncStore = create<QuotationSyncStore>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_SYNC_STATE,

      /**
       * Emitir un evento de sincronización
       * Todos los listeners suscritos al tipo de evento serán notificados
       */
      emit: (event: QuotationSyncEvent) => {
        const { listeners } = get()
        
        // Registrar el evento
        set({
          lastEvent: event,
          lastSyncTime: Date.now(),
          lastSyncError: null,
        })
        
        // Notificar a los listeners suscritos a este tipo de evento
        const eventListeners = listeners.get(event.type)
        if (eventListeners) {
          eventListeners.forEach((callback) => {
            try {
              callback(event)
            } catch (error) {
              console.error(
                `Error en listener para ${event.type}:`,
                error
              )
            }
          })
        }
        
        // También notificar a listeners que escuchan TODO ('*')
        const wildCardListeners = listeners.get('*' as any)
        if (wildCardListeners) {
          wildCardListeners.forEach((callback) => {
            try {
              callback(event)
            } catch (error) {
              console.error('Error en wildcard listener:', error)
            }
          })
        }
      },

      /**
       * Subscribirse a un evento de sincronización
       * Retorna función para unsubscribirse
       */
      subscribe: (eventType, callback) => {
        const { listeners } = get()
        
        // Crear set de listeners si no existe
        if (!listeners.has(eventType)) {
          listeners.set(eventType, new Set())
        }
        
        const eventListeners = listeners.get(eventType)!
        eventListeners.add(callback)
        
        // Actualizar conteo
        set((state) => ({
          listenersCount: state.listenersCount + 1,
        }))
        
        // Retornar función para unsubscribirse
        return () => {
          eventListeners.delete(callback)
          set((state) => ({
            listenersCount: state.listenersCount - 1,
          }))
        }
      },

      /**
       * Unsubscribirse de TODOS los listeners de un tipo de evento
       */
      unsubscribeAll: (eventType) => {
        const { listeners } = get()
        const eventListeners = listeners.get(eventType)
        
        if (eventListeners) {
          const count = eventListeners.size
          eventListeners.clear()
          
          set((state) => ({
            listenersCount: state.listenersCount - count,
          }))
        }
      },

      /**
       * Marcar una cotización para refresh
       * (Cuando se guarda una cotización, también guardar su ID aquí)
       */
      markForRefresh: (quotationId) => {
        set((state) => {
          const newRefreshSet = new Set(state.quotationsToRefresh)
          newRefreshSet.add(quotationId)
          return { quotationsToRefresh: newRefreshSet }
        })
      },

      /**
       * Obtener cotizaciones que necesitan refresh
       */
      getQuotationsToRefresh: () => {
        const { quotationsToRefresh } = get()
        return Array.from(quotationsToRefresh)
      },

      /**
       * Limpiar cotizaciones ya refrescadas
       */
      clearRefreshQueue: (quotationIds?: string[]) => {
        set((state) => {
          if (!quotationIds || quotationIds.length === 0) {
            return { quotationsToRefresh: new Set() }
          }
          
          const newRefreshSet = new Set(state.quotationsToRefresh)
          quotationIds.forEach((id) => newRefreshSet.delete(id))
          return { quotationsToRefresh: newRefreshSet }
        })
      },

      /**
       * Iniciar sincronización
       */
      startSync: () => {
        set({
          isSyncing: true,
          lastSyncError: null,
        })
      },

      /**
       * Finalizar sincronización
       */
      endSync: (error?: string) => {
        set({
          isSyncing: false,
          lastSyncError: error || null,
          lastSyncTime: Date.now(),
        })
      },

      /**
       * Limpiar estado para cleanup (cuando desmonta la app)
       */
      reset: () => {
        set((state) => {
          // Limpiar todos los listeners
          state.listeners.forEach((set) => set.clear())
          
          return {
            ...DEFAULT_SYNC_STATE,
            listeners: new Map(),
          }
        })
      },
    }),
    {
      name: 'quotation-sync-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

/**
 * Exportar acceso directo a métodos comunes
 * Útil para llamar desde fuera de componentes React
 */
export const quotationSync = {
  emit: (event: QuotationSyncEvent) => useQuotationSyncStore.getState().emit(event),
  
  subscribe: (
    eventType: QuotationSyncEvent['type'],
    callback: (event: QuotationSyncEvent) => void
  ) => useQuotationSyncStore.getState().subscribe(eventType, callback),
  
  getState: () => useQuotationSyncStore.getState(),
}
