# 🛠️ PROPUESTA DE SOLUCIÓN - FASES 11-15

**Documentación de los cambios necesarios para completar el flujo 100%**

---

## FASE 11: Alert A al Editar Cotización ACTIVA

### ¿Qué falta?
Cuando usuario abre "EDITAR" una cotización que YA está ACTIVA, el sistema debe mostrar un ALERT preventivo.

### Implementación Propuesta

**Ubicación**: Función `abrirModalConActivacion()`

**Cambio**:
```tsx
const abrirModalConActivacion = (quotation: QuotationConfig, modo: 'editar' | 'ver') => {
  const cotizacionActiva = obtenerCotizacionActiva()
  
  // Si NO es la cotización activa
  if (!quotation.activo || !quotation.isGlobal) {
    setCotizacionAAbrir(quotation)
    setModoAbrir(modo)
    setMostrarDialogoActivarCotizacion(true)
  } 
  // ✅ NUEVO: Si es cotización ACTIVA Y modo EDITAR
  else if (modo === 'editar' && quotation.isGlobal === true) {
    // Mostrar alert previo
    const confirmar = window.confirm(
      `⚠️ ATENCIÓN\n\nEsta es la cotización ACTIVA actualmente.\n\n` +
      `Los cambios serán guardados inmediatamente.\n\n` +
      `¿Deseas continuar editando?`
    )
    
    if (confirmar) {
      // Guardar estado ANTES
      setCotizacionAAbrir(quotation)
      setModoAbrir(modo)
      
      // Abrir modal directamente
      abrirModalEditarInterno(quotation, modo)
    }
  }
  // Si ya está activa Y modo VER
  else {
    abrirModalEditarInterno(quotation, modo)
  }
}
```

### Impacto
- ✅ Usuario consciente que edita la ACTIVA
- ✅ Previene cambios accidentales
- ✅ Mejor UX

### Tiempo estimado: 15 minutos

---

## FASE 12: Estado `quotationEstadoAntes` para Tracking

### ¿Qué falta?
Necesitamos recordar el estado ANTERIOR de la cotización para decidir qué hacer al guardar.

### Implementación Propuesta

**Ubicación**: Nuevos estados en el componente

**Agregar estados**:
```tsx
// ==================== ESTADOS PARA TRACKING DE CAMBIOS ====================
const [quotationEstadoAntes, setQuotationEstadoAntes] = useState<{
  wasGlobal: boolean
  wasActive: boolean
  wasId: string
} | null>(null)
// ==================== FIN ESTADOS TRACKING ====================
```

**Actualizar función `abrirModalConActivacion()`**:
```tsx
const abrirModalConActivacion = (quotation: QuotationConfig, modo: 'editar' | 'ver') => {
  // ... código anterior ...
  
  // Guardar estado ANTES de abrir (para luego comparar)
  setQuotationEstadoAntes({
    wasGlobal: quotation.isGlobal,
    wasActive: quotation.activo,
    wasId: quotation.id
  })
  
  // ... resto del código ...
}
```

**Limpiar estado al cerrar modal**:
```tsx
// Al cerrar modal (en función que cierra modal)
setQuotationEstadoAntes(null)
```

### Impacto
- ✅ Poder diferenciar si cambió estado
- ✅ Base para lógica de guardado condicional
- ✅ Tracking de cambios

### Tiempo estimado: 10 minutos

---

## FASE 13: Pregunta Activación al Guardar Desde Inactiva

### ¿Qué falta?
Cuando usuario edita una cotización que era INACTIVA, al guardar debe preguntar si activarla.

### Implementación Propuesta

**Ubicación**: Función `guardarEdicion()` o crear nueva `validarYGuardarEdicion()`

