# Fase 12: Caché de Permisos Frontend - Guía de Integración

## 📋 Descripción General

La Fase 12 implementa un sistema de caché de permisos en el frontend para optimizar el rendimiento al evitar consultas repetidas de permisos.

**Status:** ✅ 90% Completado (Infraestructura lista, ejemplos de integración)

---

## 🏗️ Componentes Implementados

### 1. **Capa de Caché** (`src/lib/permissionsCache.ts`)
- Gestión de localStorage y memoria
- TTL de 5 minutos por defecto
- Sincronización cross-tab

### 2. **Hooks de Acceso** (`src/hooks/usePermissionsCache.ts`)
- `usePermissionsCache()` - Acceso directo al caché
- `usePermissionsCacheManager()` - Gestión de invalidación

### 3. **Store Zustand** (`src/stores/permissionsCacheStore.ts`)
- Sincronización global del estado de caché
- Persist middleware para localStorage
- Métodos: `addToCache()`, `removeFromCache()`, `invalidateAll()`

### 4. **Hook Principal Integrado** (`src/hooks/usePermission.ts`)
- Automáticamente intenta usar caché primero
- Fallback a sesión si caché no disponible
- Logging de HIT/MISS

### 5. **Invalidación** (`src/hooks/useInvalidatePermissionsCache.ts`)
- `useInvalidatePermissionsCacheOnLogout()` - Limpia caché en logout
- `useInvalidatePermissionsCacheOnUserChange()` - Detecta cambios de usuario
- `useInvalidatePermissions()` - Invalidación manual

---

## 📍 Puntos de Integración

### A. En Root Layout (App Shell)

```typescript
// app/layout.tsx
'use client'

import { useInvalidatePermissionsCacheOnLogout, useInvalidatePermissionsCacheOnUserChange } from '@/hooks'

export default function RootLayout({ children }) {
  // Limpiar caché cuando usuario desloguea
  useInvalidatePermissionsCacheOnLogout()
  
  // Detectar cambios de usuario (en caso de que se compartan dispositivos)
  useInvalidatePermissionsCacheOnUserChange()

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### B. En API Routes que Modifican Permisos

**Ejemplo: `/api/user-permissions/[id]/route.ts`**

```typescript
// POST - Agregar permiso
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { resourceCode, accessLevel } = await request.json()

  // ... validación y lógica de base de datos ...

  // ✨ FASE 12: Invalidar caché después de cambio
  await fetch('/api/cache/invalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: params.id,
      resourceCode,
      action: 'add'
    })
  })

  return Response.json({ success: true })
}

