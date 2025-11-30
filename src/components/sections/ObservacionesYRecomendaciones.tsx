'use client'

import { motion } from 'framer-motion'
import { FaExclamationTriangle, FaLightbulb } from 'react-icons/fa'
import type { ObservacionesData } from '@/lib/types'

// Función para obtener color según prioridad
function getPriorityBorderColor(priority: 'alta' | 'media' | 'baja'): string {
  switch (priority) {
    case 'alta': return 'border-light-danger'
    case 'media': return 'border-light-warning'
    case 'baja': return 'border-light-accent'
    default: return 'border-light-text-secondary'
  }
}

// Función para obtener color de badge según prioridad
function getPriorityBadgeColor(priority: 'alta' | 'media' | 'baja'): string {
  switch (priority) {
    case 'alta': return 'bg-light-danger/10 text-light-danger'
    case 'media': return 'bg-light-warning/10 text-light-warning'
    case 'baja': return 'bg-light-accent/10 text-light-accent'
    default: return 'bg-light-text-secondary/10 text-light-text-secondary'
  }
}

interface ObservacionesYRecomendacionesProps {
  readonly data?: ObservacionesData
}

export default function ObservacionesYRecomendaciones({ data }: ObservacionesYRecomendacionesProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const observacionesData = data

  return (
    <section id="observaciones" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-warning-bg rounded-full mb-4">
              <FaExclamationTriangle className="text-light-warning" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {observacionesData.titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {observacionesData.subtitulo}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Puntos de Atención */}
            {observacionesData.puntosAtencion.visible && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-light-bg-secondary rounded-md p-6 border border-light-border"
              >
                <div className="flex items-center gap-2 mb-5">
                  <FaExclamationTriangle className="text-light-danger text-xl" />
                  <h3 className="text-xl font-semibold text-light-text">{observacionesData.puntosAtencion.titulo}</h3>
                </div>

                {observacionesData.puntosAtencion.descripcion && (
                  <p className="text-sm text-light-text-secondary mb-4">
                    {observacionesData.puntosAtencion.descripcion}
                  </p>
                )}

                <div className="space-y-4">
                  {observacionesData.puntosAtencion.items.map((item, idx) => (
                    <div 
                      key={`punto-${item.titulo}-${idx}`} 
                      className={`bg-light-bg rounded-md p-4 border-l-2 ${getPriorityBorderColor(item.prioridad)}`}
                    >
                      <h4 className="font-medium text-light-text mb-2 text-sm">{item.titulo}</h4>
                      <p className="text-xs text-light-text-secondary">{item.descripcion}</p>
                      <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${getPriorityBadgeColor(item.prioridad)}`}>
                        Prioridad {item.prioridad}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recomendaciones */}
            {observacionesData.recomendaciones.visible && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-light-bg-secondary rounded-md p-6 border border-light-border"
              >
                <div className="flex items-center gap-2 mb-5">
                  <FaLightbulb className="text-light-warning text-xl" />
                  <h3 className="text-xl font-semibold text-light-text">{observacionesData.recomendaciones.titulo}</h3>
                </div>

                {observacionesData.recomendaciones.descripcion && (
                  <p className="text-sm text-light-text-secondary mb-4">
                    {observacionesData.recomendaciones.descripcion}
                  </p>
                )}

                <div className="space-y-3">
                  {observacionesData.recomendaciones.items.map((item, idx) => (
                    <div 
                      key={`rec-${item.titulo}-${idx}`} 
                      className="bg-light-bg rounded-md p-3 border border-light-border hover:border-light-accent/40 transition-colors flex gap-3"
                    >
                      <div className="text-light-success font-medium">✓</div>
                      <div>
                        <p className="font-medium text-light-text text-sm">{item.titulo}</p>
                        <p className="text-xs text-light-text-secondary">{item.descripcion}</p>
                        {item.beneficios.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {item.beneficios.map((ben, benIdx) => (
                              <span 
                                key={`ben-${ben}-${benIdx}`}
                                className="text-[10px] px-1.5 py-0.5 bg-light-success/10 text-light-success rounded"
                              >
                                {ben}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Nota Final */}
          {observacionesData.notaFinal && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-sm text-light-text-secondary mt-6 italic"
            >
              {observacionesData.notaFinal}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
