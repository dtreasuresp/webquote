# 🏗️ ANÁLISIS ARQUITECTÓNICO: SINCRONIZACIÓN GLOBAL DE COTIZACIONES

## 📋 Resumen Ejecutivo

El usuario identificó un problema crítico: **cuando se crea una nueva versión o se modifica una cotización, el sistema NO actualiza correctamente la información en componentes dependientes**, específicamente:

1. **HistorialTAB** - No muestra las nuevas versiones
2. **Gestión de Usuarios (PreferenciasTAB)** - Campo "Cotización Asignada" no se actualiza
3. **Filtrado de cotizaciones** - Las nuevas versiones no se asignan correctamente a clientes

## ⚠️ EL PROBLEMA ARQUITECTÓNICO

### Mapeo del Flujo Actual (Incompleto)

```
┌──────────────────────────────────────────────────────────────────┐
│                   USUARIO MODIFICA COTIZACIÓN                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
            ┌─────────────────────────────────┐
            │  Admin Modal: guardarEdicion()   │
            │  (src/app/admin/page.tsx:1872)  │
            └────────────┬────────────────────┘
                         │
                         ▼
    ┌────────────────────────────────────────────┐
    │  ENVIAR: PUT /api/quotation-config         │
    │  - Actualiza cotización actual             │
    │  - Mantiene isGlobal: true                 │
    │  (src/app/api/quotation-config/route.ts)  │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  Base de Datos Actualizada│
        │  - quotationConfig        │
        │  (1 registro MODIFICADO)  │
        └───────────┬───────────────┘
                    │
                    ▼
        ┌─────────────────────────────────┐
        │  ✅ ESTO SÍ FUNCIONA             │
        │  setCotizacionConfig()           │
        │  (actualiza estado local admin)  │
        └─────────────────────────────────┘
                    │
                    ❌ SE DETIENE AQUÍ ❌
                    │
    ┌───────────────┴────────────────────┬──────────────────┐
    │                                     │                  │
    ▼                                     ▼                  ▼
❌ HistorialTAB               ❌ UserManagementPanel     ❌ Página Pública
NO RECIBE ACTUALIZACIÓN      NO RECIBE ACTUALIZACIÓN   NO RECIBE ACTUALIZACIÓN

```

### Problema Raíz: Falta de Sistema de Notificación Global

El flujo termina en:
```
updateLocalState() ✅
└─ NO SE PROPAGA A:
   ├─ quotations array (estado global)
   ├─ HistorialTAB (necesita listar todas las versiones)
   ├─ UserManagementPanel (necesita saber qué versiones hay)
   └─ Caché global
```

---

## 🔍 ANÁLISIS DETALLADO POR COMPONENTE

### 1. FLUJO DE GUARDADO (Admin Panel)

**Archivo**: `src/app/admin/page.tsx` (Líneas 1759-1885)

#### Función: `guardarCotizacionActual()`
```typescript
// PASO 1: Normalizar datos (CORRECTO - resuelve Issue #1)
const datosParaGuardar = {
  heroTituloMain: cotizacionActual.heroTituloMain ?? '',
  heroTituloSub: cotizacionActual.heroTituloSub ?? '',
  numero: cotizacionActual.numero ?? '',
  // ... 16 campos ...
}

// PASO 2: Enviar al API
const response = await fetch(`/api/quotation-config`, {
  method: 'PUT',
  body: JSON.stringify(datosParaGuardar),
})

// PASO 3: Actualizar estado LOCAL
setCotizacionConfig(result.data)  ✅ AQUÍ

// PASO 4: Controlar cierre de modal según toggle
const debeCerrarModal = useUserPreferencesStore.getState().cerrarModalAlGuardar
if (debeCerrarModal) {
  setShowModalEditar(false)
}
```

**Problema**: Después de `setCotizacionConfig()`, **NO HAY notificación a otros componentes**

---

### 2. ENDPOINT DE ACTUALIZACIÓN (Backend)

**Archivo**: `src/app/api/quotation-config/route.ts` (Líneas 207-280)

