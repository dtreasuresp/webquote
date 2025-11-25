'use client'

import React from 'react'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, FaBox, FaGift, FaCog } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { ServicioBase, Servicio, Package } from '@/lib/types'
import CollapsibleSection from '@/features/admin/components/CollapsibleSection'

interface OfertaTabProps {
  serviciosBase: ServicioBase[]
  setServiciosBase: (servicios: ServicioBase[]) => void
  nuevoServicioBase: { nombre: string; precio: number; mesesGratis: number; mesesPago: number }
  setNuevoServicioBase: (servicio: any) => void
  editandoServicioBaseId: string | null
  setEditandoServicioBaseId: (id: string | null) => void
  servicioBaseEditando: ServicioBase | null
  setServicioBaseEditando: (servicio: ServicioBase | null) => void
  paqueteActual: Package
  setPaqueteActual: (paquete: Package) => void
  serviciosOpcionales: Servicio[]
  setServiciosOpcionales: (servicios: Servicio[]) => void
  nuevoServicio: { nombre: string; precio: number; mesesGratis: number; mesesPago: number }
  setNuevoServicio: (servicio: any) => void
  editandoServicioId: string | null
  setEditandoServicioId: (id: string | null) => void
  servicioEditando: Servicio | null
  setServicioEditando: (servicio: Servicio | null) => void
  descripcionTextareaRef: React.RefObject<HTMLTextAreaElement | null>
  agregarServicioBase: () => void
  abrirEditarServicioBase: (servicio: ServicioBase) => void
  guardarEditarServicioBase: () => void
  cancelarEditarServicioBase: () => void
  eliminarServicioBase: (id: string) => void
  agregarServicioOpcional: () => void
  abrirEditarServicioOpcional: (servicio: Servicio) => void
  guardarEditarServicioOpcional: () => void
  cancelarEditarServicioOpcional: () => void
  eliminarServicioOpcional: (id: string) => void
  normalizarMeses: (mesesGratis: number, mesesPago: number) => { mesesGratis: number; mesesPago: number }
  serviciosOpcionalesValidos: boolean
  todoEsValido: boolean
}

