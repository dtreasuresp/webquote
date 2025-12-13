'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Trash2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface MetodoPagoItem {
  nombre: string
  porcentaje?: number
  descripcion: string
}

export interface MetodosPagoData {
  /** Visibilidad de la sección */
  visible: boolean
  /** Título de la sección */
  titulo: string
  /** Subtítulo de la sección */
  subtitulo: string
  /** Lista de métodos de pago */
  opciones: MetodoPagoItem[]
}

export interface MetodosPagoContentProps {
  readonly data: MetodosPagoData
  readonly onChange: (data: MetodosPagoData) => void
}

// ═══════════════════════════════════════════════════════════════
// DATOS POR DEFECTO
// ═══════════════════════════════════════════════════════════════

export const defaultMetodosPago: MetodosPagoData = {
  visible: true,
  titulo: 'Métodos de Pago',
  subtitulo: 'Opciones de pago flexibles para tu comodidad',
  opciones: [
    { nombre: 'Anticipo', porcentaje: 50, descripcion: 'Al iniciar el proyecto' },
    { nombre: 'Entrega', porcentaje: 50, descripcion: 'Al finalizar y aprobar el proyecto' },
    { nombre: 'Transferencia bancaria', descripcion: 'Nacional e internacional' },
    { nombre: 'Efectivo', descripcion: 'Pagos presenciales' },
  ],
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function MetodosPagoContent({
  data,
  onChange,
}: MetodosPagoContentProps) {

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Métodos de Pago
  // ═══════════════════════════════════════════════════════════════
  const addMetodoPago = () => {
    const newMetodo: MetodoPagoItem = {
      nombre: 'Nuevo método',
      descripcion: '',
    }
    onChange({
      ...data,
      opciones: [...data.opciones, newMetodo],
    })
  }

  const updateMetodoPago = (index: number, field: keyof MetodoPagoItem, value: string | number | undefined) => {
    const newOpciones = [...data.opciones]
    newOpciones[index] = { ...newOpciones[index], [field]: value }
    onChange({
      ...data,
      opciones: newOpciones,
    })
  }

  const removeMetodoPago = (index: number) => {
    onChange({
      ...data,
      opciones: data.opciones.filter((_, i) => i !== index),
    })
  }

  // Calcular total de porcentajes (para métodos con porcentaje)
  const metodosConPorcentaje = data.opciones.filter(m => m.porcentaje !== undefined && m.porcentaje > 0)
  const totalPorcentaje = metodosConPorcentaje.reduce((sum, m) => sum + (m.porcentaje || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gh-info/20 flex items-center justify-center">
          <CreditCard className="text-gh-info" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gh-text">Métodos de Pago</h2>
          <p className="text-xs text-gh-text-muted">Configura las opciones de pago aceptadas</p>
        </div>
      </div>

      {/* Título y Subtítulo de la sección */}
      <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg space-y-3">
        <div>
          <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
          <input
            type="text"
            value={data.titulo}
            onChange={(e) => onChange({ ...data, titulo: e.target.value })}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
            placeholder="Métodos de Pago"
          />
        </div>
        <div>
          <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
          <input
            type="text"
            value={data.subtitulo || ''}
            onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
            placeholder="Opciones de pago flexibles para tu comodidad"
          />
        </div>
      </div>

      {/* Info sobre porcentajes */}
      {metodosConPorcentaje.length > 0 && (
        <div className={`p-3 rounded-md border ${
          totalPorcentaje === 100 
            ? 'bg-gh-success/10 border-gh-success/30' 
            : 'bg-gh-warning/10 border-gh-warning/30'
        }`}>
          <p className="text-xs text-gh-text-muted">
            {totalPorcentaje === 100 ? (
              <span className="text-gh-success">✓ Los métodos con porcentaje suman correctamente 100%</span>
            ) : (
              <span className="text-gh-warning">⚠️ Los métodos con porcentaje suman {totalPorcentaje}% (deberían sumar 100%)</span>
            )}
          </p>
        </div>
      )}

      {/* Lista de Métodos de Pago */}
      <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-gh-text font-medium">
            💳 Opciones de Pago
          </span>
          <span className="text-xs text-gh-text-muted bg-gh-bg-tertiary px-2 py-1 rounded">
            {data.opciones.length} método{data.opciones.length !== 1 ? 's' : ''}
          </span>
        </div>

        {data.opciones.length === 0 ? (
          <div className="p-4 bg-gh-warning/10 border border-gh-warning/30 rounded-md text-center">
            <p className="text-sm text-gh-warning">No hay métodos de pago configurados.</p>
            <p className="text-xs text-gh-text-muted mt-1">Agrega al menos un método de pago.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.opciones.map((metodo, index) => (
              <div key={`metodo-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border/30 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gh-text">{metodo.nombre || 'Sin nombre'}</span>
                  <button
                    onClick={() => removeMetodoPago(index)}
                    className="text-gh-danger hover:text-gh-danger/80 text-xs p-1 hover:bg-gh-danger/10 rounded transition-colors"
                    title="Eliminar método"
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
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-info focus:outline-none"
                      placeholder="Ej: Transferencia"
                    />
                  </div>
                  <div>
                    <label className="block text-gh-text-muted text-xs mb-1">Porcentaje (%)</label>
                    <input
                      type="number"
                      value={metodo.porcentaje ?? ''}
                      onChange={(e) => updateMetodoPago(index, 'porcentaje', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-info focus:outline-none"
                      placeholder="Opcional"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <input
                      type="text"
                      value={metodo.descripcion}
                      onChange={(e) => updateMetodoPago(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-info focus:outline-none"
                      placeholder="Ej: Al iniciar el proyecto"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={addMetodoPago}
          className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
        >
          <Plus /> Agregar Método
        </button>
      </div>

      {/* Vista previa */}
      {data.opciones.length > 0 && (
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
          <h3 className="text-xs font-medium text-gh-text-muted mb-3">Vista Previa</h3>
          <div className="space-y-2">
            {data.opciones.map((metodo, index) => (
              <div 
                key={`preview-${index}`} 
                className="flex items-center justify-between p-2 bg-gh-bg-secondary rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gh-text">{metodo.nombre}</span>
                  {metodo.porcentaje !== undefined && metodo.porcentaje > 0 && (
                    <span className="text-xs bg-gh-info/20 text-gh-info px-1.5 py-0.5 rounded">
                      {metodo.porcentaje}%
                    </span>
                  )}
                </div>
                <span className="text-xs text-gh-text-muted">{metodo.descripcion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}


