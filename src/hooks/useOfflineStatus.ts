/**
 * Hook para detectar estado de conexión online/offline
 */

import { useState, useEffect, useCallback } from 'react'

export interface OfflineStatus {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
}

export function useOfflineStatus(): OfflineStatus {
  const [status, setStatus] = useState<OfflineStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineAt: null,
    lastOfflineAt: null
  }))

  const handleOnline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: true,
      wasOffline: true,
      lastOnlineAt: new Date()
    }))
  }, [])

  const handleOffline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: false,
      lastOfflineAt: new Date()
    }))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificación inicial
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return status
}

export default useOfflineStatus
