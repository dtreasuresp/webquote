import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Tipos para la Sidebar Unificada
 */
/* ... existing types ... */
export type SidebarCategory = 
  | 'analytics'
  | 'crm' 
  | 'sales' 
  | 'inventory' 
  | 'finance' 
  | 'people' 
  | 'projects' 
  | 'pos' 
  | 'settings' 
  | 'ecommerce' 
  | 'licensing'
  | 'cotizacion' 
  | 'oferta' 
  | 'contenido' 
  | 'historial'
  | 'preferencias'

export type SidebarSection = 
  // Analytics
  | 'analytics-dashboard'
  | 'analytics-ventas'
  | 'analytics-clientes'
  // Sales
  | 'sales-cotizaciones'
  | 'sales-pedidos'
  | 'sales-facturas'
  | 'sales-descuentos'
  | 'sales-reportes'
  // Inventory
  | 'inv-productos'
  | 'inv-stock'
  | 'inv-categorias'
  | 'inv-movimientos'
  // Finance
  | 'fin-cobros'
  | 'fin-pagos'
  | 'fin-impuestos'
  | 'fin-contabilidad'
  // People
  | 'ppl-empleados'
  | 'ppl-nomina'
  | 'ppl-asistencia'
  // Projects
  | 'prj-proyectos'
  | 'prj-tareas'
  | 'prj-recursos'
  // POS
  | 'pos-venta'
  | 'pos-caja'
  | 'pos-tickets'
  // eCommerce
  | 'eco-tiendas'
  | 'eco-pedidos'
  | 'eco-clientes'
  // Licensing
  | 'lic-suscripciones'
  | 'lic-planes'
  | 'lic-modulos'
  // Settings (Nuevos)
  | 'set-general'
  | 'set-personalizacion'
  | 'set-integraciones'
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
  | 'crm-dashboard'
  | 'crm-clientes'
  | 'crm-contactos'
  | 'crm-productos'
  | 'crm-oportunidades'
  | 'crm-interacciones'
  | 'crm-historial'
  | 'crm-pricing'
  | 'crm-suscripciones'
  | 'crm-facturas'
  | 'crm-cotizaciones'
  | 'crm-reportes'
  | 'crm-compliance'
  | 'crm-reglas'
  | 'crm-plantillas'
  | 'crm-configuracion'
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
  isInternalSidebarCollapsed: boolean
  showLabels: boolean
  
  // Acciones
  setActiveSection: (section: SidebarSection) => void
  toggleCategory: (category: SidebarCategory) => void
  expandCategory: (category: SidebarCategory) => void
  collapseCategory: (category: SidebarCategory) => void
  expandAll: () => void
  collapseAll: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCompact: () => void
  toggleInternalSidebar: () => void
  toggleShowLabels: () => void
  setShowLabels: (show: boolean) => void
  
  // Reset
  reset: () => void
}

// Estado inicial
const INITIAL_EXPANDED_CATEGORIES: SidebarCategory[] = ['analytics']
const INITIAL_ACTIVE_SECTION: SidebarSection = 'analytics-dashboard'

/**
 * Store de Zustand para la Sidebar Unificada
 * Persiste el estado en localStorage bajo la clave 'sidebar-store'
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      // Estado inicial
      activeSection: INITIAL_ACTIVE_SECTION,
      expandedCategories: new Set(INITIAL_EXPANDED_CATEGORIES),
      isOpen: true,
      isCompact: false,
      isInternalSidebarCollapsed: false,
      showLabels: true,
      
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

      // Toggle de sidebar interna (CRM, Cotización, etc)
      toggleInternalSidebar: () => {
        set((state) => ({ isInternalSidebarCollapsed: !state.isInternalSidebarCollapsed }))
      },
      
      // Toggle de visibilidad de etiquetas
      toggleShowLabels: () => {
        set((state) => ({ showLabels: !state.showLabels }))
      },
      
      // Establecer visibilidad de etiquetas
      setShowLabels: (show: boolean) => {
        set({ showLabels: show })
      },
      
      // Reset a estado inicial
      reset: () => {
        set({
          activeSection: INITIAL_ACTIVE_SECTION,
          expandedCategories: new Set(INITIAL_EXPANDED_CATEGORIES),
          isOpen: true,
          isCompact: false,
          isInternalSidebarCollapsed: false,
          showLabels: true,
        })
      },
    }),
    {
      name: 'sidebar-store',
      storage: createJSONStorage(() => localStorage),
      // Manejar la serialización de Set
      partialize: (state) => ({
        ...state,
        expandedCategories: Array.from(state.expandedCategories),
      }) as any,
      // Manejar la deserialización de Set
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.expandedCategories)) {
          state.expandedCategories = new Set(state.expandedCategories)
        }
      },
    }
  )
)

// Hook para obtener si una categoría está expandida
export const useCategoryExpanded = (category: SidebarCategory) => {
  return useSidebarStore((state) => state.expandedCategories.has(category))
}

// Hook para obtener la sección activa
export const useActiveSidebarSection = () => {
  return useSidebarStore((state) => state.activeSection)
}
