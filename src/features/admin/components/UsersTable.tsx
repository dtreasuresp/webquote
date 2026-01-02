'use client'

import React from 'react'
import { Edit2, Trash2, Key, ShieldCheck, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { ROLE_UI_CONFIG } from '@/lib/constants/roles'

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

function getRoleBadgeClasses(role: string): string {
  const config = ROLE_UI_CONFIG[role as keyof typeof ROLE_UI_CONFIG] || ROLE_UI_CONFIG.USER
  return config.badge
}

function getRoleLabel(role: string): string {
  const config = ROLE_UI_CONFIG[role as keyof typeof ROLE_UI_CONFIG] || ROLE_UI_CONFIG.USER
  return config.label
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

function getIconColor(role: string): string {
  const config = ROLE_UI_CONFIG[role as keyof typeof ROLE_UI_CONFIG] || ROLE_UI_CONFIG.USER
  return config.iconColor
}

function getRoleBgColor(role: string): string {
  const config = ROLE_UI_CONFIG[role as keyof typeof ROLE_UI_CONFIG] || ROLE_UI_CONFIG.USER
  return config.bgColor
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
      <div className="bg-gh-bg-secondary/10 backdrop-blur-md border border-gh-border/50 rounded-xl p-12 shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gh-accent"></div>
          <span className="text-xs text-gh-text-muted animate-pulse">Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gh-bg-secondary/10 backdrop-blur-md border border-gh-border/50 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gh-bg-secondary/40 border-b border-gh-border/50">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gh-text-muted uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gh-text-muted uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gh-text-muted uppercase tracking-wider">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gh-text-muted uppercase tracking-wider">
                Cotización
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gh-text-muted uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-bold text-gh-text-muted uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gh-border/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gh-text-muted">
                    <User className="w-8 h-8 opacity-20" />
                    <p className="text-sm">No hay usuarios registrados</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gh-accent/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`p-1.5 rounded-full transition-colors`}
                        style={user.roleRef?.color ? { backgroundColor: `${user.roleRef.color}26` } : {}}
                      >
                        {getRoleIcon(user.role) === 'shield' ? (
                          <ShieldCheck 
                            className={`w-3.5 h-3.5 transition-colors`} 
                            style={user.roleRef?.color ? { color: user.roleRef.color } : {}}
                          />
                        ) : (
                          <User 
                            className={`w-3.5 h-3.5 transition-colors`} 
                            style={user.roleRef?.color ? { color: user.roleRef.color } : {}}
                          />
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
                    <span 
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${!user.roleRef?.color ? getRoleBadgeClasses(user.role) : ''}`}
                      style={user.roleRef?.color ? {
                        backgroundColor: `${user.roleRef.color}26`,
                        color: user.roleRef.color,
                        borderColor: `${user.roleRef.color}66`
                      } : {}}
                    >
                      {user.roleRef?.displayName || getRoleLabel(user.role)}
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
