'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt, FaDollarSign } from 'react-icons/fa'
import type { QuotationConfig } from '@/lib/types'

// Formatear fecha ISO a "largo" (ej: "20 de noviembre de 2025")
const formatearFechaLarga = (isoString: string): string => {
  const fecha = new Date(isoString)
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
}

interface HeroProps {
  readonly cotizacion?: QuotationConfig | null
}

export default function Hero({ cotizacion }: HeroProps) {

  return (
    <section className="relative bg-light-bg border-b border-light-border font-github">
      {/* Header con patrón de puntos sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #1f2328 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />
      
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Badge de versión */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-light-info-bg text-light-accent text-sm font-medium rounded-full border border-light-accent/20">
              <FaFileAlt size={12} />
              Versión {cotizacion?.versionNumber?.toString() || '1'} • 2025
            </span>
          </div>

          {/* Título principal */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-light-text mb-4 tracking-tight">
              {cotizacion?.heroTituloMain || 'Propuesta de Cotización'}
            </h1>
            <h2 className="text-xl md:text-2xl text-light-text-secondary font-normal mb-3">
              {cotizacion?.heroTituloSub || 'Página Catálogo Dinámica'}
            </h2>
            <p className="text-lg text-light-accent font-medium">
              {cotizacion?.empresa || 'Urbanísima CONSTRUCTORA S.R.L'}
            </p>
          </div>

          {/* Grid de información */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* Card: Información de Cotización */}
            <div className="bg-light-bg rounded-lg border border-light-border overflow-hidden">
              <div className="bg-light-bg-secondary px-5 py-3 border-b border-light-border">
                <h3 className="text-sm font-semibold text-light-text flex items-center gap-2">
                  <FaFileAlt className="text-light-text-secondary" size={14} />
                  Información de Cotización
                </h3>
              </div>
              <div className="p-5 space-y-0">
                <InfoRow label="Cotización" value={cotizacion?.numero || '#004-2025'} />
                <InfoRow label="Versión" value={cotizacion?.versionNumber?.toString() || '1'} />
                <InfoRow 
                  label="Fecha de emisión" 
                  value={cotizacion?.fechaEmision ? formatearFechaLarga(cotizacion.fechaEmision) : '13 de noviembre de 2025'} 
                  icon={<FaCalendarAlt size={12} className="text-light-text-muted" />}
                />
                <InfoRow 
                  label="Fecha de vencimiento" 
                  value={cotizacion?.fechaVencimiento ? formatearFechaLarga(cotizacion.fechaVencimiento) : '13 de diciembre de 2025'} 
                  icon={<FaCalendarAlt size={12} className="text-light-text-muted" />}
                />
                <InfoRow label="Tiempo de validez" value={`${cotizacion?.tiempoValidez || 30} días`} />
                <InfoRow 
                  label="Presupuesto" 
                  value={cotizacion?.presupuesto || 'Menos de $300 USD'} 
                  icon={<FaDollarSign size={12} className="text-light-success" />}
                  highlight
                />
                <InfoRow label="Moneda" value={cotizacion?.moneda || 'USD'} isLast />
              </div>
            </div>

            {/* Card: Cliente y Proveedor */}
            <div className="bg-light-bg rounded-lg border border-light-border overflow-hidden">
              <div className="bg-light-bg-secondary px-5 py-3 border-b border-light-border">
                <h3 className="text-sm font-semibold text-light-text">Partes Involucradas</h3>
              </div>
              <div className="p-5 space-y-6">
                {/* Para (Cliente) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-light-text-secondary uppercase tracking-wide">Para</span>
                    <div className="flex-1 h-px bg-light-border" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-light-text font-medium">{cotizacion?.empresa || 'Urbanísima Constructora S.R.L'}</p>
                    <p className="text-light-text-secondary">{cotizacion?.sector || 'Construcción y montaje'}</p>
                    <p className="text-light-text-muted text-xs flex items-start gap-2">
                      <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" size={12} />
                      {cotizacion?.ubicacion || 'Calle 12/2da y 3ra, No 36, Ampliación de Marbella, Habana del Este, La Habana, CUBA'}
                    </p>
                  </div>
                </div>

                {/* De (Proveedor) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-light-text-secondary uppercase tracking-wide">De</span>
                    <div className="flex-1 h-px bg-light-border" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-light-text font-medium">{cotizacion?.profesional || 'Daniel Treasure Espinosa'}</p>
                    <p className="text-light-accent font-medium">{cotizacion?.empresaProveedor || 'DGTECNOVA'}</p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a 
                        href={`mailto:${cotizacion?.emailProveedor || 'dgtecnova@gmail.com'}`} 
                        className="inline-flex items-center gap-1.5 text-xs text-light-text-secondary hover:text-light-accent transition-colors"
                      >
                        <FaEnvelope size={12} />
                        {cotizacion?.emailProveedor || 'dgtecnova@gmail.com'}
                      </a>
                      <a 
                        href={`https://wa.me/${(cotizacion?.whatsappProveedor || '+5358569291').replaceAll(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-xs text-light-text-secondary hover:text-light-success transition-colors"
                      >
                        <FaWhatsapp size={12} />
                        {cotizacion?.whatsappProveedor || '+535 856 9291'}
                      </a>
                    </div>
                    <p className="text-light-text-muted text-xs flex items-start gap-2 pt-1">
                      <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" size={12} />
                      {cotizacion?.ubicacionProveedor || 'Arroyo 203, e/ Lindero y Nueva del Pilar, Centro Habana, La Habana, CUBA'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function InfoRow({ 
  label, 
  value, 
  icon, 
  highlight, 
  isLast 
}: Readonly<{ 
  label: string
  value: string
  icon?: React.ReactNode
  highlight?: boolean
  isLast?: boolean 
}>) {
  return (
    <div className={`flex justify-between items-center py-2.5 ${!isLast ? 'border-b border-light-border' : ''}`}>
      <span className="text-sm text-light-text-secondary">{label}</span>
      <span className={`text-sm font-medium flex items-center gap-1.5 ${highlight ? 'text-light-success' : 'text-light-text'}`}>
        {icon}
        {value}
      </span>
    </div>
  )
}
