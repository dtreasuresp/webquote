# 🏗️ ARQUITECTURA VISUAL - PHASES 8-10

## 📐 Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│                      WebQuote Admin Panel                        │
│                         (AdminPage)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
            ┌───▼──┐  ┌──────▼────┐  ┌────▼────┐
            │Hooks │  │Components │  │ Utils   │
            └──────┘  └───────────┘  └─────────┘
                │             │             │
         useAdminState    3 Components    95+ Functions
         (centralizado)   Profesionales   Reutilizables
```

---

## 🎯 Flujo de Datos

```
                     User Input
                        │
                        ▼
              ┌──────────────────┐
              │  AdminPage.tsx   │
              │  (Main Component)│
              └──────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
    AdminHeader    MainContent    DialogoGenerico
    (Sticky Top)   (Sections)     (Modal)
         │              │              │
    Save/PDF/New    Render           Show
      Buttons       Content         Notifications


              Central State Management
                   (useAdminState)
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    Config        Services          Snapshots
    Settings      Base/Optional     Versions
```

---

## 📦 Componentes Detallado

### AdminHeader (180 líneas)
```
┌─────────────────────────────────────────┐
│         AdminHeader (Sticky)             │
├─────────────────────────────────────────┤
│  [Save] [PDF] [New Quote] [Settings] ▼  │
│  "CZ-2025-001" | Cambios: Sí ▢         │
├─────────────────────────────────────────┤
│ Dropdown Menu (Settings)                │
│ ├─ Preferencias                         │
│ ├─ Exportar Config                      │
│ ├─ Ayuda                                │
│ └─ Cerrar Sesión                        │
└─────────────────────────────────────────┘
   ↓ Eventos ↓
  onSave, onPdfExport, onNewQuote, onSettings
```

### DialogoGenerico (180 líneas)
```
┌─────────────────────────────────┐
│   DialogoGenerico Modal          │
├─────────────────────────────────┤
│ ✕ [Close]                       │
│ ─────────────────────────────  │
│ [Icon] Título                   │
│ Descripción largo y detallado   │
│ ─────────────────────────────  │
│ [Cancelar] [Aceptar]           │
└─────────────────────────────────┘

Tipos:
  ✓ Info (azul)
  ✓ Success (verde)
  ⚠ Warning (amarillo)
  ✗ Error (rojo)

Tamaños: sm | md | lg | xl
```

### SharedComponents (250 líneas)
```
Button
├─ Variantes: primary | secondary | tertiary | ghost | danger
├─ Tamaños: sm | md | lg
├─ Estados: normal | hover | active | disabled | loading
└─ Props: onClick, disabled, loading, children, icon

Badge
├─ Variantes: primary | secondary | success | warning | error | info
├─ Tamaños: sm | md | lg
└─ Props: children, variant, size

IconButton
├─ Variantes: primary | secondary | danger | ghost
├─ Tamaños: sm | md | lg
├─ Con Tooltip
└─ Props: icon, onClick, variant, size, title
```

---

## 🛠️ Utilities Detallado

### validators.ts (340 líneas, 20+ funciones)
```
Emails
├─ validarEmail(email) → boolean
└─ validarEmailMultiple(emails[]) → boolean

WhatsApp/Phone
├─ validarWhatsApp(number) → boolean
└─ validarTelefono(phone) → boolean

Dates
├─ validarFechas(emisión, vencimiento) → boolean
└─ validarFechaISO(fecha) → boolean

Tabs
├─ validarTabCotizacion(config) → ValidationResult
├─ validarTabOferta(config) → ValidationResult
├─ validarTabCliente(config) → ValidationResult
├─ validarTabPresentacion(config) → ValidationResult
└─ validarTabServicios(config) → ValidationResult

Generic
├─ validarStringRequerido(string) → boolean
├─ validarNumeroPositivo(number) → boolean
└─ validarArrayNoVacio(array) → boolean
```

### formatters.ts (360 líneas, 20+ funciones)
```
Dates
├─ formatearFechaLarga(date) → "20 de noviembre de 2025"
├─ formatearFechaCorta(date) → "20/11/2025"
└─ formatearFechaISO(date) → "2025-11-20"

Currency
├─ formatearMonedaUSD(number) → "$1,500.00"
└─ formatearMonedaCOP(number) → "$1.500"

Numbers
├─ redondear(number, decimales) → number
├─ formatearNumero(number) → "1,500"
└─ formatearPorcentaje(decimal) → "12.34%"

Strings
├─ capitalize(string) → "Hola mundo"
├─ slugify(string) → "hola-mundo"
├─ truncar(string, length) → "texto m..."
└─ removerEspacios(string) → string

