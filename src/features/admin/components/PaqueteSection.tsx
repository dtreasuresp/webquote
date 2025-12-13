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
      className="space-y-4"
    >
      {/* PARTE 1: Información Actual del Paquete */}
      <div className="bg-gh-bg-overlay border border-gh-border/30 rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gh-text mb-6 flex items-center gap-2">
          <span className="text-gh-success">▪</span> Información de la oferta
        </h3>
        
        <div className="space-y-4 grid md:grid-cols-2 gap-2 *:md:space-y-0">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paqueteNombre" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
                Nombre del Paquete
              </label>
              <input
                id="paqueteNombre"
                type="text"
                placeholder="Ej: Constructor"
                value={paqueteActual.nombre}
                onChange={(e) =>
                  setPaqueteActual({ ...paqueteActual, nombre: e.target.value })
                }
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="paqueteDesarrollo" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
                Desarrollo (USD)
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
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paqueteTipo" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
                Tipo de Paquete
              </label>
              <input
                id="paqueteTipo"
                type="text"
                placeholder="Ej: Básico, Profesional, Premium"
                value={paqueteActual.tipo || ''}
                onChange={(e) =>
                  setPaqueteActual({ ...paqueteActual, tipo: e.target.value })
                }
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="paqueteDescuento" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
                Descuento (%)
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
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="paqueteDescripcion" className="block font-medium text-gh-text mb-2 text-xs uppercase tracking-wide">
              Descripción de la oferta
            </label>
            <textarea
              id="paqueteDescripcion"
              placeholder="Descripción personalizada..."
              value={paqueteActual.descripcion || ''}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, descripcion: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text placeholder-gh-text-muted focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* PARTE 2: Resumen de Valores */}
      <div className="bg-gh-bg-overlay border border-gh-border/30 rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gh-text mb-6 flex items-center gap-2">
          <span className="text-gh-info">▪</span> Resumen de Valores
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gh-bg-secondary border border-gh-border-light rounded-md p-4">
            <p className="text-gh-text-muted text-xs mb-2 uppercase tracking-wide">Valor de Desarrollo</p>
            <p className="text-2xl font-semibold text-gh-success">${paqueteActual.desarrollo.toFixed(2)}</p>
          </div>
          <div className="bg-gh-bg-secondary border border-gh-border-light rounded-md p-4">
            <p className="text-gh-text-muted text-xs mb-2 uppercase tracking-wide">Descuento</p>
            <p className="text-2xl font-semibold text-gh-warning">{paqueteActual.descuento.toFixed(1)}%</p>
          </div>
          <div className="bg-gh-bg-secondary border border-gh-border-light rounded-md p-4">
            <p className="text-gh-text-muted text-xs mb-2 uppercase tracking-wide">Total con Descuento</p>
            <p className="text-2xl font-semibold text-gh-text">
              ${(paqueteActual.desarrollo * (1 - paqueteActual.descuento / 100)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}





