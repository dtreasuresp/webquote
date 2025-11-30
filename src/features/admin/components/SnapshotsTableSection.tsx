'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useEffect, useRef } from 'react'
import { FaCalculator, FaEdit, FaTrash, FaDownload, FaExchangeAlt, FaHistory, FaTimes, FaCheck, FaBox, FaCog, FaPercentage, FaSave } from 'react-icons/fa'
import type { PackageSnapshot } from '@/lib/types'
import { eliminarSnapshot, actualizarSnapshot } from '@/lib/snapshotApi'
import DialogoGenerico, { DialogTab } from './DialogoGenerico'
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

  // Estados para el editor de snapshot inline
  const [snapshotEditando, setSnapshotEditando] = useState<PackageSnapshot | null>(null)
  const [activeModalTab, setActiveModalTab] = useState('descripcion')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [tieneCambios, setTieneCambios] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar snapshot editando cuando cambia editingSnapshotId
  useEffect(() => {
    if (editingSnapshotId) {
      const snapshot = snapshots.find(s => s.id === editingSnapshotId)
      if (snapshot) {
        setSnapshotEditando({ ...snapshot })
        setTieneCambios(false)
        setActiveModalTab('descripcion')
      }
    } else {
      setSnapshotEditando(null)
    }
  }, [editingSnapshotId, snapshots])

  // Detectar cambios
  useEffect(() => {
    if (!snapshotEditando || !editingSnapshotId) return
    const original = snapshots.find(s => s.id === editingSnapshotId)
    if (original) {
      setTieneCambios(JSON.stringify(snapshotEditando) !== JSON.stringify(original))
    }
  }, [snapshotEditando, editingSnapshotId, snapshots])

  // Autoguardado debounced
  useEffect(() => {
    if (!tieneCambios || !snapshotEditando) return
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving')
        await actualizarSnapshot(snapshotEditando.id, snapshotEditando)
        setSnapshots((prev: PackageSnapshot[]) => prev.map(s => s.id === snapshotEditando.id ? snapshotEditando : s))
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
        await refreshSnapshots()
      } catch (error) {
        console.error('Error al autoguardar:', error)
        setAutoSaveStatus('idle')
      }
    }, 1000)
    return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current) }
  }, [tieneCambios, snapshotEditando, setSnapshots, refreshSnapshots])

  const handleCambiar = useCallback((campo: string, valor: unknown) => {
    setSnapshotEditando(prev => prev ? { ...prev, [campo]: valor } : null)
  }, [])

  const handleGuardarYCerrar = async () => {
    if (!snapshotEditando) return
    try {
      setAutoSaveStatus('saving')
      await actualizarSnapshot(snapshotEditando.id, snapshotEditando)
      setSnapshots((prev: PackageSnapshot[]) => prev.map(s => s.id === snapshotEditando.id ? snapshotEditando : s))
      await refreshSnapshots()
      setAutoSaveStatus('idle')
      setEditingSnapshotId(null)
    } catch (error) {
      console.error('Error al guardar:', error)
      setAutoSaveStatus('idle')
      alert('Error al guardar los cambios')
    }
  }

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

      {/* Modal de Edición de Snapshot - Usando DialogoGenerico directamente */}
      {editingSnapshotId && snapshotEditando && (
        <DialogoGenerico
          isOpen={true}
          onClose={() => setEditingSnapshotId(null)}
          title="Editar Paquete"
          description="Personaliza los detalles de tu paquete"
          icon={FaBox}
          variant="premium"
          type="success"
          size="full"
          closeOnEscape={true}
          closeOnBackdropClick={false}
          maxHeight="max-h-[85vh]"
          zIndex={50}
          headerContent={
            tieneCambios ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gh-bg-secondary border border-gh-border">
                {autoSaveStatus === 'saving' && (
                  <span className="text-gh-warning text-sm font-semibold flex items-center gap-2">
                    <FaSave className="animate-spin" /> Guardando...
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="text-gh-success text-sm font-semibold flex items-center gap-2">
                    <FaCheck /> Guardado
                  </span>
                )}
                {autoSaveStatus === 'idle' && (
                  <span className="text-gh-warning text-sm font-semibold flex items-center gap-2">⚠️ Sin guardar</span>
                )}
              </div>
            ) : null
          }
          tabs={[
            {
              id: 'descripcion',
              label: 'Descripción',
              icon: FaEdit,
              content: (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                    <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-bold text-gh-text mb-3">
                      <FaEdit className="text-gh-success" /> Nombre del Paquete
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      value={snapshotEditando.nombre}
                      onChange={(e) => handleCambiar('nombre', e.target.value)}
                      placeholder="Ej: Constructor, Obra Maestra, Imperio Digital"
                      className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                    <label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-bold text-gh-text mb-3">
                      <FaEdit className="text-gh-success" /> Descripción Completa
                    </label>
                    <textarea
                      id="descripcion"
                      value={snapshotEditando.paquete.descripcion || ''}
                      onChange={(e) => handleCambiar('paquete', { ...snapshotEditando.paquete, descripcion: e.target.value })}
                      rows={6}
                      placeholder="Describe tu paquete de forma clara y atractiva..."
                      className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                      <label htmlFor="tipo" className="text-sm font-bold text-gh-text mb-3 block">🏆 Tipo de Paquete</label>
                      <input
                        id="tipo"
                        type="text"
                        value={snapshotEditando.paquete.tipo || ''}
                        onChange={(e) => handleCambiar('paquete', { ...snapshotEditando.paquete, tipo: e.target.value })}
                        placeholder="Ej: BÁSICO, PROFESIONAL, PREMIUM"
                        className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                      <label htmlFor="tagline" className="text-sm font-bold text-gh-text mb-3 block">💬 Lema/Tagline</label>
                      <input
                        id="tagline"
                        type="text"
                        value={snapshotEditando.paquete.tagline || ''}
                        onChange={(e) => handleCambiar('paquete', { ...snapshotEditando.paquete, tagline: e.target.value })}
                        placeholder="Ej: Solución digital personalizada"
                        className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted"
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'servicios',
              label: 'Servicios Base',
              icon: FaBox,
              content: (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gh-success/20 border border-gh-success/30 flex items-center justify-center">
                      <FaBox className="text-gh-success text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gh-text">Servicios Base Incluidos</h3>
                      <p className="text-sm text-gh-text-muted">Total: {snapshotEditando.serviciosBase.length} servicio(s)</p>
                    </div>
                  </div>
                  {snapshotEditando.serviciosBase.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {snapshotEditando.serviciosBase.map((servicio, idx) => (
                        <div key={servicio.id} className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg p-5 rounded-2xl border border-gh-border hover:border-gh-success/30 transition-all hover:shadow-lg">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gh-success/20 border border-gh-success/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-gh-success">✓</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gh-text text-sm">{servicio.nombre}</h4>
                              <p className="text-xs text-gh-text-muted mt-1">ID: {servicio.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <div className="space-y-2 bg-gh-bg rounded-lg p-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-gh-text-muted">Precio Mensual:</span>
                              <span className="font-bold text-gh-success">${servicio.precio.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gh-text-muted">Meses Gratis:</span>
                              <span className="font-bold text-gh-text">{servicio.mesesGratis}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gh-text-muted">Meses Pago:</span>
                              <span className="font-bold text-gh-text">{servicio.mesesPago}</span>
                            </div>
                            <div className="border-t border-gh-border pt-2 mt-2 flex justify-between text-xs">
                              <span className="text-gh-text-muted">Inversión Año 1:</span>
                              <span className="font-bold text-accent">${(servicio.precio * servicio.mesesPago).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gh-bg-secondary rounded-2xl p-8 text-center border border-dashed border-gh-border">
                      <p className="text-gh-text-muted font-semibold">📭 No hay servicios base definidos</p>
                    </div>
                  )}
                </div>
              ),
            },
            {
              id: 'gestion',
              label: 'Gestión',
              icon: FaCog,
              content: (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gh-success/20 border border-gh-success/30 flex items-center justify-center">
                      <FaCog className="text-gh-success text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gh-text">Configuración de Gestión</h3>
                      <p className="text-sm text-gh-text-muted">Define los términos de gestión del paquete</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                    <label htmlFor="precio" className="text-sm font-bold text-gh-text mb-3 block">💰 Precio de Gestión Mensual</label>
                    <input
                      id="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={snapshotEditando.gestion.precio}
                      onChange={(e) => handleCambiar('gestion', { ...snapshotEditando.gestion, precio: Number.parseFloat(e.target.value) })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted text-lg font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                      <label htmlFor="mesesGratis" className="text-sm font-bold text-gh-text mb-3 block">🎁 Meses Gratis</label>
                      <input
                        id="mesesGratis"
                        type="number"
                        min="0"
                        max="12"
                        value={snapshotEditando.gestion.mesesGratis}
                        onChange={(e) => handleCambiar('gestion', { ...snapshotEditando.gestion, mesesGratis: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text text-lg font-bold"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                      <label htmlFor="mesesPago" className="text-sm font-bold text-gh-text mb-3 block">💳 Meses de Pago</label>
                      <input
                        id="mesesPago"
                        type="number"
                        min="0"
                        max="12"
                        value={snapshotEditando.gestion.mesesPago}
                        onChange={(e) => handleCambiar('gestion', { ...snapshotEditando.gestion, mesesPago: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text text-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gh-success/10 to-gh-success/5 rounded-2xl p-6 border border-gh-success/30">
                    <h4 className="font-bold text-gh-success mb-3">📊 Resumen Anual</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gh-text-muted">Meses Gratis:</span>
                        <span className="font-bold text-gh-text">{snapshotEditando.gestion.mesesGratis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gh-text-muted">Inversión en Gestión (Año 1):</span>
                        <span className="font-bold text-gh-success">${(snapshotEditando.gestion.precio * snapshotEditando.gestion.mesesPago).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'descuentos',
              label: 'Descuentos',
              icon: FaPercentage,
              content: (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <FaPercentage className="text-accent text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gh-text">Descuentos y Promociones</h3>
                      <p className="text-sm text-gh-text-muted">Aplica descuentos al desarrollo del paquete</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-8 border border-gh-border hover:border-accent/30 transition-colors">
                    <label htmlFor="descuento" className="text-sm font-bold text-gh-text mb-3 block">% Descuento del Paquete</label>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <input
                          id="descuento"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={snapshotEditando.paquete.descuento}
                          onChange={(e) => handleCambiar('paquete', { ...snapshotEditando.paquete, descuento: Number.parseFloat(e.target.value) })}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-gh-text placeholder:text-gh-text-muted text-2xl font-bold"
                        />
                      </div>
                      <span className="text-3xl font-bold text-accent mb-1">%</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/30">
                    <h4 className="font-bold text-accent mb-4 flex items-center gap-2">
                      <FaPercentage /> Resumen de Descuento
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gh-text-muted">Costo de Desarrollo Original:</span>
                        <span className="font-bold text-gh-text">${snapshotEditando.paquete.desarrollo.toFixed(2)}</span>
                      </div>
                      {snapshotEditando.paquete.descuento > 0 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gh-text-muted">Descuento a aplicar:</span>
                            <span className="font-bold text-accent">${((snapshotEditando.paquete.desarrollo * snapshotEditando.paquete.descuento) / 100).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-accent/30 pt-3 flex justify-between items-center">
                            <span className="text-gh-text font-semibold">Costo Final:</span>
                            <span className="font-bold text-lg text-accent">${(snapshotEditando.paquete.desarrollo - ((snapshotEditando.paquete.desarrollo * snapshotEditando.paquete.descuento) / 100)).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
          defaultTab={activeModalTab}
          onTabChange={setActiveModalTab}
          footer={
            <>
              <button
                onClick={() => setEditingSnapshotId(null)}
                className="flex-1 px-6 py-3 bg-gh-bg-secondary border border-gh-border text-gh-text rounded-xl hover:bg-gh-border hover:border-gh-text transition-all font-semibold flex items-center justify-center gap-2"
              >
                <FaTimes /> Cerrar
              </button>
              <button
                onClick={handleGuardarYCerrar}
                disabled={!tieneCambios}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gh-success to-gh-success-hover text-white rounded-xl hover:shadow-lg hover:shadow-gh-success/30 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <FaCheck /> Guardar y Cerrar
              </button>
            </>
          }
        />
      )}

      {showTimelineModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowTimelineModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-[#161b22] to-[#0d1117] rounded-xl border border-[#30363d] shadow-2xl shadow-black/60 ring-1 ring-white/5 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-[#161b22] to-[#0d1117] rounded-xl border border-[#30363d] shadow-2xl shadow-black/60 ring-1 ring-white/5 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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


