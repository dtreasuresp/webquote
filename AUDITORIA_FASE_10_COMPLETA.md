# 📊 AUDITORÍA COMPLETA: FLUJO REQUERIDO vs. IMPLEMENTADO

**Fecha**: 23 de noviembre de 2025  
**Archivo auditado**: `flujo_.md` (documento de requerimientos)  
**Código actual**: `src/app/administrador/page.tsx` (3429 líneas)  
**Estado general**: ⚠️ 60% IMPLEMENTADO, 40% PENDIENTE

---

## 🎯 RESUMEN EJECUTIVO

| Componente | Requerido | Implementado | Estado |
|-----------|-----------|--------------|---------|
| Botón "Nueva Cotización" | ✅ | ✅ | **COMPLETO** |
| Sistema validación TABs | ✅ | ✅ | **COMPLETO** |
| Indicadores visuales TABs | ✅ | ✅ | **COMPLETO** |
| TAB change interception | ✅ | ✅ | **COMPLETO** |
| Guardado centralizado | ✅ | ✅ | **COMPLETO** |
| Modal Ver (read-only) | ✅ | ⚠️ | **PARCIAL** |
| Modal Editar ACTIVA | ✅ | ⚠️ | **PARCIAL** |
| Modal Editar INACTIVA | ✅ | ⚠️ | **PARCIAL** |
| Validación de dependencias | ✅ | ❌ | **PENDIENTE** |
| Diálogos de confirmación | ✅ | ⚠️ | **PARCIAL** |
| Manejo de cambios sin guardar | ✅ | ❌ | **PENDIENTE** |
| Estados antes/después modal | ✅ | ❌ | **PENDIENTE** |

**Puntuación**: 60/100

---

## ✅ PARTE 1: LO QUE ESTÁ CORRECTAMENTE IMPLEMENTADO

### 1.1 Botón "Nueva Cotización" ✅ COMPLETO

**Requerido en flujo.md**:
- Ubicación: Header, entre "Guardar Cotización" y botón de navegación
- Acción: Genera cotización única, limpia estados, resetea validación, abre TAB Cotización

**Implementación encontrada** (Línea ~1625):
```tsx
<motion.button
  onClick={crearNuevaCotizacion}
  className="px-4 py-2 bg-green-600 text-white rounded-lg..."
>
  <FaPlus /> Nueva Cotización
</motion.button>
```

**Función `crearNuevaCotizacion()`** (Líneas ~1091-1142):
- ✅ POST a `/api/quotation-config`
- ✅ Obtiene cotización con ID único
- ✅ `setCotizacionConfig(nuevaCotizacion)`
- ✅ Resetea `estadoValidacionTabs` a 'pendiente'
- ✅ Limpia `snapshots` array
- ✅ `setActivePageTab('cotizacion')`
- ✅ Muestra toast de éxito
- ✅ Llama `recargarQuotations()`

**Veredicto**: ✅ **COMPLETAMENTE IMPLEMENTADO Y CORRECTO**

---

### 1.2 Sistema de Validación de TABs ✅ COMPLETO

**Requerido en flujo.md**:
- TAB Cotización: Campos obligatorios + formato válido
- TAB Oferta: Servicios base + descripción
- TAB Paquetes: Al menos 1 paquete
- TAB Estilos: Siempre válido

**Implementación encontrada** (Líneas ~370-495):

#### Funciones de validación:

**a) `validarTabCotizacion()`** (28 líneas):
```
Valida:
- empresa ✅
- profesional ✅
- sector ✅
- ubicacion ✅
- emails cliente/proveedor ✅
- WhatsApp formato ✅
- Comparación de fechas ✅
Retorna: { valido: boolean, errores: string[] }
```

**b) `validarTabOferta()`** (16 líneas):
```
Valida:
- serviciosBase.length > 0 ✅
- paqueteActual.nombre ✅
- paqueteActual.descripcion ✅
Retorna: { valido: boolean, errores: string[] }
```

**c) `validarTabPaquetes()`** (9 líneas):
```
Valida:
- snapshots.length > 0 ✅
Retorna: { valido: boolean, errores: string[] }
```

**d) `validarTabEstilos()`** (5 líneas):
```
Siempre válido ✅
Retorna: { valido: true, errores: [] }
```

**Veredicto**: ✅ **COMPLETAMENTE IMPLEMENTADO Y CORRECTO**

---

