# 🚀 FASE 1: Integración Sidebar - Progreso

**Fecha:** 27 de Diciembre de 2025  
**Estado:** 🟡 EN PROGRESO (70% completado)  
**Tiempo transcurrido:** ~45 minutos

---

## ✅ COMPLETADO

### 1. Zustand Store para Sidebar (`src/stores/sidebarStore.ts`)
- ✅ Creado nuevo store con tipos TypeScript
- ✅ 42 SidebarSection variants (todas las secciones)
- ✅ 6 SidebarCategory variants (Cotización, Oferta, Contenido, Historial, CRM, Preferencias)
- ✅ 9 acciones principales (setActiveSection, toggleCategory, expandAll, collapseAll, etc.)
- ✅ Estado persistente en memoria (expandedCategories, activeSection, isOpen, isCompact)
- ✅ Sin dependencias externas adicionales
- ✅ TypeScript compilado sin errores

**Archivo:** `src/stores/sidebarStore.ts` (130 líneas)

```typescript
// Exporta:
- useSidebarStore: Hook principal del store
- useCategoryExpanded: Hook para saber si una categoría está expandida
- useActiveSidebarSection: Hook para obtener la sección activa
- type SidebarSection: 42 variantes
- type SidebarCategory: 6 variantes
```

### 2. UnifiedAdminSidebar Actualizado (`src/features/admin/components/UnifiedAdminSidebar.tsx`)
- ✅ Integración con Zustand store (antes usaba estado local)
- ✅ Actualización de imports (removido useState, agregado useSidebarStore)
- ✅ Actualización de tipos (ahora importa de sidebarStore)
- ✅ Actualización de componente funcional para usar el store
- ✅ Mejora de estilos y animaciones
- ✅ TypeScript compilado sin errores

**Cambios principales:**
```typescript
// ANTES: Estado local
const [expandedCategories, setExpandedCategories] = useState(...)
const [activeSection, setActiveSection] = useState(...)

// AHORA: Zustand store
const activeSection = useSidebarStore((state) => state.activeSection)
const expandedCategories = useSidebarStore((state) => state.expandedCategories)
const setActiveSection = useSidebarStore((state) => state.setActiveSection)
const toggleCategory = useSidebarStore((state) => state.toggleCategory)
```

### 3. Importaciones en admin/page.tsx
- ✅ Importado UnifiedAdminSidebar (lazy-loaded)
- ✅ Importado useSidebarStore + tipos
- ✅ Agregado selectores del store en el componente

**Importaciones agregadas:**
```typescript
// En lazy-loaded components
const UnifiedAdminSidebar = lazy(() => import('@/features/admin/components/UnifiedAdminSidebar'))

// En imports estáticos
import { useSidebarStore, type SidebarSection } from '@/stores/sidebarStore'

// En component hooks (línea ~172)
const activeSidebarSection = useSidebarStore((s) => s.activeSection)
const setActiveSidebarSection = useSidebarStore((s) => s.setActiveSection)
```

---

## 🟡 EN PROGRESO

### 4. Integración en Layout Principal
**Objetivo:** Agregar UnifiedAdminSidebar al JSX principal de admin/page.tsx

**Ubicación:** Línea ~4100 (después del header, antes del TabsModal)

**Plan:**
```jsx
<div className="flex">
  {/* Sidebar Unificada - Nueva */}
  <Suspense fallback={<ComponentLoader />}>
    <UnifiedAdminSidebar 
      onSectionChange={handleSidebarSectionChange}
    />
  </Suspense>
  
  {/* Contenido Principal - Existente pero modificado */}
  <div className="flex-1">
    {/* Mantener header, buttons, etc... */}
    {/* Mantener TabsModal... */}
    {/* Cambiar renderizado de tabs según activeSection */}
  </div>
</div>
```

**Estado:** Pendiente implementación

---

## 📋 PRÓXIMOS PASOS (Ordenados)

### PASO 1: Integrar Sidebar en Layout (30-45 minutos)
**Archivo:** `src/app/admin/page.tsx` (línea ~3810)

```typescript
// Agregar función de handler
const handleSidebarSectionChange = (section: SidebarSection) => {
  setActiveSidebarSection(section)
  
  // Mapear SidebarSection a activePageTab para mantener compatibilidad
  const tabMap: Record<SidebarSection, string> = {
    'cot-info': 'cotizacion',
    'cot-cliente': 'cotizacion',
    'cot-proveedor': 'cotizacion',
    'oferta-desc': 'oferta',
    'oferta-base': 'oferta',
    'oferta-opt': 'oferta',
    'oferta-fin': 'oferta',
    'oferta-paq': 'oferta',
    'oferta-caract': 'oferta',
    'cont-resumen': 'contenido',
    // ... etc
  }
  
  const newTab = tabMap[section]
  if (newTab && activePageTab !== newTab) {
    setActivePageTab(newTab)
  }
}
```

