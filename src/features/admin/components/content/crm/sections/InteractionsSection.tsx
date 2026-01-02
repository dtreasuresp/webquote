'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { MessageSquare, Clock, Search, Filter, Download, Phone, Mail, Users, FileText, MoreVertical, Building2, User, Trash2, Edit2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { Interaction } from '@/lib/types'

export default function InteractionsSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { interactions, isLoading, fetchInteractions, deleteInteraction } = useCrmStore()
  const { openModal } = useCrmModalStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInteractions()
  }, [fetchInteractions])

  const handleAddInteraction = useCallback(() => {
    if (!canCreate('INTERACTIONS')) {
      toast.error('No tienes permiso para registrar interacciones')
      return
    }
    logAction('CREATE', 'INTERACTIONS', 'new-interaction', 'Abriendo formulario de nueva interacción')
    openModal('interaction', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((interaction: Interaction) => {
    if (!canEdit('INTERACTIONS')) {
      toast.error('No tienes permiso para editar interacciones')
      return
    }
    logAction('EDIT', 'INTERACTIONS', interaction.id, 'Abriendo formulario de edición de interacción')
    openModal('interaction', 'edit', interaction)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchInteractions()
    logAction('VIEW', 'INTERACTIONS', 'interactions-list', 'Historial de interacciones actualizado')
    toast.success('Historial actualizado')
  }, [fetchInteractions, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('INTERACTIONS')) {
      toast.error('No tienes permiso para eliminar interacciones')
      return
    }

    if (confirm('¿Estás seguro de eliminar esta interacción?')) {
      try {
        await deleteInteraction(id)
        logAction('DELETE', 'INTERACTIONS', id, 'Interacción eliminada')
        toast.success('Interacción eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la interacción')
      }
    }
  }, [canDelete, deleteInteraction, logAction, toast])

  const filteredInteractions = interactions.filter(interaction => 
    interaction.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interaction.account?.legalName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="w-3 h-3" />
      case 'EMAIL': return <Mail className="w-3 h-3" />
      case 'MEETING': return <Users className="w-3 h-3" />
      case 'NOTE': return <FileText className="w-3 h-3" />
      default: return <MessageSquare className="w-3 h-3" />
    }
  }

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'EMAIL': return 'text-gh-success bg-gh-success/10 border-gh-success/20'
      case 'MEETING': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'NOTE': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      default: return 'text-gh-text-muted bg-gh-bg-tertiary border-gh-border/30'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Interacciones"
        description="Historial de comunicaciones, llamadas y reuniones"
        icon={<MessageSquare className="w-5 h-5" />}
        onAdd={handleAddInteraction}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={interactions.length}
        variant="success"
        badges={[
          { label: 'Total', value: interactions.length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' }
        ]}
      />

      <div className="px-6 py-4 border-b border-gh-border/50 bg-gh-bg-secondary/5 backdrop-blur-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar en el historial..."
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
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredInteractions.length > 0 ? (
            filteredInteractions.map((interaction) => (
              <div key={interaction.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-gh-border/30 last:before:hidden">
                <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border flex items-center justify-center z-10 backdrop-blur-md ${getInteractionColor(interaction.type)}`}>
                  {getInteractionIcon(interaction.type)}
                </div>
                <div className="p-4 border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md hover:border-gh-accent/50 transition-all group shadow-lg hover:shadow-gh-accent/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gh-text">
                        {interaction.subject || interaction.type}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getInteractionColor(interaction.type)}`}>
                        {interaction.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gh-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(interaction.createdAt).toLocaleString('es-ES', { 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(interaction)}
                          className="p-1 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(interaction.id)}
                          className="p-1 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gh-text-muted leading-relaxed">
                    {interaction.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 pt-3 border-t border-gh-border/30">
                    <div className="flex items-center gap-1.5 text-[10px] text-gh-text-muted">
                      <Building2 className="w-3 h-3" />
                      <span className="font-bold text-gh-success hover:underline cursor-pointer uppercase tracking-tight">
                        {interaction.account?.commercialName || interaction.account?.legalName}
                      </span>
                    </div>
                    {interaction.contact && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gh-text-muted">
                        <User className="w-3 h-3" />
                        <span className="font-medium">{interaction.contact.fullName}</span>
                      </div>
                    )}
                    {interaction.assignedTo && (
                      <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gh-text-muted">
                        <div className="w-4 h-4 rounded-full bg-gh-bg-tertiary border border-gh-border flex items-center justify-center text-[8px] font-bold">
                          {interaction.assignedTo.substring(0, 2).toUpperCase()}
                        </div>
                        <span>Asignado a {interaction.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gh-text-muted">
              <MessageSquare className="w-12 h-12 opacity-10 mb-4" />
              <p className="text-sm">No hay interacciones registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
