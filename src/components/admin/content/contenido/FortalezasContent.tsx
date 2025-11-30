'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaChevronDown, FaChevronUp, FaPlus, FaTrash } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ArrayFieldGH from '@/features/admin/components/content/contenido/ArrayFieldGH'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { SeccionesColapsadasConfig } from '@/lib/types'

// Tipos para Fortalezas del Proyecto
export interface FortalezaItem {
  icon: string
  title: string
  desc: string
}

export interface ResumenFortalezas {
  titulo: string
  clienteIdeal: string[]
  ventajasCompetitivas: string[]
  resultadoFinal: string
}

export interface FortalezasData {
  titulo: string
  subtitulo: string
  fortalezas: FortalezaItem[]
  resumen: ResumenFortalezas
}

interface VisibilidadFortalezas {
  titulos: boolean
  listaFortalezas: boolean
  resumen: boolean
}

interface FortalezasContentProps {
  readonly data: FortalezasData
  readonly onChange: (data: FortalezasData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly visibilidad?: VisibilidadFortalezas
  readonly onVisibilidadChange?: (key: keyof VisibilidadFortalezas, value: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
  readonly seccionesColapsadas: SeccionesColapsadasConfig
  readonly onSeccionColapsadaChange: (key: string, isExpanded: boolean) => void
}

// Datos por defecto
export const defaultFortalezas: FortalezasData = {
  titulo: 'Fortalezas del Proyecto',
  subtitulo: 'Ventajas competitivas de tu negocio',
  fortalezas: [
    { icon: '🏢', title: 'Empresa Consolidada', desc: '15 años de experiencia en el mercado con trayectoria comprobada' },
    { icon: '🎯', title: 'Objetivos Claros', desc: 'Metas comerciales bien definidas y enfoque estratégico claro' },
    { icon: '💼', title: 'Cliente Comprometido', desc: 'Puntuación 5/5 en cuestionario - altamente motivado' },
    { icon: '👥', title: 'Público Objetivo Amplio', desc: 'Alcance de 18-70 años, ambos géneros, todos los niveles' },
    { icon: '🎨', title: 'Identidad Visual Definida', desc: 'Colores corporativos (rojo y negro) y logo ya diseñado' },
    { icon: '💪', title: 'Propuesta de Valor Diferenciada', desc: 'Excelencia, mejores precios y calidad garantizada' },
    { icon: '📍', title: 'Negocio Local Estratégico', desc: 'Ubicación establecida en zona comercial importante' },
    { icon: '🌍', title: 'Presencia Digital Necesaria', desc: 'Mercado listo para transformación digital' },
    { icon: '🔄', title: 'Modelo de Negocio Viable', desc: 'Gestión de contenidos por proveedor = máxima profesionalidad' },
    { icon: '📈', title: 'Potencial de Crecimiento', desc: 'Escalabilidad hacia tienda online y marketing digital' },
  ],
  resumen: {
    titulo: 'Por qué este proyecto tiene éxito asegurado',
    clienteIdeal: [
      'Empresa establecida en el mercado (15 años de experiencia)',
      'Tiene una visión clara de crecimiento',
      'Impacto en la economía cubana',
      'Dispuesto a invertir en transformación digital',
    ],
    ventajasCompetitivas: [
      'El Proveedor DGTECNOVA gestiona todo (máxima seguridad)',
      'El proveedor ofrece actualizaciones garantizadas y profesionales',
      'El cliente se enfoca en su negocio y nosotros en la tecnología',
      'Presencia de soporte 24/7 según paquete',
    ],
    resultadoFinal: '🎯 Resultado Final: Un sitio web profesional, seguro, actualizado y orientado a generar ventas desde el día uno.',
  },
}

export default function FortalezasContent({
  data,
  onChange,
  visible,
  onVisibleChange,
  visibilidad,
  onVisibilidadChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges,
  seccionesColapsadas,
  onSeccionColapsadaChange,
}: FortalezasContentProps) {
  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    fortalezas: seccionesColapsadas.fortalezas_fortalezas ?? true,
    resumen: seccionesColapsadas.fortalezas_resumen ?? false,
  }
  
  // Valores por defecto para visibilidad
  const vis = visibilidad || { titulos: true, listaFortalezas: true, resumen: true }
  const handleVisChange = (key: keyof VisibilidadFortalezas, value: boolean) => {
    if (onVisibilidadChange) onVisibilidadChange(key, value)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`fortalezas_${section}`, newValue)
  }