#### Comportamiento: Simple UPDATE
```typescript
export async function PUT(request: NextRequest) {
  // Busca cotización global actual
  let cotizacion = await prisma.quotationConfig.findFirst({
    where: { OR: [{ isGlobal: true }, { activo: true }] },
  })
  
  // ACTUALIZA (no crea nueva versión)
  const cotizacionActualizada = await prisma.quotationConfig.update({
    where: { id },
    data: {
      heroTituloMain: data.heroTituloMain ?? cotizacion.heroTituloMain,
      // ... actualización de campos ...
      isGlobal: true,  // MANTIENE como activa
    }
  })
  
  return NextResponse.json({ success: true, data: cotizacionActualizada })
}
```

**Problema**: La respuesta solo retorna 1 cotización. No informa sobre:
- Versiones anteriores
- Cambios en el estado global
- Requiere refrescado manual de lista completa

---

### 3. HISTORIAL TAB (Visualización de Versiones)

**Archivo**: `src/features/admin/components/tabs/Historial.tsx` (Líneas 83-114)

#### Cómo carga datos:
```typescript
const cotizacionesAgrupadas = useMemo((): CotizacionAgrupada[] => {
  // Agrupa por número base
  const grupos = new Map<string, QuotationConfig[]>()
  
  for (const q of quotations) {  // ⚠️ DEPENDE DE: props.quotations[]
    const numeroBase = extractBaseQuotationNumber(q.numero)
    grupos.set(numeroBase, [...(grupos.get(numeroBase) || []), q])
  }
  
  // Renderiza...
  return resultado
}, [quotations])  // ⚠️ SOLO RECALCULA SI quotations[] CAMBIA
```

**Problema**: El array `quotations[]` viene de props del Admin Page. Cuando se crea una NUEVA VERSIÓN:

```typescript
// En admin/page.tsx
const [quotations, setQuotations] = useState<QuotationConfig[]>([])

// Cuando guardas:
guardarEdicion() → setCotizacionConfig() ✅
               → setQuotations() ❌ NO SE LLAMA AUTOMÁTICAMENTE
```

**Consecuencia**: Historial muestra versiones viejas hasta que el usuario haga refresh manual.

---

### 4. GESTIÓN DE USUARIOS (Cotización Asignada)

**Archivo**: `src/features/admin/components/UserManagementPanel.tsx` (Líneas 112, 390-430)

#### Cómo agrupa cotizaciones:
```typescript
function groupQuotationsByBase(quotations: QuotationOption[]): GroupedQuotation[] {
  const groups = new Map<string, QuotationOption[]>()
  
  for (const q of quotations) {  // ⚠️ DEPENDE DE: props.quotations[]
    const base = getBaseNumber(q.numero)
    groups.set(base, [...(grupos.get(base) || []), q])
  }
  
  // Cada grupo muestra:
  // - baseNumber: "CZ-0001"
  // - latestVersion: la más reciente
  // - versions: todas las versiones
  
  return result
}

// Usa en formulario de usuario:
const groupedQuotations = useMemo(() => 
  groupQuotationsByBase(quotations),  // ⚠️ DEPENDE DE: quotations prop
  [quotations]
)
```

**Problema**: Al crear una nueva versión:

```
Nueva versión creada en BD:
- CZ-0001.251703V2 (versionNumber: 2)

UserManagementPanel ve:
- CZ-0001.251703V1 (versionNumber: 1)  ← DESACTUALIZADO

Porque no fue notificado que quotations[] cambió
```

**Impacto**: Usuario intenta asignar cotización y no ve la V2 más reciente.

---

### 5. FILTRADO POR USUARIO

**Archivo**: `src/app/api/quotation-config/route.ts` (Líneas 20-70)

#### GET: Obtener cotización del usuario
```typescript
export async function GET(request: NextRequest) {
  // SUPER_ADMIN/ADMIN sin asignación → busca isGlobal: true
  if (!session.user.quotationAssignedId) {
    const cotizacion = await prisma.quotationConfig.findFirst({
      where: { isGlobal: true },  // ← BUSCA LA ACTIVA
      orderBy: { updatedAt: 'desc' },
    })
  }
  
  // USER con asignación → filtra por quotationAssignedId
  else {
    const cotizacion = await prisma.quotationConfig.findUnique({
      where: { id: session.user.quotationAssignedId },
    })
  }
}
```

**Problema**: Si asignaste el usuario a `CZ-0001.251703V1` y luego se crea V2:

