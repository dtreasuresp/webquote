'use client'

import { motion } from 'framer-motion'
import { FaStar } from 'react-icons/fa'

export default function Paquetes() {
  return (
    <section id="paquetes" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            📦 Propuesta de 3 Paquetes
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12">
            Hemos diseñado tres opciones que se ajustan a diferentes necesidades y presupuestos
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paquete Constructor */}
            <PaqueteCard
              icon="🥉"
              nombre="CONSTRUCTOR"
              subtitulo="INVERSIÓN: $208 USD"
              invertidos={208}
              description="Empresas que buscan presencia digital confiable, simple pero efectiva."
              features={[
                { category: 'Hosting (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Hosting (luego 3 meses)', items: ['$28 USD/mes ($252 USD/9 meses)'] },
                { category: 'Mailbox (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Mailbox (luego 3 meses)', items: ['$4 USD/mes ($36 USD/9 meses)'] },
                { category: 'Dominio (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Dominio (luego 3 meses)', items: ['$18 USD/mes ($162 USD/9 meses)'] },
              ]}
              pages={8}
              timelineWeeks={4}
              recomendado={false}
            />

            {/* Paquete Obra Maestra */}
            <PaqueteCard
              icon="🥈"
              nombre="OBRA MAESTRA"
              subtitulo="INVERSIÓN: $257 USD"
              invertidos={257}
              description="Empresas que desean máximo impacto digital, profesionalismo y estar listas para captar clientes desde el primer día."
              features={[
                { category: 'Hosting (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Hosting (luego 3 meses)', items: ['$35 USD/mes ($315/9 meses)'] },
                { category: 'Mailbox (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Mailbox (luego 3 meses)', items: ['$4 USD/mes ($36/9 meses)'] },
                { category: 'Dominio (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Dominio (luego 3 meses)', items: ['$18 USD/mes ($162/9 meses)'] },
              ]}
              pages={8}
              timelineWeeks={6}
              recomendado={true}
            />

            {/* Paquete Premium */}
            <PaqueteCard
              icon="🥇"
              nombre="IMPERIO DIGITAL"
              subtitulo="INVERSIÓN: $300 USD"
              invertidos={300}
              description="Empresas que desean ser referentes en su sector con presencia digital de clase mundial."
              features={[
                { category: 'Hosting (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Hosting (luego 3 meses)', items: ['$40 USD/mes ($360 USD/9 meses)'] },
                { category: 'Mailbox (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Mailbox (luego 3 meses)', items: ['$4 USD/mes ($36 USD/9 meses)'] },
                { category: 'Dominio (primeros 3 meses)', items: ['$0 USD (Gratis incluido)'] },
                { category: 'Dominio (luego 3 meses)', items: ['$18 USD/mes ($162 USD/9 meses)'] },
              ]}
              pages={8}
              timelineWeeks={8}
              recomendado={false}
            />
          </div>

          {/* Lo que siempre está incluido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-primary to-primary-dark text-white p-12 rounded-2xl shadow-2xl"
          >
            <h3 className="text-3xl font-bold mb-8">🎁 ¿QUÉ ESTÁ INCLUIDO SIEMPRE?</h3>
            <p className="text-xl mb-8">
              Independientemente del paquete que elijas, SIEMPRE recibes:
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
                        <span className="text-yellow-300 mt-1">✓</span>
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
  icon: string
  nombre: string
  subtitulo: string
  invertidos: number
  description: string
  features: Feature[]
  pages: number
  timelineWeeks: number
  recomendado: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className={`relative rounded-2xl overflow-hidden shadow-xl transition-all ${
        recomendado ? 'ring-2 ring-primary scale-105' : ''
      }`}
    >
      {recomendado && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-white py-2 text-center font-bold flex items-center justify-center gap-2">
          <FaStar /> ⭐ RECOMENDADO
        </div>
      )}

      <div className={`p-8 ${recomendado ? 'pt-16' : 'pt-8'} h-full flex flex-col`}>
        <div className="text-center mb-6">
          <span className="text-4xl">{icon}</span>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{nombre}</h3>
          <p className="text-primary font-bold text-lg">{subtitulo}</p>
        </div>

        <p className="text-gray-700 text-center mb-6 flex-grow">{description}</p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-primary">
          <p className="text-sm text-gray-600">Pago Inicial</p>
          <p className="text-3xl font-bold text-primary">${invertidos} USD</p>
        </div>

        <div className="space-y-4 mb-6 flex-grow">
          {features.slice(0, 3).map((feature, index) => (
            <div key={index} className="text-sm">
              <p className="font-semibold text-gray-900">{feature.category}</p>
              <p className="text-gray-600">{feature.items[0]}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{pages}</p>
            <p className="text-xs text-gray-600">Páginas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{timelineWeeks}</p>
            <p className="text-xs text-gray-600">Semanas</p>
          </div>
        </div>

        <a
          href="#contacto"
          className={`mt-6 py-3 px-4 rounded-lg font-bold text-center transition-all ${
            recomendado
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Ver Detalles
        </a>
      </div>
    </motion.div>
  )
}
