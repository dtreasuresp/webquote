/**
 * Payment API Utilities
 * Centralized API communication for payment operations
 */

import { OpcionPago, MetodoPreferido } from '../types/payment.types'

const API_BASE = '/api'

export const paymentApi = {
  /**
   * Cargar opciones de pago disponibles
   */
  getPaymentOptions: async (): Promise<OpcionPago[]> => {
    try {
      const response = await fetch(`${API_BASE}/payment-options`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to load payment options: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[paymentApi.getPaymentOptions]', error)
      throw error
    }
  },

  /**
   * Cargar métodos de pago preferidos del usuario
   */
  getPreferredMethods: async (): Promise<MetodoPreferido[]> => {
    try {
      const response = await fetch(`${API_BASE}/payment-preferences`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to load preferred methods: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[paymentApi.getPreferredMethods]', error)
      throw error
    }
  },

  /**
   * Guardar preferencias de pago
   */
  savePaymentPreferences: async (data: {
    preferredMethod?: string
    notes?: string
  }): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/payment-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to save payment preferences: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[paymentApi.savePaymentPreferences]', error)
      throw error
    }
  },

  /**
   * Procesar pago
   */
  processPayment: async (data: {
    packageId: string
    paymentMethod: string
    notes?: string
  }): Promise<{ success: boolean; transactionId: string }> => {
    try {
      const response = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to process payment: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[paymentApi.processPayment]', error)
      throw error
    }
  },
}
