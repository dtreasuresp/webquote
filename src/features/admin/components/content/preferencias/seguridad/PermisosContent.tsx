'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Key, 
  Plus, 
  Pencil, 
  Trash2, 
  Lock,
  Loader2,
  AlertCircle,
  Check,
  X,
  Filter,
  Search,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import DialogoGenericoDinamico from '../../../DialogoGenericoDinamico'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'

// ==================== TIPOS ====================

interface Permission {
  id: string
  code: string
  name: string
  description: string | null
  category: string
  isSystem: boolean
  isActive: boolean
  createdAt: string
  _count?: {
    RolePermissions: number
    UserPermission: number
  }
}

interface PermissionFormData {
  code: string
  name: string
  description: string
  category: string
}

// Categorías predefinidas
const CATEGORIES = [
  { value: 'Usuarios', label: 'Usuarios', icon: '👥' },
  { value: 'Cotizaciones', label: 'Cotizaciones', icon: '📄' },
  { value: 'Paquetes', label: 'Paquetes', icon: '📦' },
  { value: 'Servicios', label: 'Servicios', icon: '🔧' },
  { value: 'Sistema', label: 'Sistema', icon: '⚙️' },
  { value: 'Backups', label: 'Backups', icon: '💾' },
  { value: 'Otros', label: 'Otros', icon: '📌' },
]

// ==================== COMPONENTE ====================

