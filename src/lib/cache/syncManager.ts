/**
 * Gestor de sincronización con el servidor
 * Maneja la lógica de cuándo y cómo sincronizar datos
 */

import * as quotationCache from './quotationCache'
import * as tabSync from './tabSync'
import type { 
  CachedQuotation, 
  ConflictInfo
} from './types'
import type { QuotationConfig } from '@/lib/types'

export interface SyncResult {
  success: boolean
  quotation?: QuotationConfig
  conflict?: ConflictInfo
  error?: string
}

export type ConflictCallback = (conflict: ConflictInfo) => Promise<'keep-local' | 'keep-server' | 'merge' | 'cancel'>

/**
 * Sincroniza una cotización con el servidor
 */
export async function syncQuotation(
  id: string,
  onConflict?: ConflictCallback
): Promise<SyncResult> {
  const cached = quotationCache.getQuotationWithMeta(id)
  
  if (!cached) {
    return { success: false, error: 'Cotización no encontrada en caché' }
  }
  
  if (!cached.metadata.isDirty) {
    return { success: true, quotation: cached.data }
  }
  
  try {
    // Obtener versión actual del servidor
    const serverResponse = await fetch(`/api/quotation-config/${id}`)
    
    if (!serverResponse.ok) {
      throw new Error(`Error del servidor: ${serverResponse.status}`)
    }
    
    const serverData: QuotationConfig = await serverResponse.json()
    
    // Detectar conflictos
    const conflict = detectConflict(cached, serverData)
    
    if (conflict && onConflict) {
      // Hay conflicto, pedir resolución al usuario
      quotationCache.markConflict(id)
      tabSync.broadcastConflictDetected(id)
      
      const resolution = await onConflict(conflict)
      return await resolveConflict(id, conflict, resolution)
    } else if (conflict) {
      // Conflicto sin callback, retornar error
      quotationCache.markConflict(id)
      return { 
        success: false, 
        conflict,
        error: 'Conflicto detectado, se requiere resolución manual' 
      }
    }
    
    // Sin conflicto, guardar en servidor
    return await pushToServer(cached.data)
    
  } catch (error) {
    quotationCache.markSyncError(id, error instanceof Error ? error.message : 'Error desconocido')
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de sincronización' 
    }
  }
}

/**
 * Detecta si hay conflicto entre versión local y del servidor
 */
function detectConflict(
  cached: CachedQuotation, 
  serverData: QuotationConfig
): ConflictInfo | null {
  const serverVersion = serverData.versionNumber || 1
  const localVersion = cached.metadata.serverVersion
  
  // Si la versión del servidor es mayor, hay conflicto
  if (serverVersion > localVersion) {
    return {
      localVersion,
      serverVersion,
      localUpdatedAt: cached.metadata.cachedAt,
      serverUpdatedAt: serverData.updatedAt || new Date().toISOString(),
      conflictingFields: findConflictingFields(cached.data, serverData)
    }
  }
  
  return null
}

/**
 * Encuentra los campos que difieren entre versión local y servidor
 */
function findConflictingFields(local: QuotationConfig, server: QuotationConfig): string[] {
  const fields: string[] = []
  
  // Usar campos que realmente existen en QuotationConfig
  const keysToCheck: (keyof QuotationConfig)[] = [
    'numero',
    'empresa',
    'sector',
    'ubicacion',
    'presupuesto',
    'contenidoGeneral',
    'serviciosBaseTemplate',
    'serviciosOpcionalesTemplate'
  ]
  
  for (const key of keysToCheck) {
    if (JSON.stringify(local[key]) !== JSON.stringify(server[key])) {
      fields.push(key)
    }
  }
  
  return fields
}

/**
 * Resuelve un conflicto según la decisión del usuario
 */
