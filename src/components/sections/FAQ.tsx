'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa'
import type { FAQItem, VisibilidadConfig } from '@/lib/types'

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
    <section id="faq" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-info-bg rounded-full mb-4">
              <FaQuestionCircle className="text-light-accent" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {subtitulo}
            </p>
          </div>

          {/* FAQ Items */}
          <div className="rounded-lg border border-light-border overflow-hidden bg-light-bg">
            {faqData.map((faq, index) => (
              <FAQItemComponent
                key={`faq-${faq.question.slice(0, 30)}-${index}`}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                isLast={index === faqData.length - 1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FAQItemComponent({
  question,
  answer,
  isOpen,
  onToggle,
  isLast,
}: {
  readonly question: string
  readonly answer: string | string[]
  readonly isOpen: boolean
  readonly onToggle: () => void
  readonly isLast: boolean
}) {
  return (
    <div className={isLast ? '' : 'border-b border-light-border'}>
      <button
        onClick={onToggle}
        className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors ${
          isOpen ? 'bg-light-bg-secondary' : 'hover:bg-light-bg-tertiary'
        }`}
      >
        <span className="font-medium text-sm text-light-text pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <FaChevronDown className="text-light-text-muted" size={12} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 py-4 bg-light-bg-secondary text-sm text-light-text-secondary leading-relaxed border-t border-light-border">
              {Array.isArray(answer) ? (
                <div className="space-y-2">
                  {answer.map((line, i) => (
                    <p key={`answer-line-${line.slice(0, 20)}-${i}`}>{line}</p>
                  ))}
                </div>
              ) : (
                <p>{answer}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
