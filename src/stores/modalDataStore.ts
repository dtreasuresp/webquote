/**
 * Modal Data Store
 * Manages data specific to modal operations
 */

import { create } from 'zustand'

export interface ModalDataState {
  quotationEnModal: any | null
  snapshotsModalActual: any[]
}

export interface ModalDataStore extends ModalDataState {
  setQuotationEnModal: (quotation: any | null) => void
  setSnapshotsModalActual: (snapshots: any[]) => void
  updateSnapshotsModalActual: (updater: (prev: any[]) => any[]) => void
}

const DEFAULT_MODAL_DATA_STATE: ModalDataState = {
  quotationEnModal: null,
  snapshotsModalActual: [],
}

export const useModalDataStore = create<ModalDataStore>((set, get) => ({
  ...DEFAULT_MODAL_DATA_STATE,

  setQuotationEnModal: (quotation: any | null) => {
    set({ quotationEnModal: quotation })
  },

  setSnapshotsModalActual: (snapshots: any[]) => {
    set({ snapshotsModalActual: snapshots })
  },

  updateSnapshotsModalActual: (updater: (prev: any[]) => any[]) => {
    const current = get().snapshotsModalActual
    set({ snapshotsModalActual: updater(current) })
  },
}))
