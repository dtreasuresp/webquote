# 🏛️ ARQUITECTURA DE SOLUCIÓN PROPUESTA

## Visión General

El proyecto necesita evolucionar de una arquitectura **reactiva local** a una arquitectura **de propagación global de eventos**, donde cualquier cambio en una cotización notifica automáticamente a todos los componentes dependientes.

---

## Modelo Actual (Deficiente)

```
┌─────────────────────────────────────────────────────────┐
│                    ARQUITECTURA ACTUAL                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Admin Panel                                             │
│  ├─ cotizacionConfig (useState)                         │
│  ├─ quotations[] (useState)                             │
│  ├─ snapshots[] (useState)                              │
│  └─ ... 10+ otros estados ...                           │
│                                                          │
│  Cuando Usuario Edita:                                   │
│  └─ setCotizacionConfig() ✅                            │
│  └─ setQuotations() ❌ (no automático)                  │
│                                                          │
│  Componentes Dependientes:                               │
│  ├─ HistorialTAB                                        │
│  │  └─ Lee quotations[] prop                            │
│  │  └─ Si no cambia → no recalcula ❌                   │
│  │                                                      │
│  ├─ UserManagementPanel                                 │
│  │  └─ Lee quotations[] prop                            │
│  │  └─ Si no cambia → no recalcula ❌                   │
│  │                                                      │
│  └─ Página Pública                                       │
│     └─ Carga GET /api/quotation-config al montar        │
│     └─ No sabe cuándo cambió isGlobal ❌               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Problemas de Esta Arquitectura:

1. **Sin Propagación**: Los cambios se quedan en el componente que los hizo
2. **Sin Notificación**: No hay mecanismo para avisar a otros componentes
3. **Sin Caché Global**: Cada componente maneja su propio estado
4. **Acoplamiento Temporal**: quotations[] DEBE cambiar, pero no siempre se actualiza
5. **Manual**: El dev debe acordarse de llamar a recargarQuotations()

---

## Modelo Propuesto (Event Bus Pattern)

```
┌────────────────────────────────────────────────────────────────┐
│                 ARQUITECTURA PROPUESTA                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│                  CAPA 1: EVENTOS                               │
│                 ┌──────────────────┐                           │
│                 │ Event Bus (Singlet)│                          │
│                 │                  │                           │
│                 │ on('updated')    │                           │
│                 │ on('created')    │                           │
│                 │ on('activated')  │                           │
│                 │ emit()           │                           │
│                 └────────┬─────────┘                           │
│                          │                                     │
│   ┌──────────────────────┼──────────────────────┐              │
│   │                      │                      │              │
│   │                      │                      │              │
│   ▼                      ▼                      ▼              │
│  CAPA 2: LISTENERS                                            │
│  ┌──────────┐      ┌──────────┐         ┌─────────────┐      │
│  │Admin Page│      │Historial │         │UserManPanel │      │
│  │          │      │TAB       │         │             │      │
│  │onCreate: │      │          │         │ onQuotation │      │
│  │ recargar │      │onQuotation         │Updated:     │      │
│  │Quotations│      │Updated:  │         │ refrecar    │      │
│  │ emitEvent│      │ recalculate        │ grupos()    │      │
│  │          │      │ grouped  │         │             │      │
│  └──────────┘      └──────────┘         └─────────────┘      │
│                                                                 │
│  CAPA 3: ESTADO REACTIVO                                      │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ quotations[] ← Se actualiza cuando hay evento          │   │
│  │              ← Todos los componentes lo leen           │   │
│  │              ← useMemo recalcula automáticamente       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  CAPA 4: PERSISTENCIA                                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ BD (quotationConfig)                                   │   │
│  │ ├─ quotationConfig.update() ✅                         │   │
│  │ ├─ emit evento ✅                                      │   │
│  │ └─ listeners reaccionan ✅                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Ventajas de Event Bus:

1. ✅ **Desacoplado**: Componentes no conocen uno al otro
2. ✅ **Escalable**: Agregar listeners es fácil
3. ✅ **Automático**: Sin código duplicado
4. ✅ **Reactivo**: Todo se actualiza por cascada
5. ✅ **Testeable**: Fácil mockear eventos
6. ✅ **Mantenible**: Lógica centralizada

---

## Arquitectura Propuesta - Detalles

### 1. Event Bus (Núcleo)

```typescript
// src/lib/eventBus.ts
export class QuotationEventBus {
  // Singleton pattern
  private static instance: QuotationEventBus
  private listeners: Map<string, Set<Function>>
  
  static getInstance(): QuotationEventBus {
    if (!this.instance) {
      this.instance = new QuotationEventBus()
    }
    return this.instance
  }
  
  on(event: string, handler: Function): () => void
  emit(event: string, data: any): void
  clear(event?: string): void
}

export const quotationEventBus = QuotationEventBus.getInstance()
```

**Responsabilidades**:
- Mantener registro de listeners
- Emitir eventos
- Limpiar listeners (para prevenir memory leaks)

---

### 2. Productor de Eventos (Admin Page)

