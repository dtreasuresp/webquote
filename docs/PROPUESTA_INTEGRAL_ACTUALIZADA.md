# 📋 PROPUESTA INTEGRAL ACTUALIZADA: Sistema de Estados de Cotizaciones + UI/UX

> **VERSIÓN REVISADA** - 21 Diciembre 2025
> Incorpora feedback del usuario sobre layout de características y disposición de botones

---

## 📋 CONTEXTO GENERAL

El proyecto necesita **cambiar de un sistema binario (Activa/Inactiva) a un sistema triestado** para las cotizaciones, con clara separación entre:
- **CARGADA** (Modo edición)
- **ACTIVA** (Visible en página pública)
- **INACTIVA** (Archivada, no asignable)

---

## PARTE 1️⃣: ARQUITECTURA DE ESTADOS

### Cambio de Modelo: Binario → Triestado

**ACTUAL:**
```
activo: true  = Publicada
activo: false = Oculta
```

**PROPUESTO:**
```
estado: "CARGADA"  → Modo edición/borrador
estado: "ACTIVA"   → Visible en sitio público
estado: "INACTIVA" → Archived
```

**Cambios en Schema:**
- Agregar `estado: ENUM('CARGADA', 'ACTIVA', 'INACTIVA')` en `QuotationConfig`
- Mantener `activo: boolean` como legacy
- Agregar `activadoEn: DateTime?` y `inactivadoEn: DateTime?` para auditoría

---

## PARTE 2️⃣: PROBLEMA 1 - CARACTERÍSTICAS DESAPARECEN

**Problema:** Cuando se crea una nueva cotización, las características se cargan en estado local pero no persisten cuando no hay snapshots guardados.

**Solución Propuesta:**

**A. Nivel de Datos (Backend):**
- Crear tabla `PaqueteCaracteristica`:
  ```
  id, packageSnapshotId, caracteristicaTexto, orden, createdAt
  ```
- Guardar características asociadas al snapshot
- Cargar desde BD, no desde estado local

**B. Nivel de Componente:**
- Agregar endpoint `GET /api/snapshots/[id]/characteristics`
- Cuando se crea snapshot → guardar características
- Recargar desde BD inmediatamente

**C. UI Feedback:**
- Toast: "✅ Cotización creada - Cargando características..."
- Si falta en UI: "⚠️ Recargando características..."

---

## PARTE 3️⃣: PROBLEMA 2 - LAYOUT DE CARACTERÍSTICAS INCLUIDAS

### ✅ LAYOUT PROPUESTO (ACTUALIZADO POR USUARIO)

**Mantener la estructura actual** - solo modificar el header del paquete.

#### ANTES (Actual):
```
┌─────────────────────────────────────────────────────────┐
│ PAQUETE BÁSICO                                  ✓ Activo│
│ Tipo: BÁSICO                                            │
│                                                         │
│ Grid 3 columnas:                                        │
│  Pago Inicial      │  Primer Año      │   Desarrollo    │
│    $500            │    $2,500        │      $500       │
│                                                         │
│ Características Incluidas (5):                          │
│ ✓ Diseño Responsive para Mobile                        │
│ ✓ Integración con WhatsApp                             │
│ ✓ Catálogo de productos dinámico                       │
│ ✓ Carrito de compras                                   │
│ ✓ Pagos con Paypal                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### DESPUÉS (Propuesta Revisada):
```
┌──────────────────────────────────────────────────────────────────┐
│ PAQUETE BÁSICO / Entrega: 30d | Inicial: $500 | Año 1: $2,500   │
│                                                         ✓ Activo   │
│                                                                    │
│ Características Incluidas (5):                                    │
│ ✓ Diseño Responsive para Mobile                                  │
│ ✓ Integración con WhatsApp                                       │
│ ✓ Catálogo de productos dinámico                                 │
│ ✓ Carrito de compras                                             │
│ ✓ Pagos con Paypal                                               │
│                                                                    │
│ [Importar desde...] [Ordenar]                                    │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Cambios específicos:**
1. **Header:** Una sola línea: `PAQUETE BÁSICO / Entrega: 30d | Inicial: $500 | Año 1: $2,500`
2. **Badge "Activo":** Alineado a la derecha del header (misma línea)
3. **Características:** Mantener listado vertical actual (sin cambios)
4. **Beneficio:** Ahorro de espacio vertical en el grid de 3 columnas (desaparece)

---

## PARTE 4️⃣: HISTORIAL TAB - BOTONES DE ACCIÓN REORGANIZADOS

