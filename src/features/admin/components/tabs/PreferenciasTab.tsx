'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Settings, RefreshCw, Users, Building2, Shield, Key, LayoutGrid, FileText, BarChart3, ShieldCheck } from 'lucide-react'
import AdminSidebar, { SidebarItem } from '../AdminSidebar'
import ConfiguracionGeneralContent from '../content/preferencias/ConfiguracionGeneralContent'
import SincronizacionContent from '../content/preferencias/SincronizacionContent'
import UsuariosContent from '../content/preferencias/UsuariosContent'
import SeguridadContent from '../content/preferencias/SeguridadContent'
import ReportesAuditoriaContent from '../content/preferencias/ReportesAuditoriaContent'
import LogsAuditoriaContent from '../content/preferencias/seguridad/LogsAuditoriaContent'
import BackupContent from '../content/preferencias/seguridad/BackupContent'
import OrganizacionContent from '../content/preferencias/organizacion/OrganizacionContent'
import { useUserPreferencesStore } from '@/stores'
import { useUserModalStore } from '@/stores/userModalStore'

// Tipos locales para compatibilidad
type SidebarSection = 'general' | 'sincronizacion' | 'usuarios' | 'organizaciones' | 'seguridad' | 'logs' | 'backups' | 'reportes'
type SecuritySubSection = 'roles' | 'permisos' | 'matriz' | 'usuarios-permisos'

interface PreferenciasTabProps {
  readonly activeSectionId?: string
  readonly guardarPreferencias?: () => Promise<void>
  quotations?: any[]
}

export default function PreferenciasTab({
  activeSectionId,
  guardarPreferencias,
  quotations = [],
}: Readonly<PreferenciasTabProps>) {
  const persistPreferences = useUserPreferencesStore((s) => s.persistPreferences)
  const loadPreferences = useUserPreferencesStore((s) => s.loadPreferences)
  const isDirty = useUserPreferencesStore((s) => s.isDirty)
  const userModal = useUserModalStore()
  
  const saveHandler = async () => {
    const handler = guardarPreferencias ?? persistPreferences
    await handler()
    // Reload preferences from server to ensure everything is in sync
    await loadPreferences()
  }
  
  const [activeSection, setActiveSection] = useState<SidebarSection>('general')
  const [activeSecuritySubSection, setActiveSecuritySubSection] = useState<SecuritySubSection>('roles')
  const [lastSyncedId, setLastSyncedId] = useState<string | undefined>(undefined)

  // Items para la sidebar unificada (aplanados para mejor UX)
  const prefItems: SidebarItem[] = [
    { id: 'general', label: 'Configuración General', icon: Settings },
    { id: 'sincronizacion', label: 'Sincronización', icon: RefreshCw },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users },
    { id: 'organizaciones', label: 'Estructura Organizacional', icon: Building2 },
    { id: 'roles', label: 'Roles (Seguridad)', icon: Shield },
    { id: 'permisos', label: 'Permisos (Seguridad)', icon: Key },
    { id: 'matriz', label: 'Matriz de Acceso', icon: LayoutGrid },
    { id: 'usuarios-permisos', label: 'Permisos por Usuario', icon: Users },
    { id: 'logs', label: 'Logs de Auditoría', icon: FileText },
    { id: 'backups', label: 'Backups', icon: Shield },
    { id: 'reportes', label: 'Reportes de Auditoría', icon: BarChart3 },
  ]

  const handleItemClick = (id: string) => {
    const securityItems = ['roles', 'permisos', 'matriz', 'usuarios-permisos']
    if (securityItems.includes(id)) {
      setActiveSection('seguridad')
      setActiveSecuritySubSection(id as SecuritySubSection)
    } else {
      setActiveSection(id as SidebarSection)
    }
  }

  const activeItem = ['roles', 'permisos', 'matriz', 'usuarios-permisos'].includes(activeSecuritySubSection) && activeSection === 'seguridad'
    ? activeSecuritySubSection
    : activeSection

  const sectionIdToActiveSection = useCallback((sectionId?: string): SidebarSection => {
    const mapping: Record<string, SidebarSection> = {
      'pref-config': 'general',
      'pref-sync': 'sincronizacion',
      'pref-usuarios': 'usuarios',
      'pref-org': 'organizaciones',
      'pref-roles': 'seguridad',
      'pref-permisos': 'seguridad',
      'pref-matriz': 'seguridad',
      'pref-permuser': 'seguridad',
      'pref-logs': 'seguridad',
      'pref-backups': 'seguridad',
      'pref-reportes': 'reportes',
    }
    return (sectionId && mapping[sectionId]) || 'general'
  }, [])

  const effectiveActiveSection = activeSectionId
    ? sectionIdToActiveSection(activeSectionId)
    : activeSection

  // Sincronizar el estado local con el prop del padre SOLO cuando el ID externo cambie
  useEffect(() => {
    if (activeSectionId && activeSectionId !== lastSyncedId) {
      const newSection = sectionIdToActiveSection(activeSectionId)
      setActiveSection(newSection)
      setLastSyncedId(activeSectionId)

      // Sincronizar subsección de seguridad si aplica
      if (activeSectionId === 'pref-roles') setActiveSecuritySubSection('roles')
      if (activeSectionId === 'pref-permisos') setActiveSecuritySubSection('permisos')
      if (activeSectionId === 'pref-matriz') setActiveSecuritySubSection('matriz')
      if (activeSectionId === 'pref-permuser') setActiveSecuritySubSection('usuarios-permisos')
      if (activeSectionId === 'pref-logs') setActiveSecuritySubSection('logs')
      if (activeSectionId === 'pref-backups') setActiveSecuritySubSection('backups')
    }
  }, [activeSectionId, lastSyncedId, sectionIdToActiveSection])

  return (
    <div className="flex bg-transparent border border-white/10 rounded-xl overflow-hidden">
      <AdminSidebar
        items={prefItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        title="Preferencias"
        titleIcon={Settings}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {/* Sección Configuración General */}
          {effectiveActiveSection === 'general' && (
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
          {effectiveActiveSection === 'sincronizacion' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SincronizacionContent />
            </motion.div>
          )}

          {/* Sección Gestión de Usuarios */}
          {effectiveActiveSection === 'usuarios' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UsuariosContent />
            </motion.div>
          )}

          {/* Sección Estructura Organizacional */}
          {effectiveActiveSection === 'organizaciones' && (
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
          {effectiveActiveSection === 'seguridad' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SeguridadContent activeSubSection={activeSecuritySubSection} />
            </motion.div>
          )}

          {/* Sección Logs de Auditoría */}
          {effectiveActiveSection === 'logs' && (
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
          {effectiveActiveSection === 'backups' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BackupContent />
            </motion.div>
          )}

          {/* Sección Reportes de Auditoría */}
          {effectiveActiveSection === 'reportes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReportesAuditoriaContent quotations={quotations} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
