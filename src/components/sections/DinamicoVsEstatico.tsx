'use client'

import { motion } from 'framer-motion'
import { FaExchangeAlt, FaCheck, FaLightbulb } from 'react-icons/fa'
import type { DinamicoVsEstaticoData } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { fluentStaggerContainer, fluentStaggerItem } from '@/lib/animations/variants'
import { spring } from '@/lib/animations/config'

interface DinamicoVsEstaticoProps {
  readonly data?: DinamicoVsEstaticoData
}

export default function DinamicoVsEstatico({ data }: DinamicoVsEstaticoProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const dinamicoData = data

  return (
    <FluentSection 
      id="dinamico-vs-estatico" 
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg via-light-bg-secondary to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FluentReveal className="text-center mb-6">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-5 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={spring.fluentBouncy}
          >
            <FaExchangeAlt className="text-white" size={26} />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-light-text mb-3 tracking-tight">
            {dinamicoData.titulo}
          </h2>
          <p className="text-lg text-light-text-secondary max-w-xl mx-auto">
            {dinamicoData.subtitulo}
          </p>
        </FluentReveal>

        <FluentRevealGroup className="grid md:grid-cols-2 gap-8 mb-6">
          {/* Sitios Estáticos */}
          <FluentRevealItem>
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden h-full"
            >
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-5 border-b border-light-border/50">
                <h3 className="text-lg font-bold text-light-text">{dinamicoData.sitioEstatico.title}</h3>
              </div>
              <div className="p-6 space-y-5">
                {dinamicoData.sitioEstatico.items.map((item, idx) => (
                  <motion.div 
                    key={`item-${item.label}-${idx}`}
                    variants={fluentStaggerItem}
                    whileHover={{ x: 4 }}
                    transition={spring.fluent}
                  >
                    <p className="font-semibold text-light-text text-sm mb-1">{item.label}</p>
                    {item.value && (
                      <p className="text-light-text-secondary text-sm mb-2">{item.value}</p>
                    )}
                    {item.list && (
                      <ul className="space-y-2">
                        {item.list.map((listItem) => (
                          <li key={`list-${listItem.slice(0, 30).replaceAll(' ', '-')}`} className="flex items-start gap-2 text-light-text-secondary text-sm">
                            <span className="mt-1 text-light-text-muted">•</span>
                            <span>{listItem}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </FluentGlass>
          </FluentRevealItem>

          {/* Sitios Dinámicos */}
          <FluentRevealItem>
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden border-light-accent/30 h-full"
            >
            <div className="bg-gradient-to-r from-light-accent/10 to-blue-50 px-6 py-5 border-b border-light-accent/20">
              <h3 className="text-lg font-bold text-light-accent">{dinamicoData.sitioDinamico.title}</h3>
            </div>
            <div className="p-6 space-y-5">
              {dinamicoData.sitioDinamico.items.map((item, idx) => (
                <motion.div 
                  key={`item-${item.label}-${idx}`}
                  variants={fluentStaggerItem}
                  whileHover={{ x: 4 }}
                  transition={spring.fluent}
                >
                  <p className="font-semibold text-light-text text-sm mb-1">{item.label}</p>
                  {item.value && (
                    <p className="text-light-text-secondary text-sm mb-2">{item.value}</p>
                  )}
                  {item.list && (
                    <ul className="space-y-2">
                      {item.list.map((listItem) => (
                        <li key={`list-${listItem.slice(0, 30).replaceAll(' ', '-')}`} className="flex items-start gap-2 text-light-text-secondary text-sm">
                          <span className="mt-1 text-light-accent">•</span>
                          <span>{listItem}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
            </FluentGlass>
          </FluentRevealItem>
        </FluentRevealGroup>

        {/* Recomendación Final */}
        <FluentReveal>
          <FluentGlass
            variant="normal"
            className="rounded-2xl overflow-hidden border-light-warning/30"
          >
            <div className="bg-gradient-to-r from-light-warning-bg to-amber-50 px-6 py-5 border-b border-light-warning/20">
              <h3 className="text-xl font-bold flex items-center gap-3 text-light-text">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-light-warning to-amber-500 rounded-xl flex items-center justify-center shadow-md"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={spring.fluentBouncy}
                >
                  <FaLightbulb className="text-white" size={18} />
                </motion.div>
                {dinamicoData.recomendacion.titulo}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-light-text-secondary mb-6 text-base">
                {dinamicoData.recomendacion.subtitulo}{' '}
                <motion.span 
                  className="text-lg font-bold text-light-accent"
                  whileHover={{ scale: 1.05 }}
                  transition={spring.fluent}
                >
                  {dinamicoData.recomendacion.tipo}
                </motion.span>
              </p>

              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={fluentStaggerContainer}
              >
                {dinamicoData.recomendacion.razones.map((reason) => (
                  <motion.div 
                    key={`reason-${reason.slice(0, 30).replaceAll(' ', '-')}`} 
                    className="flex items-start gap-3 bg-light-success-bg/50 p-4 rounded-xl text-sm group"
                    variants={fluentStaggerItem}
                    whileHover={{ scale: 1.02, x: 4, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                    transition={spring.fluent}
                  >
                    <motion.div
                      className="flex-shrink-0 w-6 h-6 bg-light-success rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={spring.fluentBouncy}
                    >
                      <FaCheck className="text-white" size={10} />
                    </motion.div>
                    <span className="text-light-text-secondary group-hover:text-light-text transition-colors">{reason}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </FluentGlass>
        </FluentReveal>
      </div>
    </FluentSection>
  )
}