**Crear nueva función**:
```tsx
const validarYGuardarEdicion = async () => {
  if (!snapshotEditando || !quotationEnModal || !quotationEstadoAntes) return

  try {
    // PASO 1: Validar datos del snapshot
    const actualizado = { ...snapshotEditando }
    actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
    actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
    actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)

    // PASO 2: Actualizar snapshot en API
    const snapshotActualizado = await actualizarSnapshot(actualizado.id, actualizado)
    setSnapshots(snapshots.map(s => s.id === actualizado.id ? snapshotActualizado : s))
    
    // PASO 3: LÓGICA CRUCIAL - Si era INACTIVA, preguntar si activar
    if (quotationEstadoAntes.wasGlobal === false) {
      // Era INACTIVA → Preguntar si activar
      const activar = window.confirm(
        `✅ Cambios guardados correctamente.\n\n` +
        `¿Deseas activar esta cotización ahora?\n\n` +
        `(Al activarla, las demás serán desactivadas)`
      )

      if (activar) {
        // Desactivar todas las demás
        await desactivarTodas(quotationEnModal.id)
        await recargarQuotations()
        
        toast.success('✓ Cotización activada y cambios guardados')
      } else {
        toast.success('✓ Cambios guardados (cotización sigue inactiva)')
      }
    } else {
      // Era ACTIVA → Solo guardar cambios
      await refreshSnapshots()
      toast.success('✓ Cotización actualizada')
    }

    // PASO 4: Cerrar modal y limpiar estados
    setShowModalEditar(false)
    setSnapshotEditando(null)
    setQuotationEstadoAntes(null)
    setSnapshotOriginalJson(JSON.stringify(snapshotActualizado))
    
  } catch (error) {
    console.error('Error al guardar edición:', error)
    toast.error('❌ Error al actualizar el paquete. Por favor intenta de nuevo.')
  }
}
```

**Reemplazar `guardarEdicion()` con esta nueva función**

### Impacto
- ✅ User controla si activar o no
- ✅ Cambios se guardan en ambos casos
- ✅ Lógica clara y predecible
- ✅ Coincide con requisitos del flujo

### Tiempo estimado: 30 minutos

---

## FASE 14: Detección de Cambios Sin Guardar

### ¿Qué falta?
Si user edita datos y cierra modal sin guardar, sistema debe preguntar "¿Descartar cambios?"

### Implementación Propuesta

**Ubicación**: Hook `useEffect` en modal + función para cerrar

**Agregar función helper**:
```tsx
const haycambiosEnSnapshot = (): boolean => {
  if (!snapshotEditando || !snapshotOriginalJson) return false
  
  const snapshotActual = JSON.stringify(snapshotEditando)
  return snapshotActual !== snapshotOriginalJson
}
```

**Crear función para cerrar modal con validación**:
```tsx
const cerrarModalConValidacion = () => {
  if (readOnly) {
    // Modo lectura → Cerrar sin preguntar
    setShowModalEditar(false)
    setSnapshotEditando(null)
    setQuotationEstadoAntes(null)
    return
  }

  if (haychangiosEnSnapshot()) {
    // Hay cambios → Preguntar
    const descartar = window.confirm(
      `⚠️ Hay cambios sin guardar.\n\n` +
      `¿Estás seguro de que deseas cerrar?\n` +
      `Los cambios se perderán.`
    )

    if (descartar) {
      setShowModalEditar(false)
      setSnapshotEditando(null)
      setQuotationEstadoAntes(null)
      setSnapshotOriginalJson(null)
    }
  } else {
    // No hay cambios → Cerrar directamente
    setShowModalEditar(false)
    setSnapshotEditando(null)
    setQuotationEstadoAntes(null)
  }
}
```

**Reemplazar en TabsModal**:
- Encontrar botón "Cerrar" o "X"
- Cambiar `onClick={() => setShowModalEditar(false)}`
- Por `onClick={() => cerrarModalConValidacion()}`

### Impacto
- ✅ Previene pérdida de datos accidental
- ✅ Mejor UX
- ✅ Coincide con estándares web

### Tiempo estimado: 45 minutos

---

## FASE 15: Validación de Dependencias Entre TABs

### ¿Qué falta?
Cuando user intenta ir a TAB "Estilos", validar que ya existe al menos 1 paquete.

### Implementación Propuesta

**Ubicación**: Función `handleCambioTab()`

