# Sistema de Diseño - Panel Administrativo
## Documentación Visual y de Estilo

**Fecha de Documentación:** 19 de noviembre de 2025  
**Archivo Original:** `src/app/administrador/page.tsx`  
**Propósito:** Preservar el diseño visual actual antes de refactorizar a arquitectura modular

---

## 🎨 Paleta de Colores

### Colores Principales (Tailwind CSS)

#### Background Principal
```css
bg-gradient-to-br from-secondary via-secondary-light to-secondary-dark
```
- **Degradado:** De esquina superior izquierda a esquina inferior derecha
- **Colores:** secondary → secondary-light → secondary-dark
- **Clase:** `min-h-screen` para ocupar toda la pantalla

#### Overlays Decorativos (Efectos Radiales)
```css
/* Overlay superior derecho - Ámbar claro */
.overlay-radial-amber {
  position: absolute;
  top: -5rem;      /* -top-20 */
  right: -5rem;    /* -right-20 */
  width: 480px;    /* w-[480px] */
  height: 480px;   /* h-[480px] */
  border-radius: 9999px;  /* rounded-full */
  filter: blur(48px);     /* blur-3xl */
  opacity: 0.2;
  background: radial-gradient(closest-side, rgb(245 158 11 / 0.6), rgb(245 158 11 / 0));
}

/* Overlay inferior izquierdo - Ámbar oscuro */
.overlay-radial-amber-dark {
  position: absolute;
  bottom: -8rem;   /* -bottom-32 */
  left: -10rem;    /* -left-40 */
  width: 600px;    /* w-[600px] */
  height: 600px;   /* h-[600px] */
  border-radius: 9999px;
  filter: blur(48px);
  opacity: 0.15;
  background: radial-gradient(closest-side, rgb(217 119 6 / 0.5), rgb(217 119 6 / 0));
}
```
- **Contenedor:** `pointer-events-none absolute inset-0`
- **Propósito:** Crear profundidad y ambiente dorado corporativo

---

## 📐 Layout y Estructura

### Contenedor Principal
```css
max-w-7xl mx-auto py-20 px-4 pt-32
```
- **Ancho máximo:** 1280px (7xl)
- **Centrado horizontal:** `mx-auto`
- **Padding vertical:** 5rem arriba (pt-32 compensa navbar), 5rem abajo
- **Padding horizontal:** 1rem

### Animación de Entrada
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```
- **Fade in:** Opacidad 0 → 1
- **Slide up:** Desplazamiento vertical 20px → 0
- **Duración:** 600ms

---

## 🧭 Header Section

### Estructura
```css
flex flex-row justify-between items-center gap-4 mb-8
```

#### Título Principal
```css
text-5xl font-bold text-white mb-2
```
- **Tamaño:** 3rem (48px)
- **Peso:** Bold (700)
- **Color:** Blanco
- **Texto:** "Panel Administrativo"

#### Subtítulo
```css
text-xl text-neutral-200
```
- **Tamaño:** 1.25rem (20px)
- **Color:** neutral-200 (gris muy claro)
- **Texto:** "Gestiona la configuración de tu servicio y genera paquetes personalizados."

---

## 🎯 Botones de Acción (Header)

### Contenedor de Botones
```css
flex flex-wrap gap-3 items-center
```

### Botón "Descargar PDF"
```css
px-6 py-3 
bg-gradient-to-r from-primary to-primary-dark 
text-white 
rounded-lg 
hover:shadow-lg 
transition-all 
flex items-center gap-2 
font-semibold 
active:scale-95 
focus:outline-none 
focus-visible:ring-2 focus-visible:ring-accent 
focus-visible:ring-offset-2 focus-visible:ring-offset-secondary
```
- **Padding:** 1.5rem horizontal, 0.75rem vertical
- **Fondo:** Degradado rojo primary → primary-dark
- **Texto:** Blanco, semibold
- **Bordes:** Redondeados (8px)
- **Hover:** Sombra grande
- **Active:** Escala 95%
- **Animación Framer Motion:** `whileHover={{ scale: 1.05 }}` y `whileTap={{ scale: 0.95 }}`

### Botón "Guardar"
```css
px-6 py-3 
bg-gradient-to-r from-accent to-accent-dark 
text-white 
rounded-lg 
hover:shadow-lg 
transition-all 
flex items-center gap-2 
font-semibold 
active:scale-95 
focus:outline-none 
focus-visible:ring-2 focus-visible:ring-accent 
focus-visible:ring-offset-2 focus-visible:ring-offset-secondary
```
- **Fondo:** Degradado dorado accent → accent-dark
- **Resto:** Idéntico a botón PDF
- **Icono:** Emoji 💾

### Botón "Volver"
```css
px-6 py-3 
bg-white/30 
text-white 
rounded-lg 
hover:bg-white/40 
transition-all 
flex items-center gap-2 
font-semibold 
border border-white/50 
backdrop-blur 
focus:outline-none 
focus-visible:ring-2 focus-visible:ring-accent 
focus-visible:ring-offset-2 focus-visible:ring-offset-secondary
```
- **Fondo:** Blanco semi-transparente (30% opacidad)
- **Hover:** 40% opacidad
- **Borde:** Blanco semi-transparente (50%)
- **Efecto:** backdrop-blur (glassmorphism)
- **Icono:** `<FaArrowLeft />`

---

## 📊 Grid Layout Principal

### Estructura de 3 Columnas
```css
grid grid-cols-3 gap-6
```

#### Columna Izquierda (Contenido Principal)
```css
col-span-2 space-y-6
```
- **Ancho:** 2/3 del grid (66.66%)
- **Espaciado vertical:** 1.5rem entre secciones
- **Contenido:** 
  1. Servicios Base
  2. Paquete
  3. Gestión
  4. Servicios Opcionales
  5. Descuentos

#### Columna Derecha (Sidebar)
```css
col-span-1 space-y-6
```
- **Ancho:** 1/3 del grid (33.33%)
- **Espaciado vertical:** 1.5rem
- **Contenido:** 
  1. Snapshots de Paquetes (con filtros)

---

## 🎴 Componentes de Sección

### KPI Cards
- **Posición:** Antes del grid principal
- **Componente:** `<KPICards />`
- **Props:** `snapshots`, `cargandoSnapshots`

### CollapsibleSection (Wrapper Universal)
**Patrón de uso:**
```tsx
<CollapsibleSection
  id="unique-id"
  title="Título de Sección"
  icon="🏢"
  defaultOpen={true}
  validationBadge={<SectionBadge />}  // Opcional
