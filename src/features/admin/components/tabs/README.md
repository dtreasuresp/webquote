# Admin Panel TAB Components

Modular TAB components for the Admin Panel, each handling a specific admin feature area.

## 📑 Available TABs

### 1. `CotizacionTab` ✨ (Modernized)
**Purpose**: Manage quotation configuration and settings

**Features**:
- Hero title configuration
- Identification (auto-generated number, signature)
- Date management (issue date, validity, expiration)
- Budget settings (amount, currency)
- Contract validity time
- Client information (company, sector, email, WhatsApp, location)
- Provider information (professional name, company, email, WhatsApp, location)

**Visual Design**: 
- Gradient backgrounds (blue, green, cyan, purple, orange sections)
- Color-coded icons per section
- Modern rounded corners and shadows
- Interactive hover states

**Props**:
```typescript
interface CotizacionTabProps {
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  cargandoCotizacion: boolean
  erroresValidacionCotizacion: Record<string, string>
  setErroresValidacionCotizacion: (errores: any) => void
  formatearFechaLarga: (isoString: string) => string
  calcularFechaVencimiento: (fecha: Date, dias: number) => Date
  validarEmail: (email: string) => boolean
  validarWhatsApp: (whatsapp: string) => boolean
  validarFechas: (emisión: string, vencimiento: string) => boolean
}
```

**Key Sections**:
1. **Información de Cotización** (Blue section)
   - Hero title
   - Identification group
   - Dates group
   - Budget group
   - Contract validity

2. **Información del Cliente** (Purple section)
   - Company, sector
   - Email, WhatsApp
   - Location

3. **Información del Proveedor** (Orange section)
   - Professional name
   - Provider company
   - Email, WhatsApp
   - Location

---

### 2. `OfertaTab` ✨ (Modernized)
**Purpose**: Manage services offered in quotations

**Features**:
- Base services management (CRUD)
- Package description
- Optional services (CRUD)
- Service cost calculations
- Validity normalization

**Visual Design**:
- Animated items with Framer Motion
- Box, Settings, and Gift icons
- Cost summary display
- Color-coded sections

**Key Sections**:
1. **Servicios Base** (Blue box icon)
   - List existing services
   - Add new service
   - Edit/delete operations

2. **Descripción del Paquete** (Purple settings icon)
   - Package name, development cost
   - Discount percentage
   - Package type, description

3. **Servicios Opcionales** (Pink gift icon)
   - List optional services
   - Add optional services
   - Cost calculations (Year 1 vs Year 2+)

---

### 3. `PaquetesTab` ✨ (Modernized)
**Purpose**: Manage created package snapshots

**Features**:
- List all created packages
- Show cost breakdown (initial, year 1, year 2+)
- Activate/deactivate packages
- Edit packages via modal
- Delete packages
- Auto-save status

**Visual Design**:
- Cyan box icon
- Cost display cards per package
- Modern card layout with gradients
- Smooth animations on load

**Key Features**:
- Loading state with animated icon
- Error state display
- Package card with:
  - Title and type badge
  - Description preview
  - Creation date
  - Action buttons (activate, edit, delete)
  - Cost breakdown

---

### 4. `PaqueteContenidoTab`
**Purpose**: Manage package content (features, benefits, inclusions)

**Features**:
- Features list
- Benefits list
- Included items
- Exclusions
- Terms & conditions
- Additional information

**Component Design**:
- Reusable `ArrayFieldEditor` for list management
- Textarea fields for text content
- Add/remove item functionality

---

### 5. `Historial`
**Purpose**: Display history/audit log of changes

**Features**:
- Timeline of events
- Change tracking
- User actions log
- Undo/rollback capabilities (optional)

---

### 6. `EstilosYDisenoTab`
**Purpose**: Manage visual design settings

**Features**:
- Color scheme configuration
- Typography settings
- Layout options
- Theme customization

---

### 7. `PreferenciasTab`
**Purpose**: User preferences and settings

