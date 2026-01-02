'use client'

import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useSidebarStore, type SidebarSection } from '@/stores/sidebarStore'

const SECTION_LABELS: Record<SidebarSection, { category: string; label: string }> = {
  // Analytics
  'analytics-dashboard': { category: 'Analytics', label: 'Dashboard' },
  'analytics-ventas': { category: 'Analytics', label: 'Ventas' },
  'analytics-clientes': { category: 'Analytics', label: 'Clientes' },
  // CRM
  'crm-dashboard': { category: 'CRM', label: 'Dashboard' },
  'crm-clientes': { category: 'CRM', label: 'Clientes' },
  'crm-contactos': { category: 'CRM', label: 'Contactos' },
  'crm-oportunidades': { category: 'CRM', label: 'Oportunidades' },
  'crm-interacciones': { category: 'CRM', label: 'Interacciones' },
  'crm-productos': { category: 'CRM', label: 'Productos' },
  'crm-historial': { category: 'CRM', label: 'Historial' },
  'crm-pricing': { category: 'CRM', label: 'Pricing' },
  'crm-suscripciones': { category: 'CRM', label: 'Suscripciones' },
  'crm-facturas': { category: 'CRM', label: 'Facturas' },
  'crm-cotizaciones': { category: 'CRM', label: 'Cotizaciones' },
  'crm-reportes': { category: 'CRM', label: 'Reportes' },
  'crm-compliance': { category: 'CRM', label: 'Compliance' },
  'crm-reglas': { category: 'CRM', label: 'Reglas' },
  'crm-plantillas': { category: 'CRM', label: 'Plantillas' },
  'crm-configuracion': { category: 'CRM', label: 'Configuración' },
  // Sales
  'sales-cotizaciones': { category: 'Sales', label: 'Cotizaciones' },
  'sales-pedidos': { category: 'Sales', label: 'Pedidos' },
  'sales-facturas': { category: 'Sales', label: 'Facturas' },
  'sales-descuentos': { category: 'Sales', label: 'Descuentos' },
  'sales-reportes': { category: 'Sales', label: 'Reportes' },
  // Inventory
  'inv-productos': { category: 'Inventory', label: 'Productos' },
  'inv-stock': { category: 'Inventory', label: 'Stock' },
  'inv-movimientos': { category: 'Inventory', label: 'Movimientos' },
  'inv-categorias': { category: 'Inventory', label: 'Categorías' },
  // Finance
  'fin-cobros': { category: 'Finance', label: 'Cobros' },
  'fin-pagos': { category: 'Finance', label: 'Pagos' },
  'fin-impuestos': { category: 'Finance', label: 'Impuestos' },
  'fin-contabilidad': { category: 'Finance', label: 'Contabilidad' },
  // People
  'ppl-empleados': { category: 'People', label: 'Empleados' },
  'ppl-nomina': { category: 'People', label: 'Nomina' },
  'ppl-asistencia': { category: 'People', label: 'Asistencia' },
  // Projects
  'prj-proyectos': { category: 'Projects', label: 'Proyectos' },
  'prj-tareas': { category: 'Projects', label: 'Tareas' },
  'prj-recursos': { category: 'Projects', label: 'Recursos' },
  // POS
  'pos-venta': { category: 'POS', label: 'Venta' },
  'pos-caja': { category: 'POS', label: 'Caja' },
  'pos-tickets': { category: 'POS', label: 'Tickets' },
  // eCommerce
  'eco-tiendas': { category: 'eCommerce', label: 'Tiendas' },
  'eco-pedidos': { category: 'eCommerce', label: 'Pedidos' },
  'eco-clientes': { category: 'eCommerce', label: 'Clientes' },
  // Licensing
  'lic-suscripciones': { category: 'Licensing', label: 'Suscripciones' },
  'lic-planes': { category: 'Licensing', label: 'Planes' },
  'lic-modulos': { category: 'Licensing', label: 'Módulos' },
  // Settings
  'set-general': { category: 'Settings', label: 'General' },
  'set-personalizacion': { category: 'Settings', label: 'Personalización' },
  'set-integraciones': { category: 'Settings', label: 'Integraciones' },
  // Legacy / Contextual
  'cot-info': { category: 'Cotización', label: 'Información' },
  'cot-cliente': { category: 'Cotización', label: 'Cliente' },
  'cot-proveedor': { category: 'Cotización', label: 'Proveedor' },
  'oferta-desc': { category: 'Oferta', label: 'Descripción' },
  'oferta-base': { category: 'Oferta', label: 'Servicios Base' },
  'oferta-opt': { category: 'Oferta', label: 'Opcionales' },
  'oferta-fin': { category: 'Oferta', label: 'Financiamiento' },
  'oferta-paq': { category: 'Oferta', label: 'Paquetes' },
  'oferta-caract': { category: 'Oferta', label: 'Características' },
  'cont-resumen': { category: 'Contenido', label: 'Resumen' },
  'cont-analisis': { category: 'Contenido', label: 'Análisis' },
  'cont-fortale': { category: 'Contenido', label: 'Fortalezas' },
  'cont-compar': { category: 'Contenido', label: 'Comparativa' },
  'cont-crono': { category: 'Contenido', label: 'Cronograma' },
  'cont-cuotas': { category: 'Contenido', label: 'Cuotas' },
  'cont-paq': { category: 'Contenido', label: 'Paquetes' },
  'cont-notas': { category: 'Contenido', label: 'Notas' },
  'cont-concl': { category: 'Contenido', label: 'Conclusión' },
  'cont-faq': { category: 'Contenido', label: 'FAQ' },
  'cont-garant': { category: 'Contenido', label: 'Garantías' },
  'cont-contact': { category: 'Contenido', label: 'Contacto' },
  'cont-terminos': { category: 'Contenido', label: 'Términos' },
  'hist-versiones': { category: 'Historial', label: 'Versiones' },
  'pref-config': { category: 'Preferencias', label: 'Configuración' },
  'pref-sync': { category: 'Preferencias', label: 'Sincronización' },
  'pref-usuarios': { category: 'Preferencias', label: 'Usuarios' },
  'pref-org': { category: 'Preferencias', label: 'Organizaciones' },
  'pref-roles': { category: 'Preferencias', label: 'Roles' },
  'pref-permisos': { category: 'Preferencias', label: 'Permisos' },
  'pref-matriz': { category: 'Preferencias', label: 'Matriz' },
  'pref-permuser': { category: 'Preferencias', label: 'Permisos Usuario' },
  'pref-logs': { category: 'Preferencias', label: 'Logs' },
  'pref-backups': { category: 'Preferencias', label: 'Backups' },
  'pref-reportes': { category: 'Preferencias', label: 'Reportes' },
}

