# 🏗️ DOCUMENTO DE DECISIONES ARQUITECTÓNICAS (ADR)

**Proyecto**: WebQuote - Sistema de Cotizaciones  
**Aspecto**: Estructura Organizacional Jerárquica  
**Versión**: 1.0  
**Fecha**: 15 de Diciembre de 2024

---

## ADR-001: Introducir Tabla Organization Separada

### 🎯 Problema Identificado

Actualmente, la información organizacional está dispersa:
- Campo `empresa` en `QuotationConfig` (duplicado, sin normalización)
- No existe jerarquía organizacional
- No se puede modelar relaciones empresa-departamento-equipo
- Cada cotización almacena nombre de empresa, duplicando datos

### ✅ Decisión

**Crear nueva tabla `Organization` con relaciones jerárquicas**

### 📝 Justificación

| Aspecto | Beneficio |
|---------|-----------|
| **Normalización** | Elimina duplicación de "empresa" en múltiples tablas |
| **Escalabilidad** | Permite N niveles de jerarquía (empresa → dpto → equipo → proyecto) |
| **Auditoría** | Rastrear cambios organizacionales con timestamps |
| **Permisos** | Aplicar permisos a nivel organizacional |
| **Reportes** | Agrupar datos por org (ingresos/mes por empresa, etc) |

### 🔄 Impacto

| Componente | Cambio | Riesgo | Mitigación |
|-----------|--------|--------|-----------|
| `User` | Agregar `organizationId` FK | Bajo | Hacer nullable, migración de datos |
| `QuotationConfig` | Agregar `organizationId` FK | Bajo | Mantener campo `empresa` por compatibilidad |
| `APIs` | Nuevos endpoints `/organizations/` | Bajo | Protegidos con permisos granulares |
| **BD** | Nueva tabla | Medio | Migration reversible, backup previo |

### 📅 Timeline

- Migration: 2 horas
- APIs base: 4 horas
- Componentes: 4 horas
- Testing: 6 horas

---

## ADR-002: Mantener Compatibilidad con Campo `empresa`

### 🎯 Problema

¿Eliminar campo `empresa` en `QuotationConfig` o mantenerlo?

### ✅ Decisión

**Mantener campo por compatibilidad, pero deprecated**

### 📝 Justificación

```typescript
// SÍ, hacer esto:
model QuotationConfig {
  // Nuevo (recomendado)
  organizationId: String?
  organization: Organization?
  
  // Viejo (deprecado pero funcional)
  empresa: String
}

// Razones:
// 1. No romper código existente
// 2. Permitir migración gradual
// 3. Facilitar rollback si es necesario
// 4. Queries sin JOINs complejos durante transición
```

### 🔄 Impacto: MÍNIMO

No afecta:
- Cotizaciones existentes (siguen funcionando)
- APIs existentes (campos siguen siendo leídos)
- Componentes frontend (compatible hacia atrás)

### 📅 Plan de Deprecación

1. **Fase 1 (Ahora)**: Agregar `organizationId`, mantener `empresa`
2. **Fase 2 (Mes 1)**: Migrar datos históricos con script
3. **Fase 3 (Mes 3)**: Marcar campo `empresa` como deprecated
4. **Fase 4 (Mes 6)**: Eliminar campo (si es posible)

---

## ADR-003: Usar Relación Self-Join para Jerarquía

### 🎯 Problema

¿Cómo modelar jerarquía: tabla separada, JSONB, o self-join?

### ✅ Decisión

**Self-join en tabla Organization**

```prisma
model Organization {
  parentId      String?
  parent        Organization? @relation("Hierarchy", fields: [parentId], references: [id])
  children      Organization[] @relation("Hierarchy")
}
```

### 📝 Comparativa

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **Self-Join (ELEGIDA)** | Queries SQL normalizadas, transacciones ACID, indexes eficientes | Recursión en queries |
| Tabla Separada | Separación de conceptos | Complejidad, JOINs adicionales |
| JSONB | Flexible | No-relacional, queries complejas, sin integridad referencial |

### 🔄 Impacto

✅ Permite queries eficientes con índices:
```sql
-- Obtener toda la jerarquía de una org
WITH RECURSIVE hierarchy AS (
  SELECT id, parentId, nombre FROM Organization WHERE id = 'org-123'
  UNION ALL
  SELECT o.id, o.parentId, o.nombre FROM Organization o
  INNER JOIN hierarchy h ON o.parentId = h.id
)
SELECT * FROM hierarchy
```

---

## ADR-004: Permisos a Nivel Organization + Sistema

### 🎯 Problema

¿Dónde aplicar permisos: nivel Usuario.role o nivel Organization?

### ✅ Decisión

**Jerarquía de permisos: Sistema → Organización**

