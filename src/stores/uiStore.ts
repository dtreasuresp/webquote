/**
 * UI Store
 * Global UI state management
 * Handles tabs, modals, and UI-level flags
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIState {
  // Tabs and Navigation
  activePageTab: string
  activeTabFila1: string
  activeTabFila2: string
  activeTabFila3: string
  
  // Modals
  showModalEditar: boolean
  quotationIdPendienteEliminar: string | null
  
  // Package History & Comparison
  showPackageHistoryModal: boolean
  packageHistorySnapshot: any | null
  
  showPackageCompareModal: boolean
  paqueteParaComparar: any | null
  paquetesAComparar: { paquete1: any; paquete2: any } | null
  
  // Validation state
  estadoValidacionTabs: {
    cotizacion?: string
    oferta?: string
    paquetes?: string
  }
  
  // Package editing
  modoEdicionPaquete: boolean
}

export interface UIStore extends UIState {
  // Tab navigation
  setActivePageTab: (tab: string) => void
  setActiveTabFila1: (tab: string) => void
  setActiveTabFila2: (tab: string) => void
  setActiveTabFila3: (tab: string) => void
  
  // Modals
  setShowModalEditar: (show: boolean) => void
  setQuotationIdPendienteEliminar: (id: string | null) => void
  
  // Package history
  openPackageHistoryModal: (snapshot: any) => void
  closePackageHistoryModal: () => void
  setPackageHistorySnapshot: (snapshot: any) => void
  setShowPackageHistoryModal: (show: boolean) => void
  
  // Package comparison
  openPackageCompareModal: (paquete1: any, paquete2?: any) => void
  closePackageCompareModal: () => void
  setPaqueteParaComparar: (snapshot: any | null) => void
  setPaquetesAComparar: (paquetes: { paquete1: any; paquete2: any } | null) => void
  setShowPackageCompareModal: (show: boolean) => void
  
  // Validation
  setEstadoValidacionTabs: (estado: any) => void
  updateValidacionTab: (tabName: string, estado: string) => void
  
  // Package editing
  setModoEdicionPaquete: (modo: boolean) => void
}

const DEFAULT_UI_STATE: UIState = {
  activePageTab: 'analytics',
  activeTabFila1: '0',
  activeTabFila2: '0',
  activeTabFila3: '0',
  showModalEditar: false,
  quotationIdPendienteEliminar: null,
  showPackageHistoryModal: false,
  packageHistorySnapshot: null,
  showPackageCompareModal: false,
  paqueteParaComparar: null,
  paquetesAComparar: null,
  estadoValidacionTabs: {
    cotizacion: 'pendiente',
    oferta: 'pendiente',
    paquetes: 'pendiente',
  },
  modoEdicionPaquete: false,
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_UI_STATE,

      setActivePageTab: (tab: string) => {
        set({ activePageTab: tab })
      },

      setActiveTabFila1: (tab: string) => {
        set({ activeTabFila1: tab })
      },

      setActiveTabFila2: (tab: string) => {
        set({ activeTabFila2: tab })
      },

      setActiveTabFila3: (tab: string) => {
        set({ activeTabFila3: tab })
      },

      setShowModalEditar: (show: boolean) => {
        set({ showModalEditar: show })
      },

      setQuotationIdPendienteEliminar: (id: string | null) => {
        set({ quotationIdPendienteEliminar: id })
      },

      openPackageHistoryModal: (snapshot: any) => {
        set({
          showPackageHistoryModal: true,
          packageHistorySnapshot: snapshot,
        })
      },

      closePackageHistoryModal: () => {
        set({
          showPackageHistoryModal: false,
          packageHistorySnapshot: null,
        })
      },

      setPackageHistorySnapshot: (snapshot: any) => {
        set({ packageHistorySnapshot: snapshot })
      },

      setShowPackageHistoryModal: (show: boolean) => {
        set({ showPackageHistoryModal: show })
      },

      openPackageCompareModal: (paquete1: any, paquete2?: any) => {
        set({
          showPackageCompareModal: true,
          paqueteParaComparar: paquete1,
          paquetesAComparar: paquete2 ? { paquete1, paquete2 } : null,
        })
      },

      closePackageCompareModal: () => {
        set({
          showPackageCompareModal: false,
          paqueteParaComparar: null,
          paquetesAComparar: null,
        })
      },

      setPaqueteParaComparar: (snapshot: any | null) => {
        set({ paqueteParaComparar: snapshot })
      },

      setPaquetesAComparar: (paquetes: { paquete1: any; paquete2: any } | null) => {
        set({ paquetesAComparar: paquetes })
      },

      setShowPackageCompareModal: (show: boolean) => {
        set({ showPackageCompareModal: show })
      },

      setEstadoValidacionTabs: (estado: any) => {
        set({ estadoValidacionTabs: estado })
      },

      updateValidacionTab: (tabName: string, estado: string) => {
        const current = get().estadoValidacionTabs
        set({
          estadoValidacionTabs: {
            ...current,
            [tabName]: estado,
          },
        })
      },

      setModoEdicionPaquete: (modo: boolean) => {
        set({ modoEdicionPaquete: modo })
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        activePageTab: state.activePageTab,
      }),
    }
  )
)
