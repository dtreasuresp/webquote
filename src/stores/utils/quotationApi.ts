/**
 * Quotation API Utilities
 * Centralized API communication for quotation operations
 */

import { QuotationConfig } from '../types/quotation.types'

const API_BASE = '/api'

export const quotationApi = {
  /**
   * Cargar cotización completa por ID
   */
  getQuotation: async (id: string): Promise<QuotationConfig> => {
    try {
      const response = await fetch(`${API_BASE}/quotations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to load quotation: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[quotationApi.getQuotation]', error)
      throw error
    }
  },

  /**
   * Actualizar cotización existente
   */
  updateQuotation: async (id: string, partial: any): Promise<QuotationConfig> => {
    try {
      const response = await fetch(`${API_BASE}/quotations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partial),
      })

      if (!response.ok) {
        throw new Error(`Failed to update quotation: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[quotationApi.updateQuotation]', error)
      throw error
    }
  },

  /**
   * Guardar cotización (crear o actualizar)
   */
  saveQuotation: async (quotation: Partial<QuotationConfig>): Promise<QuotationConfig> => {
    try {
      const url = quotation.id ? `${API_BASE}/quotations/${quotation.id}` : `${API_BASE}/quotations`
      const method = quotation.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotation),
      })

      if (!response.ok) {
        throw new Error(`Failed to save quotation: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[quotationApi.saveQuotation]', error)
      throw error
    }
  },

  /**
   * Validar cotización
   */
  validateQuotation: async (quotation: Partial<QuotationConfig>): Promise<{ valid: boolean; errors?: Record<string, string> }> => {
    try {
      const response = await fetch(`${API_BASE}/quotations/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotation),
      })

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[quotationApi.validateQuotation]', error)
      throw error
    }
  },

  /**
   * Eliminar cotización
   */
  deleteQuotation: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/quotations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete quotation: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[quotationApi.deleteQuotation]', error)
      throw error
    }
  },
}
