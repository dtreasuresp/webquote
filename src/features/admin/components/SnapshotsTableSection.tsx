'use client'

import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { FaCalculator, FaEdit, FaTrash, FaDownload, FaExchangeAlt, FaHistory } from 'react-icons/fa'
import type { PackageSnapshot } from '@/lib/types'
import { eliminarSnapshot, actualizarSnapshot } from '@/lib/snapshotApi'
import SnapshotEditModal from './SnapshotEditModal'
import { SnapshotTimeline } from './index'
import SnapshotComparison from './SnapshotComparison'
import { generateSnapshotPDF } from '@/features/pdf-export/utils/generator'

interface SnapshotsTableSectionProps {
  readonly snapshots: PackageSnapshot[]
  readonly setSnapshots: (snapshots: PackageSnapshot[] | ((prev: PackageSnapshot[]) => PackageSnapshot[])) => void
  readonly cargandoSnapshots: boolean
  readonly errorSnapshots: string | null
  readonly refreshSnapshots: () => Promise<void>
}

export default function SnapshotsTableSection({
  snapshots,
  setSnapshots,
  cargandoSnapshots,
  errorSnapshots,
  refreshSnapshots,
}: SnapshotsTableSectionProps) {
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null)
  const [comparacionActiva, setComparacionActiva] = useState<{
    snapshot1: PackageSnapshot
    snapshot2: PackageSnapshot
  } | null>(null)
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [snapshotParaComparar, setSnapshotParaComparar] = useState<PackageSnapshot | null>(null)

  const calcularCostoInicialSnapshot = (snapshot: PackageSnapshot) => {
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
    const serviciosBaseMes1 = snapshot.serviciosBase.reduce((sum, s) => {
      if (s.nombre.toLowerCase() !== 'gestión') {
        return sum + (s.precio || 0)
      }
      return sum
    }, 0)
    return desarrolloConDescuento + serviciosBaseMes1
  }

  const calcularCostoAño1Snapshot = (snapshot: PackageSnapshot) => {
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * s.mesesPago)
    }, 0)
    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * s.mesesPago
    }, 0)
    return desarrolloConDescuento + serviciosBaseCosto + otrosServiciosTotal
  }

  const calcularCostoAño2Snapshot = (snapshot: PackageSnapshot) => {
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * 12)
    }, 0)
    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * 12
    }, 0)
    return serviciosBaseCosto + otrosServiciosTotal
  }

  const handleEliminarSnapshot = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este paquete?')) {
      try {
        await eliminarSnapshot(id)
        setSnapshots(snapshots.filter(s => s.id !== id))
        await refreshSnapshots()
        alert('✅ Paquete eliminado correctamente')
      } catch (error) {
        console.error('Error al eliminar snapshot:', error)
        alert('Error al eliminar el paquete. Por favor intenta de nuevo.')
      }
    }
  }

  const handleDescargarPdf = useCallback((snapshot: PackageSnapshot) => {
    generateSnapshotPDF(snapshot)
  }, [])

  const handleToggleActivo = useCallback(async (snapshotId: string, marcado: boolean) => {
    const snapshot = snapshots.find(s => s.id === snapshotId)
    if (!snapshot) return

    const provisional = { ...snapshot, activo: marcado }
    setSnapshots(snapshots.map(s => s.id === snapshotId ? provisional : s))
    try {
      const actualizado = { ...provisional }
      actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
      actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
      actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
      const guardado = await actualizarSnapshot(actualizado.id, actualizado)
      setSnapshots(snapshots.map(s => s.id === snapshotId ? guardado : s))
      await refreshSnapshots()
    } catch (err) {
      console.error('Error al autoguardar estado activo:', err)
      setSnapshots(snapshots.map(s => s.id === snapshotId ? { ...s, activo: !marcado } : s))
      alert('No se pudo actualizar el estado Activo. Intenta nuevamente.')
    }
  }, [snapshots, setSnapshots, refreshSnapshots])

  const handleCompararSnapshot = useCallback((snapshot: PackageSnapshot) => {
    if (snapshotParaComparar && snapshotParaComparar.id !== snapshot.id) {
      setComparacionActiva({
        snapshot1: snapshotParaComparar,
        snapshot2: snapshot,
      })
      setSnapshotParaComparar(null)
    } else if (!snapshotParaComparar) {
      setSnapshotParaComparar(snapshot)
    } else {
      setSnapshotParaComparar(null)
    }
  }, [snapshotParaComparar])

  const handleVerTimeline = () => {
    setShowTimelineModal(true)
  }

  if (cargandoSnapshots) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gh-bg-secondary rounded-2xl border border-gh-border p-8 text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <FaCalculator className="text-white text-3xl" />
          </motion.div>
          <p className="text-lg text-white font-semibold">Cargando paquetes...</p>
        </div>
      </motion.div>
    )
  }

  if (errorSnapshots) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
          className="bg-gh-bg-secondary rounded-2xl border-2 border-gh-danger/50 p-8"
      >
        <p className="text-red-400 font-semibold">{errorSnapshots}</p>
      </motion.div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gh-bg-secondary rounded-2xl border border-gh-border p-8 text-center"
      >
        <p className="text-white/80 font-semibold">No hay paquetes creados aún</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gh-text">
          Paquetes Creados ({snapshots.filter(s => s.activo).length})
        </h2>
        {snapshots.length > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVerTimeline()}
            className="px-4 py-2 bg-gh-info text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold flex items-center gap-2"
          >
            <FaHistory /> Línea de Tiempo
          </motion.button>
        )}
      </div>

      <div className="space-y-6 md:grid md:grid-cols-2 gap-10 md:space-y-0">
        {snapshots.filter(s => s.activo).map((snapshot, idx) => (
          <motion.div
            key={snapshot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-r from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border hover:border-gh-success transition-all overflow-hidden"
          >
              <div className="bg-gradient-to-r from-gh-bg to-gh-bg-secondary p-4 border-b border-gh-border">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gh-text">
                    📦 {snapshot.nombre}
                  </h3>
                  {snapshot.paquete.tipo && (
                    <p className="text-xs font-semibold tracking-wide text-gh-text mt-1 uppercase">
                      🏆 {snapshot.paquete.tipo}
                    </p>
                  )}
                  <p className="text-xs text-gh-text-muted mt-2">
                    {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={`snapshot-activo-${snapshot.id}`}
                    type="checkbox"
                    checked={snapshot.activo}
                    onChange={(e) => handleToggleActivo(snapshot.id, e.target.checked)}
                    className="w-5 h-5 cursor-pointer accent-gh-success"
                  />
                  <label htmlFor={`snapshot-activo-${snapshot.id}`} className="font-semibold text-white text-sm">Activo</label>
                </div>
              </div>
            </div>

                <div className="p-4 space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-gh-text"><strong className="text-gh-text">Desarrollo:</strong> ${snapshot.paquete.desarrollo.toFixed(2)}</p>
                {snapshot.paquete.descuento > 0 && (
                  <p className="text-sm text-white/90"><strong className="text-white">Descuento:</strong> {snapshot.paquete.descuento}%</p>
                )}
              </div>
                <div className="space-y-2 border-t border-gh-border pt-3">
                <p className="text-sm font-semibold text-gh-text">Costos:</p>
                <p className="text-xs text-gh-text-muted">Pago Inicial: <span className="font-bold text-gh-text">${snapshot.costos.inicial.toFixed(2)}</span></p>
                <p className="text-xs text-white/80">Año 1: <span className="font-bold text-white">${snapshot.costos.año1.toFixed(2)}</span></p>
                <p className="text-xs text-white/80">Año 2+: <span className="font-bold text-white">${snapshot.costos.año2.toFixed(2)}</span></p>
              </div>
                <div className="flex gap-2 pt-3 border-t border-gh-border">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingSnapshotId(snapshot.id)}
                  className="flex-1 px-3 py-2 bg-gh-success text-white rounded-lg hover:bg-gh-success-hover transition-all text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FaEdit /> Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCompararSnapshot(snapshot)}
                  className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                    snapshotParaComparar?.id === snapshot.id
                      ? 'bg-gh-success text-white border-gh-success'
                      : 'bg-gh-btn-ghost text-gh-text border-gh-border hover:bg-gh-bg-secondary'
                  }`}
                  title={snapshotParaComparar ? 'Seleccionar segundo paquete' : 'Seleccionar para comparar'}
                >
                  <FaExchangeAlt />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDescargarPdf(snapshot)}
                  className="px-3 py-2 bg-gh-btn-ghost text-gh-text rounded-lg border border-gh-border hover:bg-gh-bg-secondary transition-all text-sm"
                >
                  <FaDownload />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEliminarSnapshot(snapshot.id)}
                  className="px-3 py-2 bg-gh-danger text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                >
                  <FaTrash />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {editingSnapshotId && (
        <SnapshotEditModal
          snapshotId={editingSnapshotId}
          snapshots={snapshots}
          setSnapshots={setSnapshots}
          onClose={() => setEditingSnapshotId(null)}
          refreshSnapshots={refreshSnapshots}
        />
      )}

      {showTimelineModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowTimelineModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gh-bg rounded-2xl border border-gh-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gh-border flex items-center justify-between sticky top-0 bg-gh-bg-secondary">
              <h3 className="text-xl font-bold text-gh-text flex items-center gap-2">
                <FaHistory /> Línea de Tiempo de Paquetes
              </h3>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="text-gh-text-muted hover:text-gh-text text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <SnapshotTimeline
                snapshots={snapshots}
                onSelectSnapshot={() => {}}
                maxItems={snapshots.length}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {comparacionActiva && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setComparacionActiva(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gh-bg rounded-2xl border border-gh-border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gh-border flex items-center justify-between sticky top-0 bg-gh-bg-secondary">
              <h3 className="text-xl font-bold text-gh-text flex items-center gap-2">
                <FaExchangeAlt /> Comparación de Paquetes
              </h3>
              <button
                onClick={() => setComparacionActiva(null)}
                className="text-gh-text-muted hover:text-gh-text text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <SnapshotComparison
                snapshot1={comparacionActiva.snapshot1}
                snapshot2={comparacionActiva.snapshot2}
                onRollback={async () => {
                  setComparacionActiva(null)
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}


