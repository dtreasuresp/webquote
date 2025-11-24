'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa'

export default function Contacto() {
  return (
    <section id="contacto" className="py-12 px-4 bg-gradient-to-br from-secondary via-secondary-light to-secondary-dark text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Call to Action Principal + Canales de Comunicación Integrados */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm text-white p-8 rounded-xl shadow-lg border border-white/20 mb-8"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-3 text-white text-center">
              ¿Listo para Transformar tu Presencia Digital?
            </h3>
            <p className="text-sm mb-6 text-gray-100 max-w-3xl mx-auto text-center">
              Tienes toda la información necesaria para tomar una decisión informada. 
              Nuestro equipo está preparado para comenzar tu proyecto.
            </p>

            {/* Canales de Comunicación Integrados */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <motion.a
                whileHover={{ y: -3 }}
                href="https://wa.me/5358569291?text=Hola,%20estoy%20interesado%20en%20la%20propuesta"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm text-white p-5 rounded-lg shadow-md hover:shadow-lg hover:bg-white/20 transition-all group border border-white/20"
              >
                <h4 className="text-sm font-bold mb-1 text-white">WhatsApp</h4>
                <p className="text-gray-200 mb-1 text-xs">Respuesta inmediata</p>
                <p className="font-semibold text-xs text-gray-100">+535 856 9291</p>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <span className="inline-block bg-primary text-white px-3 py-1.5 rounded text-xs font-medium group-hover:bg-primary/90 transition-colors">
                    Iniciar Chat →
                  </span>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ y: -3 }}
                href="mailto:dgtecnova@gmail.com?subject=Consulta sobre Propuesta&body=Hola, me interesa conocer más detalles sobre..."
                className="bg-white/10 backdrop-blur-sm text-white p-5 rounded-lg shadow-md hover:shadow-lg hover:bg-white/20 transition-all group border border-white/20"
              >
                <h4 className="text-sm font-bold mb-1 text-white">Correo Electrónico</h4>
                <p className="text-gray-200 mb-1 text-xs">Comunicación formal</p>
                <p className="font-semibold text-xs break-all text-gray-100">dgtecnova@gmail.com</p>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <span className="inline-block bg-primary text-white px-3 py-1.5 rounded text-xs font-medium group-hover:bg-primary/90 transition-colors">
                    Enviar Email →
                  </span>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ y: -3 }}
                href="tel:+5358569291"
                className="bg-white/10 backdrop-blur-sm text-white p-5 rounded-lg shadow-md hover:shadow-lg hover:bg-white/20 transition-all group border border-white/20"
              >
                <h4 className="text-sm font-bold mb-1 text-white">Línea Directa</h4>
                <p className="text-gray-200 mb-1 text-xs">Atención personalizada</p>
                <p className="font-semibold text-xs text-gray-100">+535 856 9291</p>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <span className="inline-block bg-primary text-white px-3 py-1.5 rounded text-xs font-medium group-hover:bg-primary/90 transition-colors">
                    Llamar Ahora →
                  </span>
                </div>
              </motion.a>
            </div>

            <p className="text-center text-gray-200 text-xs">
              Elige el canal que prefieras. Estamos disponibles para responder tus consultas.
            </p>
          </motion.div>

          {/* Información de Ubicación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20"
          >
            <h3 className="text-lg font-bold text-center mb-4 text-white">Nuestra oficina está aquí</h3>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-xl mb-4">
              <div className="aspect-[6/2] w-full">
                <iframe
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent('Arroyo & Lindero, Centro Habana, La Habana, Cuba')}&output=embed`}
                  title="Ubicación DGTECNOVA"
                />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3 justify-center">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaMapMarkerAlt className="text-white text-sm" />
                </div>
                <div className="text-left">
                  <p className="text-sm mb-1">
                    <strong className="font-bold text-primary">Arroyo 203</strong>{' '}
                    <span className="text-gray-200">entre Lindero y Nueva del Pilar</span>
                  </p>
                  <p className="text-gray-300 mb-1.5 text-xs">Centro Habana, La Habana, CUBA</p>
                  <div className="inline-block bg-primary/20 px-2 py-1 rounded border border-primary">
                    <p className="text-xs font-medium text-primary">⏰ Cita previa</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center text-gray-300 border-t border-white/10 pt-4"
          >
            <p className="text-xs mb-1 text-gray-100">
              Daniel Treasure Espinosa | CEO DGTECNOVA
            </p>
            <p className="text-xs text-gray-300">
              Propuesta actualizada: 15 de noviembre de 2025 | Versión: 1.0
            </p>
            <p className="text-xs text-gray-500">
              © 2025 DGTECNOVA. Todos los derechos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
