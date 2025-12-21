'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type ModalMode = 'create' | 'edit' | 'delete'

interface UserModalContextType {
  // Control de visibilidad y modo
  isOpen: boolean
  mode: ModalMode | null
  
  // Métodos para abrir modales
  openNewUserModal: (organizationId?: string) => void
  openEditUserModal: (user: any) => void
  openDeleteUserModal: (user: any) => void
  closeModal: () => void
  
  // Datos
  organizationId: string | null
  editingUser: any | null
  userToDelete: any | null
}

export const UserModalContext = createContext<UserModalContextType | null>(null)

export const UserModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<ModalMode | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [userToDelete, setUserToDelete] = useState<any | null>(null)

  const openNewUserModal = useCallback((orgId?: string) => {
    setMode('create')
    setOrganizationId(orgId || null)
    setEditingUser(null)
    setUserToDelete(null)
    setIsOpen(true)
  }, [])

  const openEditUserModal = useCallback((user: any) => {
    setMode('edit')
    setEditingUser(user)
    setOrganizationId(user.organizationId)
    setUserToDelete(null)
    setIsOpen(true)
  }, [])

  const openDeleteUserModal = useCallback((user: any) => {
    setMode('delete')
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

  return (
    <UserModalContext.Provider value={{
      isOpen,
      mode,
      openNewUserModal,
      openEditUserModal,
      openDeleteUserModal,
      closeModal,
      organizationId,
      editingUser,
      userToDelete,
    }}>
      {children}
    </UserModalContext.Provider>
  )
}

export const useUserModal = () => {
  const context = useContext(UserModalContext)
  if (!context) throw new Error('useUserModal must be within UserModalProvider')
  return context
}
