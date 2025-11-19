'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaCalculator, FaPlus, FaTrash, FaEdit, FaTimes, FaCheck } from 'react-icons/fa'
import type { ServicioBase } from '@/lib/types'

interface ServiciosBaseSectionProps {
  serviciosBase: ServicioBase[]
  setServiciosBase: (servicios: ServicioBase[]) => void
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
    if (servicioBaseEditando && servicioBaseEditando.nombre && servicioBaseEditando.precio > 0) {
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
      className="bg-white rounded-2xl shadow-xl border-l-4 border-primary p-8"
    >
      <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
        <span className="text-3xl">➡️</span>
        1. Definición de Precios de Servicios Base
      </h2>

      {/* Lista de Servicios Base Existentes */}
      {serviciosBase.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="text-sm font-semibold text-secondary mb-3 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 px-2 text-left">
            <span>📝 Nombre</span>
            <span>💰 Precio (USD)</span>
            <span>🎁 Meses Gratis</span>
            <span>🗓️ Meses Pago</span>
            <span>💵 Subtotal</span>
            <span className="text-center">⚙️Acciones</span>
          </div>
          {serviciosBase.map((servicio) => (
            <div
              key={servicio.id}
              className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 items-center bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border-2 border-primary/20"
            >
              {editandoServicioBaseId === servicio.id ? (
                <>
                  <input
                    type="text"
                    value={servicioBaseEditando?.nombre || ''}
                    onChange={(e) =>
                      setServicioBaseEditando({
                        ...servicioBaseEditando!,
                        nombre: e.target.value,
                      })
                    }
                    className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    value={servicioBaseEditando?.precio || 0}
                    onChange={(e) =>
                      setServicioBaseEditando({
                        ...servicioBaseEditando!,
                        precio: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
                    min="0"
                  />
                  <input
                    type="number"
                    value={servicioBaseEditando?.mesesGratis || 0}
                    onChange={(e) =>
                      setServicioBaseEditando({
                        ...servicioBaseEditando!,
                        mesesGratis: parseInt(e.target.value) || 0,
                      })
                    }
                    className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
                    min="0"
                    max="12"
                  />
                  <input
                    type="number"
                    value={servicioBaseEditando?.mesesPago || 0}
                    onChange={(e) =>
                      setServicioBaseEditando({
                        ...servicioBaseEditando!,
                        mesesPago: parseInt(e.target.value) || 0,
                      })
                    }
                    className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
                    min="1"
                    max="12"
                  />
                  <span className="text-lg font-bold text-primary">
                    ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label="Guardar servicio base"
                      onClick={guardarEditarServicioBase}
                      className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <FaCheck />
                    </button>
                    <button
                      aria-label="Cancelar edición servicio base"
                      onClick={cancelarEditarServicioBase}
                      className="px-3 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-semibold text-secondary">{servicio.nombre}</span>
                  <span className="text-primary font-bold">${servicio.precio.toFixed(2)}</span>
                  <span className="text-secondary">{servicio.mesesGratis}m</span>
                  <span className="text-secondary">{servicio.mesesPago}m</span>
                  <span className="text-lg font-bold text-primary">
                    ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label={`Editar servicio base ${servicio.nombre}`}
                      onClick={() => abrirEditarServicioBase(servicio)}
                      className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <FaEdit />
                    </button>
                    <button
                      aria-label={`Eliminar servicio base ${servicio.nombre}`}
                      onClick={() => eliminarServicioBase(servicio.id)}
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

      {/* Formulario para Agregar Nuevo Servicio Base */}
      <div className="space-y-4 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border-2 border-dashed border-primary/40">
        <h3 className="font-bold text-secondary mb-4">➕ Agregar Nuevo Servicio Base</h3>
        <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end">
          <div>
            <label htmlFor="nuevoServicioBaseNombre" className="block font-semibold text-secondary mb-2 text-sm">
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
              className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBasePrecio" className="block font-semibold text-secondary mb-2 text-sm">
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
                  precio: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBaseMesesGratis" className="block font-semibold text-secondary mb-2 text-sm">
              🎁 Meses Gratis
            </label>
            <input
              id="nuevoServicioBaseMesesGratis"
              type="number"
              placeholder="0"
              value={nuevoServicioBase.mesesGratis}
              onChange={(e) => {
                const gratis = parseInt(e.target.value) || 0;
                const pagoCalculado = Math.max(1, 12 - gratis);
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  mesesGratis: Math.min(gratis, 12),
                  mesesPago: pagoCalculado,
                })
              }}
              className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
              min="0"
              max="12"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBaseMesesPago" className="block font-semibold text-secondary mb-2 text-sm">
              💳 Meses Pago
            </label>
            <input
              id="nuevoServicioBaseMesesPago"
              type="number"
              placeholder="12"
              value={nuevoServicioBase.mesesPago}
              onChange={(e) => {
                const pago = parseInt(e.target.value) || 12;
                const pagoValidado = Math.max(1, Math.min(pago, 12));
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  mesesPago: pagoValidado,
                })
              }}
              className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
              min="1"
              max="12"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarServicioBase}
            disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
            className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <FaPlus /> Agregar
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
