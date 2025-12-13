/**
 * Componente para mostrar errores de validación en tiempo real
 * Muestra errores, advertencias e información en diferentes formatos
 * 
 * @phase Phase 11 - Validación Avanzada de TABs
 * @date 2025-11-24
 */

'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react'
import type { AdvancedValidationResult } from '../utils/advancedValidators'

// ==================== TIPOS ====================

interface ValidationFeedbackProps {
  result: AdvancedValidationResult | null
  mostrarAdvertencias?: boolean
  mostrarInfo?: boolean
  onDismiss?: () => void
  posicion?: 'top' | 'bottom'
  expandible?: boolean
  compacto?: boolean
}

// ==================== COMPONENTE PRINCIPAL ====================

/**
 * Componente para mostrar resultados de validación
 * Soporta múltiples formatos: alertas, badges, listas, etc.
 */
export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  result,
  mostrarAdvertencias = true,
  mostrarInfo = false,
  onDismiss,
  posicion = 'top',
  expandible = true,
  compacto = false,
}) => {
  const [expandido, setExpandido] = React.useState(!compacto)

  if (!result || result.valido) {
    return null
  }

  const tieneErrores = result.errores.length > 0
  const tieneAdvertencias = result.advertencias.length > 0
  const tieneDependenciasRotas = result.dependenciasRotas.length > 0

  if (!tieneErrores && !tieneAdvertencias) {
    return null
  }

  const posicionClases = {
    top: 'top-0 mt-4',
    bottom: 'bottom-0 mb-4',
  }

  return (
    <motion.div
      className={`fixed left-4 right-4 z-50 ${posicionClases[posicion]}`}
      initial={{ opacity: 0, y: posicion === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: posicion === 'top' ? -20 : 20 }}
    >
      <div className="max-w-2xl mx-auto">
        {/* ERRORES CRÍTICOS */}
        <AnimatePresence>
          {tieneErrores && (
            <motion.div
              className="gh-card-error rounded-lg p-4 mb-3 border-l-4 border-gh-error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <XCircle className="text-gh-error mt-1 flex-shrink-0 text-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gh-error mb-2">Errores encontrados</h3>

                    {expandible && (
                      <button
                        onClick={() => setExpandido(!expandido)}
                        className="text-sm text-gh-error hover:underline mb-2"
                      >
                        {expandido ? '▼' : '▶'} {result.errores.length} error(es)
                      </button>
                    )}

                    {expandido && (
                      <div className="space-y-1">
                        {result.errores.slice(0, 5).map((error) => (
                          <div key={error} className="text-sm text-gh-error flex items-start gap-2">
                            <span className="text-xs mt-0.5">•</span>
                            <span>{error}</span>
                          </div>
                        ))}
                        {result.errores.length > 5 && (
                          <div className="text-xs text-gh-error-hover mt-2">
                            +{result.errores.length - 5} error(es) más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-gh-error hover:text-gh-error-hover flex-shrink-0 mt-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADVERTENCIAS */}
        <AnimatePresence>
          {mostrarAdvertencias && tieneAdvertencias && (
            <motion.div
              className="gh-card-warning rounded-lg p-4 mb-3 border-l-4 border-gh-warning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="text-gh-warning mt-1 flex-shrink-0 text-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gh-warning mb-2">Advertencias</h3>
                  <div className="space-y-1">
                    {result.advertencias.slice(0, 3).map((adv) => (
                      <div key={adv} className="text-sm text-gh-warning flex items-start gap-2">
                        <span className="text-xs mt-0.5">•</span>
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DEPENDENCIAS ROTAS */}
        <AnimatePresence>
          {tieneDependenciasRotas && (
            <motion.div
              className="gh-card-error rounded-lg p-4 border-l-4 border-gh-error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="text-gh-error mt-1 flex-shrink-0 text-lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gh-error mb-2">Dependencias rotas</h3>
                  <div className="space-y-1">
                    {result.dependenciasRotas.map((dep) => (
                      <div key={dep} className="text-sm text-gh-error flex items-start gap-2">
                        <span className="text-xs mt-0.5\">⚠</span>
                        <span>{dep}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ==================== COMPONENTE POR TAB ====================

interface TabValidationBadgeProps {
  tabName: string
  errores: string[]
  tipoTab?: 'cotizacion' | 'cliente' | 'proveedor' | 'presupuesto' | 'otro'
}

/**
 * Badge para mostrar estado de validación de un TAB
 */
export const TabValidationBadge: React.FC<TabValidationBadgeProps> = ({
  tabName,
  errores,
  tipoTab = 'otro',
}) => {
  const tieneErrores = errores.length > 0

  if (!tieneErrores) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gh-success/10 text-gh-success">
        <CheckCircle2 className="w-3 h-3" />
        <span>OK</span>
      </div>
    )
  }

  const colorClases = {
    cotizacion: 'bg-gh-error/10 text-gh-error border-gh-error/30',
    cliente: 'bg-gh-warning/10 text-gh-warning border-gh-warning/30',
    proveedor: 'bg-gh-warning/10 text-gh-warning border-gh-warning/30',
    presupuesto: 'bg-gh-error/10 text-gh-error border-gh-error/30',
    otro: 'bg-gh-error/10 text-gh-error border-gh-error/30',
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${colorClases[tipoTab]}`}>
      <XCircle className="w-3 h-3" />
      <span>{errores.length} error(es)</span>
    </div>
  )
}

// ==================== CARD DE VALIDACIÓN ====================

interface ValidationCardProps {
  result: AdvancedValidationResult
  titulo?: string
  mostrarDetalles?: boolean
}

/**
 * Card completo con todos los detalles de validación
 */
export const ValidationCard: React.FC<ValidationCardProps> = ({
  result,
  titulo = 'Validación',
  mostrarDetalles = true,
}) => {
  const [mostrarTodos, setMostrarTodos] = React.useState(false)

  if (result.valido) {
    return (
      <div className="rounded-lg bg-gh-success/10 border border-gh-success/30 p-4">
        <div className="flex items-center gap-2 text-gh-success">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Todas las validaciones pasaron</span>
        </div>
      </div>
    )
  }

  const modoResumen = !mostrarDetalles && !mostrarTodos

  return (
    <div className="rounded-lg bg-gh-card border border-gh-error/30 p-4 space-y-4">
      {/* ENCABEZADO */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <XCircle className="text-gh-error text-lg mt-0.5" />
          <div>
            <h3 className="font-semibold text-gh-text">{titulo}</h3>
            <p className="text-xs font-medium text-gh-text-secondary mt-1">
              {result.errores.length} error(es) encontrado(s)
            </p>
          </div>
        </div>

        {mostrarDetalles && (
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="text-sm px-3 py-1 rounded bg-gh-primary/10 text-gh-primary hover:bg-gh-primary/20 transition"
          >
            {mostrarTodos ? 'Resumir' : 'Ver todos'}
          </button>
        )}
      </div>

      {/* ERRORES POR TAB */}
      {mostrarDetalles && (
        <div className="space-y-3">
          {Object.entries(result.erroresPorTab).map(([tab, errores]) => (
            <div key={tab} className="border border-gh-border/30 rounded p-3">
              <h4 className="font-medium text-xs font-medium text-gh-text capitalize mb-2">
                TAB: {tab}
                <span className="text-xs text-gh-error ml-2">({errores.length})</span>
              </h4>
              <div className="space-y-1">
                {(mostrarTodos ? errores : errores.slice(0, 2)).map((error) => (
                  <div key={error} className="text-xs font-medium text-gh-text-secondary flex items-start gap-2">
                    <span className="text-gh-error mt-1">•</span>
                    <span>{error}</span>
                  </div>
                ))}
                {!mostrarTodos && errores.length > 2 && (
                  <div className="text-xs text-gh-text-secondary/50 mt-2">
                    +{errores.length - 2} error(es) más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESUMEN */}
      {modoResumen && (
        <div className="text-xs font-medium text-gh-text-secondary">
          {Object.keys(result.erroresPorTab).length} TAB(s) con errores
        </div>
      )}
    </div>
  )
}

// ==================== INDICADOR SIMPLE ====================

interface ValidationIndicatorProps {
  result: AdvancedValidationResult | null
  tamaño?: 'pequeño' | 'medio' | 'grande'
}

/**
 * Indicador simple de estado de validación
 */
export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  result,
  tamaño = 'medio',
}) => {
  if (!result) {
    return null
  }

  const tamañoClases = {
    pequeño: 'text-sm',
    medio: 'text-base',
    grande: 'text-lg',
  }

  if (result.valido) {
    return (
      <div className={`flex items-center gap-2 text-gh-success ${tamañoClases[tamaño]}`}>
        <CheckCircle2 />
        <span>Validado</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-gh-error ${tamañoClases[tamaño]}`}>
      <XCircle />
      <span>{result.errores.length} error(es)</span>
    </div>
  )
}


