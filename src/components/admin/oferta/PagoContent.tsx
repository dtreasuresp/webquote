'use client'

import React from 'react'
import CollapsibleSection from '@/features/admin/components/CollapsibleSection'
import { motion } from 'framer-motion'

export interface PagoContentProps {
  descuentoPaquete: number
  setDescuentoPaquete: (v: number) => void
  metodoPagoPreferido?: string
  setMetodoPagoPreferido?: (m: string) => void
  notasPago?: string
  setNotasPago?: (t: string) => void
}

export default function PagoContent({
  descuentoPaquete,
  setDescuentoPaquete,
  metodoPagoPreferido,
  setMetodoPagoPreferido,
  notasPago,
  setNotasPago,
}: PagoContentProps) {
  return (
    <div className="p-6 space-y-6">
      <CollapsibleSection id="pago-config" title="Opciones de Pago y Descuentos" icon="" defaultOpen={true}>
        <div className="space-y-4 p-6 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="descuento" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
                Descuento del Paquete (%)
              </label>
              <input
                id="descuento"
                type="number"
                min={0}
                max={100}
                value={descuentoPaquete}
                onChange={(e) => setDescuentoPaquete(Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="metodoPago" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
                Método de Pago Preferido
              </label>
              <select
                id="metodoPago"
                value={metodoPagoPreferido || ''}
                onChange={(e) => setMetodoPagoPreferido && setMetodoPagoPreferido(e.target.value)}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
              >
                <option value="">Selecciona</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label htmlFor="notas" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
                Notas de Pago
              </label>
              <textarea
                id="notas"
                rows={3}
                value={notasPago || ''}
                onChange={(e) => setNotasPago && setNotasPago(e.target.value)}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
              />
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[11px] text-gh-text-muted">
            Ajusta descuentos y método de pago. Esta vista se integrará con el cálculo de costos y el preview de descuentos.
          </motion.div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
