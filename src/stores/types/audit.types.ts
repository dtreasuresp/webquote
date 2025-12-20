/**
 * Types para el audit configuration store
 * Define las interfaces y tipos para la configuración de auditoría
 */

export interface AuditConfig {
  retentionDays: number
  enableAutoDelete: boolean
  enableDetailedLogging: boolean
  enableSystemEvents: boolean
}

export interface AuditConfigState extends AuditConfig {
  // Estados
  isLoading: boolean
  error: string | null
  isDirty: boolean

  // Acciones
  loadConfig: () => Promise<void>
  updateConfig: (
    key: keyof AuditConfig,
    value: AuditConfig[keyof AuditConfig]
  ) => Promise<void>
  resetConfig: () => void
  clearError: () => void
  setDirty: (dirty: boolean) => void
}

export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  retentionDays: 90,
  enableAutoDelete: true,
  enableDetailedLogging: false,
  enableSystemEvents: true,
}
