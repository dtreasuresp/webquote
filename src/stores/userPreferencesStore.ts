import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences } from '@/lib/types'
import type { UserPreferencesState } from './types/userPreferences.types'

// Debounce timer for sync updates (500ms)
let debounceTimer: NodeJS.Timeout | null = null
let retryCount = 0
const MAX_RETRIES = 3
const DEBOUNCE_DELAY = 500

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      // Defaults
      id: '',
      userId: '',
      cerrarModalAlGuardar: true,
      mostrarConfirmacionGuardado: true,
      validarDatosAntes: true,
      limpiarFormulariosAlCrear: false,
      mantenerDatosAlCrearCotizacion: false,
      guardarAutomaticamente: true,
      destinoGuardado: 'ambos',
      intervaloVerificacionConexion: 30,
      unidadIntervaloConexion: 'segundos',
      sincronizarAlRecuperarConexion: true,
      mostrarNotificacionCacheLocal: true,
      // Audit preferences
      auditRetentionDays: 90,
      auditAutoPurgeEnabled: false,
      auditAutoPurgeFrequency: 'weekly',
      auditAutoReportEnabled: false,
      auditAutoReportPeriod: 'weekly',
      // Auto-report scheduling
      auditAutoReportHour: 1,
      auditAutoReportMinute: 0,
      auditReportRetentionDays: 90,
      notifyOnManualReport: true,
      notifyOnAutoReport: true,
      // Auto-backup scheduling
      autoBackupEnabled: false,
      autoBackupPeriod: 'weekly',
      autoBackupHour: 2,
      autoBackupMinute: 0,
      autoBackupRetentionDays: 30,
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Runtime
      isLoading: false,
      error: null,
      isDirty: false,

      // Actions
      loadPreferences: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/preferences')
          if (!res.ok) throw new Error('Error loading preferences')
          const response = await res.json()
          // Handle both response formats for backwards compatibility
          const data: UserPreferences = response.data || response
          set({ ...data, isLoading: false, isDirty: false, error: null })
        } catch (error: any) {
          set({ error: error?.message || String(error), isLoading: false })
        }
      },

      updatePreferences: async (patch: Partial<UserPreferences>) => {
        // Optimistic update
        const prev = { ...get() }
        set({ ...patch, isDirty: true, error: null })
        try {
          const res = await fetch('/api/preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
          })
          if (!res.ok) throw new Error('Error updating preferences')
          const data: UserPreferences = await res.json()
          set({ ...data, isDirty: false })
        } catch (error: any) {
          // revert
          set({ ...prev as any, error: error?.message || String(error), isDirty: false })
        }
      },

      // Sync version for immediate UI updates without waiting for API
      // With debounce (500ms) and retry logic for resilience
      updatePreferencesSync: (patch: Partial<UserPreferences>) => {
        set({ ...patch, isDirty: true, error: null })
        
        // Clear existing debounce timer
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        
        retryCount = 0
        
        // Debounced API call with retry logic
        debounceTimer = setTimeout(async () => {
          const attemptUpdate = async (attempt: number): Promise<boolean> => {
            try {
              const res = await fetch('/api/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
              })
              
              if (!res.ok) {
                const errorMsg = `API Error: ${res.status}`
                set({ error: errorMsg })
                
                // Retry on server errors (5xx)
                if (res.status >= 500 && attempt < MAX_RETRIES) {
                  console.warn(`Retrying preference update (attempt ${attempt + 1}/${MAX_RETRIES})`)
                  // Exponential backoff: 1s, 2s, 4s
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
                  return attemptUpdate(attempt + 1)
                }
                return false
              }
              
              const data: UserPreferences = await res.json()
              // Only update isDirty - keep local values intact
              set((state) => ({ 
                ...state,
                isDirty: false,
                error: null,
                updatedAt: data.updatedAt || new Date().toISOString(),
              }))
              return true
            } catch (error: Error | any) {
              console.error('Error updating preferences:', error)
              
              // Retry on network errors
              if (attempt < MAX_RETRIES) {
                console.warn(`Retrying preference update (attempt ${attempt + 1}/${MAX_RETRIES})`)
                // Exponential backoff: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
                return attemptUpdate(attempt + 1)
              }
              
              set({ error: error.message || 'Error updating preferences' })
              return false
            }
          }
          
          await attemptUpdate(0)
        }, DEBOUNCE_DELAY)
      },

      resetPreferences: () => {
        set({
          cerrarModalAlGuardar: true,
          mostrarConfirmacionGuardado: true,
          validarDatosAntes: true,
          limpiarFormulariosAlCrear: false,
          mantenerDatosAlCrearCotizacion: false,
          guardarAutomaticamente: true,
          destinoGuardado: 'ambos',
          intervaloVerificacionConexion: 30,
          unidadIntervaloConexion: 'segundos',
          sincronizarAlRecuperarConexion: true,
          mostrarNotificacionCacheLocal: true,
          auditRetentionDays: 90,
          auditAutoPurgeEnabled: false,
          auditAutoPurgeFrequency: 'weekly',
          auditAutoReportEnabled: false,
          auditAutoReportPeriod: 'weekly',
          auditAutoReportHour: 1,
          auditAutoReportMinute: 0,
          autoBackupEnabled: false,
          autoBackupPeriod: 'weekly',
          autoBackupHour: 2,
          autoBackupMinute: 0,
          autoBackupRetentionDays: 30,
          isDirty: false,
          error: null,
        } as Partial<UserPreferences>)
      },

      // Ensure we can persist the current preferences payload explicitly
      persistPreferences: async () => {
        const state = get()
        const payload: Partial<UserPreferences> = {
          cerrarModalAlGuardar: state.cerrarModalAlGuardar,
          mostrarConfirmacionGuardado: state.mostrarConfirmacionGuardado,
          validarDatosAntes: state.validarDatosAntes,
          limpiarFormulariosAlCrear: state.limpiarFormulariosAlCrear,
          mantenerDatosAlCrearCotizacion: state.mantenerDatosAlCrearCotizacion,
          guardarAutomaticamente: state.guardarAutomaticamente,
          destinoGuardado: state.destinoGuardado,
          intervaloVerificacionConexion: state.intervaloVerificacionConexion,
          unidadIntervaloConexion: state.unidadIntervaloConexion,
          sincronizarAlRecuperarConexion: state.sincronizarAlRecuperarConexion,
          mostrarNotificacionCacheLocal: state.mostrarNotificacionCacheLocal,
          auditRetentionDays: state.auditRetentionDays,
          auditAutoPurgeEnabled: state.auditAutoPurgeEnabled,
          auditAutoPurgeFrequency: state.auditAutoPurgeFrequency,
          auditAutoReportEnabled: state.auditAutoReportEnabled,
          auditAutoReportPeriod: state.auditAutoReportPeriod,
          auditAutoReportHour: state.auditAutoReportHour,
          auditAutoReportMinute: state.auditAutoReportMinute,
          autoBackupEnabled: state.autoBackupEnabled,
          autoBackupPeriod: state.autoBackupPeriod,
          autoBackupHour: state.autoBackupHour,
          autoBackupMinute: state.autoBackupMinute,
          autoBackupRetentionDays: state.autoBackupRetentionDays,
        }
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) throw new Error('Error persisting preferences')
          const data: UserPreferences = await res.json()
          // Update with returned data and mark as saved
          set({
            ...data,
            isDirty: false,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({ error: error?.message || String(error), isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
      setDirty: (dirty: boolean) => set({ isDirty: dirty }),
    }),
    {
      name: 'user-preferences-store',
      partialize: (state) => ({
        // Persist actual preferences, not runtime flags
        id: state.id,
        userId: state.userId,
        cerrarModalAlGuardar: state.cerrarModalAlGuardar,
        mostrarConfirmacionGuardado: state.mostrarConfirmacionGuardado,
        validarDatosAntes: state.validarDatosAntes,
        limpiarFormulariosAlCrear: state.limpiarFormulariosAlCrear,
        mantenerDatosAlCrearCotizacion: state.mantenerDatosAlCrearCotizacion,
        guardarAutomaticamente: state.guardarAutomaticamente,
        destinoGuardado: state.destinoGuardado,
        intervaloVerificacionConexion: state.intervaloVerificacionConexion,
        unidadIntervaloConexion: state.unidadIntervaloConexion,
        sincronizarAlRecuperarConexion: state.sincronizarAlRecuperarConexion,
        mostrarNotificacionCacheLocal: state.mostrarNotificacionCacheLocal,
        // Include ALL audit preferences
        auditRetentionDays: state.auditRetentionDays,
        auditAutoPurgeEnabled: state.auditAutoPurgeEnabled,
        auditAutoPurgeFrequency: state.auditAutoPurgeFrequency,
        auditAutoReportEnabled: state.auditAutoReportEnabled,
        auditAutoReportPeriod: state.auditAutoReportPeriod,
        auditAutoReportHour: state.auditAutoReportHour,
        auditAutoReportMinute: state.auditAutoReportMinute,
        // Include backup preferences
        autoBackupEnabled: state.autoBackupEnabled,
        autoBackupPeriod: state.autoBackupPeriod,
        autoBackupHour: state.autoBackupHour,
        autoBackupMinute: state.autoBackupMinute,
        autoBackupRetentionDays: state.autoBackupRetentionDays,
      }),
    }
  )
)

export default useUserPreferencesStore
