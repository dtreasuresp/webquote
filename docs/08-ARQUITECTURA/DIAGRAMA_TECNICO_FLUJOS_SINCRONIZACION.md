# 🔧 DIAGRAMA TÉCNICO DETALLADO: FLUJOS DE SINCRONIZACIÓN

## 1. FLUJO ACTUAL (INCOMPLETO)

### A. Creación de Nueva Versión
```
┌─ ADMIN MODAL ─────────────────────────────────────────────┐
│                                                            │
│  Usuario edita campos:                                     │
│  - heroTituloMain                                          │
│  - numeroVersion, tiempoValidez, etc.                      │
│                                                            │
│  Click: "Crear Versión"                                   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼ FASE 1: PREPARACIÓN
          ┌──────────────────────────────────┐
          │ guardarCotizacionActual()         │
          │ Normaliza 16 campos:              │
          │ - heroTituloMain ?? ''            │
          │ - heroTituloSub ?? ''             │
          │ - numero ?? ''                    │
          │ ... resto ...                     │
          │ - ubicacionProveedor ?? ''        │
          └────────────────┬───────────────┘
                          │
         ┌────────────────┴─────────────────┐
         │                                  │
         ▼ FASE 2: API CALL                  ▼
    ┌─────────────────┐              ┌──────────────────┐
    │ PUT Request     │              │ Backend          │
    │ /api/quotation  │              │ Procesa:         │
    │ -config         │─────────────>│ UPDATE cotización│
    │                 │              │ SET isGlobal=true│
    │ Body:           │              │                  │
    │ { ...16 fields} │              └────────┬─────────┘
    └─────────────────┘                       │
                                             ▼
                          ┌────────────────────────────────┐
                          │ Database UPDATE                 │
                          │ quotationConfig set             │
                          │ {                              │
                          │   id: "uuid-actual",            │
                          │   numero: "CZ-0001.251703V1",  │
                          │   versionNumber: 1,             │
                          │   isGlobal: true,               │
                          │   ... updated fields ...        │
                          │ }                              │
                          └────────────┬───────────────────┘
                                      │
                                      ▼ RESPUESTA API
                        ┌────────────────────────────┐
                        │ { success: true,           │
                        │   data: {                  │
                        │     id: "uuid-actual",     │
                        │     ...actualizado...      │
                        │   }                        │
                        │ }                          │
                        └────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼ FASE 3: LOCAL STATE           ▼
         ┌──────────────────────┐    ┌──────────────────────┐
         │ setCotizacionConfig()│    │ [FALTA] ❌            │
         │                      │    │ recargarQuotations()  │
         │ Actualiza:           │    │                       │
         │ - cotizacionActual   │    │ Debería hacer:        │
         │ - estado en Admin    │    │ - GET /api/quotations│
         │                      │    │ - setQuotations(data)│
         │ UI SYNC: Sí ✅       │    │                      │
         └──────────────────────┘    │ UI SYNC: No ❌        │
                                     └──────────────────────┘

         ┌──────────────────────┐    ┌──────────────────────┐
         │ [FALTA] ❌            │    │ [FALTA] ❌            │
         │ publishEvent('updated'   │ invalidateCaché()    │
         │                      │    │                       │
         │ Debería notificar:   │    │ Debería limpiar:     │
         │ - HistorialTAB       │    │ - quotations cache   │
         │ - UserManPanel       │    │ - snapshots cache    │
         │ - Caché local        │    │                      │
         │                      │    │ Listeners: No ❌      │
         │ Listeners: No ❌      │    └──────────────────────┘
         └──────────────────────┘

                    │
                    └──── RESULTADO FINAL ─────┐
                                               │
                                               ▼
                        ┌───────────────────────────────────┐
                        │ SINCRONIZACIÓN INCOMPLETA          │
                        ├───────────────────────────────────┤
                        │ ✅ Cotización en BD actualizada    │
                        │ ✅ Estado Admin actualizado        │
                        │ ❌ Historial TAB no ve cambios     │
                        │ ❌ UserPanel no ve cambios         │
                        │ ❌ Caché no invalidado             │
                        │ ❌ Eventos no emitidos             │
                        └───────────────────────────────────┘
```

