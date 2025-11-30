'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaFileAlt, FaTag, FaCalendar, FaDollarSign, FaCalculator, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { QuotationConfig } from '@/lib/types'

interface CotizacionInfoContentProps {
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  erroresValidacionCotizacion: {
    fechas?: string
  }
  formatearFechaLarga: (isoString: string) => string
  calcularFechaVencimiento: (fecha: Date, dias: number) => Date
}

export default function CotizacionInfoContent({
  cotizacionConfig,
  setCotizacionConfig,
  erroresValidacionCotizacion,
  formatearFechaLarga,
  calcularFechaVencimiento,
}: Readonly<CotizacionInfoContentProps>) {
  const estaConfigurada = cotizacionConfig?.heroTituloSub && cotizacionConfig?.fechaEmision

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
          <FaFileAlt className="text-gh-info" /> Información de Cotización
        </h4>
        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
          estaConfigurada 
            ? 'bg-gh-success/10 text-gh-success' 
            : 'bg-gh-warning/10 text-gh-warning'
        }`}>
          {estaConfigurada ? (
            <><FaCheck size={10} /> Configurada</>
          ) : (
            <><FaExclamationTriangle size={10} /> Incompleta</>
          )}
        </span>
      </div>

      {/* Formulario */}
      <div className="space-y-4 p-6 bg-gh-bg-overlay border border-gh-border rounded-lg">

      {/* Título Secundario (Hero) */}
      <div>
        <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Nombre de la cotización</label>
        <input
          type="text"
          value={cotizacionConfig?.heroTituloSub || ''}
          onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, heroTituloSub: e.target.value } : null)}
          className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted"
          placeholder="Ej: PÁGINA CATÁLOGO DINÁMICA"
        />
        <p className="text-gh-text-muted text-xs mt-2">Se muestra en la página principal</p>
      </div>

      {/* GRUPO 1: Identificación */}
      <div className="pt-4 border-t border-gh-border">
        <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaTag className="text-gh-warning" /> Identificación
        </h5>
        <div className="grid md:grid-cols-2 gap-3">
          {/* Número (readonly) */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Número</label>
            <input
              type="text"
              value={cotizacionConfig?.numero || ''}
              disabled
              className="w-full px-3 py-2 bg-gh-bg-secondary text-gh-text-muted border border-gh-border rounded-md focus:outline-none text-xs cursor-not-allowed"
              placeholder="Auto-generado"
            />
            <p className="text-gh-text-muted text-xs mt-2">Se genera automáticamente</p>
          </div>

          {/* Firma de Autorización */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Firma</label>
            <input
              type="text"
              placeholder="Nombre y firma"
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted"
            />
          </div>
        </div>
      </div>

      {/* GRUPO 2: Fechas */}
      <div className="pt-4 border-t border-gh-border">
        <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaCalendar className="text-gh-warning" /> Fechas
        </h5>
        <div className="grid md:grid-cols-3 gap-3">
          {/* Fecha Emisión */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Fecha Emisión</label>
            <input
              type="date"
              value={cotizacionConfig?.fechaEmision ? new Date(cotizacionConfig.fechaEmision).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newFecha = new Date(e.target.value)
                const newFechaVencimiento = calcularFechaVencimiento(newFecha, cotizacionConfig?.tiempoValidez || 30)
                if (cotizacionConfig) {
                  setCotizacionConfig({
                    ...cotizacionConfig,
                    fechaEmision: newFecha.toISOString(),
                    fechaVencimiento: newFechaVencimiento.toISOString(),
                  })
                }
              }}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
            />
          </div>

          {/* Tiempo Validez */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Validez (días)</label>
            <input
              type="number"
              value={cotizacionConfig?.tiempoValidez || 30}
              onChange={(e) => {
                const newValue = parseInt(e.target.value) || 30
                if (cotizacionConfig) {
                  const newFechaVencimiento = calcularFechaVencimiento(new Date(cotizacionConfig.fechaEmision), newValue)
                  setCotizacionConfig({
                    ...cotizacionConfig,
                    tiempoValidez: newValue,
                    fechaVencimiento: newFechaVencimiento.toISOString(),
                  })
                }
              }}
              min="1"
              max="365"
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
            />
          </div>

          {/* Fecha Vencimiento (readonly) */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Vencimiento</label>
            <input
              type="text"
              value={cotizacionConfig?.fechaVencimiento ? formatearFechaLarga(cotizacionConfig.fechaVencimiento) : ''}
              disabled
              className="w-full px-3 py-2 bg-gh-bg-secondary text-gh-text-muted border border-gh-border rounded-md focus:outline-none text-xs cursor-not-allowed"
            />
            {erroresValidacionCotizacion.fechas && (
              <p className="text-red-500 text-xs mt-2">{erroresValidacionCotizacion.fechas}</p>
            )}
          </div>
        </div>
      </div>

      {/* GRUPO 3: Presupuesto */}
      <div className="pt-4 border-t border-gh-border">
        <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaDollarSign className="text-gh-success" /> Presupuesto
        </h5>
        <div className="grid md:grid-cols-2 gap-3">
          {/* Presupuesto */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Monto</label>
            <input
              type="text"
              value={cotizacionConfig?.presupuesto || ''}
              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, presupuesto: e.target.value } : null)}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted"
              placeholder="Ej: Menos de $300 USD"
            />
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Moneda</label>
            <select
              value={cotizacionConfig?.moneda || 'USD'}
              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, moneda: e.target.value } : null)}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>CUP</option>
              <option>MXN</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRUPO 4: Vigencia del Contrato */}
      <div className="pt-4 border-t border-gh-border">
        <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaCalculator className="text-gh-info" /> Vigencia del Contrato
        </h5>
        <div className="grid md:grid-cols-3 gap-3">
          {/* Valor */}
          <div>
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Valor</label>
            <input
              type="number"
              value={cotizacionConfig?.tiempoVigenciaValor || 12}
              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaValor: parseInt(e.target.value) || 12 } : null)}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
              min="1"
              max="365"
            />
          </div>

          {/* Unidad */}
          <div className="md:col-span-2">
            <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Unidad de Tiempo</label>
            <select
              value={cotizacionConfig?.tiempoVigenciaUnidad || 'meses'}
              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaUnidad: e.target.value } : null)}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
            >
              <option value="días">Días</option>
              <option value="meses">Meses</option>
              <option value="años">Años</option>
            </select>
          </div>
        </div>
      </div>
      </div>

      {/* Footer Resumen */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span className="text-gh-text-muted">
          Número: <span className="text-gh-text font-medium">{cotizacionConfig?.numero || '—'}</span>
        </span>
        <span className="text-gh-text-muted">
          Validez: <span className="text-gh-text font-medium">{cotizacionConfig?.tiempoValidez || 30} días</span>
        </span>
        <span className="text-gh-text-muted">
          Moneda: <span className="text-gh-text font-medium">{cotizacionConfig?.moneda || 'USD'}</span>
        </span>
      </div>
    </motion.div>
  )
}
