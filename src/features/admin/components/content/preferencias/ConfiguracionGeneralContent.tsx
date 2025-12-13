'use client'

import React from 'react'
import { Settings } from 'lucide-react'
import { UserPreferences } from '@/lib/types'
import ToggleItem, { ToggleGroup } from '@/features/admin/components/ToggleItem'

interface ConfiguracionGeneralContentProps {
  userPreferences: UserPreferences | null
  setUserPreferences: (prefs: UserPreferences) => void
}

export default function ConfiguracionGeneralContent({
  userPreferences,
  setUserPreferences
}: Readonly<ConfiguracionGeneralContentProps>) {
  const config = {
    cerrarModalAlGuardar: userPreferences?.cerrarModalAlGuardar || false,
    mostrarConfirmacionGuardado: userPreferences?.mostrarConfirmacionGuardado || false,
    validarDatosAntes: userPreferences?.validarDatosAntes || false,
    limpiarFormulariosAlCrear: userPreferences?.limpiarFormulariosAlCrear || false,
    mantenerDatosAlCrearCotizacion: userPreferences?.mantenerDatosAlCrearCotizacion || false
  }

  const activeCount = Object.values(config).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Header */}
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
        <span className="text-xs text-gh-text-muted bg-gh-bg-secondary px-2.5 py-1 rounded-md border border-gh-border/30">
          {activeCount} de {Object.keys(config).length} activas
        </span>
      </div>

      {/* Preferencias Generales */}
      <div className="px-0">
        <div className="mt-3">
          <ToggleGroup title="Comportamiento General">
            <ToggleItem
              enabled={userPreferences?.cerrarModalAlGuardar || false}
              onChange={(v) => userPreferences && setUserPreferences({ ...userPreferences, cerrarModalAlGuardar: v })}
              title="Cerrar modal al guardar"
              description="Cierra automáticamente el modal después de guardar cambios"
            />

            <ToggleItem
              enabled={userPreferences?.mostrarConfirmacionGuardado || false}
              onChange={(v) => userPreferences && setUserPreferences({ ...userPreferences, mostrarConfirmacionGuardado: v })}
              title="Mostrar confirmación al guardar"
              description="Muestra un mensaje de confirmación al guardar cambios"
            />

            <ToggleItem
              enabled={userPreferences?.validarDatosAntes || false}
              onChange={(v) => userPreferences && setUserPreferences({ ...userPreferences, validarDatosAntes: v })}
              title="Validar datos antes de guardar"
              description="Valida los datos antes de permitir guardar cambios"
            />

            <ToggleItem
              enabled={userPreferences?.limpiarFormulariosAlCrear || false}
              onChange={(v) => userPreferences && setUserPreferences({ ...userPreferences, limpiarFormulariosAlCrear: v })}
              title="Limpiar formularios al crear"
              description="Reinicia servicios, descuentos y opciones de pago al crear una nueva cotización. Desactiva para mantener templates."
            />

            <ToggleItem
              enabled={userPreferences?.mantenerDatosAlCrearCotizacion ?? false}
              onChange={(v) => userPreferences && setUserPreferences({ ...userPreferences, mantenerDatosAlCrearCotizacion: v })}
              title="Mantener datos al crear cotización"
              description="Al crear una nueva cotización, mantiene los datos guardados como template (servicios, descripciones, pagos) en lugar de iniciar vacío"
            />
          </ToggleGroup>
        </div>
      </div>
    </div>
  )
}


