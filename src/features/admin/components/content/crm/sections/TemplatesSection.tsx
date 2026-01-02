'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { FileText, Mail, FileCode, Edit2, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function TemplatesSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { templates, isLoading, fetchTemplates, deleteTemplate } = useCrmStore()
  const { openModal } = useCrmModalStore()

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleAddTemplate = useCallback(() => {
    if (!canCreate('TEMPLATES')) {
      toast.error('No tienes permiso para crear plantillas')
      return
    }
    logAction('CREATE', 'TEMPLATES', 'new-template', 'Abriendo formulario de nueva plantilla')
    openModal('template', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((template: any) => {
    if (!canEdit('TEMPLATES')) {
      toast.error('No tienes permiso para editar plantillas')
      return
    }
    logAction('EDIT', 'TEMPLATES', template.id, 'Abriendo formulario de edición de plantilla')
    openModal('template', 'edit', template)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchTemplates()
    logAction('VIEW', 'TEMPLATES', 'templates-list', 'Lista de Plantillas actualizada')
    toast.info('Plantillas actualizadas')
  }, [fetchTemplates, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('TEMPLATES')) {
      toast.error('No tienes permiso para eliminar plantillas')
      return
    }

    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
      try {
        await deleteTemplate(id)
        logAction('DELETE', 'TEMPLATES', id, 'Plantilla eliminada')
        toast.success('Plantilla eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la plantilla')
      }
    }
  }, [canDelete, deleteTemplate, logAction, toast])

  const emailCount = templates.filter(t => t.type === 'EMAIL').length
  const pdfCount = templates.filter(t => t.type === 'PDF').length
  const contractCount = templates.filter(t => t.type === 'CONTRACT').length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Plantillas"
        description="Gestión de plantillas para emails, PDFs y documentos legales"
        icon={<FileText className="w-5 h-5" />}
        onAdd={handleAddTemplate}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={templates.length}
        variant="success"
        badges={[
          { label: 'Emails', value: emailCount, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { label: 'PDFs', value: pdfCount, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Legales', value: contractCount, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20 hover:border-gh-success/50 transition-all cursor-pointer group">
            <Mail className="w-8 h-8 text-gh-success mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-gh-text">Emails</h3>
            <p className="text-[10px] text-gh-text-muted mt-1">{emailCount} plantillas configuradas</p>
          </div>
          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20 hover:border-gh-success/50 transition-all cursor-pointer group">
            <FileCode className="w-8 h-8 text-gh-success mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-gh-text">Cotizaciones PDF</h3>
            <p className="text-[10px] text-gh-text-muted mt-1">{pdfCount} diseños disponibles</p>
          </div>
          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20 hover:border-gh-success/50 transition-all cursor-pointer group">
            <FileText className="w-8 h-8 text-gh-success mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-gh-text">Contratos</h3>
            <p className="text-[10px] text-gh-text-muted mt-1">{contractCount} modelos legales</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gh-text mb-4">Todas las Plantillas</h3>
          {templates.length > 0 ? (
            templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 hover:border-gh-accent/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gh-bg-tertiary border border-gh-border">
                    {template.type === 'EMAIL' ? <Mail className="w-4 h-4 text-blue-400" /> : 
                     template.type === 'PDF' ? <FileCode className="w-4 h-4 text-gh-success" /> : 
                     <FileText className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gh-text">{template.name}</div>
                    <div className="text-[10px] text-gh-text-muted uppercase tracking-wider">{template.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(template)}
                    className="p-1.5 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gh-border rounded-xl">
              <FileText className="w-8 h-8 text-gh-text-muted mx-auto mb-3 opacity-20" />
              <p className="text-sm text-gh-text-muted">No hay plantillas configuradas</p>
              <button 
                onClick={handleAddTemplate}
                className="mt-4 text-xs font-bold text-gh-success hover:underline flex items-center gap-1 mx-auto"
              >
                <Plus className="w-3 h-3" /> Crear primera plantilla
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