### 1.3 Indicadores Visuales en TABs ✅ COMPLETO

**Requerido en flujo.md**:
- Verde ✅: TAB válido
- Amarillo ⚠️: TAB actual
- Rojo ❌: TAB con errores
- Gris ⭕: TAB no iniciado

**Implementación encontrada** (Líneas ~1456-1488):

```tsx
label: `Cotización ${estadoValidacionTabs.cotizacion === 'error' ? '⚠️' : estadoValidacionTabs.cotizacion === 'ok' ? '✓' : ''}`
```

**Indicadores encontrados**:
- ✅ Verde implícito (sin indicador cuando está OK)
- ⚠️ Símbolo cuando hay error
- ✓ Check cuando está completo
- Dinámico basado en `estadoValidacionTabs`

**Veredicto**: ✅ **COMPLETAMENTE IMPLEMENTADO**

---

### 1.4 Interception de Cambio de TAB ✅ COMPLETO

**Requerido en flujo.md**:
- Valida TAB actual antes de permitir switch
- Muestra toast con errores específicos
- Bloquea navegación si hay errores
- Actualiza estado si OK

**Implementación encontrada** (Líneas ~425-480):

**Función `handleCambioTab()`** (35 líneas):
```tsx
- Valida TAB actual según reglas ✅
- Si hay errores: toast.error() ✅
- Retorna sin cambiar TAB ✅
- Si OK: actualiza validación + cambia TAB ✅
- Llama actualizarEstadoValidacionTabs() ✅
```

**Integration** (Línea ~1650):
```tsx
onTabChange={handleCambioTab}  // ✅ En lugar de setActivePageTab
```

**Veredicto**: ✅ **COMPLETAMENTE IMPLEMENTADO Y CORRECTO**

---

### 1.5 Guardado Centralizado ✅ COMPLETO

**Requerido en flujo.md**:
- Validar que TODOS los TABs estén en 'ok'
- Mostrar error si alguno pendiente/error
- Auto-navegar a TAB problemático
- Guardar atómicamente
- Desactivar otros, activar este

**Implementación encontrada** (Líneas ~1198-1320):

**Función `guardarConfiguracionActual()`**:
```
PASO 0: Actualiza validación
✅ actualizarEstadoValidacionTabs()

PASO 2-4: Valida TABs en secuencia
✅ if (!validarTabCotizacion().valido) → navega + erro
✅ if (!validarTabOferta().valido) → navega + error
✅ if (!validarTabPaquetes().valido) → navega + error

PASO 5: Guarda configuración
✅ PUT a /api/quotation-config/{id}

PASO 6: Desactiva todas las demás
✅ await desactivarTodas(cotizacionConfig.id)

PASO 7: Recarga
✅ await recargarQuotations()
✅ Muestra toast éxito
```

**Veredicto**: ✅ **COMPLETAMENTE IMPLEMENTADO Y CORRECTO**

---

### 1.6 Función `desactivarTodas()` ✅ COMPLETO

**Requerido en flujo.md**:
- Cuando activas una cotización, desactiva todas las demás

**Implementación encontrada** (Líneas ~1036-1050):
```tsx
const desactivarTodas = async (exceptoId: string) => {
  const response = await fetch('/api/quotations/deactivate-others', {
    method: 'PATCH',
    body: JSON.stringify({ exceptoId }),
  })
  if (!response.ok) throw new Error(...)
  return true
}
```

**Veredicto**: ✅ **COMPLETAMENTE IMPLEMENTADO Y CORRECTO**

---

## ⚠️ PARTE 2: LO QUE ESTÁ PARCIALMENTE IMPLEMENTADO

### 2.1 Modal "Ver" (Read-Only) ⚠️ PARCIAL (60%)

**Requerido en flujo.md**:
- Abre en modo READ-ONLY
- Todos inputs disabled
- No permite cambios
- Cierra sin preguntar

**Implementación encontrada** (Líneas ~854-860):

```tsx
const abrirModalVer = (quotation: QuotationConfig) => {
  abrirModalConActivacion(quotation, 'ver')  // ✅ Diferencia modo
}
```

**Función `abrirModalEditarInterno()`** (Línea ~854-860):
```tsx
if (modo === 'ver') {
  setReadOnly(true)  // ✅ Establece read-only
} else {
  setReadOnly(false)
}
```

