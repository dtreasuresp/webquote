import { create } from 'zustand'

/**
 * Tipos para la Sidebar Unificada
 */
export type SidebarCategory = 'cotizacion' | 'oferta' | 'contenido' | 'historial' | 'crm' | 'preferencias'

export type SidebarSection = 
  // Cotización
  | 'cot-info'
  | 'cot-cliente'
  | 'cot-proveedor'
  // Oferta
  | 'oferta-desc'
  | 'oferta-base'
  | 'oferta-opt'
  | 'oferta-fin'
  | 'oferta-paq'
  | 'oferta-caract'
  // Contenido
  | 'cont-resumen'
  | 'cont-analisis'
  | 'cont-fortale'
  | 'cont-compar'
  | 'cont-crono'
  | 'cont-cuotas'
  | 'cont-paq'
  | 'cont-notas'
  | 'cont-concl'
  | 'cont-faq'
  | 'cont-garant'
  | 'cont-contact'
  | 'cont-terminos'
  // Historial
  | 'hist-versiones'
  // CRM
  | 'crm-clientes'
  | 'crm-contactos'
  | 'crm-productos'
  | 'crm-oportunidades'
  | 'crm-interacciones'
  | 'crm-historial'
  | 'crm-pricing'
  | 'crm-suscripciones'
  | 'crm-compliance'
  | 'crm-reglas'
  | 'crm-plantillas'
  // Preferencias
  | 'pref-config'
  | 'pref-sync'
  | 'pref-usuarios'
  | 'pref-org'
  | 'pref-roles'
  | 'pref-permisos'
  | 'pref-matriz'
  | 'pref-permuser'
  | 'pref-logs'
  | 'pref-backups'
  | 'pref-reportes'

interface SidebarState {
  // Estado de la sidebar
  activeSection: SidebarSection
  expandedCategories: Set<SidebarCategory>
  isOpen: boolean
  isCompact: boolean
  
  // Acciones
  setActiveSection: (section: SidebarSection) => void
  toggleCategory: (category: SidebarCategory) => void
  expandCategory: (category: SidebarCategory) => void
  collapseCategory: (category: SidebarCategory) => void
  expandAll: () => void
  collapseAll: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCompact: () => void
  
  // Reset
  reset: () => void
}

// Estado inicial
const INITIAL_EXPANDED_CATEGORIES: SidebarCategory[] = ['cotizacion', 'preferencias']
const INITIAL_ACTIVE_SECTION: SidebarSection = 'cot-info'

/**
 * Store de Zustand para la Sidebar Unificada
 * Persiste el estado en localStorage bajo la clave 'sidebar-store'
 */
export const useSidebarStore = create<SidebarState>((set) => ({
  // Estado inicial
  activeSection: INITIAL_ACTIVE_SECTION,
  expandedCategories: new Set(INITIAL_EXPANDED_CATEGORIES),
  isOpen: true,
  isCompact: false,
  
  // Cambiar sección activa
  setActiveSection: (section: SidebarSection) => {
    set({ activeSection: section })
  },
  
  // Toggle de categoría (expandir/colapsar)
  toggleCategory: (category: SidebarCategory) => {
    set((state) => {
      const newExpanded = new Set(state.expandedCategories)
      if (newExpanded.has(category)) {
        newExpanded.delete(category)
      } else {
        newExpanded.add(category)
      }
      return { expandedCategories: newExpanded }
    })
  },
  
  // Expandir categoría específica
  expandCategory: (category: SidebarCategory) => {
    set((state) => {
      const newExpanded = new Set(state.expandedCategories)
      newExpanded.add(category)
      return { expandedCategories: newExpanded }
    })
  },
  
  // Colapsar categoría específica
  collapseCategory: (category: SidebarCategory) => {
    set((state) => {
      const newExpanded = new Set(state.expandedCategories)
      newExpanded.delete(category)
      return { expandedCategories: newExpanded }
    })
  },
  
  // Expandir todas las categorías
  expandAll: () => {
    const allCategories: SidebarCategory[] = ['cotizacion', 'oferta', 'contenido', 'historial', 'crm', 'preferencias']
    set({ expandedCategories: new Set(allCategories) })
  },
  
  // Colapsar todas las categorías
  collapseAll: () => {
    set({ expandedCategories: new Set() })
  },
  
  // Abrir/cerrar sidebar
  setSidebarOpen: (open: boolean) => {
    set({ isOpen: open })
  },
  
  // Toggle de modo compacto
  toggleSidebarCompact: () => {
    set((state) => ({ isCompact: !state.isCompact }))
  },
  
  // Reset a estado inicial
  reset: () => {
    set({
      activeSection: INITIAL_ACTIVE_SECTION,
      expandedCategories: new Set(INITIAL_EXPANDED_CATEGORIES),
      isOpen: true,
      isCompact: false,
    })
  },
}))

// Hook para obtener si una categoría está expandida
export const useCategoryExpanded = (category: SidebarCategory) => {
  return useSidebarStore((state) => state.expandedCategories.has(category))
}

// Hook para obtener la sección activa
export const useActiveSidebarSection = () => {
  return useSidebarStore((state) => state.activeSection)
}