**Features**:
- Display preferences
- Notification settings
- Default values
- Save user preferences

---

## 🎨 Design System Applied

### Colors & Gradients
Each TAB uses gradient backgrounds:
```typescript
// Main container gradient
className="bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary"

// Card hover states with transitions
className="hover:border-blue-400/30 hover:shadow-lg transition-all"
```

### Typography
- Headers: `text-sm font-semibold uppercase tracking-wide`
- Labels: `text-xs font-medium uppercase tracking-widest`
- Text: `text-xs text-gh-text`

### Icons
- Color-coded for quick recognition
- Size: 12px-14px for section headers
- Emoji prefixes for additional context

### Spacing
- Container padding: `p-6`
- Grid gaps: `gap-3` to `gap-6`
- Section spacing: `space-y-4` to `space-y-6`

---

## 📦 Import Examples

### Individual imports
```typescript
import CotizacionTab from '@/features/admin/components/tabs/CotizacionTab'
import OfertaTab from '@/features/admin/components/tabs/OfertaTab'
```

### Barrel export (recommended)
```typescript
import { 
  CotizacionTab, 
  OfertaTab, 
  PaquetesTab,
  PaqueteContenidoTab,
  Historial,
  EstilosYDisenoTab,
  PreferenciasTab
} from '@/features/admin/components/tabs'
```

---

## 🔄 Integration with Hooks

Each TAB component is designed to work with admin hooks:

```typescript
import { useAdminState, useCotizacionValidation } from '@/features/admin/hooks'

export default function AdminPageIntegration() {
  const { cotizacionConfig, setCotizacionConfig } = useAdminState()
  const { validarEmail } = useCotizacionValidation()

  return (
    <CotizacionTab
      cotizacionConfig={cotizacionConfig}
      setCotizacionConfig={setCotizacionConfig}
      validarEmail={validarEmail}
      // ... other props
    />
  )
}
```

---

## 📊 Component Statistics

| TAB | Lines | Status | Design |
|-----|-------|--------|--------|
| CotizacionTab | ~430 | ✅ Modernized | Gradients + Icons |
| OfertaTab | ~550 | ✅ Modernized | Animations |
| PaquetesTab | ~250 | ✅ Modernized | Cost Cards |
| PaqueteContenidoTab | ~260 | Migrated | Array Editors |
| Historial | ~100 | Migrated | Original |
| EstilosYDisenoTab | ~100 | Migrated | Original |
| PreferenciasTab | ~100 | Migrated | Original |

---

## 🎯 Development Guidelines

### Creating New TABs
1. Create file: `src/features/admin/components/tabs/NewTab.tsx`
2. Import icons from `react-icons`
3. Use gradient backgrounds
4. Add to barrel export `index.ts`
5. Document in this README

### Modifying TABs
1. Apply consistent spacing (p-6, space-y-4)
2. Use color gradients for sections
3. Add hover states for interactivity
4. Maintain accessibility (labels, aria-labels)
5. Update component statistics above

### Styling Patterns
```typescript
// Container
className="bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary 
           border border-gh-border/50 p-6 rounded-xl"

// Input focus
className="focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"

// Button
className="bg-blue-500/80 text-white hover:bg-blue-600 transition-colors"

// Icon header
<h4 className="flex items-center gap-2 uppercase tracking-wide">
  <FaIcon className="text-blue-400" /> Title
</h4>
```

---

## 🧪 Testing

```typescript
describe('CotizacionTab', () => {
  it('should render quotation configuration', () => {
    // Test
  })

  it('should validate email on change', () => {
    // Test
  })
})
```

---

## 🚀 Future Enhancements

- [ ] Add drag-and-drop for service reordering
- [ ] Implement real-time collaboration
- [ ] Add more animations with Framer Motion
- [ ] Create dark/light mode variants
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo functionality
- [ ] Add AI-powered suggestions

---

**Status**: Production Ready ✅
**Version**: 1.0.0
**Last Updated**: Phase 7
**Design System**: Modern Gradients & Icons
