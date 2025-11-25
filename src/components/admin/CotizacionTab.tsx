'use client'

import React from 'react'
import { FaFileAlt, FaTag, FaCalendar, FaDollarSign, FaCalculator, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'
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
  return (
    <div className="p-6 space-y-6">
      {cargandoCotizacion ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4">
              <FaCalculator className="text-gh-success text-3xl" />
            </div>
            <p className="text-gh-text-muted">Cargando cotización...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid 2 Columnas */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* COLUMNA 1: Información de Cotización */}
            <div className="space-y-4 bg-gh-bg-overlay border border-gh-border p-6 rounded-lg">
              <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
                <FaFileAlt className="text-gh-info" /> Información de Cotización
              </h4>

              {/* Título Secundario (Hero) */}
              <div className="border-t border-gh-border pt-4">
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

            {/* COLUMNA 2: Información Cliente y Proveedor */}
            <div className="space-y-6">
              {/* Contenedor Cliente */}
              <div className="space-y-4 bg-gh-bg-overlay border border-gh-border rounded-lg p-6">
                <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
                  <FaMapMarkerAlt className="text-gh-info" /> Información del Cliente
                </h4>
                <div className="border-t border-gh-border pt-4"></div>
                
                {/* Fila 1: Empresa, Sector */}
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Empresa */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">
                      Empresa {!cotizacionConfig?.empresa && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={cotizacionConfig?.empresa || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresa: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-md focus:outline-none text-sm text-gh-text placeholder-gh-text-muted ${
                        erroresValidacionCotizacion.empresa ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-gh-border focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
                      }`}
                    />
                    {erroresValidacionCotizacion.empresa && (
                      <p className="text-red-500 text-xs mt-2">{erroresValidacionCotizacion.empresa}</p>
                    )}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Sector</label>
                    <input
                      type="text"
                      value={cotizacionConfig?.sector || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, sector: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted"
                    />
                  </div>
                </div>

                {/* Fila 2: Email, WhatsApp */}
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Email Cliente */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={cotizacionConfig?.emailCliente || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailCliente: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-md focus:outline-none text-sm text-gh-text placeholder-gh-text-muted ${
                        erroresValidacionCotizacion.emailCliente ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-gh-border focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
                      }`}
                    />
                    {erroresValidacionCotizacion.emailCliente && (
                      <p className="text-red-500 text-xs mt-2">{erroresValidacionCotizacion.emailCliente}</p>
                    )}
                  </div>

                  {/* WhatsApp Cliente */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">WhatsApp</label>
                    <input
                      type="tel"
                      value={cotizacionConfig?.whatsappCliente || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappCliente: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-md focus:outline-none text-sm text-gh-text placeholder-gh-text-muted ${
                        erroresValidacionCotizacion.whatsappCliente ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-gh-border focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
                      }`}
                      placeholder="+535 856 9291"
                    />
                    {erroresValidacionCotizacion.whatsappCliente && (
                      <p className="text-red-500 text-xs mt-2">{erroresValidacionCotizacion.whatsappCliente}</p>
                    )}
                  </div>
                </div>

                {/* Ubicación Cliente (full-width) */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Ubicación</label>
                  <textarea
                    value={cotizacionConfig?.ubicacion || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacion: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted resize-none"
                  />
                </div>
              </div>

              {/* Contenedor Proveedor */}
              <div className="space-y-4 bg-gh-bg-overlay border border-gh-border rounded-lg p-6">
                <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
                  <FaEnvelope className="text-gh-warning" /> Información del Proveedor
                </h4>
                <div className="border-t border-gh-border pt-4"></div>

                {/* Fila 1: Profesional, Empresa */}
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Profesional */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">
                      Profesional {!cotizacionConfig?.profesional && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={cotizacionConfig?.profesional || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, profesional: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-md focus:outline-none text-sm text-gh-text placeholder-gh-text-muted ${
                        erroresValidacionCotizacion.profesional ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-gh-border focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
                      }`}
                    />
                    {erroresValidacionCotizacion.profesional && (
                      <p className="text-red-500 text-xs mt-2">{erroresValidacionCotizacion.profesional}</p>
                    )}
                  </div>

                  {/* Empresa Proveedor */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Empresa Proveedor</label>
                    <input
                      type="text"
                      value={cotizacionConfig?.empresaProveedor || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresaProveedor: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted"
                    />
                  </div>
                </div>

                {/* Fila 2: Email, WhatsApp */}
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Email Proveedor */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={cotizacionConfig?.emailProveedor || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailProveedor: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-md focus:outline-none text-sm text-gh-text placeholder-gh-text-muted ${
                        erroresValidacionCotizacion.emailProveedor ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-gh-border focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
                      }`}
                    />
                    {erroresValidacionCotizacion.emailProveedor && (
                      <p className="text-red-500 text-xs mt-2">{erroresValidacionCotizacion.emailProveedor}</p>
                    )}
                  </div>

                  {/* WhatsApp Proveedor */}
                  <div>
                    <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">WhatsApp</label>
                    <input
                      type="tel"
                      value={cotizacionConfig?.whatsappProveedor || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappProveedor: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-gh-bg-secondary border rounded-md focus:outline-none text-sm text-gh-text placeholder-gh-text-muted ${
                        erroresValidacionCotizacion.whatsappProveedor ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-gh-border focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
                      }`}
                      placeholder="+535 856 9291"
                    />
                    {erroresValidacionCotizacion.whatsappProveedor && (
                      <p className="text-red-500 text-xs mt-2">{erroresValidacionCotizacion.whatsappProveedor}</p>
                    )}
                  </div>
                </div>

                {/* Ubicación Proveedor */}
                <div>
                  <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">Ubicación</label>
                  <textarea
                    value={cotizacionConfig?.ubicacionProveedor || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacionProveedor: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
