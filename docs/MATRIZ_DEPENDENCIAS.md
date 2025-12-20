# 📊 MATRIZ DE DEPENDENCIAS E IMPACTO

**Proyecto**: WebQuote - Integración Estructura Organizacional  
**Propósito**: Identificar rápidamente qué afecta a qué cuando se hace un cambio

---

## 1. MATRIZ DE DEPENDENCIAS DE ARCHIVOS

### Legend
- ✅ Sin cambios necesarios
- 🟡 Cambios menores
- 🔴 Cambios significativos
- 📝 Nuevo archivo
- 🗑️ Deprecado

### Tabla Principal

| Archivo | Tipo | Estado | Dependencias | Impactado Por |
|---------|------|--------|--------------|-----------------|
| `prisma/schema.prisma` | Config | 🔴 Cambios | - | Toda la BD |
| `src/lib/types.ts` | Types | 🔴 Cambios | prisma/schema | Frontend + Backend |
| `src/lib/apiProtection.ts` | Lib | 🟡 Cambios | Schema | APIs |
| `src/app/api/organizations/` | API | 📝 NUEVO | Schema + apiProtection | Frontend |
| `src/app/api/organizations/[id]/` | API | 📝 NUEVO | Schema + apiProtection | Frontend |
| `src/features/admin/components/tabs/PreferenciasTab/` | UI | 🟡 Cambios | APIs nuevas | Admin page |
| `src/features/admin/components/tabs/PreferenciasTab/OrganizacionContent.tsx` | UI | 📝 NUEVO | DialogoGenericoDinamico | PreferenciasTab |
| `src/features/admin/components/DialogoGenericoDinamico.tsx` | UI | ✅ Sin cambios | - | Reutilizable |
| `src/app/admin/page.tsx` | Page | 🟡 Cambios | PreferenciasTab | User |
| `src/stores/useToastStore.ts` | Store | ✅ Sin cambios | - | Todos |
| `src/hooks/usePermission.ts` | Hook | 🟡 Cambios | apiProtection | Components |
| `scripts/migrate-users-to-organizations.ts` | Script | 📝 NUEVO | Prisma | BD |

---

## 2. MATRIZ DE IMPACTO: CAMBIOS EN SCHEMA

### Si cambio: `Organization` (tabla nueva)

```
Organization (NUEVA)
    ↓
├─ User (FK organizationId)
├─ QuotationConfig (FK organizationId)
├─ AuditLog (registra cambios)
└─ APIs nuevas (POST, GET, PUT, DELETE)
    └─ Componentes que las usan
        └─ PreferenciasTab
            └─ admin/page.tsx
```

**Archivos Afectados:**
```
CRÍTICO:
  - prisma/schema.prisma
  - prisma/migrations/*
  - src/lib/types.ts

IMPORTANTE:
  - src/app/api/organizations/* (API)
  - src/features/admin/components/tabs/PreferenciasTab/* (UI)

SECUNDARIO:
  - src/app/admin/page.tsx
  - src/hooks/usePermission.ts
  - scripts/migrate-users-to-organizations.ts
```

**Testing Necesario:**
- [ ] BD valida schema sin errores
- [ ] Prisma Client genera tipos correctamente
- [ ] Migration se ejecuta sin errores
- [ ] Rollback revierte cambios

---

### Si cambio: `User.organizationId`

```
User.organizationId (NUEVA FK)
    ↓
├─ Queries que filtran por usuario
│   ├─ /api/users
│   ├─ /api/users/[id]
│   └─ usePermission hook
├─ Componentes que listan usuarios
│   ├─ UserManagementPanel
│   └─ PreferenciasTab
└─ Auditoría
    └─ AuditLog registra cambios a usuario
```

**Cambios Necesarios:**
```typescript
// En usePermission hook:
// Antes: Solo revisar User.role
// Ahora: Revisar User.role + Organization.permissions

// En /api/users:
// Antes: return await prisma.user.findMany()
// Ahora: return await prisma.user.findMany({
//   include: { organization: true }
// })

// En componentes:
// Antes: <UserRow user={user} />
// Ahora: <UserRow user={user} org={user.organization} />
```

---

### Si cambio: `QuotationConfig.organizationId`

```
QuotationConfig.organizationId (NUEVA FK)
    ↓
├─ Queries de cotizaciones
│   ├─ /api/quotations
│   ├─ /api/quotation-config/[id]
│   └─ /api/snapshots
├─ Filtros por usuario/org
│   ├─ admin/page.tsx (lista cotizaciones)
│   └─ Historial.tsx
└─ Snapshots
    └─ /api/snapshots (filtrar por org)
```

**Impacto: ALTO**

Necesita cambios en múltiples APIs para filtrar por organization.

---

## 3. MATRIZ DE DEPENDENCIAS: COMPONENTES UI

### PreferenciasTab

