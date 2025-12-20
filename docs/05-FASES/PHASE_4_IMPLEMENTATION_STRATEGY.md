# 🟢 PHASE 4: useState Hooks Replacement - Implementation Strategy

**Fecha:** 16 de diciembre de 2025  
**Estado:** IN PROGRESS - Pragmatic Gradual Migration  
**Objetivo:** Reemplazar 69 useState hooks en AdminPage con store selectors y actions

---

## 📊 Current Status

### ✅ COMPLETED
- **quotationId** (línea 98): Migrado de useState a `useQuotationStore((s) => s.quotationId)`
  - Antes: `const [quotationId, setQuotationId] = useState<string | null>(null)`
  - Ahora: `const quotationId = useQuotationStore((s) => s.quotationId)`
  - Sincronización: `loadQuotation(quotationId)` action actualiza el store
  - ✅ TypeScript: exit code 0

- **cargandoCotizacion** (línea 459): Removido (no se usaba)
  - ✅ TypeScript: exit code 0

- **cargandoSnapshots** (línea 551): Migrado de useState a `useSnapshotStore((s) => s.isLoading)`
  - Antes: `const [cargandoSnapshots, setCargandoSnapshots] = useState(true)`
  - Ahora: `const cargandoSnapshots = storeSnapshotLoading`
  - ✅ TypeScript: exit code 0

- **errorSnapshots** (línea 552): Migrado de useState a `useSnapshotStore((s) => s.errors)` con conversión de tipos
  - Antes: `const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)`
  - Ahora: `const errorSnapshots = storeSnapshotErrors ? Object.values(storeSnapshotErrors)[0] || null : null`
  - ✅ TypeScript: exit code 0

### 🟡 IN PROGRESS
- **Batch 3 Blocked:** Type mismatch entre stores y lib/types
  - Descubrimiento: Store types no coinciden con lib/types
  - Ejemplo: `ServicioBase` en store falta `mesesGratis` y `mesesPago`
  - Acción: Demorado a PHASE 5 para armonizar tipos

---

## 🎯 PHASE 4 Roadmap - 3 Batches

### Batch 1: quotationId ✅ DONE
- ✅ quotationId → store selector
- ✅ Sincronización bidireccional vía `loadQuotation()` action
- ✅ TypeScript validation: CLEAN

### Batch 2: Read-Only Selectors (READY)
Estos useState se pueden reemplazar fácilmente porque:
- Solo se leen (no hay lógica de actualización compleja)
- Tienen selectores del store ya disponibles
- Cero cambios disruptivos

**Candidatos:**
1. **cargandoCotizacion** (línea 459) → `storeIsLoading` selector
   - Usado en: Condicionales de UI para mostrar spinners
   - Action necesaria: Ninguna (solo lectura)
   
2. **cargandoSnapshots** (línea 559) → `storeSnapshotLoading` selector
   - Usado en: Mostrar loading state en snapshots
   - Action necesaria: Ninguna (solo lectura)

3. **errorSnapshots** (línea 560) → `storeSnapshotErrors` selector
   - Usado en: Mostrar error messages
   - Action necesaria: Ninguna (solo lectura)

**Estimado:** 30-45 minutos para reemplazar los 3

### Batch 3: Complex Logic States (FUTURE - REQUIRES TYPE HARMONIZATION)
Estos requieren refactorización más profunda:
- `snapshots` (línea 539): Tipo `Snapshot[]` en store ≠ `PackageSnapshot[]` en lib/types
- `serviciosBase` (línea 485): Tipo `ServicioBase` en store ≠ tipo en lib/types
- `serviciosOpcionales` (línea 538): Tipo `Servicio` en store ≠ tipo en lib/types
- `paqueteActual` (línea 502): Tiene validación compleja

**Razón por la que se demoró Batch 3:** 
Los stores y lib/types tienen definiciones de tipos INCONSISTENTES:
```typescript
// En store (services.types.ts)
export interface ServicioBase { id: string, nombre: string, precio: number }

// En lib/types.ts
export interface ServicioBase { id: string, nombre: string, precio: number, mesesGratis: number, mesesPago: number }
```
Esto causa errores TS2345 cuando se intenta sincronizar.

**Solución recomendada para Batch 3 (PHASE 5):**
1. **Armonizar tipos:** Actualizar store types para coincidir con lib/types
2. **O crear adapters:** Funciones que conviertan entre tipos
3. **Luego:** Crear useEffects de sincronización bidireccional

