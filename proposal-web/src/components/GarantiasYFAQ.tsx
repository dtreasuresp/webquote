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
            🛡️ Garantías y Responsabilidades
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Proveedor Responsable */}
            <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-200">
              <h3 className="text-2xl font-bold mb-6 text-green-900 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                EL PROVEEDOR GARANTIZA:
              </h3>
              <ul className="space-y-3">
                {[
                  'Tiempo de carga < 3 segundos',
                  'Uptime 99.9%',
                  'SSL/HTTPS gratis',
                  'Backups diarios (automáticos)',
                  'Actualizaciones de seguridad',
                  'Soporte técnico',
                  'Acceso administrativo seguro',
                  'Cambios realizados puntualmente',
                  'Diseño profesional de tu sitio',
                  'Hosting, dominio y correo funcionando',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cliente Responsable */}
            <div className="bg-yellow-50 p-8 rounded-2xl border-2 border-yellow-200">
              <h3 className="text-2xl font-bold mb-6 text-yellow-900 flex items-center gap-2">
                <FaTimesCircle className="text-yellow-600" />
                EL CLIENTE ES RESPONSABLE DE:
              </h3>
              <ul className="space-y-3">
                {[
                  'Pagar las inversiones acordadas a tiempo',
                  'Proporcionar contenidos/fotos cuando se solicita',
                  'Aprobar diseños y funcionalidades puntualmente',
                  'Usar el sitio legalmente',
                  'Notificar si hay problemas',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <FaCheckCircle className="text-yellow-600 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Políticas de Cancelación */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-2xl border-2 border-red-300 mb-16">
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
                  title: 'Luego del segundo mes',
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-300 mb-16">
            <h3 className="text-2xl font-bold mb-6 text-blue-900">
              ⚖️ SI EL PROVEEDOR INCUMPLE
            </h3>
            <div className="space-y-3">
              {[
                'Procede a compensación al cliente por inactividad (descuento de hasta un 40% en el próximo mes)',
                'Corrección inmediata sin costo adicional',
                'Reembolso parcial según el impacto',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-800">
                  <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
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
            ❓ Preguntas Frecuentes
          </h2>

          <div className="space-y-4 max-w-3xl mx-auto">
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
            <div className="px-6 py-4 bg-white text-gray-700 space-y-2">
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
    question: '¿El cliente tendrá acceso al panel administrativo?',
    answer: 'NO. Solo el proveedor (DGTecnova) tiene acceso. El cliente solo ve el sitio público. No obstante, puede acceder con permisos limitados si lo acuerdas.',
  },
  {
    question: '¿Cómo solicita cambios el cliente?',
    answer: 'Por email o WhatsApp. Describe lo que quiere y nosotros lo realizamos. El horario de atención es de lunes a viernes, 9am-6pm, pero puede variar en dependencia del paquete de servicios contratado.',
  },
  {
    question: '¿Cuánto tarda en realizarse un cambio?',
    answer: [
      'Depende del paquete contratado:',
      '• Constructor: 24 horas',
      '• Obra Maestra: 12 horas',
      '• Imperio Digital: 6 horas',
    ],
  },
  {
    question: '¿Qué pasa si el cliente quiere más cambios de los incluidos?',
    answer: [
      'Se debe valorar el impacto y complejidad de los cambios solicitados:',
      '• Constructor: Cambios extras = $10 cada uno',
      '• Obra Maestra: Ilimitados',
      '• Imperio Digital: Ilimitados',
    ],
  },
  {
    question: '¿El cliente puede vender productos directamente en el sitio?',
    answer: 'El paquete Constructor es solo un catálogo. Los paquetes Obra Maestra e Imperio Digital incluyen un sistema de reservas o cotizaciones online.',
  },
  {
    question: '¿El sitio funcionará en móvil?',
    answer: '100% garantizado. Es optimizado para que se vea perfecto en cualquier dispositivo (teléfono, tablet, computadora).',
  },
  {
    question: '¿Y si sube el tráfico? ¿El sitio se va a poner lento?',
    answer: 'No. Nuestra infraestructura escala automáticamente. Aunque tengas 100,000 visitantes/mes, seguirá rápido.',
  },
  {
    question: '¿Qué pasa con la información? ¿Es segura?',
    answer: 'Totalmente. La plataforma utiliza encriptación SSL 256-bit. Los datos son sagrados.',
  },
  {
    question: '¿El cliente puede transferir el sitio después?',
    answer: 'Sí, pero NO sin nuestro consentimiento, teniendo en cuenta que se deben realizar acciones de traspasos de accesos a las plataformas. Se acuerda por separado.',
  },
  {
    question: '¿Incluye posicionamiento en Google (SEO)?',
    answer: 'SEO técnico sí. Posicionamiento orgánico toma 3-6 meses.',
  },
  {
    question: '¿Qué pasa si el cliente no paga la gestión mensual?',
    answer: 'El sitio continúa funcionando, pero NO habrán actualizaciones. Se acuerda por contrato.',
  },
  {
    question: '¿Cuánto tiempo lleva ver los resultados?',
    answer: 'El sitio estará listo en 4-8 semanas, dependiendo del paquete contratado. Los primeros contactos pueden llegar a los 2-3 días del lanzamiento, aunque el posicionamiento en Google puede demorar 2-3 meses.',
  },
  {
    question: '¿Incluye publicidad digital/Facebook Ads?',
    answer: 'No, eso es servicio adicional que el cliente puede contratar.',
  },
  {
    question: '¿Necesito conocimientos técnicos?',
    answer: 'NO. El proveedor hace TODO lo técnico. El cliente sólo dice qué cambios quiere.',
  },
]
