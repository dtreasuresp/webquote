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
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            📞 Próximos Pasos
          </h2>
          <p className="text-center text-xl mb-12 text-gray-100">
            Ya sabes qué necesitas. Ya sabes qué cuesta. Ya sabes qué obtienes.
          </p>

          {/* Pasos */}
          <div className="grid md:grid-cols-5 gap-4 mb-16">
            {[
              { num: 1, label: 'REVISIÓN', desc: 'Lee esta propuesta detenidamente' },
              { num: 2, label: 'DECISIÓN', desc: 'Elige paquete' },
              { num: 3, label: 'COMUNICACIÓN', desc: 'Contácta para aclaraciones' },
              { num: 4, label: 'APROBACIÓN', desc: 'Confirma tu aceptación' },
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
                <div className="text-4xl font-bold mb-2 text-yellow-300">{step.num}</div>
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
              className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl text-center hover:bg-green-500/30 transition-all"
            >
              <FaWhatsapp className="text-4xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-200 mb-4">Mensaje directo y rápido</p>
              <p className="font-bold">+535 856 9291</p>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.05 }}
              href="mailto:dgtecnova@gmail.com"
              className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl text-center hover:bg-blue-500/30 transition-all"
            >
              <FaEnvelope className="text-4xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Email</h3>
              <p className="text-gray-200 mb-4">Detallado y profesional</p>
              <p className="font-bold break-all">dgtecnova@gmail.com</p>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.05 }}
              href="tel:+5358569291"
              className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl text-center hover:bg-purple-500/30 transition-all"
            >
              <FaPhone className="text-4xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Llamada</h3>
              <p className="text-gray-200 mb-4">Conversación directa</p>
              <p className="font-bold">+535 856 9291</p>
            </motion.a>
          </div>

          {/* Ofertas especiales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 p-8 rounded-2xl mb-16"
          >
            <h3 className="text-2xl font-bold mb-4">🎁 OFERTAS ESPECIALES</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold">Constructor:</p>
                  <p>Sin oferta especial</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold">Obra Maestra:</p>
                  <p>Si pagas 100% adelantado: 10% DESCUENTO = Pagas $180 USD</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold">Imperio Digital:</p>
                  <p>Si pagas 100% adelantado: 15% DESCUENTO = Pagas $202 USD</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Información de Ubicación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-center mb-12"
          >
            <h3 className="text-2xl font-bold mb-6">📍 UBICACIÓN</h3>
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

            <div className="grid md:grid-cols-3 gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="https://wa.me/5358569291"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <FaWhatsapp />
                Chatear por WhatsApp
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                href="mailto:dgtecnova@gmail.com?subject=Confirmo%20paquete%20-%20Urbanisma&body=Hola%2C%20estoy%20interesado%20en%20conocer%20m%C3%A1s%20sobre%20los%20paquetes%20de%20desarrollo%20web."
                className="bg-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <FaEnvelope />
                Enviar Email
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.05 }}
                href="tel:+5358569291"
                className="bg-purple-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <FaPhone />
                Llamar Ahora
              </motion.a>
            </div>
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
              Propuesta actualizada: 11 de noviembre de 2025 | Versión: Final 3.1
            </p>
            <p className="text-sm text-gray-400">
              © 2025 DGTECNOVA. Todos los derechos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