---

## 2. PUNTOS DE FALLA ESPECÍFICOS

### Falla 1: HistorialTAB No Se Recarga

**Componente**: `Historial.tsx` (Línea 83-114)

```typescript
const cotizacionesAgrupadas = useMemo((): CotizacionAgrupada[] => {
  const grupos = new Map<string, QuotationConfig[]>()
  
  // ⚠️ Lee DIRECTAMENTE del array quotations
  for (const q of quotations) {
    const numeroBase = extractBaseQuotationNumber(q.numero)
    grupos.set(numeroBase, [...(grupos.get(numeroBase) || []), q])
  }
  
  // Calcula grupos
  const resultado: CotizacionAgrupada[] = []
  for (const [numeroBase, versiones] of grupos) {
    resultado.push({
      numeroBase,
      versionActiva: versionesOrdenadas.find(v => v.isGlobal) || versionesOrdenadas[0],
      todasLasVersiones: versionesOrdenadas,
      totalVersiones: versionesOrdenadas.length
    })
  }
  
  return resultado
}, [quotations])  // ⚠️ SOLO recalcula si quotations[] CAMBIA
```

**Flujo de falla**:
```
1. quotations[] = [V1, V2, V3]  (del render anterior)
2. Usuario modifica cotización
3. PUT /api/quotation-config ✅
4. setCotizacionConfig() ✅
5. setQuotations() ❌ NO SE LLAMA
6. quotations[] sigue siendo [V1, V2, V3]
7. useMemo no se ejecuta (dependencia no cambió)
8. Historial sigue mostrando V3 viejo
```

---

### Falla 2: UserManagementPanel No Se Actualiza

**Componente**: `UserManagementPanel.tsx` (Línea 112, 160)

```typescript
const groupedQuotations = useMemo(() => 
  groupQuotationsByBase(quotations),  // ⚠️ Depende de quotations prop
  [quotations]
)

// En Dialog de Usuario:
const formConfig: DialogFormConfig = useMemo(() => ({
  fields: [
    // ...otros campos...
    {
      id: 'quotationAssignedId',
      type: 'select',
      label: 'Cotización Asignada',
      value: editingUser?.quotationAssignedId || '',
      options: [
        { label: '-- Sin cotización asignada --', value: '' },
        ...groupedQuotations.map(group => ({  // ⚠️ USA groupedQuotations
          label: `${group.displayName} (${group.baseNumber})
                  ${group.versions.length > 1 ? ` - ${group.versions.length} versiones` : ''}`,
          value: group.latestVersion.id,  // ⚠️ ÚLTIMO ID del grupo
        })),
      ],
    }
  ],
}), [editingUser, availableRoles, groupedQuotations])  // ⚠️ Depende de groupedQuotations
```

**Flujo de falla**:
```
1. quotations[] = [
     { id: 'abc123', numero: 'CZ-0001.251703V1', versionNumber: 1 },
     { id: 'def456', numero: 'CZ-0001.251703V2', versionNumber: 2 },
   ]

2. Usuario edita cotización V1
3. PUT /api/quotation-config ✅
4. setCotizacionConfig() ✅
5. setQuotations() ❌ NO SE LLAMA
6. quotations[] sigue sin cambios
7. groupedQuotations recalcula con MISMO array
8. latestVersion.id sigue siendo 'def456' (V2 viejo)
9. Si existe V3: El usuario no lo ve en el selector

CONSECUENCIA:
- Admin crea V3
- UserPanel NO la muestra
- Admin intenta asignar usuario a V3 manualmente
- NO PUEDE porque el selector no incluye V3
```

---

### Falla 3: User.quotationAssignedId Apunta a Versión Desactualizada

