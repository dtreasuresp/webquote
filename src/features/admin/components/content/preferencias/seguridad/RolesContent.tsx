'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Pencil, 
  Trash2, 
  Lock, 
  Loader2,
  AlertCircle,
  Check,
  X,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import DialogoGenericoDinamico from '../../../DialogoGenericoDinamico'
import { useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useSession } from 'next-auth/react'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'
import { ROLE_COLORS } from '@/lib/constants/roles'

// ==================== TIPOS ====================

interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  hierarchy: number
  color: string | null
  isSystem: boolean
  isActive: boolean
  _count?: {
    users: number
    permissions: number
  }
}

interface RoleFormData {
  name: string
  displayName: string
  description: string
  hierarchy: number
  color: string
  isSystem?: boolean
}

// ==================== COMPONENTE ====================

export default function RolesContent() {
  const { data: session, update: updateSession } = useSession()
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn, canCreate: canCreateFn, canDelete: canDeleteFn, canView: canViewFn } = useAdminPermissions()
  
  const canEdit = canEditFn('ROLES')
  const canCreate = canCreateFn('ROLES')
  const canDelete = canDeleteFn('ROLES')
  const canView = canViewFn('ROLES')
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  
  // Estado
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString())
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showSystemOnly, setShowSystemOnly] = useState(false)
  
  // Paginación
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Formulario
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    displayName: '',
    description: '',
    hierarchy: 50,
    color: ROLE_COLORS.USER,
    isSystem: false,
  })

  // Colores predefinidos
  const presetColors = [
    '#DC2626', // red
    '#EA580C', // orange
    '#D97706', // amber
    '#16A34A', // green
    '#0D9488', // teal
    '#2563EB', // blue
    '#7C3AED', // violet
    '#DB2777', // pink
    '#6B7280', // gray
  ]

  // Cargar roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/roles')
      if (!res.ok) throw new Error('Error al cargar roles')
      const data = await res.json()
      setRoles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Reset a página 1 al filtrar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, showActiveOnly, showSystemOnly, itemsPerPage])
  
  // ✅ Control de acceso
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Lock className="w-16 h-16 text-gh-text-muted/40" />
        <p className="text-gh-text-muted">No tienes permiso para ver roles</p>
      </div>
    )
  }

  // Abrir modal crear
  const handleCreate = () => {
    setModalMode('create')
    setSelectedRole(null)
    setFormData({
      name: '',
      displayName: '',
      description: '',
      hierarchy: 50,
      color: ROLE_COLORS.USER,
      isSystem: false,
    })
    setIsModalOpen(true)
  }

  // Abrir modal editar
  const handleEdit = (role: Role) => {
    // Solo SUPER_ADMIN puede editar roles del sistema
    if (role.isSystem && !isSuperAdmin) return
    setModalMode('edit')
    setSelectedRole(role)
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      hierarchy: role.hierarchy,
      color: role.color || '#6B7280',
      isSystem: role.isSystem,
    })
    setIsModalOpen(true)
  }

  // Guardar rol
  const handleSave = async () => {
    if (!canEdit) return
    try {
      setSaving(true)
      
      const url = modalMode === 'create' 
        ? '/api/roles' 
        : `/api/roles/${selectedRole?.id}`
      
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }
      
      // Audit log
      logAction(
        modalMode === 'create' ? 'CREATE' : 'UPDATE',
        'ROLES',
        selectedRole?.id || 'new',
        formData.displayName,
        modalMode === 'edit' ? {
          before: selectedRole,
          after: formData
        } : undefined
      )

      setIsModalOpen(false)
      setLastUpdated(new Date().toISOString())
      fetchRoles()

      // ✨ Actualizar sesión si el rol editado es el del usuario actual
      if (selectedRole?.name === session?.user?.role) {
        updateSession({
          user: {
            ...session.user,
            roleColor: formData.color
          }
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Eliminar rol
  const handleDelete = async (role: Role) => {
    if (!canDelete) return
    // Solo SUPER_ADMIN puede eliminar roles del sistema
    if (role.isSystem && !isSuperAdmin) return
    if (!confirm(`¿Eliminar el rol "${role.displayName}"?`)) return
    
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      
      // Audit log
      logAction('DELETE', 'ROLES', role.id, role.displayName)
      
      setLastUpdated(new Date().toISOString())
      fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  // Toggle activo
  const handleToggleActive = async (role: Role) => {
    if (!canEdit) return
    // Solo SUPER_ADMIN puede modificar estado de roles del sistema
    if (role.isSystem && !isSuperAdmin) return
    
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !role.isActive }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      
      // Audit log
      logAction('UPDATE', 'ROLES', role.id, role.displayName, {
        isActive: { before: role.isActive, after: !role.isActive }
      })
      
      setLastUpdated(new Date().toISOString())
      fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  // Filtrar roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActive = !showActiveOnly || role.isActive
    const matchesSystem = !showSystemOnly || role.isSystem
    return matchesSearch && matchesActive && matchesSystem
  })

  // Paginar roles
  const paginatedRoles = itemsPerPage === 'all' 
    ? filteredRoles 
    : filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = itemsPerPage === 'all' 
    ? 1 
    : Math.ceil(filteredRoles.length / itemsPerPage)

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setShowActiveOnly(false)
    setShowSystemOnly(false)
    setCurrentPage(1)
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-gh-accent animate-spin" />
        <span className="ml-2 text-xs font-medium text-gh-text-muted">Cargando roles...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Gestión de Roles"
        description="Administra los roles y niveles de acceso del sistema"
        icon={<Shield className="w-4 h-4" />}
        updatedAt={lastUpdated}
        onAdd={canCreate ? handleCreate : undefined}
      />

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        {/* Primera fila: Search + Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text-primary placeholder:text-gh-text-muted focus:outline-none focus:border-gh-accent/50 transition-colors"
            />
          </div>

          {/* Toggle Solo activos */}
          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
              showActiveOnly
                ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30'
                : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30 hover:bg-gh-bg-tertiary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Solo activos
          </button>

          {/* Toggle Solo sistema */}
          <button
            onClick={() => setShowSystemOnly(!showSystemOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
              showSystemOnly
                ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30'
                : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30 hover:bg-gh-bg-tertiary'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Solo sistema
          </button>

          {/* Botón limpiar filtros */}
          {(searchTerm || showActiveOnly || showSystemOnly) && (
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
          total={filteredRoles.length}
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

      {/* Tabla de roles */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gh-border/20 bg-gh-bg-tertiary/30">
              <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium">Rol</th>
              <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium">Jerarquía</th>
              <th className="text-center px-4 py-2.5 text-gh-text-muted font-medium">Usuarios</th>
              <th className="text-center px-4 py-2.5 text-gh-text-muted font-medium">Permisos</th>
              <th className="text-center px-4 py-2.5 text-gh-text-muted font-medium">Estado</th>
              <th className="text-right px-4 py-2.5 text-gh-text-muted font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gh-text-muted">
                  <Filter className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  {searchTerm || showActiveOnly || showSystemOnly 
                    ? 'No se encontraron roles con los filtros aplicados'
                    : 'No hay roles disponibles'}
                </td>
              </tr>
            ) : (
              paginatedRoles.map((role, index) => (
                <motion.tr
                  key={role.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gh-border/10 hover:bg-gh-bg-tertiary/20 transition-colors"
                >
                {/* Rol */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: role.color || '#6B7280' }}
                    />
                    <div>
                      <div className="font-medium text-gh-text flex items-center gap-1.5">
                        {role.displayName}
                        {role.isSystem && (
                          <span title="Rol del sistema">
                            <Lock className="w-3 h-3 text-gh-text-muted" />
                          </span>
                        )}
                      </div>
                      <div className="text-gh-text-muted text-[10px]">{role.name}</div>
                    </div>
                  </div>
                </td>
                
                {/* Jerarquía */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gh-border/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${role.hierarchy}%`,
                          backgroundColor: role.color || '#6B7280'
                        }}
                      />
                    </div>
                    <span className="text-gh-text-muted">{role.hierarchy}</span>
                  </div>
                </td>
                
                {/* Usuarios */}
                <td className="px-4 py-3 text-center">
                  <span className="text-gh-text">{role._count?.users || 0}</span>
                </td>
                
                {/* Permisos */}
                <td className="px-4 py-3 text-center">
                  <span className="text-gh-text">{role._count?.permissions || 0}</span>
                </td>
                
                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleActive(role)}
                    disabled={(role.isSystem && !isSuperAdmin) || !canEdit}
                    className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                      transition-colors
                      ${role.isActive 
                        ? 'bg-gh-success/10 text-gh-success' 
                        : 'bg-gh-text-muted/10 text-gh-text-muted'
                      }
                      ${((role.isSystem && !isSuperAdmin) || !canEdit) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'}
                    `}
                  >
                    {role.isActive ? (
                      <>
                        <Check className="w-3 h-3" />
                        Activo
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        Inactivo
                      </>
                    )}
                  </button>
                </td>
                
                {/* Acciones */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleEdit(role)}
                          disabled={role.isSystem && !isSuperAdmin}
                          className={`
                            p-1.5 rounded-md transition-colors
                            ${(role.isSystem && !isSuperAdmin)
                              ? 'text-gh-text-muted/40 cursor-not-allowed' 
                              : 'text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10'
                            }
                          `}
                          title={(role.isSystem && !isSuperAdmin) ? 'Solo SUPER_ADMIN puede editar roles del sistema' : 'Editar'}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          disabled={role.isSystem && !isSuperAdmin}
                          className={`
                            p-1.5 rounded-md transition-colors
                            ${(role.isSystem && !isSuperAdmin)
                              ? 'text-gh-text-muted/40 cursor-not-allowed' 
                              : 'text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10'
                            }
                          `}
                          title={(role.isSystem && !isSuperAdmin) ? 'Solo SUPER_ADMIN puede eliminar roles del sistema' : 'Eliminar'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {!canEdit && canView && (
                      <span className="text-[10px] text-gh-text-muted px-2">Solo lectura</span>
                    )}
                  </div>
                </td>
              </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Navegación */}
      {totalPages > 1 && (
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

      {/* Modal Crear/Editar */}
      <DialogoGenericoDinamico
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Crear Nuevo Rol' : 'Editar Rol'}
        description={modalMode === 'create' 
          ? 'Define un nuevo rol con sus permisos base'
          : `Modificando: ${selectedRole?.displayName}`
        }
        type="info"
        size="xl"
        contentType="custom"
        content={
          <div className="space-y-4">
            {/* Nombre interno */}
            <div>
              <label htmlFor="role-name" className="block text-xs font-medium text-gh-text mb-1">
                Nombre interno <span className="text-gh-danger">*</span>
              </label>
              <input
                id="role-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value.toUpperCase().replaceAll(/[^A-Z_]/g, '') 
                }))}
                placeholder="CUSTOM_ROLE"
                className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
              />
              <p className="text-[10px] text-gh-text-muted mt-1">
                Solo mayúsculas y guiones bajos
              </p>
            </div>

            {/* Nombre para mostrar */}
            <div>
              <label htmlFor="role-displayName" className="block text-xs font-medium text-gh-text mb-1">
                Nombre para mostrar <span className="text-gh-danger">*</span>
              </label>
              <input
                id="role-displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Rol Personalizado"
                className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="role-description" className="block text-xs font-medium text-gh-text mb-1">
                Descripción
              </label>
              <textarea
                id="role-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del rol..."
                rows={2}
                className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent resize-none"
              />
            </div>

            {/* Jerarquía */}
            <div>
              <label htmlFor="role-hierarchy" className="block text-xs font-medium text-gh-text mb-1">
                Jerarquía (1-100)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="role-hierarchy"
                  type="range"
                  min="1"
                  max={formData.name === 'SUPER_ADMIN' ? "100" : "99"}
                  value={formData.hierarchy}
                  onChange={(e) => setFormData(prev => ({ ...prev, hierarchy: Number.parseInt(e.target.value, 10) }))}
                  className="flex-1 accent-gh-accent"
                />
                <span className="w-8 text-center text-xs font-medium text-gh-text">{formData.hierarchy}</span>
              </div>
              <p className="text-[10px] text-gh-text-muted mt-1">
                Mayor número = más privilegios. SUPER_ADMIN = 100
              </p>
            </div>

            {/* Color */}
            <div>
              <label htmlFor="role-color" className="block text-xs font-medium text-gh-text mb-1">
                Color
              </label>
              <div id="role-color" className="flex items-center gap-2 flex-wrap">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`
                      w-6 h-6 rounded-md transition-all
                      ${formData.color === color ? 'ring-2 ring-offset-2 ring-offset-gh-bg ring-gh-accent' : ''}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-6 h-6 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Rol del Sistema - Solo SUPER_ADMIN */}
            {isSuperAdmin && (
              <div className="pt-3 border-t border-gh-border/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-gh-text mb-1">
                      Rol del Sistema
                    </span>
                    <p className="text-xs text-gh-text-muted">
                      Los roles del sistema solo pueden ser modificados por SUPER_ADMIN y tienen protección especial
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isSystem: !prev.isSystem }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isSystem ? 'bg-gh-accent' : 'bg-gh-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isSystem ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
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
            label: modalMode === 'create' ? 'Crear Rol' : 'Guardar Cambios',
            variant: 'success',
            onClick: handleSave,
            loading: saving,
          },
        ]}
      />
    </div>
  )
}