**Mejorar función `handleCambioTab()`**:
```tsx
const handleCambioTab = async (nuevoTab: string) => {
  // PASO 1: Validar TAB ACTUAL (antes de salir)
  const tabActual = activePageTab
  
  let resultado: { valido: boolean; errores: string[] } | null = null

  if (tabActual === 'cotizacion') {
    resultado = validarTabCotizacion()
  } else if (tabActual === 'oferta') {
    resultado = validarTabOferta()
  } else if (tabActual === 'paquetes') {
    resultado = validarTabPaquetes()
  } else if (tabActual === 'estilos') {
    resultado = validarTabEstilos()
  }

  if (resultado && !resultado.valido) {
    toast.error(`❌ ${resultado.errores[0]}`)
    return
  }

  // PASO 2: NUEVO - Validar DEPENDENCIAS del TAB DESTINO
  // Antes de entrar a "Paquetes": validar que existe descripción
  if (nuevoTab === 'paquetes') {
    if (!paqueteActual.descripcion || paqueteActual.descripcion.trim() === '') {
      toast.error('❌ Completa la descripción en TAB Oferta antes de crear paquetes')
      return
    }
  }

  // Antes de entrar a "Estilos": validar que existe al menos 1 paquete
  if (nuevoTab === 'estilos') {
    if (snapshots.length === 0) {
      toast.error('❌ Crea al menos un paquete en TAB Paquetes antes de configurar estilos')
      return
    }
  }

  // PASO 3: Si pasó validación, cambiar TAB
  setActivePageTab(nuevoTab)
  
  // PASO 4: Actualizar validación del nuevo TAB
  actualizarEstadoValidacionTabs()
}
```

### Impacto
- ✅ Flujo ordenado y lógico
- ✅ User no puede saltarse pasos
- ✅ Mensajes claros
- ✅ Mejor UX

### Tiempo estimado: 30 minutos

---

## 📋 RESUMEN DE FASES 11-15

| Fase | Nombre | Líneas | Tiempo | Dependencias |
|------|--------|--------|--------|--------------|
| 11 | Alert A ACTIVA | 30 | 15 min | Ninguna |
| 12 | Estado `quotationEstadoAntes` | 20 | 10 min | Ninguna |
| 13 | Pregunta activación al guardar | 50 | 30 min | Fase 12 |
| 14 | Detección cambios sin guardar | 60 | 45 min | Ninguna |
| 15 | Validación dependencias TABs | 40 | 30 min | Ninguna |
| **TOTAL** | | **200** | **2.5 horas** | - |

---

## 🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### Opción A: Orden Lógico (Recomendado)
1. **FASE 12** primero (agregar estado) - 10 min
2. **FASE 11** (usar ese estado) - 15 min
3. **FASE 13** (depende de Fase 12) - 30 min
4. **FASE 14** (independiente) - 45 min en paralelo
5. **FASE 15** (independiente) - 30 min en paralelo

**Total si haces 14+15 en paralelo**: ~2 horas

### Opción B: Por Importancia (Crítica → Media)
1. **FASE 12** - Estado fundamental - 10 min
2. **FASE 13** - Lógica crítica de guardado - 30 min
3. **FASE 11** - Alert previo - 15 min
4. **FASE 14** - UX - 45 min
5. **FASE 15** - Validación preventiva - 30 min

---

## ✅ VERIFICACIÓN POST-IMPLEMENTACIÓN

Después de implementar, verificar:

- [ ] Alert A aparece al editar ACTIVA
- [ ] Estado `quotationEstadoAntes` se guarda/limpia correctamente
- [ ] Al guardar desde INACTIVA, pregunta si activar
- [ ] Al guardar desde ACTIVA, no pregunta (solo guarda)
- [ ] Al cerrar con cambios, pregunta descartar
- [ ] No se puede entrar a "Paquetes" sin descripción
- [ ] No se puede entrar a "Estilos" sin paquetes
- [ ] Build compila sin errores
- [ ] No hay TypeScript warnings

---

## 📊 ESTADO FINAL ESPERADO

Después de implementar FASES 11-15:

```
Nueva Cotización              ████████████████████ 100% ✅
Validación TABs             ████████████████████ 100% ✅
Indicadores TABs            ████████████████████ 100% ✅
Cambio TAB seguro           ████████████████████ 100% ✅
Guardado centralizado       ████████████████████ 100% ✅
Modal Ver                   ████████████████████ 100% ✅
Modal Editar ACTIVA         ████████████████████ 100% ✅
Modal Editar INACTIVA       ████████████████████ 100% ✅
Detectar cambios sin guardar ████████████████████ 100% ✅
Validar dependencias        ████████████████████ 100% ✅
Estados antes/después       ████████████████████ 100% ✅
Preguntas de confirmación   ████████████████████ 100% ✅
─────────────────────────────────────────────────
TOTAL                       ████████████████████ 100% ✅
```

**Flujo**: 100% COMPLETAMENTE FUNCIONAL ✅

---
