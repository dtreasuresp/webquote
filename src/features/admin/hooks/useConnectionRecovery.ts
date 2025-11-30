/**
 * Hook para detectar recuperación de conexión y comparar datos
 * Cuando el usuario vuelve online, detecta diferencias entre caché y servidor
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { QuotationConfig } from '@/lib/types'
import { quotationCache } from '@/lib/cache'
import { syncManager } from '@/lib/cache'

export interface DataDifference {
  field: string
  cacheValue: any
  serverValue: any
}

export interface ConnectionRecoveryState {
  /** True si pasó de offline a online en esta sesión */
  wasOfflineNow: boolean
  /** True si hay diferencias entre caché y servidor */
  hasDifferences: boolean
  /** Datos del caché local */
  cacheData?: QuotationConfig
  /** Datos del servidor */
  serverData?: QuotationConfig
  /** Campos que tienen diferencias */
  differences?: DataDifference[]
  /** Si está comparando en este momento */
  isComparing: boolean
  /** Error en la comparación */
  error?: string
}

export interface UseConnectionRecoveryOptions {
  isOnline: boolean
  wasOffline: boolean
  quotationId: string | null
  enabled?: boolean
  onRecovery?: (state: ConnectionRecoveryState) => void
}

/**
 * Detecta cambios de offline a online y compara datos
 */
export function useConnectionRecovery({
  isOnline,
  wasOffline,
  quotationId,
  enabled = true,
  onRecovery
}: UseConnectionRecoveryOptions): ConnectionRecoveryState {
  const [state, setState] = useState<ConnectionRecoveryState>({
    wasOfflineNow: false,
    hasDifferences: false,
    isComparing: false
  })

  // Ref para detectar transición offline → online
  const wasOnlineRef = useRef(isOnline)
  const hasTriggeredRef = useRef(false)

  // Función para comparar datos
  const compareCacheWithServer = useCallback(async () => {
    if (!quotationId || !enabled) return

    setState(prev => ({ ...prev, isComparing: true, error: undefined }))

    try {
      // Obtener datos del caché
      const cachedData = quotationCache.getQuotationWithMeta(quotationId)
      if (!cachedData) {
        setState(prev => ({
          ...prev,
          isComparing: false,
          error: 'No hay datos en caché'
        }))
        return
      }

      // Obtener datos del servidor
      const serverResponse = await fetch(`/api/quotation-config/${quotationId}`)
      if (!serverResponse.ok) {
        throw new Error(`Error del servidor: ${serverResponse.status}`)
      }

      const serverData: QuotationConfig = await serverResponse.json()

      // Comparar campos
      const differences: DataDifference[] = []
      const keysToCheck: (keyof QuotationConfig)[] = [
        'numero',
        'empresa',
        'sector',
        'ubicacion',
        'presupuesto',
        'contenidoGeneral',
        'serviciosBaseTemplate',
        'serviciosOpcionalesTemplate',
        'moneda',
        'profesional',
        'empresaProveedor',
        'emailProveedor',
        'whatsappProveedor',
        'ubicacionProveedor',
        'tiempoVigenciaValor',
        'tiempoVigenciaUnidad',
        'heroTituloMain',
        'heroTituloSub'
      ]

      for (const key of keysToCheck) {
        const cacheValue = cachedData.data[key]
        const serverValue = serverData[key]

        // Comparar valores (convertir a JSON para comparación profunda)
        if (JSON.stringify(cacheValue) !== JSON.stringify(serverValue)) {
          differences.push({
            field: key,
            cacheValue,
            serverValue
          })
        }
      }

      const hasDifferences = differences.length > 0

      const newState: ConnectionRecoveryState = {
        wasOfflineNow: true,
        hasDifferences,
        cacheData: cachedData.data,
        serverData,
        differences: hasDifferences ? differences : undefined,
        isComparing: false
      }

      setState(newState)
      onRecovery?.(newState)

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setState(prev => ({
        ...prev,
        isComparing: false,
        error: errorMsg
      }))
    }
  }, [quotationId, enabled, onRecovery])

  // Detectar transición de offline a online
  useEffect(() => {
    // Transición de offline a online
    if (!wasOnlineRef.current && isOnline && wasOffline && enabled && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      compareCacheWithServer()
    }

    wasOnlineRef.current = isOnline
  }, [isOnline, wasOffline, enabled, compareCacheWithServer])

  // Reset cuando se desmonta o cambia quotationId
  useEffect(() => {
    return () => {
      hasTriggeredRef.current = false
    }
  }, [quotationId])

  return state
}

export default useConnectionRecovery
