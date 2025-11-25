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
      <div className="bg-gh-bg-overlay border border-gh-border rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gh-text mb-6 flex items-center gap-2">
          <span className="text-gh-warning">▪</span> Configuración de Gestión
        </h3>
        
        <p className="text-gh-text-muted text-sm mb-6">
          Configura el servicio de gestión mensual. Si el precio es 0, este servicio no se incluirá.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gestionPrecio" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
              Precio Mensual (USD)
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
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="gestionMesesGratis" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
              Meses Gratis
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
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              min="0"
              max="12"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="gestionMesesPago" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
              Meses Pago
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
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              min="1"
              max="12"
            />
          </div>
        </div>
      </div>

      {/* PARTE 2: Resumen */}
      <div className="bg-gh-bg-overlay border border-gh-border rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gh-text mb-6 flex items-center gap-2">
          <span className="text-gh-info">▪</span> Resumen de Gestión
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gh-bg-secondary border border-gh-border-light rounded-md p-4">
            <p className="text-gh-text-muted text-xs mb-2 uppercase tracking-wide">Precio Mensual</p>
            <p className="text-2xl font-semibold text-gh-success">${gestion.precio.toFixed(2)}</p>
          </div>
          <div className="bg-gh-bg-secondary border border-gh-border-light rounded-md p-4">
            <p className="text-gh-text-muted text-xs mb-1 uppercase tracking-wide">Meses: {gestion.mesesGratis}G + {gestion.mesesPago}P</p>
            <p className="text-gh-text-muted text-xs">(Gratuitos + Pagos)</p>
          </div>
          <div className="bg-gh-bg-secondary border border-gh-border-light rounded-md p-4">
            <p className="text-gh-text-muted text-xs mb-2 uppercase tracking-wide">Total Primer Año</p>
            <p className="text-2xl font-semibold text-gh-text">
              ${(gestion.precio * gestion.mesesPago).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}



