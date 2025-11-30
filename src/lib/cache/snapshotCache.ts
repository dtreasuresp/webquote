/**
 * Caché específico para snapshots de cotizaciones
 * Maneja la persistencia local de versiones históricas
 */

import * as storage from './storage'
import type { CachedSnapshots } from './types'
import type { PackageSnapshot } from '@/lib/types'

const SNAPSHOT_PREFIX = 'wq_snapshots_'

/**
 * Guarda los snapshots de una cotización en caché
 */
export function saveSnapshots(quotationId: string, snapshots: PackageSnapshot[]): boolean {
  const key = `${SNAPSHOT_PREFIX}${quotationId}`
  
  const cached: CachedSnapshots = {
    quotationId,
    snapshots,
    metadata: {
      cachedAt: new Date().toISOString(),
      serverUpdatedAt: new Date().toISOString(),
      serverVersion: 1,
      isDirty: false,
      lastSyncAttempt: new Date().toISOString(),
      syncStatus: 'synced'
    }
  }
  
  return storage.setItem(key, cached)
}

/**
 * Obtiene los snapshots de una cotización del caché
 */
export function getSnapshots(quotationId: string): PackageSnapshot[] {
  const key = `${SNAPSHOT_PREFIX}${quotationId}`
  const cached = storage.getItem<CachedSnapshots>(key)
  return cached?.snapshots || []
}

/**
 * Obtiene los snapshots con metadata
 */
export function getSnapshotsWithMeta(quotationId: string): CachedSnapshots | null {
  const key = `${SNAPSHOT_PREFIX}${quotationId}`
  return storage.getItem<CachedSnapshots>(key)
}

/**
 * Agrega un nuevo snapshot al caché
 */
export function addSnapshot(quotationId: string, snapshot: PackageSnapshot): boolean {
  const existing = getSnapshots(quotationId)
  const updated = [snapshot, ...existing]
  return saveSnapshots(quotationId, updated)
}

/**
 * Elimina los snapshots de una cotización del caché
 */
export function removeSnapshots(quotationId: string): boolean {
  const key = `${SNAPSHOT_PREFIX}${quotationId}`
  return storage.removeItem(key)
}

/**
 * Obtiene el snapshot más reciente
 */
export function getLatestSnapshot(quotationId: string): PackageSnapshot | null {
  const snapshots = getSnapshots(quotationId)
  return snapshots.length > 0 ? snapshots[0] : null
}

/**
 * Busca un snapshot por ID
 */
export function getSnapshotById(quotationId: string, snapshotId: string): PackageSnapshot | null {
  const snapshots = getSnapshots(quotationId)
  return snapshots.find(s => s.id === snapshotId) || null
}

/**
 * Obtiene el conteo de snapshots en caché
 */
export function getSnapshotCount(quotationId: string): number {
  return getSnapshots(quotationId).length
}

/**
 * Limpia snapshots antiguos manteniendo solo los últimos N
 */
export function pruneSnapshots(quotationId: string, keepCount: number = 10): boolean {
  const snapshots = getSnapshots(quotationId)
  if (snapshots.length <= keepCount) return true
  
  const pruned = snapshots.slice(0, keepCount)
  return saveSnapshots(quotationId, pruned)
}

/**
 * Obtiene todos los IDs de cotizaciones con snapshots en caché
 */
export function getAllCachedQuotationIds(): string[] {
  const keys = storage.getKeysByPrefix(SNAPSHOT_PREFIX)
  return keys.map(key => key.replace(SNAPSHOT_PREFIX, ''))
}
