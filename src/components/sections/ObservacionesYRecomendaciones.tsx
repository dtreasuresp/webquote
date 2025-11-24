'use client'

import { motion } from 'framer-motion'
import { FaExclamationTriangle, FaLightbulb } from 'react-icons/fa'

export default function ObservacionesYRecomendaciones() {
  return (
    <section id="observaciones" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            ⚠️ Observaciones Críticas y Recomendaciones
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Puntos de Atención */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-red-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaExclamationTriangle className="text-red-500 text-2xl" />
                <h3 className="text-2xl font-bold text-gray-900">Puntos de Atención Prioritaria</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                  <h4 className="font-bold text-secondary mb-2">1. Presupuesto Limitado</h4>
                  <p className="text-sm text-gray-700 mb-3">Presupuesto menor de $300 USD es considerado adecuado para servicios desde básicos hasta medios.</p>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p><strong>✓ Acción:</strong> Priorizar funcionalidades críticas que mejor impacten el negocio</p>
                    <p><strong>✓ Acción:</strong> Considerar enfoque por fases</p>
                    <p><strong>✓ Acción:</strong> Definir claramente alcance según el paquete contratado</p>
                  </div>
                </div>

                <div className="bg-accent/10 rounded-lg p-4 border-l-4 border-accent">
                  <h4 className="font-bold text-secondary mb-2">2. Contenido Faltante</h4>
                  <p className="text-sm text-gray-700 mb-3">Los textos deben crearse desde cero con fotos y especificaciones.</p>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p><strong>✓ Acción:</strong> Solicitar materiales al cliente</p>
                    <p><strong>✓ Acción:</strong> Crear los contenidos necesarios</p>
                    <p><strong>✓ Acción:</strong> Desarrollar una guía de estilo visual</p>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-lg p-4 border-l-4 border-secondary">
                  <h4 className="font-bold text-secondary mb-2">3. Gestión de Contenido</h4>
                  <p className="text-sm text-gray-700 mb-3">El proveedor maneja las actualizaciones (modelo de servicio).</p>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p><strong>✓ Acción:</strong> Definir proceso de actualización</p>
                    <p><strong>✓ Acción:</strong> Establecer términos de mantenimiento</p>
                    <p><strong>✓ Acción:</strong> Clarificar frecuencia de cambios</p>
                  </div>
                </div>

                <div className="bg-neutral-100 rounded-lg p-4 border-l-4 border-neutral-500">
                  <h4 className="font-bold text-secondary mb-2">4. Integración de Plataformas</h4>
                  <p className="text-sm text-gray-700 mb-3">Múltiples redes sociales requieren coordinación continua.</p>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p><strong>✓ Acción:</strong> Automatizar publicaciones siempre que sea posible</p>
                    <p><strong>✓ Acción:</strong> Crear calendario de publicaciones</p>
                    <p><strong>✓ Acción:</strong> Integrar Meta Pixel en su proyecto</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recomendaciones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaLightbulb className="text-primary text-2xl" />
                <h3 className="text-2xl font-bold text-gray-900">Recomendaciones Estratégicas</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'Elegir un paquete adecuado',
                    desc: 'Mejor relación calidad-precio con máximo impacto profesional',
                  },
                  {
                    title: 'Priorizar Catálogo de Productos y Servicios',
                    desc: 'Enfocarse primero en presentar tus 10 servicios de forma profesional',
                  },
                  {
                    title: 'Invertir en Contenido',
                    desc: 'Fotografías de proyectos y descripciones claras son cruciales',
                  },
                  {
                    title: 'Optimizar el contenido para posicionamiento en internet (SEO)',
                    desc: 'Fundamental para posicionarte en Google y captar clientes',
                  },
                  {
                    title: 'WhatsApp',
                    desc: 'Canal principal de comunicación con tus clientes potenciales',
                  },
                  {
                    title: 'Analizar Métricas',
                    desc: 'Monitorear tráfico y conversiones para ajustar estrategias',
                  },
                  {
                    title: 'Actualizar Regularmente',
                    desc: 'Mantener el sitio fresco con nuevos contenidos y ofertas',
                  },
                  {
                    title: 'Crear Blog',
                    desc: 'Artículos sobre construcción mejoran tu visibilidad y confianza',
                  },
                ].map((item) => (
                  <div key={`rec-${item.title}`} className="bg-gradient-to-r from-primary/10 to-transparent rounded-lg p-3 flex gap-3">
                    <div className="text-primary font-bold text-lg">✓</div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}