### ✅ ESTRUCTURA PROPUESTA (ACTUALIZADA POR USUARIO)

**Mantener la estructura visual actual** - solo reorganizar botones en 3 grids.

#### VISTA ACTUAL (HistorialTAB expandida):

```
┌──────────────────────────────────────────────────────────────────┐
│ 📌 VERSIÓN DE LA COTIZACIÓN                     6 versiones      │
│ [v.6]  Versión activa...                                         │
│                                                                   │
│ 📦 PAQUETES CONFIGURADOS (3)                                     │
│ [Tarjetas de paquetes...]                                        │
│                                                                   │
│ 🔵 SECCIÓN DE ACCIONES ← AQUÍ VAN LOS BOTONES                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### DESPUÉS (Propuesta con 3 Grids de Botones):

Se crea una **sección "ACCIONES"** con **3 grids de botones**, cada uno con un propósito diferente:

```
┌──────────────────────────────────────────────────────────────────┐
│ 🔧 ACCIONES                                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 📝 EDITAR COTIZACIÓN:                                            │
│ ┌─────────────────┬──────────────────┬─────────────────────────┐ │
│ │ [✏️ Editar]     │ [👁️ Visualizar]  │ [🗑️ Eliminar]         │ │
│ └─────────────────┴──────────────────┴─────────────────────────┘ │
│                                                                   │
│ 🌐 ESTADO Y PUBLICACIÓN:                                         │
│ ┌─────────────────┬──────────────────┬──────────────────────────┐│
│ │ [✅ Publicar]   │ [💾 Cargar]      │ [🚫 Inactivar]         ││
│ │ (o Activar)     │ (Global)         │                          ││
│ └─────────────────┴──────────────────┴──────────────────────────┘│
│                                                                   │
│ 📄 EXPORTAR:                                                     │
│ ┌─────────────────┬──────────────────┬──────────────────────────┐│
│ │ [📄 PDF]        │ [📘 Word]        │ [📊 Excel]             ││
│ └─────────────────┴──────────────────┴──────────────────────────┘│
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## PARTE 5️⃣: DETALLES DE CADA GRID DE BOTONES

## ESTRUCTURA DE GRIDS EN UNA SOLA FILA

Los 3 grids de botones se muestran **horizontalmente en una misma fila**:

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔧 ACCIONES                                                                               │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                            │
│ ┌─ Grid 1: Editar ──┐  ┌─ Grid 2: Estado ──┐  ┌─ Grid 3: Exportar ──┐                  │
│ │ [✏️ Editar]      │  │ [✅ Publicar]    │  │ [📄 PDF]           │                  │
│ │ [👁️ Visualizar] │  │ [💾 Cargar]      │  │ [📘 Word]          │                  │
│ │ [🗑️ Eliminar]   │  │ [🚫 Inactivar]   │  │ [📊 Excel]         │                  │
│ └─────────────────┘  └──────────────────┘  └────────────────────┘                  │
│                                                                                            │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

**Layout:** 
- Container: `flex flex-row gap-4` (distribución horizontal)
- Cada grid: `flex flex-col gap-2` (botones verticales dentro)
- Responsive: En móvil, cambiar a `flex-col` para que grids vayan verticales

---

### Grid 1: EDITAR COTIZACIÓN
```
[✏️ Editar] [👁️ Visualizar] [🗑️ Eliminar]

Botones:
- ✏️ EDITAR
  Tamaño: text-sm
  Color: bg-gh-warning/10 hover:bg-gh-warning/20 text-gh-warning
  Acción: Abre modal de edición de cotización
  Disponible: Siempre (si tiene permiso quotations.edit)
  Ancho: w-full o flex-1

- 👁️ VISUALIZAR
  Tamaño: text-sm
  Color: bg-gh-info/10 hover:bg-gh-info/20 text-gh-info
  Acción: Abre vista previa de la cotización (read-only)
  Disponible: Siempre
  Ancho: w-full o flex-1

- 🗑️ ELIMINAR
  Tamaño: text-sm
  Color: bg-gh-danger/10 hover:bg-gh-danger/20 text-gh-danger
  Acción: Elimina la cotización (con confirmación)
  Disponible: Siempre (si tiene permiso quotations.delete)
  Tooltip: "Esta acción es irreversible"
  Ancho: w-full o flex-1
```

---

