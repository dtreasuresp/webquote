# 📋 ANÁLISIS EXHAUSTIVO: TODO para migrar a ModalProgresoGuardado.tsx

**Fecha**: 7 de Diciembre 2025  
**Objetivo**: Documentar CADA línea, estado, función y renderizado a migrar

---

## 🎯 SECCIÓN 1: ESTADOS Y REFS (Lo que el componente NECESITA)

### 1.1 ESTADOS QUE VIENEN DE PROPS (Padre los maneja)
```typescript
// El PADRE (page.tsx) mantiene y gestiona estos:
// showModalProgresoGuardado - controlado por <ModalProgresoGuardado isOpen={showModalProgresoGuardado} />
// guardandoCotizacion - manejado por padre
// idVersionCreadaRef - manejado por padre
// idVersionAnteriorRef - manejado por padre
// abortControllerRef - manejado por padre
```

### 1.2 ESTADOS QUE MIGRAN AL COMPONENTE (Internos)

```typescript
✅ MOVER ADENTRO del componente:

1. showModalConfirmarCancelacion = useState(false)
   └─ Controla apertura del modal de confirmación

2. showModalResultadoCancelacion = useState(false)
   └─ Controla apertura del modal de resultado

3. resultadoCancelacionExitoso = useState(false)
   └─ Indica si rollback fue exitoso o no

4. cancelarGuardadoSolicitado = useState(false)
   └─ Flag cuando usuario solicita cancelación
   └─ Viene del PADRE pero se replica en componente

5. Ref: abortControllerRef = useRef<AbortController | null>(null)
   └─ Para poder abortar fetch en curso
   └─ El padre también lo maneja, coordinar con callback
```

### 1.3 DATOS QUE VIENEN COMO PROPS (Necesarios del padre)

```typescript
✅ COMO PROPS:

1. isOpen: boolean
   └─ Control de visibilidad del modal principal

2. onClose: () => void
   └─ Callback cuando se cierra el modal

3. pasos: Array<PasoGuardado>
   └─ Array de pasos actual

4. resultado: 'guardando' | 'exito' | 'cancelado' | 'error'
   └─ Estado actual del guardado

5. totalProgreso: number (0-100)
   └─ Porcentaje de progreso calculado en padre

6. resumen: string
   └─ Mensaje de resumen final

7. versionCreada: string | null
   └─ ID de versión creada (para rollback)

8. versionAnterior: string | null
   └─ ID de versión anterior (para rollback)

9. cancelarGuardadoSolicitado: boolean
   └─ Flag de cancelación solicitada

10. onCancelRequest: () => void | Promise<void>
    └─ Callback cuando usuario hace clic "Cancelar"

11. onRollback: (versionToDelete: string, previousVersionId: string) => Promise<boolean>
    └─ Callback para ejecutar rollback
```

---

## 🔧 SECCIÓN 2: FUNCIONES A MIGRAR

### 2.1 rollbackGuardado() - LÍNEA 2763
**Status**: Se MANTIENE en page.tsx, NO se copia  
**Motivo**: Necesita acceso a APIs y contexto de page.tsx  
**Alternativa**: Se pasa como callback `onRollback`

```typescript
✅ MANTENER EN page.tsx:
const rollbackGuardado = async (versionToDelete: string, previousVersionId: string): Promise<boolean> => {
  // 20 líneas de código
  // Llamadas a API /api/quotation-config/rollback
  // Llamadas a recargarQuotations()
  // Llamadas a obtenerSnapshotsCompleto()
  // Actualiza setSnapshots()
  // Finalmente limpia refs
}

🔄 EN ModalProgresoGuardado:
Recibir como prop: onRollback(versionToDelete, previousVersionId)
Llamar cuando necesite rollback: await onRollback(...)
```

### 2.2 confirmarCancelacionGuardado() - LÍNEA 2799
**Status**: MIGRA al componente (simplemente abre modal)  
**Líneas**: 2 líneas

