# ✅ CHECKLIST: IMPLEMENTACIÓN ModalProgresoGuardado

**Versión**: 1.0  
**Fecha**: 7 de Diciembre 2025  
**Estado**: LISTO PARA IMPLEMENTAR

---

## 📋 PRE-IMPLEMENTACIÓN

### Verificación de Documentación
- [x] ✅ Propuesta técnica completa creada
- [x] ✅ Propuesta resumen creada
- [x] ✅ Propuesta visual creada
- [x] ✅ Metodología de ubicación documentada
- [x] ✅ Análisis comparativo completado
- [x] ✅ Índice de referencia creado
- [x] ✅ Propuesta final creada
- [x] ✅ Este checklist creado

### Verificación de Ubicación
- [x] ✅ Docs en `docs/propuestas/` ✓
- [x] ✅ Docs en `docs/` ✓
- [x] ✅ Estructura carpetas respetada ✓
- [x] ✅ Sin archivos sueltos en root ✓

### Verificación de Análisis
- [x] ✅ 290+ líneas identificadas
- [x] ✅ 9 estados catalogados
- [x] ✅ 5 funciones mapeadas
- [x] ✅ 3 modales identificados
- [x] ✅ Riesgos analizados
- [x] ✅ Mitigaciones definidas

---

## 🔧 FASE 1: CREAR ModalProgresoGuardado.tsx

### Paso 1: Estructura Base
- [ ] Crear archivo: `src/features/admin/components/ModalProgresoGuardado.tsx`
- [ ] Agregar imports necesarios:
  - [ ] React, { useState, useCallback, useMemo, useRef }
  - [ ] Framer Motion: motion, AnimatePresence
  - [ ] React-Icons: FaCheck, FaSpinner, FaTimes, FaExclamationTriangle
  - [ ] Tipos: React.FC, ReactNode, etc.

### Paso 2: Tipos e Interfaces
- [ ] Crear interface `PasoGuardado`:
  - [ ] id: string
  - [ ] label: string
  - [ ] estado: 'pendiente' | 'activo' | 'completado' | 'error' | 'cancelado'
  - [ ] detalle?: string

- [ ] Crear interface `ModalProgresoGuardadoProps`:
  - [ ] isOpen: boolean
  - [ ] onClose: () => void
  - [ ] pasos: PasoGuardado[]
  - [ ] resultado: 'guardando' | 'exito' | 'cancelado' | 'error'
  - [ ] totalProgreso: number
  - [ ] resumen?: string
  - [ ] onCancelRequest?: () => void | Promise<void>
  - [ ] onRollback?: (versionToDelete, previousVersionId) => Promise<boolean>
  - [ ] versionCreada?: string | null
  - [ ] versionAnterior?: string | null
  - [ ] pasosPorDefecto?: PasoGuardado[]

### Paso 3: Estados Locales
- [ ] Estado: showModalConfirmarCancelacion (boolean)
- [ ] Estado: showModalResultadoCancelacion (boolean)
- [ ] Estado: resultadoCancelacionExitoso (boolean)
- [ ] Estado: cancelandoEnCurso (boolean)
- [ ] Ref: abortControllerRef

### Paso 4: Funciones Internas
- [ ] confirmarCancelacion(): void
- [ ] cancelarConfirmacion(): void
- [ ] ejecutarCancelacion(): Promise<void>
- [ ] cerrarModalResultadoCancelacion(): void

### Paso 5: Renderizado Modal Principal
- [ ] AnimatePresence wrapper
- [ ] Motion.div backdrop (blur, background)
- [ ] Motion.div content (spring animation)
  - [ ] Header (icono + título dinámico + botón cerrar)
  - [ ] Body
    - [ ] Lista de pasos con iconos
    - [ ] Barra de progreso (0-100%)
    - [ ] Advertencia durante guardado
    - [ ] Resumen final
  - [ ] Footer
    - [ ] Botón "Cancelar Guardado" (si guardando)
    - [ ] Botón "Cerrar" (si completado)

### Paso 6: Renderizado Modal Confirmación
- [ ] AnimatePresence wrapper
- [ ] Motion.div backdrop
- [ ] Motion.div content
  - [ ] Header: "Cancelar Guardado"
  - [ ] Body: "¿Estás seguro?" + Advertencia
  - [ ] Footer: 2 botones

### Paso 7: Renderizado Modal Resultado
- [ ] AnimatePresence wrapper
- [ ] Motion.div backdrop
- [ ] Motion.div content
  - [ ] Header: Icono + Título dinámico
  - [ ] Body: Mensaje según resultado
  - [ ] Footer: Botón "Entendido"

