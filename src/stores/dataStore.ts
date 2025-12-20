/**
 * Data Store
 * Global application data management
 * Handles quotations list, sync state, and session data
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DataState {
  // Quotations list
  quotations: any[]
  
  // Sync & Save state
  hasPendingLocalChanges: boolean
  
  // Session data
  snapshotOriginalJson: string | null
  quotationEstadoAntes: any | null
  lastSavedJson: string | null
}

export interface DataStore extends DataState {
  // Quotations management
  setQuotations: (quotations: any[]) => void
  updateQuotations: (updater: (prev: any[]) => any[]) => void
  addQuotation: (quotation: any) => void
  removeQuotation: (id: string) => void
  updateQuotationInList: (id: string, updates: any) => void
  
  // Sync state
  setPendingChanges: (hasPending: boolean) => void
  
  // Session data
  setSnapshotOriginalJson: (json: string | null) => void
  setQuotationEstadoAntes: (estado: any | null) => void
  setLastSavedJson: (json: string | null) => void
}

const DEFAULT_DATA_STATE: DataState = {
  quotations: [],
  hasPendingLocalChanges: false,
  snapshotOriginalJson: null,
  quotationEstadoAntes: null,
  lastSavedJson: null,
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_DATA_STATE,

      setQuotations: (quotations: any[]) => {
        set({ quotations })
      },

      updateQuotations: (updater: (prev: any[]) => any[]) => {
        const current = get().quotations
        set({ quotations: updater(current) })
      },

      addQuotation: (quotation: any) => {
        const current = get().quotations
        const exists = current.find((q) => q.id === quotation.id)
        if (!exists) {
          set({ quotations: [...current, quotation] })
        }
      },

      removeQuotation: (id: string) => {
        const current = get().quotations
        set({ quotations: current.filter((q) => q.id !== id) })
      },

      updateQuotationInList: (id: string, updates: any) => {
        const current = get().quotations
        set({
          quotations: current.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        })
      },

      setPendingChanges: (hasPending: boolean) => {
        set({ hasPendingLocalChanges: hasPending })
      },

      setSnapshotOriginalJson: (json: string | null) => {
        set({ snapshotOriginalJson: json })
      },

      setQuotationEstadoAntes: (estado: any | null) => {
        set({ quotationEstadoAntes: estado })
      },

      setLastSavedJson: (json: string | null) => {
        set({ lastSavedJson: json })
      },
    }),
    {
      name: 'data-store',
      partialize: (state) => ({
        quotations: state.quotations,
      }),
    }
  )
)
