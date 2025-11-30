'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaDollarSign, FaClock } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ArrayFieldGH from '@/features/admin/components/content/contenido/ArrayFieldGH'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { SeccionesColapsadasConfig } from '@/lib/types'

// Tipos para Presupuesto y Cronograma
export interface RangoPresupuesto {
  paquete: string
  rangoMin: number
  rangoMax: number
  descripcion: string
  caracteristicas: string[]
}

export interface MetodoPago {
  nombre: string
  porcentaje?: number
  descripcion: string
}

export interface FaseCronograma {
  nombre: string
  duracionDias: number
  descripcion: string
  entregables: string[]
}

export interface PresupuestoCronogramaData {
  titulo: string
  subtitulo: string
  presupuesto: {
    visible: boolean
    titulo: string
    descripcion: string
    rangos: RangoPresupuesto[]
    notaImportante: string
  }
  metodosPago: {
    visible: boolean
    titulo: string
    opciones: MetodoPago[]
  }
  cronograma: {
    visible: boolean
    titulo: string
    descripcion: string
    duracionTotal: string
    fases: FaseCronograma[]
  }
}

interface PresupuestoCronogramaContentProps {
  readonly data: PresupuestoCronogramaData
  readonly onChange: (data: PresupuestoCronogramaData) => void
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
export const defaultPresupuestoCronograma: PresupuestoCronogramaData = {
  titulo: 'Presupuesto y Cronograma',
  subtitulo: 'Inversión y tiempos de desarrollo',
  presupuesto: {
    visible: true,
    titulo: 'Rangos de Presupuesto',
    descripcion: 'Ofrecemos diferentes paquetes adaptados a las necesidades de cada cliente',
    rangos: [
      {
        paquete: 'Básico',
        rangoMin: 500,
        rangoMax: 1000,
        descripcion: 'Ideal para emprendedores y pequeñas empresas',
        caracteristicas: ['Hasta 5 páginas', 'Diseño responsive', 'SEO básico', 'Formulario de contacto'],
      },
      {
        paquete: 'Profesional',
        rangoMin: 1000,
        rangoMax: 2500,
        descripcion: 'Para empresas en crecimiento',
        caracteristicas: ['Hasta 15 páginas', 'Panel de administración', 'Blog integrado', 'Optimización SEO avanzada'],
      },
      {
        paquete: 'Enterprise',
        rangoMin: 2500,
        rangoMax: 5000,
        descripcion: 'Soluciones corporativas completas',
        caracteristicas: ['Páginas ilimitadas', 'E-commerce', 'Integraciones personalizadas', 'Soporte prioritario'],
      },
    ],
    notaImportante: 'Los precios pueden variar según requerimientos específicos. Se entregará cotización formal después de evaluar el proyecto.',
  },
  metodosPago: {
    visible: true,
    titulo: 'Métodos de Pago',
    opciones: [
      { nombre: 'Anticipo', porcentaje: 50, descripcion: 'Al iniciar el proyecto' },
      { nombre: 'Entrega', porcentaje: 50, descripcion: 'Al finalizar y aprobar el proyecto' },
      { nombre: 'Transferencia bancaria', descripcion: 'Nacional e internacional' },
      { nombre: 'Efectivo', descripcion: 'Pagos presenciales' },
    ],
  },
  cronograma: {
    visible: true,
    titulo: 'Cronograma de Desarrollo',
    descripcion: 'Proceso estructurado para garantizar entregas de calidad',
    duracionTotal: '4-8 semanas según complejidad',
    fases: [
      {
        nombre: 'Descubrimiento y Planificación',
        duracionDias: 5,
        descripcion: 'Análisis de requisitos y definición del alcance',
        entregables: ['Documento de especificaciones', 'Wireframes', 'Plan de proyecto'],
      },
      {
        nombre: 'Diseño',
        duracionDias: 7,
        descripcion: 'Creación del diseño visual y experiencia de usuario',
        entregables: ['Mockups', 'Guía de estilos', 'Prototipo interactivo'],
      },
      {
        nombre: 'Desarrollo',
        duracionDias: 14,
        descripcion: 'Implementación del código y funcionalidades',
        entregables: ['Sitio funcional', 'Panel de administración', 'Integraciones'],
      },
      {
        nombre: 'Pruebas y Lanzamiento',
        duracionDias: 5,
        descripcion: 'Testing, ajustes finales y despliegue',
        entregables: ['Sitio en producción', 'Documentación', 'Capacitación'],
      },
    ],
  },
}

export default function PresupuestoCronogramaContent({
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
}: PresupuestoCronogramaContentProps) {
  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    presupuesto: seccionesColapsadas.presupuesto_presupuesto ?? true,
    metodosPago: seccionesColapsadas.presupuesto_metodosPago ?? false,
    cronograma: seccionesColapsadas.presupuesto_cronograma ?? false,
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`presupuesto_${section}`, newValue)
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Rangos de Presupuesto
  // ═══════════════════════════════════════════════════════════════
  const addRango = () => {
    const newRango: RangoPresupuesto = {
      paquete: 'Nuevo Paquete',
      rangoMin: 0,
      rangoMax: 0,
      descripcion: '',
      caracteristicas: [],
    }
    onChange({
      ...data,
      presupuesto: {
        ...data.presupuesto,
        rangos: [...data.presupuesto.rangos, newRango],
      },
    })
  }

