# ✅ CHECKLIST INTERACTIVO - IMPLEMENTACIÓN

**Proyecto**: Estructura Organizacional WebQuote  
**Fecha de Inicio**: [COMPLETAR]  
**Responsable**: [COMPLETAR]  

---

## 📋 CHECKLIST MAESTRA

### Estado General
- [ ] **PLANIFICACIÓN**: Todas las fases documentadas
- [ ] **APROBACIÓN**: Tech Lead aprobó ADRs
- [ ] **RECURSOS**: Equipo asignado y disponible
- [ ] **AMBIENTE**: Staging listo para testing
- [ ] **BACKUP**: BD producción respaldada

---

## 🎯 FASE 1: PREPARACIÓN (2 Días)

### Día 1: Setup y Validación
- [ ] **1.1.1** Git: Crear rama `feature/estructura-organizacional`
- [ ] **1.1.2** Git: Confirmar rama está sincronizada con `main`
- [ ] **1.1.3** Código: Ejecutar `npm run build` sin errores
- [ ] **1.1.4** Tests: Todos los tests actuales pasan
- [ ] **1.1.5** BD: Conexión a Neon funciona (`npx prisma studio`)
- [ ] **1.1.6** Docs: Todos los documentos leídos y entendidos

### Día 2: Preparar Migration
- [ ] **1.2.1** Schema: Copiar actualización de `schema.prisma` del documento
- [ ] **1.2.2** Types: Actualizar `src/lib/types.ts` con nuevos tipos
- [ ] **1.2.3** Migration: Ejecutar `npx prisma migrate dev --name add_organization_structure`
- [ ] **1.2.4** Validación: `npx prisma validate` sin errores
- [ ] **1.2.5** Tipos: Ejecutar `npx prisma generate` y compilar sin errores
- [ ] **1.2.6** Verificar: Abrir `npx prisma studio` y confirmar tabla `Organization`

**Evidencia Requerida:**
```
✅ npx prisma validate output
✅ npx prisma generate output
✅ npm run build sin errores
✅ Screenshot de prisma studio mostrando Organization tabla
```

---

## 🔧 FASE 2: APIS BASE (4 Días)

### Día 1: GET /api/organizations
- [ ] **2.1.1** Crear archivo `src/app/api/organizations/route.ts`
- [ ] **2.1.2** Implementar `GET /api/organizations`
- [ ] **2.1.3** Incluir parámetro `?includeHierarchy=true`
- [ ] **2.1.4** Protección con `requireReadPermission('org.view')`
- [ ] **2.1.5** Testing: GET devuelve array vacío o datos
- [ ] **2.1.6** Testing: Permisos deniegan acceso si usuario no tiene permiso

### Día 2: POST/PUT/DELETE Individuales
- [ ] **2.2.1** Crear archivo `src/app/api/organizations/[id]/route.ts`
- [ ] **2.2.2** Implementar `GET /api/organizations/[id]`
- [ ] **2.2.3** Implementar `PUT /api/organizations/[id]`
- [ ] **2.2.4** Implementar `DELETE /api/organizations/[id]`
- [ ] **2.2.5** POST /api/organizations (crear en route.ts principal)
- [ ] **2.2.6** Validar parentId existe si se proporciona

### Día 3: Auditoría en APIs
- [ ] **2.3.1** Importar `createAuditLog` en organizaciones route
- [ ] **2.3.2** Auditar creación: `action: 'org.created'`
- [ ] **2.3.3** Auditar actualización: `action: 'org.updated'`
- [ ] **2.3.4** Auditar eliminación: `action: 'org.deleted'`
- [ ] **2.3.5** Verificar logs aparecen en `/api/audit-logs`
- [ ] **2.3.6** Verificar logs muestran IP y User-Agent

