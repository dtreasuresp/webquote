# 📋 PROPUESTA: ModalProgresoGuardado - Migración Completa

**Fecha**: 7 de Diciembre 2025  
**Estado**: 📊 Propuesta de Arquitectura  
**Objetivo**: Migrar lógica hardcodeada del modal de guardado a componente reutilizable

---

## 🎯 RESUMEN EJECUTIVO

Trasladar toda la lógica del modal `💾 Guardando Cotización...` de `administrador/page.tsx` (290+ líneas) a un componente `ModalProgresoGuardado.tsx` que:

- ✅ Mantiene 100% de funcionalidad actual
- ✅ Incluye flujo de cancelación con confirmación
- ✅ Maneja rollback de versiones
- ✅ Muestra detalles y resumen del proceso
- ✅ Reutilizable en otros contextos
- ✅ Código testeable y mantenible

---

## 📊 ANÁLISIS DE ESTADO ACTUAL

### Estados en page.tsx (Líneas 757-799)

```typescript
// ✅ Estado principal del modal
const [showModalProgresoGuardado, setShowModalProgresoGuardado] = useState(false)

// ✅ Resultado final del guardado
const [resultadoGuardado, setResultadoGuardado] = useState<'guardando' | 'exito' | 'cancelado' | 'error'>('guardando')

// ✅ Mensaje resumen
const [resumenGuardado, setResumenGuardado] = useState<string>('')

// ✅ Pasos del proceso
const [pasosGuardado, setPasosGuardado] = useState<{
  id: string
  label: string
  estado: 'pendiente' | 'activo' | 'completado' | 'error' | 'cancelado'
  detalle?: string
}[]>([
  { id: 'validar', label: 'Validando datos', estado: 'pendiente' },
  { id: 'version', label: 'Creando nueva versión', estado: 'pendiente' },
  { id: 'duplicar', label: 'Reasignando paquetes', estado: 'pendiente' },
  { id: 'activar', label: 'Activando versión', estado: 'pendiente' },
  { id: 'finalizar', label: 'Finalizando', estado: 'pendiente' },
])

// ✅ Cálculo de progreso
const progresoGuardado = useMemo(() => {
  const completados = pasosGuardado.filter(p => p.estado === 'completado').length
  const activo = pasosGuardado.find(p => p.estado === 'activo')
  return Math.min(100, completados * 20 + (activo ? 10 : 0))
}, [pasosGuardado])

// ✅ Cancelación de guardado solicitado
const [cancelarGuardadoSolicitado, setCancelarGuardadoSolicitado] = useState(false)

// ✅ Modal de confirmación de cancelación
const [showModalConfirmarCancelacion, setShowModalConfirmarCancelacion] = useState(false)

// ✅ Modal de resultado de cancelación
const [showModalResultadoCancelacion, setShowModalResultadoCancelacion] = useState(false)

// ✅ Resultado de cancelación
const [resultadoCancelacionExitoso, setResultadoCancelacionExitoso] = useState(false)

// ✅ Refs para tracking de versiones
const idVersionCreadaRef = useRef<string | null>(null)
const idVersionAnteriorRef = useRef<string | null>(null)
const abortControllerRef = useRef<AbortController | null>(null)
```

---

## 🔧 FUNCIONES CRÍTICAS A MIGRAR

### 1. rollbackGuardado() - Línea 2762
```typescript
/**
 * Función para hacer rollback de una versión de cotización creada
 * Se usa cuando el usuario cancela el proceso de guardado
 */
const rollbackGuardado = async (
  versionToDelete: string, 
  previousVersionId: string
): Promise<boolean> => {
  try {
    setMensajeGuardado('Revirtiendo cambios...')
    const response = await fetch('/api/quotation-config/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionToDelete, previousVersionId }),
    })

    const data = await response.json()

    if (data.success) {
      // Recargar datos para reflejar el estado anterior
      await recargarQuotations()
      const snapshotsActualizados = await obtenerSnapshotsCompleto()
      setSnapshots(snapshotsActualizados)
      return true
    } else {
      console.error('Error en rollback:', data.error)
      toast.error('Error al revertir los cambios')
      return false
    }
  } catch (error) {
    console.error('Error en rollback:', error)
    toast.error('Error al revertir los cambios')
    return false
  } finally {
    setMensajeGuardado('')
    idVersionCreadaRef.current = null
    idVersionAnteriorRef.current = null
  }
}
```

**Cambios para componente**:
- ✅ Extraer como callback `onRollback(versionToDelete, previousVersionId)`
- ✅ Componente NO hace fetch, delega al padre
- ✅ Padre maneja API calls
- ✅ Componente solo UI

---

### 2. confirmarCancelacionGuardado() - Línea 2800
```typescript
/**
 * Muestra diálogo de confirmación para cancelar el guardado
 */
const confirmarCancelacionGuardado = () => {
  setShowModalConfirmarCancelacion(true)
}
```

**Cambios**:
- ✅ Incluido como lógica interna
- ✅ Abre modal de confirmación integrado

