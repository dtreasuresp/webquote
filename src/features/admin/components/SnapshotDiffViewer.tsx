'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Table, Eye, Download, ChevronDown, ChevronUp } from 'lucide-react'
import type { PackageSnapshot } from '@/lib/types'
import { compararSnapshots } from '../utils/snapshotComparison'
import {
  generarDiffFormateado,
  generarTablaHTML,
  generarComparacionSideBySide,
  generarEstadísticasCambios,
} from '../utils/snapshotDiff'

interface SnapshotDiffViewerProps {
  snapshot1: PackageSnapshot
  snapshot2: PackageSnapshot
}

type ViewMode = 'inline' | 'sidebyside' | 'table' | 'stats'

/**
 * Viewer interactivo de diferencias entre snapshots
 * Múltiples vistas de visualización
 * 
 * @phase Phase 12 - Integración de Snapshots Mejorada
 * @date 2025-11-24
 */
export const SnapshotDiffViewer: React.FC<SnapshotDiffViewerProps> = ({ snapshot1, snapshot2 }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('inline')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const comparison = compararSnapshots(snapshot1, snapshot2)
  const diffFormateado = generarDiffFormateado(comparison)
  const comparacionSideBySide = generarComparacionSideBySide(comparison)
  const estadísticas = generarEstadísticasCambios(comparison)

  const toggleItem = (id: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedItems(newSet)
  }

  const viewModes = [
    { id: 'inline', label: 'Inline', icon: Code },
    { id: 'sidebyside', label: 'Side-by-Side', icon: Table },
    { id: 'table', label: 'Tabla', icon: Table },
    { id: 'stats', label: 'Estadísticas', icon: Eye },
  ] as const

  return (
    <div className="space-y-4">
      {/* CONTROLES DE VISTA */}
      <div className="flex gap-2 flex-wrap border-b border-gh-border pb-4">
        {viewModes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setViewMode(id as ViewMode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-all ${
              viewMode === id
                ? 'bg-gh-accent-blue text-white'
                : 'bg-gh-bg-secondary text-gh-text border border-gh-border hover:bg-gh-card'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* VISTA INLINE */}
      {viewMode === 'inline' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {diffFormateado.lineas.map((linea, index) => (
            <motion.div
              key={index}
              className={`p-3 rounded-lg border ${linea.color}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{linea.icon}</span>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="font-mono text-sm font-semibold break-all">{linea.campo}</p>
                  <div className="text-xs space-y-0.5">
                    {linea.valorAntiguo && (
                      <p className="opacity-75">
                        <span className="opacity-50">Anterior:</span> <code>{linea.valorAntiguo}</code>
                      </p>
                    )}
                    {linea.valorNuevo && (
                      <p className="opacity-75">
                        <span className="opacity-50">Nuevo:</span> <code>{linea.valorNuevo}</code>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* VISTA SIDE-BY-SIDE */}
      {viewMode === 'sidebyside' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-3">
            <h4 className="font-semibold text-gh-text flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gh-error/10 text-gh-error text-xs">Anterior</span>
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(comparacionSideBySide.izquierda).map(([campo, valor]) => (
                <div key={campo} className="p-2 rounded-lg bg-gh-error/5 border border-gh-error/20 text-sm">
                  <p className="text-xs text-gh-text-muted font-mono">{campo}</p>
                  <code className="text-gh-text break-all">{valor}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gh-text flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gh-success/10 text-gh-success text-xs">Nuevo</span>
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(comparacionSideBySide.derecha).map(([campo, valor]) => (
                <div key={campo} className="p-2 rounded-lg bg-gh-success/5 border border-gh-success/20 text-sm">
                  <p className="text-xs text-gh-text-muted font-mono">{campo}</p>
                  <code className="text-gh-text break-all">{valor}</code>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* VISTA TABLA */}
      {viewMode === 'table' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto"
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gh-bg-secondary">
                <th className="border border-gh-border p-3 text-left font-semibold">Tipo</th>
                <th className="border border-gh-border p-3 text-left font-semibold">Campo</th>
                <th className="border border-gh-border p-3 text-left font-semibold">Anterior</th>
                <th className="border border-gh-border p-3 text-left font-semibold">Nuevo</th>
              </tr>
            </thead>
            <tbody>
              {diffFormateado.lineas.map((linea, index) => (
                <tr key={index} className={`border-b border-gh-border ${linea.color}`}>
                  <td className="border border-gh-border p-3 text-center">{linea.icon}</td>
                  <td className="border border-gh-border p-3 font-mono text-xs">{linea.campo}</td>
                  <td className="border border-gh-border p-3 font-mono text-xs break-all max-w-xs">
                    {linea.valorAntiguo}
                  </td>
                  <td className="border border-gh-border p-3 font-mono text-xs break-all max-w-xs">
                    {linea.valorNuevo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* VISTA ESTADÍSTICAS */}
      {viewMode === 'stats' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* CAMBIOS POR TIPO */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gh-text">Cambios por Tipo</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-gh-success/10 border border-gh-success/30">
                <p className="text-xs font-medium text-gh-text-muted mb-1">Agregados</p>
                <p className="text-2xl font-bold text-gh-success">{estadísticas.por_tipo.added}</p>
              </div>
              <div className="p-4 rounded-lg bg-gh-error/10 border border-gh-error/30">
                <p className="text-xs font-medium text-gh-text-muted mb-1">Eliminados</p>
                <p className="text-2xl font-bold text-gh-error">{estadísticas.por_tipo.removed}</p>
              </div>
              <div className="p-4 rounded-lg bg-gh-warning/10 border border-gh-warning/30">
                <p className="text-xs font-medium text-gh-text-muted mb-1">Modificados</p>
                <p className="text-2xl font-bold text-gh-warning">{estadísticas.por_tipo.modified}</p>
              </div>
            </div>
          </div>

          {/* CAMBIOS POR SEVERIDAD */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gh-text">Cambios por Severidad</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-gh-error/10 border border-gh-error/30">
                <p className="text-xs font-medium text-gh-text-muted mb-1">Críticos</p>
                <p className="text-2xl font-bold text-gh-error">{estadísticas.por_severidad.critical}</p>
              </div>
              <div className="p-4 rounded-lg bg-gh-warning/10 border border-gh-warning/30">
                <p className="text-xs font-medium text-gh-text-muted mb-1">Advertencias</p>
                <p className="text-2xl font-bold text-gh-warning">{estadísticas.por_severidad.warning}</p>
              </div>
              <div className="p-4 rounded-lg bg-gh-success/10 border border-gh-success/30">
                <p className="text-xs font-medium text-gh-text-muted mb-1">Info</p>
                <p className="text-2xl font-bold text-gh-success">{estadísticas.por_severidad.info}</p>
              </div>
            </div>
          </div>

          {/* CAMPOS MÁS MODIFICADOS */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gh-text">Campos Más Modificados</h4>
            <div className="space-y-2">
              {estadísticas.campos_mas_modificados.length > 0 ? (
                estadísticas.campos_mas_modificados.map(({ campo, veces }, index) => (
                  <div
                    key={campo}
                    className="p-3 rounded-lg bg-gh-bg-secondary border border-gh-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-sm">{campo}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gh-accent-blue/20 text-gh-accent-blue">
                        {veces} cambio{veces !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gh-bg rounded-full h-1.5">
                      <div
                        className="bg-gh-accent-blue h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(veces / (estadísticas.campos_mas_modificados[0]?.veces || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs font-medium text-gh-text-muted">Sin cambios significativos</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* RESUMEN */}
      <div className="p-4 rounded-lg bg-gh-bg-secondary border border-gh-border">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gh-text-muted">{diffFormateado.resumenText}</div>
          <button
            onClick={() => {
              const element = document.createElement('a')
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(diffFormateado.resumenText))
              element.setAttribute('download', 'snapshot-diff.txt')
              element.style.display = 'none'
              document.body.appendChild(element)
              element.click()
              document.body.removeChild(element)
            }}
            className="px-3 py-2 rounded-lg bg-gh-accent-blue/20 text-gh-accent-blue hover:bg-gh-accent-blue/30 text-xs font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-3 h-3" /> Descargar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SnapshotDiffViewer


