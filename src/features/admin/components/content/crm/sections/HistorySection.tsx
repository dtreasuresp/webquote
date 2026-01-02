'use client'

import React, { useState, useCallback } from 'react'
import { BarChart3, Search, Filter } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function HistorySection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canView } = useAdminPermissions()
  const [isLoading, setIsLoading] = useState(false)

  const handleExportLogs = useCallback(() => {
    logAction('EXPORT', 'AUDIT', 'audit-logs', 'Logs de Auditoría')
    toast.success('Exportando historial de auditoría...')
  }, [logAction, toast])

  const handleRefresh = useCallback(async () => {
    if (!canView('AUDIT')) {
      toast.error('No tienes permiso para ver la auditoría')
      return
    }
    setIsLoading(true)
    try {
      logAction('VIEW', 'AUDIT', 'history-list', 'Historial de Auditoría')
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info('Historial actualizado')
    } finally {
      setIsLoading(false)
    }
  }, [canView, logAction, toast])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Auditoría e Historial"
        description="Registro detallado de cambios y acciones en el sistema"
        icon={<BarChart3 className="w-5 h-5" />}
        onAdd={handleExportLogs}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={150}
        variant="success"
        badges={[
          { label: 'Hoy', value: 45, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Alertas', value: 2, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-gh-border rounded-xl bg-[#161b22]/20 overflow-hidden">
          <div className="p-4 border-b border-gh-border bg-[#161b22]/50 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
              <input 
                type="text" 
                placeholder="Filtrar por usuario o acción..."
                className="w-full pl-10 pr-4 py-1.5 bg-[#0d1117] border border-gh-border rounded-md text-xs text-gh-text focus:outline-none focus:ring-1 focus:ring-gh-success/30"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-gh-border rounded-md text-xs text-gh-text-muted hover:text-gh-text transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filtros Avanzados
            </button>
          </div>
          
          <div className="divide-y divide-gh-border/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-gh-bg-tertiary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-gh-bg-tertiary flex items-center justify-center text-[10px] font-bold text-gh-text-muted">
                    LOG
                  </div>
                  <div>
                    <div className="text-sm text-gh-text">
                      <span className="font-bold">Admin</span> actualizó el estado de la oportunidad <span className="text-gh-success">#1234</span>
                    </div>
                    <div className="text-[10px] text-gh-text-muted mt-0.5">IP: 192.168.1.45 • Navegador: Chrome/Windows</div>
                  </div>
                </div>
                <div className="text-[10px] text-gh-text-muted tabular-nums">Hace {i * 15} minutos</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
