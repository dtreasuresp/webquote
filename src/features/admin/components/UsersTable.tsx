'use client'

import React from 'react'
import { Edit2, Trash2, Key, ShieldCheck, User } from 'lucide-react'
import { useSession } from 'next-auth/react'

// ==================== TIPOS ====================

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  quotationAssignedId: string | null
  organizationId: string | null
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

interface UsersTableProps {
  readonly users: User[]
  readonly loading?: boolean
  readonly onEdit: (user: User) => void
  readonly onResetPassword: (user: User) => void
  readonly onDelete: (user: User) => void
}

// ==================== HELPERS ====================

/**
 * Determina el estado de conexión del usuario
 */
function getUserStatus(lastLogin?: string | null): {
  status: 'online' | 'offline' | 'never'
  color: string
  label: string
} {
  if (!lastLogin) {
    return { status: 'never', color: 'bg-amber-500', label: 'Nunca ha iniciado sesión' }
  }

  const lastLoginDate = new Date(lastLogin)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60)

  if (diffMinutes < 5) {
    return { status: 'online', color: 'bg-green-500', label: 'En línea' }
  }

  return { status: 'offline', color: 'bg-red-500', label: 'Desconectado' }
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-amber-500/20'
    case 'ADMIN':
      return 'bg-purple-500/20'
    default:
      return 'bg-gh-accent/20'
  }
}

function getRoleIcon(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return 'shield'
    default:
      return 'user'
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin'
    case 'ADMIN':
      return 'Administrador'
    default:
      return 'Cliente'
  }
}

function getRoleBadgeClasses(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-amber-500/20 text-amber-400'
    case 'ADMIN':
      return 'bg-purple-500/20 text-purple-400'
    default:
      return 'bg-gh-info/20 text-gh-info'
  }
}

function getIconColor(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'text-amber-400'
    case 'ADMIN':
      return 'text-purple-400'
    default:
      return 'text-gh-accent'
  }
}

// ==================== COMPONENTE ====================

export default function UsersTable({
  users,
  loading = false,
  onEdit,
  onResetPassword,
  onDelete,
}: UsersTableProps) {
  const { data: session } = useSession()

  // Determinar si botones están habilitados basado en permisos
  const canEditUser = (user: User) => {
    const currentRole = session?.user?.role
    if (currentRole === 'SUPER_ADMIN') return true
    if (currentRole === 'ADMIN') {
      if (user.role === 'SUPER_ADMIN') return false
      if (user.role === 'ADMIN' && user.id !== session?.user?.id) return false
    }
    return false
  }

  const canResetPassword = (user: User) => {
    const currentRole = session?.user?.role
    if (currentRole === 'SUPER_ADMIN') return true
    if (currentRole === 'ADMIN') {
      return user.role === 'CLIENT'
    }
    return false
  }

  const canDeleteUser = (user: User) => {
    const currentRole = session?.user?.role
    const currentUserId = session?.user?.id
    
    // No se puede eliminar el propio usuario
    if (user.id === currentUserId) return false
    
    // No se puede eliminar el único SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN' && users.filter(u => u.role === 'SUPER_ADMIN').length === 1) {
      return false
    }
    
    // SUPER_ADMIN puede eliminar a todos (excepto a sí mismo y al último SUPER_ADMIN)
    if (currentRole === 'SUPER_ADMIN') return true
    
    // ADMIN solo puede eliminar CLIENT
    if (currentRole === 'ADMIN') {
      return user.role === 'CLIENT'
    }
    
    return false
  }

  if (loading) {
    return (
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gh-accent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gh-bg-tertiary/30 border-b border-gh-border/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                Cotización
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gh-text-muted uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gh-border/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gh-text-muted text-sm">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gh-bg-tertiary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role) === 'shield' ? (
                          <ShieldCheck className={`w-3.5 h-3.5 ${getIconColor(user.role)}`} />
                        ) : (
                          <User className={`w-3.5 h-3.5 ${getIconColor(user.role)}`} />
                        )}
                      </div>
                      <span className="text-gh-text font-mono text-xs">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Indicador de estado */}
                      <div
                        className={`w-2 h-2 rounded-full ${getUserStatus(user.lastLogin).color} animate-pulse`}
                        title={getUserStatus(user.lastLogin).label}
                      />
                      <div>
                        <p className="text-gh-text text-xs">{user.nombre}</p>
                        {user.email && <p className="text-[10px] text-gh-text-muted">{user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeClasses(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.quotationAssigned ? (
                      <div>
                        <p className="text-gh-text text-xs">{user.quotationAssigned.empresa}</p>
                        <p className="text-[10px] text-gh-text-muted">{user.quotationAssigned.numero}</p>
                      </div>
                    ) : (
                      <span className="text-gh-text-muted text-xs">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        user.activo
                          ? 'bg-gh-success/10 text-gh-success'
                          : 'bg-gh-danger/10 text-gh-danger'
                      }`}
                    >
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1.5 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Editar usuario"
                        disabled={!canEditUser(user)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onResetPassword(user)}
                        className="p-1.5 text-gh-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Resetear contraseña"
                        disabled={!canResetPassword(user)}
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="p-1.5 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar usuario"
                        disabled={!canDeleteUser(user)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
