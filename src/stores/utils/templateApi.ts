/**
 * API utilities for template operations
 */

import { DescriptionTemplate, FinancialTemplate } from '../types/template.types'

export const templateApi = {
  // Description templates
  async getDescriptionTemplates(): Promise<DescriptionTemplate[]> {
    try {
      const response = await fetch('/api/templates/descriptions')
      if (!response.ok) throw new Error('Failed to load description templates')
      return response.json()
    } catch (error) {
      console.error('templateApi.getDescriptionTemplates:', error)
      throw error
    }
  },

  async createDescriptionTemplate(
    template: Partial<DescriptionTemplate>,
  ): Promise<DescriptionTemplate> {
    try {
      const response = await fetch('/api/templates/descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      if (!response.ok) throw new Error('Failed to create description template')
      return response.json()
    } catch (error) {
      console.error('templateApi.createDescriptionTemplate:', error)
      throw error
    }
  },

  async updateDescriptionTemplate(
    id: string,
    template: Partial<DescriptionTemplate>,
  ): Promise<DescriptionTemplate> {
    try {
      const response = await fetch(`/api/templates/descriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      if (!response.ok) throw new Error('Failed to update description template')
      return response.json()
    } catch (error) {
      console.error('templateApi.updateDescriptionTemplate:', error)
      throw error
    }
  },

  async deleteDescriptionTemplate(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/templates/descriptions/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete description template')
    } catch (error) {
      console.error('templateApi.deleteDescriptionTemplate:', error)
      throw error
    }
  },

  // Financial templates
  async getFinancialTemplates(): Promise<FinancialTemplate[]> {
    try {
      const response = await fetch('/api/templates/financial')
      if (!response.ok) throw new Error('Failed to load financial templates')
      return response.json()
    } catch (error) {
      console.error('templateApi.getFinancialTemplates:', error)
      throw error
    }
  },

  async createFinancialTemplate(
    template: Partial<FinancialTemplate>,
  ): Promise<FinancialTemplate> {
    try {
      const response = await fetch('/api/templates/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      if (!response.ok) throw new Error('Failed to create financial template')
      return response.json()
    } catch (error) {
      console.error('templateApi.createFinancialTemplate:', error)
      throw error
    }
  },

  async updateFinancialTemplate(
    id: string,
    template: Partial<FinancialTemplate>,
  ): Promise<FinancialTemplate> {
    try {
      const response = await fetch(`/api/templates/financial/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })
      if (!response.ok) throw new Error('Failed to update financial template')
      return response.json()
    } catch (error) {
      console.error('templateApi.updateFinancialTemplate:', error)
      throw error
    }
  },

  async deleteFinancialTemplate(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/templates/financial/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete financial template')
    } catch (error) {
      console.error('templateApi.deleteFinancialTemplate:', error)
      throw error
    }
  },
}
