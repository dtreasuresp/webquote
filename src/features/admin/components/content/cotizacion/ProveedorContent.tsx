'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { QuotationConfig } from '@/lib/types'

interface ProveedorContentProps {
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  erroresValidacionCotizacion: {
    emailProveedor?: string
    whatsappProveedor?: string
    profesional?: string
  }
}

export default function ProveedorContent({
  cotizacionConfig,
  setCotizacionConfig,
  erroresValidacionCotizacion,
}: Readonly<ProveedorContentProps>) {
  const estaConfigurado = cotizacionConfig?.profesional && cotizacionConfig.profesional.trim() !== ''

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
          <FaEnvelope className="text-gh-warning" /> Información del Proveedor
        </h4>
        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
          estaConfigurado 
            ? 'bg-gh-success/10 text-gh-success' 
            : 'bg-gh-warning/10 text-gh-warning'
        }`}>
          {estaConfigurado ? (
            <><FaCheck size={10} /> Configurado</>
          ) : (
            <><FaExclamationTriangle size={10} /> Incompleto</>
          )}
        </span>
      </div>

      {/* Formulario */}
      <div className="space-y-4 p-6 bg-gh-bg-overlay border border-gh-border rounded-lg">

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

      {/* Footer Resumen */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span className="text-gh-text-muted">
          Profesional: <span className="text-gh-text font-medium">{cotizacionConfig?.profesional || '—'}</span>
        </span>
        <span className="text-gh-text-muted">
          Empresa: <span className="text-gh-text font-medium">{cotizacionConfig?.empresaProveedor || '—'}</span>
        </span>
        <span className="text-gh-text-muted">
          Email: <span className="text-gh-text font-medium">{cotizacionConfig?.emailProveedor || '—'}</span>
        </span>
      </div>
    </motion.div>
  )
}
