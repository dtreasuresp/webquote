'use client'

import React, { Suspense, useCallback, useEffect, lazy, useState } from 'react'
import { Loader2, AlertCircle, LayoutDashboard, Building2, Users, Package, Target, MessageSquare, BarChart3, DollarSign, RefreshCw, ShieldCheck, Settings, FileText } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminSidebar, { SidebarItem } from '../AdminSidebar'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore } from '@/stores/crmStore'

// Lazy loading de las secciones del CRM
const DashboardSection = lazy(() => import('../content/crm/sections/DashboardSection'))
const ClientsSection = lazy(() => import('../content/crm/sections/ClientsSection'))
const ContactsSection = lazy(() => import('../content/crm/sections/ContactsSection'))
const ProductsSection = lazy(() => import('../content/crm/sections/ProductsSection'))
const OpportunitiesSection = lazy(() => import('../content/crm/sections/OpportunitiesSection'))
const InteractionsSection = lazy(() => import('../content/crm/sections/InteractionsSection'))
const SubscriptionsSection = lazy(() => import('../content/crm/sections/SubscriptionsSection'))
const InvoicesSection = lazy(() => import('../content/crm/sections/InvoicesSection'))
const QuotesSection = lazy(() => import('../content/crm/sections/QuotesSection'))
const ReportsSection = lazy(() => import('../content/crm/sections/ReportsSection'))
const SettingsSection = lazy(() => import('../content/crm/sections/SettingsSection'))
const HistorySection = lazy(() => import('../content/crm/sections/HistorySection'))
const PricingSection = lazy(() => import('../content/crm/sections/PricingSection'))
const ComplianceSection = lazy(() => import('../content/crm/sections/ComplianceSection'))
const RulesSection = lazy(() => import('../content/crm/sections/RulesSection'))
const TemplatesSection = lazy(() => import('../content/crm/sections/TemplatesSection'))
const CrmModals = lazy(() => import('../content/crm/modals/CrmModals'))

const SectionLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white/40">
    <Loader2 className="w-8 h-8 animate-spin text-white/20 mb-4" />
    <p className="text-sm animate-pulse font-medium tracking-wide">Cargando módulo...</p>
  </div>
)

interface CrmTabProps {
  activeSectionId?: string
}