### Día 4: Testing Completo
- [ ] **2.4.1** Unit test: POST crea organización
- [ ] **2.4.2** Unit test: GET retorna organización
- [ ] **2.4.3** Unit test: PUT actualiza organización
- [ ] **2.4.4** Unit test: DELETE elimina organización
- [ ] **2.4.5** Unit test: Validaciones funcionan (parentId, nombre, sector)
- [ ] **2.4.6** Integration test: Permisos se respetan
- [ ] **2.4.7** Integration test: Auditoría se registra

**Evidencia Requerida:**
```
✅ Coverage report > 80%
✅ Logs de test pasen
✅ Postman collection con requests probados
✅ Screenshot de BD en prisma studio
```

---

## 🎨 FASE 3: COMPONENTES UI (4 Días)

### Día 1: OrganizacionContent Base
- [ ] **3.1.1** Crear `src/features/admin/components/tabs/PreferenciasTab/OrganizacionContent.tsx`
- [ ] **3.1.2** Importar `DialogoGenericoDinamico`
- [ ] **3.1.3** Importar `useToast`
- [ ] **3.1.4** Importar `motion` de Framer Motion
- [ ] **3.1.5** State: `organizations`, `loading`, `expanded`
- [ ] **3.1.6** Effect: Llamar a `fetchOrganizations` al montar

### Día 2: Funcionalidad CRUD
- [ ] **3.2.1** Implementar `fetchOrganizations()` (GET)
- [ ] **3.2.2** Implementar `handleAgregar()` (nuevo dialogo)
- [ ] **3.2.3** Implementar `handleGuardar()` (POST/PUT)
- [ ] **3.2.4** Implementar `handleEliminar()` (DELETE con confirmación)
- [ ] **3.2.5** Mostrar toast en cada acción

### Día 3: Árbol Recursivo
- [ ] **3.3.1** Implementar `renderOrganizationTree()` recursivo
- [ ] **3.3.2** Mostrar indicador expandible (ChevronDown)
- [ ] **3.3.3** Animar expansión/colapso
- [ ] **3.3.4** Indentación por nivel
- [ ] **3.3.5** Botones editar/eliminar por nodo

### Día 4: Tema y Polish
- [ ] **3.4.1** Aplicar colores: `bg-gh-bg-secondary`, `text-gh-text`
- [ ] **3.4.2** Icono Building2 para organizaciones
- [ ] **3.4.3** Validar tema light/dark funciona
- [ ] **3.4.4** Validar responsive (mobile OK)
- [ ] **3.4.5** Agregar transiciones suaves

**Evidencia Requerida:**
```
✅ npm run build sin errores
✅ Componente carga sin warnings
✅ Screenshot del árbol jerárquico
✅ Screenshot en tema light y dark
```

---

## 🔗 FASE 4: INTEGRACIÓN (3 Días)

### Día 1: Vincular a User
- [ ] **4.1.1** Confirmar `User.organizationId` existe en schema
- [ ] **4.1.2** Crear script: `scripts/migrate-users-to-organizations.ts`
- [ ] **4.1.3** Script crea `Organization` raíz si no existe
- [ ] **4.1.4** Script asigna usuarios existentes a raíz
- [ ] **4.1.5** Script valida integridad (no usuarios huérfanos)
- [ ] **4.1.6** Ejecutar script en local y validar

### Día 2: Vincular a QuotationConfig
- [ ] **4.2.1** Confirmar `QuotationConfig.organizationId` existe
- [ ] **4.2.2** Crear script para migrar cotizaciones a org
- [ ] **4.2.3** Actualizar `/api/quotations` para incluir `organization`
- [ ] **4.2.4** Actualizar `/api/snapshots` para filtrar por org
- [ ] **4.2.5** Validar cotizaciones siguen siendo accesibles

### Día 3: Permisos a Nivel Org
- [ ] **4.3.1** Actualizar `usePermission` hook para validar org
- [ ] **4.3.2** Proteger `/api/organizations/[id]` para solo org members
- [ ] **4.3.3** Filtrar cotizaciones por org en componentes
- [ ] **4.3.4** Test: Usuario de org-a no ve datos de org-b
- [ ] **4.3.5** Test: ADMIN_ORG puede gestionar su org

