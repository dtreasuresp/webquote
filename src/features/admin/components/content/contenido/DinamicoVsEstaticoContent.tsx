'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaExchangeAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ArrayFieldGH from './ArrayFieldGH'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { SeccionesColapsadasConfig } from '@/lib/types'

// Tipos para Dinámico vs Estático
export interface ComparisonItem {
  label: string
  value?: string
  list?: string[]
}

export interface ComparisonCard {
  title: string
  items: ComparisonItem[]
}

export interface DinamicoVsEstaticoData {
  titulo: string
  subtitulo: string
  sitioEstatico: ComparisonCard
  sitioDinamico: ComparisonCard
  recomendacion: {
    titulo: string
    subtitulo: string
    tipo: string
    razones: string[]
  }
}

interface VisibilidadComparativa {
  titulos: boolean
  estatico: boolean
  dinamico: boolean
  recomendacion: boolean
}

interface DinamicoVsEstaticoContentProps {
  readonly data: DinamicoVsEstaticoData
  readonly onChange: (data: DinamicoVsEstaticoData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly visibilidad?: VisibilidadComparativa
  readonly onVisibilidadChange?: (key: keyof VisibilidadComparativa, value: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
  readonly seccionesColapsadas: SeccionesColapsadasConfig
  readonly onSeccionColapsadaChange: (key: string, isExpanded: boolean) => void
}

// Datos por defecto
export const defaultDinamicoVsEstatico: DinamicoVsEstaticoData = {
  titulo: 'Sitios Dinámicos vs Estáticos',
  subtitulo: 'Por qué recomendamos un sitio web dinámico',
  sitioEstatico: {
    title: '🔴 SITIOS ESTÁTICOS',
    items: [
      { label: '¿Qué son?', value: 'Páginas web fijas que no cambian a menos que alguien modifique el código HTML/CSS directamente. El contenido es idéntico para todos los visitantes.' },
      { 
        label: 'Características',
        list: [
          'Contenido fijo (no cambia automáticamente)',
          'Páginas HTML simples',
          'No tienen base de datos',
          'Muy rápidos (cargan en milisegundos)',
          'Difíciles de actualizar (requieren programador cada vez)',
        ]
      },
    ],
  },
  sitioDinamico: {
    title: '🔵 SITIOS DINÁMICOS',
    items: [
      { label: '¿Qué son?', value: 'Sitios web cuyo contenido SÍ cambia automáticamente según lo que necesites. El servidor procesa solicitudes en tiempo real y muestra información personalizada de una base de datos.' },
      { 
        label: 'Características',
        list: [
          'Contenido que cambia dinámicamente',
          'Tienen base de datos (MySQL)',
          'Servidor procesa solicitudes en tiempo real',
          'Panel de administración intuitivo',
          'Fáciles de actualizar (usuario no técnico)',
          'Más funcionalidad',
        ]
      },
    ],
  },
  recomendacion: {
    titulo: '¿CUÁL RECOMENDAMOS PARA Urbanísima Constructora S.R.L?',
    subtitulo: 'NUESTRA RECOMENDACIÓN:',
    tipo: 'SITIO DINÁMICO',
    razones: [
      'Actualizaciones frecuentes: Tu catálogo cambia según tus necesidades (nuevos servicios, precios, disponibilidad)',
      'Bajo nivel de tecnicismo: El sitio dinámico gestiona contenido desde interfaz intuitiva',
      'Posibilidad de crear blog para marketing: Excelente para SEO y posicionamiento',
      'Crecimiento sin límites: Si quieres vender online en el futuro',
      'Independencia: Si en algún momento deseas cambiar de proveedor o si quieres gestionar tú mismo el sitio',
      'Mejor inversión a largo plazo: Aunque el costo inicial y los pagos recurrentes son mayores, es más rentable con el tiempo',
      'Profesionalismo: Transmite imagen más profesional y moderna',
      'Funcionalidades avanzadas: Permite realizar búsqueda, filtros e integración con redes sociales',
      'Optimización: Mejores prácticas para posicionamiento en Google',
      'Seguridad: Actualizaciones y parches regulares para proteger tu sitio',
    ],
  },
}

export default function DinamicoVsEstaticoContent({
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
}: DinamicoVsEstaticoContentProps) {
  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    estatico: seccionesColapsadas.dinamico_estatico ?? true,
    dinamico: seccionesColapsadas.dinamico_dinamico ?? true,
    recomendacion: seccionesColapsadas.dinamico_recomendacion ?? true,
  }

  // Valores por defecto para visibilidad
  const vis = visibilidad || { titulos: true, estatico: true, dinamico: true, recomendacion: true }
  const handleVisChange = (key: keyof VisibilidadComparativa, value: boolean) => {
    if (onVisibilidadChange) onVisibilidadChange(key, value)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`dinamico_${section}`, newValue)
  }

