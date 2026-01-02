'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, Users, DollarSign, History, LayoutDashboard, Activity, Layout } from 'lucide-react'
import AdminSidebar, { SidebarItem } from '@/features/admin/components/AdminSidebar'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { AnalyticsDashboard } from '../AnalyticsDashboard'
import KPICards from '../KPICards'
import { HistorialAnalyticsSection } from '../HistorialAnalyticsSection'

interface AnalyticsTabProps {
  activeSectionId?: string
  snapshots?: any[]
  cargandoSnapshots?: boolean
}

// Componente interno para la Vista General (tu snippet)
const AnalyticsOverview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Ingresos Totales', value: '€1.2M', icon: DollarSign, color: 'text-emerald-400' },
        { label: 'Crecimiento', value: '+24%', icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Usuarios Activos', value: '1,240', icon: Users, color: 'text-purple-400' },
        { label: 'Conversión', value: '3.2%', icon: BarChart3, color: 'text-amber-400' },
      ].map((stat) => (
        <div key={stat.label} className="p-4 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{stat.label}</span>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="text-xl font-bold text-white tabular-nums">{stat.value}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-medium">+12% vs mes anterior</div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg shadow-black/20 h-64 flex items-center justify-center">
        <p className="text-xs text-white/20 italic">Gráfico de Tendencias (Próximamente)</p>
      </div>
      <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg shadow-black/20 h-64 flex items-center justify-center">
        <p className="text-xs text-white/20 italic">Distribución por Categoría (Próximamente)</p>
      </div>
    </div>
  </div>
)

export default function AnalyticsTab({ 
  activeSectionId, 
  snapshots = [], 
  cargandoSnapshots = false 
}: AnalyticsTabProps) {
  const [activeSection, setActiveSection] = useState('overview')
  const [lastSyncedId, setLastSyncedId] = useState<string | undefined>(undefined)

  // Mapeo de IDs de sidebar global a secciones internas
  const sectionIdToActiveSection = useCallback((sectionId?: string) => {
    const mapping: Record<string, string> = {
      'analytics-dashboard': 'overview',
      'analytics-ventas': 'kpis',
      'analytics-clientes': 'historial',
      'analytics-performance': 'dashboard'
    }
    return (sectionId && mapping[sectionId]) || 'overview'
  }, [])

  // Sincronizar con el prop del padre SOLO cuando el ID externo cambie
  useEffect(() => {
    if (activeSectionId && activeSectionId !== lastSyncedId) {
      const newSection = sectionIdToActiveSection(activeSectionId)
      setActiveSection(newSection)
      setLastSyncedId(activeSectionId)
    }
  }, [activeSectionId, lastSyncedId, sectionIdToActiveSection])

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Vista General', icon: Layout },
    { id: 'dashboard', label: 'Performance App', icon: Activity },
    { id: 'kpis', label: 'Métricas KPI', icon: TrendingUp },
    { id: 'historial', label: 'Análisis Historial', icon: History },
  ]

  const getHeaderInfo = () => {
    switch(activeSection) {
      case 'overview': return { title: 'Dashboard Analítico', desc: 'Vista general del rendimiento del negocio' }
      case 'dashboard': return { title: 'Performance de Aplicación', desc: 'Métricas de eventos y rendimiento técnico' }
      case 'kpis': return { title: 'Indicadores Clave (KPI)', desc: 'Seguimiento de objetivos y métricas de ventas' }
      case 'historial': return { title: 'Análisis de Historial', desc: 'Tendencias y comportamiento de cotizaciones' }
      default: return { title: 'Analítica', desc: 'Panel de control' }
    }
  }

  const header = getHeaderInfo()

  return (
    <div className="flex bg-transparent border border-white/10 rounded-xl overflow-hidden">
      <AdminSidebar
        items={sidebarItems}
        activeItem={activeSection}
        onItemClick={setActiveSection}
        title="Analítica"
        titleIcon={BarChart3}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden p-6">
        <SectionHeader
          title={header.title}
          description={header.desc}
          icon={<BarChart3 className="w-5 h-5" />}
          variant="accent"
        />

        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'overview' && <AnalyticsOverview />}
              {activeSection === 'dashboard' && <AnalyticsDashboard />}
              {activeSection === 'kpis' && <KPICards snapshots={snapshots} cargandoSnapshots={cargandoSnapshots} />}
              {activeSection === 'historial' && <HistorialAnalyticsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}