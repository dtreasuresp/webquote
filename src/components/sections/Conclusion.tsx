'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import type { ConclusionData } from '@/lib/types'

interface ConclusionProps {
  readonly data?: ConclusionData
}

export default function Conclusion({ data }: ConclusionProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const conclusionData = data

  return (
    <section id="conclusion" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-success-bg rounded-full mb-4">
              <FaCheckCircle className="text-light-success" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {conclusionData.titulo}
            </h2>
            {conclusionData.subtitulo && (
              <p className="text-sm text-light-text-secondary">
                {conclusionData.subtitulo}
              </p>
            )}
          </div>
          
          {/* Párrafo Principal */}
          <p className="text-base leading-relaxed text-light-text-secondary max-w-4xl mx-auto text-center mb-4">
            {conclusionData.parrafoPrincipal}
          </p>
          
          {/* Párrafo Secundario */}
          {conclusionData.parrafoSecundario && (
            <p className="text-sm leading-relaxed text-light-text-secondary max-w-3xl mx-auto text-center mb-8">
              {conclusionData.parrafoSecundario}
            </p>
          )}

          {/* Llamada a la Acción */}
          {conclusionData.llamadaAccion?.visible && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-light-bg-secondary border border-light-border rounded-lg p-6 text-center max-w-xl mx-auto mb-6"
            >
              <h3 className="text-lg font-semibold text-light-text mb-2">
                {conclusionData.llamadaAccion.titulo}
              </h3>
              <p className="text-sm text-light-text-secondary mb-4">
                {conclusionData.llamadaAccion.descripcion}
              </p>
              <a 
                href={conclusionData.llamadaAccion.urlBoton}
                className="inline-block px-6 py-2.5 bg-light-accent text-white rounded-lg hover:bg-light-accent-hover transition-colors font-medium text-sm"
              >
                {conclusionData.llamadaAccion.textoBoton}
              </a>
            </motion.div>
          )}

          {/* Firma Digital */}
          {conclusionData.firmaDigital?.visible && (
            <div className="text-center pt-4 border-t border-light-border">
              <p className="text-sm text-light-text-secondary mb-1">
                {conclusionData.firmaDigital.textoFinal}
              </p>
              <p className="font-semibold text-light-text">
                {conclusionData.firmaDigital.nombreEmpresa}
              </p>
              <p className="text-xs text-light-text-muted">
                {conclusionData.firmaDigital.eslogan}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