```typescript
✅ COPIAR AL COMPONENTE:
const confirmarCancelacion = () => {
  setShowModalConfirmarCancelacion(true)
}
```

### 2.3 ejecutarCancelacionGuardado() - LÍNEA 2808
**Status**: MIGRA con CAMBIOS (necesita callback)  
**Líneas**: 25 líneas

```typescript
ACTUAL (page.tsx):
const ejecutarCancelacionGuardado = async () => {
  // Abortar la solicitud fetch en curso
  if (abortControllerRef.current) {
    abortControllerRef.current.abort()
  }
  
  setCancelarGuardadoSolicitado(true)
  setShowModalConfirmarCancelacion(false)
  
  // Marcar paso activo como cancelado
  setPasosGuardado(prev => prev.map(paso => 
    paso.estado === 'activo' 
      ? { ...paso, estado: 'cancelado' as const, detalle: '(cancelado)' }
      : paso
  ))
  
  setResumenGuardado('🔄 Cancelando operación...')
  
  // NOTA: El rollback se maneja en el catch de guardarConfiguracionActual
}

✅ CAMBIAR EN COMPONENTE:
const ejecutarCancelacion = async () => {
  try {
    // 1. Llamar callback de cancelación (padre aborta)
    if (onCancelRequest) {
      await onCancelRequest()
    }
    
    // 2. Cerrar modal confirmación
    setShowModalConfirmarCancelacion(false)
    
    // 3. Ejecutar rollback
    let rollbackExitoso = false
    if (onRollback && versionCreada && versionAnterior) {
      rollbackExitoso = await onRollback(versionCreada, versionAnterior)
    }
    
    // 4. Mostrar resultado
    setResultadoCancelacionExitoso(rollbackExitoso)
    setShowModalResultadoCancelacion(true)
  } catch (error) {
    console.error('Error durante cancelación:', error)
    setResultadoCancelacionExitoso(false)
    setShowModalResultadoCancelacion(true)
  }
}
```

### 2.4 actualizarPasoGuardado() - LÍNEA 2836
**Status**: NO MIGRA (padre lo llama)  
**Motivo**: El padre gestiona pasosGuardado, no el componente

```typescript
✅ MANTENER EN page.tsx:
const actualizarPasoGuardado = (
  pasoId: string, 
  estado: 'pendiente' | 'activo' | 'completado' | 'error' | 'cancelado',
  detalle?: string
) => {
  setPasosGuardado(prev => prev.map(paso => 
    paso.id === pasoId 
      ? { ...paso, estado, detalle } 
      : paso
  ))
}
```

### 2.5 reiniciarPasosGuardado() - LÍNEA 2851
**Status**: NO MIGRA (padre lo llama)  
**Motivo**: El padre gestiona pasosGuardado

```typescript
✅ MANTENER EN page.tsx:
const reiniciarPasosGuardado = () => {
  setPasosGuardado([
    { id: 'validar', label: 'Validando datos', estado: 'pendiente' },
    { id: 'version', label: 'Creando nueva versión', estado: 'pendiente' },
    { id: 'duplicar', label: 'Reasignando paquetes', estado: 'pendiente' },
    { id: 'activar', label: 'Activando versión', estado: 'pendiente' },
    { id: 'finalizar', label: 'Finalizando', estado: 'pendiente' },
  ])
  setResultadoGuardado('guardando')
  setResumenGuardado('')
}
```

---

## 🎨 SECCIÓN 3: RENDERIZADO JSX A MIGRAR

### 3.1 MODAL PRINCIPAL - LÍNEAS 6087-6266 (180 líneas)

