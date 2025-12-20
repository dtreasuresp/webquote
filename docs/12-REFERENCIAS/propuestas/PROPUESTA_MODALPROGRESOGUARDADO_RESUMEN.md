# 📋 PROPUESTA: ModalProgresoGuardado - Migración Completa
## 📊 RESUMEN EJECUTIVO COMPRIMIDO

**Fecha**: 7 de Diciembre 2025  
**Estado**: 📊 Propuesta de Arquitectura  
**Versión**: v1.0

---

## 🎯 OBJETIVO

Migrar toda la lógica del modal `💾 Guardando Cotización...` desde `administrador/page.tsx` (290+ líneas hardcodeadas) a un componente reutilizable: `ModalProgresoGuardado.tsx`

---

## 📦 ENTREGABLES

| Archivo | Ubicación | Tipo | Estado |
|---------|-----------|------|--------|
| `ModalProgresoGuardado.tsx` | `src/features/admin/components/` | Componente | 🔄 A CREAR |
| Exports en `index.ts` | `src/features/admin/components/` | Actualización | 🔄 A ACTUALIZAR |
| `PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md` | `docs/propuestas/` | Documentación | ✅ CREADO |
| `METODOLOGIA_UBICACION_ARCHIVOS.md` | `docs/` | Documentación | ✅ CREADO |

---

## 🔧 LÓGICA A MIGRAR (Funciones + Estados)

### Estados en page.tsx a mover:
```typescript
✅ showModalProgresoGuardado          // Control de visibilidad
✅ resultadoGuardado                 // 'guardando' | 'exito' | 'cancelado' | 'error'
✅ resumenGuardado                   // Mensaje final
✅ pasosGuardado[]                   // Array de pasos con estado
✅ progresoGuardado                  // Cálculo 0-100%
✅ cancelarGuardadoSolicitado        // Flag de cancelación
✅ showModalConfirmarCancelacion     // Modal confirmación
✅ showModalResultadoCancelacion     // Modal resultado
✅ resultadoCancelacionExitoso       // Flag resultado
```

### Funciones a mover:
```typescript
✅ rollbackGuardado()                // Elimina versión parcial
✅ confirmarCancelacionGuardado()    // Muestra confirmación
✅ ejecutarCancelacionGuardado()     // Ejecuta cancelación
✅ actualizarPasoGuardado()          // Helper de actualización
✅ reiniciarPasosGuardado()          // Reinicia estado
```

### Renderizado a mover:
```
✅ Modal Principal (Progreso)        // Línea 6087-6266
✅ Modal Confirmar Cancelación       // Línea 6267-6324
✅ Modal Resultado Cancelación       // Línea 6327-6400
```

---

## 🏗️ ARQUITECTURA NUEVA

```typescript
<ModalProgresoGuardado
  isOpen={showModalProgresoGuardado}
  onClose={handleClose}
  
  // Datos
  pasos={pasosGuardado}
  resultado={resultadoGuardado}
  totalProgreso={progresoGuardado}
  resumen={resumenGuardado}
  
  // Versiones (para rollback)
  versionCreada={idVersionCreadaRef.current}
  versionAnterior={idVersionAnteriorRef.current}
  
  // Callbacks
  onCancelRequest={() => abortControllerRef.current?.abort()}
  onRollback={(v1, v2) => rollbackGuardado(v1, v2)}
/>
```

---

## ✅ FUNCIONALIDAD PRESERVADA

| Feature | Actual | Nuevo | Status |
|---------|--------|-------|--------|
| 4 estados de resultado | ✅ | ✅ | ✅ |
| 5 pasos de proceso | ✅ | ✅ | ✅ |
| Barra progreso 0-100% | ✅ | ✅ | ✅ |
| Detalles de pasos | ✅ | ✅ | ✅ |
| Mensajes resumen | ✅ | ✅ | ✅ |
| Cancelación en proceso | ✅ | ✅ | ✅ |
| Confirmación cancelación | ✅ | ✅ | ✅ |
| Rollback automático | ✅ | ✅ | ✅ |
| Resultado cancelación | ✅ | ✅ | ✅ |
| Animaciones Framer Motion | ✅ | ✅ | ✅ |
| Tema GitHub Dark | ✅ | ✅ | ✅ |

---

## 🎨 ESTRUCTURA DE COMPONENTES (3 MODALES)

### Modal 1: Principal (Progreso)
```
Header
├─ Icono dinámico (spinner/check/error/warning)
├─ Título dinámico
└─ Botón cerrar (si no está guardando)

Body
├─ Lista de pasos
│  ├─ Icono estado
│  ├─ Label
│  └─ Detalle (si existe)
├─ Barra de progreso
├─ Advertencia (si guardando)
└─ Resumen final (si existe)

Footer
├─ Botón "Cancelar Guardado" (si guardando)
└─ Botón "Cerrar/Entendido" (si completado)
```

### Modal 2: Confirmar Cancelación
```
Header
├─ Icono advertencia
└─ "Cancelar Guardado"

Body
├─ "¿Estás seguro?"
└─ "⚠️ Detendrá el guardado"

Footer
├─ "No, continuar"
└─ "Sí, cancelar"
```

### Modal 3: Resultado Cancelación
```
Header
├─ Icono (check/error)
└─ "Resultado"

Body
└─ Mensaje según resultado

Footer
└─ "Entendido"
```

---

## 📍 UBICACIONES DE ARCHIVOS

```
d:\dgtecnova\
├── src/features/admin/components/
│   ├── ModalProgresoGuardado.tsx           ← CREAR AQUÍ (Componente)
│   ├── DialogoGenericoDinamico.tsx         (Existente)
│   ├── index.ts                            ← ACTUALIZAR (Exports)
│   └── ...otros
│
└── docs/
    ├── propuestas/
    │   └── PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md  ✅ CREADO
    ├── METODOLOGIA_UBICACION_ARCHIVOS.md               ✅ CREADO
    └── COMPARACION_MODAL_GUARDADO.md                   ✅ CREADO
```

---

## 🔄 MIGRATION STEPS

### FASE 1: Implementación (Este documento)
- [x] Analizar lógica actual
- [x] Crear propuesta completa
- [x] Crear metodología de ubicación
- [ ] Crear ModalProgresoGuardado.tsx

### FASE 2: Integración
- [ ] Actualizar index.ts con exports
- [ ] Actualizar administrador/page.tsx
- [ ] Eliminar 290+ líneas hardcodeadas
- [ ] Testing completo

### FASE 3: Validación
- [ ] Flujo normal de guardado
- [ ] Flujo de cancelación
- [ ] Rollback exitoso
- [ ] Rollback fallido
- [ ] Errores durante guardado

---

## 🎯 BENEFICIOS

| Beneficio | Impacto |
|-----------|---------|
| **Código más limpio** | -290 líneas en page.tsx |
| **Reutilizable** | Usado en otros contexts |
| **Testeable** | Componente aislado |
| **Mantenible** | Lógica centralizada |
| **Flexible** | Props para customizar |
| **Type-safe** | Full TypeScript |

---

## 🚀 PRÓXIMO PASO

¿Proceder con implementación de `ModalProgresoGuardado.tsx`?

**Referencia**: `docs/propuestas/PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md`
