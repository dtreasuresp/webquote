'use client'

import React, { useState, useCallback } from 'react'
import { DollarSign, Tag, Percent } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function PricingSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canEdit } = useAdminPermissions()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddPriceList = useCallback(() => {
    if (!canEdit('PRICING')) {
      toast.error('No tienes permiso para modificar precios')
      return
    }
    logAction('CREATE', 'PRICING', 'new-price-list', 'Nueva Lista de Precios')
    toast.success('Formulario de nueva lista de precios abierto')
  }, [canEdit, logAction, toast])

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      logAction('VIEW', 'PRICING', 'pricing-dashboard', 'Panel de Precios')
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info('Precios actualizados')
    } finally {
      setIsLoading(false)
    }
  }, [logAction, toast])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Pricing Avanzado"
        description="Gestión de listas de precios, descuentos y márgenes"
        icon={<DollarSign className="w-5 h-5" />}
        onAdd={handleAddPriceList}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={4}
        variant="success"
        badges={[
          { label: 'Listas', value: 4, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Reglas', value: 2, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20">
            <h3 className="text-sm font-bold text-gh-text mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gh-success" />
              Listas de Precios
            </h3>
            <div className="space-y-3">
              {['General', 'VIP', 'Distribuidores', 'Gobierno'].map((list) => (
                <div key={list} className="flex items-center justify-between p-3 rounded-lg bg-gh-bg-tertiary/30 border border-gh-border/50">
                  <span className="text-sm text-gh-text">{list}</span>
                  <span className="text-[10px] font-bold text-gh-text-muted bg-gh-bg-tertiary px-2 py-0.5 rounded">ACTIVA</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border border-gh-border rounded-xl bg-[#161b22]/20">
            <h3 className="text-sm font-bold text-gh-text mb-4 flex items-center gap-2">
              <Percent className="w-4 h-4 text-gh-success" />
              Reglas de Descuento
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gh-bg-tertiary/30 border border-gh-border/50">
                <div className="text-xs font-bold text-gh-text">Descuento por Volumen</div>
                <div className="text-[10px] text-gh-text-muted mt-1">10% de descuento para pedidos mayores a €5,000</div>
              </div>
              <div className="p-3 rounded-lg bg-gh-bg-tertiary/30 border border-gh-border/50">
                <div className="text-xs font-bold text-gh-text">Pronto Pago</div>
                <div className="text-[10px] text-gh-text-muted mt-1">5% de descuento para pagos en menos de 10 días</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
