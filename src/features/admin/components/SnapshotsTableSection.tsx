'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaCalculator, FaEdit, FaTrash, FaDownload } from 'react-icons/fa'
import type { PackageSnapshot } from '@/lib/types'
import { eliminarSnapshot, actualizarSnapshot } from '@/lib/snapshotApi'
import SnapshotEditModal from './SnapshotEditModal'
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

  const handleDescargarPdf = (snapshot: PackageSnapshot) => {
    generateSnapshotPDF(snapshot)
  }

  const handleToggleActivo = async (snapshot: PackageSnapshot, marcado: boolean) => {
    const provisional = { ...snapshot, activo: marcado }
    setSnapshots(snapshots.map(s => s.id === snapshot.id ? provisional : s))
    try {
      const actualizado = { ...provisional }
      actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
      actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
      actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
      const guardado = await actualizarSnapshot(actualizado.id, actualizado)
      setSnapshots(snapshots.map(s => s.id === snapshot.id ? guardado : s))
      await refreshSnapshots()
    } catch (err) {
      console.error('Error al autoguardar estado activo:', err)
      setSnapshots(snapshots.map(s => s.id === snapshot.id ? { ...s, activo: !marcado } : s))
      alert('No se pudo actualizar el estado Activo. Intenta nuevamente.')
    }
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
      <h2 className="text-xl font-bold text-gh-text">
        Paquetes Creados ({snapshots.filter(s => s.activo).length})
      </h2>

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
                    onChange={(e) => handleToggleActivo(snapshot, e.target.checked)}
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
    </div>
  )
}


