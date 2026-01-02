'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Search, 
  Loader2,
  AlertCircle,
  X,
  Download,
  Filter,
  Calendar,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'
import DatePicker from '@/components/ui/DatePicker'
import DialogoGenericoDinamico, { DialogFormField } from '@/features/admin/components/DialogoGenericoDinamico'
import { useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAuditConfigStore } from '@/stores'

// ==================== TIPOS ====================

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string | null
  userId: string | null
  userName: string
  details: Record<string, any> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface PaginationInfo {
  total: number
  page: number
  pageSize: number | 'all'
  totalPages: number
}

// Acciones con labels
const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  // Auth
  'LOGIN_SUCCESS': { label: 'Inicio de sesión exitoso', color: 'text-gh-success' },
  'LOGIN_FAILED': { label: 'Intento de inicio fallido', color: 'text-gh-danger' },
  'LOGOUT': { label: 'Cierre de sesión', color: 'text-gh-text-muted' },
  
  // Users
  'USER_CREATED': { label: 'Usuario creado', color: 'text-gh-success' },
  'USER_UPDATED': { label: 'Usuario actualizado', color: 'text-gh-accent' },
  'USER_DELETED': { label: 'Usuario eliminado', color: 'text-gh-danger' },
  'PASSWORD_CHANGED': { label: 'Contraseña cambiada', color: 'text-gh-warning' },
  
  // Quotations
  'QUOTATION_CREATED': { label: 'Cotización creada', color: 'text-gh-success' },
  'QUOTATION_UPDATED': { label: 'Cotización actualizada', color: 'text-gh-accent' },
  'QUOTATION_DELETED': { label: 'Cotización eliminada', color: 'text-gh-danger' },
  
  // Snapshots
  'SNAPSHOT_CREATED': { label: 'Snapshot creado', color: 'text-gh-success' },
  'SNAPSHOT_UPDATED': { label: 'Snapshot actualizado', color: 'text-gh-accent' },
  'SNAPSHOT_DELETED': { label: 'Snapshot eliminado', color: 'text-gh-danger' },
  
  // Backups
  'BACKUP_CREATED': { label: 'Backup creado', color: 'text-gh-success' },
  'BACKUP_RESTORED': { label: 'Backup restaurado', color: 'text-gh-accent' },
  'BACKUP_DELETED': { label: 'Backup eliminado', color: 'text-gh-danger' },
  
  // Legacy actions (para compatibilidad)
  'role.created': { label: 'Rol creado', color: 'text-gh-success' },
  'role.updated': { label: 'Rol actualizado', color: 'text-gh-accent' },
  'role.deleted': { label: 'Rol eliminado', color: 'text-gh-danger' },
  'permission.created': { label: 'Permiso creado', color: 'text-gh-success' },
  'permission.updated': { label: 'Permiso actualizado', color: 'text-gh-accent' },
  'permission.deleted': { label: 'Permiso eliminado', color: 'text-gh-danger' },
  'user.created': { label: 'Usuario creado', color: 'text-gh-success' },
  'user.updated': { label: 'Usuario actualizado', color: 'text-gh-accent' },
  'user.deleted': { label: 'Usuario eliminado', color: 'text-gh-danger' },
  'user.login': { label: 'Inicio de sesión', color: 'text-gh-accent' },
  'user.logout': { label: 'Cierre de sesión', color: 'text-gh-text-muted' },
  'matrix.updated': { label: 'Matriz actualizada', color: 'text-gh-accent' },
  'user_permission.granted': { label: 'Permiso concedido', color: 'text-gh-success' },
  'user_permission.revoked': { label: 'Permiso revocado', color: 'text-gh-danger' },
  'system.migration.roles': { label: 'Migración de roles', color: 'text-gh-warning' },
}

// ==================== COMPONENTE ====================

