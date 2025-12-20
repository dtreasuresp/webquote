/**
 * Services API Utilities
 * Centralized API communication for services operations
 */

import { ServicioBase, Servicio } from '../types/services.types'

const API_BASE = '/api'

export const servicesApi = {
  /**
   * Cargar servicios base
   */
  getBaseServices: async (): Promise<ServicioBase[]> => {
    try {
      const response = await fetch(`${API_BASE}/servicios-base`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to load base services: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[servicesApi.getBaseServices]', error)
      throw error
    }
  },

  /**
   * Crear servicio base
   */
  createBaseService: async (data: Partial<ServicioBase>): Promise<ServicioBase> => {
    try {
      const response = await fetch(`${API_BASE}/servicios-base`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create base service: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[servicesApi.createBaseService]', error)
      throw error
    }
  },

  /**
   * Actualizar servicio base
   */
  updateBaseService: async (id: string, data: Partial<ServicioBase>): Promise<ServicioBase> => {
    try {
      const response = await fetch(`${API_BASE}/servicios-base/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to update base service: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[servicesApi.updateBaseService]', error)
      throw error
    }
  },

  /**
   * Eliminar servicio base
   */
  deleteBaseService: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/servicios-base/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete base service: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[servicesApi.deleteBaseService]', error)
      throw error
    }
  },

  /**
   * Cargar servicios opcionales
   */
  getOptionalServices: async (): Promise<Servicio[]> => {
    try {
      const response = await fetch(`${API_BASE}/servicios`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to load optional services: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[servicesApi.getOptionalServices]', error)
      throw error
    }
  },

  /**
   * Crear servicio opcional
   */
  createOptionalService: async (data: Partial<Servicio>): Promise<Servicio> => {
    try {
      const response = await fetch(`${API_BASE}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create optional service: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[servicesApi.createOptionalService]', error)
      throw error
    }
  },

  /**
   * Actualizar servicio opcional
   */
  updateOptionalService: async (id: string, data: Partial<Servicio>): Promise<Servicio> => {
    try {
      const response = await fetch(`${API_BASE}/servicios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to update optional service: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[servicesApi.updateOptionalService]', error)
      throw error
    }
  },

  /**
   * Eliminar servicio opcional
   */
  deleteOptionalService: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/servicios/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete optional service: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[servicesApi.deleteOptionalService]', error)
      throw error
    }
  },
}
