'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import UserManagementPanel from '../UserManagementPanel'
import PreferenciasSidebar, { SidebarSection, SecuritySubSection } from '../content/preferencias/PreferenciasSidebar'
import ConfiguracionGeneralContent from '../content/preferencias/ConfiguracionGeneralContent'
import SincronizacionContent from '../content/preferencias/SincronizacionContent'
import SeguridadContent from '../content/preferencias/SeguridadContent'
import ReportesAuditoriaContent from '../content/preferencias/ReportesAuditoriaContent'
import LogsAuditoriaContent from '../content/preferencias/seguridad/LogsAuditoriaContent'
import BackupContent from '../content/preferencias/seguridad/BackupContent'
import OrganizacionContent from '../content/preferencias/organizacion/OrganizacionContent'
import { useUserPreferencesStore } from '@/stores'

interface QuotationOption {
  id: string
  nombre: string
  numero: string | number
}

interface PreferenciasTabProps {
  guardarPreferencias?: () => Promise<void>
  quotations?: QuotationOption[]
}

export default function PreferenciasTab({
  guardarPreferencias,
  quotations = [],
}: Readonly<PreferenciasTabProps>) {
  const persistPreferences = useUserPreferencesStore((s) => s.persistPreferences)
  const loadPreferences = useUserPreferencesStore((s) => s.loadPreferences)
  const isDirty = useUserPreferencesStore((s) => s.isDirty)
  
  const saveHandler = async () => {
    const handler = guardarPreferencias ?? persistPreferences
    await handler()
    // Reload preferences from server to ensure everything is in sync
    await loadPreferences()
  }
  
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
              <ConfiguracionGeneralContent isDirty={isDirty} onSave={saveHandler} />
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
              <SincronizacionContent />
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

          {/* Sección Organizaciones */}
          {activeSection === 'organizaciones' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <OrganizacionContent />
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

          {/* Sección Reportes de Auditoría */}
          {activeSection === 'reportes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReportesAuditoriaContent isDirty={isDirty} onSave={saveHandler} />
            </motion.div>
          )}

          {/* Sección Logs de Auditoría */}
          {activeSection === 'logs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LogsAuditoriaContent />
            </motion.div>
          )}

          {/* Sección Backups */}
          {activeSection === 'backups' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BackupContent />
            </motion.div>
          )}
      </div>
    </div>
  )
}