---

### 3. ejecutarCancelacionGuardado() - Línea 2811
```typescript
/**
 * Ejecuta la cancelación del guardado
 * Aborta la solicitud fetch en curso y hace rollback si es necesario
 */
const ejecutarCancelacionGuardado = async () => {
  // Abortar la solicitud fetch en curso
  if (abortControllerRef.current) {
    abortControllerRef.current.abort()
  }
  
  setCancelarGuardadoSolicitado(true)
  setShowModalConfirmarCancelacion(false)
  
  // Marcar paso activo como cancelado en el modal de progreso
  setPasosGuardado(prev => prev.map(paso => 
    paso.estado === 'activo' 
      ? { ...paso, estado: 'cancelado' as const, detalle: '(cancelado)' }
      : paso
  ))
  
  setResumenGuardado('🔄 Cancelando operación...')
}
```

**Cambios**:
- ✅ Callback `onCancelRequest()` para que padre haga abort
- ✅ Componente maneja UI de cancelación
- ✅ Lógica de abort/rollback delegada

---

### 4. actualizarPasoGuardado() - Línea 2845
```typescript
/**
 * Helper para actualizar un paso específico del guardado
 */
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

**Cambios**:
- ✅ Convertir en método helper INTERNO del componente
- ✅ No necesita ser exportado

---

### 5. reiniciarPasosGuardado() - Línea 2856
```typescript
/**
 * Reinicia los pasos del guardado al estado inicial
 */
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

**Cambios**:
- ✅ Pasos por defecto configurables
- ✅ Puede venir como prop del padre
- ✅ O tener constante interna

---

## 🏗️ ARQUITECTURA PROPUESTA

### Estructura de ModalProgresoGuardado.tsx

```typescript
'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheck, FaSpinner, FaTimes, FaExclamationTriangle } from 'react-icons/fa'

// ==================== TIPOS ====================

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
  
  // Estado del guardado
  pasos: PasoGuardado[]
  resultado: 'guardando' | 'exito' | 'cancelado' | 'error'
  totalProgreso: number // 0-100
  resumen?: string // Mensaje final
  
  // Callbacks para acciones
  onCancelRequest?: () => void | Promise<void> // Usuario solicita cancelar
  onRollback?: (versionToDelete: string, previousVersionId: string) => Promise<boolean>
  
  // Data de versiones (para rollback)
  versionCreada?: string | null
  versionAnterior?: string | null
  
  // Config opcional
  pasosPorDefecto?: PasoGuardado[]
}

// ==================== COMPONENTE ====================

export default function ModalProgresoGuardado({
  isOpen,
  onClose,
  pasos,
  resultado,
  totalProgreso,
  resumen,
  onCancelRequest,
  onRollback,
  versionCreada,
  versionAnterior,
  pasosPorDefecto = [
    { id: 'validar', label: 'Validando datos', estado: 'pendiente' },
    { id: 'version', label: 'Creando nueva versión', estado: 'pendiente' },
    { id: 'duplicar', label: 'Reasignando paquetes', estado: 'pendiente' },
    { id: 'activar', label: 'Activando versión', estado: 'pendiente' },
    { id: 'finalizar', label: 'Finalizando', estado: 'pendiente' },
  ],
}: ModalProgresoGuardadoProps) {
  
  // ==================== ESTADO LOCAL ====================
  
  // Modal de confirmación de cancelación
  const [showModalConfirmarCancelacion, setShowModalConfirmarCancelacion] = useState(false)
  
  // Modal de resultado de cancelación
  const [showModalResultadoCancelacion, setShowModalResultadoCancelacion] = useState(false)
  
  // Si la cancelación fue exitosa
  const [resultadoCancelacionExitoso, setResultadoCancelacionExitoso] = useState(false)
  
  // Loading durante cancelación
  const [cancelandoEnCurso, setCancelandoEnCurso] = useState(false)
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // ==================== HELPERS ====================
  
  const confirmarCancelacion = () => {
    setShowModalConfirmarCancelacion(true)
  }
  
  const cancelarConfirmacion = () => {
    setShowModalConfirmarCancelacion(false)
  }
  
  const ejecutarCancelacion = async () => {
    try {
      setCancelandoEnCurso(true)
      
      // 1. Notificar al padre para abortar fetch
      if (onCancelRequest) {
        await onCancelRequest()
      }
      
      // 2. Cerrar modal de confirmación
      setShowModalConfirmarCancelacion(false)
      
      // 3. Intentar rollback si aplica
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
    } finally {
      setCancelandoEnCurso(false)
    }
  }
  
  const cerrarModalResultadoCancelacion = () => {
    setShowModalResultadoCancelacion(false)
    // También cerrar el modal principal
    if (onClose) {
      onClose()
    }
  }
  
  // ==================== RENDERS ====================
  
  // 1. Modal Principal (Progreso)
  // 2. Modal Confirmar Cancelación
  // 3. Modal Resultado Cancelación
  
  return (
    <>
      {/* MODAL PRINCIPAL */}
      <AnimatePresence>
        {isOpen && /* render principal */}
      </AnimatePresence>
      
      {/* MODAL CONFIRMAR CANCELACIÓN */}
      <AnimatePresence>
        {showModalConfirmarCancelacion && /* render confirmación */}
      </AnimatePresence>
      
      {/* MODAL RESULTADO CANCELACIÓN */}
      <AnimatePresence>
        {showModalResultadoCancelacion && /* render resultado */}
      </AnimatePresence>
    </>
  )
}

// ==================== EXPORTS ====================
export type { PasoGuardado, ModalProgresoGuardadoProps }
```

