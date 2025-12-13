'use client'

import React, { useCallback } from 'react'
import { Check, X, Edit, Trash2, Plus, Boxes } from 'lucide-react'
import { motion } from 'framer-motion'
import { ServicioBase } from '@/lib/types'
import { useEventTracking } from '@/features/admin/hooks'
import ContentHeader from '@/features/admin/components/content/contenido/ContentHeader'
import { ToggleSwitchWithLabel } from '@/features/admin/components/ToggleSwitch'

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
  updatedAt?: string | null
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
  updatedAt,
}: Readonly<ServiciosBaseContentProps>) {
  // Hook de tracking
  const { 
    trackServicioBaseCreated, 
    trackServicioBaseEdited, 
    trackServicioBaseDeleted 
  } = useEventTracking()

  // Handlers con tracking
  const handleAgregar = useCallback(() => {
    agregarServicioBase()
    if (nuevoServicioBase.nombre && nuevoServicioBase.precio > 0) {
      trackServicioBaseCreated(nuevoServicioBase.nombre, nuevoServicioBase.precio)
    }
  }, [agregarServicioBase, nuevoServicioBase.nombre, nuevoServicioBase.precio, trackServicioBaseCreated])

  const handleGuardarEdicion = useCallback(() => {
    guardarEditarServicioBase()
    if (servicioBaseEditando) {
      trackServicioBaseEdited(servicioBaseEditando.id, servicioBaseEditando.nombre)
    }
  }, [guardarEditarServicioBase, servicioBaseEditando, trackServicioBaseEdited])

  const handleEliminar = useCallback((id: string, nombre: string) => {
    trackServicioBaseDeleted(id, nombre)
    eliminarServicioBase(id)
  }, [eliminarServicioBase, trackServicioBaseDeleted])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header with ContentHeader */}
      <ContentHeader
        title="Servicios Base"
        subtitle="Servicios incluidos en la oferta"
        icon={Boxes}
        statusIndicator={updatedAt ? 'guardado' : 'sin-modificar'}
        updatedAt={updatedAt}
        badge={`${serviciosBase.length} servicio${serviciosBase.length !== 1 ? 's' : ''}`}
      />

      {/* Lista de Servicios Base Existentes */}
      {serviciosBase.length > 0 && (
        <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
            <div className="text-xs font-medium text-gh-text-muted grid md:grid-cols-[2.5fr,0.8fr,0.8fr,0.8fr,0.8fr,0.8fr,1fr] gap-3">
              <span>Nombre</span>
              <span>Precio</span>
              <span>M. Gratis</span>
              <span>M. Pago</span>
              <span>Tipo</span>
              <span>Subtotal</span>
              <span className="text-center">Acciones</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {serviciosBase.map((servicio) => (
              <div
                key={servicio.id}
                className="grid md:grid-cols-[2.5fr,0.8fr,0.8fr,0.8fr,0.8fr,0.8fr,1fr] gap-3 items-center bg-gh-bg-tertiary/50 p-4 rounded-md border border-gh-border/30"
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
                      className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
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
                      className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
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
                      className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
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
                      className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
                      min="1"
                      max="12"
                    />
                    <div className="flex items-center justify-center">
                      <ToggleSwitchWithLabel
                        enabled={(servicioBaseEditando?.frecuenciaPago || 'mensual') === 'anual'}
                        onChange={(v) => setServicioBaseEditando({ ...servicioBaseEditando!, frecuenciaPago: v ? 'anual' : 'mensual' })}
                        label={(servicioBaseEditando?.frecuenciaPago || 'mensual') === 'mensual' ? 'Mensual' : 'Anual'}
                        size="sm"
                        labelPosition="right"
                      />
                    </div>
                  <span className="text-xs font-semibold text-gh-text text-center">
                    ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      aria-label="Guardar servicio base"
                      onClick={handleGuardarEdicion}
                      className="p-2 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      aria-label="Cancelar edición servicio base"
                      onClick={cancelarEditarServicioBase}
                      className="p-2 bg-gh-bg-tertiary text-gh-text-muted border border-gh-border/30 rounded-md hover:bg-gh-border transition-colors"
                    >
                      <X className="w-3 h-3" />
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
                      className="p-2 bg-gh-accent/10 text-gh-accent border border-gh-accent/30 rounded-md hover:bg-gh-accent/20 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      aria-label={`Eliminar servicio base ${servicio.nombre}`}
                      onClick={() => handleEliminar(servicio.id, servicio.nombre)}
                      className="p-2 bg-gh-danger/10 text-gh-danger border border-gh-danger/30 rounded-md hover:bg-gh-danger/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Formulario para Agregar Nuevo Servicio Base */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-gh-accent" /> Agregar Nuevo Servicio Base
          </h5>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-[2fr,0.8fr,0.8fr,0.8fr,0.8fr,auto] gap-3 items-end">
            <div>
              <label htmlFor="nuevoServicioBaseNombre" className="block text-xs font-medium text-gh-text mb-1.5">
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
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBasePrecio" className="block text-xs font-medium text-gh-text mb-1.5">
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
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBaseMesesGratis" className="block text-xs font-medium text-gh-text mb-1.5">
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
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
                min="0"
                max="12"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBaseMesesPago" className="block text-xs font-medium text-gh-text mb-1.5">
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
                className="w-full px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 text-xs text-gh-text outline-none transition"
                min="1"
                max="12"
              />
            </div>
            <div>
              <label htmlFor="nuevoServicioBaseFrecuencia" className="block text-xs font-medium text-gh-text mb-1.5">
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
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gh-bg-tertiary/50 border border-gh-border/30 rounded-md hover:border-gh-accent/50 transition-colors h-[38px] w-full"
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
              onClick={handleAgregar}
              disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
              className={`px-6 py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                  ? 'bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20'
                  : 'bg-gh-bg-tertiary text-gh-text-muted border border-gh-border/30 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3 h-3" /> Agregar
            </motion.button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {serviciosBase.length > 0 && (
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <span className="text-gh-text-muted">Total servicios base: {serviciosBase.length}</span>
          <span className="text-gh-text-muted">Año 1: ${serviciosBase.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span>
          <span className="text-gh-text-muted">Año 2+: ${serviciosBase.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span>
        </div>
      )}
    </motion.div>
  )
}


