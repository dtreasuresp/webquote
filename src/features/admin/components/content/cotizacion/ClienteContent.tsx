'use client'

import React from 'react'
import { Building2, Check, AlertTriangle, Mail, Phone, MapPin } from 'lucide-react'
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gh-text flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gh-accent" />
            Información del Cliente
          </h3>
          <p className="text-xs text-gh-text-muted mt-0.5">
            Datos de la empresa y contacto del cliente
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 border ${
          estaConfigurado 
            ? 'bg-gh-success/10 text-gh-success border-gh-success/30' 
            : 'bg-gh-warning/10 text-gh-warning border-gh-warning/30'
        }`}>
          {estaConfigurado ? (
            <><Check className="w-3 h-3" /> Configurado</>
          ) : (
            <><AlertTriangle className="w-3 h-3" /> Incompleto</>
          )}
        </span>
      </div>

      {/* Empresa y Sector */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Empresa</h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">
                Nombre de la Empresa {!cotizacionConfig?.empresa && <span className="text-gh-danger">*</span>}
              </label>
              <input
                type="text"
                value={cotizacionConfig?.empresa || ''}
                onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresa: e.target.value } : null)}
                className={`w-full px-3 py-2 bg-gh-bg-tertiary/50 border rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:outline-none transition-colors ${
                  erroresValidacionCotizacion.empresa 
                    ? 'border-gh-danger/50 focus:border-gh-danger focus:ring-1 focus:ring-gh-danger/30' 
                    : 'border-gh-border/30 focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30'
                }`}
                placeholder="Nombre de la empresa"
              />
              {erroresValidacionCotizacion.empresa && (
                <p className="text-[11px] text-gh-danger mt-1">{erroresValidacionCotizacion.empresa}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Sector</label>
              <input
                type="text"
                value={cotizacionConfig?.sector || ''}
                onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, sector: e.target.value } : null)}
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors"
                placeholder="Ej: Tecnología, Restaurantes..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Contacto</h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Email</label>
              <input
                type="email"
                value={cotizacionConfig?.emailCliente || ''}
                onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailCliente: e.target.value } : null)}
                className={`w-full px-3 py-2 bg-gh-bg-tertiary/50 border rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:outline-none transition-colors ${
                  erroresValidacionCotizacion.emailCliente 
                    ? 'border-gh-danger/50 focus:border-gh-danger focus:ring-1 focus:ring-gh-danger/30' 
                    : 'border-gh-border/30 focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30'
                }`}
                placeholder="cliente@empresa.com"
              />
              {erroresValidacionCotizacion.emailCliente && (
                <p className="text-[11px] text-gh-danger mt-1">{erroresValidacionCotizacion.emailCliente}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">WhatsApp</label>
              <input
                type="tel"
                value={cotizacionConfig?.whatsappCliente || ''}
                onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappCliente: e.target.value } : null)}
                className={`w-full px-3 py-2 bg-gh-bg-tertiary/50 border rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:outline-none transition-colors ${
                  erroresValidacionCotizacion.whatsappCliente 
                    ? 'border-gh-danger/50 focus:border-gh-danger focus:ring-1 focus:ring-gh-danger/30' 
                    : 'border-gh-border/30 focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30'
                }`}
                placeholder="+535 856 9291"
              />
              {erroresValidacionCotizacion.whatsappCliente && (
                <p className="text-[11px] text-gh-danger mt-1">{erroresValidacionCotizacion.whatsappCliente}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Ubicación</h5>
        </div>
        <div className="p-4">
          <textarea
            value={cotizacionConfig?.ubicacion || ''}
            onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacion: e.target.value } : null)}
            rows={3}
            className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors resize-none"
            placeholder="Dirección completa del cliente"
          />
        </div>
      </div>

      {/* Footer Resumen */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg p-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs">
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
      </div>
    </div>
  )
}