---

## 📍 METODOLOGÍA DE UBICACIÓN DE ARCHIVOS

### 1. **Componentes Nuevos**
```
📁 src/features/admin/components/
├── ModalProgresoGuardado.tsx (NUEVO - Componente principal + 2 modales anidados)
├── DialogoGenericoDinamico.tsx (EXISTENTE)
├── index.ts (UPDATE - Agregar exports)
└── ...otros
```

### 2. **Documentación de Propuestas**
```
📁 docs/propuestas/
├── PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md (NUEVO - Este archivo)
├── ...otras propuestas
```

### 3. **Documentación de Referencia**
```
📁 docs/
├── COMPARACION_MODAL_GUARDADO.md (YA EXISTE)
├── propuestas/
│   └── PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md (NUEVO)
└── ...otros
```

### 4. **Scripts Auxiliares** (Si necesita)
```
📁 scripts/
├── test-modal-progreso.js (OPCIONAL - Tests)
└── ...otros
```

---

## 🔄 MIGRACIÓN PASO A PASO

### Paso 1: Crear ModalProgresoGuardado.tsx Completo
- ✅ Incluir todos los 3 modales (progreso + confirmación + resultado)
- ✅ Incluir toda la lógica de cancelación
- ✅ Incluir cálculo de progreso
- ✅ Incluir renderizado completo (sin delegación a DialogoGenericoDinamico)

### Paso 2: Exportar en index.ts
- ✅ Agregar exports de ModalProgresoGuardado y tipos

### Paso 3: Actualizar administrador/page.tsx
- ✅ Importar ModalProgresoGuardado
- ✅ Reemplazar todos los `showModalProgresoGuardado`, `resultadoGuardado`, `pasosGuardado`, etc.
- ✅ Pasar callbacks de rollback y cancelación
- ✅ Eliminar 290+ líneas de JSX del modal

### Paso 4: Testing
- ✅ Verificar flujo normal de guardado
- ✅ Verificar flujo de cancelación
- ✅ Verificar rollback exitoso/fallido
- ✅ Verificar mensajes de error

---

## 🎨 RENDERIZADO COMPLETO ESPERADO

### Modal Principal (Progreso)
- Header con icono y título dinámico
- Lista de pasos con iconos de estado
- Barra de progreso 0-100%
- Resumen final (si existe)
- Botón "Cancelar Guardado" (solo en progreso)
- Botón "Cerrar" (después de completar)

### Modal Confirmar Cancelación
- Título: "Cancelar Guardado"
- Texto: "¿Estás seguro de que deseas cancelar el proceso de guardado?"
- Advertencia: "Esta acción detendrá el guardado y eliminará cualquier dato parcial"
- Botones: "No, continuar guardando" | "Sí, cancelar guardado"

### Modal Resultado Cancelación
- Icono y color según resultado (✅ o ❌)
- Mensaje: "Cancelación exitosa" o "Error al cancelar"
- Botón "Entendido" para cerrar

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Leer lógica completa de page.tsx (3 modales + 5 funciones)
- [ ] Crear ModalProgresoGuardado.tsx con toda la lógica
- [ ] Agregar exports en index.ts
- [ ] Crear archivo de propuesta en docs/propuestas/
- [ ] Actualizar administrador/page.tsx
- [ ] Testing del flujo completo
- [ ] Validar que no hay regresión

---

## 📝 NOTAS IMPORTANTES

1. **Componente STANDALONE**: ModalProgresoGuardado es independiente
2. **NO depende de DialogoGenericoDinamico**: Usa Framer Motion directamente
3. **Callbacks de ciclo de vida**: Padre controla abort y rollback
4. **Estado UI completo**: Incluye los 2 modales anidados
5. **Reutilizable**: Puede usarse en otros contextos que necesiten progreso + cancelación

---

## 📚 REFERENCIAS

- **Actual**: `src/app/administrador/page.tsx` líneas 6087-6400 (3 modales)
- **Actual**: `src/app/administrador/page.tsx` líneas 757-799 (estados)
- **Actual**: `src/app/administrador/page.tsx` líneas 2762-2870 (funciones)
- **Nuevo**: `src/features/admin/components/ModalProgresoGuardado.tsx` (CREAR)
- **Documento**: `docs/propuestas/PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md` (Este archivo)
