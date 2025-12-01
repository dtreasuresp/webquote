'use client'

import { motion } from 'framer-motion'
import { FaExchangeAlt, FaCheck, FaLightbulb } from 'react-icons/fa'
import type { DinamicoVsEstaticoData } from '@/lib/types'

interface DinamicoVsEstaticoProps {
  readonly data?: DinamicoVsEstaticoData
}

export default function DinamicoVsEstatico({ data }: DinamicoVsEstaticoProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const dinamicoData = data

  return (
    <section id="dinamico-vs-estatico" className="py-6 md:py-8 px-4 bg-light-bg font-github">
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
              <FaExchangeAlt className="text-light-accent" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {dinamicoData.titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {dinamicoData.subtitulo}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Sitios Estáticos */}
            <ComparisonCard 
              title={dinamicoData.sitioEstatico.title}
              color="static"
              items={dinamicoData.sitioEstatico.items}
            />

            {/* Sitios Dinámicos */}
            <ComparisonCard 
              title={dinamicoData.sitioDinamico.title}
              color="dynamic"
              items={dinamicoData.sitioDinamico.items}
            />
          </div>

          {/* Recomendación Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 bg-light-bg border border-light-border p-8 rounded-md"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-light-text">
              <FaLightbulb className="text-light-warning" />
              {dinamicoData.recomendacion.titulo}
            </h3>
            <p className="text-light-text-secondary mb-6">
              {dinamicoData.recomendacion.subtitulo} <span className="text-lg font-semibold text-light-accent">{dinamicoData.recomendacion.tipo}</span>
            </p>

            <div className="grid md:grid-cols-2 gap-3">
              {dinamicoData.recomendacion.razones.map((reason) => (
                <div key={`reason-${reason.slice(0, 30).replaceAll(' ', '-')}`} className="flex items-start gap-2 bg-light-bg-secondary p-3 rounded-md text-sm">
                  <FaCheck className="text-light-success mt-0.5 flex-shrink-0" />
                  <span className="text-light-text-secondary">{reason}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

function ComparisonCard({ 
  title, 
  color, 
  items 
}: Readonly<{ 
  title: string
  color: 'static' | 'dynamic'
  items: Array<{ label: string; value?: string; list?: string[] }>
}>) {
  const bgColor = color === 'static' ? 'bg-light-bg-secondary' : 'bg-light-accent/5'
  const borderColor = color === 'static' ? 'border-light-border' : 'border-light-accent/30'
  const iconColor = color === 'static' ? 'text-light-text-secondary' : 'text-light-accent'

  return (
    <motion.div
      initial={{ opacity: 0, x: color === 'static' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`${bgColor} p-6 rounded-md border ${borderColor}`}
    >
      <h3 className="text-lg font-semibold mb-4 text-light-text">{title}</h3>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={`item-${item.label}-${idx}`}>
            <p className="font-medium text-light-text text-sm mb-1">{item.label}</p>
            {item.value && (
              <p className="text-light-text-secondary text-sm mb-2">{item.value}</p>
            )}
            {item.list && (
              <ul className="space-y-1">
                {item.list.map((listItem) => (
                  <li key={`list-${listItem.slice(0, 30).replaceAll(' ', '-')}`} className="flex items-start gap-2 text-light-text-secondary text-sm">
                    <span className={`mt-0.5 ${iconColor}`}>•</span>
                    <span>{listItem}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}