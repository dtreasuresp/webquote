# Admin Features Hooks

Custom React hooks for the Admin Panel, extracted from the monolithic AdminPage component.

## 📋 Available Hooks

### 1. `useAdminState` (278 lines)
**Purpose**: Centralized state management for the admin panel

**Exports**:
```typescript
interface UseAdminStateReturn {
  // Quotation config
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  cargandoCotizacion: boolean
  
  // Package snapshots
  snapshots: PackageSnapshot[]
  setSnapshots: (snapshots: PackageSnapshot[]) => void
  
  // Services
  serviciosBase: ServicioBase[]
  serviciosOpcionales: Servicio[]
  
  // Modal states
  modalVisible: boolean
  snapshotEditando: PackageSnapshot | null
  
  // ... more state properties
}
```

**Usage**:
```typescript
const {
  cotizacionConfig,
  setCotizacionConfig,
  snapshots,
  setSnapshots,
  // ... other state
} = useAdminState()
```

---

### 2. `useCotizacionValidation` (160 lines)
**Purpose**: Form validation logic for quotations

**Exports**:
```typescript
interface UseCotizacionValidationReturn {
  validarEmail: (email: string) => boolean
  validarWhatsApp: (whatsapp: string) => boolean
  validarFechas: (emisión: string, vencimiento: string) => boolean
  validarFormularioCotizacion: (config: QuotationConfig) => ValidationErrors
  // ... more validators
}
```

**Usage**:
```typescript
const { validarEmail, validarFechas } = useCotizacionValidation()

if (!validarEmail(email)) {
  setError('Email inválido')
}
```

---

### 3. `useSnapshotCRUD` (307 lines)
**Purpose**: CRUD operations for package snapshots with auto-save

**Exports**:
```typescript
interface UseSnapshotCRUDReturn {
  crearSnapshot: (data: PackageSnapshot) => Promise<PackageSnapshot>
  actualizarSnapshot: (id: string, data: PackageSnapshot) => Promise<PackageSnapshot>
  eliminarSnapshot: (id: string) => Promise<void>
  autoGuardarSnapshot: (snapshot: PackageSnapshot, delay: number) => Promise<void>
  // ... more CRUD operations
}
```

**Usage**:
```typescript
const { actualizarSnapshot, autoGuardarSnapshot } = useSnapshotCRUD()

// Update and auto-save
await autoGuardarSnapshot(updatedSnapshot, 1000)
```

---

### 4. `useModalEdition` (290 lines)
**Purpose**: Modal state management and edit operations

**Exports**:
```typescript
interface UseModalEditionReturn {
  abrirModalEditar: (snapshot: PackageSnapshot) => void
  cerrarModal: () => void
  guardarCambios: () => Promise<void>
  cancelarEdicion: () => void
  nombrePaqueteInputRef: React.RefObject<HTMLInputElement>
  // ... more modal helpers
}
```

**Usage**:
```typescript
const { abrirModalEditar, cerrarModal } = useModalEdition()

const handleEditClick = (snapshot: PackageSnapshot) => {
  abrirModalEditar(snapshot)
}
```

---

### 5. `usePdfGeneration` (150 lines)
**Purpose**: PDF generation and download functionality

**Exports**:
```typescript
interface UsePdfGenerationReturn {
  generarPdf: (snapshot: PackageSnapshot) => Promise<Blob>
  descargarPdf: (snapshot: PackageSnapshot) => Promise<void>
  enviarPorEmail: (snapshot: PackageSnapshot, email: string) => Promise<void>
}
```

**Usage**:
```typescript
const { descargarPdf } = usePdfGeneration()

await descargarPdf(snapshot)
```

---

### 6. `useCotizacionCRUD` (150 lines)
**Purpose**: Quotation CRUD operations (activate, deactivate, reload)

**Exports**:
```typescript
interface UseCotizacionCRUDReturn {
  activarCotizacion: (id: string) => Promise<void>
  desactivarCotizacion: (id: string) => Promise<void>
  recargarCotizacion: () => Promise<void>
  cambiarEstadoCotizacion: (id: string, activo: boolean) => Promise<void>
}
```

**Usage**:
```typescript
const { activarCotizacion } = useCotizacionCRUD()

await activarCotizacion(quotationId)
```

---

## 🎯 Design Principles

1. **Single Responsibility**: Each hook handles one concern
2. **Reusability**: Hooks can be used in any component
3. **Type Safety**: Full TypeScript support
4. **Error Handling**: Proper error management
5. **Performance**: Memoization where appropriate

## 📦 Import Examples

### Individual imports
```typescript
import { useAdminState } from '@/features/admin/hooks/useAdminState'
import { useCotizacionValidation } from '@/features/admin/hooks/useCotizacionValidation'
```

### Barrel export (recommended)
```typescript
import { 
  useAdminState, 
  useCotizacionValidation,
  useSnapshotCRUD,
  useModalEdition,
  usePdfGeneration,
  useCotizacionCRUD
} from '@/features/admin/hooks'
```

## 🧪 Testing

Each hook should be tested independently:

```typescript
describe('useAdminState', () => {
  it('should manage quotation config', () => {
    // Test implementation
  })
})
```

## 🚀 Future Enhancements

- [ ] Add error boundary wrapper
- [ ] Implement context for shared state
- [ ] Add performance profiling
- [ ] Create hook composition utilities
- [ ] Add logging middleware

---

**Status**: Production Ready ✅
**Version**: 1.0.0
**Last Updated**: Phase 7
