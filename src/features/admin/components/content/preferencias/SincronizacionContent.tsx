'use client'

import React from 'react'
import { RefreshCw, Database, Cloud, Wifi, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { useUserPreferencesStore } from '@/stores'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import ToggleItem, { ToggleGroup } from '@/features/admin/components/ToggleItem'
import { useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function SincronizacionContent() {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('PREFERENCES')

  const destinoGuardado = useUserPreferencesStore((s) => s.destinoGuardado)
  const intervaloVerificacionConexion = useUserPreferencesStore((s) => s.intervaloVerificacionConexion)
  const unidadIntervaloConexion = useUserPreferencesStore((s) => s.unidadIntervaloConexion)
  const sincronizarAlRecuperarConexion = useUserPreferencesStore((s) => s.sincronizarAlRecuperarConexion)
  const mostrarNotificacionCacheLocal = useUserPreferencesStore((s) => s.mostrarNotificacionCacheLocal)
  const updatePreferences = useUserPreferencesStore((s) => s.updatePreferences)

  const destino = destinoGuardado || 'ambos'
  const intervaloConexion = intervaloVerificacionConexion || 30
  const unidadIntervalo = unidadIntervaloConexion || 'segundos'
  const sincronizarAlRecuperar = sincronizarAlRecuperarConexion ?? true
  const mostrarNotificacionCache = mostrarNotificacionCacheLocal ?? true

  const handleUpdate = (patch: any) => {
    if (!canEdit) return
    updatePreferences(patch)
    logAction('UPDATE', 'PREFERENCES', 'sync-preference', `Actualizada preferencia de sincronización: ${Object.keys(patch)[0]}`)
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Sincronización y Caché"
        description="Configura cómo se sincronizan y almacenan los datos"
        icon={<RefreshCw className="w-4 h-4" />}
        variant="accent"
      />

      {/* Destino de Guardado */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text">
            Destino de Guardado
          </h5>
          <p className="text-[11px] text-gh-text-muted mt-0.5">
            Elige dónde se guardan tus datos por defecto
          </p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleUpdate({ destinoGuardado: 'local' }) }
              disabled={!canEdit}
              className={`p-3 rounded-md border text-xs font-medium transition-all flex flex-col items-center gap-2 ${
                destinoGuardado === 'local'
                  ? 'border-gh-accent bg-gh-accent/10 text-gh-accent'
                  : 'border-gh-border/30 text-gh-text-muted hover:border-gh-accent/50 hover:bg-gh-bg-tertiary/30'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Database className="w-4 h-4" />
              <span>Solo Local</span>
              <span className="text-[10px] opacity-70">Rápido, sin internet</span>
            </button>

            <button
              onClick={() => handleUpdate({ destinoGuardado: 'cloud' }) }
              disabled={!canEdit}
              className={`p-3 rounded-md border text-xs font-medium transition-all flex flex-col items-center gap-2 ${
                destinoGuardado === 'cloud'
                  ? 'border-gh-accent bg-gh-accent/10 text-gh-accent'
                  : 'border-gh-border/30 text-gh-text-muted hover:border-gh-accent/50 hover:bg-gh-bg-tertiary/30'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Cloud className="w-4 h-4" />
              <span>Solo Nube</span>
              <span className="text-[10px] opacity-70">Requiere conexión</span>
            </button>

            <button
              onClick={() => handleUpdate({ destinoGuardado: 'ambos' }) }
              disabled={!canEdit}
              className={`p-3 rounded-md border text-xs font-medium transition-all flex flex-col items-center gap-2 ${
                destinoGuardado === 'ambos'
                  ? 'border-gh-accent bg-gh-accent/10 text-gh-accent'
                  : 'border-gh-border/30 text-gh-text-muted hover:border-gh-accent/50 hover:bg-gh-bg-tertiary/30'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex gap-1 items-center">
                <Database className="w-3.5 h-3.5" />
                <span className="text-[10px]">+</span>
                <Cloud className="w-3.5 h-3.5" />
              </div>
              <span>Ambos</span>
              <span className="text-[10px] opacity-70">Recomendado</span>
            </button>
          </div>
          
          {destinoGuardado === 'local' && (
            <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] text-amber-600">
                Los datos solo se guardarán en este navegador. Si cambias de dispositivo o limpias el caché, se perderán.
              </span>
            </div>
          )}
          {destinoGuardado === 'cloud' && (
            <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] text-blue-500">
                Los datos se guardan directamente en la base de datos. Necesitas conexión a internet para trabajar.
              </span>
            </div>
          )}
          {destinoGuardado === 'ambos' && (
            <div className="mt-3 p-2.5 bg-gh-success/10 border border-gh-success/20 rounded-md flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-gh-success flex-shrink-0 mt-0.5" />
              <span className="text-[11px] text-gh-success">
                Los datos se guardan en ambos lados para máxima seguridad y disponibilidad.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Intervalo de verificación */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">
            Verificación de Conexión
          </h5>
        </div>
        
        <div className="p-4 space-y-3">
          <p className="text-[11px] text-gh-text-muted">
            Cada cuánto tiempo se verifica la conexión a la base de datos
          </p>
          
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={unidadIntervalo === 'segundos' ? 5 : 1}
              max={unidadIntervalo === 'segundos' ? 300 : 30}
              value={intervaloConexion}
              onChange={(e) => {
                const valor = Number.parseInt(e.target.value) || 30
                const min = unidadIntervalo === 'segundos' ? 5 : 1
                const max = unidadIntervalo === 'segundos' ? 300 : 30
                handleUpdate({ intervaloVerificacionConexion: Math.min(max, Math.max(min, valor)) })
              }}
              disabled={!canEdit}
              className="w-20 px-3 py-1.5 bg-gh-bg-tertiary border border-gh-border/30 rounded-md text-gh-text text-xs focus:outline-none focus:ring-1 focus:ring-gh-accent disabled:opacity-50"
            />
            
            <DropdownSelect
              value={unidadIntervalo}
              onChange={(val) => {
                const nuevaUnidad = val as 'segundos' | 'minutos'
                let nuevoValor = intervaloConexion
                if (nuevaUnidad === 'minutos' && intervaloConexion > 30) {
                  nuevoValor = 5
                } else if (nuevaUnidad === 'segundos' && intervaloConexion < 5) {
                  nuevoValor = 30
                }
                handleUpdate({ unidadIntervaloConexion: nuevaUnidad, intervaloVerificacionConexion: nuevoValor })
              }}
              disabled={!canEdit}
              options={[
                { value: 'segundos', label: 'Segundos' },
                { value: 'minutos', label: 'Minutos' }
              ]}
            />
          </div>
          
          <p className="text-[10px] text-gh-text-muted">
            {unidadIntervalo === 'segundos' 
              ? `Mínimo 5 segundos, máximo 300 segundos (5 minutos)`
              : `Mínimo 1 minuto, máximo 30 minutos`
            }
          </p>
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className="px-0">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text">
            Opciones Avanzadas
          </h5>
        </div>

        <div className="mt-3">
          <ToggleGroup title="Opciones Avanzadas">
            <ToggleItem
              enabled={sincronizarAlRecuperar}
              onChange={(v) => handleUpdate({ sincronizarAlRecuperarConexion: v })}
              title="Sincronizar al recuperar conexión"
              description="Sincroniza automáticamente los datos locales con la nube al recuperar conexión"
              disabled={!canEdit}
            />

            <ToggleItem
              enabled={sincronizarAlRecuperar}
              onChange={(v) => handleUpdate({ mostrarNotificacionCacheLocal: v })}
              title="Notificar uso de caché local"
              description="Muestra una notificación cuando se cargan datos desde el caché local (modo offline)"
              disabled={!canEdit}
            />
          </ToggleGroup>
        </div>
      </div>
    </div>
  )
}


