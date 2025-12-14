'use client'

import React, { useState, useMemo } from 'react'
import { Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserPreferences } from '@/lib/types'
import UserManagementPanel from '../UserManagementPanel'
import PreferenciasSidebar, { SidebarSection, SecuritySubSection } from '../content/preferencias/PreferenciasSidebar'
import ConfiguracionGeneralContent from '../content/preferencias/ConfiguracionGeneralContent'
import SincronizacionContent from '../content/preferencias/SincronizacionContent'
import SeguridadContent from '../content/preferencias/SeguridadContent'

interface QuotationOption {
  id: string
  nombre: string
  numero: string | number
}

interface PreferenciasTabProps {
  userPreferences: UserPreferences | null
  setUserPreferences: (prefs: UserPreferences) => void
  guardarPreferencias: () => Promise<void>
  quotations?: QuotationOption[]
}

export default function PreferenciasTab({
  userPreferences,
  setUserPreferences,
  guardarPreferencias,
  quotations = [],
}: Readonly<PreferenciasTabProps>) {
  
  const [activeSection, setActiveSection] = useState<SidebarSection>('general')
  const [activeSecuritySubSection, setActiveSecuritySubSection] = useState<SecuritySubSection>('roles')

  // Memoizar quotations para evitar re-renders innecesarios
  const memoizedQuotations = useMemo(() => quotations, [quotations.length])

  return (
    <div className="pl-2 pr-6 py-6 flex gap-6 items-stretch">
      <PreferenciasSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        activeSecuritySubSection={activeSecuritySubSection}
        onSecuritySubSectionChange={setActiveSecuritySubSection}
      />

      <div className="flex-1">
          {/* Sección Configuración General */}
          {activeSection === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ConfiguracionGeneralContent
                userPreferences={userPreferences}
                setUserPreferences={setUserPreferences}
              />
            </motion.div>
          )}

          {/* Sección Sincronización */}
          {activeSection === 'sincronizacion' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SincronizacionContent
                userPreferences={userPreferences}
                setUserPreferences={setUserPreferences}
              />
            </motion.div>
          )}

          {/* Sección Usuarios */}
          {activeSection === 'usuarios' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UserManagementPanel quotations={memoizedQuotations} />
            </motion.div>
          )}

          {/* Sección Seguridad y Acceso */}
          {activeSection === 'seguridad' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SeguridadContent activeSubSection={activeSecuritySubSection} />
            </motion.div>
          )}

          {/* Botón Guardar (visible en secciones de configuración) */}
          {(activeSection === 'general' || activeSection === 'sincronizacion') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end mt-8"
            >
              <button
                onClick={guardarPreferencias}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors text-xs font-medium"
              >
                <Save className="w-2.5 h-2.5" /> Guardar Cambios
              </button>
            </motion.div>
          )}
      </div>
    </div>
  )
}


