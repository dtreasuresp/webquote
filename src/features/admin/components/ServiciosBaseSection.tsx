'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaPlus, FaTrash, FaEdit, FaTimes, FaCheck } from 'react-icons/fa'
import type { ServicioBase } from '@/lib/types'

interface ServiciosBaseSectionProps {
  readonly serviciosBase: ServicioBase[]
  readonly setServiciosBase: (servicios: ServicioBase[]) => void
}

export default function ServiciosBaseSection({ serviciosBase, setServiciosBase }: ServiciosBaseSectionProps) {
  const [nuevoServicioBase, setNuevoServicioBase] = useState<{
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
  }>({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })

  const [editandoServicioBaseId, setEditandoServicioBaseId] = useState<string | null>(null)
  const [servicioBaseEditando, setServicioBaseEditando] = useState<ServicioBase | null>(null)

  const agregarServicioBase = () => {
    if (nuevoServicioBase.nombre && nuevoServicioBase.precio > 0) {
      const nuevoServ: ServicioBase = {
        id: Date.now().toString(),
        nombre: nuevoServicioBase.nombre,
        precio: nuevoServicioBase.precio,
        mesesGratis: nuevoServicioBase.mesesGratis,
        mesesPago: nuevoServicioBase.mesesPago,
      }
      setServiciosBase([...serviciosBase, nuevoServ])
      setNuevoServicioBase({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })
    }
  }

  const abrirEditarServicioBase = (servicio: ServicioBase) => {
    setServicioBaseEditando({ ...servicio })
    setEditandoServicioBaseId(servicio.id)
  }

  const guardarEditarServicioBase = () => {
    if (servicioBaseEditando?.nombre && servicioBaseEditando?.precio && servicioBaseEditando.precio > 0) {
      setServiciosBase(serviciosBase.map(s => s.id === servicioBaseEditando.id ? servicioBaseEditando : s))
      setEditandoServicioBaseId(null)
      setServicioBaseEditando(null)
    }
  }

  const cancelarEditarServicioBase = () => {
    setEditandoServicioBaseId(null)
    setServicioBaseEditando(null)
  }

  const eliminarServicioBase = (id: string) => {
    if (serviciosBase.length > 1) {
      setServiciosBase(serviciosBase.filter(s => s.id !== id))
    } else {
      alert('⚠️ Debe haber al menos un servicio base')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* PARTE 1: Elementos Existentes */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6 grid grid-cols-6 gap-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📝 Servicios Existentes
        </h3>
        
        {serviciosBase.length > 0 ? (
          <>
            {/* Header - solo en desktop */}
            <div className="grid text-sm font-semibold text-white/80 mb-3 grid-cols-6 gap-3 px-2 text-left">
              <span>📝 Nombre</span>
              <span>💰 Precio (USD)</span>
              <span>🎁 Meses Gratis</span>
              <span>🗓️ Meses Pago</span>
              <span>💵 Subtotal</span>
              <span className="text-center">⚙️ Acciones</span>
            </div>

            {/* Contenedor de filas */}
            <div className="space-y-3">
              {serviciosBase.map((servicio) => (
                <div
                  key={servicio.id}
                  className="grid grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 items-center bg-[#12121a] p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  {editandoServicioBaseId === servicio.id ? (
                    <>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={servicioBaseEditando?.nombre || ''}
                        onChange={(e) =>
                          setServicioBaseEditando({
                            ...servicioBaseEditando!,
                            nombre: e.target.value,
                          })
                        }
                        className="hidden md:block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={servicioBaseEditando?.precio || 0}
                        onChange={(e) =>
                          setServicioBaseEditando({
                            ...servicioBaseEditando!,
                            precio: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                        className="hidden md:block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={servicioBaseEditando?.mesesGratis || 0}
                        onChange={(e) =>
                          setServicioBaseEditando({
                            ...servicioBaseEditando!,
                            mesesGratis: Number.parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="hidden md:block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
                        min="0"
                        max="12"
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={servicioBaseEditando?.mesesPago || 0}
                        onChange={(e) =>
                          setServicioBaseEditando({
                            ...servicioBaseEditando!,
                            mesesPago: Number.parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="hidden md:block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
                        min="1"
                        max="12"
                      />
                      <span className="hidden md:block text-lg font-bold text-white">
                        ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                      </span>
                      <div className="hidden md:flex gap-2 justify-center">
                        <button
                          aria-label="Guardar servicio base"
                          onClick={guardarEditarServicioBase}
                          className="px-3 py-2 bg-white text-[#0a0a0f] rounded-lg hover:bg-white/90 transition-all"
                        >
                          <FaCheck />
                        </button>
                        <button
                          aria-label="Cancelar edición servicio base"
                          onClick={cancelarEditarServicioBase}
                          className="px-3 py-2 bg-[#12121a]0 text-white rounded-lg hover:bg-[#12121a] transition-all"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-white">{servicio.nombre}</span>
                      <span className="text-white font-bold">${servicio.precio.toFixed(2)}</span>
                      <span className="text-white/80">{servicio.mesesGratis}m</span>
                      <span className="text-white/80">{servicio.mesesPago}m</span>
                      <span className="text-lg font-bold text-white">
                        ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                      </span>
                      <div className="hidden md:flex gap-2 justify-center">
                        <button
                          aria-label={`Editar servicio base ${servicio.nombre}`}
                          onClick={() => abrirEditarServicioBase(servicio)}
                          className="px-3 py-2 bg-white text-[#0a0a0f] rounded-lg hover:bg-white/90 transition-all"
                        >
                          <FaEdit />
                        </button>
                        <button
                          aria-label={`Eliminar servicio base ${servicio.nombre}`}
                          onClick={() => eliminarServicioBase(servicio.id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-white/70 text-center py-4">No hay servicios base configurados</p>
        )}
      </div>

      {/* PARTE 2: Agregar Nuevo */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ➕ Agregar Nuevo Servicio Base
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="nuevoServicioBaseNombre" className="block font-semibold text-white mb-2 text-sm">
              📝 Nombre del Servicio
            </label>
            <input
              id="nuevoServicioBaseNombre"
              type="text"
              placeholder="Ej: Hosting, SSL, etc."
              value={nuevoServicioBase.nombre}
              onChange={(e) =>
                setNuevoServicioBase({ ...nuevoServicioBase, nombre: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBasePrecio" className="block font-semibold text-white mb-2 text-sm">
              💵 Precio (USD)
            </label>
            <input
              id="nuevoServicioBasePrecio"
              type="number"
              placeholder="0"
              value={nuevoServicioBase.precio}
              onChange={(e) =>
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  precio: Number.parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBaseMesesGratis" className="block font-semibold text-white mb-2 text-sm">
              🎁 Gratis
            </label>
            <input
              id="nuevoServicioBaseMesesGratis"
              type="number"
              placeholder="0"
              value={nuevoServicioBase.mesesGratis}
              onChange={(e) => {
                const gratis = Number.parseInt(e.target.value, 10) || 0;
                const pagoCalculado = Math.max(1, 12 - gratis);
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  mesesGratis: Math.min(gratis, 12),
                  mesesPago: pagoCalculado,
                })
              }}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              min="0"
              max="12"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBaseMesesPago" className="block font-semibold text-white mb-2 text-sm">
              💳 Pago
            </label>
            <input
              id="nuevoServicioBaseMesesPago"
              type="number"
              placeholder="12"
              value={nuevoServicioBase.mesesPago}
              onChange={(e) => {
                const pago = Number.parseInt(e.target.value, 10) || 12;
                const pagoValidado = Math.max(1, Math.min(pago, 12));
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  mesesPago: pagoValidado,
                })
              }}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              min="1"
              max="12"
            />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarServicioBase}
            disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
            className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                ? 'bg-white text-white hover:shadow-lg'
                : 'bg-[#12121a] text-white/70 cursor-not-allowed'
            }`}
          >
            <FaPlus className="text-sm" /> Agregar
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}






