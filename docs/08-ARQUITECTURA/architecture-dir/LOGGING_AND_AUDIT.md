# Sistema de Logs y Auditoría (WebQuote)

**Documento maestro para trazabilidad y auditoría de eventos en WebQuote.**

Dirigido a desarrolladores, operadores y administradores. Proporciona guía completa desde diseño hasta operación e implementación.

---

## 1. Arquitectura y Stack Técnico de WebQuote

### 1.1 Stack de aplicación
- **Frontend/Backend:** Next.js 14 App Router + TypeScript
- **Base de datos:** PostgreSQL (Neon serverless) con pooling
- **ORM:** Prisma 6.19 con Prisma Client Extensions
- **Autenticación:** NextAuth 4.24 (credentials provider + JWT sessions)
- **Caché:** Sistema offline-first con localStorage + IndexedDB + sync manager
- **Despliegue:** Vercel + Netlify

### 1.2 Dominios de negocio identificados
1. **Usuarios y Seguridad:** `User`, `Role`, `Permission`, `RolePermissions`, `UserPermission`
2. **Autenticación:** `Session`, `VerificationToken`, NextAuth flows
3. **Cotizaciones:** `QuotationConfig` (globales y asignadas por usuario)
4. **Paquetes y Snapshots:** `PackageSnapshot` (versiones dinámicas de servicios)
5. **Backups:** `UserBackup`, `BackupConfig` (manual y automático)
6. **Preferencias:** `UserPreferences`, `FinancialTemplate`
7. **Accesos:** `UserQuotationAccess` (permisos granulares por cotización)
8. **Sincronización:** Sistema cache/sync offline↔online con conflicto resolution
9. **Configuración:** Opciones de pago, descuentos, estilos (JSON fields)
10. **Administración:** Endpoints debug, migraciones, seeds

### 1.3 Puntos de entrada para instrumentación
- **17 rutas API** en `/src/app/api/*` (users, quotation-config, snapshots, backups, permissions, roles, etc.)
- **Middleware Next.js** (`/src/middleware.ts`) para protección de rutas y RLS
- **Middleware Prisma** (`/src/lib/prismaMiddleware.ts`) para RLS y auditoría automática
- **NextAuth callbacks** (`/src/lib/auth/index.ts`) para eventos de autenticación
- **Sistema de caché** (`/src/lib/cache/*`) para sync offline/online
- **Scripts de mantenimiento** (`/scripts/*`, `/prisma/*`) para migraciones y seeds
- **Páginas del cliente** (`/src/app/paquete/*`) con lifecycle events (useEffect, useCallback)

### 1.4 Modelo de datos AuditLog
```typescript
model AuditLog {
  id          String   @id @default(cuid())
  action      String   // Acción realizada (USER_CREATED, LOGIN_SUCCESS, etc.)
  entityType  String   // Tipo de entidad (USER, QUOTATION_CONFIG, SNAPSHOT, etc.)
  entityId    String?  // ID del recurso afectado
  userId      String?  // ID del usuario que realizó la acción
  userName    String   // Nombre de usuario (para auditar incluso si se borra usuario)
  details     Json?    // Contexto adicional (siempre sanitizado)
  ipAddress   String?  // IP del cliente
  userAgent   String?  // User-Agent del navegador/cliente
  createdAt   DateTime @default(now())

  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([action])
  @@index([entityType])
  @@index([userId])
  @@index([createdAt])
}
```

---

## 2. Alcance y Objetivos

- **Trazar eventos críticos:** seguridad (auth, roles, permisos), datos de negocio (cotizaciones, paquetes, pagos, backups), soporte (debug, seeds, migraciones).
- **Evidencia de auditoría:** quién hizo qué, cuándo, desde dónde, sin exponer secretos.
- **Minimizar ruido:** capturar sólo lo necesario y evitar datos sensibles.
- **Facilitar investigación:** búsqueda rápida de eventos por usuario, entidad, fecha o acción.

### 2.1 Fuera de alcance (no loggear)
- ❌ Contraseñas, hashes completos, tokens de autenticación, cookies, headers de autorización
- ❌ Cuerpos completos de requests/responses
- ❌ Payloads de pago, números de tarjeta, CVV
- ❌ Archivos binarios, imágenes, contenido multimedia
- ❌ Datos sensibles no requeridos para auditoría (p.ej. datos de contacto en logs de error)

## 3. Capas de Trazas

- **AuditLog (BD estructurada):** tabla central de eventos de negocio y seguridad con índices para búsqueda rápida.
- **Logs de aplicación (Next.js):** info/warn/error con prefijos estándar; diagnósticos en tiempo real en consola servidor y cliente.
- **Logs de API y jobs:** request/response resumido, tiempos de ejecución, errores, sin cuerpos sensibles.
- **Infraestructura:** endpoints de debug (ensure-admin), seeds y migraciones deben registrar en AuditLog para trazabilidad completa.

## 4. Taxonomía de Eventos (Acciones por Dominio)

Use estos valores en el campo `action`. Cada evento **debe** incluir `entityType`, `entityId`, `actorId`, `actorName`, `createdAt` (UTC) y `details` según se indica.

### 4.1 Usuarios y Seguridad (entityType=USER, ROLE, PERMISSION, AUTH)

#### Acciones
| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| USER_CREATED | user.id | Al crear usuario | `{ username, email, role }` |
| USER_UPDATED | user.id | Al modificar usuario | `{ before: {campo}, after: {campo} }` (solo campos públicos, sin passwordHash) |
| USER_DEACTIVATED | user.id | Al desactivar usuario | `{ reason?: string }` |
| USER_REACTIVATED | user.id | Al reactivar usuario | `{}` |
| PASSWORD_CHANGED | user.id | Al cambiar contraseña | `{ passwordChanged: true }` (sin hash) |
| ROLE_CHANGED | user.id | Al cambiar rol | `{ before: 'CLIENT', after: 'ADMIN' }` |
| PERMISSION_GRANTED | permission.id | Al otorgar permiso a usuario | `{ userId, permissionCode }` |
| PERMISSION_REVOKED | permission.id | Al revocar permiso | `{ userId, permissionCode }` |
| LOGIN_SUCCESS | user.id | Al autenticar exitosamente | `{ provider: 'credentials', ipAddress: '...' }` |
| LOGIN_FAILED | null o user.id | Al fallar autenticación | `{ reason: 'bad-credentials' \| 'user-not-found', username }` |
| LOGOUT | user.id | Al cerrar sesión | `{}` |

#### Ejemplos de implementación actual (WebQuote)

**✅ Código existente en `/src/app/api/users/route.ts` (POST - USER_CREATED):**
```typescript
await prisma.auditLog.create({
  data: {
    action: 'USER_CREATED',
    entityType: 'USER',
    entityId: newUser.id,
    userId: session.user.id,
    userName: session.user.username,
    details: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  },
})
```

**✅ Código existente en `/src/lib/auth/index.ts` (LOGIN_SUCCESS):**
```typescript
// En authorize() después de validar credenciales:
await prisma.auditLog.create({
  data: {
    action: 'login', // ← CAMBIAR a 'LOGIN_SUCCESS'
    entityType: 'auth', // ← CAMBIAR a 'AUTH'
    entityId: user.id,
    userId: user.id,
    userName: user.username,
    details: {
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString(),
    },
  },
})
```

**❌ Acciones faltantes:**
- PASSWORD_CHANGED → Implementar en Prisma middleware
- ROLE_CHANGED → Agregar en `/api/users/[id]/route.ts`
- PERMISSION_GRANTED/REVOKED → Mejorar en `/api/user-permissions/*`

### 4.2 Cotizaciones (entityType=QUOTATION_CONFIG)

| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| QUOTATION_CREATED | quotation.id | Al crear cotización | `{ numero, empresa, isGlobal }` |
| QUOTATION_UPDATED | quotation.id | Al modificar cotización | `{ before: {campo}, after: {campo} }` (campos: numero, empresa, versionNumber, activo, isGlobal) |
| QUOTATION_DELETED | quotation.id | Al eliminar cotización | `{ numero, empresa, soft: true \| false }` |
| QUOTATION_ASSIGNED | quotation.id | Al asignar a usuario | `{ userId, userName }` |
| QUOTATION_VERSION_CHANGED | quotation.id | Al cambiar versión | `{ before: 'v1.0', after: 'v2.0' }` |
| QUOTATION_PUBLISHED | quotation.id | Al publicar (si aplica) | `{ versionNumber }` |

**Estado actual:** Logs de console presentes en `/src/app/api/quotation-config/*` pero **sin auditoría en BD**.