**PROBLEMA ENCONTRADO**:
- ❌ No hay validación de que la cotización es la activa
- ❌ No hay diálogo para activarla si es inactiva
- ❌ El diálogo de activación solo se muestra en `abrirModalConActivacion()` pero no es claro que lo hace para "Ver"

**Código del diálogo** (Línese ~3358-3406):
```tsx
{modoAbrir === 'editar' ? (
  // Para editar: "Cancelar" o "Activar y Editar"
) : (
  // Para ver: "Ver Solo Lectura" o "Activar y Editar"  ✅
)}
```

**Análisis detallado**:
- ✅ `abrirModalVer()` llama `abrirModalConActivacion(quotation, 'ver')`
- ✅ `abrirModalConActivacion()` verifica si está activa
- ✅ Si NO está activa: muestra diálogo con opciones
- ✅ Diálogo ofrece: "Ver Solo Lectura" o "Activar y Editar"
- ✅ `abrirSinActivar()` abre en lectura sin activar
- ✅ `readOnly = true` en modal

**Veredicto**: ✅ **COMPLETAMENTE IMPLEMENTADO - Era error de lectura**

---

### 2.2 Modal "Editar" Cotización ACTIVA ⚠️ PARCIAL (70%)

**Requerido en flujo.md** (Escenario 2):
- Si cotización IS activa (isGlobal=true):
  - Alert: "Esta es la cotización ACTIVA. Los cambios serán actualizados..."
  - [Aceptar] → Modo editable
  - Al guardar: Guarda cambios SOLAMENTE (sin cambiar estado)

**Implementación encontrada**:

**Función `abrirModalConActivacion()`** (Líneas ~773-788):
```tsx
const abrirModalConActivacion = (quotation: QuotationConfig, modo: 'editar' | 'ver') => {
  const cotizacionActiva = obtenerCotizacionActiva()
  
  // Si NO es la cotización activa
  if (!quotation.activo || !quotation.isGlobal) {
    // Mostrar diálogo
  } else {
    // Si ya está activa, abrir directamente
    abrirModalEditarInterno(quotation, modo)  ✅
  }
}
```

**PROBLEMA ENCONTRADO** ❌:
- ❌ No hay ALERT cuando abre cotización ACTIVA
- ❌ No hay confirmación tipo "Esta es la cotización ACTIVA. Los cambios serán actualizados..."
- ❌ Abre directamente sin avisar al usuario

**Lo que debería pasar según flujo.md**:
```
Usuario abre "EDITAR" cotización ACTIVA
  ↓
ALERT A: "Esta es la cotización ACTIVA. Los cambios serán actualizados al presionar Guardar"
  ├─ [Aceptar] → Entra a modo editable
  └─ [Cancelar] → Cierra sin abrir modal
  ↓
Si acepta → Abre modal editable
  ↓
Usuario guarda
  ↓
Guarda cambios SOLAMENTE (no pregunta activación)
```

**Lo que actualmente pasa**:
```
Usuario abre "EDITAR" cotización ACTIVA
  ↓
Abre directamente modo editable (sin alertar)
  ↓
Usuario guarda
  ↓
Guarda cambios ✅
```

**Veredicto**: ⚠️ **70% IMPLEMENTADO - Falta ALERT previo**

---

### 2.3 Modal "Editar" Cotización INACTIVA ⚠️ PARCIAL (80%)

**Requerido en flujo.md** (Escenario 3):
- Si cotización NOT activa (isGlobal=false):
  - ALERT B: "Esta cotización está INACTIVA. Podrá seleccionar si ponerla ACTIVA..."
  - [Aceptar] → Modo editable
  - Al guardar: Pregunta "¿Deseas activar?"
    - [SÍ] → Desactiva otras, activa esta
    - [NO] → Solo guarda cambios

**Implementación encontrada**:

**Función `abrirModalConActivacion()`** (Líneas ~773-788):
```tsx
if (!quotation.activo || !quotation.isGlobal) {
  setCotizacionAAbrir(quotation)
  setModoAbrir(modo)
  setMostrarDialogoActivarCotizacion(true)  ✅ Muestra diálogo
}
```

**Diálogo** (Líneas ~3358-3406):
```tsx
{modoAbrir === 'editar' ? (
  <>
    <button onClick={() => ...}>Cancelar</button>
    <button onClick={activarYAbrirModal}>Activar y Editar</button>  ✅
  </>
) : (
  // Para "Ver"
)}
```

