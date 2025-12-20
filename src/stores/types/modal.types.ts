/**
 * Type definitions for modalStore
 * Centralizes all modal management across the application
 */

export type ModalType =
  | 'confirmDelete'
  | 'confirmSave'
  | 'confirmDiscard'
  | 'confirmPublish'
  | 'selectSnapshot'
  | 'compareSnapshots'
  | 'importData'
  | 'exportData'
  | 'editTemplate'
  | 'addService'
  | 'editService'
  | 'settings'
  | 'help'
  | 'error'
  | 'success'

export interface ModalAction {
  label: string
  action: () => void | Promise<void>
  type?: 'primary' | 'secondary' | 'danger'
}

export interface ModalConfig {
  id?: string
  title: string
  message: string
  type: ModalType
  actions?: ModalAction[]
  isOpen: boolean
  loading?: boolean
  error?: string
  data?: Record<string, any>
}

export interface ModalState {
  modals: Record<string, ModalConfig>
  activeModalId?: string
  isLoading: boolean
}

export interface ModalStore extends ModalState {
  // Core modal management
  openModal: (id: string, config: Omit<ModalConfig, 'id' | 'isOpen'>) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  setActiveModal: (id: string | undefined) => void
  
  // Modal actions
  updateModalConfig: (id: string, config: Partial<ModalConfig>) => void
  setModalLoading: (id: string, loading: boolean) => void
  setModalError: (id: string, error: string | undefined) => void
  executeModalAction: (id: string, actionIndex: number) => Promise<void>
  
  // Confirmation modals
  openConfirmDelete: (onConfirm: () => Promise<void>, itemName?: string) => void
  openConfirmSave: (onConfirm: () => Promise<void>) => void
  openConfirmDiscard: (onConfirm: () => Promise<void>) => void
  
  // Specific modals
  openSelectSnapshot: (onSelect: (id: string) => void) => void
  openCompareSnapshots: (onCompare: (idA: string, idB: string) => void) => void
  openEditTemplate: (templateId: string, onSave: (data: any) => Promise<void>) => void
  openAddService: (onAdd: (service: any) => Promise<void>) => void
  openSettings: () => void
  openErrorModal: (error: string, onClose?: () => void) => void
  openSuccessModal: (message: string, onClose?: () => void) => void
  
  // Utility
  clearErrors: () => void
  resetModals: () => void
}

export const DEFAULT_MODAL_STATE: ModalState = {
  modals: {},
  isLoading: false,
}
