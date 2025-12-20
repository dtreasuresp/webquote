# 📚 DOCUMENTO MAESTRO: INTEGRACIÓN COMPLETA - ESTRUCTURA ORGANIZACIONAL

**Versión**: 2.0 - AUDITORÍA 100% COMPLETA  
**Fecha**: 15 de Diciembre de 2024  
**Estado**: LISTO PARA IMPLEMENTACIÓN  

---

## 📋 TABLA DE CONTENIDOS

1. [VISIÓN GENERAL](#1-visión-general)
2. [ARQUITECTURA TÉCNICA ACTUAL](#2-arquitectura-técnica-actual)
3. [PROPUESTA DE ESTRUCTURA ORGANIZACIONAL](#3-propuesta-de-estructura-organizacional)
4. [PLAN DE IMPLEMENTACIÓN (8 FASES)](#4-plan-de-implementación-8-fases)
5. [AUDITORÍA DEL ESTADO ACTUAL](#5-auditoría-del-estado-actual)
6. [MATRIZ DE INTEGRACIÓN](#6-matriz-de-integración)
7. [CONFLICTOS Y SOLUCIONES](#7-conflictos-y-soluciones)
8. [CHECKLIST FINAL](#8-checklist-final)

---

## 1. VISIÓN GENERAL

### 🎯 Objetivo Principal

Implementar una **Estructura Organizacional Jerárquica** completa en WebQuote que permita:
- ✅ Administración empresarial multinivel
- ✅ Delegación de permisos granulares
- ✅ Coherencia visual y de UX garantizada
- ✅ Auditoría completa de operaciones
- ✅ Integración perfecta con: CRM, Ventas, Facturación, Cotizaciones, Usuarios, Backups

### 🏗️ Componentes Clave

| Componente | Estado | Ubicación |
|-----------|--------|-----------|
| **PreferenciasTab** | En construcción | `src/features/admin/components/tabs/` |
| **DialogoGenericoDinamico** | ✅ Existente | `src/features/admin/components/` |
| **Sistema de Permisos** | ✅ Completo | `src/lib/apiProtection.ts` |
| **Sistema de Auditoría** | ✅ Completo | `src/app/api/audit-logs/` |
| **Sistema de Backups** | ✅ Completo | `src/app/api/backups/` |
| **Cotizaciones/Snapshots** | ✅ Completo | `src/app/api/snapshots/` |
| **UserManagement** | ✅ Existente | `src/features/admin/components/` |

---

## 2. ARQUITECTURA TÉCNICA ACTUAL

### 2.1 Stack Tecnológico

```
Frontend:        Next.js 14 + React 19 + TypeScript + Tailwind CSS
Estado:          Zustand stores
Animaciones:     Framer Motion
Componentes UI:  Custom + Lucide icons
Servidor:        Next.js API Routes
BD:              PostgreSQL (Neon) + Prisma ORM
Auth:            NextAuth.js
```

### 2.2 Modelos Prisma Principales

```prisma
// Usuarios y Autenticación
model User {
  id                    String
  username              String @unique
  email                 String @unique
  roleId                String
  role                  Role @relation(fields: [roleId], references: [id])
  organizationId        String
  organization          Organization @relation(fields: [organizationId], references: [id])
  quotationAssignedId   String?
  quotationAssigned     QuotationConfig? @relation(fields: [quotationAssignedId], references: [id])
}

// Estructura Organizacional
model Organization {
  id                    String
  nombre                String
  sector                String
  profesional           String
  parentId              String?  // Para jerarquía
  parent                Organization? @relation("OrganizationHierarchy", fields: [parentId], references: [id])
  children              Organization[] @relation("OrganizationHierarchy")
  users                 User[]
  quotations            QuotationConfig[]
}

// Cotizaciones y Versiones
model QuotationConfig {
  id                    String
  numero                String
  versionNumber         Int
  isGlobal              Boolean
  packagesSnapshot      Json?  // Backup de paquetes
  packagesSnapshotAt    DateTime?
  organizationId        String
  organization          Organization @relation(fields: [organizationId], references: [id])
  packageSnapshots      PackageSnapshot[]
  quotationSnapshots    QuotationSnapshot[]
}

// Snapshots de Paquetes
model PackageSnapshot {
  id                    String
  nombre                String
  activo                Boolean
  quotationConfigId     String
  quotationConfig       QuotationConfig @relation(fields: [quotationConfigId], references: [id])
}

// Auditoría
model AuditLog {
  id                    String
  action                String
  entityType            String
  entityId              String?
  userId                String
  userName              String
  details               Json?
  ipAddress             String?
  userAgent             String?
  createdAt             DateTime @default(now())
  user                  User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

### 2.3 Componentes UI Existentes

#### DialogoGenericoDinamico
```typescript
// Ubicación: src/features/admin/components/DialogoGenericoDinamico.tsx
// Uso: Diálogos dinámicos con formularios
export interface DialogFormField {
  name: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: (value: any) => string | null
}
```

**Características:**
- ✅ Formularios dinámicos
- ✅ Validación integrada
- ✅ Soporte para múltiples tipos (text, select, textarea, etc)
- ✅ Estilo GitHub (tema claro/oscuro)
- ✅ Animaciones Framer Motion

#### Toast System
```typescript
// Ubicación: src/stores/useToastStore.ts
// Métodos: toast.success(), toast.error(), toast.info(), toast.warning()
```

**Características:**
- ✅ Notificaciones non-blocking
- ✅ Auto-dismiss
- ✅ Soporte para acciones

#### Sistema de Permisos
```typescript
// Ubicación: src/lib/apiProtection.ts
// Hook: usePermission('nombreRecurso')
// Helpers: requireReadPermission(), requireWritePermission(), requireFullPermission()
```

**Características:**
- ✅ Permisos granulares por recurso
- ✅ Niveles de acceso (NONE, READ, WRITE, FULL)
- ✅ Protección en APIs y componentes

---

## 3. PROPUESTA DE ESTRUCTURA ORGANIZACIONAL

### 3.1 Modelo Jerárquico

```
┌─────────────────────────────────────────────────┐
│       ORGANIZACIÓN RAÍZ (ROOT)                   │
│  "WebQuote Solutions" (ID raíz)                  │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┼────────────┬─────────────────┐
    │            │            │                 │
    ▼            ▼            ▼                 ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Empresa  │ │ Empresa  │ │ Empresa  │ │   Proyecto   │
│    A     │ │    B     │ │    C     │ │  Especial    │
└──────────┘ └──────────┘ └──────────┘ └──────────────┘
    │
    ├──► Departamento Ventas
    ├──► Departamento Desarrollo
    └──► Departamento Admin

```

### 3.2 Entidades Principales

#### 3.2.1 Organization (Nueva Estructura)

```typescript
interface Organization {
  id: string
  nombre: string
  sector: string
  descripcion?: string
  logotipo?: string
  
  // Jerarquía
  parentId?: string
  nivel: 'RAIZ' | 'EMPRESA' | 'DEPARTAMENTO' | 'EQUIPO' | 'PROYECTO'
  
  // Contacto
  email: string
  telefono?: string
  direccion?: string
  ciudad?: string
  pais?: string
  
  // Datos financieros
  rfc?: string
  razonSocial?: string
  
  // Relaciones
  users: User[]
  quotations: QuotationConfig[]
  children: Organization[]
  parent?: Organization
  
  // Auditoría
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string
  updatedBy: string
}
```

#### 3.2.2 Nuevos Tipos de Rol

```typescript
enum RoleType {
  // Administración
  SUPER_ADMIN = 'SUPER_ADMIN',      // Acceso total
  ADMIN = 'ADMIN',                   // Admin de organización
  
  // Vendedor/Consultor
  VENDEDOR = 'VENDEDOR',             // Crea cotizaciones
  CONSULTOR = 'CONSULTOR',           // Revisa propuestas
  
  // Cliente
  CLIENTE = 'CLIENTE',               // Ve cotizaciones asignadas
  CLIENTE_VIEWER = 'CLIENTE_VIEWER', // Solo lectura
  
  // Especiales
  AUDITOR = 'AUDITOR',               // Solo lectura de logs
  FACTURADOR = 'FACTURADOR'          // Acceso a facturación
}
```

### 3.3 Sistema de Permisos Integrado

```typescript
interface PermissionMatrix {
  // Recursos del sistema
  resources: {
    'org.create' | 'org.read' | 'org.update' | 'org.delete',
    'user.create' | 'user.read' | 'user.update' | 'user.delete',
    'quotation.create' | 'quotation.read' | 'quotation.update' | 'quotation.delete',
    'invoice.create' | 'invoice.read' | 'invoice.update' | 'invoice.delete',
    'report.view' | 'report.export',
    'audit.view' | 'audit.export',
    'backup.create' | 'backup.restore'
  }
  
  // Niveles de acceso por recurso
  accessLevel: 'NONE' | 'READ' | 'WRITE' | 'FULL'
}
```

---

## 4. PLAN DE IMPLEMENTACIÓN (8 FASES)

### FASE 1: Preparación y Análisis (2 días)
**Objetivo**: Preparar el entorno y validar dependencias

**Tareas:**
- [x] Auditar código actual (COMPLETADO)
- [x] Identificar conflictos potenciales (COMPLETADO)
- [ ] Crear ramas de feature en Git
- [ ] Documentar APIs afectadas

**Deliverables:**
- Documento de cambios (este archivo)
- Lista de archivos a modificar
- Plan de rollback

**Verificación:**
```bash
# Sin errores de compilación
npm run build

# Tests pasando
npm run test
```

---

### FASE 2: Estructuras de Datos (3 días)
**Objetivo**: Preparar modelos Prisma y tipos TypeScript

**Tareas:**
- [ ] Crear migration para tablas nuevas/modificadas:
  - Organization (si no existe)
  - Campos de auditoría en tablas existentes
  - Relaciones para jerarquía

- [ ] Actualizar `schema.prisma`:
  ```prisma
  model Organization {
    id            String    @id @default(cuid())
    nombre        String
    sector        String
    nivel         String    @default("EMPRESA")
    parentId      String?
    parent        Organization? @relation("Hierarchy", fields: [parentId], references: [id])
    children      Organization[] @relation("Hierarchy")
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    createdBy     String
    updatedBy     String
  }
  ```

- [ ] Actualizar tipos en `src/lib/types.ts`
- [ ] Generar tipos con Prisma Client

**Verificación:**
```bash
# Sin errores de schema
npx prisma validate

# Migration limpia
npx prisma migrate status
```

---

### FASE 3: APIs Base (4 días)
**Objetivo**: Implementar endpoints REST para organización

**Archivos a crear:**
```
src/app/api/
├── organizations/
│   ├── route.ts          (GET, POST)
│   ├── [id]/
│   │   └── route.ts      (GET, PUT, DELETE)
│   ├── [id]/children/
│   │   └── route.ts      (GET - listar hijos)
│   └── [id]/hierarchy/
│       └── route.ts      (GET - árbol completo)
```

**Ejemplo de endpoint:**
```typescript
// POST /api/organizations
export async function POST(request: NextRequest) {
  const { error, session } = await requireWritePermission('org.create')
  if (error) return error

  const body = await request.json()
  const { nombre, sector, parentId } = body

  // Validar parentId si existe
  if (parentId) {
    const parent = await prisma.organization.findUnique({ where: { id: parentId } })
    if (!parent) return NextResponse.json({ error: 'Padre no existe' }, { status: 404 })
  }

  const org = await prisma.organization.create({
    data: {
      nombre,
      sector,
      parentId,
      createdBy: session.user.id,
      updatedBy: session.user.id
    }
  })

  // Auditar creación
  await createAuditLog({
    action: 'org.created',
    entityType: 'Organization',
    entityId: org.id,
    userId: session.user.id,
    userName: session.user.username,
    details: { nombre, sector, parentId }
  })

  return NextResponse.json(org, { status: 201 })
}
```

**Verificación:**
```bash
# Testing con curl o Postman
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Nueva Empresa","sector":"Tecnología"}'
```

---

### FASE 4: Componentes PreferenciasTab (4 días)
**Objetivo**: Implementar UI para gestión organizacional

**Archivos a crear:**
```
src/features/admin/components/tabs/PreferenciasTab/
├── index.tsx
├── OrganizacionContent.tsx      (NUEVO)
├── EstructuraOrganizacional.tsx (NUEVO)
├── PermisosRolesContent.tsx     (Actualizar)
├── LogsAuditoriaContent.tsx     (Existente)
├── BackupRestoreContent.tsx     (Existente)
└── ConfiguracionAvanzada.tsx    (NUEVO)
```

#### OrganizacionContent.tsx

```typescript
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'
import { useToast } from '@/hooks/useToast'

interface OrganizationNode {
  id: string
  nombre: string
  sector: string
  nivel: string
  parentId?: string
  children?: OrganizationNode[]
  createdAt: string
  createdBy: string
}

export default function OrganizacionContent() {
  const toast = useToast()
  const [organizations, setOrganizations] = useState<OrganizationNode[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialogo, setShowDialogo] = useState(false)
  const [editingOrg, setEditingOrg] = useState<OrganizationNode | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Cargar organizaciones
  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/organizations?includeHierarchy=true')
      if (!res.ok) throw new Error('Error cargando organizaciones')
      
      const data = await res.json()
      setOrganizations(data)
    } catch (error) {
      toast.error('Error al cargar organizaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregar = () => {
    setEditingOrg(null)
    setShowDialogo(true)
  }

  const handleEditar = (org: OrganizationNode) => {
    setEditingOrg(org)
    setShowDialogo(true)
  }

  const handleGuardar = async (formData: Record<string, any>) => {
    try {
      const method = editingOrg ? 'PUT' : 'POST'
      const url = editingOrg 
        ? `/api/organizations/${editingOrg.id}`
        : '/api/organizations'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Error guardando organización')

      toast.success(editingOrg ? 'Organización actualizada' : 'Organización creada')
      setShowDialogo(false)
      fetchOrganizations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleEliminar = async (org: OrganizationNode) => {
    if (!confirm(`¿Eliminar "${org.nombre}"?`)) return

    try {
      const response = await fetch(`/api/organizations/${org.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error eliminando organización')
      
      toast.success('Organización eliminada')
      fetchOrganizations()
    } catch (error) {
      toast.error('Error al eliminar organización')
    }
  }

  // Renderizar árbol recursivamente
  const renderOrganizationTree = (orgs: OrganizationNode[], level = 0) => {
    return orgs.map(org => (
      <motion.div key={org.id}>
        <div
          className={`flex items-center gap-3 p-3 border-l-4 border-gh-accent/30 hover:bg-gh-bg-secondary transition-colors ${
            level > 0 ? `ml-${level * 4}` : ''
          }`}
        >
          {/* Icono expandible */}
          {org.children && org.children.length > 0 && (
            <button
              onClick={() => {
                const newExpanded = new Set(expandedIds)
                if (newExpanded.has(org.id)) {
                  newExpanded.delete(org.id)
                } else {
                  newExpanded.add(org.id)
                }
                setExpandedIds(newExpanded)
              }}
              className="p-1 hover:bg-gh-bg-tertiary rounded"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedIds.has(org.id) ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}

          {/* Contenido */}
          <div className="flex-1">
            <div className="font-semibold text-gh-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gh-accent" />
              {org.nombre}
            </div>
            <div className="text-xs text-gh-text-muted">
              {org.sector} • {org.nivel} • {new Date(org.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-1">
            <button
              onClick={() => handleEditar(org)}
              className="p-1.5 text-gh-text-muted hover:text-gh-accent hover:bg-gh-bg-tertiary rounded transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEliminar(org)}
              className="p-1.5 text-gh-text-muted hover:text-gh-danger hover:bg-gh-bg-tertiary rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hijos */}
        <AnimatePresence>
          {expandedIds.has(org.id) && org.children && org.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {renderOrganizationTree(org.children, level + 1)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gh-accent" />
          Estructura Organizacional
        </h3>
        <button
          onClick={handleAgregar}
          className="flex items-center gap-2 px-3 py-1.5 bg-gh-accent text-white text-xs font-semibold rounded-md hover:bg-gh-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Organización
        </button>
      </div>

      {/* Árbol */}
      {loading ? (
        <div className="text-center text-gh-text-muted py-8">Cargando...</div>
      ) : organizations.length === 0 ? (
        <div className="text-center text-gh-text-muted py-8">No hay organizaciones</div>
      ) : (
        <div className="border border-gh-border/30 rounded-lg overflow-hidden bg-gh-bg-secondary">
          {renderOrganizationTree(organizations)}
        </div>
      )}

      {/* Diálogo */}
      <AnimatePresence>
        {showDialogo && (
          <DialogoGenericoDinamico
            isOpen={showDialogo}
            onClose={() => setShowDialogo(false)}
            title={editingOrg ? 'Editar Organización' : 'Nueva Organización'}
            fields={[
              {
                name: 'nombre',
                type: 'text',
                label: 'Nombre de la Organización',
                placeholder: 'Ej: Mi Empresa S.A.',
                required: true,
                validation: (value) => {
                  if (!value?.trim()) return 'Nombre requerido'
                  return null
                }
              },
              {
                name: 'sector',
                type: 'text',
                label: 'Sector',
                placeholder: 'Ej: Tecnología, Restaurante',
                required: true
              },
              {
                name: 'nivel',
                type: 'select',
                label: 'Nivel',
                options: [
                  { value: 'EMPRESA', label: 'Empresa' },
                  { value: 'DEPARTAMENTO', label: 'Departamento' },
                  { value: 'EQUIPO', label: 'Equipo' },
                  { value: 'PROYECTO', label: 'Proyecto' }
                ]
              }
            ]}
            initialValues={editingOrg || {}}
            onSubmit={handleGuardar}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

### FASE 5: Integración de Permisos (3 días)
**Objetivo**: Conectar PreferenciasTab con sistema de permisos

**Tareas:**
- [ ] Actualizar `usePermission` hook para nuevos recursos
- [ ] Crear middleware de protección
- [ ] Implementar checks en componentes
- [ ] Validar en APIs

**Ejemplo de validación:**
```typescript
// En OrganizacionContent.tsx
const canCreate = logsPerms?.create?.includes('full')
const canEdit = logsPerms?.update?.includes('full')
const canDelete = logsPerms?.delete?.includes('full')
```

---

### FASE 6: Integración de Auditoría (2 días)
**Objetivo**: Registrar todas las operaciones en AuditLog

**Tareas:**
- [ ] Auditar creación/edición/eliminación de organizaciones
- [ ] Auditar cambios de permisos
- [ ] Auditar acceso a datos sensibles
- [ ] Crear reportes de auditoría

---

### FASE 7: Temas y Estilos (2 días)
**Objetivo**: Garantizar coherencia visual

**Tareas:**
- [ ] Aplicar paleta GitHub (colores existentes)
- [ ] Validar componentes con tema claro/oscuro
- [ ] Asegurar accesibilidad (contrast ratio, etc)
- [ ] Testear en múltiples navegadores

---

### FASE 8: Testing y Deployment (3 días)
**Objetivo**: Validar e implementar en producción

**Tareas:**
- [ ] Unit tests para APIs nuevas
- [ ] Integration tests para flujos
- [ ] Load testing
- [ ] Crear guide de rollback
- [ ] Deploy a staging
- [ ] Validación en producción

---

## 5. AUDITORÍA DEL ESTADO ACTUAL

### 5.1 Componentes Existentes ✅

| Componente | Archivo | Estado |
|-----------|---------|--------|
| **DialogoGenericoDinamico** | `src/features/admin/components/DialogoGenericoDinamico.tsx` | ✅ LISTO |
| **PreferenciasTab** | `src/features/admin/components/tabs/PreferenciasTab/` | 🟡 PARCIAL |
| **LogsAuditoriaContent** | `src/features/admin/components/.../LogsAuditoriaContent.tsx` | ✅ LISTO |
| **UserManagementPanel** | `src/features/admin/components/...` | ✅ LISTO |
| **Toast System** | `src/stores/useToastStore.ts` | ✅ LISTO |

### 5.2 APIs Existentes ✅

| Endpoint | Método | Protección | Auditoría |
|----------|--------|-----------|-----------|
| `/api/audit-logs` | GET/POST | ✅ | ✅ |
| `/api/quotations` | GET/POST/PUT | ✅ | ✅ |
| `/api/snapshots` | GET/POST | ✅ | ✅ |
| `/api/backups` | GET/POST | ✅ | ✅ |
| `/api/users` | GET/POST/PUT/DELETE | ✅ | ✅ |

### 5.3 Modelos Prisma ✅

```prisma
model User              // ✅ Existe
model Role              // ✅ Existe
model Permission        // ✅ Existe
model AuditLog          // ✅ Existe
model QuotationConfig   // ✅ Existe
model PackageSnapshot   // ✅ Existe
model Organization      // ❓ NECESITA VALIDACIÓN
```

### 5.4 Flujos Críticos

#### Flujo de Cotizaciones ✅
```
1. Cliente crea cotización → POST /api/quotation-config
2. Sistema captura snapshot → POST /api/snapshots
3. Se registra en auditoría → POST /api/audit-logs
4. Se crea/actualiza versión → PUT /api/quotation-config/[id]
5. Se permite restaurar versión anterior → POST /api/quotation-config/restore
```

#### Flujo de Estructura Org ❓ PENDIENTE
```
1. Admin crea organización → POST /api/organizations
2. Admin agrega usuarios → PUT /api/organizations/[id]/users
3. Admin configura permisos → PUT /api/organizations/[id]/permissions
4. Se registra todo en auditoría → POST /api/audit-logs
```

#### Flujo de Backups ✅
```
1. Admin crea backup → POST /api/backups/create
2. Sistema guarda datos → Prisma
3. Se registra en auditoría → POST /api/audit-logs
4. Se permite restaurar → POST /api/backups/restore
```

---

## 6. MATRIZ DE INTEGRACIÓN

### 6.1 Componentes y sus Dependencias

```
PreferenciasTab (NUEVO)
  ├── OrganizacionContent (NUEVO)
  │   ├── DialogoGenericoDinamico ✅
  │   ├── useToast ✅
  │   ├── /api/organizations (NUEVO)
  │   └── /api/audit-logs ✅
  │
  ├── PermisosRolesContent (ACTUALIZAR)
  │   ├── DialogoGenericoDinamico ✅
  │   ├── usePermission ✅
  │   └── /api/roles (NUEVO)
  │
  ├── LogsAuditoriaContent ✅
  │   └── /api/audit-logs ✅
  │
  └── BackupRestoreContent ✅
      └── /api/backups ✅
```

### 6.2 Tablas Afectadas

```
User
  + organizationId (FK Organization) ← NUEVA
  + rol mejorado con permisos ← ACTUALIZAR

Organization
  ← CREAR NUEVA TABLA

Role
  + permissions[] ← ACTUALIZAR relación

Permission
  + grantedAt ← Auditar cambios

AuditLog
  + Nuevos tipos de acción ← EXTENDER
```

### 6.3 APIs Nuevas

```
POST   /api/organizations              ← CREATE
GET    /api/organizations              ← LIST
GET    /api/organizations/[id]         ← READ
PUT    /api/organizations/[id]         ← UPDATE
DELETE /api/organizations/[id]         ← DELETE
GET    /api/organizations/[id]/children ← HIERARCHY
GET    /api/organizations/[id]/users   ← MEMBERS

POST   /api/roles                       ← CREATE
GET    /api/roles                       ← LIST
PUT    /api/roles/[id]                 ← UPDATE

POST   /api/roles/[id]/permissions     ← ASSIGN
DELETE /api/roles/[id]/permissions/[p] ← REVOKE
```

---

## 7. CONFLICTOS Y SOLUCIONES

### 7.1 Conflicto: Organización Duplicada

**Problema:**
- Ya existe `empresa` en `QuotationConfig`
- Ahora se requiere `Organization` como entidad

**Solución:**
```typescript
// Migración:
// 1. Crear tabla Organization
// 2. Migrar datos de empresa en QuotationConfig
// 3. Crear FK: QuotationConfig.organizationId → Organization.id
// 4. Mantener campo empresa para compatibilidad

model QuotationConfig {
  // Nuevo
  organizationId: String
  organization: Organization @relation(...)
  
  // Compatibilidad (deprecated)
  empresa: String
}
```

---

### 7.2 Conflicto: User.quotationAssignedId

**Problema:**
- Un usuario está asignado a UNA cotización
- Pero puede trabajar en MÚLTIPLES organizaciones

**Solución:**
```typescript
// Redefinir:
model User {
  // Existente
  quotationAssignedId: String?
  
  // Nuevo
  organizationId: String (FK Organization)
  organization: Organization
  
  // Rol a nivel organización
  roleId: String
}

// Permite:
// - 1 org principal (FK)
// - Múltiples orgs secundarias vía relación N:M futura
// - 1 cotización asignada para work-in-progress
```

---

### 7.3 Conflicto: Permisos Granulares

**Problema:**
- Permisos a nivel sistema (SUPER_ADMIN, ADMIN)
- Necesita permisos a nivel organización

**Solución:**
```typescript
// Jerarquía de permisos:
enum AccessLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  FULL = 3
}

interface OrgPermission {
  userId: String
  organizationId: String
  resourceCode: String    // "org.create", "quotation.read", etc
  accessLevel: AccessLevel
  grantedBy: String
  grantedAt: DateTime
}

// Validación en APIs:
// 1. User.role (sistema)
// 2. OrgPermission (organización)
// 3. Aplicar restricción MÁS BAJA
```

---

### 7.4 Conflicto: Auditoría de Sensibles

**Problema:**
- ¿Auditar TODO o solo cambios críticos?
- Performance con muchas operaciones

**Solución:**
```typescript
// Estrategia:
// 1. TODOS los cambios de roles/permisos ← CRÍTICO
// 2. TODOS los cambios de organizaciones ← CRÍTICO
// 3. Cambios de usuarios (sin passwords) ← IMPORTANTE
// 4. Acceso a datos sensibles (logs, reports) ← IMPORTANTE
// 5. Cambios de propuestas/cotizaciones ← ESTÁNDAR

// Implementar con niveles:
enum AuditLevel {
  CRITICAL = 'CRITICAL',      // Siempre
  IMPORTANT = 'IMPORTANT',    // Si está configurado
  STANDARD = 'STANDARD'       // Configurable
}
```

---

### 7.5 Conflicto: Coherencia UI

**Problema:**
- DialogoGenericoDinamico sigue estilo GitHub
- PreferenciasTab puede tener estilos inconsistentes

**Solución:**
```
Guía de Estilos Aplicada:
✅ Colores: Paleta GitHub (gh-accent, gh-danger, etc)
✅ Tipografía: Sistema existente
✅ Componentes: Reutilizar DialogoGenericoDinamico
✅ Animaciones: Framer Motion (spring, fluentBouncy)
✅ Espaciado: Tailwind scale
✅ Temas: Light/Dark automático
```

---

## 8. CHECKLIST FINAL

### Antes de Implementación

- [ ] **Code Review** de arquitectura
- [ ] **Backup** de BD producción
- [ ] **Testing environment** lista
- [ ] **Documentación** completada
- [ ] **Equipo** capacitado en cambios

### Durante Implementación

#### Fase 1: Estructuras
- [ ] Migración Prisma sin errores
- [ ] Tipos generados correctamente
- [ ] BD validada

#### Fase 2: APIs
- [ ] Endpoints crean/leen/actualizan/eliminan
- [ ] Protecciones de permisos funcionan
- [ ] Auditoría se registra

#### Fase 3: Componentes
- [ ] PreferenciasTab renderiza sin errores
- [ ] DialogoGenericoDinamico funciona con nuevos campos
- [ ] Validaciones funcionan
- [ ] Tema claro/oscuro OK

#### Fase 4: Integración
- [ ] Flujos end-to-end funcionan
- [ ] Permisos se respetan
- [ ] Auditoría completa

#### Fase 5: Testing
- [ ] Unit tests pasen
- [ ] Integration tests pasen
- [ ] Performance aceptable (<200ms APIs)
- [ ] Cero errores en consola

### Después de Deployment

- [ ] Monitorear logs en producción
- [ ] Verificar auditoría registra correctamente
- [ ] Permisos restrictivos sin acceso no autorizado
- [ ] Performance dentro de parámetros
- [ ] Usuarios reportan positivamente

---

## 📞 SOPORTE Y CONTACTO

**Responsables:**
- Frontend: GitHub Copilot
- Backend: GitHub Copilot
- Auditoría: Sistema integrado

**Dudas o Problemas:**
- Revisar documentación en `/docs/`
- Consultar arquitectura en este documento
- Revisar histórico de auditoría para debugging

---

**Documento preparado para IMPLEMENTACIÓN INMEDIATA**  
**Próxima acción: Iniciar FASE 1**
