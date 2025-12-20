# Prisma Middleware - Row-Level Security (RLS)

## Descripción

Sistema de middleware para Prisma que implementa **Row-Level Security (RLS)** automático, filtrando datos según el usuario actual sin necesidad de agregar filtros manuales en cada query.

## ¿Qué es RLS?

Row-Level Security es un mecanismo que restringe qué filas de una tabla puede ver/modificar un usuario. En lugar de escribir:

```typescript
// ❌ Filtrado manual en CADA query
const quotations = await prisma.quotationConfig.findMany({
  where: {
    OR: [
      { id: user.quotationAssignedId },
      { isGlobal: true }
    ]
  }
})
```

Con RLS escribes:

```typescript
// ✅ Filtrado automático
const quotations = await prismaRLS.quotationConfig.findMany()
// Automáticamente filtrado por permisos del usuario
```

## Uso Básico

### 1. Crear cliente Prisma con RLS

```typescript
import { createPrismaWithRLS } from '@/lib/prismaMiddleware'
import { requireAuth } from '@/lib/apiProtection'

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  // Crear cliente Prisma con RLS
  const prismaRLS = createPrismaWithRLS({
    userId: session.user.id,
    userRole: session.user.role,
    quotationAssignedId: session.user.quotationAssignedId
  })

  // Queries automáticamente filtrados
  const quotations = await prismaRLS.quotationConfig.findMany()
  const logs = await prismaRLS.auditLog.findMany()
  const backups = await prismaRLS.userBackup.findMany()

  return NextResponse.json({ quotations, logs, backups })
}
```

### 2. Usar en operaciones específicas

```typescript
// Obtener solo cotizaciones del usuario
const myQuotations = await prismaRLS.quotationConfig.findMany({
  where: { activo: true } // RLS agrega filtro de usuario automáticamente
})

// Obtener solo logs del usuario (si no es admin)
const myLogs = await prismaRLS.auditLog.findMany({
  where: { action: 'user.login' } // RLS agrega filtro de userId si es CLIENT
})

// Obtener solo backups del usuario
const myBackups = await prismaRLS.userBackup.findMany()
// SUPER_ADMIN ve todos, otros usuarios solo los suyos
```

## Reglas de Filtrado

### QuotationConfig

| Rol | Condición | Filtro Aplicado |
|-----|-----------|-----------------|
| SUPER_ADMIN | Sin `quotationAssignedId` | `isGlobal: true` (cotizaciones globales) |
| ADMIN | Sin `quotationAssignedId` | `isGlobal: true` |
| Cualquiera | Con `quotationAssignedId` | `id = quotationAssignedId OR isGlobal = true` |
| CLIENT | Sin asignación | `isGlobal: true` |

### AuditLog

| Rol | Filtro Aplicado |
|-----|-----------------|
| SUPER_ADMIN | Sin filtro (ve todos) |
| ADMIN | Sin filtro (ve todos) |
| CLIENT | `userId = context.userId` (solo sus logs) |

### UserBackup

| Rol | Filtro Aplicado |
|-----|-----------------|
| SUPER_ADMIN | Sin filtro (ve todos) |
| Otros | `userId = context.userId` (solo sus backups) |

### User

| Rol | Filtro Aplicado |
|-----|-----------------|
| SUPER_ADMIN | Sin filtro (ve todos) |
| ADMIN | Sin filtro (ve todos) |
| CLIENT | `id = context.userId` (solo su perfil) |

### UserPreferences

| Rol | Filtro Aplicado |
|-----|-----------------|
| SUPER_ADMIN | Puede acceder a preferencias de cualquiera |
| Otros | `userId = context.userId` (solo sus preferencias) |

## Ejemplos Avanzados

### Combinar con Permisos Granulares

```typescript
import { requireReadPermission } from '@/lib/apiProtection'
import { createPrismaWithRLS } from '@/lib/prismaMiddleware'

export async function GET(request: NextRequest) {
  // 1. Verificar permisos
  const { session, error, accessLevel } = await requireReadPermission('quotations.view')
  if (error) return error

  // 2. Crear Prisma con RLS
  const prismaRLS = createPrismaWithRLS({
    userId: session.user.id,
    userRole: session.user.role,
    quotationAssignedId: session.user.quotationAssignedId
  })

  // 3. Query con filtrado automático + permisos verificados
  const quotations = await prismaRLS.quotationConfig.findMany({
    include: {
      packages: accessLevel === 'full' // Solo full puede incluir paquetes
    }
  })

  return NextResponse.json({ quotations })
}
```

### Operaciones de Escritura

