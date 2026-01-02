import { create } from 'zustand'

export type CrmModalType = 
  | 'account' 
  | 'contact' 
  | 'product' 
  | 'opportunity' 
  | 'interaction' 
  | 'subscription' 
  | 'compliance'
  | 'rule'
  | 'template'

interface CrmModalState {
  isOpen: boolean
  type: CrmModalType | null
  data: any | null
  mode: 'create' | 'edit'
}

interface CrmModalStore extends CrmModalState {
  openModal: (type: CrmModalType, mode: 'create' | 'edit', data?: any) => void
  closeModal: () => void
}

export const useCrmModalStore = create<CrmModalStore>((set) => ({
  isOpen: false,
  type: null,
  data: null,
  mode: 'create',

  openModal: (type, mode, data = null) => set({ isOpen: true, type, mode, data }),
  closeModal: () => set({ isOpen: false, type: null, data: null, mode: 'create' }),
}))
