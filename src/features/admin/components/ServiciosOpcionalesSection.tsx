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
    if (servicioEditando && servicioEditando.nombre.trim() && servicioEditando.precio > 0) {
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
          tipo: paqueteActual.tipo || '',
          descripcion: paqueteActual.descripcion || 'Paquete personalizado para empresas.',
          descuentosGenerales: {
            aplicarAlDesarrollo: false,
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            porcentaje: 0,
          },
          descuentosPorServicio: {
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            serviciosBase: serviciosBase.map(s => ({
              servicioId: s.id,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
            otrosServicios: otrosServiciosUnificados.map((s, idx) => ({
              servicioId: `otro-${idx}`,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
          },
        },
        otrosServicios: otrosServiciosUnificados,
        costos: {
          inicial: 0,
          año1: 0,
          año2: 0,
        },
        activo: true,
        createdAt: new Date().toISOString(),
      }

      nuevoSnapshot.costos.inicial = calcularCostoInicialSnapshot(nuevoSnapshot)
      nuevoSnapshot.costos.año1 = calcularCostoAño1Snapshot(nuevoSnapshot)
      nuevoSnapshot.costos.año2 = calcularCostoAño2Snapshot(nuevoSnapshot)

      const snapshotGuardado = await crearSnapshot(nuevoSnapshot)
      setSnapshots([...snapshots, snapshotGuardado])

      await refreshSnapshots()

      alert('✅ Paquete creado y guardado correctamente')
    } catch (error) {
      console.error('Error al crear paquete:', error)
      alert('❌ Error al guardar el paquete. Por favor intenta de nuevo.')
    }
  }

  const serviciosOpcionalesValidos = serviciosOpcionales.every(s => s.nombre && s.precio > 0 && (s.mesesGratis + s.mesesPago === 12))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-xl border-l-4 border-accent p-8"
    >
      <h2 className="text-2xl font-bold text-secondary mb-6">3. Servicios Opcionales</h2>

      {serviciosOpcionales.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="text-sm font-semibold text-secondary mb-3 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,auto] gap-3 px-2 text-left">
            <span>📝 Nombre</span>
            <span>💰 Precio</span>
            <span>🎁 Gratis</span>
            <span>📅 Pago</span>
            <span>💵 Subtotal Año 1</span>
            <span className="text-center">⚙️ Acciones</span>
          </div>
          {serviciosOpcionales.map(serv => (
            <div
              key={serv.id}
              className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,auto] gap-3 items-center bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-xl border-2 border-accent/20"
            >
              {editandoServicioId === serv.id ? (
                <>
                  <input
                    type="text"
                    value={servicioEditando?.nombre || ''}
                    aria-label="Nombre servicio opcional"
                    onChange={(e) => setServicioEditando({ ...servicioEditando!, nombre: e.target.value })}
                    className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
                  />
                  <input
                    type="number"
                    value={servicioEditando?.precio || 0}
                    aria-label="Precio mensual servicio opcional"
                    min={0}
                    onChange={(e) => setServicioEditando({ ...servicioEditando!, precio: Number.parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
                  />
                  <input
                    type="number"
                    value={servicioEditando?.mesesGratis || 0}
                    aria-label="Meses gratis servicio opcional"
                    min={0}
                    max={12}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value) || 0
                      const nm = normalizarMeses(val, servicioEditando?.mesesPago || 12)
                      setServicioEditando({ ...servicioEditando!, ...nm })
                    }}
                    className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
                  />
                  <input
                    type="number"
                    value={servicioEditando?.mesesPago || 0}
                    aria-label="Meses pago servicio opcional"
                    min={0}
                    max={12}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value) || 0
                      const nm = normalizarMeses(servicioEditando?.mesesGratis || 0, val)
                      setServicioEditando({ ...servicioEditando!, ...nm })
                    }}
                    className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
                  />
                  <span className="text-primary font-bold">${((servicioEditando?.precio || 0) * (servicioEditando?.mesesPago || 0)).toFixed(2)}</span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label="Guardar servicio opcional"
                      onClick={guardarEditarServicioOpcional}
                      className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      disabled={!(servicioEditando?.nombre.trim() && (servicioEditando?.precio || 0) > 0)}
                    >
                      <FaCheck />
                    </button>
                    <button
                      aria-label="Cancelar edición servicio opcional"
                      onClick={cancelarEditarServicioOpcional}
                      className="px-3 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-semibold text-secondary">{serv.nombre}</span>
                  <span className="text-primary font-bold">${serv.precio.toFixed(2)}</span>
                  <span className="text-secondary">{serv.mesesGratis}m</span>
                  <span className="text-secondary">{serv.mesesPago}m</span>
                  <span className="text-primary font-bold">${(serv.precio * serv.mesesPago).toFixed(2)}</span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label="Editar servicio opcional"
                      onClick={() => abrirEditarServicioOpcional(serv)}
                      className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <FaEdit />
                    </button>
                    <button
                      aria-label="Eliminar servicio opcional"
                      onClick={() => eliminarServicioOpcional(serv.id)}
                      className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 p-6 bg-gradient-to-r from-accent/5 to-primary/10 rounded-xl border-2 border-dashed border-accent/40">
        <h3 className="font-bold text-secondary mb-4">➕ Agregar Servicio Opcional</h3>
        <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end">
          <div>
            <label htmlFor="servOpcNombre" className="block font-semibold text-secondary mb-2 text-sm">📝 Nombre</label>
            <input
              id="servOpcNombre"
              type="text"
              placeholder="Ej: SEO Premium"
              value={nuevoServicio.nombre}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="servOpcPrecio" className="block font-semibold text-secondary mb-2 text-sm">💰 Precio (USD)</label>
            <input
              id="servOpcPrecio"
              type="number"
              min={0}
              value={nuevoServicio.precio}
              placeholder="0"
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: Number.parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="servOpcGratis" className="block font-semibold text-secondary mb-2 text-sm">🎁 Gratis</label>
            <input
              id="servOpcGratis"
              type="number"
              min={0}
              max={12}
              value={nuevoServicio.mesesGratis}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value) || 0
                const nm = normalizarMeses(val, nuevoServicio.mesesPago)
                setNuevoServicio({ ...nuevoServicio, ...nm })
              }}
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="servOpcPago" className="block font-semibold text-secondary mb-2 text-sm">📅 Pago</label>
            <input
              id="servOpcPago"
              type="number"
              min={0}
              max={12}
              value={nuevoServicio.mesesPago}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value) || 0
                const nm = normalizarMeses(nuevoServicio.mesesGratis, val)
                setNuevoServicio({ ...nuevoServicio, ...nm })
              }}
              className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarServicioOpcional}
            disabled={!(nuevoServicio.nombre.trim() && nuevoServicio.precio > 0)}
            className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              nuevoServicio.nombre.trim() && nuevoServicio.precio > 0
                ? 'bg-gradient-to-r from-accent to-primary text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <FaPlus /> Agregar
          </motion.button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30 text-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <span className="font-semibold text-secondary">Servicios opcionales: {serviciosOpcionales.length}</span>
        <span className="text-secondary">Total Año 1: ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span>
        <span className="text-secondary">Total Anual (Año 2+): ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span>
      </div>
      {!serviciosOpcionalesValidos && serviciosOpcionales.length > 0 && (
        <p className="mt-2 text-xs text-red-600 font-semibold">
          ⚠️ Revisa meses (Gratis + Pago deben sumar 12) y que todos tengan nombre y precio.
        </p>
      )}

      <div className="mt-8 pt-6 border-t-2 border-accent/30">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={crearPaqueteSnapshot}
          disabled={!todoEsValido}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            todoEsValido
              ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
          }`}
        >
          <FaPlus /> Crear Paquete con esta Configuración
        </motion.button>
        {!todoEsValido && (
          <p className="text-sm text-primary mt-2 text-center">
            ⚠️ Completa: Nombre del paquete, Desarrollo, Precios servicios y Meses válidos
          </p>
        )}
      </div>
    </motion.div>
  )
}
