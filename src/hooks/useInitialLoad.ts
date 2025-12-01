/**
 * Hook para manejar el flujo de carga inicial de la página administrador
 * 
 * Flujo de estados:
 * 1. welcome - "¡Bienvenido!"
 * 2. checking-connection - "Verificando conexión a BD..."
 * 3. syncing-from-db - "Sincronizando datos de BD a local..."
 * 4. updating-analytics - "Actualizando analítica..."
 * 5. synced - "Sincronizado con BD"
 * 6. offline-cached - "Sin conexión a BD. Mostrando datos locales"
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export type InitialLoadPhase = 
  | 'welcome'
  | 'checking-connection'
  | 'syncing-from-db'
  | 'updating-analytics'
  | 'synced'
  | 'offline-cached'
  | 'offline-empty'  // Nueva fase: sin conexión Y sin datos en cache
  | 'reconnecting'   // Nueva fase: conexión restablecida, sincronizando
  | 'merging'
  | 'comparing'
  | 'error'

export interface InitialLoadState {
  /** Fase actual del proceso de carga */
  phase: InitialLoadPhase
  /** Si hay conexión a la BD */
  isConnected: boolean
  /** Si la carga inicial ha completado */
  isComplete: boolean
  /** Mensaje de error si hay alguno */
  error: string | null
  /** Progreso de carga (0-100) */
  progress: number
}

export interface UseInitialLoadOptions {
  /** Callback cuando se completa la carga */
  onComplete?: (isConnected: boolean) => void
  /** Callback cuando hay error */
  onError?: (error: string) => void
  /** Delay inicial para mostrar "Bienvenido" (ms) */
  welcomeDelay?: number
  /** Callback para cargar snapshots */
  loadSnapshots?: () => Promise<void>
  /** Callback para cargar quotations */
  loadQuotations?: () => Promise<void>
  /** Callback para cargar preferences */
  loadPreferences?: () => Promise<void>
  /** Callback para cargar config de BD */
  loadConfig?: () => Promise<void>
  /** Callback para actualizar analytics */
  updateAnalytics?: () => Promise<void>
  /** Función para verificar si hay datos en cache local */
  hasCachedData?: () => boolean
}

export interface UseInitialLoadReturn extends InitialLoadState {
  /** Reinicia el proceso de carga */
  reload: () => Promise<void>
  /** Fuerza una fase específica (para debugging/testing) */
  setPhase: (phase: InitialLoadPhase) => void
}

