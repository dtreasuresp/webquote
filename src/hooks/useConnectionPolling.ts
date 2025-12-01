/**
 * Hook para polling de conexión a BD configurable
 * 
 * Verifica periódicamente si hay conexión a la BD y notifica cuando
 * la conexión se restablece después de estar offline.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { syncManager } from '@/lib/cache'

export interface UseConnectionPollingOptions {
  /** Intervalo de polling en milisegundos (default: 30000 = 30s) */
  interval?: number
  /** Si el polling está habilitado */
  enabled?: boolean
  /** Callback cuando se detecta reconexión (offline → online) */
  onReconnect?: () => void
  /** Callback cuando se detecta desconexión (online → offline) */
  onDisconnect?: () => void
  /** Callback en cada verificación */
  onCheck?: (isConnected: boolean) => void
}

export interface UseConnectionPollingReturn {
  /** Estado actual de conexión */
  isConnected: boolean
  /** Si está verificando conexión ahora mismo */
  isChecking: boolean
  /** Si estaba offline y ahora está online (para mostrar modal) */
  hasReconnected: boolean
  /** Timestamp de la última verificación */
  lastChecked: Date | null
  /** Fuerza una verificación inmediata */
  checkNow: () => Promise<boolean>
  /** Reinicia el flag de reconexión (después de manejar el modal) */
  clearReconnectionFlag: () => void
  /** Pausa el polling */
  pause: () => void
  /** Reanuda el polling */
  resume: () => void
  /** Actualiza el intervalo de polling */
  setInterval: (ms: number) => void
}

export function useConnectionPolling(
  options: UseConnectionPollingOptions = {}
): UseConnectionPollingReturn {
  const {
    interval: initialInterval = 30000, // 30 segundos por defecto
    enabled = true,
    onReconnect,
    onDisconnect,
    onCheck
  } = options

  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [isChecking, setIsChecking] = useState<boolean>(false)
  const [hasReconnected, setHasReconnected] = useState<boolean>(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [currentInterval, setCurrentInterval] = useState<number>(initialInterval)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const previousConnectedRef = useRef<boolean>(true)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  
  // Refs para los callbacks para evitar re-renders del efecto
  const onReconnectRef = useRef(onReconnect)
  const onDisconnectRef = useRef(onDisconnect)
  const onCheckRef = useRef(onCheck)
  
  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onReconnectRef.current = onReconnect
    onDisconnectRef.current = onDisconnect
    onCheckRef.current = onCheck
  }, [onReconnect, onDisconnect, onCheck])

  /**
   * Verifica la conexión a la BD
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true)
    
    try {
      const connected = await syncManager.checkServerConnection()
      const wasConnected = previousConnectedRef.current
      
      setIsConnected(connected)
      setLastChecked(new Date())
      
      // Detectar transición offline → online
      if (!wasConnected && connected) {
        setHasReconnected(true)
        onReconnectRef.current?.()
      }
      
      // Detectar transición online → offline
      if (wasConnected && !connected) {
        onDisconnectRef.current?.()
      }
      
      previousConnectedRef.current = connected
      onCheckRef.current?.(connected)
      
      return connected
    } catch {
      setIsConnected(false)
      previousConnectedRef.current = false
      return false
    } finally {
      setIsChecking(false)
    }
  }, []) // Sin dependencias - usa refs

  /**
   * Limpia el flag de reconexión (llamar después de manejar el modal)
   */
  const clearReconnectionFlag = useCallback(() => {
    setHasReconnected(false)
  }, [])

  /**
   * Pausa el polling
   */
  const pause = useCallback(() => {
    setIsPaused(true)
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
  }, [])

  /**
   * Reanuda el polling
   */
  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  /**
   * Actualiza el intervalo de polling
   */
  const updateInterval = useCallback((ms: number) => {
    setCurrentInterval(ms)
  }, [])

  // Efecto para manejar el polling
  useEffect(() => {
    if (!enabled || isPaused) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
      return
    }

    // Limpiar intervalo anterior si existe
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
    }

    // Verificación inicial solo si no hay una verificación reciente
    if (!lastChecked) {
      checkConnection()
    }

    // Configurar intervalo
    intervalIdRef.current = setInterval(() => {
      checkConnection()
    }, currentInterval)

    console.log(`⏱️ Polling configurado: cada ${currentInterval / 1000} segundos`)

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, [enabled, isPaused, currentInterval]) // checkConnection removido de dependencias

  // También escuchar eventos de navegador online/offline
  useEffect(() => {
    const handleOnline = () => {
      // Verificar inmediatamente cuando el navegador reporta online
      checkConnection()
    }

    const handleOffline = () => {
      setIsConnected(false)
      previousConnectedRef.current = false
      onDisconnectRef.current?.()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkConnection])

  return {
    isConnected,
    isChecking,
    hasReconnected,
    lastChecked,
    checkNow: checkConnection,
    clearReconnectionFlag,
    pause,
    resume,
    setInterval: updateInterval
  }
}

export default useConnectionPolling