>
  {/* Contenido */}
</CollapsibleSection>
```

**Características esperadas:**
- Acordeón expandible/colapsable
- Icono emoji identificativo
- Badge de validación opcional
- Estado abierto por defecto
- Animación de apertura/cierre

---

## 🎨 Sistema de Colores por Contexto

### Backgrounds de Secciones
- **Base esperada:** Semi-transparente con glassmorphism
- **Patrón típico:** `bg-white/5` o `bg-white/10`
- **Bordes:** `border border-white/10` o `border-2 border-accent/20`

### Gradientes Decorativos
```css
/* Ejemplo de tarjetas/filas */
bg-gradient-to-r from-accent/10 to-accent/5
bg-gradient-to-r from-primary/5 to-primary/10
```

### Estados Interactivos
```css
/* Hover */
hover:border-accent/40
hover:shadow-lg
hover:bg-white/10

/* Focus */
focus:border-accent
focus:outline-none
focus:ring-2 focus:ring-accent
```

---

## 📝 Tipografía

### Jerarquía de Títulos
```css
/* H1 - Título Principal */
text-5xl font-bold text-white

/* H2 - Título de Sección (dentro de CollapsibleSection) */
text-2xl font-bold text-secondary

/* H3 - Subtítulos */
text-xl font-bold text-white

/* Labels de Campos */
text-xs font-semibold text-black mb-1
block
```

### Textos de Contenido
```css
/* Descripción principal */
text-xl text-neutral-200

/* Textos secundarios */
text-sm text-neutral-400
text-sm text-neutral-500

/* Textos en tablas/listas */
text-secondary
font-semibold
```

---

## 🎭 Sistema de Iconos

### Emojis por Sección
- **🏢** Servicios Base
- **📦** Paquete
- **⚙️** Gestión
- **✨** Servicios Opcionales
- **🎁** Descuentos
- **📊** Snapshots

### React Icons
```javascript
import { FaDownload, FaArrowLeft } from 'react-icons/fa'
```

---

## 🔄 Animaciones Framer Motion

### Botones Interactivos
```javascript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### Entrada de Página
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

---

## 🎯 Focus y Accesibilidad

### Ring de Focus Visible
```css
focus:outline-none 
focus-visible:ring-2 
focus-visible:ring-accent 
focus-visible:ring-offset-2 
focus-visible:ring-offset-secondary
```
- **Color del ring:** accent (dorado)
- **Grosor:** 2px
- **Offset:** 2px
- **Color de offset:** secondary (fondo oscuro)