### Grid 2: ESTADO Y PUBLICACIÓN
```
[✅ Publicar/Reactivar]
[💾 Cargar]
[🚫 Inactivar]

Botones contextuales según ESTADO:

1️⃣ Si Estado = CARGADA 📝:
   ┌─────────────────┬──────────────────┬──────────────────────────┐
   │ [✅ PUBLICAR]   │ [💾 CARGAR GLOBAL│ [🚫 INACTIVAR]          │
   │ (verde)         │ (gris)           │ (rojo)                   │
   └─────────────────┴──────────────────┴──────────────────────────┘
   
   - ✅ PUBLICAR
     Color: bg-green-500/10 hover:bg-green-500/20 text-green-500
     Acción: Cambia estado a ACTIVA
     Permiso: quotations.activate
     Tooltip: "Publicar para que sea visible a clientes"
   
   - 💾 CARGAR GLOBAL
     Color: bg-gh-border/20 text-gh-text-muted
     Acción: Activa como cotización global (isGlobal: true)
     Permiso: quotations.manage
     Tooltip: "Marcar como cotización global por defecto"
   
   - 🚫 INACTIVAR
     Color: bg-red-500/10 hover:bg-red-500/20 text-red-500
     Acción: Cambia estado a INACTIVA
     Permiso: quotations.deactivate
     Tooltip: "Archivar - No será visible ni asignable"

2️⃣ Si Estado = ACTIVA ✅:
   ┌─────────────────┬──────────────────┬──────────────────────────┐
   │ [📋 VER PÚBLICO]│ [💾 CARGAR GLOBAL│ [🚫 INACTIVAR]          │
   │ (azul)          │ (gris)           │ (rojo)                   │
   └─────────────────┴──────────────────┴──────────────────────────┘
   
   - 📋 VER PÚBLICO
     Color: bg-gh-info/10 hover:bg-gh-info/20 text-gh-info
     Acción: Abre en nueva ventana la cotización publicada
     Permiso: quotations.view
   
   - 💾 CARGAR GLOBAL
     Color: Similar a CARGADA
   
   - 🚫 INACTIVAR
     Similar a CARGADA

3️⃣ Si Estado = INACTIVA 🚫:
   ┌─────────────────┬──────────────────┬──────────────────────────┐
   │ [✅ REACTIVAR]  │ [👁️ VER DETALLES]│ [🗑️ ELIMINAR]          │
   │ (verde)         │ (gris)           │ (rojo)                   │
   └─────────────────┴──────────────────┴──────────────────────────┘
   
   - ✅ REACTIVAR
     Color: bg-green-500/10 hover:bg-green-500/20 text-green-500
     Acción: Cambia estado a ACTIVA
     Permiso: quotations.activate
   
   - 👁️ VER DETALLES
     Color: bg-gh-info/10 text-gh-info (read-only)
   
   - 🗑️ ELIMINAR
     Similar a Grid 1
```

---

### Grid 3: EXPORTAR
```
[📄 PDF]
[📘 Word]
[📊 Excel]

Botones:
- 📄 PDF
  Color: bg-red-500/10 hover:bg-red-500/20 text-red-500
  Acción: Exporta cotización en PDF
  Permiso: quotations.export
  Tooltip: "Descargar como PDF"
  Ancho: w-full o flex-1

- 📘 Word
  Color: bg-blue-500/10 hover:bg-blue-500/20 text-blue-500
  Acción: Exporta cotización en DOCX
  Permiso: quotations.export
  Tooltip: "Descargar como Word"
  Ancho: w-full o flex-1

- 📊 Excel
  Color: bg-green-500/10 hover:bg-green-500/20 text-green-500
  Acción: Exporta detalles en XLSX
  Permiso: quotations.export
  Tooltip: "Descargar como Excel"
  Ancho: w-full o flex-1
```

---

## PARTE 6️⃣: VALIDACIONES VISUALES EN HISTORIAL TAB

### VISUAL COMPLETO CON 3 GRIDS DE BOTONES