  // Helper para actualizar items de comparación
  const updateComparisonItem = (
    tipo: 'sitioEstatico' | 'sitioDinamico',
    itemIndex: number,
    field: 'label' | 'value',
    value: string
  ) => {
    const newItems = [...data[tipo].items]
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
    onChange({
      ...data,
      [tipo]: { ...data[tipo], items: newItems },
    })
  }

  const updateComparisonList = (
    tipo: 'sitioEstatico' | 'sitioDinamico',
    itemIndex: number,
    list: string[]
  ) => {
    const newItems = [...data[tipo].items]
    newItems[itemIndex] = { ...newItems[itemIndex], list }
    onChange({
      ...data,
      [tipo]: { ...data[tipo], items: newItems },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader
        title="Dinámico vs Estático"
        icon={<FaExchangeAlt className="text-gh-info" />}
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
        {/* SITIO ESTÁTICO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.estatico === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('estatico')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                🔴 Sitios Estáticos
              </span>
              {expandedSections.estatico ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.estatico !== false} 
              onChange={(v) => handleVisChange('estatico', v)}
            />
          </div>

          {expandedSections.estatico && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Título de la tarjeta</label>
                <input
                  type="text"
                  value={data.sitioEstatico.title}
                  onChange={(e) => onChange({ ...data, sitioEstatico: { ...data.sitioEstatico, title: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                />
              </div>
              {data.sitioEstatico.items.map((item, index) => (
                <div key={`estatico-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div>
                    <label className="block text-gh-text-muted text-xs mb-1">Etiqueta</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateComparisonItem('sitioEstatico', index, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                    />
                  </div>
                  {item.value !== undefined && (
                    <div className="mt-2">
                      <label className="block text-gh-text-muted text-xs mb-1">Valor</label>
                      <textarea
                        value={item.value}
                        onChange={(e) => updateComparisonItem('sitioEstatico', index, 'value', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                        rows={2}
                      />
                    </div>
                  )}
                  {item.list !== undefined && (
                    <div className="mt-2">
                      <ArrayFieldGH
                        label="Lista de características"
                        items={item.list}
                        onChange={(list) => updateComparisonList('sitioEstatico', index, list)}
                        placeholder="Nueva característica..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SITIO DINÁMICO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.dinamico === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('dinamico')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                🔵 Sitios Dinámicos
              </span>
              {expandedSections.dinamico ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.dinamico !== false} 
              onChange={(v) => handleVisChange('dinamico', v)}
            />
          </div>

          {expandedSections.dinamico && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Título de la tarjeta</label>
                <input
                  type="text"
                  value={data.sitioDinamico.title}
                  onChange={(e) => onChange({ ...data, sitioDinamico: { ...data.sitioDinamico, title: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                />
              </div>
              {data.sitioDinamico.items.map((item, index) => (
                <div key={`dinamico-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div>
                    <label className="block text-gh-text-muted text-xs mb-1">Etiqueta</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateComparisonItem('sitioDinamico', index, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                    />
                  </div>
                  {item.value !== undefined && (
                    <div className="mt-2">
                      <label className="block text-gh-text-muted text-xs mb-1">Valor</label>
                      <textarea
                        value={item.value}
                        onChange={(e) => updateComparisonItem('sitioDinamico', index, 'value', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                        rows={2}
                      />
                    </div>
                  )}
                  {item.list !== undefined && (
                    <div className="mt-2">
                      <ArrayFieldGH
                        label="Lista de características"
                        items={item.list}
                        onChange={(list) => updateComparisonList('sitioDinamico', index, list)}
                        placeholder="Nueva característica..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RECOMENDACIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.recomendacion === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('recomendacion')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                💡 Recomendación Final
              </span>
              {expandedSections.recomendacion ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.recomendacion !== false} 
              onChange={(v) => handleVisChange('recomendacion', v)}
            />
          </div>

          {expandedSections.recomendacion && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                <input
                  type="text"
                  value={data.recomendacion.titulo}
                  onChange={(e) => onChange({ ...data, recomendacion: { ...data.recomendacion, titulo: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
                  <input
                    type="text"
                    value={data.recomendacion.subtitulo}
                    onChange={(e) => onChange({ ...data, recomendacion: { ...data.recomendacion, subtitulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Tipo Recomendado</label>
                  <input
                    type="text"
                    value={data.recomendacion.tipo}
                    onChange={(e) => onChange({ ...data, recomendacion: { ...data.recomendacion, tipo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>
              <ArrayFieldGH
                label="Razones de la Recomendación"
                items={data.recomendacion.razones}
                onChange={(items) => onChange({ ...data, recomendacion: { ...data.recomendacion, razones: items } })}
                placeholder="Nueva razón..."
              />
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
