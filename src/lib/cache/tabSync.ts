/**
 * Sincronización entre pestañas del navegador
 * Usa BroadcastChannel API para comunicación en tiempo real
 */

import type { TabSyncEvent } from './types'

const CHANNEL_NAME = 'webquote_sync'

type TabSyncCallback = (event: TabSyncEvent) => void

let channel: BroadcastChannel | null = null
const listeners: Set<TabSyncCallback> = new Set()

/**
 * Inicializa el canal de sincronización entre pestañas
 */
export function initTabSync(): boolean {
  if (globalThis.window === undefined) return false
  
  // Verificar soporte de BroadcastChannel
  if (!('BroadcastChannel' in globalThis)) {
    console.warn('[TabSync] BroadcastChannel no soportado en este navegador')
    return false
  }
  
  if (channel) {
    console.warn('[TabSync] Canal ya inicializado')
    return true
  }
  
  try {
    channel = new BroadcastChannel(CHANNEL_NAME)
    
    channel.onmessage = (event: MessageEvent<TabSyncEvent>) => {
      handleIncomingEvent(event.data)
    }
    
    channel.onmessageerror = (error) => {
      console.error('[TabSync] Error en mensaje:', error)
    }
    
    console.log('[TabSync] Canal inicializado correctamente')
    return true
  } catch (error) {
    console.error('[TabSync] Error al inicializar canal:', error)
    return false
  }
}

/**
 * Cierra el canal de sincronización
 */
export function closeTabSync(): void {
  if (channel) {
    channel.close()
    channel = null
    listeners.clear()
    console.log('[TabSync] Canal cerrado')
  }
}

/**
 * Envía un evento de actualización de cotización
 */
export function broadcastQuotationUpdate(quotationId: string, fields?: string[]): void {
  broadcast({
    type: 'quotation_updated',
    quotationId,
    timestamp: Date.now(),
    tabId: getTabId(),
    payload: { fields }
  })
}

/**
 * Envía un evento de sincronización completada
 */
export function broadcastSyncCompleted(quotationId: string): void {
  broadcast({
    type: 'sync_completed',
    quotationId,
    timestamp: Date.now(),
    tabId: getTabId()
  })
}

/**
 * Envía un evento de conflicto detectado
 */
export function broadcastConflictDetected(quotationId: string): void {
  broadcast({
    type: 'conflict_detected',
    quotationId,
    timestamp: Date.now(),
    tabId: getTabId()
  })
}

/**
 * Envía un evento de resolución de conflicto
 */
export function broadcastConflictResolved(quotationId: string, resolution: string): void {
  broadcast({
    type: 'conflict_resolved',
    quotationId,
    timestamp: Date.now(),
    tabId: getTabId(),
    payload: { resolution }
  })
}

/**
 * Envía un evento de solicitud de estado
 */
export function requestStateSync(quotationId: string): void {
  broadcast({
    type: 'request_state',
    quotationId,
    timestamp: Date.now(),
    tabId: getTabId()
  })
}

/**
 * Suscribe un callback para recibir eventos de sincronización
 */
export function onTabSync(callback: TabSyncCallback): () => void {
  listeners.add(callback)
  
  // Retorna función de cleanup
  return () => {
    listeners.delete(callback)
  }
}

/**
 * Suscribe a eventos de una cotización específica
 */
export function onQuotationSync(
  quotationId: string, 
  callback: TabSyncCallback
): () => void {
  const wrappedCallback: TabSyncCallback = (event) => {
    if (event.quotationId === quotationId) {
      callback(event)
    }
  }
  
  listeners.add(wrappedCallback)
  
  return () => {
    listeners.delete(wrappedCallback)
  }
}

/**
 * Envía un evento genérico
 */
function broadcast(event: TabSyncEvent): void {
  if (!channel) {
    console.warn('[TabSync] Canal no inicializado, evento no enviado:', event.type)
    return
  }
  
  try {
    channel.postMessage(event)
  } catch (error) {
    console.error('[TabSync] Error al enviar evento:', error)
  }
}

/**
 * Maneja eventos entrantes
 */
function handleIncomingEvent(event: TabSyncEvent): void {
  // Ignorar eventos de la misma pestaña
  if (event.tabId === getTabId()) return
  
  console.log('[TabSync] Evento recibido:', event.type, event.quotationId)
  
  // Notificar a todos los listeners
  for (const callback of listeners) {
    try {
      callback(event)
    } catch (error) {
      console.error('[TabSync] Error en listener:', error)
    }
  }
}

/**
 * Obtiene/genera un ID único para esta pestaña
 */
let tabId: string | null = null

function getTabId(): string {
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }
  return tabId
}

/**
 * Verifica si el canal está activo
 */
export function isTabSyncActive(): boolean {
  return channel !== null
}

/**
 * Obtiene el ID de la pestaña actual
 */
export function getCurrentTabId(): string {
  return getTabId()
}
