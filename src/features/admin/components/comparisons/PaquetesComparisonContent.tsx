'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  Edit,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react'
import type { QuotationConfig, PackageSnapshot } from '@/lib/types'

// ============================================================================
// Tipos
// ============================================================================
interface PackageFieldDifference {
  field: string
  label: string
  oldValue: unknown
  newValue: unknown
  severity: 'critical' | 'warning' | 'info'
}

interface PackageComparisonItem {
  packageName: string
  status: 'added' | 'removed' | 'modified' | 'unchanged'
  differences: PackageFieldDifference[]
  oldSnapshot?: PackageSnapshot
  newSnapshot?: PackageSnapshot
}

interface ComparisonStats {
  total: number
  added: number
  removed: number
  modified: number
  unchanged: number
}

export interface PaquetesComparisonContentProps {
  /** Cotización anterior (base) */
  cotizacion1: QuotationConfig
  /** Cotización nueva (a comparar) */
  cotizacion2: QuotationConfig
  /** Snapshots de paquetes de la cotización 1 */
  snapshots1: PackageSnapshot[]
  /** Snapshots de paquetes de la cotización 2 */
  snapshots2: PackageSnapshot[]
}

// ============================================================================
// Configuración de campos para comparar
// ============================================================================
const PACKAGE_FIELDS_TO_COMPARE: Array<{ 
  field: string
  label: string
  severity: 'critical' | 'warning' | 'info'
  getValue: (s: PackageSnapshot) => unknown
}> = [
  { field: 'nombre', label: 'Nombre', severity: 'warning', getValue: (s) => s.nombre },
  { field: 'desarrollo', label: 'Desarrollo', severity: 'critical', getValue: (s) => s.paquete?.desarrollo },
  { field: 'descuento', label: 'Descuento (%)', severity: 'warning', getValue: (s) => s.paquete?.descuento },
  { field: 'tipo', label: 'Tipo', severity: 'info', getValue: (s) => s.paquete?.tipo },
  { field: 'descripcion', label: 'Descripción', severity: 'info', getValue: (s) => s.paquete?.descripcion },
  { field: 'costoInicial', label: 'Costo Inicial', severity: 'critical', getValue: (s) => s.costos?.inicial },
  { field: 'costoAño1', label: 'Costo Año 1', severity: 'critical', getValue: (s) => s.costos?.año1 },
  { field: 'costoAño2', label: 'Costo Año 2+', severity: 'warning', getValue: (s) => s.costos?.año2 },
  { field: 'serviciosBaseCount', label: 'Servicios Base (cantidad)', severity: 'warning', getValue: (s) => s.serviciosBase?.length || 0 },
  { field: 'otrosServiciosCount', label: 'Otros Servicios (cantidad)', severity: 'info', getValue: (s) => s.otrosServicios?.length || 0 },
]

// ============================================================================
// Funciones auxiliares
// ============================================================================
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(vacío)'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number') return value.toLocaleString('es-CO')
  if (typeof value === 'string') return value || '(vacío)'
  if (Array.isArray(value)) return `${value.length} elementos`
  if (typeof value === 'object') return JSON.stringify(value).substring(0, 50) + '...'
  return String(value)
}

function areValuesEqual(val1: unknown, val2: unknown): boolean {
  if (val1 == null && val2 == null) return true
  if (val1 == null || val2 == null) return false
  if (Array.isArray(val1) && Array.isArray(val2)) {
    return JSON.stringify(val1) === JSON.stringify(val2)
  }
  if (typeof val1 === 'object' && typeof val2 === 'object') {
    return JSON.stringify(val1) === JSON.stringify(val2)
  }
  return val1 === val2
}

function comparePackages(snapshot1: PackageSnapshot, snapshot2: PackageSnapshot): PackageFieldDifference[] {
  const differences: PackageFieldDifference[] = []
  
  for (const fieldConfig of PACKAGE_FIELDS_TO_COMPARE) {
    const val1 = fieldConfig.getValue(snapshot1)
    const val2 = fieldConfig.getValue(snapshot2)
    
    if (!areValuesEqual(val1, val2)) {
      differences.push({
        field: fieldConfig.field,
        label: fieldConfig.label,
        oldValue: val1,
        newValue: val2,
        severity: fieldConfig.severity
      })
    }
  }
  
  return differences
}

