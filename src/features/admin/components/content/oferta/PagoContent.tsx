'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Percent, CheckCircle } from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'

export interface PagoContentProps {
  descuentoPaquete: number
  setDescuentoPaquete: (v: number) => void
  metodoPagoPreferido?: string
  setMetodoPagoPreferido?: (m: string) => void
  notasPago?: string
  setNotasPago?: (t: string) => void
  updatedAt?: string | null
}

export default function PagoContent({
  descuentoPaquete,
  setDescuentoPaquete,
  metodoPagoPreferido,
  setMetodoPagoPreferido,
  notasPago,
  setNotasPago,
  updatedAt,
}: Readonly<PagoContentProps>) {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('OFFERS')
  const tieneDescuento = descuentoPaquete > 0
  const tieneMetodoPago = metodoPagoPreferido && metodoPagoPreferido.trim() !== ''

  const handleUpdateDescuento = (v: number) => {
    if (!canEdit) return
    setDescuentoPaquete(v)
  }

  const handleUpdateMetodo = (v: string) => {
    if (!canEdit) return
    setMetodoPagoPreferido?.(v)
  }

  const handleUpdateNotas = (v: string) => {
    if (!canEdit) return
    setNotasPago?.(v)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <SectionHeader 
        title="Opciones de Pago"
        description="Configuración de descuentos y métodos de pago"
        icon={<CreditCard className="w-4 h-4" />}
        updatedAt={updatedAt}
        variant="accent"
        badges={[
          { 
            label: tieneDescuento ? `${descuentoPaquete}% descuento` : 'Sin descuento', 
            value: tieneDescuento ? '%' : '0',
            color: tieneDescuento 
              ? 'bg-gh-success/10 text-gh-success border-gh-success/30' 
              : 'bg-gh-bg-secondary text-gh-text-muted border-gh-border/30'
          }
        ]}
      />

      {/* Formulario */}
      <div className="space-y-4 p-6 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="descuento" className="block font-medium text-xs mb-2 text-gh-text">
              Descuento del Paquete (%)
            </label>
            <input
              id="descuento"
              type="number"
              min={0}
              max={100}
              value={descuentoPaquete}
              onChange={(e) => handleUpdateDescuento(Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)))}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs font-medium text-gh-text outline-none transition"
            />
            <p className="text-gh-text-muted text-xs mt-2">Descuento aplicado al total de la cotización</p>
          </div>
          <div>
            <DropdownSelect
              id="metodoPago"
              label="Método de Pago Preferido"
              value={metodoPagoPreferido || ''}
              onChange={handleUpdateMetodo}
              options={[
                { value: '', label: 'Selecciona un método' },
                { value: 'transferencia', label: 'Transferencia Bancaria' },
                { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
                { value: 'cheque', label: 'Cheque' }
              ]}
            />
          </div>
        </div>

        <div>
          <label htmlFor="notas" className="block font-medium text-xs mb-2 text-gh-text">
            Notas de Pago
          </label>
          <textarea
            id="notas"
            rows={4}
            placeholder="Ej: Pago inicial del 50%, resto a la entrega..."
            value={notasPago || ''}
            onChange={(e) => handleUpdateNotas(e.target.value)}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs font-medium text-gh-text outline-none transition resize-none"
          />
          <p className="text-gh-text-muted text-xs mt-2">Condiciones o términos adicionales de pago</p>
        </div>
      </div>

      {/* Footer Resumen */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Descuento: <span className={`font-medium ${tieneDescuento ? 'text-gh-success' : 'text-gh-text'}`}>
            {descuentoPaquete}%
          </span>
        </span>
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Método: <span className="text-gh-text font-medium">
            {tieneMetodoPago ? metodoLabels[metodoPagoPreferido] || metodoPagoPreferido : '—'}
          </span>
        </span>
        {tieneDescuento && (
          <span className="text-gh-success flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" /> Descuento configurado
          </span>
        )}
      </div>
    </motion.div>
  )
}


