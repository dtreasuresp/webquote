'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/providers/ToastProvider'
import {
  LayoutGrid,
  Loader2,
  Save,
  Check,
  Eye,
  Ban,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'
import { useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'

// ==================== TIPOS ====================

interface Role {
  id: string
  name: string
  displayName: string
  color: string | null
  isSystem: boolean
}

interface Permission {
  id: string
  code: string
  name: string
  category: string
  isSystem: boolean
}
interface RolePermissionMap {
  [roleId: string]: {
    [permissionId: string]: 'none' | 'read' | 'write' | 'full'
  }
}
// Categorías
const CATEGORIES = [
  { value: 'Usuarios', label: 'Usuarios', icon: '👥' },
  { value: 'Cotizaciones', label: 'Cotizaciones', icon: '📄' },
  { value: 'Paquetes', label: 'Paquetes', icon: '📦' },
  { value: 'Servicios', label: 'Servicios', icon: '🔧' },
  { value: 'Sistema', label: 'Sistema', icon: '⚙️' },
  { value: 'Backups', label: 'Backups', icon: '💾' },
]

// ==================== COMPONENTE ====================

export default function MatrizAccesoContent() {
  // Permisos granulares
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn, canView: canViewFn, isSuperAdmin } = useAdminPermissions()
  const canEdit = canEditFn('ROLES')
  const canView = canViewFn('ROLES')
  const toast = useToast()
  
  // Estado
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [matrix, setMatrix] = useState<RolePermissionMap>({})
  const [originalMatrix, setOriginalMatrix] = useState<RolePermissionMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [accessLevelFilter, setAccessLevelFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // Paginación
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Cargar datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const [rolesRes, permissionsRes, matrixRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions'),
        fetch('/api/role-permissions'),
      ])

      if (!rolesRes.ok || !permissionsRes.ok || !matrixRes.ok) {
        throw new Error('Error al cargar datos')
      }

      const rolesData = await rolesRes.json()
      const permissionsData = await permissionsRes.json()
      const matrixResponse = await matrixRes.json()

      setRoles(rolesData)
      setPermissions(permissionsData)
      setMatrix(matrixResponse.matrix || {}) // Extraer solo la matriz
      setOriginalMatrix(JSON.parse(JSON.stringify(matrixResponse.matrix || {})))
      setHasChanges(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Control de acceso
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Lock className="w-16 h-16 text-red-500" />
        <h3 className="text-xl font-semibold text-gray-800">Acceso Denegado</h3>
        <p className="text-gray-600">No tienes permisos para ver la matriz de acceso</p>
      </div>
    )
  }

  // Detectar cambios
  useEffect(() => {
    const matrixStr = JSON.stringify(matrix)
    const originalStr = JSON.stringify(originalMatrix)
    setHasChanges(matrixStr !== originalStr)
  }, [matrix, originalMatrix])

  // Filtrar permisos
  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = 
      perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || perm.category === categoryFilter
    
    // Filtrar por accessLevel (verificar si algún rol tiene ese nivel)
    if (accessLevelFilter !== 'all') {
      const hasAccessLevel = roles.some(role => {
        const access = matrix[role.id]?.[perm.id]
        return access === accessLevelFilter
      })
      if (!hasAccessLevel) return false
    }
    
    return matchesSearch && matchesCategory
  })

  // Filtrar roles
  const filteredRoles = roleFilter === 'all' 
    ? roles 
    : roles.filter(r => r.id === roleFilter)

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
  }, [searchTerm, categoryFilter, accessLevelFilter, roleFilter, itemsPerPage])

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setAccessLevelFilter('all')
    setRoleFilter('all')
    setCurrentPage(1)
  }

  // Agrupar permisos por categoría (usar paginatedPermissions)
  const groupedPermissions = paginatedPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  // Cambiar nivel de acceso
  const handleAccessChange = (roleId: string, permissionId: string) => {
    // Encontrar el rol para verificar si es sistema
    const role = roles.find(r => r.id === roleId)
    if (role?.name === 'SUPER_ADMIN') return // SUPER_ADMIN siempre tiene full

    const currentLevel = matrix[roleId]?.[permissionId] || 'none'
    const levels: Array<'none' | 'read' | 'write' | 'full'> = ['none', 'read', 'write', 'full']
    const currentIndex = levels.indexOf(currentLevel as 'none' | 'read' | 'write' | 'full')
    const nextLevel = levels[(currentIndex + 1) % levels.length]

    setMatrix(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionId]: nextLevel,
      },
    }))
  }

  // Guardar cambios
  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Solo filtrar roles del sistema si NO es SUPER_ADMIN
      const systemRoleIds = isSuperAdmin 
        ? new Set<string>() // SUPER_ADMIN puede modificar todo
        : new Set(roles.filter(r => r.isSystem).map(r => r.id)) // Otros roles no pueden modificar roles del sistema
      
      // Transformar la matriz a formato de updates
      const updates: Array<{ roleId: string; permissionId: string; accessLevel: string }> = []
      
      for (const roleId in matrix) {
        // Saltar roles del sistema si el usuario NO es SUPER_ADMIN
        if (systemRoleIds.has(roleId)) {
          continue
        }
        
        for (const permissionId in matrix[roleId]) {
          updates.push({
            roleId,
            permissionId,
            accessLevel: matrix[roleId][permissionId],
          })
        }
      }
      
      const res = await fetch('/api/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al guardar')
      }
      
      // Actualizar originalMatrix para reflejar los cambios guardados
      // Sin necesidad de recargar desde el servidor
      setOriginalMatrix(JSON.parse(JSON.stringify(matrix)))
      setHasChanges(false)
      logAction('UPDATE', 'ROLES', 'matrix-update', { updates: updates.length })
      toast.success('✅ Permisos actualizados correctamente')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Descartar cambios
  const handleDiscard = () => {
    setMatrix(JSON.parse(JSON.stringify(originalMatrix)))
    setHasChanges(false)
  }

  // Renderizar celda de acceso
  const AccessCell = ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
    const role = roles.find(r => r.id === roleId)
    const level = role?.name === 'SUPER_ADMIN' 
      ? 'full' 
      : (matrix[roleId]?.[permissionId] || 'none')
    
    const isSuperAdmin = role?.name === 'SUPER_ADMIN'

    const config = {
      full: { 
        icon: Check, 
        bg: 'bg-gh-success/20', 
        text: 'text-gh-success',
        border: 'border-gh-success/30'
      },
      write: { 
        icon: Check, 
        bg: 'bg-gh-warning/20', 
        text: 'text-gh-warning',
        border: 'border-gh-warning/30'
      },
      read: { 
        icon: Eye, 
        bg: 'bg-gh-accent/20', 
        text: 'text-gh-accent',
        border: 'border-gh-accent/30'
      },
      none: { 
        icon: Ban, 
        bg: 'bg-gh-text-muted/10', 
        text: 'text-gh-text-muted/40',
        border: 'border-gh-border/20'
      },
    }

    // Validar que el level existe en config
    const accessLevel = level as keyof typeof config
    const configForLevel = config[accessLevel] || config.none

    const { icon: Icon, bg, text, border } = configForLevel

    return (
      <button
        onClick={() => handleAccessChange(roleId, permissionId)}
        disabled={isSuperAdmin}
        className={`
          w-7 h-7 rounded-md flex items-center justify-center border transition-all
          ${bg} ${text} ${border}
          ${isSuperAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-110'}
        `}
        title={isSuperAdmin ? 'SUPER_ADMIN siempre tiene acceso total' : `Click para cambiar: ${level}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </button>
    )
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-gh-accent animate-spin" />
        <span className="ml-2 text-xs font-medium text-gh-text-muted">Cargando matriz...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Matriz de Acceso"
        description="Configura los permisos de cada rol"
        icon={<LayoutGrid className="w-4 h-4" />}
        variant="accent"
        statusIndicator={hasChanges ? 'sin-guardar' : 'guardado'}
        actions={
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Descartar
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${hasChanges 
                    ? 'bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20' 
                    : 'bg-gh-bg-tertiary text-gh-text-muted border border-gh-border/30 cursor-not-allowed'
                  }
                `}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Guardar
              </button>
            )}
          </div>
        }
      />

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-[10px] text-gh-text-muted">
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gh-success/20 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-gh-success" />
          </div>
          Acceso completo (FULL)
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gh-warning/20 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-gh-warning" />
          </div>
          Lectura + Escritura (WRITE)
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gh-accent/20 flex items-center justify-center">
            <Eye className="w-2.5 h-2.5 text-gh-accent" />
          </div>
          Solo lectura (READ)
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gh-text-muted/10 flex items-center justify-center">
            <Ban className="w-2.5 h-2.5 text-gh-text-muted/40" />
          </div>
          Sin acceso (NONE)
        </span>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        {/* Primera fila: Search + Filtros de categoría, nivel de acceso y rol */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar permisos..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text-primary placeholder:text-gh-text-muted focus:outline-none focus:border-gh-accent/50 transition-colors"
            />
          </div>

          {/* Categoría */}
          <DropdownSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'Todas las categorías' },
              ...CATEGORIES.map(cat => ({ 
                value: cat.value, 
                label: `${cat.icon} ${cat.label}` 
              }))
            ]}
            placeholder="Categoría"
            className="min-w-[180px]"
          />

          {/* Nivel de acceso */}
          <DropdownSelect
            value={accessLevelFilter}
            onChange={setAccessLevelFilter}
            options={[
              { value: 'all', label: 'Todos los niveles' },
              { value: 'full', label: '✓ Acceso completo (FULL)' },
              { value: 'write', label: '✓ Lectura + Escritura (WRITE)' },
              { value: 'read', label: '👁️ Solo lectura (READ)' },
              { value: 'none', label: '✗ Sin acceso (NONE)' }
            ]}
            placeholder="Nivel de acceso"
            className="min-w-[180px]"
          />

          {/* Filtro por rol */}
          <DropdownSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: 'Todos los roles' },
              ...roles.map(role => ({ 
                value: role.id, 
                label: role.displayName
              }))
            ]}
            placeholder="Rol"
            className="min-w-[160px]"
          />

          {/* Botón limpiar filtros */}
          {(searchTerm || categoryFilter !== 'all' || accessLevelFilter !== 'all' || roleFilter !== 'all') && (
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
          total={filteredPermissions.length}
          className="w-fit"
        />
      </div>

      {/* Tabla de matriz */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gh-border/20 bg-gh-bg-tertiary/30">
              <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium sticky left-0 bg-gh-bg-tertiary/30 z-10">
                Permiso
              </th>
              {roles.map(role => (
                <th 
                  key={role.id} 
                  className="text-center px-3 py-2.5 text-gh-text-muted font-medium min-w-[80px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: role.color || '#6B7280' }}
                    />
                    <span className="text-[10px]">{role.displayName}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedPermissions).map(([category, perms]) => {
              const categoryInfo = CATEGORIES.find(c => c.value === category) || { icon: '📌', label: category }
              
              return (
                <React.Fragment key={category}>
                  {/* Header de categoría */}
                  <tr className="bg-gh-bg-tertiary/50">
                    <td 
                      colSpan={roles.length + 1}
                      className="px-4 py-1.5 text-[10px] font-medium text-gh-text-muted"
                    >
                      {categoryInfo.icon} {categoryInfo.label}
                    </td>
                  </tr>
                  
                  {/* Permisos de la categoría */}
                  {perms.map(perm => (
                    <tr 
                      key={perm.id}
                      className="border-b border-gh-border/10 hover:bg-gh-bg-tertiary/20 transition-colors"
                    >
                      <td className="px-4 py-2 sticky left-0 bg-gh-bg-secondary z-10">
                        <div className="flex flex-col">
                          <span className="text-gh-text">{perm.name}</span>
                          <span className="text-[9px] text-gh-text-muted font-mono">{perm.code}</span>
                        </div>
                      </td>
                      {roles.map(role => (
                        <td key={role.id} className="text-center px-3 py-2">
                          <div className="flex justify-center">
                            <AccessCell roleId={role.id} permissionId={perm.id} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state o navegación */}
      {paginatedPermissions.length === 0 ? (
        <div className="py-12 text-center">
          <Filter className="w-12 h-12 mx-auto text-gh-text-muted/30 mb-3" />
          <p className="text-sm text-gh-text-muted">
            {searchTerm || categoryFilter !== 'all' || accessLevelFilter !== 'all' || roleFilter !== 'all'
              ? 'No se encontraron permisos con los filtros aplicados'
              : 'No hay permisos para mostrar'}
          </p>
        </div>
      ) : totalPages > 1 && (
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
    </div>
  )
}


