'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Upload, 
  Trash2, 
  Clock, 
  AlertCircle,
  Loader2,
  Settings,
  Plus,
  Lock,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check
} from 'lucide-react'
import { useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'
import DialogoGenericoDinamico from '../../../DialogoGenericoDinamico'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'

// ==================== TIPOS ====================

interface Backup {
  id: string
  userId: string
  nombre: string
  descripcion: string | null
  tipo: string
  version: string | null
  size: number | null
  estado: string
  errorMessage: string | null
  createdAt: string
  expiresAt: string | null
  User?: {
    username: string
    nombre: string | null
  }
}

interface BackupConfig {
  id: string
  userId: string
  autoBackupEnabled: boolean
  autoBackupFrequency: string
  autoBackupRetention: number
  notifyOnBackup: boolean
  notifyOnRestore: boolean
  lastAutoBackup: string | null
  nextAutoBackup: string | null
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function BackupContent() {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn, canCreate: canCreateFn, canDelete: canDeleteFn, canView: canViewFn } = useAdminPermissions()
  
  const canEdit = canEditFn('BACKUPS')
  const canCreate = canCreateFn('BACKUPS')
  const canDelete = canDeleteFn('BACKUPS')
  const canView = canViewFn('BACKUPS')
  const canManage = canEditFn('BACKUPS')
  
  // Estado principal
  const [backups, setBackups] = useState<Backup[]>([])
  const [config, setConfig] = useState<BackupConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString())
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<'all' | 'manual' | 'auto'>('all')
  const [filterEstado, setFilterEstado] = useState<'all' | 'completado' | 'error' | 'en_progreso'>('all')
  
  // Paginación
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  // Cargar datos
  const loadBackups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/backups')
      if (!res.ok) throw new Error('Error al cargar backups')
      const data = await res.json()
      if (data.success) {
        setBackups(data.data || [])
        setLastUpdated(new Date().toISOString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadConfig = useCallback(async () => {
    if (!canManage) return
    
    try {
      const res = await fetch('/api/backup-config')
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setConfig(data.data)
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }, [canManage])

  useEffect(() => {
    loadBackups()
    loadConfig()
  }, [loadBackups, loadConfig])

  // Filtrar backups
  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         backup.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = filterTipo === 'all' || backup.tipo === filterTipo
    const matchesEstado = filterEstado === 'all' || backup.estado === filterEstado
    return matchesSearch && matchesTipo && matchesEstado
  })

  // Paginar backups
  const totalItems = filteredBackups.length
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage)
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage
  const endIndex = itemsPerPage === 'all' ? totalItems : startIndex + itemsPerPage
  const paginatedBackups = filteredBackups.slice(startIndex, endIndex)

  // Reset página cuando cambia filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterTipo, filterEstado, itemsPerPage])

  // ✅ Control de acceso
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Lock className="w-16 h-16 text-gh-text-muted/40" />
        <p className="text-gh-text-muted">No tienes permiso para ver backups</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gh-accent" />
      </div>
    )
  }

  // Crear backup
  const handleCreateBackup = async (formData?: any) => {
    if (!canCreate) return
    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData?.nombre || 'Backup Manual',
          descripcion: formData?.descripcion || 'Backup creado manualmente',
          tipo: formData?.tipo || 'manual'
        })
      })

      const data = await res.json()
      if (data.success) {
        // Audit log
        logAction('CREATE', 'BACKUPS', data.data?.id || 'new', formData?.nombre || 'Backup Manual')
        
        await loadBackups()
        setShowCreateModal(false)
      } else {
        setError(data.error || 'Error al crear backup')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear backup')
    }
  }

  // Restaurar backup
  const handleRestoreBackup = async (backupId: string) => {
    if (!canEdit) return
    if (!confirm('¿Estás seguro de que deseas restaurar este backup? Esta acción sobrescribirá tus datos actuales.')) {
      return
    }

    setIsRestoring(true)
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId })
      })

      const data = await res.json()
      if (data.success) {
        // Audit log
        logAction('EXECUTE', 'BACKUPS', backupId, 'Restore Backup')
        
        alert('Backup restaurado exitosamente. Recarga la página para ver los cambios.')
        await loadBackups()
      } else {
        setError(data.error || 'Error al restaurar backup')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restaurar backup')
    } finally {
      setIsRestoring(false)
    }
  }

  // Eliminar backup
  const handleDeleteBackup = async (backupId: string) => {
    if (!canDelete) return
    if (!confirm('¿Estás seguro de que deseas eliminar este backup?')) {
      return
    }

    try {
      const res = await fetch(`/api/backups/${backupId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (data.success) {
        // Audit log
        logAction('DELETE', 'BACKUPS', backupId, 'Delete Backup')
        
        await loadBackups()
      } else {
        setError(data.error || 'Error al eliminar backup')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar backup')
    }
  }

  // Actualizar configuración
  const handleUpdateConfig = async (newConfig: Partial<BackupConfig>) => {
    if (!canManage) return
    try {
      const res = await fetch('/api/backup-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })

      const data = await res.json()
      if (data.success) {
        // Audit log
        logAction('UPDATE', 'BACKUPS', 'config', 'Backup Configuration', {
          before: config,
          after: newConfig
        })
        
        setConfig(data.data)
        setShowConfigModal(false)
      } else {
        setError(data.error || 'Error al actualizar configuración')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración')
    }
  }

  // Formatear tamaño
  const formatSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Formatear fecha
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatear frecuencia
  const getFrequencyLabel = (frequency: string): string => {
    if (frequency === 'daily') return 'Diaria'
    if (frequency === 'weekly') return 'Semanal'
    return 'Mensual'
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Backups y Restauración"
        description="Gestiona copias de seguridad de tus datos"
        icon={<Database className="w-4 h-4" />}
        updatedAt={lastUpdated}
        actions={
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-bg-secondary text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors text-xs font-medium"
              >
                <Settings className="w-3.5 h-3.5" />
                Configurar
              </button>
            )}
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear Backup
              </button>
            )}
          </div>
        }
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

      {/* Sección: Estado de Backups Automáticos */}
      {config && (
        <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${config.autoBackupEnabled ? 'bg-gh-success animate-pulse' : 'bg-gh-text-muted/40'}`}></div>
                  <h5 className="text-xs font-semibold text-gh-text">
                    Backups Automáticos {config.autoBackupEnabled ? 'Habilitados' : 'Deshabilitados'}
                  </h5>
                </div>
                {config.autoBackupEnabled ? (
                  <p className="text-[10px] text-gh-text-muted">
                    Frecuencia: <span className="text-gh-success font-medium">{getFrequencyLabel(config.autoBackupFrequency)}</span> • 
                    Retención: <span className="text-gh-success font-medium">{config.autoBackupRetention} días</span>
                    {config.nextAutoBackup && (
                      <> • Próximo: <span className="text-gh-success font-medium">{formatDate(config.nextAutoBackup)}</span></>
                    )}
                  </p>
                ) : (
                  <p className="text-[10px] text-gh-text-muted">
                    Configura backups automáticos para proteger tus datos regularmente
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-8 pr-3 py-1.5 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
          />
        </div>

        {/* Filtros */}
        <button
          onClick={() => setFilterTipo(filterTipo === 'manual' ? 'all' : 'manual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
            filterTipo === 'manual'
              ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30'
              : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30 hover:bg-gh-bg-tertiary'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setFilterTipo(filterTipo === 'auto' ? 'all' : 'auto')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
            filterTipo === 'auto'
              ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30'
              : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30 hover:bg-gh-bg-tertiary'
          }`}
        >
          Auto
        </button>
        <button
          onClick={() => setFilterEstado(filterEstado === 'completado' ? 'all' : 'completado')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
            filterEstado === 'completado'
              ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30'
              : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30 hover:bg-gh-bg-tertiary'
          }`}
        >
          Completado
        </button>
        <button
          onClick={() => setFilterEstado(filterEstado === 'error' ? 'all' : 'error')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
            filterEstado === 'error'
              ? 'bg-gh-accent/10 text-gh-accent border-gh-accent/30'
              : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30 hover:bg-gh-bg-tertiary'
          }`}
        >
          Error
        </button>
      </div>

      {/* Paginación */}
      <ItemsPerPageSelector
        value={itemsPerPage}
        onChange={setItemsPerPage}
        total={filteredBackups.length}
      />

      {/* Lista de Backups */}
      {filteredBackups.length === 0 ? (
        <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg p-12 text-center">
          <Database className="w-12 h-12 text-gh-text-muted mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gh-text mb-2">
            {searchTerm || filterTipo !== 'all' || filterEstado !== 'all' ? 'No se encontraron backups' : 'No hay backups'}
          </h3>
          <p className="text-xs text-gh-text-muted mb-4">
            {searchTerm || filterTipo !== 'all' || filterEstado !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea tu primer backup para comenzar a proteger tus datos'
            }
          </p>
          {canCreate && !searchTerm && filterTipo === 'all' && filterEstado === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-xs"
            >
              Crear Primer Backup
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Lista de backups */}
          <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
            <div className="divide-y divide-gh-border/10">
              {paginatedBackups.map((backup, index) => (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gh-bg-tertiary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Indicador tipo */}
                    <div className={`
                      w-6 h-6 rounded-md flex items-center justify-center
                      ${backup.tipo === 'manual'
                        ? 'bg-gh-accent/10 text-gh-accent'
                        : 'bg-gh-success/10 text-gh-success'
                      }
                    `}>
                      <Database className="w-3 h-3" />
                    </div>
                    
                    {/* Info */}
                    <div>
                      <div className="text-xs font-medium text-gh-text">{backup.nombre}</div>
                      <div className="text-[10px] text-gh-text-muted">
                        {formatDate(backup.createdAt)} • {backup.size ? formatSize(backup.size) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Estado */}
                    {/* Estado Badge */}
                    {(() => {
                      const getStatusClass = (estado: string) => {
                        if (estado === 'completado') return 'bg-gh-success/10 text-gh-success'
                        if (estado === 'error') return 'bg-gh-danger/10 text-gh-danger-emphasis'
                        return 'bg-yellow-500/10 text-yellow-500'
                      }
                      
                      return (
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                          ${getStatusClass(backup.estado)}
                        `}>
                          {backup.estado === 'completado' && <Check className="w-3 h-3" />}
                          {backup.estado === 'error' && <X className="w-3 h-3" />}
                          {backup.estado !== 'completado' && backup.estado !== 'error' && <Clock className="w-3 h-3" />}
                        </span>
                      )
                    })()}

                    {/* Acciones */}
                    {canEdit && backup.estado === 'completado' && (
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={isRestoring}
                        className="p-1 rounded transition-colors text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10"
                        title="Restaurar"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="p-1 rounded transition-colors text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

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
        </>
      )}

      {/* Modal Crear Backup - Usando DialogoGenericoDinamico */}
      <DialogoGenericoDinamico
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Backup"
        description="Puedes restaurarlos en cualquier momento."
        size="xl"
        type="info"
        contentType="form"
        formConfig={{
          fields: [
            {
              id: 'nombre',
              type: 'text',
              label: 'Nombre del Backup',
              placeholder: 'Ej: Backup Mensual Enero 2025',
              required: true,
              value: ''
            },
            {
              id: 'tipo',
              type: 'select',
              label: 'Tipo de Backup',
              required: true,
              value: 'manual',
              options: [
                { label: 'Manual', value: 'manual' },
                { label: 'Automático', value: 'auto' }
              ]
            },
            {
              id: 'descripcion',
              type: 'textarea',
              label: 'Descripción (opcional)',
              placeholder: 'Descripción del backup...',
              value: ''
            }
          ],
          onSubmit: handleCreateBackup
        }}
      />