  const updateRango = (index: number, field: keyof RangoPresupuesto, value: string | number | string[]) => {
    const newRangos = [...data.presupuesto.rangos]
    newRangos[index] = { ...newRangos[index], [field]: value }
    onChange({
      ...data,
      presupuesto: { ...data.presupuesto, rangos: newRangos },
    })
  }

  const removeRango = (index: number) => {
    onChange({
      ...data,
      presupuesto: {
        ...data.presupuesto,
        rangos: data.presupuesto.rangos.filter((_, i) => i !== index),
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Métodos de Pago
  // ═══════════════════════════════════════════════════════════════
  const addMetodoPago = () => {
    const newMetodo: MetodoPago = {
      nombre: 'Nuevo método',
      descripcion: '',
    }
    onChange({
      ...data,
      metodosPago: {
        ...data.metodosPago,
        opciones: [...data.metodosPago.opciones, newMetodo],
      },
    })
  }

  const updateMetodoPago = (index: number, field: keyof MetodoPago, value: string | number | undefined) => {
    const newOpciones = [...data.metodosPago.opciones]
    newOpciones[index] = { ...newOpciones[index], [field]: value }
    onChange({
      ...data,
      metodosPago: { ...data.metodosPago, opciones: newOpciones },
    })
  }

  const removeMetodoPago = (index: number) => {
    onChange({
      ...data,
      metodosPago: {
        ...data.metodosPago,
        opciones: data.metodosPago.opciones.filter((_, i) => i !== index),
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Fases del Cronograma
  // ═══════════════════════════════════════════════════════════════
  const addFase = () => {
    const newFase: FaseCronograma = {
      nombre: 'Nueva Fase',
      duracionDias: 7,
      descripcion: '',
      entregables: [],
    }
    onChange({
      ...data,
      cronograma: {
        ...data.cronograma,
        fases: [...data.cronograma.fases, newFase],
      },
    })
  }

  const updateFase = (index: number, field: keyof FaseCronograma, value: string | number | string[]) => {
    const newFases = [...data.cronograma.fases]
    newFases[index] = { ...newFases[index], [field]: value }
    onChange({
      ...data,
      cronograma: { ...data.cronograma, fases: newFases },
    })
  }

  const removeFase = (index: number) => {
    onChange({
      ...data,
      cronograma: {
        ...data.cronograma,
        fases: data.cronograma.fases.filter((_, i) => i !== index),
      },
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
        title="Presupuesto y Cronograma"
        icon={<FaCalendarAlt className="text-gh-warning" />}
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
        {/* PRESUPUESTO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('presupuesto')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                <FaDollarSign className="text-gh-success" /> Rangos de Presupuesto
              </span>
              {expandedSections.presupuesto ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.presupuesto.visible}
              onChange={(v) => onChange({ ...data, presupuesto: { ...data.presupuesto, visible: v } })}
            />
          </div>

          {expandedSections.presupuesto && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={data.presupuesto.titulo}
                    onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.presupuesto.descripcion}
                    onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Rangos */}
              {data.presupuesto.rangos.map((rango, index) => (
                <div key={`rango-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gh-text">{rango.paquete}</span>
                    <button
                      onClick={() => removeRango(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre del paquete</label>
                      <input
                        type="text"
                        value={rango.paquete}
                        onChange={(e) => updateRango(index, 'paquete', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Mínimo ($)</label>
                      <input
                        type="number"
                        value={rango.rangoMin}
                        onChange={(e) => updateRango(index, 'rangoMin', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Máximo ($)</label>
                      <input
                        type="number"
                        value={rango.rangoMax}
                        onChange={(e) => updateRango(index, 'rangoMax', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <input
                      type="text"
                      value={rango.descripcion}
                      onChange={(e) => updateRango(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                    />
                  </div>
                  <ArrayFieldGH
                    label="Características incluidas"
                    items={rango.caracteristicas}
                    onChange={(items) => updateRango(index, 'caracteristicas', items)}
                    placeholder="Nueva característica..."
                  />
                </div>
              ))}

              <button
                onClick={addRango}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Rango
              </button>

              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Nota Importante</label>
                <textarea
                  value={data.presupuesto.notaImportante}
                  onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, notaImportante: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MÉTODOS DE PAGO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('metodosPago')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                💳 Métodos de Pago
              </span>
              {expandedSections.metodosPago ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.metodosPago.visible}
              onChange={(v) => onChange({ ...data, metodosPago: { ...data.metodosPago, visible: v } })}
            />
          </div>

          {expandedSections.metodosPago && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                <input
                  type="text"
                  value={data.metodosPago.titulo}
                  onChange={(e) => onChange({ ...data, metodosPago: { ...data.metodosPago, titulo: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                />
              </div>

              {data.metodosPago.opciones.map((metodo, index) => (
                <div key={`metodo-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gh-text">{metodo.nombre}</span>
                    <button
                      onClick={() => removeMetodoPago(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre</label>
                      <input
                        type="text"
                        value={metodo.nombre}
                        onChange={(e) => updateMetodoPago(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Porcentaje (%)</label>
                      <input
                        type="number"
                        value={metodo.porcentaje ?? ''}
                        onChange={(e) => updateMetodoPago(index, 'porcentaje', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                        placeholder="Opcional"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                      <input
                        type="text"
                        value={metodo.descripcion}
                        onChange={(e) => updateMetodoPago(index, 'descripcion', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addMetodoPago}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Método
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CRONOGRAMA */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('cronograma')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                <FaClock className="text-gh-info" /> Cronograma de Desarrollo
              </span>
              {expandedSections.cronograma ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.cronograma.visible}
              onChange={(v) => onChange({ ...data, cronograma: { ...data.cronograma, visible: v } })}
            />
          </div>

          {expandedSections.cronograma && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={data.cronograma.titulo}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.cronograma.descripcion}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Duración Total</label>
                  <input
                    type="text"
                    value={data.cronograma.duracionTotal}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, duracionTotal: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Fases */}
              {data.cronograma.fases.map((fase, index) => (
                <div key={`fase-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gh-text">Fase {index + 1}: {fase.nombre}</span>
                    <button
                      onClick={() => removeFase(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre de la fase</label>
                      <input
                        type="text"
                        value={fase.nombre}
                        onChange={(e) => updateFase(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Duración (días)</label>
                      <input
                        type="number"
                        value={fase.duracionDias}
                        onChange={(e) => updateFase(index, 'duracionDias', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <input
                      type="text"
                      value={fase.descripcion}
                      onChange={(e) => updateFase(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                    />
                  </div>
                  <ArrayFieldGH
                    label="Entregables"
                    items={fase.entregables}
                    onChange={(items) => updateFase(index, 'entregables', items)}
                    placeholder="Nuevo entregable..."
                  />
                </div>
              ))}

              <button
                onClick={addFase}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Fase
              </button>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}
