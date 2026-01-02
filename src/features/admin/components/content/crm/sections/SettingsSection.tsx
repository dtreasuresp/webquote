'use client'

import React, { useState, useCallback } from 'react'
import { Settings, Shield, Bell, Database, Globe } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function SettingsSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canEdit } = useAdminPermissions()
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = useCallback(() => {
    if (!canEdit('SETTINGS')) {
      toast.error('No tienes permiso para modificar la configuración')
      return
    }
    logAction('UPDATE', 'SETTINGS', 'crm-config', 'Configuración General')
    toast.success('Configuración guardada correctamente')
  }, [canEdit, logAction, toast])

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      logAction('VIEW', 'SETTINGS', 'crm-settings', 'Panel de Configuración')
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info('Configuración sincronizada')
    } finally {
      setIsLoading(false)
    }
  }, [logAction, toast])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Configuración CRM"
        description="Personaliza el comportamiento y las reglas de tu CRM"
        icon={<Settings className="w-5 h-5" />}
        onAdd={handleSaveSettings}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        variant="success"
        badges={[
          { label: 'Seguridad', value: 'Alta', color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'API', value: 'Activa', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border border-gh-border rounded-xl bg-[#161b22]/20 hover:border-gh-success/30 transition-all text-left group">
              <Shield className="w-5 h-5 text-gh-text-muted group-hover:text-gh-success mb-3" />
              <h4 className="text-sm font-bold text-gh-text">Permisos y Roles</h4>
              <p className="text-xs text-gh-text-muted mt-1">Define quién puede ver y editar datos sensibles.</p>
            </button>
            <button className="p-4 border border-gh-border rounded-xl bg-[#161b22]/20 hover:border-gh-success/30 transition-all text-left group">
              <Bell className="w-5 h-5 text-gh-text-muted group-hover:text-gh-success mb-3" />
              <h4 className="text-sm font-bold text-gh-text">Notificaciones</h4>
              <p className="text-xs text-gh-text-muted mt-1">Configura alertas para nuevas oportunidades y tareas.</p>
            </button>
            <button className="p-4 border border-gh-border rounded-xl bg-[#161b22]/20 hover:border-gh-success/30 transition-all text-left group">
              <Database className="w-5 h-5 text-gh-text-muted group-hover:text-gh-success mb-3" />
              <h4 className="text-sm font-bold text-gh-text">Campos Personalizados</h4>
              <p className="text-xs text-gh-text-muted mt-1">Añade metadatos específicos a tus clientes y contactos.</p>
            </button>
            <button className="p-4 border border-gh-border rounded-xl bg-[#161b22]/20 hover:border-gh-success/30 transition-all text-left group">
              <Globe className="w-5 h-5 text-gh-text-muted group-hover:text-gh-success mb-3" />
              <h4 className="text-sm font-bold text-gh-text">Integraciones API</h4>
              <p className="text-xs text-gh-text-muted mt-1">Conecta tu CRM con herramientas externas.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
