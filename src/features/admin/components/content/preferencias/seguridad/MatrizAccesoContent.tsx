'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutGrid, 
  Loader2,
  AlertCircle,
  X,
  Save,
  Check,
  Eye,
  Ban,
  RefreshCw
} from 'lucide-react'

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
    [permissionId: string]: 'full' | 'readonly' | 'none'
  }
}

// Categorías
const CATEGORIES = [
  { value: 'users', label: 'Usuarios', icon: '👥' },
  { value: 'quotations', label: 'Cotizaciones', icon: '📄' },
  { value: 'packages', label: 'Paquetes', icon: '📦' },
  { value: 'services', label: 'Servicios', icon: '🔧' },
  { value: 'config', label: 'Configuración', icon: '⚙️' },
  { value: 'security', label: 'Seguridad', icon: '🛡️' },
  { value: 'backups', label: 'Backups', icon: '💾' },
]

// ==================== COMPONENTE ====================

export default function MatrizAccesoContent() {
  // Estado
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [matrix, setMatrix] = useState<RolePermissionMap>({})
  const [originalMatrix, setOriginalMatrix] = useState<RolePermissionMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Filtro de categoría
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Cargar datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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
      const matrixData = await matrixRes.json()

      setRoles(rolesData)
      setPermissions(permissionsData)
      setMatrix(matrixData)
      setOriginalMatrix(JSON.parse(JSON.stringify(matrixData)))
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Detectar cambios
  useEffect(() => {
    const matrixStr = JSON.stringify(matrix)
    const originalStr = JSON.stringify(originalMatrix)
    setHasChanges(matrixStr !== originalStr)
  }, [matrix, originalMatrix])

  // Filtrar permisos por categoría
  const filteredPermissions = categoryFilter === 'all' 
    ? permissions 
    : permissions.filter(p => p.category === categoryFilter)

  // Agrupar permisos por categoría
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
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
    const levels: Array<'full' | 'readonly' | 'none'> = ['none', 'readonly', 'full']
    const currentIndex = levels.indexOf(currentLevel)
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
      
      const res = await fetch('/api/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matrix),
      })
      
      if (!res.ok) throw new Error('Error al guardar')
      
      setOriginalMatrix(JSON.parse(JSON.stringify(matrix)))
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
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
      readonly: { 
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

    const { icon: Icon, bg, text, border } = config[level]

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-gh-accent" />
            Matriz de Acceso
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Configura los permisos de cada rol
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de cambios */}
          {hasChanges && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] text-gh-warning px-2 py-0.5 bg-gh-warning/10 rounded-full"
            >
              Cambios sin guardar
            </motion.span>
          )}

          {/* Botón descartar */}
          {hasChanges && (
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Descartar
            </button>
          )}

          {/* Botón guardar */}
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
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-[10px] text-gh-text-muted">
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gh-success/20 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-gh-success" />
          </div>
          Acceso total
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gh-accent/20 flex items-center justify-center">
            <Eye className="w-2.5 h-2.5 text-gh-accent" />
          </div>
          Solo lectura
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gh-text-muted/10 flex items-center justify-center">
            <Ban className="w-2.5 h-2.5 text-gh-text-muted/40" />
          </div>
          Sin acceso
        </span>
      </div>

      {/* Filtro de categoría */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2 py-1 rounded text-[10px] transition-colors ${
            categoryFilter === 'all' 
              ? 'bg-gh-accent/20 text-gh-accent' 
              : 'text-gh-text-muted hover:bg-gh-bg-tertiary'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-2 py-1 rounded text-[10px] transition-colors ${
              categoryFilter === cat.value 
                ? 'bg-gh-accent/20 text-gh-accent' 
                : 'text-gh-text-muted hover:bg-gh-bg-tertiary'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
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
    </div>
  )
}


