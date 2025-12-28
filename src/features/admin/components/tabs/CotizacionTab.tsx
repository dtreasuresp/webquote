'use client'

import React, { useState, useEffect } from 'react'
import { FileText, MapPin, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { QuotationConfig } from '@/lib/types'
import AdminSidebar from '@/features/admin/components/AdminSidebar'
import CotizacionInfoContent from '@/features/admin/components/content/cotizacion/CotizacionInfoContent'
import ClienteContent from '@/features/admin/components/content/cotizacion/ClienteContent'
import ProveedorContent from '@/features/admin/components/content/cotizacion/ProveedorContent'

interface CotizacionTabProps {
  activeSectionId?: string
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  erroresValidacionCotizacion: {
    emailProveedor?: string
    whatsappProveedor?: string
    emailCliente?: string
    whatsappCliente?: string
    fechas?: string
    empresa?: string
    profesional?: string
    numero?: string
    version?: string
  }
  setErroresValidacionCotizacion: (errores: any) => void
  formatearFechaLarga: (isoString: string) => string
  calcularFechaVencimiento: (fecha: Date, dias: number) => Date
  validarEmail: (email: string) => boolean
  validarWhatsApp: (whatsapp: string) => boolean
  validarFechas: (emisión: string, vencimiento: string) => boolean
}

export default function CotizacionTab({
  activeSectionId,
  cotizacionConfig,
  setCotizacionConfig,
  erroresValidacionCotizacion,
  formatearFechaLarga,
  calcularFechaVencimiento,
}: Readonly<CotizacionTabProps>) {
  const [activeItem, setActiveItem] = useState<'cotizacion' | 'cliente' | 'proveedor'>('cotizacion')

  const sectionIdToActiveItem = (sectionId?: string): typeof activeItem => {
    const mapping: Record<string, typeof activeItem> = {
      'cot-info': 'cotizacion',
      'cot-cliente': 'cliente',
      'cot-proveedor': 'proveedor',
    }
    return (sectionId && mapping[sectionId]) || activeItem
  }

  const effectiveActiveItem = activeSectionId
    ? sectionIdToActiveItem(activeSectionId)
    : activeItem

  // Sincronizar estado local con prop del padre
  useEffect(() => {
    if (activeSectionId) {
      const newItem = sectionIdToActiveItem(activeSectionId)
      if (newItem !== activeItem) {
        setActiveItem(newItem)
      }
    }
  }, [activeSectionId, activeItem])

  const items = [
    { id: 'cotizacion', label: 'Información', icon: FileText },
    { id: 'cliente', label: 'Cliente', icon: MapPin },
    { id: 'proveedor', label: 'Proveedor', icon: Mail },
  ] as const

  return (
    <div className="pl-2 pr-6 py-6 flex gap-6 items-stretch">
      <>
        <AdminSidebar
          items={items.map(i => ({ id: i.id, label: i.label, icon: i.icon }))}
          activeItem={activeItem}
          onItemClick={(id) => setActiveItem(id as typeof activeItem)}
          title="Cotización"
          titleIcon={FileText}
        />

        <div className="flex-1">
          {effectiveActiveItem === 'cotizacion' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CotizacionInfoContent
                cotizacionConfig={cotizacionConfig}
                setCotizacionConfig={setCotizacionConfig}
                erroresValidacionCotizacion={erroresValidacionCotizacion}
                formatearFechaLarga={formatearFechaLarga}
                calcularFechaVencimiento={calcularFechaVencimiento}
              />
            </motion.div>
          )}

          {effectiveActiveItem === 'cliente' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClienteContent
                cotizacionConfig={cotizacionConfig}
                setCotizacionConfig={setCotizacionConfig}
                erroresValidacionCotizacion={erroresValidacionCotizacion}
              />
            </motion.div>
          )}

          {effectiveActiveItem === 'proveedor' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ProveedorContent
                cotizacionConfig={cotizacionConfig}
                setCotizacionConfig={setCotizacionConfig}
                erroresValidacionCotizacion={erroresValidacionCotizacion}
              />
            </motion.div>
          )}
        </div>
      </>
    </div>
  )
}