```
╔═════════════════════════════════════════════════════════════════════╗
║ HISTORIAL DE COTIZACIONES                                           ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─ CZ0001.251628 (v6) ───────────────────────────────────────────┐║
║  │ Mercado Mi Casita | Carlos López | Global | 20 dic | 📝 CARGADA│║
║  └────────────────────────────────────────────────────────────────┘║
║                      ↓ EXPANDIDO ↓                                  ║
║  ┌────────────────────────────────────────────────────────────────┐║
║  │                                                                  │║
║  │ 📌 VERSIÓN DE LA COTIZACIÓN                   6 versiones      │║
║  │ [v.6]  Versión activa                                          │║
║  │ Estado: 📝 CARGADA - En modo edición                           │║
║  │                                                                  │║
║  │ 📦 PAQUETES CONFIGURADOS (3)                                   │║
║  │ [Tarjetas de paquetes...]                                      │║
║  │                                                                  │║
║  │ ═════════════════════════════════════════════════════════════  │║
║  │ 🔧 ACCIONES                                                    │║
║  │ ═════════════════════════════════════════════════════════════  │║
║  │                                                                  │║
║  │ 📝 EDITAR COTIZACIÓN:                                          │║
║  │ ┌──────────────┬──────────────┬──────────────────────────────┐ │║
║  │ │ [✏️ Editar]  │ [👁️ Visualiz]│ [🗑️ Eliminar]              │ │║
║  │ └──────────────┴──────────────┴──────────────────────────────┘ │║
║  │                                                                  │║
║  │ 🌐 ESTADO Y PUBLICACIÓN:                                       │║
║  │ ┌──────────────┬──────────────┬──────────────────────────────┐ │║
║  │ │ [✅ Publicar]│ [💾 Cargar]  │ [🚫 Inactivar]              │ │║
║  │ └──────────────┴──────────────┴──────────────────────────────┘ │║
║  │                                                                  │║
║  │ 📄 EXPORTAR:                                                   │║
║  │ ┌──────────────┬──────────────┬──────────────────────────────┐ │║
║  │ │ [📄 PDF]    │ [📘 Word]    │ [📊 Excel]                  │ │║
║  │ └──────────────┴──────────────┴──────────────────────────────┘ │║
║  │                                                                  │║
║  └────────────────────────────────────────────────────────────────┘║
║                                                                      ║
║  ┌─ CZ0001.251628 (v5) ───────────────────────────────────────────┐║
║  │ Mercado Mi Casita | Carlos López | Global | 19 dic | ✅ ACTIVA ║
║  └────────────────────────────────────────────────────────────────┘║
║                                                                      ║
║  ┌─ CZ0002.252153 (v4) ───────────────────────────────────────────┐║
║  │ Urbanísima Constructora | Juan García | XYZ | 18 dic | 🚫 INACT║
║  └────────────────────────────────────────────────────────────────┘║
║                                                                      ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## PARTE 7️⃣: SISTEMA DE COLORES Y BADGES

### Estados (en badge de fila):

| Estado | Color | Emoji | Badge |
|--------|-------|-------|-------|
| **CARGADA** | `bg-amber-500/10 text-amber-500` | 📝 | `CARGADA` |
| **ACTIVA** | `bg-green-500/10 text-green-500` | ✅ | `ACTIVA` |
| **INACTIVA** | `bg-red-500/10 text-red-500` | 🚫 | `INACTIVA` |

### Botones de Acción:

```
Editar:        bg-gh-warning/10   text-gh-warning
Visualizar:    bg-gh-info/10      text-gh-info
Eliminar:      bg-gh-danger/10    text-gh-danger
Publicar:      bg-green-500/10    text-green-500
Cargar:        bg-gh-border/20    text-gh-text-muted
Inactivar:     bg-red-500/10      text-red-500
Reactivar:     bg-green-500/10    text-green-500
Ver Público:   bg-gh-info/10      text-gh-info
Ver Detalles:  bg-gh-info/10      text-gh-info
PDF:           bg-red-500/10      text-red-500
Word:          bg-blue-500/10     text-blue-500
Excel:         bg-green-500/10    text-green-500
```

---

## PARTE 8️⃣: AUDITORÍA Y LOGS

### Nuevas Acciones a Auditar:

```typescript
| 'QUOTATION_LOADED_FOR_EDIT'      // Cargar cotización para editar
| 'QUOTATION_STATE_CHANGED'        // Cambio de estado
| 'QUOTATION_ACTIVATED'            // Específico: → ACTIVA
| 'QUOTATION_DEACTIVATED'          // Específico: → INACTIVA
| 'QUOTATION_SET_GLOBAL'           // Cargar como global
| 'QUOTATION_EXPORTED_PDF'         // Exportar a PDF
| 'QUOTATION_EXPORTED_WORD'        // Exportar a Word
| 'QUOTATION_EXPORTED_EXCEL'       // Exportar a Excel
```

---

## PARTE 9️⃣: INTEGRACIÓN CON MODAL "NUEVO/EDITAR USUARIO"

### Filtro de Cotizaciones en Dropdown:

**Solo mostrar cotizaciones con estado ACTIVA:**

```typescript
quotations.filter(q => q.estado === 'ACTIVA')
```

**Protección backend:**
- Si intenta asignar CARGADA o INACTIVA → Error 400
- Auditoría: `QUOTATION_ASSIGNMENT_BLOCKED`

```
┌──────────────────────────────────────────────────┐
│ NUEVO USUARIO                                    │
├──────────────────────────────────────────────────┤
│ Nombre: [                                      ] │
│ Email:  [                                      ] │
│                                                   │
│ Cotización Asignada:                             │
│ [▼ ✅ Mercado - CZ0001.251628 (5 v. - v6)]     │
│                                                   │
│ 💡 Solo cotizaciones ACTIVAS se pueden asignar  │
│                                                   │
│ [Cancelar]                      [Guardar]       │
└──────────────────────────────────────────────────┘
```

---

## PARTE 🔟: PROTECCIÓN DE PERMISOS

### Nuevos Permisos Requeridos:

```
quotations.activate      → Pasar a ACTIVA
quotations.deactivate    → Pasar a INACTIVA
quotations.export        → Descargar PDF/Word/Excel
quotations.edit_state    → Cambiar estado (agrupa los anteriores)
quotations.manage        → Cargar como global
```

### Botones Deshabilitados:

```
Si NO tiene quotations.activate:
  → Botones [✅ PUBLICAR] y [✅ REACTIVAR] deshabilitados