// ============================================================================
// Componente Principal
// ============================================================================
export function PaquetesComparisonContent({
  cotizacion1,
  cotizacion2,
  snapshots1,
  snapshots2
}: PaquetesComparisonContentProps) {
  // Estado para paquetes expandidos y filtro
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'cambios' | 'criticos'>('todos')

  // ============================================================================
  // Lógica de comparación
  // ============================================================================
  const comparison = useMemo<PackageComparisonItem[]>(() => {
    const result: PackageComparisonItem[] = []
    
    // Crear mapas por nombre de paquete
    const map1 = new Map(snapshots1.map(s => [s.nombre, s]))
    const map2 = new Map(snapshots2.map(s => [s.nombre, s]))
    
    // Procesar paquetes en snapshots1
    for (const snapshot1 of snapshots1) {
      const snapshot2 = map2.get(snapshot1.nombre)
      
      if (!snapshot2) {
        // Paquete eliminado (está en v1 pero no en v2)
        result.push({
          packageName: snapshot1.nombre,
          status: 'removed',
          differences: [],
          oldSnapshot: snapshot1
        })
      } else {
        // Comparar diferencias
        const differences = comparePackages(snapshot1, snapshot2)
        result.push({
          packageName: snapshot1.nombre,
          status: differences.length > 0 ? 'modified' : 'unchanged',
          differences,
          oldSnapshot: snapshot1,
          newSnapshot: snapshot2
        })
      }
    }
    
    // Encontrar paquetes nuevos (en v2 pero no en v1)
    for (const snapshot2 of snapshots2) {
      if (!map1.has(snapshot2.nombre)) {
        result.push({
          packageName: snapshot2.nombre,
          status: 'added',
          differences: [],
          newSnapshot: snapshot2
        })
      }
    }
    
    // Ordenar: removed, added, modified, unchanged
    return result.sort((a, b) => {
      const order = { removed: 0, added: 1, modified: 2, unchanged: 3 }
      return order[a.status] - order[b.status]
    })
  }, [snapshots1, snapshots2])

  // Estadísticas
  const stats = useMemo<ComparisonStats>(() => ({
    total: comparison.length,
    added: comparison.filter(p => p.status === 'added').length,
    removed: comparison.filter(p => p.status === 'removed').length,
    modified: comparison.filter(p => p.status === 'modified').length,
    unchanged: comparison.filter(p => p.status === 'unchanged').length,
  }), [comparison])

  // Paquetes filtrados
  const paquetesFiltrados = useMemo(() => {
    switch (filtroTipo) {
      case 'cambios':
        return comparison.filter(p => p.status !== 'unchanged')
      case 'criticos':
        return comparison.filter(p => 
          p.status === 'added' || 
          p.status === 'removed' || 
          p.differences.some(d => d.severity === 'critical')
        )
      default:
        return comparison
    }
  }, [comparison, filtroTipo])

  // ============================================================================
  // Handlers
  // ============================================================================
  const togglePackage = (packageName: string) => {
    setExpandedPackages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(packageName)) {
        newSet.delete(packageName)
      } else {
        newSet.add(packageName)
      }
      return newSet
    })
  }

  // ============================================================================
  // Export CSV
  // ============================================================================
  const exportarCSV = () => {
    const lines = [
      'COMPARACIÓN DE PAQUETES',
      `Versión ${cotizacion1.versionNumber || 1} → Versión ${cotizacion2.versionNumber || 1}`,
      '',
      'Paquete,Estado,Campo,Valor Anterior,Valor Nuevo,Severidad',
    ]

    for (const p of comparison) {
      if (p.status === 'added') {
        lines.push(`"${p.packageName}","NUEVO",-,-,-,-`)
      } else if (p.status === 'removed') {
        lines.push(`"${p.packageName}","ELIMINADO",-,-,-,-`)
      } else if (p.status === 'modified') {
        for (const d of p.differences) {
          lines.push(`"${p.packageName}","MODIFICADO","${d.label}","${formatValue(d.oldValue)}","${formatValue(d.newValue)}","${d.severity}"`)
        }
      } else {
        lines.push(`"${p.packageName}","SIN CAMBIOS",-,-,-,-`)
      }
    }

    lines.push('', 'RESUMEN')
    lines.push(`Total paquetes,${stats.total}`)
    lines.push(`Nuevos,${stats.added}`)
    lines.push(`Eliminados,${stats.removed}`)
    lines.push(`Modificados,${stats.modified}`)
    lines.push(`Sin cambios,${stats.unchanged}`)

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comparacion-paquetes-v${cotizacion1.versionNumber || 1}-v${cotizacion2.versionNumber || 1}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ============================================================================
  // Helpers de UI
  // ============================================================================
  const getStatusIcon = (status: PackageComparisonItem['status']) => {
    switch (status) {
      case 'added': return <PlusCircle className="text-gh-success" />
      case 'removed': return <MinusCircle className="text-gh-error" />
      case 'modified': return <Edit className="text-gh-warning" />
      default: return <CheckCircle2 className="text-gh-text-muted" />
    }
  }

  const getStatusColor = (status: PackageComparisonItem['status']) => {
    switch (status) {
      case 'added': return 'border-gh-success/40 bg-gh-success/5'
      case 'removed': return 'border-gh-error/40 bg-gh-error/5'
      case 'modified': return 'border-gh-warning/40 bg-gh-warning/5'
      default: return 'border-gh-border bg-gh-bg'
    }
  }

  const getStatusLabel = (status: PackageComparisonItem['status']) => {
    switch (status) {
      case 'added': return 'NUEVO'
      case 'removed': return 'ELIMINADO'
      case 'modified': return 'MODIFICADO'
      default: return 'SIN CAMBIOS'
    }
  }

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return 'text-gh-error bg-gh-error/10'
      case 'warning': return 'text-gh-warning bg-gh-warning/10'
      default: return 'text-gh-accent-blue bg-gh-accent-blue/10'
    }
  }

  const areAllIdentical = stats.added === 0 && stats.removed === 0 && stats.modified === 0

  // ============================================================================
  // Renderizado
  // ============================================================================
  return (
    <div className="flex flex-col h-full">
      {/* STATS BAR */}
      <div className="px-4 py-3 bg-gh-bg-secondary/50 border-b border-gh-border rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gh-text-muted">Total:</span>
              <span className="text-sm font-bold text-gh-text">{stats.total}</span>
            </div>
            <div className="h-4 w-px bg-gh-border" />
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs">
                <Plus className="text-gh-success w-2.5 h-2.5" />
                <span className="text-gh-success font-medium">{stats.added}</span>
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Minus className="text-gh-error w-2.5 h-2.5" />
                <span className="text-gh-error font-medium">{stats.removed}</span>
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Edit className="text-gh-warning w-2.5 h-2.5" />
                <span className="text-gh-warning font-medium">{stats.modified}</span>
              </span>
              <span className="flex items-center gap-1 text-xs">
                <CheckCircle2 className="text-gh-text-muted w-2.5 h-2.5" />
                <span className="text-gh-text-muted font-medium">{stats.unchanged}</span>
              </span>
            </div>
          </div>

          {/* Filtros y Export */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(['todos', 'cambios', 'criticos'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filtroTipo === tipo
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : 'bg-gh-bg text-gh-text-muted hover:text-gh-text border border-gh-border'
                  }`}
                >
                  {tipo === 'todos' ? 'Todos' : tipo === 'cambios' ? 'Con cambios' : 'Críticos'}
                </button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportarCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-bg hover:bg-gh-border text-gh-text-muted hover:text-gh-text text-xs font-medium rounded-md border border-gh-border transition-colors"
            >
              <Download className="w-2.5 h-2.5" /> CSV
            </motion.button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        {areAllIdentical ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-gh-success/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-gh-success text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gh-text mb-2">¡Paquetes idénticos!</h3>
            <p className="text-xs font-medium text-gh-text-muted text-center max-w-md">
              No hay diferencias entre los paquetes de la versión {cotizacion1.versionNumber || 1} y 
              la versión {cotizacion2.versionNumber || 1}.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {paquetesFiltrados.map((pkg, index) => (
              <motion.div
                key={pkg.packageName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg overflow-hidden ${getStatusColor(pkg.status)}`}
              >
                {/* Package Header */}
                <button
                  onClick={() => togglePackage(pkg.packageName)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gh-bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-gh-bg flex items-center justify-center">
                      {getStatusIcon(pkg.status)}
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-gh-text">{pkg.packageName}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${
                        pkg.status === 'added' ? 'text-gh-success' :
                        pkg.status === 'removed' ? 'text-gh-error' :
                        pkg.status === 'modified' ? 'text-gh-warning' :
                        'text-gh-text-muted'
                      }`}>
                        {getStatusLabel(pkg.status)}
                        {pkg.status === 'modified' && ` (${pkg.differences.length} cambios)`}
                      </span>
                    </div>
                  </div>

                  {pkg.status === 'modified' && (
                    <div className="flex items-center gap-2">
                      {expandedPackages.has(pkg.packageName) ? (
                        <ChevronUp className="text-gh-text-muted" />
                      ) : (
                        <ChevronDown className="text-gh-text-muted" />
                      )}
                    </div>
                  )}
                </button>

                {/* Package Details (expanded) */}
                <AnimatePresence>
                  {expandedPackages.has(pkg.packageName) && pkg.status === 'modified' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gh-border bg-gh-bg"
                    >
                      <div className="p-4">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gh-border">
                              <th className="text-left py-2 px-3 text-gh-text-muted font-semibold">Campo</th>
                              <th className="text-left py-2 px-3 text-gh-text-muted font-semibold">Antes (v{cotizacion1.versionNumber || 1})</th>
                              <th className="text-left py-2 px-3 text-gh-text-muted font-semibold">Después (v{cotizacion2.versionNumber || 1})</th>
                              <th className="text-center py-2 px-3 text-gh-text-muted font-semibold">Severidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pkg.differences.map((diff, idx) => (
                              <tr key={idx} className="border-b border-gh-border/50 hover:bg-gh-bg-secondary/30">
                                <td className="py-2 px-3 text-gh-text font-medium">{diff.label}</td>
                                <td className="py-2 px-3 text-gh-error font-mono">{formatValue(diff.oldValue)}</td>
                                <td className="py-2 px-3 text-gh-success font-mono">{formatValue(diff.newValue)}</td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityColor(diff.severity)}`}>
                                    {diff.severity}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {paquetesFiltrados.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs font-medium text-gh-text-muted">
                  No hay paquetes que coincidan con el filtro seleccionado.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="px-4 py-3 bg-gh-bg-secondary/30 border-t border-gh-border rounded-b-lg">
        <p className="text-xs text-gh-text-muted text-center">
          Comparando {stats.total} paquete(s) entre v{cotizacion1.versionNumber || 1} → v{cotizacion2.versionNumber || 1}
        </p>
      </div>
    </div>
  )
}

export default PaquetesComparisonContent


