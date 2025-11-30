'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import type { FortalezasData } from '@/lib/types'

interface FortalezasDelProyectoProps {
  readonly data?: FortalezasData
}

export default function FortalezasDelProyecto({ data }: FortalezasDelProyectoProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const fortalezasData = data

  return (
    <section id="fortalezas" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-success-bg rounded-full mb-4">
              <FaCheckCircle className="text-light-success" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {fortalezasData.titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {fortalezasData.subtitulo}
            </p>
          </div>

          {/* Grid de Fortalezas */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {fortalezasData.fortalezas.map((item, idx) => (
              <motion.div
                key={`fortaleza-${item.title}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="bg-light-bg rounded-md p-5 border border-light-border hover:border-light-accent/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-light-text mb-1">{item.title}</h3>
                    <p className="text-sm text-light-text-secondary">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Resumen de Fortalezas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-light-bg rounded-md p-8 border border-light-border"
          >
            <h3 className="text-xl font-semibold text-light-text mb-6">{fortalezasData.resumen.titulo}</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cliente Ideal */}
              <div className="bg-light-bg-secondary rounded-md p-5 border border-light-border">
                <h4 className="font-medium text-light-text mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-light-success" /> Cliente Ideal
                </h4>
                <ul className="space-y-2 text-sm">
                  {fortalezasData.resumen.clienteIdeal.map((item) => (
                    <li key={`cliente-${item.slice(0, 30).replaceAll(' ', '-')}`} className="flex gap-2 text-light-text-secondary">
                      <span className="text-light-accent">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ventajas Competitivas */}
              <div className="bg-light-bg-secondary rounded-md p-5 border border-light-border">
                <h4 className="font-medium text-light-text mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-light-success" /> Ventajas Competitivas
                </h4>
                <ul className="space-y-2 text-sm">
                  {fortalezasData.resumen.ventajasCompetitivas.map((item) => (
                    <li key={`ventaja-${item.slice(0, 30).replaceAll(' ', '-')}`} className="flex gap-2 text-light-text-secondary">
                      <span className="text-light-accent">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-light-border">
              <p className="text-sm text-light-text">
                🎯 <strong>Resultado Final:</strong> {fortalezasData.resumen.resultadoFinal}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
