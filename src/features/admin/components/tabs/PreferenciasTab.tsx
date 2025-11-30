'use client'

import React from 'react'
import { FaCog, FaSave, FaCloud, FaDatabase, FaSync, FaWifi } from 'react-icons/fa'
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
  
  // Valores por defecto para las nuevas preferencias
  const destinoGuardado = userPreferences?.destinoGuardado || 'ambos'
  const intervaloConexion = userPreferences?.intervaloVerificacionConexion || 30
  const unidadIntervalo = userPreferences?.unidadIntervaloConexion || 'segundos'
  const sincronizarAlRecuperar = userPreferences?.sincronizarAlRecuperarConexion ?? true
  const mostrarNotificacionCache = userPreferences?.mostrarNotificacionCacheLocal ?? true

  return (
    <div className="p-6 space-y-6">
      {/* Sección: Preferencias Generales */}
      <div className="bg-gh-bg-overlay p-6 rounded-lg border border-gh-border space-y-6">
        <h3 className="text-sm font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaCog size={16} /> Preferencias Generales
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
      </div>

      {/* Sección: Sincronización y Cache */}
      <div className="bg-gh-bg-overlay p-6 rounded-lg border border-gh-border space-y-6">
        <h3 className="text-sm font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaSync size={16} /> Sincronización y Cache
        </h3>
        
        {/* Destino de guardado */}
        <div className="p-4 rounded-md border border-gh-border">
          <div className="flex items-center gap-2 mb-3">
            <FaDatabase className="text-gh-text-muted" size={14} />
            <span className="text-sm font-medium text-gh-text">Destino de guardado</span>
          </div>
          <p className="text-xs text-gh-text-muted mb-4">Define dónde se guardan los datos al trabajar</p>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    destinoGuardado: 'local'
                  })
                }
              }}
              className={`p-3 rounded-md border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                destinoGuardado === 'local'
                  ? 'border-gh-accent bg-gh-accent/10 text-gh-accent'
                  : 'border-gh-border text-gh-text-muted hover:border-gh-accent/50'
              }`}
            >
              <FaDatabase size={18} />
              <span>Solo Local</span>
              <span className="text-xs opacity-70">Rápido, sin internet</span>
            </button>
            
            <button
              onClick={() => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    destinoGuardado: 'cloud'
                  })
                }
              }}
              className={`p-3 rounded-md border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                destinoGuardado === 'cloud'
                  ? 'border-gh-accent bg-gh-accent/10 text-gh-accent'
                  : 'border-gh-border text-gh-text-muted hover:border-gh-accent/50'
              }`}
            >
              <FaCloud size={18} />
              <span>Solo Nube</span>
              <span className="text-xs opacity-70">Requiere conexión</span>
            </button>
            
            <button
              onClick={() => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    destinoGuardado: 'ambos'
                  })
                }
              }}
              className={`p-3 rounded-md border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                destinoGuardado === 'ambos'
                  ? 'border-gh-success bg-gh-success/10 text-gh-success'
                  : 'border-gh-border text-gh-text-muted hover:border-gh-success/50'
              }`}
            >
              <div className="flex gap-1">
                <FaDatabase size={14} />
                <span className="text-xs">+</span>
                <FaCloud size={14} />
              </div>
              <span>Ambos</span>
              <span className="text-xs opacity-70">Recomendado</span>
            </button>
          </div>
          
          {destinoGuardado === 'local' && (
            <p className="mt-3 text-xs text-amber-500 bg-amber-500/10 p-2 rounded">
              ⚠️ Los datos solo se guardarán en este navegador. Si cambias de dispositivo o limpias el cache, se perderán.
            </p>
          )}
          {destinoGuardado === 'cloud' && (
            <p className="mt-3 text-xs text-blue-500 bg-blue-500/10 p-2 rounded">
              ℹ️ Los datos se guardan directamente en la base de datos. Necesitas conexión a internet para trabajar.
            </p>
          )}
        </div>

        {/* Intervalo de verificación de conexión */}
        <div className="p-4 rounded-md border border-gh-border">
          <div className="flex items-center gap-2 mb-3">
            <FaWifi className="text-gh-text-muted" size={14} />
            <span className="text-sm font-medium text-gh-text">Intervalo de verificación de conexión</span>
          </div>
          <p className="text-xs text-gh-text-muted mb-4">Cada cuánto tiempo se verifica la conexión a la base de datos</p>
          
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={unidadIntervalo === 'segundos' ? 5 : 1}
              max={unidadIntervalo === 'segundos' ? 300 : 30}
              value={intervaloConexion}
              onChange={(e) => {
                if (userPreferences) {
                  const valor = parseInt(e.target.value) || 30
                  const min = unidadIntervalo === 'segundos' ? 5 : 1
                  const max = unidadIntervalo === 'segundos' ? 300 : 30
                  setUserPreferences({
                    ...userPreferences,
                    intervaloVerificacionConexion: Math.min(max, Math.max(min, valor))
                  })
                }
              }}
              className="w-20 px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-gh-text text-sm focus:outline-none focus:ring-2 focus:ring-gh-accent"
            />
            
            <select
              value={unidadIntervalo}
              onChange={(e) => {
                if (userPreferences) {
                  const nuevaUnidad = e.target.value as 'segundos' | 'minutos'
                  // Ajustar el valor al cambiar unidad
                  let nuevoValor = intervaloConexion
                  if (nuevaUnidad === 'minutos' && intervaloConexion > 30) {
                    nuevoValor = 5
                  } else if (nuevaUnidad === 'segundos' && intervaloConexion < 5) {
                    nuevoValor = 30
                  }
                  setUserPreferences({
                    ...userPreferences,
                    unidadIntervaloConexion: nuevaUnidad,
                    intervaloVerificacionConexion: nuevoValor
                  })
                }
              }}
              className="px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-gh-text text-sm focus:outline-none focus:ring-2 focus:ring-gh-accent"
            >
              <option value="segundos">segundos</option>
              <option value="minutos">minutos</option>
            </select>
          </div>
          
          <p className="mt-2 text-xs text-gh-text-muted">
            {unidadIntervalo === 'segundos' 
              ? `Mínimo 5 segundos, máximo 300 segundos (5 minutos)`
              : `Mínimo 1 minuto, máximo 30 minutos`
            }
          </p>
        </div>

        {/* Opciones adicionales de sincronización */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-gh-bg-secondary rounded-md border border-gh-border transition-colors">
            <input
              type="checkbox"
              checked={sincronizarAlRecuperar}
              onChange={(e) => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    sincronizarAlRecuperarConexion: e.target.checked
                  })
                }
              }}
              className="w-4 h-4 accent-gh-success cursor-pointer rounded"
            />
            <div>
              <span className="text-sm font-medium text-gh-text block">Sincronizar al recuperar conexión</span>
              <p className="text-xs text-gh-text-muted mt-1">Cuando se restablece la conexión a internet, sincroniza automáticamente los datos locales con la nube</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-gh-bg-secondary rounded-md border border-gh-border transition-colors">
            <input
              type="checkbox"
              checked={mostrarNotificacionCache}
              onChange={(e) => {
                if (userPreferences) {
                  setUserPreferences({
                    ...userPreferences,
                    mostrarNotificacionCacheLocal: e.target.checked
                  })
                }
              }}
              className="w-4 h-4 accent-gh-success cursor-pointer rounded"
            />
            <div>
              <span className="text-sm font-medium text-gh-text block">Notificar uso de cache local</span>
              <p className="text-xs text-gh-text-muted mt-1">Muestra una notificación cuando se cargan datos desde el cache local (modo offline)</p>
            </div>
          </label>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex gap-3 justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={guardarPreferencias}
          className="px-6 py-2.5 bg-gh-success text-white rounded-md hover:bg-[#1f7935] transition-all font-semibold text-sm flex items-center gap-2"
        >
          <FaSave size={14} /> Guardar Preferencias
        </motion.button>
      </div>
    </div>
  )
}
