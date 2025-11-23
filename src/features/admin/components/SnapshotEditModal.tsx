'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { FaTimes, FaCheck } from 'react-icons/fa'
import type { PackageSnapshot } from '@/lib/types'
import { actualizarSnapshot } from '@/lib/snapshotApi'

interface SnapshotEditModalProps {
  readonly snapshotId: string
  readonly snapshots: PackageSnapshot[]
  readonly setSnapshots: (snapshots: PackageSnapshot[] | ((prev: PackageSnapshot[]) => PackageSnapshot[])) => void
  readonly onClose: () => void
  readonly refreshSnapshots: () => Promise<void>
}

export default function SnapshotEditModal({
  snapshotId,
  snapshots,
  setSnapshots,
  onClose,
  refreshSnapshots,
}: SnapshotEditModalProps) {
  const snapshot = snapshots.find(s => s.id === snapshotId)
  if (!snapshot) return null

  const [snapshotEditando, setSnapshotEditando] = useState<PackageSnapshot>(snapshot)
  const [activeModalTab, setActiveModalTab] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [tieneCambios, setTieneCambios] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detectar cambios
  useEffect(() => {
    const snapshotJson = JSON.stringify(snapshotEditando)
    const originalJson = JSON.stringify(snapshot)
    setTieneCambios(snapshotJson !== originalJson)
  }, [snapshotEditando, snapshot])

  // Autoguardado debounced
  useEffect(() => {
    if (!tieneCambios) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

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

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [tieneCambios, snapshotEditando, setSnapshots, refreshSnapshots])

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const tabs = [
    { label: '📋 Descripción' },
    { label: '🌐 Servicios Base' },
    { label: '📋 Gestión' },
    { label: '🎯 Descuentos' },
  ]

  const handleCambiar = (campo: string, valor: any) => {
    setSnapshotEditando(prev => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const handleGuardarYCerrar = async () => {
    try {
      setAutoSaveStatus('saving')
      await actualizarSnapshot(snapshotEditando.id, snapshotEditando)
      setSnapshots((prev: PackageSnapshot[]) => prev.map(s => s.id === snapshotEditando.id ? snapshotEditando : s))
      await refreshSnapshots()
      setAutoSaveStatus('idle')
      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
      setAutoSaveStatus('idle')
      alert('❌ Error al guardar los cambios')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0a0a0f] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#1a1a24] border-b border-white/10 p-6 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Editar Paquete</h2>
              <p className="text-sm text-white/70">📦 {snapshotEditando.nombre}</p>
            </div>
            <div className="flex items-center gap-4">
              {tieneCambios && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-semibold"
                >
                  {autoSaveStatus === 'saving' && (
                    <span className="text-white">💾 Guardando...</span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-green-600">✅ Guardado</span>
                  )}
                  {autoSaveStatus === 'idle' && (
                    <span className="text-orange-500">⚠️ Sin guardar</span>
                  )}
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/10 bg-[#0a0a0f] sticky top-[80px] z-10">
            <div className="flex gap-2 p-4 overflow-x-auto">
              {tabs.map((tab, idx) => (
                <motion.button
                  key={`tab-${idx}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModalTab(idx)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeModalTab === idx
                      ? 'bg-white text-[#0a0a0f]'
                      : 'bg-[#1a1a24] text-white/70 hover:bg-[#12121a]'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {activeModalTab === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="nombre" className="block text-sm font-bold text-white mb-2">
                    Nombre del Paquete
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={snapshotEditando.nombre}
                    onChange={(e) => handleCambiar('nombre', e.target.value)}
                    placeholder="Nombre del paquete"
                    className="w-full px-4 py-2 border border-white/10 rounded-lg focus:border-white/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-bold text-white mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    value={snapshotEditando.paquete.descripcion || ''}
                    onChange={(e) => handleCambiar('paquete', {
                      ...snapshotEditando.paquete,
                      descripcion: e.target.value,
                    })}
                    rows={5}
                    placeholder="Descripción del paquete"
                    className="w-full px-4 py-2 border border-white/10 rounded-lg focus:border-white/20 focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {activeModalTab === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-white">Servicios Base</h3>
                <div className="space-y-3">
                  {snapshotEditando.serviciosBase.map((servicio) => (
                    <div key={servicio.id} className="bg-[#12121a] p-4 rounded-lg border border-white/10">
                      <p className="font-semibold text-white">{servicio.nombre}</p>
                      <p className="text-sm text-white/70">
                        Precio: ${servicio.precio.toFixed(2)} - Meses Pago: {servicio.mesesPago}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeModalTab === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-white">Gestión</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="precio" className="block text-sm font-bold text-white mb-2">
                      Precio
                    </label>
                    <input
                      id="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      value={snapshotEditando.gestion.precio}
                      onChange={(e) => handleCambiar('gestion', {
                        ...snapshotEditando.gestion,
                        precio: Number.parseFloat(e.target.value),
                      })}
                      placeholder="Precio de gestión"
                      className="w-full px-4 py-2 border border-white/10 rounded-lg focus:border-white/20 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="mesesGratis" className="block text-sm font-bold text-white mb-2">
                        Meses Gratis
                      </label>
                      <input
                        id="mesesGratis"
                        type="number"
                        min="0"
                        max="12"
                        value={snapshotEditando.gestion.mesesGratis}
                        onChange={(e) => handleCambiar('gestion', {
                          ...snapshotEditando.gestion,
                          mesesGratis: Number(e.target.value),
                        })}
                        placeholder="Meses gratis"
                        className="w-full px-4 py-2 border border-white/10 rounded-lg focus:border-white/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="mesesPago" className="block text-sm font-bold text-white mb-2">
                        Meses Pago
                      </label>
                      <input
                        id="mesesPago"
                        type="number"
                        min="0"
                        max="12"
                        value={snapshotEditando.gestion.mesesPago}
                        onChange={(e) => handleCambiar('gestion', {
                          ...snapshotEditando.gestion,
                          mesesPago: Number(e.target.value),
                        })}
                        placeholder="Meses de pago"
                        className="w-full px-4 py-2 border border-white/10 rounded-lg focus:border-white/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeModalTab === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-white">Descuentos</h3>
                <div>
                  <label htmlFor="descuento" className="block text-sm font-bold text-white mb-2">
                    Descuento del Paquete (%)
                  </label>
                  <input
                    id="descuento"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={snapshotEditando.paquete.descuento}
                    onChange={(e) => handleCambiar('paquete', {
                      ...snapshotEditando.paquete,
                      descuento: Number.parseFloat(e.target.value),
                    })}
                    placeholder="Porcentaje de descuento"
                    className="w-full px-4 py-2 border border-white/10 rounded-lg focus:border-white/20 focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 bg-[#12121a] p-6 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[#1a1a24] text-[#0a0a0f] rounded-lg hover:bg-[#12121a] transition-all font-semibold flex items-center justify-center gap-2"
            >
              <FaTimes /> Cerrar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGuardarYCerrar}
              disabled={!tieneCambios}
              className="flex-1 px-6 py-3 bg-white text-[#0a0a0f] rounded-lg hover:bg-white/90 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheck /> Guardar y Cerrar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}





