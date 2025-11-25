'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { FaTimes, FaCheck, FaEdit, FaBox, FaCog, FaPercentage, FaSave } from 'react-icons/fa'
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
    { label: 'Descripción', icon: FaEdit },
    { label: 'Servicios Base', icon: FaBox },
    { label: 'Gestión', icon: FaCog },
    { label: 'Descuentos', icon: FaPercentage },
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
      alert('Error al guardar los cambios')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gh-bg-secondary via-gh-bg to-gh-bg-secondary rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gh-border"
        >
          {/* Header Moderno */}
          <motion.div className="bg-gradient-to-r from-gh-bg via-gh-bg-secondary to-gh-bg border-b border-gh-border p-8 flex items-center justify-between sticky top-0 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gh-success/20 border border-gh-success/30 flex items-center justify-center">
                  <FaBox className="text-gh-success text-xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gh-text">Editar Paquete</h2>
                  <p className="text-sm text-gh-text-muted mt-1">Personaliza los detalles de tu paquete</p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              {tieneCambios && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gh-bg-secondary border border-gh-border"
                >
                  {autoSaveStatus === 'saving' && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="text-gh-warning text-sm font-semibold flex items-center gap-2"
                    >
                      <FaSave /> Guardando...
                    </motion.span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-gh-success text-sm font-semibold flex items-center gap-2">
                      <FaCheck /> Guardado
                    </span>
                  )}
                  {autoSaveStatus === 'idle' && (
                    <span className="text-gh-warning text-sm font-semibold flex items-center gap-2">
                      <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        ⚠️
                      </motion.div>
                      Sin guardar
                    </span>
                  )}
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gh-text-muted hover:text-gh-text transition-colors w-10 h-10 rounded-lg hover:bg-gh-border flex items-center justify-center"
              >
                <FaTimes className="text-2xl" />
              </motion.button>
            </div>
          </motion.div>

          {/* Tabs Moderno */}
          <div className="border-b border-gh-border bg-gh-bg px-6 sticky top-[120px] z-10">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab, idx) => {
                const TabIcon = tab.icon
                return (
                  <motion.button
                    key={`tab-${idx}`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveModalTab(idx)}
                    className={`px-6 py-4 font-semibold transition-all whitespace-nowrap flex items-center gap-2 relative group ${
                      activeModalTab === idx
                        ? 'text-gh-success'
                        : 'text-gh-text-muted hover:text-gh-text'
                    }`}
                  >
                    <motion.span
                      animate={activeModalTab === idx ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TabIcon />
                    </motion.span>
                    {tab.label}
                    
                    {/* Underline animado */}
                    {activeModalTab === idx && (
                      <motion.div
                        layoutId="tabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gh-success to-gh-success-hover rounded-t-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 bg-gh-bg"
          >
            {activeModalTab === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Nombre */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors"
                >
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
                </motion.div>

                {/* Descripción */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors"
                >
                  <label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-bold text-gh-text mb-3">
                    <FaEdit className="text-gh-success" /> Descripción Completa
                  </label>
                  <textarea
                    id="descripcion"
                    value={snapshotEditando.paquete.descripcion || ''}
                    onChange={(e) => handleCambiar('paquete', {
                      ...snapshotEditando.paquete,
                      descripcion: e.target.value,
                    })}
                    rows={6}
                    placeholder="Describe tu paquete de forma clara y atractiva..."
                    className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted resize-none"
                  />
                  <p className="text-xs text-gh-text-muted mt-2">Máximo 500 caracteres para que sea conciso</p>
                </motion.div>

                {/* Información Adicional */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                    <label htmlFor="tipo" className="text-sm font-bold text-gh-text mb-3 block">
                      🏆 Tipo de Paquete
                    </label>
                    <input
                      id="tipo"
                      type="text"
                      value={snapshotEditando.paquete.tipo || ''}
                      onChange={(e) => handleCambiar('paquete', {
                        ...snapshotEditando.paquete,
                        tipo: e.target.value,
                      })}
                      placeholder="Ej: BÁSICO, PROFESIONAL, PREMIUM"
                      className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors">
                    <label htmlFor="tagline" className="text-sm font-bold text-gh-text mb-3 block">
                      💬 Lema/Tagline
                    </label>
                    <input
                      id="tagline"
                      type="text"
                      value={snapshotEditando.paquete.tagline || ''}
                      onChange={(e) => handleCambiar('paquete', {
                        ...snapshotEditando.paquete,
                        tagline: e.target.value,
                      })}
                      placeholder="Ej: Solución digital personalizada"
                      className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeModalTab === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-gh-success/20 border border-gh-success/30 flex items-center justify-center">
                    <FaBox className="text-gh-success text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gh-text">Servicios Base Incluidos</h3>
                    <p className="text-sm text-gh-text-muted">Total: {snapshotEditando.serviciosBase.length} servicio(s)</p>
                  </div>
                </motion.div>
                
                {snapshotEditando.serviciosBase.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {snapshotEditando.serviciosBase.map((servicio, idx) => (
                      <motion.div
                        key={servicio.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg p-5 rounded-2xl border border-gh-border hover:border-gh-success/30 transition-all hover:shadow-lg"
                      >
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
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gh-bg-secondary rounded-2xl p-8 text-center border border-dashed border-gh-border"
                  >
                    <p className="text-gh-text-muted font-semibold">📭 No hay servicios base definidos</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeModalTab === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-gh-success/20 border border-gh-success/30 flex items-center justify-center">
                    <FaCog className="text-gh-success text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gh-text">Configuración de Gestión</h3>
                    <p className="text-sm text-gh-text-muted">Define los términos de gestión del paquete</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors"
                >
                  <label htmlFor="precio" className="text-sm font-bold text-gh-text mb-3 block">
                    💰 Precio de Gestión Mensual
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
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text placeholder:text-gh-text-muted text-lg font-bold"
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors"
                  >
                    <label htmlFor="mesesGratis" className="text-sm font-bold text-gh-text mb-3 block">
                      🎁 Meses Gratis
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
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text text-lg font-bold"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-6 border border-gh-border hover:border-gh-success/30 transition-colors"
                  >
                    <label htmlFor="mesesPago" className="text-sm font-bold text-gh-text mb-3 block">
                      💳 Meses de Pago
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
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/20 transition-all text-gh-text text-lg font-bold"
                    />
                  </motion.div>
                </div>

                {/* Resumen */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-gh-success/10 to-gh-success/5 rounded-2xl p-6 border border-gh-success/30"
                >
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
                </motion.div>
              </motion.div>
            )}

            {activeModalTab === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <FaPercentage className="text-accent text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gh-text">Descuentos y Promociones</h3>
                    <p className="text-sm text-gh-text-muted">Aplica descuentos al desarrollo del paquete</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-2xl p-8 border border-gh-border hover:border-accent/30 transition-colors"
                >
                  <label htmlFor="descuento" className="text-sm font-bold text-gh-text mb-3 block">
                    % Descuento del Paquete
                  </label>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
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
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-gh-bg border border-gh-border rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-gh-text placeholder:text-gh-text-muted text-2xl font-bold"
                      />
                    </div>
                    <span className="text-3xl font-bold text-accent mb-1">%</span>
                  </div>
                </motion.div>

                {/* Visualización del descuento */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/30"
                >
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
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Footer Mejorado */}
          <motion.div className="border-t border-gh-border bg-gradient-to-r from-gh-bg via-gh-bg-secondary to-gh-bg p-6 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gh-bg-secondary border border-gh-border text-gh-text rounded-xl hover:bg-gh-border hover:border-gh-text transition-all font-semibold flex items-center justify-center gap-2"
            >
              <FaTimes /> Cerrar
            </motion.button>
            <motion.button
              whileHover={!tieneCambios ? {} : { scale: 1.05 }}
              whileTap={!tieneCambios ? {} : { scale: 0.95 }}
              onClick={handleGuardarYCerrar}
              disabled={!tieneCambios}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gh-success to-gh-success-hover text-white rounded-xl hover:shadow-lg hover:shadow-gh-success/30 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <FaCheck /> Guardar y Cerrar
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}





