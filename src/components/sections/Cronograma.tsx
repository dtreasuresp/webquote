'use client'

import { motion } from 'framer-motion'
import { FaCalendarAlt } from 'react-icons/fa'
import type { PresupuestoCronogramaData } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal } from '@/components/motion'
import { 
  fluentSlideUp,
  fluentStaggerContainer, 
  fluentStaggerItem
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

interface CronogramaProps {
  readonly data?: PresupuestoCronogramaData
}

export default function Cronograma({ data }: CronogramaProps) {
  // Si no hay datos o la sección no está visible, no renderizar
  if (!data || data.cronograma?.visible === false) return null
  
  const cronogramaData = data.cronograma

  return (
    <FluentSection
      id="cronograma"
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-white to-light-bg"
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
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaCalendarAlt className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {cronogramaData.titulo || 'Cronograma de Desarrollo'}
          </h2>
          {cronogramaData.duracionTotal && (
            <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
              <strong>Duración estimada:</strong> {cronogramaData.duracionTotal}
            </p>
          )}
        </motion.div>

        {/* Fases del Cronograma */}
        <FluentReveal>
          <FluentGlass
            variant="normal"
            className="rounded-2xl p-6"
          >
            <div className="space-y-4">
              <motion.div 
                className="bg-gradient-to-br from-light-bg-secondary to-white rounded-xl p-5 border border-light-border/50"
                variants={fluentStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewport.default}
              >
                {cronogramaData.fases.map((fase, index) => (
                  <motion.div 
                    key={`fase-${fase.nombre.replaceAll(' ', '-')}`} 
                    className={`flex items-start gap-4 ${index < cronogramaData.fases.length - 1 ? 'mb-5 pb-5 border-b border-light-border/30' : ''}`}
                    variants={fluentStaggerItem}
                  >
                    <div className="flex-shrink-0">
                      <motion.div 
                        className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-light-accent to-blue-600 text-white text-sm font-semibold shadow-md"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={spring.fluent}
                      >
                        {index + 1}
                      </motion.div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-light-text text-sm">
                        {fase.nombre} ({fase.descripcion})
                        {fase.duracionDias > 0 && (
                          <span className="text-light-accent ml-2 bg-light-accent/10 px-2 py-0.5 rounded-full text-xs">📅 {fase.duracionDias} días</span>
                        )}
                      </h4>
                      <p className="text-xs text-light-text-secondary mt-1.5">
                        {fase.entregables.map((entregable, i) => (
                          <span key={`entregable-${entregable.replaceAll(' ', '-')}`}>
                            {i > 0 && ' | '}{entregable}
                          </span>
                        ))}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-light-warning/10 to-amber-500/5 border-l-4 border-light-warning rounded-xl p-4"
                whileHover={{ x: 4 }}
                transition={spring.fluent}
              >
                <p className="text-sm text-light-text">
                  <strong>📌 Nota importante:</strong> Este cronograma corresponde al paquete de mayor complejidad.
                </p>
              </motion.div>
            </div>
          </FluentGlass>
        </FluentReveal>
      </div>
    </FluentSection>
  )
}
