'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftRight,
  ArrowRight,
  Download,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Edit,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import type { QuotationConfig, PackageSnapshot } from '@/lib/types'
import {
  compararCotizaciones,
  formatValue,
  type CotizacionComparisonResult,
  type PackageDifference,
} from '../utils/cotizacionComparison'

interface CotizacionComparisonProps {
  cotizacion1: QuotationConfig
  cotizacion2: QuotationConfig
  snapshots1: PackageSnapshot[]
  snapshots2: PackageSnapshot[]
  onClose: () => void
  onRestaurar?: (cotizacion: QuotationConfig) => void
  showRestaurarButton?: boolean
}

/**
 * Componente para comparar dos versiones de cotización lado a lado
 * Incluye comparación de metadata y paquetes integrados
 * 
 * @phase Comparación de Cotizaciones
 * @date 2025-12-06
 */
export const CotizacionComparison: React.FC<CotizacionComparisonProps> = ({
  cotizacion1,
  cotizacion2,
  snapshots1,
  snapshots2,
  onClose,
  onRestaurar,
  showRestaurarButton = true,
}) => {
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'críticos' | 'advertencias'>('todos')

  // Realizar comparación
  const comparison = useMemo<CotizacionComparisonResult>(() => {
    return compararCotizaciones(cotizacion1, cotizacion2, snapshots1, snapshots2)
  }, [cotizacion1, cotizacion2, snapshots1, snapshots2])

  const { metadataDifferences, packageDifferences, summary, areIdentical } = comparison

  // Filtrar diferencias de metadata
  const metadataFiltrada = metadataDifferences.filter((d) => {
    if (filtroTipo === 'críticos') return d.severity === 'critical'
    if (filtroTipo === 'advertencias') return d.severity === 'warning' || d.severity === 'critical'
    return true
  })

  // Filtrar paquetes
  const paquetesFiltrados = packageDifferences.filter((p) => {
    if (p.status === 'unchanged') return filtroTipo === 'todos'
    if (filtroTipo === 'críticos') {
      return p.status === 'added' || p.status === 'removed' || 
        p.differences.some(d => d.severity === 'critical')
    }
    // Para 'advertencias' y 'todos', mostrar paquetes no-unchanged
    return true
  })

  const togglePackage = (packageId: string) => {
    setExpandedPackages(prev => {
      const next = new Set(prev)
      if (next.has(packageId)) {
        next.delete(packageId)
      } else {
        next.add(packageId)
      }
      return next
    })
  }

  const obtenerColorSeveridad = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-gh-error bg-gh-error/10 border-gh-error/30'
      case 'warning':
        return 'text-gh-warning bg-gh-warning/10 border-gh-warning/30'
      default:
        return 'text-gh-accent-blue bg-gh-accent-blue/10 border-gh-accent-blue/30'
    }
  }

  const obtenerColorStatus = (status: PackageDifference['status']) => {
    switch (status) {
      case 'added':
        return 'text-gh-success bg-gh-success/10 border-gh-success/40'
      case 'removed':
        return 'text-gh-error bg-gh-error/10 border-gh-error/40'
      case 'modified':
        return 'text-gh-warning bg-gh-warning/10 border-gh-warning/40'
      default:
        return 'text-gh-text-muted bg-gh-bg-secondary border-gh-border'
    }
  }

  const obtenerIconoStatus = (status: PackageDifference['status']) => {
    switch (status) {
      case 'added':
        return <Plus className="text-gh-success" />
      case 'removed':
        return <Minus className="text-gh-error" />
      case 'modified':
        return <Edit className="text-gh-warning" />
      default:
        return <CheckCircle2 className="text-gh-text-muted" />
    }
  }

  // Helper para clases de variación de costo
  const getCostVariationBgClass = () => {
    if (summary.costVariation.difference > 0) return 'bg-gh-success/10 border border-gh-success/30'
    if (summary.costVariation.difference < 0) return 'bg-gh-error/10 border border-gh-error/30'
    return 'bg-gh-bg-secondary border border-gh-border'
  }

  const getCostVariationTextClass = () => {
    if (summary.costVariation.difference > 0) return 'text-gh-success'
    if (summary.costVariation.difference < 0) return 'text-gh-error'
    return 'text-gh-text-muted'
  }

  // Helper para clases del resumen
  const getSummaryBgClass = () => {
    if (areIdentical) return 'bg-gh-success/10 border-gh-success/30'
    if (summary.criticalChanges > 0) return 'bg-gh-error/10 border-gh-error/30'
    return 'bg-gh-warning/10 border-gh-warning/30'
  }

  // Exportar a CSV
  const exportarCSV = () => {
    const lines = [
      'COMPARACIÓN DE COTIZACIONES',
      `Versión ${cotizacion1.versionNumber || 1} → Versión ${cotizacion2.versionNumber || 1}`,
      '',
      'CAMBIOS EN METADATA',
      'Campo,Valor Anterior,Valor Nuevo,Severidad',
    ]

    for (const d of metadataDifferences) {
      lines.push(`"${d.label}","${formatValue(d.oldValue)}","${formatValue(d.newValue)}","${d.severity}"`)
    }

    lines.push('', 'CAMBIOS EN PAQUETES', 'Paquete,Estado,Campo,Valor Anterior,Valor Nuevo')

    for (const p of packageDifferences) {
      if (p.status === 'added') {
        lines.push(`"${p.packageName}","AGREGADO",-,-,-`)
      } else if (p.status === 'removed') {
        lines.push(`"${p.packageName}","ELIMINADO",-,-,-`)
      } else {
        for (const d of p.differences) {
          lines.push(`"${p.packageName}","MODIFICADO","${d.label}","${formatValue(d.oldValue)}","${formatValue(d.newValue)}"`)
        }
      }
    }

    lines.push(
      '', 
      'RESUMEN',
      `Total cambios,${summary.totalChanges}`,
      `Paquetes agregados,${summary.packagesAdded}`,
      `Paquetes eliminados,${summary.packagesRemoved}`,
      `Variación costo,${summary.costVariation.percentageChange}%`
    )

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comparacion-cotizacion-v${cotizacion1.versionNumber || 1}-v${cotizacion2.versionNumber || 1}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Exportar a JSON
  const exportarJSON = () => {
    const data = {
      comparacion: {
        version1: cotizacion1.versionNumber || 1,
        version2: cotizacion2.versionNumber || 1,
        fecha: new Date().toISOString(),
      },
      metadataDifferences,
      packageDifferences: packageDifferences.map(p => ({
        packageName: p.packageName,
        status: p.status,
        differences: p.differences,
      })),
      summary,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comparacion-cotizacion-v${cotizacion1.versionNumber || 1}-v${cotizacion2.versionNumber || 1}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-[#161b22] to-[#0d1117] rounded-xl border border-[#30363d] shadow-2xl shadow-black/60 ring-1 ring-white/5 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-gh-border flex items-center justify-between shrink-0 bg-gh-bg-secondary">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gh-accent-blue/20 rounded-lg">
              <ArrowLeftRight className="text-gh-accent-blue text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gh-text">
                Comparación de Versiones
              </h3>
              <p className="text-xs font-medium text-gh-text-muted">
                {cotizacion1.numero || 'Cotización'} • v.{cotizacion1.versionNumber || 1} → v.{cotizacion2.versionNumber || 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-overlay rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* VERSIONES HEADER */}
          <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gh-bg-overlay rounded-lg border border-gh-border">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gh-text-muted mb-1">Desde</p>
                <p className="font-semibold text-gh-text">v.{cotizacion1.versionNumber || 1}</p>
                <p className="text-xs text-gh-text-muted">
                  {cotizacion1.fechaEmision?.split('T')[0] || cotizacion1.createdAt?.split('T')[0]}
                </p>
              </div>

              <ArrowRight className="text-gh-accent-blue" />

              <div className="text-center">
                <p className="text-xs text-gh-text-muted mb-1">Hacia</p>
                <p className="font-semibold text-gh-text">v.{cotizacion2.versionNumber || 1}</p>
                <p className="text-xs text-gh-text-muted">
                  {cotizacion2.fechaEmision?.split('T')[0] || cotizacion2.createdAt?.split('T')[0]}
                </p>
              </div>
            </div>

            {/* VARIACIÓN DE COSTO */}
            <div className={`text-right p-3 rounded-lg ${getCostVariationBgClass()}`}>
              <p className="text-xs text-gh-text-muted mb-1">Variación de Costo</p>
              <p className={`font-bold text-lg ${getCostVariationTextClass()}`}>
                {summary.costVariation.difference > 0 ? '+' : ''}
                ${summary.costVariation.difference.toLocaleString('es-CO')}
                <span className="text-sm ml-1">
                  ({summary.costVariation.percentageChange > 0 ? '+' : ''}{summary.costVariation.percentageChange}%)
                </span>
              </p>
            </div>
          </div>

          {/* RESUMEN */}
          <motion.div
            className={`p-4 rounded-lg border ${getSummaryBgClass()}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              {areIdentical ? (
                <CheckCircle2 className="text-gh-success text-xl" />
              ) : (
                <XCircle className="text-gh-error text-xl" />
              )}
              <div className="flex-1">
                {areIdentical ? (
                  <p className="font-semibold text-gh-success">Las versiones son idénticas</p>
                ) : (
                  <p className="font-semibold text-gh-text">
                    {summary.totalChanges} cambio{summary.totalChanges === 1 ? '' : 's'} detectado
                    {summary.totalChanges === 1 ? '' : 's'}
                  </p>
                )}
              </div>
            </div>

            {!areIdentical && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-gh-border/30">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gh-success">{summary.packagesAdded}</span>
                  <p className="text-xs text-gh-text-muted">Agregados</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gh-error">{summary.packagesRemoved}</span>
                  <p className="text-xs text-gh-text-muted">Eliminados</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gh-warning">{summary.packagesModified}</span>
                  <p className="text-xs text-gh-text-muted">Modificados</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gh-text-muted">{summary.packagesUnchanged}</span>
                  <p className="text-xs text-gh-text-muted">Sin cambios</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* FILTROS */}
          {!areIdentical && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filtroTipo === 'todos'
                    ? 'bg-gh-accent-blue text-white'
                    : 'bg-gh-bg-secondary border border-gh-border text-gh-text hover:bg-gh-card'
                }`}
              >
                Todos ({summary.totalChanges})
              </button>
              <button
                onClick={() => setFiltroTipo('críticos')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filtroTipo === 'críticos'
                    ? 'bg-gh-error text-white'
                    : 'bg-gh-error/10 border border-gh-error/30 text-gh-error hover:border-gh-error'
                }`}
              >
                Críticos ({summary.criticalChanges})
              </button>
              <button
                onClick={() => setFiltroTipo('advertencias')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filtroTipo === 'advertencias'
                    ? 'bg-gh-warning text-white'
                    : 'bg-gh-warning/10 border border-gh-warning/30 text-gh-warning hover:border-gh-warning'
                }`}
              >
                Advertencias+ ({summary.criticalChanges + summary.warningChanges})
              </button>
            </div>
          )}

          {/* METADATA SECTION */}
          {metadataFiltrada.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gh-text-muted uppercase tracking-wider flex items-center gap-2">
                📋 Cambios en Datos Generales
              </h4>
              <div className="bg-gh-bg-secondary rounded-lg border border-gh-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gh-border">
                      <th className="px-4 py-3 text-left text-gh-text-muted font-medium">Campo</th>
                      <th className="px-4 py-3 text-left text-gh-text-muted font-medium">Anterior</th>
                      <th className="px-4 py-3 text-center text-gh-text-muted font-medium w-10">→</th>
                      <th className="px-4 py-3 text-left text-gh-text-muted font-medium">Nuevo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metadataFiltrada.map((diff) => (
                      <tr key={`${diff.field}-${diff.label}`} className="border-b border-gh-border/50 last:border-0">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs ${obtenerColorSeveridad(diff.severity)}`}>
                            {diff.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gh-error/80 line-through">
                          {formatValue(diff.oldValue)}
                        </td>
                        <td className="px-4 py-3 text-center text-gh-text-muted">→</td>
                        <td className="px-4 py-3 text-gh-success font-medium">
                          {formatValue(diff.newValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PACKAGES SECTION */}
          {paquetesFiltrados.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gh-text-muted uppercase tracking-wider flex items-center gap-2">
                📦 Cambios en Paquetes
              </h4>
              <div className="space-y-2">
                {paquetesFiltrados.map((pkg) => (
                  <motion.div
                    key={pkg.packageId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border overflow-hidden ${obtenerColorStatus(pkg.status)}`}
                  >
                    {/* Package Header */}
                    <button
                      onClick={() => togglePackage(pkg.packageId)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {obtenerIconoStatus(pkg.status)}
                        <span className="font-medium">{pkg.packageName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 uppercase">
                          {pkg.status === 'added' && 'Nuevo'}
                          {pkg.status === 'removed' && 'Eliminado'}
                          {pkg.status === 'modified' && `${pkg.differences.length} cambios`}
                          {pkg.status === 'unchanged' && 'Sin cambios'}
                        </span>
                      </div>
                      {(pkg.status === 'modified' || pkg.differences.length > 0) && (
                        expandedPackages.has(pkg.packageId) 
                          ? <ChevronUp className="w-4 h-4 text-current opacity-60" />
                          : <ChevronDown className="w-4 h-4 text-current opacity-60" />
                      )}
                    </button>

                    {/* Package Details */}
                    <AnimatePresence>
                      {expandedPackages.has(pkg.packageId) && pkg.differences.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-current/20 bg-black/5"
                        >
                          <table className="w-full text-sm">
                            <tbody>
                              {pkg.differences.map((diff) => (
                                <tr key={`${pkg.packageId}-${diff.field}`} className="border-b border-current/10 last:border-0">
                                  <td className="px-4 py-2 w-1/4">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs ${obtenerColorSeveridad(diff.severity)}`}>
                                      {diff.label}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-gh-text/60 line-through">
                                    {formatValue(diff.oldValue)}
                                  </td>
                                  <td className="px-4 py-2 text-center w-10 text-current/50">→</td>
                                  <td className="px-4 py-2 text-gh-text font-medium">
                                    {formatValue(diff.newValue)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {areIdentical && (
            <div className="text-center py-12">
              <CheckCircle2 className="text-gh-success text-5xl mx-auto mb-4" />
              <p className="text-gh-text font-medium mb-2">No hay diferencias entre las versiones</p>
              <p className="text-xs font-medium text-gh-text-muted">
                Ambas versiones contienen exactamente los mismos datos.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gh-border flex items-center justify-between flex-wrap gap-3 shrink-0 bg-gh-bg-secondary">
          <div className="flex gap-2">
            <button
              onClick={exportarCSV}
              className="px-4 py-2 rounded-lg bg-gh-bg-overlay hover:bg-gh-card border border-gh-border text-gh-text text-sm font-medium transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={exportarJSON}
              className="px-4 py-2 rounded-lg bg-gh-bg-overlay hover:bg-gh-card border border-gh-border text-gh-text text-sm font-medium transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
          </div>

          <div className="flex gap-2">
            {showRestaurarButton && onRestaurar && (
              <button
                onClick={() => onRestaurar(cotizacion1)}
                className="px-4 py-2 rounded-lg bg-gh-warning/20 hover:bg-gh-warning/30 border border-gh-warning/50 text-gh-warning text-sm font-medium transition-all flex items-center gap-2"
              >
                <History className="w-3.5 h-3.5" /> Restaurar v.{cotizacion1.versionNumber || 1}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gh-accent-blue hover:bg-gh-accent-blue/90 text-white text-sm font-medium transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CotizacionComparison


