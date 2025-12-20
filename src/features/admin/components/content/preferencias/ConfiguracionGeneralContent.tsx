'use client'

import React from 'react'
import { Settings, Save } from 'lucide-react'
import ToggleItem, { ToggleGroup } from '@/features/admin/components/ToggleItem'
import { useUserPreferencesStore } from '@/stores'

interface ConfiguracionGeneralContentProps {
  isDirty?: boolean
  onSave?: () => Promise<void>
}

export default function ConfiguracionGeneralContent({ isDirty = false, onSave }: Readonly<ConfiguracionGeneralContentProps>) {
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
    // Si guardarAutomaticamente está activado, guardar inmediatamente
    // Si está desactivado, solo actualizar el estado local (sin hacer ningún request a la API)
    if (guardarAutomaticamente ?? true) {
      updatePreferencesSync(patch)
    } else {
      // Solo actualizar estado local sin sincronizar a la API
      // Marcar como dirty para que el usuario use "Guardar Cambios"
      useUserPreferencesStore.setState({ ...patch, isDirty: true })
      setDirty(true)
    }
  }

  // Caso especial: cambios en "guardarAutomaticamente" SIEMPRE se guardan inmediatamente
  const handleAutoSaveToggle = (v: boolean) => {
    updatePreferencesSync({ guardarAutomaticamente: v })
  }

  // Lógica del botón Guardar Cambios
  const isAutoSaveEnabled = guardarAutomaticamente ?? true
  const isSaveButtonEnabled = isDirty ?? false
  const shouldShowSaveButtonActive = !isAutoSaveEnabled && isSaveButtonEnabled
  const saveButtonStyles = shouldShowSaveButtonActive
    ? 'bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20'
    : 'bg-gh-bg text-gh-text-muted border border-gh-border/20 cursor-not-allowed'

  const handleSaveClick = () => {
    if (!isAutoSaveEnabled && onSave) {
      onSave()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header con Botón Guardar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <Settings className="w-4 h-4 text-gh-accent" />
            Configuración General
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Preferencias generales de comportamiento de la aplicación
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gh-text-muted bg-gh-bg-secondary px-2.5 py-1 rounded-md border border-gh-border/30">
            {activeCount} de {Object.keys(config).length - 1} activas
          </span>
          {/* Botón Guardar - Siempre visible, estado depende de guardarAutomaticamente */}
          <button
            onClick={handleSaveClick}
            disabled={isAutoSaveEnabled || !isSaveButtonEnabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${saveButtonStyles} rounded-md transition-colors text-xs font-medium`}
          >
            <Save className="w-2.5 h-2.5" /> 
            Guardar Cambios
          </button>
        </div>
      </div>

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


