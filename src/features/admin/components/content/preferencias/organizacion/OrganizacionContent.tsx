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
  RefreshCw,
  Users
} from 'lucide-react'
import DialogoGenericoDinamico, { DialogTab } from '../../../DialogoGenericoDinamico'
import UsersTableInOrganization from '../../../UsersTableInOrganization'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import { useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useToast } from '@/components/providers/ToastProvider'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'
import { Organization, OrganizationNode } from '@/lib/types'
import { getLevelIcon, formatLevel, getLevelColor } from '@/lib/organizationHelper'

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
  const { logAction } = useAdminAudit()
  const { canView: canViewFn, canCreate: canCreateFn, canEdit: canEditFn, canDelete: canDeleteFn } = useAdminPermissions()
  
  const canRead = canViewFn('USERS') // Organizaciones están bajo el módulo de usuarios/seguridad
  const canWrite = canCreateFn('USERS')
  const canEdit = canEditFn('USERS')
  const canDelete = canDeleteFn('USERS')

  // Estado
  const [organizations, setOrganizations] = useState<OrganizationNode[]>([])
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([])
  const [hierarchyView, setHierarchyView] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialogo, setShowDialogo] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined)
  const [parentIdValue, setParentIdValue] = useState<string>('raiz')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [activeOrgTab, setActiveOrgTab] = useState<'datos' | 'usuarios'>('datos')
  const [orgUsersRefresh, setOrgUsersRefresh] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString())

  // Cargar organizaciones
  const loadOrganizations = useCallback(async () => {
    if (!canRead) {
      toast.error('No tienes permisos para ver organizaciones')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/organizations?includeHierarchy=${hierarchyView}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        const errorMessage = errorData?.error || `Error ${response.status}`
        console.error('[LoadOrganizations] API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      setOrganizations(data)
      setLastUpdated(new Date().toISOString())
      
      // Cargar también lista plana para selector de padre
      const allResponse = await fetch('/api/organizations?includeHierarchy=false')
      if (allResponse.ok) {
        const allData = await allResponse.json()
        setAllOrganizations(allData)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[LoadOrganizations] Error:', errorMsg)
      toast.error(`No se pudieron cargar las organizaciones: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [canRead, hierarchyView, toast])

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  // Inicializar parentIdValue cuando se abre el modal para editar
  useEffect(() => {
    if (editingOrg?.parentId) {
      setParentIdValue(editingOrg.parentId)
    } else {
      setParentIdValue('raiz')
    }
  }, [editingOrg])

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
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        pais: formData.pais
      }

      // Al editar, incluir parentId desde parentIdValue si está seleccionado
      if (editingOrg && parentIdValue && parentIdValue !== 'raiz') {
        organizationData.parentId = parentIdValue
      } else if (editingOrg && parentIdValue === 'raiz') {
        organizationData.parentId = null as any
      }

      // Al crear, incluir parentId si existe
      if (!editingOrg && selectedParentId && selectedParentId !== 'raiz') {
        organizationData.parentId = selectedParentId
      }

      // Al editar, incluir parentId del formulario si fue cambiado
      if (editingOrg && formData.parentId) {
        organizationData.parentId = formData.parentId === 'raiz' ? undefined : formData.parentId
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organizationData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const savedOrg = await response.json()
      
      // Auditoría
      logAction(
        editingOrg ? 'UPDATE' : 'CREATE',
        'USERS',
        editingOrg?.id || savedOrg.id,
        `${editingOrg ? 'Actualizada' : 'Creada'} organización: ${organizationData.nombre}`
      )
      
      toast.success(editingOrg ? 'Organización actualizada' : 'Organización creada')
      setShowDialogo(false)
      setEditingOrg(null)
      setSelectedParentId(undefined)
      setParentIdValue('raiz')
      await loadOrganizations()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar organización')
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
      
      // Auditoría
      logAction('DELETE', 'USERS', org.id, `Eliminada organización: ${org.nombre}`)
      
      toast.success('Organización eliminada')
      await loadOrganizations()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar organización')
    }
  }

  // Generar breadcrumb jerárquico solo de padres (sin la org actual)
  const getBreadcrumbPath = (org: Organization): Organization[] => {
    const path: Organization[] = []
    let current = org

    while (current.parentId) {
      const parent = allOrganizations.find(o => o.id === current.parentId)
      if (!parent) break
      path.unshift(parent)
      current = parent
    }

    return path
  }

  // Renderizar nodo del árbol con líneas conectoras modernas
  const renderNode = (node: OrganizationNode, level: number = 0, isLast: boolean = true, parentPath: boolean[] = []): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const currentPath = [...parentPath, !isLast]
    const indentWidth = 24 // píxeles por nivel

    return (
      <div key={node.id} className="relative">
        {/* Líneas verticales del árbol */}
        <div className="relative">
          {/* Líneas de los ancestros */}
          {level > 0 && (
            <div className="absolute left-0 top-0 bottom-0 flex pointer-events-none" style={{ width: `${level * indentWidth}px` }}>
              {currentPath.slice(0, -1).map((shouldHaveLine, idx) => (
                <div
                  key={idx}
                  className={`w-6 ${shouldHaveLine ? 'border-l border-gh-border/20' : ''}`}
                />
              ))}
            </div>
          )}

          {/* Nodo actual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group"
            style={{ paddingLeft: `${level * indentWidth}px` }}
          >
            {/* Rama horizontal + punto de conexión */}
            {level > 0 && (
              <div 
                className="absolute top-5 w-6 border-t border-gh-border/20 pointer-events-none"
                style={{ left: `${(level - 1) * indentWidth}px` }}
              >
                <div className="absolute w-1.5 h-1.5 bg-gh-border/30 rounded-full -top-1 -right-1" />
              </div>
            )}

            {/* Contenido: Chevron, Icono, Nombre, Badge, Acciones */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gh-bg-secondary/40 transition-all duration-150 relative z-10">
              {/* Botón expandir/contraer */}
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {hasChildren ? (
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedNodes)
                      if (isExpanded) newExpanded.delete(node.id)
                      else newExpanded.add(node.id)
                      setExpandedNodes(newExpanded)
                    }}
                    className="p-0 flex items-center justify-center hover:text-gh-accent transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 text-gh-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                ) : (
                  <div className="w-1 h-1 rounded-full bg-gh-border/20" />
                )}
              </div>

              {/* Contenido principal: Icono + Nombre + Nivel (primera línea) */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">{getLevelIcon(node.nivel as any)}</span>
                  <h4 className="text-sm font-medium text-gh-text truncate">{node.nombre}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap ${
                    node.nivel === 'RAIZ' ? 'bg-gh-accent/10 text-gh-accent' :
                    node.nivel === 'EMPRESA' ? 'bg-blue-500/10 text-blue-400' :
                    node.nivel === 'DEPARTAMENTO' ? 'bg-purple-500/10 text-purple-400' :
                    node.nivel === 'EQUIPO' ? 'bg-green-500/10 text-green-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {formatLevel(node.nivel as any)}
                  </span>
                </div>

                {/* Segunda línea: Sector | Usuarios | Cotizaciones */}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gh-text-muted">
                  <span className="flex items-center gap-1">
                    Sector: {node.sector || 'Sin sector'}
                  </span>
                  <span className="text-gh-border/50">/</span>
                  <span className="flex items-center gap-1">
                    Usuarios: {node._count?.users ?? 0}
                  </span>
                  <span className="text-gh-border/50">/</span>
                  <span className="flex items-center gap-1">
                    Cotizaciones: {node._count?.quotations ?? 0}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 ml-auto">
                {canWrite && (
                  <button
                    onClick={() => {
                      setEditingOrg(null)
                      setSelectedParentId(node.id)
                      setShowDialogo(true)
                    }}
                    className="p-1.5 rounded hover:bg-gh-success/10 transition-colors text-gh-text-muted hover:text-gh-success"
                    title="Crear hijo"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => {
                      setEditingOrg(node)
                      setSelectedParentId(node.parentId || undefined)
                      setShowDialogo(true)
                    }}
                    className="p-1.5 rounded hover:bg-gh-warning/10 transition-colors text-gh-text-muted hover:text-gh-warning"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(node)}
                    className="p-1.5 rounded hover:bg-gh-danger/10 transition-colors text-gh-text-muted hover:text-gh-danger"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Hijos */}
          {isExpanded && hasChildren && (
            <div className="relative">
              {node.children?.map((child, idx) =>
                renderNode(child, level + 1, idx === node.children!.length - 1, currentPath)
              )}
            </div>
          )}
        </div>
      </div>
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
      <SectionHeader
        title="Estructura Organizacional"
        description="Gestiona la jerarquía de organizaciones y sus relaciones"
        icon={<Building2 className="w-4 h-4" />}
        updatedAt={lastUpdated}
        onRefresh={loadOrganizations}
        isLoading={loading || refreshing}
        actions={
          <div className="flex items-center gap-2">
            {canWrite && (
              <button
                onClick={() => {
                  setEditingOrg(null)
                  setSelectedParentId(undefined)
                  setShowDialogo(true)
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Nueva (Raíz)
              </button>
            )}
          </div>
        }
      />

      {/* Controles */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gh-text-muted" />
          <input
            type="text"
            placeholder="Buscar organización..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-8 pr-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs text-gh-text placeholder-gh-text-muted focus:border-gh-accent/50 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setHierarchyView(!hierarchyView)}
          className="px-3 py-2 text-xs font-medium rounded-md border border-gh-border/30 bg-gh-bg-secondary hover:bg-gh-bg-tertiary transition-colors text-gh-text whitespace-nowrap"
        >
          {hierarchyView ? '📊 Árbol' : '📋 Lista'}
        </button>
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
        // Vista de árbol - Diseño limpio y profesional
        <div className="space-y-0 -mx-3 -my-2 px-3 py-2">
          {filteredOrgs.map((org, idx) => renderNode(org, 0, idx === filteredOrgs.length - 1, []))}
        </div>
      ) : (
        // Vista de lista con paginación
        <div className="space-y-1">
          {paginatedOrgs.map(org => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-gh-bg-secondary/40 transition-all duration-150"
            >
              <div className="w-4 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs flex-shrink-0">{getLevelIcon(org.nivel as any)}</span>
                  <h4 className="text-xs font-semibold text-gh-text truncate">{org.nombre}</h4>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gh-accent/5 text-gh-accent whitespace-nowrap flex-shrink-0">
                    {formatLevel(org.nivel as any)}
                  </span>
                </div>
                {/* Sector y jerarquía en la misma fila */}
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {org.sector && (
                    <p className="text-xs text-gh-text-muted">
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-gh-bg-secondary/60 text-gh-text-muted whitespace-nowrap">Sector:</span>{org.sector}</p>
                  )}
                  {/* Indicador de subordinación */}
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gh-bg-secondary/60 text-gh-text-muted whitespace-nowrap">
                    {org.parentId ? 'Subordinado a:' : 'Sin subordinación'}
                  </span>
                  {/* Breadcrumb de padres */}
                  {org.parentId && (
                    <span className="text-xs text-gh-text-muted">
                      {getBreadcrumbPath(org).map(item => item.nombre).join(' / ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                {canWrite && (
                  <button
                    onClick={() => {
                      setEditingOrg(null)
                      setSelectedParentId(org.id)
                      setShowDialogo(true)
                    }}
                    className="p-1 rounded hover:bg-gh-success/10 transition-colors text-gh-text-muted hover:text-gh-success"
                    title="Crear organización hija"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => {
                      setEditingOrg(org)
                      setSelectedParentId(org.parentId || undefined)
                      setShowDialogo(true)
                    }}
                    className="p-1 rounded hover:bg-gh-warning/10 transition-colors text-gh-text-muted hover:text-gh-warning"
                    title="Editar organización"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(org)}
                    className="p-1 rounded hover:bg-gh-danger/10 transition-colors text-gh-text-muted hover:text-gh-danger"
                    title="Eliminar organización"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

        <DialogoGenericoDinamico
          isOpen={showDialogo}
          size="xl"
          onClose={() => {
            setShowDialogo(false)
            setEditingOrg(null)
            setSelectedParentId(undefined)
            setParentIdValue('raiz')
            setActiveOrgTab('datos')
          }}
          title={editingOrg ? 'Editar Organización' : selectedParentId ? `Nueva Organización bajo ${allOrganizations.find(o => o.id === selectedParentId)?.nombre}` : 'Nueva Organización (Raíz)'}
          tabs={editingOrg ? [
            {
              id: 'datos',
              label: 'Datos',
              icon: Building2,
              content: (
                <form
                  id="org-edit-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSave({
                      nombre: (document.getElementById('nombre') as HTMLInputElement)?.value || '',
                      sector: (document.getElementById('sector') as HTMLInputElement)?.value || '',
                      parentId: (document.getElementById('parentId') as HTMLSelectElement)?.value,
                      descripcion: (document.getElementById('descripcion') as HTMLTextAreaElement)?.value || '',
                      email: (document.getElementById('email') as HTMLInputElement)?.value || '',
                      telefono: (document.getElementById('telefono') as HTMLInputElement)?.value || '',
                      direccion: (document.getElementById('direccion') as HTMLInputElement)?.value || '',
                      ciudad: (document.getElementById('ciudad') as HTMLInputElement)?.value || '',
                      pais: (document.getElementById('pais') as HTMLInputElement)?.value || ''
                    })
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gh-text mb-1">Nombre *</label>
                    <input
                      id="nombre"
                      type="text"
                      defaultValue={editingOrg?.nombre || ''}
                      placeholder="Nombre de la organización"
                      required
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gh-text mb-1">Sector *</label>
                    <input
                      id="sector"
                      type="text"
                      defaultValue={editingOrg?.sector || ''}
                      placeholder="Sector"
                      required
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gh-text mb-1">Organización Padre</label>
                    <DropdownSelect
                      id="parentId"
                      value={parentIdValue}
                      onChange={(value) => setParentIdValue(value)}
                      options={[
                        { value: 'raiz', label: 'Sin Padre (Raíz)' },
                        ...allOrganizations
                          .filter(org => org.id !== editingOrg?.id)
                          .map(org => ({
                            value: org.id,
                            label: `${org.nombre} (${formatLevel(org.nivel as any)})`
                          }))
                      ]}
                      placeholder="Seleccionar organización padre..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gh-text mb-1">Descripción</label>
                    <textarea
                      id="descripcion"
                      defaultValue={editingOrg?.descripcion || ''}
                      placeholder="Descripción"
                      rows={3}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gh-text mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      defaultValue={editingOrg?.email || ''}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gh-text mb-1">Teléfono</label>
                    <input
                      id="telefono"
                      type="text"
                      defaultValue={editingOrg?.telefono || ''}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gh-text mb-1">Dirección</label>
                    <input
                      id="direccion"
                      type="text"
                      defaultValue={editingOrg?.direccion || ''}
                      placeholder="Dirección"
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gh-text mb-1">Ciudad</label>
                      <input
                        id="ciudad"
                        type="text"
                        defaultValue={editingOrg?.ciudad || ''}
                        placeholder="Ciudad"
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gh-text mb-1">País</label>
                      <input
                        id="pais"
                        type="text"
                        defaultValue={editingOrg?.pais || ''}
                        placeholder="País"
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 outline-none transition"
                      />
                    </div>
                  </div>
                </form>
              )
            },
            {
              id: 'usuarios',
              label: 'Usuarios',
              icon: Users,
              content: editingOrg ? (
                <UsersTableInOrganization
                  organizationId={editingOrg.id}
                  onRefresh={async () => {
                    setOrgUsersRefresh(prev => prev + 1)
                    await loadOrganizations()
                  }}
                />
              ) : null
            }
          ] as DialogTab[] : undefined}
          activeTabId={activeOrgTab}
          onTabChange={(tabId) => setActiveOrgTab(tabId as 'datos' | 'usuarios')}
          actions={editingOrg ? [
            {
              id: 'cancel',
              label: 'Cancelar',
              variant: 'secondary' as const,
              onClick: () => {
                setShowDialogo(false)
                setEditingOrg(null)
                setActiveOrgTab('datos')
              }
            },
            {
              id: 'save',
              label: 'Guardar Cambios',
              variant: 'primary' as const,
              onClick: () => {
                const form = document.getElementById('org-edit-form') as HTMLFormElement
                if (form) {
                  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                }
              }
            }
          ] : undefined}
          contentType={!editingOrg ? 'form' : undefined}
          formConfig={!editingOrg ? {
            fields: [
              { id: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre de la organización', required: true, value: '' },
              { id: 'sector', label: 'Sector', type: 'text', placeholder: 'Sector', required: true, value: '' },
              ...(selectedParentId ? [{
                id: 'parentId',
                label: 'Organización Padre',
                type: 'select' as const,
                value: selectedParentId || '',
                options: allOrganizations.map(org => ({
                  value: org.id,
                  label: `${org.nombre} (${formatLevel(org.nivel as any)})`
                }))
              }] : []),
              { id: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción', value: '' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com', value: '' },
              { id: 'telefono', label: 'Teléfono', type: 'text', placeholder: '+1234567890', value: '' }
            ],
            onSubmit: handleSave
          } : undefined}
        />
    </div>
  )
}