---

## 📦 Componentes Modulares Actuales

### Importaciones
```javascript
// Secciones
import ServiciosBaseSection from '@/features/admin/components/ServiciosBaseSection'
import PaqueteSection from '@/features/admin/components/PaqueteSection'
import GestionSection from '@/features/admin/components/GestionSection'
import ServiciosOpcionalesSection from '@/features/admin/components/ServiciosOpcionalesSection'
import DescuentosSection from '@/features/admin/components/DescuentosSection'
import SnapshotsTableSection from '@/features/admin/components/SnapshotsTableSection'

// UI Components
import KPICards from '@/features/admin/components/KPICards'
import SnapshotFilters from '@/features/admin/components/SnapshotFilters'
import SectionBadge from '@/features/admin/components/SectionBadge'
import CollapsibleSection from '@/features/admin/components/CollapsibleSection'
import SkeletonLoader from '@/features/admin/components/SkeletonLoader'
```

---

## 🎨 CSS Custom (admin-overlays.css)

**Ruta:** `src/styles/admin-overlays.css`

```css
/* Estilos para overlays radiales del panel administrativo */
.overlay-radial-amber {
  background: radial-gradient(closest-side, rgb(245 158 11 / 0.6), rgb(245 158 11 / 0));
}

.overlay-radial-amber-dark {
  background: radial-gradient(closest-side, rgb(217 119 6 / 0.5), rgb(217 119 6 / 0));
}
```

---

## 📱 Responsiveness

### Breakpoints Actuales
- **Header:** `flex-row` (sin breakpoint móvil visible en código actual)
- **Grid Principal:** `grid-cols-3` (fijo, sin responsive)
- **Botones:** `flex-wrap` para wrap en pantallas pequeñas

**⚠️ NOTA:** El diseño actual parece estar optimizado para desktop. No se observan breakpoints `md:` o `lg:` en el layout principal.

---

## 🔧 Variables de Tailwind Esperadas

```javascript
// tailwind.config.js (valores esperados)
{
  colors: {
    primary: '#DC2626',        // Rojo corporativo
    'primary-dark': '#991B1B', // Rojo oscuro
    'primary-light': '#EF4444',// Rojo claro
    
    accent: '#F59E0B',         // Dorado/Ámbar
    'accent-dark': '#D97706',  // Dorado oscuro
    
    secondary: '#1F2937',      // Gris oscuro (fondo)
    'secondary-light': '#374151',
    'secondary-dark': '#111827',
    
    neutral: {
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
    }
  }
}
```

---

## 📋 Checklist de Implementación

Al restaurar este diseño, asegurar:

- ✅ Fondo degradado oscuro (secondary variants)
- ✅ 2 overlays radiales dorados (superior derecho + inferior izquierdo)
- ✅ Header con 3 botones animados (PDF, Guardar, Volver)
- ✅ Grid 3 columnas (2:1 ratio)
- ✅ KPI Cards antes del grid
- ✅ 5 secciones en columna izquierda (todas con CollapsibleSection)
- ✅ 1 sección en columna derecha (Snapshots con filtros)
- ✅ Animaciones Framer Motion en entrada y botones
- ✅ Rings de focus visibles en accent
- ✅ Tipografía blanca para títulos, neutral para textos secundarios
- ✅ Importar archivo CSS custom para overlays

---

## 🎯 Filosofía de Diseño

### Principios Visuales
1. **Profundidad:** Overlays radiales + glassmorphism
2. **Jerarquía:** Colores y tamaños de fuente consistentes
3. **Feedback:** Animaciones en hover/tap/focus
4. **Claridad:** Iconos emoji + labels descriptivos
5. **Consistencia:** Patrones repetibles (CollapsibleSection)

### Paleta Emocional
- **Rojo (primary):** Acción, urgencia, CTAs principales
- **Dorado (accent):** Premium, valor, acciones secundarias
- **Oscuro (secondary):** Profesionalismo, elegancia
- **Blanco/Neutral:** Claridad, legibilidad

---

## 📖 Referencias Cruzadas

- **Backup Original:** `src/app/administrador/page.tsx.backup.20251118_215014`
- **CSS Custom:** `src/styles/admin-overlays.css`
- **Componentes:** `src/features/admin/components/`

---

**Documentado por:** Sistema AI  
**Próximos pasos:** Usar este documento como referencia al implementar cambios arquitectónicos manteniendo la identidad visual.
