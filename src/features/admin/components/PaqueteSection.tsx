'use client'

import { motion } from 'framer-motion'
import type { Package } from '@/lib/types'

interface PaqueteSectionProps {
  readonly paqueteActual: Package
  readonly setPaqueteActual: (paquete: Package) => void
}

export default function PaqueteSection({ paqueteActual, setPaqueteActual }: PaqueteSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* PARTE 1: Información Actual del Paquete */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📋 Información del Paquete
        </h3>
        
        <div className="space-y-4 grid md:grid-cols-2 gap-2 *:md:space-y-0">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paqueteNombre" className="block font-semibold text-white mb-2 text-sm">
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
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="paqueteDesarrollo" className="block font-semibold text-white mb-2 text-sm">
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
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paqueteTipo" className="block font-semibold text-white mb-2 text-sm">
                🏆 Tipo de Paquete
              </label>
              <input
                id="paqueteTipo"
                type="text"
                placeholder="Ej: Básico, Profesional, Premium"
                value={paqueteActual.tipo || ''}
                onChange={(e) =>
                  setPaqueteActual({ ...paqueteActual, tipo: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="paqueteDescuento" className="block font-semibold text-white mb-2 text-sm">
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
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="paqueteDescripcion" className="block font-semibold text-white mb-2 text-sm">
              📝 Descripción del Paquete
            </label>
            <textarea
              id="paqueteDescripcion"
              placeholder="Ej: Paquete personalizado para empresas..."
              value={paqueteActual.descripcion || ''}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, descripcion: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* PARTE 2: Resumen de Valores */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ✨ Resumen de Valores
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">Valor de Desarrollo</p>
            <p className="text-2xl font-bold text-white">${paqueteActual.desarrollo.toFixed(2)}</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">Descuento</p>
            <p className="text-2xl font-bold text-white">{paqueteActual.descuento.toFixed(1)}%</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">Total con Descuento</p>
            <p className="text-2xl font-bold text-white">
              ${(paqueteActual.desarrollo * (1 - paqueteActual.descuento / 100)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}



