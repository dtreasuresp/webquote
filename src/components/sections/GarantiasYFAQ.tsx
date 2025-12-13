'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaChevronDown, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { 
  fluentSlideUp,
  fluentStaggerContainer,
  fluentStaggerItem
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

export default function GarantiasYFAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <>
      {/* Sección Garantías */}
      <FluentSection
        id="garantias"
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
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-success to-emerald-600 rounded-2xl mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={spring.fluent}
            >
              <FaShieldAlt className="text-white" size={24} />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              Garantías y Responsabilidades
            </h2>
            <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
              Compromisos claros de ambas partes
            </p>
          </motion.div>

          {/* Grid de Garantías */}
          <FluentRevealGroup className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Proveedor Responsable */}
            <FluentRevealItem>
              <FluentGlass
                variant="normal"
                className="rounded-2xl overflow-hidden h-full border border-light-success/30"
              >
                <div className="bg-gradient-to-r from-light-success/10 to-emerald-500/10 px-6 py-4 border-b border-light-success/20">
                  <h3 className="text-sm font-semibold text-light-success flex items-center gap-2">
                    <FaCheckCircle size={14} />
                    EL PROVEEDOR GARANTIZA
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2.5">
                    {[
                      'Mantener el 99.9% de tiempo activo',
                      'Seguridad SSL/HTTPS garantizada y gratis',
                      'Backups automáticos',
                      'Actualizaciones de seguridad',
                      'Soporte técnico',
                      'Cambios realizados puntualmente',
                      'Diseño profesional de tu sitio',
                      'Hosting, dominio y correo funcionando',
                      'Cumplimiento de normativas legales',
                      'Protección de datos y privacidad',
                      'Soporte post-lanzamiento',
                      'Período de garantía definido (30 a 90 días según paquete)',
                    ].map((item, index) => (
                      <motion.li 
                        key={`proveedor-${item.slice(0, 30)}-${index}`} 
                        className="flex items-start gap-3 text-sm text-light-text"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <FaCheckCircle className="text-light-success mt-0.5 flex-shrink-0" size={12} />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FluentGlass>
            </FluentRevealItem>

            {/* Cliente Responsable */}
            <FluentRevealItem>
              <FluentGlass
                variant="normal"
                className="rounded-2xl overflow-hidden h-full"
              >
                <div className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary px-6 py-4 border-b border-light-border/50">
                  <h3 className="text-sm font-semibold text-light-text flex items-center gap-2">
                    <FaTimesCircle size={14} className="text-light-text-secondary" />
                    EL CLIENTE ES RESPONSABLE DE
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2.5">
                    {[
                      'Pagar las inversiones acordadas a tiempo',
                      'Proporcionar contenidos/fotos necesarios',
                      'Aprobar diseños y funcionalidades',
                      'Usar el sitio legalmente',
                      'Notificar si hay problemas',
                      'Solicitar cambios dentro del alcance acordado',
                      'Mantener la confidencialidad de accesos',
                      'No transferir el sitio sin nuestro consentimiento', 
                      'Cumplir con las políticas de uso',
                      'Respetar los términos de servicio',
                      'Seguir las recomendaciones de seguridad',
                    ].map((item, index) => (
                      <motion.li 
                        key={`cliente-${item.slice(0, 30)}-${index}`} 
                        className="flex items-start gap-3 text-sm text-light-text"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <span className="text-light-text-muted mt-0.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FluentGlass>
            </FluentRevealItem>
          </FluentRevealGroup>

          {/* Políticas de Cancelación */}
          <FluentReveal className="mb-6">
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden border border-light-warning/30"
            >
              <div className="bg-gradient-to-r from-light-warning/10 to-amber-500/10 px-6 py-4 border-b border-light-warning/20">
                <h3 className="text-sm font-semibold text-light-warning">
                  📋 POLÍTICAS DE CANCELACIÓN
                </h3>
              </div>
              <div className="p-6">
                <FluentRevealGroup className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Si el cliente cancela después del lanzamiento',
                    detail: 'Se devuelve hasta el 50% de la inversión inicial (solo desarrollo)',
                  },
                  {
                    title: 'Luego del segundo mes de lanzamiento',
                    detail: 'Reembolso de 30% de la inversión inicial (solo desarrollo)',
                  },
                  {
                    title: 'Después del período de garantía',
                    detail: 'Sin derecho a reembolso',
                  },
                ].map((policy, index) => (
                  <FluentRevealItem key={`policy-${policy.title.slice(0, 30)}-${index}`}>
                    <motion.div 
                      className="p-4 bg-gradient-to-br from-light-bg-secondary to-white rounded-xl border-l-4 border-light-warning/50 h-full"
                      whileHover={{ x: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      transition={spring.fluent}
                    >
                      <p className="text-sm font-medium text-light-text mb-1">{policy.title}</p>
                      <p className="text-xs text-light-text-secondary">{policy.detail}</p>
                    </motion.div>
                  </FluentRevealItem>
                ))}
              </FluentRevealGroup>
            </div>
          </FluentGlass>
        </FluentReveal>

          {/* Si Incumple el Proveedor */}
          <FluentReveal>
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden border border-light-accent/30"
            >
              <div className="bg-gradient-to-r from-light-accent/10 to-blue-500/10 px-6 py-4 border-b border-light-accent/20">
                <h3 className="text-sm font-semibold text-light-accent">
                  ⚖️ SI EL PROVEEDOR INCUMPLE
                </h3>
              </div>
              <div className="p-6">
                <FluentRevealGroup className="grid sm:grid-cols-2 gap-3">
                {[
                  'Procede a compensación al cliente por inactividad (descuento de hasta un 40% en el próximo mes)',
                  'Corrección inmediata sin costo adicional',
                  'Reembolso parcial según el impacto',
                  'Revisión de los términos del contrato',
                  'Terminación del contrato si persisten incumplimientos',
                  'Notificación formal por escrito',
                  'Plazo de 15 días para subsanar el incumplimiento',
                  'Acceso a soporte prioritario',
                  'Informe detallado de acciones correctivas',
                  'Garantía extendida en caso de fallos recurrentes',
                  'Suspensión temporal del servicio si es necesario',
                ].map((item, index) => (
                  <FluentRevealItem key={`incumple-${item.slice(0, 30)}-${index}`}>
                    <div className="flex items-start gap-3 text-sm text-light-text p-3 rounded-lg hover:bg-light-bg-secondary/50 transition-colors">
                      <span className="text-light-accent mt-0.5 flex-shrink-0">→</span>
                      <span>{item}</span>
                    </div>
                  </FluentRevealItem>
                ))}
              </FluentRevealGroup>
            </div>
          </FluentGlass>
        </FluentReveal>
        </div>
      </FluentSection>

      {/* Sección FAQ */}
      <FluentSection
        id="faq"
        animation="stagger"
        paddingY="lg"
        className="bg-gradient-to-b from-white to-light-bg"
      >
        <div className="max-w-4xl mx-auto">
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
              <FaQuestionCircle className="text-white" size={24} />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-light-text-secondary">
              Respuestas a las dudas más comunes
            </p>
          </motion.div>

          {/* FAQ Items */}
          <motion.div 
            className="rounded-2xl border border-light-border/50 overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm"
            variants={fluentStaggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewport.default}
          >
            {faqData.map((faq, index) => (
              <FAQItem
                key={`faq-${faq.question.slice(0, 30)}-${index}`}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                isLast={index === faqData.length - 1}
              />
            ))}
          </motion.div>
        </div>
      </FluentSection>
    </>
  )
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  isLast,
}: Readonly<{
  question: string
  answer: string | string[]
  isOpen: boolean
  onToggle: () => void
  isLast: boolean
}>) {
  return (
    <motion.div
      variants={fluentStaggerItem}
      className={isLast ? '' : 'border-b border-light-border/50'}
    >
      <motion.button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
          isOpen ? 'bg-light-bg-secondary' : 'hover:bg-light-bg-tertiary'
        }`}
        whileHover={{ backgroundColor: isOpen ? undefined : 'rgba(0,0,0,0.02)' }}
        transition={spring.fluent}
      >
        <span className="font-medium text-sm text-light-text pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="flex-shrink-0"
        >
          <FaChevronDown className="text-light-text-muted" size={12} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
          >
            <div className="px-6 py-4 bg-light-bg-secondary text-sm text-light-text-secondary leading-relaxed border-t border-light-border/30">
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
    </motion.div>
  )
}

const faqData = [
  {
    question: '¿Puedo tener acceso al panel administrativo?',
    answer: 'No. Solo el proveedor (DGTecnova) tiene acceso. El cliente ve el sitio público. No obstante, puedes acceder con permisos limitados si lo acuerdas.',
  },
  {
    question: '¿Cómo solicito cambios?',
    answer: 'Por email, WhatsApp o una llamada. Describes lo que quieres y nosotros lo realizamos. El horario de atención es de lunes a viernes, 9am-6pm.',
  },
  {
    question: '¿Cuánto tarda en realizarse un cambio?',
    answer: [
      'Depende del paquete contratado:',
      '• Constructor: 12 horas',
      '• Obra Maestra: 8 horas',
      '• Imperio Digital: 2 horas',
    ],
  },
  {
    question: '¿Qué pasa si quiero más cambios de los incluidos?',
    answer: [
      'Se debe valorar el impacto y complejidad de los cambios solicitados:',
      '• Constructor: Cambios extras = $1.5 USD cada uno',
      '• Obra Maestra: Ilimitados',
      '• Imperio Digital: Ilimitados',
    ],
  },
  {
    question: '¿Puedo vender productos directamente en el sitio?',
    answer: 'No. El paquete Constructor es solo un catálogo. Los paquetes Obra Maestra e Imperio Digital incluyen un sistema de reservas online.',
  },
  {
    question: '¿El sitio funcionará en móvil?',
    answer: '100% garantizado. Será optimizado para que se vea perfecto en cualquier dispositivo (teléfono, tablet o computadora).',
  },
  {
    question: '¿Y si sube el tráfico? ¿El sitio se va a poner lento?',
    answer: 'No. La infraestructura a emplear escala automáticamente. Aunque tengas 100,000 visitantes/mes, seguirá rápido.',
  },
  {
    question: '¿Qué pasa con la información? ¿Es segura?',
    answer: 'Totalmente. La plataforma a emplear utiliza encriptación SSL 256-bit. Los datos son sagrados.',
  },
  {
    question: '¿Puedo transferir el sitio después?',
    answer: 'Sí, pero con nuestro consentimiento, teniendo en cuenta que se deben realizar acciones de traspasos de accesos a las plataformas.',
  },
  {
    question: '¿Incluye posicionamiento en Google?',
    answer: 'Si, se incluye el posicionamiento técnico, pero el posicionamiento orgánico toma de 3 a 6 meses.',
  },
  {
    question: '¿Qué pasa si no pago la gestión mensual?',
    answer: 'El sitio continúa funcionando, pero no habrá actualizaciones.',
  },
  {
    question: '¿Cuánto tiempo lleva ver los resultados?',
    answer: 'El sitio estará listo entre 4-8 semanas, dependiendo del paquete contratado. Los primeros contactos pueden llegar a los 2-3 días del lanzamiento, aunque el posicionamiento en Google puede demorar 2-3 meses.',
  },
  {
    question: '¿Incluye publicidad digital?',
    answer: 'No, eso es servicio adicional que puedes contratar.',
  },
  {
    question: '¿Necesito conocimientos técnicos?',
    answer: 'No. Nosotros hacemos todo el trabajo técnico. Tú solo te enfocas en tu negocio.',
  },
  {
    question: '¿Puedo agregar más servicios después?',
    answer: [
      'Sí. Podemos incluir servicios adicionales como:',
      '• Publicidad digital',
      '• Diseño gráfico',
      '• Posicionamiento en Redes sociales',
      '• Consultoría estratégica',
      '• Otros servicios digitales (Manual visual, gestión de marca, etc.)',
      '• Desarrollo de aplicaciones móviles',
      '• Elaboración de documentos del negocio',
      'Estos servicios se cotizan por separado y según el paquete contratado se aplican descuentos por fidelidad del cliente.',
    ],
  },
    {
    question: '¿Puedo dejar de pagar después?',
    answer: 'Sí, pero el sitio se desactivará, teniendo en cuenta que las plataformas que se usan para desplegarlo requieren pagos continuos. Pierdes el dominio y el hosting. Si lo retomas, existe el riesgo de perder totalmente el dominio (dirección web de tu sitio) por indisponibilidad, por haber sido comprado por otro cliente global',
  },
]
