'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaChevronDown } from 'react-icons/fa'

export default function GarantiasYFAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Garantías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="garantias"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Garantías y Responsabilidades
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Proveedor Responsable */}
            <div className="bg-accent/10 p-8 rounded-2xl border-0 border-accent">
              <h3 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                <FaCheckCircle className="text-accent" />
                EL PROVEEDOR GARANTIZA:
              </h3>
              <ul className="space-y-3">
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
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <FaCheckCircle className="text-accent mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cliente Responsable */}
            <div className="bg-neutral-50 p-8 rounded-2xl border-0 border-neutral-300">
              <h3 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                <FaTimesCircle className="text-primary" />
                EL CLIENTE ES RESPONSABLE DE:
              </h3>
              <ul className="space-y-3">
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
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <FaTimesCircle className="text-primary mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Políticas de Cancelación */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-2xl border-0 border-red-300 mb-16">
            <h3 className="text-2xl font-bold mb-6 text-red-900">
              📋 POLÍTICAS DE CANCELACIÓN
            </h3>
            <div className="space-y-4">
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
                <div key={index} className="border-l-4 border-red-500 pl-4">
                  <p className="font-bold text-gray-900">{policy.title}</p>
                  <p className="text-gray-700 text-sm">{policy.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Si Incumple el Proveedor */}
          <div className="bg-gradient-to-r from-secondary/10 to-neutral-100 p-8 rounded-2xl border-0 border-secondary mb-16">
            <h3 className="text-2xl font-bold mb-6 text-secondary">
              ⚖️ SI EL PROVEEDOR INCUMPLE
            </h3>
            <div className="space-y-3">
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
                <div key={index} className="flex items-start gap-3 text-gray-800">
                  <FaCheckCircle className="text-accent mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="faq"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string | string[]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-bold text-lg text-gray-900">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-primary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t-2 border-gray-200"
          >
            <div className="px-6 py-4 bg-white text-gray-800 space-y-2">
              {Array.isArray(answer) ? (
                answer.map((line, index) => (
                  <p key={index}>{line}</p>
                ))
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
