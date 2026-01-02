'use client'

import React from 'react'
import { Briefcase, Check, AlertTriangle, Mail, Phone, MapPin, User } from 'lucide-react'
import { QuotationConfig } from '@/lib/types'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'

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
  const { logAction } = useAdminAudit()
  const { canEdit } = useAdminPermissions()
  const estaConfigurado = cotizacionConfig?.profesional && cotizacionConfig.profesional.trim() !== ''

  const handleUpdate = (field: keyof QuotationConfig, value: any) => {
    if (!canEdit('QUOTES')) return
    setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, [field]: value } : null)
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Información del Proveedor"
        description="Datos de contacto del proveedor del servicio"
        icon={<Briefcase className="w-4 h-4" />}
        statusIndicator={estaConfigurado ? 'guardado' : 'sin-modificar'}
        variant="accent"
      />

      {/* Profesional y Empresa */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Profesional</h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">
                Nombre del Profesional {!cotizacionConfig?.profesional && <span className="text-gh-danger">*</span>}
              </label>
              <input
                type="text"
                value={cotizacionConfig?.profesional || ''}
                onChange={(e) => handleUpdate('profesional', e.target.value)}
                className={`w-full px-3 py-2 bg-gh-bg-tertiary/50 border rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:outline-none transition-colors ${
                  erroresValidacionCotizacion.profesional 
                    ? 'border-gh-danger/50 focus:border-gh-danger focus:ring-1 focus:ring-gh-danger/30' 
                    : 'border-gh-border/30 focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30'
                }`}
                placeholder="Nombre completo"
              />
              {erroresValidacionCotizacion.profesional && (
                <p className="text-[11px] text-gh-danger mt-1">{erroresValidacionCotizacion.profesional}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Empresa Proveedor</label>
              <input
                type="text"
                value={cotizacionConfig?.empresaProveedor || ''}
                onChange={(e) => handleUpdate('empresaProveedor', e.target.value)}
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors"
                placeholder="Ej: DGTecnova"
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
                value={cotizacionConfig?.emailProveedor || ''}
                onChange={(e) => handleUpdate('emailProveedor', e.target.value)}
                className={`w-full px-3 py-2 bg-gh-bg-tertiary/50 border rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:outline-none transition-colors ${
                  erroresValidacionCotizacion.emailProveedor 
                    ? 'border-gh-danger/50 focus:border-gh-danger focus:ring-1 focus:ring-gh-danger/30' 
                    : 'border-gh-border/30 focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30'
                }`}
                placeholder="proveedor@empresa.com"
              />
              {erroresValidacionCotizacion.emailProveedor && (
                <p className="text-[11px] text-gh-danger mt-1">{erroresValidacionCotizacion.emailProveedor}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">WhatsApp</label>
              <input
                type="tel"
                value={cotizacionConfig?.whatsappProveedor || ''}
                onChange={(e) => handleUpdate('whatsappProveedor', e.target.value)}
                className={`w-full px-3 py-2 bg-gh-bg-tertiary/50 border rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:outline-none transition-colors ${
                  erroresValidacionCotizacion.whatsappProveedor 
                    ? 'border-gh-danger/50 focus:border-gh-danger focus:ring-1 focus:ring-gh-danger/30' 
                    : 'border-gh-border/30 focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30'
                }`}
                placeholder="+535 856 9291"
              />
              {erroresValidacionCotizacion.whatsappProveedor && (
                <p className="text-[11px] text-gh-danger mt-1">{erroresValidacionCotizacion.whatsappProveedor}</p>
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
            value={cotizacionConfig?.ubicacionProveedor || ''}
            onChange={(e) => handleUpdate('ubicacionProveedor', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors resize-none"
            placeholder="Dirección completa del proveedor"
          />
        </div>
      </div>

      {/* Footer Resumen */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg p-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs">
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
      </div>
    </div>
  )
}


