'use client'

import React, { useCallback } from 'react'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaPuzzlePiece } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { Servicio } from '@/lib/types'
import { useEventTracking } from '@/features/admin/hooks'

export interface ServiciosOpcionalesContentProps {
  serviciosOpcionales: Servicio[]
  setServiciosOpcionales: (servicios: Servicio[]) => void
  nuevoServicio: { nombre: string; precio: number; mesesGratis: number; mesesPago: number; frecuenciaPago?: string }
  setNuevoServicio: (servicio: any) => void
  editandoServicioId: string | null
  setEditandoServicioId: (id: string | null) => void
  servicioEditando: Servicio | null
  setServicioEditando: (servicio: Servicio | null) => void
  agregarServicioOpcional: () => void
  abrirEditarServicioOpcional: (servicio: Servicio) => void
  guardarEditarServicioOpcional: () => void
  cancelarEditarServicioOpcional: () => void
  eliminarServicioOpcional: (id: string) => void
  normalizarMeses: (mesesGratis: number, mesesPago: number) => { mesesGratis: number; mesesPago: number }
  serviciosOpcionalesValidos: boolean
  todoEsValido: boolean
}

export default function ServiciosOpcionalesContent({
  serviciosOpcionales,
  nuevoServicio,
  setNuevoServicio,
  editandoServicioId,
  servicioEditando,
  setServicioEditando,
  agregarServicioOpcional,
  abrirEditarServicioOpcional,
  guardarEditarServicioOpcional,
  cancelarEditarServicioOpcional,
  eliminarServicioOpcional,
  normalizarMeses,
  serviciosOpcionalesValidos,
  todoEsValido,
}: Readonly<ServiciosOpcionalesContentProps>) {
  // Hook de tracking
  const { 
    trackServicioOpcionalCreated, 
    trackServicioOpcionalEdited, 
    trackServicioOpcionalDeleted 
  } = useEventTracking()

  // Handlers con tracking
  const handleAgregar = useCallback(() => {
    agregarServicioOpcional()
    if (nuevoServicio.nombre.trim() && nuevoServicio.precio > 0) {
      trackServicioOpcionalCreated(nuevoServicio.nombre.trim(), nuevoServicio.precio)
    }
  }, [agregarServicioOpcional, nuevoServicio.nombre, nuevoServicio.precio, trackServicioOpcionalCreated])

  const handleGuardarEdicion = useCallback(() => {
    guardarEditarServicioOpcional()
    if (servicioEditando) {
      trackServicioOpcionalEdited(servicioEditando.id, servicioEditando.nombre)
    }
  }, [guardarEditarServicioOpcional, servicioEditando, trackServicioOpcionalEdited])

  const handleEliminar = useCallback((id: string, nombre: string) => {
    trackServicioOpcionalDeleted(id, nombre)
    eliminarServicioOpcional(id)
  }, [eliminarServicioOpcional, trackServicioOpcionalDeleted])
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
          <FaPuzzlePiece className="text-gh-warning" /> Servicios Opcionales
        </h4>
        <span className="text-xs text-gh-text-muted bg-gh-bg-secondary px-2 py-1 rounded">
          {serviciosOpcionales.length} servicio{serviciosOpcionales.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de Servicios Opcionales */}
      {serviciosOpcionales.length > 0 && (
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
          {serviciosOpcionales.map((serv) => (
            <div
              key={serv.id}
              className="grid md:grid-cols-[2.5fr,0.8fr,0.8fr,0.8fr,0.8fr,0.8fr,1fr] gap-3 items-center bg-gh-bg-secondary p-4 rounded-md border border-gh-border"
            >
              {editandoServicioId === serv.id ? (
                <>
                  <input
                    type="text"
                    value={servicioEditando?.nombre || ''}
                    aria-label="Nombre servicio opcional"
                    onChange={(e) => setServicioEditando({ ...servicioEditando!, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
                  />
                  <input
                    type="number"
                    value={servicioEditando?.precio || 0}
                    aria-label="Precio mensual servicio opcional"
                    min={0}
                    onChange={(e) => setServicioEditando({ ...servicioEditando!, precio: Number.parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
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
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
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
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
                  />
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setServicioEditando({
                          ...servicioEditando!,
                          frecuenciaPago: (servicioEditando?.frecuenciaPago || 'mensual') === 'mensual' ? 'anual' : 'mensual',
                        })
                      }
                      className="flex items-center gap-1.5"
                    >
                      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                        (servicioEditando?.frecuenciaPago || 'mensual') === 'anual' ? 'bg-gh-success' : 'bg-gh-border'
                      }`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          (servicioEditando?.frecuenciaPago || 'mensual') === 'anual' ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                      <span className="text-[10px] text-gh-text-muted whitespace-nowrap">{(servicioEditando?.frecuenciaPago || 'mensual') === 'mensual' ? 'Mensual' : 'Anual'}</span>
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-gh-text text-center">${((servicioEditando?.precio || 0) * (servicioEditando?.mesesPago || 0)).toFixed(2)}</span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label="Guardar servicio opcional"
                      onClick={handleGuardarEdicion}
                      className="p-2 bg-gh-success text-white rounded-md hover:bg-[#1f7935] transition-colors"
                      disabled={!(servicioEditando?.nombre.trim() && (servicioEditando?.precio || 0) > 0)}
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      aria-label="Cancelar edición servicio opcional"
                      onClick={cancelarEditarServicioOpcional}
                      className="p-2 bg-gh-border text-gh-text-muted rounded-md hover:bg-gh-border-light transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-gh-text-muted text-xs">{serv.nombre}</span>
                  <span className="text-gh-text-muted text-xs">${serv.precio.toFixed(2)}</span>
                  <span className="text-gh-text-muted text-xs">{serv.mesesGratis}m</span>
                  <span className="text-gh-text-muted text-xs">{serv.mesesPago}m</span>
                  <span className="text-xs">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                      (serv.frecuenciaPago || 'mensual') === 'anual'
                        ? 'bg-gh-success/10 text-gh-success'
                        : 'bg-gh-border/50 text-gh-text-muted'
                    }`}>
                      {(serv.frecuenciaPago || 'mensual') === 'anual' ? 'Anual' : 'Mensual'}
                    </span>
                  </span>
                  <span className="text-gh-text-muted text-xs">${(serv.precio * serv.mesesPago).toFixed(2)}</span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label="Editar servicio opcional"
                      onClick={() => abrirEditarServicioOpcional(serv)}
                      className="p-2 bg-gh-info text-white rounded-md hover:bg-[#388bfd] transition-colors"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      aria-label="Eliminar servicio opcional"
                      onClick={() => handleEliminar(serv.id, serv.nombre)}
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

      {/* Formulario para Agregar Nuevo Servicio Opcional */}
      <div className="space-y-4 p-6 bg-gh-bg-overlay border border-gh-border rounded-lg">
        <h3 className="text-sm font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2">
          <FaPlus size={14} /> Agregar Nuevo Servicio Opcional
        </h3>
        <div className="grid md:grid-cols-[2fr,0.8fr,0.8fr,0.8fr,0.8fr,auto] gap-3 items-end">
          <div>
            <label htmlFor="servOpcNombre" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Nombre
            </label>
            <input
              id="servOpcNombre"
              type="text"
              placeholder="Ej: SEO Premium"
              value={nuevoServicio.nombre}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="servOpcPrecio" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Precio
            </label>
            <input
              id="servOpcPrecio"
              type="number"
              min={0}
              value={nuevoServicio.precio}
              placeholder="0"
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: Number.parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="servOpcGratis" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Gratis
            </label>
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
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="servOpcPago" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Pago
            </label>
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
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-xs text-gh-text outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="nuevoServicioOpcionalFrecuencia" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Tipo Pago
            </label>
            <button
              id="nuevoServicioOpcionalFrecuencia"
              type="button"
              onClick={() =>
                setNuevoServicio({
                  ...nuevoServicio,
                  frecuenciaPago: nuevoServicio.frecuenciaPago === 'mensual' ? 'anual' : 'mensual',
                })
              }
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md hover:border-gh-success/50 transition-colors h-[38px] w-full"
            >
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                nuevoServicio.frecuenciaPago === 'anual' ? 'bg-gh-success' : 'bg-gh-border'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  nuevoServicio.frecuenciaPago === 'anual' ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="text-xs text-gh-text">{nuevoServicio.frecuenciaPago === 'mensual' ? 'Mensual' : 'Anual'}</span>
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAgregar}
            disabled={!(nuevoServicio.nombre.trim() && nuevoServicio.precio > 0)}
            className={`px-6 py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              nuevoServicio.nombre.trim() && nuevoServicio.precio > 0
                ? 'bg-gh-success text-white hover:bg-[#1f7935]'
                : 'bg-gh-bg-secondary text-gh-text-muted cursor-not-allowed'
            }`}
          >
            <FaPlus size={12} /> Agregar
          </motion.button>
        </div>
      </div>

      {/* Resumen y Validaciones */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span className="text-gh-text-muted">Servicios opcionales: {serviciosOpcionales.length}</span>
        <span className="text-gh-text-muted">Total Año 1: ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span>
        <span className="text-gh-text-muted">Total Anual (Año 2+): ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span>
      </div>

      {!serviciosOpcionalesValidos && serviciosOpcionales.length > 0 && (
        <p className="text-xs text-gh-warning bg-gh-bg-secondary p-3 rounded-md border border-gh-border">
          ⚠️ Revisa meses (Meses Gratis + Meses Pago deben sumar 12) y que todos tengan nombre y precio.
        </p>
      )}

      {!todoEsValido && (
        <div className="pt-4 border-t border-gh-border">
          <p className="text-xs text-gh-info bg-gh-bg-secondary p-4 rounded-lg border border-gh-border text-center font-medium">
            ℹ️ Completa: Nombre del paquete, Desarrollo, Precios servicios y Meses válidos
          </p>
        </div>
      )}
    </motion.div>
  )
}
