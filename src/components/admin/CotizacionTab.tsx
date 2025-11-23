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
    <div className="p-6 space-y-4">
      {cargandoCotizacion ? (
        <div className="text-center py-6 text-[#888888]">Cargando cotización...</div>
      ) : (
        <div className="space-y-4">
          {/* Grid 2 Columnas */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* COLUMNA 1: Información de Cotización */}
            <div className="space-y-3 bg-[#111] p-3 rounded-lg border border-[#333]">
              <h4 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                <FaFileAlt /> Información de Cotización
              </h4>

              {/* Título Secundario (Hero) */}
              <div className="border-t border-[#333]"></div>
              <div>
                <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Nombre de la cotización</label>
                <input
                  type="text"
                  value={cotizacionConfig?.heroTituloSub || ''}
                  onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, heroTituloSub: e.target.value } : null)}
                  className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                  placeholder="Ej: PÁGINA CATÁLOGO DINÁMICA"
                />
                <p className="text-[#888888] text-xs mt-1">Se muestra en la página principal</p>
              </div>

              {/* GRUPO 1: Identificación */}
              <div className="pt-2 border-t border-[#333]">
                <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                  <FaTag /> Identificación
                </h5>
                <div className="grid md:grid-cols-2 gap-2">
                  {/* Número (readonly) */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Número *</label>
                    <input
                      type="text"
                      value={cotizacionConfig?.numero || ''}
                      disabled
                      className="w-full px-3 py-2 bg-[#0a0a0f] text-[#999] border border-[#333] rounded focus:outline-none text-xs cursor-not-allowed"
                      placeholder="Auto-generado"
                    />
                    <p className="text-[#888888] text-xs mt-1">Se genera automáticamente</p>
                  </div>

                  {/* Firma de Autorización */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Firma *</label>
                    <input
                      type="text"
                      placeholder="Nombre y firma"
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                </div>
              </div>

              {/* GRUPO 2: Fechas */}
              <div className="pt-2 border-t border-[#333]">
                <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                  <FaCalendar /> Fechas
                </h5>
                <div className="grid md:grid-cols-3 gap-2">
                  {/* Fecha Emisión */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Fecha Emisión *</label>
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
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>

                  {/* Tiempo Validez */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Validez (días) *</label>
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
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>

                  {/* Fecha Vencimiento (readonly) */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Fecha Vencimiento *</label>
                    <input
                      type="text"
                      value={cotizacionConfig?.fechaVencimiento ? formatearFechaLarga(cotizacionConfig.fechaVencimiento) : ''}
                      disabled
                      className="w-full px-3 py-2 bg-[#0a0a0f] text-[#999] border border-[#333] rounded focus:outline-none text-xs cursor-not-allowed"
                    />
                    {erroresValidacionCotizacion.fechas && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.fechas}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* GRUPO 3: Presupuesto */}
              <div className="pt-2 border-t border-[#333]">
                <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                  <FaDollarSign /> Presupuesto
                </h5>
                <div className="grid md:grid-cols-2 gap-2">
                  {/* Presupuesto */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Monto *</label>
                    <input
                      type="text"
                      value={cotizacionConfig?.presupuesto || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, presupuesto: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                      placeholder="Ej: Menos de $300 USD"
                    />
                  </div>

                  {/* Moneda */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Moneda *</label>
                    <select
                      value={cotizacionConfig?.moneda || 'USD'}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, moneda: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
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
              <div className="pt-2 border-t border-[#333]">
                <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                  <FaCalculator /> Vigencia del Contrato
                </h5>
                <div className="grid md:grid-cols-3 gap-2">
                  {/* Valor */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Valor</label>
                    <input
                      type="number"
                      value={cotizacionConfig?.tiempoVigenciaValor || 12}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaValor: parseInt(e.target.value) || 12 } : null)}
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                      min="1"
                      max="365"
                    />
                  </div>

                  {/* Unidad */}
                  <div className="md:col-span-2">
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Unidad de Tiempo</label>
                    <select
                      value={cotizacionConfig?.tiempoVigenciaUnidad || 'meses'}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaUnidad: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
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
            <div className="space-y-2">
              {/* Contenedor Cliente */}
              <div className="space-y-2 bg-[#111] p-3 rounded-lg border border-[#333]">
                <h4 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                  <FaMapMarkerAlt /> Información del Cliente
                </h4>
                <div className="border-t border-[#333]"></div>
                {/* Fila 1: Empresa, Sector */}
                <div className="grid md:grid-cols-2 gap-2">
                  {/* Empresa */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">
                      Empresa {!cotizacionConfig?.empresa && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={cotizacionConfig?.empresa || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresa: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                        erroresValidacionCotizacion.empresa ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                      }`}
                    />
                    {erroresValidacionCotizacion.empresa && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.empresa}</p>
                    )}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Sector</label>
                    <input
                      type="text"
                      value={cotizacionConfig?.sector || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, sector: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                </div>

                {/* Fila 2: Email, WhatsApp */}
                <div className="grid md:grid-cols-2 gap-2">
                  {/* Email Cliente */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Email</label>
                    <input
                      type="email"
                      value={cotizacionConfig?.emailCliente || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailCliente: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                        erroresValidacionCotizacion.emailCliente ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                      }`}
                    />
                    {erroresValidacionCotizacion.emailCliente && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.emailCliente}</p>
                    )}
                  </div>

                  {/* WhatsApp Cliente */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={cotizacionConfig?.whatsappCliente || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappCliente: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                        erroresValidacionCotizacion.whatsappCliente ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                      }`}
                      placeholder="+535 856 9291"
                    />
                    {erroresValidacionCotizacion.whatsappCliente && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.whatsappCliente}</p>
                    )}
                  </div>
                </div>

                {/* Ubicación Cliente (full-width) */}
                <div>
                  <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Ubicación</label>
                  <textarea
                    value={cotizacionConfig?.ubicacion || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacion: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed] resize-none"
                  />
                </div>
              </div>

              {/* Contenedor Proveedor */}
              <div className="space-y-2 bg-[#111] p-3 rounded-lg border border-[#333]">
                <h4 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                  <FaEnvelope /> Información del Proveedor
                </h4>
                <div className="border-t border-[#333]"></div>

                {/* Fila 1: Profesional, Empresa */}
                <div className="grid md:grid-cols-2 gap-2">
                  {/* Profesional */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">
                      Profesional {!cotizacionConfig?.profesional && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={cotizacionConfig?.profesional || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, profesional: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                        erroresValidacionCotizacion.profesional ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                      }`}
                    />
                    {erroresValidacionCotizacion.profesional && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.profesional}</p>
                    )}
                  </div>

                  {/* Empresa Proveedor */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Empresa Proveedor</label>
                    <input
                      type="text"
                      value={cotizacionConfig?.empresaProveedor || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresaProveedor: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                </div>

                {/* Fila 2: Email, WhatsApp */}
                <div className="grid md:grid-cols-2 gap-2">
                  {/* Email Proveedor */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Email</label>
                    <input
                      type="email"
                      value={cotizacionConfig?.emailProveedor || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailProveedor: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                        erroresValidacionCotizacion.emailProveedor ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                      }`}
                    />
                    {erroresValidacionCotizacion.emailProveedor && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.emailProveedor}</p>
                    )}
                  </div>

                  {/* WhatsApp Proveedor */}
                  <div>
                    <label className="block text-[#ededed] font-semibold text-[10px] mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={cotizacionConfig?.whatsappProveedor || ''}
                      onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappProveedor: e.target.value } : null)}
                      className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                        erroresValidacionCotizacion.whatsappProveedor ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                      }`}
                      placeholder="+535 856 9291"
                    />
                    {erroresValidacionCotizacion.whatsappProveedor && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.whatsappProveedor}</p>
                    )}
                  </div>
                </div>

                {/* Ubicación Proveedor */}
                <div>
                  <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Ubicación</label>
                  <textarea
                    value={cotizacionConfig?.ubicacionProveedor || ''}
                    onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacionProveedor: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed] resize-none"
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