export default function LogsAuditoriaContent() {
  const { logAction } = useAdminAudit()
  const { canView: canViewFn, canExport: canExportFn, canEdit: canEditFn } = useAdminPermissions()
  
  const canView = canViewFn('AUDIT')
  const canExport = canExportFn('AUDIT')
  const canManage = canEditFn('AUDIT')

  // Zustand store para configuración de auditoría
  const { retentionDays, loadConfig } = useAuditConfigStore()
  
  // Estado
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString())
  
  // Paginación
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Diálogos
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [purgeLoading, setPurgeLoading] = useState(false)
  const [reportFormData, setReportFormData] = useState({ period: 'monthly', customStart: '', customEnd: '' })
  const [purgeConfirmed, setPurgeConfirmed] = useState(false)

  // Cargar logs (carga completa en cliente, paginación local)
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir parámetros con filtros
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (entityFilter !== 'all') params.set('entityType', entityFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      // Parámetro limit muy alto para obtener TODOS los logs sin paginación servidor
      params.set('limit', '10000')

      // Cargar TODOS los logs
      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar logs')
      
      const data = await res.json()
      setLogs(data.logs || [])
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, actionFilter, entityFilter, dateFrom, dateTo])

  // Cargar logs al montar el componente
  useEffect(() => {
    // Cargar configuración de auditoría del store
    loadConfig()
    // Cargar logs
    fetchLogs()
  }, [fetchLogs, loadConfig])

  // Reset a página 1 al cambiar filtros o itemsPerPage
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, actionFilter, entityFilter, dateFrom, dateTo, itemsPerPage])

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setActionFilter('all')
    setEntityFilter('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  // Exportar a CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (entityFilter !== 'all') params.set('entityType', entityFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      params.set('format', 'csv')

      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      if (!res.ok) throw new Error('No tiene permisos para exportar. Contacte con el administrador')

      const blob = await res.blob()
      const url = globalThis.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      globalThis.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar')
    }
  }

  // Generar reporte
  const handleGenerateReport = async (formData: Record<string, any>) => {
    try {
      setReportLoading(true)
      setError(null)

      const payload: Record<string, any> = {
        period: formData.period || 'monthly',
      }

      // Si elige custom range
      if (formData.period === 'custom' && formData.customStart && formData.customEnd) {
        payload.dateFrom = formData.customStart
        payload.dateTo = formData.customEnd
      }

      const res = await fetch('/api/audit-config/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Error al generar reporte')

      const blob = await res.blob()
      const url = globalThis.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-report-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      globalThis.URL.revokeObjectURL(url)
      a.remove()

      setReportDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar reporte')
    } finally {
      setReportLoading(false)
    }
  }

  // Purgar logs
  const handlePurgeSubmit = async () => {
    if (!purgeConfirmed) {
      setError('Debe confirmar la acción de purga')
      return
    }

    try {
      setPurgeLoading(true)
      setError(null)

      const res = await fetch('/api/cron/audit-purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) throw new Error('Error al purgar logs')

      const data = await res.json()
      setError(`Purga completada: ${data.deleted || 0} logs eliminados`)
      setPurgeDialogOpen(false)
      setPurgeConfirmed(false)
      
      // Recargar logs
      await fetchLogs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al purgar')
    } finally {
      setPurgeLoading(false)
    }
  }

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Obtener label de acción
  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || { label: action, color: 'text-gh-text' }
  }

  // Entidades y acciones únicas para filtros
  const uniqueEntities = [...new Set(logs.map(l => l.entityType))]
  const uniqueActions = [...new Set(logs.map(l => l.action))]

  // Paginar logs (slice cliente)
  const paginatedLogs = itemsPerPage === 'all' 
    ? logs 
    : logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = itemsPerPage === 'all' 
    ? 1 
    : Math.ceil(logs.length / itemsPerPage)

  // ==================== RENDER ====================

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Logs de Auditoría"
        description="Historial de cambios en el sistema"
        icon={<FileText className="w-4 h-4" />}
        updatedAt={lastUpdated}
        actions={
          <div className="flex items-center gap-2">
            {/* Refrescar */}
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Generar Reporte */}
            {canManage && (
              <button
                onClick={() => setReportDialogOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors text-xs font-medium"
              >
                <FileText className="w-3.5 h-3.5" />
                Generar Reporte
              </button>
            )}

            {/* Purgar Logs */}
            {canManage && (
              <button
                onClick={() => setPurgeDialogOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-danger/10 text-gh-danger border border-gh-danger/30 rounded-md hover:bg-gh-danger/20 transition-colors text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purgar Logs
              </button>
            )}

            {/* Exportar */}
            {canExport && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-accent/10 text-gh-accent border border-gh-accent/30 rounded-md hover:bg-gh-accent/20 transition-colors text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
            )}
          </div>
        }
      />

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gh-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario..."
            className="w-full pl-8 pr-3 py-1.5 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs text-gh-text placeholder:text-gh-text-muted focus:outline-none focus:ring-1 focus:ring-gh-accent"
          />
        </div>

        {/* Filtro Acción */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gh-text-muted" />
          <DropdownSelect
            value={actionFilter}
            onChange={(val) => setActionFilter(val)}
            options={[
              { value: 'all', label: 'Todas las acciones' },
              ...uniqueActions.map(action => ({
                value: action,
                label: getActionLabel(action).label
              }))
            ]}
            className="flex-1"
          />
        </div>

        {/* Filtro Entidad */}
        <DropdownSelect
          value={entityFilter}
          onChange={(val) => setEntityFilter(val)}
          options={[
            { value: 'all', label: 'Todas las entidades' },
            ...uniqueEntities.map(entity => ({
              value: entity,
              label: entity
            }))
          ]}
        />

        {/* Fechas */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gh-text-muted" />
          <DatePicker
            value={dateFrom || null}
            onChange={(iso) => setDateFrom(iso || '')}
            className="w-36"
          />
          <span className="text-xs text-gh-text-muted">a</span>
          <DatePicker
            value={dateTo || null}
            onChange={(iso) => setDateTo(iso || '')}
            className="w-36"
          />
        </div>

        {/* Botón limpiar filtros */}
        {(searchTerm || actionFilter !== 'all' || entityFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gh-text-muted hover:text-gh-text-primary border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* ItemsPerPageSelector */}
      <ItemsPerPageSelector
        value={itemsPerPage}
        onChange={(value) => setItemsPerPage(value)}
        total={logs.length}
        displayed={paginatedLogs.length}
        className="w-fit"
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

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-gh-accent animate-spin" />
          <span className="ml-2 text-xs font-medium text-gh-text-muted">Cargando logs...</span>
        </div>
      ) : (
        <>
          {/* Tabla de logs */}
          <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gh-border/20 bg-gh-bg-tertiary/30">
                  <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium">Fecha</th>
                  <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium">Usuario</th>
                  <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium">Acción</th>
                  <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium">Entidad</th>
                  <th className="text-left px-4 py-2.5 text-gh-text-muted font-medium">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, index) => {
                  const actionInfo = getActionLabel(log.action)
                  
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-gh-border/10 hover:bg-gh-bg-tertiary/20 transition-colors"
                    >
                      {/* Fecha */}
                      <td className="px-4 py-2.5 text-gh-text-muted whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      
                      {/* Usuario */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-gh-text-muted" />
                          <span className="text-gh-text">{log.userName}</span>
                        </div>
                      </td>
                      
                      {/* Acción */}
                      <td className="px-4 py-2.5">
                        <span className={`font-medium ${actionInfo.color}`}>
                          {actionInfo.label}
                        </span>
                      </td>
                      
                      {/* Entidad */}
                      <td className="px-4 py-2.5 text-gh-text-muted">
                        {log.entityType}
                        {log.entityId && (
                          <span className="text-[10px] ml-1 font-mono">
                            ({log.entityId.substring(0, 8)}...)
                          </span>
                        )}
                      </td>
                      
                      {/* Detalles */}
                      <td className="px-4 py-2.5 text-gh-text-muted">
                        {log.details ? (
                          <span 
                            className="truncate max-w-[200px] inline-block cursor-help"
                            title={JSON.stringify(log.details, null, 2)}
                          >
                            {JSON.stringify(log.details).substring(0, 50)}...
                          </span>
                        ) : (
                          <span className="text-gh-text-muted/40">-</span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>

            {paginatedLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gh-text-muted">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No se encontraron logs</p>
              </div>
            )}
          </div>

          {/* Paginación */}
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
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {/* Diálogo: Generar Reporte */}
      <DialogoGenericoDinamico
        isOpen={reportDialogOpen}
        onClose={() => {
          setReportDialogOpen(false)
          setReportFormData({ period: 'monthly', customStart: '', customEnd: '' })
        }}
        title="Generar Reporte de Auditoría"
        description="Selecciona el rango de tiempo para el reporte"
        contentType="form"
        type="info"
        size="xl"
        formConfig={{
          fields: [
            {
              id: 'period',
              type: 'select',
              label: 'Periodo',
              value: reportFormData.period,
              options: [
                { label: 'Diario', value: 'daily' },
                { label: 'Semanal', value: 'weekly' },
                { label: 'Mensual', value: 'monthly' },
                { label: 'Rango personalizado', value: 'custom' },
              ],
            } as DialogFormField,
          ],
          onSubmit: handleGenerateReport,
        }}
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: () => {
              setReportDialogOpen(false)
              setReportFormData({ period: 'monthly', customStart: '', customEnd: '' })
            },
          },
          {
            id: 'generate',
            label: reportLoading ? 'Generando...' : 'Generar',
            variant: 'primary',
            loading: reportLoading,
            onClick: () => handleGenerateReport(reportFormData),
          },
        ]}
      />

      {/* Diálogo: Purgar Logs */}
      <DialogoGenericoDinamico
        isOpen={purgeDialogOpen}
        onClose={() => {
          setPurgeDialogOpen(false)
          setPurgeConfirmed(false)
        }}
        title="Purgar Logs de Auditoría"
        description={`Esta acción es irreversible.`}
        contentType="custom"
        type="warning"
        size="md"
        content={
          <div className="space-y-3">
            <p className="text-sm text-gh-text-muted">
              Se procederá a eliminar todos los registros de auditoría que superen el período de retención configurado ({retentionDays} días).
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={purgeConfirmed}
                onChange={(e) => setPurgeConfirmed(e.target.checked)}
                className="w-4 h-4 rounded border border-gh-border/30 bg-gh-bg-secondary"
              />
              <span className="text-xs text-gh-text">
                Confirmo que deseo eliminar estos logs permanentemente
              </span>
            </label>
          </div>
        }
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: () => {
              setPurgeDialogOpen(false)
              setPurgeConfirmed(false)
            },
          },
          {
            id: 'purge',
            label: purgeLoading ? 'Purgando...' : 'Purgar',
            variant: 'danger',
            loading: purgeLoading,
            onClick: handlePurgeSubmit,
          },
        ]}
      />

      {/* Mensaje de error/éxito */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-3 rounded-md text-xs ${
            error.toLowerCase().includes('completada')
              ? 'bg-gh-success/10 text-gh-success border border-gh-success/30'
              : 'bg-gh-danger/10 text-gh-danger border border-gh-danger/30'
          }`}
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}


