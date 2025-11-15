'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa'

export default function Contacto() {
  return (
    <section id="contacto" className="py-20 px-4 bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Columna izquierda: Mapa de Google */}
            <div className="order-2 md:order-1">
              <div className="bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                  <iframe
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent('Arroyo 203, Centro Habana, La Habana, Cuba')}&output=embed`}
                    title="Ubicación Urbanisima"
                  />
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <FaMapMarkerAlt className="text-2xl mt-1" />
                  <div className="text-sm">
                    <p className="font-semibold">Arroyo 203</p>
                    <p className="text-gray-200">e/ Lindero y Nueva del Pilar</p>
                    <p className="text-gray-200">Centro Habana, La Habana, CUBA</p>
                    <p className="text-gray-300 mt-1">(Con cita previa)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Contenido de contacto */}
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-center md:text-left mb-4">
                Próximos Pasos
              </h2>
              <p className="text-center md:text-left text-xl mb-12 text-gray-100">
                Ya sabes qué necesitas. Ya sabes qué cuesta. Ya sabes qué obtienes.
              </p>

              {/* Pasos */}
              <div className="grid md:grid-cols-5 gap-4 mb-16">
                {[
                  { num: 1, label: 'REVISIÓN', desc: 'Lee esta propuesta detenidamente' },
                  { num: 2, label: 'DECISIÓN', desc: 'Elige el paquete que más se ajuste a tus necesidades' },
                  { num: 3, label: 'COMUNICACIÓN', desc: 'Contactanos para aclaraciones sobre cualquier aspecto que necesites' },
                  { num: 4, label: 'APROBACIÓN', desc: 'Confirma tu aceptación. Puedes usar el sitio para hacerlo o podemos efectuar una reunión' },
                  { num: 5, label: '¡COMENZAMOS!', desc: 'Inicio del proyecto' },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center hover:bg-white/20 transition-all"
                  >
                    <div className="text-4xl font-bold mb-2 text-accent">{step.num}</div>
                    <div className="font-bold mb-2">{step.label}</div>
                    <div className="text-sm text-gray-200">{step.desc}</div>
                    {index < 4 && (
                      <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                        <div className="text-2xl">→</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Opciones de contacto */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="https://wa.me/5358569291"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl text-center hover:bg-accent/30 transition-all"
                >
                  <FaWhatsapp className="text-4xl mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">WhatsApp</h3>
                  <p className="text-gray-200 mb-4">Mensaje directo y rápido</p>
                  <p className="font-bold">+535 856 9291</p>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="mailto:dgtecnova@gmail.com"
                  className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl text-center hover:bg-primary/30 transition-all"
                >
                  <FaEnvelope className="text-4xl mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Email</h3>
                  <p className="text-gray-200 mb-4">Detallado y profesional</p>
                  <p className="font-bold break-all">dgtecnova@gmail.com</p>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="tel:+5358569291"
                  className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl text-center hover:bg-secondary/30 transition-all"
                >
                  <FaPhone className="text-4xl mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Llamada</h3>
                  <p className="text-gray-200 mb-4">Conversación directa</p>
                  <p className="font-bold">+535 856 9291</p>
                </motion.a>
              </div>

              {/* Información de Ubicación (se mantiene para texto y SEO) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-center mb-12"
              >
                <h3 className="text-2xl font-bold mb-6">NUESTRA UBICACIÓN</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-2xl" />
                    <div className="text-left">
                      <p className="font-semibold">Arroyo 203</p>
                      <p className="text-gray-200">e/ Lindero y Nueva del Pilar</p>
                      <p className="text-gray-200">Centro Habana, La Habana, CUBA</p>
                    </div>
                  </div>
                  <p className="text-gray-200">(Con cita previa)</p>
                </div>
              </motion.div>

              {/* Call to Action Principal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white text-primary p-12 rounded-2xl text-center shadow-2xl"
              >
                <h3 className="text-3xl font-bold mb-4">
                  ¿Qué falta?
                </h3>
                <p className="text-xl mb-8 text-gray-700">
                  Solo tu decisión de transformar tu presencia digital
                </p>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-16 text-center text-gray-300 border-t border-white/20 pt-8"
              >
                <p className="text-sm mb-2">
                  Daniel Treasure Espinosa | CEO DGTECNOVA
                </p>
                <p className="text-sm mb-4">
                  Propuesta actualizada: 11 de noviembre de 2025 | Versión: 1.0
                </p>
                <p className="text-sm text-gray-400">
                  © 2025 DGTECNOVA. Todos los derechos reservados.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
