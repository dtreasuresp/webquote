'use client'

import { motion } from 'framer-motion'
import type { GestionConfig } from '@/lib/types'

interface GestionSectionProps {
  readonly gestion: GestionConfig
  readonly setGestion: (gestion: GestionConfig) => void
}

export default function GestionSection({ gestion, setGestion }: GestionSectionProps) {
  const normalizarMeses = (mesesGratis: number, mesesPago: number): GestionConfig => {
    let g = Math.max(0, Math.min(mesesGratis, 12))
    let p = Math.max(0, Math.min(mesesPago, 12))
    if (g + p !== 12) {
      if (g > 0) p = 12 - g
      else if (p > 0) g = 12 - p
      else p = 12
    }
    if (g === 12) return { ...gestion, mesesGratis: 12, mesesPago: 0 }
    if (p === 0) return { ...gestion, mesesGratis: g, mesesPago: 1 }
    return { ...gestion, mesesGratis: g, mesesPago: p }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* PARTE 1: Configuración */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ⚙️ Configuración de Gestión
        </h3>
        
        <p className="text-white/80 text-sm mb-4">
          Configura el servicio de gestión mensual. Si el precio es 0, este servicio no se incluirá.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gestionPrecio" className="block font-semibold text-white mb-2 text-sm">
              💰 Precio Mensual (USD)
            </label>
            <input
              id="gestionPrecio"
              type="number"
              placeholder="0"
              value={gestion.precio}
              onChange={(e) =>
                setGestion({
                  ...gestion,
                  precio: Number.parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="gestionMesesGratis" className="block font-semibold text-white mb-2 text-sm">
              🎁 Meses Gratis
            </label>
            <input
              id="gestionMesesGratis"
              type="number"
              placeholder="0"
              value={gestion.mesesGratis}
              onChange={(e) => {
                const gratis = Number.parseInt(e.target.value, 10) || 0
                const nm = normalizarMeses(gratis, gestion.mesesPago)
                setGestion(nm)
              }}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              min="0"
              max="12"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="gestionMesesPago" className="block font-semibold text-white mb-2 text-sm">
              💳 Meses Pago
            </label>
            <input
              id="gestionMesesPago"
              type="number"
              placeholder="12"
              value={gestion.mesesPago}
              onChange={(e) => {
                const pago = Number.parseInt(e.target.value, 10) || 12
                const nm = normalizarMeses(gestion.mesesGratis, pago)
                setGestion(nm)
              }}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              min="1"
              max="12"
            />
          </div>
        </div>
      </div>

      {/* PARTE 2: Resumen */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📊 Resumen de Gestión
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">Precio Mensual</p>
            <p className="text-2xl font-bold text-white">${gestion.precio.toFixed(2)}</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">Meses: {gestion.mesesGratis}G + {gestion.mesesPago}P</p>
            <p className="text-white/80 text-xs">(Gratuitos + Pagos)</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">Total Primer Año</p>
            <p className="text-2xl font-bold text-white">
              ${(gestion.precio * gestion.mesesPago).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}



