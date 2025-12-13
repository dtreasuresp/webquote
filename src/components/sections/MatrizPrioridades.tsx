'use client'

import { motion } from 'framer-motion'
import { FaChartLine } from 'react-icons/fa'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { 
  fluentSlideUp
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

export default function MatrizPrioridades() {
  const prioritySections = [
    {
      level: 'CRÍTICA',
      color: 'danger',
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
      color: 'warning',
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
      color: 'accent',
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
      color: 'success',
      icon: '🟢',
      items: [
        'Calendario de eventos',
        'Sistema de reservas',
        'Comparador avanzado',
      ],
      desc: 'Funcionalidad complementaria y futura',
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'danger': return 'border-light-danger bg-light-danger/5'
      case 'warning': return 'border-light-warning bg-light-warning/5'
      case 'accent': return 'border-light-accent bg-light-accent/5'
      case 'success': return 'border-light-success bg-light-success/5'
      default: return 'border-light-border bg-light-bg-secondary'
    }
  }

  return (
    <FluentSection 
      id="matriz-prioridades" 
      animation="stagger"
      paddingY="lg"
      className="bg-gradient-to-b from-light-bg to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaChartLine className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            Matriz de Prioridades
          </h2>
          <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
            Estrategia de implementación basada en impacto y urgencia
          </p>
        </motion.div>

        {/* Grid de Prioridades */}
        <FluentRevealGroup className="grid md:grid-cols-4 gap-5 mb-6">
          {prioritySections.map((section, idx) => (
            <FluentRevealItem key={`priority-${section.level}-${idx}`}>
              <FluentGlass
                variant="normal"
                className={`rounded-2xl p-5 border-t-4 h-full ${getColorClasses(section.color)}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="text-base font-semibold text-light-text">{section.level}</h3>
                </div>
                <p className="text-xs text-light-text-secondary mb-4 italic">{section.desc}</p>
                <ul className="space-y-2">
                  {section.items.map((item, iidx) => (
                    <li key={`item-${item.slice(0, 20)}-${iidx}`} className="text-sm text-light-text flex gap-2">
                      <span className="text-light-text-muted">•</span> {item}
                    </li>
                  ))}
                </ul>
              </FluentGlass>
            </FluentRevealItem>
          ))}
        </FluentRevealGroup>

        {/* Matriz Visual */}
        <FluentReveal className="mb-6">
          <FluentGlass
            variant="normal"
            className="rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-center text-light-text mb-8">
              Matriz de Impacto vs Esfuerzo
            </h3>

            <FluentRevealGroup className="grid grid-cols-2 gap-2 bg-light-border/30 p-2 rounded-xl">
            {/* Cuadrante 1: Alto impacto, bajo esfuerzo */}
            <FluentRevealItem>
              <motion.div 
                className="bg-light-success/10 p-5 rounded-xl border border-light-success/20 h-full"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                transition={spring.fluent}
              >
                <h4 className="font-semibold text-light-success mb-3">✨ HACER PRIMERO</h4>
                <div className="space-y-2 text-sm text-light-text-secondary">
                  <p>🎯 Catálogo productos</p>
                  <p>📞 WhatsApp integrado</p>
                  <p>📍 Google Maps</p>
                  <p>🔍 Búsqueda básica</p>
                </div>
              </motion.div>
            </FluentRevealItem>

            {/* Cuadrante 2: Alto impacto, alto esfuerzo */}
            <FluentRevealItem>
              <motion.div 
                className="bg-light-accent/10 p-5 rounded-xl border border-light-accent/20 h-full"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                transition={spring.fluent}
              >
                <h4 className="font-semibold text-light-accent mb-3">🚀 PLANIFICAR</h4>
                <div className="space-y-2 text-sm text-light-text-secondary">
                  <p>📸 Galería proyectos</p>
                  <p>✍️ Blog/Contenidos</p>
                  <p>📊 Analytics avanzado</p>
                  <p>🎨 Branding visual</p>
                </div>
              </motion.div>
            </FluentRevealItem>

            {/* Cuadrante 3: Bajo impacto, bajo esfuerzo */}
            <FluentRevealItem>
              <motion.div 
                className="bg-light-warning/10 p-5 rounded-xl border border-light-warning/20 h-full"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                transition={spring.fluent}
              >
                <h4 className="font-semibold text-light-warning mb-3">💡 CONSIDERAR</h4>
                <div className="space-y-2 text-sm text-light-text-secondary">
                  <p>📱 Redes sociales links</p>
                  <p>💬 Sistema comentarios</p>
                  <p>⭐ Calificaciones</p>
                  <p>📧 Newsletter básico</p>
                </div>
              </motion.div>
            </FluentRevealItem>

            {/* Cuadrante 4: Bajo impacto, alto esfuerzo */}
            <FluentRevealItem>
              <motion.div 
                className="bg-light-bg-tertiary p-5 rounded-xl border border-light-border h-full"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                transition={spring.fluent}
              >
                <h4 className="font-semibold text-light-text-muted mb-3">⏸️ ELIMINAR</h4>
                <div className="space-y-2 text-sm text-light-text-muted">
                  <p>🗓️ Calendario eventos</p>
                  <p>🤖 Chatbot IA básico</p>
                  <p>🎬 Video automático</p>
                  <p>🔮 Comparador avanzado</p>
                </div>
              </motion.div>
            </FluentRevealItem>
          </FluentRevealGroup>

          <p className="text-xs text-light-text-muted mt-4 text-center">
            Matriz de priorización basada en impacto de negocio vs complejidad técnica
          </p>
        </FluentGlass>
      </FluentReveal>

        {/* Roadmap de Implementación */}
        <FluentReveal>
          <div className="bg-gradient-to-br from-light-accent to-blue-600 text-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold mb-8">Roadmap de Implementación Recomendado</h3>

            <FluentRevealGroup className="space-y-5">
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
              <FluentRevealItem key={`phase-${phase.phase}-${idx}`}>
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border-l-4 border-white/50"
                  whileHover={{ x: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                  transition={spring.fluent}
                >
                  <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <span className="bg-white text-light-accent w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    {phase.phase}
                  </h4>
                  <ul className="space-y-1.5 ml-8">
                    {phase.items.map((item, iidx) => (
                      <li key={`roadmap-item-${item.slice(0, 20)}-${iidx}`} className="flex gap-2 text-sm text-white/90">
                        <span className="text-white/70">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FluentRevealItem>
            ))}
          </FluentRevealGroup>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-white/80">
              ⏱️ <strong className="text-white">Tiempo total:</strong> 3 meses para implementación completa | 🎯 <strong className="text-white">Objetivo:</strong> Máximo impacto con mínimo esfuerzo inicial
            </p>
          </div>
        </div>
      </FluentReveal>
      </div>
    </FluentSection>
  )
}