#### Puntos de implementación necesarios:
- `/src/app/api/quotation-config/route.ts` (POST, GET)
- `/src/app/api/quotation-config/[id]/route.ts` (PUT, DELETE)

### 4.3 Paquetes y Snapshots (entityType=PACKAGE_SNAPSHOT)

| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| SNAPSHOT_CREATED | snapshot.id | Al crear snapshot/paquete | `{ nombre, tipo, descuentoPagoUnico }` |
| SNAPSHOT_UPDATED | snapshot.id | Al modificar snapshot | `{ before, after }` (campos: nombre, descuentoPagoUnico, activo) |
| SNAPSHOT_DELETED | snapshot.id | Al eliminar snapshot | `{ nombre, quotationId }` |
| SNAPSHOT_RESTORED | snapshot.id | Al restaurar desde versión anterior | `{ fromVersion, toVersion }` |
| SNAPSHOT_DUPLICATED | new-snapshot.id | Al duplicar snapshot | `{ sourceSnapshotId, sourceName }` |
| DISCOUNT_CHANGED | snapshot.id | Al cambiar descuento | `{ before: 10, after: 15 }` |

**Estado actual:** Rutas en `/src/app/api/snapshots/*` existen pero logs limitados.

### 4.4 Backups (entityType=BACKUP)

| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| BACKUP_CREATED | backup.id | Al crear backup manual | `{ tipo: 'manual', size, timestamp }` |
| BACKUP_AUTO_SCHEDULED | backup.id | Al programar auto-backup | `{ frequency: 'weekly', nextDate }` |
| BACKUP_AUTO_EXECUTED | backup.id | Al ejecutar auto-backup | `{ frequency, size, duration }` |
| BACKUP_RESTORED | backup.id | Al restaurar desde backup | `{ sourceBackupId, sourceDate, recordsRestored }` |
| BACKUP_FAILED | backup.id | Si falla backup | `{ reason: string, errorCode }` |
| BACKUP_DELETED | backup.id | Al eliminar backup | `{ tipo, edad }` |

**Estado actual:** Modelo `UserBackup` y `BackupConfig` existen en Prisma pero sin logs de auditoría.

### 4.5 Opciones de Pago (entityType=PAYMENT_OPTION)

| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| PAYMENT_OPTION_UPDATED | option.id | Al cambiar opciones de pago | `{ before: [...], after: [...] }` |
| PAYMENT_METHOD_ENABLED | snapshot.id | Al activar método de pago | `{ method: 'stripe' \| 'paypal', snapshot }` |
| PAYMENT_METHOD_DISABLED | snapshot.id | Al desactivar método de pago | `{ method, snapshot }` |
| PAYMENT_TEMPLATE_APPLIED | snapshot.id | Al aplicar template de pago | `{ templateName, snapshot }` |

### 4.6 Configuración (entityType=CONFIG)

| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| CONFIG_UPDATED | quotation.id | Al cambiar configuración global | `{ key: 'nombreCampo', before: '...', after: '...' }` (sin secretos) |
| STYLE_CONFIG_CHANGED | quotation.id | Al cambiar estilos | `{ affected: ['backgroundColor', 'font'] }` |
| DISCOUNT_CONFIG_CHANGED | quotation.id | Al cambiar configuración de descuentos | `{ before: {...}, after: {...} }` |

### 4.7 Sincronización Offline (entityType=SYNC)

| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| SYNC_STARTED | null | Al iniciar sync offline↔online | `{ source: 'offline', pendingCount: 5 }` |
| SYNC_COMPLETED | null | Al completar sync exitosamente | `{ synced: 5, conflicts: 0, duration: 1250 }` |
| SYNC_CONFLICT | null | Al detectar conflicto en sync | `{ conflictCount: 2, resolution: 'manual' \| 'automatic' }` |
| SYNC_FAILED | null | Si falla sync | `{ reason: string, pendingCount: 5 }` |
| CACHE_WRITE | null | Al escribir a caché local | `{ keys: ['quotation:123'], size: 15000 }` |
| CACHE_RESTORE | null | Al restaurar desde caché | `{ keys: ['quotation:123'], size: 15000 }` |

### 4.8 Infraestructura y Soporte (entityType=SYSTEM)

| Acción | entityId | Cuándo | details |
|--------|----------|--------|---------|
| DEBUG_ENDPOINT_USED | entity.id | Al usar endpoint de debug (p.ej. ensure-admin) | `{ endpoint: '/api/debug/ensure-admin', action: 'created' \| 'reset', result: 'ok' }` |
| MIGRATION_RUN | null | Al ejecutar migración de Prisma | `{ name, version, duration }` |
| SEED_RUN | null | Al ejecutar seed de datos | `{ seedName, recordsCreated }` |
| ADMIN_COMMAND_EXECUTED | entity.id | Comando administrativo manual | `{ command, args, result }` |

## 5. Formato y Esquema de AuditLog

Cada evento debe respetar esta estructura:

```json
{
  "id": "cuid-único",
  "action": "USER_CREATED | PASSWORD_CHANGED | QUOTATION_UPDATED | ...",
  "entityType": "USER | QUOTATION_CONFIG | SNAPSHOT | SYNC | ...",
  "entityId": "id-del-recurso-afectado (null para eventos globales como SYNC)",
  "userId": "id-del-usuario-que-realizó-la-acción (null si actor=system)",
  "userName": "nombre-de-usuario (obligatorio incluso si usuario se borra)",
  "details": {
    "// Estructura varía por tipo de evento. Ejemplos:": "",
    "// USER_CREATED:": "{ username, email, role }",
    "// USER_UPDATED:": "{ before: {campo}, after: {campo} }",
    "// PASSWORD_CHANGED:": "{ passwordChanged: true }",
    "// LOGIN_FAILED:": "{ reason: 'bad-credentials', username }",
    "// QUOTATION_UPDATED:": "{ before: {numero, empresa}, after: {...} }",
    "// SYNC_COMPLETED:": "{ synced: 5, conflicts: 0, duration: 1250 }",
    "// IMPORTANTE:": "Nunca incluir contraseñas, hashes, tokens, datos de pago, información sensible"
  },
  "ipAddress": "192.168.1.1 (incluir en auth y API calls)",
  "userAgent": "Mozilla/5.0... (incluir en auth y API calls)",
  "createdAt": "2025-12-15T10:30:45.123Z (UTC)"
}
```

### 5.1 Reglas de sanitización

**PROHIBIDO guardar en `details`:**
- ❌ `password`, `passwordHash`, `token`, `secret`, `cookie`
- ❌ `creditCard`, `cvv`, `cardNumber`
- ❌ `apiKey`, `encryptionKey`
- ❌ Cuerpos completos de requests/responses

**PERMITIDO con cuidado:**
- ✅ IDs de recursos (user.id, quotation.id)
- ✅ Nombres públicos (username, empresa, sector)
- ✅ Enums (role: CLIENT, status: ACTIVE)
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Booleanos (activo: true)
- ✅ Números limitados (versionNumber: 1)

## 6. Guía de Implementación por Capas

### 6.1 Capa 1: Helper de Auditoría Centralizado

**Crear archivo:** `/src/lib/audit/auditHelper.ts`

```typescript
import { prisma } from '@/lib/prisma'

// Tipos de acciones posibles
export type AuditAction = 
  // Auth
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT'
  // Users
  | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' 
  | 'USER_DEACTIVATED' | 'USER_REACTIVATED'
  | 'PASSWORD_CHANGED' | 'ROLE_CHANGED'
  // Permissions
  | 'PERMISSION_GRANTED' | 'PERMISSION_REVOKED'
  // Quotations
  | 'QUOTATION_CREATED' | 'QUOTATION_UPDATED' | 'QUOTATION_DELETED'
  | 'QUOTATION_ASSIGNED' | 'QUOTATION_VERSION_CHANGED'
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
  // System
  | 'DEBUG_ENDPOINT_USED' | 'MIGRATION_RUN' | 'SEED_RUN'

export type EntityType =
  | 'AUTH' | 'USER' | 'ROLE' | 'PERMISSION'
  | 'QUOTATION_CONFIG' | 'PACKAGE_SNAPSHOT'
  | 'BACKUP' | 'SYNC' | 'CONFIG' | 'SYSTEM'

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
  
  const sanitized = JSON.parse(JSON.stringify(details)) // Deep copy
  
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
```

### 6.2 Capa 2: Middleware Prisma para Auditoría Automática

**Modificar archivo:** `/src/lib/prismaMiddleware.ts`