export function useInitialLoad(options: UseInitialLoadOptions = {}): UseInitialLoadReturn {
  const [state, setState] = useState<InitialLoadState>({
    phase: 'welcome',
    isConnected: false,
    isComplete: false,
    error: null,
    progress: 0
  })

  // Refs para evitar problemas de closures y re-renders
  const hasRunRef = useRef(false)
  const isMountedRef = useRef(true)
  const optionsRef = useRef(options)
  
  // Actualizar optionsRef en cada render
  optionsRef.current = options

  const updateState = useCallback((updates: Partial<InitialLoadState>) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  const setPhase = useCallback((phase: InitialLoadPhase) => {
    updateState({ phase })
  }, [updateState])

  /**
   * Verifica la conexión a la BD haciendo un fetch simple
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    console.log('🔍 [checkConnection] Iniciando verificación de conexión...')
    try {
      // Timeout de 5 segundos para evitar cuelgues
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      console.log('🔍 [checkConnection] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [checkConnection] Response data:', data)
        return data.status === 'ok'
      }
      return false
    } catch (error) {
      console.error('🔍 [checkConnection] Error en fetch:', error)
      return false
    }
  }, [])

  // Ref para rastrear si está completo (evita dependencia en useEffect)
  const isCompleteRef = useRef(false)
  
  // Actualizar ref cuando cambia el estado
  useEffect(() => {
    isCompleteRef.current = state.isComplete
  }, [state.isComplete])

  // Ejecutar carga inicial al montar - solo una vez
  useEffect(() => {
    // React Strict Mode ejecuta efectos 2 veces en dev
    // Usamos isMountedRef para controlar esto
    isMountedRef.current = true
    
    // Si ya se ejecutó y completó, no volver a ejecutar
    if (hasRunRef.current && isCompleteRef.current) {
      console.log('⚠️ [useInitialLoad] Ya completado, saltando...')
      return
    }
    
    console.log('🎬 [useInitialLoad] Iniciando flujo de carga inicial...')

    const runInitialLoad = async () => {
      // Marcar como ejecutándose
      hasRunRef.current = true
      
      try {
        // === FASE 1: Bienvenido ===
        console.log('🚀 [useInitialLoad] Fase 1: Welcome')
        updateState({ phase: 'welcome', progress: 0 })
        
        const welcomeDelay = optionsRef.current.welcomeDelay ?? 800
        console.log(`⏱️ [useInitialLoad] Esperando ${welcomeDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, welcomeDelay))
        
        if (!isMountedRef.current) {
          console.log('⚠️ [useInitialLoad] Componente desmontado durante welcome, abortando...')
          hasRunRef.current = false // Permitir re-ejecución si se vuelve a montar
          return
        }

        // === FASE 2: Verificando conexión ===
        console.log('🔌 [useInitialLoad] Fase 2: Checking connection')
        updateState({ phase: 'checking-connection', progress: 10 })
        
        const isConnected = await checkConnection()
        console.log('🔌 [useInitialLoad] Conexión resultado:', isConnected)
        
        if (!isMountedRef.current) {
          hasRunRef.current = false
          return
        }

        updateState({ isConnected, progress: 20 })

        if (isConnected) {
          // === FASE 3: Sincronizando desde BD ===
          console.log('📥 [useInitialLoad] Fase 3: Syncing from DB')
          updateState({ phase: 'syncing-from-db', progress: 30 })
          
          // Cargar datos en paralelo usando los callbacks de optionsRef
          const opts = optionsRef.current
          const loadPromises: Promise<void>[] = []
          
          if (opts.loadSnapshots) loadPromises.push(opts.loadSnapshots().catch(e => console.error('Error loadSnapshots:', e)))
          if (opts.loadQuotations) loadPromises.push(opts.loadQuotations().catch(e => console.error('Error loadQuotations:', e)))
          if (opts.loadPreferences) loadPromises.push(opts.loadPreferences().catch(e => console.error('Error loadPreferences:', e)))
          if (opts.loadConfig) loadPromises.push(opts.loadConfig().catch(e => console.error('Error loadConfig:', e)))
          
          console.log(`📥 [useInitialLoad] Ejecutando ${loadPromises.length} callbacks de carga...`)
          
          if (loadPromises.length > 0) {
            await Promise.allSettled(loadPromises)
          }
          
          if (!isMountedRef.current) {
            hasRunRef.current = false
            return
          }
          
          updateState({ progress: 70 })

          // === FASE 4: Actualizando analítica ===
          console.log('📊 [useInitialLoad] Fase 4: Updating analytics')
          updateState({ phase: 'updating-analytics', progress: 80 })
          
          if (opts.updateAnalytics) {
            try {
              await opts.updateAnalytics()
            } catch (analyticsError) {
              console.warn('Error actualizando analytics:', analyticsError)
            }
          }
          
          if (!isMountedRef.current) {
            hasRunRef.current = false
            return
          }
          
          // === FASE 5: Sincronizado ===
          console.log('✅ [useInitialLoad] Fase 5: Synced')
          updateState({ 
            phase: 'synced', 
            progress: 100, 
            isComplete: true 
          })
          isCompleteRef.current = true
          
        } else {
          // === FASE 6: Sin conexión, usar caché ===
          console.log('📦 [useInitialLoad] Fase 6: Offline - verificando cache...')
          
          // Verificar si hay datos en cache
          const hasCache = optionsRef.current.hasCachedData?.() ?? false
          
          if (hasCache) {
            console.log('📦 [useInitialLoad] Cache disponible, cargando datos locales...')
            updateState({ phase: 'offline-cached', progress: 30 })
          } else {
            console.log('⚠️ [useInitialLoad] Sin cache disponible')
            updateState({ phase: 'offline-empty', progress: 30 })
          }
          
          // Intentar cargar datos de todas formas (pueden venir de caché local)
          const opts = optionsRef.current
          const loadPromises: Promise<void>[] = []
          
          if (opts.loadSnapshots) loadPromises.push(opts.loadSnapshots().catch(() => {}))
          if (opts.loadQuotations) loadPromises.push(opts.loadQuotations().catch(() => {}))
          if (opts.loadPreferences) loadPromises.push(opts.loadPreferences().catch(() => {}))
          if (opts.loadConfig) loadPromises.push(opts.loadConfig().catch(() => {}))
          
          if (loadPromises.length > 0) {
            await Promise.allSettled(loadPromises)
          }
          
          // Re-verificar después de intentar cargar
          const finalPhase = hasCache ? 'offline-cached' : 'offline-empty'
          
          updateState({ 
            phase: finalPhase, 
            progress: 100, 
            isComplete: true 
          })
          isCompleteRef.current = true
        }

        optionsRef.current.onComplete?.(isConnected)
        console.log('🎉 [useInitialLoad] Flujo completado!')
        
      } catch (error) {
        console.error('❌ [useInitialLoad] Error en flujo:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        updateState({ 
          phase: 'error', 
          error: errorMessage, 
          isComplete: true 
        })
        isCompleteRef.current = true
        optionsRef.current.onError?.(errorMessage)
      }
    }

    // Ejecutar inmediatamente
    runInitialLoad()

    return () => {
      console.log('🧹 [useInitialLoad] Cleanup - desmontando...')
      isMountedRef.current = false
      // En Strict Mode, permitir que se re-ejecute si el proceso no completó
      if (!isCompleteRef.current) {
        console.log('🧹 [useInitialLoad] Reset hasRunRef porque no completó')
        hasRunRef.current = false
      }
    }
  }, [checkConnection, updateState]) // Sin state.isComplete para evitar loop

  /**
   * Reinicia el proceso de carga
   */
  const reload = useCallback(async () => {
    console.log('🔄 [useInitialLoad] Reiniciando carga...')
    hasRunRef.current = false
    updateState({
      phase: 'welcome',
      isConnected: false,
      isComplete: false,
      error: null,
      progress: 0
    })
  }, [updateState])

  return {
    ...state,
    reload,
    setPhase
  }
}

export default useInitialLoad