**Evidencia Requerida:**
```
✅ Script migration completado sin errores
✅ Todos los usuarios tienen organizationId
✅ Todas las cotizaciones tienen organizationId
✅ Permisos se respetan correctamente
```

---

## 🧪 FASE 5: TESTING COMPLETO (3 Días)

### Día 1: Unit Tests
- [ ] **5.1.1** Test: Organization schema valida
- [ ] **5.1.2** Test: Types Organization compilan
- [ ] **5.1.3** Test: Migration reversible
- [ ] **5.1.4** Test: Validadores (nombre, sector requeridos)
- [ ] **5.1.5** Test: Jerarquía self-join válida
- [ ] **5.1.6** Coverage > 80% en archivos nuevos

### Día 2: Integration Tests
- [ ] **5.2.1** Test: POST /api/organizations crea
- [ ] **5.2.2** Test: GET /api/organizations lista
- [ ] **5.2.3** Test: PUT /api/organizations/[id] actualiza
- [ ] **5.2.4** Test: DELETE /api/organizations/[id] elimina
- [ ] **5.2.5** Test: Auditoría se registra para cada operación
- [ ] **5.2.6** Test: Permisos se respetan en APIs

### Día 3: E2E Tests
- [ ] **5.3.1** E2E: Crear organización raíz
- [ ] **5.3.2** E2E: Crear sub-organización (con parentId)
- [ ] **5.3.3** E2E: Editar organización
- [ ] **5.3.4** E2E: Eliminar organización (sin hijos)
- [ ] **5.3.5** E2E: No permitir eliminar con hijos
- [ ] **5.3.6** E2E: Árbol jerárquico se muestra en UI

**Evidencia Requerida:**
```
✅ Unit test coverage > 80%
✅ Integration test coverage > 70%
✅ E2E tests pasen (screenshots)
✅ npm run test:all sin fallos
```

---

## 🚀 FASE 6: PRE-DEPLOY (2 Días)

### Día 1: Validación Final
- [ ] **6.1.1** Code review completado (Tech Lead aprobó)
- [ ] **6.1.2** Security review completado (permisos OK)
- [ ] **6.1.3** Performance review completado (queries < 200ms)
- [ ] **6.1.4** npm run build sin errores
- [ ] **6.1.5** npm run test:all sin fallos
- [ ] **6.1.6** Linter/prettier sin warnings

### Día 2: Staging Deploy
- [ ] **6.2.1** Crear backup de BD staging
- [ ] **6.2.2** Ejecutar migration en staging
- [ ] **6.2.3** Validar todas las APIs funcionan
- [ ] **6.2.4** Validar componentes se cargan
- [ ] **6.2.5** Validar auditoría registra correctamente
- [ ] **6.2.6** Stakeholders prueban en staging

**Evidencia Requerida:**
```
✅ Code review aprobado (comment en PR)
✅ Security review aprobado
✅ Performance metrics < 200ms
✅ UAT en staging completado
```

---

## 📦 FASE 7: DEPLOY A PRODUCCIÓN (1 Día)

### Pre-Deploy (Mañana)
- [ ] **7.1.1** Crear backup BD producción
- [ ] **7.1.2** Preparar rollback script
- [ ] **7.1.3** Confirmar equipo disponible
- [ ] **7.1.4** Confirmar off-peak deployment window
- [ ] **7.1.5** Avisar a stakeholders

### Deploy (Durante ventana)
- [ ] **7.2.1** Mergear rama a main
- [ ] **7.2.2** Ejecutar migration en producción
- [ ] **7.2.3** Deploy código a producción
- [ ] **7.2.4** Validar healthcheck de APIs
- [ ] **7.2.5** Validar auditoría registra

### Post-Deploy (Después)
- [ ] **7.3.1** Monitoreo de logs sin errores
- [ ] **7.3.2** Performance OK (respuesta times)
- [ ] **7.3.3** Sin usuarios reportando problemas
- [ ] **7.3.4** Auditoría capturando eventos
- [ ] **7.3.5** Publicar release notes