```
PreferenciasTab/index.tsx
    ├─ OrganizacionContent.tsx (NUEVO)
    │   ├─ DialogoGenericoDinamico ✅
    │   ├─ useToast ✅
    │   ├─ /api/organizations (NUEVO)
    │   └─ /api/audit-logs ✅
    │
    ├─ PermisosRolesContent.tsx (ACTUALIZAR)
    │   ├─ DialogoGenericoDinamico ✅
    │   ├─ usePermission ✅
    │   ├─ /api/roles (NUEVO)
    │   └─ /api/audit-logs ✅
    │
    ├─ LogsAuditoriaContent.tsx ✅
    │   └─ /api/audit-logs ✅
    │
    └─ BackupRestoreContent.tsx ✅
        └─ /api/backups ✅
```

---

## 4. IMPACTO EN APIS

### APIs Nuevas (Cambios de BD)

| API | Método | Requiere | Afecta a |
|-----|--------|----------|----------|
| `/api/organizations` | GET | Schema | PreferenciasTab |
| `/api/organizations` | POST | Schema + Permisos | PreferenciasTab |
| `/api/organizations/[id]` | GET | Schema | PreferenciasTab |
| `/api/organizations/[id]` | PUT | Schema + Permisos | PreferenciasTab |
| `/api/organizations/[id]` | DELETE | Schema + Permisos | PreferenciasTab |
| `/api/organizations/[id]/users` | GET | Schema + User.organizationId | PreferenciasTab |
| `/api/organizations/[id]/users` | POST | Schema + Permisos | PreferenciasTab |

### APIs Existentes (Cambios de lógica)

| API | Cambio | Por Qué | Pruebas |
|-----|--------|--------|---------|
| `/api/quotations` | Incluir organization | Filtrar por org | Listar por org |
| `/api/snapshots` | Filtrar por org | No acceso cruzado | Snapshot de otra org retorna 403 |
| `/api/users` | Incluir organization | Mostrar org asignada | User card muestra org |
| `/api/audit-logs` | Registrar org changes | Auditoría completa | Organization logs en UI |

---

## 5. IMPACTO EN FLUJOS DE USUARIOS

### Flujo: Crear Cotización

```
User abre admin/page.tsx
    ↓
Hace clic en "Nueva Cotización"
    ↓
Sistema debe:
  1. Verificar que User.organizationId existe ✅
  2. Pre-llenar cotización con org data ← CAMBIO
  3. Guardar con quotationConfigId.organizationId ← CAMBIO
    ↓
POST /api/quotation-config
    ↓
Backend:
  1. Verificar permisos en organización ← CAMBIO
  2. Crear cotización
  3. Auditar con organizationId ← CAMBIO
    ↓
✅ Cotización creada
```

**Archivos Afectados:**
- `src/app/admin/page.tsx` (UI)
- `src/app/api/quotation-config/route.ts` (API)
- Formulario de cotización

---

### Flujo: Administrar Estructura Org

```
Admin abre PreferenciasTab
    ↓
Selecciona sección "Estructura Organizacional"
    ↓
Ve OrganizacionContent (NUEVO)
    ↓
GET /api/organizations
    ↓
Muestra árbol jerárquico
    ↓
Admin hace clic en "Agregar Organización"
    ↓
DialogoGenericoDinamico abre (REUTILIZADO)
    ↓
Admin llena formulario + hace clic "Guardar"
    ↓
POST /api/organizations
    ↓
Backend:
  1. Valida permisos org.create
  2. Crea registro
  3. Audita: "org.created"
    ↓
Toast: "Organización creada"
    ↓
Lista se actualiza automáticamente
```

**Archivos Involucrados:**
- PreferenciasTab (ACTUALIZAR)
- OrganizacionContent (NUEVO)
- /api/organizations (NUEVO)
- AuditLog (EXISTENTE)

---

## 6. MATRIZ DE TESTING

### Por Componente

| Componente | Unit | Integration | E2E | Criticidad |
|-----------|------|-------------|-----|-----------|
| Organization Schema | ✅ | ✅ | ✅ | CRÍTICA |
| /api/organizations | ✅ | ✅ | ✅ | CRÍTICA |
| User.organizationId FK | ✅ | ✅ | N/A | CRÍTICA |
| QuotationConfig.organizationId FK | ✅ | ✅ | N/A | CRÍTICA |
| OrganizacionContent.tsx | ✅ | ✅ | ✅ | IMPORTANTE |
| usePermission (con org) | ✅ | ✅ | N/A | IMPORTANTE |
| Auditoría de org changes | ✅ | ✅ | ✅ | IMPORTANTE |
| Validación jerarquía | ✅ | ✅ | N/A | IMPORTANTE |
| Migración usuarios | ✅ | ✅ | N/A | IMPORTANTE |
| Tema light/dark | N/A | ✅ | ✅ | SECUNDARIA |

---

## 7. PLAN DE ROLLOUT

