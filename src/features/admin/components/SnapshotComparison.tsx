'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowRight, FaExchangeAlt, FaCheckCircle, FaTimesCircle, FaDownload } from 'react-icons/fa'
import type { PackageSnapshot } from '@/lib/types'
import { compararSnapshots, type SnapshotComparison as SnapshotComparisonType, type SnapshotDifference } from '../utils/snapshotComparison'
import { exportarDiffCSV, exportarDiffJSON } from '../utils/snapshotDiff'

interface SnapshotComparisonProps {
  snapshot1: PackageSnapshot
  snapshot2: PackageSnapshot
  onRollback?: (snapshot: PackageSnapshot) => void
  showRollbackButton?: boolean
}

/**
 * Componente para comparar dos snapshots lado a lado
 * 
 * @phase Phase 12 - Integración de Snapshots Mejorada
 * @date 2025-11-24
 */
export const SnapshotComparison: React.FC<SnapshotComparisonProps> = ({
  snapshot1,
  snapshot2,
  onRollback,
  showRollbackButton = true,
}) => {
  const [comparison, setComparison] = useState<SnapshotComparisonType | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'críticos' | 'advertencias'>('todos')

  // Realizar comparación
  React.useEffect(() => {
    const result = compararSnapshots(snapshot1, snapshot2)
    setComparison(result)
  }, [snapshot1, snapshot2])

  if (!comparison) {
    return <div className="text-center py-8 text-gh-text-muted">Comparando...</div>
  }

  const { diferencias, resumen, sonIdénticos } = comparison

  // Filtrar diferencias
  const diferenciasFiltradas = diferencias.filter((d: SnapshotDifference) => {
    if (filtroTipo === 'críticos') return d.severity === 'critical'
    if (filtroTipo === 'advertencias') return d.severity === 'warning' || d.severity === 'critical'
    return true
  })

  const formatearValor = (valor: unknown) => {
    if (valor === null || valor === undefined) return '(vacío)'
    if (typeof valor === 'number') return valor.toLocaleString('es-ES')
    if (typeof valor === 'string') return valor
    if (Array.isArray(valor)) return `[Array ${valor.length}]`
    return JSON.stringify(valor).substring(0, 50)
  }

  const obtenerColorSeveridad = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-gh-error/10 border-gh-error/30 text-gh-error'
      case 'warning':
        return 'bg-gh-warning/10 border-gh-warning/30 text-gh-warning'
      default:
        return 'bg-gh-success/10 border-gh-success/30 text-gh-success'
    }
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-sm text-gh-text-muted mb-1">Desde</p>
            <p className="font-semibold text-gh-text">{snapshot1.nombre}</p>
            <p className="text-xs text-gh-text-muted">{snapshot1.createdAt?.split('T')[0]}</p>
          </div>

          <FaArrowRight className="text-gh-accent-blue mx-2" />

          <div className="text-center">
            <p className="text-sm text-gh-text-muted mb-1">Hacia</p>
            <p className="font-semibold text-gh-text">{snapshot2.nombre}</p>
            <p className="text-xs text-gh-text-muted">{snapshot2.createdAt?.split('T')[0]}</p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportarDiffCSV(comparison)}
            className="px-3 py-2 rounded-lg bg-gh-bg-secondary hover:bg-gh-card border border-gh-border text-gh-text text-sm font-medium transition-all flex items-center gap-2"
          >
            <FaDownload size={14} /> CSV
          </button>
          <button
            onClick={() => exportarDiffJSON(comparison)}
            className="px-3 py-2 rounded-lg bg-gh-bg-secondary hover:bg-gh-card border border-gh-border text-gh-text text-sm font-medium transition-all flex items-center gap-2"
          >
            <FaDownload size={14} /> JSON
          </button>

          {showRollbackButton && onRollback && (
            <button
              onClick={() => onRollback(snapshot1)}
              className="px-3 py-2 rounded-lg bg-gh-accent-blue hover:bg-gh-accent-blue/90 text-white text-sm font-medium transition-all flex items-center gap-2"
            >
              <FaExchangeAlt size={14} /> Restaurar
            </button>
          )}
        </div>
      </div>

      {/* RESUMEN */}
      {(() => {
        let bgClass = 'bg-gh-success/10 border-gh-success/30'
        if (!sonIdénticos) {
          bgClass = resumen.críticos > 0
            ? 'bg-gh-error/10 border-gh-error/30'
            : 'bg-gh-warning/10 border-gh-warning/30'
        }
        return (
      <motion.div
        className={`p-4 rounded-lg border ${bgClass}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          {sonIdénticos ? (
            <FaCheckCircle className="text-gh-success" size={20} />
          ) : (
            <FaTimesCircle className="text-gh-error" size={20} />
          )}
          <div className="flex-1">
            {sonIdénticos ? (
              <p className="font-semibold text-gh-success">Los snapshots son idénticos</p>
            ) : (
              <p className="font-semibold">
                {resumen.totalCambios} cambio{resumen.totalCambios !== 1 ? 's' : ''} detectado
                {resumen.totalCambios !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {!sonIdénticos && (
          <div className="grid grid-cols-3 gap-2 text-sm mt-3 pt-3 border-t border-gh-border/30">
            {resumen.críticos > 0 && (
              <div className="text-gh-error">
                <span className="font-semibold">🔴 {resumen.críticos}</span> crítico{resumen.críticos !== 1 ? 's' : ''}
              </div>
            )}
            {resumen.advertencias > 0 && (
              <div className="text-gh-warning">
                <span className="font-semibold">🟡 {resumen.advertencias}</span> advertencia
                {resumen.advertencias !== 1 ? 's' : ''}
              </div>
            )}
            {resumen.info > 0 && (
              <div className="text-gh-success">
                <span className="font-semibold">🔵 {resumen.info}</span> info
              </div>
            )}
          </div>
        )}
      </motion.div>
        )
      })()}

      {/* FILTROS */}
      {!sonIdénticos && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filtroTipo === 'todos'
                ? 'bg-gh-accent-blue text-white'
                : 'bg-gh-bg-secondary border border-gh-border text-gh-text hover:bg-gh-card'
            }`}
          >
            Todos ({diferencias.length})
          </button>
          <button
            onClick={() => setFiltroTipo('críticos')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filtroTipo === 'críticos'
                ? 'bg-gh-error text-white'
                : 'bg-gh-error/10 border border-gh-error/30 text-gh-error hover:border-gh-error'
            }`}
          >
            Críticos ({resumen.críticos})
          </button>
          <button
            onClick={() => setFiltroTipo('advertencias')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filtroTipo === 'advertencias'
                ? 'bg-gh-warning text-white'
                : 'bg-gh-warning/10 border border-gh-warning/30 text-gh-warning hover:border-gh-warning'
            }`}
          >
            Advertencias ({resumen.críticos + resumen.advertencias})
          </button>
        </div>
      )}

      {/* LISTA DE DIFERENCIAS */}
      <AnimatePresence>
        {!sonIdénticos && diferenciasFiltradas.length > 0 && (
          <motion.div className="space-y-3">
            {diferenciasFiltradas.map((diff: SnapshotDifference, index: number) => (
              <motion.div
                key={`${diff.field}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`p-4 rounded-lg border ${obtenerColorSeveridad(diff.severity)}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{diff.field}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {diff.tipo === 'added' && '✨ Agregado'}
                      {diff.tipo === 'removed' && '🗑️ Eliminado'}
                      {diff.tipo === 'modified' && '📝 Modificado'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full opacity-75">
                    {diff.severity.toUpperCase()}
                  </span>
                </div>

                {diff.tipo === 'modified' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="opacity-75 mb-1">Anterior:</p>
                      <code className="block p-2 rounded bg-gh-bg/50 break-all">
                        {formatearValor(diff.oldValue)}
                      </code>
                    </div>
                    <div>
                      <p className="opacity-75 mb-1">Nuevo:</p>
                      <code className="block p-2 rounded bg-gh-bg/50 break-all">
                        {formatearValor(diff.newValue)}
                      </code>
                    </div>
                  </div>
                )}

                {diff.tipo === 'added' && (
                  <div className="text-xs">
                    <p className="opacity-75 mb-1">Agregado:</p>
                    <code className="block p-2 rounded bg-gh-bg/50 break-all">
                      {formatearValor(diff.newValue)}
                    </code>
                  </div>
                )}

                {diff.tipo === 'removed' && (
                  <div className="text-xs">
                    <p className="opacity-75 mb-1">Eliminado:</p>
                    <code className="block p-2 rounded bg-gh-bg/50 break-all">
                      {formatearValor(diff.oldValue)}
                    </code>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENSAJE VACÍO */}
      {diferenciasFiltradas.length === 0 && !sonIdénticos && (
        <div className="py-8 text-center text-gh-text-muted">
          <p>No hay cambios que coincidan con el filtro seleccionado</p>
        </div>
      )}
    </div>
  )
}

export default SnapshotComparison