### Paso 8: Colores Dinámicos
- [ ] Success: Verde (#238636)
- [ ] Error: Rojo (#da3633)
- [ ] Warning: Amarillo (#d29922)
- [ ] Progress: Azul (#58a6ff)
- [ ] Backgrounds: GitHub dark (#161b22, #0d1117)
- [ ] Borders: (#30363d)

### Paso 9: Animaciones
- [ ] Framer Motion spring: damping 30, stiffness 400
- [ ] Backdrop blur: md
- [ ] Scale: 0.95 → 1
- [ ] Opacity: 0 → 1
- [ ] Progress bar: animate width

---

## 📝 FASE 2: ACTUALIZAR index.ts

### Paso 1: Agregar Imports
- [ ] import { ModalProgresoGuardado } from './ModalProgresoGuardado'
- [ ] import type { ModalProgresoGuardadoProps, PasoGuardado } from './ModalProgresoGuardado'

### Paso 2: Agregar Exports
- [ ] export { ModalProgresoGuardado }
- [ ] export type { ModalProgresoGuardadoProps, PasoGuardado }

### Paso 3: Verificar Orden
- [ ] Mantener orden alfabético
- [ ] Mantener exports por categoría

---

## 🔄 FASE 3: REFACTORIZAR administrador/page.tsx

### Paso 1: Agregar Import
- [ ] import { ModalProgresoGuardado } from '@/features/admin/components'

### Paso 2: Reemplazar Renderizado
- [ ] Buscar: `{showModalProgresoGuardado && (` (línea 6087)
- [ ] Eliminar: 290+ líneas de 3 modales
- [ ] Reemplazar con:
  ```typescript
  <ModalProgresoGuardado
    isOpen={showModalProgresoGuardado}
    onClose={() => {
      setShowModalProgresoGuardado(false)
      setGuardandoCotizacion(false)
      idVersionCreadaRef.current = null
      idVersionAnteriorRef.current = null
    }}
    pasos={pasosGuardado}
    resultado={resultadoGuardado}
    totalProgreso={progresoGuardado}
    resumen={resumenGuardado}
    versionCreada={idVersionCreadaRef.current}
    versionAnterior={idVersionAnteriorRef.current}
    onCancelRequest={() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }}
    onRollback={rollbackGuardado}
  />
  ```

### Paso 2: MANTENER Estas Funciones (no eliminar)
- [ ] ✅ rollbackGuardado() - necesaria en page.tsx
- [ ] ✅ confirmarCancelacionGuardado() - será callback
- [ ] ✅ ejecutarCancelacionGuardado() - será callback
- [ ] ✅ actualizarPasoGuardado() - usada en el flujo
- [ ] ✅ reiniciarPasosGuardado() - usada en el flujo

### Paso 3: ELIMINAR (ahora están en componente)
- [ ] ❌ showModalConfirmarCancelacion state
- [ ] ❌ showModalResultadoCancelacion state
- [ ] ❌ resultadoCancelacionExitoso state
- [ ] ❌ Renderizado de Modal Confirmación (290+ líneas)
- [ ] ❌ Renderizado de Modal Resultado

### Paso 4: MANTENER Estos Estados (todavía necesarios)
- [ ] ✅ showModalProgresoGuardado
- [ ] ✅ resultadoGuardado
- [ ] ✅ resumenGuardado
- [ ] ✅ pasosGuardado
- [ ] ✅ progresoGuardado
- [ ] ✅ cancelarGuardadoSolicitado
- [ ] ✅ idVersionCreadaRef
- [ ] ✅ idVersionAnteriorRef
- [ ] ✅ abortControllerRef

---

## 🧪 FASE 4: TESTING

### Caso de Prueba 1: Guardado Normal
- [ ] Abrir modal progreso
- [ ] Verificar pasos iniciales pendientes
- [ ] Verificar progreso 0%
- [ ] Simular paso 1 completado: progreso ~20%
- [ ] Simular paso 2 activo: progreso ~30%
- [ ] Simular paso 3 completado: progreso ~40%
- [ ] Simular todos completados: progreso 100%
- [ ] Verificar título: "✅ Cotización Guardada"
- [ ] Verificar resumen muestra correctamente
- [ ] Botón "Cerrar" funciona
- [ ] Modal cierra

### Caso de Prueba 2: Cancelación Durante Progreso
- [ ] Abrir modal progreso
- [ ] Verificar botón "Cancelar Guardado" visible
- [ ] Hacer clic en botón "Cancelar Guardado"
- [ ] Modal confirmación abre
- [ ] Verificar texto de confirmación
- [ ] Hacer clic "No, continuar"
- [ ] Modal confirmación cierra
- [ ] Progreso continúa
- [ ] Modal cancelación NO abre

### Caso de Prueba 3: Cancelación Exitosa
- [ ] Abrir modal progreso
- [ ] Hacer clic "Cancelar Guardado"
- [ ] Modal confirmación abre
- [ ] Hacer clic "Sí, cancelar"
- [ ] Verificar onCancelRequest() fue llamado
- [ ] Verificar onRollback() fue llamado
- [ ] Modal resultado abre
- [ ] Verificar icono éxito (check verde)
- [ ] Verificar texto: "Cancelación exitosa"
- [ ] Hacer clic "Entendido"
- [ ] Modal cierra completamente

### Caso de Prueba 4: Cancelación Fallida
- [ ] Simular rollback fallido
- [ ] Modal resultado abre
- [ ] Verificar icono error (X rojo)
- [ ] Verificar texto: "Error al cancelar"
- [ ] Hacer clic "Entendido"
- [ ] Modal cierra

### Caso de Prueba 5: Error Durante Guardado
- [ ] Abrir modal progreso
- [ ] Simular error en paso
- [ ] Verificar paso marcado como error
- [ ] Verificar título: "❌ Error al Guardar"
- [ ] Verificar botón "Cerrar" visible
- [ ] Hacer clic cerrar
- [ ] Modal cierra

### Caso de Prueba 6: Detalles y Resumen
- [ ] Verificar detalles de pasos se muestran
- [ ] Verificar resumen muestra: "🎉 Nueva versión V2 creada..."
- [ ] Verificar colores resumen según estado
- [ ] Verificar estilos resumen correctos

### Caso de Prueba 7: Barra de Progreso
- [ ] Verificar progreso empieza en 0%
- [ ] Verificar progreso se actualiza
- [ ] Verificar progreso llega a 100%
- [ ] Verificar animación suave
- [ ] Verificar color progreso cambia según estado

### Caso de Prueba 8: Animaciones
- [ ] Verificar modal abre con spring animation
- [ ] Verificar modal cierra con spring animation
- [ ] Verificar backdrop tiene blur
- [ ] Verificar transiciones suaves

### Caso de Prueba 9: Tema Visual
- [ ] Verificar colores GitHub dark
- [ ] Verificar borders (#30363d)
- [ ] Verificar backgrounds gradientes
- [ ] Verificar iconos correctos

### Caso de Prueba 10: Props Dinámicas
- [ ] Cambiar pasos en runtime
- [ ] Cambiar resultado en runtime
- [ ] Cambiar progreso en runtime
- [ ] Cambiar resumen en runtime
- [ ] Verificar componente actualiza

---

## 🎯 FASE 5: VERIFICACIÓN FINAL

### Código
- [ ] Linter sin errores
- [ ] TypeScript sin errores
- [ ] No hay console.error
- [ ] No hay console.warn
- [ ] Imports optimizados
- [ ] Exports correctos

### Funcionalidad
- [ ] Todos los casos de prueba pasan
- [ ] No hay regresiones en page.tsx
- [ ] Flujo de cancelación completo
- [ ] Mensajes aparecen correctamente
- [ ] Animaciones son suaves

### Documentación
- [ ] Componente documentado (JSDoc)
- [ ] Props documentadas
- [ ] Tipos exportados correctamente
- [ ] Uso documentado en index.ts

### Organización
- [ ] Archivo en ubicación correcta
- [ ] Index.ts actualizado
- [ ] Sin archivos sueltos
- [ ] Estructura mantenida

---

## 📊 RESUMEN PRE-IMPLEMENTACIÓN

| Fase | Pasos | Estado |
|------|-------|--------|
| Pre-Implementación | 3 | ✅ Completado |
| Crear Componente | 9 | ⏳ Pendiente |
| Actualizar Exports | 3 | ⏳ Pendiente |
| Refactorizar page.tsx | 4 | ⏳ Pendiente |
| Testing | 10 | ⏳ Pendiente |
| Verificación Final | 4 | ⏳ Pendiente |

**Total de pasos**: 33  
**Completados**: 3  
**Pendientes**: 30

---

## ✨ PRÓXIMO PASO

```
┌────────────────────────────────────────┐
│  📋 CHECKLIST LISTO                   │
│                                        │
│  Pre-verificación: ✅ Completada      │
│  Documentación: ✅ Presente           │
│  Análisis: ✅ Hecho                   │
│                                        │
│  🎯 LISTO PARA COMENZAR IMPLEMENTACIÓN
│                                        │
│  ¿Proceder con Fase 1? ✅             │
└────────────────────────────────────────┘
```

---

## 📖 REFERENCIAS

- **Propuesta**: `docs/propuestas/PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md`
- **Visual**: `docs/propuestas/PROPUESTA_VISUAL_SUMMARY.md`
- **Ubicación**: `docs/METODOLOGIA_UBICACION_ARCHIVOS.md`
- **Análisis**: `docs/COMPARACION_MODAL_GUARDADO.md`

---

**¿Autorizado para comenzar implementación?** ✨