**Función `activarYAbrirModal()`** (Líneas ~869-883):
```tsx
- Desactiva todas ✅
- Recarga cotizaciones ✅
- Abre modal ✅
- Toast éxito ✅
```

**PROBLEMAS ENCONTRADOS** ⚠️:
- ❌ Diálogo NO es ALERT (es mejor), pero no hay texto claro que diga "Esta está INACTIVA"
- ✅ Ofrece opción de activar → CORRECTO
- ✅ Al guardar después de activar → Directamente guarda cambios (lógica correcta)
- ❌ FALTA: Si usuario edita SIN activar (modo "Ver"), ¿qué pasa al intentar guardar?

**Veredicto**: ⚠️ **80% IMPLEMENTADO - Falta manejo post-guardado en algunos casos**

---

### 2.4 Diálogos de Confirmación ⚠️ PARCIAL (60%)

**Requerido en flujo.md**:
- Alert A: "Esta es la cotización ACTIVA. Los cambios serán actualizados..."
- Alert B: "Esta cotización está INACTIVA. Podrá seleccionar si ponerla ACTIVA..."
- Pregunta al guardar si inactiva: "¿Deseas activar?"
- Pregunta al cerrar con cambios: "¿Descartar cambios?"

**Implementación encontrada**:

**Alert A**: ❌ NO EXISTE
- No hay alerta cuando abre cotización ACTIVA para editar

**Alert B**: ⚠️ PARCIAL (diálogo elegante en lugar de alert)
- Líneas ~3358-3406
- Muestra diálogo visual en lugar de alert
- Ofrece opciones correctas
- Texto podría ser más claro

**Pregunta al guardar si inactiva**: ❌ NO EXISTE
- Cuando `activarYAbrirModal()` se ejecuta, directamente guarda
- No hay confirmación tipo "¿Deseas activar esta cotización?"

**Pregunta al cerrar con cambios**: ❌ NO EXISTE
- No hay `changeDetection` para cambios en modal
- No pregunta "¿Descartar cambios?" al cerrar

**Veredicto**: ⚠️ **60% IMPLEMENTADO - Faltan 2 alerts críticos y 1 pregunta**

---

## ❌ PARTE 3: LO QUE NO ESTÁ IMPLEMENTADO

### 3.1 Validación de Dependencias Entre TABs ❌ NO IMPLEMENTADO

**Requerido en flujo.md**:
- Al ir a TAB "Estilos": Validar que existe al menos 1 paquete (snapshots.length > 0)
- Al ir a TAB "Paquetes": Validar que existe descripción del paquete
- Al ir a TAB "Oferta": (Sin dependencias previas)

**Implementación encontrada**: ❌ NO EXISTE

**Función `handleCambioTab()`** (Líneas ~425-480):
```tsx
// Solo valida el TAB ACTUAL, no las dependencias
const tabActual = activePageTab

// Validar según tab actual
if (tabActual === 'cotizacion') {
  const resultado = validarTabCotizacion()
  // Valida cotización...
}
// ... sin validar dependencias previas
```

**Problema**:
- ❌ User puede entrar a "Estilos" sin haber creado paquetes
- ❌ User puede entrar a "Paquetes" sin descripción de paquete
- ❌ No hay `validarDependenciasTab()` 

**Veredicto**: ❌ **NO IMPLEMENTADO**

---

### 3.2 Detección de Cambios Sin Guardar ❌ NO IMPLEMENTADO

**Requerido en flujo.md** (Escenario 4 - Al cerrar con cambios):
```
Usuario abre EDITAR
  → Modifica campos
  → Click "Cerrar"
  → Pregunta: "¿Descartar cambios?"
    ├─ [SÍ] → Cierra sin guardar
    └─ [NO] → Vuelve a modal
```

**Implementación encontrada**: ⚠️ PARCIAL
- Existe `snapshotOriginalJson` para comparar (Línea ~101)
- Existe `autoSaveStatus` para tracking (Línea ~928)
- ❌ NO hay función que compare si hay cambios no guardados
- ❌ NO hay diálogo al cerrar preguntando "¿Descartar cambios?"
- ❌ NO hay `compareSnapshots()` o similar

**Veredicto**: ❌ **NO IMPLEMENTADO**

---

### 3.3 Estados "Antes/Después" de Abrir Modal ❌ NO IMPLEMENTADO (Pero similar existe)

**Requerido en flujo.md** (Según documentación):
```tsx
const [quotationEstadoAntes, setQuotationEstadoAntes] = useState<{
  wasGlobal: boolean
  wasActive: boolean
} | null>(null)
```

