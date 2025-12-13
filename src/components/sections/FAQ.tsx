'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa'
import type { FAQItem, VisibilidadConfig } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal } from '@/components/motion'
import { fluentStaggerContainer, fluentStaggerItem } from '@/lib/animations/variants'
import { spring, easing } from '@/lib/animations/config'

interface TituloSubtituloFAQ {
  titulo: string
  subtitulo: string
}

interface FAQProps {
  readonly data?: FAQItem[]
  readonly visibilidad?: VisibilidadConfig
  readonly tituloSubtitulo?: TituloSubtituloFAQ
}

export default function FAQ({ data, visibilidad, tituloSubtitulo }: FAQProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)
  
  // Si la sección está oculta o no hay datos, no renderizar nada
  if (visibilidad?.faq === false || !data || data.length === 0) {
    return null
  }
  
  // Usar datos de BD
  const faqData = data
  
  // Títulos dinámicos
  const titulo = tituloSubtitulo?.titulo || 'Preguntas Frecuentes'
  const subtitulo = tituloSubtitulo?.subtitulo || 'Respuestas a las dudas más comunes sobre nuestros servicios'

  return (
    <FluentSection 
      id="faq" 
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg via-light-bg-secondary to-white"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FluentReveal className="text-center mb-6">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-5 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluentBouncy}
          >
            <FaQuestionCircle className="text-white" size={28} />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-light-text mb-3 tracking-tight">
            {titulo}
          </h2>
          <p className="text-lg text-light-text-secondary max-w-xl mx-auto">
            {subtitulo}
          </p>
        </FluentReveal>

        {/* FAQ Items */}
        <FluentGlass 
          variant="normal"
          className="rounded-2xl overflow-hidden"
          variants={fluentStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {faqData.map((faq, index) => (
            <motion.div
              key={`faq-${faq.question.slice(0, 30)}-${index}`}
              variants={fluentStaggerItem}
              className={index === faqData.length - 1 ? '' : 'border-b border-light-border/50'}
            >
              <motion.button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className={`w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-300 ${
                  openFAQ === index 
                    ? 'bg-gradient-to-r from-light-accent/5 to-blue-50/50' 
                    : 'hover:bg-light-bg-secondary/50'
                }`}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      openFAQ === index 
                        ? 'bg-gradient-to-br from-light-accent to-blue-600 shadow-md' 
                        : 'bg-light-bg-secondary'
                    }`}
                  >
                    <span className={`text-sm font-bold ${openFAQ === index ? 'text-white' : 'text-light-text-secondary'}`}>
                      {index + 1}
                    </span>
                  </motion.div>
                  <span className={`font-semibold text-sm transition-colors duration-300 ${
                    openFAQ === index ? 'text-light-accent' : 'text-light-text'
                  }`}>
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openFAQ === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: easing.fluent }}
                  className={`flex-shrink-0 ${openFAQ === index ? 'text-light-accent' : 'text-light-text-muted'}`}
                >
                  <FaChevronDown size={14} />
                </motion.div>
              </motion.button>

              <AnimatePresence initial={false}>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: 'auto', 
                      opacity: 1,
                      transition: {
                        height: { duration: 0.3, ease: easing.fluent },
                        opacity: { duration: 0.2, delay: 0.1 }
                      }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: { duration: 0.3, ease: easing.fluentAccelerate },
                        opacity: { duration: 0.15 }
                      }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="pl-14">
                        <motion.div 
                          className="h-px bg-gradient-to-r from-light-accent/30 to-transparent mb-4"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        />
                        <div className="text-sm text-light-text-secondary leading-relaxed">
                          {Array.isArray(faq.answer) ? (
                            <div className="space-y-3">
                              {faq.answer.map((line, i) => (
                                <motion.p 
                                  key={`answer-line-${line.slice(0, 20)}-${i}`}
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                                >
                                  {line}
                                </motion.p>
                              ))}
                            </div>
                          ) : (
                            <motion.p
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.15 }}
                            >
                              {faq.answer}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </FluentGlass>

        {/* Footer CTA */}
        <FluentReveal className="mt-10 text-center">
          <motion.p 
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full border border-light-accent/20 text-light-text-secondary text-sm shadow-sm"
            whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0, 120, 212, 0.15)' }}
            transition={spring.fluent}
          >
            ¿Tienes más preguntas? 
            <span className="text-light-accent font-semibold">Contáctanos</span>
          </motion.p>
        </FluentReveal>
      </div>
    </FluentSection>
  )
}