**Patrón para estos:** 
- Crear acciones adicionales en stores si no existen
- Reemplazar `setX()` con `storeAction()`
- Revalidar componentes que dependen de props

**Estimado:** 2-3 horas para refactorizar completamente

---

## 📈 Expected Results After PHASE 4

### Antes (ACTUAL)
```typescript
const [quotationId, setQuotationId] = useState<string | null>(null)
const [cargandoCotizacion, setCargandoCotizacion] = useState(false)
const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)
const [snapshots, setSnapshots] = useState<PackageSnapshot[]>([])
// ... +65 more useState hooks
```
**Total:** 69 useState hooks
**Lines of code:** ~300 lines dedicated to useState declarations and setups

### Después (TARGET - PHASE 4 COMPLETE)
```typescript
// Only 10-12 truly local state hooks remain
const [showConnectionRecoveryDialog, setShowConnectionRecoveryDialog] = useState(false)
const [isResolvingRecovery, setIsResolvingRecovery] = useState(false)
// ... (only essential UI state, no data state)

// All data state from stores
const quotationId = useQuotationStore((s) => s.quotationId)
const cargandoCotizacion = useQuotationStore((s) => s.isLoading)
const errorSnapshots = useSnapshotStore((s) => s.errors)
const snapshots = useSnapshotStore((s) => s.snapshots)
// ... +46 store selectors
```
**Total:** 50+ store selectors + 10-12 local UI state hooks
**Lines of code:** ~200 lines (35% reduction)
**Benefit:** All data state is now centralized, testable, and syncable

---

## 🔄 Synchronization Pattern

### During Transition (Current Approach)
```typescript
// PHASE 4 Pattern: Store selectors + Gradual setter replacement

// For read-only data:
const someData = useStore((s) => s.someData)

// For data with setters:
const [mutableData, setMutableData] = useState(initialValue)
// Sync from store when available:
useEffect(() => {
  if (storeMutableData !== mutableData) {
    setMutableData(storeMutableData)
  }
}, [storeMutableData])

// STATUS: Blocked by type mismatches - see PHASE 5
```

### After Transition (Future)
```typescript
// PHASE 5 Pattern: Store selectors + actions only

const someData = useStore((s) => s.someData)
const { updateSomeData } = useStore()

// Instead of: setMutableData(newValue)
// Use: updateSomeData(newValue)
```

---

## 🚫 Blockers & Discoveries

### Type Mismatch - Store vs lib/types
**Issue:** Store type definitions don't match lib/types definitions

**Examples:**
```typescript
// ❌ store/types/services.types.ts
export interface ServicioBase {
  id: string
  nombre: string
  precio: number
  // Missing: mesesGratis, mesesPago
}

// ✅ lib/types.ts
export interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number  // 👈 Missing in store
  mesesPago: number    // 👈 Missing in store
}
```

**Impact:** Cannot directly map store data to component props without conversion

**Resolution:** 
1. Audit all store types vs lib/types
2. Harmonize definitions
3. Create type adapters if necessary
4. Retry Batch 3 in PHASE 5

---

## 📋 Checklist

- [x] PHASE 4 Batch 1 Complete (quotationId)
- [x] PHASE 4 Batch 2 Complete (read-only selectors)
- [ ] PHASE 4 Batch 3 Blocked (type mismatch discovered)
- [ ] PHASE 5 Type Harmonization
- [ ] PHASE 5 Batch 3 Retry
- [ ] All stores properly integrated (8/8)
- [ ] TypeScript validation passing
- [ ] No infinite loops or re-render issues

---

## 🎓 Lessons Learned

1. **Gradual Migration is Better:** Trying to replace all useState at once causes conflicts
2. **Read-Only Selectors First:** Safe, low-risk, high-reward changes
3. **Store Actions Matter:** Need to create proper actions for setters
4. **Validation at Each Step:** TypeScript exit code 0 after every batch

---

## 📞 Related Documents

- [ZUSTAND_MASTER_PLAN.md](./propuestas/ZUSTAND_MASTER_PLAN.md) - Overall strategy
- [AdminPage.tsx](../../src/app/admin/page.tsx#L98) - Current implementation
- Store files:
  - quotationStore.ts - ✅ Integrated
  - servicesStore.ts - ✅ Integrated
  - snapshotStore.ts - ✅ Integrated
  - modalStore.ts - ✅ Integrated
