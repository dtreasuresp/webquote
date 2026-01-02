'use client'

import React from 'react'
import { Settings, Save } from 'lucide-react'
import ToggleItem, { ToggleGroup } from '@/features/admin/components/ToggleItem'
import { useUserPreferencesStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'

interface ConfiguracionGeneralContentProps {
  isDirty?: boolean
  onSave?: () => Promise<void>
  updatedAt?: string | null
}

export default function ConfiguracionGeneralContent({ isDirty = false, onSave, updatedAt }: Readonly<ConfiguracionGeneralContentProps>) {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('PREFERENCES')

  // All preferences from userPreferencesStore - single source of truth
  const cerrarModalAlGuardar = useUserPreferencesStore((s) => s.cerrarModalAlGuardar)
  const mostrarConfirmacionGuardado = useUserPreferencesStore((s) => s.mostrarConfirmacionGuardado)
  const validarDatosAntes = useUserPreferencesStore((s) => s.validarDatosAntes)
  const limpiarFormulariosAlCrear = useUserPreferencesStore((s) => s.limpiarFormulariosAlCrear)
  const mantenerDatosAlCrearCotizacion = useUserPreferencesStore((s) => s.mantenerDatosAlCrearCotizacion)
  const guardarAutomaticamente = useUserPreferencesStore((s) => s.guardarAutomaticamente)
  
  const updatePreferencesSync = useUserPreferencesStore((s) => s.updatePreferencesSync)
  const setDirty = useUserPreferencesStore((s) => s.setDirty)

  const config = {
    cerrarModalAlGuardar: cerrarModalAlGuardar || false,
    mostrarConfirmacionGuardado: mostrarConfirmacionGuardado || false,
    validarDatosAntes: validarDatosAntes || false,
    limpiarFormulariosAlCrear: limpiarFormulariosAlCrear || false,
    mantenerDatosAlCrearCotizacion: mantenerDatosAlCrearCotizacion || false,
    guardarAutomaticamente: guardarAutomaticamente ?? true,
  }

  const activeCount = Object.values(config).filter(Boolean).length

  // Helper para actualizar preferencias respetando guardarAutomaticamente
  const handlePreferenceChange = (patch: Record<string, any>) => {
    if (!canEdit) return
    // Si guardarAutomaticamente está activado, guardar inmediatamente
    // Si está desactivado, solo actualizar el estado local (sin hacer ningún request a la API)
    if (guardarAutomaticamente ?? true) {
      updatePreferencesSync(patch)
      logAction('UPDATE', 'PREFERENCES', 'preference-change', `Actualizada preferencia: ${Object.keys(patch)[0]}`)
    } else {
      // Solo actualizar estado local sin sincronizar a la API
      // Marcar como dirty para que el usuario use "Guardar Cambios"
      useUserPreferencesStore.setState({ ...patch, isDirty: true })
      setDirty(true)
    }
  }

  // Caso especial: cambios en "guardarAutomaticamente" SIEMPRE se guardan inmediatamente
  const handleAutoSaveToggle = (v: boolean) => {
    if (!canEdit) return
    updatePreferencesSync({ guardarAutomaticamente: v })
    logAction('UPDATE', 'PREFERENCES', 'autosave-toggle', `Autoguardado ${v ? 'activado' : 'desactivado'}`)
  }

  // Lógica del botón Guardar Cambios
  const isAutoSaveEnabled = guardarAutomaticamente ?? true
  const isSaveButtonEnabled = isDirty ?? false

  const handleSaveClick = () => {
    if (!canEdit) return
    if (!isAutoSaveEnabled && onSave) {
      onSave()
      logAction('UPDATE', 'PREFERENCES', 'save-all', 'Guardados todos los cambios de preferencias')
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader 
        title="Configuración General"
        description="Preferencias generales de comportamiento de la aplicación"
        icon={<Settings className="w-4 h-4" />}
        updatedAt={updatedAt}
        onSave={handleSaveClick}
        isSaving={false} // Podríamos pasar un estado de guardando si onSave lo tuviera
        statusIndicator={isDirty ? 'modificado' : 'guardado'}
        variant="accent"
      />

      {/* Preferencias Generales */}
      <div className="px-0">
        <div className="mt-3">
          <ToggleGroup title="Comportamiento General">
            <ToggleItem
              enabled={guardarAutomaticamente ?? true}
              onChange={handleAutoSaveToggle}
              title="Guardar automáticamente"
              description="Guarda los cambios de forma automática mientras editas. Desactiva para guardar manualmente con el botón Guardar Cambios"
            />

            <ToggleItem
              enabled={cerrarModalAlGuardar}
              onChange={(v) => handlePreferenceChange({ cerrarModalAlGuardar: v })}
              title="Cerrar modal al guardar"
              description="Cierra automáticamente el modal después de guardar cambios"
            />

            <ToggleItem
              enabled={mostrarConfirmacionGuardado}
              onChange={(v) => handlePreferenceChange({ mostrarConfirmacionGuardado: v })}
              title="Mostrar confirmación al guardar"
              description="Muestra un mensaje de confirmación al guardar cambios"
            />

            <ToggleItem
              enabled={validarDatosAntes}
              onChange={(v) => handlePreferenceChange({ validarDatosAntes: v })}
              title="Validar datos antes de guardar"
              description="Valida los datos antes de permitir guardar cambios"
            />

            <ToggleItem
              enabled={limpiarFormulariosAlCrear}
              onChange={(v) => handlePreferenceChange({ limpiarFormulariosAlCrear: v })}
              title="Limpiar formularios al crear"
              description="Reinicia servicios, descuentos y opciones de pago al crear una nueva cotización. Desactiva para mantener templates."
            />

            <ToggleItem
              enabled={!!mantenerDatosAlCrearCotizacion}
              onChange={(v) => handlePreferenceChange({ mantenerDatosAlCrearCotizacion: v })}
              title="Mantener datos al crear cotización"
              description="Al crear una nueva cotización, mantiene los datos guardados como template (servicios, descripciones, pagos) en lugar de iniciar vacío"
            />
          </ToggleGroup>
        </div>
      </div>
    </div>
  )
}