**Implementación encontrada**: ⚠️ EXISTE PERO NO SE USA

Estados creados:
- ✅ `cotizacionAAbrir` (Línea ~172)
- ✅ `modoAbrir` (Línea ~173)
- ❌ NO existe `quotationEstadoAntes`
- ❌ NO hay tracking de "wasGlobal" antes de abrir

**Impacto**:
- Cuando usuario abre modal editable: NO se sabe si cambió de ACTIVA a INACTIVA
- Cuando usuario guarda: NO se sabe si debería haber sido activada

**Veredicto**: ❌ **NO IMPLEMENTADO - Falta estado para tracking**

---

### 3.4 Pregunta de Activación al Guardar Desde Modal Inactivo ❌ NO IMPLEMENTADO

**Requerido en flujo.md** (Escenario 3, al guardar):
```
Usuario edita cotización INACTIVA
  ↓
Click "Guardar" dentro del modal
  ↓
Sistema valida datos ✓
  ↓
ALERT: "¿Deseas activar esta cotización?"
  ├─ [SÍ] → Desactiva otras, activa esta, guarda, cierra
  └─ [NO] → Solo guarda cambios, mantiene inactiva, cierra
```

**Implementación encontrada**: ❌ NO EXISTE

**Función `guardarEdicion()`** (Líneas ~902-920):
```tsx
const guardarEdicion = async () => {
  // Solo actualiza snapshot, no maneja activación
  const snapshotActualizado = await actualizarSnapshot(...)
  setSnapshots(...)
  // ❌ No hay lógica de "¿Deseas activar?"
}
```

**Veredicto**: ❌ **NO IMPLEMENTADO**

---

### 3.5 Diferenciación de Guardado por Estado ANTES ❌ NO IMPLEMENTADO

**Requerido en flujo.md** (Matriz de decisiones):
```
if (wasGlobalBeforeOpening) {
  // Era ACTIVA → Solo guardar cambios
} else {
  // Era INACTIVA → Pregunta si activar
}
```

**Implementación encontrada**: ❌ NO EXISTE

**Problema**:
- Sistema siempre guarda igual independientemente del estado anterior
- No hay bifurcación en `guardarConfiguracionActual()` o `guardarEdicion()` 
- No hay variable para trackear estado anterior

**Veredicto**: ❌ **NO IMPLEMENTADO**

---

### 3.6 Alert Visual Para Cotización ACTIVA Siendo Editada ❌ NO IMPLEMENTADO

**Requerido en flujo.md**:
```
Cuando usuario abre "EDITAR" cotización ACTIVA:
  → ALERT A: "Esta es la cotización ACTIVA. 
              Los cambios serán actualizados al presionar Guardar"
    [Aceptar] → Entra a edición
    [Cancelar] → Cierra
```

**Implementación encontrada**: ❌ NO EXISTE

**Qué pasa ahora**:
- Usuario abre EDITAR cotización ACTIVA
- Modal abre directamente (sin alerta)
- Usuario edita
- Usuario guarda
- Cambios se aplican sin advertencia previa

**Lo que debería pasar**:
- Usuario abre EDITAR
- **ALERT**: "Esta es la cotización ACTIVA..."
- Usuario confirma
- Entonces abre modal

**Veredicto**: ❌ **NO IMPLEMENTADO**

---

## 🔍 PARTE 4: ANÁLISIS DE CASOS DE USO

### Caso 1: Ver cotización ACTIVA ✅ FUNCIONA
```
User → Click "Ver" en Cotización ACTIVA
  ↓
abrirModalVer(quotation)
  ↓
abrirModalConActivacion(quotation, 'ver')
  ↓
quotation.activo === true && quotation.isGlobal === true
  ↓
abrirModalEditarInterno(quotation, 'ver') ✅
  ↓
Modal abre read-only ✓
```

**Veredicto**: ✅ FUNCIONA CORRECTAMENTE

---

### Caso 2: Ver cotización INACTIVA ✅ FUNCIONA
```
User → Click "Ver" en Cotización INACTIVA
  ↓
abrirModalVer(quotation)
  ↓
abrirModalConActivacion(quotation, 'ver')
  ↓
quotation.activo === false || quotation.isGlobal === false
  ↓
Muestra diálogo: "Ver Solo Lectura" O "Activar y Editar" ✅
  ↓
Si "Ver Solo Lectura":
  abrirSinActivar() → readOnly=true ✅
  ↓
Si "Activar y Editar":
  activarYAbrirModal() → Activa + abre editable ✅
```

