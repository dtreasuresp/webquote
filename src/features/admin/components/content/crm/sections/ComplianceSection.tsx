import React, { useState, useCallback, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, AlertTriangle, FileCheck, RefreshCw, Search, MoreVertical, Trash2, Edit2, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { ComplianceRecord } from '@/lib/types'

export default function ComplianceSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { 
    complianceRecords, 
    isLoading, 
    fetchComplianceRecords,
    deleteComplianceRecord 
  } = useCrmStore()
  const { openModal } = useCrmModalStore()

  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchComplianceRecords()
  }, [fetchComplianceRecords])

  const handleAddCompliance = useCallback(() => {
    if (!canCreate('COMPLIANCE')) {
      toast.error('No tienes permiso para crear registros de cumplimiento')
      return
    }
    logAction('CREATE', 'COMPLIANCE', 'new-compliance', 'Abriendo formulario de nuevo registro de cumplimiento')
    openModal('compliance', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((record: ComplianceRecord) => {
    if (!canEdit('COMPLIANCE')) {
      toast.error('No tienes permiso para editar registros de cumplimiento')
      return
    }
    logAction('EDIT', 'COMPLIANCE', record.id, 'Abriendo formulario de edición de cumplimiento')
    openModal('compliance', 'edit', record)
  }, [canEdit, logAction, openModal, toast])

  const handleRunAudit = useCallback(() => {
    if (!canEdit('COMPLIANCE')) {
      toast.error('No tienes permiso para ejecutar auditorías')
      return
    }
    logAction('EXECUTE', 'COMPLIANCE', 'manual-audit', 'Auditoría Manual')
    toast.success('Iniciando escaneo de cumplimiento...')
  }, [canEdit, logAction, toast])

  const handleRefresh = useCallback(async () => {
    try {
      logAction('VIEW', 'COMPLIANCE', 'compliance-status', 'Estado de Cumplimiento')
      await fetchComplianceRecords()
      toast.info('Estado de cumplimiento actualizado')
    } catch (error) {
      toast.error('Error al actualizar cumplimiento')
    }
  }, [logAction, fetchComplianceRecords, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('COMPLIANCE')) {
      toast.error('No tienes permiso para eliminar registros de cumplimiento')
      return
    }

    if (confirm('¿Estás seguro de eliminar este registro de cumplimiento?')) {
      try {
        await deleteComplianceRecord(id)
        logAction('DELETE', 'COMPLIANCE', id, 'Registro de Cumplimiento')
        toast.success('Registro eliminado correctamente')
      } catch (error) {
        toast.error('Error al eliminar el registro')
      }
    }
  }, [canDelete, deleteComplianceRecord, logAction, toast])

  const filteredRecords = complianceRecords.filter(record => 
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.account?.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.account?.commercialName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLIANT':
      case 'VALID':
      case 'ACTIVE':
        return 'bg-gh-success/10 text-gh-success border-gh-success/20'
      case 'NON_COMPLIANT':
      case 'EXPIRED':
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'PENDING':
      case 'REVIEW':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default:
        return 'bg-gh-bg-secondary text-gh-text-muted border-gh-border'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Cumplimiento y Seguridad"
        description="Estado de normativas, RGPD y validación de documentos"
        icon={<ShieldCheck className="w-5 h-5" />}
        onAdd={handleAddCompliance}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        variant="success"
        badges={[
          { label: 'Registros', value: complianceRecords.length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Alertas', value: complianceRecords.filter(r => r.status !== 'COMPLIANT').length, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md flex flex-col items-center text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-gh-success/10 flex items-center justify-center mb-4 border border-gh-success/20">
              <CheckCircle2 className="w-6 h-6 text-gh-success" />
            </div>
            <h3 className="text-sm font-bold text-gh-text">RGPD / GDPR</h3>
            <p className="text-xs text-gh-text-muted mt-2">
              {complianceRecords.filter(r => r.type === 'GDPR' && r.status === 'COMPLIANT').length} registros conformes.
            </p>
          </div>
          <div className="p-6 border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md flex flex-col items-center text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-sm font-bold text-gh-text">Documentación</h3>
            <p className="text-xs text-gh-text-muted mt-2">
              {complianceRecords.filter(r => r.status === 'EXPIRED').length} documentos vencidos detectados.
            </p>
          </div>
          <div className="p-6 border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md flex flex-col items-center text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <FileCheck className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-gh-text">Auditoría Interna</h3>
            <p className="text-xs text-gh-text-muted mt-2">
              {complianceRecords.length > 0 
                ? `Última actualización: ${new Date(Math.max(...complianceRecords.map(r => new Date(r.updatedAt).getTime()))).toLocaleDateString()}`
                : 'Sin registros de auditoría'}
            </p>
          </div>
        </div>

        {/* Search and Table */}
        <div className="border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gh-border/50 bg-gh-bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xs font-bold text-gh-text uppercase tracking-wider">Registros de Cumplimiento</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
              <input
                type="text"
                placeholder="Buscar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1.5 bg-gh-bg-secondary/20 border border-gh-border/50 rounded-md text-sm text-gh-text focus:outline-none focus:border-gh-accent/50 w-full sm:w-64 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gh-border/50 bg-gh-bg-secondary/40">
                  <th className="px-4 py-3 text-xs font-semibold text-gh-text-muted uppercase">Tipo / Norma</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gh-text-muted uppercase">Cuenta Relacionada</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gh-text-muted uppercase">Estado</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gh-text-muted uppercase">Vencimiento</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gh-text-muted uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gh-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <RefreshCw className="w-6 h-6 text-gh-accent animate-spin mx-auto mb-2" />
                      <span className="text-sm text-gh-text-muted">Cargando registros...</span>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gh-text-muted">
                      No se encontraron registros de cumplimiento.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gh-accent/5 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gh-bg-secondary flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-gh-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gh-text">{record.type}</div>
                            <div className="text-xs text-gh-text-muted">ID: {record.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gh-text">
                          {record.account?.commercialName || record.account?.legalName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gh-text">
                          {record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 hover:bg-gh-bg-secondary rounded-md text-gh-text-muted hover:text-gh-text"
                            title="Ver detalles"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(record)}
                            className="p-1.5 hover:bg-gh-bg-secondary rounded-md text-gh-text-muted hover:text-gh-primary"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 hover:bg-gh-bg-secondary rounded-md text-gh-text-muted hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
