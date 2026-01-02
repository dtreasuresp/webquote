'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Target, Search, Filter, Download, MoreVertical, ExternalLink, Calendar, Building2, TrendingUp, Trash2, Edit2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { Opportunity } from '@/lib/types'

export default function OpportunitiesSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { opportunities, isLoading, fetchOpportunities, deleteOpportunity } = useCrmStore()
  const { openModal } = useCrmModalStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  const handleAddOpportunity = useCallback(() => {
    if (!canCreate('OPPORTUNITIES')) {
      toast.error('No tienes permiso para crear oportunidades')
      return
    }
    logAction('CREATE', 'OPPORTUNITIES', 'new-opportunity', 'Abriendo formulario de nueva oportunidad')
    openModal('opportunity', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((opportunity: Opportunity) => {
    if (!canEdit('OPPORTUNITIES')) {
      toast.error('No tienes permiso para editar oportunidades')
      return
    }
    logAction('EDIT', 'OPPORTUNITIES', opportunity.id, 'Abriendo formulario de edición de oportunidad')
    openModal('opportunity', 'edit', opportunity)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchOpportunities()
    logAction('VIEW', 'OPPORTUNITIES', 'opportunities-list', 'Pipeline de oportunidades actualizado')
    toast.success('Pipeline actualizado')
  }, [fetchOpportunities, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('OPPORTUNITIES')) {
      toast.error('No tienes permiso para eliminar oportunidades')
      return
    }

    if (confirm('¿Estás seguro de eliminar esta oportunidad?')) {
      try {
        await deleteOpportunity(id)
        logAction('DELETE', 'OPPORTUNITIES', id, 'Oportunidad eliminada')
        toast.success('Oportunidad eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la oportunidad')
      }
    }
  }, [canDelete, deleteOpportunity, logAction, toast])

  const filteredOpportunities = opportunities.filter(opp => 
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.account?.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.stage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'PROSPECT': return 'bg-gh-bg-tertiary text-gh-text-muted border-gh-border/30'
      case 'QUALIFICATION': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'PROPOSAL': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'NEGOTIATION': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'CLOSED_WON': return 'bg-gh-success/10 text-gh-success border-gh-success/20'
      case 'CLOSED_LOST': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gh-bg-tertiary text-gh-text-muted border-gh-border/30'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Oportunidades"
        description="Pipeline de ventas y seguimiento de leads calificados"
        icon={<Target className="w-5 h-5" />}
        onAdd={handleAddOpportunity}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={opportunities.length}
        variant="success"
        badges={[
          { label: 'Total', value: opportunities.length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' }
        ]}
      />

      <div className="px-6 py-4 border-b border-white/10 bg-transparent backdrop-blur-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, empresa o etapa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gh-text focus:outline-none focus:ring-2 focus:ring-gh-success/30 focus:border-gh-success/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gh-text-muted hover:text-gh-text transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gh-text-muted hover:text-gh-text transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-white/10 rounded-xl bg-white/5 backdrop-blur-md overflow-hidden shadow-xl shadow-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[11px] font-bold text-gh-text-muted uppercase tracking-wider border-b border-white/10">
                <th className="px-4 py-4">Oportunidad / Empresa</th>
                <th className="px-4 py-4">Etapa</th>
                <th className="px-4 py-4">Valor Estimado</th>
                <th className="px-4 py-4">Probabilidad</th>
                <th className="px-4 py-4">Cierre Previsto</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOpportunities.length > 0 ? (
                filteredOpportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gh-success/5 transition-all group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gh-text font-bold text-xs border border-white/10 group-hover:border-gh-success/30 transition-colors">
                          <Target className="w-5 h-5 opacity-50" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gh-text group-hover:text-gh-success transition-colors">{opp.name}</div>
                          <div className="text-[11px] text-gh-text-muted flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {opp.account?.commercialName || opp.account?.legalName || 'Sin empresa'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm ${getStageBadgeColor(opp.stage)}`}>
                        {opp.stage}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-mono text-gh-text">
                        {opp.estimatedValue ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(opp.estimatedValue)) : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 max-w-[60px]">
                          <div 
                            className="h-full bg-gh-success transition-all duration-500" 
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gh-text-muted w-8">{opp.probability}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[11px] text-gh-text-muted flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString('es-ES') : 'No definida'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleEdit(opp)}
                          className="p-2 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded-lg transition-all"
                          title="Ver detalle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(opp)}
                          className="p-2 text-gh-text-muted hover:text-gh-text hover:bg-white/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(opp.id)}
                          className="p-2 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gh-text-muted">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Target className="w-8 h-8 opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-medium text-gh-text">No se encontraron oportunidades</p>
                        <p className="text-xs">Intenta ajustar los filtros o el término de búsqueda</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