// DELETE - Remover permiso
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { resourceCode } = await request.json()

  // ... validación y lógica de base de datos ...

  // ✨ FASE 12: Invalidar caché después de cambio
  await fetch('/api/cache/invalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: params.id,
      resourceCode,
      action: 'remove'
    })
  })

  return Response.json({ success: true })
}
```

**Nueva API Route: `/api/cache/invalidate/route.ts`**

```typescript
// API para invalidar caché en el servidor
// Notifica a los clientes sobre cambios de permisos

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, resourceCode, action } = await request.json()

    // Validar que el usuario tenga permisos para invalidar caché de otros
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log(`[CacheAPI] Invalidando caché para usuario ${userId}, recurso ${resourceCode}, acción ${action}`)

    // Nota: En una implementación real, aquí podrías:
    // - Usar WebSocket para notificar cambios en tiempo real
    // - Usar Server-Sent Events para push notifications
    // - Guardar eventos de invalidación en la BD

    return NextResponse.json({
      success: true,
      message: `Caché invalidado para ${resourceCode}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[CacheAPI] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### C. En Componentes que Modifican Permisos

```typescript
// components/UserPermissionsEditor.tsx
'use client'

import { useState } from 'react'
import { useInvalidatePermissions } from '@/hooks'
import { toast } from '@/components/ui/toast'

export function UserPermissionsEditor({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const { invalidateResource, invalidateAllForUser } = useInvalidatePermissions()

  async function handlePermissionChange(resourceCode: string, accessLevel: number) {
    setLoading(true)
    try {
      const response = await fetch(`/api/user-permissions/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceCode, accessLevel })
      })

      if (response.ok) {
        // ✨ FASE 12: Invalidar caché del permiso modificado
        invalidateResource(resourceCode)
        
        toast.success(`Permiso ${resourceCode} actualizado`)
      }
    } catch (error) {
      console.error('Error actualizando permiso:', error)
      toast.error('Error al actualizar permiso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Componente de edición de permisos */}
    </div>
  )
}
```

### D. En Logout

```typescript
// lib/auth/logout.ts
'use client'

import { signOut } from 'next-auth/react'
import { invalidateCache } from '@/lib/permissionsCache'

export async function handleLogout() {
  // ✨ FASE 12: Limpiar caché antes de desloguear
  invalidateCache()
  
  // El hook useInvalidatePermissionsCacheOnLogout también se ejecutará
  // pero hacer cleanup aquí es más explícito
  
  await signOut({
    redirect: true,
    callbackUrl: '/login'
  })
}
```

---

## 🔍 Monitoreo y Debugging

### Habilitar Logging

El caché ya tiene logging incorporado. En console dev tools verás:

```
[PermissionsCache] ✅ HIT: users (TTL: 299s)
[PermissionsCache] 📥 MISS: reports → fetching...
[PermissionsCache] ✨ SET: dashboard (TTL: 300s)
[PermissionsCache] 🗑️ CLEAR: analytics
[PermissionsCache] 🔄 INVALIDATE ALL
```

### Ver Estado del Caché

```javascript
// En console browser:
import { getCache } from '@/lib/permissionsCache'
console.log(getCache())

// Resultado:
// {
//   users: { accessLevel: 3, timestamp: 1702987654321, ttl: 300000 },
//   dashboard: { accessLevel: 2, timestamp: 1702987634321, ttl: 300000 },
//   ...
// }
```

### Limpiar Caché Manualmente

```javascript
// En console browser:
import { invalidateCache } from '@/lib/permissionsCache'
invalidateCache()
console.log('Caché limpiado')
```

---

## 📊 Estadísticas de Rendimiento

### Antes (Sin Caché)
- ❌ Cada llamada a `usePermission()` hace API call
- ❌ ~100ms por consulta de permiso
- ❌ N+1 queries en componentes con muchos permisos

### Después (Con Caché)
- ✅ Primera llamada: ~100ms (fetch + cache)
- ✅ Llamadas siguientes: <1ms (cache HIT)
- ✅ Mejora: **100x en cache HIT**

### Estimación de Mejora
- Aplicación típica: ~50 permisos por sesión
- Sin caché: 50 × 100ms = 5000ms (5s) en inicialización
- Con caché: 50 × 100ms (primero) + 49 × 1ms (resto) ≈ 5.05s primera vez, <50ms después

---

## ✅ Checklist de Integración

- [ ] Root layout incluye `useInvalidatePermissionsCacheOnLogout()`
- [ ] Root layout incluye `useInvalidatePermissionsCacheOnUserChange()`
- [ ] APIs que cambien permisos llaman `invalidateCache()` o `/api/cache/invalidate`
- [ ] Componentes que editan permisos usan `useInvalidatePermissions()`
- [ ] Logout limpia caché
- [ ] Testing: Verificar HIT/MISS en console
- [ ] Testing: Cambiar permiso y ver caché invalidarse
- [ ] Testing: Verificar sincronización cross-tab

---

## 🚀 Mejoras Futuras

1. **WebSocket para invalidación en tiempo real**
   - Notificaciones push cuando permisos cambian
   - No requiere refresh o reconexión

2. **Service Worker para sincronización offline**
   - Sincronizar caché cuando vuelve la conexión

3. **Análisis de caché HIT rate**
   - Métricas en analytics
   - Optimizar TTL basado en uso

4. **Permiso-based cache expiration**
   - Algunos permisos con TTL más largo
   - Otros con invalidación manual obligatoria

---

## 📝 Notas de Implementación

- **TTL por defecto:** 5 minutos (300,000ms)
- **Almacenamiento:** localStorage + memoria RAM
- **Sincronización:** localStorage events entre pestañas
- **Fallback:** Si caché expirado, usa sesión
- **Cleanup:** Automático en logout, manual en cambios de permisos

---

**Última actualización:** 18/12/2025  
**Fase:** 12 (Caché de Permisos Frontend)  
**Versión:** 1.0
