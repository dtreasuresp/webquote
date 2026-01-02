'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Loader2, Trash2, Calendar, ShieldAlert } from 'lucide-react'
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico'
import { useUserPreferencesStore } from '@/stores/userPreferencesStore'
import { useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'

interface AuditReportData {
  id: string
  period: string
  dateRangeFrom: string
  dateRangeTo: string
  generatedAt: string
  status: string
  totalLogs: number
  uniqueUsers: number
  uniqueActions: number
  uniqueEntities: number
}

interface ReportesAuditoriaContentProps {
  isDirty?: boolean
  onSave?: () => Promise<void>
}

export default function ReportesAuditoriaContent({ isDirty, onSave }: Readonly<ReportesAuditoriaContentProps>) {
  const [reports, setReports] = useState<AuditReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<AuditReportData | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [page, setPage] = useState(0)
  const [limit] = useState(5)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  // Hooks de auditoría y permisos
  const { logAction } = useAdminAudit()
  const { canView, canCreate, canEdit, canDelete } = useAdminPermissions()

  const hasViewPerm = canView('AUDIT')
  const hasCreatePerm = canCreate('AUDIT')
  const hasEditPerm = canEdit('AUDIT')
  const hasDeletePerm = canDelete('AUDIT')

  // Store preferences
  const preferences = useUserPreferencesStore()
  const [configHour, setConfigHour] = useState(preferences.auditAutoReportHour || 1)
  const [configMinute, setConfigMinute] = useState(preferences.auditAutoReportMinute || 0)
  const [configPeriod, setConfigPeriod] = useState(preferences.auditAutoReportPeriod || 'weekly')
  const [configEnabled, setConfigEnabled] = useState(preferences.auditAutoReportEnabled || false)
  const [configRetentionDays, setConfigRetentionDays] = useState(preferences.auditReportRetentionDays || 90)
  const [configNotifyManual, setConfigNotifyManual] = useState(preferences.notifyOnManualReport ?? true)
  const [configNotifyAuto, setConfigNotifyAuto] = useState(preferences.notifyOnAutoReport ?? true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [generateReportName, setGenerateReportName] = useState('')
  const [generateReportType, setGenerateReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [generateReportDescription, setGenerateReportDescription] = useState('')

  // Cargar reportes
  useEffect(() => {
    loadReports()
  }, [page])

  // Sincronizar cambios en preferencias
  useEffect(() => {
    setConfigHour(preferences.auditAutoReportHour || 1)
    setConfigMinute(preferences.auditAutoReportMinute || 0)
    setConfigPeriod(preferences.auditAutoReportPeriod || 'weekly')
    setConfigEnabled(preferences.auditAutoReportEnabled || false)
    setConfigRetentionDays(preferences.auditReportRetentionDays || 90)
    setConfigNotifyManual(preferences.notifyOnManualReport ?? true)
    setConfigNotifyAuto(preferences.notifyOnAutoReport ?? true)
  }, [preferences.auditAutoReportHour, preferences.auditAutoReportMinute, preferences.auditAutoReportPeriod, preferences.auditAutoReportEnabled, preferences.auditReportRetentionDays, preferences.notifyOnManualReport, preferences.notifyOnAutoReport])

  const loadReports = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/audit-reports?limit=${limit}&skip=${page * limit}`)

      if (!res.ok) {
        console.error('Error cargando reportes:', res.status)
        return
      }

      const data = await res.json()
      setReports(data.data || [])
      setUpdatedAt(new Date())
    } catch (error) {
      console.error('Error cargando reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (customData?: { name?: string; type?: string; description?: string }) => {
    try {
      setGenerating(true)
      const period = customData?.type || generateReportType
      const payload: any = { period }
      if (customData?.name) payload.name = customData.name
      if (customData?.description) payload.description = customData.description
      
      const res = await fetch('/api/audit-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const statusMessage = res.status === 405 ? 'Método no permitido. Verifica la configuración del servidor.' : 'Error en el servidor'
        throw new Error(errorData.message || `${statusMessage} (${res.status})`)
      }

      // Recargar reportes
      setPage(0)
      await loadReports()
      
      // Notificar si está habilitado
      if (configNotifyManual) {
        console.log('Reporte generado exitosamente')
      }
      
      // Limpiar form de generación
      setGenerateReportName('')
      setGenerateReportDescription('')
      setShowGenerateDialog(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar reporte'
      console.error('Error generando reporte:', errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!hasDeletePerm) return
    if (!confirm('¿Eliminar este reporte?')) return

    try {
      const res = await fetch(`/api/audit-reports/${reportId}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `Error eliminando reporte: ${res.status}`)
      }

      // Auditoría
      logAction('DELETE', 'AUDIT', reportId, 'Eliminado reporte de auditoría')
      
      setReports(reports.filter((r) => r.id !== reportId))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar reporte'
      console.error('Error eliminando reporte:', errorMessage)
    }
  }

  const handleSaveConfig = async () => {
    if (!hasEditPerm) return

    try {
      setSavingConfig(true)
      preferences.updatePreferencesSync({
        auditAutoReportEnabled: configEnabled,
        auditAutoReportHour: configHour,
        auditAutoReportMinute: configMinute,
        auditAutoReportPeriod: configPeriod as any,
        auditReportRetentionDays: configRetentionDays,
        notifyOnManualReport: configNotifyManual,
        notifyOnAutoReport: configNotifyAuto,
      })

      // Auditoría
      logAction('UPDATE', 'AUDIT', 'config', 'Actualizada configuración de reportes automáticos')
      setUpdatedAt(new Date())
      
      setShowConfigDialog(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Error guardando configuración:', errorMessage)
    } finally {
      setSavingConfig(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
    }
    return labels[period] || period
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-gh-success/10 text-gh-success',
      pending: 'bg-yellow-500/10 text-yellow-400',
      failed: 'bg-red-500/10 text-red-400',
    }
    return colors[status] || 'bg-gh-border/10 text-gh-text-muted'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: '✓ Completado',
      pending: 'Pendiente',
      failed: 'Fallido',
    }
    return labels[status] || status
  }

  const renderReportsList = () => {
    if (loading && !reports.length) {
      return (
        <div className="flex items-center justify-center py-8 px-4 text-gh-text-muted">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-xs">Cargando reportes...</span>
        </div>
      )
    }

    if (reports.length === 0) {
      return (
        <div className="text-center py-8 px-4 text-gh-text-muted">
          <BarChart3 className="w-6 h-6 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No hay reportes disponibles</p>
        </div>
      )
    }

    return (
      <AnimatePresence>
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 hover:bg-gh-accent/5 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-gh-accent/10 text-gh-accent group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-gh-text truncate">
                    Reporte {getPeriodLabel(report.period)}
                  </h4>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getStatusBadge(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gh-text-muted uppercase font-bold tracking-tight">Logs</p>
                    <p className="text-xs font-bold text-gh-text">{report.totalLogs.toLocaleString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gh-text-muted uppercase font-bold tracking-tight">Usuarios</p>
                    <p className="text-xs font-bold text-gh-text">{report.uniqueUsers}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gh-text-muted uppercase font-bold tracking-tight">Acciones</p>
                    <p className="text-xs font-bold text-gh-text">{report.uniqueActions}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gh-text-muted uppercase font-bold tracking-tight">Entidades</p>
                    <p className="text-xs font-bold text-gh-text">{report.uniqueEntities}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-gh-text-muted">
                  <Calendar className="w-3 h-3 text-gh-accent/70" />
                  <span className="font-medium">{formatDate(report.generatedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => {
                    setSelectedReport(report)
                    setShowDetailDialog(true)
                  }}
                  className="p-1.5 hover:bg-gh-accent/10 rounded-md transition-colors text-gh-text-muted hover:text-gh-accent"
                  title="Ver detalles"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="p-1.5 hover:bg-gh-error/10 rounded-md transition-colors text-gh-text-muted hover:text-gh-error"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    )
  }

  if (!hasViewPerm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
        <p>No tienes permisos para ver los reportes de auditoría.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with SectionHeader */}
      <SectionHeader
        title="Reportes de Auditoría"
        description="Genera y gestiona reportes automáticos de auditoría con análisis detallados"
        icon={<BarChart3 className="w-4 h-4" />}
        onAdd={hasCreatePerm ? () => setShowGenerateDialog(true) : undefined}
        onRefresh={loadReports}
        onSettings={hasEditPerm ? () => setShowConfigDialog(true) : undefined}
        isLoading={loading || generating}
        updatedAt={updatedAt}
        statusIndicator={updatedAt ? 'guardado' : 'sin-modificar'}
        itemCount={reports.length}
        variant="accent"
      />

      {/* Sección: Estado de Reportes Automáticos */}
      <div className="bg-gh-bg-secondary/10 backdrop-blur-md border border-gh-border/50 rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${configEnabled ? 'bg-gh-success animate-pulse' : 'bg-gh-text-muted/40'}`}></div>
                <h5 className="text-xs font-semibold text-gh-text">
                  Reportes Automáticos {configEnabled ? 'Habilitados' : 'Deshabilitados'}
                </h5>
              </div>
              {configEnabled ? (
                <p className="text-[10px] text-gh-text-muted">
                  Período: <span className="text-gh-accent font-medium">{getPeriodLabel(configPeriod)}</span> • 
                  Próximo: <span className="text-gh-accent font-medium">{String(configHour).padStart(2, '0')}:{String(configMinute).padStart(2, '0')}</span> • 
                  Retención: <span className="text-gh-accent font-medium">{configRetentionDays} días</span>
                </p>
              ) : (
                <p className="text-[10px] text-gh-text-muted">
                  Configura reportes automáticos para generar análisis regularmente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Lista de Reportes */}
      <div className="bg-gh-bg-secondary/10 backdrop-blur-md border border-gh-border/50 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-2.5 border-b border-gh-border/50 bg-gh-bg-secondary/40 flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">
            Reportes Generados
          </h5>
        </div>
        
        <div className="divide-y divide-gh-border/10">
          {renderReportsList()}
        </div>
      </div>

      {/* Diálogo de Detalles */}
      {selectedReport && (
        <DialogoGenericoDinamico
          isOpen={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
          title={`Reporte ${getPeriodLabel(selectedReport.period)}`}
          description={`Generado: ${formatDate(selectedReport.generatedAt)}`}
          type="info"
          size="lg"
          variant="premium"
          contentType="custom"
          content={
            <div className="space-y-3">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-gh-bg border border-gh-border/30 rounded-md">
                  <p className="text-[10px] text-gh-text-muted mb-1">Período</p>
                  <p className="text-xs font-semibold text-gh-text">{getPeriodLabel(selectedReport.period)}</p>
                </div>
                <div className="p-2.5 bg-gh-bg border border-gh-border/30 rounded-md">
                  <p className="text-[10px] text-gh-text-muted mb-1">Estado</p>
                  <p className={`text-xs font-semibold ${selectedReport.status === 'completed' ? 'text-gh-success' : 'text-yellow-400'}`}>
                    {selectedReport.status === 'completed' ? '✓ Completado' : 'Pendiente'}
                  </p>
                </div>
                <div className="p-2.5 bg-gh-bg border border-gh-border/30 rounded-md">
                  <p className="text-[10px] text-gh-text-muted mb-1">Desde</p>
                  <p className="text-xs font-semibold text-gh-text">{formatDate(selectedReport.dateRangeFrom)}</p>
                </div>
                <div className="p-2.5 bg-gh-bg border border-gh-border/30 rounded-md">
                  <p className="text-[10px] text-gh-text-muted mb-1">Hasta</p>
                  <p className="text-xs font-semibold text-gh-text">{formatDate(selectedReport.dateRangeTo)}</p>
                </div>
              </div>

              {/* Estadísticas */}
              <div>
                <p className="text-[10px] font-medium text-gh-text-muted mb-2">Estadísticas</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-gh-accent/10 border border-gh-accent/30 rounded-md">
                    <p className="text-[10px] text-gh-text-muted">Logs</p>
                    <p className="text-sm font-bold text-gh-accent">{selectedReport.totalLogs.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 bg-gh-success/10 border border-gh-success/30 rounded-md">
                    <p className="text-[10px] text-gh-text-muted">Usuarios</p>
                    <p className="text-sm font-bold text-gh-success">{selectedReport.uniqueUsers}</p>
                  </div>
                  <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                    <p className="text-[10px] text-gh-text-muted">Acciones</p>
                    <p className="text-sm font-bold text-yellow-400">{selectedReport.uniqueActions}</p>
                  </div>
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-md">
                    <p className="text-[10px] text-gh-text-muted">Entidades</p>
                    <p className="text-sm font-bold text-purple-400">{selectedReport.uniqueEntities}</p>
                  </div>
                </div>
              </div>

              {/* ID del reporte */}
              <div className="p-2.5 bg-gh-bg border border-gh-border/20 rounded-md">
                <p className="text-[10px] text-gh-text-muted mb-1">ID del Reporte</p>
                <p className="text-[10px] font-mono text-gh-accent break-all">{selectedReport.id}</p>
              </div>
            </div>
          }
          actions={[
            {
              id: 'close',
              label: 'Cerrar',
              variant: 'secondary',
              onClick: () => setShowDetailDialog(false),
            },
          ]}
        />
      )}

      {/* Diálogo de Configuración */}
      <DialogoGenericoDinamico
        isOpen={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        title="Configurar Reportes Automáticos"
        description="Establece la hora y frecuencia"
        type="info"
        size="xl"
        variant="premium"
        contentType="custom"
        content={
          <div className="space-y-4">
            {/* Toggle para habilitar/deshabilitar */}
            <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-md">
              <div>
                <p className="text-xs font-medium text-gh-text">Reportes Automáticos</p>
                <p className="text-[10px] text-gh-text-muted mt-0.5">Generar reportes automáticamente según programación</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <span className="sr-only">Habilitar reportes automáticos</span>
                <input
                  type="checkbox"
                  checked={configEnabled}
                  onChange={(e) => setConfigEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gh-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gh-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gh-success/50"></div>
              </label>
            </div>

            {configEnabled && (
              <>
                {/* Seleccionar periodo */}
                <div>
                  <label htmlFor="period-config" className="block text-xs font-medium text-gh-text mb-2">
                    Período de Generación
                  </label>
                  <select
                    id="period-config"
                    value={configPeriod}
                    onChange={(e) => setConfigPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gh-bg text-gh-text border border-gh-border/30 rounded-md text-xs font-medium focus:border-gh-accent/50 focus:ring-1 focus:ring-gh-accent/20 outline-none transition"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                {/* Selector de hora */}
                <div>
                  <label className="block text-xs font-medium text-gh-text mb-2">
                    Hora de Ejecución: <span className="text-gh-success">{String(configHour).padStart(2, '0')}:{String(configMinute).padStart(2, '0')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="hour-input" className="text-[10px] text-gh-text-muted block mb-1">Hora (0-23)</label>
                      <input
                        id="hour-input"
                        type="number"
                        min="0"
                        max="23"
                        value={configHour}
                        onChange={(e) => setConfigHour(Math.max(0, Math.min(23, Number.parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 bg-gh-bg text-gh-text border border-gh-border/30 rounded-md text-xs font-medium focus:border-gh-accent/50 focus:ring-1 focus:ring-gh-accent/20 outline-none transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="minute-input" className="text-[10px] text-gh-text-muted block mb-1">Minuto (0-59)</label>
                      <input
                        id="minute-input"
                        type="number"
                        min="0"
                        max="59"
                        value={configMinute}
                        onChange={(e) => setConfigMinute(Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 bg-gh-bg text-gh-text border border-gh-border/30 rounded-md text-xs font-medium focus:border-gh-accent/50 focus:ring-1 focus:ring-gh-accent/20 outline-none transition"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gh-text-muted mt-2">
                    El reporte se generará automáticamente cada {
                      configPeriod === 'daily' ? 'día' : configPeriod === 'weekly' ? 'semana' : 'mes'
                    } a las {String(configHour).padStart(2, '0')}:{String(configMinute).padStart(2, '0')} (± 5 minutos)
                  </p>
                </div>

                {/* Retención de reportes */}
                <div>
                  <label htmlFor="retention-input" className="block text-xs font-medium text-gh-text mb-2">
                    Retención de Reportes: <span className="text-gh-success">{configRetentionDays} días</span>
                  </label>
                  <input
                    id="retention-input"
                    type="range"
                    min="1"
                    max="730"
                    value={configRetentionDays}
                    onChange={(e) => setConfigRetentionDays(Number.parseInt(e.target.value))}
                    className="w-full h-2 bg-gh-border/30 rounded-lg appearance-none cursor-pointer accent-gh-success"
                  />
                  <p className="text-[10px] text-gh-text-muted mt-1">
                    Los reportes se eliminarán automáticamente después de {configRetentionDays} días
                  </p>
                </div>

                {/* Notificaciones */}
                <div className="border-t border-gh-border/20 pt-3">
                  <p className="text-xs font-medium text-gh-text mb-2.5">Notificaciones</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gh-bg/50 rounded-md">
                      <label htmlFor="notify-manual" className="text-xs text-gh-text cursor-pointer">Reportes manuales</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <span className="sr-only">Notificar reportes manuales</span>
                        <input
                          id="notify-manual"
                          type="checkbox"
                          checked={configNotifyManual}
                          onChange={(e) => setConfigNotifyManual(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gh-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gh-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gh-success/50"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gh-bg/50 rounded-md">
                      <label htmlFor="notify-auto" className="text-xs text-gh-text cursor-pointer">Reportes automáticos</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <span className="sr-only">Notificar reportes automáticos</span>
                        <input
                          id="notify-auto"
                          type="checkbox"
                          checked={configNotifyAuto}
                          onChange={(e) => setConfigNotifyAuto(e.target.checked)}
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
            onClick: () => setShowConfigDialog(false),
          },
          {
            id: 'save',
            label: savingConfig ? 'Guardando...' : 'Guardar',
            variant: 'primary',
            onClick: handleSaveConfig,
            loading: savingConfig,
          },
        ]}
      />

      {/* Diálogo de Generación Manual */}
      <DialogoGenericoDinamico
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        title="Generar Reporte Personalizado"
        description="Crea un nuevo reporte con configuración personalizada"
        type="info"
        size="xl"
        variant="premium"
        contentType="custom"
        content={
          <div className="space-y-3">
            {/* Nombre del reporte */}
            <div>
              <label htmlFor="report-name" className="block text-xs font-medium text-gh-text mb-1.5">
                Nombre del Reporte
              </label>
              <input
                id="report-name"
                type="text"
                value={generateReportName}
                onChange={(e) => setGenerateReportName(e.target.value)}
                placeholder="Ej: Análisis de accesos Q4"
                className="w-full px-3 py-2 bg-gh-bg text-gh-text border border-gh-border/30 rounded-md text-xs font-medium focus:border-gh-accent/50 focus:ring-1 focus:ring-gh-accent/20 outline-none transition placeholder:text-gh-text-muted"
              />
              <p className="text-[10px] text-gh-text-muted mt-1">Identificador único para este reporte</p>
            </div>

            {/* Tipo de reportes */}
            <div>
              <label htmlFor="report-type" className="block text-xs font-medium text-gh-text mb-1.5">
                Tipo de Análisis
              </label>
              <select
                id="report-type"
                value={generateReportType}
                onChange={(e) => setGenerateReportType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gh-bg text-gh-text border border-gh-border/30 rounded-md text-xs font-medium focus:border-gh-accent/50 focus:ring-1 focus:ring-gh-accent/20 outline-none transition cursor-pointer"
              >
                <option value="daily">Diario (últimas 24h)</option>
                <option value="weekly">Semanal (últimos 7 días)</option>
                <option value="monthly">Mensual (últimos 30 días)</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="report-description" className="block text-xs font-medium text-gh-text mb-1.5">
                Descripción (Opcional)
              </label>
              <textarea
                id="report-description"
                value={generateReportDescription}
                onChange={(e) => setGenerateReportDescription(e.target.value)}
                placeholder="Agrega notas o contexto sobre este reporte..."
                rows={3}
                className="w-full px-3 py-2 bg-gh-bg text-gh-text border border-gh-border/30 rounded-md text-xs font-medium focus:border-gh-accent/50 focus:ring-1 focus:ring-gh-accent/20 outline-none transition placeholder:text-gh-text-muted resize-none"
              />
            </div>
          </div>
        }
        actions={[
          {
            id: 'cancel',
            label: 'Cancelar',
            variant: 'secondary',
            onClick: () => {
              setGenerateReportName('')
              setGenerateReportDescription('')
              setShowGenerateDialog(false)
            },
          },
          {
            id: 'generate',
            label: generating ? 'Generando...' : 'Generar Reporte',
            variant: 'primary',
            onClick: () => handleGenerateReport({
              name: generateReportName,
              type: generateReportType,
              description: generateReportDescription,
            }),
            loading: generating,
          },
        ]}
      />
    </div>
  )
}
