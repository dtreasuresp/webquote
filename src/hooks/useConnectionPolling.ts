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
        onReconnect?.()
      }
      
      // Detectar transición online → offline
      if (wasConnected && !connected) {
        onDisconnect?.()
      }
      
      previousConnectedRef.current = connected
      onCheck?.(connected)
      
      return connected
    } catch {
      setIsConnected(false)
      previousConnectedRef.current = false
      return false
    } finally {
      setIsChecking(false)
    }
  }, [onReconnect, onDisconnect, onCheck])

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

    // Verificación inicial
    checkConnection()

    // Configurar intervalo
    intervalIdRef.current = setInterval(() => {
      checkConnection()
    }, currentInterval)

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, [enabled, isPaused, currentInterval, checkConnection])

  // También escuchar eventos de navegador online/offline
  useEffect(() => {
    const handleOnline = () => {
      // Verificar inmediatamente cuando el navegador reporta online
      checkConnection()
    }

    const handleOffline = () => {
      setIsConnected(false)
      previousConnectedRef.current = false
      onDisconnect?.()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkConnection, onDisconnect])

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
