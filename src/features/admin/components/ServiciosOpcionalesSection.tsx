'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaPlus, FaTrash, FaEdit, FaTimes, FaCheck } from 'react-icons/fa'
import type { Servicio, Package, GestionConfig, ServicioBase, PackageSnapshot, OtroServicio } from '@/lib/types'
import { crearSnapshot } from '@/lib/snapshotApi'

interface ServiciosOpcionalesSectionProps {
  readonly serviciosOpcionales: Servicio[]
  readonly setServiciosOpcionales: (servicios: Servicio[] | ((prev: Servicio[]) => Servicio[])) => void
  readonly snapshots: PackageSnapshot[]
  readonly setSnapshots: (snapshots: PackageSnapshot[]) => void
  readonly serviciosBase: ServicioBase[]
  readonly paqueteActual: Package
  readonly gestion: GestionConfig
  readonly todoEsValido: boolean
  readonly refreshSnapshots: () => Promise<void>
}

export default function ServiciosOpcionalesSection({
  serviciosOpcionales,
  setServiciosOpcionales,
  snapshots,
  setSnapshots,
  serviciosBase,
  paqueteActual,
  gestion,
  todoEsValido,
  refreshSnapshots,
}: ServiciosOpcionalesSectionProps) {
  const [nuevoServicio, setNuevoServicio] = useState<{
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
  }>({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })

  const [editandoServicioId, setEditandoServicioId] = useState<string | null>(null)
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null)

  const normalizarMeses = (mesesGratis: number, mesesPago: number) => {
    let g = Math.max(0, Math.min(mesesGratis, 12))
    let p = Math.max(0, Math.min(mesesPago, 12))
    if (g + p !== 12) {
      if (g > 0) p = 12 - g
      else if (p > 0) g = 12 - p
      else p = 12
    }
    if (g === 12) return { mesesGratis: 12, mesesPago: 0 }
    if (p === 0) return { mesesGratis: g, mesesPago: 1 }
    return { mesesGratis: g, mesesPago: p }
  }

  const agregarServicioOpcional = () => {
    if (nuevoServicio.nombre.trim() && nuevoServicio.precio > 0) {
      const { mesesGratis, mesesPago } = normalizarMeses(nuevoServicio.mesesGratis, nuevoServicio.mesesPago)
      const nuevoServ: Servicio = {
        id: Date.now().toString(),
        nombre: nuevoServicio.nombre.trim(),
        precio: nuevoServicio.precio,
        mesesGratis,
        mesesPago,
      }
      setServiciosOpcionales((prev: Servicio[]) => {
        const existente = prev.find(s => s.nombre.toLowerCase() === nuevoServ.nombre.toLowerCase())
        if (existente) return prev.map(s => s.id === existente.id ? { ...nuevoServ, id: existente.id } : s)
        return [...prev, nuevoServ]
      })
      setNuevoServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })
    }
  }

  const abrirEditarServicioOpcional = (servicio: Servicio) => {
    setServicioEditando({ ...servicio })
    setEditandoServicioId(servicio.id)
  }

  const guardarEditarServicioOpcional = () => {
    if (servicioEditando?.nombre?.trim() && servicioEditando?.precio > 0) {
      const nm = normalizarMeses(servicioEditando.mesesGratis, servicioEditando.mesesPago)
      const actualizado: Servicio = { ...servicioEditando, ...nm, nombre: servicioEditando.nombre.trim() }
      setServiciosOpcionales(prev => prev.map(s => s.id === actualizado.id ? actualizado : s))
      setEditandoServicioId(null)
      setServicioEditando(null)
    }
  }

  const cancelarEditarServicioOpcional = () => {
    setEditandoServicioId(null)
    setServicioEditando(null)
  }

  const eliminarServicioOpcional = (id: string) => {
    setServiciosOpcionales(prev => prev.filter(s => s.id !== id))
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

  const crearPaqueteSnapshot = async () => {
    if (!todoEsValido) {
      alert('Por favor completa todos los campos requeridos: Nombre del paquete, Desarrollo, Precios de servicios, y Meses válidos.')
      return
    }

    try {
      const otrosServiciosUnificados: OtroServicio[] = serviciosOpcionales.map(s => ({
        nombre: s.nombre,
        precio: s.precio,
        mesesGratis: s.mesesGratis,
        mesesPago: s.mesesPago,
      }))

      const nuevoSnapshot: PackageSnapshot = {
        id: Date.now().toString(),
        nombre: paqueteActual.nombre,
        serviciosBase: serviciosBase.map(s => ({ ...s })),
        gestion: {
          precio: gestion.precio,
          mesesGratis: gestion.mesesGratis,
          mesesPago: gestion.mesesPago,
        },
        paquete: {
          desarrollo: paqueteActual.desarrollo,
          descuento: paqueteActual.descuento,
          tipo: paqueteActual.tipo,
          descripcion: paqueteActual.descripcion,
          emoji: paqueteActual.emoji,
          tagline: paqueteActual.tagline,
          precioHosting: paqueteActual.precioHosting,
          precioMailbox: paqueteActual.precioMailbox,
          precioDominio: paqueteActual.precioDominio,
          tiempoEntrega: paqueteActual.tiempoEntrega,
          opcionesPago: paqueteActual.opcionesPago,
          descuentoPagoUnico: paqueteActual.descuentoPagoUnico,
          descuentosGenerales: paqueteActual.descuentosGenerales,
          descuentosPorServicio: paqueteActual.descuentosPorServicio,
          gestionMensual: paqueteActual.gestionMensual,
        },
        otrosServicios: otrosServiciosUnificados,
        costos: {
          inicial: calcularCostoInicialSnapshot({} as PackageSnapshot),
          año1: calcularCostoAño1Snapshot({} as PackageSnapshot),
          año2: calcularCostoAño2Snapshot({} as PackageSnapshot),
        },
        activo: true,
        createdAt: new Date().toISOString(),
      }

      const snapshot = await crearSnapshot(nuevoSnapshot)
      setSnapshots([...snapshots, snapshot])
      await refreshSnapshots()
      alert('✅ Paquete guardado correctamente')
    } catch (error) {
      console.error('Error creando snapshot:', error)
      alert('❌ Error al guardar el paquete')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* PARTE 1: Servicios Opcionales Existentes */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ✨ Servicios Opcionales
        </h3>

        {serviciosOpcionales.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white mb-2 grid md:grid-cols-[2fr,1fr,1fr,1fr,1.2fr,1fr] gap-2 px-2 bg-white/5 py-2 rounded-lg border border-white/10">
              <span>Nombre</span>
              <span>Precio</span>
              <span>Gratis</span>
              <span>Pago</span>
              <span>Subtotal</span>
              <span className="text-center">Acciones</span>
            </div>
            {serviciosOpcionales.map((servicio) => (
              <div
                key={servicio.id}
                className="grid md:grid-cols-[2fr,1fr,1fr,1fr,1.2fr,1fr] gap-2 items-center bg-gradient-to-r from-accent/10 to-accent/5 p-3 rounded-lg border border-accent/20 hover:border-accent/40 transition-all"
              >
                {editandoServicioId === servicio.id ? (
                  <>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={servicioEditando?.nombre || ''}
                      onChange={(e) =>
                        setServicioEditando({
                          ...servicioEditando!,
                          nombre: e.target.value,
                        })
                      }
                      className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-neutral-400 focus:border-accent focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={servicioEditando?.precio || 0}
                      onChange={(e) =>
                        setServicioEditando({
                          ...servicioEditando!,
                          precio: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-neutral-400 focus:border-accent focus:outline-none"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="0"
                      value={servicioEditando?.mesesGratis || 0}
                      onChange={(e) =>
                        setServicioEditando({
                          ...servicioEditando!,
                          mesesGratis: Number.parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-neutral-400 focus:border-accent focus:outline-none"
                      min="0"
                      max="12"
                    />
                    <input
                      type="number"
                      placeholder="0"
                      value={servicioEditando?.mesesPago || 0}
                      onChange={(e) =>
                        setServicioEditando({
                          ...servicioEditando!,
                          mesesPago: Number.parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-neutral-400 focus:border-accent focus:outline-none"
                      min="1"
                      max="12"
                    />
                    <span className="text-accent font-bold text-sm">
                      ${((servicioEditando?.precio || 0) * (servicioEditando?.mesesPago || 0)).toFixed(2)}
                    </span>
                    <div className="flex gap-1 justify-center">
                      <button
                        aria-label="Guardar servicio opcional"
                        onClick={guardarEditarServicioOpcional}
                        className="p-1.5 bg-accent text-white rounded-md hover:bg-accent-dark transition-all"
                      >
                        <FaCheck className="text-sm" />
                      </button>
                      <button
                        aria-label="Cancelar edición servicio opcional"
                        onClick={cancelarEditarServicioOpcional}
                        className="p-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-all"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-white font-medium">{servicio.nombre}</span>
                    <span className="text-accent font-bold">${servicio.precio.toFixed(2)}</span>
                    <span className="text-neutral-300 text-sm">{servicio.mesesGratis}m</span>
                    <span className="text-neutral-300 text-sm">{servicio.mesesPago}m</span>
                    <span className="text-accent font-bold">${(servicio.precio * servicio.mesesPago).toFixed(2)}</span>
                    <div className="flex gap-1 justify-center">
                      <button
                        aria-label="Editar servicio opcional"
                        onClick={() => abrirEditarServicioOpcional(servicio)}
                        className="p-1.5 bg-accent/20 text-accent hover:bg-accent/30 rounded-md transition-all"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        aria-label="Eliminar servicio opcional"
                        onClick={() => eliminarServicioOpcional(servicio.id)}
                        className="p-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-md transition-all"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400 text-sm italic">No hay servicios opcionales añadidos</p>
        )}
      </div>

      {/* PARTE 2: Agregar Nuevo Servicio Opcional */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ➕ Agregar Nuevo Servicio
        </h3>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nuevoServicioNombre" className="block font-semibold text-white mb-2 text-sm">
                📝 Nombre del Servicio *
              </label>
              <input
                id="nuevoServicioNombre"
                type="text"
                placeholder="Ej: API REST"
                value={nuevoServicio.nombre}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioPrecio" className="block font-semibold text-white mb-2 text-sm">
                💵 Precio Mensual (USD) *
              </label>
              <input
                id="nuevoServicioPrecio"
                type="number"
                placeholder="0.00"
                value={nuevoServicio.precio}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: Number.parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:border-accent focus:outline-none"
                min="0"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nuevoServicioGratis" className="block font-semibold text-white mb-2 text-sm">
                📅 Meses Gratis (0-12) *
              </label>
              <input
                id="nuevoServicioGratis"
                type="number"
                placeholder="0"
                value={nuevoServicio.mesesGratis}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, mesesGratis: Number.parseInt(e.target.value, 10) || 0 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:border-accent focus:outline-none"
                min="0"
                max="12"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioPago" className="block font-semibold text-white mb-2 text-sm">
                📆 Meses de Pago (1-12) *
              </label>
              <input
                id="nuevoServicioPago"
                type="number"
                placeholder="12"
                value={nuevoServicio.mesesPago}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, mesesPago: Number.parseInt(e.target.value, 10) || 12 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:border-accent focus:outline-none"
                min="1"
                max="12"
              />
            </div>
          </div>

          <button
            onClick={agregarServicioOpcional}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaPlus className="text-sm" />
            Agregar Servicio
          </button>
        </div>
      </div>

      {/* PARTE 3: Crear Snapshot */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={crearPaqueteSnapshot}
        disabled={!todoEsValido}
        className={`w-full px-6 py-3 rounded-lg font-bold text-white transition-all ${
          todoEsValido
            ? 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg cursor-pointer'
            : 'bg-neutral-600 cursor-not-allowed opacity-60'
        }`}
      >
        💾 Guardar Paquete Completo
      </motion.button>
    </motion.div>
  )
}