async function resolveConflict(
  id: string,
  conflict: ConflictInfo,
  resolution: 'keep-local' | 'keep-server' | 'merge' | 'cancel'
): Promise<SyncResult> {
  const cached = quotationCache.getQuotationWithMeta(id)
  if (!cached) {
    return { success: false, error: 'Cotización no encontrada' }
  }
  
  switch (resolution) {
    case 'keep-local': {
      // Forzar guardado local, incrementando versión
      const localData = {
        ...cached.data,
        versionNumber: conflict.serverVersion + 1
      }
      const result = await pushToServer(localData)
      if (result.success) {
        tabSync.broadcastConflictResolved(id, 'keep-local')
      }
      return result
    }
      
    case 'keep-server': {
      // Descartar cambios locales, cargar del servidor
      const serverResponse = await fetch(`/api/quotation-config/${id}`)
      if (serverResponse.ok) {
        const serverData: QuotationConfig = await serverResponse.json()
        quotationCache.saveQuotation(serverData)
        quotationCache.markAsSynced(id, serverData.updatedAt || new Date().toISOString(), serverData.versionNumber || 1)
        tabSync.broadcastConflictResolved(id, 'keep-server')
        return { success: true, quotation: serverData }
      }
      return { success: false, error: 'Error al obtener datos del servidor' }
    }
      
    case 'merge':
      // Por ahora, merge = keep-local (se puede mejorar)
      // En una implementación más avanzada, se fusionarían campos específicos
      return resolveConflict(id, conflict, 'keep-local')
      
    case 'cancel':
      return { success: false, error: 'Sincronización cancelada por el usuario' }
      
    default:
      return { success: false, error: 'Resolución no válida' }
  }
}

/**
 * Envía datos al servidor
 */
async function pushToServer(quotation: QuotationConfig): Promise<SyncResult> {
  try {
    const response = await fetch(`/api/quotation-config/${quotation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotation)
    })
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const savedData: QuotationConfig = await response.json()
    
    // Actualizar caché con datos del servidor
    quotationCache.saveQuotation(savedData)
    quotationCache.markAsSynced(
      savedData.id,
      savedData.updatedAt || new Date().toISOString(),
      savedData.versionNumber || 1
    )
    
    // Notificar a otras pestañas
    tabSync.broadcastSyncCompleted(savedData.id)
    
    return { success: true, quotation: savedData }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al guardar' 
    }
  }
}

/**
 * Obtiene datos del servidor y actualiza el caché
 */
export async function pullFromServer(id: string): Promise<SyncResult> {
  try {
    const response = await fetch(`/api/quotation-config/${id}`)
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const serverData: QuotationConfig = await response.json()
    
    // Verificar si hay cambios locales
    const cached = quotationCache.getQuotationWithMeta(id)
    
    if (cached?.metadata.isDirty) {
      // Hay cambios locales, no sobrescribir
      return { 
        success: false, 
        error: 'Hay cambios locales sin guardar',
        quotation: cached.data
      }
    }
    
    // Actualizar caché
    quotationCache.saveQuotation(serverData)
    quotationCache.markAsSynced(
      id,
      serverData.updatedAt || new Date().toISOString(),
      serverData.versionNumber || 1
    )
    
    return { success: true, quotation: serverData }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al cargar' 
    }
  }
}

/**
 * Sincroniza todas las cotizaciones con cambios pendientes
 */
export async function syncAllDirty(
  onConflict?: ConflictCallback
): Promise<Map<string, SyncResult>> {
  const results = new Map<string, SyncResult>()
  const dirtyQuotations = quotationCache.getDirtyQuotations()
  
  for (const cached of dirtyQuotations) {
    const result = await syncQuotation(cached.data.id, onConflict)
    results.set(cached.data.id, result)
  }
  
  return results
}

/**
 * Verifica si hay conexión con el servidor
 */
export async function checkServerConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', { 
      method: 'HEAD',
      cache: 'no-store'
    })
    return response.ok
  } catch {
    return false
  }
}
