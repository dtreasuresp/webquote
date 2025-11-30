'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaExclamationTriangle, FaChevronDown, FaChevronUp, FaPlus, FaTrash } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ArrayFieldGH from './ArrayFieldGH'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { SeccionesColapsadasConfig } from '@/lib/types'

// Tipos para Observaciones y Recomendaciones
export interface PuntoAtencion {
  titulo: string
  descripcion: string
  prioridad: 'alta' | 'media' | 'baja'
}

export interface RecomendacionEstrategica {
  titulo: string
  descripcion: string
  beneficios: string[]
}

export interface ObservacionesData {
  titulo: string
  subtitulo: string
  puntosAtencion: {
    visible: boolean
    titulo: string
    descripcion: string
    items: PuntoAtencion[]
  }
  recomendaciones: {
    visible: boolean
    titulo: string
    descripcion: string
    items: RecomendacionEstrategica[]
  }
  notaFinal: string
}

interface ObservacionesContentProps {
  readonly data: ObservacionesData
  readonly onChange: (data: ObservacionesData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
  readonly seccionesColapsadas: SeccionesColapsadasConfig
  readonly onSeccionColapsadaChange: (key: string, isExpanded: boolean) => void
}

// Datos por defecto
export const defaultObservaciones: ObservacionesData = {
  titulo: 'Observaciones y Recomendaciones',
  subtitulo: 'Consideraciones importantes para el éxito del proyecto',
  puntosAtencion: {
    visible: true,
    titulo: 'Puntos de Atención',
    descripcion: 'Aspectos que requieren consideración especial durante el desarrollo',
    items: [
      {
        titulo: 'Contenido del sitio',
        descripcion: 'Es fundamental que el cliente proporcione todos los textos, imágenes y materiales necesarios antes de iniciar el desarrollo para evitar retrasos.',
        prioridad: 'alta',
      },
      {
        titulo: 'Dominio y hosting',
        descripcion: 'Se recomienda que el cliente adquiera su propio dominio para mantener la propiedad de la identidad digital de su marca.',
        prioridad: 'media',
      },
      {
        titulo: 'Mantenimiento continuo',
        descripcion: 'Todo sitio web requiere actualizaciones periódicas de seguridad y contenido para mantener su efectividad.',
        prioridad: 'media',
      },
    ],
  },
  recomendaciones: {
    visible: true,
    titulo: 'Recomendaciones Estratégicas',
    descripcion: 'Sugerencias para maximizar el impacto y retorno de inversión',
    items: [
      {
        titulo: 'Estrategia de contenidos',
        descripcion: 'Desarrollar un calendario de publicaciones para el blog que apoye el posicionamiento SEO.',
        beneficios: ['Mejor posicionamiento en buscadores', 'Mayor tráfico orgánico', 'Autoridad de marca'],
      },
      {
        titulo: 'Presencia en redes sociales',
        descripcion: 'Integrar el sitio web con perfiles de redes sociales para ampliar el alcance.',
        beneficios: ['Mayor visibilidad', 'Engagement con clientes', 'Tráfico adicional'],
      },
      {
        titulo: 'Análisis y métricas',
        descripcion: 'Configurar herramientas de análisis para medir el rendimiento y tomar decisiones basadas en datos.',
        beneficios: ['Decisiones informadas', 'Optimización continua', 'ROI medible'],
      },
    ],
  },
  notaFinal: 'Estas observaciones y recomendaciones se basan en nuestra experiencia y mejores prácticas del sector. Estamos disponibles para discutir cualquier punto en detalle.',
}

export default function ObservacionesContent({
  data,
  onChange,
  visible,
  onVisibleChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges,
  seccionesColapsadas,
  onSeccionColapsadaChange,
}: ObservacionesContentProps) {
  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    puntosAtencion: seccionesColapsadas.observaciones_puntosAtencion ?? true,
    recomendaciones: seccionesColapsadas.observaciones_recomendaciones ?? false,
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`observaciones_${section}`, newValue)
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Puntos de Atención
  // ═══════════════════════════════════════════════════════════════
  const addPuntoAtencion = () => {
    const newPunto: PuntoAtencion = {
      titulo: 'Nuevo punto de atención',
      descripcion: '',
      prioridad: 'media',
    }
    onChange({
      ...data,
      puntosAtencion: {
        ...data.puntosAtencion,
        items: [...data.puntosAtencion.items, newPunto],
      },
    })
  }

