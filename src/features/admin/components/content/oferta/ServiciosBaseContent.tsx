'use client'

import React from 'react'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaCubes } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { ServicioBase } from '@/lib/types'

export interface ServiciosBaseContentProps {
  serviciosBase: ServicioBase[]
  setServiciosBase: (servicios: ServicioBase[]) => void
  nuevoServicioBase: { nombre: string; precio: number; mesesGratis: number; mesesPago: number; frecuenciaPago?: string }
  setNuevoServicioBase: (servicio: any) => void
  editandoServicioBaseId: string | null
  setEditandoServicioBaseId: (id: string | null) => void
  servicioBaseEditando: ServicioBase | null
  setServicioBaseEditando: (servicio: ServicioBase | null) => void
  agregarServicioBase: () => void
  abrirEditarServicioBase: (servicio: ServicioBase) => void
  guardarEditarServicioBase: () => void
  cancelarEditarServicioBase: () => void
  eliminarServicioBase: (id: string) => void
}

export default function ServiciosBaseContent({
  serviciosBase,
  nuevoServicioBase,
  setNuevoServicioBase,
  editandoServicioBaseId,
  servicioBaseEditando,
  setServicioBaseEditando,
  agregarServicioBase,
  abrirEditarServicioBase,
  guardarEditarServicioBase,
  cancelarEditarServicioBase,
  eliminarServicioBase,
}: Readonly<ServiciosBaseContentProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
          <FaCubes className="text-gh-success" /> Servicios Base
        </h4>
        <span className="text-xs text-gh-text-muted bg-gh-bg-secondary px-2 py-1 rounded">
          {serviciosBase.length} servicio{serviciosBase.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de Servicios Base Existentes */}
      {serviciosBase.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gh-text-muted uppercase tracking-wide grid md:grid-cols-[2.5fr,0.8fr,0.8fr,0.8fr,0.8fr,0.8fr,1fr] gap-3 px-4">
            <span>Nombre</span>
            <span>Precio</span>
            <span>M. Gratis</span>
            <span>M. Pago</span>
            <span>Tipo</span>
            <span>Subtotal</span>
            <span className="text-center">Acciones</span>
          </div>
          {serviciosBase.map((servicio) => (
            <div
              key={servicio.id}
              className="grid md:grid-cols-[2.5fr,0.8fr,0.8fr,0.8fr,0.8fr,0.8fr,1fr] gap-3 items-center bg-gh-bg-secondary p-4 rounded-md border border-gh-border"
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
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
                  />
                  <input
                    type="number"
                    value={servicioBaseEditando?.precio || 0}
                    onChange={(e) =>
                      setServicioBaseEditando({
                        ...servicioBaseEditando!,
                        precio: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
                    min="0"
                  />
                  <input
                    type="number"
                    value={servicioBaseEditando?.mesesGratis || 0}
                    onChange={(e) =>
                      setServicioBaseEditando({
                        ...servicioBaseEditando!,
                        mesesGratis: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
                    min="0"
                    max="12"
                  />
                  <input
                    type="number"
                    value={servicioBaseEditando?.mesesPago || 0}
                    onChange={(e) =>
                      setServicioBaseEditando({
                        ...servicioBaseEditando!,
                        mesesPago: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
                    min="1"
                    max="12"
                  />
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setServicioBaseEditando({
                          ...servicioBaseEditando!,
                          frecuenciaPago: (servicioBaseEditando?.frecuenciaPago || 'mensual') === 'mensual' ? 'anual' : 'mensual',
                        })
                      }
                      className="flex items-center gap-1.5"
                    >
                      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                        (servicioBaseEditando?.frecuenciaPago || 'mensual') === 'anual' ? 'bg-gh-success' : 'bg-gh-border'
                      }`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          (servicioBaseEditando?.frecuenciaPago || 'mensual') === 'anual' ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                      <span className="text-[10px] text-gh-text-muted whitespace-nowrap">{(servicioBaseEditando?.frecuenciaPago || 'mensual') === 'mensual' ? 'Mensual' : 'Anual'}</span>
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-gh-text text-center">
                    ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label="Guardar servicio base"
                      onClick={guardarEditarServicioBase}
                      className="p-2 bg-gh-success text-white rounded-md hover:bg-[#1f7935] transition-colors"
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      aria-label="Cancelar edición servicio base"
                      onClick={cancelarEditarServicioBase}
                      className="p-2 bg-gh-border text-gh-text-muted rounded-md hover:bg-gh-border-light transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-gh-text-muted text-xs">{servicio.nombre}</span>
                  <span className="text-gh-text-muted text-xs">${servicio.precio.toFixed(2)}</span>
                  <span className="text-gh-text-muted text-xs">{servicio.mesesGratis}m</span>
                  <span className="text-gh-text-muted text-xs">{servicio.mesesPago}m</span>
                  <span className="text-xs">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                      (servicio.frecuenciaPago || 'mensual') === 'anual'
                        ? 'bg-gh-success/10 text-gh-success'
                        : 'bg-gh-border/50 text-gh-text-muted'
                    }`}>
                      {(servicio.frecuenciaPago || 'mensual') === 'anual' ? 'Anual' : 'Mensual'}
                    </span>
                  </span>
                  <span className="text-gh-text-muted text-xs">
                    ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label={`Editar servicio base ${servicio.nombre}`}
                      onClick={() => abrirEditarServicioBase(servicio)}
                      className="p-2 bg-gh-info text-white rounded-md hover:bg-[#388bfd] transition-colors"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      aria-label={`Eliminar servicio base ${servicio.nombre}`}
                      onClick={() => eliminarServicioBase(servicio.id)}
                      className="p-2 bg-gh-warning text-white rounded-md hover:bg-[#d0981a] transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario para Agregar Nuevo Servicio Base */}
      <div className="space-y-4 p-6 bg-gh-bg-overlay border border-gh-border rounded-lg">
        <h3 className="text-sm font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2">
          <FaPlus size={14} /> Agregar Nuevo Servicio Base
        </h3>
        <div className="grid md:grid-cols-[2fr,0.8fr,0.8fr,0.8fr,0.8fr,auto] gap-3 items-end">
          <div>
            <label htmlFor="nuevoServicioBaseNombre" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Nombre del Servicio
            </label>
            <input
              id="nuevoServicioBaseNombre"
              type="text"
              placeholder="Ej: Hosting, SSL, etc."
              value={nuevoServicioBase.nombre}
              onChange={(e) =>
                setNuevoServicioBase({ ...nuevoServicioBase, nombre: e.target.value })
              }
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBasePrecio" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Precio
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
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBaseMesesGratis" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              M. Gratis
            </label>
            <input
              id="nuevoServicioBaseMesesGratis"
              type="number"
              placeholder="0"
              value={nuevoServicioBase.mesesGratis}
              onChange={(e) => {
                const gratis = Number.parseInt(e.target.value) || 0
                const pagoCalculado = Math.max(1, 12 - gratis)
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  mesesGratis: Math.min(gratis, 12),
                  mesesPago: pagoCalculado,
                })
              }}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
              min="0"
              max="12"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBaseMesesPago" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              M. Pago
            </label>
            <input
              id="nuevoServicioBaseMesesPago"
              type="number"
              placeholder="12"
              value={nuevoServicioBase.mesesPago}
              onChange={(e) => {
                const pago = Number.parseInt(e.target.value) || 12
                const pagoValidado = Math.max(1, Math.min(pago, 12))
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  mesesPago: pagoValidado,
                })
              }}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
              min="1"
              max="12"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioBaseFrecuencia" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Tipo Pago
            </label>
            <button
              id="nuevoServicioBaseFrecuencia"
              type="button"
              onClick={() =>
                setNuevoServicioBase({
                  ...nuevoServicioBase,
                  frecuenciaPago: nuevoServicioBase.frecuenciaPago === 'mensual' ? 'anual' : 'mensual',
                })
              }
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md hover:border-gh-success/50 transition-colors h-[38px] w-full"
            >
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                nuevoServicioBase.frecuenciaPago === 'anual' ? 'bg-gh-success' : 'bg-gh-border'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  nuevoServicioBase.frecuenciaPago === 'anual' ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="text-xs text-gh-text">{nuevoServicioBase.frecuenciaPago === 'mensual' ? 'Mensual' : 'Anual'}</span>
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarServicioBase}
            disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
            className={`px-6 py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                ? 'bg-gh-success text-white hover:bg-[#1f7935]'
                : 'bg-gh-bg-secondary text-gh-text-muted cursor-not-allowed'
            }`}
          >
            <FaPlus size={12} /> Agregar
          </motion.button>
        </div>
      </div>

      {/* Resumen */}
      {serviciosBase.length > 0 && (
        <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <span className="text-gh-text-muted">Total servicios base: {serviciosBase.length}</span>
          <span className="text-gh-text-muted">Año 1: ${serviciosBase.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span>
          <span className="text-gh-text-muted">Año 2+: ${serviciosBase.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span>
        </div>
      )}
    </motion.div>
  )
}
