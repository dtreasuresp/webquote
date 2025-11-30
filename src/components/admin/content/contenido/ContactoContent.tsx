'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaPhone, FaBuilding, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ToggleSwitch from '@/components/admin/shared/ToggleSwitch'
import type { ContactoInfo } from '@/lib/types'

interface VisibilidadContacto {
  canales: boolean
  ubicacion: boolean
  empresarial: boolean
  metadata: boolean
}

interface ContactoContentProps {
  readonly data: ContactoInfo
  readonly onChange: (data: ContactoInfo) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly visibilidad?: VisibilidadContacto
  readonly onVisibilidadChange?: (key: keyof VisibilidadContacto, value: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
}

export default function ContactoContent({ data, onChange, visible, onVisibleChange, visibilidad, onVisibilidadChange, updatedAt, onGuardar, onReset, guardando, hasChanges }: ContactoContentProps) {
  // Valores por defecto para visibilidad
  const vis = visibilidad || { canales: true, ubicacion: true, empresarial: true, metadata: true }
  const handleVisChange = (key: keyof VisibilidadContacto, value: boolean) => {
    if (onVisibilidadChange) onVisibilidadChange(key, value)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader 
        title="Información de Contacto" 
        icon={<FaPhone className="text-gh-info" />}
        updatedAt={updatedAt}
        onGuardar={onGuardar}
        onReset={onReset}
        guardando={guardando}
        hasChanges={hasChanges}
      />

      {/* Toggle de visibilidad global - Fila 2 */}
      <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border rounded-lg">
        <span className="text-sm text-gh-text">Mostrar sección en la página pública</span>
        <ToggleSwitch enabled={visible} onChange={onVisibleChange} />
      </div>

      {/* Contenedores independientes para cada subsección */}
      <div className={`space-y-4 transition-opacity duration-200 ${visible ? '' : 'opacity-50'}`}>
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 📌 TÍTULO Y SUBTÍTULO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📌 Título y Subtítulo</span>
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
                value={data.titulo || ''}
                onChange={(e) => onChange({ ...data, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                placeholder="Información de Contacto"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo || ''}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                placeholder="Estamos aquí para ayudarte"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CANALES DE COMUNICACIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.canales === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs uppercase tracking-wide flex items-center gap-2">
              <FaPhone className="text-gh-warning" /> Canales de Comunicación
            </span>
            <ToggleSwitch 
              enabled={vis.canales !== false} 
              onChange={(v) => handleVisChange('canales', v)}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">WhatsApp</span>
              <input
                type="text"
                value={data.whatsapp}
                onChange={(e) => onChange({ ...data, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="+53 5856 9291"
              />
            </div>
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Email</span>
              <input
                type="email"
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Teléfono</span>
              <input
                type="text"
                value={data.telefono}
                onChange={(e) => onChange({ ...data, telefono: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="+53 5856 9291"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* UBICACIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.ubicacion === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs uppercase tracking-wide flex items-center gap-2">
              <FaMapMarkerAlt className="text-gh-danger" /> Ubicación
            </span>
            <ToggleSwitch 
              enabled={vis.ubicacion !== false} 
              onChange={(v) => handleVisChange('ubicacion', v)}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Dirección</span>
              <input
                type="text"
                value={data.direccion}
                onChange={(e) => onChange({ ...data, direccion: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="Calle, Número, Referencia"
              />
            </div>
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Ciudad</span>
              <input
                type="text"
                value={data.ciudad}
                onChange={(e) => onChange({ ...data, ciudad: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="Ciudad, Estado"
              />
            </div>
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">País</span>
              <input
                type="text"
                value={data.pais}
                onChange={(e) => onChange({ ...data, pais: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="País"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* INFORMACIÓN EMPRESARIAL */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.empresarial === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs uppercase tracking-wide flex items-center gap-2">
              <FaBuilding className="text-gh-info" /> Información Empresarial
            </span>
            <ToggleSwitch 
              enabled={vis.empresarial !== false} 
              onChange={(v) => handleVisChange('empresarial', v)}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Nombre CEO</span>
              <input
                type="text"
                value={data.nombreCeo}
                onChange={(e) => onChange({ ...data, nombreCeo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Empresa</span>
              <input
                type="text"
                value={data.empresaNombre}
                onChange={(e) => onChange({ ...data, empresaNombre: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="Mi Empresa S.A."
              />
            </div>
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Horario</span>
              <input
                type="text"
                value={data.horario}
                onChange={(e) => onChange({ ...data, horario: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="Lun-Vie 9:00-18:00"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* METADATA DE LA PROPUESTA */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.metadata === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs uppercase tracking-wide flex items-center gap-2">
              <FaFileAlt className="text-gh-success" /> Metadata de la Propuesta
            </span>
            <ToggleSwitch 
              enabled={vis.metadata !== false} 
              onChange={(v) => handleVisChange('metadata', v)}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Fecha de Propuesta</span>
              <input
                type="text"
                value={data.fechaPropuesta || ''}
                onChange={(e) => onChange({ ...data, fechaPropuesta: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="15 de noviembre de 2025"
              />
            </div>
            <div>
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Versión</span>
              <input
                type="text"
                value={data.versionPropuesta || ''}
                onChange={(e) => onChange({ ...data, versionPropuesta: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="1.0"
              />
            </div>
            <div className="md:col-span-3">
              <span className="block text-gh-text-muted font-medium text-xs mb-2 uppercase tracking-wide">Copyright</span>
              <input
                type="text"
                value={data.copyright || ''}
                onChange={(e) => onChange({ ...data, copyright: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                placeholder="© 2025 DGTECNOVA. Todos los derechos reservados."
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