**Evidencia Requerida:**
```
✅ PR mergeado a main
✅ Logs sin errores en producción
✅ Uptime 99.9% en primera hora
✅ User feedback positivo
```

---

## 📊 MÉTRICAS DE ÉXITO

### Técnicas
- [ ] **Compilación**: 0 errores de build
- [ ] **Tests**: 100% de tests pasan
- [ ] **Coverage**: > 80% cobertura en nuevos archivos
- [ ] **Performance**: APIs < 200ms
- [ ] **Seguridad**: Cero acceso no autorizado en tests

### Funcionales
- [ ] **CRUD Orgs**: Crear/editar/eliminar funciona
- [ ] **Jerarquía**: Árbol multi-nivel visible
- [ ] **Auditoría**: Todos los cambios registrados
- [ ] **Permisos**: Restrictivos y funcionales
- [ ] **UI**: Tema light/dark OK

### Negocio
- [ ] **Uptime**: 99.9% post-deploy
- [ ] **User Adoption**: > 50% usando nuevas features (semana 1)
- [ ] **Bugs**: < 5 bugs reportados (semana 1)
- [ ] **Performance**: Sin degradación visible

---

## 🔍 VALIDACIÓN FINAL

### Código
- [ ] Commits bien documentados
- [ ] Código sigue style guide
- [ ] Comentarios actualizados
- [ ] Docs sincronizadas

### BD
- [ ] Migration reversible
- [ ] Backups creados
- [ ] Integridad referencial OK
- [ ] Índices optimizados

### Operaciones
- [ ] Runbooks actualizados
- [ ] Alertas configuradas
- [ ] Rollback plan documentado
- [ ] On-call engineer capacitado

---

## 📝 NOTAS Y OBSERVACIONES

### Problemas Encontrados
```
[FECHA] [FASE] [PROBLEMA] [SOLUCIÓN]
_____________________________________________
_____________________________________________
_____________________________________________
```

### Cambios/Deviaciones
```
[FECHA] [CAMBIO] [RAZÓN] [APROBADO POR]
_____________________________________________
_____________________________________________
_____________________________________________
```

### Lecciones Aprendidas
```
[FECHA] [LECCIÓN]
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 👥 SIGN-OFF

### Completado Por
- **Nombre**: _____________
- **Fecha**: _____________
- **Firma**: _____________

### Aprobado Por
- **Tech Lead**: _____________ ✅/❌
- **Product Manager**: _____________ ✅/❌
- **Security**: _____________ ✅/❌

---

## 📞 CONTACTO DE SOPORTE

**Durante Implementación:**
- Tech Lead: [COMPLETAR]
- Backend Owner: [COMPLETAR]
- Frontend Owner: [COMPLETAR]
- DevOps: [COMPLETAR]

**Post-Deploy (Primera Semana):**
- On-Call: [COMPLETAR]
- Escalation: [COMPLETAR]

---

**Última Actualización**: [COMPLETAR]  
**Próxima Revisión**: [COMPLETAR]

---

## 🎯 Estado General

```
┌─────────────────────────────────────┐
│   ESTADO GENERAL IMPLEMENTACIÓN    │
├─────────────────────────────────────┤
│ FASE 1: ▓▓▓▓▓ [  ]                 │
│ FASE 2: ▓▓▓▓▓▓▓▓ [  ]              │
│ FASE 3: ▓▓▓▓▓▓▓▓ [  ]              │
│ FASE 4: ▓▓▓▓▓▓ [  ]                │
│ FASE 5: ▓▓▓▓ [  ]                  │
│ FASE 6: ▓▓ [  ]                    │
│ FASE 7: [  ]                       │
├─────────────────────────────────────┤
│ PROGRESO TOTAL: ██░░░ 40%          │
└─────────────────────────────────────┘
```

**Completar este checklist conforme avanza la implementación.**  
**Actualizar % de progreso diariamente.**