```typescript
✅ COPIAR COMPLETAMENTE:

{showModalProgresoGuardado && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1100]"
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: -10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: -10 }}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/5 w-full mx-4 max-w-md bg-gradient-to-b from-[#161b22] to-[#0d1117] border overflow-hidden ${
        resultadoGuardado === 'exito' ? 'border-[#238636]' :
        resultadoGuardado === 'cancelado' ? 'border-[#d29922]' :
        resultadoGuardado === 'error' ? 'border-[#da3633]' :
        'border-[#30363d]'
      }`}
    >
      {/* Header */}
      {/* Body */}
      {/* Footer */}
    </motion.div>
  </motion.div>
)}

CAMBIOS:
- showModalProgresoGuardado → isOpen (prop)
- resultadoGuardado → resultado (prop)
- pasosGuardado → pasos (prop)
- resumenGuardado → resumen (prop)
- progresoGuardado → totalProgreso (prop)
```

### 3.2 HEADER DEL MODAL - LÍNEAS 6093-6129 (37 líneas)

```typescript
✅ COPIAR Y AJUSTAR:

{/* Header */}
<div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]">
  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
    resultadoGuardado === 'exito' ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] shadow-[#238636]/20' :
    resultadoGuardado === 'cancelado' ? 'bg-gradient-to-br from-[#d29922] to-[#e3b341] shadow-[#d29922]/20' :
    resultadoGuardado === 'error' ? 'bg-gradient-to-br from-[#da3633] to-[#f85149] shadow-[#da3633]/20' :
    'bg-gradient-to-br from-[#58a6ff] to-[#388bfd] shadow-[#58a6ff]/20'
  }`}>
    {resultadoGuardado === 'exito' ? (
      <FaCheck className="text-white text-sm" />
    ) : resultadoGuardado === 'cancelado' ? (
      <FaExclamationTriangle className="text-white text-sm" />
    ) : resultadoGuardado === 'error' ? (
      <FaTimes className="text-white text-sm" />
    ) : (
      <FaSpinner className="text-white text-sm animate-spin" />
    )}
  </div>
  <h3 className="text-white font-semibold text-base">
    {resultadoGuardado === 'exito' ? '✅ Cotización Guardada' :
     resultadoGuardado === 'cancelado' ? '⚠️ Guardado Cancelado' :
     resultadoGuardado === 'error' ? '❌ Error al Guardar' :
     '💾 Guardando Cotización...'}
  </h3>
</div>

CAMBIOS:
- resultadoGuardado → resultado (prop)
```

### 3.3 BODY DEL MODAL - LÍNEAS 6131-6220 (90 líneas)

