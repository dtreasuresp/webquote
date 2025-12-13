'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  ArrowLeftRight, 
  Undo2, 
  Copy,
  Check,
  X,
  Package
} from 'lucide-react'
import type { QuotationConfig } from '@/lib/types'

interface CotizacionTimelineProps {
  readonly cotizacionActual: QuotationConfig
  readonly versiones: QuotationConfig[]
  readonly onRestaurar?: (version: QuotationConfig) => void
  readonly onDuplicar?: (version: QuotationConfig) => void
  readonly onComparar?: (version1: QuotationConfig, version2: QuotationConfig) => void
  /** Handler para comparar solo paquetes entre versiones */
  readonly onCompararPaquetes?: (version1: QuotationConfig, version2: QuotationConfig) => void
  /** Mostrar botón de activar en modo selección post-eliminación */
  readonly showActivateButton?: boolean
  /** Handler para activar cotización desde modo selección */
  readonly onActivarCotizacion?: (quotationId: string) => void
}

/**
 * Componente para mostrar timeline visual de versiones de cotización
 * Muestra historial de versiones con acciones: comparar, restaurar, duplicar
 * 
 * @phase Timeline de Cotizaciones
 * @date 2025-12-04
 */
export default function CotizacionTimeline({
  cotizacionActual,
  versiones,
  onRestaurar,
  onDuplicar,
  onComparar,
  onCompararPaquetes,
  showActivateButton = false,
  onActivarCotizacion,
}: CotizacionTimelineProps) {
  // Estados para comparación
  const [modoComparacion, setModoComparacion] = useState(false)
  const [modoComparacionPaquetes, setModoComparacionPaquetes] = useState(false)
  const [versionesSeleccionadas, setVersionesSeleccionadas] = useState<QuotationConfig[]>([])

  // Ordenar versiones por versionNumber descendente (más reciente primero)
  const versionesOrdenadas = [...versiones]
    .sort((a, b) => b.versionNumber - a.versionNumber)

  const formatearFecha = (fechaString?: string) => {
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

  const formatearTiempoRelativo = (fechaString?: string) => {
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
    if (días < 30) return `Hace ${Math.floor(días / 7)} sem`

    return ''
  }

  // Toggle selección para comparación
  const toggleSeleccionComparacion = useCallback((version: QuotationConfig) => {
    setVersionesSeleccionadas(prev => {
      const yaSeleccionada = prev.some(v => v.id === version.id)
      if (yaSeleccionada) {
        return prev.filter(v => v.id !== version.id)
      }
      if (prev.length >= 2) {
        // Reemplazar la primera selección
        return [prev[1], version]
      }
      return [...prev, version]
    })
  }, [])

  // Ejecutar comparación
  const ejecutarComparacion = useCallback(() => {
    if (versionesSeleccionadas.length === 2 && onComparar) {
      onComparar(versionesSeleccionadas[0], versionesSeleccionadas[1])
    }
  }, [versionesSeleccionadas, onComparar])

  // Cancelar modo comparación
  const cancelarComparacion = useCallback(() => {
    setModoComparacion(false)
    setModoComparacionPaquetes(false)
    setVersionesSeleccionadas([])
  }, [])

  // Iniciar modo comparación de versiones
  const iniciarComparacion = useCallback(() => {
    setModoComparacion(true)
    setModoComparacionPaquetes(false)
    setVersionesSeleccionadas([])
  }, [])

  // Iniciar modo comparación de paquetes
  const iniciarComparacionPaquetes = useCallback(() => {
    setModoComparacionPaquetes(true)
    setModoComparacion(false)
    setVersionesSeleccionadas([])
  }, [])

  // Ejecutar comparación de paquetes
  const ejecutarComparacionPaquetes = useCallback(() => {
    if (versionesSeleccionadas.length === 2 && onCompararPaquetes) {
      onCompararPaquetes(versionesSeleccionadas[0], versionesSeleccionadas[1])
    }
  }, [versionesSeleccionadas, onCompararPaquetes])

  // Determinar si estamos en algún modo de comparación
  const enModoComparacion = modoComparacion || modoComparacionPaquetes

  return (
    <div className="space-y-4">
      {/* ENCABEZADO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-400" />
          <h3 className="text-lg font-bold text-gh-text">Historial de Versiones</h3>
          <span className="text-xs font-medium text-gh-text-muted">({versionesOrdenadas.length})</span>
        </div>
        
        {/* Botones de comparación */}
        {!enModoComparacion ? (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={iniciarComparacion}
              disabled={versionesOrdenadas.length < 2}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-md border border-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight className="w-3 h-3" /> Comparar Versiones
            </motion.button>
            {onCompararPaquetes && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={iniciarComparacionPaquetes}
                disabled={versionesOrdenadas.length < 2}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-md border border-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package className="w-3 h-3" /> Comparar Paquetes
              </motion.button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gh-text-muted">
              {versionesSeleccionadas.length}/2 seleccionadas
              {modoComparacionPaquetes && ' (paquetes)'}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={modoComparacionPaquetes ? ejecutarComparacionPaquetes : ejecutarComparacion}
              disabled={versionesSeleccionadas.length !== 2}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                modoComparacionPaquetes 
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30'
                  : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30'
              }`}
            >
              <Check className="w-2.5 h-2.5" /> {modoComparacionPaquetes ? 'Comparar Paquetes' : 'Comparar'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cancelarComparacion}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-md border border-red-500/30 transition-colors"
            >
              <X className="w-2.5 h-2.5" /> Cancelar
            </motion.button>
          </div>
        )}
      </div>

      {/* TIMELINE */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-500 to-blue-500/30" />

        {/* ITEMS */}
        <div className="space-y-4">
          {versionesOrdenadas.map((version, index) => {
            const esActual = version.id === cotizacionActual.id
            const esPrimera = index === 0
            const tiempoRelativo = formatearTiempoRelativo(version.updatedAt)
            const estaSeleccionada = versionesSeleccionadas.some(v => v.id === version.id)

            return (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16"
              >
                {/* CÍRCULO DEL TIMELINE */}
                <motion.div
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    enModoComparacion && estaSeleccionada
                      ? modoComparacionPaquetes
                        ? 'bg-cyan-500 scale-110 shadow-lg shadow-cyan-500/50'
                        : 'bg-purple-500 scale-110 shadow-lg shadow-purple-500/50'
                      : esActual
                        ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                        : esPrimera
                          ? 'bg-gh-success shadow-lg shadow-gh-success/50'
                          : 'bg-gh-bg-secondary border-2 border-blue-500/30 hover:border-blue-500'
                  }`}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => enModoComparacion && toggleSeleccionComparacion(version)}
                >
                  {enModoComparacion && estaSeleccionada ? (
                    <Check className="text-white text-sm" />
                  ) : (
                    <span className="text-white font-bold text-sm">v.{version.versionNumber}</span>
                  )}
                </motion.div>

                {/* CONTENIDO */}
                <motion.div
                  className={`p-4 rounded-lg border transition-all ${
                    modoComparacion && estaSeleccionada
                      ? 'bg-purple-500/10 border-purple-500 shadow-lg'
                      : esActual
                        ? 'bg-blue-500/10 border-blue-500 shadow-lg'
                        : 'bg-gh-card hover:bg-gh-bg-secondary border-gh-border hover:border-blue-500/50'
                  }`}
                  whileHover={!modoComparacion ? { x: 8 } : {}}
                  onClick={() => modoComparacion && toggleSeleccionComparacion(version)}
                  style={{ cursor: modoComparacion ? 'pointer' : 'default' }}
                >
                  {/* Header de la versión */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gh-text">
                          Versión {version.versionNumber}
                        </h4>
                        {esActual && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                            ACTUAL
                          </span>
                        )}
                        {esPrimera && !esActual && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gh-success/20 text-gh-success font-semibold">
                            MÁS RECIENTE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gh-text-muted flex items-center gap-2">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatearFecha(version.updatedAt)}
                      </p>
                    </div>
                    {tiempoRelativo && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gh-bg text-gh-text-muted whitespace-nowrap">
                        {tiempoRelativo}
                      </span>
                    )}
                  </div>

                  {/* Información de la versión */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3 pt-3 border-t border-gh-border/30">
                    <div>
                      <span className="text-gh-text-muted">Empresa:</span>
                      <p className="font-medium text-gh-text truncate">{version.empresa || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gh-text-muted">Profesional:</span>
                      <p className="font-medium text-gh-text truncate">{version.profesional || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gh-text-muted">Número:</span>
                      <p className="font-medium text-gh-text">#{version.numero}</p>
                    </div>
                    <div>
                      <span className="text-gh-text-muted">Validez:</span>
                      <p className="font-medium text-gh-text">{version.tiempoValidez} días</p>
                    </div>
                  </div>

                  {/* Acciones (solo si NO está en modo comparación) */}
                  {!modoComparacion && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gh-border/30">
                      {/* Restaurar - solo si NO es la versión actual */}
                      {!esActual && onRestaurar && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onRestaurar(version)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold rounded border border-amber-500/30 transition-colors"
                          title="Restaurar esta versión como la actual"
                        >
                          <Undo2 className="w-2.5 h-2.5" /> Restaurar
                        </motion.button>
                      )}

                      {/* Duplicar */}
                      {onDuplicar && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDuplicar(version)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-semibold rounded border border-cyan-500/30 transition-colors"
                          title="Duplicar como nueva cotización"
                        >
                          <Copy className="w-2.5 h-2.5" /> Duplicar
                        </motion.button>
                      )}

                      {/* Activar Esta - Solo visible en flujo post-eliminación */}
                      {showActivateButton && onActivarCotizacion && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onActivarCotizacion(version.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[11px] font-semibold rounded border border-green-500/30 transition-colors"
                          title="Activar esta cotización"
                        >
                          <Check className="w-2.5 h-2.5" /> Activar Esta
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* MENSAJE VACÍO */}
      {versionesOrdenadas.length === 0 && (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-3 text-gh-text-muted opacity-50 w-8 h-8" />
          <p className="text-gh-text-muted">No hay versiones en el historial</p>
        </div>
      )}

      {/* INFORMACIÓN ADICIONAL */}
      {versionesOrdenadas.length === 1 && (
        <div className="mt-6 p-4 rounded-lg bg-gh-bg-secondary border border-gh-border/30">
          <p className="text-xs font-medium text-gh-text-muted">
            💡 Esta cotización solo tiene una versión. Las nuevas versiones se crearán automáticamente al editar y guardar cambios.
          </p>
        </div>
      )}

      {versionesOrdenadas.length > 1 && !modoComparacion && (
        <div className="mt-6 p-4 rounded-lg bg-gh-bg-secondary border border-gh-border/30">
          <p className="text-xs font-medium text-gh-text-muted">
            💡 <strong>Restaurar:</strong> Crea una nueva versión con los datos de la versión seleccionada.
            <br />
            💡 <strong>Duplicar:</strong> Crea una nueva cotización independiente basada en esta versión.
          </p>
        </div>
      )}
    </div>
  )
}