**Flujo de datos**:
```
┌─ User Table (BD) ──────────────┐
│                                │
│  User {                         │
│    id: 'user-123',              │
│    username: 'cliente1',        │
│    quotationAssignedId: ────────┼────────┐
│  }                              │        │
│                                │        │ FK
│                                │        │
└────────────────────────────────┘        │
                                         │
                                         ▼
                        ┌────────────────────────────┐
                        │ quotationConfig {          │
                        │   id: 'abc123',            │
                        │   numero: 'CZ-0001.251703V1',
                        │   versionNumber: 1,        │
                        │   isGlobal: false,    ← PROBLEMA
                        │ }                          │
                        └────────────────────────────┘

CUANDO USUARIO ACCEDE:
GET /api/quotation-config
├─ Busca: WHERE id = 'abc123'
├─ Encuentra: V1 (versionNumber: 1)
├─ Pero V1 YA NO ESTÁ ACTUALIZADA
├─ V2, V3, V4... se crearon después
└─ Usuario ve cotización DESACTUALIZADA
```

---

## 3. CADENA DE PROPAGACIÓN NECESARIA

```
┌──────────────────────────────────┐
│ 1. CAMBIO EN BD                  │
│ quotationConfig UPDATE           │
│ isGlobal = true                  │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ 2. NOTIFICACIÓN EN MEMORIA       │
│ quotationEventBus.emit()         │
│ Evento: 'quotation:updated'      │
│ Payload: {                       │
│   id: 'uuid-123',                │
│   numero: 'CZ-0001.251703V2',    │
│   versionNumber: 2,              │
│   isGlobal: true,                │
│   ...                            │
│ }                                │
└────────────┬─────────────────────┘
             │
             ├─────────────────────────┬──────────────────────┐
             │                         │                      │
             ▼                         ▼                      ▼
    ┌────────────────────┐   ┌─────────────────────┐   ┌────────────────┐
    │ 3a. Admin Listener │   │ 3b. Historial       │   │ 3c. UserPanel  │
    │                    │   │ Listener            │   │ Listener       │
    │ quotationEventBus  │   │                     │   │                │
    │ .on('updated', ()  │   │ quotationEventBus   │   │ quotationEvent │
    │ {                  │   │ .on('updated', ()   │   │ Bus.on()       │
    │   recargarQuot     │   │ {                   │   │ {              │
    │   ations()         │   │   refrescoCotiz     │   │   refrescoGrup │
    │ })                 │   │   acionesAgrupadas()│   │   os()         │
    │                    │   │ })                  │   │ })             │
    │ ACCIÓN:            │   │                     │   │                │
    │ GET /api/quotations│   │ ACCIÓN:             │   │ ACCIÓN:        │
    │ setQuotations(data)│   │ recalcular memoized │   │ recalcular     │
    │                    │   │ groupedQuotations   │   │ groupedQuotat  │
    │ RESULTADO:         │   │ (quotations array   │   │ ions           │
    │ quotations[] ✅    │   │  cambió)            │   │ (quotations    │
    │                    │   │                     │   │  array cambió) │
    │                    │   │ RESULTADO:          │   │                │
    │                    │   │ Agrupa recalculadas│   │ RESULTADO:     │
    │                    │   │ Muestra nuevas     │   │ Selector       │
    │                    │   │ versiones ✅       │   │ actualizado ✅ │
    └────────────────────┘   └─────────────────────┘   └────────────────┘
             │                         │                      │
             └─────────────────────────┴──────────────────────┘
                           │
                           ▼
        ┌───────────────────────────────────┐
        │ 4. RESULTADO FINAL                 │
        │ - quotations[] actualizado        │
        │ - HistorialTAB ve nuevas versiones│
        │ - UserPanel ve nuevas versiones   │
        │ - Caché invalidado                │
        │                                    │
        │ SINCRONIZACIÓN COMPLETA ✅        │
        └───────────────────────────────────┘
```

---

## 4. SECUENCIA TEMPORAL DE EVENTOS

### Timeline: Crear Nueva Versión V2