export default function CrmTab({ activeSectionId }: CrmTabProps) {
  const { data: session } = useSession()
  const { logAction } = useAdminAudit()
  const { canView } = useAdminPermissions()
  const { fetchAccounts, fetchContacts, fetchProducts, activeSection, setActiveSection } = useCrmStore()
  const [lastSyncedId, setLastSyncedId] = useState<string | undefined>(undefined)

  // Mapeo de IDs de sidebar global a secciones internas del CRM
  const sectionIdToActiveSection = useCallback((sectionId?: string): typeof activeSection => {
    const mapping: Record<string, typeof activeSection> = {
      'crm-dashboard': 'dashboard',
      'crm-clientes': 'clients',
      'crm-contactos': 'contacts',
      'crm-productos': 'products',
      'crm-oportunidades': 'opportunities',
      'crm-interacciones': 'interactions',
      'crm-suscripciones': 'subscriptions',
      'crm-facturas': 'invoices',
      'crm-cotizaciones': 'quotes',
      'crm-reportes': 'reports',
      'crm-configuracion': 'settings',
      'crm-historial': 'history',
      'crm-pricing': 'pricing',
      'crm-compliance': 'compliance',
      'crm-reglas': 'rules',
      'crm-plantillas': 'templates',
    }
    return (sectionId && mapping[sectionId]) || 'dashboard'
  }, [])

  // Sincronizar el estado local con el prop del padre SOLO cuando el ID externo cambie
  useEffect(() => {
    if (activeSectionId && activeSectionId !== lastSyncedId) {
      const newSection = sectionIdToActiveSection(activeSectionId)
      setActiveSection(newSection)
      setLastSyncedId(activeSectionId)
    }
  }, [activeSectionId, lastSyncedId, setActiveSection, sectionIdToActiveSection])

  // Definición de items para la sidebar unificada
  const crmItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Building2 },
    { id: 'contacts', label: 'Contactos', icon: Users },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'opportunities', label: 'Oportunidades', icon: Target },
    { id: 'interactions', label: 'Interacciones', icon: MessageSquare },
    { id: 'history', label: 'Auditoría', icon: BarChart3 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'subscriptions', label: 'Suscripciones', icon: RefreshCw },
    { id: 'compliance', label: 'Cumplimiento', icon: ShieldCheck },
    { id: 'rules', label: 'Reglas', icon: Settings },
    { id: 'templates', label: 'Plantillas PDF', icon: FileText },
    { id: 'invoices', label: 'Facturación', icon: DollarSign },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  // Cargar datos base necesarios para modales y dropdowns
  useEffect(() => {
    if (canView('CLIENTS')) {
      fetchAccounts()
      fetchContacts()
      fetchProducts()
    }
  }, [canView, fetchAccounts, fetchContacts, fetchProducts])

  // Handler para log cuando se abre el CRM
  const handleCrmOpen = useCallback(() => {
    logAction('VIEW', 'CLIENTS', 'crm-dashboard', 'CRM Dashboard')
  }, [logAction])

  // Cargar log al montar
  useEffect(() => {
    handleCrmOpen()
  }, [handleCrmOpen])

  // Verificar permisos
  if (!canView('CLIENTS')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-[calc(100vh-180px)] min-h-[600px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl items-center justify-center flex-col gap-4 p-6 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3 text-white/60">
          <AlertCircle className="w-6 h-6" />
          <p className="text-sm font-medium">No tienes permisos para acceder al módulo CRM</p>
        </div>
        <p className="text-xs text-white/40">
          Contacta con un administrador para solicitar acceso
        </p>
      </motion.div>
    )
  }

  return (
    <div className="flex bg-transparent border border-white/10 rounded-xl overflow-hidden">
      {/* Sidebar de navegación interna del CRM (Unificada) */}
      <AdminSidebar 
        items={crmItems}
        activeItem={activeSection}
        onItemClick={(id) => setActiveSection(id as any)}
        title="Módulo CRM"
        titleIcon={Building2}
      />
      
      {/* Contenedor principal dinámico */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          <Suspense fallback={<SectionLoader />}>
            {activeSection === 'dashboard' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <DashboardSection />
              </motion.div>
            )}
            {activeSection === 'clients' && (
              <motion.div             
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <ClientsSection />
              </motion.div>
            )}
            {activeSection === 'contacts' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <ContactsSection />
              </motion.div>
            )}
            {activeSection === 'products' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <ProductsSection />
              </motion.div>
            )}
            {activeSection === 'opportunities' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <OpportunitiesSection />
              </motion.div>
            )}
            {activeSection === 'interactions' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <InteractionsSection />
              </motion.div>
            )}
            {activeSection === 'subscriptions' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <SubscriptionsSection />
              </motion.div>
            )}
            {activeSection === 'invoices' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <InvoicesSection />
              </motion.div>
            )}
            {activeSection === 'quotes' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <QuotesSection />
              </motion.div>
            )}
            {activeSection === 'reports' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <ReportsSection />
              </motion.div>
            )}
            {activeSection === 'settings' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <SettingsSection />
              </motion.div>
            )}
            {activeSection === 'history' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <HistorySection />
              </motion.div>
            )}
            {activeSection === 'pricing' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <PricingSection />
              </motion.div>
            )}
            {activeSection === 'compliance' && (
              <motion.div                 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <ComplianceSection />
              </motion.div>
            )}
            {activeSection === 'rules' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <RulesSection />
              </motion.div>
            )}
            {activeSection === 'templates' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
                >
                <TemplatesSection />
              </motion.div>
            )}
          </Suspense>
        </div>
      </div>

      {/* Modales Globales del CRM */}
      <Suspense fallback={null}>
        <CrmModals />
      </Suspense>
    </div>
  )
}
