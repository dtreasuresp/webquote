# 📋 TEMPLATE DE ESTILOS - Admin Panel GitHub Dark

> Basado en `PreferenciasTab` como componente de referencia
> Fecha de creación: Diciembre 2024

---

## 1. IMPORTS REQUERIDOS

```tsx
// Iconos: SIEMPRE lucide-react, NUNCA react-icons
import { IconName } from 'lucide-react'

// Animaciones: framer-motion para transiciones
import { motion } from 'framer-motion'
```

**Mapeo de iconos react-icons → lucide-react:**
| react-icons | lucide-react |
|-------------|--------------|
| FaCheck | Check |
| FaTimes | X |
| FaPlus | Plus |
| FaEdit | Edit |
| FaTrash | Trash2 |
| FaSave | Save |
| FaBox | Package |
| FaCubes | Boxes |
| FaDollarSign | DollarSign |
| FaCreditCard | CreditCard |
| FaPercent | Percent |
| FaGift | Gift |
| FaInfoCircle | Info |
| FaExclamationTriangle | AlertTriangle |
| FaCheckCircle | CheckCircle |
| FaBookmark | Bookmark |
| FaPuzzlePiece | Puzzle |
| FaCog | Settings |
| FaUser | User |
| FaBuilding | Building |
| FaPhone | Phone |
| FaEnvelope | Mail |

---

## 2. HEADER DEL CONTENIDO

```tsx
<div className="flex items-center justify-between">
  <div>
    <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
      <IconName className="w-4 h-4 text-gh-accent" />
      Título de la Sección
    </h3>
    <p className="text-xs text-gh-text-muted mt-0.5">
      Descripción breve de la sección
    </p>
  </div>
  {/* Badge de estado (opcional) */}
  <span className="text-xs text-gh-text-muted bg-gh-bg-secondary px-2.5 py-1 rounded-md border border-gh-border/30">
    Estado o conteo
  </span>
</div>
```

---

## 3. CONTENEDOR PRINCIPAL (CARD)

```tsx
<div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
  {/* Sub-header */}
  <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
    <h5 className="text-xs font-medium text-gh-text">
      Título del grupo
    </h5>
    <p className="text-[11px] text-gh-text-muted mt-0.5">
      Descripción opcional
    </p>
  </div>
  
  {/* Contenido */}
  <div className="p-4">
    ...
  </div>
</div>
```

---

## 4. INPUTS Y LABELS

```tsx
<label className="block text-xs font-medium text-gh-text mb-1.5">
  Label del campo
</label>
<input
  className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md 
             text-sm text-gh-text placeholder-gh-text-muted
             focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none
             transition-colors"
/>
<p className="text-[11px] text-gh-text-muted mt-1">
  Texto de ayuda
</p>
```

---

## 5. BOTONES SELECCIONABLES (RADIO VISUAL)

```tsx
<button className={`p-3 rounded-md border text-xs font-medium transition-all flex flex-col items-center gap-2 ${
  isActive
    ? 'border-gh-accent bg-gh-accent/10 text-gh-accent'
    : 'border-gh-border/30 text-gh-text-muted hover:border-gh-accent/50 hover:bg-gh-bg-tertiary/30'
}`}>
  <Icon className="w-4 h-4" />
  <span>Label</span>
</button>
```

---

## 6. TOGGLE ITEMS (Lista con switches)

```tsx
<label className="flex items-center gap-4 cursor-pointer px-4 py-3 hover:bg-gh-bg-tertiary/20 transition-colors">
  <div className="flex-shrink-0">
    {value ? (
      <ToggleRight className="w-6 h-6 text-gh-success" />
    ) : (
      <ToggleLeft className="w-6 h-6 text-gh-text-muted" />
    )}
  </div>
  <div className="flex-1 min-w-0">
    <input type="checkbox" className="sr-only" />
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gh-text">Label</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
        value ? 'bg-gh-success/10 text-gh-success' : 'bg-gh-border/20 text-gh-text-muted'
      }`}>
        {value ? '✓ Activo' : 'Inactivo'}
      </span>
    </div>
    <p className="text-[11px] text-gh-text-muted mt-0.5">
      Descripción
    </p>
  </div>
</label>
```

---

## 7. ALERTAS/AVISOS

```tsx
{/* Warning */}
<div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-start gap-2">
  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
  <span className="text-[11px] text-amber-600">Mensaje de advertencia</span>
</div>

{/* Info */}
<div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-start gap-2">
  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
  <span className="text-[11px] text-blue-500">Mensaje informativo</span>
</div>

{/* Success */}
<div className="p-2.5 bg-gh-success/10 border border-gh-success/20 rounded-md flex items-start gap-2">
  <CheckCircle className="w-3.5 h-3.5 text-gh-success flex-shrink-0 mt-0.5" />
  <span className="text-[11px] text-gh-success">Mensaje de éxito</span>