```
Tiempo   Evento                          Estado
─────────────────────────────────────────────────────────────────
T0       Usuario hace click             Admin Modal abierto
         "Crear Versión"                 
                                        
T1       guardarCotizacionActual()      Normalizando datos
         inicia                          
                                        
T2       Validación de datos            Datos normalizados
         completada                      cotizacionActual = {
                                          heroTituloMain: 'nuevo',
                                          ...
                                        }
                                        
T3       PUT request enviado            En tránsito
         /api/quotation-config          
                                        
T4       Backend: Busca V1              quotationConfig.findFirst()
         en BD                           Encuentra: V1 (id='abc')
                                        
T5       Backend: UPDATE V1             UPDATE cotizationConfig
         Actualiza campos               SET heroTituloMain='nuevo'
                                        WHERE id='abc'
                                        
T6       Backend: Respuesta             JSON: {success, data: V1updated}
         al frontend                    
                                        
T7       setCotizacionConfig()          ✅ HECHO
         (Admin State)                   cotizacionConfig = V1updated
                                        
T8       [DEBERÍA HACER]                ❌ NO IMPLEMENTADO
         recargarQuotations()            quotations[] = [V1, V2, V3]
                                        
T9       [DEBERÍA HACER]                ❌ NO IMPLEMENTADO
         quotationEventBus.emit()       Event: 'quotation:updated'
                                        
T10      HistorialTAB                   ❌ SIN NOTIFICACIÓN
         sigue mostrando                cotizacionesAgrupadas
         versiones viejas               = [V1, V2, V3] (STALE)
                                        
T11      UserManagementPanel            ❌ SIN NOTIFICACIÓN
         sigue mostrando                groupedQuotations
         versiones viejas               = [grupo(V1, V2, V3)] (STALE)
                                        
T12      Toast: "Cambios guardados" ✅  Modal se cierra

T13      Hora actual                    ⚠️ DESINCRONIZACIÓN
         Usuario abre HistorialTAB      Muestra V1, no ve V2
         Usuario intenta asignar        No ve V2 en selector
```

---

## 5. CORRECCIONES NECESARIAS PASO A PASO

### Paso 1: Implementar Event Bus

**Archivo**: `src/lib/eventBus.ts` (NUEVO)

```typescript
type EventHandler = (data: any) => void

type QuotationEventType = 
  | 'quotation:updated'
  | 'quotation:created'
  | 'version:created'
  | 'quotation:activated'
  | 'quotation:deleted'

class QuotationEventBus {
  private listeners: Map<QuotationEventType, Set<EventHandler>> = new Map()

  on(event: QuotationEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  emit(event: QuotationEventType, data: any): void {
    console.log(`[EventBus] Emitiendo: ${event}`, data)
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        console.error(`[EventBus] Error en listener de ${event}:`, error)
      }
    })
  }

  clear(event?: QuotationEventType): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

export const quotationEventBus = new QuotationEventBus()
```

---

### Paso 2: Actualizar guardarEdicion()

**Archivo**: `src/app/admin/page.tsx` (Línea ~1872)

```typescript
const guardarEdicion = async () => {
  try {
    // ... validación ...
    
    // PASO 1: Guardar
    const response = await fetch('/api/quotation-config', {
      method: 'PUT',
      body: JSON.stringify(datosParaGuardar),
    })
    
    const result = await response.json()
    
    // PASO 2: Actualizar estado local (EXISTENTE)
    setCotizacionConfig(result.data)
    
    // PASO 3: [NUEVO] Recargar lista completa
    await recargarQuotations()
    
    // PASO 4: [NUEVO] Emitir evento
    quotationEventBus.emit('quotation:updated', {
      quotation: result.data,
      timestamp: new Date()
    })
    
    // PASO 5: Lógica de cierre (EXISTENTE)
    const debeCerrarModal = useUserPreferencesStore.getState().cerrarModalAlGuardar
    if (debeCerrarModal) {
      setShowModalEditar(false)
    }
    
    toast.success('✅ Cambios guardados')
    
  } catch (error) {
    console.error('Error:', error)
    toast.error('Error al guardar')
  }
}
```

---

### Paso 3: Subscribirse en HistorialTAB

**Archivo**: `src/features/admin/components/tabs/Historial.tsx`

