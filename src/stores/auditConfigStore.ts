/**
 * Zustand Store para la configuración de auditoría
 *
 * Maneja:
 * - Estado global de configuración de auditoría
 * - Sincronización con el servidor
 * - Persistencia en localStorage
 * - Reactivity automática a cambios
 *
 * Uso:
 * const { config, loadConfig, updateConfig } = useAuditConfigStore()
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuditConfigState, DEFAULT_AUDIT_CONFIG, AuditConfig } from './types/audit.types'
import { auditApi } from './utils/createAuditApi'

export const useAuditConfigStore = create<AuditConfigState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      ...DEFAULT_AUDIT_CONFIG,
      isLoading: false,
      error: null,
      isDirty: false,

      /**
       * Carga la configuración desde el servidor
       * Se ejecuta al inicializar la aplicación o cuando se recarga la página
       */
      loadConfig: async () => {
        set({ isLoading: true, error: null })
        try {
          const config = await auditApi.getConfig()
          set({
            ...config,
            isLoading: false,
            isDirty: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al cargar configuración',
          })
        }
      },

      /**
       * Actualiza un valor específico de la configuración
       * Primero actualiza localmente, luego envía al servidor
       * Si el servidor falla, revierte los cambios
       */
      updateConfig: async (key: keyof AuditConfig, value: AuditConfig[keyof AuditConfig]) => {
        const previousState = get()
        const newConfig = { ...previousState, [key]: value }

        // Actualizar estado localmente primero (optimistic update)
        set({
          ...newConfig,
          isDirty: true,
          isLoading: true,
        })

        try {
          // Enviar al servidor
          const updatedConfig = await auditApi.updateConfig({ [key]: value })

          // Confirmar cambios
          set({
            ...updatedConfig,
            isDirty: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // Revertir cambios si falla
          set({
            ...previousState,
            isDirty: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar configuración',
          })
          throw error
        }
      },

      /**
       * Reinicia la configuración a los valores por defecto
       */
      resetConfig: () => {
        set({
          ...DEFAULT_AUDIT_CONFIG,
          error: null,
          isDirty: false,
          isLoading: false,
        })
      },

      /**
       * Limpia el error actual
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * Marca el estado como limpio o sucio
       * Útil para controlar si hay cambios sin guardar
       */
      setDirty: (dirty: boolean) => {
        set({ isDirty: dirty })
      },
    }),

    {
      // Configuración de persistencia
      name: 'audit-config-store', // Clave en localStorage
      partialize: (state) => ({
        // Solo persistir la configuración, no el estado de carga/error
        retentionDays: state.retentionDays,
        enableAutoDelete: state.enableAutoDelete,
        enableDetailedLogging: state.enableDetailedLogging,
        enableSystemEvents: state.enableSystemEvents,
      }),
      // Opcional: Encriptar valores sensibles antes de guardar
      // storage: customStorage,
    }
  )
)

/**
 * Hook personalizado para acceder solo a la configuración
 * Útil cuando solo necesitas leer la config sin acciones
 */
export const useAuditConfig = () => {
  return useAuditConfigStore((state) => ({
    retentionDays: state.retentionDays,
    enableAutoDelete: state.enableAutoDelete,
    enableDetailedLogging: state.enableDetailedLogging,
    enableSystemEvents: state.enableSystemEvents,
  }))
}

/**
 * Hook personalizado para acceder solo a las acciones
 * Útil cuando solo necesitas actualizar la config
 */
export const useAuditConfigActions = () => {
  return useAuditConfigStore((state) => ({
    loadConfig: state.loadConfig,
    updateConfig: state.updateConfig,
    resetConfig: state.resetConfig,
  }))
}
