'use client'

import React from 'react'
import { FaCog, FaSave } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { UserPreferences } from '@/lib/types'

interface PreferenciasTabProps {
  userPreferences: UserPreferences | null
  setUserPreferences: (prefs: UserPreferences) => void
  guardarPreferencias: () => Promise<void>
}

export default function PreferenciasTab({
  userPreferences,
  setUserPreferences,
  guardarPreferencias,
}: PreferenciasTabProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gh-bg-overlay p-6 rounded-lg border border-gh-border space-y-6">
        <h3 className="text-sm font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaCog size={16} /> Preferencias de Usuario
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-gh-bg-secondary rounded-md border border-gh-border transition-colors">
            <input
              type="checkbox"
              checked={userPreferences?.cerrarModalAlGuardar || false}
              onChange={(e) => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    cerrarModalAlGuardar: e.target.checked
                  })
                }
              }}
              className="w-4 h-4 accent-gh-success cursor-pointer rounded"
            />
            <div>
              <span className="text-sm font-medium text-gh-text block">Cerrar modal al guardar</span>
              <p className="text-xs text-gh-text-muted mt-1">Cierra automáticamente el modal después de guardar cambios</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-gh-bg-secondary rounded-md border border-gh-border transition-colors">
            <input
              type="checkbox"
              checked={userPreferences?.mostrarConfirmacionGuardado || false}
              onChange={(e) => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    mostrarConfirmacionGuardado: e.target.checked
                  })
                }
              }}
              className="w-4 h-4 accent-gh-success cursor-pointer rounded"
            />
            <div>
              <span className="text-sm font-medium text-gh-text block">Mostrar confirmación al guardar</span>
              <p className="text-xs text-gh-text-muted mt-1">Muestra un mensaje de confirmación al guardar cambios</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-gh-bg-secondary rounded-md border border-gh-border transition-colors">
            <input
              type="checkbox"
              checked={userPreferences?.validarDatosAntes || false}
              onChange={(e) => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    validarDatosAntes: e.target.checked
                  })
                }
              }}
              className="w-4 h-4 accent-gh-success cursor-pointer rounded"
            />
            <div>
              <span className="text-sm font-medium text-gh-text block">Validar datos antes de guardar</span>
              <p className="text-xs text-gh-text-muted mt-1">Valida todos los datos antes de permitir guardar</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-gh-bg-secondary rounded-md border border-gh-border transition-colors">
            <input
              type="checkbox"
              checked={userPreferences?.limpiarFormulariosAlCrear ?? true}
              onChange={(e) => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    limpiarFormulariosAlCrear: e.target.checked
                  })
                }
              }}
              className="w-4 h-4 accent-gh-success cursor-pointer rounded"
            />
            <div>
              <span className="text-sm font-medium text-gh-text block">Limpiar formularios al crear nueva cotización</span>
              <p className="text-xs text-gh-text-muted mt-1">Reinicia servicios, descuentos y opciones de pago al crear una nueva cotización. Desactiva para mantener templates.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-gh-bg-secondary rounded-md border border-gh-border transition-colors">
            <input
              type="checkbox"
              checked={userPreferences?.mantenerDatosAlCrearCotizacion ?? false}
              onChange={(e) => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    mantenerDatosAlCrearCotizacion: e.target.checked
                  })
                }
              }}
              className="w-4 h-4 accent-gh-success cursor-pointer rounded"
            />
            <div>
              <span className="text-sm font-medium text-gh-text block">Mantener datos al crear cotización</span>
              <p className="text-xs text-gh-text-muted mt-1">Al crear una nueva cotización, mantiene los datos guardados como template (servicios, descripciones, pagos) en lugar de iniciar vacío.</p>
            </div>
          </label>
        </div>

        <div className="mt-8 pt-6 border-t border-gh-border flex gap-3 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={guardarPreferencias}
            className="px-6 py-2.5 bg-gh-success text-white rounded-md hover:bg-[#1f7935] transition-all font-semibold text-sm flex items-center gap-2"
          >
            <FaSave size={14} /> Guardar
          </motion.button>
        </div>
      </div>
    </div>
  )
}
