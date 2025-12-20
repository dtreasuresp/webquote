/**
 * Discounts API Utilities
 * Centralized API communication for discounts operations
 */

import { ConfigDescuentos } from '../types/discounts.types'

const API_BASE = '/api'

export const discountsApi = {
  /**
   * Cargar configuración de descuentos
   */
  getConfig: async (): Promise<ConfigDescuentos> => {
    try {
      const response = await fetch(`${API_BASE}/discounts/config`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to load discounts config: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[discountsApi.getConfig]', error)
      throw error
    }
  },

  /**
   * Actualizar configuración de descuentos
   */
  updateConfig: async (partial: Partial<ConfigDescuentos>): Promise<ConfigDescuentos> => {
    try {
      const response = await fetch(`${API_BASE}/discounts/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      })

      if (!response.ok) {
        throw new Error(`Failed to update discounts config: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[discountsApi.updateConfig]', error)
      throw error
    }
  },

  /**
   * Guardar configuración de descuentos
   */
  saveConfig: async (config: Partial<ConfigDescuentos>): Promise<ConfigDescuentos> => {
    try {
      const response = await fetch(`${API_BASE}/discounts/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error(`Failed to save discounts config: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[discountsApi.saveConfig]', error)
      throw error
    }
  },
}