**Veredicto**: ✅ FUNCIONA CORRECTAMENTE

---

### Caso 3: Editar cotización ACTIVA ⚠️ INCOMPLETO
```
User → Click "Editar" en Cotización ACTIVA
  ↓
abrirModalEditar(quotation)
  ↓
abrirModalConActivacion(quotation, 'editar')
  ↓
quotation.activo === true && quotation.isGlobal === true
  ↓
❌ FALTA: ALERT A no aparece
  ↓
abrirModalEditarInterno(quotation, 'editar')
  ↓
Modal abre editable ✅
  ↓
User edita y guarda
  ↓
guardarConfiguracionActual() → Guarda cambios ✅
  ✅ Correcto (no pregunta activación porque ya está activa)
```

**Veredicto**: ⚠️ FALTA ALERT A PREVIO, PERO GUARDADO FUNCIONA BIEN

---

### Caso 4: Editar cotización INACTIVA ⚠️ INCOMPLETO
```
User → Click "Editar" en Cotización INACTIVA
  ↓
abrirModalEditar(quotation)
  ↓
abrirModalConActivacion(quotation, 'editar')
  ↓
quotation.activo === false || quotation.isGlobal === false
  ↓
Diálogo: "Cancelar" O "Activar y Editar"
  ↓
Si "Activar y Editar":
  activarYAbrirModal() ✅
    ├─ desactivarTodas() ✅
    ├─ recargarQuotations() ✅
    └─ abrirModalEditarInterno(quotation, 'editar') ✅
  ↓
Modal abre editable ✅
  ↓
User edita y guarda
  ↓
guardarConfigeracionActual() → Guarda cambios ✅
  ✓ Correcto (ya fue activada en el diálogo previo)
```

**Veredicto**: ✅ FUNCIONA, pero opciones podrían ser más claras

---

### Caso 5: Cerrar modal con cambios ❌ NO IMPLEMENTADO
```
User → Abre EDITAR
  ↓
Modal abre editable
  ↓
User modifica campos
  ↓
Click "Cerrar" sin guardar
  ↓
❌ FALTA: Pregunta "¿Descartar cambios?"
  ↓
Modal cierra directamente (cambios se pierden)
```

**Veredicto**: ❌ NO IMPLEMENTADO - Cambios se pierden silenciosamente

---

## 📋 PARTE 5: COMPARACIÓN CON MATRIZ DE FLUJO

**Según flujo_.md - Tabla "Ver vs Editar vs Nueva"**:

| Aspecto | VER | Implementado | EDITAR | Implementado | NUEVA | Implementado |
|---------|-----|-------------|--------|-------------|-------|-------------|
| Modal abre en | READ-ONLY | ✅ | EDITABLE | ✅ | EDITABLE | ✅ |
| readOnly | TRUE | ✅ | FALSE | ✅ | FALSE | ✅ |
| ¿Pregunta al abrir? | No | ✅ | SÍ (Alert) | ❌ | No | ✅ |
| Alert si ACTIVA | No | ✅ | "Los cambios..." | ❌ | N/A | - |
| Alert si INACTIVA | No | ✅ | "Podrá activar..." | ⚠️ (diálogo) | N/A | - |
| Inputs habilitados | ❌ NO | ✅ | ✅ SÍ | ✅ | ✅ SÍ | ✅ |
| Botón Guardar | ❌ Deshabilitado | ❌ (visible pero no debería) | ✅ Habilitado | ✅ | ✅ Habilitado | ✅ |
| Botón Descargar PDF | ✅ Habilitado | ✅ | ✅ Habilitado | ✅ | ✅ Habilitado | ✅ |
| Autoguardado activo | ❌ NO | ✓ (pero activo igual) | ✅ SÍ | ✅ | ✅ SÍ | ✅ |
| Al cerrar | Sin preguntar | ❌ (no pregunta) | Pregunta si hay cambios | ❌ | Pregunta si hay cambios | ❌ |
| Al guardar | N/A | - | Pregunta activación (si era inactiva) | ❌ | Desactiva todas, activa esta | ✅ |

---

## 🎯 PARTE 6: PROPUESTA DE SOLUCIÓN

### Cambios Necesarios (En Orden de Prioridad)

