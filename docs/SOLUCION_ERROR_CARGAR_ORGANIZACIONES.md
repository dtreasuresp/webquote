# 🔧 Solución: Error al cargar organizaciones

## ❌ Problema
```
Error al cargar organizaciones
src/features/admin/components/content/preferencias/organizacion/OrganizacionContent.tsx (68:31)
```

---

## 🔍 Diagnosticar el Problema

### Opción 1: Verificar permisos del usuario

1. **Abre la consola del navegador** (F12)
2. **Copia y ejecuta este código**:
```javascript
async function checkOrgPermissions() {
  const response = await fetch('/api/debug/org-permissions')
  const data = await response.json()
  console.table(data)
  return data
}
checkOrgPermissions()
```

### Opción 2: Revisar el Network tab
1. Abre DevTools → Network
2. Recarga la página de Preferencias > Organizaciones
3. Busca la request a `/api/organizations`
4. Revisa la respuesta (Response tab)

---

## ✅ Soluciones Comunes

### Problema 1: Usuario sin permiso `org.view`

**Error esperado**: `401 Unauthorized`

**Solución**:
```bash
# Asegúrate de que el usuario tiene permisos
npx ts-node prisma/seed-permissions.ts

# O manualmente en la BD:
INSERT INTO "Permission" (id, code, name, category, description, isActive, createdAt, updatedAt)
VALUES 
  (cuid(), 'org.view', 'Ver Organizaciones', 'organizations', 'Ver todas las organizaciones', true, now(), now()),
  (cuid(), 'org.create', 'Crear Organizaciones', 'organizations', 'Crear nuevas organizaciones', true, now(), now()),
  (cuid(), 'org.update', 'Actualizar Organizaciones', 'organizations', 'Actualizar organizaciones', true, now(), now()),
  (cuid(), 'org.delete', 'Eliminar Organizaciones', 'organizations', 'Eliminar organizaciones', true, now(), now());

# Asignar permisos al rol ADMIN
INSERT INTO "RolePermissions" (id, roleId, permissionId, createdAt, updatedAt)
SELECT 
  cuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r.name = 'ADMIN' AND p.code LIKE 'org.%';
```

### Problema 2: Usuario no autenticado

**Error esperado**: `401 Unauthorized` con mensaje "No autenticado"

**Solución**:
- Asegúrate de estar logueado
- Verifica que la sesión no haya expirado
- Recarga la página

### Problema 3: Error interno del servidor

**Error esperado**: `500` con "Error al obtener organizaciones"

**Solución**:
- Revisa los logs de servidor
- Verifica que la tabla `Organization` existe:
  ```bash
  npx prisma db execute --stdin << 'EOF'
  SELECT * FROM "Organization" LIMIT 1;
  EOF
  ```
- Si la tabla no existe, ejecuta:
  ```bash
  npx prisma migrate deploy
  ```

---

## 📋 Checklist de Verificación

- [ ] Usuario está autenticado
- [ ] Usuario tiene permiso `org.view`
- [ ] Tabla `Organization` existe en BD
- [ ] Migración `20251220_add_organization_structure` está aplicada
- [ ] No hay errores en la consola del navegador
- [ ] Network response status es 200 (no 4xx/5xx)

---

## 🐛 Debugging Mejorado

El componente ahora muestra errores detallados en:

1. **Console log**: Revisa la consola del navegador (F12)
   ```
   [LoadOrganizations] API Error: { status: 403, error: "..." }
   ```

2. **Toast (notificación)**: Aparece en la parte superior de la pantalla
   - Muestra el mensaje de error específico

3. **Network tab**: Revisa la request/response completa

---

## 🔗 Endpoints Útiles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/organizations` | GET | Listar organizaciones |
| `/api/organizations` | POST | Crear organización |
| `/api/organizations/[id]` | GET | Obtener detalle |
| `/api/organizations/[id]` | PUT | Actualizar |
| `/api/organizations/[id]` | DELETE | Eliminar |
| `/api/debug/org-permissions` | GET | Ver permisos actuales |

---

## 💡 Tips

1. **Vaciar cache**: Presiona Ctrl+Shift+Del en el navegador
2. **Reload completo**: Ctrl+Shift+R (no solo Ctrl+R)
3. **Check permisos**: Llama a `/api/debug/org-permissions` para ver permisos exactos
4. **Logs detallados**: Abre DevTools → Console antes de recargar

---

## ❓ Preguntas Frecuentes

**P: ¿Qué usuario debe usar?**
R: ADMIN o usuario con permisos `org.*`

**P: ¿Dónde creo usuarios de prueba?**
R: En PreferenciasTab → Usuarios, o ejecuta:
```bash
npx ts-node scripts/create-test-users.ts
```

**P: ¿Cómo asigno permisos?**
R: En PreferenciasTab → Permisos, busca el usuario y asigna `org.view`, `org.create`, etc.

**P: ¿Qué pasa si borro una organización con hijos?**
R: Se previene automáticamente. Primero debes eliminar los hijos.

---

Generated: 2025-12-20
Last Updated: When /api/organizations returns errors
