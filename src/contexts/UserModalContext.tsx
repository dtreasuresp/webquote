'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

type ModalMode = 'create' | 'edit' | 'delete' | 'resetPassword'

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

interface UserModalContextType {
  // Control de visibilidad y modo
  isOpen: boolean
  mode: ModalMode | null
  
  // Métodos para abrir modales
  openNewUserModal: (organizationId?: string) => void
  openEditUserModal: (user: User) => void
  openDeleteUserModal: (user: User) => void
  openResetPasswordModal: (user: User) => void
  closeModal: () => void
  
  // Datos
  organizationId: string | null
  editingUser: User | null
  userToDelete: User | null
}

export const UserModalContext = createContext<UserModalContextType | null>(null)

export const UserModalProvider: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<ModalMode | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const openNewUserModal = useCallback((orgId?: string) => {
    setMode('create')
    setOrganizationId(orgId || null)
    setEditingUser(null)
    setUserToDelete(null)
    setIsOpen(true)
  }, [])

  const openEditUserModal = useCallback((user: User) => {
    setMode('edit')
    setEditingUser(user)
    setOrganizationId(user.organizationId)
    setUserToDelete(null)
    setIsOpen(true)
  }, [])

  const openDeleteUserModal = useCallback((user: User) => {
    setMode('delete')
    setUserToDelete(user)
    setEditingUser(null)
    setOrganizationId(null)
    setIsOpen(true)
  }, [])

  const openResetPasswordModal = useCallback((user: User) => {
    setMode('resetPassword')
    setUserToDelete(user)
    setEditingUser(null)
    setOrganizationId(null)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setMode(null)
    setOrganizationId(null)
    setEditingUser(null)
    setUserToDelete(null)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      openNewUserModal,
      openEditUserModal,
      openDeleteUserModal,
      openResetPasswordModal,
      closeModal,
      organizationId,
      editingUser,
      userToDelete,
    }),
    [isOpen, mode, organizationId, editingUser, userToDelete]
  )

  return (
    <UserModalContext.Provider value={value}>
      {children}
    </UserModalContext.Provider>
  )
}

export const useUserModal = () => {
  const context = useContext(UserModalContext)
  if (!context) throw new Error('useUserModal must be within UserModalProvider')
  return context
}