export default function PermisosContent() {
  // Sesión para verificar rol
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  
  // Estado
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showSystemOnly, setShowSystemOnly] = useState(false)
  
  // Paginación
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Formulario
  const [formData, setFormData] = useState<PermissionFormData>({
    code: '',
    name: '',
    description: '',
    category: 'Otros',
  })

  // Cargar permisos
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/permissions')
      if (!res.ok) throw new Error('Error al cargar permisos')
      const data = await res.json()
      setPermissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  // Filtrar permisos
  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = 
      perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || perm.category === categoryFilter
    const matchesSystem = !showSystemOnly || perm.isSystem
    return matchesSearch && matchesCategory && matchesSystem
  })

  // Paginar permisos
  const paginatedPermissions = itemsPerPage === 'all' 
    ? filteredPermissions 
    : filteredPermissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = itemsPerPage === 'all' 
    ? 1 
    : Math.ceil(filteredPermissions.length / itemsPerPage)

  // Reset a página 1 al filtrar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, showSystemOnly, itemsPerPage])

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setShowSystemOnly(false)
  }

  // Agrupar por categoría (usar paginatedPermissions en vez de filteredPermissions)
  const groupedPermissions = paginatedPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  // Abrir modal crear
  const handleCreate = () => {
    setModalMode('create')
    setSelectedPermission(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      category: 'Otros',
    })
    setIsModalOpen(true)
  }

  // Abrir modal editar
  const handleEdit = (permission: Permission) => {
    // SUPER_ADMIN puede editar permisos del sistema
    if (permission.isSystem && !isSuperAdmin) return
    setModalMode('edit')
    setSelectedPermission(permission)
    setFormData({
      code: permission.code,
      name: permission.name,
      description: permission.description || '',
      category: permission.category,
    })
    setIsModalOpen(true)
  }

  // Guardar permiso
  const handleSave = async () => {
    try {
      setSaving(true)
      
      const url = modalMode === 'create' 
        ? '/api/permissions' 
        : `/api/permissions/${selectedPermission?.id}`
      
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
      
      setIsModalOpen(false)
      fetchPermissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Eliminar permiso
  const handleDelete = async (permission: Permission) => {
    // SUPER_ADMIN puede eliminar permisos del sistema
    if (permission.isSystem && !isSuperAdmin) return
    if (!confirm(`¿Eliminar el permiso "${permission.name}"?`)) return
    
    try {
      const res = await fetch(`/api/permissions/${permission.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      fetchPermissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  // Toggle activo
  const handleToggleActive = async (permission: Permission) => {
    try {
      const res = await fetch(`/api/permissions/${permission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !permission.isActive }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      fetchPermissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-gh-accent animate-spin" />
        <span className="ml-2 text-xs font-medium text-gh-text-muted">Cargando permisos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <Key className="w-4 h-4 text-gh-accent" />
            Catálogo de Permisos
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Define los permisos disponibles en el sistema
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo Permiso
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar permisos..."
            className="w-full pl-8 pr-3 py-1.5 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
          />
        </div>

        {/* Categoría */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gh-text-muted" />
          <DropdownSelect
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            options={[
              { value: 'all', label: 'Todas las categorías' },
              ...CATEGORIES.map(cat => ({
                value: cat.value,
                label: `${cat.icon} ${cat.label}`
              }))
            ]}
            className="flex-1"
          />
        </div>

        {/* Solo sistema - Toggle button */}
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
        {(searchTerm || categoryFilter !== 'all' || showSystemOnly) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gh-text-muted hover:text-gh-text-primary border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Paginación */}
      <ItemsPerPageSelector
        value={itemsPerPage}
        onChange={setItemsPerPage}
        total={filteredPermissions.length}
      />

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

      {/* Lista agrupada por categoría */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([category, perms]) => {
          const categoryInfo = CATEGORIES.find(c => c.value === category) || { icon: '📌', label: category }
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden"
            >
              {/* Categoría header */}
              <div className="px-4 py-2 bg-gh-bg-tertiary/30 border-b border-gh-border/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gh-text flex items-center gap-1.5">
                    <span>{categoryInfo.icon}</span>
                    {categoryInfo.label}
                  </span>
                  <span className="text-[10px] text-gh-text-muted">
                    {perms.length} permiso{perms.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Lista de permisos */}
              <div className="divide-y divide-gh-border/10">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gh-bg-tertiary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Indicador tipo */}
                      <div className={`
                        w-6 h-6 rounded-md flex items-center justify-center
                        ${perm.isSystem 
                          ? 'bg-gh-accent/10 text-gh-accent' 
                          : 'bg-gh-success/10 text-gh-success'
                        }
                      `}>
                        {perm.isSystem ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                      </div>
                      
                      {/* Info */}
                      <div>
                        <div className="text-xs font-medium text-gh-text">{perm.name}</div>
                        <div className="text-[10px] text-gh-text-muted font-mono">{perm.code}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Estado */}
                      <button
                        onClick={() => handleToggleActive(perm)}
                        className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                          transition-colors cursor-pointer hover:opacity-80
                          ${perm.isActive 
                            ? 'bg-gh-success/10 text-gh-success' 
                            : 'bg-gh-text-muted/10 text-gh-text-muted'
                          }
                        `}
                      >
                        {perm.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </button>

                      {/* Acciones */}
                      <button
                        onClick={() => handleEdit(perm)}
                        disabled={perm.isSystem && !isSuperAdmin}
                        className={`
                          p-1 rounded transition-colors
                          ${(perm.isSystem && !isSuperAdmin)
                            ? 'text-gh-text-muted/40 cursor-not-allowed' 
                            : 'text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10'
                          }
                        `}
                        title={perm.isSystem && !isSuperAdmin ? 'Solo SUPER_ADMIN puede editar permisos del sistema' : 'Editar permiso'}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(perm)}
                        disabled={perm.isSystem && !isSuperAdmin}
                        className={`
                          p-1 rounded transition-colors
                          ${(perm.isSystem && !isSuperAdmin)
                            ? 'text-gh-text-muted/40 cursor-not-allowed' 
                            : 'text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10'
                          }
                        `}
                        title={perm.isSystem && !isSuperAdmin ? 'Solo SUPER_ADMIN puede eliminar permisos del sistema' : 'Eliminar permiso'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Mensaje vacío */}
      {paginatedPermissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gh-text-muted">
          <Key className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">
            {searchTerm || categoryFilter !== 'all' || showSystemOnly
              ? 'No se encontraron permisos con los filtros aplicados'
              : 'No hay permisos disponibles'}
          </p>
        </div>
      )}

      {/* Navegación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          <span className="text-xs text-gh-text-muted">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <DialogoGenericoDinamico
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Crear Nuevo Permiso' : 'Editar Permiso'}
        description={modalMode === 'create' 
          ? 'Define un nuevo permiso para el sistema'
          : `Modificando: ${selectedPermission?.name}`
        }
        type="info"
        size="md"
        contentType="custom"
        content={
          <div className="space-y-4">
            {/* Código */}
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Código <span className="text-gh-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  code: e.target.value.toLowerCase().replace(/[^a-z._]/g, '') 
                }))}
                placeholder="categoria.accion"
                className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text font-mono placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
              />
              <p className="text-[10px] text-gh-text-muted mt-1">
                Formato: categoria.accion (ej: users.create)
              </p>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Nombre <span className="text-gh-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Crear usuarios"
                className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
              />
            </div>

            {/* Categoría */}
            <div>
              <DropdownSelect
                label={<>Categoría <span className="text-gh-danger">*</span></>}
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                options={CATEGORIES.map(cat => ({
                  value: cat.value,
                  label: `${cat.icon} ${cat.label}`
                }))}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del permiso..."
                rows={2}
                className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent resize-none"
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
            label: modalMode === 'create' ? 'Crear Permiso' : 'Guardar Cambios',
            variant: 'success',
            onClick: handleSave,
            loading: saving,
          },
        ]}
      />
    </div>
  )
}