```typescript
// src/app/admin/page.tsx
const guardarEdicion = async () => {
  // Paso 1: Enviar cambios al API
  const response = await fetch('/api/quotation-config', {
    method: 'PUT',
    body: JSON.stringify(datosParaGuardar),
  })
  
  // Paso 2: Actualizar estado local
  setCotizacionConfig(response.data)
  
  // Paso 3: Recargar lista global
  await recargarQuotations()  // Esto actualiza quotations[]
  
  // Paso 4: EMITIR EVENTO
  quotationEventBus.emit('quotation:updated', {
    quotation: response.data,
    timestamp: new Date(),
  })
}
```

**Responsabilidades**:
- Hacer cambios en BD
- Actualizar estado local
- Emitir evento cuando hay cambios

---

### 3. Consumidores de Eventos (Listeners)

#### 3A. HistorialTAB

```typescript
// src/features/admin/components/tabs/Historial.tsx
export default function Historial({ quotations, ...props }) {
  // Subscribirse a eventos
  useEffect(() => {
    const unsubscribe = quotationEventBus.on(
      'quotation:updated',
      () => {
        console.log('Evento recibido: cotización actualizada')
        // quotations[] ya cambió en el parent (Admin Page)
        // useMemo recalculará automáticamente
      }
    )
    
    return unsubscribe  // Cleanup
  }, [])
  
  // El memoized useMemo recalculará porque quotations[] cambió
  const cotizacionesAgrupadas = useMemo(() => {
    // Lógica de agrupación
    // Se ejecuta automáticamente cuando quotations[] cambia
  }, [quotations])
}
```

#### 3B. UserManagementPanel

```typescript
// src/features/admin/components/UserManagementPanel.tsx
export default function UserManagementPanel({ quotations }) {
  useEffect(() => {
    const unsubscribe = quotationEventBus.on(
      'quotation:updated',
      () => {
        console.log('Evento recibido: actualizar grupos')
        // quotations[] ya cambió, groupedQuotations recalculará
      }
    )
    
    return unsubscribe
  }, [])
  
  // Este useMemo se ejecuta cuando quotations[] cambia
  const groupedQuotations = useMemo(() => {
    return groupQuotationsByBase(quotations)
  }, [quotations])
}
```

#### 3C. Página Pública

```typescript
// src/app/page.tsx
function HomeContent() {
  const [cotizacion, setCotizacion] = useState(null)
  
  // Cargar al montar
  useEffect(() => {
    fetchQuotation()
  }, [])
  
  // [NUEVO] Subscribirse a cambios
  useEffect(() => {
    const unsubscribe = quotationEventBus.on(
      'quotation:activated',
      () => {
        console.log('Nueva cotización activada, recargando...')
        fetchQuotation()  // Recargar la cotización pública
      }
    )
    
    return unsubscribe
  }, [])
}
```

---

## Flujo de Datos Completo

```
┌─────────────────────────────────────┐
│ 1. Usuario Edita en Admin Modal      │
│    Click: "Guardar Cambios"           │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌─────────────┐
        │ guardarEdicion()
        │ (Admin)     │
        └─────┬───────┘
              │
       ┌──────┴──────┬──────────┬──────────┐
       │             │          │          │
       ▼             ▼          ▼          ▼
    PUT API      SET LOCAL  AWAIT RELOAD  EMIT EVENT
    /api/...     quotation  /api/...      'updated'
    │             │          │            │
    │             ▼          ▼            ▼
    ▼        ✅ Actualizado ✅ Actualizado ✅ Emitido
    │        (cotizacion     (quotations[  (event bus)
    │         actual)        cambió)
    │             │          │            │
    │             │          └────┬───────┴────┐
    │             │               │            │
    ▼             │               ▼            ▼
 BD UPDATE        │         ┌──────────┐  ┌──────────┐
 ✅              │         │ Historial│  │ UserPanel│
                 │         │ LISTENER │  │ LISTENER │
                 │         └──────┬───┘  └────┬─────┘
                 │                │           │
                 │                │ Detecta   │ Detecta
                 │                │ cambio    │ cambio
                 │                │           │
                 │                ▼           ▼
                 │         useMemo      useMemo
                 │         recalculan   recalculan
                 │         │            │
                 │         ▼            ▼
                 │      ✅ cotización  ✅ grupos
                 │      Agrupadas    Actualizados
                 │         │            │
                 └─────────┴────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ RESULTADO FINAL │
                  │                 │
                  │ ✅ Admin: estado│
                  │    actualizado  │
                  │ ✅ Historial:   │
                  │    versiones    │
                  │    nuevas       │
                  │ ✅ UserPanel:   │
                  │    cotizaciones │
                  │    nuevas       │
                  └─────────────────┘
```

---

## Comparación: Antes vs Después

### ANTES: Guardar Edición
```
1. usuario.click() → guardarEdicion()
2. setCotizacionConfig() → Admin UI actualizado ✅
3. ??? → Historial TAB no se enteró ❌
4. ??? → UserPanel no se enteró ❌
5. Página pública no se enteró ❌
```