```typescript
export async function POST(request: NextRequest) {
  const { session, error } = await requireWritePermission('backups.create')
  if (error) return error

  const prismaRLS = createPrismaWithRLS({
    userId: session.user.id,
    userRole: session.user.role,
    quotationAssignedId: session.user.quotationAssignedId
  })

  // RLS asegura que solo puede crear backups para sí mismo
  const backup = await prismaRLS.userBackup.create({
    data: {
      userId: session.user.id, // RLS valida que coincida con context
      nombre: 'Mi Backup',
      data: {}
    }
  })

  return NextResponse.json({ backup })
}
```

### Migración de API Existente

**Antes (sin RLS):**

```typescript
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  // ❌ Filtrado manual repetido
  const where: any = {}
  
  if (session.user.role === 'CLIENT') {
    where.userId = session.user.id
  }

  if (session.user.quotationAssignedId) {
    where.OR = [
      { id: session.user.quotationAssignedId },
      { isGlobal: true }
    ]
  }

  const quotations = await prisma.quotationConfig.findMany({ where })
  const logs = await prisma.auditLog.findMany({
    where: session.user.role === 'CLIENT' ? { userId: session.user.id } : {}
  })
  
  return NextResponse.json({ quotations, logs })
}
```

**Después (con RLS):**

```typescript
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const prismaRLS = createPrismaWithRLS({
    userId: session.user.id,
    userRole: session.user.role,
    quotationAssignedId: session.user.quotationAssignedId
  })

  // ✅ Filtrado automático
  const quotations = await prismaRLS.quotationConfig.findMany()
  const logs = await prismaRLS.auditLog.findMany()
  
  return NextResponse.json({ quotations, logs })
}
```

## Ventajas

✅ **Menos código**: No repetir lógica de filtrado en cada API  
✅ **Más seguro**: Imposible olvidar agregar filtros  
✅ **Consistente**: Misma lógica de seguridad en toda la app  
✅ **Mantenible**: Cambiar reglas en un solo lugar  
✅ **Type-safe**: Mantiene tipado completo de Prisma  

## Desventajas y Consideraciones

⚠️ **Performance**: Agrega overhead mínimo en cada query  
⚠️ **Debug**: Puede ser menos obvio qué filtros se aplican  
⚠️ **Testing**: Requiere mockear contexto de usuario  
⚠️ **Complejidad**: Una capa adicional de abstracción  

## Testing

```typescript
import { createPrismaWithRLS } from '@/lib/prismaMiddleware'

describe('RLS Middleware', () => {
  it('CLIENT solo ve sus propios logs', async () => {
    const prismaRLS = createPrismaWithRLS({
      userId: 'user-123',
      userRole: 'CLIENT',
      quotationAssignedId: null
    })

    const logs = await prismaRLS.auditLog.findMany()
    
    // Todos los logs deben ser del usuario
    logs.forEach(log => {
      expect(log.userId).toBe('user-123')
    })
  })

  it('SUPER_ADMIN ve todos los logs', async () => {
    const prismaRLS = createPrismaWithRLS({
      userId: 'admin-456',
      userRole: 'SUPER_ADMIN',
      quotationAssignedId: null
    })

    const logs = await prismaRLS.auditLog.findMany()
    
    // Puede ver logs de diferentes usuarios
    const userIds = new Set(logs.map(l => l.userId))
    expect(userIds.size).toBeGreaterThan(1)
  })
})
```

## Migración Gradual

No es necesario migrar todas las APIs de una vez. Puedes:

1. **Fase 1**: Usar RLS en APIs nuevas
2. **Fase 2**: Migrar APIs críticas (quotations, backups)
3. **Fase 3**: Migrar APIs secundarias
4. **Fase 4**: Deprecar código de filtrado manual

```typescript
// Convivencia de ambos enfoques
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  // Opción A: Sin RLS (legacy)
  const quotations1 = await prisma.quotationConfig.findMany({
    where: { /* filtros manuales */ }
  })

  // Opción B: Con RLS (nuevo)
  const prismaRLS = createPrismaWithRLS({...})
  const quotations2 = await prismaRLS.quotationConfig.findMany()

  // Usar la opción que prefieras
}
```

## Performance Baseline

Según `scripts/performance-test.ts`:

| Operación | Sin RLS | Con RLS | Overhead |
|-----------|---------|---------|----------|
| Query simple | ~5ms | ~6ms | +1ms (+20%) |
| Query con joins | ~15ms | ~16ms | +1ms (+7%) |
| Bulk operations | ~50ms | ~52ms | +2ms (+4%) |

El overhead es **aceptable** para la mayoría de aplicaciones.

## Roadmap

- [ ] Agregar RLS para más modelos (PackageSnapshot, etc.)
- [ ] Implementar caché de contexto de usuario
- [ ] Agregar logging de queries filtrados (debug mode)
- [ ] Crear helper para deshabilitar RLS temporalmente
- [ ] Documentar patterns para casos edge

## Referencias

- [Prisma Middleware Docs](https://www.prisma.io/docs/concepts/components/prisma-client/middleware)
- [Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Access Control](https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control)
