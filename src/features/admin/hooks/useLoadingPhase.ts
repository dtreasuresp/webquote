/**
 * Hook que mapea el estado de carga real a fases visuales
 * 
 * FLUJO DE ESTADOS:
 * 1. welcome - "¡Bienvenido!" (estado inicial al abrir página)
 * 2. checking-connection - "Verificando conexión a BD..."
 * 3. syncing-from-db - "Sincronizando datos de BD a local (caché)..."
 * 4. updating-analytics - "Actualizando analítica..."
 * 5. synced - "Sincronizado con BD ✓"
 * 6. offline-cached - "Sin conexión a BD. Mostrando datos locales"
 * 7. merging - "Fusionando datos..."
 * 8. comparing - "Comparando diferencias..."
 * 9. error - "Error de sincronización"
 */

import { useState, useEffect, useCallback } from 'react'
import type { SyncStatus } from '@/lib/cache/types'
import type { InitialLoadPhase } from '@/hooks/useInitialLoad'

// Tipo unificado que incluye todas las fases posibles
export type LoadingPhase = InitialLoadPhase

export interface UseLoadingPhaseOptions {
  /** Fase del proceso de carga inicial (de useInitialLoad) */
  initialLoadPhase?: InitialLoadPhase
  /** Si está cargando datos de cotización específica */
  isLoading?: boolean
  /** Estado de sincronización de cotización */
  syncStatus?: SyncStatus | null
  /** Si hay conexión a BD */
  isConnected?: boolean
}

export interface UseLoadingPhaseReturn {
  /** Fase visual actual */
  phase: LoadingPhase
  /** Texto descriptivo de la fase */
  phaseText: string
  /** Si está en un estado de carga activa */
  isActiveLoading: boolean
  /** Si el proceso inicial ha completado */
  isInitialLoadComplete: boolean
  /** Forzar una fase específica */
  setPhase: (phase: LoadingPhase) => void
}

// Textos para cada fase
const PHASE_TEXTS: Record<LoadingPhase, string> = {
  'welcome': '¡Bienvenido!',
  'checking-connection': 'Verificando conexión a BD...',
  'syncing-from-db': 'Sincronizando datos de BD a local...',
  'updating-analytics': 'Actualizando analítica...',
  'synced': 'Sincronizado con BD',
  'offline-cached': 'Sin conexión a BD. Mostrando datos locales',
  'merging': 'Fusionando datos...',
  'comparing': 'Comparando diferencias...',
  'error': 'Error de sincronización'
}

// Fases que indican carga activa
const ACTIVE_LOADING_PHASES = new Set<LoadingPhase>([
  'checking-connection',
  'syncing-from-db',
  'updating-analytics',
  'merging',
  'comparing'
])

/**
 * Hook que unifica el estado de carga visual
 * 
 * Combina:
 * - Estado de carga inicial de la página (useInitialLoad)
 * - Estado de sincronización de cotizaciones (useQuotationCache)
 */
export function useLoadingPhase(options: UseLoadingPhaseOptions = {}): UseLoadingPhaseReturn {
  const {
    initialLoadPhase = 'welcome',
    isLoading = false,
    syncStatus = null,
    isConnected = true
  } = options

  const [overridePhase, setOverridePhase] = useState<LoadingPhase | null>(null)

  // Determinar la fase actual basándose en prioridad
  const determinePhase = useCallback((): LoadingPhase => {
    // Si hay un override manual, usarlo
    if (overridePhase) {
      return overridePhase
    }

    // Prioridad 1: Fase de carga inicial (si no ha completado)
    if (initialLoadPhase !== 'synced' && initialLoadPhase !== 'offline-cached' && initialLoadPhase !== 'error') {
      return initialLoadPhase
    }

    // Prioridad 2: Estado de sincronización de cotización
    if (syncStatus === 'syncing') {
      return 'syncing-from-db'
    }

    if (syncStatus === 'conflict') {
      return 'comparing'
    }

    if (syncStatus === 'error') {
      return 'error'
    }

    // Prioridad 3: Si está cargando cotización específica
    if (isLoading) {
      return 'syncing-from-db'
    }

    // Prioridad 4: Estado final basado en conexión
    if (!isConnected) {
      return 'offline-cached'
    }

    if (syncStatus === 'synced' || initialLoadPhase === 'synced') {
      return 'synced'
    }

    // Default: usar la fase de carga inicial
    return initialLoadPhase
  }, [initialLoadPhase, isLoading, syncStatus, isConnected, overridePhase])

  const phase = determinePhase()
  const phaseText = PHASE_TEXTS[phase] || 'Cargando...'
  const isActiveLoading = ACTIVE_LOADING_PHASES.has(phase)
  const isInitialLoadComplete = phase === 'synced' || phase === 'offline-cached' || phase === 'error'

  // Función para forzar una fase (útil para merging, comparing, etc.)
  const setPhase = useCallback((newPhase: LoadingPhase) => {
    setOverridePhase(newPhase)
  }, [])

  // Limpiar override cuando cambia la fase inicial a un estado final
  useEffect(() => {
    if (initialLoadPhase === 'synced' || initialLoadPhase === 'offline-cached') {
      // Solo limpiar si el override no es un estado de acción del usuario
      if (overridePhase && !['merging', 'comparing'].includes(overridePhase)) {
        setOverridePhase(null)
      }
    }
  }, [initialLoadPhase, overridePhase])

  return {
    phase,
    phaseText,
    isActiveLoading,
    isInitialLoadComplete,
    setPhase
  }
}

export default useLoadingPhase
