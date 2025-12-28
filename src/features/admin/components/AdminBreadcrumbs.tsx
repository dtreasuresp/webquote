'use client'

import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useSidebarStore, type SidebarSection } from '@/stores/sidebarStore'

const SECTION_LABELS: Record<SidebarSection, { category: string; label: string }> = {
  // Cotización
  'cot-info': { category: 'Cotización', label: 'Información' },
  'cot-cliente': { category: 'Cotización', label: 'Cliente' },
  'cot-proveedor': { category: 'Cotización', label: 'Proveedor' },
  // Oferta
  'oferta-desc': { category: 'Oferta', label: 'Descripción' },
  'oferta-base': { category: 'Oferta', label: 'Servicios Base' },
  'oferta-opt': { category: 'Oferta', label: 'Opcionales' },
  'oferta-fin': { category: 'Oferta', label: 'Financiamiento' },
  'oferta-paq': { category: 'Oferta', label: 'Paquetes' },
  'oferta-caract': { category: 'Oferta', label: 'Características' },
  // Contenido
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
  // Historial
  'hist-versiones': { category: 'Historial', label: 'Versiones' },
  // CRM
  'crm-clientes': { category: 'CRM', label: 'Clientes' },
  'crm-contactos': { category: 'CRM', label: 'Contactos' },
  'crm-productos': { category: 'CRM', label: 'Productos' },
  'crm-oportunidades': { category: 'CRM', label: 'Oportunidades' },
  'crm-interacciones': { category: 'CRM', label: 'Interacciones' },
  'crm-historial': { category: 'CRM', label: 'Historial' },
  'crm-pricing': { category: 'CRM', label: 'Pricing' },
  'crm-suscripciones': { category: 'CRM', label: 'Suscripciones' },
  'crm-compliance': { category: 'CRM', label: 'Compliance' },
  'crm-reglas': { category: 'CRM', label: 'Reglas' },
  'crm-plantillas': { category: 'CRM', label: 'Plantillas' },
  // Preferencias
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

export default function AdminBreadcrumbs() {
  const { activeSection } = useSidebarStore()
  const info = SECTION_LABELS[activeSection] || { category: 'Admin', label: 'Inicio' }

  return (
    <nav className="flex items-center gap-2 text-xs font-medium mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
      <div className="flex items-center gap-1.5 text-gh-text-muted hover:text-gh-text transition-colors cursor-pointer">
        <Home className="w-3.5 h-3.5" />
        <span>Admin</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-gh-border" />
      
      <div className="flex items-center gap-1.5 text-gh-text-muted hover:text-gh-text transition-colors cursor-pointer">
        <span>{info.category}</span>
      </div>
      
      <ChevronRight className="w-3 h-3 text-gh-border" />
      
      <div className="flex items-center gap-1.5 text-gh-accent bg-gh-accent/10 px-2 py-0.5 rounded-full">
        <span className="font-bold">{info.label}</span>
      </div>
    </nav>
  )
}
