# 🚀 GUÍA DE IMPLEMENTACIÓN RÁPIDA

**Tiempo estimado**: 2-3 semanas (sin cambios en BD)  
**Complejidad**: Media  
**Riesgo**: Bajo (cambios modulares, sin afectar código existente)

---

## 📋 QUICK START

### 1️⃣ Validación Previa (30 minutos)

```bash
# Confirmar no hay errores actuales
npm run build

# Confirmar BD es accesible
npx prisma db execute --stdin < scripts/check-snapshot.ts

# Confirmar componentes existentes funcionan
npm run test -- DialogoGenericoDinamico

# Ver estructura actual de tablas
npx prisma studio
```

### 2️⃣ Crear Rama de Feature

```bash
git checkout -b feature/estructura-organizacional
```

### 3️⃣ Crear Migration Prisma (Si se necesita)

```bash
# Crear migration para cambios en schema
npx prisma migrate dev --name add_organization_structure

# Confirmar archivos en prisma/migrations/
ls -la prisma/migrations/
```

---

## 🛠️ CÓDIGO PRONTO PARA USAR

### Paso A: Actualizar schema.prisma

**Ubicación:** `prisma/schema.prisma`

Agregar ANTES del modelo `User`:

```prisma
// ============================================
// MODELO: Organización (Jerarquía)
// ============================================
model Organization {
  id            String   @id @default(cuid())
  nombre        String
  sector        String
  descripcion   String?
  
  // Jerarquía
  parentId      String?
  parent        Organization? @relation("OrganizationHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children      Organization[] @relation("OrganizationHierarchy")
  
  // Contacto
  email         String?
  telefono      String?
  direccion     String?
  ciudad        String?
  pais          String?
  
  // Relaciones
  users         User[]
  quotations    QuotationConfig[]
  
  // Auditoría
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String
  updatedBy     String
  
  @@index([parentId])
  @@index([createdBy])
}
```

**Actualizar modelo User:**

```prisma
model User {
  // ... campos existentes ...
  
  // NUEVO: Organización
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  
  // Resto de campos existentes
  // ...
  
  @@index([organizationId])
}
```

**Actualizar modelo QuotationConfig:**

```prisma
model QuotationConfig {
  // ... campos existentes ...
  
  // NUEVO: Relación con Organization
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  
  // MANTENER para compatibilidad
  empresa         String
  
  // ... resto de campos ...
  
  @@index([organizationId])
}
```

### Paso B: Tipos TypeScript

**Ubicación:** `src/lib/types.ts`

```typescript
// ============================================
// TIPOS: Estructura Organizacional
// ============================================

export enum OrganizationLevel {
  RAIZ = 'RAIZ',
  EMPRESA = 'EMPRESA',
  DEPARTAMENTO = 'DEPARTAMENTO',
  EQUIPO = 'EQUIPO',
  PROYECTO = 'PROYECTO'
}

export interface Organization {
  id: string
  nombre: string
  sector: string
  descripcion?: string
  
  // Jerarquía
  parentId?: string | null
  level: OrganizationLevel
  
  // Contacto
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  pais?: string
  
  // Auditoría
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
  updatedBy: string
}

export interface OrganizationNode extends Organization {
  children?: OrganizationNode[]
}

export interface OrgPermissionGrant {
  userId: string
  organizationId: string
  resourceCode: string  // "org.read", "quotation.create", etc
  accessLevel: 'NONE' | 'READ' | 'WRITE' | 'FULL'
  grantedAt: Date
  grantedBy: string
}
```

### Paso C: APIs Base

**Ubicación:** `src/app/api/organizations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'
import { createAuditLog } from '@/lib/utils/auditHelper'

/**
 * GET /api/organizations
 * Lista organizaciones con jerarquía opcional
 */
export async function GET(request: NextRequest) {
  const { session, error } = await requireReadPermission('org.view')
  if (error) return error

  try {
    const searchParams = new URL(request.url).searchParams
    const includeHierarchy = searchParams.get('includeHierarchy') === 'true'

    if (includeHierarchy) {
      // Obtener solo raíces
      const roots = await prisma.organization.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              children: true
            }
          }
        },
        orderBy: { nombre: 'asc' }
      })
      return NextResponse.json(roots)
    }

    // Lista plana
    const orgs = await prisma.organization.findMany({
      orderBy: { nombre: 'asc' }
    })
    return NextResponse.json(orgs)
  } catch (error) {
    console.error('[API Organizations] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener organizaciones' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations
 * Crea nueva organización
 */
export async function POST(request: NextRequest) {
  const { session, error, accessLevel } = await requireWritePermission('org.create')
  if (error) return error

  try {
    const body = await request.json()
    const { nombre, sector, descripcion, parentId, email, telefono } = body

    // Validaciones
    if (!nombre?.trim()) {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      )
    }

    if (!sector?.trim()) {
      return NextResponse.json(
        { error: 'Sector requerido' },
        { status: 400 }
      )
    }

    // Validar parent si existe
    if (parentId) {
      const parent = await prisma.organization.findUnique({
        where: { id: parentId }
      })
      if (!parent) {
        return NextResponse.json(
          { error: 'Organización padre no existe' },
          { status: 404 }
        )
      }
    }

    // Crear organización
    const org = await prisma.organization.create({
      data: {
        nombre,
        sector,
        descripcion,
        parentId,
        email,
        telefono,
        createdBy: session?.user?.id || 'SYSTEM',
        updatedBy: session?.user?.id || 'SYSTEM'
      }
    })

    // Auditar creación
    await createAuditLog({
      action: 'org.created',
      entityType: 'Organization',
      entityId: org.id,
      actorId: session?.user?.id,
      actorName: session?.user?.username || 'Sistema',
      details: {
        nombre: org.nombre,
        sector: org.sector,
        parentId: org.parentId
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined
    })

    return NextResponse.json(org, { status: 201 })
  } catch (error) {
    console.error('[API Organizations POST] Error:', error)
    return NextResponse.json(
      { error: 'Error al crear organización' },
      { status: 500 }
    )
  }
}
```

