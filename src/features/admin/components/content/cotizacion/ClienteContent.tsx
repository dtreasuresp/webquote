'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { QuotationConfig } from '@/lib/types'

interface ClienteContentProps {
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  erroresValidacionCotizacion: {
    emailCliente?: string
    whatsappCliente?: string
    empresa?: string
  }
}

export default function ClienteContent({
  cotizacionConfig,
  setCotizacionConfig,
  erroresValidacionCotizacion,
}: Readonly<ClienteContentProps>) {
  const estaConfigurado = cotizacionConfig?.empresa && cotizacionConfig.empresa.trim() !== ''

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
          <FaMapMarkerAlt className="text-gh-info" /> Información del Cliente
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

      {/* Footer Resumen */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span className="text-gh-text-muted">
          Empresa: <span className="text-gh-text font-medium">{cotizacionConfig?.empresa || '—'}</span>
        </span>
        <span className="text-gh-text-muted">
          Sector: <span className="text-gh-text font-medium">{cotizacionConfig?.sector || '—'}</span>
        </span>
        <span className="text-gh-text-muted">
          Email: <span className="text-gh-text font-medium">{cotizacionConfig?.emailCliente || '—'}</span>
        </span>
      </div>
    </motion.div>
  )
}
