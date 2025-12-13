# 🔐 Propuesta de Implementación: Sistema de Autenticación y Gestión de Usuarios

**Fecha:** 7 de diciembre de 2025  
**Versión:** 3.2  
**Última actualización:** 14 de enero de 2025  
**Proyecto:** WebQuote - Sistema de Cotizaciones Dinámicas  
**Branch actual:** `feature/oferta-sidebar-navigation`

---

## 📝 Changelog v3.2

- **Fase 5 COMPLETADA:** Infraestructura de Roles y Permisos
  - Modelos `Role`, `Permission`, `RolePermission`, `UserPermission`, `AuditLog` creados
  - Script de migración `migrate-roles.ts` ejecutado exitosamente
  - Script seed `seed-permissions.ts` ejecutado con permisos del sistema
  - Helper de auditoría `src/lib/audit.ts` implementado
  - NextAuth actualizado con permisos en sesión

- **Fase 6 COMPLETADA:** Sistema de Seguridad y Acceso (UI Completa)
  - ✅ `RolesContent.tsx` - CRUD de roles con jerarquía
  - ✅ `PermisosContent.tsx` - CRUD de permisos con indicador sistema/personalizado
  - ✅ `MatrizAccesoContent.tsx` - Grid interactivo rol-permiso con 3 estados
  - ✅ `PermisosUsuarioContent.tsx` - Permisos individuales por usuario
  - ✅ `LogsAuditoriaContent.tsx` - Logs con filtros y exportación CSV
  - ✅ APIs: `/api/roles`, `/api/permissions`, `/api/role-permissions`, `/api/user-permissions`, `/api/audit-logs`
  - ✅ Sidebar de seguridad integrado en `PreferenciasSidebar.tsx` como sub-items
  - ✅ Coherencia visual aplicada con Lucide icons y design system unificado

