'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { RefreshCw, Search, Filter, Download, MoreVertical, ExternalLink, Calendar, Building2, CreditCard, Trash2, Edit2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { Subscription } from '@/lib/types'

export default function SubscriptionsSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { subscriptions, isLoading, fetchSubscriptions, deleteSubscription } = useCrmStore()
  const { openModal } = useCrmModalStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleAddSubscription = useCallback(() => {
    if (!canCreate('SUBSCRIPTIONS')) {
      toast.error('No tienes permiso para crear suscripciones')
      return
    }
    logAction('CREATE', 'SUBSCRIPTIONS', 'new-subscription', 'Abriendo formulario de nueva suscripción')
    openModal('subscription', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((subscription: Subscription) => {
    if (!canEdit('SUBSCRIPTIONS')) {
      toast.error('No tienes permiso para editar suscripciones')
      return
    }
    logAction('EDIT', 'SUBSCRIPTIONS', subscription.id, 'Abriendo formulario de edición de suscripción')
    openModal('subscription', 'edit', subscription)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchSubscriptions()
    logAction('VIEW', 'SUBSCRIPTIONS', 'subscriptions-list', 'Lista de suscripciones actualizada')
    toast.success('Suscripciones actualizadas')
  }, [fetchSubscriptions, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('SUBSCRIPTIONS')) {
      toast.error('No tienes permiso para eliminar suscripciones')
      return
    }

    if (confirm('¿Estás seguro de eliminar esta suscripción?')) {
      try {
        await deleteSubscription(id)
        logAction('DELETE', 'SUBSCRIPTIONS', id, 'Suscripción eliminada')
        toast.success('Suscripción eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la suscripción')
      }
    }
  }, [canDelete, deleteSubscription, logAction, toast])

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.account?.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-gh-success/10 text-gh-success border-gh-success/20'
      case 'PENDING': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'EXPIRED': return 'bg-gh-bg-tertiary text-gh-text-muted border-gh-border/30'
      default: return 'bg-gh-bg-tertiary text-gh-text-muted border-gh-border/30'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Suscripciones"
        description="Control de ingresos recurrentes y renovaciones"
        icon={<RefreshCw className="w-5 h-5" />}
        onAdd={handleAddSubscription}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={subscriptions.length}
        variant="success"
        badges={[
          { label: 'Total', value: subscriptions.length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' }
        ]}
      />

      <div className="px-6 py-4 border-b border-gh-border/50 bg-gh-bg-secondary/5 backdrop-blur-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gh-bg-secondary/20 border border-gh-border/50 rounded-lg text-sm text-gh-text focus:outline-none focus:ring-2 focus:ring-gh-accent/30 focus:border-gh-accent/50 transition-all placeholder:text-gh-text-muted/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gh-bg-secondary/20 border border-gh-border/50 rounded-lg text-sm text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-secondary/40 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gh-bg-secondary/20 border border-gh-border/50 rounded-lg text-sm text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-secondary/40 transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gh-bg-secondary/40 text-[11px] font-bold text-gh-text-muted uppercase tracking-wider border-b border-gh-border/50">
                <th className="px-4 py-3">Cliente / Suscripción</th>
                <th className="px-4 py-3">Frecuencia</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Próximo Cobro</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-gh-border/50 hover:bg-gh-accent/5 transition-colors group">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gh-text group-hover:text-gh-success transition-colors">
                          {sub.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gh-text-muted mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {sub.account?.commercialName || sub.account?.legalName || 'Sin empresa'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gh-text-muted">
                        <CreditCard className="w-3.5 h-3.5" />
                        {sub.billingFrequency}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gh-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('es-ES') : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-bold text-gh-text tabular-nums">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(sub.amount))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(sub)}
                          className="p-1.5 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded transition-colors"
                          title="Ver detalle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(sub)}
                          className="p-1.5 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
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
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gh-text-muted">
                      <RefreshCw className="w-8 h-8 opacity-20" />
                      <p className="text-sm">No se encontraron suscripciones</p>
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