#### **PRIORIDAD CRÍTICA** (Fallos lógicos):

1. **Alert A al editar cotización ACTIVA** ❌
   - Donde: Función `abrirModalConActivacion()`
   - Qué: Agregar `window.alert()` o diálogo cuando `quotation.activo === true`
   - Impacto: Usuario sabe que está editando la ACTIVA

2. **Estado `quotationEstadoAntes`** ❌
   - Donde: Al abrir modal
   - Qué: Guardar `{ wasGlobal: boolean, wasActive: boolean }` antes de abrir
   - Impacto: Poder saber el estado anterior al guardar

3. **Pregunta de activación al guardar desde inactiva** ❌
   - Donde: `guardarEdicion()` o nueva función
   - Qué: Si la cotización era inactiva, preguntar "¿Deseas activar?"
   - Impacto: Usuario decide si activar después de editar

#### **PRIORIDAD ALTA** (Mejora UX):

4. **Detección de cambios sin guardar** ❌
   - Donde: Hook `useEffect` en modal
   - Qué: Comparar snapshot actual vs original
   - Impacto: Preguntar "¿Descartar cambios?" al cerrar

5. **Validación de dependencias entre TABs** ❌
   - Donde: `handleCambioTab()` en validación de destino
   - Qué: Antes de entrar a TAB, validar TABs previos
   - Impacto: Flujo más ordenado

6. **Deshabilitar botón Guardar en modo "Ver"** ⚠️
   - Donde: TabsModal component
   - Qué: Si `readOnly === true`, deshabilitar botón guardar
   - Impacto: No confunde al usuario

#### **PRIORIDAD MEDIA** (Polish):

7. **Mejorar textos de diálogos** ⚠️
   - Donde: Diálogo de activación (Línea ~3358)
   - Qué: Texto más claro: "Esta cotización está INACTIVA"
   - Impacto: Mejor comunicación

---

## 📊 RESUMEN FINAL

### Completitud por Funcionalidad

```
Nueva Cotización              ████████████████████ 100% ✅
Validación TABs             ████████████████████ 100% ✅
Indicadores TABs            ████████████████████ 100% ✅
Cambio TAB seguro           ████████████████████ 100% ✅
Guardado centralizado       ████████████████████ 100% ✅
Modal Ver                   ████████████████████ 100% ✅
Modal Editar ACTIVA         ██████████████░░░░░░  70% ⚠️
Modal Editar INACTIVA       ████████████████░░░░  80% ⚠️
Detectar cambios sin guardar ░░░░░░░░░░░░░░░░░░░░  0% ❌
Validar dependencias        ░░░░░░░░░░░░░░░░░░░░  0% ❌
Estados antes/después       ░░░░░░░░░░░░░░░░░░░░  0% ❌
Preguntas de confirmación   ██████░░░░░░░░░░░░░░ 30% ❌
─────────────────────────────────────────────────
TOTAL                       ███████████░░░░░░░░  60% ⚠️
```

### Estimación de Trabajo Restante

| Tarea | Líneas | Tiempo | Prioridad |
|-------|--------|--------|-----------|
| Alert A al editar ACTIVA | 30 | 15 min | CRÍTICA |
| Estado `quotationEstadoAntes` | 20 | 10 min | CRÍTICA |
| Pregunta activación al guardar | 50 | 30 min | CRÍTICA |
| Detección cambios sin guardar | 60 | 45 min | ALTA |
| Validación dependencias | 40 | 30 min | ALTA |
| Mejorar UX diálogos | 20 | 15 min | MEDIA |
| **TOTAL** | **220** | **2.5 horas** | - |

---

## ✅ VEREDICTO FINAL

**Estado Actual**: 60/100 (Funcional pero incompleto)

**¿Qué funciona bien?**
- ✅ Crear nueva cotización
- ✅ Validar TABs
- ✅ Bloquear navegación incompleta
- ✅ Guardar centralizado
- ✅ Ver cotizaciones
- ✅ Editar con diálogo de activación

**¿Qué no funciona?**
- ❌ Alert previo cuando editas ACTIVA
- ❌ Pregunta activación después de editar INACTIVA
- ❌ Detección cambios sin guardar
- ❌ Validación de dependencias entre TABs

**Recomendación**: 
Implementar los 3 cambios de prioridad CRÍTICA (~55 minutos) antes de que usuarios accedan al sistema. Los cambios de prioridad ALTA pueden venir después.

---