- **Actualizaciones de UI:**
  - Todos los componentes de PreferenciasTab actualizados con estilos coherentes
  - Iconos migrados de react-icons/fa a lucide-react
  - Contenedores con `bg-gh-bg-secondary border border-gh-border/30 rounded-lg`
  - Headers con icono `text-gh-accent` + título + descripción

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Situación Actual del Proyecto](#situación-actual-del-proyecto)
3. [Objetivos de la Implementación](#objetivos-de-la-implementación)
4. [Arquitectura Propuesta](#arquitectura-propuesta)
5. [Modelo de Datos](#modelo-de-datos)
6. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
7. [Roadmap de Implementación](#roadmap-de-implementación)
8. [Detalles Técnicos por Fase](#detalles-técnicos-por-fase)
9. [Impacto en Componentes Existentes](#impacto-en-componentes-existentes)
10. [Sistema de Backup y Restauración](#sistema-de-backup-y-restauración)
11. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
12. [Plan de Migración de Datos](#plan-de-migración-de-datos)

---

## 📌 Resumen Ejecutivo

### Objetivo Principal
Implementar un sistema de autenticación completo con roles jerárquicos y permisos granulares que permita:
- **Super Administradores:** Control total del sistema, gestión de roles y permisos, creación de otros Super Admin
- **Administradores:** Gestionar usuarios cliente, asignar cotizaciones, acceder a múltiples cotizaciones
- **Clientes (usuarios):** Acceder a la página pública y visualizar únicamente las cotizaciones asignadas a su cuenta

### Alcance
| Funcionalidad | Descripción |
|---------------|-------------|
| Autenticación de usuarios | Login con credenciales para todos los roles |
| Sistema de Roles Jerárquico | SUPER_ADMIN > ADMIN > CLIENT |
| Permisos Granulares | Permisos dinámicos configurables por rol |
| Gestión de usuarios | CRUD de usuarios desde el panel admin |
| Multi-cotización por usuario | Un ADMIN puede acceder a múltiples cotizaciones |
| Asignación de cotizaciones | Asignar múltiples cotizaciones a usuarios |
| Página pública filtrada | Visualización de cotización según usuario autenticado |
| Historial multi-cliente | Visualización de cotizaciones por cliente |
| Perfil de usuario visual | Avatar con logo en navbar y menú desplegable |
| Reset de contraseñas | Jerarquía: SUPER_ADMIN > ADMIN > CLIENT |
| **Sistema de Backup/Restauración** | **Backup configurable de datos con restauración por usuario** |
| **Eliminación de Defaults** | **Sin datos predeterminados, todo desde BD** |

---

## 🏗️ Situación Actual del Proyecto

### Estructura de Base de Datos (Prisma Schema)

```prisma
model QuotationConfig {
  id                String            @id @default(cuid())
  numero            String            @unique
  empresa           String            @default("")  // ← Nombre del cliente
  isGlobal          Boolean           @default(false) // ← Cotización activa global
  activo            Boolean           @default(true)
  snapshots         PackageSnapshot[]
  // ... otros campos
}

model UserPreferences {
  id        String   @id @default(cuid())
  userId    String   @unique  // ← ID genérico, no vinculado a usuarios reales
  // ... preferencias del administrador
}
```

### Autenticación Actual
- **Solo existe autenticación de administrador** via `ADMIN_PASSWORD` en variables de entorno
- **Endpoint:** `/api/auth/verify` - Verificación simple de contraseña
- **No hay modelo de Usuario** en la base de datos
- **No hay sesiones ni JWT**

### Componentes Relevantes

| Componente | Ubicación | Función Actual |
|------------|-----------|----------------|
| `PreferenciasTab` | `src/features/admin/components/tabs/PreferenciasTab.tsx` | Preferencias generales y sincronización (350 líneas) |
| `Historial` | `src/features/admin/components/tabs/Historial.tsx` | Lista cotizaciones agrupadas por número base (679 líneas) |
| `CotizacionTab` | `src/features/admin/components/tabs/CotizacionTab.tsx` | Sidebar con Cotización/Cliente/Proveedor |
| `ClienteContent` | `src/features/admin/components/content/cotizacion/ClienteContent.tsx` | Formulario datos del cliente (campo "Empresa") |
| `page.tsx` (público) | `src/app/page.tsx` | Carga cotización con `isGlobal: true` para todos |

### Flujo Actual de Cotización Pública
```
Usuario visita / → GET /api/quotation-config → WHERE isGlobal: true → Una sola cotización para TODOS
```

### Problema
- **No hay distinción de usuarios:** Todos ven la misma cotización activa
- **No hay control de acceso:** Cualquier persona puede ver la propuesta
- **No hay gestión de clientes:** Solo datos de contacto, no cuentas de usuario

---

## 🎯 Objetivos de la Implementación

### 1. Una Cotización por Usuario (Cliente)
```
Usuario A → Login → Ve Cotización COT-2025-001
Usuario B → Login → Ve Cotización COT-2025-002
Sin Login  → Página de login o error
```

### 2. Administrador Asigna Cotizaciones
- Crear usuarios desde el panel admin
- Vincular una cotización específica a cada usuario
- Generar credenciales automáticas basadas en datos del cliente

### 3. Sidebar en PreferenciasTab
```
PreferenciasTab
├── Configuración General
├── Sincronización y Caché  
└── 👤 Gestión de Usuarios (NUEVO)
```

### 4. Usuario Genérico desde Datos del Cliente
- Campo "Empresa" de `CotizacionTab` → Sugiere username
- Ejemplo: "Urbanísima Constructora S.R.L" → `urbanisima-constructora`

### 5. Historial Multi-Cliente
- Tabla que muestra cotizaciones de TODOS los clientes
- Filtrada: Una cotización por cliente (la activa asignada)
- Vista administrador: Ver todas las cotizaciones y sus asignaciones

---

## 🏛️ Arquitectura Propuesta

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PÁGINA PÚBLICA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Usuario → / (página pública)                                          │
│         │                                                               │
│         ▼                                                               │
│   ¿Tiene sesión válida?                                                 │
│         │                                                               │
│   NO ───┴─── SÍ                                                         │
│   │          │                                                          │
│   ▼          ▼                                                          │
│ Redirect   Obtener userId de sesión                                     │
│ /login     │                                                            │
│            ▼                                                            │
│            GET /api/quotation-config?userId={userId}                    │
│            │                                                            │
│            ▼                                                            │
│            Buscar User → quotationAssignedId                            │
│            │                                                            │
│            ▼                                                            │
│            Renderizar cotización asignada                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           PANEL ADMIN                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Admin → /administrador                                                │
│         │                                                               │
│         ▼                                                               │
│   Autenticación con ADMIN_PASSWORD                                      │
│         │                                                               │
│         ▼                                                               │
│   PreferenciasTab → Gestión de Usuarios                                 │
│         │                                                               │
│         ├── Crear Usuario (desde datos de "Empresa")                    │
│         ├── Asignar Cotización a Usuario                                │
│         ├── Editar Credenciales                                         │
│         └── Desactivar Usuario                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico Propuesto

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| Autenticación | **NextAuth.js v4** | Integración nativa con Next.js, soporte para credenciales |
| Sesiones | **JWT** en cookies | Sin estado en servidor, escalable |
| Hash de contraseñas | **bcrypt** | Estándar de la industria |
| Base de datos | **Prisma + PostgreSQL** | Ya existente en el proyecto |

---

## 📊 Modelo de Datos

### Nuevos Modelos a Agregar

```prisma
// ============================================
// MODELO: Usuario (Cliente/Admin/SuperAdmin)
// ============================================
model User {
  id                    String           @id @default(cuid())
  username              String           @unique
  email                 String?          @unique
  passwordHash          String
  
  // Relación con rol dinámico (reemplaza enum)
  roleId                String
  role                  Role             @relation(fields: [roleId], references: [id])
  
  // Datos del cliente (duplicados de QuotationConfig para independencia)
  nombre                String           @default("")
  empresa               String           @default("")
  telefono              String           @default("")
  
  // Avatar/Logo personalizado (opcional, usa logo de Identidad Visual por defecto)
  avatarUrl             String?
  
  // Relaciones
  quotationAccess       UserQuotationAccess[]  // Múltiples cotizaciones
  userPermissions       UserPermission[]        // Permisos personalizados
  sessions              Session[]
  auditLogs             AuditLog[]              // Historial de acciones
  
  // Metadata
  activo                Boolean          @default(true)
  lastLogin             DateTime?
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  createdBy             String?          // ID del admin que lo creó
  
  @@index([username])
  @@index([email])
  @@index([roleId])
}

// Nota: El enum UserRole se mantiene temporalmente para compatibilidad
// pero será eliminado después de la migración completa al modelo Role
enum UserRole {
  SUPER_ADMIN  // Control total del sistema
  ADMIN        // Gestión de clientes y cotizaciones
  CLIENT       // Acceso solo a cotizaciones asignadas
}

// ============================================
// MODELO: Acceso Usuario-Cotización (N:M)
// ============================================
model UserQuotationAccess {
  id                  String          @id @default(cuid())
  userId              String
  quotationConfigId   String
  isDefault           Boolean         @default(false)  // Cotización por defecto
  assignedAt          DateTime        @default(now())
  assignedBy          String?         // ID del admin que asignó
  
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  quotationConfig     QuotationConfig @relation(fields: [quotationConfigId], references: [id], onDelete: Cascade)
  
  @@unique([userId, quotationConfigId])
  @@index([userId])
  @@index([quotationConfigId])
}

// ============================================
// MODELO: Permiso (Catálogo)
// ============================================
model Permission {
  id              String           @id @default(cuid())
  code            String           @unique  // Ej: "users.create"
  name            String                    // Ej: "Crear usuarios"
  description     String?                   // Descripción detallada
  category        String                    // Ej: "Usuarios", "Cotizaciones"
  isSystem        Boolean          @default(false) // Permisos del sistema no se pueden eliminar
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  
  rolePermissions RolePermission[]
  userPermissions UserPermission[]
  
  @@index([category])
  @@index([code])
}

// ============================================
// MODELO: Rol (Reemplaza el enum UserRole)
// ============================================
model Role {
  id              String           @id @default(cuid())
  name            String           @unique  // Ej: "SUPER_ADMIN", "ADMIN", "CLIENT"
  displayName     String                    // Ej: "Super Administrador"
  description     String?
  hierarchy       Int              @default(50) // 1-100, mayor = más privilegios
  color           String?                   // Para badges/UI
  isSystem        Boolean          @default(false) // Roles del sistema no editables
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  users           User[]
  permissions     RolePermission[]
  
  @@index([hierarchy])
}

// ============================================
// MODELO: Permiso por Rol (Configuración por defecto)
// ============================================
model RolePermission {
  id              String     @id @default(cuid())
  roleId          String
  permissionId    String
  accessLevel     String     @default("full") // "full", "readonly", "none"
  
  role            Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission      Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
  @@index([roleId])
}

// ============================================
// MODELO: Permiso por Usuario (Override)
// ============================================
model UserPermission {
  id              String     @id @default(cuid())
  userId          String
  permissionId    String
  granted         Boolean    // true = conceder, false = denegar (override)
  
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission      Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([userId, permissionId])
  @@index([userId])
}

// ============================================
// MODELO: Sesión (para NextAuth)
// ============================================
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

// ============================================
// MODELO: Token de Verificación (para reset de contraseña)
// ============================================
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}

// ============================================
// MODELO: Log de Auditoría
// ============================================
model AuditLog {
  id            String   @id @default(cuid())
  action        String                    // "role.created", "permission.updated", etc.
  entityType    String                    // "Role", "Permission", "User", etc.
  entityId      String?                   // ID del registro afectado
  userId        String                    // Usuario que realizó la acción
  userName      String                    // Nombre para referencia histórica
  details       Json?                     // Datos adicionales (old/new values)
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([action])
  @@index([entityType])
  @@index([userId])
  @@index([createdAt])
}
```

### Modificación a QuotationConfig

```prisma
model QuotationConfig {
  // ... campos existentes ...
  
  // NUEVA RELACIÓN: Usuario asignado
  assignedUser          User?            @relation("AssignedQuotation")
  
  // Nota: isGlobal se mantiene para compatibilidad hacia atrás
  // Si isGlobal: true Y no hay usuario asignado → comportamiento legacy (todos ven)
  // Si hay usuario asignado → solo ese usuario ve la cotización
}
```

### Diagrama de Relaciones

```
┌──────────────────┐         ┌──────────────────────┐
│      User        │         │   QuotationConfig    │
├──────────────────┤         ├──────────────────────┤
│ id               │◄────────│ assignedUser         │
│ username         │    N:M  │ id                   │
│ email            │  (via   │ numero               │
│ passwordHash     │  Access)│ empresa              │
│ role             │         │ isGlobal             │
│ activo           │         │ snapshots[]          │
│ empresa          │         └──────────────────────┘
└──────────────────┘                  │
        │                             │
        │ 1:N                         │
        ▼                             │
┌──────────────────────┐              │
│ UserQuotationAccess  │◄─────────────┘
├──────────────────────┤      N:M
│ id                   │
│ userId               │
│ quotationConfigId    │
│ isDefault            │
│ assignedAt           │
│ assignedBy           │
└──────────────────────┘

┌──────────────────┐         ┌──────────────────────┐
│   Permission     │◄────────│   RolePermission     │
├──────────────────┤   1:N   ├──────────────────────┤
│ id               │         │ id                   │
│ code             │         │ role                 │
│ name             │         │ permissionId         │
│ description      │         │ enabled              │
│ category         │         └──────────────────────┘
│ isActive         │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────┐
│   UserPermission     │
├──────────────────────┤
│ id                   │
│ userId               │
│ permissionId         │
│ granted              │
└──────────────────────┘
```

---

## 🛡️ Sistema de Roles y Permisos

### Jerarquía de Roles

```
SUPER_ADMIN (Nivel 3) - Control Total
    │
    ├── Puede crear/editar/eliminar SUPER_ADMIN, ADMIN y CLIENT
    ├── Puede resetear contraseñas de ADMIN y CLIENT
    ├── Acceso completo a configuración de permisos
    ├── Gestión de todos los usuarios y cotizaciones
    │
    ▼
ADMIN (Nivel 2) - Gestión de Clientes
    │
    ├── Puede crear/editar/eliminar solo CLIENT
    ├── Puede resetear contraseñas solo de CLIENT
    ├── No puede ver ni modificar SUPER_ADMIN ni otros ADMIN
    ├── Acceso a múltiples cotizaciones asignadas
    │
    ▼
CLIENT (Nivel 1) - Acceso Limitado
    │
    ├── Solo puede ver cotizaciones asignadas
    ├── No puede crear ni modificar usuarios
    ├── Acceso limitado a página pública
    └── Puede cambiar su propia contraseña
```

### Catálogo de Permisos

| Código | Nombre | Categoría | Descripción |
|--------|--------|-----------|-------------|
| `users.view` | Ver usuarios | Usuarios | Visualizar lista de usuarios |
| `users.create` | Crear usuarios | Usuarios | Crear nuevos usuarios |
| `users.edit` | Editar usuarios | Usuarios | Modificar datos de usuarios |
| `users.delete` | Eliminar usuarios | Usuarios | Desactivar/eliminar usuarios |
| `users.reset_password` | Resetear contraseñas | Usuarios | Cambiar contraseña de otros |
| `quotations.view` | Ver cotizaciones | Cotizaciones | Visualizar cotizaciones |
| `quotations.create` | Crear cotizaciones | Cotizaciones | Crear nuevas cotizaciones |
| `quotations.edit` | Editar cotizaciones | Cotizaciones | Modificar cotizaciones |
| `quotations.delete` | Eliminar cotizaciones | Cotizaciones | Eliminar cotizaciones |
| `quotations.assign` | Asignar cotizaciones | Cotizaciones | Asignar a usuarios |
| `packages.view` | Ver paquetes | Paquetes | Visualizar paquetes |
| `packages.edit` | Editar paquetes | Paquetes | Modificar paquetes |
| `services.view` | Ver servicios | Servicios | Visualizar servicios |
| `services.edit` | Editar servicios | Servicios | Modificar servicios |
| `config.view` | Ver configuración | Sistema | Ver configuración del sistema |
| `config.edit` | Editar configuración | Sistema | Modificar configuración |
| `permissions.manage` | Gestionar permisos | Sistema | Configurar permisos por rol |
| `roles.manage` | Gestionar roles | Sistema | Crear/modificar roles |
| `backups.view` | Ver backups | Backups | Visualizar lista de backups propios |
| `backups.create` | Crear backups | Backups | Crear nuevos backups manuales |
| `backups.restore` | Restaurar backups | Backups | Restaurar datos desde un backup |
| `backups.delete` | Eliminar backups | Backups | Eliminar backups existentes |
| `backups.manage_all` | Gestionar todos los backups | Backups | Ver y gestionar backups de todos los usuarios |
| `backups.configure` | Configurar backups | Backups | Modificar configuración de backups del sistema |

### Permisos por Rol (Configuración por Defecto)

| Permiso | SUPER_ADMIN | ADMIN | CLIENT |
|---------|:-----------:|:-----:|:------:|
| `users.view` | ✅ | ✅ (solo CLIENT) | ❌ |
| `users.create` | ✅ | ✅ (solo CLIENT) | ❌ |
| `users.edit` | ✅ | ✅ (solo CLIENT) | ❌ |
| `users.delete` | ✅ | ✅ (solo CLIENT) | ❌ |
| `users.reset_password` | ✅ | ✅ (solo CLIENT) | ❌ |
| `quotations.view` | ✅ | ✅ | ✅ (asignadas) |
| `quotations.create` | ✅ | ✅ | ❌ |
| `quotations.edit` | ✅ | ✅ | ❌ |
| `quotations.delete` | ✅ | ❌ | ❌ |
| `quotations.assign` | ✅ | ✅ | ❌ |
| `packages.view` | ✅ | ✅ | ✅ |
| `packages.edit` | ✅ | ✅ | ❌ |
| `services.view` | ✅ | ✅ | ✅ |
| `services.edit` | ✅ | ✅ | ❌ |
| `config.view` | ✅ | ✅ | ❌ |
| `config.edit` | ✅ | ❌ | ❌ |
| `permissions.manage` | ✅ | ❌ | ❌ |
| `roles.manage` | ✅ | ❌ | ❌ |
| `backups.view` | ✅ | ✅ | ❌ |
| `backups.create` | ✅ | ✅ | ❌ |
| `backups.restore` | ✅ | ✅ | ❌ |
| `backups.delete` | ✅ | ❌ | ❌ |
| `backups.manage_all` | ✅ | ❌ | ❌ |
| `backups.configure` | ✅ | ❌ | ❌ |

### Reglas de Negocio para Reset de Contraseñas

```
SUPER_ADMIN puede resetear:
  ├── Otros SUPER_ADMIN ❌ (solo el usuario puede cambiar la suya)
  ├── ADMIN ✅
  └── CLIENT ✅

ADMIN puede resetear:
  ├── SUPER_ADMIN ❌
  ├── Otros ADMIN ❌
  └── CLIENT ✅

CLIENT puede resetear:
  └── Solo su propia contraseña ✅
```

### UI de Configuración de Permisos

Ubicación: `PreferenciasTab > Permisos y Roles`

```
┌─────────────────────────────────────────────────────────────┐
│ Permisos y Roles                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Rol: [ADMIN ▼]                                              │
│                                                             │
│ ┌─ Usuarios ────────────────────────────────────────────┐   │
│ │ ☑ Ver usuarios                                        │   │
│ │ ☑ Crear usuarios                                      │   │
│ │ ☑ Editar usuarios                                     │   │
│ │ ☑ Eliminar usuarios                                   │   │
│ │ ☑ Resetear contraseñas                                │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Cotizaciones ────────────────────────────────────────┐   │
│ │ ☑ Ver cotizaciones                                    │   │
│ │ ☑ Crear cotizaciones                                  │   │
│ │ ☑ Editar cotizaciones                                 │   │
│ │ ☐ Eliminar cotizaciones                               │   │
│ │ ☑ Asignar cotizaciones                                │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [Guardar Cambios]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap de Implementación

### ✅ Fase 1: Infraestructura de Autenticación (COMPLETADA)
**Duración:** 2-3 horas | **Estado:** ✅ Completada

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| 1.1 | Instalar dependencias (next-auth, bcrypt) | ✅ |
| 1.2 | Crear modelo User en Prisma | ✅ |
| 1.3 | Ejecutar migración de BD | ✅ |
| 1.4 | Configurar NextAuth | ✅ |
| 1.5 | Crear provider de sesión | ✅ |

### ✅ Fase 2: Componentes de UI para Gestión de Usuarios (COMPLETADA)
**Duración:** 3-4 horas | **Estado:** ✅ Completada

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| 2.1 | Crear UserManagementPanel | ✅ |
| 2.2 | Usar DialogoGenericoDinamico para modales | ✅ |
| 2.3 | Implementar CRUD de usuarios | ✅ |
| 2.4 | Integrar en PreferenciasTab como sección | ✅ |

### ✅ Fase 3: Página de Login para Clientes (COMPLETADA)
**Duración:** 2-3 horas | **Estado:** ✅ Completada

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| 3.1 | Crear página de login | ✅ |
| 3.2 | Diseñar UI de login premium | ✅ |
| 3.3 | Implementar lógica de autenticación | ✅ |
| 3.4 | Crear middleware de protección de rutas | ✅ |

### ✅ Fase 4: Multi-Cotización por Usuario (COMPLETADA)
**Duración:** 2-3 horas | **Estado:** ✅ Completada

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| 4.1 | Crear modelo UserQuotationAccess | ✅ |
| 4.2 | Migrar base de datos | ✅ |
| 4.3 | Asignar cotizaciones a admin | ✅ |

### ✅ Fase 5: Infraestructura de Roles y Permisos (COMPLETADA)
**Duración:** 4-5 horas | **Estado:** ✅ Completada

| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 5.1 | Crear modelo `Role` dinámico (reemplaza enum) | `prisma/schema.prisma` | ✅ |
| 5.2 | Crear modelo `Permission` con campos `isSystem`, `isActive` | `prisma/schema.prisma` | ✅ |
| 5.3 | Actualizar `RolePermission` con `accessLevel` (full/readonly/none) | `prisma/schema.prisma` | ✅ |
| 5.4 | Crear modelo `AuditLog` para auditoría | `prisma/schema.prisma` | ✅ |
| 5.5 | Actualizar modelo `User` con `roleId` FK | `prisma/schema.prisma` | ✅ |
| 5.6 | Script de migración de enum a modelo Role | `prisma/migrate-roles.ts` | ✅ |
| 5.7 | Ejecutar migración de BD | `prisma db push` | ✅ |
| 5.8 | Crear script seed con roles y permisos del sistema | `prisma/seed-permissions.ts` | ✅ |
| 5.9 | Crear helper para verificar permisos | `src/lib/auth/permissions.ts` | ✅ |
| 5.10 | Crear helper para registrar acciones de auditoría | `src/lib/audit.ts` | ✅ |
| 5.11 | Actualizar NextAuth para incluir permisos en sesión | `src/lib/auth/index.ts` | ✅ |

### ✅ Fase 6: Sistema de Seguridad y Acceso (UI Completa) (COMPLETADA)
**Duración:** 10-12 horas | **Estado:** ✅ Completada  
**Nota:** Todos los modales usan `DialogoGenericoDinamico` para coherencia visual.

#### Sidebar en PreferenciasTab
```
PreferenciasTab
├── 👤 General
├── 🔄 Sincronización  
├── 👥 Gestión de Usuarios
├── 💾 Backups                    ← Fase 10
└── 🛡️ Seguridad y Acceso         ← Esta fase
    ├── 📊 Roles                  
    ├── 🔑 Permisos                
    ├── 📋 Matriz de Acceso       
    ├── 👤 Permisos por Usuario   
    └── 📜 Logs de Auditoría      
```

#### 6.1 Gestión de Roles (CRUD) ✅
| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 6.1.1 | Crear `RolesContent.tsx` con tabla de roles | `content/preferencias/seguridad/RolesContent.tsx` | ✅ |
| 6.1.2 | Crear API `/api/roles` (GET, POST, PUT, DELETE) | `src/app/api/roles/route.ts` | ✅ |
| 6.1.3 | Crear API `/api/roles/[id]/route.ts` | `src/app/api/roles/[id]/route.ts` | ✅ |
| 6.1.4 | Crear hook `useRoles` | `hooks/useRoles.ts` | ✅ |
| 6.1.5 | Modal crear/editar rol usando `DialogoGenericoDinamico` | `RolesContent.tsx` | ✅ |
| 6.1.6 | Validación: roles del sistema no editables/eliminables | API + UI | ✅ |

#### 6.2 Gestión de Permisos (CRUD) ✅
| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 6.2.1 | Crear `PermisosContent.tsx` agrupado por categoría | `content/preferencias/seguridad/PermisosContent.tsx` | ✅ |
| 6.2.2 | Crear API `/api/permissions` (GET, POST, PUT, DELETE) | `src/app/api/permissions/route.ts` | ✅ |
| 6.2.3 | Crear hook `usePermisos` | `hooks/usePermisos.ts` | ✅ |
| 6.2.4 | Modal crear/editar permiso usando `DialogoGenericoDinamico` | `PermisosContent.tsx` | ✅ |
| 6.2.5 | Indicador visual: 🔒 Sistema vs ⚡ Personalizado | UI | ✅ |

#### 6.3 Matriz de Acceso Rol-Permiso ✅
| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 6.3.1 | Crear `MatrizAccesoContent.tsx` con grid interactivo | `content/preferencias/seguridad/MatrizAccesoContent.tsx` | ✅ |
| 6.3.2 | Crear API `/api/role-permissions` (GET, PUT batch) | `src/app/api/role-permissions/route.ts` | ✅ |
| 6.3.3 | Componente `PermissionMatrix.tsx` reutilizable | `src/components/PermissionMatrix.tsx` | ⏭️ (inline) |
| 6.3.4 | Toggle con 3 estados: ✅ full, 👁️ readonly, ❌ none | `MatrizAccesoContent.tsx` | ✅ |
| 6.3.5 | Protección: SUPER_ADMIN no modificable | API + UI | ✅ |

#### 6.4 Permisos Individuales por Usuario ✅
| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 6.4.1 | Crear `PermisosUsuarioContent.tsx` con buscador | `content/preferencias/seguridad/PermisosUsuarioContent.tsx` | ✅ |
| 6.4.2 | Crear API `/api/user-permissions` (GET, POST, DELETE) | `src/app/api/user-permissions/route.ts` | ✅ |
| 6.4.3 | UI para agregar/revocar permisos individuales | `PermisosUsuarioContent.tsx` | ✅ |
| 6.4.4 | Resumen visual: permisos base + extras - revocados | UI | ✅ |

#### 6.5 Logs de Auditoría ✅
| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 6.5.1 | Crear `LogsAuditoriaContent.tsx` con tabla paginada | `content/preferencias/seguridad/LogsAuditoriaContent.tsx` | ✅ |
| 6.5.2 | Crear API `/api/audit-logs` (GET con filtros) | `src/app/api/audit-logs/route.ts` | ✅ |
| 6.5.3 | Filtros: acción, usuario, fecha, entidad | UI | ✅ |
| 6.5.4 | Exportar a CSV | `LogsAuditoriaContent.tsx` | ✅ |
| 6.5.5 | Integrar logging en APIs de roles/permisos/usuarios | Todas las APIs relevantes | ✅ |

#### 6.6 Perfil de Usuario 🔄
| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 6.6.1 | Crear `UserProfileMenu.tsx` con avatar y dropdown | `src/components/UserProfileMenu.tsx` | ⏳ |
| 6.6.2 | Modal cambiar contraseña usando `DialogoGenericoDinamico` | `UserProfileMenu.tsx` | ⏳ |
| 6.6.3 | API `/api/users/me/password` (PUT) | `src/app/api/users/me/password/route.ts` | ⏳ |
| 6.6.4 | Integrar en Navbar del admin | Layout components | ⏳ |

#### 6.7 Integración y Permisos de Acceso ✅
| Tarea | Descripción | Archivos | Estado |
|-------|-------------|----------|--------|
| 6.7.1 | Crear `SeguridadSidebar.tsx` con sub-navegación | Integrado en PreferenciasSidebar | ✅ |
| 6.7.2 | Agregar sección "Seguridad y Acceso" a PreferenciasSidebar | `PreferenciasSidebar.tsx` | ✅ |
| 6.7.3 | HOC/hook `useRequirePermission` para proteger secciones | `hooks/useRequirePermission.ts` | ⏳ |
| 6.7.4 | Renderizado condicional: solo muestra secciones accesibles | Todos los componentes | ⏳ |
| 6.7.5 | ADMIN ve readonly si tiene `security.*.view` | Lógica de accessLevel |

#### Permisos de Seguridad (Seed)
```typescript
// Nuevos permisos del sistema para Fase 6
const SECURITY_PERMISSIONS = [
  { code: 'security.roles.view', name: 'Ver roles', category: 'security' },
  { code: 'security.roles.manage', name: 'Gestionar roles', category: 'security' },
  { code: 'security.permissions.view', name: 'Ver permisos', category: 'security' },
  { code: 'security.permissions.manage', name: 'Gestionar permisos', category: 'security' },
  { code: 'security.matrix.view', name: 'Ver matriz de acceso', category: 'security' },
  { code: 'security.matrix.manage', name: 'Gestionar matriz de acceso', category: 'security' },
  { code: 'security.user_permissions.view', name: 'Ver permisos de usuarios', category: 'security' },
  { code: 'security.user_permissions.manage', name: 'Gestionar permisos de usuarios', category: 'security' },
  { code: 'security.logs.view', name: 'Ver logs de auditoría', category: 'security' },
  { code: 'security.logs.export', name: 'Exportar logs', category: 'security' },
];
```

#### Consideraciones de UI
- ✅ Todos los modales usan `DialogoGenericoDinamico`
- ✅ Estilos consistentes con el resto de PreferenciasTab
- ✅ Iconos de Lucide React coherentes con el diseño existente
- ✅ Estados de carga y error siguiendo patrones existentes
- ✅ Toast notifications para feedback de acciones

### 🔄 Fase 7: Filtrado de Cotización por Usuario (PENDIENTE)
**Duración estimada:** 2-3 horas

| Tarea | Descripción | Archivos |
|-------|-------------|----------|
| 7.1 | Modificar GET /api/quotation-config para filtrar por usuario | `route.ts` |
| 7.2 | Agregar lógica de sesión en página pública | `src/app/page.tsx` |
| 7.3 | Filtrar cotizaciones por número base en modal | `UserManagementPanel.tsx` |
| 7.4 | Agrupar versiones al asignar cotización | API y UI |

### 🔄 Fase 8: Actualización del Historial (PENDIENTE)
**Duración estimada:** 2-3 horas

| Tarea | Descripción | Archivos |
|-------|-------------|----------|
| 8.1 | Modificar consulta de historial para incluir usuario | `Historial.tsx` |
| 8.2 | Agregar columna "Cliente/Usuario" en la tabla | `Historial.tsx` |
| 8.3 | Implementar filtro por cliente | `Historial.tsx` |
| 8.4 | Mostrar estado de asignación de cotización | `Historial.tsx` |

### 🔄 Fase 9: Testing y Refinamiento (PENDIENTE)
**Duración estimada:** 2-3 horas

| Tarea | Descripción |
|-------|-------------|
| 9.1 | Pruebas de flujo completo de autenticación |
| 9.2 | Pruebas de jerarquía de roles |
| 9.3 | Pruebas de permisos granulares |
| 9.4 | Pruebas de reset de contraseña por jerarquía |
| 9.5 | Revisión de seguridad |
| 9.6 | Documentación de uso |

### 🔄 Fase 10: Sistema de Backup/Restauración (PENDIENTE)
**Duración estimada:** 6-8 horas

| Tarea | Descripción | Archivos |
|-------|-------------|----------|
| 10.1 | Crear modelos `UserBackup` y `BackupConfig` en Prisma | `prisma/schema.prisma` |
| 10.2 | Agregar permisos de backups al seed | `prisma/seed-permissions.ts` |
| 10.3 | Actualizar tipos de permisos | `src/lib/auth/permissions.ts` |
| 10.4 | Crear API endpoints para backups | `src/app/api/user-backups/route.ts` |
| 10.5 | Crear API endpoint para config de backups | `src/app/api/backup-config/route.ts` |
| 10.6 | Crear hook `useBackups` | `src/features/admin/hooks/useBackups.ts` |
| 10.7 | Crear `BackupsConfigContent` en PreferenciasTab | `content/preferencias/BackupsConfigContent.tsx` |
| 10.8 | Actualizar `PreferenciasSidebar` con sección backups | `PreferenciasSidebar.tsx` |
| 10.9 | **Modificar `ContentHeader.tsx`:** Agregar botón "Eliminar" (rojo) junto a "Descartar" | `ContentHeader.tsx` |
| 10.10 | **Agregar props `onDelete`, `hasDataInDB`** a todos los componentes `*Content.tsx` | 13 componentes en `content/contenido/` |
| 10.11 | **Crear handler `handleEliminarSeccion`** con diálogo de confirmación en `ContenidoTab.tsx` | `ContenidoTab.tsx` |
| 10.12 | Implementar diálogo de confirmación con 3 opciones (Cancelar, Backup+Eliminar, Eliminar) | Usa `DialogoGenericoDinamico` existente |

### 🔄 Fase 11: Eliminación de Valores por Defecto (PENDIENTE)
**Duración estimada:** 2-3 horas  
**Dependencia:** Fase 10 completada

| Tarea | Descripción | Archivos |
|-------|-------------|----------|
| 11.1 | Eliminar constantes `default*` de componentes de contenido | Ver documento `TAREA_ELIMINAR_DEFAULTS.md` |
| 11.2 | Actualizar exports en archivos index.ts | `content/oferta/index.ts`, `content/contenido/index.ts` |
| 11.3 | Cambiar fallbacks a strings vacíos | `admin/page.tsx`, `OfertaTab.tsx`, `ContenidoTab.tsx` |
| 11.4 | Ocultar secciones vacías en página pública | `src/app/page.tsx` |
| 11.5 | Pruebas de carga sin datos | Testing manual |
---

## 🔧 Detalles Técnicos por Fase

### Fase 1: Configuración de NextAuth

#### Dependencias a instalar
```bash
npm install next-auth bcrypt
npm install -D @types/bcrypt
```

#### Estructura de archivos
```
src/
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts      # Handler de NextAuth
├── lib/
│   └── auth/
│       ├── index.ts              # Configuración NextAuth
│       ├── providers.ts          # Providers (Credentials)
│       └── session.ts            # Helpers de sesión
```

#### Configuración básica de NextAuth
```typescript
// src/lib/auth/index.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { username: credentials.username, activo: true }
        })
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null
        
        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })
        
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          quotationAssignedId: user.quotationAssignedId
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.quotationAssignedId = user.quotationAssignedId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.quotationAssignedId = token.quotationAssignedId
      }
      return session
    }
  }
}
```

### Fase 2: Refactorización de PreferenciasTab

#### Estructura propuesta
```
PreferenciasTab (contenedor con sidebar)
├── AdminSidebar
│   ├── ⚙️ General
│   ├── 🔄 Sincronización  
│   └── 👤 Usuarios
└── Contenido dinámico
    ├── ConfiguracionGeneralContent.tsx
    ├── SincronizacionContent.tsx
    └── UsuariosContent.tsx
```

#### Componente UsuariosContent (vista previa)
```typescript
// Funcionalidades principales:
// 1. Tabla de usuarios existentes
// 2. Formulario crear/editar usuario
// 3. Selector de cotización a asignar
// 4. Generador de contraseña
// 5. Copiar credenciales al portapapeles
```

### Fase 3: Generación de Username

#### Función de generación
```typescript
// src/lib/utils/userGenerator.ts
export function generateUsernameFromEmpresa(empresa: string): string {
  return empresa
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')    // Solo alfanuméricos
    .trim()
    .replace(/\s+/g, '-')            // Espacios a guiones
    .replace(/-+/g, '-')             // Múltiples guiones a uno
    .substring(0, 30)                // Máximo 30 caracteres
}

// Ejemplos:
// "Urbanísima Constructora S.R.L" → "urbanisima-constructora-srl"
// "DGTECNOVA" → "dgtecnova"
// "Empresa de Servicios ABC" → "empresa-de-servicios-abc"
```

### Fase 5: Modificación de Página Pública

#### Nuevo flujo de carga
```typescript
// src/app/page.tsx
async function fetchCotizacion(userId?: string) {
  // Si hay userId, buscar cotización asignada a ese usuario
  if (userId) {
    const res = await fetch(`/api/quotation-config?userId=${userId}`)
    return res.json()
  }
  
  // Fallback legacy: buscar isGlobal: true
  const res = await fetch('/api/quotation-config')
  return res.json()
}
```

---

## 🔄 Impacto en Componentes Existentes

### Componentes a Modificar

| Componente | Cambios Requeridos |
|------------|-------------------|
| `PreferenciasTab.tsx` | Refactorizar a sidebar con 3 secciones |
| `Historial.tsx` | Agregar columna usuario, filtros por cliente |
| `ClienteContent.tsx` | Agregar botón "Crear Usuario" con sugerencia |
| `page.tsx` (público) | Integrar sesión, cargar cotización por usuario |
| `quotation-config/route.ts` | Agregar parámetro userId, lógica de filtrado |

### Componentes Nuevos a Crear

| Componente | Descripción |
|------------|-------------|
| `ConfiguracionGeneralContent.tsx` | Preferencias generales (extraído de PreferenciasTab) |
| `SincronizacionContent.tsx` | Sincronización y cache (extraído de PreferenciasTab) |
| `UsuariosContent.tsx` | CRUD de usuarios, asignación de cotizaciones |
| `PermisosRolesContent.tsx` | Configuración de permisos por rol (solo SUPER_ADMIN) |
| `BackupsConfigContent.tsx` | Configuración de backups y lista de backups del usuario |
| `UserProfileMenu.tsx` | Avatar con logo en navbar + menú desplegable |
| `ChangePasswordDialog.tsx` | Modal para cambiar contraseña (usando DialogoGenericoDinamico) |
| `login/page.tsx` | Página de login para clientes |
| `api/users/route.ts` | API REST para gestión de usuarios |
| `api/permissions/route.ts` | API REST para gestión de permisos |
| `api/user-backups/route.ts` | API REST para gestión de backups |
| `api/backup-config/route.ts` | API REST para configuración de backups |
| `middleware.ts` | Protección de rutas, redirección a login |
| `useBackups.ts` | Hook para operaciones de backup/restauración |

### Componente UserProfileMenu

```
┌─────────────────────────────────────────────────┐
│  Navbar existente            [Logo Avatar ▼]   │
└─────────────────────────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │ 👤 Juan Pérez           │
                        │    admin@empresa.com    │
                        │    Rol: ADMIN           │
                        ├─────────────────────────┤
                        │ 🔑 Cambiar contraseña   │
                        │ ⚙️ Preferencias         │
                        ├─────────────────────────┤
                        │ 🚪 Cerrar sesión        │
                        └─────────────────────────┘
```

**Características:**
- Avatar usa el logo de "Identidad Visual" de la sección Análisis de Contenido
- Si no hay logo, muestra iniciales del usuario
- Menú con Framer Motion para animaciones
- Información del usuario y rol visible
- Acciones: Cambiar contraseña, Preferencias, Cerrar sesión

### Componente ChangePasswordDialog

```
┌─────────────────────────────────────────────────────┐
│ Cambiar Contraseña                            [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Contraseña actual:                                  │
│ ┌─────────────────────────────────────────────┐     │
│ │ ••••••••                              [👁]  │     │
│ └─────────────────────────────────────────────┘     │
│                                                     │
│ Nueva contraseña:                                   │
│ ┌─────────────────────────────────────────────┐     │
│ │                                        [👁]  │     │
│ └─────────────────────────────────────────────┘     │
│ Mínimo 8 caracteres                                 │
│                                                     │
│ Confirmar nueva contraseña:                         │
│ ┌─────────────────────────────────────────────┐     │
│ │                                        [👁]  │     │
│ └─────────────────────────────────────────────┘     │
│                                                     │
│            [Cancelar]  [Cambiar Contraseña]         │
└─────────────────────────────────────────────────────┘
```

**Notas:**
- Usa `DialogoGenericoDinamico` como base
- Validación de contraseña segura
- Toggle para mostrar/ocultar contraseña
- Confirmación de contraseña debe coincidir

### Filtrado de Cotizaciones por Número Base

En el modal de gestión de usuarios, las cotizaciones se filtran para mostrar solo una entrada por número base:

```
Cotizaciones disponibles (antes):
- COT-2025-001        ← Número base
- COT-2025-001-V1     ← Versión 1
- COT-2025-001-V2     ← Versión 2
- COT-2025-002        ← Número base
- COT-2025-002-V1     ← Versión 1

Cotizaciones disponibles (después del filtro):
- COT-2025-001 (3 versiones)  ← Solo muestra base, asigna todas las versiones
- COT-2025-002 (2 versiones)
```

**Lógica:**
- Agrupar por número base (remover sufijo -Vx)
- Mostrar solo el número base en el selector
- Al asignar, vincular TODAS las versiones de ese número base
- Indicar cantidad de versiones entre paréntesis

### Archivos de Configuración

| Archivo | Cambios |
|---------|---------|
| `prisma/schema.prisma` | Nuevos modelos User, Session, VerificationToken |
| `package.json` | Nuevas dependencias next-auth, bcrypt |
| `.env` | Nuevas variables NEXTAUTH_SECRET, NEXTAUTH_URL |

---

## 📦 Sistema de Backup y Restauración

### Objetivo

Implementar un sistema de backup y restauración configurable por usuario que permita:
- Crear backups manuales o automáticos de los datos de configuración
- Restaurar datos desde backups anteriores
- Proteger contra pérdida accidental de datos (botón Reset)
- Configuración personalizable desde PreferenciasTab

### Modelo de Datos

```prisma
// ============================================
// MODELO: Backup de Usuario
// ============================================
model UserBackup {
  id          String   @id @default(cuid())
  userId      String
  nombre      String   // "Backup manual 08-dic-2025" o "Auto-backup pre-reset"
  tipo        String   // "manual" | "auto-pre-reset" | "auto-scheduled"
  datos       Json     // Snapshot completo según configuración
  version     String   // Versión del esquema para compatibilidad futura
  tamaño      Int      // Tamaño en bytes del backup
  incluye     Json     // { config: true, snapshots: true, secciones: [...] }
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([tipo])
}

// ============================================
// MODELO: Configuración de Backups (por usuario)
// ============================================
model BackupConfig {
  id                      String   @id @default(cuid())
  userId                  String   @unique
  
  // Límites (configurable desde PreferenciasTab)
  maxBackups              Int      @default(10)     // Máximo de backups a mantener
  autoDeleteAfterDays     Int?     // null = no auto-eliminar, número = días
  
  // Comportamiento de restauración (configurable)
  restoreMode             String   @default("ask")  // "full" | "section" | "ask"
  
  // Qué incluir en backups (configurable)
  includeConfig           Boolean  @default(true)   // Configuración de cotización
  includeSnapshots        Boolean  @default(true)   // Snapshots de paquetes
  includePreferences      Boolean  @default(false)  // Preferencias de usuario
  
  // Auto-backup
  autoBackupOnReset       Boolean  @default(true)   // Crear backup antes de reset
  
  updatedAt               DateTime @updatedAt
  
  user                    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### UI de Configuración de Backups

Ubicación: `PreferenciasTab > Backups`

```
┌─────────────────────────────────────────────────────────────────┐
│ 📦 CONFIGURACIÓN DE BACKUPS                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⚙️ LÍMITES                                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Máximo de backups a mantener        [    10    ] [▼]     │ │
│  │ Auto-eliminar backups después de    [    30    ] días    │ │
│  │                                      ☐ No auto-eliminar   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  🔄 COMPORTAMIENTO DE RESTAURACIÓN                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Al restaurar un backup:                                   │ │
│  │   ○ Reemplazar TODO (configuración completa)             │ │
│  │   ○ Solo la sección específica                           │ │
│  │   ● Preguntar cada vez                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  📋 CONTENIDO DE BACKUPS                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ☑ Incluir configuración de cotización                    │ │
│  │ ☑ Incluir snapshots de paquetes                          │ │
│  │ ☐ Incluir preferencias de usuario                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  🛡️ AUTO-BACKUP                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ☑ Crear backup automático antes de resetear datos        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📦 MIS BACKUPS (3 de 10)                            [+ Crear] │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔄 Auto-backup pre-reset         08-dic-2025 14:30  2.1MB │ │
│  │    Config ✓ Snapshots ✓                                   │ │
│  │    [🔄 Restaurar] [🗑️ Eliminar]                           │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 💾 Versión final cliente         07-dic-2025 18:00  1.8MB │ │
│  │    Config ✓ Snapshots ✓                                   │ │
│  │    [🔄 Restaurar] [🗑️ Eliminar]                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Reset con Protección

El botón "Reset" en los componentes de contenido ahora eliminará los datos de la BD con confirmación:

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUJO DE RESET SEGURO                     │
└──────────────────────────────────────────────────────────────┘

  [Reset] click
      │
      ▼
  ┌─────────────────────────────────────┐
  │ Verificar permiso: config.edit      │
  └─────────────────────────────────────┘
      │
      ├─── Sin permiso ───> Toast: "No tiene permisos"
      │
      ▼ Con permiso
  ┌─────────────────────────────────────┐
  │   ⚠️ ¿Eliminar datos de sección?    │
  │                                      │
  │   Esta acción eliminará los datos   │
  │   de [Presupuesto y Cronograma].    │
  │                                      │
  │   ⚡ Acción IRREVERSIBLE            │
  │                                      │
  │   [Cancelar]                        │
  │   [📦 Crear Backup y Eliminar] *    │
  │   [🗑️ Eliminar sin Backup]          │
  │                                      │
  │   * Solo visible si tiene           │
  │     permiso 'backups.create'        │
  └─────────────────────────────────────┘
      │
      ├─── "Crear Backup y Eliminar" ───┐
      │                                  │
      │    1. Verificar backups.create   │
      │    2. Verificar límite de backups│
      │       - Si lleno: eliminar viejo │
      │    3. Crear auto-backup          │
      │    4. Eliminar datos de BD       │
      │    5. Limpiar estado local       │
      │    6. Toast: "Datos eliminados.  │
      │       Backup creado: [nombre]"   │
      │                                  │
      ├─── "Eliminar sin Backup" ────────┤
      │                                  │
      │    1. Eliminar datos de BD       │
      │    2. Limpiar estado local       │
      │    3. Toast: "Datos eliminados"  │
      │                                  │
      └──────────────────────────────────┘
```

### API Endpoints

```
POST   /api/user-backups              → Crear backup (requiere backups.create)
GET    /api/user-backups              → Listar backups propios (requiere backups.view)
GET    /api/user-backups/:id          → Obtener backup específico (requiere backups.view)
POST   /api/user-backups/:id/restore  → Restaurar backup (requiere backups.restore)
DELETE /api/user-backups/:id          → Eliminar backup (requiere backups.delete)

GET    /api/backup-config             → Obtener configuración (requiere backups.view)
PUT    /api/backup-config             → Actualizar configuración (requiere backups.configure)

# Solo SUPER_ADMIN con backups.manage_all
GET    /api/admin/user-backups        → Listar backups de todos los usuarios
DELETE /api/admin/user-backups/:id    → Eliminar backup de cualquier usuario
```

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `prisma/schema.prisma` | Agregar modelos UserBackup y BackupConfig |
| `prisma/seed-permissions.ts` | Agregar permisos de backups |
| `src/lib/auth/permissions.ts` | Agregar tipos de permisos |
| `src/lib/types.ts` | Agregar tipos para backup |
| `src/app/api/user-backups/route.ts` | API para CRUD de backups |
| `src/app/api/user-backups/[id]/route.ts` | API para backup individual |
| `src/app/api/user-backups/[id]/restore/route.ts` | API para restaurar |
| `src/app/api/backup-config/route.ts` | API para config de backups |
| `src/features/admin/components/content/preferencias/BackupsConfigContent.tsx` | UI de configuración |
| `src/features/admin/hooks/useBackups.ts` | Hook para operaciones de backup |

### Migración del Botón "Descartar" → "Eliminar"

#### Estado Actual (a cambiar)

El botón "Descartar" actual en `ContentHeader.tsx` tiene la siguiente lógica:

```tsx
// Ubicación: src/features/admin/components/content/contenido/ContentHeader.tsx
// Comportamiento actual: Descarta cambios NO GUARDADOS y restaura al valor de BD
<button onClick={onReset} disabled={!hasChanges}>
  <FaUndo size={10} /> Descartar
</button>
```

**Flujo actual:**
1. Usuario edita campos en la UI (estado local)
2. Si hay cambios sin guardar, el botón "Descartar" se habilita
3. Al hacer clic, llama a `handleDescartarSeccion()` en ContenidoTab
4. `handleDescartarSeccion()` restaura desde `contenidoOriginalRef` (copia del último valor de BD)
5. **Problema:** Si BD está vacía, restaura a valores DEFAULT hardcodeados (líneas 651-667)

#### Nuevo Comportamiento Propuesto

**Opción A - Dos Botones Separados (RECOMENDADA):**

| Botón | Texto | Ícono | Habilitado cuando | Acción |
|-------|-------|-------|-------------------|--------|
| **Descartar** | "Descartar" | `FaUndo` | Hay cambios sin guardar | Restaura estado local al último valor guardado en BD |
| **Eliminar** | "Eliminar datos" | `FaTrash` | Hay datos guardados en BD | Muestra diálogo de confirmación → Elimina de BD |

**Diseño de ContentHeader actualizado:**

```tsx
interface ContentHeaderProps {
  // ... props existentes ...
  readonly onReset: () => void      // Descartar cambios locales (mantener)
  readonly onDelete: () => void     // NUEVO: Eliminar datos de BD
  readonly hasDataInDB?: boolean    // NUEVO: Si hay datos persistidos
}

// Botones en el header:
<div className="flex gap-2">
  {/* Botón Descartar - solo cambios locales */}
  <button
    onClick={onReset}
    disabled={!hasChanges}
    title="Descartar cambios sin guardar"
  >
    <FaUndo /> Descartar
  </button>
  
  {/* Botón Eliminar - datos de BD */}
  <button
    onClick={onDelete}
    disabled={!hasDataInDB}
    className="text-red-500 hover:bg-red-500/10"
    title="Eliminar datos guardados"
  >
    <FaTrash /> Eliminar
  </button>
  
  {/* Botón Guardar - mantener igual */}
  <button onClick={onGuardar} disabled={guardando || !hasChanges}>
    <FaSave /> {guardando ? 'Guardando...' : 'Guardar'}
  </button>
</div>
```

**Flujo del nuevo botón "Eliminar":**

```
┌──────────────────────────────────────┐
│ Usuario hace clic en "Eliminar"      │
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                 DialogoGenericoDinamico                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  🗑️ Eliminar [Nombre Sección]                          │  │
│  │                                                         │  │
│  │  ¿Estás seguro de eliminar todos los datos de          │  │
│  │  esta sección?                                          │  │
│  │                                                         │  │
│  │  Esta acción:                                           │  │
│  │  • Eliminará los datos de la base de datos              │  │
│  │  • La sección quedará vacía (sin contenido)             │  │
│  │  • No se mostrará en la página pública                  │  │
│  │                                                         │  │
│  │  ⚡ Esta acción NO es reversible sin un backup          │  │
│  │                                                         │  │
│  │  [Cancelar]                                             │  │
│  │  [📦 Crear Backup y Eliminar] * (si tiene permiso)     │  │
│  │  [🗑️ Eliminar sin Backup] (rojo)                       │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                       │
      ┌────────────────┼────────────────┐
      │                │                │
      ▼                ▼                ▼
 [Cancelar]    [Backup+Eliminar]   [Eliminar]
      │                │                │
   Cerrar        ┌─────┴─────┐    Eliminar de BD
   diálogo       │           │    directamente
                 ▼           ▼
           Crear backup   Eliminar
           en UserBackup  de BD
                 │           │
                 └─────┬─────┘
                       ▼
               Toast de confirmación
               + Limpiar estado local
```

#### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `ContentHeader.tsx` | Agregar prop `onDelete`, `hasDataInDB`; agregar botón rojo "Eliminar" |
| `ContenidoTab.tsx` | Agregar handler `handleEliminarSeccion(seccion)` con diálogo |
| Cada `*Content.tsx` | Pasar nuevas props `onDelete` y `hasDataInDB` |
| `useBackups.ts` | Función `crearBackupAntesDeBorrar()` |

#### Resumen de Comportamientos

| Escenario | Botón Descartar | Botón Eliminar |
|-----------|-----------------|----------------|
| Sin datos en BD, sin ediciones | Deshabilitado | Deshabilitado |
| Sin datos en BD, con ediciones | **Habilitado** → limpia ediciones | Deshabilitado |
| Con datos en BD, sin ediciones | Deshabilitado | **Habilitado** → diálogo |
| Con datos en BD, con ediciones | **Habilitado** → restaura a BD | **Habilitado** → diálogo |

### Eliminación de Valores por Defecto

Después de implementar el sistema de backup, se eliminarán todos los valores por defecto de los componentes de contenido. Esto garantiza que:

1. **Sin datos predeterminados:** Los campos estarán vacíos si no hay datos en BD
2. **Datos siempre desde BD:** No hay fallbacks a valores hardcodeados
3. **Reset = Eliminar:** El botón reset eliminará los datos reales de la BD
4. **Protección con backup:** Opción de crear backup antes de eliminar

**Documento de referencia:** `docs/sessions/TAREA_ELIMINAR_DEFAULTS.md`

---

## 🔒 Consideraciones de Seguridad

### Buenas Prácticas a Implementar

1. **Hash de contraseñas:** bcrypt con salt rounds = 12
2. **Sesiones JWT:** Tokens firmados con secret seguro
3. **HTTPS:** Obligatorio en producción
4. **Rate limiting:** Limitar intentos de login fallidos
5. **Validación de entrada:** Sanitizar todos los inputs
6. **CSRF Protection:** Tokens CSRF en formularios
7. **Verificación de permisos:** Validar permisos en cada operación sensible
8. **Jerarquía de roles:** Impedir escalación de privilegios

### Variables de Entorno Requeridas

```env
# NextAuth
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=https://tu-dominio.com

# Existentes
ADMIN_PASSWORD=<admin-password>
DATABASE_URL=<postgresql-url>
```

### Roles y Permisos

| Rol | Descripción | Nivel |
|-----|-------------|-------|
| `SUPER_ADMIN` | Control total del sistema, gestión de permisos | 3 |
| `ADMIN` | Gestión de clientes, acceso a cotizaciones asignadas | 2 |
| `CLIENT` | Solo ver su cotización asignada en página pública | 1 |

### Reglas de Seguridad para Roles

1. **SUPER_ADMIN solo puede ser creado por otro SUPER_ADMIN**
2. **ADMIN no puede ver ni modificar usuarios SUPER_ADMIN ni otros ADMIN**
3. **Cada rol solo puede gestionar usuarios de nivel inferior**
4. **Los permisos se verifican en cada endpoint de API**
5. **Los permisos por usuario (UserPermission) tienen prioridad sobre los de rol**

---

## 📦 Plan de Migración de Datos

### Estrategia de Migración

1. **No destructiva:** Mantener compatibilidad con `isGlobal`
2. **Opcional:** Usuarios pueden crearse gradualmente
3. **Fallback:** Si no hay usuario asignado, comportamiento legacy

### Script de Migración (Opcional)

```typescript
// prisma/migrate-users-from-quotations.ts
// Crear usuarios automáticamente desde cotizaciones existentes

async function migrateExistingQuotations() {
  const quotations = await prisma.quotationConfig.findMany({
    where: { empresa: { not: '' } }
  })
  
  for (const q of quotations) {
    const username = generateUsernameFromEmpresa(q.empresa)
    const tempPassword = generateSecurePassword()
    
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(tempPassword, 12),
        empresa: q.empresa,
        email: q.emailCliente || null,
        quotationAssignedId: q.id
      }
    })
    
    console.log(`Usuario creado: ${username} / ${tempPassword}`)
  }
}
```

---

## 📅 Cronograma Estimado

| Fase | Duración | Estado |
|------|----------|--------|
| Fase 1: Infraestructura | 2-3 hrs | ✅ Completada |
| Fase 2: UI Gestión Usuarios | 3-4 hrs | ✅ Completada |
| Fase 3: Página Login | 2-3 hrs | ✅ Completada |
| Fase 4: Multi-Cotización | 2-3 hrs | ✅ Completada |
| Fase 5: Sistema de Roles | 3-4 hrs | ✅ Completada |
| Fase 6: UI Permisos y Perfil | 10-12 hrs | ✅ Completada |
| Fase 7: Filtrado por Usuario | 2-3 hrs | 🔄 Pendiente |
| Fase 8: Historial Multi-Cliente | 2-3 hrs | 🔄 Pendiente |
| Fase 9: Testing | 2-3 hrs | 🔄 Pendiente |
| Fase 10: Sistema Backup/Restauración | 6-8 hrs | 🔄 Pendiente |
| Fase 11: Eliminación de Defaults | 2-3 hrs | 🔄 Pendiente |
| **TOTAL** | **38-51 hrs** | **59% Completado** |

---

## ✅ Checklist de Validación

### Antes de Implementar
- [ ] Revisar schema actual de Prisma
- [ ] Confirmar variables de entorno disponibles
- [ ] Verificar versión de Next.js compatible con NextAuth

### Durante Implementación
- [ ] Migración de BD exitosa
- [ ] Tests de autenticación funcionando
- [ ] UI de gestión de usuarios completa
- [ ] Página de login diseñada

### Post-Implementación
- [ ] Flujo completo testeado end-to-end
- [ ] Documentación de uso para administrador
- [ ] Backup de base de datos
- [ ] Variables de entorno en producción

### Sistema de Backup (Fase 10)
- [ ] Modelos UserBackup y BackupConfig creados
- [ ] Permisos de backups agregados al seed
- [ ] API endpoints funcionando (/api/user-backups, /api/backup-config)
- [ ] BackupsConfigContent integrado en PreferenciasTab
- [ ] Hook useBackups operativo
- [ ] **ContentHeader.tsx actualizado:** Botón "Eliminar" (rojo) agregado
- [ ] **Props `onDelete` y `hasDataInDB`:** Agregadas a 13 componentes *Content.tsx
- [ ] **Handler `handleEliminarSeccion`:** Creado en ContenidoTab.tsx
- [ ] **Diálogo de confirmación:** 3 opciones (Cancelar, Backup+Eliminar, Eliminar)
- [ ] Auto-backup antes de eliminar funcional
- [ ] Verificación de permisos en todas las operaciones

### Eliminación de Defaults (Fase 11)
- [ ] Todos los `default*` eliminados (10 objetos)
- [ ] Exports en index.ts actualizados
- [ ] Fallbacks cambiados a strings vacíos
- [ ] Secciones vacías ocultas en página pública
- [ ] Pruebas con BD vacía exitosas

---

## 📝 Notas Adicionales

### Compatibilidad Hacia Atrás
- El sistema mantiene el comportamiento de `isGlobal` para cotizaciones sin usuario asignado
- Esto permite una migración gradual sin romper funcionalidad existente

### Escalabilidad Futura
- El modelo soporta agregar más roles personalizados
- Se puede implementar OAuth (Google, Microsoft) en el futuro
- La estructura soporta múltiples cotizaciones por usuario (ya implementado)
- Los permisos son dinámicos y configurables desde la UI
- Sistema de backups extensible para nuevos tipos de datos
- Backups exportables a JSON para migración entre entornos

### Avatar de Usuario
- Por defecto usa el logo configurado en "Identidad Visual" (sección Análisis de Contenido)
- Se obtiene de `QuotationConfig.logoUrl` o similar
- Fallback: iniciales del usuario en un círculo con color basado en el nombre

### Decisiones de Diseño
1. **NextAuth.js:** Integración nativa con Next.js y flexibilidad
2. **Permisos Granulares:** Más control que solo roles fijos
3. **UserQuotationAccess:** Permite N:M entre usuarios y cotizaciones
4. **DialogoGenericoDinamico:** Reutilización del componente existente para todos los modales

### Credenciales de Prueba
- **Usuario Admin:** `admin` / `admin123`
- **Rol actual:** ADMIN (migrar a SUPER_ADMIN cuando se implemente)

---

*Documento actualizado el 9 de diciembre de 2025*  
*Versión 2.1 - Incluye sistema de roles jerárquico, permisos granulares, backup/restauración y eliminación de defaults*  
*Para implementar, proceder fase por fase según el roadmap*