### Semana 1: Setup
```
Lunes:
  - Review de documentación
  - Setup de rama git
  - Migration Prisma
  ├─ [ ] Confirmar schema.prisma sin errores
  ├─ [ ] Ejecutar migration en local
  ├─ [ ] Generar tipos Prisma
  └─ [ ] Tests de integridad pasan

Martes-Miércoles:
  - APIs base /api/organizations
  ├─ [ ] POST /api/organizations crea correctamente
  ├─ [ ] GET /api/organizations lista correctamente
  ├─ [ ] PUT /api/organizations/[id] actualiza
  ├─ [ ] DELETE /api/organizations/[id] elimina
  └─ [ ] Auditoría registra todas las acciones

Jueves-Viernes:
  - Componentes UI PreferenciasTab
  ├─ [ ] OrganizacionContent renderiza sin errores
  ├─ [ ] Diálogos funcionan (crear, editar, eliminar)
  ├─ [ ] Árbol jerárquico se muestra correctamente
  └─ [ ] Tema light/dark aplica
```

### Semana 2: Integración
```
Lunes:
  - Integración con User.organizationId
  ├─ [ ] Script de migración reversible
  ├─ [ ] Usuarios asignados a org
  └─ [ ] usePermission valida org

Martes:
  - Integración con QuotationConfig
  ├─ [ ] Cotizaciones vinculadas a org
  ├─ [ ] Filtros por org funcionan
  └─ [ ] Snapshots filtran por org

Miércoles-Jueves:
  - Testing completo
  ├─ [ ] Unit tests 100% coverage
  ├─ [ ] Integration tests pasen
  └─ [ ] E2E tests flujos principales

Viernes:
  - Code review
  ├─ [ ] Security review (permisos)
  ├─ [ ] Performance review
  └─ [ ] Merge a main branch
```

### Semana 3: Deploy
```
Lunes:
  - Deploy a staging
  ├─ [ ] Migración en staging DB
  ├─ [ ] Todas las features funcionan
  └─ [ ] Performance OK

Martes-Miércoles:
  - UAT (User Acceptance Testing)
  ├─ [ ] Stakeholders prueban
  ├─ [ ] Feedback registrado
  └─ [ ] Bugs solucionados

Jueves:
  - Deploy a producción
  ├─ [ ] Backup de BD
  ├─ [ ] Migration ejecuta sin errores
  └─ [ ] Rollback plan listo

Viernes:
  - Monitoreo
  ├─ [ ] Logs sin errores
  ├─ [ ] Auditoría registra correctamente
  └─ [ ] Performance OK
```

---

## 8. CHECKLIST DE DEPENDENCIAS

### Antes de Empezar
- [ ] Todos los archivos mencionados existen
- [ ] Código existente compila sin errores
- [ ] BD es accesible
- [ ] Tests actuales pasan

### Durante Desarrollo
- [ ] Ningún cambio rompe tests existentes
- [ ] Nuevos cambios tienen tests
- [ ] Docs se actualizan junto con código
- [ ] Commits incluyen referencia a este documento

### Pre-Deploy
- [ ] Todas las dependencias resueltas
- [ ] Performance validado
- [ ] Security review completado
- [ ] Rollback plan está listo

---

## 9. MATRIZ RÁPIDA: "¿Qué falta?"

Cuando digas "No funciona X", usa esta matriz:

```
¿No funciona crear organización?
├─ [ ] Verificar schema.prisma (tabla Organization existe)
├─ [ ] Verificar /api/organizations existe
├─ [ ] Verificar DialogoGenericoDinamico está importado
├─ [ ] Verificar permisos org.create
└─ [ ] Revisar logs de error en BD

¿No funciona auditoría?
├─ [ ] Verificar AuditLog tabla existe
├─ [ ] Verificar createAuditLog() se llama en API
├─ [ ] Verificar /api/audit-logs retorna logs
└─ [ ] Revisar LogsAuditoriaContent muestra registros

¿Usuarios sin organización?
├─ [ ] Ejecutar script de migración
├─ [ ] Verificar FK no es NOT NULL (aún)
├─ [ ] Crear org raíz si no existe
└─ [ ] Asignar usuarios a org raíz

¿Permisos no funcionan?
├─ [ ] Verificar User.role existe
├─ [ ] Verificar usePermission() valida org
├─ [ ] Verificar requireReadPermission() en API
└─ [ ] Revisar middleware de protección

¿Performance lenta?
├─ [ ] Revisar query includes {} (N+1 queries)
├─ [ ] Agregar índices en BD (parentId, createdBy)
├─ [ ] Revisar pagination en GET
└─ [ ] Usar caching si es apropiado
```

---

## 📞 Contacto

Si algo en la matriz está incorrecto o desactualizado:
1. Abrir issue en el repositorio
2. Actualizar este documento
3. Re-validar todo el flujo

**Última actualización**: 15 Diciembre 2024  
**Próxima review**: 15 Enero 2025
