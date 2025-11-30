/**
 * Hook para auto-guardado local cada N segundos
 */

import { useEffect, useRef, useCallback } from 'react'
import { quotationCache } from '@/lib/cache'
import type { QuotationConfig } from '@/lib/types'

export interface UseAutoSaveOptions {
  /** Intervalo de auto-guardado en milisegundos (default: 5000) */
  interval?: number
  /** Si el auto-guardado está habilitado (default: true) */
  enabled?: boolean
  /** Callback cuando se guarda */
  onSave?: (success: boolean) => void
  /** Callback cuando hay error */
  onError?: (error: Error) => void
}

export interface UseAutoSaveReturn {
  /** Fuerza un guardado inmediato */
  saveNow: () => boolean
  /** Reinicia el timer de auto-guardado */
  resetTimer: () => void
  /** Pausa el auto-guardado */
  pause: () => void
  /** Reanuda el auto-guardado */
  resume: () => void
  /** Indica si el auto-guardado está activo */
  isActive: boolean
}

export function useAutoSave(
  quotation: QuotationConfig | null,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const {
    interval = 5000, // 5 segundos por defecto
    enabled = true,
    onSave,
    onError
  } = options

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isPausedRef = useRef(false)
  const lastSavedRef = useRef<string | null>(null)

  // Función para guardar en caché local
  const saveToCache = useCallback((): boolean => {
    if (!quotation?.id) return false

    try {
      // Serializar para comparar
      const serialized = JSON.stringify(quotation)
      
      // Si no hay cambios desde el último guardado, no hacer nada
      if (serialized === lastSavedRef.current) {
        return true
      }

      // Guardar como "dirty" (pendiente de sincronización con servidor)
      const success = quotationCache.saveQuotationDirty(quotation)
      
      if (success) {
        lastSavedRef.current = serialized
        onSave?.(true)
      } else {
        onSave?.(false)
      }
      
      return success
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Error al guardar'))
      return false
    }
  }, [quotation, onSave, onError])

  // Función para guardar inmediatamente
  const saveNow = useCallback((): boolean => {
    return saveToCache()
  }, [saveToCache])

  // Función para reiniciar el timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    if (enabled && !isPausedRef.current) {
      timerRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          saveToCache()
        }
      }, interval)
    }
  }, [enabled, interval, saveToCache])

  // Pausar auto-guardado
  const pause = useCallback(() => {
    isPausedRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Reanudar auto-guardado
  const resume = useCallback(() => {
    isPausedRef.current = false
    resetTimer()
  }, [resetTimer])

  // Efecto para iniciar/detener el timer
  useEffect(() => {
    if (enabled && quotation?.id && !isPausedRef.current) {
      resetTimer()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [enabled, quotation?.id, resetTimer])

  // Guardar antes de cerrar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (quotation?.id) {
        saveToCache()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [quotation?.id, saveToCache])

  // Guardar cuando cambia la visibilidad (usuario cambia de pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && quotation?.id) {
        saveToCache()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [quotation?.id, saveToCache])

  return {
    saveNow,
    resetTimer,
    pause,
    resume,
    isActive: enabled && !isPausedRef.current && !!timerRef.current
  }
}

export default useAutoSave
