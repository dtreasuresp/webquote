'use client'

import React, { lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import { useCrmStore } from '@/stores/crmStore'

// Lazy loading de las secciones
const DashboardSection = lazy(() => import('./sections/DashboardSection'))
const ClientsSection = lazy(() => import('./sections/ClientsSection'))
const ContactsSection = lazy(() => import('./sections/ContactsSection'))
const ProductsSection = lazy(() => import('./sections/ProductsSection'))
const OpportunitiesSection = lazy(() => import('./sections/OpportunitiesSection'))
const InteractionsSection = lazy(() => import('./sections/InteractionsSection'))
const SubscriptionsSection = lazy(() => import('./sections/SubscriptionsSection'))
const InvoicesSection = lazy(() => import('./sections/InvoicesSection'))
const QuotesSection = lazy(() => import('./sections/QuotesSection'))
const ReportsSection = lazy(() => import('./sections/ReportsSection'))
const SettingsSection = lazy(() => import('./sections/SettingsSection'))
const HistorySection = lazy(() => import('./sections/HistorySection'))
const PricingSection = lazy(() => import('./sections/PricingSection'))
const ComplianceSection = lazy(() => import('./sections/ComplianceSection'))
const RulesSection = lazy(() => import('./sections/RulesSection'))
const TemplatesSection = lazy(() => import('./sections/TemplatesSection'))
const CrmModals = lazy(() => import('./modals/CrmModals'))

const SectionLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white/40">
    <Loader2 className="w-8 h-8 animate-spin text-white/20 mb-4" />
    <p className="text-sm animate-pulse font-medium tracking-wide">Cargando módulo...</p>
  </div>
)

interface CrmContainerProps {
  readonly onLoad?: () => void
}

export default function CrmContainer({ onLoad }: Readonly<CrmContainerProps>) {
  const { activeSection, error } = useCrmStore()

  useEffect(() => {
    if (onLoad) {
      onLoad()
    }
  }, [onLoad])

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection />
      case 'clients': return <ClientsSection />
      case 'contacts': return <ContactsSection />
      case 'products': return <ProductsSection />
      case 'opportunities': return <OpportunitiesSection />
      case 'interactions': return <InteractionsSection />
      case 'subscriptions': return <SubscriptionsSection />
      case 'invoices': return <InvoicesSection />
      case 'quotes': return <QuotesSection />
      case 'reports': return <ReportsSection />
      case 'settings': return <SettingsSection />
      case 'history': return <HistorySection />
      case 'pricing': return <PricingSection />
      case 'compliance': return <ComplianceSection />
      case 'rules': return <RulesSection />
      case 'templates': return <TemplatesSection />
      default: return <DashboardSection />
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400/80 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error en el módulo CRM</h3>
        <p className="text-white/40 max-w-md">{error}</p>
        <button 
          onClick={() => globalThis.location.reload()}
          className="
            mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 
            text-white rounded-xl border border-white/10 
            transition-all duration-200 font-medium
          "
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-hidden flex flex-col relative bg-transparent">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <Suspense fallback={<SectionLoader />}>
            <div className="flex-1 overflow-y-auto scrollbar-none">
              {renderContent()}
            </div>
          </Suspense>
        </motion.div>
      </AnimatePresence>
      
      {/* Modales Globales del CRM */}
      <Suspense fallback={null}>
        <CrmModals />
      </Suspense>
    </main>
  )
}

