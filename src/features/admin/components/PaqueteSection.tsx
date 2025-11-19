'use client'

import { motion } from 'framer-motion'
import { FaCalculator } from 'react-icons/fa'
import type { Package } from '@/lib/types'

interface PaqueteSectionProps {
  paqueteActual: Package
  setPaqueteActual: (paquete: Package) => void
}

export default function PaqueteSection({ paqueteActual, setPaqueteActual }: PaqueteSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl border-l-4 border-accent p-8"
    >
      <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
        <FaCalculator className="text-accent" />
        2. Definición de Paquetes
      </h2>

      <div className="space-y-4 p-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border-2 border-accent/20">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="paqueteNombre" className="block font-semibold text-secondary mb-2">
              📦 Nombre del Paquete *
            </label>
            <input
              id="paqueteNombre"
              type="text"
              placeholder="Ej: Constructor"
              value={paqueteActual.nombre}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, nombre: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="paqueteDesarrollo" className="block font-semibold text-secondary mb-2">
              💵 Desarrollo (USD) *
            </label>
            <input
              id="paqueteDesarrollo"
              type="number"
              placeholder="0"
              value={paqueteActual.desarrollo}
              onChange={(e) =>
                setPaqueteActual({
                  ...paqueteActual,
                  desarrollo: Number.parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="paqueteDescuento" className="block font-semibold text-secondary mb-2">
              🏷️ Descuento (%)
            </label>
            <input
              id="paqueteDescuento"
              type="number"
              placeholder="0"
              value={paqueteActual.descuento}
              onChange={(e) =>
                setPaqueteActual({
                  ...paqueteActual,
                  descuento: Number.parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="paqueteTipo" className="block font-semibold text-secondary mb-2">
              🏆 Tipo de Paquete (Básico, Profesional, Premium, VIP)
            </label>
            <input
              id="paqueteTipo"
              type="text"
              placeholder="Ej: Básico"
              value={paqueteActual.tipo || ''}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, tipo: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="paqueteDescripcion" className="block font-semibold text-secondary mb-2">
              📝 Descripción del Paquete
            </label>
            <input
              id="paqueteDescripcion"
              type="text"
              placeholder="Ej: Paquete personalizado para empresas..."
              value={paqueteActual.descripcion || ''}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, descripcion: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
