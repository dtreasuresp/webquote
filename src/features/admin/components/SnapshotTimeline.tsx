'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Circle, ArrowRight } from 'lucide-react'
import type { PackageSnapshot } from '@/lib/types'

interface SnapshotTimelineProps {
  snapshots: PackageSnapshot[]
  onSelectSnapshot?: (snapshot: PackageSnapshot) => void
  selectedSnapshotId?: string
  maxItems?: number
}

/**
 * Componente para mostrar timeline visual de snapshots
 * Muestra historial de versiones en formato timeline
 * 
 * @phase Phase 12 - Integración de Snapshots Mejorada
 * @date 2025-11-24
 */
export const SnapshotTimeline: React.FC<SnapshotTimelineProps> = ({
  snapshots,
  onSelectSnapshot,
  selectedSnapshotId,
  maxItems = 10,
}) => {
  // Ordenar snapshots por fecha (más recientes primero)
  const snapshotsOrdenados = [...snapshots]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, maxItems)

  const formatarFecha = (fechaString?: string) => {
    if (!fechaString) return 'Fecha desconocida'
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatarTiempo = (fechaString?: string) => {
    if (!fechaString) return ''
    const fecha = new Date(fechaString)
    const ahora = new Date()
    const diferencia = ahora.getTime() - fecha.getTime()

    const minutos = Math.floor(diferencia / 60000)
    const horas = Math.floor(diferencia / 3600000)
    const días = Math.floor(diferencia / 86400000)

    if (minutos < 60) return `Hace ${minutos}m`
    if (horas < 24) return `Hace ${horas}h`
    if (días < 7) return `Hace ${días}d`

    return ''
  }

  return (
    <div className="space-y-4">
      {/* ENCABEZADO */}
      <div className="flex items-center gap-2">
        <Calendar className="text-gh-accent-blue" />
        <h3 className="text-lg font-bold text-gh-text">Historial de Versiones</h3>
        <span className="text-xs font-medium text-gh-text-muted">({snapshotsOrdenados.length})</span>
      </div>

      {/* TIMELINE */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gh-accent-blue via-gh-accent-blue to-gh-accent-blue/30" />

        {/* ITEMS */}
        <div className="space-y-4">
          {snapshotsOrdenados.map((snapshot, index) => {
            const isSelected = snapshot.id === selectedSnapshotId
            const isFirst = index === 0
            const tiempoTranscurrido = formatarTiempo(snapshot.createdAt)

            return (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectSnapshot?.(snapshot)}
                className={`relative pl-20 cursor-pointer group`}
              >
                {/* CÍRCULO DEL TIMELINE */}
                <motion.div
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-gh-accent-blue scale-110 shadow-lg shadow-gh-accent-blue/50'
                      : isFirst
                        ? 'bg-gh-success shadow-lg shadow-gh-success/50'
                        : 'bg-gh-bg-secondary border-2 border-gh-accent-blue/30 group-hover:border-gh-accent-blue'
                  }`}
                  whileHover={{ scale: 1.15 }}
                >
                  <Circle
                    className={`text-sm ${isSelected || isFirst ? 'text-white' : 'text-gh-accent-blue/50'}`}
                  />
                </motion.div>

                {/* CONTENIDO */}
                <motion.div
                  className={`p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-gh-accent-blue/10 border-gh-accent-blue shadow-lg'
                      : 'bg-gh-card hover:bg-gh-bg-secondary border-gh-border hover:border-gh-accent-blue/50'
                  }`}
                  whileHover={{ x: 8 }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gh-text mb-1">{snapshot.nombre}</h4>
                      <p className="text-xs text-gh-text-muted flex items-center gap-2">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatarFecha(snapshot.createdAt)}
                      </p>
                    </div>
                    {tiempoTranscurrido && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gh-bg text-gh-text-muted whitespace-nowrap">
                        {tiempoTranscurrido}
                      </span>
                    )}
                  </div>

                  {/* INFORMACIÓN DEL SNAPSHOT */}
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-gh-border/30">
                    <div>
                      <span className="text-gh-text-muted">Desarrollo:</span>
                      <p className="font-semibold text-gh-accent-blue">${snapshot.paquete.desarrollo.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gh-text-muted">Costo Inicial:</span>
                      <p className="font-semibold text-gh-success">${snapshot.costos.inicial.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gh-text-muted">Servicios Base:</span>
                      <p className="font-semibold">{snapshot.serviciosBase.length}</p>
                    </div>
                    <div>
                      <span className="text-gh-text-muted">Otros Servicios:</span>
                      <p className="font-semibold">{snapshot.otrosServicios.length}</p>
                    </div>
                  </div>

                  {/* BADGE DE ACTUAL */}
                  {isFirst && (
                    <div className="mt-3 pt-3 border-t border-gh-border/30">
                      <span className="text-xs px-2 py-1 rounded-full bg-gh-success/10 text-gh-success font-semibold">
                        ✓ Versión Actual
                      </span>
                    </div>
                  )}

                  {/* INDICATOR DE SELECCIÓN */}
                  {isSelected && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="text-gh-accent-blue animate-pulse" />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* MENSAJE VACÍO */}
      {snapshotsOrdenados.length === 0 && (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-3 text-gh-text-muted opacity-50 w-8 h-8" />
          <p className="text-gh-text-muted">No hay snapshots en el historial</p>
        </div>
      )}

      {/* INFORMACIÓN ADICIONAL */}
      {snapshotsOrdenados.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-gh-bg-secondary border border-gh-border/30">
          <p className="text-xs font-medium text-gh-text-muted">
            💡 Selecciona una versión para comparar o restaurar cambios anteriores
          </p>
        </div>
      )}
    </div>
  )
}

export default SnapshotTimeline