Agregar al final del archivo (mantener el `createRLSMiddleware` existente):

```typescript
/**
 * Middleware de Prisma para auditoría automática en modelo User
 * Detecta cambios de contraseña y crea diffs automáticamente
 */
export function createAuditMiddleware() {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        user: {
          async update({ args, query }) {
            // Obtener estado anterior del usuario
            const before = await prisma.user.findUnique({
              where: args.where,
              select: {
                id: true,
                username: true,
                email: true,
                passwordHash: true,
                role: true,
                roleId: true,
                nombre: true,
                empresa: true,
                activo: true,
              },
            })

            if (!before) {
              // Usuario no encontrado, continuar normalmente
              return await query(args)
            }

            // Ejecutar el update
            const result = await query(args)

            // Detectar cambio de contraseña
            if (
              args.data.passwordHash &&
              before.passwordHash !== args.data.passwordHash
            ) {
              await createAuditLog({
                action: 'PASSWORD_CHANGED',
                entityType: 'USER',
                entityId: result.id,
                actorId: result.id, // En el futuro, obtener de contexto
                actorName: result.username,
                details: { passwordChanged: true },
              })
            }

            // Generar diff para otros campos modificados
            const allowedFields = ['username', 'email', 'role', 'roleId', 'nombre', 'empresa', 'activo']
            const diff = generateDiff(before, result, allowedFields)

            if (Object.keys(diff.before).length > 0) {
              await createAuditLog({
                action: 'USER_UPDATED',
                entityType: 'USER',
                entityId: result.id,
                actorId: result.id,
                actorName: result.username,
                details: diff,
              })
            }

            return result
          },

          async delete({ args, query }) {
            // Obtener datos del usuario antes de borrar
            const before = await prisma.user.findUnique({
              where: args.where,
              select: { id: true, username: true, email: true, role: true },
            })

            const result = await query(args)

            if (before) {
              await createAuditLog({
                action: 'USER_DELETED',
                entityType: 'USER',
                entityId: before.id,
                actorName: 'system',
                details: {
                  username: before.username,
                  email: before.email,
                  role: before.role,
                },
              })
            }

            return result
          },
        },
      },
    })
  })
}
```

### 6.3 Capa 3: NextAuth Events

**Modificar archivo:** `/src/lib/auth/index.ts`

Buscar la sección `authOptions` y agregar o actualizar:

```typescript
import { logLoginSuccess, logLoginFailed } from '@/lib/audit/auditHelper'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // ... configuración existente ...
      
      async authorize(credentials) {
        console.log('[AUTH] ==================== AUTHORIZE INICIADO ====================')
        
        if (!credentials?.username || !credentials?.password) {
          console.log('[AUTH] ERROR: Credenciales faltantes')
          
          // Loggear intento fallido
          await logLoginFailed(
            credentials?.username || 'unknown',
            'bad-credentials'
          )
          throw new Error("Credenciales requeridas")
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          // ... select existente ...
        })

        if (!user) {
          console.log('[AUTH] ERROR: Usuario no encontrado')
          
          // Loggear: usuario no existe
          await logLoginFailed(
            credentials.username,
            'user-not-found'
          )
          throw new Error("Usuario no encontrado")
        }

        if (!user.activo) {
          console.log('[AUTH] ERROR: Usuario desactivado')
          
          // Loggear: usuario inactivo
          await logLoginFailed(
            credentials.username,
            'user-inactive'
          )
          throw new Error("Usuario desactivado. Contacte al administrador.")
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValidPassword) {
          console.log('[AUTH] ERROR: Contraseña incorrecta')
          
          // Loggear: contraseña incorrecta
          await logLoginFailed(
            credentials.username,
            'bad-credentials'
          )
          throw new Error("Contraseña incorrecta")
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        // ✅ Loggear login exitoso
        await logLoginSuccess(user.id, user.username, user.email)

        console.log('[AUTH] ✅ Autenticación exitosa para:', user.username)
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          empresa: user.empresa,
          nombre: user.nombre,
          quotationAssignedId: user.quotationAssignedId,
        }
      },
    }),
  ],

  // Agregar events
  events: {
    async signOut({ token }) {
      try {
        await createAuditLog({
          action: 'LOGOUT',
          entityType: 'AUTH',
          entityId: token?.id as string,
          actorId: token?.id as string,
          actorName: token?.username as string || 'unknown',
        })
      } catch (error) {
        console.error('[AUTH_EVENTS] Error en signOut:', error)
      }
    },
  },

  // ... resto de configuración existente ...
}
```

### 6.4 Capa 4: APIs de Cotizaciones

**Modificar archivo:** `/src/app/api/quotation-config/route.ts`

```typescript
import { createAuditLog, generateDiff } from '@/lib/audit/auditHelper'

// En POST - crear cotización:
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await request.json()
    
    const newQuotation = await prisma.quotationConfig.create({
      data: {
        numero: data.numero,
        empresa: data.empresa,
        // ... resto de datos ...
      },
    })

    // ✅ Auditar creación
    await createAuditLog({
      action: 'QUOTATION_CREATED',
      entityType: 'QUOTATION_CONFIG',
      entityId: newQuotation.id,
      actorId: session.user.id,
      actorName: session.user.username,
      details: {
        numero: newQuotation.numero,
        empresa: newQuotation.empresa,
        isGlobal: newQuotation.isGlobal,
      },
    })

    return NextResponse.json({ success: true, data: newQuotation })
  } catch (error) {
    console.error('[QUOTATION_API] Error en POST:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// En PUT - actualizar cotización:
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await request.json()

    // Obtener estado anterior
    const existing = await prisma.quotationConfig.findUnique({
      where: { id },
      select: {
        numero: true,
        empresa: true,
        sector: true,
        versionNumber: true,
        activo: true,
        isGlobal: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Actualizar
    const updated = await prisma.quotationConfig.update({
      where: { id },
      data,
    })

    // ✅ Auditar cambios
    const allowedFields = ['numero', 'empresa', 'sector', 'versionNumber', 'activo', 'isGlobal']
    const diff = generateDiff(existing, updated, allowedFields)

    if (Object.keys(diff.before).length > 0) {
      await createAuditLog({
        action: 'QUOTATION_UPDATED',
        entityType: 'QUOTATION_CONFIG',
        entityId: id,
        actorId: session.user.id,
        actorName: session.user.username,
        details: diff,
      })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[QUOTATION_API] Error en PUT:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### 6.5 Capa 5: Sistema de Caché y Sync

**Modificar archivo:** `/src/lib/cache/syncManager.ts`

Agregar auditoría en operaciones de sync:

```typescript
import { createAuditLog } from '@/lib/audit/auditHelper'