{/* Modal Configuración - Usando DialogoGenericoDinamico con custom content */}
      {config && (
        <DialogoGenericoDinamico
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          title="Configuración de Backups"
          description="Configura backups automáticos, retención y notificaciones"
          size="xl"
          type="info"
          contentType="custom"
          content={
            <div className="space-y-4">
              {/* Toggle para habilitar/deshabilitar */}
              <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-md">
                <div>
                  <p className="text-xs font-medium text-gh-text">Backups Automáticos</p>
                  <p className="text-[10px] text-gh-text-muted mt-0.5">Crear backups automáticamente según programación</p>
                </div>
                <label htmlFor="auto-backup-toggle" aria-label="Habilitar backups automáticos" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="auto-backup-toggle"
                    type="checkbox"
                    checked={config.autoBackupEnabled}
                    onChange={(e) => setConfig({ ...config, autoBackupEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gh-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gh-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gh-success/50"></div>
                </label>
              </div>

              {config.autoBackupEnabled && (
                <>
                  {/* Seleccionar frecuencia */}
                  <div>
                    <label htmlFor="frequency-config" className="block text-xs font-medium text-gh-text mb-2">
                      Frecuencia de Backups
                    </label>
                    <select
                      id="frequency-config"
                      value={config.autoBackupFrequency}
                      onChange={(e) => setConfig({ ...config, autoBackupFrequency: e.target.value })}
                      className="w-full px-3 py-2 bg-gh-bg text-gh-text border border-gh-border/30 rounded-md text-xs font-medium focus:border-gh-success/50 focus:ring-1 focus:ring-gh-success/20 outline-none transition"
                    >
                      <option value="daily">Diaria</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>

                  {/* Retención de backups */}
                  <div>
                    <label htmlFor="retention-config" className="block text-xs font-medium text-gh-text mb-2">
                      Retención de Backups: <span className="text-gh-success">{config.autoBackupRetention} días</span>
                    </label>
                    <input
                      id="retention-config"
                      type="range"
                      min="1"
                      max="730"
                      value={config.autoBackupRetention}
                      onChange={(e) => setConfig({ ...config, autoBackupRetention: Number.parseInt(e.target.value, 10) })}
                      className="w-full h-2 bg-gh-border/30 rounded-lg appearance-none cursor-pointer accent-gh-success"
                    />
                    <p className="text-[10px] text-gh-text-muted mt-1">
                      Los backups se eliminarán automáticamente después de {config.autoBackupRetention} días
                    </p>
                  </div>

                  {/* Notificaciones */}
                  <div className="border-t border-gh-border/20 pt-3">
                    <p className="text-xs font-medium text-gh-text mb-2.5">Notificaciones</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gh-bg/50 rounded-md">
                        <label htmlFor="notify-backup" className="text-xs text-gh-text cursor-pointer">Al crear backup</label>
                        <label htmlFor="notify-backup" className="relative inline-flex items-center cursor-pointer" aria-label="Notificar al crear backup">
                          <input
                            id="notify-backup"
                            type="checkbox"
                            checked={config.notifyOnBackup}
                            onChange={(e) => setConfig({ ...config, notifyOnBackup: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gh-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gh-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gh-success/50"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gh-bg/50 rounded-md">
                        <label htmlFor="notify-restore" className="text-xs text-gh-text cursor-pointer">Al restaurar</label>
                        <label htmlFor="notify-restore" className="relative inline-flex items-center cursor-pointer" aria-label="Notificar al restaurar">
                          <input
                            id="notify-restore"
                            type="checkbox"
                            checked={config.notifyOnRestore}
                            onChange={(e) => setConfig({ ...config, notifyOnRestore: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gh-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gh-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gh-success/50"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          }
          actions={[
            {
              id: 'cancel',
              label: 'Cancelar',
              variant: 'secondary',
              onClick: () => setShowConfigModal(false),
            },
            {
              id: 'save',
              label: 'Guardar',
              variant: 'primary',
              onClick: () => handleUpdateConfig({
                autoBackupEnabled: config.autoBackupEnabled,
                autoBackupFrequency: config.autoBackupFrequency,
                autoBackupRetention: config.autoBackupRetention,
                notifyOnBackup: config.notifyOnBackup,
                notifyOnRestore: config.notifyOnRestore,
              } as any),
            },
          ]}
        />
      )}
    </div>
  )
}