interface AdminBreadcrumbsProps {
  className?: string
}

export default function AdminBreadcrumbs({ className }: AdminBreadcrumbsProps) {
  const { activeSection, setActiveSection } = useSidebarStore()
  const info = SECTION_LABELS[activeSection] || { category: 'Admin', label: 'Inicio' }

  // Mapeo de categorías a sus secciones por defecto
  const categoryDefaults: Record<string, SidebarSection> = {
    'Analytics': 'analytics-dashboard',
    'CRM': 'crm-dashboard',
    'Sales': 'sales-cotizaciones',
    'Inventory': 'inv-productos',
    'Finance': 'fin-cobros',
    'People': 'ppl-empleados',
    'Projects': 'prj-proyectos',
    'POS': 'pos-venta',
    'eCommerce': 'eco-tiendas',
    'Licensing': 'lic-suscripciones',
    'Settings': 'set-general',
    'Cotización': 'cot-info',
    'Oferta': 'oferta-desc',
    'Contenido': 'cont-resumen',
    'Historial': 'hist-versiones'
  }

  const handleCategoryClick = () => {
    const defaultSection = categoryDefaults[info.category]
    if (defaultSection) {
      setActiveSection(defaultSection)
    }
  }

  return (
    <nav className={`flex items-center gap-1 text-xs font-medium overflow-x-auto whitespace-nowrap scrollbar-none py-1 ${className}`}>
      <div 
        onClick={() => setActiveSection('analytics-dashboard')}
        className="flex items-center gap-1.5 px-2 py-1.5 text-gh-text-muted hover:text-gh-text hover:bg-white/5 rounded-md transition-all cursor-pointer group"
        title="Ir al Inicio"
      >
        <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">NovaSuite</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-white/10 shrink-0" />
      
      <div 
        onClick={handleCategoryClick}
        className="flex items-center gap-1.5 px-2 py-1.5 text-gh-text-muted hover:text-gh-text hover:bg-white/5 rounded-md transition-all cursor-pointer"
      >
        <span>{info.category}</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-white/10 shrink-0" />
      
      <div className="flex items-center gap-2 px-3 py-1.5 text-gh-success bg-gh-success/10 rounded-lg border border-gh-success/20 shadow-[0_0_15px_rgba(35,134,54,0.1)] backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-gh-success animate-pulse shadow-[0_0_8px_rgba(35,134,54,0.5)]" />
        <span className="font-bold tracking-tight">{info.label}</span>
      </div>
    </nav>
  )
}