```
quotationAssignedId sigue apuntando a V1
User.quotationAssignedId = "uuid-de-V1"
                           ↓ No se actualiza
Nueva cotización V2 con isGlobal: true existe en BD
                           ↓ User sigue viendo V1
```

El campo NO se actualiza porque no hay mecanismo que notifique al sistema que la versión cambió.

---

## 🎯 MAPA DE DEPENDENCIAS

```
┌─────────────────────────────────┐
│  Admin Page                      │
│  src/app/admin/page.tsx          │
└────────────┬────────────────────┘
             │
             ├─── quotations[] ────────────────┐
             │                                  │
             ├─── cotizacionConfig ──────────┐ │
             │                                │ │
             ▼                                │ │
    ┌──────────────────┐                   │ │
    │ HistorialTAB     │◄──────────────────┘ │
    │ (lee quotations[]│                     │
    │  para agrupar)   │                     │
    └──────────────────┘                     │
                                             │
             ▼                                │
    ┌──────────────────────┐                │
    │ UserManagementPanel  │◄───────────────┘
    │ (lee quotations[]    │
    │  para agrupar)       │
    └──────────────────────┘
             │
             ├─── groupedQuotations ────────┐
             │                               │
             ▼                               │
    ┌──────────────────────┐                │
    │ Dialog de Usuario    │◄───────────────┘
    │ (selector de cotización)
    │                      │
    │ quotationAssignedId  │
    └──────────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Base de Datos        │
    │ User.quotationAssignedId
    └──────────────────────┘

PROBLEMA: Si quotations[] no se actualiza → TODO SE DESINCRONIZA
```

---

## 🔄 FLUJOS DE REFRESCADO EXISTENTES (Parciales)

### Flujo 1: `recargarQuotations()` (Manual)
**Ubicación**: `src/app/admin/page.tsx` (Línea 2232)

```typescript
const recargarQuotations = async () => {
  try {
    const response = await fetch('/api/quotations', { cache: 'no-store' })
    const data = await response.json()
    if (data.success) {
      setQuotations(data.data || [])  // ✅ ACTUALIZA quotations[]
    }
  } catch (error) {
    console.error('Error recargando quotations:', error)
  }
}
```

**Cuándo se usa**:
- ✅ Al duplicar versión (línea 2427)
- ✅ Al restaurar versión (línea 2427)
- ✅ Al activar cotización (línea 3650)
- ❌ **NO se usa al MODIFICAR cotización actual**

**Problema**: Es MANUAL, no automático. Después de guardar edición, el dev debe acordarse de llamarlo.

---

### Flujo 2: `Promise.all([snapshots, quotations])` (Paralelo)
**Ubicación**: `src/app/admin/page.tsx` (Línea 3270)

```typescript
const [snapshotsActualizados, quotationsResponse] = await Promise.all([
  obtenerSnapshotsCompleto(),
  fetch('/api/quotations', { cache: 'no-store' }).then(r => r.json())
])

// Actualizar AMBOS juntos
setSnapshots(snapshotsActualizados)
if (quotationsResponse.success) {
  setQuotations(quotationsResponse.data || [])
}
```

**Cuándo se usa**:
- Solo en procesos complejos (crear versión con paquetes)

**Problema**: No se usa en guardarEdicion() simple.

---

### Flujo 3: Actualización de Caché Local
**Ubicación**: `src/lib/cache/quotationCache.ts`

```typescript
export function saveQuotationDirty(quotation: QuotationConfig): boolean {
  const cached: CachedQuotation = {
    data: quotation,
    metadata: {
      isDirty: true,
      syncStatus: 'pending'
    }
  }
  return storage.setItem(key, cached)
}
```

**Problema**: Solo guarda 1 cotización. No actualiza lista global en caché.

---

## 🚨 PROBLEMAS IDENTIFICADOS

### Problema 1: Sin Sistema de Notificación Centralizado
```typescript
// NO EXISTE:
const publishQuotationUpdated = (quotation: QuotationConfig) => {
  // Notificar a:
  // - Historial TAB
  // - UserManagementPanel  
  // - quotations[] store
  // - caché global
  // - página pública
}

// LO QUE EXISTE:
setCotizacionConfig() → Solo actualiza 1 variable local
```

