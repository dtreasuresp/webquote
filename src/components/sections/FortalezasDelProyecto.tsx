'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import type { FortalezasData } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { 
  fluentSlideUp
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

interface FortalezasDelProyectoProps {
  readonly data?: FortalezasData
}

export default function FortalezasDelProyecto({ data }: FortalezasDelProyectoProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const fortalezasData = data

  return (
    <FluentSection
      id="fortalezas"
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
            <FaCheckCircle className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {fortalezasData.titulo}
          </h2>
          <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
            {fortalezasData.subtitulo}
          </p>
        </motion.div>

        {/* Grid de Fortalezas */}
        <FluentRevealGroup className="grid md:grid-cols-2 gap-5 mb-6">
          {fortalezasData.fortalezas.map((item, idx) => (
            <FluentRevealItem key={`fortaleza-${item.title}-${idx}`}>
              <FluentGlass
                variant="normal"
                className="rounded-2xl p-6 h-full hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="text-3xl p-2 bg-gradient-to-br from-light-bg-secondary to-white rounded-xl"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={spring.fluent}
                  >
                    {item.icon}
                  </motion.div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-light-text mb-1.5">{item.title}</h3>
                    <p className="text-sm text-light-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FluentGlass>
            </FluentRevealItem>
          ))}
        </FluentRevealGroup>

        {/* Resumen de Fortalezas */}
        <FluentReveal>
          <FluentGlass
            variant="normal"
            className="rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-light-text mb-6">{fortalezasData.resumen.titulo}</h3>

            <FluentRevealGroup className="grid md:grid-cols-2 gap-6">
              {/* Cliente Ideal */}
              <FluentRevealItem>
                <div className="bg-gradient-to-br from-light-bg-secondary to-white rounded-xl p-5 border border-light-border/50 h-full">
                  <h4 className="font-medium text-light-text mb-4 flex items-center gap-2">
                    <div className="p-1 bg-light-success/10 rounded-lg">
                      <FaCheckCircle className="text-light-success" />
                    </div>
                    Cliente Ideal
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                    {fortalezasData.resumen.clienteIdeal.map((item) => (
                      <li key={`cliente-${item.slice(0, 30).replaceAll(' ', '-')}`} className="flex gap-2.5 text-light-text-secondary">
                        <span className="text-light-accent">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FluentRevealItem>

              {/* Ventajas Competitivas */}
              <FluentRevealItem>
                <div className="bg-gradient-to-br from-light-bg-secondary to-white rounded-xl p-5 border border-light-border/50 h-full">
                  <h4 className="font-medium text-light-text mb-4 flex items-center gap-2">
                    <div className="p-1 bg-light-success/10 rounded-lg">
                      <FaCheckCircle className="text-light-success" />
                    </div>
                    Ventajas Competitivas
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                    {fortalezasData.resumen.ventajasCompetitivas.map((item) => (
                      <li key={`ventaja-${item.slice(0, 30).replaceAll(' ', '-')}`} className="flex gap-2.5 text-light-text-secondary">
                        <span className="text-light-accent">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FluentRevealItem>
            </FluentRevealGroup>

            <motion.div 
              className="mt-6 pt-6 border-t border-light-border/50 bg-gradient-to-r from-light-accent/5 to-transparent rounded-lg p-4 -mx-4"
              whileHover={{ x: 4 }}
              transition={spring.fluent}
            >
              <p className="text-sm text-light-text">
                🎯 <strong>Resultado Final:</strong> {fortalezasData.resumen.resultadoFinal}
              </p>
            </motion.div>
          </FluentGlass>
        </FluentReveal>
      </div>
    </FluentSection>
  )
}
