'use client'

import React from 'react'
import { 
  LayoutDashboard,
  Building2, 
  Users, 
  Package, 
  Target, 
  MessageSquare, 
  BarChart3, 
  FileText,
  RefreshCw,
  DollarSign,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useCrmStore, type CrmSection } from '@/stores/crmStore'

const CRM_SECTIONS: { id: CrmSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'clients', label: 'Clientes', icon: <Building2 className="w-4 h-4" /> },
  { id: 'contacts', label: 'Contactos', icon: <Users className="w-4 h-4" /> },
  { id: 'products', label: 'Productos', icon: <Package className="w-4 h-4" /> },
  { id: 'opportunities', label: 'Oportunidades', icon: <Target className="w-4 h-4" /> },
  { id: 'interactions', label: 'Interacciones', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'history', label: 'Auditoría', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'subscriptions', label: 'Suscripciones', icon: <RefreshCw className="w-4 h-4" /> },
  { id: 'compliance', label: 'Cumplimiento', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'rules', label: 'Reglas', icon: <Settings className="w-4 h-4" /> },
  { id: 'templates', label: 'Plantillas PDF', icon: <FileText className="w-4 h-4" /> },
  { id: 'invoices', label: 'Facturación', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'quotes', label: 'Cotizaciones', icon: <FileText className="w-4 h-4" /> },
  { id: 'reports', label: 'Reportes', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
]

export default function CrmSidebar() {
  const { activeSection, setActiveSection, isSidebarCollapsed, toggleSidebar } = useCrmStore()

  return (
    <aside 
      className={`
        bg-white/5 backdrop-blur-xl border-r border-white/10 
        transition-all duration-300 flex flex-col 
        ${isSidebarCollapsed ? 'w-16' : 'w-60'}
      `}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        {!isSidebarCollapsed && (
          <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Módulo CRM
          </h2>
        )}
        <button 
          onClick={toggleSidebar}
          className="
            p-2 rounded-xl hover:bg-white/10 
            text-white/40 hover:text-white 
            transition-all duration-200
          "
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
        {CRM_SECTIONS.map((section) => {
          const isActive = activeSection === section.id
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                text-[12px] transition-all duration-200 group relative
                ${isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }
              `}
              title={isSidebarCollapsed ? section.label : undefined}
            >
              <div className={`
                flex-shrink-0 transition-colors duration-200
                ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white'}
              `}>
                {section.icon}
              </div>
              {!isSidebarCollapsed && <span className="truncate">{section.label}</span>}
              
              {isActive && (
                <div className="absolute left-0 w-1 h-4 bg-white rounded-full" />
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
