import { prisma } from '@/lib/prisma'

// Tipos de acciones posibles
export type AuditAction = 
  // Auth
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT'
  // Users
  | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' 
  | 'USER_DEACTIVATED' | 'USER_REACTIVATED'
  | 'PASSWORD_CHANGED' | 'ROLE_CHANGED'
  // Organizations
  | 'ORG_CREATED' | 'ORG_UPDATED' | 'ORG_DELETED'
  | 'ORG_USER_ASSIGNED' | 'ORG_USER_REMOVED'
  // Permissions
  | 'PERMISSION_GRANTED' | 'PERMISSION_REVOKED'
  // Quotations
  | 'QUOTATION_CREATED' | 'QUOTATION_UPDATED' | 'QUOTATION_DELETED'
  | 'QUOTATION_ASSIGNED' | 'QUOTATION_VERSION_CHANGED'
  | 'QUOTATION_STATE_CHANGED' | 'QUOTATION_ACTIVATED' | 'QUOTATION_DEACTIVATED'
  | 'QUOTATION_SET_GLOBAL' | 'QUOTATION_CLIENT_RESPONSE' | 'QUOTATION_EXTENSION_REQUESTED'
  // Client Responses
  | 'CLIENT_RESPONSE_CREATED' | 'CLIENT_RESPONSE_UPDATED'
  // Notifications
  | 'NOTIFICATION_CREATED' | 'NOTIFICATION_MARKED_READ'
  // Snapshots
  | 'SNAPSHOT_CREATED' | 'SNAPSHOT_UPDATED' | 'SNAPSHOT_DELETED'
  | 'SNAPSHOT_RESTORED' | 'SNAPSHOT_DUPLICATED'
  // Backups
  | 'BACKUP_CREATED' | 'BACKUP_AUTO_SCHEDULED' | 'BACKUP_AUTO_EXECUTED'
  | 'BACKUP_RESTORED' | 'BACKUP_FAILED' | 'BACKUP_DELETED'
  // Config
  | 'CONFIG_UPDATED' | 'STYLE_CONFIG_CHANGED' | 'DISCOUNT_CONFIG_CHANGED'
  // Payment
  | 'PAYMENT_OPTION_UPDATED' | 'PAYMENT_METHOD_ENABLED' | 'PAYMENT_METHOD_DISABLED'
  // Sync
  | 'SYNC_STARTED' | 'SYNC_COMPLETED' | 'SYNC_CONFLICT' | 'SYNC_FAILED'
  | 'CACHE_WRITE' | 'CACHE_RESTORE'
  // Audit
  | 'REPORT_GENERATED'
  // System
  | 'DEBUG_ENDPOINT_USED' | 'MIGRATION_RUN' | 'SEED_RUN'

export type EntityType =
  | 'AUTH' | 'USER' | 'ROLE' | 'PERMISSION' | 'ORGANIZATION'
  | 'QUOTATION_CONFIG' | 'PACKAGE_SNAPSHOT'
  | 'BACKUP' | 'SYNC' | 'CONFIG' | 'AUDIT' | 'SYSTEM'
  | 'CLIENT_RESPONSE' | 'NOTIFICATION'

interface AuditParams {
  action: AuditAction
  entityType: EntityType
  entityId?: string
  actorId?: string
  actorName: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// Lista de campos prohibidos en auditoría
const SENSITIVE_FIELDS = [
  'password', 'passwordHash', 'token', 'secret', 'cookie',
  'apiKey', 'encryptionKey', 'creditCard', 'cvv', 'cardNumber',
  'auth', 'authorization'
]

/**
 * Sanitiza un objeto removiendo campos sensibles
 */
function sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined
  
  const sanitized = structuredClone(details)
  
  function removeFromObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj
    
    if (Array.isArray(obj)) {
      return obj.map(item => removeFromObject(item))
    }
    
    const result = { ...obj }
    for (const field of SENSITIVE_FIELDS) {
      if (field in result) {
        delete result[field]
      }
      // Limpiar campos anidados
      for (const key in result) {
        if (typeof result[key] === 'object') {
          result[key] = removeFromObject(result[key])
        }
      }
    }
    return result
  }
  
  return removeFromObject(sanitized)
}

/**
 * Crea un registro de auditoría en la BD
 * No debe romper la transacción principal si falla
 */
export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.actorId,
        userName: params.actorName,
        details: sanitizeDetails(params.details),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    // Nunca romper la transacción principal
    console.error('[AUDIT_HELPER] Error creando log:', {
      action: params.action,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Genera un diff filtrado entre dos objetos
 * Solo incluye campos permitidos
 */
export function generateDiff(
  before: Record<string, any>,
  after: Record<string, any>,
  allowedFields: string[]
): { before: Record<string, any>; after: Record<string, any> } {
  const diff = { before: {} as Record<string, any>, after: {} as Record<string, any> }
  
  for (const field of allowedFields) {
    // Comparar con JSON.stringify para valores complejos
    const beforeValue = JSON.stringify(before[field])
    const afterValue = JSON.stringify(after[field])
    
    if (beforeValue !== afterValue) {
      diff.before[field] = before[field]
      diff.after[field] = after[field]
    }
  }
  
  return diff
}

/**
 * Helper para loggear cambios de contraseña sin exponer el hash
 */
export async function logPasswordChange(
  userId: string,
  userName: string,
  actorId?: string
): Promise<void> {
  await createAuditLog({
    action: 'PASSWORD_CHANGED',
    entityType: 'USER',
    entityId: userId,
    actorId: actorId || userId,
    actorName: userName,
    details: { passwordChanged: true },
  })
}

/**
 * Helper para loggear login exitoso
 */
export async function logLoginSuccess(
  userId: string,
  userName: string,
  email: string | undefined,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'LOGIN_SUCCESS',
    entityType: 'AUTH',
    entityId: userId,
    actorId: userId,
    actorName: userName,
    details: { email, timestamp: new Date().toISOString() },
    ipAddress,
    userAgent,
  })
}

/**
 * Helper para loggear login fallido
 */
export async function logLoginFailed(
  username: string,
  reason: 'bad-credentials' | 'user-not-found' | 'user-inactive',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'LOGIN_FAILED',
    entityType: 'AUTH',
    actorName: username,
    details: { reason, username },
    ipAddress,
    userAgent,
  })
}
