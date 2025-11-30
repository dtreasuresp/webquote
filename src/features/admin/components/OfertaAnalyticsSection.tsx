'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Box, Grid3x3, Layers, DollarSign, Navigation, FileText } from 'lucide-react'
import { useAnalytics } from '../contexts/AnalyticsContext'

/**
 * Sección de Analítica de Ofertas
 * Muestra métricas específicas del tab Oferta
 */

interface OfertaAnalyticsSectionProps {
  className?: string
}

export const OfertaAnalyticsSection: React.FC<OfertaAnalyticsSectionProps> = ({ className = '' }) => {
  const { state } = useAnalytics()

  // Filtrar eventos relacionados con Oferta
  const servicioBaseEvents = state.events.filter(e => 
    e.eventType.startsWith('servicio_base_')
  )
  const servicioOpcionalEvents = state.events.filter(e => 
    e.eventType.startsWith('servicio_opcional_')
  )
  const snapshotEvents = state.events.filter(e => 
    e.eventType.startsWith('snapshot_') || e.eventType.startsWith('paquete_')
  )
  const financieroEvents = state.events.filter(e => 
    e.eventType.startsWith('descuento_') || e.eventType.startsWith('opcion_pago_')
  )
  const navegacionEvents = state.events.filter(e => 
    e.eventType === 'oferta_section_viewed'
  )
  const templateEvents = state.events.filter(e => 
    e.eventType === 'template_used'
  )

  // Calcular métricas de servicios base
  const serviciosBaseCreados = servicioBaseEvents.filter(e => e.eventType === 'servicio_base_created').length
  const serviciosBaseEditados = servicioBaseEvents.filter(e => e.eventType === 'servicio_base_edited').length
  const serviciosBaseEliminados = servicioBaseEvents.filter(e => e.eventType === 'servicio_base_deleted').length

  // Calcular métricas de servicios opcionales
  const serviciosOpcCreados = servicioOpcionalEvents.filter(e => e.eventType === 'servicio_opcional_created').length
  const serviciosOpcEditados = servicioOpcionalEvents.filter(e => e.eventType === 'servicio_opcional_edited').length
  const serviciosOpcEliminados = servicioOpcionalEvents.filter(e => e.eventType === 'servicio_opcional_deleted').length

  // Calcular métricas de paquetes
  const snapshotsCreados = snapshotEvents.filter(e => e.eventType === 'snapshot_created').length
  const snapshotsActivados = snapshotEvents.filter(e => e.eventType === 'snapshot_activated').length
  const snapshotsDesactivados = snapshotEvents.filter(e => e.eventType === 'snapshot_deactivated').length
  const snapshotsEliminados = snapshotEvents.filter(e => e.eventType === 'paquete_deleted').length

  // Calcular métricas financieras
  const descuentosConfigurados = financieroEvents.filter(e => e.eventType === 'descuento_configured').length
  const opcionesPagoModificadas = financieroEvents.filter(e => 
    e.eventType === 'opcion_pago_added' || e.eventType === 'opcion_pago_removed'
  ).length

  // Calcular secciones más visitadas
  const seccionesConteo = navegacionEvents.reduce((acc, event) => {
    const section = event.metadata?.section as string
    if (section) {
      acc[section] = (acc[section] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const seccionesOrdenadas = Object.entries(seccionesConteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const totalVisitas = Object.values(seccionesConteo).reduce((sum, count) => sum + count, 0)

  // Templates usados
  const templatesUsados = templateEvents.length

  const cards = [
    {
      id: 'servicios-base',
      titulo: 'Servicios Base',
      icono: Box,
      color: 'gh-success',
      metricas: [
        { label: 'Creados', valor: serviciosBaseCreados, color: 'text-gh-success' },
        { label: 'Editados', valor: serviciosBaseEditados, color: 'text-gh-info' },
        { label: 'Eliminados', valor: serviciosBaseEliminados, color: 'text-gh-warning' },
      ]
    },
    {
      id: 'servicios-opcionales',
      titulo: 'Servicios Opcionales',
      icono: Grid3x3,
      color: 'gh-info',
      metricas: [
        { label: 'Creados', valor: serviciosOpcCreados, color: 'text-gh-success' },
        { label: 'Editados', valor: serviciosOpcEditados, color: 'text-gh-info' },
        { label: 'Eliminados', valor: serviciosOpcEliminados, color: 'text-gh-warning' },
      ]
    },
    {
      id: 'paquetes',
      titulo: 'Paquetes',
      icono: Layers,
      color: 'gh-accent-purple',
      metricas: [
        { label: 'Creados', valor: snapshotsCreados, color: 'text-gh-success' },
        { label: 'Activados', valor: snapshotsActivados, color: 'text-gh-info' },
        { label: 'Desactivados', valor: snapshotsDesactivados, color: 'text-gh-warning' },
        { label: 'Eliminados', valor: snapshotsEliminados, color: 'text-gh-error' },
      ]
    },
    {
      id: 'financiero',
      titulo: 'Configuración Financiera',
      icono: DollarSign,
      color: 'gh-warning',
      metricas: [
        { label: 'Descuentos config.', valor: descuentosConfigurados, color: 'text-gh-success' },
        { label: 'Opciones pago mod.', valor: opcionesPagoModificadas, color: 'text-gh-info' },
      ]
    },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <Navigation className="text-purple-400 w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gh-text">Analítica de Ofertas</h3>
          <p className="text-xs text-gh-text-muted">Métricas de servicios, paquetes y configuración</p>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icono
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ translateY: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border p-4 hover:border-gh-accent-blue/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`text-${card.color}`} />
                <h4 className="text-sm font-semibold text-gh-text">{card.titulo}</h4>
              </div>
              <div className="space-y-2">
                {card.metricas.map((metrica) => (
                  <div key={metrica.label} className="flex items-center justify-between text-xs">
                    <span className="text-gh-text-muted">{metrica.label}</span>
                    <span className={`font-bold ${metrica.color}`}>{metrica.valor}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Secciones más visitadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ translateY: -2, scale: 1.02 }}
          className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border p-4 hover:border-gh-accent-blue/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="text-gh-accent-blue w-4 h-4" />
            <h4 className="text-sm font-semibold text-gh-text">Secciones Más Visitadas</h4>
          </div>
          {seccionesOrdenadas.length === 0 ? (
            <p className="text-xs text-gh-text-muted text-center py-4">Sin datos de navegación</p>
          ) : (
            <div className="space-y-2">
              {seccionesOrdenadas.map(([section, count], idx) => {
                const porcentaje = totalVisitas > 0 ? (count / totalVisitas) * 100 : 0
                return (
                  <div key={section} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gh-text capitalize">{idx + 1}. {section.replace('-', ' ')}</span>
                      <span className="text-gh-text-muted">{count} ({porcentaje.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gh-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentaje}%` }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="h-full bg-gh-accent-blue rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ translateY: -2, scale: 1.02 }}
          className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border p-4 hover:border-gh-success/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-gh-success w-4 h-4" />
            <h4 className="text-sm font-semibold text-gh-text">Templates de Descripción</h4>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gh-text">{templatesUsados}</p>
              <p className="text-xs text-gh-text-muted mt-1">templates utilizados</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OfertaAnalyticsSection