</div>
```

---

## 8. BADGES DE ESTADO

```tsx
{/* Éxito */}
<span className="text-xs px-2 py-1 rounded bg-gh-success/10 text-gh-success flex items-center gap-1.5">
  <Check className="w-3 h-3" /> Configurado
</span>

{/* Advertencia */}
<span className="text-xs px-2 py-1 rounded bg-gh-warning/10 text-gh-warning flex items-center gap-1.5">
  <AlertTriangle className="w-3 h-3" /> Incompleto
</span>

{/* Info */}
<span className="text-xs px-2 py-1 rounded bg-gh-accent/10 text-gh-accent flex items-center gap-1.5">
  <Info className="w-3 h-3" /> Pendiente
</span>
```

---

## 9. BOTONES DE ACCIÓN

```tsx
{/* Primario (Success) */}
<button className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success 
                   border border-gh-success/30 rounded-md hover:bg-gh-success/20 
                   transition-colors text-xs font-medium">
  <Plus className="w-3 h-3" /> Nueva
</button>

{/* Secundario (Accent) */}
<button className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-accent/10 text-gh-accent 
                   border border-gh-accent/30 rounded-md hover:bg-gh-accent/20 
                   transition-colors text-xs font-medium">
  <Edit className="w-3 h-3" /> Editar
</button>

{/* Peligro */}
<button className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-danger/10 text-gh-danger 
                   border border-gh-danger/30 rounded-md hover:bg-gh-danger/20 
                   transition-colors text-xs font-medium">
  <Trash2 className="w-3 h-3" /> Eliminar
</button>

{/* Deshabilitado */}
<button className="bg-gh-bg-secondary text-gh-text-muted border border-gh-border 
                   cursor-not-allowed" disabled>
  <Check className="w-3 h-3" /> Guardar
</button>
```

---

## 10. GRIDS RESPONSIVOS

```tsx
<div className="grid md:grid-cols-2 gap-4">
<div className="grid md:grid-cols-3 gap-3">
```

---

## 11. ESPACIADO GENERAL

| Elemento | Clase |
|----------|-------|
| Contenedor principal | `space-y-4` |
| Padding cards | `p-4` |
| Padding headers | `px-4 py-2.5` |
| Gap entre items | `gap-3` o `gap-4` |
| Margin label-input | `mb-1.5` |
| Margin helper text | `mt-1` |

---

## 12. TAMAÑOS DE ICONOS

| Contexto | Clase |
|----------|-------|
| Header principal | `w-4 h-4` |
| En botones | `w-3 h-3` |
| En badges | `w-3 h-3` |
| En alertas | `w-3.5 h-3.5` |
| Toggle grande | `w-6 h-6` |

---

## 13. COLORES DEL SISTEMA

| Variable | Uso |
|----------|-----|
| `gh-text` | Texto principal |
| `gh-text-muted` | Texto secundario |
| `gh-bg` | Fondo base |
| `gh-bg-secondary` | Cards y contenedores |
| `gh-bg-tertiary` | Inputs y elementos anidados |
| `gh-border` | Bordes normales |
| `gh-accent` | Color de énfasis (azul) |
| `gh-success` | Éxito (verde) |
| `gh-warning` | Advertencia (amarillo) |
| `gh-danger` | Error/Peligro (rojo) |

---

## 14. EJEMPLO COMPLETO

```tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Check, AlertTriangle } from 'lucide-react'

export default function ExampleContent() {
  const isConfigured = true

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <Settings className="w-4 h-4 text-gh-accent" />
            Configuración
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Ajustes generales del sistema
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
          isConfigured 
            ? 'bg-gh-success/10 text-gh-success' 
            : 'bg-gh-warning/10 text-gh-warning'
        }`}>
          {isConfigured ? (
            <><Check className="w-3 h-3" /> Configurado</>
          ) : (
            <><AlertTriangle className="w-3 h-3" /> Incompleto</>
          )}
        </span>
      </div>

      {/* Card principal */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text">Opciones</h5>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gh-text mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 
                         rounded-md text-sm text-gh-text 
                         focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 
                         focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
```

---

## 15. ARCHIVOS ACTUALIZADOS

Los siguientes componentes han sido refactorizados siguiendo este template:

### CotizacionTab
- ✅ `CotizacionInfoContent.tsx`
- ✅ `ClienteContent.tsx`
- ✅ `ProveedorContent.tsx`

### OfertaTab
- ✅ `PaqueteContent.tsx`
- ✅ `ServiciosBaseContent.tsx`
- ✅ `ServiciosOpcionalesContent.tsx`
- ✅ `FinancieroContent.tsx`
- ✅ `PaquetesContent.tsx`
- ✅ `PaquetesCaracteristicasContent.tsx`
- ✅ `MetodosPagoContent.tsx`
- ✅ `PagoContent.tsx`

### PreferenciasTab (Referencia)
- ✅ Ya implementado correctamente
