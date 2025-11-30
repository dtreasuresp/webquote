'use client'

import React, { useState } from 'react'
import { FaFileAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'
import { QuotationConfig } from '@/lib/types'
import AdminSidebar from '@/features/admin/components/AdminSidebar'
import CotizacionInfoContent from '@/features/admin/components/content/cotizacion/CotizacionInfoContent'
import ClienteContent from '@/features/admin/components/content/cotizacion/ClienteContent'
import ProveedorContent from '@/features/admin/components/content/cotizacion/ProveedorContent'

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
  formatearFechaLarga,
  calcularFechaVencimiento,
}: Readonly<CotizacionTabProps>) {
  const [activeItem, setActiveItem] = useState<'cotizacion' | 'cliente' | 'proveedor'>('cotizacion')

  const items = [
    { id: 'cotizacion', label: 'Cotización', icon: FaFileAlt },
    { id: 'cliente', label: 'Cliente', icon: FaMapMarkerAlt },
    { id: 'proveedor', label: 'Proveedor', icon: FaEnvelope },
  ] as const

  return (
    <div className="pl-2 pr-6 py-6 flex gap-6">
      {cargandoCotizacion ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto">
            {/* Símbolos de Código Animados */}
            <div className="relative h-24 mb-6 flex items-center justify-center gap-4">
              <span className="text-5xl font-mono font-bold text-gh-success animate-code-symbol-1">
                {"{ }"}
              </span>
              <span className="text-5xl font-mono font-bold text-gh-success animate-code-symbol-2">
                {"< >"}
              </span>
              <span className="text-5xl font-mono font-bold text-gh-success animate-code-symbol-3">
                {"[ ]"}
              </span>
            </div>
            
            {/* Texto Principal */}
            <p className="text-gh-text text-base font-medium mb-2">Cargando cotización...</p>
            
            {/* Barra de Progreso */}
            <div className="relative w-full h-1.5 bg-gh-bg-secondary rounded-full overflow-hidden mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gh-success to-transparent animate-shimmer" 
                   style={{ width: '50%', backgroundSize: '200% 100%' }}></div>
              <div className="absolute top-0 left-0 h-full w-full bg-gh-success/30 animate-progress"></div>
            </div>
            
            {/* Subtexto */}
            <p className="text-gh-text-muted text-sm animate-pulse">Preparando datos...</p>
          </div>
        </div>
      ) : (
        <>
          <AdminSidebar
            items={items.map(i => ({ id: i.id, label: i.label, icon: i.icon }))}
            activeItem={activeItem}
            onItemClick={(id) => setActiveItem(id as typeof activeItem)}
          />

          <div className="flex-1">
            {activeItem === 'cotizacion' && (
              <CotizacionInfoContent
                cotizacionConfig={cotizacionConfig}
                setCotizacionConfig={setCotizacionConfig}
                erroresValidacionCotizacion={erroresValidacionCotizacion}
                formatearFechaLarga={formatearFechaLarga}
                calcularFechaVencimiento={calcularFechaVencimiento}
              />
            )}

            {activeItem === 'cliente' && (
              <ClienteContent
                cotizacionConfig={cotizacionConfig}
                setCotizacionConfig={setCotizacionConfig}
                erroresValidacionCotizacion={erroresValidacionCotizacion}
              />
            )}

            {activeItem === 'proveedor' && (
              <ProveedorContent
                cotizacionConfig={cotizacionConfig}
                setCotizacionConfig={setCotizacionConfig}
                erroresValidacionCotizacion={erroresValidacionCotizacion}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
