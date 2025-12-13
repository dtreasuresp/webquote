'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import type { ConclusionData } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal } from '@/components/motion'
import { fluentSlideUp } from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

interface ConclusionProps {
  readonly data?: ConclusionData
}

export default function Conclusion({ data }: ConclusionProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const conclusionData = data

  return (
    <FluentSection
      id="conclusion"
      animation="fade"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
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
            {conclusionData.titulo}
          </h2>
          {conclusionData.subtitulo && (
            <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
              {conclusionData.subtitulo}
            </p>
          )}
        </motion.div>
        
        {/* Párrafo Principal */}
        <motion.p 
          className="text-base leading-relaxed text-light-text-secondary max-w-4xl mx-auto text-center mb-4"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          {conclusionData.parrafoPrincipal}
        </motion.p>
        
        {/* Párrafo Secundario */}
        {conclusionData.parrafoSecundario && (
          <motion.p 
            className="text-sm leading-relaxed text-light-text-secondary max-w-3xl mx-auto text-center mb-8"
            variants={fluentSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport.default}
          >
            {conclusionData.parrafoSecundario}
          </motion.p>
        )}

        {/* Llamada a la Acción */}
        {conclusionData.llamadaAccion?.visible && (
          <FluentReveal className="mb-6">
            <FluentGlass
              variant="normal"
              className="rounded-2xl p-8 text-center max-w-xl mx-auto"
            >
              <h3 className="text-lg font-semibold text-light-text mb-2">
                {conclusionData.llamadaAccion.titulo}
              </h3>
              <p className="text-sm text-light-text-secondary mb-5">
                {conclusionData.llamadaAccion.descripcion}
              </p>
              <motion.a 
                href={conclusionData.llamadaAccion.urlBoton}
                className="inline-block px-7 py-3 bg-gradient-to-r from-light-accent to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-light-accent transition-all font-medium text-sm shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                transition={spring.fluent}
              >
                {conclusionData.llamadaAccion.textoBoton}
              </motion.a>
            </FluentGlass>
          </FluentReveal>
        )}

        {/* Firma Digital */}
        {conclusionData.firmaDigital?.visible && (
          <motion.div 
            className="text-center pt-6 border-t border-light-border/50"
            variants={fluentSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport.default}
          >
            <p className="text-sm text-light-text-secondary mb-1">
              {conclusionData.firmaDigital.textoFinal}
            </p>
            <motion.p 
              className="font-semibold text-light-text text-lg"
              whileHover={{ scale: 1.02 }}
              transition={spring.fluent}
            >
              {conclusionData.firmaDigital.nombreEmpresa}
            </motion.p>
            <p className="text-xs text-light-text-muted">
              {conclusionData.firmaDigital.eslogan}
            </p>
          </motion.div>
        )}
      </div>
    </FluentSection>
  )
}
