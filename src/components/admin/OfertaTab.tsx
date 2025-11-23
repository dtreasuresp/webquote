'use client'

import React from 'react'
import { FaCheck, FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
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
    <div className="p-6 space-y-4">
      {/* Sección: Servicios Base */}
      <CollapsibleSection
        id="servicios-base"
        title="Servicios Base Asociados al Paquete"
        icon=""
        defaultOpen={true}
      >
        {/* Lista de Servicios Base Existentes */}
        {serviciosBase.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="text-xs font-semibold text-[#888888] mb-2 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 px-2 text-left">
              <span>Nombre</span>
              <span>Precio</span>
              <span>Meses Gratis</span>
              <span>Meses Pago</span>
              <span>Subtotal</span>
              <span className="text-center">Acciones</span>
            </div>
            {serviciosBase.map((servicio) => (
              <div
                key={servicio.id}
                className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center bg-[#111] p-2 rounded border border-[#333]"
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
                      className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
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
                      className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
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
                      className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
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
                      className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                      min="1"
                      max="12"
                    />
                    <span className="text-sm font-bold text-[#ededed]">
                      ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                    </span>
                    <div className="flex gap-1 justify-center">
                      <button
                        aria-label="Guardar servicio base"
                        onClick={guardarEditarServicioBase}
                        className="p-1.5 bg-white text-black rounded hover:bg-white/90 transition-all"
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        aria-label="Cancelar edición servicio base"
                        onClick={cancelarEditarServicioBase}
                        className="p-1.5 bg-[#222] text-[#ededed] rounded hover:bg-[#333] transition-all"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[#888888] text-xs">{servicio.nombre}</span>
                    <span className="text-[#888888] text-xs">${servicio.precio.toFixed(2)}</span>
                    <span className="text-[#888888] text-xs">{servicio.mesesGratis}m</span>
                    <span className="text-[#888888] text-xs">{servicio.mesesPago}m</span>
                    <span className="text-[#888888] text-xs">
                      ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                    </span>
                    <div className="flex gap-1 justify-center">
                      <button
                        aria-label={`Editar servicio base ${servicio.nombre}`}
                        onClick={() => abrirEditarServicioBase(servicio)}
                        className="p-1.5 bg-white text-black rounded hover:bg-white/90 transition-all"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        aria-label={`Eliminar servicio base ${servicio.nombre}`}
                        onClick={() => eliminarServicioBase(servicio.id)}
                        className="p-1.5 bg-white text-black rounded hover:bg-white/90 transition-all"
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
        <div className="space-y-2 p-3 bg-[#111] rounded border border-dashed border-[#333]">
          <h3 className="text-xs font-bold text-[#ededed] mb-1">Agregar Nuevo Servicio Base</h3>
          <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-2 items-end">
            <div>
              <label htmlFor="nuevoServicioBaseNombre" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBasePrecio" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBaseMesesGratis" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                min="0"
                max="12"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBaseMesesPago" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                min="1"
                max="12"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={agregarServicioBase}
              disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                  ? 'bg-white text-[#0a0a0f] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                  : 'bg-white/10 text-white/70 cursor-not-allowed'
              }`}
            >
              <FaPlus /> Agregar
            </motion.button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Sección: Descripción del Paquete */}
      <CollapsibleSection
        id="paquetes"
        title="Descripción del Paquete"
        icon=""
        defaultOpen={true}
      >
        <div className="space-y-2 p-3 bg-[#111] rounded border border-dashed border-[#333]">
          <h3 className="text-xs font-bold text-[#ededed] mb-1">Agregar Nuevo Paquete</h3>
          <div className="grid md:grid-cols-4 gap-2">
            <div>
              <label htmlFor="paqueteNombre" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
              />
            </div>
            <div>
              <label htmlFor="paqueteDesarrollo" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                Desarrollo*
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="paqueteDescuento" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="paqueteTipo" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
              />
            </div>
          </div>
          <div>
            <label htmlFor="paqueteDescripcion" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
              className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed] resize-none"
              rows={2}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Sección: Servicios Opcionales */}
      <CollapsibleSection
        id="servicios-opcionales"
        title="Servicios Opcionales del Paquete"
        icon=""
        defaultOpen={true}
      >
        {serviciosOpcionales.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="text-xs font-semibold text-[#888888] mb-2 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 px-2 text-left">
              <span>Nombre</span>
              <span>Precio</span>
              <span>Meses Gratis</span>
              <span>Meses Pago</span>
              <span>Subtotal</span>
              <span className="text-center">Acciones</span>
            </div>
            {serviciosOpcionales.map((serv) => (
              <div
                key={serv.id}
                className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center bg-[#111] p-2 rounded border border-[#333]"
              >
                {editandoServicioId === serv.id ? (
                  <>
                    <input
                      type="text"
                      value={servicioEditando?.nombre || ''}
                      aria-label="Nombre servicio opcional"
                      onChange={(e) => setServicioEditando({ ...servicioEditando!, nombre: e.target.value })}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                    <input
                      type="number"
                      value={servicioEditando?.precio || 0}
                      aria-label="Precio mensual servicio opcional"
                      min={0}
                      onChange={(e) => setServicioEditando({ ...servicioEditando!, precio: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
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
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
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
                      className="w-full px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                    <span className="text-[#888888] text-xs">${((servicioEditando?.precio || 0) * (servicioEditando?.mesesPago || 0)).toFixed(2)}</span>
                    <div className="flex gap-2 justify-center">
                      <button
                        aria-label="Guardar servicio opcional"
                        onClick={guardarEditarServicioOpcional}
                        className="w-full px-2 py-1.5 bg-white text-black rounded hover:bg-gray-200 transition-all focus:outline-none text-xs"
                        disabled={!(servicioEditando?.nombre.trim() && (servicioEditando?.precio || 0) > 0)}
                      >
                        <FaCheck />
                      </button>
                      <button
                        aria-label="Cancelar edición servicio opcional"
                        onClick={cancelarEditarServicioOpcional}
                        className="w-full px-2 py-1.5 bg-[#222] text-[#ededed] rounded hover:bg-[#333] transition-all focus:outline-none text-xs"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[#888888] text-xs">{serv.nombre}</span>
                    <span className="text-[#888888] text-xs">${serv.precio.toFixed(2)}</span>
                    <span className="text-[#888888] text-xs">{serv.mesesGratis}m</span>
                    <span className="text-[#888888] text-xs">{serv.mesesPago}m</span>
                    <span className="text-[#888888] text-xs">${(serv.precio * serv.mesesPago).toFixed(2)}</span>
                    <div className="flex gap-2 justify-center">
                      <button
                        aria-label="Editar servicio opcional"
                        onClick={() => abrirEditarServicioOpcional(serv)}
                        className="px-2 py-1 bg-white text-black rounded hover:bg-gray-200 transition-all focus:outline-none text-xs"
                      >
                        <FaEdit />
                      </button>
                      <button
                        aria-label="Eliminar servicio opcional"
                        onClick={() => eliminarServicioOpcional(serv.id)}
                        className="px-2 py-1 bg-white text-black rounded hover:bg-gray-200 transition-all focus:outline-none text-xs"
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

        <div className="space-y-2 p-3 bg-[#111] rounded border border-dashed border-[#333]">
          <h3 className="text-xs font-bold text-[#ededed] mb-1">Agregar Nuevo Servicio Opcional</h3>
          <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-2 items-end">
            <div>
              <label htmlFor="servOpcNombre" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                Nombre
              </label>
              <input
                id="servOpcNombre"
                type="text"
                placeholder="Ej: SEO Premium"
                value={nuevoServicio.nombre}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
              />
            </div>
            <div>
              <label htmlFor="servOpcPrecio" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                Precio
              </label>
              <input
                id="servOpcPrecio"
                type="number"
                min={0}
                value={nuevoServicio.precio}
                placeholder="0"
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: Number.parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
              />
            </div>
            <div>
              <label htmlFor="servOpcGratis" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
              />
            </div>
            <div>
              <label htmlFor="servOpcPago" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={agregarServicioOpcional}
              disabled={!(nuevoServicio.nombre.trim() && nuevoServicio.precio > 0)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                nuevoServicio.nombre.trim() && nuevoServicio.precio > 0
                  ? 'bg-white text-[#0a0a0f] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                  : 'bg-white/10 text-white/70 cursor-not-allowed'
              }`}
            >
              <FaPlus /> Agregar
            </motion.button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#111] rounded-lg border border-[#333] text-xs flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <span className="text-[#888888]">Servicios opcionales: {serviciosOpcionales.length}</span>
          <span className="text-[#888888]">Total Año 1: ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span>
          <span className="text-[#888888]">Total Anual (Año 2+): ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span>
        </div>
        {!serviciosOpcionalesValidos && serviciosOpcionales.length > 0 && (
          <p className="mt-1 text-[10px] text-[#888888]">
            Revisa meses (Meses Gratis + Meses Pago deben sumar 12) y que todos tengan nombre y precio.
          </p>
        )}

        {!todoEsValido && (
          <div className="mt-4 pt-3 border-t border-[#333]">
            <p className="text-xs text-[#888888] text-center bg-[#111] p-3 rounded-lg border border-[#333]">
              ⚠️ Completa: Nombre del paquete, Desarrollo, Precios servicios y Meses válidos
            </p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