### Problema 2: quotations[] Se Sincroniza Manualmente
```typescript
// Cada operación decide si llamar a recargarQuotations()
duplicarVersion() → await recargarQuotations() ✅
restaurarVersion() → await recargarQuotations() ✅
guardarEdicion() → ??? (Ni lo hace ni marca para hacerlo) ❌
```

### Problema 3: Sin Invalidación de Caché
```typescript
// Cuando cambias una cotización:
// 1. Se actualiza en BD ✅
// 2. Se actualiza en estado local ✅
// 3. Se invalida caché local? ❌

// Los selectores useMemo siguen usando datos viejos
// porque no saben que la fuente cambió
```

### Problema 4: sin Patrón de Propagación
```typescript
// Flujo ACTUAL:
Admin Modal → PUT API → Local State ✅
                       │
                       └─→ Historial? (NO SABE)
                       └─→ UserPanel? (NO SABE)
                       └─→ Página Pública? (NO SABE)

// Flujo NECESARIO:
Admin Modal → PUT API → Notificación Global
                        ├─→ Actualizar quotations[]
                        ├─→ Invalidar Historial
                        ├─→ Actualizar UserPanel
                        ├─→ Actualizar Caché
                        └─→ Notificar página pública
```

---

## 🏛️ ARQUITECTURA NECESARIA

### Opción 1: Event Bus Pattern (RECOMENDADA)
```typescript
// src/lib/eventBus.ts
class QuotationEventBus {
  private listeners: Map<string, Set<Function>> = new Map()
  
  on(event: 'quotation:updated' | 'quotation:created' | 'version:created', 
     handler: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }
  
  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(h => h(data))
  }
}

export const quotationEventBus = new QuotationEventBus()
```

**Ventajas**:
- ✅ Desacoplado
- ✅ Escalable
- ✅ Fácil de testear
- ✅ Funciona con múltiples componentes

---

### Opción 2: Zustand Global Store (ALTERNATIVA)
```typescript
// src/stores/quotationStore.ts
interface QuotationState {
  quotations: QuotationConfig[]
  activeQuotation: QuotationConfig | null
  
  actions: {
    setQuotations: (q: QuotationConfig[]) => void
    updateQuotation: (id: string, updates: Partial<QuotationConfig>) => void
    invalidateList: () => void
  }
}

export const useQuotationStore = create<QuotationState>((set) => ({
  quotations: [],
  activeQuotation: null,
  
  actions: {
    setQuotations: (q) => set({ quotations: q }),
    updateQuotation: (id, updates) => 
      set((state) => ({
        quotations: state.quotations.map(q => 
          q.id === id ? { ...q, ...updates } : q
        )
      })),
    invalidateList: () => set((state) => ({
      quotations: [...state.quotations]  // Trigger recomputes
    }))
  }
}))
```

**Ventajas**:
- ✅ Integrado con React
- ✅ Menos código
- ✅ Ya usa Zustand en el proyecto

---

### Opción 3: SWR/React Query Pattern (MODERNA)
```typescript
// Usar react-query para gestionar caché del servidor
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const useUpdateQuotation = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    (data) => fetch('/api/quotation-config', { method: 'PUT', body: JSON.stringify(data) }),
    {
      onSuccess: () => {
        // Invalidar automáticamente
        queryClient.invalidateQueries(['quotations'])
        queryClient.invalidateQueries(['quotations', 'list'])
      }
    }
  )
}
```

**Ventajas**:
- ✅ Caché automático
- ✅ Invalidación built-in
- ✅ Manejo de estados robusto

---

## 📊 PUNTOS DE SINCRONIZACIÓN NECESARIOS

### 1. Después de Guardar Edición
```
guardarCotizacionActual()
├─ PUT /api/quotation-config ✅
├─ setCotizacionConfig(result.data) ✅
├─ [FALTA] refreshQuotationsList() ❌
├─ [FALTA] invalidateCaché() ❌
└─ [FALTA] publishEvent('quotation:updated') ❌
```

### 2. Después de Crear Versión
```
crearNuevaVersionión()
├─ POST /api/quotation-config ✅
├─ setCotizacionConfig(nuevaVersion) ✅
├─ [FALTA] recargarQuotations() ← EXISTE pero no se llama
├─ [FALTA] notificarHistorial() ❌
├─ [FALTA] notificarUserPanel() ❌
└─ [FALTA] actualizarUserAssignments() ❌
```