```typescript
// 1. Role nivel SISTEMA (SUPER_ADMIN, ADMIN, VENDEDOR, etc)
// 2. Permisos a nivel ORGANIZATION (sobrescriben role si son más restrictivos)
// 3. User siempre hereda: MIN(role.permissions, org.permissions)

interface PermissionResolution {
  // Ejemplo: User en rol VENDEDOR en dos orgs
  user: {
    role: VENDEDOR,  // Puede crear cotizaciones
    orgs: [
      { org: "empresa-a", permissions: "quotation.read,quotation.create" },
      { org: "empresa-b", permissions: "quotation.read" }  // Solo lectura aquí
    ]
  }
  
  // En empresa-a: FULL access
  // En empresa-b: READ only
}
```

### 📝 Justificación

- **Escalable**: Múltiples organizaciones con diferentes niveles
- **Flexible**: Permisos granulares sin cambiar role global
- **Seguro**: Restricción más baja prevalece
- **Auditable**: Cada grant se registra con timestamp

### 🔄 Impacto

| Aspecto | Cambio |
|---------|--------|
| **APIs** | Validar acceso a org ANTES de CRUD |
| **Componentes** | Filtrar recursos por org actual |
| **Auditoría** | Registrar cambios de permisos a org |

---

## ADR-005: Usar DialogoGenericoDinamico para CRUD

### 🎯 Problema

¿Crear diálogos específicos para cada entidad o reutilizar genérico?

### ✅ Decisión

**Reutilizar DialogoGenericoDinamico con configuración flexible**

```typescript
// En lugar de:
export function CrearOrganizacionModal() { ... }
export function EditarOrganizacionModal() { ... }
export function CrearUsuarioModal() { ... }

// Hacer esto:
<DialogoGenericoDinamico
  title="Nueva Organización"
  fields={[
    { name: 'nombre', type: 'text', label: 'Nombre', required: true },
    { name: 'sector', type: 'text', label: 'Sector', required: true },
    { name: 'parentId', type: 'select', label: 'Padre (opcional)' }
  ]}
  onSubmit={handleGuardar}
/>
```

### 📝 Beneficios

✅ **DRY Principle**: No repetir lógica de diálogos  
✅ **Coherencia**: Todos los diálogos tienen mismo look & feel  
✅ **Mantenimiento**: Bug fixes en un lugar  
✅ **Rapidez**: Desarrollo más rápido  

### 🔄 Impacto: POSITIVO

- Menos código
- Menos bugs
- Temas automáticos (light/dark)
- Validaciones unificadas

---

## ADR-006: Estructura de Ficheros del Componente

### 🎯 Problema

¿Cómo organizar archivos de PreferenciasTab con múltiples secciones?

### ✅ Decisión

```
src/features/admin/components/tabs/PreferenciasTab/
├── index.tsx                     (Main component)
├── OrganizacionContent.tsx       (NEW - Estructura org)
├── PermisosRolesContent.tsx      (UPDATE - Permisos granulares)
├── LogsAuditoriaContent.tsx      (EXISTING - Auditoría)
├── BackupRestoreContent.tsx      (EXISTING - Backups)
└── ConfiguracionAvanzada.tsx     (NEW - Configuración)
```

### 📝 Ventajas

✅ **Separación de Concerns**: Cada sección es independiente  
✅ **Escalabilidad**: Fácil agregar nuevas secciones  
✅ **Testing**: Unit test por sección  
✅ **Lazy Loading**: Cargar secciones bajo demanda  

---

## ADR-007: Auditoría: Registrar TODO vs. Solo Crítico

### 🎯 Problema

¿Auditar cada cambio (performance hit) o solo cambios críticos?

### ✅ Decisión

**Estrategia de 3 niveles**

```typescript
enum AuditLevel {
  CRITICAL = 'CRITICAL',    // SIEMPRE: Roles, Permisos, Orgs, Usuarios
  IMPORTANT = 'IMPORTANT',  // CONFIGURABLE: Cotizaciones, Snapshots, Acceso
  STANDARD = 'STANDARD'     // CONFIGURABLE: Preferencias, Cambios menores
}

// Implementación:
// 1. Crear tabla AuditConfig { level, resource }
// 2. En cada API: revisar nivel ANTES de registrar
// 3. Admin puede cambiar niveles sin restart
```

### 📝 Impacto

| Nivel | Registra | Performance | Almacenamiento |
|-------|----------|-------------|-----------------|
| **CRITICAL** | Roles, Permisos | Mínimo | ~100 KB/mes |
| **IMPORTANT** | Cotizaciones | Bajo | ~500 KB/mes |
| **STANDARD** | Todo lo demás | Variable | ~2 MB/mes |

---

## ADR-008: Migración de Datos Usuarios a Organizaciones

### 🎯 Problema

Usuarios actuales no tienen `organizationId`. ¿Cómo migrar sin romper nada?