**Ubicación:** `src/app/api/organizations/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireReadPermission, requireWritePermission, requireFullPermission } from '@/lib/apiProtection'
import { createAuditLog } from '@/lib/utils/auditHelper'

/**
 * GET /api/organizations/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireReadPermission('org.view')
  if (error) return error

  try {
    const org = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        children: true,
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            roleId: true
          }
        }
      }
    })

    if (!org) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(org)
  } catch (error) {
    console.error('[API Organizations GET] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener organización' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/organizations/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireWritePermission('org.update')
  if (error) return error

  try {
    const body = await request.json()
    const { nombre, sector, descripcion, email, telefono } = body

    // Verificar que existe
    const existing = await prisma.organization.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar
    const org = await prisma.organization.update({
      where: { id: params.id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(sector !== undefined && { sector }),
        ...(descripcion !== undefined && { descripcion }),
        ...(email !== undefined && { email }),
        ...(telefono !== undefined && { telefono }),
        updatedBy: session?.user?.id || 'SYSTEM'
      }
    })

    // Auditar cambios
    const cambios = Object.keys(body).filter(key => body[key] !== existing[key as keyof typeof existing])
    
    if (cambios.length > 0) {
      await createAuditLog({
        action: 'org.updated',
        entityType: 'Organization',
        entityId: org.id,
        actorId: session?.user?.id,
        actorName: session?.user?.username || 'Sistema',
        details: {
          cambios,
          valores: body
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      })
    }

    return NextResponse.json(org)
  } catch (error) {
    console.error('[API Organizations PUT] Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar organización' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organizations/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireFullPermission('org.delete')
  if (error) return error

  try {
    // Verificar existencia
    const existing = await prisma.organization.findUnique({
      where: { id: params.id },
      include: { children: true, users: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // No permitir eliminar si tiene hijos o usuarios
    if (existing.children.length > 0 || existing.users.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar. La organización tiene hijos o usuarios asignados.' },
        { status: 409 }
      )
    }

    // Eliminar
    await prisma.organization.delete({
      where: { id: params.id }
    })

    // Auditar eliminación
    await createAuditLog({
      action: 'org.deleted',
      entityType: 'Organization',
      entityId: params.id,
      actorId: session?.user?.id,
      actorName: session?.user?.username || 'Sistema',
      details: {
        nombre: existing.nombre,
        sector: existing.sector
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Organizations DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar organización' },
      { status: 500 }
    )
  }
}
```

---

## 📦 Componente PreferenciasTab - OrganizacionContent

**Ubicación:** `src/features/admin/components/tabs/PreferenciasTab/OrganizacionContent.tsx`

```typescript
// [Ver sección "FASE 4: Componentes PreferenciasTab" en DOCUMENTO_MAESTRO]
// El código completo está en el documento maestro (copia y pega desde ahí)
```

---

## ✅ Testing Local

### 1. Validar Schema
```bash
npx prisma validate
```

### 2. Probar API con curl
```bash
# GET
curl http://localhost:3000/api/organizations \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nombre": "Mi Empresa",
    "sector": "Tecnología"
  }'
```

### 3. Verificar BD
```bash
# Abrir Prisma Studio
npx prisma studio

# Navegar a Organization table
# Confirmar registros se crean/actualizan
```

### 4. Revisar Auditoría
```bash
# Query en Prisma Studio
# Filtrar por entityType = 'Organization'
```

---

## 🚨 Troubleshooting

### Error: "Modelo Organization no existe"
```
Solución: Ejecutar migration
npx prisma migrate dev --name add_organization
```

### Error: "Permission denied"
```
Solución: Verificar usePermission en componente
- Confirmar user tiene permiso 'org.view'
- Revisar roleId en BD
- Comprobar requireReadPermission en API
```

### Error: "Cannot find module"
```
Solución: Regenerar tipos Prisma
npx prisma generate
npm run build
```

---

## 📊 Próximos Pasos

1. ✅ Ejecutar migrations
2. ✅ Crear APIs base
3. ✅ Crear OrganizacionContent.tsx
4. ✅ Integrar en PreferenciasTab
5. ✅ Testing manual
6. 🟡 Unit/Integration tests
7. 🟡 Deploy a staging
8. 🟡 Deploy a producción

---

## 📞 Referencias

- **Documento maestro**: `docs/DOCUMENTO_MAESTRO_INTEGRACION_COMPLETA.md`
- **APIs existentes**: `/api/quotations/`, `/api/snapshots/`, `/api/audit-logs/`
- **Componentes**: `src/features/admin/components/`
- **Permisos**: `src/lib/apiProtection.ts`
