/**
 * Modal Data Store Types
 * Type definitions for modal-specific data management
 */

export interface ModalDataState {
  quotationEnModal: any | null
  snapshotsModalActual: any[]
}

export interface ModalDataStore extends ModalDataState {
  setQuotationEnModal: (quotation: any | null) => void
  setSnapshotsModalActual: (snapshots: any[]) => void
  updateSnapshotsModalActual: (updater: (prev: any[]) => any[]) => void
}
