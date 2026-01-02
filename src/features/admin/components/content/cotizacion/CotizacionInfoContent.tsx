'use client'

import React from 'react'
import { FileText, Tag, Calendar, DollarSign, Calculator, Check, AlertTriangle } from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import DatePicker from '@/components/ui/DatePicker'
import { QuotationConfig } from '@/lib/types'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'

interface CotizacionInfoContentProps {
  cotizacionConfig: QuotationConfig | null
  setCotizacionConfig: (config: QuotationConfig | null) => void
  erroresValidacionCotizacion: {
    fechas?: string
  }
  formatearFechaLarga: (isoString: string) => string
  calcularFechaVencimiento: (fecha: Date, dias: number) => Date
}

export default function CotizacionInfoContent({
  cotizacionConfig,
  setCotizacionConfig,
  erroresValidacionCotizacion,
  formatearFechaLarga,
  calcularFechaVencimiento,
}: Readonly<CotizacionInfoContentProps>) {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('QUOTES')
  const estaConfigurada = cotizacionConfig?.heroTituloSub && cotizacionConfig?.fechaEmision

  const handleUpdate = (field: keyof QuotationConfig, value: any) => {
    if (!canEdit) return
    setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, [field]: value } : null)
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Información de Cotización"
        description="Datos generales y fechas de la cotización"
        icon={<FileText className="w-4 h-4" />}
        variant="accent"
        badges={[
          { 
            label: estaConfigurada ? 'Configurada' : 'Incompleta', 
            value: estaConfigurada ? '✓' : '!',
            color: estaConfigurada 
              ? 'bg-gh-success/10 text-gh-success border-gh-success/30' 
              : 'bg-gh-warning/10 text-gh-warning border-gh-warning/30'
          }
        ]}
      />

      {/* Formulario Principal */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        {/* Sub-header: Nombre */}
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text">Nombre de la Cotización</h5>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={cotizacionConfig?.heroTituloSub || ''}
            onChange={(e) => handleUpdate('heroTituloSub', e.target.value)}
            className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors"
            placeholder="Ej: PÁGINA CATÁLOGO DINÁMICA"
          />
          <p className="text-[11px] text-gh-text-muted mt-1.5">Se muestra en la página principal</p>
        </div>
      </div>

      {/* Identificación */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Identificación</h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Número</label>
              <input
                type="text"
                value={cotizacionConfig?.numero || ''}
                disabled
                className="w-full px-3 py-2 bg-gh-bg-tertiary/30 text-gh-text-muted border border-gh-border/20 rounded-md text-sm cursor-not-allowed"
                placeholder="Auto-generado"
              />
              <p className="text-[11px] text-gh-text-muted mt-1">Se genera automáticamente</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Título Principal</label>
              <input
                type="text"
                value={cotizacionConfig?.heroTituloMain || ''}
                onChange={(e) => handleUpdate('heroTituloMain', e.target.value)}
                placeholder="Ej: Propuesta de Cotización"
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-gh-text-muted mt-1">Título principal del Hero</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Fechas</h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Fecha Emisión</label>
              <DatePicker
                value={cotizacionConfig?.fechaEmision || null}
                onChange={(iso) => {
                  if (!iso) {
                    if (cotizacionConfig) setCotizacionConfig({ ...cotizacionConfig, fechaEmision: '', fechaVencimiento: '' })
                    return
                  }
                  const newFecha = new Date(iso)
                  const newFechaVencimiento = calcularFechaVencimiento(newFecha, cotizacionConfig?.tiempoValidez || 30)
                  if (cotizacionConfig) {
                    setCotizacionConfig({
                      ...cotizacionConfig,
                      fechaEmision: newFecha.toISOString(),
                      fechaVencimiento: newFechaVencimiento.toISOString(),
                    })
                  }
                }}
                placeholder="dd/mm/aaaa"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Validez (días)</label>
              <input
                type="number"
                value={cotizacionConfig?.tiempoValidez || 30}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 30
                  if (cotizacionConfig) {
                    const newFechaVencimiento = calcularFechaVencimiento(new Date(cotizacionConfig.fechaEmision), newValue)
                    setCotizacionConfig({
                      ...cotizacionConfig,
                      tiempoValidez: newValue,
                      fechaVencimiento: newFechaVencimiento.toISOString(),
                    })
                  }
                }}
                min="1"
                max="365"
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Vencimiento</label>
              <input
                type="text"
                value={cotizacionConfig?.fechaVencimiento ? formatearFechaLarga(cotizacionConfig.fechaVencimiento) : ''}
                disabled
                className="w-full px-3 py-2 bg-gh-bg-tertiary/30 text-gh-text-muted border border-gh-border/20 rounded-md text-sm cursor-not-allowed"
              />
              {erroresValidacionCotizacion.fechas && (
                <p className="text-[11px] text-gh-danger mt-1">{erroresValidacionCotizacion.fechas}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Presupuesto */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Presupuesto</h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Monto</label>
              <input
                type="text"
                value={cotizacionConfig?.presupuesto || ''}
                onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, presupuesto: e.target.value } : null)}
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text placeholder-gh-text-muted focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors"
                placeholder="Ej: Menos de $300 USD"
              />
            </div>
            <div>
              <DropdownSelect
                label="Moneda"
                value={cotizacionConfig?.moneda || 'USD'}
                onChange={(val) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, moneda: val } : null)}
                options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'CUP', label: 'CUP' },
                  { value: 'MXN', label: 'MXN' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vigencia del Contrato */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5 text-gh-accent" />
          <h5 className="text-xs font-medium text-gh-text">Vigencia del Contrato</h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1.5">Tiempo</label>
              <input
                type="number"
                value={cotizacionConfig?.tiempoVigenciaValor || 12}
                onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaValor: parseInt(e.target.value) || 12 } : null)}
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 focus:outline-none transition-colors"
                min="1"
                max="365"
              />
            </div>
            <div className="md:col-span-2">
              <DropdownSelect
                label="Unidad de Tiempo"
                value={cotizacionConfig?.tiempoVigenciaUnidad || 'meses'}
                onChange={(val) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaUnidad: val } : null)}
                options={[
                  { value: 'días', label: 'Días' },
                  { value: 'meses', label: 'Meses' },
                  { value: 'años', label: 'Años' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Resumen */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg p-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs">
          <span className="text-gh-text-muted">
            Número: <span className="text-gh-text font-medium">{cotizacionConfig?.numero || '—'}</span>
          </span>
          <span className="text-gh-text-muted">
            Validez: <span className="text-gh-text font-medium">{cotizacionConfig?.tiempoValidez || 30} días</span>
          </span>
          <span className="text-gh-text-muted">
            Moneda: <span className="text-gh-text font-medium">{cotizacionConfig?.moneda || 'USD'}</span>
          </span>
        </div>
      </div>
    </div>
  )
}


