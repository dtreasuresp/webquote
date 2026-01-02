'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Loader2, RefreshCw } from 'lucide-react'
import UsersTable from '../../UsersTable'
import SectionHeader from '../../SectionHeader'
import { useUserModalStore } from '@/stores/userModalStore'

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  quotationAssignedId: string | null
  organizationId: string | null
  roleRef?: {
    color: string | null
    displayName: string | null
  }
  quotationAssigned?: {
    id: string
    empresa: string
    numero: string
  } | null
  activo: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string | null
}

export default function UsuariosContent() {
  const userModal = useUserModalStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Error al cargar usuarios')
      const data = await response.json()
      setUsers(data.users || data)
    } catch (err) {
      console.error('Error loading users:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <SectionHeader 
        title="Gestión de Usuarios"
        description="Crea, edita y administra los usuarios del sistema"
        icon={<Users className="w-4 h-4" />}
        onRefresh={fetchUsers}
        isLoading={loading}
        onAdd={() => userModal.openNewUserModal()}
        itemCount={users.length}
        variant="accent"
      />

      {error && (
        <div className="p-3 bg-gh-danger/10 border border-gh-danger/30 rounded-lg text-xs text-gh-danger">
          {error}
        </div>
      )}

      <UsersTable
        users={users}
        loading={loading}
        onEdit={(user) => userModal.openEditUserModal(user)}
        onResetPassword={(user) => userModal.openResetPasswordModal(user)}
        onDelete={(user) => userModal.openDeleteUserModal(user)}
      />
    </motion.div>
  )
}
