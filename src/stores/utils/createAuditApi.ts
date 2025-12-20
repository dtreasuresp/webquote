/**
 * Utility para hacer llamadas a la API de auditoría
 * Centraliza la lógica de comunicación con el servidor
 */

import { AuditConfig } from '../types/audit.types'

export const auditApi = {
  /**
   * Obtiene la configuración actual de auditoría del servidor
   */
  async getConfig(): Promise<AuditConfig> {
    const response = await fetch('/api/audit-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch audit config: ${response.statusText}`)
    }

    const data = await response.json()
    return data.config
  },

  /**
   * Actualiza la configuración de auditoría en el servidor
   */
  async updateConfig(config: Partial<AuditConfig>): Promise<AuditConfig> {
    const response = await fetch('/api/audit-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Failed to update audit config: ${response.statusText}`)
    }

    const data = await response.json()
    return data.config
  },

  /**
   * Genera un reporte de auditoría
   */
  async generateReport(options?: {
    format?: 'json' | 'csv' | 'pdf'
    startDate?: string
    endDate?: string
  }): Promise<any> {
    const response = await fetch('/api/audit-config/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`)
    }

    return await response.json()
  },
}
