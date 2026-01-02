import { useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

export interface AuditLogEntry {
  id: string
  userId: string
  username: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'SYNC' | 'EXECUTE'
  module: 
    | 'CLIENTS' | 'CONTACTS' | 'PRODUCTS' | 'OPPORTUNITIES' | 'INTERACTIONS' | 'SUBSCRIPTIONS' | 'COMPLIANCE' | 'PRICING' | 'SETTINGS'
    | 'QUOTATIONS' | 'OFFERS' | 'CONTENT' | 'PREFERENCES' | 'USERS' | 'ROLES' | 'PERMISSIONS' | 'BACKUPS'
    | 'INVOICES' | 'REPORTS' | 'DASHBOARD' | 'QUOTES' | 'AUDIT'
  entityId: string
  entityName: string
  changes: Record<string, { before: any; after: any }>
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Hook personalizado para auditoría en el Panel Administrativo
 * Registra todas las acciones de usuarios y cambios de datos
 */
export const useAdminAudit = () => {
  const { data: session } = useSession()
  const auditQueueRef = useRef<AuditLogEntry[]>([])

  const logAction = useCallback(
    async (
      action: AuditLogEntry['action'],
      module: AuditLogEntry['module'],
      entityId: string,
      entityName: string,
      changes?: Record<string, { before: any; after: any }>
    ) => {
      if (!session?.user) return

      const entry: AuditLogEntry = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        username: session.user.nombre || session.user.username || 'Unknown',
        action,
        module,
        entityId,
        entityName,
        changes: changes || {},
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator === 'undefined' ? undefined : navigator.userAgent,
      }

      // Añadir a la cola
      auditQueueRef.current.push(entry)

      // Enviar después de un pequeño delay para batching
      setTimeout(() => {
        if (auditQueueRef.current.length > 0) {
          // Aquí se enviaría a la API
          console.log('🔍 [AUDIT LOG]', entry)

          // Limpiar cola después de enviar
          auditQueueRef.current = []
        }
      }, 1000)
    },
    [session]
  )

  return {
    logAction,
    auditQueue: auditQueueRef.current,
  }
}
