'use client'

import React, { useState, useCallback } from 'react'
import { FileText } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import SectionHeader from '@/features/admin/components/SectionHeader'

export default function InvoicesSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate } = useAdminPermissions()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddInvoice = useCallback(() => {
    if (!canCreate('INVOICES')) {
      toast.error('No tienes permiso para crear facturas')
      return
    }
    logAction('CREATE', 'INVOICES', 'new-invoice', 'Nueva Factura')
    toast.success('Formulario de nueva factura abierto')
  }, [canCreate, logAction, toast])

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      logAction('VIEW', 'INVOICES', 'invoices-list', 'Lista de Facturas')
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info('Facturas actualizadas')
    } finally {
      setIsLoading(false)
    }
  }, [logAction, toast])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Facturación"
        description="Gestión de facturas, pagos y estados de cuenta"
        icon={<FileText className="w-5 h-5" />}
        onAdd={handleAddInvoice}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={12}
        variant="success"
        badges={[
          { label: 'Pagadas', value: 8, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' },
          { label: 'Pendientes', value: 3, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
          { label: 'Vencidas', value: 1, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gh-bg-secondary/40 text-[11px] font-bold text-gh-text-muted uppercase tracking-wider border-b border-gh-border/50">
                <th className="px-4 py-3">Nº Factura</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gh-border/50 hover:bg-gh-accent/5 transition-colors">
                <td className="px-4 py-4 text-xs font-bold text-gh-text tabular-nums">INV-2024-001</td>
                <td className="px-4 py-4 text-sm text-gh-text">Urbanísima Digital</td>
                <td className="px-4 py-4 text-xs text-gh-text-muted">15 Dic, 2024</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold border border-orange-500/20">PENDIENTE</span>
                </td>
                <td className="px-4 py-4 text-right text-sm font-bold text-gh-text tabular-nums">€15,125.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
