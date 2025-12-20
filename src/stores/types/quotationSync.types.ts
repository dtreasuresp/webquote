/**
 * Quotation Sync Store Types
 * 
 * Define la estructura para sincronización global de cotizaciones
 * cuando se modifica una cotización, todos los componentes dependientes
 * se actualizan automáticamente
 */

export interface QuotationSyncEvent {
  type: 'quotation:updated' | 'quotation:created' | 'quotation:activated' | 'quotation:deleted' | 'quotation:version-created'
  quotationId: string
  quotationNumber?: string
  versionId?: string
  timestamp: number
  data?: any
}

export interface QuotationSyncState {
  // Evento más reciente (para reactivity en componentes)
  lastEvent: QuotationSyncEvent | null
  
  // Listeners activos (para debugging)
  listenersCount: number
  
  // Listeners por tipo de evento
  listeners: Map<string, Set<(event: QuotationSyncEvent) => void>>
  
  // Flag de sincronización en progreso
  isSyncing: boolean
  
  // Cotizaciones que necesitan refresh
  quotationsToRefresh: Set<string>
  
  // Última vez que se sincronizó
  lastSyncTime: number | null
  
  // Error de la última sincronización
  lastSyncError: string | null
}

export interface QuotationSyncActions {
  // Emitir un evento de sincronización
  emit: (event: QuotationSyncEvent) => void
  
  // Subscribirse a un evento
  subscribe: (
    eventType: QuotationSyncEvent['type'],
    callback: (event: QuotationSyncEvent) => void
  ) => () => void // Retorna función para unsubscribirse
  
  // Unsubscribirse de todos los eventos de un tipo
  unsubscribeAll: (eventType: QuotationSyncEvent['type']) => void
  
  // Marcar una cotización para refresh
  markForRefresh: (quotationId: string) => void
  
  // Obtener cotizaciones que necesitan refresh
  getQuotationsToRefresh: () => string[]
  
  // Limpiar cotizaciones ya refrescadas
  clearRefreshQueue: (quotationIds?: string[]) => void
  
  // Iniciar sincronización
  startSync: () => void
  
  // Finalizar sincronización
  endSync: (error?: string) => void
  
  // Limpiar todos los listeners (para cleanup)
  reset: () => void
}

export type QuotationSyncStore = QuotationSyncState & QuotationSyncActions
