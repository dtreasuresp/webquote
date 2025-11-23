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
    <div className="p-6 space-y-4">
      <div className="bg-[#111] p-6 rounded-lg border border-[#333] space-y-4">
        <h3 className="text-sm font-bold text-[#ededed] mb-4 flex items-center gap-2">
          <FaCog size={16} /> Preferencias de Usuario
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#222] rounded-lg transition-colors">
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
              className="w-4 h-4 accent-white cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-[#ededed]">Cerrar modal al guardar</span>
              <p className="text-xs text-[#888888] mt-0.5">Cierra automáticamente el modal después de guardar cambios</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#222] rounded-lg transition-colors">
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
              className="w-4 h-4 accent-white cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-[#ededed]">Mostrar confirmación al guardar</span>
              <p className="text-xs text-[#888888] mt-0.5">Muestra un mensaje de confirmación al guardar cambios</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#222] rounded-lg transition-colors">
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
              className="w-4 h-4 accent-white cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-[#ededed]">Validar datos antes de guardar</span>
              <p className="text-xs text-[#888888] mt-0.5">Valida todos los datos antes de permitir guardar</p>
            </div>
          </label>
        </div>

        <div className="mt-6 pt-4 border-t border-[#333] flex gap-3 justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={guardarPreferencias}
            className="px-6 py-2 bg-white text-[#0a0a0f] rounded-lg hover:bg-white/90 transition-all font-semibold text-sm flex items-center gap-2"
          >
            <FaSave /> Guardar
          </motion.button>
        </div>
      </div>
    </div>
  )
}
