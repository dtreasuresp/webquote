'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import UsersTable from '../UsersTable'
import PreferenciasSidebar, { SidebarSection, SecuritySubSection } from '../content/preferencias/PreferenciasSidebar'
import ConfiguracionGeneralContent from '../content/preferencias/ConfiguracionGeneralContent'
import SincronizacionContent from '../content/preferencias/SincronizacionContent'
import SeguridadContent from '../content/preferencias/SeguridadContent'
import ReportesAuditoriaContent from '../content/preferencias/ReportesAuditoriaContent'
import LogsAuditoriaContent from '../content/preferencias/seguridad/LogsAuditoriaContent'
import BackupContent from '../content/preferencias/seguridad/BackupContent'
import OrganizacionContent from '../content/preferencias/organizacion/OrganizacionContent'
import { useUserPreferencesStore } from '@/stores'
import { useUserModalStore } from '@/stores/userModalStore'

interface User {
  id: string
  username: string
  nombre: string
  email: string | null
  telefono: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  quotationAssignedId: string | null
  organizationId: string | null
  quotationAssigned?: {
    id: string
    empresa: string
    numero: string
  } | null
  activo: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string | null
}

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
  
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  const saveHandler = async () => {
    const handler = guardarPreferencias ?? persistPreferences
    await handler()
    // Reload preferences from server to ensure everything is in sync
    await loadPreferences()
  }
  
  const [activeSection, setActiveSection] = useState<SidebarSection>('general')
  const [activeSecuritySubSection, setActiveSecuritySubSection] = useState<SecuritySubSection>('roles')

  const sectionIdToActiveSection = (sectionId?: string): SidebarSection => {
    const mapping: Record<string, SidebarSection> = {
      'pref-config': 'general',
      'pref-sync': 'sincronizacion',
      'pref-usuarios': 'usuarios',
      'pref-org': 'organizaciones',
      'pref-roles': 'seguridad',
      'pref-permisos': 'seguridad',
      'pref-matriz': 'seguridad',
      'pref-permuser': 'seguridad',
      'pref-logs': 'logs',
      'pref-backups': 'backups',
      'pref-reportes': 'reportes',
    }
    return (sectionId && mapping[sectionId]) || activeSection
  }

  const effectiveActiveSection = activeSectionId
    ? sectionIdToActiveSection(activeSectionId)
    : activeSection

  // Sincronizar el estado local con el prop del padre cuando activeSectionId cambia
  useEffect(() => {
    if (activeSectionId) {
      const newSection = sectionIdToActiveSection(activeSectionId)
      if (newSection !== activeSection) {
        setActiveSection(newSection)
      }
    }
  }, [activeSectionId, activeSection])

  // Cargar usuarios cuando se abre la sección 'usuarios'
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Error al cargar usuarios')
      const data = await response.json()
      setUsers(data.users || data)
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  // Cargar usuarios cuando se abre la sección 'usuarios'
  useEffect(() => {
    if (activeSection === 'usuarios' && users.length === 0) {
      fetchUsers()
    }
  }, [activeSection, users.length, fetchUsers])

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

          {/* Sección Usuarios */}
          {effectiveActiveSection === 'usuarios' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-gh-accent" />
                      Gestión de Usuarios
                    </h3>
                    <p className="text-xs text-gh-text-muted mt-0.5">Crea, edita y administra los usuarios del sistema</p>
                  </div>
                  <button
                    onClick={() => userModal.openNewUserModal()}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20 transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3 h-3" />
                    Nuevo Usuario
                  </button>
                </div>
                <UsersTable
                  users={users}
                  loading={loadingUsers}
                  onEdit={(user) => userModal.openEditUserModal(user)}
                  onResetPassword={(user) => userModal.openResetPasswordModal(user)}
                  onDelete={(user) => userModal.openDeleteUserModal(user)}
                />
              </div>
            </motion.div>
          )}

          {/* Sección Organizaciones */}
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

          {/* Sección Reportes de Auditoría */}
          {effectiveActiveSection === 'reportes' && (
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
      </div>
    </div>
  )
}