### 3. Después de Activar Cotización
```
desactivarTodas() + setGlobal()
├─ PATCH /api/quotations/[id]/status ✅
├─ recargarQuotations() ✅ [EXISTE]
├─ [FALTA] notificarPaginaPublica() ❌
└─ [FALTA] actualizarClientAssignments() ❌
```

### 4. Después de Duplicar Versión
```
handleDuplicarVersion()
├─ POST /api/quotation-config (duplica) ✅
├─ recargarQuotations() ✅ [EXISTE]
├─ [FALTA] refreshCotizacionesAgrupadas() ❌
└─ [FALTA] notificarUserPanel() ❌
```

---

## 🔗 COMPONENTES DEPENDIENTES QUE NECESITAN SINCRONIZACIÓN

### 1. HistorialTAB
**Problema**: 
- Lee `quotations[]` prop
- Agrupa por número base
- Si `quotations[]` no se actualiza, ve versiones viejas

**Solución**:
```typescript
// Hacer que siempre tenga datos frescos
const [localQuotations, setLocalQuotations] = useState<QuotationConfig[]>([])

useEffect(() => {
  // Sincronizar cuando props.quotations cambia
  setLocalQuotations(props.quotations)
}, [props.quotations])

// O mejor: Cargar directamente desde API
useEffect(() => {
  const fetchVersiones = async () => {
    const res = await fetch('/api/quotation-config/versions')
    const data = await res.json()
    setLocalQuotations(data.versiones)
  }
  fetchVersiones()
}, [quotationId])
```

### 2. UserManagementPanel
**Problema**:
- Lee `quotations` prop para agrupar
- Si no se actualiza, usuarios ven versiones viejas

**Solución**:
```typescript
// Refrescar lista cuando se abre el panel
useEffect(() => {
  if (isOpen) {
    recargarQuotations() // Force refresh
  }
}, [isOpen])

// O subscribirse a eventos
useEffect(() => {
  const unsubscribe = quotationEventBus.on('quotation:updated', () => {
    recargarQuotations()
  })
  return unsubscribe
}, [])
```

### 3. Página Pública (/app/page.tsx)
**Problema**:
- Carga `GET /api/quotation-config` (busca isGlobal: true)
- No sabe cuándo cambió la cotización activa

**Solución**:
```typescript
// En Admin, después de activar:
desactivarTodas(newId)
├─ PATCH /api/quotations/[id]/status (set isGlobal:true)
└─ [NUEVO] Invalidar caché público
  └─ fetch('/api/revalidate?tag=quotation-public', { method: 'POST' })

// O usar event:
quotationEventBus.emit('quotation:activated', { quotationId: newId })
```

### 4. User Assignments
**Problema**:
- `User.quotationAssignedId` apunta a una versión específica
- Si se crea V2, el campo no se actualiza

**Solución**:
```typescript
// Al crear nueva versión:
const nuevaVersion = await crearVersion()

// Actualizar usuarios que tenían versión anterior
if (versionAnterior.numero === "CZ-0001.251703V1") {
  await actualizarUsersQuotations({
    de: versionAnterior.id,
    hacia: nuevaVersion.id
  })
}

// O mejor: Cambiar modelo para guardar "número base" no "ID específico"
// User.quotationAssignedNumber = "CZ-0001"
// Luego filtra: findFirst({ numero: { startsWith: "CZ-0001" } })
```

---

## 📝 DIAGRAMA DE FLUJO PROPUESTO

