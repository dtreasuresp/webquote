'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { ShieldCheck, Zap, AlertCircle, Settings, Plus, RefreshCw, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function RulesSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { rules, isLoading, fetchRules, deleteRule } = useCrmStore()
  const { openModal } = useCrmModalStore()

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const handleAddRule = useCallback(() => {
    if (!canCreate('RULES')) {
      toast.error('No tienes permiso para crear reglas')
      return
    }
    logAction('CREATE', 'RULES', 'new-rule', 'Abriendo formulario de nueva regla')
    openModal('rule', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((rule: any) => {
    if (!canEdit('RULES')) {
      toast.error('No tienes permiso para editar reglas')
      return
    }
    logAction('EDIT', 'RULES', rule.id, 'Abriendo formulario de edición de regla')
    openModal('rule', 'edit', rule)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchRules()
    logAction('VIEW', 'RULES', 'business-rules', 'Reglas de Negocio actualizadas')
    toast.info('Reglas sincronizadas')
  }, [fetchRules, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('RULES')) {
      toast.error('No tienes permiso para eliminar reglas')
      return
    }

    if (confirm('¿Estás seguro de eliminar esta regla?')) {
      try {
        await deleteRule(id)
        logAction('DELETE', 'RULES', id, 'Regla eliminada')
        toast.success('Regla eliminada correctamente')
      } catch (error) {
        toast.error('Error al eliminar la regla')
      }
    }
  }, [canDelete, deleteRule, logAction, toast])

  const activeCount = rules.filter(r => r.active).length
  const pausedCount = rules.length - activeCount

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Reglas de Negocio"
        description="Configuración de automatizaciones, validaciones y flujos de trabajo"
        icon={<ShieldCheck className="w-5 h-5" />}
        onAdd={handleAddRule}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={rules.length}
        variant="success"
        badges={[
          { label: 'Activas', value: activeCount, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Pausadas', value: pausedCount, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20">
            <h3 className="text-sm font-bold text-gh-text mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gh-success" />
              Automatizaciones
            </h3>
            <div className="space-y-4">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-4 p-4 rounded-lg bg-gh-bg-tertiary/30 border border-gh-border/50 group">
                    <div className={`p-2 rounded-full ${rule.active ? 'bg-gh-success/10' : 'bg-gh-danger/10'}`}>
                      <AlertCircle className={`w-4 h-4 ${rule.active ? 'text-gh-success' : 'text-gh-danger'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-gh-text">{rule.name}</div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(rule)}
                            className="p-1 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(rule.id)}
                            className="p-1 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gh-text-muted mt-1">{rule.description}</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gh-bg-secondary border border-gh-border text-gh-text-muted">
                          Trigger: {rule.trigger}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gh-border rounded-xl">
                  <Zap className="w-8 h-8 text-gh-text-muted mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-gh-text-muted">No hay reglas configuradas</p>
                  <button 
                    onClick={handleAddRule}
                    className="mt-4 text-xs font-bold text-gh-success hover:underline flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-3 h-3" /> Crear primera regla
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
