# Phase 8 - Layout Components

Componentes de interfaz principales para la administración de cotizaciones.

## Componentes Creados

### 1. **AdminHeader.tsx** (180+ líneas)

Encabezado sticky con controles principales de la aplicación.

**Props:**
```typescript
interface AdminHeaderProps {
  onSave?: () => Promise<void>
  onPdfExport?: () => Promise<void>
  onNewQuote?: () => void
  onSettings?: () => void
  isSaving?: boolean
  isPdfGenerating?: boolean
  hasChanges?: boolean
  quoteName?: string
}
```

**Características:**
- ✅ Header sticky con z-40
- ✅ Gradiente de fondo (from-gh-bg-overlay to-gh-bg-secondary)
- ✅ Botón Guardar (azul, condicionado a cambios)
- ✅ Botón PDF (verde)
- ✅ Botón Nueva Cotización (cyan)
- ✅ Botón Configuración (gris)
- ✅ Menú desplegable con 4 opciones
- ✅ Indicador de cambios sin guardar
- ✅ Estados de carga con iconos animados
- ✅ Progreso animado cuando hay cambios
- ✅ Notificaciones con toast
- ✅ Responsive (texto oculto en mobile)

**Ejemplo de uso:**
```tsx
<AdminHeader
  onSave={handleSave}
  onPdfExport={handlePdfExport}
  onNewQuote={handleNewQuote}
  onSettings={handleSettings}
  isSaving={isSaving}
  isPdfGenerating={isPdfGenerating}
  hasChanges={hasChanges}
  quoteName="Mi Cotización"
/>
```

---

### 2. **DialogoGenerico.tsx** (180+ líneas)

Modal reutilizable para mostrar diálogos, alertas y confirmaciones.

**Props:**
```typescript
interface DialogoGenericoProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'info' | 'warning' | 'error' | 'success'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  maxHeight?: string
}
```

**Características:**
- ✅ Animaciones con Framer Motion (entrada/salida suave)
- ✅ Backdrop oscuro clickeable
- ✅ Cierre con tecla Escape
- ✅ 4 tamaños (sm, md, lg, xl)
- ✅ 4 tipos (info, warning, error, success)
- ✅ Border izquierdo coloreado según tipo
- ✅ Header con título y descripción
- ✅ Botón cerrar personalizable
- ✅ Content scrollable
- ✅ Footer para botones de acción
- ✅ Bloqueo de scroll del body cuando abierto
- ✅ Colores de título según tipo

**Ejemplo de uso:**
```tsx
<DialogoGenerico
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirmación"
  description="¿Estás seguro?"
  type="warning"
  size="md"
  footer={
    <>
      <button onClick={handleClose}>Cancelar</button>
      <button onClick={handleConfirm}>Confirmar</button>
    </>
  }
>
  <p>Este cambio no se puede deshacer.</p>
</DialogoGenerico>
```

---

### 3. **SharedComponents.tsx** (250+ líneas)

Componentes compartidos reutilizables: Button, Badge, IconButton.

#### **Button Component**

```typescript
interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: IconType
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}
```

**Variantes:**
- `primary`: Azul, sombra
- `secondary`: Verde, sombra
- `tertiary`: Fondo terciario, borde
- `ghost`: Transparente, borde suave
- `danger`: Rojo, sombra

**Tamaños:**
- `sm`: px-3 py-1.5 text-sm
- `md`: px-4 py-2 text-base
- `lg`: px-6 py-3 text-lg

**Características:**
- ✅ Estados de carga con spinner
- ✅ Icono izquierdo o derecho
- ✅ Ancho completo (fullWidth)
- ✅ Escalado en click (active:scale-95)
- ✅ Deshabilitado con opacidad

**Ejemplo:**
```tsx
<Button
  variant="primary"
  size="md"
  isLoading={isLoading}
  icon={FaSave}
  onClick={handleSave}
>
  Guardar
</Button>
```

#### **Badge Component**

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}
```

**Variantes:**
- `primary`: Azul (gh-accent-blue)
- `secondary`: Verde (gh-accent-green)
- `success`: Verde (gh-accent-green)
- `warning`: Naranja (gh-accent-orange)
- `error`: Rojo (gh-accent-red)
- `info`: Cyan (gh-accent-cyan)

**Tamaños:**
- `sm`: px-2 py-0.5 text-xs
- `md`: px-3 py-1 text-sm
- `lg`: px-4 py-1.5 text-base

**Ejemplo:**
```tsx
<Badge variant="success" size="md">
  Activo
</Badge>
```

#### **IconButton Component**

```typescript
interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconType
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
}
```

**Características:**
- ✅ Icono centrado y escalado
- ✅ Tooltip personalizado
- ✅ 4 variantes de color
- ✅ 3 tamaños
- ✅ Estados hover y activo

**Ejemplo:**
```tsx
<IconButton
  icon={FaSettings}
  variant="tertiary"
  size="md"
  tooltip="Configuración"
  onClick={handleSettings}
/>
```

---

## Archivos

```
src/features/admin/components/
├── AdminHeader.tsx          (180+ líneas)
├── DialogoGenerico.tsx      (180+ líneas)
├── SharedComponents.tsx     (250+ líneas)
├── index.ts                 (barrel export)
└── tabs/
    ├── index.ts
    └── [7 TAB components]
```

## Sistema de Colores Utilizado

```
Primary (Azul):     gh-accent-blue
Secondary (Verde):  gh-accent-green
Tertiary (Gris):    gh-bg-tertiary
Warning (Naranja):  gh-accent-orange
Error (Rojo):       gh-accent-red
Info (Cyan):        gh-accent-cyan

Backgrounds:
- Overlay:          gh-bg-overlay
- Secondary:        gh-bg-secondary
- Tertiary:         gh-bg-tertiary

Text:
- Primary:          gh-text-primary
- Secondary:        gh-text-secondary

Borders:            gh-border-color
```

## Imports Recomendados

```tsx
// Componentes de layout
import { AdminHeader, DialogoGenerico } from '@/features/admin/components'

// Componentes compartidos
import { Button, Badge, IconButton } from '@/features/admin/components'

// O más específico
import AdminHeader from '@/features/admin/components/AdminHeader'
import DialogoGenerico from '@/features/admin/components/DialogoGenerico'
```

## Status

✅ **PHASE 8 - 50% COMPLETO**
- ✅ AdminHeader.tsx creado
- ✅ DialogoGenerico.tsx creado
- ✅ SharedComponents.tsx creado
- ✅ Index.ts con exports

**Pendiente:**
- ⏳ Integración con AdminPage
- ⏳ Testing de componentes
- ⏳ Documentación de integración

## Próximos Pasos

1. **Phase 9**: Extracción de utilities a `src/features/admin/utils/`
2. **Phase 10**: Integración completa en AdminPage.tsx
3. **Phase 11**: Testing y validación

## Notas Técnicas

- Todos los componentes usan TypeScript strict mode
- Soportan `use client` directive para Next.js
- Animaciones con Framer Motion para DialogoGenerico
- Diseño responsive con Tailwind CSS
- Props interfaces exportadas para mejor DX
