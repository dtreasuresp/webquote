'use client'

import { motion } from 'framer-motion'
import { FaGavel, FaInfoCircle } from 'react-icons/fa'
import type { TerminosCondiciones, VisibilidadConfig } from '@/lib/types'

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
    <section id="terminos" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-info-bg rounded-full mb-4">
              <FaGavel className="text-light-accent" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {subtitulo}
            </p>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 bg-light-accent/10 rounded-md flex-shrink-0">
              <FaInfoCircle className="text-light-accent text-lg" />
            </div>
            <div>
              <h3 className="text-base font-medium text-light-text mb-1">
                Información importante
              </h3>
              <p className="text-light-text-secondary text-sm">
                Por favor, lee cuidadosamente los siguientes términos antes de aceptar esta propuesta.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {parrafos.map((parrafo, index) => (
              <motion.div
                key={`termino-${parrafo.slice(0, 30)}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-light-bg-secondary rounded-md border border-light-border"
              >
                <span className="text-light-accent font-medium text-sm flex-shrink-0">
                  {index + 1}.
                </span>
                <p className="text-sm text-light-text-secondary">{parrafo}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-light-border">
            <p className="text-xs text-light-text-secondary text-center">
              Al aceptar esta propuesta, confirmas que has leído y estás de acuerdo con estos términos y condiciones.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