### DESPUÉS: Guardar Edición
```
1. usuario.click() → guardarEdicion()
2. recargarQuotations() → quotations[] actualizado
3. emit('updated') → EVENT BUS
4. HistorialTAB listener → recalcula
5. UserPanel listener → recalcula
6. Página Pública listener → recarga
7. TODOS actualizados ✅
```

---

## Patrones de Implementación Recomendados

### Patrón 1: useQuotationListener Hook (RECOMENDADO)

```typescript
// src/hooks/useQuotationListener.ts
export function useQuotationListener(
  eventType: 'updated' | 'created' | 'activated',
  callback: () => void
) {
  useEffect(() => {
    const unsubscribe = quotationEventBus.on(
      `quotation:${eventType}`,
      callback
    )
    
    return unsubscribe
  }, [eventType, callback])
}

// Uso en componentes:
function Historial() {
  useQuotationListener('updated', () => {
    console.log('Recalculando grupos...')
  })
}
```

**Ventajas**:
- ✅ Código más limpio
- ✅ Reutilizable
- ✅ Tipo-seguro

---

### Patrón 2: useQuotationEventEmitter Hook

```typescript
// src/hooks/useQuotationEventEmitter.ts
export function useQuotationEventEmitter() {
  return useCallback((eventType: string, data: any) => {
    quotationEventBus.emit(`quotation:${eventType}`, data)
  }, [])
}

// Uso en Admin:
function Admin() {
  const emitEvent = useQuotationEventEmitter()
  
  const guardarEdicion = async () => {
    // ... lógica ...
    emitEvent('updated', { quotation })
  }
}
```

---

## Migración Gradual

**No es necesario cambiar TODO de una vez. Migración en fases:**

### Fase 1: Event Bus Core (Semana 1)
- [ ] Crear `src/lib/eventBus.ts`
- [ ] Crear hooks helpers
- [ ] NO cambiar componentes aún

### Fase 2: Admin Listeners (Semana 2)
- [ ] Actualizar `guardarEdicion()` para emitir eventos
- [ ] Subscribir HistorialTAB
- [ ] Subscribir UserManagementPanel

### Fase 3: Página Pública (Semana 3)
- [ ] Subscribir página pública a eventos
- [ ] Implementar revalidación de caché

### Fase 4: Testing & Optimización (Semana 4)
- [ ] Tests de eventos
- [ ] Profiling y optimización
- [ ] Documentación

---

## Checklist de Implementación

```
FASE 1: Core
[_] Crear EventBus class
[_] Singleton pattern
[_] Métodos: on(), emit(), clear()
[_] Tests unitarios

FASE 2: Admin Integration
[_] Importar eventBus en Admin Page
[_] Llamar emit() en guardarEdicion()
[_] Llamar emit() en guardarVersion()
[_] Llamar emit() en guardarActivacion()

FASE 3: Listeners
[_] HistorialTAB subscribe
[_] HistorialTAB useEffect cleanup
[_] UserManagementPanel subscribe
[_] UserManagementPanel useEffect cleanup
[_] Página Pública subscribe

FASE 4: Verificación
[_] Test manual: editar → historial actualiza
[_] Test manual: editar → userPanel actualiza
[_] Test manual: crear versión → todos ven V nueva
[_] Test manual: activar → página pública muestra nueva

FASE 5: Optimización
[_] Memory leak check (componentes unmount)
[_] Performance check (cascadas de renders)
[_] Error handling (listeners robusto)
```

---

## Riesgos y Mitigaciones

### Riesgo 1: Memory Leaks
**Problema**: Si listeners no se limpian, pueden acumularse

**Mitigación**:
```typescript
useEffect(() => {
  const unsubscribe = eventBus.on('event', callback)
  return unsubscribe  // SIEMPRE limpiar
}, [])
```

### Riesgo 2: Cascadas de Renders
**Problema**: Un evento dispara múltiples re-renders

**Mitigación**:
```typescript
// Usar useMemo para evitar recalcular innecesariamente
const cotizacionesAgrupadas = useMemo(() => {
  // Solo se ejecuta cuando quotations[] cambia
  return agrupar(quotations)
}, [quotations])  // Dependencia explícita
```

### Riesgo 3: Estado Inconsistente
**Problema**: Componentes ven datos en diferentes estados

**Mitigación**:
```typescript
// Esperar que TODOS los cambios se completen
await recargarQuotations()  // Esperar
await invalidarCaché()       // Esperar
emit('updated')              // Emitir después
```

---

## Conclusión

La arquitectura de **Event Bus** propuesta:

1. ✅ **Resuelve el problema**: Sincronización automática global
2. ✅ **Es mantenible**: Código limpio y desacoplado
3. ✅ **Es escalable**: Fácil agregar más listeners
4. ✅ **Es testeable**: Fácil mockear eventos
5. ✅ **Es gradual**: Se puede implementar por fases
6. ✅ **Es idiomática**: Patrón común en React

**Siguiente paso**: Implementar Fase 1 (Event Bus Core)