Arrays
├─ deduplicar(array) → array
├─ ordenarPor(array, propiedad, desc) → array
├─ groupBy(array, propiedad) → object
└─ sortByDate(array, field) → array
```

### calculations.ts (380 líneas, 30+ funciones)
```
Dates
├─ calcularFechaVencimiento(date, days) → Date
├─ calcularDiasRestantes(date) → number
├─ calcularDiasTranscurridos(from, to) → number
└─ calcularFechaFutura(date, amount, unit) → Date

Prices
├─ calcularPrecioAnual(dev, hosting, domain) → number
├─ calcularConDescuento(price, discount%) → number
├─ calcularConIVA(price, iva%) → number
├─ calcularROI(inversion, ganancia) → number%
├─ calcularAmortizacion(capital, tasa, periods) → number
└─ calcularCuotaMensual(anual) → number

Services
├─ calcularInversionTotal(servicios, descuento) → number
├─ calcularCostoMensual(anual) → number
├─ calcularCostoAnual(mensual) → number
└─ calcularCostoImplementacion(servicios) → number

Snapshots
├─ obtenerSnapshotsActivos(array) → array
├─ calcularRangoSnapshots(array, field) → {min, max}
├─ estadisticasSnapshots(array) → {total, avg, median}
└─ agruparSnapshotsPorFecha(array) → object

Packages
├─ calcularVigenciaPaquete(date, days) → object
├─ calcularDescuentoVolumen(quantity) → number%
└─ calcularPrecioFinal(base, descuento) → number
```

### generators.ts (380 líneas, 25+ funciones)
```
IDs
├─ generarUUID() → "550e8400..."
├─ generarIDCorto() → "abc123xyz"
└─ generarIDNumerico() → "12345678"

Numbers
├─ generarNumeroAleatorio(min, max) → number
├─ generarNumeroDecimal(min, max, decimals) → number
└─ generarNumeroSecuencial() → "CZ-2025-001"

Configs
├─ generarConfiguracionCotizacionInicial() → object
├─ generarServicioBaseInicial() → object
└─ generarPaqueteInicial() → object

Data
├─ generarCotizacionEjemplo() → object
├─ generarCotizacionesEjemplo(quantity) → array
└─ generarSnapshotEjemplo() → object

Options
├─ generarOpcionesSector() → array
├─ generarOpcionesTipoPaquete() → array
├─ generarOpcionesNivelProfesional() → array
└─ generarOpcionesDuracion() → array

Colors/Styles
├─ generarColorAleatorio() → "#FF5733"
├─ generarColorPorEstado(estado) → "#color"
└─ generarClasePorEstado(estado) → "clase-css"
```

---

## 🔄 Estado Management

```
                 useAdminState Hook
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
Cotización          Servicios           Snapshots
Config              Base                Estado
    │                   │                   │
    ├─ numero          ├─ array            ├─ array
    ├─ emisión         ├─ total            ├─ fechas
    ├─ vencimiento     └─ precios          └─ versiones
    ├─ descuentos
    └─ estado


        UI State (AdminPage)
            │
    ┌───────┼───────┐
    │       │       │
isSaving  isPdf  hasChanges
  bool     bool    bool
    │       │       │
    └─────dialog────┘
         config
```

---

## 📊 Handlers Flow

```
AdminHeader Button Clicked
        │
        ├─ Save Button
        │   └─ handleSave()
        │       ├─ isSaving = true
        │       ├─ validar datos
        │       ├─ localStorage.setItem
        │       ├─ refreshSnapshots()
        │       ├─ DialogoGenerico (success)
        │       └─ isSaving = false
        │
        ├─ PDF Button
        │   └─ handlePdfExport()
        │       ├─ isPdfGenerating = true
        │       ├─ validar snapshots
        │       ├─ generatePDF()
        │       ├─ DialogoGenerico (error/success)
        │       └─ isPdfGenerating = false
        │
        ├─ New Quote Button
        │   └─ handleNewQuote()
        │       ├─ clearState()
        │       ├─ resetForm()
        │       └─ hasChanges = false
        │
        └─ Settings Button
            └─ handleSettings()
                └─ showSettingsPanel()
```

---

## 🔌 Integración de Utilities

```
AdminPage.tsx
        │
    ┌───┼───┬──────────────┐
    │   │   │              │
    ▼   ▼   ▼              ▼