```typescript
✅ COPIAR COMPLETAMENTE:

{/* Body - Pasos */}
<div className="px-4 py-4 space-y-3">
  {/* Lista de pasos */}
  <div className="space-y-2">
    {pasosGuardado.map((paso) => (
      <div key={paso.id} className="flex items-center gap-3">
        {/* Icono de estado */}
        {/* Texto del paso */}
        {/* Detalle si existe */}
      </div>
    ))}
  </div>

  {/* Barra de progreso */}
  <div className="mt-4">
    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
      <motion.div 
        className={`h-full rounded-full ${
          resultadoGuardado === 'exito' ? 'bg-gradient-to-r from-[#238636] to-[#2ea043]' :
          resultadoGuardado === 'cancelado' ? 'bg-gradient-to-r from-[#d29922] to-[#e3b341]' :
          resultadoGuardado === 'error' ? 'bg-gradient-to-r from-[#da3633] to-[#f85149]' :
          'bg-gradient-to-r from-[#58a6ff] to-[#388bfd]'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${progresoGuardado}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
    <div className="flex justify-end mt-1">
      <span className="text-[10px] text-[#8b949e] tabular-nums">{progresoGuardado}%</span>
    </div>
  </div>

  {/* Mensaje de advertencia durante guardado */}
  {resultadoGuardado === 'guardando' && (
    <div className="mt-3 p-3 bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg">
      <p className="text-[#e3b341] text-xs leading-relaxed">
        ⚠️ Cancelar detendrá el proceso y revertirá cualquier cambio parcial en la base de datos.
      </p>
    </div>
  )}

  {/* Resumen final */}
  {resumenGuardado && resultadoGuardado !== 'guardando' && (
    <div className={`mt-3 p-3 rounded-lg ${
      resultadoGuardado === 'exito' ? 'bg-[#238636]/10 border border-[#238636]/30' :
      resultadoGuardado === 'cancelado' ? 'bg-[#d29922]/10 border border-[#d29922]/30' :
      'bg-[#da3633]/10 border border-[#da3633]/30'
    }`}>
      <p className={`text-sm leading-relaxed whitespace-pre-line ${
        resultadoGuardado === 'exito' ? 'text-[#7ee787]' :
        resultadoGuardado === 'cancelado' ? 'text-[#e3b341]' :
        'text-[#f85149]'
      }`}>
        {resumenGuardado}
      </p>
    </div>
  )}
</div>

CAMBIOS:
- pasosGuardado → pasos (prop)
- progresoGuardado → totalProgreso (prop)
- resultadoGuardado → resultado (prop)
- resumenGuardado → resumen (prop)
```

### 3.4 FOOTER DEL MODAL - LÍNEAS 6222-6247 (26 líneas)

```typescript
✅ COPIAR Y AJUSTAR:

{/* Footer - Botones */}
<div className="flex gap-3 px-4 py-3 border-t border-[#30363d] bg-[#161b22]/80 justify-end">
  {resultadoGuardado === 'guardando' ? (
    <button
      onClick={confirmarCancelacionGuardado}
      disabled={cancelarGuardadoSolicitado}
      className="min-w-[160px] px-4 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded-md transition-colors text-sm font-medium border border-[#da3633] whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FaTimes size={12} />
      Cancelar Guardado
    </button>
  ) : (
    <button
      onClick={() => {
        setShowModalProgresoGuardado(false)
        setGuardandoCotizacion(false)
        idVersionCreadaRef.current = null
        idVersionAnteriorRef.current = null
      }}
      className={`min-w-[120px] px-4 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 ${
        resultadoGuardado === 'exito' 
          ? 'bg-[#238636] hover:bg-[#2ea043] text-white' 
          : 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]'
      }`}
    >
      {resultadoGuardado === 'exito' ? (
        <>
          <FaCheck size={12} />
          Cerrar
        </>
      ) : (
        'Entendido'
      )}
    </button>
  )}
</div>

CAMBIOS:
- resultadoGuardado → resultado (prop)
- cancelarGuardadoSolicitado → prop o estado interno
- confirmarCancelacionGuardado → confirmarCancelacion (función interna)
- onClick cerrar → onClose callback
```

### 3.5 MODAL CONFIRMAR CANCELACIÓN - LÍNEAS 6284-6324 (41 líneas)

```typescript
✅ COPIAR COMPLETAMENTE:

{/* ==================== MODAL CONFIRMAR CANCELACIÓN ==================== */}
<AnimatePresence>
  {showModalConfirmarCancelacion && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1100]"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/5 w-full mx-4 max-w-md bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#d29922] overflow-hidden"
      >
        {/* Header */}
        {/* Body */}
        {/* Footer */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

CAMBIOS:
- showModalConfirmarCancelacion → estado interno
```

### 3.6 MODAL RESULTADO CANCELACIÓN - LÍNEAS 6337-6400+ (65 líneas)

```typescript
✅ COPIAR COMPLETAMENTE:

{/* ==================== MODAL RESULTADO CANCELACIÓN ==================== */}
<AnimatePresence>
  {showModalResultadoCancelacion && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1100]"
      onClick={() => setShowModalResultadoCancelacion(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()}
        className={`rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/5 w-full mx-4 max-w-md bg-gradient-to-b from-[#161b22] to-[#0d1117] border ${
          resultadoCancelacionExitoso ? 'border-[#238636]' : 'border-[#da3633]'
        } overflow-hidden`}
      >
        {/* Header */}
        {/* Body */}
        {/* Footer */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

CAMBIOS:
- showModalResultadoCancelacion → estado interno
- resultadoCancelacionExitoso → estado interno
```

---

## 📦 SECCIÓN 4: IMPORTS NECESARIOS

```typescript
✅ IMPORTS A AGREGAR EN ModalProgresoGuardado.tsx:

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCheck, 
  FaSpinner, 
  FaTimes, 
  FaExclamationTriangle 
} from 'react-icons/fa'
```

---

## 🎯 SECCIÓN 5: TIPOS E INTERFACES

```typescript
✅ CREAR INTERFACES:

export interface PasoGuardado {
  id: string
  label: string
  estado: 'pendiente' | 'activo' | 'completado' | 'error' | 'cancelado'
  detalle?: string
}

export interface ModalProgresoGuardadoProps {
  // Control de visibilidad
  isOpen: boolean
  onClose: () => void
  
  // Datos
  pasos: PasoGuardado[]
  resultado: 'guardando' | 'exito' | 'cancelado' | 'error'
  totalProgreso: number // 0-100
  resumen?: string
  
  // Versiones (para rollback)
  versionCreada?: string | null
  versionAnterior?: string | null
  
  // Flags
  cancelarGuardadoSolicitado?: boolean
  
  // Callbacks
  onCancelRequest?: () => void | Promise<void>
  onRollback?: (versionToDelete: string, previousVersionId: string) => Promise<boolean>
}
```

---

## ✅ CHECKLIST DE MIGRACIÓN

### Lo que SE COPIA al componente:
- [x] Estados: showModalConfirmarCancelacion, showModalResultadoCancelacion, resultadoCancelacionExitoso
- [x] Función: confirmarCancelacionGuardado() (2 líneas)
- [x] Función: ejecutarCancelacionGuardado() (25 líneas - CON CAMBIOS)
- [x] Renderizado Modal Principal (180 líneas)
- [x] Renderizado Modal Confirmación (41 líneas)
- [x] Renderizado Modal Resultado (65 líneas)
- [x] Todos los JSX de headers, bodies, footers
- [x] Todos los colores y estilos
- [x] Todas las animaciones Framer Motion
- [x] Todos los iconos React-Icons

### Lo que NO se copia (Padre lo mantiene):
- [ ] rollbackGuardado() - se pasa como callback
- [ ] actualizarPasoGuardado() - padre lo llama
- [ ] reiniciarPasosGuardado() - padre lo llama
- [ ] showModalProgresoGuardado state - controlado por padre
- [ ] resultadoGuardado state - controlado por padre
- [ ] pasosGuardado state - controlado por padre
- [ ] progresoGuardado useMemo - controlado por padre
- [ ] resumenGuardado state - controlado por padre
- [ ] cancelarGuardadoSolicitado (del guardado principal) - padre lo controla

---

## 📊 RESUMEN DE LÍNEAS

| Componente | Líneas | Status |
|------------|--------|--------|
| Estados internos | 4 | ✅ Copiar |
| Función confirmar | 2 | ✅ Copiar |
| Función ejecutar | 25 | ✅ Copiar (modificado) |
| Modal principal | 180 | ✅ Copiar |
| Modal confirmación | 41 | ✅ Copiar |
| Modal resultado | 65 | ✅ Copiar |
| Imports | 5 | ✅ Agregar |
| Interfaces | 20 | ✅ Crear |
| **TOTAL** | **~340** | **✅** |

---

## 🚀 PRÓXIMO PASO

**Crear ModalProgresoGuardado.tsx con:**
- 1 archivo con ~400-450 líneas de código
- 3 modales completos renderizados
- 2 funciones internas (confirmar + ejecutar)
- 4 estados internos
- Props para comunicación con padre
- 100% de funcionalidad del actual
