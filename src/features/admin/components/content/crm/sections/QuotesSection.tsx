'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { FileText, Edit2, Trash2, Plus, ExternalLink, Clock, CheckCircle, XCircle, Download } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function QuotesSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { quotes, isLoading, fetchQuotes, deleteQuote } = useCrmStore()
  const { openModal } = useCrmModalStore()

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const handleAddQuote = useCallback(() => {
    if (!canCreate('QUOTES')) {
      toast.error('No tienes permiso para crear cotizaciones')
      return
    }
    logAction('CREATE', 'QUOTES', 'new-quote', 'Abriendo formulario de nueva cotización')
    openModal('quote', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((quote: any) => {
    if (!canEdit('QUOTES')) {
      toast.error('No tienes permiso para editar cotizaciones')
      return
    }
    logAction('EDIT', 'QUOTES', quote.id, 'Abriendo formulario de edición de cotización')
    openModal('quote', 'edit', quote)
  }, [canEdit, logAction, openModal, toast])

  const handleDownload = useCallback((quote: any) => {
    logAction('DOWNLOAD', 'QUOTES', quote.id, `Descargando PDF de cotización ${quote.numero}`)
    window.open(`/api/quotations/${quote.id}/generate-pdf`, '_blank')
    toast.success('Generando vista de impresión...')
  }, [logAction, toast])

  const handleRefresh = useCallback(async () => {
    await fetchQuotes()
    logAction('VIEW', 'QUOTES', 'quotes-list', 'Lista de Cotizaciones actualizada')
    toast.info('Cotizaciones actualizadas')
  }, [fetchQuotes, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('QUOTES')) {
      toast.error('No tienes permiso para eliminar cotizaciones')
      return
    }

    if (confirm('¿Estás seguro de eliminar esta cotización?')) {
      try {
        await deleteQuote(id)
        logAction('DELETE', 'QUOTES', id, 'Cotización eliminada')
        toast.success('Cotización eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la cotización')
      }
    }
  }, [canDelete, deleteQuote, logAction, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACEPTADA':
        return <span className="px-2 py-0.5 rounded-full bg-gh-success/10 text-gh-success text-[10px] font-bold border border-gh-success/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ACEPTADA</span>
      case 'RECHAZADA':
        return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20 flex items-center gap-1"><XCircle className="w-3 h-3" /> RECHAZADA</span>
      case 'EXPIRADA':
        return <span className="px-2 py-0.5 rounded-full bg-gh-bg-tertiary text-gh-text-muted text-[10px] font-bold border border-gh-border/30 flex items-center gap-1"><Clock className="w-3 h-3" /> EXPIRADA</span>
      default:
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20 flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Cotizaciones CRM"
        description="Presupuestos vinculados a oportunidades y clientes"
        icon={<FileText className="w-5 h-5" />}
        onAdd={handleAddQuote}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={quotes.length}
        variant="success"
        badges={[
          { label: 'Enviadas', value: quotes.filter(q => q.estado === 'CARGADA' || q.estado === 'ACTIVA').length, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { label: 'Aceptadas', value: quotes.filter(q => q.estado === 'ACEPTADA').length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Expiradas', value: quotes.filter(q => q.estado === 'EXPIRADA').length, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gh-bg-secondary/40 text-[10px] font-bold text-gh-text-muted uppercase tracking-wider border-b border-gh-border/50">
                <th className="px-4 py-3">Nº Cotización</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-gh-border/50 hover:bg-gh-accent/5 transition-colors group">
                    <td className="px-4 py-4 text-xs font-bold text-gh-text tabular-nums">
                      <div className="flex items-center gap-2">
                        {quote.numero}
                        <a href={`/q/${quote.id}`} target="_blank" rel="noopener noreferrer" className="text-gh-text-muted hover:text-gh-accent">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gh-text">{quote.empresa}</td>
                    <td className="px-4 py-4 text-xs text-gh-text-muted">{new Date(quote.fechaVencimiento).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(quote.estado)}
                        {quote.approvalStatus === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[9px] font-bold border border-orange-500/20 w-fit">
                            REQUIERE APROBACIÓN
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-bold text-gh-text tabular-nums">
                      {quote.moneda} {quote.presupuesto}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownload(quote)}
                          className="p-1.5 text-gh-text-muted hover:text-gh-success hover:bg-gh-success/10 rounded transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(quote)}
                          className="p-1.5 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(quote.id)}
                          className="p-1.5 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
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
                    <FileText className="w-8 h-8 text-gh-text-muted mx-auto mb-3 opacity-20" />
                    <p className="text-sm text-gh-text-muted">No hay cotizaciones registradas</p>
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
