'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw
} from 'lucide-react'
import DialogoGenericoDinamico from '../../../DialogoGenericoDinamico'
import { usePermission } from '@/hooks'
import { useToast } from '@/components/providers/ToastProvider'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'
import { Organization, OrganizationNode } from '@/lib/types'

// ==================== TIPOS ====================

interface OrganizationFormData {
  nombre: string
  sector: string
  descripcion?: string
  parentId?: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  pais?: string
}

// ==================== COMPONENTE ====================

export default function OrganizacionContent() {
  const toast = useToast()
  const canRead = usePermission('org.view')
  const canWrite = usePermission('org.create')
  const canEdit = usePermission('org.update')
  const canDelete = usePermission('org.delete')

  // Estado
  const [organizations, setOrganizations] = useState<OrganizationNode[]>([])
  const [hierarchyView, setHierarchyView] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialogo, setShowDialogo] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  // Cargar organizaciones
  const loadOrganizations = useCallback(async () => {
    if (!canRead) {
      toast.error('No tienes permisos para ver organizaciones')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/organizations?includeHierarchy=${hierarchyView}`)
      if (!response.ok) throw new Error('Error al cargar organizaciones')
      const data = await response.json()
      setOrganizations(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar organizaciones')
    } finally {
      setLoading(false)
    }
  }, [canRead, hierarchyView, toast])

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  // Crear/Actualizar
  const handleSave = async (formData: Record<string, any>) => {
    if (!canWrite && !canEdit) {
      toast.error('No tienes permisos para esta acción')
      return
    }

    try {
      const method = editingOrg ? 'PUT' : 'POST'
      const url = editingOrg ? `/api/organizations/${editingOrg.id}` : '/api/organizations'

      // Transformar formData a OrganizationFormData
      const organizationData: Partial<OrganizationFormData> = {
        nombre: formData.nombre || '',
        sector: formData.sector || '',
        descripcion: formData.descripcion,
        email: formData.email,
        telefono: formData.telefono,
        parentId: formData.parentId
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organizationData)
      })

      if (!response.ok) throw new Error('Error al guardar')
      
      toast.success(editingOrg ? 'Organización actualizada' : 'Organización creada')
      setShowDialogo(false)
      setEditingOrg(null)
      await loadOrganizations()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar organización')
    }
  }

  // Eliminar
  const handleDelete = async (org: Organization) => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar')
      return
    }

    if (!confirm('¿Eliminar esta organización?')) return

    try {
      const response = await fetch(`/api/organizations/${org.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar')
      toast.success('Organización eliminada')
      await loadOrganizations()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar organización')
    }
  }

  // Renderizar nodo del árbol
  const renderNode = (node: OrganizationNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-2"
      >
        <div
          className="flex items-center gap-2 px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors"
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => {
                const newExpanded = new Set(expandedNodes)
                if (isExpanded) newExpanded.delete(node.id)
                else newExpanded.add(node.id)
                setExpandedNodes(newExpanded)
              }}
              className="p-0.5 hover:bg-gh-bg-tertiary rounded"
            >
              <ChevronRight className={`w-3.5 h-3.5 text-gh-info transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
          {!hasChildren && <div className="w-3.5" />}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gh-text truncate">{node.nombre}</p>
            <p className="text-xs text-gh-text-muted">{node.sector}</p>
          </div>

          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={() => {
                  setEditingOrg(node)
                  setShowDialogo(true)
                }}
                className="p-1 hover:bg-gh-info/20 text-gh-info rounded transition-colors"
                title="Editar"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDelete(node)}
                className="p-1 hover:bg-gh-danger/20 text-gh-danger rounded transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-2">
            {node.children?.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </motion.div>
    )
  }

  const filteredOrgs = organizations.filter(org =>
    org.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginación para vista plana
  const flatOrgs = organizations.filter(org =>
    org.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(flatOrgs.length / itemsPerPage)
  const paginatedOrgs = flatOrgs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gh-text flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gh-info" />
            Estructura Organizacional
          </h3>
          <p className="text-xs text-gh-text-muted mt-1">
            Gestiona la jerarquía de tu organización
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <button
              onClick={() => {
                setEditingOrg(null)
                setShowDialogo(true)
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gh-success text-white rounded-md text-xs font-medium hover:bg-gh-success/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva
            </button>
          )}
          <button
            onClick={async () => {
              setRefreshing(true)
              await loadOrganizations()
              setRefreshing(false)
            }}
            disabled={refreshing}
            className="p-2 hover:bg-gh-bg-secondary rounded transition-colors disabled:opacity-50"
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 text-gh-text-muted ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gh-text-muted" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-8 pr-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs text-gh-text placeholder-gh-text-muted focus:border-gh-info focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gh-text-muted">Ver:</span>
          <button
            onClick={() => setHierarchyView(!hierarchyView)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              hierarchyView
                ? 'bg-gh-info border-gh-info text-white'
                : 'bg-gh-bg-secondary border-gh-border/30 text-gh-text'
            }`}
          >
            {hierarchyView ? 'Árbol' : 'Lista'}
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-gh-info animate-spin" />
        </div>
      ) : organizations.length === 0 ? (
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-center">
          <AlertCircle className="w-5 h-5 text-gh-warning mx-auto mb-2" />
          <p className="text-xs text-gh-text-muted">No hay organizaciones</p>
        </div>
      ) : hierarchyView ? (
        // Vista de árbol
        <div className="space-y-2 max-h-96 overflow-y-auto p-2 bg-gh-bg-secondary/50 border border-gh-border/30 rounded-md">
          {filteredOrgs.map(org => renderNode(org))}
        </div>
      ) : (
        // Vista de lista con paginación
        <div className="space-y-2">
          {paginatedOrgs.map(org => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gh-text truncate">{org.nombre}</p>
                <p className="text-xs text-gh-text-muted">{org.sector}</p>
              </div>

              <div className="flex items-center gap-1">
                {canEdit && (
                  <button
                    onClick={() => {
                      setEditingOrg(org)
                      setShowDialogo(true)
                    }}
                    className="p-1 hover:bg-gh-info/20 text-gh-info rounded transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(org)}
                    className="p-1 hover:bg-gh-danger/20 text-gh-danger rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <ItemsPerPageSelector
                value={itemsPerPage}
                onChange={(newVal) => {
                  setItemsPerPage(newVal as number)
                  setCurrentPage(1)
                }}
                total={organizations.length}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gh-text-muted">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diálogo */}
      {showDialogo && (
        <DialogoGenericoDinamico
          isOpen={showDialogo}
          onClose={() => {
            setShowDialogo(false)
            setEditingOrg(null)
          }}
          title={editingOrg ? 'Editar Organización' : 'Nueva Organización'}
          contentType="form"
          formConfig={{
            fields: [
              { id: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre de la organización', required: true, value: editingOrg?.nombre || '' },
              { id: 'sector', label: 'Sector', type: 'text', placeholder: 'Sector', required: true, value: editingOrg?.sector || '' },
              { id: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción', value: editingOrg?.descripcion || '' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com', value: editingOrg?.email || '' },
              { id: 'telefono', label: 'Teléfono', type: 'text', placeholder: '+1234567890', value: editingOrg?.telefono || '' }
            ],
            onSubmit: handleSave
          }}
        />
      )}
    </div>
  )
}
