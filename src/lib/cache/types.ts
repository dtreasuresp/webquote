/**
 * Tipos para el sistema de caché local con sincronización
 */

import type { QuotationConfig, PackageSnapshot } from '@/lib/types'

// Estado de sincronización
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'conflict' | 'error' | 'offline'

// Metadata del caché
export interface CacheMetadata {
  cachedAt: string              // ISO timestamp cuando se guardó en cache
  serverUpdatedAt: string       // updatedAt del servidor
  serverVersion: number         // versionNumber del servidor
  isDirty: boolean              // ¿Hay cambios locales sin guardar?
  lastSyncAttempt: string | null // Último intento de sync
  syncStatus: SyncStatus        // Estado actual de sincronización
}

// Cotización en caché
export interface CachedQuotation {
  data: QuotationConfig
  metadata: CacheMetadata
}

// Snapshots en caché
export interface CachedSnapshots {
  quotationId: string
  snapshots: PackageSnapshot[]
  metadata: CacheMetadata
}

// Elemento genérico de caché
export interface CacheEntry<T> {
  data: T
  metadata: CacheMetadata
}

// Resultado de comparación para conflictos
export interface ConflictInfo {
  localVersion: number
  serverVersion: number
  localUpdatedAt: string
  serverUpdatedAt: string
  conflictingFields: string[]   // Campos que difieren
}

// Opciones de resolución de conflicto
export type ConflictResolution = 
  | 'keep-local'      // Mantener cambios locales, sobrescribir servidor
  | 'keep-server'     // Usar versión del servidor, descartar local
  | 'merge'           // Intentar fusionar cambios
  | 'cancel'          // No hacer nada

// Resultado de resolución de conflicto
export interface ConflictResolutionResult {
  resolution: ConflictResolution
  mergedData?: QuotationConfig  // Solo si resolution === 'merge'
}

// Evento de sincronización entre pestañas
export interface TabSyncEvent {
  type: 'quotation_updated' | 'sync_completed' | 'conflict_detected' | 'conflict_resolved' | 'request_state'
  quotationId: string           // ID de la cotización
  timestamp: number             // Cuando ocurrió (Date.now())
  tabId: string                 // ID de la pestaña que originó el evento
  payload?: unknown             // Datos adicionales opcionales
}

// Configuración del sistema de caché
export interface CacheConfig {
  autoSaveInterval: number      // Intervalo de auto-guardado en ms (default: 5000)
  syncOnVisibilityChange: boolean // Sincronizar al cambiar de pestaña
  maxOfflineTime: number        // Tiempo máximo offline antes de forzar sync (ms)
  enableTabSync: boolean        // Habilitar sincronización entre pestañas
}

// Estado del hook useQuotationCache
export interface QuotationCacheState {
  quotation: QuotationConfig | null
  isLoading: boolean
  isSyncing: boolean
  isDirty: boolean
  isOffline: boolean
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  syncError: string | null
  conflict: ConflictInfo | null
}

// Acciones del hook useQuotationCache
export interface QuotationCacheActions {
  updateField: <K extends keyof QuotationConfig>(field: K, value: QuotationConfig[K]) => void
  updateQuotation: (partial: Partial<QuotationConfig>) => void
  save: () => Promise<boolean>
  refresh: () => Promise<void>
  discardChanges: () => void
  resolveConflict: (resolution: ConflictResolution) => Promise<void>
}

// Claves de LocalStorage
export const CACHE_KEYS = {
  QUOTATION: (id: string) => `wq_quotation_${id}`,
  SNAPSHOTS: (quotationId: string) => `wq_snapshots_${quotationId}`,
  PREFERENCES: 'wq_preferences',
  SYNC_QUEUE: 'wq_sync_queue',
  LAST_ACTIVE_QUOTATION: 'wq_last_active_quotation',
  TAB_ID: 'wq_tab_id',
} as const

// Valores por defecto
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  autoSaveInterval: 5000,       // 5 segundos
  syncOnVisibilityChange: true,
  maxOfflineTime: 300000,       // 5 minutos
  enableTabSync: true,
}
