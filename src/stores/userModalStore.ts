/**
 * User Modal Store
 * Zustand store for managing user modal state and operations
 * Reemplaza UserModalContext con mejor rendimiento y menos re-renders
 */

import { create } from 'zustand'

type ModalMode = 'create' | 'edit' | 'delete' | 'resetPassword' | null

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  organizationId: string | null
  quotationAssignedId: string | null
  quotationAssigned?: {
    id: string
    empresa: string
    numero: string
  } | null
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserModalState {
  // Control de visibilidad y modo
  isOpen: boolean
  mode: ModalMode
  
  // Datos
  organizationId: string | null
  editingUser: User | null
  userToDelete: User | null
}

export interface UserModalStore extends UserModalState {
  // Métodos para abrir modales
  openNewUserModal: (organizationId?: string) => void
  openEditUserModal: (user: User) => void
  openDeleteUserModal: (user: User) => void
  openResetPasswordModal: (user: User) => void
  closeModal: () => void
  
  // Método para resetear el estado
  reset: () => void
}

const DEFAULT_STATE: UserModalState = {
  isOpen: false,
  mode: null,
  organizationId: null,
  editingUser: null,
  userToDelete: null,
}

export const useUserModalStore = create<UserModalStore>((set) => ({
  ...DEFAULT_STATE,

  openNewUserModal: (organizationId?: string) => {
    set({
      mode: 'create',
      organizationId: organizationId || null,
      editingUser: null,
      userToDelete: null,
      isOpen: true,
    })
  },

  openEditUserModal: (user: User) => {
    set({
      mode: 'edit',
      editingUser: user,
      organizationId: user.organizationId,
      userToDelete: null,
      isOpen: true,
    })
  },

  openDeleteUserModal: (user: User) => {
    set({
      mode: 'delete',
      userToDelete: user,
      editingUser: null,
      organizationId: null,
      isOpen: true,
    })
  },

  openResetPasswordModal: (user: User) => {
    set({
      mode: 'resetPassword',
      userToDelete: user,
      editingUser: null,
      organizationId: null,
      isOpen: true,
    })
  },

  closeModal: () => {
    set(DEFAULT_STATE)
  },

  reset: () => {
    set(DEFAULT_STATE)
  },
}))