  const updatePuntoAtencion = (index: number, field: keyof PuntoAtencion, value: string) => {
    const newItems = [...data.puntosAtencion.items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange({
      ...data,
      puntosAtencion: { ...data.puntosAtencion, items: newItems },
    })
  }

  const removePuntoAtencion = (index: number) => {
    onChange({
      ...data,
      puntosAtencion: {
        ...data.puntosAtencion,
        items: data.puntosAtencion.items.filter((_, i) => i !== index),
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Recomendaciones
  // ═══════════════════════════════════════════════════════════════
  const addRecomendacion = () => {
    const newRec: RecomendacionEstrategica = {
      titulo: 'Nueva recomendación',
      descripcion: '',
      beneficios: [],
    }
    onChange({
      ...data,
      recomendaciones: {
        ...data.recomendaciones,
        items: [...data.recomendaciones.items, newRec],
      },
    })
  }

  const updateRecomendacion = (index: number, field: keyof RecomendacionEstrategica, value: string | string[]) => {
    const newItems = [...data.recomendaciones.items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange({
      ...data,
      recomendaciones: { ...data.recomendaciones, items: newItems },
    })
  }

  const removeRecomendacion = (index: number) => {
    onChange({
      ...data,
      recomendaciones: {
        ...data.recomendaciones,
        items: data.recomendaciones.items.filter((_, i) => i !== index),
      },
    })
  }

  // Helper para color de prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'text-gh-danger bg-gh-danger/20 border-gh-danger/30'
      case 'media': return 'text-gh-warning bg-gh-warning/20 border-gh-warning/30'
      case 'baja': return 'text-gh-success bg-gh-success/20 border-gh-success/30'
      default: return 'text-gh-text-muted bg-gh-bg-secondary border-gh-border'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader
        title="Observaciones y Recomendaciones"
        icon={<FaExclamationTriangle className="text-gh-warning" />}
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
        {/* PUNTOS DE ATENCIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('puntosAtencion')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                ⚠️ Puntos de Atención
              </span>
              {expandedSections.puntosAtencion ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.puntosAtencion.visible}
              onChange={(v) => onChange({ ...data, puntosAtencion: { ...data.puntosAtencion, visible: v } })}
            />
          </div>

          {expandedSections.puntosAtencion && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={data.puntosAtencion.titulo}
                    onChange={(e) => onChange({ ...data, puntosAtencion: { ...data.puntosAtencion, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.puntosAtencion.descripcion}
                    onChange={(e) => onChange({ ...data, puntosAtencion: { ...data.puntosAtencion, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Puntos */}
              {data.puntosAtencion.items.map((punto, index) => (
                <div key={`punto-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2 py-1 rounded border ${getPrioridadColor(punto.prioridad)}`}>
                      {punto.prioridad.toUpperCase()}
                    </span>
                    <button
                      onClick={() => removePuntoAtencion(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                      <input
                        type="text"
                        value={punto.titulo}
                        onChange={(e) => updatePuntoAtencion(index, 'titulo', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Prioridad</label>
                      <select
                        value={punto.prioridad}
                        onChange={(e) => updatePuntoAtencion(index, 'prioridad', e.target.value as 'alta' | 'media' | 'baja')}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      >
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <textarea
                      value={punto.descripcion}
                      onChange={(e) => updatePuntoAtencion(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addPuntoAtencion}
                className="flex items-center gap-2 px-3 py-2 bg-gh-warning/20 border border-gh-warning/30 text-gh-warning rounded-md text-sm hover:bg-gh-warning/30 transition-colors"
              >
                <FaPlus /> Agregar Punto de Atención
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RECOMENDACIONES ESTRATÉGICAS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('recomendaciones')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                💡 Recomendaciones Estratégicas
              </span>
              {expandedSections.recomendaciones ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.recomendaciones.visible}
              onChange={(v) => onChange({ ...data, recomendaciones: { ...data.recomendaciones, visible: v } })}
            />
          </div>

          {expandedSections.recomendaciones && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={data.recomendaciones.titulo}
                    onChange={(e) => onChange({ ...data, recomendaciones: { ...data.recomendaciones, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.recomendaciones.descripcion}
                    onChange={(e) => onChange({ ...data, recomendaciones: { ...data.recomendaciones, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Recomendaciones */}
              {data.recomendaciones.items.map((rec, index) => (
                <div key={`rec-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gh-text">{rec.titulo}</span>
                    <button
                      onClick={() => removeRecomendacion(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                    <input
                      type="text"
                      value={rec.titulo}
                      onChange={(e) => updateRecomendacion(index, 'titulo', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <textarea
                      value={rec.descripcion}
                      onChange={(e) => updateRecomendacion(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      rows={2}
                    />
                  </div>
                  <ArrayFieldGH
                    label="Beneficios"
                    items={rec.beneficios}
                    onChange={(items) => updateRecomendacion(index, 'beneficios', items)}
                    placeholder="Nuevo beneficio..."
                  />
                </div>
              ))}

              <button
                onClick={addRecomendacion}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Recomendación
              </button>
            </div>
          )}
        </div>

        {/* Nota Final */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📝 Nota Final</span>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          <textarea
            value={data.notaFinal}
            onChange={(e) => onChange({ ...data, notaFinal: e.target.value })}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
            rows={2}
          />
        </div>

      </div>
    </motion.div>
  )
}
