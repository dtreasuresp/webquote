'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaShieldAlt, FaExclamationTriangle, FaBalanceScale } from 'react-icons/fa'
import type { VisibilidadConfig } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem, fluentSlideUp } from '@/components/motion'
import { 
  fluentStaggerContainer, 
  fluentStaggerItem
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

export interface PoliticaCancelacion {
  title: string
  detail: string
}

export interface TituloSubtituloGarantias {
  titulo: string
  subtitulo: string
}

export interface GarantiasData {
  tituloSubtitulo?: TituloSubtituloGarantias
  proveedorGarantiza?: string[]
  clienteResponsable?: string[]
  politicasCancelacion?: PoliticaCancelacion[]
  siIncumpleProveedor?: string[]
}

interface GarantiasProps {
  readonly data?: GarantiasData
  readonly visibilidad?: VisibilidadConfig
}

export default function Garantias({ data, visibilidad }: GarantiasProps) {
  // Si no hay datos, no renderizar nada
  if (!data) {
    return null
  }

  // Helper para verificar visibilidad
  const isVisible = (key: keyof VisibilidadConfig) => visibilidad?.[key] !== false
  
  // Usar datos de BD (si algún array está vacío, la sección correspondiente simplemente no mostrará items)
  const proveedorGarantiza = data.proveedorGarantiza || []
  const clienteResponsable = data.clienteResponsable || []
  const politicasCancelacion = data.politicasCancelacion || []
  const siIncumple = data.siIncumpleProveedor || []
  
  // Títulos dinámicos
  const titulo = data.tituloSubtitulo?.titulo || 'Garantías y Responsabilidades'
  const subtitulo = data.tituloSubtitulo?.subtitulo || 'Compromisos claros de ambas partes'

  return (
    <FluentSection 
      id="garantias" 
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-success to-emerald-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaShieldAlt className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {titulo}
          </h2>
          <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
            {subtitulo}
          </p>
        </motion.div>

        {/* Grid de Garantías */}
        <FluentRevealGroup className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Proveedor Garantiza */}
          {isVisible('garantiasProveedor') && (
            <FluentRevealItem>
              <FluentGlass
                variant="normal"
                className="rounded-2xl overflow-hidden h-full"
              >
                <div className="bg-gradient-to-r from-light-success/10 to-emerald-500/10 px-6 py-4 border-b border-light-success/20">
                  <h3 className="text-sm font-semibold text-light-success flex items-center gap-2">
                    <FaCheckCircle size={14} />
                    El proveedor garantiza
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {proveedorGarantiza.map((item, index) => (
                      <motion.li 
                        key={`proveedor-${item.slice(0, 30)}-${index}`} 
                        className="flex items-start gap-3 text-sm text-light-text"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="text-light-success mt-0.5 flex-shrink-0 text-base">✓</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FluentGlass>
            </FluentRevealItem>
          )}

          {/* Cliente Responsable */}
          {isVisible('garantiasCliente') && (
            <FluentRevealItem>
              <FluentGlass
                variant="normal"
                className="rounded-2xl overflow-hidden h-full"
              >
                <div className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary px-6 py-4 border-b border-light-border/50">
                  <h3 className="text-sm font-semibold text-light-text flex items-center gap-2">
                    <FaTimesCircle size={14} className="text-light-text-secondary" />
                    El cliente es responsable de
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {clienteResponsable.map((item, index) => (
                      <motion.li 
                        key={`cliente-${item.slice(0, 30)}-${index}`} 
                        className="flex items-start gap-3 text-sm text-light-text"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="text-light-text-muted mt-0.5 flex-shrink-0">•</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FluentGlass>
            </FluentRevealItem>
          )}
        </FluentRevealGroup>

        {/* Políticas de Cancelación */}
        {isVisible('politicasCancelacion') && (
          <FluentReveal className="mb-6">
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-light-warning/10 to-amber-500/10 px-6 py-4 border-b border-light-warning/20">
                <h3 className="text-sm font-semibold text-light-warning flex items-center gap-2">
                  <FaExclamationTriangle size={14} />
                  Políticas de Cancelación
                </h3>
              </div>
              <div className="p-6">
                <motion.div 
                  className="grid sm:grid-cols-2 gap-4"
                  variants={fluentStaggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport.default}
                >
                  {politicasCancelacion.map((policy, index) => (
                    <motion.div 
                      key={`policy-${policy.title.slice(0, 30)}-${index}`} 
                      className="p-4 bg-gradient-to-br from-light-bg-secondary to-white rounded-xl border-l-4 border-light-warning/50 shadow-sm"
                      variants={fluentStaggerItem}
                      whileHover={{ x: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      transition={spring.fluent}
                    >
                      <p className="text-sm font-medium text-light-text mb-1">{policy.title}</p>
                      <p className="text-xs text-light-text-secondary leading-relaxed">{policy.detail}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </FluentGlass>
          </FluentReveal>
        )}

        {/* Si Incumple el Proveedor */}
        {isVisible('siIncumpleProveedor') && (
          <FluentReveal>
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-light-accent/10 to-blue-500/10 px-6 py-4 border-b border-light-accent/20">
                <h3 className="text-sm font-semibold text-light-accent flex items-center gap-2">
                  <FaBalanceScale size={14} />
                  Si el proveedor incumple
                </h3>
              </div>
              <div className="p-6">
                <motion.ul 
                  className="grid sm:grid-cols-2 gap-3"
                  variants={fluentStaggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport.default}
                >
                  {siIncumple.map((item, index) => (
                    <motion.li 
                      key={`incumple-${item.slice(0, 30)}-${index}`} 
                      className="flex items-start gap-3 text-sm text-light-text p-3 rounded-lg hover:bg-light-bg-secondary/50 transition-colors"
                      variants={fluentStaggerItem}
                    >
                      <span className="text-light-accent mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </FluentGlass>
          </FluentReveal>
        )}
      </div>
    </FluentSection>
  )
}