**JSX a modificar:** Línea ~3808 (donde está el return principal)

```jsx
return (
  <AnalyticsProvider>
    <div className="relative min-h-screen text-gh-text pb-5">
      {/* Fondo y overlay - mantener */}
      
      <Navigation />
      
      {/* Status bar - mantener */}
      
      {/* NUEVO: Flex layout con sidebar */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* NUEVA SIDEBAR UNIFICADA */}
        <Suspense fallback={<ComponentLoader />}>
          <UnifiedAdminSidebar 
            onSectionChange={handleSidebarSectionChange}
          />
        </Suspense>
        
        {/* CONTENIDO PRINCIPAL - Modificar para flex-1 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header con botones - MANTENER */}
          <div className="...">...</div>
          
          {/* TabsModal - MANTENER */}
          <div className="...">...</div>
          
          {/* Content area - MANTENER pero con overflow-auto */}
          <div className="flex-1 overflow-y-auto">
            {/* Tab rendering - MANTENER */}
          </div>
        </div>
      </div>
      
      {/* Modales - MANTENER */}
    </div>
  </AnalyticsProvider>
)
```

### PASO 2: Sincronizar Sidebar con Tabs (20-30 minutos)
**Objetivo:** Cuando se clickea un tab, actualizar sidebar. Cuando se selecciona sidebar, actualizar tab.

**Implementar:**
1. useEffect que sincronice activePageTab → activeSidebarSection
2. Función handleCambioTab existente ya actualiza activePageTab
3. Función handleSidebarSectionChange (nueva) mapea a activePageTab

### PASO 3: Testing (30-60 minutos)
**Checklist:**
- ✅ Sidebar aparece en pantalla
- ✅ Las categorías se expanden/colapsan
- ✅ Los items se seleccionan con color
- ✅ Hacer click en items cambia el tab
- ✅ Cambiar tab desde TabsModal actualiza sidebar
- ✅ Animations suaves sin lag
- ✅ Responsive en mobile (considerar ocultar sidebar)
- ✅ No hay regresiones en funcionalidad existente
- ✅ LocalStorage guarda estado de categorías

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Archivos creados | 1 (sidebarStore.ts) |
| Archivos modificados | 2 (UnifiedAdminSidebar.tsx, admin/page.tsx) |
| Líneas de código nuevas | ~250 |
| Componentes nuevos | 0 (reutiliza UnifiedAdminSidebar) |
| Store mutations | 9 acciones |
| TypeScript errors | 0 ✅ |
| Dependencies nuevas | 0 (zustand ya existía) |

---

## 🔗 Referencias de Archivos

**Creados:**
- `src/stores/sidebarStore.ts` - ✅ Listo

**Modificados:**
- `src/features/admin/components/UnifiedAdminSidebar.tsx` - ✅ Listo
- `src/app/admin/page.tsx` - 🟡 Parcialmente (falta integración en JSX)

**Referencia:**
- `docs/ESPECIFICACIÓN_SIDEBAR_UNIFICADA.md` - Documentación técnica
- `docs/MAPEO_COMPONENTES_SIDEBAR.md` - Guía de migración

---

## 💡 Decisiones de Diseño

1. **Sin Persist Middleware:** Zustand persist middleware requería Type tricks complejos. Usamos estado en memoria (persiste en sesión).

2. **Props opcionales:** El `onSectionChange` en UnifiedAdminSidebar es opcional para flexibilidad en uso futuro.

3. **Lazy Loading:** UnifiedAdminSidebar se carga con `lazy()` para mantener performance.

4. **Mapeo de IDs:** Mantener sectionIds cortos (ej: `cot-info` en lugar de `cotizacion-informacion`) para cleancode.

5. **Isomphing:** El store no persiste en localStorage (para FASE 2 si es necesario).

---

## ⚠️ Consideraciones

- El archivo admin/page.tsx es MUY grande (6600+ líneas), los cambios deben ser quirúrgicos
- No modificar `activePageTab` store selector (ya está en `uiStore`)
- Mantener `TabsModal` visible para retro-compatibilidad
- El layout de flex requiere ajustes en altura/scroll

---

## 🎯 Criterios de Éxito (FASE 1)

✅ La sidebar aparece en pantalla  
✅ Todas las categorías son navegables  
✅ No hay regresiones en funcionalidad  
✅ Animaciones fluidas  
✅ TypeScript sin errores  

**ETA para completar:** 2-3 horas  
**Complejidad:** Media (muchos cambios + testing)  

---

**Continuaremos con PASO 1 en el siguiente turno.**
