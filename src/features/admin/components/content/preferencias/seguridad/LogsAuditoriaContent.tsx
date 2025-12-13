'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  ChevronRight
} from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import DatePicker from '@/components/ui/DatePicker'

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
  pageSize: number
  totalPages: number
}

// Acciones con labels
const ACTION_LABELS: Record<string, { label: string; color: string }> = {
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
  // Estado
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Cargar logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      })

      if (searchTerm) params.set('search', searchTerm)
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (entityFilter !== 'all') params.set('entityType', entityFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar logs')
      
      const data = await res.json()
      setLogs(data.logs)
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, searchTerm, actionFilter, entityFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Exportar a CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (entityFilter !== 'all') params.set('entityType', entityFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      params.set('export', 'csv')

      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      if (!res.ok) throw new Error('Error al exportar')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar')
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

  // Entidades únicas para filtro
  const uniqueEntities = [...new Set(logs.map(l => l.entityType))]
  const uniqueActions = [...new Set(logs.map(l => l.action))]

  // ==================== RENDER ====================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <FileText className="w-4 h-4 text-gh-accent" />
            Logs de Auditoría
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Historial de cambios en el sistema de seguridad
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refrescar */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Exportar */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-accent/10 text-gh-accent border border-gh-accent/30 rounded-md hover:bg-gh-accent/20 transition-colors text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
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
                {logs.map((log, index) => {
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

            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gh-text-muted">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No se encontraron logs</p>
              </div>
            )}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gh-text-muted">
                Mostrando {logs.length} de {pagination.total} registros
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-1.5 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-xs text-gh-text">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-1.5 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}