```
┌───────────────────────────────┐
│ Usuario modifica cotización   │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ guardarCotizacionActual()           │
│ (Admin Modal)                        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ PUT /api/quotation-config       │
│ Backend: Actualiza cotización   │
│ Retorna: quotation actualizada  │
└──────┬──────────────────────────┘
       │
       ▼ RESPUESTA
┌──────────────────────────┐
│ Admin recibe respuesta   │
├──────────────────────────┤
│ ✅ 1. setCotizacionConfig()
│    Actualiza cotización actual
│
│ ✅ 2. [NUEVO] await refreshQuotationsList()
│    GET /api/quotations
│    Actualiza quotations[]
│
│ ✅ 3. [NUEVO] await invalidateCache()
│    Limpia caché de quotations
│
│ ✅ 4. [NUEVO] quotationEventBus.emit('quotation:updated', {...})
│    Notifica a todos los listeners
│
│ ✅ 5. Toast: "Cambios guardados"
│
│ ✅ 6. Si debeCerrarModal: close()
└──────────────────────────┘
       │
       ├──────────────────────────────┐
       │                              │
       ▼                              ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│ HistorialTAB recibe     │  │ UserManagementPanel      │
│ evento 'updated'        │  │ recibe evento 'updated'  │
│                         │  │                          │
│ refrescar grupadas()    │  │ refrescar grupos()       │
│ cotizacionesAgrupadas = │  │ groupedQuotations =      │
│   memoRecalculated      │  │   memoRecalculated       │
│                         │  │                          │
│ Muestra V2 ✅           │  │ Muestra V2 ✅            │
└─────────────────────────┘  └──────────────────────────┘
       │                              │
       └──────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Página Pública         │
         │ Si isGlobal cambió:    │
         │ - Revalidar caché      │
         │ - Mostrar cotización   │
         │   correcta ✅          │
         └────────────────────────┘
```

---

## 📋 LISTA DE CAMBIOS NECESARIOS

### Cambio 1: Crear Event Bus
**Archivo nuevo**: `src/lib/eventBus.ts`
- Clase QuotationEventBus
- Métodos: on(), emit(), off()
- Eventos: 'quotation:updated', 'quotation:created', 'version:created', 'quotation:activated'

### Cambio 2: Actualizar guardarEdicion()
**Archivo**: `src/app/admin/page.tsx` (Línea 1872)
- Después de setCotizacionConfig()
- Llamar a recargarQuotations()
- Emitir evento quotationEventBus.emit('quotation:updated')

### Cambio 3: Refrescado en HistorialTAB
**Archivo**: `src/features/admin/components/tabs/Historial.tsx`
- Subscribirse a evento 'quotation:updated'
- Refrescar cotizacionesAgrupadas

### Cambio 4: Refrescado en UserManagementPanel
**Archivo**: `src/features/admin/components/UserManagementPanel.tsx`
- Subscribirse a evento 'quotation:updated'
- Refrescar groupedQuotations

### Cambio 5: Modelo de datos para User Assignments
**Archivo**: `prisma/schema.prisma`
- Cambiar User.quotationAssignedId de FK específico a campo de número base
- O crear tabla intermedia User-Quotation-Version

### Cambio 6: API para revalidar caché público
**Archivo nuevo**: `src/app/api/revalidate/route.ts`
- Endpoint que invalida caché de página pública
- Llamado después de activar cotización

### Cambio 7: Agregación de versiones en respuesta API
**Archivo**: `src/app/api/quotation-config/route.ts` (PUT)
- Retornar también lista de versiones relacionadas
- O incluir información de "siguiente versión disponible"

---

## 🎯 RECOMENDACIONES FINALES

### Prioridad 1 (CRÍTICA) - Implementar ahora
1. **Event Bus**: Sistema de notificación centralizado
2. **Auto-refresh en guardarEdicion()**: Llamar a recargarQuotations() después de guardar
3. **Sincronización en HistorialTAB**: Escuchar eventos de actualización

### Prioridad 2 (IMPORTANTE) - Después de Prioridad 1
4. **UserManagementPanel**: Escuchar eventos para refrescar grupos
5. **Invalidación de Caché**: Limpiar caché de quotations después de cambios
6. **Modelo de User-Quotation**: Mejorar para soportar versiones dinámicas

### Prioridad 3 (FUTURO) - Mejoras
7. **Revalidación de página pública**: Trigger cuando cotización activa cambia
8. **WebSocket**: Para sincronización en tiempo real entre usuarios
9. **React Query**: Reemplazar fetch manual con caché robusto

---

## 🏁 CONCLUSIÓN

El problema **NO es** en la lógica de guardar individual (eso ya funciona).

El problema **ES** la **falta de un sistema de notificación global** que propague cambios a:
- ✅ quotations[] array
- ✅ HistorialTAB (para re-agrupar)
- ✅ UserManagementPanel (para re-agrupar)
- ✅ Caché local
- ✅ Página pública

**Solución recomendada**: Implementar Event Bus + Auto-refresh automático después de cada operación CRUD.