```typescript
export default function Historial({
  snapshots = [],
  quotations = [],
  // ... otros props ...
}: HistorialProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  
  // [NUEVO] Subscribirse a eventos
  useEffect(() => {
    const unsubscribe = quotationEventBus.on('quotation:updated', () => {
      // Cuando se actualiza una cotización, forzar recalculación
      // El memoized useMemo va a recalcular porque quotations[] cambió
      console.log('[HistorialTAB] Cotización actualizada, recalculando grupos')
    })
    
    return unsubscribe
  }, [])
  
  // El resto del componente se recalcula automáticamente
  // porque quotations[] cambia después de recargarQuotations()
}
```

---

### Paso 4: Subscribirse en UserManagementPanel

**Archivo**: `src/features/admin/components/UserManagementPanel.tsx`

```typescript
export default function UserManagementPanel({ quotations }: UserManagementPanelProps) {
  // [NUEVO] Subscribirse a eventos
  useEffect(() => {
    const unsubscribe = quotationEventBus.on('quotation:updated', () => {
      console.log('[UserManagementPanel] Cotización actualizada, refrescando grupos')
      // quotations[] ya cambió en Admin, useMemo recalcula automáticamente
    })
    
    return unsubscribe
  }, [])
  
  // El groupedQuotations useMemo se recalcula automáticamente
  // cuando quotations[] cambia
}
```

---

## 6. VERIFICACIÓN DE SINCRONIZACIÓN

### Checklist Post-Implementación

```
[ ] 1. Event Bus creado
    └─ Archivo src/lib/eventBus.ts existe
    └─ Exporta quotationEventBus
    └─ Métodos: on(), emit(), clear()

[ ] 2. guardarEdicion() actualizado
    └─ Línea 1872: await recargarQuotations()
    └─ Emitir evento: quotationEventBus.emit()
    └─ Toast de éxito

[ ] 3. HistorialTAB suscrito
    └─ useEffect hook para addEventListener
    └─ Cleanup function
    └─ Recalcula cotizacionesAgrupadas

[ ] 4. UserManagementPanel suscrito
    └─ useEffect hook para addEventListener
    └─ Cleanup function
    └─ Recalcula groupedQuotations

[ ] 5. Página Pública notificada
    └─ Si isGlobal cambió → revalidar
    └─ O subscribirse a evento 'quotation:activated'

[ ] 6. Tests
    └─ Crear nueva versión → todos los componentes actualizan
    └─ Modificar campos → evento se emite correctamente
    └─ UserAssignment → ve nuevas versiones
```

---

## 7. CASOS DE USO VALIDADOS

### Caso 1: Editar cotización existente
```
ANTES:
❌ HistorialTAB: versiones viejas
❌ UserPanel: versiones viejas

DESPUÉS:
✅ HistorialTAB: actualizado en <500ms
✅ UserPanel: actualizado en <500ms
✅ Toast: "Cambios guardados"
```

### Caso 2: Crear nueva versión
```
ANTES:
❌ Admin crea V2
❌ HistorialTAB sigue mostrando V1

DESPUÉS:
✅ V2 aparece en HistorialTAB inmediatamente
✅ UserPanel muestra V2 como "latestVersion"
✅ Selector de cotización incluye V2
```

### Caso 3: Asignar usuario a cotización
```
ANTES:
❌ Admin crea V3
❌ Intenta asignar usuario a V3
❌ V3 NO aparece en selector
❌ Admin solo puede asignar V1 o V2

DESPUÉS:
✅ V3 aparece en selector automáticamente
✅ Admin puede asignar V3 a usuario
✅ User.quotationAssignedId = "uuid-v3"
```

---

## 📌 RESUMEN

El sistema necesita un **mecanismo de propagación de cambios** que vincule:

```
Backend (BD actualizada)
        ↓
Frontend (API responde)
        ↓
Estado Global (quotations[] actualizado)
        ↓
Notificación (Event Bus emite evento)
        ↓
Listeners (Componentes se suscriben)
        ↓
Recalculación (useMemo recalculan con nuevo array)
        ↓
Renderizado (UI muestra datos actualizados)
```

Sin este mecanismo: **Cambios en BD = Cambios locales solamente, sin propagación global**.