export async function syncWithServer(
  userId: string,
  userName: string,
  localData: any[],
  onConflict?: (conflict: any) => void
): Promise<SyncResult> {
  const startTime = Date.now()

  // Registrar inicio de sync
  await createAuditLog({
    action: 'SYNC_STARTED',
    entityType: 'SYNC',
    actorId: userId,
    actorName: userName,
    details: {
      source: 'offline-cache',
      pendingCount: localData.length,
      timestamp: new Date().toISOString(),
    },
  })

  try {
    // ... operación de sync existente ...
    const conflicts = [] // Suponiendo que esto se calcula

    const duration = Date.now() - startTime

    // Registrar resultado
    if (conflicts.length > 0) {
      await createAuditLog({
        action: 'SYNC_CONFLICT',
        entityType: 'SYNC',
        actorId: userId,
        actorName: userName,
        details: {
          conflictCount: conflicts.length,
          resolution: 'manual',
          duration,
        },
      })

      onConflict?.(conflicts)
    } else {
      await createAuditLog({
        action: 'SYNC_COMPLETED',
        entityType: 'SYNC',
        actorId: userId,
        actorName: userName,
        details: {
          synced: localData.length,
          conflicts: 0,
          duration,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return { success: true, synced: localData.length, conflicts: conflicts.length }
  } catch (error) {
    const duration = Date.now() - startTime

    await createAuditLog({
      action: 'SYNC_FAILED',
      entityType: 'SYNC',
      actorId: userId,
      actorName: userName,
      details: {
        reason: error instanceof Error ? error.message : 'Unknown error',
        pendingCount: localData.length,
        duration,
      },
    })

    throw error
  }
}
```

## 7. Patrones de Logging por Tipo de Componente

### 7.1 Server Components (RSC)

**Patrón en `/src/app/paquete/constructor/page.tsx`:**

```typescript
export default async function ConstructorPage() {
  const session = await getServerSession(authOptions)

  console.log('[PAGE:CONSTRUCTOR] Renderizando para usuario:', session?.user.username)

  if (!session) {
    console.log('[PAGE:CONSTRUCTOR] Usuario no autenticado - Redirigiendo a login')
    redirect('/login')
  }

  if (!session.user.quotationAssignedId && session.user.role === 'CLIENT') {
    console.log('[PAGE:CONSTRUCTOR] Usuario sin cotización asignada - Redirigiendo')
    redirect('/sin-cotizacion')
  }

  console.log('[PAGE:CONSTRUCTOR] Renderización autorizada para:', {
    username: session.user.username,
    role: session.user.role,
    quotationId: session.user.quotationAssignedId,
  })

  return <PaqueteConstructor quotationId={session.user.quotationAssignedId} />
}
```

### 7.2 API Routes (Patrón Estándar)

**Patrón a seguir en todas las rutas API:**

```typescript
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit/auditHelper'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const methodStart = Date.now()
  const requestId = crypto.randomUUID().slice(0, 8)
  
  console.log(`[API:ENDPOINT_NAME][${requestId}] POST iniciado`)

  try {
    // 1. Autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log(`[API:ENDPOINT_NAME][${requestId}] No autenticado`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Leer y validar body
    const body = await request.json()
    console.log(`[API:ENDPOINT_NAME][${requestId}] Body keys:`, Object.keys(body))

    // 3. Operación
    const result = await prisma.model.create({
      data: {
        ...body,
        userId: session.user.id, // Si aplica
      },
    })

    // 4. Auditoría
    await createAuditLog({
      action: 'ENTITY_CREATED',
      entityType: 'MODEL',
      entityId: result.id,
      actorId: session.user.id,
      actorName: session.user.username,
      details: {
        campo1: result.campo1,
        campo2: result.campo2,
        // Sin campos sensibles
      },
    })

    const duration = Date.now() - methodStart
    console.log(`[API:ENDPOINT_NAME][${requestId}] ✅ Éxito en ${duration}ms - ID:`, result.id)

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    const duration = Date.now() - methodStart
    console.error(`[API:ENDPOINT_NAME][${requestId}] ❌ Error en ${duration}ms:`, 
      error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  console.log('[API:ENDPOINT_NAME] GET iniciado')

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('[API:ENDPOINT_NAME] Filtros:', { id })

    const data = await prisma.model.findMany({
      where: { id: id || undefined },
    })

    console.log('[API:ENDPOINT_NAME] Retornando:', data.length, 'registros')
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('[API:ENDPOINT_NAME] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### 7.3 Client Components con Hooks

**Patrón en componentes que hacen requests:**

```typescript
'use client'

import { useEffect, useState } from 'react'

export function QuotationForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: any) => {
    const startTime = Date.now()
    console.log('[CLIENT:QUOTATION_FORM] Submit iniciado')
    
    setLoading(true)
    setError(null)

    try {
      console.log('[CLIENT:QUOTATION_FORM] Enviando datos...')
      
      const response = await fetch('/api/quotation-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        const duration = Date.now() - startTime
        console.warn(`[CLIENT:QUOTATION_FORM] ❌ Error de servidor en ${duration}ms:`, {
          status: response.status,
          message: data.error,
        })
        setError(data.error)
        return
      }

      const duration = Date.now() - startTime
      console.log(`[CLIENT:QUOTATION_FORM] ✅ Éxito en ${duration}ms:`, {
        id: data.data?.id,
        numero: data.data?.numero,
      })

      // Actualizar UI, cachés, etc.

    } catch (err) {
      const duration = Date.now() - startTime
      console.error(`[CLIENT:QUOTATION_FORM] ❌ Error de red en ${duration}ms:`, {
        message: err instanceof Error ? err.message : String(err),
      })
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(new FormData(e.currentTarget))
    }}>
      {/* Formulario */}
    </form>
  )
}
```

### 7.4 Middleware de Next.js

**Actualizar `/src/middleware.ts` con más contexto:**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token

  console.log('[MIDDLEWARE]', {
    path: pathname,
    auth: isAuthenticated,
    role: token?.role || 'none',
    timestamp: new Date().toISOString(),
  })

  // ... resto de lógica existente ...

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 7.5 Niveles de Log Recomendados

| Prefijo | Nivel | Uso | Ejemplo |
|---------|-------|-----|---------|
| `[AUTH]` | info/warn/error | Autenticación y autorización | `[AUTH] Usuario no encontrado` |
| `[API:...]` | info/warn/error | APIs específicas | `[API:QUOTATION] POST /quotation-config` |
| `[PAGE:...]` | info | Renderización de páginas | `[PAGE:CONSTRUCTOR] Renderizando` |
| `[CLIENT:...]` | info/warn/error | Operaciones del cliente | `[CLIENT:SYNC] Sync iniciado` |
| `[MIDDLEWARE]` | info | Protección de rutas | `[MIDDLEWARE] Acceso denegado` |
| `[CACHE]` | info/warn | Sistema de caché | `[CACHE] SYNC_COMPLETED` |
| `[AUDIT]` | info/warn/error | Sistema de auditoría | `[AUDIT] Error creando log` |

## 8. Endpoint de Consulta y Export de Auditoría

### 8.1 API Route para Consultar Logs

**Crear archivo:** `/src/app/api/audit-logs/route.ts`

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * GET /api/audit-logs
 * 
 * Filtros soportados:
 * - action: string (USER_CREATED, LOGIN_FAILED, etc.)
 * - entityType: string (USER, QUOTATION_CONFIG, SYNC, etc.)
 * - userId: string (ID del usuario)
 * - userName: string (nombre del usuario)
 * - startDate: ISO string (ej: 2025-12-01)
 * - endDate: ISO string (ej: 2025-12-31)
 * - limit: number (default: 100, max: 500)
 * 
 * Respuesta:
 * {
 *   "logs": [...],
 *   "count": 25,
 *   "filters": {...}
 * }
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  // Solo ADMIN y SUPER_ADMIN pueden acceder
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    console.warn('[AUDIT_API] Acceso denegado a usuario:', session?.user.username)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const userId = searchParams.get('userId')
    const userName = searchParams.get('userName')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limitParam = searchParams.get('limit')
    const export_ = searchParams.get('export') // 'csv' o null

    // Validar límite
    let limit = parseInt(limitParam || '100', 10)
    if (isNaN(limit) || limit < 1) limit = 100
    if (limit > 500) limit = 500

    // Construir where clause
    const where: any = {}
    if (action) where.action = { contains: action, mode: 'insensitive' }
    if (entityType) where.entityType = { contains: entityType, mode: 'insensitive' }
    if (userId) where.userId = userId
    if (userName) where.userName = { contains: userName, mode: 'insensitive' }

    // Filtro de fecha
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        const start = new Date(startDate)
        if (!isNaN(start.getTime())) {
          where.createdAt.gte = start
        }
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Incluir todo el día
        if (!isNaN(end.getTime())) {
          where.createdAt.lte = end
        }
      }
    }

    console.log('[AUDIT_API] Consulta:', {
      filters: { action, entityType, userId, userName, startDate, endDate },
      limit,
      actor: session.user.username,
    })

    // Obtener logs
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        userId: true,
        userName: true,
        details: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    })

    console.log('[AUDIT_API] Retornando:', logs.length, 'registros')

    // Si se solicita export CSV
    if (export_ === 'csv') {
      const csv = logsToCSV(logs)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString()}.csv"`,
        },
      })
    }

    // Retornar JSON
    return NextResponse.json({
      logs,
      count: logs.length,
      filters: { action, entityType, userId, userName, startDate, endDate },
      limit,
    })

  } catch (error) {
    console.error('[AUDIT_API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Convierte logs a CSV
 */
function logsToCSV(logs: any[]): string {
  const headers = ['ID', 'Fecha', 'Acción', 'Tipo', 'EntidadID', 'Usuario', 'IP', 'Detalles']
  const rows = logs.map(log => [
    log.id,
    new Date(log.createdAt).toISOString(),
    log.action,
    log.entityType,
    log.entityId || '',
    log.userName,
    log.ipAddress || '',
    JSON.stringify(log.details || {}),
  ])

  // Escapar comillas en CSV
  const csvRows = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(',')
    ),
  ]

  return csvRows.join('\n')
}
```

### 8.2 Página de Administración

**Crear archivo:** `/src/app/administrador/audit-logs/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string | null
  userName: string
  userId: string | null
  details: any
  ipAddress?: string
  createdAt: string
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userId: '',
    userName: '',
    startDate: '',
    endDate: '',
    limit: '100',
  })

  // Verificar acceso
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user.role !== 'ADMIN' && session?.user.role !== 'SUPER_ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  // Cargar logs inicialmente
  useEffect(() => {
    if (status === 'authenticated') {
      fetchLogs()
    }
  }, [status])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value
          return acc
        }, {} as Record<string, string>)
      ).toString()

      console.log('[CLIENT:AUDIT_LOGS] Consultando:', params)

      const response = await fetch(`/api/audit-logs?${params}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al cargar logs')
        return
      }

      setLogs(data.logs)
      console.log('[CLIENT:AUDIT_LOGS] Cargados:', data.count, 'registros')

    } catch (err) {
      console.error('[CLIENT:AUDIT_LOGS] Error:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    console.log('[CLIENT:AUDIT_LOGS] Exportando a CSV...')

    const params = new URLSearchParams({
      ...filters,
      export: 'csv',
    }).toString()

    window.location.href = `/api/audit-logs?${params}`
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  if (status === 'loading' || !session) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Auditoría del Sistema</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Acción</label>
            <input
              type="text"
              placeholder="USER_CREATED"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Todos</option>
              <option value="USER">USER</option>
              <option value="AUTH">AUTH</option>
              <option value="QUOTATION_CONFIG">QUOTATION_CONFIG</option>
              <option value="SYNC">SYNC</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Desde</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <input
              type="text"
              placeholder="nombre"
              value={filters.userName}
              onChange={(e) => handleFilterChange('userName', e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={loading || logs.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Fecha</th>
              <th className="text-left px-4 py-2 font-medium">Acción</th>
              <th className="text-left px-4 py-2 font-medium">Tipo</th>
              <th className="text-left px-4 py-2 font-medium">Usuario</th>
              <th className="text-left px-4 py-2 font-medium">IP</th>
              <th className="text-left px-4 py-2 font-medium">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center px-4 py-8 text-gray-500">
                  No hay registros
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs font-semibold">
                    {log.action}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">{log.userName}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:underline">
                        Ver
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total: {logs.length} registros (máximo {filters.limit} por consulta)
      </div>
    </div>
  )
}
```

## 9. Retención, Índices, Consultas y Alertas

### 9.1 Estrategia de Retención

- **Periodo recomendado:** 180-365 días
- **Acción:** Purgar automáticamente logs más antiguos
- **Beneficio:** Controlar el crecimiento de la BD y cumplir con privacidad

### 9.2 Índices en AuditLog

```prisma
model AuditLog {
  // ... campos ...

  @@index([action])              // Buscar por acción
  @@index([entityType])          // Buscar por tipo de entidad
  @@index([userId])              // Buscar por usuario
  @@index([createdAt])           // Buscar por rango de fechas
  @@index([action, createdAt])   // Combinado: acción + fecha
  @@index([entityType, entityId]) // Buscar eventos de una entidad
}
```

**Para crear estos índices:** Ejecutar `npx prisma migrate dev --name add_audit_indexes`

### 9.3 Consultas Comunes

```sql
-- Todos los logins fallidos en últimas 24 horas
SELECT * FROM "AuditLog"
WHERE action = 'LOGIN_FAILED'
  AND "createdAt" >= NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;

-- Cambios de contraseña de un usuario
SELECT * FROM "AuditLog"
WHERE action = 'PASSWORD_CHANGED'
  AND "userId" = 'user-id-aqui'
ORDER BY "createdAt" DESC;

-- Eventos de una cotización específica
SELECT * FROM "AuditLog"
WHERE "entityType" = 'QUOTATION_CONFIG'
  AND "entityId" = 'quotation-id-aqui'
ORDER BY "createdAt" DESC;

-- Todas las acciones de un usuario
SELECT * FROM "AuditLog"
WHERE "userId" = 'user-id-aqui'
ORDER BY "createdAt" DESC
LIMIT 100;
```

### 9.4 Alertas Sugeridas

| Condición | Severidad | Acción |
|-----------|-----------|--------|
| 5+ LOGIN_FAILED en 10 min para un usuario | 🔴 ALTA | Bloquear cuenta temporalmente / Notificar |
| PASSWORD_CHANGED en cuenta ADMIN/SUPER_ADMIN | 🟡 MEDIA | Notificar a otros admins |
| ROLE_CHANGED a ADMIN para usuario nuevo | 🟡 MEDIA | Notificar a operadores |
| BACKUP_FAILED 3+ veces consecutivas | 🔴 ALTA | Notificar a soporte |
| SYNC_FAILED para >10 usuarios | 🟡 MEDIA | Investigar estado del servidor |

## 10. Seguridad y Privacidad

### 10.1 Datos Prohibidos

**NUNCA guardar en AuditLog o console.log:**
- ❌ Contraseñas (plain text o hashed)
- ❌ Tokens JWT, OAuth, API keys
- ❌ Cookies, session tokens
- ❌ Headers de autorización completos
- ❌ Datos de pago (tarjetas, CVV, tokens de pago)
- ❌ Archivos binarios, imágenes, contenido multimedia
- ❌ Cuerpos completos de requests/responses grandes
- ❌ Números de identidad completos (SSN, DNI, etc.)

### 10.2 Manejo de PII (Personally Identifiable Information)

**Permitido con restricciones:**
- ✅ Email truncado: `user***@example.com` (en logs públicos)
- ✅ Nombre completo: `Juan Pérez` (auditoría, no en logs públicos)
- ✅ ID de usuario: `user-123456` (siempre identificador)
- ✅ Username: `juan.perez` (público)
- ✅ Información de negocio: `empresa`, `sector` (no sensible)

### 10.3 Resiliencia de Auditoría

**Si falla la escritura de auditoría:**
- NO debe romper la transacción principal
- Registrar `error` en console
- Permitir que la operación continúe
- Ejemplo:

```typescript
try {
  await createAuditLog(...)
} catch (error) {
  console.error('[AUDIT_HELPER] Fallo no crítico:', error)
  // Continuar sin rethrow
}
```

### 10.4 Control de Acceso

- **Solo ADMIN y SUPER_ADMIN** pueden ver AuditLog
- **Endpoint `/api/audit-logs`** verifica rol antes de retornar datos
- **Página `/administrador/audit-logs`** redirige si usuario no tiene permisos
- **Export CSV** limitado a 500 registros máximo por consulta

## 11. Calidad y Pruebas

### 11.1 Tests Unitarios de Auditoría Helper

**Crear archivo:** `/tests/audit/auditHelper.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createAuditLog, generateDiff, logPasswordChange } from '@/lib/audit/auditHelper'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Audit Helper', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('createAuditLog', () => {
    it('debe crear log sin campos sensibles', async () => {
      const testLog = {
        action: 'USER_CREATED' as const,
        entityType: 'USER' as const,
        entityId: 'test-user-1',
        actorName: 'admin',
        details: {
          username: 'newuser',
          password: 'secret123', // Debe ser removido
          email: 'user@example.com',
        },
      }

      await createAuditLog(testLog)

      const log = await prisma.auditLog.findFirst({
        where: { action: 'USER_CREATED', entityId: 'test-user-1' },
        orderBy: { createdAt: 'desc' },
      })

      expect(log).toBeDefined()
      expect(log?.details).toHaveProperty('username', 'newuser')
      expect(log?.details).toHaveProperty('email', 'user@example.com')
      expect(log?.details).not.toHaveProperty('password')
    })

    it('debe manejar error sin romper transacción', async () => {
      // Simular fallo de escritura (ej: permisos denegados en BD)
      const invalidLog = {
        action: 'INVALID_ACTION' as any,
        entityType: 'INVALID_TYPE' as any,
        actorName: 'test',
        // Sin detalles requeridos
      }

      // No debe lanzar error
      expect(async () => {
        await createAuditLog(invalidLog)
      }).not.toThrow()
    })
  })

  describe('generateDiff', () => {
    it('debe generar diff solo de campos permitidos', () => {
      const before = {
        username: 'admin',
        email: 'old@example.com',
        role: 'CLIENT',
        passwordHash: '$2b$12$oldHash',
      }

      const after = {
        username: 'admin',
        email: 'new@example.com',
        role: 'ADMIN',
        passwordHash: '$2b$12$newHash',
      }

      const diff = generateDiff(before, after, ['username', 'email', 'role'])

      // Cambios detectados
      expect(diff.before).toHaveProperty('email', 'old@example.com')
      expect(diff.after).toHaveProperty('email', 'new@example.com')

      // Campos no permitidos NO aparecen
      expect(diff.before).not.toHaveProperty('passwordHash')
      expect(diff.after).not.toHaveProperty('passwordHash')

      // Campo sin cambios NO aparece
      expect(diff.before).not.toHaveProperty('username')
    })

    it('debe comparar objetos complejos correctamente', () => {
      const before = {
        config: { theme: 'light', lang: 'es' },
        activo: true,
      }

      const after = {
        config: { theme: 'dark', lang: 'es' },
        activo: true,
      }

      const diff = generateDiff(before, after, ['config', 'activo'])

      expect(diff.before).toHaveProperty('config')
      expect(diff.before.config).toEqual({ theme: 'light', lang: 'es' })
      expect(diff.after.config).toEqual({ theme: 'dark', lang: 'es' })
      expect(diff.before).not.toHaveProperty('activo')
    })
  })

  describe('logPasswordChange', () => {
    it('debe loggear cambio de contraseña sin exponer hash', async () => {
      await logPasswordChange('user-123', 'john.doe')

      const log = await prisma.auditLog.findFirst({
        where: { action: 'PASSWORD_CHANGED', entityId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      })

      expect(log).toBeDefined()
      expect(log?.action).toBe('PASSWORD_CHANGED')
      expect(log?.details).toHaveProperty('passwordChanged', true)
      expect(log?.details).not.toHaveProperty('passwordHash')
    })
  })
})
```

### 11.2 Test de Prisma Middleware

**Crear archivo:** `/tests/audit/passwordChange.integration.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

describe('Password Change Audit (Prisma Middleware)', () => {
  let testUserId: string

  beforeEach(async () => {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('OldPassword123!', 12)
    const user = await prisma.user.create({
      data: {
        username: `test-user-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        passwordHash: hashedPassword,
        role: 'CLIENT',
      },
    })
    testUserId = user.id
  })

  afterAll(async () => {
    // Limpiar
    await prisma.user.deleteMany({
      where: { username: { startsWith: 'test-user-' } },
    })
    await prisma.auditLog.deleteMany({
      where: { entityId: testUserId },
    })
    await prisma.$disconnect()
  })

  it('debe registrar PASSWORD_CHANGED en middleware', async () => {
    const newPassword = await bcrypt.hash('NewPassword456!', 12)

    await prisma.user.update({
      where: { id: testUserId },
      data: { passwordHash: newPassword },
    })

    // Esperar a que el middleware escriba
    await new Promise(resolve => setTimeout(resolve, 100))

    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action: 'PASSWORD_CHANGED',
        entityId: testUserId,
      },
      orderBy: { createdAt: 'desc' },
    })

    expect(auditLog).toBeDefined()
    expect(auditLog?.action).toBe('PASSWORD_CHANGED')
    expect(auditLog?.details).toEqual({ passwordChanged: true })
    expect(auditLog?.details).not.toHaveProperty('passwordHash')
  })

  it('debe registrar USER_UPDATED con diff cuando cambian otros campos', async () => {
    await prisma.user.update({
      where: { id: testUserId },
      data: { nombre: 'Usuario Actualizado' },
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action: 'USER_UPDATED',
        entityId: testUserId,
      },
      orderBy: { createdAt: 'desc' },
    })

    expect(auditLog).toBeDefined()
    expect(auditLog?.details).toHaveProperty('before.nombre')
    expect(auditLog?.details).toHaveProperty('after.nombre', 'Usuario Actualizado')
  })
})
```

### 11.3 Test E2E con Playwright

**Crear archivo:** `/tests/e2e/audit-login.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Login with Audit Logging', () => {
  test('debe registrar LOGIN_SUCCESS en BD', async ({ page, request }) => {
    // Realizar login
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'Admin123')
    await page.click('button[type="submit"]')

    // Esperar redirección exitosa
    await expect(page).toHaveURL('/')

    // Consultar auditoría (requiere sesión de admin)
    const response = await request.get('/api/audit-logs?action=LOGIN_SUCCESS&limit=1')
    const data = await response.json()

    expect(data.logs).toHaveLength(1)
    expect(data.logs[0].action).toBe('LOGIN_SUCCESS')
    expect(data.logs[0].userName).toBe('admin')
  })

  test('debe registrar LOGIN_FAILED con contraseña incorrecta', async ({ page, request }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'WrongPassword')
    await page.click('button[type="submit"]')

    // Esperar mensaje de error
    await expect(page.locator('text=Contraseña incorrecta')).toBeVisible()

    // Consultar auditoría
    const response = await request.get('/api/audit-logs?action=LOGIN_FAILED&limit=1')
    const data = await response.json()

    expect(data.logs.length).toBeGreaterThan(0)
    expect(data.logs[0].action).toBe('LOGIN_FAILED')
    expect(data.logs[0].details.reason).toBe('bad-credentials')
    expect(data.logs[0].userName).toBe('admin')
  })

  test('debe registrar LOGOUT', async ({ page, request }) => {
    // Login primero
    await page.goto('/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'Admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/')

    // Hacer logout
    await page.click('button[aria-label="logout"]')
    await expect(page).toHaveURL('/login')

    // Consultar auditoría
    const response = await request.get('/api/audit-logs?action=LOGOUT&limit=1')
    const data = await response.json()

    expect(data.logs.length).toBeGreaterThan(0)
    expect(data.logs[0].action).toBe('LOGOUT')
  })
})
```

### 11.4 Checklist de Pruebas Manuales

- [ ] Crear usuario → Verificar `USER_CREATED` en `/administrador/audit-logs`
- [ ] Editar usuario → Verificar `USER_UPDATED` con diff (sin passwordHash)
- [ ] Cambiar contraseña → Verificar `PASSWORD_CHANGED` (sin hash)
- [ ] Login exitoso → Verificar `LOGIN_SUCCESS`
- [ ] Login fallido (password) → Verificar `LOGIN_FAILED` con `reason: bad-credentials`
- [ ] Login fallido (usuario) → Verificar `LOGIN_FAILED` con `reason: user-not-found`
- [ ] Crear cotización → Verificar `QUOTATION_CREATED`
- [ ] Modificar cotización → Verificar `QUOTATION_UPDATED` con diff
- [ ] Snapshot → Verificar `SNAPSHOT_CREATED`
- [ ] Backup restore → Verificar `BACKUP_RESTORED`
- [ ] Sync offline → Verificar `SYNC_COMPLETED` o `SYNC_CONFLICT`
- [ ] Filtro audit-logs → Verificar búsqueda por acción, tipo, fecha
- [ ] Export CSV → Descargar y verificar formato

## 12. Scripts de Mantenimiento y Operación

### 12.1 Script de Purga de Auditoría

**Crear archivo:** `/scripts/purge-old-audit-logs.ts`

```typescript
/**
 * Script de purga de logs de auditoría antiguos
 * 
 * Uso:
 * npx tsx scripts/purge-old-audit-logs.ts [retentionDays]
 * 
 * Ejemplos:
 * npx tsx scripts/purge-old-audit-logs.ts 180  // Mantener 180 días
 * npx tsx scripts/purge-old-audit-logs.ts       // Usar default de .env
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function purgeOldAuditLogs() {
  const retentionDaysArg = process.argv[2]
  const retentionDays = retentionDaysArg
    ? parseInt(retentionDaysArg, 10)
    : parseInt(process.env.AUDIT_RETENTION_DAYS || '180', 10)

  if (isNaN(retentionDays) || retentionDays < 1) {
    console.error('[PURGE] Error: retentionDays debe ser un número > 0')
    process.exit(1)
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  console.log('[PURGE] ========== Iniciando purga de auditoría ==========')
  console.log('[PURGE] Retención:', retentionDays, 'días')
  console.log('[PURGE] Eliminar logs anteriores a:', cutoffDate.toISOString())

  try {
    // Contar registros a eliminar
    const countBefore = await prisma.auditLog.count()
    
    // Ejecutar purga
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    const countAfter = await prisma.auditLog.count()

    console.log('[PURGE] ========== Purga completada ==========')
    console.log('[PURGE] Registros antes:', countBefore)
    console.log('[PURGE] Registros eliminados:', result.count)
    console.log('[PURGE] Registros después:', countAfter)
    console.log('[PURGE] Espacio ahorrado (estimado):', `${(result.count * 0.5).toFixed(2)} KB`)

  } catch (error) {
    console.error('[PURGE] Error durante purga:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

purgeOldAuditLogs().catch(error => {
  console.error('[PURGE] Fallo crítico:', error)
  process.exit(1)
})
```

### 12.2 Script de Reporte de Auditoría

**Crear archivo:** `/scripts/generate-audit-report.ts`

```typescript
/**
 * Script para generar reporte de auditoría
 * 
 * Uso:
 * npx tsx scripts/generate-audit-report.ts [days]
 * 
 * Ejemplos:
 * npx tsx scripts/generate-audit-report.ts 7    // Últimos 7 días
 * npx tsx scripts/generate-audit-report.ts 30   // Últimos 30 días
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function generateAuditReport() {
  const daysArg = process.argv[2]
  const days = daysArg ? parseInt(daysArg, 10) : 7

  if (isNaN(days) || days < 1) {
    console.error('[REPORT] Error: days debe ser un número > 0')
    process.exit(1)
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  console.log('[REPORT] Generando reporte de auditoría')
  console.log('[REPORT] Período:', days, 'días')
  console.log('[REPORT] Desde:', startDate.toISOString())

  try {
    // Obtener estadísticas
    const logs = await prisma.auditLog.findMany({
      where: { createdAt: { gte: startDate } },
      select: { action: true, entityType: true, userId: true, createdAt: true },
    })

    const actionCounts = {} as Record<string, number>
    const typeCounts = {} as Record<string, number>
    const userCounts = {} as Record<string, number>
    const hourCounts = {} as Record<string, number>

    for (const log of logs) {
      // Contar por acción
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1

      // Contar por tipo
      typeCounts[log.entityType] = (typeCounts[log.entityType] || 0) + 1

      // Contar por usuario
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1
      }

      // Contar por hora
      const hour = new Date(log.createdAt).getHours()
      const hourKey = `${hour.toString().padStart(2, '0')}:00`
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
    }

    // Generar reporte
    const report = {
      generatedAt: new Date().toISOString(),
      period: { days, startDate: startDate.toISOString() },
      summary: {
        totalEvents: logs.length,
        uniqueActions: Object.keys(actionCounts).length,
        uniqueUsers: Object.keys(userCounts).length,
        averageEventsPerDay: (logs.length / days).toFixed(2),
      },
      topActions: Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .reduce((acc, [action, count]) => ({ ...acc, [action]: count }), {}),
      topEntityTypes: Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [type, count]) => ({ ...acc, [type]: count }), {}),
      topUsers: Object.entries(userCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .reduce((acc, [userId, count]) => ({ ...acc, [userId]: count }), {}),
      hourlyDistribution: hourCounts,
    }

    // Guardar reporte
    const reportPath = path.join(
      process.cwd(),
      `audit-report-${new Date().toISOString().slice(0, 10)}.json`
    )

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log('[REPORT] ✅ Reporte generado:')
    console.log(JSON.stringify(report, null, 2))
    console.log('[REPORT] Guardado en:', reportPath)

  } catch (error) {
    console.error('[REPORT] Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

generateAuditReport()
```

### 12.3 Agregar Scripts a package.json

```json
{
  "scripts": {
    "audit:purge": "tsx scripts/purge-old-audit-logs.ts",
    "audit:purge:180d": "tsx scripts/purge-old-audit-logs.ts 180",
    "audit:report": "tsx scripts/generate-audit-report.ts",
    "audit:report:7d": "tsx scripts/generate-audit-report.ts 7",
    "audit:report:30d": "tsx scripts/generate-audit-report.ts 30"
  }
}
```

### 12.4 Cron Job en Vercel

**Actualizar `/vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/audit-purge",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

**Crear archivo:** `/src/app/api/cron/audit-purge/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit/auditHelper'

/**
 * Cron job para purgar logs de auditoría antiguos
 * Se ejecuta cada domingo a las 2:00 AM UTC
 */
