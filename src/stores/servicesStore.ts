/**
 * Services Store
 * Centralized state management for services (base + optional)
 * Replaces 8 useState hooks from AdminPage
 *
 * Mapped useState:
 * - serviciosBase → baseServices[]
 * - nuevoServicioBase → newBaseService
 * - editandoServicioBaseId → editingBaseId
 * - servicioBaseEditando → editingBase
 * - nuevoServicio → newService
 * - editandoServicioId → editingId
 * - servicioEditando → editing
 * - serviciosOpcionales → optionalServices[]
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ServicesStore, DEFAULT_SERVICES_STATE, ServicioBase, Servicio } from './types/services.types'
import { servicesApi } from './utils/servicesApi'

export const useServicesStore = create<ServicesStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_SERVICES_STATE,

      // ===== BASE SERVICES =====

      loadBaseServices: async () => {
        set({ isLoading: true, errors: {} })
        try {
          const data = await servicesApi.getBaseServices()
          set({ baseServices: data, isLoading: false })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error loading base services'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      addBaseService: async (data: Partial<ServicioBase>) => {
        set({ isLoading: true, errors: {} })
        try {
          const created = await servicesApi.createBaseService(data)
          set((state) => ({
            baseServices: [...state.baseServices, created],
            newBaseService: {},
            isLoading: false,
          }))
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error creating base service'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      updateBaseService: async (id: string, data: Partial<ServicioBase>) => {
        set({ isLoading: true, errors: {} })
        try {
          const updated = await servicesApi.updateBaseService(id, data)
          set((state) => ({
            baseServices: state.baseServices.map((s) => (s.id === id ? updated : s)),
            editingBase: null,
            editingBaseId: null,
            isLoading: false,
          }))
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error updating base service'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      deleteBaseService: async (id: string) => {
        set({ isLoading: true, errors: {} })
        try {
          await servicesApi.deleteBaseService(id)
          set((state) => ({
            baseServices: state.baseServices.filter((s) => s.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error deleting base service'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      startEditingBase: (service: ServicioBase) => {
        set({ editingBase: service, editingBaseId: service.id })
      },

      cancelEditingBase: () => {
        set({ editingBase: null, editingBaseId: null })
      },

      setNewBaseService: (data: Partial<ServicioBase>) => {
        set({ newBaseService: data })
      },

      // ===== OPTIONAL SERVICES =====

      loadOptionalServices: async () => {
        set({ isLoading: true, errors: {} })
        try {
          const data = await servicesApi.getOptionalServices()
          set({ optionalServices: data, isLoading: false })
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error loading optional services'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      addOptionalService: async (data: Partial<Servicio>) => {
        set({ isLoading: true, errors: {} })
        try {
          const created = await servicesApi.createOptionalService(data)
          set((state) => ({
            optionalServices: [...state.optionalServices, created],
            newService: {},
            isLoading: false,
          }))
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error creating optional service'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      updateOptionalService: async (id: string, data: Partial<Servicio>) => {
        set({ isLoading: true, errors: {} })
        try {
          const updated = await servicesApi.updateOptionalService(id, data)
          set((state) => ({
            optionalServices: state.optionalServices.map((s) => (s.id === id ? updated : s)),
            editing: null,
            editingId: null,
            isLoading: false,
          }))
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error updating optional service'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      deleteOptionalService: async (id: string) => {
        set({ isLoading: true, errors: {} })
        try {
          await servicesApi.deleteOptionalService(id)
          set((state) => ({
            optionalServices: state.optionalServices.filter((s) => s.id !== id),
            isLoading: false,
          }))
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Error deleting optional service'
          set({ isLoading: false, errors: { _global: msg } })
        }
      },

      startEditing: (service: Servicio) => {
        set({ editing: service, editingId: service.id })
      },

      cancelEditing: () => {
        set({ editing: null, editingId: null })
      },

      setNewService: (data: Partial<Servicio>) => {
        set({ newService: data })
      },

      setBaseServices: (services: ServicioBase[]) => {
        set({ baseServices: services })
      },

      setOptionalServices: (services: Servicio[]) => {
        set({ optionalServices: services })
      },

      // ===== GENERAL =====

      clearErrors: () => {
        set({ errors: {} })
      },

      resetServices: () => {
        set(DEFAULT_SERVICES_STATE)
      },
    }),
    {
      name: 'services-store',
      partialize: (state) => ({
        baseServices: state.baseServices,
        optionalServices: state.optionalServices,
      }),
    }
  )
)

// Optimized selectors
export const useBaseServices = () => useServicesStore((state) => state.baseServices)
export const useOptionalServices = () => useServicesStore((state) => state.optionalServices)
export const useServicesLoading = () => useServicesStore((state) => state.isLoading)
export const useServicesErrors = () => useServicesStore((state) => state.errors)
export const useEditingBase = () => useServicesStore((state) => state.editingBase)
export const useEditing = () => useServicesStore((state) => state.editing)
