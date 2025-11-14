'use client'

import { motion } from 'framer-motion'
import { FaStar, FaCheckCircle } from 'react-icons/fa'

export default function FortalezasDelProyecto() {
  return (
    <section id="fortalezas" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Fortalezas de crecimiento de tu negocio
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: '🏢',
                title: 'Empresa Consolidada',
                desc: '15 años de experiencia en el mercado con trayectoria comprobada',
              },
              {
                icon: '🎯',
                title: 'Objetivos Claros',
                desc: 'Metas comerciales bien definidas y enfoque estratégico claro',
              },
              {
                icon: '💼',
                title: 'Cliente Comprometido',
                desc: 'Puntuación 5/5 en cuestionario - altamente motivado',
              },
              {
                icon: '👥',
                title: 'Público Objetivo Amplio',
                desc: 'Alcance de 18-70 años, ambos géneros, todos los niveles',
              },
              {
                icon: '🎨',
                title: 'Identidad Visual Definida',
                desc: 'Colores corporativos (rojo y negro) y logo ya diseñado',
              },
              {
                icon: '💪',
                title: 'Propuesta de Valor Diferenciada',
                desc: 'Excelencia, mejores precios y calidad garantizada',
              },
              {
                icon: '📍',
                title: 'Negocio Local Estratégico',
                desc: 'Ubicación establecida en zona comercial importante',
              },
              {
                icon: '🌍',
                title: 'Presencia Digital Necesaria',
                desc: 'Mercado listo para transformación digital',
              },
              {
                icon: '🔄',
                title: 'Modelo de Negocio Viable',
                desc: 'Gestión de contenidos por proveedor = máxima profesionalidad',
              },
              {
                icon: '📈',
                title: 'Potencial de Crecimiento',
                desc: 'Escalabilidad hacia tienda online y marketing digital',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-l-4 border-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-700">{item.desc}</p>
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
            className="bg-gradient-to-r from-primary to-primary-dark text-white p-12 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
            <h3 className="text-3xl font-bold">Por qué este proyecto tiene éxito asegurado</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaCheckCircle /> Cliente Ideal
                </h4>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span>Empresa establecida en el mercado (15 años de experiencia)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span>Tiene una visión clara de crecimiento</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span>Impacto en la economía cubana</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span>Dispuesto a invertir en transformación digital</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaCheckCircle /> Ventajas Competitivas
                </h4>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span>El Proveedor DGTECNOVA gestiona todo (máxima seguridad)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span> El proveedor ofrece actualizaciones garantizadas y profesionales</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span>El cliente se enfoca en su negocio y nosotros en la tecnología</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">→</span>
                    <span>Presencia de soporte 24/7 según paquete</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/30">
              <p className="text-lg font-semibold">
                🎯 <strong>Resultado Final:</strong> Un sitio web profesional, seguro, actualizado y orientado a generar ventas desde el día uno.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
