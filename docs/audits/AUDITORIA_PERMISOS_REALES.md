# 🔍 Auditoría de Permisos - Estado Real vs Declarado

**Fecha:** 14/12/2025  
**Problema detectado:** Los permisos existen en BD pero no se validan en el código

---

## 📊 Resumen Ejecutivo

De **32 permisos** definidos en el sistema, solo **2 permisos** (`security.roles.*`) están realmente implementados con checks de validación.

### Estado actual:
- ✅ **2 permisos funcionando** (6%)
- ⚠️ **30 permisos decorativos** (94%)

---

## 🔴 Permisos NO Implementados

### 1. Sistema (`config.*`)
| Permiso | Descripción | Dónde debería validarse | Estado |
|---------|-------------|-------------------------|--------|
| `config.view` | Ver configuración | PreferenciasTab | ❌ NO IMPLEMENTADO |
| `config.edit` | Editar configuración | PreferenciasTab (inputs) | ❌ NO IMPLEMENTADO |

**Problema:** ADMIN puede acceder a PreferenciasTab completo sin ningún check de permisos.

---

### 2. Usuarios (`users.*`)
| Permiso | Descripción | Dónde debería validarse | Estado |
|---------|-------------|-------------------------|--------|
| `users.view` | Ver usuarios | GET /api/users | ❌ NO IMPLEMENTADO |
| `users.create` | Crear usuarios | POST /api/users | ❌ NO IMPLEMENTADO |
| `users.edit` | Editar usuarios | PUT /api/users/[id] | ❌ NO IMPLEMENTADO |
| `users.delete` | Eliminar usuarios | DELETE /api/users/[id] | ❌ NO IMPLEMENTADO |
| `users.reset_password` | Resetear contraseñas | PUT /api/users/password | ❌ NO IMPLEMENTADO |

**Problema:** Cualquier usuario autenticado puede hacer CRUD de usuarios sin validación.

---

### 3. Cotizaciones (`quotations.*`)
| Permiso | Descripción | Dónde debería validarse | Estado |
|---------|-------------|-------------------------|--------|
| `quotations.view` | Ver cotizaciones | GET /api/quotation-config | ⚠️ PARCIAL (solo filtrado) |
| `quotations.create` | Crear cotizaciones | POST /api/quotation-config | ❌ NO IMPLEMENTADO |
| `quotations.edit` | Editar cotizaciones | PUT /api/quotation-config | ❌ NO IMPLEMENTADO |
| `quotations.delete` | Eliminar cotizaciones | DELETE /api/quotation-config | ❌ NO IMPLEMENTADO |
| `quotations.assign` | Asignar cotizaciones | POST /api/quotations/assign | ❌ NO IMPLEMENTADO |

**Problema:** Solo hay filtrado por usuario asignado, no validación de permisos.

---

### 4. Paquetes (`packages.*`)
| Permiso | Descripción | Dónde debería validarse | Estado |
|---------|-------------|-------------------------|--------|
| `packages.view` | Ver paquetes | GET /api/snapshots | ⚠️ PARCIAL (solo filtrado) |
| `packages.edit` | Editar paquetes | PUT /api/snapshots/[id] | ❌ NO IMPLEMENTADO |

**Problema:** Solo filtrado por cotización asignada, no permisos explícitos.

---

### 5. Servicios (`services.*`)
| Permiso | Descripción | Dónde debería validarse | Estado |
|---------|-------------|-------------------------|--------|
| `services.view` | Ver servicios | GET /api/servicios-base | ❌ NO IMPLEMENTADO |
| `services.edit` | Editar servicios | PUT /api/servicios-base/[id] | ❌ NO IMPLEMENTADO |

**Problema:** Endpoints públicos sin ninguna validación.

---

### 6. Seguridad (`security.*`)
| Permiso | Descripción | Dónde debería validarse | Estado |
|---------|-------------|-------------------------|--------|
| `security.roles.view` | Ver roles | RolesContent.tsx | ✅ IMPLEMENTADO |
| `security.roles.manage` | Gestionar roles | API /roles + RolesContent | ✅ IMPLEMENTADO |
| `security.permissions.view` | Ver permisos | PermisosContent.tsx | ❌ NO IMPLEMENTADO |
| `security.permissions.manage` | Gestionar permisos | API /permissions | ❌ NO IMPLEMENTADO |
| `security.matrix.view` | Ver matriz de acceso | MatrizAccesoContent.tsx | ❌ NO IMPLEMENTADO |
| `security.matrix.manage` | Gestionar matriz | API /role-permissions | ❌ NO IMPLEMENTADO |
| `security.user_permissions.view` | Ver permisos usuarios | PermisosUsuarioContent.tsx | ❌ NO IMPLEMENTADO |
| `security.user_permissions.manage` | Gestionar permisos | API /user-permissions | ❌ NO IMPLEMENTADO |
| `security.logs.view` | Ver logs auditoría | LogsAuditoriaContent.tsx | ❌ NO IMPLEMENTADO |
| `security.logs.export` | Exportar logs | LogsAuditoriaContent (export) | ❌ NO IMPLEMENTADO |

