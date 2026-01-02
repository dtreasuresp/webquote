'use client'

import React, { useState, useCallback } from 'react'
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useUserModalStore } from '@/stores/userModalStore'

// ==================== TIPOS ====================

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  roleRef?: {
    color: string | null
    displayName?: string | null
  }
  organizationId: string | null
  quotationAssignedId: string | null
  quotationAssigned?: {
    id: string
    empresa: string
    numero: string
  } | null
  activo: boolean
  lastLogin?: string | null
}

interface UsersTableInOrganizationProps {
  organizationId: string
  onRefresh?: () => Promise<void>
  loading?: boolean
}

// ==================== COMPONENTE ====================

export default function UsersTableInOrganization({
  organizationId,
  onRefresh,
  loading: externalLoading = false
}: Readonly<UsersTableInOrganizationProps>) {
  const toast = useToast()

  // Estado
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  // Hook para modal usando Zustand store
  const userModal = useUserModalStore()

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizations/${organizationId}/users`)
      if (!response.ok) throw new Error('Error al cargar usuarios')
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : data.users || [])
    } catch (error) {
      console.error('[UsersTableInOrganization] Error:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [organizationId, toast])

  // Cargar usuarios al montar
  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  if (externalLoading || loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-gh-accent animate-spin mr-2" />
        <span className="text-xs text-gh-text-muted">Cargando usuarios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Botón crear */}
      <button
        onClick={() => userModal.openNewUserModal(organizationId)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors text-xs font-medium"
      >
        <Plus className="w-3.5 h-3.5" />
        Nuevo Usuario
      </button>

      {/* Tabla */}
      {users.length === 0 ? (
        <div className="text-center py-6 text-gh-text-muted text-xs">
          No hay usuarios en esta organización
        </div>
      ) : (
        <div className="overflow-x-auto border border-gh-border/30 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-gh-bg-secondary/40 border-b border-gh-border/30">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gh-text">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold text-gh-text">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gh-text">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gh-text">Rol</th>
                <th className="px-4 py-3 text-right font-semibold text-gh-text">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gh-border/20 hover:bg-gh-bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-gh-text-muted font-mono">{user.username}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gh-text">{user.nombre}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gh-text-muted">{user.email || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className={`px-2 py-0.5 rounded-full font-medium border transition-colors ${
                        !user.roleRef?.color ? (
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : user.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-gh-info/20 text-gh-info border-gh-info/30'
                        ) : ''
                      }`}
                      style={user.roleRef?.color ? {
                        backgroundColor: `${user.roleRef.color}26`,
                        color: user.roleRef.color,
                        borderColor: `${user.roleRef.color}66`
                      } : {}}
                    >
                      {user.roleRef?.displayName || (user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'Cliente')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => userModal.openEditUserModal(user)}
                        className="p-1.5 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => userModal.openDeleteUserModal(user)}
                        className="p-1.5 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
