'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt, FaDollarSign } from 'react-icons/fa'
import type { QuotationConfig } from '@/lib/types'
import { 
  FluentSection, 
  FluentGlass, 
  FluentReveal, 
  FluentRevealGroup, 
  FluentRevealItem,
  FluentHover,
  FluentTap
} from '@/components/motion'

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
    <FluentSection
      id="hero"
      animation="stagger"
      paddingY="lg"
      className="relative bg-gradient-to-b from-white via-light-bg to-light-bg-secondary border-b border-light-border/50"
    >
      {/* Patrón de fondo sutil estilo Microsoft */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #0078d4 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Badge de versión con FluentGlass */}
        <FluentReveal direction="down" delay={0.1}>
          <div className="flex justify-center mb-8">
            <FluentTap>
              <FluentGlass 
                preset="light" 
                rounded="full" 
                glowOnHover 
                className="inline-flex items-center gap-2 px-4 py-2 text-light-accent text-sm font-medium border border-light-accent/20"
              >
                <FaFileAlt size={12} />
                Versión {cotizacion?.versionNumber?.toString() || '1'} • 2025
              </FluentGlass>
            </FluentTap>
          </div>
        </FluentReveal>

        {/* Título principal con FluentReveal */}
        <FluentReveal direction="up" blur delay={0.2}>
          <div className="text-center mb-14">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-light-text mb-5 tracking-tight"
              style={{ lineHeight: 1.1 }}
            >
              {cotizacion?.heroTituloMain || 'Propuesta de Cotización'}
            </h1>
            <h2 
              className="text-xl md:text-2xl text-light-text-secondary font-normal mb-4"
            >
              {cotizacion?.heroTituloSub || 'Página Catálogo Dinámica'}
            </h2>
            <FluentHover effect="glow" glowColor="accent">
              <p className="text-lg text-light-accent font-semibold inline-block px-4 py-2 rounded-xl">
                {cotizacion?.empresa || 'Urbanísima CONSTRUCTORA S.R.L'}
              </p>
            </FluentHover>
          </div>
        </FluentReveal>

        {/* Grid de información con FluentGlass cards */}
        <FluentRevealGroup stagger={0.12} delay={0.3}>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Card: Información de Cotización */}
            <FluentRevealItem className="h-full">
              <FluentGlass 
                preset="frosted" 
                rounded="2xl" 
                elevateOnHover 
                className="overflow-hidden border border-light-border/50 h-full flex flex-col"
              >
                <div className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary px-6 py-4 border-b border-light-border/50">
                  <h3 className="text-sm font-semibold text-light-text flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-light-accent to-blue-600 rounded-lg">
                      <FaFileAlt className="text-white" size={12} />
                    </div>
                    Información de Cotización
                  </h3>
                </div>
                <div className="p-6 space-y-0 flex-1">
                  <InfoRow label="Cotización" value={cotizacion?.numero || '#004-2025'} />
                  <InfoRow label="Vigencia del Contrato" value={cotizacion?.tiempoVigenciaValor ? `${cotizacion.tiempoVigenciaValor} ${cotizacion.tiempoVigenciaUnidad || 'meses'}` : '12 meses'} />
                  <InfoRow 
                    label="Fecha de emisión" 
                    value={cotizacion?.fechaEmision ? formatearFechaLarga(cotizacion.fechaEmision) : '13 de noviembre de 2025'} 
                    icon={<FaCalendarAlt size={12} className="text-light-accent" />}
                  />
                  <InfoRow 
                    label="Fecha de vencimiento" 
                    value={cotizacion?.fechaVencimiento ? formatearFechaLarga(cotizacion.fechaVencimiento) : '13 de diciembre de 2025'} 
                    icon={<FaCalendarAlt size={12} className="text-light-warning" />}
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
              </FluentGlass>
            </FluentRevealItem>

            {/* Card: Cliente y Proveedor */}
            <FluentRevealItem className="h-full">
              <FluentGlass 
                preset="frosted" 
                rounded="2xl" 
                elevateOnHover 
                className="overflow-hidden border border-light-border/50 h-full flex flex-col"
              >
                <div className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary px-6 py-4 border-b border-light-border/50">
                  <h3 className="text-sm font-semibold text-light-text">Partes Involucradas</h3>
                </div>
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  {/* Para (Cliente) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-light-accent uppercase tracking-wider">Para</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-light-accent/30 to-transparent" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-light-text font-semibold">{cotizacion?.empresa || 'Urbanísima Constructora S.R.L'}</p>
                      <p className="text-light-text-secondary">{cotizacion?.sector || 'Construcción y montaje'}</p>
                      <p className="text-light-text-muted text-xs flex items-start gap-2">
                        <FaMapMarkerAlt className="mt-0.5 flex-shrink-0 text-light-accent" size={12} />
                        {cotizacion?.ubicacion || 'Calle 12/2da y 3ra, No 36, Ampliación de Marbella, Habana del Este, La Habana, CUBA'}
                      </p>
                    </div>
                  </div>

                  {/* De (Proveedor) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-light-success uppercase tracking-wider">De</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-light-success/30 to-transparent" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-light-text font-semibold">{cotizacion?.profesional || 'Daniel Treasure Espinosa'}</p>
                      <p className="text-light-accent font-semibold">{cotizacion?.empresaProveedor || 'DGTECNOVA'}</p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <FluentTap>
                          <a 
                            href={`mailto:${cotizacion?.emailProveedor || 'dgtecnova@gmail.com'}`} 
                            className="inline-flex items-center gap-1.5 text-xs text-light-text-secondary hover:text-light-accent transition-colors px-3 py-1.5 rounded-full bg-light-bg-secondary/50 hover:bg-light-accent/10"
                          >
                            <FaEnvelope size={12} />
                            {cotizacion?.emailProveedor || 'dgtecnova@gmail.com'}
                          </a>
                        </FluentTap>
                        <FluentTap>
                          <a 
                            href={`https://wa.me/${(cotizacion?.whatsappProveedor || '+5358569291').replaceAll(/[^\d+]/g, '')}`}
                            className="inline-flex items-center gap-1.5 text-xs text-light-text-secondary hover:text-light-success transition-colors px-3 py-1.5 rounded-full bg-light-bg-secondary/50 hover:bg-light-success/10"
                          >
                            <FaWhatsapp size={12} />
                            {cotizacion?.whatsappProveedor || '+535 856 9291'}
                          </a>
                        </FluentTap>
                      </div>
                      <p className="text-light-text-muted text-xs flex items-start gap-2 pt-1">
                        <FaMapMarkerAlt className="mt-0.5 flex-shrink-0 text-light-success" size={12} />
                        {cotizacion?.ubicacionProveedor || 'Arroyo 203, e/ Lindero y Nueva del Pilar, Centro Habana, La Habana, CUBA'}
                      </p>
                    </div>
                  </div>
                </div>
              </FluentGlass>
            </FluentRevealItem>
          </div>
        </FluentRevealGroup>
      </div>
    </FluentSection>
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
    <FluentHover effect="none">
      <motion.div 
        className={`flex justify-between items-center py-3 ${isLast ? '' : 'border-b border-light-border/50'}`}
        whileHover={{ 
          x: 4, 
          backgroundColor: 'rgba(0, 120, 212, 0.02)',
          transition: { duration: 0.2 }
        }}
      >
        <span className="text-sm text-light-text-secondary">{label}</span>
        <span className={`text-sm font-medium flex items-center gap-2 ${highlight ? 'text-light-success' : 'text-light-text'}`}>
          {icon}
          {value}
        </span>
      </motion.div>
    </FluentHover>
  )
}
