'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-dark to-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 mt-6 leading-tight">
              PROPUESTA DE DISEÑO WEB
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              PÁGINA CATÁLOGO DINÁMICA
            </h2>
            <h3 className="text-xl md:text-2xl font-medium">
              Urbanisima CONSTRUCTORA SRL
            </h3>
            <p className="text-lg mt-4 text-gray-200">
              VERSIÓN 1.0 - 2025
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-12 text-left bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
            {/* Información de la Cotización */}
            <div className="space-y-1">
              <h4 className="text-xl font-bold mb-4 text-white drop-shadow-lg">📄 Información de Cotización</h4>
              <InfoItem label="Cotización" value="#004-2025" />
              <InfoItem label="Versión" value="1.0" />
              <InfoItem label="Fecha de emisión" value="13 de noviembre de 2025" />
              <InfoItem label="Fecha de vencimiento" value="13 de diciembre de 2025" />
              <InfoItem label="Tiempo de validez" value="30 días" />
              <InfoItem label="Presupuesto" value="Menos de $300 USD" />
              <InfoItem label="Moneda" value="USD" />
            </div>

            {/* Información del Cliente y Proveedor */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold mb-4 text-white drop-shadow-lg">👤 PARA:</h4>
                <div className="space-y-2 text-sm text-gray-50 drop-shadow-lg">
                  <p><strong>Empresa:</strong> Urbanisima Constructora SRL</p>
                  <p><strong>Sector:</strong> Construcción, Servicios y Comercialización de Materiales</p>
                  <p><strong>Ubicación:</strong> Calle 12/2da y 3ra, No 36, Ampliación de Marbella, Habana del Este, La Habana, CUBA</p>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-4 text-white drop-shadow-lg">👨‍💼 DE:</h4>
                <div className="space-y-2 text-sm text-gray-50 drop-shadow-lg">
                  <p><strong>Profesional:</strong> Daniel Treasure Espinosa</p>
                  <p><strong>Empresa:</strong> DGTECNOVA</p>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-white" />
                    <a href="mailto:dgtecnova@gmail.com" className="hover:text-accent transition">
                      dgtecnova@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaWhatsapp className="text-white" />
                    <a href="https://wa.me/5358569291" className="hover:text-accent transition">
                      +535 856 9291
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-white" />
                    <span>Arroyo 203, e/ Lindero y Nueva del Pilar, Centro Habana, La Habana, CUBA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/30">
      <span className="font-semibold text-white drop-shadow-lg">{label}:</span>
      <span className="text-gray-100 drop-shadow-lg">{value}</span>
    </div>
  )
}
