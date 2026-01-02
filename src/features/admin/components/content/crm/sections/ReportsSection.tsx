'use client'

import React, { useState, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function ReportsSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canView } = useAdminPermissions()
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = useCallback(() => {
    logAction('EXPORT', 'REPORTS', 'sales-report', 'Reporte de Ventas')
    toast.success('Exportando reporte en PDF...')
  }, [logAction, toast])

  const handleRefresh = useCallback(async () => {
    if (!canView('REPORTS')) {
      toast.error('No tienes permiso para ver reportes')
      return
    }
    setIsLoading(true)
    try {
      logAction('VIEW', 'REPORTS', 'dashboard', 'Dashboard de Reportes')
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info('Datos actualizados')
    } finally {
      setIsLoading(false)
    }
  }, [canView, logAction, toast])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Reportes y Analítica"
        description="Visualiza el rendimiento de tus ventas y crecimiento"
        icon={<BarChart3 className="w-5 h-5" />}
        onAdd={handleExport}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={4}
        variant="success"
        badges={[
          { label: 'Ventas', value: '€45k', color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Conversión', value: '28%', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20">
            <h3 className="text-sm font-bold text-gh-text mb-4">Ventas por Mes</h3>
            <div className="h-48 bg-gh-bg-tertiary/30 rounded-lg flex items-end justify-between px-4 pb-2 gap-2">
              {[
                { id: 'm1', h: 40 },
                { id: 'm2', h: 60 },
                { id: 'm3', h: 45 },
                { id: 'm4', h: 90 },
                { id: 'm5', h: 65 },
                { id: 'm6', h: 80 }
              ].map((item) => (
                <div key={item.id} className="w-full bg-gh-success/40 rounded-t-sm hover:bg-gh-success/60 transition-all" style={{ height: `${item.h}%` }} />
              ))}
            </div>
          </div>
          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20">
            <h3 className="text-sm font-bold text-gh-text mb-4">Conversión de Leads</h3>
            <div className="space-y-4">
              {[
                { label: 'Contactados', value: 85, color: 'bg-blue-500' },
                { label: 'Calificados', value: 62, color: 'bg-purple-500' },
                { label: 'Propuestas', value: 45, color: 'bg-orange-500' },
                { label: 'Cerrados', value: 28, color: 'bg-gh-success' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] font-bold text-gh-text-muted uppercase mb-1">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gh-bg-tertiary rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
