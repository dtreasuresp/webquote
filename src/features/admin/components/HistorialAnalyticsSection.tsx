'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { History, Receipt, GitBranch, ToggleRight, Mouse, Eye } from 'lucide-react'
import { useAnalytics } from '../contexts/AnalyticsContext'

/**
 * Sección de Analítica de Historial
 * Muestra métricas específicas del tab Historial
 */

interface HistorialAnalyticsSectionProps {
  className?: string
}

export const HistorialAnalyticsSection: React.FC<HistorialAnalyticsSectionProps> = ({ className = '' }) => {
  const { state } = useAnalytics()

  // Filtrar eventos relacionados con Historial
  const cotizacionEvents = state.events.filter(e => 
    e.eventType.startsWith('cotizacion_') || e.eventType.startsWith('historial_')
  )

  // Métricas de cotizaciones
  const cotizacionesCreadas = cotizacionEvents.filter(e => e.eventType === 'cotizacion_created').length
  const cotizacionesEditadas = cotizacionEvents.filter(e => e.eventType === 'cotizacion_edited').length
  const cotizacionesEliminadas = cotizacionEvents.filter(e => e.eventType === 'cotizacion_deleted').length

  // Métricas de activación
  const cotizacionesActivadas = cotizacionEvents.filter(e => e.eventType === 'cotizacion_activated').length
  const cotizacionesDesactivadas = cotizacionEvents.filter(e => e.eventType === 'cotizacion_deactivated').length

  // Métricas de interacción
  const cotizacionesExpandidas = cotizacionEvents.filter(e => e.eventType === 'cotizacion_expanded').length
  const cotizacionesColapsadas = cotizacionEvents.filter(e => e.eventType === 'cotizacion_collapsed').length
  const propuestasVistas = cotizacionEvents.filter(e => e.eventType === 'proposal_viewed').length

  // Historial visto
  const historialViewed = cotizacionEvents.filter(e => e.eventType === 'historial_viewed').length

  // Calcular cotización más interactuada
  const interaccionesPorCotizacion = cotizacionEvents
    .filter(e => e.metadata?.cotizacionId)
    .reduce((acc, event) => {
      const id = event.metadata?.cotizacionId as string
      const numero = event.metadata?.numero as string || id
      if (id) {
        if (!acc[id]) {
          acc[id] = { id, numero, count: 0 }
        }
        acc[id].count++
      }
      return acc
    }, {} as Record<string, { id: string; numero: string; count: number }>)

  const cotizacionMasInteractuada = Object.values(interaccionesPorCotizacion)
    .sort((a, b) => b.count - a.count)[0]

  const cards = [
    {
      id: 'cotizaciones',
      titulo: 'Cotizaciones',
      icono: Receipt,
      color: 'text-gh-accent-blue',
      metricas: [
        { label: 'Creadas', valor: cotizacionesCreadas, color: 'text-gh-success' },
        { label: 'Editadas', valor: cotizacionesEditadas, color: 'text-gh-info' },
        { label: 'Eliminadas', valor: cotizacionesEliminadas, color: 'text-gh-error' },
      ]
    },
    {
      id: 'versiones',
      titulo: 'Versiones',
      icono: GitBranch,
      color: 'text-purple-400',
      metricas: [
        { label: 'Ediciones totales', valor: cotizacionesEditadas, color: 'text-gh-info' },
        { label: 'Más editada', valor: cotizacionMasInteractuada?.numero ? `#${cotizacionMasInteractuada.numero}` : '-', color: 'text-gh-text' },
      ]
    },
    {
      id: 'activaciones',
      titulo: 'Activaciones',
      icono: ToggleRight,
      color: 'text-gh-success',
      metricas: [
        { label: 'Activadas', valor: cotizacionesActivadas, color: 'text-gh-success' },
        { label: 'Desactivadas', valor: cotizacionesDesactivadas, color: 'text-gh-warning' },
      ]
    },
    {
      id: 'interacciones',
      titulo: 'Interacciones',
      icono: Mouse,
      color: 'text-gh-warning',
      metricas: [
        { label: 'Expandidas', valor: cotizacionesExpandidas, color: 'text-gh-info' },
        { label: 'Colapsadas', valor: cotizacionesColapsadas, color: 'text-gh-text-muted' },
        { label: 'Propuestas vistas', valor: propuestasVistas, color: 'text-purple-400' },
      ]
    },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gh-accent-blue/10 border border-gh-accent-blue/30">
          <History className="text-gh-accent-blue w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gh-text">Analítica de Historial</h3>
          <p className="text-xs text-gh-text-muted">Métricas de cotizaciones, versiones y activaciones</p>
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
              className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border/30 p-4 hover:border-gh-accent-blue/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={card.color} />
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

      {/* Resumen de actividad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ translateY: -2, scale: 1.02 }}
          className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border/30 p-4 hover:border-purple-400/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <Eye className="text-purple-400 w-4 h-4" />
            <h4 className="text-sm font-semibold text-gh-text">Vistas del Historial</h4>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gh-text">{historialViewed}</p>
              <p className="text-xs text-gh-text-muted mt-1">veces visualizado</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ translateY: -2, scale: 1.02 }}
          className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border/30 p-4 hover:border-gh-success/50 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="text-gh-success w-4 h-4" />
            <h4 className="text-sm font-semibold text-gh-text">Cotización Más Activa</h4>
          </div>
          {cotizacionMasInteractuada ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gh-success">#{cotizacionMasInteractuada.numero}</p>
                <p className="text-xs text-gh-text-muted mt-1">
                  {cotizacionMasInteractuada.count} interacciones
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <p className="text-xs text-gh-text-muted">Sin datos de interacción</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default HistorialAnalyticsSection


