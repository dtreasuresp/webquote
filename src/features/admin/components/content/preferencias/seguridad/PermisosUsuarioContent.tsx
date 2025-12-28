'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Loader2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Check,
  Shield,
  Key,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import DialogoGenericoDinamico from '../../../DialogoGenericoDinamico'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'
import { usePermission } from '@/hooks/usePermission'

// ==================== TIPOS ====================

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  roleRef: {
    id: string
    displayName: string
    color: string | null
  } | null
  UserPermission: UserPermission[]
}

interface UserPermission {
  id: string
  permissionId: string
  granted: boolean
  Permission: {
    id: string
    code: string
    name: string
    category: string
  }
}

interface Permission {
  id: string
  code: string
  name: string
  category: string
}

// ==================== COMPONENTE ====================

export default function PermisosUsuarioContent() {
  // Permisos granulares
  const userPermsConfig = usePermission('security.user_permissions')
  
  // Estado
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'with-permissions' | 'without-permissions'>('all')
  
  // Paginación
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Usuario seleccionado
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>('')
  const [grantType, setGrantType] = useState<'grant' | 'revoke'>('grant')
  const [saving, setSaving] = useState(false)

  // Cargar datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [usersRes, permissionsRes] = await Promise.all([
        fetch('/api/users?includePermissions=true'),
        fetch('/api/permissions'),
      ])

      if (!usersRes.ok || !permissionsRes.ok) {
        throw new Error('Error al cargar datos')
      }

      const usersData = await usersRes.json()
      const permissionsData = await permissionsRes.json()

      setUsers(usersData)
      setPermissions(permissionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    // Búsqueda por texto
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filtro por rol
    const matchesRole = roleFilter === 'all' || user.roleRef?.id === roleFilter
    
    // Filtro por estado de permisos
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'with-permissions' && user.UserPermission.length > 0) ||
      (statusFilter === 'without-permissions' && user.UserPermission.length === 0)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Paginación
  const paginatedUsers = itemsPerPage === 'all' 
    ? filteredUsers 
    : filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredUsers.length / itemsPerPage)

  // Reset página cuando cambien filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, roleFilter, statusFilter, itemsPerPage])

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  // Obtener roles únicos
  const uniqueRoles = users
    .filter(u => u.roleRef)
    .reduce((acc, user) => {
      if (user.roleRef && !acc.find(r => r.id === user.roleRef!.id)) {
        acc.push(user.roleRef)
      }
      return acc
    }, [] as Array<{ id: string; displayName: string; color: string | null }>)

  // Abrir modal para agregar permiso
  const handleAddPermission = (user: User) => {
    setSelectedUser(user)
    setSelectedPermissionId('')
    setGrantType('grant')
    setIsModalOpen(true)
  }

  // Guardar permiso individual
  const handleSavePermission = async () => {
    if (!selectedUser || !selectedPermissionId) return

    try {
      setSaving(true)
      
      const res = await fetch('/api/user-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          permissionId: selectedPermissionId,
          granted: grantType === 'grant',
        }),
      })
      
      if (!res.ok) throw new Error('Error al guardar')
      
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Eliminar permiso individual
  const handleRemovePermission = async (userPermissionId: string) => {
    if (!confirm('¿Eliminar este permiso individual?')) return

    try {
      const res = await fetch(`/api/user-permissions/${userPermissionId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Error al eliminar')
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  // Permisos disponibles para agregar
  const getAvailablePermissions = (user: User) => {
    const existingIds = user.UserPermission.map((up) => up.permissionId);
    return permissions.filter((p) => !existingIds.includes(p.id));
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-gh-accent animate-spin" />
        <span className="ml-2 text-xs font-medium text-gh-text-muted">Cargando usuarios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <Users className="w-4 h-4 text-gh-accent" />
            Permisos por Usuario
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Asigna permisos adicionales o restricciones a usuarios específicos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        {/* Primera fila: Search + Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text-primary placeholder:text-gh-text-muted focus:outline-none focus:border-gh-accent/50 transition-colors"
            />
          </div>

          {/* Rol */}
          <DropdownSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: 'Todos los roles' },
              ...uniqueRoles.map(role => ({ 
                value: role.id, 
                label: role.displayName 
              }))
            ]}
            placeholder="Rol"
            className="min-w-[160px]"
          />

          {/* Estado de permisos */}
          <DropdownSelect
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as typeof statusFilter)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'with-permissions', label: 'Con permisos individuales' },
              { value: 'without-permissions', label: 'Sin permisos individuales' }
            ]}
            placeholder="Estado"
            className="min-w-[200px]"
          />

          {/* Botón limpiar filtros */}
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gh-text-muted hover:text-gh-text-primary border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Segunda fila: ItemsPerPageSelector */}
        <ItemsPerPageSelector
          value={itemsPerPage}
          onChange={setItemsPerPage}
          total={filteredUsers.length}
          className="w-fit"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-gh-danger/10 border border-gh-danger/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-gh-danger" />
          <span className="text-xs text-gh-danger">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-3.5 h-3.5 text-gh-danger hover:text-gh-danger/80" />
          </button>
        </div>
      )}

      {/* Lista de usuarios */}
      {paginatedUsers.length === 0 ? (
        <div className="py-12 text-center">
          <Filter className="w-12 h-12 mx-auto text-gh-text-muted/30 mb-3" />
          <p className="text-sm text-gh-text-muted">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No se encontraron usuarios con los filtros aplicados'
              : 'No hay usuarios para mostrar'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden"
          >
            {/* Header del usuario */}
            <div className="flex items-center justify-between px-4 py-3 bg-gh-bg-tertiary/30 border-b border-gh-border/20">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: user.roleRef?.color || '#6B7280' }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                
                {/* Info */}
                <div>
                  <div className="text-sm font-medium text-gh-text">{user.nombre || user.username}</div>
                  <div className="flex items-center gap-2 text-[10px] text-gh-text-muted">
                    <span>@{user.username}</span>
                    {user.roleRef && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          {user.roleRef.displayName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón agregar (solo si puede asignar) */}
              {userPermsConfig.canAssign && (
                <button
                  onClick={() => handleAddPermission(user)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-gh-accent hover:bg-gh-accent/10 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Agregar
                </button>
              )}
            </div>

            {/* Permisos individuales */}
            <div className="px-4 py-2">
              {user.UserPermission.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.UserPermission.map(up => (
                    <div
                      key={up.id}
                      className={`
                        flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px]
                        ${up.granted 
                          ? 'bg-gh-success/10 text-gh-success border border-gh-success/20' 
                          : 'bg-gh-danger/10 text-gh-danger border border-gh-danger/20'
                        }
                      `}
                    >
                      {up.granted ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <X className="w-2.5 h-2.5" />
                      )}
                      <span>{up.Permission.name}</span>
                      {userPermsConfig.canEdit && (
                        <button
                          onClick={() => handleRemovePermission(up.id)}
                          className="ml-1 hover:opacity-70 transition-opacity"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gh-text-muted py-2">
                  Sin permisos individuales. Usa los permisos de su rol.
                </p>
              )}
            </div>
          </motion.div>
        ))}
        </div>
      )}

      {/* Navegación */}
      {totalPages > 1 && paginatedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </motion.button>

          <span className="text-xs text-gh-text-muted">
            Página {currentPage} de {totalPages}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}

      {/* Legacy empty state - can be removed */}
      {filteredUsers.length === 0 && false && (
        <div className="flex flex-col items-center justify-center py-12 text-gh-text-muted">
          <Users className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No se encontraron usuarios</p>
        </div>
      )}

      {/* Modal Agregar Permiso */}
      <DialogoGenericoDinamico
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Permiso Individual"
        description={`Usuario: ${selectedUser?.nombre || selectedUser?.username}`}
        type="info"
        size="xl"
        contentType="custom"
        content={
          <div className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-medium text-gh-text mb-2">
                Tipo de asignación
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGrantType('grant')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-colors
                    ${grantType === 'grant' 
                      ? 'bg-gh-success/10 border-gh-success/30 text-gh-success' 
                      : 'border-gh-border/30 text-gh-text-muted hover:bg-gh-bg-tertiary'
                    }
                  `}
                >
                  <Check className="w-4 h-4" />
                  <span className="text-xs">Conceder</span>
                </button>
                <button
                  onClick={() => setGrantType('revoke')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-colors
                    ${grantType === 'revoke' 
                      ? 'bg-gh-danger/10 border-gh-danger/30 text-gh-danger' 
                      : 'border-gh-border/30 text-gh-text-muted hover:bg-gh-bg-tertiary'
                    }
                  `}
                >
                  <X className="w-4 h-4" />
                  <span className="text-xs">Denegar</span>
                </button>
              </div>
              <p className="text-[10px] text-gh-text-muted mt-1">
                {grantType === 'grant' 
                  ? 'El usuario tendrá este permiso aunque su rol no lo tenga'
                  : 'El usuario NO tendrá este permiso aunque su rol lo tenga'
                }
              </p>
            </div>

            {/* Permiso */}
            <div>
              <DropdownSelect
                label="Permiso"
                value={selectedPermissionId}
                onChange={(val) => setSelectedPermissionId(val)}
                options={selectedUser ? getAvailablePermissions(selectedUser).map(perm => ({
                  value: perm.id,
                  label: `${perm.name} (${perm.code})`
                })) : []}
                placeholder="Seleccionar permiso..."
              />
            </div>
          </div>
        }
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: () => setIsModalOpen(false),
          },
          {
            id: 'save',
            label: grantType === 'grant' ? 'Conceder Permiso' : 'Denegar Permiso',
            variant: grantType === 'grant' ? 'success' : 'danger',
            onClick: handleSavePermission,
            loading: saving,
          },
        ]}
      />
    </div>
  )
}