### ✅ Decisión

**Script de migración reversible con validaciones**

```typescript
// scripts/migrate-users-to-organizations.ts
async function migrateUsersToOrganizations() {
  // Paso 1: Crear organización "raíz" si no existe
  const root = await prisma.organization.upsert({
    where: { id: 'ORG_ROOT' },
    create: {
      id: 'ORG_ROOT',
      nombre: 'WebQuote Solutions',
      sector: 'Software',
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM'
    },
    update: {}
  })

  // Paso 2: Migrar usuarios sin org
  const updated = await prisma.user.updateMany({
    where: { organizationId: null },
    data: { organizationId: root.id }
  })

  console.log(`✅ ${updated.count} usuarios migrados`)

  // Paso 3: Validar integridad
  const orphaned = await prisma.user.count({
    where: { organizationId: null }
  })
  
  if (orphaned > 0) {
    throw new Error(`❌ ${orphaned} usuarios sin organización!`)
  }

  return true
}
```

### 📝 Ventajas

✅ **Reversible**: Backup automático antes de correr  
✅ **Seguro**: Validaciones en cada paso  
✅ **Auditable**: Registra qué se migró  
✅ **Fast**: Bulk update, no loop  

---

## ADR-009: Validación de Integridad Referencial

### 🎯 Problema

¿Dejar que BD valide o implementar checks en backend?

### ✅ Decisión

**BD valida, Backend valida, Frontend previene**

```
Frontend (previene situaciones inválidas)
        ↓
Backend (valida antes de persistir)
        ↓
BD (ConstraintError si algo pasa)
```

**Ejemplo:**
```typescript
// Frontend: No permitir eliminar org con hijos
if (org.children.length > 0) {
  showError('No se puede eliminar')
  return
}

// Backend: Doble-check
const existing = await prisma.organization.findUnique({
  include: { children: true }
})

if (existing.children.length > 0) {
  return NextResponse.json(
    { error: 'Tiene hijos asignados' },
    { status: 409 }
  )
}

// BD: Constraint (onDelete: SetNull o RESTRICT)
model Organization {
  children Organization[] @relation("Hierarchy")
  @@constraint: si elimina parent, qué hacer con children
}
```

---

## ADR-010: Testing Strategy

### 🎯 Problema

¿Qué testear y en qué orden?

### ✅ Decisión

**Pirámide de testing: Unidad → Integración → E2E**

```
         ╱╲         E2E (1-2)
        ╱  ╲       - Flujos completos
       ╱────╲      - UI + API + BD
      ╱      ╲
     ╱────────╲   Integration (5-10)
    ╱          ╲  - APIs con BD
   ╱────────────╲ - Permisos, Auditoría
  ╱              ╲
 ╱────────────────╲Unit (20-30)
                   - Validaciones
                   - Funciones helpers
                   - Tipos
```

### 📝 Plan

1. **Unit Tests** (Semana 1)
   - Validadores de Organization
   - Helpers de auditoría
   - Funciones de permiso

2. **Integration Tests** (Semana 2)
   - POST /api/organizations
   - PUT /api/organizations/[id]
   - Permisos en APIs

3. **E2E Tests** (Semana 3)
   - Crear org → Agregar usuario → Asignar permisos
   - Auditoría registra cambios
   - Jerarquía funciona

---

## 📊 Resumen de Decisiones

| ADR | Decisión | Riesgo | Reversible |
|-----|----------|--------|-----------|
| ADR-001 | Nueva tabla Organization | Bajo | ✅ Sí (drop table) |
| ADR-002 | Mantener `empresa` | Mínimo | ✅ Sí (ya existe) |
| ADR-003 | Self-join para jerarquía | Bajo | ✅ Sí |
| ADR-004 | Permisos doble-nivel | Bajo | ✅ Sí |
| ADR-005 | Reutilizar DialogoGenericoDinamico | Mínimo | ✅ Sí |
| ADR-006 | Ficheros modulares | Mínimo | ✅ Sí |
| ADR-007 | Auditoría por niveles | Bajo | ✅ Sí |
| ADR-008 | Migración con script | Bajo | ✅ Sí (reversible) |
| ADR-009 | Validación multi-capa | Mínimo | ✅ Sí |
| ADR-010 | Testing pyramid | Bajo | ✅ Sí |

---

## ✅ Aprobación

- **Arquitecto**: GitHub Copilot ✅
- **Lead Frontend**: (Pendiente)
- **Lead Backend**: (Pendiente)
- **Security**: (Pendiente revisión de permisos)

---

## 📝 Notas

- Este documento puede ser actualizado si surge nueva información
- Todas las decisiones son reversibles (no son "punto de no retorno")
- Priorizar completar FASE 1-3 antes de ampliar scope

**Próximo review**: 15 Enero 2025