**Problema:** Solo `security.roles.*` tiene validación. El resto de componentes de seguridad son accesibles sin checks.

---

### 7. Backups (`backups.*`)
| Permiso | Descripción | Dónde debería validarse | Estado |
|---------|-------------|-------------------------|--------|
| `backups.view` | Ver backups | BackupsContent.tsx | ❌ NO IMPLEMENTADO |
| `backups.create` | Crear backups | POST /api/backups | ❌ NO IMPLEMENTADO |
| `backups.restore` | Restaurar backups | POST /api/backups/restore | ❌ NO IMPLEMENTADO |
| `backups.delete` | Eliminar backups | DELETE /api/backups/[id] | ❌ NO IMPLEMENTADO |
| `backups.manage_all` | Ver todos los backups | GET /api/backups | ❌ NO IMPLEMENTADO |
| `backups.configure` | Configurar sistema backup | BackupConfigContent.tsx | ❌ NO IMPLEMENTADO |

**Problema:** Sistema de backups sin ninguna validación de permisos.

---

## ✅ Permisos Implementados Correctamente

### `security.roles.manage` ✅
**Validación en:**
- ✅ `RolesContent.tsx` línea 51: `useRequirePermission('security.roles.manage')`
- ✅ `POST /api/roles` línea 46: `hasPermission(session, 'security.roles.manage')`
- ✅ `PUT /api/roles/[id]` línea 60: `hasPermission(session, 'security.roles.manage')`
- ✅ `DELETE /api/roles/[id]` línea 215: `hasPermission(session, 'security.roles.manage')`
- ✅ `PATCH /api/roles/[id]` línea 163: `hasPermission(session, 'security.roles.manage')`

**Resultado:** ADMIN sin este permiso NO puede gestionar roles ✅

### `security.roles.view` ✅
**Validación en:**
- ✅ `RolesContent.tsx` línea 52: `useRequirePermission('security.roles.view')`

**Resultado:** Permite vista de solo lectura ✅

---

## 🎯 Recomendaciones Urgentes

### Prioridad CRÍTICA
1. **PreferenciasTab completo:**
   - Agregar check `config.view` para acceso
   - Agregar check `config.edit` para deshabilitar inputs

2. **APIs de usuarios:**
   - Implementar validación en todos los endpoints de `/api/users`
   - Validar jerarquía de roles

3. **APIs de cotizaciones:**
   - Implementar validación en endpoints de `/api/quotation-config`
   - Validar permisos en operaciones CRUD

### Prioridad ALTA
4. **Componentes de seguridad:**
   - PermisosContent → validar `security.permissions.view/manage`
   - MatrizAccesoContent → validar `security.matrix.view/manage`
   - PermisosUsuarioContent → validar `security.user_permissions.view/manage`
   - LogsAuditoriaContent → validar `security.logs.view` + `.export`

5. **APIs de permisos:**
   - `/api/permissions` → validar `security.permissions.manage`
   - `/api/role-permissions` → validar `security.matrix.manage`
   - `/api/user-permissions` → validar `security.user_permissions.manage`

### Prioridad MEDIA
6. **Paquetes y servicios:**
   - Implementar validación `packages.edit` en operaciones de modificación
   - Implementar validación `services.edit` en operaciones de modificación

7. **Sistema de backups:**
   - Implementar todos los checks de `backups.*` cuando se desarrolle Fase 10

---

## 📝 Patrón de Implementación

### En componentes (Frontend):
```tsx
const canView = useRequirePermission('config.view')
const canEdit = useRequirePermission('config.edit')

if (!canView) {
  return <AccessDenied />
}

return (
  <div>
    <Input disabled={!canEdit} />
    {canEdit && <Button>Guardar</Button>}
  </div>
)
```

### En APIs (Backend):
```ts
const session = await getServerSession(authOptions)
const canEdit = await hasPermission(session, 'config.edit')

if (!canEdit) {
  return NextResponse.json(
    { error: 'No tienes permiso para editar configuración' },
    { status: 403 }
  )
}
```

---

## 🚨 Impacto de Seguridad

**CRÍTICO:** El sistema de permisos actual es mayormente cosmético. Un usuario con rol ADMIN o CLIENT puede:
- ✅ Acceder a toda la configuración del sistema
- ✅ Crear/editar/eliminar usuarios
- ✅ Modificar cotizaciones
- ✅ Ver y modificar permisos (excepto roles)
- ✅ Acceder a logs de auditoría

**Único control real:** Filtrado por usuario asignado en cotizaciones y snapshots.

---

**Última actualización:** 14/12/2025  
**Estado:** Sistema de permisos necesita refactorización completa