  // Handlers para fortalezas
  const handleAddFortaleza = () => {
    onChange({
      ...data,
      fortalezas: [...data.fortalezas, { icon: '⭐', title: '', desc: '' }],
    })
  }

  const handleRemoveFortaleza = (index: number) => {
    onChange({
      ...data,
      fortalezas: data.fortalezas.filter((_, i) => i !== index),
    })
  }

  const handleUpdateFortaleza = (index: number, field: keyof FortalezaItem, value: string) => {
    const newFortalezas = [...data.fortalezas]
    newFortalezas[index] = { ...newFortalezas[index], [field]: value }
    onChange({ ...data, fortalezas: newFortalezas })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader
        title="Fortalezas del Proyecto"
        icon={<FaStar className="text-gh-warning" />}
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

      {/* Contenedor con opacity si global OFF */}
      <div className={`space-y-4 transition-opacity duration-200 ${!visible ? 'opacity-50' : ''}`}>
        
        {/* Subsección: Títulos */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.titulos === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={vis.titulos !== false} 
              onChange={(v) => handleVisChange('titulos', v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={data.titulo}
                onChange={(e) => onChange({ ...data, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FORTALEZAS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.listaFortalezas === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('fortalezas')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                ⭐ Lista de Fortalezas ({data.fortalezas.length})
              </span>
              {expandedSections.fortalezas ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.listaFortalezas !== false} 
              onChange={(v) => handleVisChange('listaFortalezas', v)}
            />
          </div>

          {expandedSections.fortalezas && (
            <div className="mt-4 space-y-3">
              {data.fortalezas.map((fortaleza, index) => (
                <div key={`fortaleza-${index}`} className="p-3 bg-gh-bg-secondary border border-gh-border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gh-text-muted">Fortaleza {index + 1}</span>
                    <button
                      onClick={() => handleRemoveFortaleza(index)}
                      className="p-1.5 text-gh-danger hover:bg-gh-danger/10 rounded"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-2">
                      <label className="block text-gh-text-muted text-xs mb-1">Icono</label>
                      <input
                        type="text"
                        value={fortaleza.icon}
                        onChange={(e) => handleUpdateFortaleza(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gh-bg-tertiary border border-gh-border rounded text-sm text-gh-text text-center"
                        placeholder="🎯"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                      <input
                        type="text"
                        value={fortaleza.title}
                        onChange={(e) => handleUpdateFortaleza(index, 'title', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gh-bg-tertiary border border-gh-border rounded text-sm text-gh-text"
                        placeholder="Título de la fortaleza"
                      />
                    </div>
                    <div className="col-span-6">
                      <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                      <input
                        type="text"
                        value={fortaleza.desc}
                        onChange={(e) => handleUpdateFortaleza(index, 'desc', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gh-bg-tertiary border border-gh-border rounded text-sm text-gh-text"
                        placeholder="Descripción breve"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddFortaleza}
                className="w-full px-3 py-2 text-xs font-medium text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border border-dashed rounded-md hover:bg-gh-bg-tertiary transition-colors flex items-center justify-center gap-1.5"
              >
                <FaPlus size={10} /> Agregar Fortaleza
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RESUMEN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.resumen === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('resumen')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                📋 Resumen de Fortalezas
              </span>
              {expandedSections.resumen ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.resumen !== false} 
              onChange={(v) => handleVisChange('resumen', v)}
            />
          </div>

          {expandedSections.resumen && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Título del Resumen</label>
                <input
                  type="text"
                  value={data.resumen.titulo}
                  onChange={(e) => onChange({ ...data, resumen: { ...data.resumen, titulo: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                />
              </div>
              <ArrayFieldGH
                label="Cliente Ideal"
                items={data.resumen.clienteIdeal}
                onChange={(items) => onChange({ ...data, resumen: { ...data.resumen, clienteIdeal: items } })}
                placeholder="Nueva característica del cliente ideal..."
              />
              <ArrayFieldGH
                label="Ventajas Competitivas"
                items={data.resumen.ventajasCompetitivas}
                onChange={(items) => onChange({ ...data, resumen: { ...data.resumen, ventajasCompetitivas: items } })}
                placeholder="Nueva ventaja competitiva..."
              />
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Resultado Final</label>
                <textarea
                  value={data.resumen.resultadoFinal}
                  onChange={(e) => onChange({ ...data, resumen: { ...data.resumen, resultadoFinal: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
