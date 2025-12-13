'use client'

import { motion } from 'framer-motion'
import { FaGavel, FaInfoCircle } from 'react-icons/fa'
import type { TerminosCondiciones, VisibilidadConfig } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { spring } from '@/lib/animations/config'

interface TerminosProps {
  readonly data?: TerminosCondiciones
  readonly visibilidad?: VisibilidadConfig
}

export default function Terminos({ data, visibilidad }: TerminosProps) {
  // Si la sección está oculta o no hay datos, no renderizar nada
  if (visibilidad?.terminos === false || !data) {
    return null
  }

  // Usar datos de BD
  const titulo = data.titulo || 'Términos y Condiciones'
  const subtitulo = data.subtitulo || 'Condiciones generales del servicio'
  const parrafos = data.parrafos || []

  return (
    <FluentSection
      id="terminos"
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FluentReveal className="text-center mb-6">
          <motion.div 
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaGavel className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {titulo}
          </h2>
          <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
            {subtitulo}
          </p>
        </FluentReveal>

        <FluentReveal className="mb-6">
          <FluentGlass
            variant="subtle"
            className="flex items-start gap-4 p-5 bg-gradient-to-r from-light-accent/10 to-blue-500/5 rounded-2xl border border-light-accent/20"
          >
            <div className="p-2.5 bg-gradient-to-br from-light-accent to-blue-600 rounded-xl flex-shrink-0 shadow-md">
              <FaInfoCircle className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-base font-medium text-light-text mb-1">
                Información importante
              </h3>
              <p className="text-light-text-secondary text-sm leading-relaxed">
                Por favor, lee cuidadosamente los siguientes términos antes de aceptar esta propuesta.
              </p>
            </div>
          </FluentGlass>
        </FluentReveal>

        <FluentRevealGroup className="space-y-3">
          {parrafos.map((parrafo, index) => (
            <FluentRevealItem key={`termino-${parrafo.slice(0, 30)}-${index}`}>
              <FluentGlass
                variant="subtle"
                className="flex items-start gap-4 p-5 rounded-xl"
              >
                <motion.span 
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-light-accent to-blue-600 text-white font-semibold text-sm rounded-lg flex-shrink-0 shadow-md"
                  whileHover={{ scale: 1.1 }}
                  transition={spring.fluent}
                >
                  {index + 1}
                </motion.span>
                <p className="text-sm text-light-text-secondary leading-relaxed">{parrafo}</p>
              </FluentGlass>
            </FluentRevealItem>
          ))}
        </FluentRevealGroup>

        <FluentReveal className="mt-8 pt-5 border-t border-light-border/50">
          <p className="text-xs text-light-text-secondary text-center">
            Al aceptar esta propuesta, confirmas que has leído y estás de acuerdo con estos términos y condiciones.
          </p>
        </FluentReveal>
      </div>
    </FluentSection>
  )
}