handlers  validación  formateo   cálculos
    │         │          │         │
    ├─────────┴──────────┴────────┘
    │
    ▼
  UI Update
  ├─ mostrar errores
  ├─ actualizar valores
  ├─ refrescar pantalla
  └─ mostrar dialogo
```

---

## 📁 Estructura Archivos

```
src/features/admin/
│
├── AdminPage.tsx .......................... (280 líneas)
│   └─ Componente principal
│   └─ useAdminState centralizado
│   └─ handlers mejorados
│
├── hooks/ ................................ (6 hooks)
│   ├── useAdminState.ts
│   ├── useCotizacionValidation.ts
│   ├── useSnapshotCRUD.ts
│   ├── useModalEdition.ts
│   ├── usePdfGeneration.ts
│   └── useCotizacionCRUD.ts
│
├── components/ ........................... (8 componentes)
│   ├── AdminHeader.tsx ................... (180 líneas) ✅ NUEVO
│   ├── DialogoGenerico.tsx .............. (180 líneas) ✅ NUEVO
│   ├── SharedComponents.tsx ............. (250 líneas) ✅ NUEVO
│   ├── index.ts ......................... (barrel) ✅ NUEVO
│   ├── ServiciosBaseSection.tsx
│   ├── PaqueteSection.tsx
│   ├── ServiciosOpcionalesSection.tsx
│   ├── DescuentosSection.tsx
│   └── SnapshotsTableSection.tsx
│
└── utils/ ............................... (4 módulos)
    ├── validators.ts .................... (340 líneas) ✅ NUEVO
    ├── formatters.ts .................... (360 líneas) ✅ NUEVO
    ├── calculations.ts .................. (380 líneas) ✅ NUEVO
    ├── generators.ts .................... (380 líneas) ✅ NUEVO
    └── index.ts ......................... (barrel) ✅ NUEVO
```

---

## 🚀 Data Flow

```
User Input
    │
    ▼
─────────────────────
│ AdminHeader       │ ← save, pdf, new, settings
│ Main Content      │ ← form inputs
│ DialogoGenerico   │ ← confirmations
─────────────────────
    │
    ▼
  Handlers
  ├─ validarDatos (validators)
  ├─ formatearDatos (formatters)
  ├─ calcularValores (calculations)
  └─ generarIDs (generators)
    │
    ▼
  useAdminState
  ├─ setCotizacionConfig
  ├─ setServiciosBase
  ├─ setSnapshots
  └─ etc
    │
    ▼
localStorage (persistencia)
    │
    ▼
UI Re-render
  ├─ AdminHeader actualizado
  ├─ Content actualizado
  ├─ DialogoGenerico muestra notificación
  └─ Estados (isSaving, etc) reseteados
```

---

## 🎨 Component Hierarchy

```
<AdminPage>
  ├─ <AdminHeader>
  │   ├─ [Save Button]
  │   ├─ [PDF Button]
  │   ├─ [New Quote Button]
  │   ├─ [Settings Button]
  │   └─ [Dropdown Menu]
  │
  ├─ <Navigation>
  │   └─ TAB buttons
  │
  ├─ <MainContent>
  │   ├─ <ServiciosBaseSection>
  │   │   └─ [Inputs + Buttons]
  │   ├─ <PaqueteSection>
  │   │   └─ [Selects + Info]
  │   ├─ <ServiciosOpcionalesSection>
  │   │   └─ [Checkboxes + Prices]
  │   ├─ <DescuentosSection>
  │   │   └─ [Sliders + Inputs]
  │   └─ <SnapshotsTableSection>
  │       └─ [Table + Actions]
  │
  └─ <DialogoGenerico>
      └─ [Dynamic Content]
```

---

## 📈 Escalabilidad

```
Current (Phase 10)
├─ 3 components
├─ 4 utils modules (95+ functions)
└─ 1 main page

Future (Phase 11+)
├─ +5 components
├─ +2 utils modules
├─ +3 pages
└─ +advanced features

Architecture supports:
✓ Modular growth
✓ Easy feature addition
✓ Parallel development
✓ Code reusability
✓ Testing at scale
```

---

## ✅ Validación Completa

```
Data Input
    │
    ▼
┌─────────────────────┐
│ Validators Module   │
├─────────────────────┤
│ ✓ Email valid?      │
│ ✓ Phone valid?      │
│ ✓ Dates correct?    │
│ ✓ Tab data valid?   │
│ ✓ Required fields?  │
└─────────────────────┘
    │ Valid?
    ├─ No  → Show Error Dialog
    └─ Yes → Continue to save
```

---

*Arquitectura Visual - Phases 8-10*
*Última actualización: Noviembre 2024*
*Versión: 1.0*
