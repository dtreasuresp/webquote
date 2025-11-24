'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown } from 'react-icons/fa'

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 px-4 bg-gradient-to-br from-secondary via-secondary-light to-secondary-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={`faq-${faq.question}`}
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
  readonly question: string
  readonly answer: string | string[]
  readonly isOpen: boolean
  readonly onToggle: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-lg overflow-hidden hover:border-primary/50 transition-all"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <span className="font-bold text-lg text-white">{question}</span>
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
            className="border-t-2 border-white/20"
          >
            <div className="px-6 py-4 bg-white/5 text-gray-100 space-y-2">
              {Array.isArray(answer) ? (
                answer.map((line) => (
                  <p key={`answer-${line}`}>{line}</p>
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
    question: '¿Qué es SEO?',
    answer: 'SEO (Search Engine Optimization) es el proceso de optimizar un sitio web para mejorar su visibilidad en los motores de búsqueda como Google. Esto incluye aspectos técnicos, de contenido y de experiencia del usuario para atraer tráfico orgánico de calidad.',
  },  
  {
    question: '¿Qué es Meta Pixel?',
    answer: 'Meta Pixel es una herramienta de análisis proporcionada por Meta (antes Facebook) que permite rastrear las interacciones de los usuarios en un sitio web. Ayuda a medir la efectividad de las campañas publicitarias y a optimizar la orientación de anuncios en plataformas de Meta.',
  },  
  
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
