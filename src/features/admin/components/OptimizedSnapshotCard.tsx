/**
 * PHASE 14: Optimized Snapshot Card Component
 * Memoized component to prevent unnecessary re-renders
 * @date 2025-11-24
 */

'use client'

import React, { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FaEdit, FaTrash, FaDownload, FaExchangeAlt } from 'react-icons/fa'
import type { PackageSnapshot } from '@/lib/types'

export interface OptimizedSnapshotCardProps {
  snapshot: PackageSnapshot
  index: number
  isSelected?: boolean
  onEdit?: (snapshot: PackageSnapshot) => void
  onDelete?: (id: string) => void
  onDownload?: (snapshot: PackageSnapshot) => void
  onCompare?: (snapshot: PackageSnapshot) => void
  onToggleActivo?: (snapshot: PackageSnapshot, activo: boolean) => void
}

/**
 * Memoized snapshot card - only re-renders if props actually change
 */
export const OptimizedSnapshotCard = React.memo(
  ({
    snapshot,
    index,
    isSelected = false,
    onEdit,
    onDelete,
    onDownload,
    onCompare,
    onToggleActivo,
  }: OptimizedSnapshotCardProps) => {
    // Memoize callbacks to prevent child re-renders
    const handleEdit = useCallback(() => onEdit?.(snapshot), [snapshot, onEdit])
    const handleDelete = useCallback(() => onDelete?.(snapshot.id), [snapshot.id, onDelete])
    const handleDownload = useCallback(() => onDownload?.(snapshot), [snapshot, onDownload])
    const handleCompare = useCallback(() => onCompare?.(snapshot), [snapshot, onCompare])
    const handleToggleActivo = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => 
        onToggleActivo?.(snapshot, e.target.checked),
      [snapshot, onToggleActivo]
    )

    // Memoize derived values
    const displayData = useMemo(() => ({
      costoInicial: snapshot.costos.inicial.toFixed(2),
      costoAño1: snapshot.costos.año1.toFixed(2),
      costoAño2: snapshot.costos.año2.toFixed(2),
      fecha: new Date(snapshot.createdAt).toLocaleDateString('es-ES'),
    }), [snapshot.costos, snapshot.createdAt])

    return (
      <motion.div
        key={snapshot.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-gradient-to-r from-gh-bg-secondary to-gh-bg rounded-xl border transition-all overflow-hidden ${
          isSelected
            ? 'border-gh-success shadow-lg shadow-gh-success/20'
            : 'border-gh-border hover:border-gh-success'
        }`}
      >
        <div className="bg-gradient-to-r from-gh-bg to-gh-bg-secondary p-4 border-b border-gh-border">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gh-text">📦 {snapshot.nombre}</h3>
              {snapshot.paquete.tipo && (
                <p className="text-xs font-semibold tracking-wide text-gh-text mt-1 uppercase">
                  🏆 {snapshot.paquete.tipo}
                </p>
              )}
              <p className="text-xs text-gh-text-muted mt-2">{displayData.fecha}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id={`snapshot-activo-${snapshot.id}`}
                type="checkbox"
                checked={snapshot.activo}
                onChange={handleToggleActivo}
                className="w-5 h-5 cursor-pointer accent-gh-success"
              />
              <label 
                htmlFor={`snapshot-activo-${snapshot.id}`} 
                className="font-semibold text-white text-sm"
              >
                Activo
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-sm text-gh-text">
              <strong className="text-gh-text">Desarrollo:</strong> ${snapshot.paquete.desarrollo.toFixed(2)}
            </p>
            {snapshot.paquete.descuento > 0 && (
              <p className="text-sm text-white/90">
                <strong className="text-white">Descuento:</strong> {snapshot.paquete.descuento}%
              </p>
            )}
          </div>
          <div className="space-y-2 border-t border-gh-border pt-3">
            <p className="text-sm font-semibold text-gh-text">Costos:</p>
            <p className="text-xs text-gh-text-muted">
              Pago Inicial: <span className="font-bold text-gh-text">${displayData.costoInicial}</span>
            </p>
            <p className="text-xs text-white/80">
              Año 1: <span className="font-bold text-white">${displayData.costoAño1}</span>
            </p>
            <p className="text-xs text-white/80">
              Año 2+: <span className="font-bold text-white">${displayData.costoAño2}</span>
            </p>
          </div>
          <div className="flex gap-2 pt-3 border-t border-gh-border">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="flex-1 px-3 py-2 bg-gh-success text-white rounded-lg hover:bg-gh-success-hover transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              <FaEdit /> Editar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompare}
              className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                isSelected
                  ? 'bg-gh-success text-white border-gh-success'
                  : 'bg-gh-btn-ghost text-gh-text border-gh-border hover:bg-gh-bg-secondary'
              }`}
              title="Seleccionar para comparar"
            >
              <FaExchangeAlt />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="px-3 py-2 bg-gh-btn-ghost text-gh-text rounded-lg border border-gh-border hover:bg-gh-bg-secondary transition-all text-sm"
            >
              <FaDownload />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="px-3 py-2 bg-gh-danger text-white rounded-lg hover:bg-red-600 transition-all text-sm"
            >
              <FaTrash />
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if specific props change
    return (
      prevProps.snapshot.id === nextProps.snapshot.id &&
      prevProps.snapshot.nombre === nextProps.snapshot.nombre &&
      prevProps.snapshot.activo === nextProps.snapshot.activo &&
      prevProps.snapshot.costos.inicial === nextProps.snapshot.costos.inicial &&
      prevProps.snapshot.costos.año1 === nextProps.snapshot.costos.año1 &&
      prevProps.snapshot.costos.año2 === nextProps.snapshot.costos.año2 &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.index === nextProps.index
    )
  }
)

OptimizedSnapshotCard.displayName = 'OptimizedSnapshotCard'

export default OptimizedSnapshotCard
