'use client'

import React, { useCallback, useEffect } from 'react'
import { LayoutDashboard, TrendingUp, Users, Target, DollarSign } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function DashboardSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canView } = useAdminPermissions()
  const { 
    accounts, 
    opportunities, 
    quotes,
    isLoading, 
    fetchAccounts, 
    fetchOpportunities, 
    fetchQuotes 
  } = useCrmStore()

  useEffect(() => {
    if (canView('DASHBOARD')) {
      fetchAccounts()
      fetchOpportunities()
      fetchQuotes()
    }
  }, [canView, fetchAccounts, fetchOpportunities, fetchQuotes])

  const handleRefresh = useCallback(async () => {
    if (!canView('DASHBOARD')) {
      toast.error('No tienes permiso para ver el dashboard')
      return
    }
    try {
      await Promise.all([
        fetchAccounts(),
        fetchOpportunities(),
        fetchQuotes()
      ])
      logAction('VIEW', 'DASHBOARD', 'main-dashboard', 'Panel de Control actualizado')
      toast.info('Dashboard actualizado')
    } catch (error) {
      console.error('Dashboard refresh error:', error)
      toast.error('Error al actualizar el dashboard')
    }
  }, [canView, fetchAccounts, fetchOpportunities, fetchQuotes, logAction, toast])

  const totalPipeline = (Array.isArray(opportunities) ? opportunities : []).reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0)
  const formattedPipeline = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(totalPipeline)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Panel de Control CRM"
        description="Resumen ejecutivo de la actividad comercial"
        icon={<LayoutDashboard className="w-5 h-5" />}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        variant="success"
        badges={[
          { label: 'Pipeline', value: formattedPipeline, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Leads', value: (Array.isArray(accounts) ? accounts : []).filter(a => a.status === 'PROSPECT').length, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Clientes Totales', value: (Array.isArray(accounts) ? accounts : []).length.toString(), icon: Users, color: 'text-blue-500' },
            { label: 'Oportunidades', value: (Array.isArray(opportunities) ? opportunities : []).length.toString(), icon: Target, color: 'text-purple-500' },
            { label: 'Pipeline Total', value: formattedPipeline, icon: TrendingUp, color: 'text-gh-success' },
            { label: 'Cotizaciones', value: (Array.isArray(quotes) ? quotes : []).length.toString(), icon: DollarSign, color: 'text-orange-500' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 border border-gh-border rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md shadow-lg hover:border-gh-success/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gh-text-muted uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold text-gh-text tabular-nums">{stat.value}</div>
              <div className="text-[10px] text-gh-success mt-1 font-bold">Actualizado ahora</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md shadow-lg shadow-black/20">
            <h3 className="text-sm font-bold text-gh-text mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div>
                    <p className="text-sm text-gh-text">
                      <span className="font-bold">Juan Delgado</span> creó una nueva oportunidad para <span className="text-gh-success font-bold">Urbanísima Digital</span>
                    </p>
                    <p className="text-[11px] text-gh-text-muted mt-0.5">Hace 2 horas • €12,500.00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md shadow-lg shadow-black/20">
            <h3 className="text-sm font-bold text-gh-text mb-4">Próximas Tareas</h3>
            <div className="space-y-3">
              {[
                { task: 'Llamar a Urbanísima', time: '14:30', type: 'Llamada' },
                { task: 'Enviar propuesta técnica', time: '16:00', type: 'Email' },
                { task: 'Reunión de cierre', time: 'Mañana', type: 'Reunión' },
              ].map((item) => (
                <div key={item.task} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div>
                    <div className="text-xs font-bold text-gh-text">{item.task}</div>
                    <div className="text-[10px] text-gh-text-muted">{item.type}</div>
                  </div>
                  <div className="text-[10px] font-bold text-gh-text-muted tabular-nums">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
