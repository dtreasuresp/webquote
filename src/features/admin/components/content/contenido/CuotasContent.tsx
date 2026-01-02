'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, ChevronDown, ChevronUp, Plus, Trash2, DollarSign } from 'lucide-react'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAdminAudit } from '../../../hooks/useAdminAudit'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import ArrayFieldGH from './ArrayFieldGH'
import ToggleItem from '@/features/admin/components/ToggleItem'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { SeccionesColapsadasConfig } from '@/lib/types'

// Tipos para Cuotas
export interface RangoPresupuestoCuotas {
  paquete: string
  rangoMin: number
  rangoMax: number
  descripcion: string
  caracteristicas: string[]
}

export interface MetodoPagoCuotas {
  nombre: string
  porcentaje?: number
  descripcion: string
}

export interface CuotasData {
  titulo: string
  subtitulo: string
  metodosPago: {
    visible: boolean
    titulo: string
    opciones: MetodoPagoCuotas[]
  }
  presupuesto: {
    visible: boolean
    titulo: string
    descripcion: string
    rangos: RangoPresupuestoCuotas[]
    notaImportante: string
  }
}

interface CuotasContentProps {
  readonly data: CuotasData
  readonly onChange: (data: CuotasData) => void
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
export const defaultCuotas: CuotasData = {
  titulo: 'Opciones de Pago',
  subtitulo: 'Cuotas y financiamiento disponibles',
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
}

export default function CuotasContent({
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
}: CuotasContentProps) {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('CONTENT')
  
  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    metodosPago: seccionesColapsadas.cuotas_metodosPago ?? true,
    presupuesto: seccionesColapsadas.cuotas_presupuesto ?? false,
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`cuotas_${section}`, newValue)
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Métodos de Pago
  // ═══════════════════════════════════════════════════════════════
  const addMetodoPago = () => {
    if (!canEdit) return
    const newMetodo: MetodoPagoCuotas = {
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

  const updateMetodoPago = (index: number, field: keyof MetodoPagoCuotas, value: string | number | undefined) => {
    if (!canEdit) return
    const newOpciones = [...data.metodosPago.opciones]
    newOpciones[index] = { ...newOpciones[index], [field]: value }
    onChange({
      ...data,
      metodosPago: { ...data.metodosPago, opciones: newOpciones },
    })
  }

  const removeMetodoPago = (index: number) => {
    if (!canEdit) return
    onChange({
      ...data,
      metodosPago: {
        ...data.metodosPago,
        opciones: data.metodosPago.opciones.filter((_, i) => i !== index),
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Rangos de Presupuesto
  // ═══════════════════════════════════════════════════════════════
  const addRango = () => {
    if (!canEdit) return
    const newRango: RangoPresupuestoCuotas = {
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

  const updateRango = (index: number, field: keyof RangoPresupuestoCuotas, value: string | number | string[]) => {
    if (!canEdit) return
    const newRangos = [...data.presupuesto.rangos]
    newRangos[index] = { ...newRangos[index], [field]: value }
    onChange({
      ...data,
      presupuesto: { ...data.presupuesto, rangos: newRangos },
    })
  }

  const removeRango = (index: number) => {
    if (!canEdit) return
    onChange({
      ...data,
      presupuesto: {
        ...data.presupuesto,
        rangos: data.presupuesto.rangos.filter((_, i) => i !== index),
      },
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
        title="Opciones de Pago"
        description="Cuotas y financiamiento disponibles"
        icon={<CreditCard className="w-4 h-4" />}
        updatedAt={updatedAt}
        onSave={() => {
          onGuardar()
          logAction('UPDATE', 'CONTENT', 'save-cuotas', 'Guardadas Opciones de Pago')
        }}
        onCancel={onReset}
        isSaving={guardando}
        statusIndicator={hasChanges ? 'modificado' : 'guardado'}
        variant="accent"
      />

      {/* Toggle de visibilidad global - Fila 2 */}
      <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
        <span className="text-xs font-medium text-gh-text">Mostrar sección en la página pública</span>
        <ToggleItem enabled={visible} onChange={onVisibleChange} title="" showBadge={false} />
      </div>

      {/* Contenedor con opacity si global OFF */}
      <div className={`space-y-4 transition-opacity duration-200 ${!visible ? 'opacity-50' : ''}`}>
        
        {/* Subsección: Títulos */}
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
                value={data.titulo}
                onChange={(e) => onChange({ ...data, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MÉTODOS DE PAGO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('metodosPago')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-xs font-medium text-gh-text font-medium">
                💳 Métodos de Pago
              </span>
              {expandedSections.metodosPago ? <ChevronUp className="text-gh-text-muted" /> : <ChevronDown className="text-gh-text-muted" />}
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
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                />
              </div>

              {data.metodosPago.opciones.map((metodo, index) => (
                <div key={`metodo-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border/30 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gh-text">{metodo.nombre}</span>
                    <button
                      onClick={() => removeMetodoPago(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <Trash2 />
                    </button>
                  </div>
                  <div className="grid grid-cols-[1.1fr_0.6fr_3fr] gap-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre</label>
                      <input
                        type="text"
                        value={metodo.nombre}
                        onChange={(e) => updateMetodoPago(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Porcentaje (%)</label>
                      <input
                        type="number"
                        value={metodo.porcentaje ?? ''}
                        onChange={(e) => updateMetodoPago(index, 'porcentaje', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                        placeholder="Opcional"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                      <input
                        type="text"
                        value={metodo.descripcion}
                        onChange={(e) => updateMetodoPago(index, 'descripcion', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addMetodoPago}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <Plus /> Agregar Método
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RANGOS DE PRESUPUESTO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('presupuesto')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-xs font-medium text-gh-text font-medium">
                <DollarSign className="text-gh-success" /> Rangos de Presupuesto
              </span>
              {expandedSections.presupuesto ? <ChevronUp className="text-gh-text-muted" /> : <ChevronDown className="text-gh-text-muted" />}
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
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.presupuesto.descripcion}
                    onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Rangos */}
              {data.presupuesto.rangos.map((rango, index) => (
                <div key={`rango-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border/30 rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gh-text">{rango.paquete}</span>
                    <button
                      onClick={() => removeRango(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <Trash2 />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre del paquete</label>
                      <input
                        type="text"
                        value={rango.paquete}
                        onChange={(e) => updateRango(index, 'paquete', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Mínimo ($)</label>
                      <input
                        type="number"
                        value={rango.rangoMin}
                        onChange={(e) => updateRango(index, 'rangoMin', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Máximo ($)</label>
                      <input
                        type="number"
                        value={rango.rangoMax}
                        onChange={(e) => updateRango(index, 'rangoMax', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <input
                      type="text"
                      value={rango.descripcion}
                      onChange={(e) => updateRango(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
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
                <Plus /> Agregar Rango
              </button>

              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Nota Importante</label>
                <textarea
                  value={data.presupuesto.notaImportante}
                  onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, notaImportante: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
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




