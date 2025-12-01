'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaShieldAlt, FaExclamationTriangle, FaBalanceScale } from 'react-icons/fa'
import type { VisibilidadConfig } from '@/lib/types'

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
    <section id="garantias" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-success-bg rounded-full mb-4">
              <FaShieldAlt className="text-light-success" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {subtitulo}
            </p>
          </div>

          {/* Grid de Garantías */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Proveedor Garantiza */}
            {isVisible('garantiasProveedor') && (
              <div className="rounded-lg border border-light-border overflow-hidden">
                <div className="bg-light-success-bg px-5 py-3 border-b border-light-success/20">
                  <h3 className="text-sm font-semibold text-light-success flex items-center gap-2">
                    <FaCheckCircle size={14} />
                    El proveedor garantiza
                  </h3>
                </div>
                <div className="p-5 bg-light-bg">
                  <ul className="space-y-2">
                    {proveedorGarantiza.map((item, index) => (
                      <li key={`proveedor-${item.slice(0, 30)}-${index}`} className="flex items-start gap-2 text-sm text-light-text">
                        <span className="text-light-success mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Cliente Responsable */}
            {isVisible('garantiasCliente') && (
              <div className="rounded-lg border border-light-border overflow-hidden">
                <div className="bg-light-bg-secondary px-5 py-3 border-b border-light-border">
                  <h3 className="text-sm font-semibold text-light-text flex items-center gap-2">
                    <FaTimesCircle size={14} className="text-light-text-secondary" />
                    El cliente es responsable de
                  </h3>
                </div>
                <div className="p-5 bg-light-bg">
                  <ul className="space-y-2">
                    {clienteResponsable.map((item, index) => (
                      <li key={`cliente-${item.slice(0, 30)}-${index}`} className="flex items-start gap-2 text-sm text-light-text">
                        <span className="text-light-text-muted mt-0.5 flex-shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Políticas de Cancelación */}
          {isVisible('politicasCancelacion') && (
            <div className="rounded-lg border border-light-border overflow-hidden mb-10">
              <div className="bg-light-warning-bg px-5 py-3 border-b border-light-warning/20">
                <h3 className="text-sm font-semibold text-light-warning flex items-center gap-2">
                  <FaExclamationTriangle size={14} />
                  Políticas de Cancelación
                </h3>
              </div>
              <div className="p-5 bg-light-bg">
                <div className="grid sm:grid-cols-2 gap-4">
                  {politicasCancelacion.map((policy, index) => (
                    <div key={`policy-${policy.title.slice(0, 30)}-${index}`} className="p-3 bg-light-bg-secondary rounded-md border-l-2 border-light-warning/50">
                      <p className="text-sm font-medium text-light-text mb-1">{policy.title}</p>
                      <p className="text-xs text-light-text-secondary">{policy.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Si Incumple el Proveedor */}
          {isVisible('siIncumpleProveedor') && (
            <div className="rounded-lg border border-light-border overflow-hidden">
              <div className="bg-light-info-bg px-5 py-3 border-b border-light-accent/20">
                <h3 className="text-sm font-semibold text-light-accent flex items-center gap-2">
                  <FaBalanceScale size={14} />
                  Si el proveedor incumple
                </h3>
              </div>
              <div className="p-5 bg-light-bg">
                <ul className="grid sm:grid-cols-2 gap-2">
                  {siIncumple.map((item, index) => (
                    <li key={`incumple-${item.slice(0, 30)}-${index}`} className="flex items-start gap-2 text-sm text-light-text">
                      <span className="text-light-accent mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
