/**
 * API utilities for validation operations
 */

import { ValidationType, ValidationResult } from '../types/validation.types'

export const validationApi = {
  async validateTab(tab: string, type: ValidationType): Promise<ValidationResult> {
    try {
      const response = await fetch('/api/validation/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab, type }),
      })
      if (!response.ok) throw new Error('Validation failed')
      return response.json()
    } catch (error) {
      console.error('validationApi.validateTab:', error)
      throw error
    }
  },

  async validateQuotation(): Promise<ValidationResult> {
    try {
      const response = await fetch('/api/validation/quotation', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Quotation validation failed')
      return response.json()
    } catch (error) {
      console.error('validationApi.validateQuotation:', error)
      throw error
    }
  },

  async validateServices(): Promise<ValidationResult> {
    try {
      const response = await fetch('/api/validation/services', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Services validation failed')
      return response.json()
    } catch (error) {
      console.error('validationApi.validateServices:', error)
      throw error
    }
  },

  async validateAll(): Promise<Record<string, ValidationResult>> {
    try {
      const response = await fetch('/api/validation/validate-all', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Full validation failed')
      return response.json()
    } catch (error) {
      console.error('validationApi.validateAll:', error)
      throw error
    }
  },
}
