'use client'

import { motion } from 'framer-motion'
import type { GestionConfig } from '@/lib/types'

interface GestionSectionProps {
  gestion: GestionConfig
  setGestion: (gestion: GestionConfig) => void
}

export default function GestionSection({ gestion, setGestion }: GestionSectionProps) {
  const normalizarMeses = (mesesGratis: number, mesesPago: number) => {
    let g = Math.max(0, Math.min(mesesGratis, 12))
    let p = Math.max(0, Math.min(mesesPago, 12))
    if (g + p !== 12) {
      if (g > 0) p = 12 - g
      else if (p > 0) g = 12 - p
      else p = 12
    }
    if (g === 12) return { mesesGratis: 12, mesesPago: 0 }
    if (p === 0) return { mesesGratis: g, mesesPago: 1 }
    return { mesesGratis: g, mesesPago: p }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl border-l-4 border-secondary p-8"
    >
      <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
        <span className="text-3xl">📋</span>
        2.5 Gestión Mensual (Opcional)
      </h2>

      <div className="space-y-4 p-6 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-xl border-2 border-secondary/20">
        <p className="text-sm text-secondary mb-4">
          Configura el servicio de gestión mensual. Si el precio es 0, este servicio no se incluirá.
        </p>
        <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr] gap-4">
          <div>
            <label htmlFor="gestionPrecio" className="block font-semibold text-secondary mb-2 text-sm">
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
              className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="gestionMesesGratis" className="block font-semibold text-secondary mb-2 text-sm">
              🎁 Meses Gratis
            </label>
            <input
              id="gestionMesesGratis"
              type="number"
              placeholder="0"
              value={gestion.mesesGratis}
              onChange={(e) => {
                const gratis = Number.parseInt(e.target.value) || 0
                const nm = normalizarMeses(gratis, gestion.mesesPago)
                setGestion(nm)
              }}
              className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none"
              min="0"
              max="12"
            />
          </div>
          <div>
            <label htmlFor="gestionMesesPago" className="block font-semibold text-secondary mb-2 text-sm">
              💳 Meses Pago
            </label>
            <input
              id="gestionMesesPago"
              type="number"
              placeholder="12"
              value={gestion.mesesPago}
              onChange={(e) => {
                const pago = Number.parseInt(e.target.value) || 12
                const nm = normalizarMeses(gestion.mesesGratis, pago)
                setGestion(nm)
              }}
              className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none"
              min="1"
              max="12"
            />
          </div>
          <div>
            <label className="block font-semibold text-secondary mb-2 text-sm">
              💵 Subtotal Año 1
            </label>
            <div className="px-4 py-2 bg-secondary/10 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-secondary">
                ${(gestion.precio * gestion.mesesPago).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
