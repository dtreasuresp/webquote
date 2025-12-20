/**
 * Data Store Types
 * Type definitions for global application data management
 */

export interface DataState {
  // Quotations list
  quotations: any[]
  
  // Sync & Save state
  hasPendingLocalChanges: boolean
  
  // Session data
  snapshotOriginalJson: string | null
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
}
