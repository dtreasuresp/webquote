'use client'

import { motion } from 'framer-motion'
import { FaStar } from 'react-icons/fa'

export default function Paquetes() {
  return (
    <section id="paquetes" className="py-20 px-4 bg-gradient-to-br from-secondary via-secondary-light to-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            ¿Qué ofrecemos?
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
            DGTECNOVA te presenta los siguientes paquetes de Servicios
          </h2>
          <p className="text-center text-xl text-neutral-200 mb-12">
            Hemos diseñado tres opciones que se ajustan a diferentes necesidades y presupuestos
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paquete Constructor */}
            <PaqueteCard
              href="/paquete/constructor"
              icon="🥉"
              nombre="CONSTRUCTOR"
              subtitulo="INVERSIÓN: $208 USD"
              invertidos={200}
              description="Empresas que buscan presencia digital confiable, simple pero efectiva."
              features={[
                { category: 'Hosting (luego del 4to mes)', items: ['$28 USD/mes ($252 USD/9 meses)'] },
                { category: 'Mailbox (luego del 4to mes)', items: ['$4 USD/mes ($36 USD/9 meses)'] },
                { category: 'Dominio (luego del 4to mes)', items: ['$18 USD/mes ($108 USD/6 meses)'] },
              ]}
              pages={8}
              timelineWeeks={4}
              recomendado={false}
            />

            {/* Paquete Obra Maestra */}
            <PaqueteCard
              href="/paquete/obra-maestra"
              icon="🥈"
              nombre="OBRA MAESTRA"
              subtitulo="INVERSIÓN: $257 USD"
              invertidos={257}
              description="Empresas que desean máximo impacto digital, profesionalismo y estar listas para captar clientes desde el primer día."
              features={[
                { category: 'Hosting (luego del 4to mes)', items: ['$35 USD/mes ($315/9 meses)'] },
                { category: 'Mailbox (luego del 4to mes)', items: ['$4 USD/mes ($36/9 meses)'] },
                { category: 'Dominio (luego del 4to mes)', items: ['$18 USD/mes ($108 USD/6 meses)'] },
              ]}
              pages={'8+'}
              timelineWeeks={6}
              recomendado={true}
            />

            {/* Paquete Premium */}
            <PaqueteCard
              href="/paquete/imperio-digital"
              icon="🥇"
              nombre="IMPERIO DIGITAL"
              subtitulo="INVERSIÓN: $300 USD"
              invertidos={300}
              description="Empresas que desean ser referentes en su sector con presencia digital de clase mundial."
              features={[
                { category: 'Hosting (luego del 4to mes)', items: ['$40 USD/mes ($360 USD/9 meses)'] },
                { category: 'Mailbox (luego del 4to mes)', items: ['$4 USD/mes ($36 USD/9 meses)'] },
                { category: 'Dominio (luego del 4to mes)', items: ['$18 USD/mes ($108 USD/6 meses)'] },
              ]}
              pages={'8+'}
              timelineWeeks={8}
              recomendado={false}
            />
          </div>

          {/* Lo que siempre está incluido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-primary via-primary-dark to-secondary text-white p-12 rounded-2xl shadow-2xl border-2 border-accent"
          >
            <h3 className="text-3xl font-bold mb-8">🎁 ¿QUÉ ESTÁ INCLUIDO SIEMPRE?</h3>
            <p className="text-xl mb-8">
              Independientemente del paquete que elijas, todos incluyen 3 meses gratis de Hosting, Mailbox y Dominio, 1 mes gratis de gestión de contenidos y también ofrecemos actualizaciones planificadas libres de costo. Además de lo anterior SIEMPRE recibes:
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: '🔒 SEGURIDAD',
                  items: [
                    'Certificado SSL (candado 🔒 en el navegador)',
                    'Protección contra ataques',
                    'Backups automáticos diarios',
                    'Actualización de seguridad automática',
                  ]
                },
                {
                  title: '⚡ RENDIMIENTO',
                  items: [
                    'Velocidad de carga optimizada',
                    'Funciona perfectamente en móvil',
                    'Servidor rápido y confiable',
                    'Disponibilidad 99.9%',
                  ]
                },
                {
                  title: '📈 POSICIONAMIENTO',
                  items: [
                    'Optimizado para aparecer en Google',
                    'Google Analytics configurado',
                    'Reportes de tráfico mensuales',
                    'Sugerencias de mejora continua',
                  ]
                },
                {
                  title: '🎓 CAPACITACIÓN',
                  items: [
                    '2-6 horas según paquete',
                    'Manual paso a paso',
                    'Videos tutoriales',
                    'Soporte vía email/WhatsApp',
                  ]
                },
              ].map((section, index) => (
                <div key={index}>
                  <h4 className="text-2xl font-bold mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-accent mt-1 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

interface Feature {
  category: string
  items: string[]
}

function PaqueteCard({
  href,
  icon,
  nombre,
  subtitulo,
  invertidos,
  description,
  features,
  pages,
  timelineWeeks,
  recomendado,
}: {
  href: string
  icon: string
  nombre: string
  subtitulo: string
  invertidos: number
  description: string
  features: Feature[]
  pages: number | string
  timelineWeeks: number
  recomendado: boolean
}) {
  // Esquema de colores jerárquico según paquete
  const getCardStyles = () => {
    if (recomendado) {
      return {
        container: 'bg-white border-4 border-accent shadow-2xl shadow-accent/50 scale-105',
        badge: 'bg-gradient-to-r from-accent to-accent-dark',
        priceBox: 'bg-gradient-to-br from-accent/10 to-accent-light/20 border-l-4 border-accent',
        priceText: 'text-accent-dark',
        button: 'bg-gradient-to-r from-accent to-accent-dark text-white hover:from-accent-dark hover:to-accent shadow-lg',
      }
    }
    if (nombre === 'CONSTRUCTOR') {
      return {
        container: 'bg-white border-2 border-primary shadow-lg',
        badge: '',
        priceBox: 'bg-gradient-to-br from-primary/10 to-primary-light/20 border-l-4 border-primary',
        priceText: 'text-primary',
        button: 'bg-primary text-white hover:bg-primary-dark',
      }
    }
    // Imperio Digital
    return {
      container: 'bg-white border-2 border-secondary shadow-lg',
      badge: '',
      priceBox: 'bg-gradient-to-br from-secondary/10 to-neutral-200 border-l-4 border-secondary',
      priceText: 'text-secondary',
      button: 'bg-secondary text-white hover:bg-secondary-light',
    }
  }

  const styles = getCardStyles()

  // Etiqueta profesional según el nombre del paquete
  let nivelProfesional: string
  if (nombre === 'CONSTRUCTOR') {
    nivelProfesional = 'BÁSICO'
  } else if (nombre === 'OBRA MAESTRA') {
    nivelProfesional = 'PROFESIONAL'
  } else {
    nivelProfesional = 'PREMIUM'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className={`relative rounded-2xl overflow-hidden transition-all ${styles.container}`}
    >
      {recomendado && (
        <div className={`absolute top-0 left-0 right-0 ${styles.badge} text-white py-2 text-center font-bold flex items-center justify-center gap-2 z-10`}>
          <FaStar /> ⭐ RECOMENDADO
        </div>
      )}

      <div className={`p-8 ${recomendado ? 'pt-16' : 'pt-8'} h-full flex flex-col`}>
        <div className="text-center mb-6">
          <span className="text-4xl">{icon}</span>
          <p className="mt-2 text-xs font-semibold tracking-wide text-neutral-500">{nivelProfesional}</p>
          <h3 className="text-2xl font-bold text-secondary mt-2">{nombre}</h3>
          <p className={`${styles.priceText} font-bold text-lg`}>{subtitulo}</p>
        </div>

        <p className="text-neutral-700 text-center mb-6 flex-grow">{description}</p>

        <div className={`${styles.priceBox} p-4 rounded-lg mb-6`}>
          <p className="text-sm text-neutral-600">Pago Inicial</p>
          <p className={`text-3xl font-bold ${styles.priceText}`}>${invertidos} USD</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 flex-grow">
          {features.map((feature, index) => (
            <div key={index} className="text-sm">
              <p className="font-semibold text-secondary text-xs leading-tight">{feature.category}</p>
              <p className="text-neutral-600 text-xs">{feature.items[0]}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-200">
          <div className="text-center">
            <p className={`text-2xl font-bold ${styles.priceText}`}>{pages}</p>
            <p className="text-xs text-neutral-600">Páginas</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${styles.priceText}`}>{timelineWeeks}</p>
            <p className="text-xs text-neutral-600">Semanas</p>
          </div>
        </div>

        <a
          href={href}
          className={`mt-6 py-3 px-4 rounded-lg font-bold text-center transition-all ${styles.button}`}
        >
          Ver Detalles
        </a>
      </div>
    </motion.div>
  )
}
