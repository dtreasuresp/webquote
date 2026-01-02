'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Gavel } from 'lucide-react'
import SectionHeader from '@/features/admin/components/SectionHeader'
import ArrayFieldGH from './ArrayFieldGH'
import ToggleItem from '@/features/admin/components/ToggleItem'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { TerminosCondiciones } from '@/lib/types'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'

interface TerminosContentProps {
  readonly data: TerminosCondiciones
  readonly onChange: (data: TerminosCondiciones) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
}

export default function TerminosContent({ data, onChange, visible, onVisibleChange, updatedAt, onGuardar, onReset, guardando, hasChanges }: TerminosContentProps) {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('CONTENT')

  // Visibilidad de subsecciones
  const visibilidad = data.visibilidad || { titulo: true, parrafos: true }
  
  const updateVisibilidad = (campo: keyof typeof visibilidad, valor: boolean) => {
    if (!canEdit) return
    onChange({
      ...data,
      visibilidad: { ...visibilidad, [campo]: valor }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <SectionHeader 
        title="Términos y Condiciones"
        description="Cláusulas legales y condiciones del servicio"
        icon={<Gavel className="w-4 h-4" />}
        updatedAt={updatedAt}
        onSave={() => {
          onGuardar()
          logAction('UPDATE', 'CONTENT', 'save-terminos', 'Guardados Términos y Condiciones')
        }}
        onCancel={onReset}
        isSaving={guardando}
        statusIndicator={hasChanges ? 'modificado' : 'guardado'}
        variant="accent"
      />

      {/* Toggle de visibilidad global - Fila 2 */}
      <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
        <span className="text-xs font-medium text-gh-text">Mostrar sección en la página pública</span>
        <ToggleSwitch enabled={visible} onChange={onVisibleChange} />
      </div>

      {/* Contenedor con opacity si global OFF */}
      <div className={`space-y-4 transition-opacity duration-200 ${visible ? '' : 'opacity-50'}`}>
        
        {/* Subsección: Título y Subtítulo */}
        <div className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg transition-opacity duration-200 ${visibilidad.titulo === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-medium text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={visibilidad.titulo !== false} 
              onChange={(v) => updateVisibilidad('titulo', v)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={data.titulo}
                onChange={(e) => {
                  if (!canEdit) return
                  onChange({ ...data, titulo: e.target.value })
                }}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                placeholder="Términos y Condiciones"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo || ''}
                onChange={(e) => {
                  if (!canEdit) return
                  onChange({ ...data, subtitulo: e.target.value })
                }}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                placeholder="Condiciones generales del servicio"
              />
            </div>
          </div>
        </div>

        {/* Subsección: Párrafos de Términos */}
        <div className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg transition-opacity duration-200 ${visibilidad.parrafos === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gh-text font-medium">📋 Párrafos de Términos y Condiciones</span>
            <ToggleSwitch 
              enabled={visibilidad.parrafos !== false} 
              onChange={(v) => updateVisibilidad('parrafos', v)} 
            />
          </div>
          <ArrayFieldGH
            label="Párrafos"
            items={data.parrafos}
            onChange={(parrafos) => {
              if (!canEdit) return
              onChange({ ...data, parrafos })
            }}
            placeholder="Nuevo párrafo de términos..."
          />
        </div>

      </div>
    </motion.div>
  )
}