export async function GET(request: Request) {
  // Verificar token de Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[CRON:PURGE] Acceso denegado - token inválido')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || '180', 10)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    console.log('[CRON:PURGE] Iniciando purga. Cutoff:', cutoffDate.toISOString())

    const countBefore = await prisma.auditLog.count()

    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    })

    const countAfter = await prisma.auditLog.count()

    // Registrar la purga misma
    await createAuditLog({
      action: 'MIGRATION_RUN',
      entityType: 'SYSTEM',
      actorName: 'system/cron',
      details: {
        job: 'audit-purge',
        countBefore,
        deleted: result.count,
        countAfter,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
      },
    })

    console.log('[CRON:PURGE] ✅ Completada. Eliminados:', result.count)

    return NextResponse.json({
      success: true,
      deleted: result.count,
      countBefore,
      countAfter,
      cutoffDate: cutoffDate.toISOString(),
    })

  } catch (error) {
    console.error('[CRON:PURGE] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
```

### 12.5 Variables de Entorno Requeridas

**Agregar a `.env.local` y Vercel:**

```bash
# Configuración de auditoría
AUDIT_RETENTION_DAYS=180          # Retención en días
CRON_SECRET=tu-secret-aleatorio   # Token para Cron jobs
```

---

## 13. Cobertura Offline/Sync

### 13.1 Eventos de Sincronización

Registrar eventos de sync con contexto completo:

```typescript
import { createAuditLog } from '@/lib/audit/auditHelper'

export async function syncWithServer(
  userId: string,
  userName: string,
  localChanges: Array<{ type: string; id: string }>,
  onConflict?: (conflicts: any[]) => void
): Promise<SyncResult> {
  const startTime = Date.now()

  // SYNC_STARTED
  await createAuditLog({
    action: 'SYNC_STARTED',
    entityType: 'SYNC',
    actorId: userId,
    actorName: userName,
    details: {
      source: 'offline-cache',
      pendingCount: localChanges.length,
      changeTypes: [...new Set(localChanges.map(c => c.type))],
      timestamp: new Date().toISOString(),
    },
  })

  try {
    // ... realizar operación de sync ...
    const conflicts = [] // Detectar conflictos
    const syncedRecords = [] // Registros sincronizados
    const duration = Date.now() - startTime

    if (conflicts.length > 0) {
      // SYNC_CONFLICT
      await createAuditLog({
        action: 'SYNC_CONFLICT',
        entityType: 'SYNC',
        actorId: userId,
        actorName: userName,
        details: {
          conflictCount: conflicts.length,
          conflictTypes: conflicts.map(c => c.field),
          resolution: 'manual', // o 'automatic'
          duration,
        },
      })

      onConflict?.(conflicts)
    } else {
      // SYNC_COMPLETED
      await createAuditLog({
        action: 'SYNC_COMPLETED',
        entityType: 'SYNC',
        actorId: userId,
        actorName: userName,
        details: {
          synced: syncedRecords.length,
          created: syncedRecords.filter(s => s.isNew).length,
          updated: syncedRecords.filter(s => !s.isNew).length,
          conflicts: 0,
          duration,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return { success: true, synced: syncedRecords.length, conflicts: conflicts.length }

  } catch (error) {
    const duration = Date.now() - startTime

    // SYNC_FAILED
    await createAuditLog({
      action: 'SYNC_FAILED',
      entityType: 'SYNC',
      actorId: userId,
      actorName: userName,
      details: {
        reason: error instanceof Error ? error.message : 'Unknown error',
        pendingCount: localChanges.length,
        duration,
        errorCode: error instanceof Error && 'code' in error ? (error as any).code : null,
      },
    })

    throw error
  }
}
```

### 13.2 Eventos de Caché

```typescript
// CACHE_WRITE - escribir datos a localStorage/IndexedDB
await createAuditLog({
  action: 'CACHE_WRITE',
  entityType: 'CACHE',
  actorId: userId,
  actorName: userName,
  details: {
    keys: ['quotation:123', 'snapshot:456'],
    entitiesCount: 2,
    sizeBytes: 15234,
    cacheType: 'localStorage', // o 'indexeddb'
    ttl: 86400, // segundos
  },
})

// CACHE_RESTORE - restaurar desde caché después de desconexión
await createAuditLog({
  action: 'CACHE_RESTORE',
  entityType: 'CACHE',
  actorId: userId,
  actorName: userName,
  details: {
    keys: ['quotation:123', 'snapshot:456'],
    entitiesCount: 2,
    sizeBytes: 15234,
    cacheAge: 3600, // segundos desde escritura
    success: true,
  },
})
```

### 13.3 Estrategia de Retención en Caché

| Entidad | TTL | Condición |
|---------|-----|-----------|
| Quotation (en edición) | Indefinida | Borrar si usuario explícitamente cierra sesión |
| Snapshot (en lectura) | 7 días | Auto-purga después de 7 días sin acceso |
| Preferences | Indefinida | Actualizar en sync |
| Config | 30 días | Recalcular si más antiguo que 30 días |

---

## 14. Roadmap de Implementación

**4 fases - Duración estimada: 2-3 semanas**

### **Fase 1: Fundamentos (Días 1-3)** 🟢 PRIORITARIO

Crear la infraestructura base de auditoría.

**Tareas:**
- ✅ Crear `/src/lib/audit/auditHelper.ts` con helper centralizado
- ✅ Agregar middleware Prisma en `/src/lib/prismaMiddleware.ts` para PASSWORD_CHANGED y USER_UPDATED
- ✅ Actualizar NextAuth en `/src/lib/auth/index.ts` con LOGIN_SUCCESS/FAILED/LOGOUT
- ✅ Crear tests unitarios en `/tests/audit/auditHelper.test.ts`

**Validación:**
- [ ] Helper sanitiza campos sensibles correctamente
- [ ] Middleware detecta PASSWORD_CHANGED sin romper transacciones
- [ ] NextAuth logs de login aparecen en AuditLog
- [ ] Tests pasan al 100%

### **Fase 2: APIs Core (Días 4-7)** 🟡 IMPORTANTE

Auditar dominios críticos de negocio.

**Tareas:**
- ✅ Auditoría en `/api/users/*` (USER_CREATED, USER_UPDATED, USER_DELETED)
- ✅ Auditoría en `/api/quotation-config/*` (QUOTATION_CREATED, QUOTATION_UPDATED)
- ✅ Auditoría en `/api/snapshots/*` (SNAPSHOT_CREATED, SNAPSHOT_RESTORED)
- ✅ Auditoría en `/api/backups/*` (BACKUP_CREATED, BACKUP_RESTORED, BACKUP_FAILED)
- ✅ Auditoría en `/api/permissions/*` (PERMISSION_GRANTED, PERMISSION_REVOKED)
- ✅ Crear tests de integración con Prisma middleware

**Validación:**
- [ ] Cada API route registra evento apropiado en AuditLog
- [ ] Los diffs se generan correctamente (sin campos sensibles)
- [ ] Tests E2E con Playwright pasan
- [ ] Console.log con prefijos estándar en todas las APIs

### **Fase 3: Consulta y UI (Días 8-10)** 🟠 COMPLEMENTARIO

Permitir consultar y investigar auditoría.

**Tareas:**
- ✅ Crear `/src/app/api/audit-logs/route.ts` con filtros y export CSV
- ✅ Crear `/src/app/administrador/audit-logs/page.tsx` para UI de búsqueda
- ✅ Agregar índices en Prisma schema (action, entityType, userId, createdAt)
- ✅ Tests de filtros y paginación

**Validación:**
- [ ] Búsqueda por acción, tipo, fecha funciona
- [ ] Export CSV genera archivo correcto
- [ ] Página de admin muestra datos limitados (max 500)
- [ ] Solo ADMIN/SUPER_ADMIN acceden

### **Fase 4: Operación (Días 11-14)** 🔴 MANTENIMIENTO

Automatizar purga y alertas.

**Tareas:**
- ✅ Crear script `/scripts/purge-old-audit-logs.ts`
- ✅ Crear cron job en Vercel (`/api/cron/audit-purge`)
- ✅ Agregar variables de entorno (AUDIT_RETENTION_DAYS, CRON_SECRET)
- ✅ Documentación operativa (este documento)
- ✅ Script de reporte `/scripts/generate-audit-report.ts`

**Validación:**
- [ ] Cron job se ejecuta sin errores
- [ ] Logs más antiguos se eliminan correctamente
- [ ] Retención respeta AUDIT_RETENTION_DAYS
- [ ] Reportes se generan en formato JSON

### Timeline de Implementación

```
Semana 1:
├─ Lunes (Día 1): Capa 1 - Helper
├─ Martes (Día 2): Capa 2 - Prisma middleware
├─ Miércoles (Día 3): Capa 3 - NextAuth, Tests
└─ Tests al 100% ✅

Semana 2:
├─ Jueves (Día 4): Auditoría Users, Quotations
├─ Viernes (Día 5): Auditoría Snapshots, Backups
├─ Sábado (Día 6): Auditoría Permissions, Tests E2E
└─ Domingo (Día 7): Code review, fixes

Semana 3:
├─ Lunes (Día 8): API audit-logs, UI admin
├─ Martes (Día 9): Filtros, Export CSV
├─ Miércoles (Día 10): Scripts purga/reporte
├─ Jueves (Día 11): Cron jobs, variables de entorno
├─ Viernes (Día 12): Testing completo
├─ Sábado (Día 13): Documentación final
└─ Domingo (Día 14): Deploy a producción ✅
```

### Dependencias y Bloqueadores

- **Fase 1 → Fase 2:** Depende de helper y middleware listos
- **Fase 2 → Fase 3:** Depende de auditoría funcionando en APIs
- **Fase 3 → Fase 4:** Sin dependencias, puede ejecutarse en paralelo
- **Bloqueador:** Acceso a BD con tabla AuditLog (ya existe en schema.prisma)

### Criterios de Éxito

✅ **Fase 1 completa cuando:**
- Helper centralizado funciona y sanitiza datos
- Middleware Prisma detecta cambios sin errores
- NextAuth logguea logins exitosos y fallidos
- Todos los tests pasan

✅ **Fase 2 completa cuando:**
- 100% de APIs críticas tienen auditoría
- Diffs se generan correctamente
- Tests E2E pasan al 100%
- Logs tienen prefijos estándar

✅ **Fase 3 completa cuando:**
- Endpoint de consulta retorna datos en JSON
- UI muestra resultados con filtros
- CSV se descarga correctamente
- Búsqueda es rápida (< 1 segundo)

✅ **Fase 4 completa cuando:**
- Cron job purga logs automáticamente
- Variables de entorno configuradas
- Reportes se generan sin errores
- Documentación es completa y precisa

---

## 15. Referencias y Runbooks Operativos

### 15.1 Investigación de Incidente - "Usuario reporta que no puede acceder"

```
1. Ir a /administrador/audit-logs
2. Filtrar por:
   - userName: [nombre del usuario]
   - startDate: [hace 24 horas]
   - action: LOGIN_FAILED
3. Analizar:
   - ¿Cuántos intentos fallidos?
   - ¿Razón del fallo? (bad-credentials, user-not-found, user-inactive)
   - ¿Hay PASSWORD_CHANGED previo?
   - ¿Última vez que entró exitosamente?
4. Acciones:
   - Si bad-credentials → Usuario ingresa contraseña incorrecta
   - Si user-not-found → Usuario no existe o username diferente
   - Si user-inactive → Usuario fue desactivado (buscar USER_DEACTIVATED)
   - Si hay PASSWORD_CHANGED reciente → Reiniciar contraseña
```

### 15.2 Verificación de Cambios Críticos

```bash
# Cambios de contraseña en últimas 24h (usuarios privilegiados)
curl -s 'http://localhost:3000/api/audit-logs?action=PASSWORD_CHANGED&startDate=2025-12-14' \
  | jq '.logs[] | select(.userId | test("admin|super"))'

# Cambios de rol
curl -s 'http://localhost:3000/api/audit-logs?action=ROLE_CHANGED' \
  | jq '.logs[] | {timestamp: .createdAt, user: .userName, before: .details.before, after: .details.after}'

# Intentos de login fallidos (últimas 2 horas)
curl -s 'http://localhost:3000/api/audit-logs?action=LOGIN_FAILED&startDate=2025-12-14T22:00:00Z' \
  | jq '.logs | group_by(.userName) | map({user: .[0].userName, count: length})'
```

### 15.3 Mantenimiento de Auditoría

```bash
# Ver estado actual de AuditLog
npx prisma studio

# Contar registros
SELECT COUNT(*) FROM "AuditLog";

# Contar por acción (top 10)
SELECT action, COUNT(*) as count 
FROM "AuditLog" 
GROUP BY action 
ORDER BY count DESC 
LIMIT 10;

# Purgar logs de test (cuidado: destructivo)
npm run audit:purge:180d

# Generar reporte semanal
npm run audit:report:7d
```

### 15.4 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `createAuditLog: Error creating log` | Fallo de conexión a BD | Revisar STORAGE_POSTGRES_PRISMA_URL |
| `Prisma middleware timeout` | Query muy lenta | Agregar índices: `npx prisma migrate dev --name add_indexes` |
| `Export CSV > 500 registros` | Límite de paginación | Usar startDate/endDate para filtrar |
| `SYNC_FAILED siempre` | Caché offline corrupto | Limpiar localStorage: `localStorage.clear()` |