export default function OfertaTab({
  serviciosBase,
  setServiciosBase,
  nuevoServicioBase,
  setNuevoServicioBase,
  editandoServicioBaseId,
  setEditandoServicioBaseId,
  servicioBaseEditando,
  setServicioBaseEditando,
  paqueteActual,
  setPaqueteActual,
  serviciosOpcionales,
  setServiciosOpcionales,
  nuevoServicio,
  setNuevoServicio,
  editandoServicioId,
  setEditandoServicioId,
  servicioEditando,
  setServicioEditando,
  descripcionTextareaRef,
  agregarServicioBase,
  abrirEditarServicioBase,
  guardarEditarServicioBase,
  cancelarEditarServicioBase,
  eliminarServicioBase,
  agregarServicioOpcional,
  abrirEditarServicioOpcional,
  guardarEditarServicioOpcional,
  cancelarEditarServicioOpcional,
  eliminarServicioOpcional,
  normalizarMeses,
  serviciosOpcionalesValidos,
  todoEsValido,
}: OfertaTabProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Sección: Servicios Base */}
      <CollapsibleSection
        id="servicios-base"
        title="Servicios Base Asociados al Paquete"
        icon={<FaBox className="text-blue-400" />}
        defaultOpen={true}
      >
        {/* Lista de Servicios Base Existentes */}
        {serviciosBase.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="text-xs font-semibold text-gh-text-muted uppercase tracking-widest mb-3 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 px-4">
              <span>Nombre</span>
              <span>Precio</span>
              <span>Meses Gratis</span>
              <span>Meses Pago</span>
              <span>Subtotal</span>
              <span className="text-center">Acciones</span>
            </div>
            {serviciosBase.map((servicio) => (
              <motion.div
                key={servicio.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 items-center bg-gradient-to-r from-gh-bg-secondary to-gh-bg-overlay p-4 rounded-lg border border-gh-border/50 hover:border-blue-400/30 transition-all"
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
                      className="px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-xs text-gh-text outline-none transition"
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
                      className="px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-xs text-gh-text outline-none transition"
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
                      className="px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-xs text-gh-text outline-none transition"
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
                      className="px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-xs text-gh-text outline-none transition"
                      min="1"
                      max="12"
                    />
                    <span className="text-sm font-semibold text-gh-text">
                      ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                    </span>
                    <div className="flex gap-2 justify-center">
                      <button
                        aria-label="Guardar servicio base"
                        onClick={guardarEditarServicioBase}
                        className="p-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        aria-label="Cancelar edición servicio base"
                        onClick={cancelarEditarServicioBase}
                        className="p-2 bg-gh-border text-gh-text-muted rounded-lg hover:bg-gh-border/70 transition-colors"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gh-text-muted text-xs">{servicio.nombre}</span>
                    <span className="text-gh-text-muted text-xs font-medium">${servicio.precio.toFixed(2)}</span>
                    <span className="text-gh-text-muted text-xs">{servicio.mesesGratis}m</span>
                    <span className="text-gh-text-muted text-xs">{servicio.mesesPago}m</span>
                    <span className="text-gh-text text-xs font-semibold">
                      ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                    </span>
                    <div className="flex gap-2 justify-center">
                      <button
                        aria-label={`Editar servicio base ${servicio.nombre}`}
                        onClick={() => abrirEditarServicioBase(servicio)}
                        className="p-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        aria-label={`Eliminar servicio base ${servicio.nombre}`}
                        onClick={() => eliminarServicioBase(servicio.id)}
                        className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Formulario para Agregar Nuevo Servicio Base */}
        <div className="space-y-4 p-6 bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary border border-gh-border/50 rounded-xl shadow-sm hover:shadow-md transition-all">
          <h3 className="text-sm font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2">
            <FaPlus className="text-emerald-400" size={14} /> Agregar Nuevo Servicio Base
          </h3>
          <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 items-end">
            <div>
              <label htmlFor="nuevoServicioBaseNombre" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
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
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-xs text-gh-text outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBasePrecio" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
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
                    precio: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-xs text-gh-text outline-none transition"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBaseMesesGratis" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Meses Gratis
              </label>
              <input
                id="nuevoServicioBaseMesesGratis"
                type="number"
                placeholder="0"
                value={nuevoServicioBase.mesesGratis}
                onChange={(e) => {
                  const gratis = parseInt(e.target.value) || 0
                  const pagoCalculado = Math.max(1, 12 - gratis)
                  setNuevoServicioBase({
                    ...nuevoServicioBase,
                    mesesGratis: Math.min(gratis, 12),
                    mesesPago: pagoCalculado,
                  })
                }}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-xs text-gh-text outline-none transition"
                min="0"
                max="12"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBaseMesesPago" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Meses Pago
              </label>
              <input
                id="nuevoServicioBaseMesesPago"
                type="number"
                placeholder="12"
                value={nuevoServicioBase.mesesPago}
                onChange={(e) => {
                  const pago = parseInt(e.target.value) || 12
                  const pagoValidado = Math.max(1, Math.min(pago, 12))
                  setNuevoServicioBase({
                    ...nuevoServicioBase,
                    mesesPago: pagoValidado,
                  })
                }}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-xs text-gh-text outline-none transition"
                min="1"
                max="12"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={agregarServicioBase}
              disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
              className={`px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
                  : 'bg-gh-bg-secondary text-gh-text-muted cursor-not-allowed opacity-50'
              }`}
            >
              <FaPlus size={12} /> Agregar
            </motion.button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Sección: Descripción del Paquete */}
      <CollapsibleSection
        id="paquetes"
        title="Descripción del Paquete"
        icon={<FaCog className="text-purple-400" />}
        defaultOpen={true}
      >
        <div className="space-y-4 p-6 bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary border border-gh-border/50 rounded-xl shadow-sm hover:shadow-md transition-all">
          <h3 className="text-sm font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2">
            Configurar Paquete
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="paqueteNombre" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Nombre del Paquete *
              </label>
              <input
                id="paqueteNombre"
                type="text"
                placeholder="Ej: Constructor"
                value={paqueteActual.nombre}
                onChange={(e) =>
                  setPaqueteActual({ ...paqueteActual, nombre: e.target.value })
                }
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-xs text-gh-text outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="paqueteDesarrollo" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Desarrollo *
              </label>
              <input
                id="paqueteDesarrollo"
                type="number"
                placeholder="0"
                value={paqueteActual.desarrollo}
                onChange={(e) =>
                  setPaqueteActual({
                    ...paqueteActual,
                    desarrollo: Number.parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-xs text-gh-text outline-none transition"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="paqueteDescuento" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Descuento (%)
              </label>
              <input
                id="paqueteDescuento"
                type="number"
                placeholder="0"
                value={paqueteActual.descuento}
                onChange={(e) =>
                  setPaqueteActual({
                    ...paqueteActual,
                    descuento: Number.parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-xs text-gh-text outline-none transition"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="paqueteTipo" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Tipo de Paquete
              </label>
              <input
                id="paqueteTipo"
                type="text"
                placeholder="Ej: Básico"
                value={paqueteActual.tipo || ''}
                onChange={(e) =>
                  setPaqueteActual({ ...paqueteActual, tipo: e.target.value })
                }
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-xs text-gh-text outline-none transition"
              />
            </div>
          </div>
          <div>
            <label htmlFor="paqueteDescripcion" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
              Descripción del Paquete
            </label>
            <textarea
              id="paqueteDescripcion"
              placeholder="Ej: Paquete personalizado para empresas..."
              value={paqueteActual.descripcion || ''}
              onChange={(e) => {
                setPaqueteActual({ ...paqueteActual, descripcion: e.target.value })
                if (descripcionTextareaRef.current) {
                  descripcionTextareaRef.current.style.height = 'auto'
                  descripcionTextareaRef.current.style.height = descripcionTextareaRef.current.scrollHeight + 'px'
                }
              }}
              ref={descripcionTextareaRef}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-xs text-gh-text outline-none transition resize-none"
              rows={3}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Sección: Servicios Opcionales */}
      <CollapsibleSection
        id="servicios-opcionales"
        title="Servicios Opcionales del Paquete"
        icon={<FaGift className="text-pink-400" />}
        defaultOpen={true}
      >
        {serviciosOpcionales.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="text-xs font-semibold text-gh-text-muted uppercase tracking-widest mb-3 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 px-4">
              <span>Nombre</span>
              <span>Precio</span>
              <span>Meses Gratis</span>
              <span>Meses Pago</span>
              <span>Subtotal</span>
              <span className="text-center">Acciones</span>
            </div>
            {serviciosOpcionales.map((serv) => (
              <motion.div
                key={serv.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 items-center bg-gradient-to-r from-gh-bg-secondary to-gh-bg-overlay p-4 rounded-lg border border-gh-border/50 hover:border-pink-400/30 transition-all"
              >
                {editandoServicioId === serv.id ? (
                  <>
                    <input
                      type="text"
                      value={servicioEditando?.nombre || ''}
                      aria-label="Nombre servicio opcional"
                      onChange={(e) => setServicioEditando({ ...servicioEditando!, nombre: e.target.value })}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
                    />
                    <input
                      type="number"
                      value={servicioEditando?.precio || 0}
                      aria-label="Precio mensual servicio opcional"
                      min={0}
                      onChange={(e) => setServicioEditando({ ...servicioEditando!, precio: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
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
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
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
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
                    />
                    <span className="text-gh-text-muted text-xs">${((servicioEditando?.precio || 0) * (servicioEditando?.mesesPago || 0)).toFixed(2)}</span>
                    <div className="flex gap-2 justify-center">
                      <button
                        aria-label="Guardar servicio opcional"
                        onClick={guardarEditarServicioOpcional}
                        className="w-full px-3 py-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-600 transition-colors text-xs font-semibold"
                        disabled={!(servicioEditando?.nombre.trim() && (servicioEditando?.precio || 0) > 0)}
                      >
                        <FaCheck />
                      </button>
                      <button
                        aria-label="Cancelar edición servicio opcional"
                        onClick={cancelarEditarServicioOpcional}
                        className="w-full px-3 py-2 bg-gh-border text-gh-text-muted rounded-lg hover:bg-gh-border/70 transition-colors text-xs font-semibold"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gh-text-muted text-xs">{serv.nombre}</span>
                    <span className="text-gh-text-muted text-xs font-medium">${serv.precio.toFixed(2)}</span>
                    <span className="text-gh-text-muted text-xs">{serv.mesesGratis}m</span>
                    <span className="text-gh-text-muted text-xs">{serv.mesesPago}m</span>
                    <span className="text-gh-text text-xs font-semibold">${(serv.precio * serv.mesesPago).toFixed(2)}</span>
                    <div className="flex gap-2 justify-center">
                      <button
                        aria-label="Editar servicio opcional"
                        onClick={() => abrirEditarServicioOpcional(serv)}
                        className="px-3 py-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                      >
                        <FaEdit />
                      </button>
                      <button
                        aria-label="Eliminar servicio opcional"
                        onClick={() => eliminarServicioOpcional(serv.id)}
                        className="px-3 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="space-y-4 p-6 bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary border border-gh-border/50 rounded-xl shadow-sm hover:shadow-md transition-all">
          <h3 className="text-sm font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2">
            <FaPlus className="text-pink-400" size={14} /> Agregar Nuevo Servicio Opcional
          </h3>
          <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 items-end">
            <div>
              <label htmlFor="servOpcNombre" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Nombre
              </label>
              <input
                id="servOpcNombre"
                type="text"
                placeholder="Ej: SEO Premium"
                value={nuevoServicio.nombre}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="servOpcPrecio" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
                Precio
              </label>
              <input
                id="servOpcPrecio"
                type="number"
                min={0}
                value={nuevoServicio.precio}
                placeholder="0"
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: Number.parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="servOpcGratis" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
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
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="servOpcPago" className="block font-medium text-xs mb-2 uppercase tracking-widest text-gh-text">
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
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-xs text-gh-text outline-none transition"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={agregarServicioOpcional}
              disabled={!(nuevoServicio.nombre.trim() && nuevoServicio.precio > 0)}
              className={`px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                nuevoServicio.nombre.trim() && nuevoServicio.precio > 0
                  ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-md'
                  : 'bg-gh-bg-secondary text-gh-text-muted cursor-not-allowed opacity-50'
              }`}
            >
              <FaPlus size={12} /> Agregar
            </motion.button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-gh-bg-secondary to-gh-bg-overlay rounded-lg border border-gh-border/50 text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <span className="text-gh-text-muted">📊 Servicios opcionales: <span className="font-semibold text-gh-text">{serviciosOpcionales.length}</span></span>
          <span className="text-gh-text-muted">💰 Total Año 1: <span className="font-semibold text-gh-text text-green-400">${serviciosOpcionales.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span></span>
          <span className="text-gh-text-muted">📈 Total Anual (Año 2+): <span className="font-semibold text-gh-text text-blue-400">${serviciosOpcionales.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span></span>
        </div>
        {!serviciosOpcionalesValidos && serviciosOpcionales.length > 0 && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50/10 p-3 rounded-lg border border-amber-500/30">
            ⚠️ Revisa meses (Meses Gratis + Meses Pago deben sumar 12) y que todos tengan nombre y precio.
          </p>
        )}

        {!todoEsValido && (
          <div className="mt-4 pt-4 border-t border-gh-border/30">
            <p className="text-xs text-blue-400 bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 text-center font-medium">
              ℹ️ Completa: Nombre del paquete, Desarrollo, Precios servicios y Meses válidos
            </p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