Si NO tiene quotations.deactivate:
  → Botón [🚫 INACTIVAR] deshabilitado

Si NO tiene quotations.export:
  → Botones [📄 PDF], [📘 Word], [📊 Excel] deshabilitados

Si NO tiene quotations.manage:
  → Botón [💾 CARGAR] deshabilitado
```

---

## PARTE 1️⃣1️⃣: TOAST MESSAGES ACTUALIZADOS

### Por acción:

```
✅ "Cotización publicada - Ahora visible para clientes"
✅ "Cotización cargada como global - Será la opción por defecto"
✅ "Cotización archivada - No será visible ni asignable"
✅ "Cotización reactivada - Vuelve a estar disponible"
✅ "PDF descargado correctamente"
✅ "Word descargado correctamente"
✅ "Excel descargado correctamente"

❌ "No tienes permisos para publicar cotizaciones"
❌ "No tienes permisos para archivar cotizaciones"
❌ "Error: No puedes asignar una cotización en edición"
❌ "Error: La cotización está archivada"

ℹ️  "Cotización cargada en modo edición"
⚠️  "Características no encontradas - Recargando..."
```

---

## PARTE 1️⃣2️⃣: PLAN DE IMPLEMENTACIÓN

### Fase 1: Backend
1. Agregar enum `CotizationState` en types.ts
2. Agregar campo `estado` a Prisma schema
3. Agregar nuevas acciones de auditoría
4. Crear endpoint `PATCH /api/quotations/[id]/state`
5. Agregar nuevos permisos
6. Agregar endpoint `GET /api/snapshots/[id]/characteristics`

### Fase 2: Frontend - HistorialTAB
1. Actualizar tipos en types.ts
2. Crear helpers `getStateColor()`, `getStateIcon()`, `getStateLabel()`
3. Actualizar badge de estado en filas
4. Crear sección "ACCIONES" con 3 grids de botones
5. Implementar lógica contextual de botones según estado
6. Agregar validación de permisos en botones

### Fase 3: Frontend - PaquetesCaracteristicasContent
1. Mover estadísticas al header en una sola línea
2. Mantener características en listado vertical

### Fase 4: Frontend - Filtros
1. Actualizar userDataStore para filtrar por ACTIVA
2. Agregar validación backend en asignación de usuarios

### Fase 5: QA y Auditoría
1. Verificar todos los logs de auditoría
2. Validar permisos en cada botón
3. Probar cambios de estado
4. Probar exports

---

## ✅ RESUMEN DE CAMBIOS VISUALES

| Aspecto | Cambio |
|---------|--------|
| **Estados** | Binario (activo/inactivo) → Triestado (Cargada/Activa/Inactiva) |
| **Badge HistorialTAB** | `Activa/Inactiva` → `📝 CARGADA / ✅ ACTIVA / 🚫 INACTIVA` |
| **Botones HistorialTAB** | 1 grid (toggle) → 3 grids (Editar, Estado, Exportar) |
| **Header Paquetes** | 2 líneas → 1 línea comprimida (nombre + detalles) |
| **Características** | Mantener listado vertical (sin cambios) |
| **Grid 3 columnas** | Desaparece (datos pasan al header) |
| **Filtro Usuarios** | Solo ACTIVAS en dropdown |

---

¿Está clara la propuesta actualizada? Lista para implementación.
