/**
 * Caché específico para cotizaciones
 * Maneja la persistencia local y metadatos de sincronización
 */

import * as storage from './storage'
import type { 
  CachedQuotation, 
  CacheMetadata, 
  SyncStatus
} from './types'
import type { QuotationConfig } from '@/lib/types'

const QUOTATION_PREFIX = 'wq_quotation_'

/**
 * Crea metadata inicial para un nuevo registro de caché
 */
function createMetadata(serverUpdatedAt: string, serverVersion: number): CacheMetadata {
  return {
    cachedAt: new Date().toISOString(),
    serverUpdatedAt,
    serverVersion,
    isDirty: false,
    lastSyncAttempt: null,
    syncStatus: 'synced'
  }
}

/**
 * Guarda una cotización en el caché local
 */
export function saveQuotation(quotation: QuotationConfig): boolean {
  const key = `${QUOTATION_PREFIX}${quotation.id}`
  
  const cached: CachedQuotation = {
    data: quotation,
    metadata: createMetadata(
      quotation.updatedAt || new Date().toISOString(),
      quotation.versionNumber || 1
    )
  }
  
  return storage.setItem(key, cached)
}

/**
 * Guarda una cotización marcándola como modificada localmente
 */
export function saveQuotationDirty(quotation: QuotationConfig): boolean {
  const key = `${QUOTATION_PREFIX}${quotation.id}`
  const existing = getQuotationWithMeta(quotation.id)
  
  const cached: CachedQuotation = {
    data: quotation,
    metadata: {
      ...(existing?.metadata || createMetadata(
        quotation.updatedAt || new Date().toISOString(),
        quotation.versionNumber || 1
      )),
      cachedAt: new Date().toISOString(),
      isDirty: true,
      syncStatus: 'pending'
    }
  }
  
  return storage.setItem(key, cached)
}

/**
 * Obtiene una cotización del caché
 */
export function getQuotation(id: string): QuotationConfig | null {
  const key = `${QUOTATION_PREFIX}${id}`
  const cached = storage.getItem<CachedQuotation>(key)
  return cached?.data || null
}

/**
 * Obtiene una cotización con su metadata
 */
export function getQuotationWithMeta(id: string): CachedQuotation | null {
  const key = `${QUOTATION_PREFIX}${id}`
  return storage.getItem<CachedQuotation>(key)
}

/**
 * Actualiza campos específicos de una cotización en caché
 */
export function updateQuotationFields(
  id: string, 
  fields: Partial<QuotationConfig>
): QuotationConfig | null {
  const cached = getQuotationWithMeta(id)
  if (!cached) return null
  
  const updatedQuotation: QuotationConfig = {
    ...cached.data,
    ...fields
  }
  
  const updatedCached: CachedQuotation = {
    data: updatedQuotation,
    metadata: {
      ...cached.metadata,
      cachedAt: new Date().toISOString(),
      isDirty: true,
      syncStatus: 'pending'
    }
  }
  
  const key = `${QUOTATION_PREFIX}${id}`
  storage.setItem(key, updatedCached)
  
  return updatedQuotation
}

/**
 * Marca una cotización como sincronizada con el servidor
 */
export function markAsSynced(
  id: string, 
  serverUpdatedAt: string, 
  serverVersion: number
): boolean {
  const cached = getQuotationWithMeta(id)
  if (!cached) return false
  
  const updatedCached: CachedQuotation = {
    data: cached.data,
    metadata: {
      ...cached.metadata,
      serverUpdatedAt,
      serverVersion,
      isDirty: false,
      lastSyncAttempt: new Date().toISOString(),
      syncStatus: 'synced'
    }
  }
  
  const key = `${QUOTATION_PREFIX}${id}`
  return storage.setItem(key, updatedCached)
}

/**
 * Marca una cotización con estado de error de sincronización
 */
export function markSyncError(id: string, error?: string): boolean {
  const cached = getQuotationWithMeta(id)
  if (!cached) return false
  
  const updatedCached: CachedQuotation = {
    data: cached.data,
    metadata: {
      ...cached.metadata,
      lastSyncAttempt: new Date().toISOString(),
      syncStatus: 'error'
    }
  }
  
  const key = `${QUOTATION_PREFIX}${id}`
  return storage.setItem(key, updatedCached)
}

/**
 * Marca una cotización con conflicto detectado
 */
export function markConflict(id: string): boolean {
  const cached = getQuotationWithMeta(id)
  if (!cached) return false
  
  const updatedCached: CachedQuotation = {
    data: cached.data,
    metadata: {
      ...cached.metadata,
      syncStatus: 'conflict'
    }
  }
  
  const key = `${QUOTATION_PREFIX}${id}`
  return storage.setItem(key, updatedCached)
}

/**
 * Elimina una cotización del caché
 */
export function removeQuotation(id: string): boolean {
  const key = `${QUOTATION_PREFIX}${id}`
  return storage.removeItem(key)
}

/**
 * Verifica si una cotización tiene cambios sin guardar
 */
export function isDirty(id: string): boolean {
  const cached = getQuotationWithMeta(id)
  return cached?.metadata.isDirty || false
}

/**
 * Obtiene el estado de sincronización
 */
export function getSyncStatus(id: string): SyncStatus | null {
  const cached = getQuotationWithMeta(id)
  return cached?.metadata.syncStatus || null
}

/**
 * Obtiene todas las cotizaciones en caché
 */
export function getAllCachedQuotations(): CachedQuotation[] {
  const keys = storage.getKeysByPrefix(QUOTATION_PREFIX)
  const quotations: CachedQuotation[] = []
  
  for (const key of keys) {
    const cached = storage.getItem<CachedQuotation>(key)
    if (cached) {
      quotations.push(cached)
    }
  }
  
  return quotations
}

/**
 * Obtiene cotizaciones con cambios pendientes
 */
export function getDirtyQuotations(): CachedQuotation[] {
  return getAllCachedQuotations().filter(q => q.metadata.isDirty)
}

/**
 * Guarda el ID de la última cotización activa
 */
export function setLastActiveQuotation(id: string): boolean {
  return storage.setItem('wq_last_active_quotation', id)
}

/**
 * Obtiene el ID de la última cotización activa
 */
export function getLastActiveQuotation(): string | null {
  return storage.getItem<string>('wq_last_active_quotation')
}
