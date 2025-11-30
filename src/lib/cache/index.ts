/**
 * Exportaciones centralizadas del sistema de caché
 */

// Types
export type {
  CacheMetadata,
  CachedQuotation,
  CachedSnapshots,
  CacheEntry,
  ConflictInfo,
  TabSyncEvent,
  CacheConfig,
  QuotationCacheState,
  QuotationCacheActions,
  SyncStatus,
  ConflictResolution
} from './types'

export { CACHE_KEYS, DEFAULT_CACHE_CONFIG } from './types'

// Storage utilities
export * as storage from './storage'

// Quotation cache
export * as quotationCache from './quotationCache'

// Snapshot cache
export * as snapshotCache from './snapshotCache'

// Tab synchronization
export * as tabSync from './tabSync'

// Sync manager
export * as syncManager from './syncManager'
export type { SyncResult, ConflictCallback } from './syncManager'
