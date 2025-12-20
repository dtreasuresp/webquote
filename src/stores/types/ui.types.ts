/**
 * UI Store Types
 * Type definitions for global UI state management
 */

export interface UIState {
  // Tabs and Navigation
  activePageTab: string
  
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
  setEstadoValidacionTabs: (estado: UIState['estadoValidacionTabs']) => void
  updateEstadoValidacionTab: (tab: string, estado: string) => void
  clearEstadoValidacionTabs: () => void
  
  // Package editing
  setModoEdicionPaquete: (modo: boolean) => void
}
