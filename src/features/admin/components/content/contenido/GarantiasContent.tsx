'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, Trash2 } from 'lucide-react'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAdminAudit } from '../../../hooks/useAdminAudit'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import ArrayFieldGH from './ArrayFieldGH'
import ToggleItem from '@/features/admin/components/ToggleItem'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { PoliticaCancelacion, VisibilidadConfig } from '@/lib/types'

interface TituloSubtituloGarantias {
  titulo: string
  subtitulo: string
}

interface GarantiasContentProps {
  readonly proveedorGarantiza: string[]
  readonly clienteResponsable: string[]
  readonly politicasCancelacion: PoliticaCancelacion[]
  readonly siIncumpleProveedor: string[]
  readonly onChange: (field: string, data: string[] | PoliticaCancelacion[]) => void
  readonly visibilidad: VisibilidadConfig
  readonly onVisibilidadChange: (key: keyof VisibilidadConfig, value: boolean) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly tituloSubtitulo?: TituloSubtituloGarantias
  readonly onTituloSubtituloChange?: (field: keyof TituloSubtituloGarantias, value: string) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
}

export default function GarantiasContent({ 
  proveedorGarantiza, 
  clienteResponsable, 
  politicasCancelacion, 
  siIncumpleProveedor,
  onChange,
  visibilidad,
  onVisibilidadChange,
  visible,
  onVisibleChange,
  tituloSubtitulo,
  onTituloSubtituloChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges
}: GarantiasContentProps) {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('CONTENT')
  
  // Valores por defecto para título y subtítulo
  const titSub = tituloSubtitulo || { titulo: 'Garantías y Responsabilidades', subtitulo: '' }
  const handleTitSubChange = (field: keyof TituloSubtituloGarantias, value: string) => {
    if (onTituloSubtituloChange) onTituloSubtituloChange(field, value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <SectionHeader 
        title="Garantías y Responsabilidades"
        description="Compromisos del proveedor y responsabilidades del cliente"
        icon={<Shield className="w-4 h-4" />}
        updatedAt={updatedAt}
        onSave={() => {
          onGuardar()
          logAction('UPDATE', 'CONTENT', 'save-garantias', 'Guardadas Garantías y Responsabilidades')
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

      {/* Contenedores independientes para cada subsección */}
      <div className={`space-y-4 transition-opacity duration-200 ${visible ? '' : 'opacity-50'}`}>
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 📌 TÍTULO Y SUBTÍTULO - No colapsable */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-medium text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={titSub.titulo}
                onChange={(e) => handleTitSubChange('titulo', e.target.value)}
                placeholder="Garantías y Responsabilidades"
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={titSub.subtitulo}
                onChange={(e) => handleTitSubChange('subtitulo', e.target.value)}
                placeholder="Compromisos y responsabilidades del proyecto"
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* EL PROVEEDOR GARANTIZA */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg transition-opacity duration-200 ${visibilidad.garantiasProveedor === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs flex items-center gap-2">
              ✅ El Proveedor Garantiza
            </span>
            <ToggleSwitch 
              enabled={visibilidad.garantiasProveedor !== false} 
              onChange={(v) => onVisibilidadChange('garantiasProveedor', v)}
            />
          </div>
          <ArrayFieldGH
            label=""
            items={proveedorGarantiza}
            onChange={(items) => onChange('proveedorGarantiza', items)}
            placeholder="Nueva garantía..."
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* EL CLIENTE ES RESPONSABLE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg transition-opacity duration-200 ${visibilidad.garantiasCliente === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs flex items-center gap-2">
              📋 El Cliente es Responsable de
            </span>
            <ToggleSwitch 
              enabled={visibilidad.garantiasCliente !== false} 
              onChange={(v) => onVisibilidadChange('garantiasCliente', v)}
            />
          </div>
          <ArrayFieldGH
            label=""
            items={clienteResponsable}
            onChange={(items) => onChange('clienteResponsable', items)}
            placeholder="Nueva responsabilidad..."
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* POLÍTICAS DE CANCELACIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg transition-opacity duration-200 ${visibilidad.politicasCancelacion === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs flex items-center gap-2">
              📋 Políticas de Cancelación
            </span>
            <ToggleSwitch 
              enabled={visibilidad.politicasCancelacion !== false} 
              onChange={(v) => onVisibilidadChange('politicasCancelacion', v)}
            />
          </div>
          
          <div className="space-y-3">
            {politicasCancelacion.map((pol, index) => (
              <div key={`pol-${pol.title.slice(0, 15)}-${index}`} className="p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-md">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={pol.title}
                      onChange={(e) => {
                        const updated = [...politicasCancelacion]
                        updated[index] = { ...updated[index], title: e.target.value }
                        onChange('politicasCancelacion', updated)
                      }}
                      placeholder="Título de la política..."
                      className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-xs font-medium text-gh-text font-medium"
                    />
                    <input
                      type="text"
                      value={pol.detail}
                      onChange={(e) => {
                        const updated = [...politicasCancelacion]
                        updated[index] = { ...updated[index], detail: e.target.value }
                        onChange('politicasCancelacion', updated)
                      }}
                      placeholder="Detalle..."
                      className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border/30 rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-xs font-medium text-gh-text"
                    />
                  </div>
                  <button
                    onClick={() => onChange('politicasCancelacion', politicasCancelacion.filter((_, i) => i !== index))}
                    className="p-2 text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => onChange('politicasCancelacion', [...politicasCancelacion, { title: '', detail: '' }])}
              className="w-full px-3 py-2 text-xs font-medium text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border border-dashed rounded-md hover:bg-gh-bg-tertiary transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-2.5 h-2.5" /> Agregar Política
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SI EL PROVEEDOR INCUMPLE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg transition-opacity duration-200 ${visibilidad.siIncumpleProveedor === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs flex items-center gap-2">
              ⚖️ Si el Proveedor Incumple
            </span>
            <ToggleSwitch 
              enabled={visibilidad.siIncumpleProveedor !== false} 
              onChange={(v) => onVisibilidadChange('siIncumpleProveedor', v)}
            />
          </div>
          <ArrayFieldGH
            label=""
            items={siIncumpleProveedor}
            onChange={(items) => onChange('siIncumpleProveedor', items)}
            placeholder="Nueva acción correctiva..."
          />
        </div>
      </div>
    </motion.div>
  )
}




