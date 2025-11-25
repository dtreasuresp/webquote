'use client'

import React, { useMemo } from 'react'
import { FaFileAlt, FaTag, FaCalendar, FaDollarSign, FaCalculator, FaMapMarkerAlt, FaEnvelope, FaSpinner } from 'react-icons/fa'
import { QuotationConfig } from '@/lib/types'

interface CotizacionTabProps {
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  cargandoCotizacion: boolean
  erroresValidacionCotizacion: {
    emailProveedor?: string
    whatsappProveedor?: string
    emailCliente?: string
    whatsappCliente?: string
    fechas?: string
    empresa?: string
    profesional?: string
    numero?: string
    version?: string
  }
  setErroresValidacionCotizacion: (errores: any) => void
  formatearFechaLarga: (isoString: string) => string
  calcularFechaVencimiento: (fecha: Date, dias: number) => Date
  validarEmail: (email: string) => boolean
  validarWhatsApp: (whatsapp: string) => boolean
  validarFechas: (emisión: string, vencimiento: string) => boolean
}

export default function CotizacionTab({
  cotizacionConfig,
  setCotizacionConfig,
  cargandoCotizacion,
  erroresValidacionCotizacion,
  setErroresValidacionCotizacion,
  formatearFechaLarga,
  calcularFechaVencimiento,
  validarEmail,
  validarWhatsApp,
  validarFechas,
}: CotizacionTabProps) {
  // Memoized validation errors for performance
  const hasErrors = useMemo(() => Object.values(erroresValidacionCotizacion).some(e => e), [erroresValidacionCotizacion])

  if (cargandoCotizacion) {
    return (
      <div className="p-6 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <FaSpinner className="text-gh-success text-3xl animate-spin" />
          </div>
          <p className="text-gh-text-muted">Cargando cotización...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        {/* Grid 2 Columnas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* COLUMNA 1: Información de Cotización */}
          <div className="space-y-4 bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary border border-gh-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
              <FaFileAlt className="text-blue-400" /> Información de Cotización
            </h4>

            {/* Título Secundario (Hero) */}
            <div className="border-t border-gh-border/30 pt-4">
              <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Nombre de la cotización</label>
              <input
                type="text"
                value={cotizacionConfig?.heroTituloSub || ''}
                onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, heroTituloSub: e.target.value } : null)}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all"
                placeholder="Ej: PÁGINA CATÁLOGO DINÁMICA"
              />
              <p className="text-gh-text-muted text-xs mt-2">Se muestra en la página principal</p>
            </div>

            {/* GRUPO 1: Identificación */}
            <div className="pt-4 border-t border-gh-border/30">
              <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-widest">
                <FaTag className="text-yellow-400" /> Identificación
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {/* Número (readonly) */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Número</label>
                  <input
                    type="text"
                    value={cotizacionConfig?.numero || ''}
                    disabled
                    className="w-full px-3 py-2 bg-gh-bg-secondary text-gh-text-muted border border-gh-border/30 rounded-lg focus:outline-none text-xs cursor-not-allowed opacity-60"
                    placeholder="Auto-generado"
                  />
                  <p className="text-gh-text-muted text-xs mt-2">Se genera automáticamente</p>
                </div>

                {/* Firma de Autorización */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Firma</label>
                  <input
                    type="text"
                    placeholder="Nombre y firma"
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all"
                  />
                </div>
              </div>
            </div>

            {/* GRUPO 2: Fechas */}
            <div className="pt-4 border-t border-gh-border/30">
              <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-widest">
                <FaCalendar className="text-green-400" /> Fechas
              </h5>
              <div className="grid md:grid-cols-3 gap-3">
                {/* Fecha Emisión */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Fecha Emisión</label>
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
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none text-sm text-gh-text transition-all"
                  />
                </div>

                {/* Tiempo Validez */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Validez (días)</label>
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
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none text-sm text-gh-text transition-all"
                  />
                </div>

                {/* Fecha Vencimiento (readonly) */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Vencimiento</label>
                  <input
                    type="text"
                    value={cotizacionConfig?.fechaVencimiento ? formatearFechaLarga(cotizacionConfig.fechaVencimiento) : ''}
                    disabled
                    className="w-full px-3 py-2 bg-gh-bg-secondary text-gh-text-muted border border-gh-border/30 rounded-lg focus:outline-none text-xs cursor-not-allowed opacity-60"
                  />
                  {erroresValidacionCotizacion.fechas && (
                    <p className="text-red-500/80 text-xs mt-2 flex items-center gap-1">
                      ⚠ {erroresValidacionCotizacion.fechas}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* GRUPO 3: Presupuesto */}
            <div className="pt-4 border-t border-gh-border/30">
              <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-widest">
                <FaDollarSign className="text-emerald-400" /> Presupuesto
              </h5>
              <div className="grid md:grid-cols-2 gap-3">
                {/* Presupuesto */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Monto</label>
                  <input
                    type="text"
                    value={cotizacionConfig?.presupuesto || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, presupuesto: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all"
                    placeholder="Ej: Menos de $300 USD"
                  />
                </div>

                {/* Moneda */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Moneda</label>
                  <select
                    value={cotizacionConfig?.moneda || 'USD'}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, moneda: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none text-sm text-gh-text transition-all"
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
            <div className="pt-4 border-t border-gh-border/30">
              <h5 className="text-xs font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-widest">
                <FaCalculator className="text-cyan-400" /> Vigencia del Contrato
              </h5>
              <div className="grid md:grid-cols-3 gap-3">
                {/* Valor */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Valor</label>
                  <input
                    type="number"
                    value={cotizacionConfig?.tiempoVigenciaValor || 12}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaValor: parseInt(e.target.value) || 12 } : null)}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none text-sm text-gh-text transition-all"
                    min="1"
                    max="365"
                  />
                </div>

                {/* Unidad */}
                <div className="md:col-span-2">
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Unidad de Tiempo</label>
                  <select
                    value={cotizacionConfig?.tiempoVigenciaUnidad || 'meses'}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaUnidad: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none text-sm text-gh-text transition-all"
                  >
                    <option value="días">Días</option>
                    <option value="meses">Meses</option>
                    <option value="años">Años</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: Información Cliente y Proveedor */}
          <div className="space-y-6">
            {/* Contenedor Cliente */}
            <div className="space-y-4 bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary border border-gh-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
                <FaMapMarkerAlt className="text-purple-400" /> Información del Cliente
              </h4>
              <div className="border-t border-gh-border/30 pt-4"></div>
              
              {/* Fila 1: Empresa, Sector */}
              <div className="grid md:grid-cols-2 gap-3">
                {/* Empresa */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">
                    Empresa {!cotizacionConfig?.empresa && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={cotizacionConfig?.empresa || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresa: e.target.value } : null)}
                    className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-lg focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all ${
                      erroresValidacionCotizacion.empresa ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gh-border focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                    }`}
                  />
                  {erroresValidacionCotizacion.empresa && (
                    <p className="text-red-500/80 text-xs mt-2">⚠ {erroresValidacionCotizacion.empresa}</p>
                  )}
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Sector</label>
                  <input
                    type="text"
                    value={cotizacionConfig?.sector || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, sector: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all"
                  />
                </div>
              </div>

              {/* Fila 2: Email, WhatsApp */}
              <div className="grid md:grid-cols-2 gap-3">
                {/* Email Cliente */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={cotizacionConfig?.emailCliente || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailCliente: e.target.value } : null)}
                    className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-lg focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all ${
                      erroresValidacionCotizacion.emailCliente ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gh-border focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                    }`}
                  />
                  {erroresValidacionCotizacion.emailCliente && (
                    <p className="text-red-500/80 text-xs mt-2">⚠ {erroresValidacionCotizacion.emailCliente}</p>
                  )}
                </div>

                {/* WhatsApp Cliente */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">WhatsApp</label>
                  <input
                    type="tel"
                    value={cotizacionConfig?.whatsappCliente || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappCliente: e.target.value } : null)}
                    className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-lg focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all ${
                      erroresValidacionCotizacion.whatsappCliente ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gh-border focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                    }`}
                    placeholder="+535 856 9291"
                  />
                  {erroresValidacionCotizacion.whatsappCliente && (
                    <p className="text-red-500/80 text-xs mt-2">⚠ {erroresValidacionCotizacion.whatsappCliente}</p>
                  )}
                </div>
              </div>

              {/* Ubicación Cliente (full-width) */}
              <div>
                <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Ubicación</label>
                <textarea
                  value={cotizacionConfig?.ubicacion || ''}
                  onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacion: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted resize-none transition-all"
                />
              </div>
            </div>

            {/* Contenedor Proveedor */}
            <div className="space-y-4 bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary border border-gh-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
                <FaEnvelope className="text-orange-400" /> Información del Proveedor
              </h4>
              <div className="border-t border-gh-border/30 pt-4"></div>

              {/* Fila 1: Profesional, Empresa */}
              <div className="grid md:grid-cols-2 gap-3">
                {/* Profesional */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">
                    Profesional {!cotizacionConfig?.profesional && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={cotizacionConfig?.profesional || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, profesional: e.target.value } : null)}
                    className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-lg focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all ${
                      erroresValidacionCotizacion.profesional ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gh-border focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20'
                    }`}
                  />
                  {erroresValidacionCotizacion.profesional && (
                    <p className="text-red-500/80 text-xs mt-2">⚠ {erroresValidacionCotizacion.profesional}</p>
                  )}
                </div>

                {/* Empresa Proveedor */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Empresa Proveedor</label>
                  <input
                    type="text"
                    value={cotizacionConfig?.empresaProveedor || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresaProveedor: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all"
                  />
                </div>
              </div>

              {/* Fila 2: Email, WhatsApp */}
              <div className="grid md:grid-cols-2 gap-3">
                {/* Email Proveedor */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={cotizacionConfig?.emailProveedor || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailProveedor: e.target.value } : null)}
                    className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-lg focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all ${
                      erroresValidacionCotizacion.emailProveedor ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gh-border focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20'
                    }`}
                  />
                  {erroresValidacionCotizacion.emailProveedor && (
                    <p className="text-red-500/80 text-xs mt-2">⚠ {erroresValidacionCotizacion.emailProveedor}</p>
                  )}
                </div>

                {/* WhatsApp Proveedor */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">WhatsApp</label>
                  <input
                    type="tel"
                    value={cotizacionConfig?.whatsappProveedor || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappProveedor: e.target.value } : null)}
                    className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-lg focus:outline-none text-sm text-gh-text placeholder-gh-text-muted transition-all ${
                      erroresValidacionCotizacion.whatsappProveedor ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gh-border focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20'
                    }`}
                    placeholder="+535 856 9291"
                  />
                  {erroresValidacionCotizacion.whatsappProveedor && (
                    <p className="text-red-500/80 text-xs mt-2">⚠ {erroresValidacionCotizacion.whatsappProveedor}</p>
                  )}
                </div>
              </div>

              {/* Ubicación Proveedor */}
              <div>
                <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-widest">Ubicación</label>
                <textarea
                  value={cotizacionConfig?.ubicacionProveedor || ''}
                  onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacionProveedor: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted resize-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
