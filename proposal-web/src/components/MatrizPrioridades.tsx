'use client'

import { motion } from 'framer-motion'

export default function MatrizPrioridades() {
  return (
    <section id="matriz-prioridades" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Matriz de Prioridades
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              {
                level: 'CRÍTICA',
                color: 'red',
                icon: '🔴',
                items: [
                  'Catálogo de productos',
                  'Información de contacto/WhatsApp',
                  'Google Maps/Ubicación',
                ],
                desc: 'Objetivo principal del negocio y conversión',
              },
              {
                level: 'ALTA',
                color: 'orange',
                icon: '🟠',
                items: [
                  'Galería de proyectos',
                  'Chat WhatsApp Business',
                  'Formulario de contacto',
                ],
                desc: 'Establece credibilidad y facilita contacto',
              },
              {
                level: 'MEDIA',
                color: 'yellow',
                icon: '🟡',
                items: [
                  'Blog/Noticias',
                  'Redes sociales integradas',
                  'Sistema de comentarios',
                ],
                desc: 'Educación y presencia digital mejorada',
              },
              {
                level: 'BAJA',
                color: 'green',
                icon: '🟢',
                items: [
                  'Calendario de eventos',
                  'Sistema de reservas',
                  'Comparador avanzado',
                ],
                desc: 'Funcionalidad complementaria y futura',
              },
            ].map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-lg p-6 border-t-4 shadow-lg ${
                  section.color === 'red'
                    ? 'border-primary bg-primary/10'
                    : section.color === 'orange'
                    ? 'border-primary bg-primary/10'
                    : section.color === 'yellow'
                    ? 'border-accent bg-accent/10'
                    : 'border-secondary bg-secondary/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">{section.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900">{section.level}</h3>
                </div>
                <p className="text-xs text-gray-600 mb-4 italic">{section.desc}</p>
                <ul className="space-y-2">
                  {section.items.map((item, iidx) => (
                    <li key={iidx} className="text-sm text-gray-700 flex gap-2">
                      <span className="font-bold">•</span> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Matriz Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-2xl p-8 mb-12"
          >
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Matriz de Impacto vs Esfuerzo
            </h3>

            <div className="grid grid-cols-2 gap-1 bg-gray-300 p-1 rounded">
              {/* Cuadrante 1: Alto impacto, bajo esfuerzo */}
              <div className="bg-primary/10 p-6 rounded">
                <h4 className="font-bold text-primary-dark mb-3">✨ HACER PRIMERO</h4>
                <div className="space-y-2 text-sm text-primary-dark">
                  <p>🎯 Catálogo productos</p>
                  <p>📞 WhatsApp integrado</p>
                  <p>📍 Google Maps</p>
                  <p>🔍 Búsqueda básica</p>
                </div>
              </div>

              {/* Cuadrante 2: Alto impacto, alto esfuerzo */}
              <div className="bg-accent/10 p-6 rounded">
                <h4 className="font-bold text-accent-dark mb-3">🚀 PLANIFICAR</h4>
                <div className="space-y-2 text-sm text-accent-dark">
                  <p>📸 Galería proyectos</p>
                  <p>✍️ Blog/Contenidos</p>
                  <p>📊 Analytics avanzado</p>
                  <p>🎨 Branding visual</p>
                </div>
              </div>

              {/* Cuadrante 3: Bajo impacto, bajo esfuerzo */}
              <div className="bg-secondary/10 p-6 rounded">
                <h4 className="font-bold text-secondary mb-3">💡 CONSIDERAR</h4>
                <div className="space-y-2 text-sm text-secondary">
                  <p>📱 Redes sociales links</p>
                  <p>💬 Sistema comentarios</p>
                  <p>⭐ Calificaciones</p>
                  <p>📧 Newsletter básico</p>
                </div>
              </div>

              {/* Cuadrante 4: Bajo impacto, alto esfuerzo */}
              <div className="bg-neutral-100 p-6 rounded">
                <h4 className="font-bold text-neutral-700 mb-3">❌ ELIMINAR</h4>
                <div className="space-y-2 text-sm text-neutral-700">
                  <p>🗓️ Calendario eventos</p>
                  <p>🤖 Chatbot IA básico</p>
                  <p>🎬 Video automático</p>
                  <p>🔮 Comparador avanzado</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-4 text-center">
              Matriz de priorización basada en impacto de negocio vs complejidad técnica
            </p>
          </motion.div>

          {/* Roadmap de Implementación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-8">Roadmap de Implementación Recomendado</h3>

            <div className="space-y-6">
              {[
                {
                  phase: 'FASE 1: MVP (Semanas 1-2)',
                  items: [
                    'Catálogo de 10 productos completo',
                    'WhatsApp Business integrado',
                    'Google Maps con ubicación',
                    'Formulario de contacto',
                  ],
                },
                {
                  phase: 'FASE 2: Credibilidad (Semanas 3-4)',
                  items: [
                    'Galería de proyectos (15+ fotos)',
                    'Sistema de calificaciones',
                    'Blog con 3-5 artículos iniciales',
                    'Redes sociales integradas',
                  ],
                },
                {
                  phase: 'FASE 3: Marketing (Mes 2)',
                  items: [
                    'Meta Pixel configurado',
                    'Google Analytics avanzado',
                    'Newsletter automático',
                    'Optimización SEO completa',
                  ],
                },
                {
                  phase: 'FASE 4: Escalabilidad (Mes 3+)',
                  items: [
                    'Sistema de reservas online',
                    'Comparador de servicios',
                    'Chat en vivo (chatbot)',
                    'E-commerce básico (opcional)',
                  ],
                },
              ].map((phase, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-l-4 border-accent">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="bg-accent text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    {phase.phase}
                  </h4>
                  <ul className="space-y-2 ml-8">
                    {phase.items.map((item, iidx) => (
                      <li key={iidx} className="flex gap-2 text-sm">
                        <span className="text-accent">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/30">
              <p className="text-sm">
                ⏱️ <strong>Tiempo total:</strong> 3 meses para implementación completa | 🎯 <strong>Objetivo:</strong> Máximo impacto con mínimo esfuerzo inicial
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
