# 📋 PROPUESTA INTEGRAL: Estados de Cotización, Notificaciones y Respuestas de Clientes

**Fecha:** 21 de diciembre de 2025  
**Versión:** 1.0  
**Estado:** Para Revisión

---

## 📑 Tabla de Contenidos

### FASE 1-2: ESTADOS DE COTIZACIÓN + NOTIFICACIONES
1. [Auditoría Actual](#auditoría-actual)
2. [Hallazgos Auditoría ETAPA 1](#hallazgos-auditoría-etapa-1)
3. [Nuevos Estados de Cotización](#nuevos-estados-de-cotización)
4. [Cambios en BD (Schema Prisma)](#cambios-en-bd-schema-prisma)
5. [Implementación Frontend - Admin](#implementación-frontend-admin)
6. [Implementación Frontend - Página Pública](#implementación-frontend-página-pública)
7. [Sistema de Notificaciones](#sistema-de-notificaciones)
8. [Endpoints API Necesarios](#endpoints-api-necesarios)
9. [Flujos de Interacción](#flujos-de-interacción)
10. [Auditoría y Logs](#auditoría-y-logs)

### FASE 3: SOLICITUD DE EXTENSIÓN + OPTIMIZACIONES
11. [Fase 3 - Resumen Ejecutivo](#fase-3---resumen-ejecutivo)
12. [Componentes a Crear - Fase 3](#componentes-a-crear---fase-3)
13. [Integración en page.tsx](#integración-en-pagetsx)
14. [BadgeContadorDias - Rediseño Fluent Design 2](#badgecontadordias---rediseño-fluent-design-2)
15. [Página Solicitar Extensión](#página-solicitar-extensión)
16. [Nuevos Endpoints API - Fase 3](#nuevos-endpoints-api---fase-3)
17. [Optimización Performance](#optimización-performance)
18. [Checklist Implementación Fase 3](#checklist-implementación-fase-3)

### FASE 4: AUDITORÍA Y MEJORAS - MÚLTIPLES COTIZACIONES ACTIVAS
19. [Auditoría Detallada - 22 Dic 2025](#auditoría-detallada---22-dic-2025)
20. [Problema Visual: Botones QuotationInteractionWidget](#problema-visual-botones-quotationinteractionwidget)
21. [Gestión de Múltiples Cotizaciones Activas](#gestión-de-múltiples-cotizaciones-activas)
22. [Validación: Una Cotización por Cliente](#validación-una-cotización-por-cliente)
23. [Actualización HistorialTAB](#actualización-historialtab)
24. [Cambios en Validación y Flujos](#cambios-en-validación-y-flujos)
25. [Checklist Implementación Fase 4](#checklist-implementación-fase-4)

### DOCUMENTACIÓN GENERAL
26. [Exportación PDF Profesional](#exportación-pdf-profesional)
27. [Plan de Implementación General](#plan-de-implementación-general)

---

## 🔍 Auditoría Actual

### Estado del Código

**Sistema de Auditoría Existente:**
- ✅ `src/lib/audit/auditHelper.ts`: Sistema robusto con tipos de acciones
- ✅ `AuditLog` en Prisma: Schema completo con campos de auditoría
- ✅ Acciones soportadas: LOGIN, LOGOUT, USER_*, QUOTATION_*, SNAPSHOT_*, BACKUP_*, SYNC_*, CONFIG_*
- ✅ Sanitización de datos sensibles (contraseñas, tokens, APIs)
- ✅ Generador de diffs para cambios

**Página Pública (`src/app/page.tsx`):**
- ✅ Auténtica clientes por sesión
- ✅ Carga cotización asignada al usuario
- ✅ Redirige a `/sin-cotizacion` si no hay cotización
- ✅ Utiliza `useQuotationListener` para suscripción a cambios
- ✅ Sistema de tracking de eventos

**Estados Actuales:**
```typescript
type QuotationState = 'CARGADA' | 'ACTIVA' | 'INACTIVA'
```

**Problemas Identificados en Auditoría Fase 3:**

### ETAPA 1: Flujo de Publicación de Cotización (BLOCKING ISSUES)

**Problema 1: Botón "Publicar" tiene Handler Vacío**
- **Ubicación:** [src/features/admin/components/tabs/Historial.tsx](src/features/admin/components/tabs/Historial.tsx#L591-L601)
- **Código Actual:** `onClick={() {}}`  (empty handler)
- **Impacto:** Admin puede ver y hacer clic en botón "Publicar" pero NO cambia estado a ACTIVA
- **Consecuencia:** Cotización permanece en estado CARGADA → Cliente NO ve los botones de respuesta
- **Solución:** Wiring existente `useChangeQuotationState` hook al onClick del botón

**Problema 2: Handler del Botón "Publicar" NO Wired a Función de Cambio de Estado**
- **Hook Existente:** [src/features/admin/hooks/useChangeQuotationState.ts](src/features/admin/hooks/useChangeQuotationState.ts)
- **Estado:** ✅ Hook completamente implementado y funcional
- **Problema:** NO se importa ni se llama en Historial.tsx
- **Solución:** Agregar `useChangeQuotationState()` al Historial.tsx e importar hook

**Problema 3: Página Pública NO Valida Que Cotización Esté ACTIVA**
- **Ubicación:** [src/app/page.tsx](src/app/page.tsx#L422)
- **Validación Actual:** `if (cotizacion?.id && cotizacion?.estado === 'ACTIVA')`
- **Problema:** Solo MUESTRA botones si ACTIVA, pero NO redirige a `/sin-cotizacion` si está CARGADA
- **Impacto:** Si cliente accede a URL de cotización CARGADA, ve página vacía sin explicación
- **Solución:** Agregar validación redirect: si estado !== 'ACTIVA', redirigir a `/sin-cotizacion`

---

**Problemas Anteriores (Sin Cambios):**
- ❌ No hay seguimiento de respuestas del cliente
- ❌ No hay contador de días para aceptar
- ❌ No hay diferencia entre "rechazada" y "propuesta modificada"
- ❌ No hay notificaciones en tiempo real
- ❌ Campo `estado` en QuotationConfig pero sin estados de respuesta del cliente

---

## 🔎 Hallazgos Auditoría ETAPA 1

### 🚨 ACTUALIZACIÓN CRÍTICA - PROBLEMAS ENCONTRADOS Y SOLUCIONADOS

**Fecha de Descubrimiento:** 22 de diciembre de 2025  
**Fecha de Solución:** 22 de diciembre de 2025  
**Estado:** ✅ SOLUCIONADOS

Durante la auditoría detallada del código se descubrieron **4 problemas bloqueantes** que impedían que el flujo de publicación funcionara:

1. ✅ **Botón "Publicar" tenía handler vacío** → SOLUCIONADO: Wired a `handleChangeState()`
2. ✅ **Hook no se importaba en Historial.tsx** → SOLUCIONADO: Agregado import y destructuring  
3. ✅ **Endpoint NO actualizaba campo `estado` en BD** → SOLUCIONADO: Agregado `estado: state` en updateData
4. ✅ **Página pública NO validaba estado ACTIVA** → SOLUCIONADO: Agregado useEffect con validación redirect

**Cambios Realizados:**
- [src/features/admin/components/tabs/Historial.tsx](src/features/admin/components/tabs/Historial.tsx) - Agregado handler y wiring
- [src/app/api/quotations/[id]/state/route.ts](src/app/api/quotations/[id]/state/route.ts) - Agregado actualización de campo `estado`
- [src/app/page.tsx](src/app/page.tsx#L184-L190) - Agregado validación redirect para no-publicadas

---

### Resumen Ejecutivo

La infraestructura de ETAPA 1 está **95% completa**. Todos los componentes, hooks y endpoints existen e implementados. El problema es **un flujo quebrado en la publicación de cotizaciones**: el botón "Publicar" en el panel admin tiene un handler vacío, impidiendo que el proveedor publique cotizaciones. Como resultado, permanecen en estado CARGADA y los clientes NO ven los botones de respuesta en la página pública.

**Impacto:** Los botones de respuesta del cliente NO se muestran en la página pública porque la cotización nunca es publicada a estado ACTIVA.

---

### BLOCKING ISSUES Identificados

#### 🔴 PROBLEMA 1: Handler Vacío en Botón "Publicar"

**Ubicación:** [src/features/admin/components/tabs/Historial.tsx](src/features/admin/components/tabs/Historial.tsx#L591-L601)

**Código Actual:**
```tsx
{quotation.estado === 'CARGADA' && (
  <button
    onClick={() => {}}  // ⚠️ EMPTY HANDLER - NOTHING HAPPENS!
    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-500/10 hover:bg-green-500/15 text-green-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
    title="Publicar cotización"
  >
    <Check className="w-3 h-3" />
    <span>Publicar</span>
  </button>
)}
```

**Impacto:**
- Proveedor ve el botón "Publicar"
- Proveedor hace clic en el botón
- **Nada ocurre** → Cotización permanece en CARGADA
- Cliente accede a página pública
- **Ve página vacía** → Mensajes faltan porque estado !== ACTIVA

**Solución:**
Reemplazar `onClick={() => {}}` con llamada a `useChangeQuotationState()` hook:
```tsx
onClick={() => changeState(quotation.id, 'ACTIVA')}
```

---

#### 🔴 PROBLEMA 2: Hook Existe Pero NO Se Usa

**Hook Implementado:** [src/features/admin/hooks/useChangeQuotationState.ts](src/features/admin/hooks/useChangeQuotationState.ts)

**Estado del Hook:** ✅ Completamente funcional
```typescript
export function useChangeQuotationState(): UseChangeQuotationStateReturn {
  const changeState = async (quotationId: string, newState: string) => {
    const response = await fetch(`/api/quotations/${quotationId}/state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newState }),
    })
    // ... error handling
  }
  return { changeState, loading, error, success }
}
```

**Problema:**
- Hook existe y funciona
- Hook NO se importa en Historial.tsx
- Hook NO se llama en onClick del botón

**Solución:**
1. Importar hook: `const { changeState } = useChangeQuotationState()`
2. Wiring: `onClick={() => changeState(quotation.id, 'ACTIVA')}`

---

#### 🔴 PROBLEMA 3: Página Pública NO Valida Estado

**Ubicación:** [src/app/page.tsx](src/app/page.tsx#L422)

**Validación Actual:**
```tsx
{cotizacion?.id && cotizacion?.estado === 'ACTIVA' && (
  <div className="sticky top-20 z-40 ...">
    <ClientResponseButtons ... />
  </div>
)}
```

**Lógica Actual:**
- Si `cotizacion?.estado === 'ACTIVA'` → Mostrar botones ✅
- Si `cotizacion?.estado !== 'ACTIVA'` → NO mostrar botones (simplemente no renderiza) ❌

**Problema:**
- Redirección solo existe si NO hay cotización: [Line 213](src/app/page.tsx#L213)
  ```tsx
  if (!cotizacion?.id) {
    router.replace('/sin-cotizacion')
  }
  ```
- NO hay redirección si cotización existe pero está en CARGADA

**Impacto:**
- Cliente accede a `/public?token=XYZ` de cotización CARGADA
- Página carga normalmente (sin errores)
- Ve la cotización pero **sin botones de respuesta**
- **No hay feedback** de que necesita esperar a que sea publicada

**Solución:**
Agregar validación en useEffect de carga:
```tsx
useEffect(() => {
  if (cotizacion?.id && cotizacion?.estado !== 'ACTIVA') {
    router.replace('/sin-cotizacion?reason=not-published')
  }
}, [cotizacion?.id, cotizacion?.estado, router])
```

---

### Infraestructura YA Implementada ✅

Todos estos componentes EXISTEN y están FUNCIONALES:

| Componente | Ubicación | Estado |
|-----------|-----------|--------|
| **API Endpoint** | `src/app/api/quotations/[id]/state/route.ts` | ✅ PATCH working |
| **Hook** | `src/features/admin/hooks/useChangeQuotationState.ts` | ✅ Functional |
| **Dialog Components** | `src/app/dialog*` | ✅ 3 dialogs created |
| **Response Buttons** | `src/app/ClientResponseButtons.tsx` | ✅ Component exists |
| **Validation Logic** | `src/app/page.tsx` | ⚠️ Incomplete |
| **Badge Contador** | `src/app/BadgeContadorDias.tsx` | ✅ Working |

---

### Flujo Esperado (Vez Implementado)

```
ETAPA 1: Publicación de Cotización
================================

Admin Panel:
1. Admin carga cotización (estado = CARGADA)
2. Admin hace clic en "Publicar" 
3. Hook changeState() se ejecuta
4. PATCH /api/quotations/{id}/state → { state: 'ACTIVA' }
5. BD actualiza: quotation.estado = 'ACTIVA'
6. Notificación en tiempo real (si implementado)

Cliente - Página Pública:
1. Cliente accede a /public?token=XYZ
2. page.tsx fetch /api/quotation-config
3. Obtiene: { estado: 'ACTIVA', ... }
4. Validación PASA ✅
5. Renderiza ClientResponseButtons
6. Cliente ve 3 botones: Aceptar, Rechazar, Proponer
7. Cliente hace clic en botón → Dialog abre
8. Cliente completa respuesta → API POST
9. BD actualiza: quotation.estado = ACEPTADA/RECHAZADA/NUEVA_PROPUESTA

---

Flujo Actual (ROTO):
====================

Admin Panel:
1. Admin carga cotización (estado = CARGADA)
2. Admin hace clic en "Publicar"
3. onClick={() => {}} → NOTHING HAPPENS
4. Estado permanece: CARGADA

Cliente - Página Pública:
1. Cliente accede a /public?token=XYZ
2. page.tsx fetch /api/quotation-config
3. Obtiene: { estado: 'CARGADA', ... }
4. Condición: estado === 'ACTIVA' → FALSE
5. ClientResponseButtons NO renderiza
6. Cliente ve PÁGINA VACÍA sin explicación
```

---

### Componentes Listos para Usar

**Dialog Components (Already Created):**
- ✅ `DialogoClienteAceptar.tsx` - Form para aceptar cotización
- ✅ `DialogoClienteRechazar.tsx` - Form para rechazar con razones
- ✅ `DialogoClienteProponer.tsx` - Form para proponer cambios

**Response Button Component:**
- ✅ `ClientResponseButtons.tsx` - 3 circular buttons (Aceptar/Rechazar/Proponer)

**Layout Components:**
- ✅ `BadgeContadorDias.tsx` - Floating badge with countdown

**API Endpoints:**
- ✅ `POST /api/quotations/{id}/client-response` - Handles all response types
- ✅ `PATCH /api/quotations/{id}/state` - Changes quotation state

---

### Próximos Pasos (Implementación)

**Step 1: Wire Publicar Button (5 min)**
- Importar `useChangeQuotationState` en Historial.tsx
- Cambiar onClick vacío a: `changeState(quotation.id, 'ACTIVA')`
- Agregar manejo de loading/error con toast feedback

**Step 2: Add State Validation in page.tsx (5 min)**
- Agregar useEffect que valide estado = 'ACTIVA'
- Si estado !== 'ACTIVA' → redirect a `/sin-cotizacion`

**Step 3: Test End-to-End (10 min)**
- Admin publica cotización
- Cliente accede a página
- Valida que estado cambie correctamente
- Valida que buttons aparezcan
- Valida que responses se registren

---

## 🆕 Nuevos Estados de Cotización

### Estados Extendidos

Expandir `QuotationState` a:

```typescript
// Estado del ciclo de vida de la cotización
type QuotationState = 
  | 'CARGADA'          // ✏️ En edición por el proveedor (default)
  | 'ACTIVA'           // ✅ Publicada, lista para cliente
  | 'INACTIVA'         // 🚫 Archivada
  | 'ACEPTADA'         // 🎉 Cliente aceptó (estado final positivo)
  | 'RECHAZADA'        // ❌ Cliente rechazó (estado final negativo)
  | 'NUEVA_PROPUESTA'  // 🔄 Cliente propone modificaciones (requiere revisión)
  | 'EXPIRADA'         // ⏰ Tiempo de aceptación expiró sin respuesta
```

### Relación entre Estados

```
CARGADA → ACTIVA → (Cliente Responde):
                    ├→ ACEPTADA (fin positivo) ✅
                    ├→ RECHAZADA (fin negativo) ❌
                    ├→ NUEVA_PROPUESTA (requiere acción) 🔄
                    └→ EXPIRADA (timeout) ⏰

ACTIVA → INACTIVA (Proveedor archiva) 🚫
INACTIVA → ACTIVA (Proveedor reactiva) 🔄
ACTIVA → CARGADA (Proveedor edita de nuevo) ✏️
```

---

## 🗄️ Cambios en BD (Schema Prisma)

### 1. Actualizar Enum `QuotationState`

```prisma
enum QuotationState {
  CARGADA
  ACTIVA
  INACTIVA
  ACEPTADA
  RECHAZADA
  NUEVA_PROPUESTA
  EXPIRADA
}
```

### 2. Agregar Tabla `ClientResponse`

Registra TODAS las respuestas de clientes (aceptación, rechazo, sugerencias).

```prisma
model ClientResponse {
  id                    String   @id @default(cuid())
  
  // Referencia a cotización
  quotationConfigId     String
  quotationConfig       QuotationConfig @relation(fields: [quotationConfigId], references: [id], onDelete: Cascade)
  
  // Información del cliente (desde sesión)
  clientUserId          String?          // ID del usuario cliente
  clientName            String           // Nombre del cliente
  clientEmail           String           // Email del cliente
  
  // Tipo de respuesta
  responseType          String  // "ACEPTADA" | "RECHAZADA" | "NUEVA_PROPUESTA"
  
  // Mensaje del cliente (textarea)
  mensaje               String?  // Razones del rechazo o sugerencias de cambios
  
  // Auditoría
  respondidoEn          DateTime @default(now())
  diasRestantes         Int?     // Días que quedaban cuando respondió
  
  // Metadata
  ipAddress             String?
  userAgent             String?
  
  // Relación con notificaciones
  notificaciones        Notification[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([quotationConfigId])
  @@index([clientUserId])
  @@index([responseType])
  @@index([respondidoEn])
}
```

### 3. Crear Tabla `Notification`

Sistema de notificaciones para usuarios internos (admins, creadores, roles superiores).

```prisma
model Notification {
  id                    String   @id @default(cuid())
  
  // Para quién es la notificación
  userId                String
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // De dónde viene
  clientResponseId      String?
  clientResponse        ClientResponse? @relation(fields: [clientResponseId], references: [id], onDelete: SetNull)
  
  // Información de la notificación
  titulo                String   // "Cliente XXX ha aceptado/rechazado/propuesto cambios"
  descripcion           String?  // Vista previa del mensaje
  tipoNotificacion      String   // "CLIENTE_ACEPTACION" | "CLIENTE_RECHAZO" | "CLIENTE_PROPUESTA"
  
  // Estado
  leida                 Boolean  @default(false)
  leidoEn               DateTime?
  
  // Auditoría
  createdAt             DateTime @default(now())
  
  @@index([userId])
  @@index([leida])
  @@index([createdAt])
}
```

### 4. Extender Tabla `QuotationConfig`

```prisma
model QuotationConfig {
  // ... campos existentes ...
  
  // Estados actuales
  estado                QuotationState @default(CARGADA)
  activadoEn            DateTime?
  inactivadoEn          DateTime?
  
  // NUEVOS: Campos para respuestas del cliente
  respondidoEn          DateTime?       // Fecha cuando cliente respondió
  diasParaAceptar       Int?            // Días disponibles para cliente (default: tiempoValidez)
  expiradoEn            DateTime?       // Fecha cuando expiró (si EXPIRADA)
  
  // Relación con respuestas
  clientResponses       ClientResponse[]
  
  // Índices
  @@index([estado])
  @@index([respondidoEn])
  @@index([expiradoEn])
}
```

### 5. Extender Tabla `AuditLog`

Agregar acciones de cliente en AuditLog:

```typescript
export type AuditAction = 
  // ... acciones existentes ...
  // Nuevas acciones de cliente
  | 'CLIENT_RESPONSE_ACCEPTED'
  | 'CLIENT_RESPONSE_REJECTED'
  | 'CLIENT_RESPONSE_PROPOSED_CHANGES'
  | 'CLIENT_REQUEST_EXTENSION'
  | 'CLIENT_QUOTATION_EXPIRED'
  // Acciones de admin sobre respuestas
  | 'ADMIN_RESPONSE_VIEWED'
  | 'ADMIN_QUOTATION_STATUS_UPDATED'
```

---

## 🎨 Coherencia Visual y Componentes

### Principios de Diseño
- **Coherencia Total:** Todos los botones, diálogos y componentes utilizan la paleta de colores GitHub Dark
- **Sistema de Componentes:** DialogoGenericoDinamico es el elemento base para todos los diálogos
- **Animaciones:** Transiciones suaves (200-300ms) en hover y active states
- **Tipografía:** Coherencia en tamaños: Títulos (16-18px), Descripciones (14px), Contenido (12-13px)
- **Espaciado:** Márgenes y paddings consistentes siguiendo la escala de 4px

### Matriz de Colores por Acción

| Acción | Color | Hex | Uso | Botón | Diálogo |
|--------|-------|-----|-----|-------|---------|
| **Aceptar** | Verde | #10B981 | Acciones positivas | ✅ Circular | Tipo: success |
| **Rechazar** | Rojo | #EF4444 | Acciones negativas | ❌ Circular | Tipo: warning |
| **Proponer** | Azul | #3B82F6 | Acciones informativas | 💡 Circular | Tipo: info |
| **Publicar** | Verde | #10B981 | Cambios positivos | - | Tipo: success |
| **Inactivar** | Amarillo | #EAB308 | Acciones de precaución | - | Tipo: warning |
| **Cerrar** | Gris | #6B7280 | Acciones neutrales | - | - |

### Estándares de Diálogos (DialogoGenericoDinamico)

Todas los diálogos deben incluir:

```tsx
// Template base
<DialogoGenericoDinamico
  isOpen={isOpen}                    // Control de visibilidad
  onClose={handleClose}              // Callback de cierre
  title="Título Descriptivo"         // 16-18px font-semibold
  description="Descripción breve"    // 14px text-gh-text-muted
  type="success|warning|info|danger" // Define color del header
  variant="premium"                   // Siempre "premium" para consistencia
  contentType="custom|confirmation"  // Tipo de contenido
  content={<CustomContent />}        // JSX renderizado
  confirmButtonText="Acción"         // Texto del botón primario
  cancelButtonText="Cancelar"        // Texto del botón secundario
  confirmButtonColor="green|red|blue|yellow"  // Color del botón
  confirmDisabled={false}            // Deshabilitar según validación
  customButtons={[...]}              // Para diálogos con 3+ botones
  maxHeight="80vh"                   // Scrollable si es necesario
  onConfirm={handleConfirm}          // Callback confirmación
  onCancel={handleCancel}            // Callback cancelación (opcional)
/>
```

### Estándares de Botones Circulares (Respuesta del Cliente)

```tsx
// Para cada botón circular
className={`
  w-14 h-14                          // Tamaño: 56px
  rounded-full                        // Forma: circular
  flex items-center justify-center    // Centrado
  text-2xl                           // Emoji grande
  
  bg-[COLOR] hover:bg-[COLOR-DARK]   // Color base + hover
  active:bg-[COLOR-DARKER]           // Click
  
  shadow-lg hover:shadow-xl           // Sombra dinámica
  border-2 border-[COLOR-BORDER]     // Borde consistente
  
  transition-all duration-200         // Transición suave
  transform hover:scale-110 active:scale-95  // Escala en interacción
  
  disabled:opacity-50                // Deshabilitado
  disabled:cursor-not-allowed
  disabled:hover:scale-100
  
  focus:outline-none                 // Sin outline nativo
  focus:ring-2 focus:ring-[COLOR]    // Ring de focus
  focus:ring-offset-2
  focus:ring-offset-gh-bg
`}
/>
```

---

## 🎨 Coherencia Visual y Componentes

### Principios de Diseño
- **Coherencia Total:** Todos los botones, diálogos y componentes utilizan la paleta de colores GitHub Dark
- **Sistema de Componentes:** DialogoGenericoDinamico es el elemento base para todos los diálogos
- **Animaciones:** Transiciones suaves (200-300ms) en hover y active states
- **Tipografía:** Coherencia en tamaños: Títulos (16-18px), Descripciones (14px), Contenido (12-13px)
- **Espaciado:** Márgenes y paddings consistentes siguiendo la escala de 4px

### Uso de DialogoGenericoDinamico

Todos los diálogos deben usar `DialogoGenericoDinamico` con propiedades consistentes:

```tsx
<DialogoGenericoDinamico
  isOpen={isOpen}
  onClose={handleClose}
  title="Título del Diálogo"
  description="Descripción del diálogo"
  type="success|warning|danger|info"  // Define color del header
  variant="premium"                     // Usa siempre "premium" para consistencia
  contentType="custom|confirmation"
  content={<CustomContent />}
  maxHeight="80vh"                      // Scrollable si es necesario
/>
```

### Botones Base
```tsx
// Button primario (success)
className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"

// Button secundario (warning)
className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"

// Button peligro (danger)
className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"

// Button info
className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"

// Button secundario (neutral)
className="px-4 py-2 bg-gh-bg-secondary hover:bg-gh-bg-tertiary text-gh-text border border-gh-border rounded-lg transition-colors duration-200"
```

### Colores por Contexto
| Contexto | Color | Uso |
|----------|-------|-----|
| Publicar | Verde (#10B981) | Acciones positivas |
| Rechazar/Cancelar | Rojo (#EF4444) | Acciones negativas |
| Proponer Cambios | Azul (#3B82F6) | Acciones informativas |
| Inactivar | Amarillo (#EAB308) | Acciones de precaución |
| Aceptación Cliente | Verde (#10B981) | Estado final positivo |
| Rechazo Cliente | Rojo (#EF4444) | Estado final negativo |

---

### 1. Botones de Estado (Historial.tsx)

**Estructura actual:** 3 grids de botones (EDITAR, ESTADO, EXPORTAR)

**Cambios en Grid 2 (ESTADO):**

```tsx
// Botones condicionados por estado actual
{quotation.estado === 'CARGADA' && (
  <button onClick={() => handlePublicar(quotation)}>Publicar</button>
)}

{quotation.estado === 'ACTIVA' && (
  <>
    <button onClick={() => handleCargar(quotation)}>Cargar</button>
    <button onClick={() => handleInactivar(quotation)}>Inactivar</button>
  </>
)}

{quotation.estado === 'INACTIVA' && (
  <button onClick={() => handleReactivar(quotation)}>Reactivar</button>
)}

// NUEVOS ESTADOS: Mostrar cuando cliente responde
{quotation.estado === 'ACEPTADA' && (
  <div className="text-green-300">
    <button disabled className="text-[10px]">✅ Aceptada</button>
  </div>
)}

{quotation.estado === 'RECHAZADA' && (
  <>
    <button onClick={() => handleVerRazones(quotation)} className="text-red-300">
      ❌ Ver Razones
    </button>
    <button onClick={() => handleEnviarNuevaVersion(quotation)}>
      📝 Nueva Versión
    </button>
  </>
)}

{quotation.estado === 'NUEVA_PROPUESTA' && (
  <>
    <button onClick={() => handleVerSugerencias(quotation)} className="text-blue-300">
      💡 Ver Sugerencias
    </button>
    <button onClick={() => handleAceptarCambios(quotation)}>
      ✅ Aceptar Cambios
    </button>
  </>
)}

{quotation.estado === 'EXPIRADA' && (
  <>
    <button onClick={() => handleRenovarOferta(quotation)} className="text-amber-300">
      ⏰ Renovar Oferta
    </button>
    <button onClick={() => handleEliminar(quotation)} className="text-red-300">
      🗑️ Eliminar
    </button>
  </>
)}
```

### 2. Hook `useChangeQuotationState()`

**Ubicación:** `src/features/admin/hooks/useChangeQuotationState.ts`

**Funcionalidad:**

```typescript
interface UseChangeQuotationStateReturn {
  changeState: (quotationId: string, newState: QuotationState) => Promise<void>
  loading: boolean
  error: string | null
}

export function useChangeQuotationState(): UseChangeQuotationStateReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  const changeState = async (quotationId: string, newState: QuotationState) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/quotations/${quotationId}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado: newState })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error changing state')
      }
      
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] })
      
      // Toast éxito
      toast.success(`Estado actualizado a ${newState}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }
  
  return { changeState, loading, error }
}
```

### 3. Dialogos para Acciones de Estado (DialogoGenericoDinamico)

**DialogoPublicar.tsx:**

```tsx
<DialogoGenericoDinamico
  isOpen={showPublicarDialog}
  onClose={() => setShowPublicarDialog(false)}
  title="Publicar Cotización"
  description="¿Deseas publicar esta cotización?"
  type="success"
  variant="premium"
  contentType="custom"
  content={
    <div className="space-y-3">
      <div className="bg-gh-bg-secondary p-3 rounded-lg border border-gh-border">
        <p className="text-xs text-gh-text-muted mb-2">Cotización:</p>
        <p className="text-sm font-semibold text-gh-text">{quotation.numero}</p>
        <p className="text-xs text-gh-text-muted mt-2">Cliente:</p>
        <p className="text-sm text-gh-text">{quotation.clienteName}</p>
      </div>
      
      <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
        <p className="text-xs text-green-400 font-semibold">📢 El cliente recibirá notificación</p>
        <p className="text-xs text-green-300 mt-2">
          Tendrá <strong>{quotation.tiempoValidez} días</strong> para estudiar y responder a esta propuesta.
        </p>
      </div>
    </div>
  }
  confirmButtonText="Publicar"
  cancelButtonText="Cancelar"
  confirmButtonColor="green"
  onConfirm={() => changeState(quotation.id, 'ACTIVA')}
  maxHeight="70vh"
/>
```

**DialogoRechazar.tsx (para ver respuesta del cliente):**

```tsx
<DialogoGenericoDinamico
  isOpen={showRechazarDialog}
  onClose={() => setShowRechazarDialog(false)}
  title="Respuesta del Cliente - Rechazo"
  description={`El cliente ${clientResponse.clientName} ha rechazado la cotización`}
  type="warning"
  variant="premium"
  contentType="custom"
  content={
    <div className="space-y-3">
      {/* Información básica */}
      <div className="bg-gh-bg-secondary p-3 rounded-lg border border-gh-border text-xs">
        <div className="flex justify-between mb-2">
          <span className="text-gh-text-muted">Cliente:</span>
          <span className="text-gh-text font-semibold">{clientResponse.clientName}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gh-text-muted">Email:</span>
          <span className="text-gh-text">{clientResponse.clientEmail}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gh-text-muted">Fecha:</span>
          <span className="text-gh-text">{formatDate(clientResponse.respondidoEn)}</span>
        </div>
      </div>
      
      {/* Razones del rechazo */}
      <div>
        <p className="text-xs font-semibold text-gh-text mb-2">Razones del Rechazo:</p>
        <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30 text-xs text-red-300 max-h-32 overflow-y-auto">
          {clientResponse.mensaje}
        </div>
      </div>
      
      {/* Opciones de acción */}
      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
        <p className="text-xs text-blue-400 font-semibold mb-2">Próximos pasos:</p>
        <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside">
          <li>Revisar las razones del cliente</li>
          <li>Ajustar la propuesta si es necesario</li>
          <li>Enviar una nueva versión</li>
        </ul>
      </div>
    </div>
  }
  customButtons={[
    { text: 'Ver Cotización', color: 'blue', onClick: handleVerCotizacion },
    { text: 'Enviar Nueva Versión', color: 'green', onClick: handleEnviarNuevaVersion },
    { text: 'Cerrar', color: 'gray', onClick: () => setShowRechazarDialog(false) }
  ]}
  maxHeight="80vh"
/>
```

**DialogoNuevaPropuesta.tsx (para ver sugerencias):**

```tsx
<DialogoGenericoDinamico
  isOpen={showProuestaDialog}
  onClose={() => setShowProuestaDialog(false)}
  title="Propuesta de Cambios del Cliente"
  description={`El cliente ${clientResponse.clientName} propone modificaciones`}
  type="info"
  variant="premium"
  contentType="custom"
  content={
    <div className="space-y-3">
      {/* Información básica */}
      <div className="bg-gh-bg-secondary p-3 rounded-lg border border-gh-border text-xs">
        <div className="flex justify-between mb-2">
          <span className="text-gh-text-muted">Cliente:</span>
          <span className="text-gh-text font-semibold">{clientResponse.clientName}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gh-text-muted">Email:</span>
          <span className="text-gh-text">{clientResponse.clientEmail}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gh-text-muted">Fecha:</span>
          <span className="text-gh-text">{formatDate(clientResponse.respondidoEn)}</span>
        </div>
      </div>
      
      {/* Sugerencias */}
      <div>
        <p className="text-xs font-semibold text-gh-text mb-2">Cambios Propuestos:</p>
        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30 text-xs text-blue-300 max-h-32 overflow-y-auto">
          {clientResponse.mensaje}
        </div>
      </div>
      
      {/* Opciones de acción */}
      <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
        <p className="text-xs text-yellow-400 font-semibold mb-2">📝 Opciones disponibles:</p>
        <ul className="text-xs text-yellow-300 space-y-1 list-disc list-inside">
          <li>Aceptar los cambios propuestos</li>
          <li>Rechazar parcialmente las sugerencias</li>
          <li>Contactar al cliente para negociar</li>
        </ul>
      </div>
    </div>
  }
  customButtons={[
    { text: 'Aceptar Cambios', color: 'green', onClick: handleAceptarCambios },
    { text: 'Rechazar Sugerencias', color: 'red', onClick: handleRechazarSugerencias },
    { text: 'Ver Cotización', color: 'blue', onClick: handleVerCotizacion },
    { text: 'Cerrar', color: 'gray', onClick: () => setShowProuestaDialog(false) }
  ]}
  maxHeight="80vh"
/>
```

---

## 🌐 Implementación Frontend - Página Pública

### 1. Badge Flotante - Contador Regresivo (Fluent Design 2)

**Ubicación:** Esquina inferior derecha, flotante, z-index: 50

**Componente:** `src/components/BadgeContadorDias.tsx`

**Especificaciones - Fluent Design 2 de Microsoft:**

#### Diseño Visual
- **Forma:** Rectángulo redondeado (border-radius: 8px)
- **Sombra:** Fluent shadow (blur: 12px, opacity: 0.15) - Efecto de elevación
- **Fondo:** Glassmorphism con backdrop-filter blur
- **Border:** Subtle 1px línea divisoria con 20% opacity
- **Animaciones:** Smooth 250ms (estándar Fluent)
- **Transiciones:** Ease-in-out para cambios de estado

#### Paleta de Colores Dinámicos (Porcentaje de Días Restantes)

| Porcentaje | Rango | Color | Hex | Nombre | Estado |
|-----------|-------|-------|-----|--------|--------|
| **> 90%** | Más de 6 días | Verde Claro | #107C10 | Green | ✅ Lejano |
| **50-89%** | 3.5-6 días | Verde Agua | #00B050 | Teal | ✅ Confortable |
| **30-49%** | 2-3.5 días | Amarillo Ocre | #FFB900 | Amber | ⚠️ Precaución |
| **1-29%** | 1-2 días | Rojo Coral | #E81123 | Red | 🔴 Crítico |
| **0%** | 0 días | Gris Oscuro | #5A5A5A | Dark Gray | ⏰ Expirado |

#### Contador Regresivo (Actualización Dinámica)

```
FORMATO MOSTRADO:
- Si > 1 día: "D DÍAS HH:MM:SS" (Ej: "3 DÍAS 14:32:15")
- Si = 1 día: "24 HORAS MM:SS" (Ej: "24 HORAS 45:30")
- Si < 24 horas: "HH:MM:SS" (Ej: "05:45:30")
- Si = 0: "EXPIRADO"

ACTUALIZACIÓN:
- Cada 1 segundo (para efecto regresivo fluido)
- Cambio de color suave cuando cruza umbrales de porcentaje
- Transición visual de 250ms entre colores
```

#### Especificación Técnica Completa

```tsx
interface BadgeContadorDiasProps {
  diasRestantes: number      // Total de días (ej: 7)
  tiempoValidezDias: number  // Días totales de validez (ej: 7)
  estado: QuotationState
  expiradoEn: Date | null
  onExpired?: () => void
}

export function BadgeContadorDias({
  diasRestantes,
  tiempoValidezDias,
  estado,
  expiradoEn,
  onExpired
}: BadgeContadorDiasProps) {
  // Estado del contador
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  })
  
  const [colorState, setColorState] = useState({
    bgGradient: 'from-green-700 to-green-600',
    bgSolid: 'bg-green-600',
    border: 'border-green-500/30',
    text: 'text-white',
    label: 'text-green-200',
    iconGlow: 'shadow-lg shadow-green-500/50',
    percentage: 100,
    stage: 'safe' // safe | comfortable | caution | critical | expired
  })
  
  const [isHovered, setIsHovered] = useState(false)
  
  // Calcular porcentaje y determinar colores
  const getColorState = (remainingDays: number) => {
    const percentage = (remainingDays / tiempoValidezDias) * 100
    
    if (percentage > 90) {
      return {
        bgGradient: 'from-emerald-700 to-emerald-600',
        bgSolid: 'bg-emerald-600',
        border: 'border-emerald-500/30',
        text: 'text-white',
        label: 'text-emerald-200',
        iconGlow: 'shadow-lg shadow-emerald-500/50',
        percentage: Math.round(percentage),
        stage: 'safe'
      }
    } else if (percentage >= 50) {
      return {
        bgGradient: 'from-cyan-700 to-cyan-600',
        bgSolid: 'bg-cyan-600',
        border: 'border-cyan-500/30',
        text: 'text-white',
        label: 'text-cyan-200',
        iconGlow: 'shadow-lg shadow-cyan-500/50',
        percentage: Math.round(percentage),
        stage: 'comfortable'
      }
    } else if (percentage >= 30) {
      return {
        bgGradient: 'from-amber-700 to-amber-600',
        bgSolid: 'bg-amber-600',
        border: 'border-amber-500/30',
        text: 'text-white',
        label: 'text-amber-100',
        iconGlow: 'shadow-lg shadow-amber-500/50',
        percentage: Math.round(percentage),
        stage: 'caution'
      }
    } else if (percentage > 0) {
      return {
        bgGradient: 'from-red-700 to-red-600',
        bgSolid: 'bg-red-600',
        border: 'border-red-500/30',
        text: 'text-white',
        label: 'text-red-100',
        iconGlow: 'shadow-lg shadow-red-500/50 animate-pulse',
        percentage: Math.round(percentage),
        stage: 'critical'
      }
    } else {
      return {
        bgGradient: 'from-slate-700 to-slate-600',
        bgSolid: 'bg-slate-600',
        border: 'border-slate-500/30',
        text: 'text-slate-100',
        label: 'text-slate-300',
        iconGlow: 'shadow-lg shadow-slate-500/30',
        percentage: 0,
        stage: 'expired'
      }
    }
  }
  
  // Actualizar contador cada segundo
  useEffect(() => {
    const updateCounter = () => {
      const ahora = new Date()
      const diferencia = expiradoEn.getTime() - ahora.getTime()
      
      if (diferencia <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 })
        onExpired?.()
        return
      }
      
      const totalSeconds = Math.floor(diferencia / 1000)
      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = totalSeconds % 60
      
      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds
      })
      
      // Actualizar color
      const newColor = getColorState(days)
      setColorState(newColor)
    }
    
    // Primera actualización inmediata
    updateCounter()
    
    // Luego actualizar cada segundo
    const interval = setInterval(updateCounter, 1000)
    return () => clearInterval(interval)
  }, [expiradoEn, tiempoValidezDias])
  
  // Renderizar
  if (estado !== 'ACTIVA') return null
  
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 
        ${colorState.bgSolid} ${colorState.text}
        rounded-xl px-5 py-4
        border ${colorState.border}
        backdrop-blur-xl backdrop-brightness-110
        shadow-2xl transition-all duration-250
        ${isHovered ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'}
        hover:shadow-2xl
        cursor-default
        group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-label={`Tiempo restante: ${timeRemaining.days} días, ${timeRemaining.hours} horas, ${timeRemaining.minutes} minutos`}
    >
      {/* Contenedor principal */}
      <div className="flex flex-col items-center gap-3">
        
        {/* Header - Label y ícono */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium tracking-widest opacity-85 ${colorState.label}`}>
            TIEMPO RESTANTE
          </span>
          <span className={`text-lg ${colorState.iconGlow}`}>
            {colorState.stage === 'expired' ? '⏰' : '⏱️'}
          </span>
        </div>
        
        {/* Contador regresivo */}
        {colorState.stage === 'expired' ? (
          <div className="flex flex-col items-center gap-1">
            <div className="text-3xl font-bold">EXPIRADO</div>
            <p className="text-xs opacity-75">La cotización ha vencido</p>
          </div>
        ) : timeRemaining.days > 0 ? (
          // Mostrar: D DÍAS HH:MM:SS
          <div className="font-mono">
            <div className="text-4xl font-bold tracking-tight">
              {String(timeRemaining.days).padStart(2, '0')}
              <span className="text-sm ml-2 font-normal opacity-80">DÍAS</span>
            </div>
            <div className="text-sm font-medium mt-2 text-center opacity-90">
              {String(timeRemaining.hours).padStart(2, '0')}:
              {String(timeRemaining.minutes).padStart(2, '0')}:
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
          </div>
        ) : (
          // Mostrar: HH:MM:SS o 24 HORAS MM:SS
          <div className="font-mono">
            {timeRemaining.hours === 0 ? (
              <div>
                <div className="text-4xl font-bold tracking-tight mb-2">
                  <span className="text-lg opacity-80">ÚLTIMA </span>HORA
                </div>
                <div className="text-sm font-medium text-center opacity-90 animate-pulse">
                  {String(timeRemaining.minutes).padStart(2, '0')}:
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold tracking-tight mb-2">
                  {String(timeRemaining.hours).padStart(2, '0')}H
                </div>
                <div className="text-sm font-medium text-center opacity-90">
                  {String(timeRemaining.minutes).padStart(2, '0')}:
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Barra de progreso (Fluent Design) */}
        <div className="w-full mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className={`h-full bg-white/70 transition-all duration-500 ease-out rounded-full`}
            style={{
              width: `${colorState.percentage}%`,
              boxShadow: `0 0 10px rgba(255,255,255,${0.3 * (colorState.percentage / 100)})`
            }}
          />
        </div>
        
        {/* Texto informativo contextual */}
        <div className="text-xs opacity-75 text-center mt-1 h-4">
          {colorState.stage === 'safe' && (
            <span>Tiempo suficiente para revisar</span>
          )}
          {colorState.stage === 'comfortable' && (
            <span>Tiempo moderado disponible</span>
          )}
          {colorState.stage === 'caution' && (
            <span>⚠️ Tiempo limitado, apresúrate</span>
          )}
          {colorState.stage === 'critical' && (
            <span>🔴 ¡CRÍTICO! Responde ya</span>
          )}
          {colorState.stage === 'expired' && (
            <span>👉 Solicita extensión</span>
          )}
        </div>
      </div>
      
      {/* Efecto de brillo para estados críticos */}
      {colorState.stage === 'critical' && (
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 rounded-xl opacity-20 blur-lg animate-pulse -z-10" />
      )}
    </div>
  )
}
```

**Características Fluent Design 2:**
- ✅ Glassmorphism (backdrop-blur + brightness)
- ✅ Subtle shadows con efecto de elevación
- ✅ Transiciones suaves 250ms
- ✅ Animaciones fluidas sin distracciones
- ✅ Color dinámico según contexto
- ✅ Respuesta visual en hover (scale 105%)
- ✅ Íconos que responden al estado
- ✅ Barra de progreso con efecto glow
- ✅ Accesibilidad: aria-label con descripción

**Integración en página pública:**

```tsx
// src/app/page.tsx
import { BadgeContadorDias } from '@/components/BadgeContadorDias'

export default function QuotationPage() {
  const [quotation, setQuotation] = useState<QuotationConfig | null>(null)
  
  const handleBadgeExpired = () => {
    // Cambiar estado a EXPIRADA
    // Redirigir a /cotizacion-expirada
    window.location.href = '/cotizacion-expirada'
  }
  
  return (
    <div>
      {/* Contenido principal */}
      
      {quotation && quotation.estado === 'ACTIVA' && (
        <BadgeContadorDias
          diasRestantes={calculateDaysRemaining(quotation.activadoEn, quotation.diasParaAceptar)}
          tiempoValidezDias={quotation.diasParaAceptar}
          estado={quotation.estado}
          expiradoEn={quotation.expiradoEn || calculateExpirationDate(quotation.activadoEn, quotation.diasParaAceptar)}
          onExpired={handleBadgeExpired}
        />
      )}
    </div>
  )
}
```

### 2. Botones de Respuesta - Flotantes (Coherencia Visual)

**Ubicación:** Stack vertical, 60px arriba del Badge, esquina inferior derecha

**Componente:** `src/components/ClientResponseButtons.tsx`

**Especificaciones:**

```tsx
interface ClientResponseButtonsProps {
  quotationId: string
  clientName: string
  onResponse: (type: 'ACEPTADA' | 'RECHAZADA' | 'NUEVA_PROPUESTA') => void
  disabled?: boolean
}

export function ClientResponseButtons({
  quotationId,
  clientName,
  onResponse,
  disabled
}: ClientResponseButtonsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  
  return (
    <div
      className="fixed bottom-40 right-6 z-50 flex flex-col gap-3"
      role="group"
      aria-label="Opciones de respuesta"
    >
      {/* Button 1: ACEPTAR */}
      <button
        onClick={() => onResponse('ACEPTADA')}
        disabled={disabled}
        onMouseEnter={() => setHoveredButton('accept')}
        onMouseLeave={() => setHoveredButton(null)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
          bg-green-600 hover:bg-green-700 active:bg-green-800
          shadow-lg hover:shadow-xl
          border-2 border-green-700
          transition-all duration-200
          transform hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gh-bg`}
        title="Aceptar Cotización"
        aria-label="Aceptar Cotización"
      >
        ✅
      </button>
      {hoveredButton === 'accept' && (
        <div className="absolute bottom-16 right-0 bg-gh-bg-secondary border border-gh-border rounded-lg px-2 py-1 text-xs text-gh-text whitespace-nowrap shadow-lg">
          Aceptar
        </div>
      )}
      
      {/* Button 2: RECHAZAR */}
      <button
        onClick={() => onResponse('RECHAZADA')}
        disabled={disabled}
        onMouseEnter={() => setHoveredButton('reject')}
        onMouseLeave={() => setHoveredButton(null)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
          bg-red-600 hover:bg-red-700 active:bg-red-800
          shadow-lg hover:shadow-xl
          border-2 border-red-700
          transition-all duration-200
          transform hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gh-bg`}
        title="Rechazar Cotización"
        aria-label="Rechazar Cotización"
      >
        ❌
      </button>
      {hoveredButton === 'reject' && (
        <div className="absolute bottom-16 right-0 bg-gh-bg-secondary border border-gh-border rounded-lg px-2 py-1 text-xs text-gh-text whitespace-nowrap shadow-lg">
          Rechazar
        </div>
      )}
      
      {/* Button 3: PROPONER CAMBIOS */}
      <button
        onClick={() => onResponse('NUEVA_PROPUESTA')}
        disabled={disabled}
        onMouseEnter={() => setHoveredButton('propose')}
        onMouseLeave={() => setHoveredButton(null)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
          bg-blue-600 hover:bg-blue-700 active:bg-blue-800
          shadow-lg hover:shadow-xl
          border-2 border-blue-700
          transition-all duration-200
          transform hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gh-bg`}
        title="Proponer Cambios"
        aria-label="Proponer Cambios"
      >
        💡
      </button>
      {hoveredButton === 'propose' && (
        <div className="absolute bottom-16 right-0 bg-gh-bg-secondary border border-gh-border rounded-lg px-2 py-1 text-xs text-gh-text whitespace-nowrap shadow-lg">
          Proponer Cambios
        </div>
      )}
    </div>
  )
}
```

**Características de Coherencia Visual:**

| Aspecto | Especificación |
|--------|-----------------|
| **Tamaño** | 56px (14rem) diámetro |
| **Forma** | Circular (rounded-full) |
| **Bordes** | 2px sólido, color del botón (más oscuro) |
| **Sombra** | shadow-lg en reposo, shadow-xl en hover |
| **Animación Hover** | scale-110 (10% más grande) + 200ms |
| **Animación Click** | scale-95 + 200ms (retro) |
| **Transición** | duration-200 en todas las propiedades |
| **Colores** | Verde (acepta), Rojo (rechaza), Azul (propone) |
| **Focus Ring** | ring-2 de color del botón, offset-2 |
| **Tooltip** | Aparece arriba del botón al hover, texto pequeño |
| **Espaciado** | 12px (gap-3) entre botones |
| **Z-index** | 50 (debajo del Badge que es 50, pero coordinado) |

**Integración en página pública:**

```tsx
// src/app/page.tsx
import { ClientResponseButtons } from '@/components/ClientResponseButtons'

export default function QuotationPage() {
  const [showAceptarDialog, setShowAceptarDialog] = useState(false)
  const [showRechazarDialog, setShowRechazarDialog] = useState(false)
  const [showProponerDialog, setShowProponerDialog] = useState(false)
  
  const handleClientResponse = (type: string) => {
    switch (type) {
      case 'ACEPTADA':
        setShowAceptarDialog(true)
        break
      case 'RECHAZADA':
        setShowRechazarDialog(true)
        break
      case 'NUEVA_PROPUESTA':
        setShowProponerDialog(true)
        break
    }
  }
  
  return (
    <div>
      {/* Contenido */}
      
      {quotation && quotation.estado === 'ACTIVA' && (
        <ClientResponseButtons
          quotationId={quotation.id}
          clientName={quotation.clienteName}
          onResponse={handleClientResponse}
          disabled={isSubmitting}
        />
      )}
      
      {/* Dialogos */}
      <DialogoClienteAceptar isOpen={showAceptarDialog} ... />
      <DialogoClienteRechazar isOpen={showRechazarDialog} ... />
      <DialogoClienteProponer isOpen={showProponerDialog} ... />
    </div>
  )
}
```

### 3. Dialogos de Respuesta del Cliente (DialogoGenericoDinamico)

**DialogoClienteAceptar.tsx:**

```tsx
<DialogoGenericoDinamico
  isOpen={showAceptarDialog}
  onClose={() => setShowAceptarDialog(false)}
  title="Aceptar Cotización"
  description="¿Deseas ACEPTAR esta propuesta de cotización?"
  type="success"
  variant="premium"
  contentType="custom"
  content={
    <div className="space-y-4">
      {/* Resumen de paquetes */}
      <div className="bg-gh-bg-secondary p-3 rounded-lg border border-gh-border">
        <h4 className="text-sm font-semibold text-gh-text mb-2">Resumen de Paquetes</h4>
        {snapshots.map(snap => (
          <div key={snap.id} className="text-xs text-gh-text-muted py-1 flex justify-between">
            <span>{snap.nombre}</span>
            <span className="text-green-400">${snap.costoMes1.toLocaleString()}</span>
          </div>
        ))}
      </div>
      
      {/* Aviso legal */}
      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
        <p className="text-xs text-red-400 font-semibold">
          ⚠️ AVISO LEGAL IMPORTANTE
        </p>
        <p className="text-xs text-red-300 mt-2">
          Esta aceptación será registrada en el sistema como válida legalmente. 
          El proveedor será notificado inmediatamente y procederá según lo acordado.
        </p>
      </div>
      
      {/* Total */}
      <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
        <p className="text-xs text-gh-text-muted">Total Inversión Año 1:</p>
        <p className="text-lg font-bold text-green-400">${totalAno1.toLocaleString()}</p>
      </div>
    </div>
  }
  confirmButtonText="SÍ, ACEPTO"
  cancelButtonText="Cancelar"
  confirmButtonColor="green"
  onConfirm={() => handleClienteResponde('ACEPTADA')}
  maxHeight="80vh"
/>
```

**DialogoClienteRechazar.tsx:**

```tsx
<DialogoGenericoDinamico
  isOpen={showRechazarDialog}
  onClose={() => setShowRechazarDialog(false)}
  title="Rechazar Cotización"
  description="¿Deseas RECHAZAR esta propuesta?"
  type="warning"
  variant="premium"
  contentType="custom"
  content={
    <div className="space-y-4">
      {/* Campo de razones */}
      <div>
        <label className="block text-xs font-semibold text-gh-text mb-2">
          ¿Por qué rechazas esta cotización? (Obligatorio)
        </label>
        <textarea
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
          placeholder="Ejemplo: El precio está muy alto, necesito menores costos, etc."
          className="w-full h-24 p-2 bg-gh-bg-secondary text-gh-text border border-gh-border rounded-lg text-xs focus:outline-none focus:border-red-500"
          required
        />
        <p className="text-xs text-gh-text-muted mt-1">
          Mínimo 10 caracteres
        </p>
      </div>
      
      {/* Aviso legal */}
      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
        <p className="text-xs text-red-400 font-semibold">
          ⚠️ AVISO IMPORTANTE
        </p>
        <p className="text-xs text-red-300 mt-2">
          Este rechazo será registrado en el sistema como una acción formal 
          y notificado inmediatamente al proveedor.
        </p>
      </div>
    </div>
  }
  confirmButtonText="Enviar Rechazo"
  cancelButtonText="Cancelar"
  confirmButtonColor="red"
  onConfirm={() => handleClienteResponde('RECHAZADA', motivoRechazo)}
  confirmDisabled={motivoRechazo.length < 10}
  maxHeight="80vh"
/>
```

**DialogoClienteProponer.tsx:**

```tsx
<DialogoGenericoDinamico
  isOpen={showProponerDialog}
  onClose={() => setShowProponerDialog(false)}
  title="Proponer Modificaciones"
  description="¿Qué cambios deseas proponer a esta cotización?"
  type="info"
  variant="premium"
  contentType="custom"
  content={
    <div className="space-y-4">
      {/* Campo de sugerencias */}
      <div>
        <label className="block text-xs font-semibold text-gh-text mb-2">
          Describe los cambios que deseas proponer (Obligatorio)
        </label>
        <textarea
          value={sugerencias}
          onChange={(e) => setSugerencias(e.target.value)}
          placeholder="Ejemplo: Necesitamos agregar módulo de reportes, reducir el costo del hosting, incluir capacitación, etc."
          className="w-full h-24 p-2 bg-gh-bg-secondary text-gh-text border border-gh-border rounded-lg text-xs focus:outline-none focus:border-blue-500"
          required
        />
        <p className="text-xs text-gh-text-muted mt-1">
          Mínimo 10 caracteres | Máximo 1000 caracteres
        </p>
      </div>
      
      {/* Aviso legal */}
      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
        <p className="text-xs text-blue-400 font-semibold">
          💡 INFORMACIÓN
        </p>
        <p className="text-xs text-blue-300 mt-2">
          Tus sugerencias serán registradas en el sistema como una propuesta formal 
          y notificadas al proveedor. Él tendrá la oportunidad de revisar y responder 
          a tus cambios propuestos.
        </p>
      </div>
    </div>
  }
  confirmButtonText="Enviar Sugerencias"
  cancelButtonText="Cancelar"
  confirmButtonColor="blue"
  onConfirm={() => handleClienteResponde('NUEVA_PROPUESTA', sugerencias)}
  confirmDisabled={sugerencias.length < 10}
  maxHeight="80vh"
/>
```

### 4. Página de Expiración

**Ubicación:** `src/app/cotizacion-expirada/page.tsx`

**Similar a:** `src/app/sin-cotizacion/page.tsx`

**Contenido:**

```tsx
// Header: Reloj y mensaje
"⏰ TIEMPO EXPIRADO"
"Tu tiempo para estudiar esta propuesta de cotización ha llegado a su fin."

// Información
- Cotización número: XXX
- Fecha de vencimiento: DD/MM/YYYY
- Días disponibles: 7

// Opciones (3 botones)
1. "🕐 Solicitar Extensión 24h"
   - Abre DialogoExtension.tsx
   - Envía notificación al proveedor
   
2. "✅ Aceptar igual la cotización"
   - Abre DialogoClienteAceptar.tsx
   - Pero registra que fue aceptada EXPIRADA
   
3. "🚪 Salir"
   - Redirige a página de error genérica
   - O a página de inicio
```

---

## 🔔 Sistema de Notificaciones

### 1. Dropdown en UserProfileMenu

**Ubicación:** `src/components/UserProfileMenu.tsx`

**Cambios:**

```tsx
// Agregar opción en dropdown
<div className="relative">
  <button 
    className="relative px-3 py-2 text-sm"
    onClick={() => setShowNotifications(!showNotifications)}
  >
    🔔 Notificaciones
    {unreadCount > 0 && (
      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
        {unreadCount}
      </span>
    )}
  </button>
  
  {showNotifications && <NotificacionesPanel />}
</div>
```

### 2. Componente `NotificacionesPanel.tsx`

**Ubicación:** `src/features/admin/components/NotificacionesPanel.tsx`

**Funcionalidad:**

```tsx
interface NotificacionesPanelProps {
  onClose: () => void
}

export function NotificacionesPanel({ onClose }: NotificacionesPanelProps) {
  const [notificaciones, setNotificaciones] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  
  // Cargar notificaciones del usuario
  useEffect(() => {
    fetchNotificaciones()
    // Poll cada 10 segundos
    const interval = setInterval(fetchNotificaciones, 10000)
    return () => clearInterval(interval)
  }, [])
  
  const handleClickNotification = (notif: Notification) => {
    // Marcar como leída
    markAsRead(notif.id)
    // Mostrar detalle
    showDialogoDetalle(notif)
  }
  
  return (
    <DialogoGenericoDinamico
      isOpen={true}
      onClose={onClose}
      title="Centro de Notificaciones"
      description={`Tienes ${notificaciones.filter(n => !n.leida).length} notificaciones sin leer`}
      contentType="custom"
      content={
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notificaciones.length === 0 ? (
            <p className="text-center text-gh-text-muted py-4">Sin notificaciones</p>
          ) : (
            notificaciones.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleClickNotification(notif)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  notif.leida 
                    ? 'bg-gh-bg-secondary border-gh-border' 
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <p className="font-medium text-sm text-gh-text">{notif.titulo}</p>
                <p className="text-[11px] text-gh-text-muted mt-1">{notif.descripcion}</p>
                <p className="text-[10px] text-gh-text-muted mt-1">
                  {new Date(notif.createdAt).toLocaleDateString('es-CO')}
                </p>
                <p className="text-[10px] text-blue-400 mt-1">
                  👆 Haz clic para más detalles
                </p>
              </div>
            ))
          )}
        </div>
      }
      type="info"
      variant="premium"
      maxHeight="80vh"
    />
  )
}
```

### 3. Dialogo de Detalle de Notificación

**DialogoNotificacionDetalle.tsx:**

```tsx
interface DialogoNotificacionDetalleProps {
  notificacion: Notification
  clientResponse?: ClientResponse
}

// Mostrar:
// - Título
// - Tipo (Aceptación/Rechazo/Propuesta)
// - Nombre del cliente
// - Email del cliente
// - Fecha de respuesta
// - MENSAJE COMPLETO del cliente (textarea read-only)
// - Botones de acción contextuales:
//   Si RECHAZO: [Ver Cotización] [Enviar Nueva Versión]
//   Si PROPUESTA: [Ver Cotización] [Aceptar Cambios] [Rechazar Sugerencias]
//   Si ACEPTACIÓN: [Ver Cotización] [Descargar Confirmación]
```

---

## 📤 Endpoints API Necesarios

### 1. PATCH `/api/quotations/[id]/state`

**Existente, ampliar funcionalidad:**

```typescript
// Request
{
  nuevoEstado: QuotationState
}

// Response
{
  success: boolean
  data: {
    id: string
    estado: QuotationState
    estadoAnterior: QuotationState
    cambiadoEn: DateTime
    diasRestantes?: number
  }
}

// Cambios:
// - Validar transiciones de estado
// - Cuando ACTIVA → registrar activadoEn
// - Cuando INACTIVA → registrar inactivadoEn
// - Registrar en AuditLog
```

### 2. POST `/api/quotations/[id]/client-response`

**Nuevo endpoint para respuestas del cliente:**

```typescript
// Request
{
  responseType: "ACEPTADA" | "RECHAZADA" | "NUEVA_PROPUESTA"
  mensaje?: string  // Para rechazo y propuesta
}

// Response
{
  success: boolean
  data: {
    id: string
    quotationConfigId: string
    responseType: string
    respondidoEn: DateTime
    clientName: string
    clientEmail: string
  }
  notificationsCreated: number
}

// Acciones:
// 1. Crear ClientResponse
// 2. Actualizar QuotationConfig.estado
// 3. Actualizar QuotationConfig.respondidoEn
// 4. Crear notificaciones para:
//    - Usuario que creó la cotización
//    - Todos los usuarios con rol > del creador
// 5. Registrar en AuditLog
// 6. Enviar email/webhook al proveedor
```

### 3. POST `/api/quotations/[id]/request-extension`

**Solicitud de prórroga del cliente:**

```typescript
// Request
{
  diasSolicitados: number  // Normalmente 1-7
  razon?: string
}

// Response
{
  success: boolean
  data: {
    id: string
    nuevoVencimiento: DateTime
    diasAprobados: number
  }
}

// Acciones:
// 1. Crear notificación para proveedor
// 2. Registrar en AuditLog (CLIENT_REQUEST_EXTENSION)
// 3. Opcionalmente: auto-aprobar si es <= 7 días
// 4. O requerir aprobación manual del proveedor
```

### 4. GET `/api/notifications/user`

**Obtener notificaciones del usuario actual:**

```typescript
// Query params
?unreadOnly=true  // opcional

// Response
{
  success: boolean
  data: Notification[]
  unreadCount: number
}
```

### 5. PATCH `/api/notifications/[id]/mark-as-read`

**Marcar notificación como leída:**

```typescript
// Response
{
  success: boolean
  data: {
    id: string
    leida: boolean
    leidoEn: DateTime
  }
}
```

### 6. GET `/api/quotations/[id]/client-response`

**Obtener respuesta del cliente:**

```typescript
// Response
{
  success: boolean
  data: ClientResponse | null
}
```

---

---

## 🚀 FASE 3 - SOLICITUD DE EXTENSIÓN + OPTIMIZACIONES

---

### Fase 3 - Resumen Ejecutivo

**Objetivo:** Completar el flujo de cotizaciones con:
1. **Integración de respuesta de clientes** en página pública (botones + dialogs visibles)
2. **Rediseño BadgeContadorDias** con Fluent Design 2 (glasmorphism + animaciones)
3. **Nueva página de solicitud de extensión** con UX de procesamiento → aprobación
4. **Optimizaciones de performance** con Zustand caching + pagination

**Componentes a Crear:** 
- 3 dialogs nuevos (DialogoClienteAceptar, Rechazar, Proponer)
- 1 página nueva (/solicitar-extension)
- 1 Zustand store (quotationConfigStore)

**Tiempo Estimado:** 10-12 horas en 4 etapas
**Estado:** Plan diseñado, listo para implementación

---

### Componentes a Crear - Fase 3

#### 1. DialogoClienteAceptar.tsx
- **Ubicación:** `/src/features/public/components/DialogoClienteAceptar.tsx`
- **Props:** `isOpen`, `quotationId`, `quotationNumber`, `onClose`, `onSubmit`, `isLoading`
- **Campos:** Nombre cliente, Email cliente
- **Validación:** Ambos campos obligatorios
- **API:** POST `/api/quotations/[id]/client-response` con `responseType: 'ACEPTADA'`
- **Estados:** DEFAULT → LOADING → SUCCESS/ERROR
- **Diseño:** DialogoGenericoDinamico con colores GitHub Dark

#### 2. DialogoClienteRechazar.tsx
- **Ubicación:** `/src/features/public/components/DialogoClienteRechazar.tsx`
- **Campos adicionales:** Textarea para razón del rechazo
- **Validación:** Nombre, email, razón (mín 10 chars, máx 500)
- **API:** POST con `responseType: 'RECHAZADA'`, `mensaje: razón`
- **Diseño:** Similar estructura, colores de alerta (rojo)

#### 3. DialogoClienteProponer.tsx
- **Ubicación:** `/src/features/public/components/DialogoClienteProponer.tsx`
- **Campos adicionales:** Textarea para sugerencias
- **Validación:** Nombre, email, sugerencias (mín 10 chars, máx 1000)
- **API:** POST con `responseType: 'NUEVA_PROPUESTA'`, `mensaje: sugerencias`
- **Diseño:** Similar estructura, colores informativos (azul)

#### 4. SolicitarExtensionPage (/solicitar-extension/page.tsx)
- **Ubicación:** `/src/app/solicitar-extension/page.tsx`
- **Query Params:** `?quotationId=...&quotationNumber=...`
- **Funcionalidad:** Polling cada 5 segundos a GET `/api/quotations/[id]/extension-status`
- **Estados Visuales:**
  - PENDIENTE: "⏳ Solicitud en procesamiento..."
  - APROBADA: "✅ El proveedor le ha concedido 24 horas extras"
  - RECHAZADA: "❌ Solicitud rechazada"
- **UX:** Dialog basado en `DialogoGenericoDinamico`
- **Acciones:** Volver a cotización (si aprobada), Cerrar (si rechazada)

#### 5. quotationConfigStore (Zustand Store - NUEVO)
- **Ubicación:** `/src/stores/quotationConfigStore.ts`
- **Propósito:** Cache de configuración de cotización para evitar re-fetches
- **Selectors:** `config`, `isLoading`, `errors`
- **Actions:** `loadQuotationConfig()`, `setConfig()`, `clearConfig()`
- **Patrón:** Sigue modelo existente de `servicesStore` (13 stores ya implementados)
- **Beneficio:** Reduce requests a `/api/quotation-config` al cambiar entre páginas

---

### Integración en page.tsx

**Ubicación:** `/src/app/page.tsx`

**Cambios necesarios:**

```typescript
'use client'

// NUEVO: Importar dialogs
import ClientResponseButtons from '@/features/public/components/ClientResponseButtons'
import DialogoClienteAceptar from '@/features/public/components/DialogoClienteAceptar'
import DialogoClienteRechazar from '@/features/public/components/DialogoClienteRechazar'
import DialogoClienteProponer from '@/features/public/components/DialogoClienteProponer'

// NUEVO: Estados para dialogs (local UI state - CORRECTO)
const [dialogoAceptarOpen, setDialogoAceptarOpen] = useState(false)
const [dialogoRechazarOpen, setDialogoRechazarOpen] = useState(false)
const [dialogoProponeOpen, setDialogoProponeOpen] = useState(false)
const [enviando, setEnviando] = useState(false)

// NUEVO: Handlers para cada tipo de respuesta
const handleAceptar = async (name: string, email: string) => {
  setEnviando(true)
  try {
    const res = await fetch(`/api/quotations/${quotationId}/client-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responseType: 'ACEPTADA',
        clientName: name,
        clientEmail: email,
        mensaje: ''
      })
    })
    if (!res.ok) throw new Error('Error al aceptar')
    toast.success('✅ Cotización aceptada')
    setDialogoAceptarOpen(false)
    window.location.href = '/cotizacion-aceptada'
  } catch (error) {
    toast.error('❌ Error: ' + error.message)
  } finally {
    setEnviando(false)
  }
}

const handleRechazar = async (name: string, email: string, razon: string) => {
  // Similar estructura, post a mismo endpoint con:
  // responseType: 'RECHAZADA', mensaje: razon
}

const handleProponer = async (name: string, email: string, sugerencias: string) => {
  // Similar estructura, post a mismo endpoint con:
  // responseType: 'NUEVA_PROPUESTA', mensaje: sugerencias
}

// En JSX: Renderizar ClientResponseButtons + todos los dialogs
```

**Estructura visual en página:**

```
┌─────────────────────────────────────────┐
│ CONTENIDO COTIZACIÓN                    │
│                              ┌─────────┐│
│                              │BadgeCD  ││ ← BadgeContadorDias
│                              │(arriba) ││
│                              │ ┌─────┐ ││
│                              │ │Acep.│ ││ ← ClientResponseButtons (3 botones)
│                              │ │Rech.│ ││
│                              │ │Prop.│ ││
│                              └─────────┘│
└─────────────────────────────────────────┘
```

---

### BadgeContadorDias - Rediseño Fluent Design 2

**Cambios en estilo:**

**ANTES (Tailwind básico):**
```typescript
className="bg-gh-bg-secondary border-2 shadow-lg backdrop-blur-md"
// Colores: green-400, cyan-400, amber-400, red-400
```

**DESPUÉS (Fluent Design 2):**
```typescript
// Paleta Fluent Design 2
const fluentColors = {
  green: '#107C10',      // > 90% días (Normal)
  teal: '#00B050',       // 50-89% días (Confortable)
  amber: '#FFB900',      // 30-49% días (Precaución)
  red: '#E81123',        // 1-29% días (Crítico)
  gray: '#5A5A5A'        // 0% (Expirado)
}

// Características Fluent Design 2:
// ✅ Glassmorphism: backdrop-blur-xl + rgba transparency
// ✅ Bordes: 1px sólido con efecto glow
// ✅ Sombras: Multi-capa para elevación visual
// ✅ Animaciones: 250ms ease-in-out en todas las transiciones
// ✅ Hover effects: scale-105% para interactividad
// ✅ Barra progreso: Con efecto glow dinámico
// ✅ Formato mejorado: "3 DÍAS 14:32:15" (elegante)
```

**Formato de tiempo mejorado:**
- Si > 1 día: "D DÍAS HH:MM:SS" (Ej: "3 DÍAS 14:32:15")
- Si = 1 día: "24 HORAS MM:SS" (Ej: "24 HORAS 45:30")
- Si < 24 horas: "HH:MM:SS" (Ej: "05:45:30")
- Si = 0: "EXPIRADO"

---

### Página Solicitar Extensión

**Ubicación:** `/src/app/solicitar-extension/page.tsx`

**UX Flow - 3 Estados:**

**ETAPA 1: Solicitud Pendiente (Inmediata)**
```
┌──────────────────────────────────────────┐
│        ⏳ SOLICITUD EN PROCESAMIENTO      │
│                                          │
│  Su solicitud de extensión (24 horas)   │
│  está siendo revisada por el proveedor.  │
│                                          │
│  • Cotización #: CZN-2025-001234        │
│  • Solicitado: 21 Dic 2025 - 14:30      │
│  • Extensión: 24 horas                   │
│  • Tiempo típico: 10-30 min              │
│                                          │
│  [↻ Recargar Estado]  [Volver]          │
└──────────────────────────────────────────┘
```

**ETAPA 2: Aprobada (Después de polling)**
```
┌──────────────────────────────────────────┐
│        ✅ EXTENSIÓN CONCEDIDA            │
│                                          │
│  El proveedor le ha concedido 24 horas  │
│  adicionales para aceptar la cotización. │
│                                          │
│  • Nuevo vencimiento: 22 Dic 2025       │
│  • Aprobado: 21 Dic 2025 - 14:45        │
│                                          │
│  ✨ ¡Ahora puede revisarla sin prisa!   │
│                                          │
│  [Ir a la Cotización]  [Cerrar]         │
└──────────────────────────────────────────┘
```

**ETAPA 3: Rechazada**
```
┌──────────────────────────────────────────┐
│        ❌ SOLICITUD RECHAZADA            │
│                                          │
│  El proveedor no pudo conceder extensión│
│                                          │
│  • Razón: "La cotización está           │
│    comprometida con otro cliente"       │
│  • Fecha: 21 Dic 2025 - 14:50          │
│                                          │
│  [Contactar Proveedor]  [Cerrar]        │
└──────────────────────────────────────────┘
```

**Implementación técnica:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DialogoGenericoDinamico from '@/features/public/components/DialogoGenericoDinamico'

type ExtensionStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'

export default function SolicitarExtensionPage() {
  const searchParams = useSearchParams()
  const quotationId = searchParams.get('quotationId')
  const quotationNumber = searchParams.get('quotationNumber')

  const [status, setStatus] = useState<ExtensionStatus>('PENDIENTE')
  const [extensionData, setExtensionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Polling cada 5 segundos
  useEffect(() => {
    if (!quotationId) return

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/quotations/${quotationId}/extension-status`,
          { cache: 'no-store' }
        )
        if (!res.ok) throw new Error('Error verificando estado')

        const data = await res.json()
        setExtensionData(data)
        setStatus(data.status)
        setIsLoading(false)

        // Detener polling si está resuelto
        return data.status !== 'PENDIENTE'
      } catch (error) {
        console.error('Error:', error)
      }
    }

    // Verificación inmediata
    checkStatus()

    // Polling cada 5 segundos
    const interval = setInterval(async () => {
      const shouldStop = await checkStatus()
      if (shouldStop) clearInterval(interval)
    }, 5000)

    return () => clearInterval(interval)
  }, [quotationId])

  // Renderizar según estado
  return (
    <DialogoGenericoDinamico
      isOpen={true}
      showCloseButton={status !== 'PENDIENTE'}
      titulo={
        status === 'PENDIENTE'
          ? '⏳ Solicitud en procesamiento'
          : status === 'APROBADA'
          ? '✅ Extensión concedida'
          : '❌ Solicitud rechazada'
      }
      primaryButtonText={status === 'APROBADA' ? 'Ir a la Cotización' : 'Cerrar'}
      onPrimaryAction={
        status === 'APROBADA'
          ? () => (window.location.href = `/cotizacion/${quotationId}`)
          : undefined
      }
    >
      {/* Contenido dinámico según status */}
      {status === 'PENDIENTE' && <ContenidoPendiente data={extensionData} />}
      {status === 'APROBADA' && <ContenidoAprobada data={extensionData} />}
      {status === 'RECHAZADA' && <ContenidoRechazada data={extensionData} />}
    </DialogoGenericoDinamico>
  )
}
```

---

### Nuevos Endpoints API - Fase 3

#### GET `/api/quotations/[id]/extension-status` (NUEVO)

**Propósito:** Obtener estado actual de solicitud de extensión

**Query Params:** Ninguno

**Response (200):**
```json
{
  "status": "PENDIENTE" | "APROBADA" | "RECHAZADA",
  "quotationId": "czn_xxx",
  "quotationNumber": "CZN-2025-001234",
  "createdAt": "2025-12-21T14:30:00Z",
  "aprobadoEn": "2025-12-21T14:45:00Z",
  "rechazadoEn": null,
  "razonRechazo": null,
  "nuevoVencimiento": "2025-12-22T14:30:00Z",
  "extensionHoras": 24
}
```

**Implementación:**

```typescript
// src/app/api/quotations/[id]/extension-status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar solicitud de extensión más reciente
    const extensionRequest = await prisma.extensionRequest.findFirst({
      where: { quotationConfigId: params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        quotationConfig: {
          select: { id: true, quotationNumber: true }
        }
      }
    })

    if (!extensionRequest) {
      return NextResponse.json(
        { error: 'No se encontró solicitud de extensión' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: extensionRequest.status,
      quotationId: extensionRequest.quotationConfigId,
      quotationNumber: extensionRequest.quotationConfig.quotationNumber,
      createdAt: extensionRequest.createdAt.toISOString(),
      aprobadoEn: extensionRequest.approvedAt?.toISOString() || null,
      rechazadoEn: extensionRequest.rejectedAt?.toISOString() || null,
      razonRechazo: extensionRequest.rejectionReason || null,
      nuevoVencimiento: extensionRequest.newDueDate?.toISOString() || null,
      extensionHoras: extensionRequest.extensionHours || 24
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estado' },
      { status: 500 }
    )
  }
}
```

---

### Optimización Performance

#### /api/snapshots - 3 Cambios

**Estado actual:** 1955ms de latencia

**CAMBIO 1: Agregar Pagination**
```typescript
// Query: GET /api/snapshots?limit=50&offset=0
// Response incluir: { data: [], total: 234, hasMore: true }
```

**CAMBIO 2: Zustand Store para Cache**
```typescript
// Usar quotationConfigStore
// Primera carga: Fetch desde API
// Siguientes: Servir desde store en memoria
// Reduce re-fetches al cambiar páginas
```

**CAMBIO 3: Implementar ISR (Incremental Static Regeneration)**
```typescript
// En route.ts:
export const revalidate = 3600 // 1 hora de caché
```

**Resultado esperado:** 1955ms → < 500ms

---

### Checklist Implementación Fase 3

**ETAPA 0: Fixing Publication Flow (Blocking Issue) (15 min)** ⚠️ MUST DO FIRST
- [x] Wire "Publicar" button in Historial.tsx with useChangeQuotationState
- [x] Add state validation in page.tsx to redirect non-published quotations
- [x] Update `/api/quotations/[id]/state` endpoint to save `estado` field to DB
- [x] Add handler with feedback and data refresh in Historial.tsx
- [ ] Test end-to-end: Admin publishes → Client sees buttons
- [ ] Verify Prisma migrations applied correctly
- [ ] Monitor logs for any state change errors

**ETAPA 1: Dialogs + Integración (3-4 horas)**
- [x] Crear DialogoClienteAceptar.tsx
- [x] Crear DialogoClienteRechazar.tsx
- [x] Crear DialogoProponer.tsx
- [x] Importar ClientResponseButtons en page.tsx
- [x] Agregar estado de dialogs con useState
- [x] Conectar handlers a POST /api/quotations/[id]/client-response
- [x] Implementar validación de formularios
- [x] Testing básico de cada dialog
- [x] Verificar redirección post-respuesta

**ETAPA 2: BadgeContadorDias Redesign (2-3 horas)**
- [x] Actualizar colores a paleta Fluent Design 2
- [x] Implementar glassmorphism (backdrop-blur-xl)
- [x] Agregar animaciones suaves (250ms ease-in-out)
- [x] Mejorar formato de tiempo dinámico
- [x] Agregar barra de progreso con glow
- [ ] Testing en diferentes resoluciones (mobile/tablet/desktop)
- [ ] Verificar performance (no lag en actualización)

**ETAPA 3: Página Solicitud Extensión (2-3 horas)**
- [ ] Crear /src/app/solicitar-extension/page.tsx
- [ ] Implementar polling cada 5 segundos
- [ ] Crear 3 componentes de contenido (Pendiente, Aprobada, Rechazada)
- [ ] Crear endpoint GET /api/quotations/[id]/extension-status
- [ ] Implementar cambios de estado visuales
- [ ] Testing de flujos completos (PENDIENTE → APROBADA/RECHAZADA)
- [ ] Verificar redirecciones correctas

**ETAPA 4: Performance (Zustand + Caching) (3-4 horas)**
- [ ] Crear quotationConfigStore en /src/stores/
- [ ] Implementar persistencia con localStorage (opcional)
- [ ] Integrar en page.tsx para cargar config
- [ ] Agregar pagination a /api/snapshots
- [ ] Implementar ISR (revalidate: 3600)
- [ ] Testing de performance con lighthouse
- [ ] Verificar que snapshots < 500ms
- [ ] Eliminar N+1 queries en snapshots

---

### Validación Fase 3

**Criterios de Aceptación:**

1. ✅ Botones de respuesta visibles en página pública
2. ✅ Cada dialog abre, valida correctamente y envía a API
3. ✅ Badge tiene diseño Fluent Design 2 completo
4. ✅ Animaciones suaves en badge (sin lag)
5. ✅ Página solicitud extensión funcional
6. ✅ Polling detecta cambio de estado en tiempo real
7. ✅ `/api/snapshots` performance < 500ms (optimizado)
8. ✅ Todo coherente con GitHub Dark Theme
9. ✅ Responsive en mobile/tablet/desktop
10. ✅ TypeScript sin errores (build limpio)
11. ✅ Build sin warnings
12. ✅ Testing funcional de todos los flujos

---

---

## 📄 Exportación PDF Profesional

### 0. Estructura General (2 Documentos)

El PDF exportado estará **dividido en 2 secciones distintas**:

**DOCUMENTO PRINCIPAL:** Páginas 1-N
- Contiene toda la información técnica, comercial y legal
- Formato: CARTA Vertical
- Todas las secciones EXCEPTO "PAQUETES CONFIGURADOS"

**ANEXO ÚNICO:** Página N+1 en adelante
- Contiene SOLO la sección "PAQUETES CONFIGURADOS (Con todos los detalles)"
- Mismo formato CARTA Vertical
- Puede ocupar múltiples páginas si hay muchos paquetes
- Header diferenciado: "ANEXO ÚNICO - DETALLE DE PAQUETES"
- Numeración: "Anexo Pág. 1/X", "Anexo Pág. 2/X", etc.

**Archivo descargado:**
```
Cotizacion_COT-2025-001_2025-12-21.pdf
├─ Documento Principal (Páginas 1-4)
│  ├─ Header
│  ├─ Información Cliente/Proveedor
│  ├─ Resumen Ejecutivo
│  ├─ Opciones de Pago
│  ├─ Términos y Condiciones
│  ├─ Secciones Dinámicas (Análisis, Cronograma, etc.)
│  └─ Footer con números de página
│
└─ Anexo Único (Páginas 5-X)
   ├─ Header: "ANEXO ÚNICO - DETALLE DE PAQUETES"
   ├─ Paquete 1 (páginas enteras si es necesario)
   ├─ Paquete 2
   ├─ Paquete N
   └─ Footer con números de página (Anexo)
```

### 1. Estructura del Documento Principal

**Formato:** CARTA Vertical, Márgenes: 1cm, Páginas 1-4 aprox.

**Contenido:**

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (Página 1)                                       │
├─────────────────────────────────────────────────────────┤
│ Logo + Título: "PROPUESTA DE COTIZACIÓN"                │
│ Número: COT-2025-001 | Fecha: 21/12/2025                │
│ Validez: 7 días (Hasta: 28/12/2025)                     │
│ Profesional: Juan Pérez | Empresa: Tech Solutions       │
├─────────────────────────────────────────────────────────┤
│ INFORMACIÓN CLIENTE                                     │
│ Empresa: Acme Corp.                                     │
│ Sector: Tecnología                                      │
│ Ubicación: Bogotá, Colombia                             │
│ Email: info@acme.com | WhatsApp: +57 300 123 4567       │
├─────────────────────────────────────────────────────────┤
│ INFORMACIÓN PROVEEDOR                                   │
│ Empresa: Tech Solutions SAS                             │
│ Email: contacto@tech.com | WhatsApp: +57 320 987 6543   │
│ Ubicación: Bogotá                                       │
├─────────────────────────────────────────────────────────┤
│ HERO / RESUMEN EJECUTIVO (Página 1-2)                   │
│ [Contenido HTML generado del contenidoGeneral]          │
│ [Máximo 1-2 páginas de contenido introductorio]         │
├─────────────────────────────────────────────────────────┤
│ OPCIONES DE PAGO (Página 2)                             │
│ ├─ Tarjeta de Crédito (3 cuotas)                        │
│ ├─ Transferencia Bancaria (5% descuento)                │
│ └─ PayPal (pago único)                                  │
│ Notas de Pago:                                          │
│ "Aceptamos pagos parciales. Primer 50% al iniciar..."  │
├─────────────────────────────────────────────────────────┤
│ TÉRMINOS Y CONDICIONES (Página 2-3)                     │
│ Validez: Esta cotización es válida por 7 días           │
│ Tiempo de Entrega: 30 días desde confirmación           │
│ Política de Cancelación: Reembolso 100% antes de día 5  │
│ [Contenido completo de términos_condiciones]            │
├─────────────────────────────────────────────────────────┤
│ SECCIONES DINÁMICAS (Página 3-4, según disponibilidad)  │
│ ├─ Análisis de Requisitos                               │
│ ├─ Dinámico vs Estático                                 │
│ ├─ Tabla Comparativa                                    │
│ ├─ Cronograma                                           │
│ ├─ Fortalezas del Proyecto                              │
│ ├─ Garantías                                            │
│ ├─ FAQ                                                  │
│ └─ Observaciones y Recomendaciones                      │
├─────────────────────────────────────────────────────────┤
│ REFERENCIA AL ANEXO ÚNICO (Página 4, final)             │
│ "El detalle completo de los paquetes configurados se    │
│  encuentra en el ANEXO ÚNICO al final de este           │
│  documento. Cada paquete incluye información detallada  │
│  de servicios base, opcionales y costos asociados."     │
├─────────────────────────────────────────────────────────┤
│ FOOTER (Todas las páginas del principal)                │
│ 🔒 Documento generado el: 21/12/2025 14:30:00           │
│ Hash SHA256: a1b2c3d4e5f6g7h8i9j0...                    │
│ Versión: 1 │ Cotización ID: COT-XXX                     │
│ Página X de Y | Cotización ID: COT-XXX                  │
└─────────────────────────────────────────────────────────┘
```

### 2. Estructura del Anexo Único

**Formato:** CARTA Vertical, Márgenes: 1cm, Páginas 5 en adelante

**Header del Anexo (en cada página):**
```
┌─────────────────────────────────────────────────────────┐
│ ANEXO ÚNICO - DETALLE DE PAQUETES                       │
│ Cotización: COT-2025-001 | Cliente: Acme Corp.          │
│ Página: Anexo 1/3                                       │
└─────────────────────────────────────────────────────────┘
```

**Contenido (por cada paquete):**
```
┌─────────────────────────────────────────────────────────┐
│ PAQUETE 1: PROFESIONAL                                  │
│ ═══════════════════════════════════════════════════════ │
│                                                         │
│ Descripción: Para empresas en crecimiento               │
│ Tipo: Mensual                                           │
│ Emoji: 💻                                               │
│                                                         │
│ ┌─ SERVICIOS BASE ─────────────────────────────────┐   │
│ │ Desarrollo......................... $1,500.00    │   │
│ │ Diseño.............................. $800.00    │   │
│ │ Hosting.............................. $200.00    │   │
│ │ ────────────────────────────────────────────────│   │
│ │ Subtotal Servicios Base........... $2,500.00    │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ SERVICIOS OPCIONALES ───────────────────────────┐   │
│ │ ☑ SEO Avanzado..................... +$500.00    │   │
│ │ ☑ Blog.............................. +$300.00    │   │
│ │ ☐ Panel Admin....................... +$400.00    │   │
│ │ ────────────────────────────────────────────────│   │
│ │ Subtotal Servicios Opcionales... $800.00       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ DESCUENTOS APLICADOS ───────────────────────────┐   │
│ │ Descuento General (10%)........... -$400.00     │   │
│ │ Descuento Pago Único (5%)......... -$185.00     │   │
│ │ ────────────────────────────────────────────────│   │
│ │ Total Descuentos.................. -$585.00     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ COSTOS TOTALES (RESUMEN) ────────────────────────┐  │
│ │ MES 1:        $2,715.00                         │  │
│ │ AÑO 1 (meses 2-12): $2,800.00/mes               │  │
│ │ AÑO 2+:       $2,500.00/mes                     │  │
│ │                                                 │  │
│ │ TOTAL INVERSIÓN AÑO 1:      $35,315.00          │  │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Notas específicas del paquete:                         │
│ • Incluye hosting compartido con SSL                  │
│ • Soporte por email durante 1 año                     │
│ • Hasta 2 rondas de revisión incluidas                │
│                                                         │
│ [Repetir para cada paquete en el Anexo]               │
└─────────────────────────────────────────────────────────┘
```

### 3. Librería y Estructura Técnica

**Opción A: jsPDF + html2canvas (Recomendado)**
```typescript
// Ventaja: Preserva estilos CSS, diseño visual exacto
// Librería: jspdf, html2canvas
// Archivo: src/lib/exporters/quotationPdfExporter.ts

export async function generateQuotationPDF(
  quotation: QuotationConfig,
  snapshots: PackageSnapshot[],
  pageContent?: string
): Promise<Blob>
```

**Recomendación:** Usar jsPDF + html2canvas con división manual en 2 documentos internos dentro del mismo PDF.

### 4. Proceso de Generación (Actualizado)

```typescript
// src/lib/exporters/quotationPdfExporter.ts

export async function generateQuotationPDF(
  quotation: QuotationConfig,
  snapshots: PackageSnapshot[],
  pageContent?: string
): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageHeight = pdf.internal.pageSize.getHeight()
  const pageWidth = pdf.internal.pageSize.getWidth()
  
  // PARTE 1: DOCUMENTO PRINCIPAL
  // 1. Crear contenedor HTML con todo EXCEPTO paquetes
  const mainContainer = document.createElement('div')
  mainContainer.style.display = 'none'
  
  // Incluir: Header, Info Cliente, Info Proveedor, Hero, 
  // Pago, Términos, Secciones Dinámicas
  mainContainer.innerHTML = renderMainContent(quotation, pageContent)
  document.body.appendChild(mainContainer)
  
  // 2. Convertir a canvas
  const mainCanvas = await html2canvas(mainContainer, {
    scale: 2,
    useCORS: true,
    logging: false
  })
  
  // 3. Agregar al PDF (páginas 1-N)
  let position = 0
  let heightLeft = mainCanvas.height * pageWidth / mainCanvas.width
  
  const mainImg = mainCanvas.toDataURL('image/png')
  pdf.addImage(mainImg, 'PNG', 0, 0, pageWidth, heightLeft)
  heightLeft -= pageHeight
  
  while (heightLeft > 0) {
    position = heightLeft - mainCanvas.height * pageWidth / mainCanvas.width
    pdf.addPage()
    pdf.addImage(mainImg, 'PNG', 0, position, pageWidth, heightLeft)
    heightLeft -= pageHeight
  }
  
  // PARTE 2: ANEXO ÚNICO (Paquetes)
  // 4. Crear nueva página para el anexo
  pdf.addPage()
  let annexPageNumber = 1
  
  // 5. Para cada paquete, crear su sección
  for (const snapshot of snapshots) {
    const annexContainer = document.createElement('div')
    annexContainer.style.display = 'none'
    annexContainer.innerHTML = renderPackageContent(quotation, snapshot, annexPageNumber, snapshots.length)
    document.body.appendChild(annexContainer)
    
    const annexCanvas = await html2canvas(annexContainer, {
      scale: 2,
      useCORS: true,
      logging: false
    })
    
    // Agregar contenido del paquete
    let heightLeft = annexCanvas.height * pageWidth / annexCanvas.width
    const annexImg = annexCanvas.toDataURL('image/png')
    
    pdf.addImage(annexImg, 'PNG', 0, 0, pageWidth, heightLeft)
    heightLeft -= pageHeight
    
    while (heightLeft > 0) {
      position = heightLeft - annexCanvas.height * pageWidth / annexCanvas.width
      pdf.addPage()
      pdf.addImage(annexImg, 'PNG', 0, position, pageWidth, heightLeft)
      heightLeft -= pageHeight
    }
    
    annexPageNumber++
    document.body.removeChild(annexContainer)
  }
  
  // 6. Agregar metadata
  pdf.setProperties({
    title: `Cotización ${quotation.numero}`,
    subject: `Propuesta de Cotización - ${quotation.clienteName}`,
    author: quotation.createdBy,
    keywords: 'cotización, propuesta, presupuesto',
    creator: 'WebQuote Sistema'
  })
  
  // 7. Limpiar
  document.body.removeChild(mainContainer)
  
  // 8. Retornar como Blob
  return pdf.output('blob')
}

// Funciones helper para renderizar secciones
function renderMainContent(quotation, pageContent): string {
  return `
    <div style="width: 100%; font-family: Arial, sans-serif;">
      <!-- Header, Info Cliente, etc. -->
      ${pageContent}
      <!-- Referencia al anexo -->
      <hr />
      <p style="font-size: 11px; color: #666; margin-top: 20px;">
        <strong>Nota Importante:</strong> El detalle completo de los paquetes 
        configurados se encuentra en el ANEXO ÚNICO al final de este documento.
      </p>
    </div>
  `
}

function renderPackageContent(quotation, snapshot, pageNum, totalPages): string {
  return `
    <div style="width: 100%; font-family: Arial, sans-serif; page-break-after: always;">
      <header style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
        <h3>ANEXO ÚNICO - DETALLE DE PAQUETES</h3>
        <p style="font-size: 11px; color: #666;">
          Cotización: ${quotation.numero} | Cliente: ${quotation.clienteName} | 
          Página: Anexo ${pageNum}/${totalPages}
        </p>
      </header>
      
      <section>
        <h4>${snapshot.nombre}</h4>
        <p>${snapshot.descripcion}</p>
        <!-- Servicios Base, Opcionales, Descuentos, Costos -->
        ...
      </section>
    </div>
  `
}
```

### 5. Botón de Descarga (Actualizado)

**En Grid 3 (EXPORTAR):**

```tsx
<button
  onClick={() => handleDescargarPDF(quotation)}
  disabled={loadingPDF}
  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
  title="Descargar PDF (Documento + Anexo)"
>
  {loadingPDF ? '⏳ Generando...' : '📄 PDF'}
</button>

async function handleDescargarPDF(quotation: QuotationConfig) {
  try {
    setLoadingPDF(true)
    
    // 1. Obtener contenido de página pública
    const mainContent = document.querySelector('#quotation-public-content')?.innerHTML
    
    // 2. Obtener snapshots
    const snapshots = await fetchPackageSnapshots(quotation.id)
    
    // 3. Generar PDF con 2 secciones
    const blob = await generateQuotationPDF(quotation, snapshots, mainContent)
    
    // 4. Descargar
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Cotizacion_${quotation.numero}_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    
    // 5. Auditoría
    await logAudit({
      action: 'QUOTATION_PDF_EXPORTED',
      quotationId: quotation.id,
      details: { sections: ['main', 'annex_packages'] }
    })
    
    toast.success('✅ PDF descargado exitosamente')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al generar PDF'
    toast.error(`❌ ${message}`)
  } finally {
    setLoadingPDF(false)
  }
}
```

---

## 💬 Flujos de Interacción

### Flujo 1: Admin Publica Cotización

```
Admin en Historial.tsx
  ↓
Click Botón "Publicar" (si estado === CARGADA)
  ↓
DialogoGenericoDinamico: "¿Deseas publicar?"
  ↓
Click "Publicar"
  ↓
PATCH /api/quotations/[id]/state
  ├─ Validar transición: CARGADA → ACTIVA ✅
  ├─ Set: estado = ACTIVA
  ├─ Set: activadoEn = NOW
  ├─ Set: diasParaAceptar = tiempoValidez (7 días)
  ├─ Crear AuditLog: QUOTATION_STATE_CHANGED
  └─ WebSocket/SSE: notificar página pública
  ↓
Toast éxito
  ↓
UI actualiza: botones en Historial cambian
  ↓
Cliente ve cotización actualizada (estado = ACTIVA)
  ↓
Badge muestra: "7 DÍAS"
```

### Flujo 2: Cliente Acepta Cotización

```
Cliente en página pública
  ↓
Lee cotización
  ↓
Click botón circular ✅ verde (ACEPTAR)
  ↓
DialogoClienteAceptar abre
  ├─ Muestra resumen de paquetes
  ├─ Aviso legal en rojo
  └─ 2 botones: [Cancelar] [SÍ, ACEPTO]
  ↓
Click "SÍ, ACEPTO"
  ↓
POST /api/quotations/[id]/client-response
  ├─ Body: { responseType: "ACEPTADA", mensaje: null }
  ├─ Crear ClientResponse
  ├─ Set QuotationConfig.estado = ACEPTADA
  ├─ Set QuotationConfig.respondidoEn = NOW
  ├─ Crear Notifications para:
  │  ├─ Usuario que creó la cotización
  │  └─ Todos con rol > creator
  ├─ Crear AuditLog: CLIENT_RESPONSE_ACCEPTED
  └─ Response: success + notificationCount
  ↓
Toast: "✅ Cotización aceptada. El proveedor será notificado."
  ↓
UI: Deshabilitar botones, mostrar "ACEPTADA" con check
  ↓
Admin recibe notificación en dropdown 🔔
  │
  └─ Título: "El cliente Acme Corp. ha ACEPTADO tu cotización"
     Click: Abre DialogoNotificacionDetalle
        ├─ Muestra: Cliente, Fecha, Resumen
        └─ Botones: [Ver Cotización] [Descargar Confirmación]
```

### Flujo 3: Cliente Rechaza Cotización

```
Cliente en página pública
  ↓
Click botón circular ❌ rojo (RECHAZAR)
  ↓
DialogoClienteRechazar abre
  ├─ Textarea: "¿Por qué rechazas esta cotización?"
  ├─ Aviso legal
  └─ Botones: [Cancelar] [Enviar Rechazo]
  ↓
Escribe razones (ej: "El precio está muy alto")
  ↓
Click "Enviar Rechazo"
  ↓
POST /api/quotations/[id]/client-response
  ├─ Body: { responseType: "RECHAZADA", mensaje: "El precio está muy alto" }
  ├─ Crear ClientResponse
  ├─ Set QuotationConfig.estado = RECHAZADA
  ├─ Set QuotationConfig.respondidoEn = NOW
  ├─ Crear Notifications
  ├─ Crear AuditLog: CLIENT_RESPONSE_REJECTED
  └─ Response: success
  ↓
Toast: "Cotización rechazada. El proveedor recibirá tu feedback."
  ↓
Admin recibe notificación 🔔
  │
  └─ Título: "El cliente Acme Corp. ha RECHAZADO tu cotización"
     Click: Abre DialogoNotificacionDetalle
        ├─ Muestra razones del cliente
        └─ Botones: [Ver Cotización] [Enviar Nueva Versión]
```

### Flujo 4: Cliente Propone Cambios

```
Cliente → Click botón 💡 azul (PROPONER CAMBIOS)
  ↓
DialogoClienteProponer abre
  ├─ Textarea: "¿Qué cambios deseas proponer?"
  └─ Botones: [Cancelar] [Enviar Sugerencias]
  ↓
Escribe sugerencias
  ↓
POST /api/quotations/[id]/client-response
  ├─ responseType: "NUEVA_PROPUESTA"
  ├─ mensaje: texto del cliente
  ├─ Set estado = NUEVA_PROPUESTA
  └─ Crear Notifications
  ↓
Admin recibe notificación 🔔
  │
  └─ Titulo: "El cliente Acme Corp. propone MODIFICACIONES"
     Click: DialogoNotificacionDetalle
        ├─ Muestra sugerencias
        └─ Botones: [Aceptar Cambios] [Rechazar] [Ver Cotización]
```

### Flujo 5: Cotización Expira (Timeout)

```
Cliente recibe cotización
Badge: "7 DÍAS"
  ↓
Pasan 7 días sin respuesta
  ↓
Cron Job (ejecutar cada 1 hora):
  ├─ SELECT QuotationConfig WHERE estado = ACTIVA
  ├─ Verificar si NOW > (respondidoEn + diasParaAceptar)
  ├─ UPDATE estado = EXPIRADA
  ├─ UPDATE expiradoEn = NOW
  ├─ Crear AuditLog: CLIENT_QUOTATION_EXPIRED
  └─ Crear Notification para admin
  ↓
Cliente intenta acceder a página
  ↓
Página detecta estado = EXPIRADA
  ↓
Redirige a /cotizacion-expirada
  ↓
Muestra:
  ├─ "⏰ TIEMPO EXPIRADO"
  ├─ Descripción: "Tu tiempo para estudiar esta propuesta venció"
  ├─ 3 botones:
  │  ├─ "🕐 Solicitar Extensión 24h"
  │  │  ├─ POST /api/quotations/[id]/request-extension
  │  │  └─ Notificación al proveedor
  │  ├─ "✅ Aceptar igual"
  │  │  ├─ DialogoClienteAceptar (con aviso "EXPIRADA")
  │  │  └─ POST /api/quotations/[id]/client-response
  │  └─ "🚪 Salir"
  │     └─ Redirige a página inicio
```

---

## 📊 Auditoría y Logs

### Nuevas Acciones a Registrar

En `src/lib/audit/auditHelper.ts` agregar:

```typescript
export type AuditAction = 
  // ... existentes ...
  // Nuevas acciones de cliente
  | 'CLIENT_RESPONSE_ACCEPTED'        // Cliente acepta
  | 'CLIENT_RESPONSE_REJECTED'        // Cliente rechaza
  | 'CLIENT_RESPONSE_PROPOSED_CHANGES'// Cliente propone cambios
  | 'CLIENT_REQUEST_EXTENSION'        // Cliente solicita prórroga
  | 'CLIENT_QUOTATION_EXPIRED'        // Cotización expiró por timeout
  // Nuevas acciones de admin
  | 'ADMIN_RESPONSE_VIEWED'           // Admin visualiza respuesta
  | 'ADMIN_QUOTATION_RENOVATED'       // Admin renueva cotización expirada
  | 'QUOTATION_PDF_EXPORTED'          // Descarga PDF
  | 'QUOTATION_WORD_EXPORTED'         // Descarga Word
  | 'QUOTATION_EXCEL_EXPORTED'        // Descarga Excel
```

### Estructura de Logs

**Ejemplo - Cliente Acepta:**
```json
{
  "id": "log_123",
  "action": "CLIENT_RESPONSE_ACCEPTED",
  "entityType": "QUOTATION_CONFIG",
  "entityId": "quot_456",
  "userId": "user_789",  // ID del cliente
  "userName": "Juan Cliente",
  "details": {
    "quotationNumber": "COT-2025-001",
    "clientName": "Juan Cliente",
    "clientEmail": "juan@acme.com",
    "responseType": "ACEPTADA",
    "diasRestantes": 3,
    "respondidoEn": "2025-12-24T14:30:00Z"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2025-12-24T14:30:00Z"
}
```

**Ejemplo - Admin Publica:**
```json
{
  "id": "log_124",
  "action": "QUOTATION_STATE_CHANGED",
  "entityType": "QUOTATION_CONFIG",
  "entityId": "quot_456",
  "userId": "admin_111",
  "userName": "Carlos Admin",
  "details": {
    "quotationNumber": "COT-2025-001",
    "estadoAnterior": "CARGADA",
    "estadoNuevo": "ACTIVA",
    "diasParaAceptar": 7,
    "vencimientoEsperado": "2025-12-31T23:59:00Z"
  },
  "createdAt": "2025-12-24T10:00:00Z"
}
```

---

## 🚀 Plan de Implementación

### Fase 1: Base de Datos (1-2 días)

**Tarea 1.1:** Crear migración Prisma
- [ ] Agregar enum QuotationState con nuevos valores
- [ ] Crear tabla ClientResponse
- [ ] Crear tabla Notification
- [ ] Extender QuotationConfig con nuevos campos
- [ ] Ejecutar: `npx prisma migrate dev --name add_client_response_system`

**Tarea 1.2:** Regenerar tipos
- [ ] `npx prisma generate`
- [ ] Verificar tipos en `src/lib/types.ts`

### Fase 2: Backend - Endpoints API (2-3 días)

**Tarea 2.1:** Ampliar endpoint de estado
- [ ] Modificar: `src/app/api/quotations/[id]/state/route.ts`
- [ ] Agregar validación de transiciones de estado
- [ ] Registrar timestamps (activadoEn, inactivadoEn)

**Tarea 2.2:** Nuevo endpoint de respuestas de cliente
- [ ] Crear: `src/app/api/quotations/[id]/client-response/route.ts`
- [ ] POST: Guardar respuesta, actualizar estado, crear notificaciones
- [ ] GET: Obtener respuesta (con validación de cliente)

**Tarea 2.3:** Endpoint de notificaciones
- [ ] Crear: `src/app/api/notifications/user/route.ts` (GET)
- [ ] Crear: `src/app/api/notifications/[id]/mark-as-read/route.ts` (PATCH)

**Tarea 2.4:** Endpoint de extensión
- [ ] Crear: `src/app/api/quotations/[id]/request-extension/route.ts`

**Tarea 2.5:** Auditoría
- [ ] Actualizar: `src/lib/audit/auditHelper.ts` con nuevas acciones
- [ ] Agregar logs en cada endpoint

### Fase 3: Frontend Admin - Botones de Estado (2-3 días)

**Tarea 3.1:** Hook de cambio de estado
- [ ] Crear: `src/features/admin/hooks/useChangeQuotationState.ts`
- [ ] Con loading, error, toast notifications

**Tarea 3.2:** Actualizar Historial.tsx
- [ ] Implementar botones contextuales por estado
- [ ] Conectar con hook useChangeQuotationState
- [ ] Agregar Dialogos para confirmación

**Tarea 3.3:** Crear Dialogos de Estado
- [ ] DialogoPublicar.tsx
- [ ] DialogoRechazar.tsx (visualizar razones)
- [ ] DialogoNuevaPropuesta.tsx (visualizar sugerencias)

### Fase 4: Frontend Página Pública (3-4 días)

**Tarea 4.1:** Badge Contador de Días
- [ ] Crear: `src/components/BadgeContadorDias.tsx`
- [ ] Lógica de contador (Update cada hora)
- [ ] Colores por rango de días
- [ ] Callback cuando expira

**Tarea 4.2:** Botones de Respuesta
- [ ] Crear 3 botones flotantes (Aceptar/Rechazar/Proponer)
- [ ] Posicionamiento flotante (bottom-right)

**Tarea 4.3:** Dialogos del Cliente
- [ ] DialogoClienteAceptar.tsx
- [ ] DialogoClienteRechazar.tsx
- [ ] DialogoClienteProponer.tsx
- [ ] Integración con `/api/quotations/[id]/client-response`

**Tarea 4.4:** Página de Expiración
- [ ] Crear: `src/app/cotizacion-expirada/page.tsx`
- [ ] Similar a `sin-cotizacion`
- [ ] 3 opciones: Extensión / Aceptar / Salir

### Fase 5: Sistema de Notificaciones (2-3 días)

**Tarea 5.1:** Componente NotificacionesPanel
- [ ] Crear: `src/features/admin/components/NotificacionesPanel.tsx`
- [ ] Integración con DialogoGenericoDinamico
- [ ] Poll cada 10 segundos

**Tarea 5.2:** Dialogo de Detalle
- [ ] DialogoNotificacionDetalle.tsx
- [ ] Mostrar mensaje completo del cliente
- [ ] Botones contextuales

**Tarea 5.3:** Integración en UserProfileMenu
- [ ] Modificar: `src/components/UserProfileMenu.tsx`
- [ ] Agregar opción "Notificaciones"
- [ ] Mostrar badge con contador

### Fase 6: Exportación PDF (2-3 días)

**Tarea 6.1:** Instalación de dependencias
- [ ] `npm install jspdf html2canvas`

**Tarea 6.2:** Exporter PDF
- [ ] Crear: `src/lib/exporters/quotationPdfExporter.ts`
- [ ] Función generateQuotationPDF()
- [ ] Soporte para múltiples páginas

**Tarea 6.3:** Integración en Historial
- [ ] Botón PDF en Grid 3
- [ ] Spinner mientras genera
- [ ] Manejo de errores

### Fase 7: Testing y Auditoría (2-3 días)

**Tarea 7.1:** Testing de flujos
- [ ] Flujo: Admin publica → Cliente ve → Cliente responde
- [ ] Flujo: Cotización expira
- [ ] Flujo: Notificaciones aparecen
- [ ] Exportación PDF

**Tarea 7.2:** Auditoría completa
- [ ] Verificar todos los logs se registran
- [ ] Verificar timestamps correctos
- [ ] Backup de datos críticos

### Cronograma Total

| Fase | Tareas | Días |
|------|--------|------|
| 1 | BD | 1-2 |
| 2 | Backend | 2-3 |
| 3 | Admin UI | 2-3 |
| 4 | Público | 3-4 |
| 5 | Notificaciones | 2-3 |
| 6 | PDF | 2-3 |
| 7 | Testing | 2-3 |
| **TOTAL** | | **15-20 días** |

---

## 🎯 Dependencias a Instalar

```bash
npm install jspdf html2canvas
npm install react-query  # Si no existe
npm install framer-motion  # Ya existe
```

---

## 📋 Resumen de Archivos a Crear/Modificar

### Crear (Nuevos)
- `src/app/cotizacion-expirada/page.tsx` - Página de cotización expirada
- `src/components/BadgeContadorDias.tsx` - Badge flotante contador (14rem, animaciones)
- `src/components/ClientResponseButtons.tsx` - 3 botones circulares flotantes (respuesta cliente)
- `src/features/admin/hooks/useChangeQuotationState.ts` - Hook cambio estado
- `src/features/admin/components/NotificacionesPanel.tsx` - Panel notificaciones (DialogoGenericoDinamico)
- `src/features/admin/components/DialogoPublicar.tsx` - Dialogo publicar (DialogoGenericoDinamico)
- `src/features/admin/components/DialogoClienteAceptar.tsx` - Dialogo aceptar cliente (DialogoGenericoDinamico)
- `src/features/admin/components/DialogoClienteRechazar.tsx` - Dialogo rechazar cliente (DialogoGenericoDinamico)
- `src/features/admin/components/DialogoClienteProponer.tsx` - Dialogo proponer cliente (DialogoGenericoDinamico)
- `src/features/admin/components/DialogoNotificacionDetalle.tsx` - Dialogo detalle notificación (DialogoGenericoDinamico)
- `src/lib/exporters/quotationPdfExporter.ts` - Generador PDF (2 partes: main + annex)
- `src/app/api/quotations/[id]/client-response/route.ts` - POST respuestas cliente
- `src/app/api/quotations/[id]/request-extension/route.ts` - POST extensión tiempo
- `src/app/api/notifications/user/route.ts` - GET notificaciones usuario
- `src/app/api/notifications/[id]/mark-as-read/route.ts` - PATCH marcar notificación leída

### Modificar (Existentes)
- `prisma/schema.prisma` - Agregar: ClientResponse, Notification, campos en QuotationConfig
- `src/lib/types.ts` - Actualizar QuotationState enum (agregar ACEPTADA, RECHAZADA, NUEVA_PROPUESTA, EXPIRADA)
- `src/lib/audit/auditHelper.ts` - Agregar 8 nuevas acciones de cliente/admin
- `src/app/page.tsx` - Integrar BadgeContadorDias + ClientResponseButtons + Dialogos
- `src/features/admin/components/tabs/Historial.tsx` - Botones estado contextuales + Dialogos
- `src/components/UserProfileMenu.tsx` - Opción "Notificaciones" con badge contador
- `src/app/api/quotations/[id]/state/route.ts` - Ampliar validaciones de transiciones

### Convención: DialogoGenericoDinamico
Todos los diálogos nuevos DEBEN usar:
```tsx
<DialogoGenericoDinamico
  variant="premium"  // SIEMPRE premium
  type="success|warning|info|danger"  // Según contexto
  contentType="custom"  // Para contenido personalizado
/>
```

### Convención: PDF (2 Partes)
El archivo PDF descargado DEBE contener:
1. **Documento Principal** (Páginas 1-4): Todo contenido EXCEPTO "PAQUETES CONFIGURADOS"
2. **Anexo Único** (Páginas 5+): SOLO detalle de paquetes con detalles de servicios/costos
   - Cada paquete puede ocupar múltiples páginas si es necesario
   - Header diferenciado en cada página del anexo
   - Numeración separada: "Anexo Pág. X/Y"

---

## 🔄 FASE 4: AUDITORÍA DETALLADA Y MEJORAS DE GESTIÓN

### Auditoría Detallada - 22 Dic 2025

**Análisis del Código Actual:**

El proyecto cuenta con una infraestructura **95% completa** para gestión de cotizaciones. Sin embargo, se identificaron tres áreas críticas de mejora:

1. ⚠️ **Problema Visual:** Texto en botones de `QuotationInteractionWidget` con contraste insuficiente (Light theme)
2. 🔴 **Lógica Incompleta:** `HistorialTAB` contiene 3 handlers vacíos que requieren implementación
3. 🔴 **Cambio de Paradigma:** Sistema fue diseñado para "una cotización activa globalmente" pero ahora debe ser "múltiples activas, UNA por cliente"

---

### Problema Visual: Botones QuotationInteractionWidget

**Ubicación:** `src/features/public/components/QuotationInteractionWidget.tsx` (líneas 187-260)

**Estado Actual:**
```tsx
<motion.button
  // ...
  className={`
    w-full p-3 flex items-center gap-3 rounded-lg
    bg-gradient-to-br ${colorConfig.button.aceptar}  // ← from-green-50 to-emerald-50
    border-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    font-medium text-sm  // ← Texto muy claro
  `}
>
  <Check className="w-4 h-4" />
  Aceptar Cotización  // ← TEXTO NO SE VE BIEN
</motion.button>
```

**Problema Identificado:**
- Fondo: Colores muy claros (green-50, emerald-50)
- Texto: Verde oscuro (green-700) pero insuficiente contraste
- Resultado: Texto difícil de leer en GitHub Light theme

**Solución Implementada:**
Rediseño de botones con:
- ✅ **Layout horizontal** en línea única (no vertical)
- ✅ **Colores con mejor contraste** (fondos más saturados o más sólidos)
- ✅ **Tipografía mejorada** con peso y tamaño optimizados
- ✅ **Coherencia visual** con GitHub Light Design System
- ✅ **Iconos claros y pequeños** (no compiten con texto)

**Componentes Utilizados:**
- Modales existentes: `DialogoGenericoDinamico` (tipo: success/warning/info)
- Sistema de color existente del proyecto
- Animaciones Framer Motion con curvas bezier profesionales

---

### Gestión de Múltiples Cotizaciones Activas

**Cambio de Requisitos:**

| Aspecto | Anterior | Actual | Impacto |
|---------|----------|--------|--------|
| **Cotizaciones ACTIVAS simultáneas** | 1 global | N (múltiples) | CRÍTICO |
| **Cotizaciones por usuario/cliente** | N | 1 | CRÍTICO |
| **Validación necesaria** | Ninguna | "Una por cliente" | NUEVA LÓGICA |
| **Botón "Publicar"** | Desactiva otras | Solo activa | CAMBIO FLUJO |
| **HistorialTAB** | Oculta archivadas | Muestra todas | CAMBIO UI |
| **Estados soportados** | CARGADA, ACTIVA, INACTIVA | +ACEPTADA, RECHAZADA, NUEVA_PROPUESTA, EXPIRADA | EXTENSIÓN |

**Infraestructura Ya Existente:**

El sistema Prisma ya soporta esta arquitectura:

```prisma
model User {
  id                    String   @id
  quotationAssignedId   String?  // Legacy: una por usuario
  quotationAssigned     QuotationConfig?
  UserQuotationAccess   UserQuotationAccess[]  // N:M moderno
}

model UserQuotationAccess {
  id                String          @id
  userId            String
  quotationConfigId String
  canEdit           Boolean         @default(true)
  canDelete         Boolean         @default(false)
  assignedAt        DateTime        @default(now())
  assignedBy        String?
  isDefault         Boolean         @default(false)
  
  @@unique([userId, quotationConfigId])  // ← GARANTIZA 1:1
  QuotationConfig   QuotationConfig
  User              User
}

model QuotationConfig {
  id                  String
  estado              QuotationState  // CARGADA, ACTIVA, INACTIVA, ACEPTADA...
  emailCliente        String          // Identificar cliente
  activadoEn          DateTime?
  inactivadoEn        DateTime?
  UserQuotationAccess UserQuotationAccess[]
}
```

---

### Validación: Una Cotización por Cliente

**Lógica Requerida:**

Cuando se ejecuta: `handleChangeState(quotationId, 'ACTIVA')`

**Pasos de Validación:**

```
1. Obtener cotización:
   - quotation = prisma.quotationConfig.findUnique(id)
   - clientEmail = quotation.emailCliente

2. Buscar cotizaciones ACTIVAS para ese cliente:
   - activesForClient = prisma.quotationConfig.findMany({
       where: {
         emailCliente: clientEmail,
         estado: 'ACTIVA'
       }
     })

3. Si hay cotizaciones ACTIVAS:
   - ⚠️ MOSTRAR DIÁLOGO: "Cliente ya tiene cotización activa"
   - Opciones: [Reemplazar] [Cancelar]
   - Si "Reemplazar":
     - a) Inactivar cotización antigua: estado = INACTIVA
     - b) Activar cotización nueva: estado = ACTIVA
   - Si "Cancelar":
     - No hacer nada

4. Si NO hay cotizaciones ACTIVAS:
   - ✅ Activar directamente: estado = ACTIVA
```

**Componentes a Utilizar:**
- Modal existente: `DialogoGenericoDinamico` con type="warning"
- Hook existente: `useChangeQuotationState` (actualizar con validación)
- API endpoint: `/api/quotations/[id]/state` (agregar validación en servidor)

---

### Actualización HistorialTAB

**Handlers Vacíos Identificados:**

Ubicación: `src/features/admin/components/tabs/Historial.tsx` (líneas 602-618)

```tsx
// PROBLEMA 1: Línea 605
<button onClick={() => {}}>  {/* ← VACÍO - DEBE VOLVER A CARGADA */}
  Cargar
</button>

// PROBLEMA 2: Línea 611
<button onClick={() => {}}>  {/* ← VACÍO - DEBE IR A INACTIVA */}
  Inactivar
</button>

// PROBLEMA 3: Línea 617
<button onClick={() => {}}>  {/* ← VACÍO - DEBE IR A ACTIVA */}
  Reactivar
</button>
```

**Solución Implementada:**

| Botón | Estado Actual | Acción | Estado Nuevo | Handler |
|-------|---------------|--------|--------------|---------|
| Cargar | ACTIVA | Volver a edición | CARGADA | `handleChangeState(id, 'CARGADA')` |
| Inactivar | ACTIVA | Archivar | INACTIVA | `handleChangeState(id, 'INACTIVA')` |
| Reactivar | INACTIVA | Activar nuevamente | ACTIVA | `handleChangeState(id, 'ACTIVA')` |

Todos los handlers usan la función existente: `handleChangeState` que incluye tracking y validación.

---

### Cambios en Validación y Flujos

**Flujo Anterior (ROTO):**
```
Admin: Clic en "Publicar"
  → onClick={() => {}} → NADA OCURRE
  → Estado permanece CARGADA
  → Cliente: No ve botones de respuesta
```

**Flujo Nuevo (CORRECTO):**
```
Admin: Clic en "Publicar" (estado: CARGADA)
  → handleChangeState(id, 'ACTIVA')
  → Validación en servidor: ¿Cliente ya tiene activa?
    → SÍ: Mostrar diálogo con opción Reemplazar
      → Admin confirma → Inactivar anterior + Activar nueva
    → NO: Activar directamente
  → Estado = ACTIVA
  → Cliente: Recibe acceso a página pública
  → Cliente: Ve botones de respuesta (Aceptar/Rechazar/Proponer)
```

**Componentes Afectados:**

| Componente | Cambios | Prioridad |
|-----------|---------|-----------|
| `QuotationInteractionWidget.tsx` | Mejorar visibilidad de botones (layout horizontal, contraste) | ALTA |
| `HistorialTAB.tsx` | Implementar 3 handlers vacíos | ALTA |
| `useChangeQuotationState.ts` | Agregar validación cliente | ALTA |
| `/api/quotations/[id]/state/route.ts` | Agregar validación servidor | ALTA |
| `DialogoGenericoDinamico.tsx` | Sin cambios (ya es flexible) | - |

---

### Checklist Implementación Fase 4

#### 1️⃣ Mejora Visual: QuotationInteractionWidget
- [ ] Cambiar layout de vertical a horizontal
- [ ] Mejorar contraste de colores (fondos más saturados)
- [ ] Verificar legibilidad en luz natural (light theme)
- [ ] Testing en mobile y desktop
- [ ] Validar accesibilidad (WCAG AA mínimo)

#### 2️⃣ Lógica de Validación: Un Cliente = Una Cotización Activa
- [ ] Implementar función `verificarCotizacionActivaCliente()` en hook
- [ ] Crear diálogo de confirmación con opciones
- [ ] Actualizar API endpoint con validación servidor
- [ ] Testing: Cliente con 0 activas, con 1 activa, con 2 activas
- [ ] Auditoría: Registrar cambio de estado y reemplazos

#### 3️⃣ Handlers HistorialTAB
- [ ] Implementar `handleChangeState(id, 'CARGADA')` para botón Cargar
- [ ] Implementar `handleChangeState(id, 'INACTIVA')` para botón Inactivar
- [ ] Implementar `handleChangeState(id, 'ACTIVA')` para botón Reactivar
- [ ] Verificar feedback visual (toast, animaciones)
- [ ] Testing cada transición de estado

#### 4️⃣ Coherencia Visual Global
- [ ] Todos los botones: consistencia de tamaño, color, efecto hover
- [ ] Todos los diálogos: usar `DialogoGenericoDinamico` con type correcto
- [ ] Animaciones: duraciones consistentes (200ms transiciones rápidas)
- [ ] Tipografía: weights y sizes consistentes
- [ ] Paleta de colores: usar variables Tailwind existentes

#### 5️⃣ Pruebas
- [ ] Publicar cotización primera vez (sin ACTIVA anterior)
- [ ] Publicar cotización segunda vez (confirmar reemplazo)
- [ ] Cancelar publicación (desde diálogo)
- [ ] Cargar una ACTIVA a CARGADA (volver a editar)
- [ ] Inactivar una ACTIVA
- [ ] Reactivar una INACTIVA
- [ ] Botones de página pública aparecen solo si estado = ACTIVA
- [ ] Registros de auditoría se crean correctamente

#### 6️⃣ Validación BD
- [ ] No se pierden datos al cambiar estado
- [ ] UserQuotationAccess mantiene relación 1:1
- [ ] Timestamps (activadoEn, inactivadoEn) se actualizan
- [ ] AuditLog registra cada cambio

---



### PDF - Estructura en 2 Partes
- [ ] **Documento Principal (Páginas 1-4):** Contiene todo EXCEPTO paquetes
  - [ ] Header con logo, número, fechas
  - [ ] Información cliente y proveedor
  - [ ] Resumen ejecutivo (1-2 páginas)
  - [ ] Opciones de pago
  - [ ] Términos y condiciones
  - [ ] Secciones dinámicas (análisis, cronograma, etc.)
  - [ ] Referencia al Anexo Único (pie de página)
  - [ ] Numeración: "Página X de Y"

- [ ] **Anexo Único (Páginas 5+):** SOLO detalle de paquetes
  - [ ] Header diferenciado: "ANEXO ÚNICO - DETALLE DE PAQUETES"
  - [ ] Cada paquete en sección separada
  - [ ] Servicios base detallados
  - [ ] Servicios opcionales con estado (seleccionado/no)
  - [ ] Descuentos aplicados
  - [ ] Costos totales (Mes 1, Año 1, Año 2+)
  - [ ] Numeración: "Anexo Pág. X/Y"

### UI - Coherencia Visual
- [ ] Todos los botones circulares tienen tamaño 56px (w-14 h-14)
- [ ] Hover scale 110% en todos los botones interactivos
- [ ] Click scale 95% en todos los botones
- [ ] Transiciones 200ms en todas las propiedades
- [ ] Colores consistentes: Verde (éxito), Rojo (rechazo), Azul (propuesta)
- [ ] Todos los diálogos usan DialogoGenericoDinamico con variant="premium"
- [ ] Badge contador tiene animación pulse en rojo (< 2 días)
- [ ] Tooltips en hover de botones flotantes

### Funcionalidad General
- [ ] Todos los nuevos estados se muestran correctamente en Historial
- [ ] Badge contador cuenta hacia atrás correctamente (actualiza cada hora)
- [ ] Página de expiración se muestra cuando estado === EXPIRADA
- [ ] Respuestas del cliente se registran en BD (ClientResponse)
- [ ] Notificaciones se crean y muestran en dropdown de UserProfileMenu
- [ ] Todos los eventos se auditan correctamente en AuditLog
- [ ] Emails/webhooks se envían (si aplica)
- [ ] Sistema resiste bajo carga (100+ cotizaciones activas simultáneamente)

---

**Documento finalizado:** 21/12/2025  
**Próximo paso:** Aguardar aprobación de la propuesta antes de iniciar implementación
