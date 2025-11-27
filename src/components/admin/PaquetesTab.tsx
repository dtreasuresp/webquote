'use client'

import React, { useState } from 'react'
import { FaCalculator, FaEdit, FaTrash } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { PackageSnapshot, QuotationConfig, DialogConfig } from '@/lib/types'
import CollapsibleSection from '@/features/admin/components/CollapsibleSection'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

interface ToastHandler {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

interface PaquetesTabProps {
  snapshots: PackageSnapshot[]
  setSnapshots: (snapshots: PackageSnapshot[]) => void
  cargandoSnapshots: boolean
  errorSnapshots: string | null
  abrirModalEditar: (snapshot: PackageSnapshot) => void
  handleEliminarSnapshot: (id: string) => void
  calcularCostoInicialSnapshot: (snapshot: PackageSnapshot) => number
  calcularCostoAño1Snapshot: (snapshot: PackageSnapshot) => number
  calcularCostoAño2Snapshot: (snapshot: PackageSnapshot) => number
  actualizarSnapshot: (id: string, snapshot: PackageSnapshot) => Promise<PackageSnapshot>
  refreshSnapshots: () => Promise<void>
  // Nuevas props para toasts y diálogos
  toast: ToastHandler
  mostrarDialogoGenerico: (config: DialogConfig) => void
  cotizacionConfig: QuotationConfig | null
}

export default function PaquetesTab({
  snapshots,
  setSnapshots,
  cargandoSnapshots,
  errorSnapshots,
  abrirModalEditar,
  handleEliminarSnapshot,
  calcularCostoInicialSnapshot,
  calcularCostoAño1Snapshot,
  calcularCostoAño2Snapshot,
  actualizarSnapshot,
  refreshSnapshots,
  toast,
  mostrarDialogoGenerico,
  cotizacionConfig,
}: PaquetesTabProps) {
  // Estado para controlar botones durante operaciones
  const [procesandoId, setProcesandoId] = useState<string | null>(null)

  // Validar si es el último paquete activo
  const esUltimoPaqueteActivo = (snapshotId: string): boolean => {
    const paquetesActivos = snapshots.filter(
      s => s.activo && s.quotationConfigId === cotizacionConfig?.id
    )
    return paquetesActivos.length === 1 && paquetesActivos[0].id === snapshotId
  }

  // Handler para toggle activo/inactivo
  const handleToggleActivo = async (snapshot: PackageSnapshot) => {
    const nuevoEstado = !snapshot.activo

    // Si está intentando DESACTIVAR
    if (!nuevoEstado) {
      // Validar si es el último paquete activo
      if (esUltimoPaqueteActivo(snapshot.id)) {
        mostrarDialogoGenerico({
          tipo: 'advertencia',
          titulo: 'No se puede desactivar',
          icono: '⚠️',
          mensaje: 'Este es el único paquete activo. Debe existir al menos un paquete activo en la cotización.',
          botones: [{ label: 'Entendido', action: () => {}, style: 'primary' }]
        })
        return
      }

      // Mostrar confirmación antes de desactivar
      mostrarDialogoGenerico({
        tipo: 'confirmacion',
        titulo: '¿Desactivar paquete?',
        icono: '⏸️',
        mensaje: `El paquete "${snapshot.nombre}" dejará de mostrarse en la cotización activa. ¿Deseas continuar?`,
        botones: [
          { label: 'Cancelar', action: () => {}, style: 'secondary' },
          {
            label: 'Desactivar',
            action: async () => {
              await ejecutarToggle(snapshot, false)
            },
            style: 'danger'
          }
        ]
      })
    } else {
      // ACTIVAR directamente sin confirmación
      await ejecutarToggle(snapshot, true)
    }
  }

  // Ejecutar el toggle en BD
  const ejecutarToggle = async (snapshot: PackageSnapshot, nuevoEstado: boolean) => {
    setProcesandoId(snapshot.id)
    try {
      const actualizado = { ...snapshot, activo: nuevoEstado }
      actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
      actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
      actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
      
      const guardado = await actualizarSnapshot(actualizado.id, actualizado)
      
      // Actualizar estado local inmediatamente para reflejar el cambio en la UI
      setSnapshots(snapshots.map(s => s.id === snapshot.id ? guardado : s))
      
      // Notificar a otros componentes
      await refreshSnapshots()
      
      toast.success(nuevoEstado ? '✅ Paquete activado' : '✅ Paquete desactivado')
    } catch (err) {
      console.error('Error al cambiar estado activo:', err)
      toast.error(nuevoEstado ? '❌ Error al activar el paquete' : '❌ Error al desactivar el paquete')
    } finally {
      setProcesandoId(null)
    }
  }

  // Handler para eliminar con validación
  const handleEliminarConValidacion = (snapshot: PackageSnapshot) => {
    // Validar si es el último paquete activo
    if (snapshot.activo && esUltimoPaqueteActivo(snapshot.id)) {
      mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'No se puede eliminar',
        icono: '⚠️',
        mensaje: 'Este es el único paquete activo. Debe existir al menos un paquete activo en la cotización. Activa otro paquete antes de eliminar este.',
        botones: [{ label: 'Entendido', action: () => {}, style: 'primary' }]
      })
      return
    }

    // Proceder con la eliminación (el diálogo de confirmación está en handleEliminarSnapshot)
    handleEliminarSnapshot(snapshot.id)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Sección: Paquetes Creados */}
      <CollapsibleSection
        id="paquetes-creados"
        title={`Paquetes Creados (${snapshots.filter(s => s.activo).length})`}
        icon=""
        defaultOpen={true}
      >
        {cargandoSnapshots ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gh-bg-secondary rounded-lg border border-gh-border p-8 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <FaCalculator className="text-gh-text-muted text-2xl" />
              </motion.div>
              <p className="text-sm text-gh-text-muted font-medium">Cargando paquetes...</p>
            </div>
          </motion.div>
        ) : errorSnapshots ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-500/5 rounded-lg border border-red-500/20 p-6"
          >
            <p className="text-red-400 font-medium text-sm">{errorSnapshots}</p>
          </motion.div>
        ) : snapshots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {snapshots.filter(s => s.activo).map((snapshot, idx) => (
                <motion.div
                  key={snapshot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gh-bg rounded-lg border border-gh-border overflow-hidden hover:border-gh-border-hover transition-colors"
                >
                  {/* Header del Snapshot */}
                  <div className="bg-gh-bg-secondary px-4 py-3 border-b border-gh-border">
                    <div className="flex items-start justify-between">
                      {/* Info del paquete */}
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gh-text truncate">
                            {snapshot.nombre}
                          </h3>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gh-success/10 rounded-full shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-gh-success"></span>
                            <span className="text-[10px] text-gh-success font-medium">Activo</span>
                          </span>
                        </div>
                        {snapshot.paquete.tipo && (
                          <span className="inline-block text-[10px] font-medium tracking-wide text-gh-text-muted uppercase bg-gh-border/50 px-2 py-0.5 rounded">
                            {snapshot.paquete.tipo}
                          </span>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={procesandoId === snapshot.id}
                          onClick={() => handleToggleActivo(snapshot)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all border ${
                            procesandoId === snapshot.id
                              ? 'opacity-50 cursor-not-allowed border-gh-border bg-gh-bg'
                              : 'border-gh-success/30 bg-gh-success/10 text-gh-success hover:bg-gh-success/20'
                          }`}
                          title="Desactivar"
                        >
                          {procesandoId === snapshot.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => abrirModalEditar(snapshot)}
                          className="w-8 h-8 rounded-md bg-gh-bg hover:bg-gh-border text-gh-text-muted hover:text-gh-text transition-all flex items-center justify-center border border-gh-border"
                          title="Editar paquete"
                        >
                          <FaEdit size={13} />
                        </motion.button>

                        <motion.button
                          aria-label={`Eliminar paquete ${snapshot.nombre}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEliminarConValidacion(snapshot)}
                          className="w-8 h-8 rounded-md bg-gh-bg hover:bg-red-500/10 text-gh-text-muted hover:text-red-400 transition-all flex items-center justify-center border border-gh-border hover:border-red-500/30"
                          title="Eliminar paquete"
                        >
                          <FaTrash size={12} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Descripción */}
                    {snapshot.paquete.descripcion && (
                      <p className="text-xs text-gh-text-muted mt-2 line-clamp-2">
                        {snapshot.paquete.descripcion}
                      </p>
                    )}

                    {/* Fecha */}
                    <p className="text-[10px] text-gh-text-muted mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(snapshot.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Tabla de detalle */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gh-bg-secondary border-b border-gh-border">
                          <th className="text-left px-3 py-2 font-semibold text-gh-text text-[11px]">Concepto</th>
                          <th className="text-center px-2 py-2 font-semibold text-gh-text text-[11px] hidden sm:table-cell">Gratis</th>
                          <th className="text-center px-2 py-2 font-semibold text-gh-text text-[11px] hidden sm:table-cell">Pago</th>
                          <th className="text-right px-2 py-2 font-semibold text-gh-text text-[11px]">Mensual</th>
                          <th className="text-right px-2 py-2 font-semibold text-gh-text text-[11px]">Año 1</th>
                          <th className="text-right px-3 py-2 font-semibold text-gh-text text-[11px]">Año 2</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gh-border">
                        {/* Servicios Base - Header */}
                        <tr className="bg-gh-bg-secondary/50">
                          <td colSpan={6} className="px-3 py-1.5">
                            <span className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-wider">
                              Servicios Base
                            </span>
                          </td>
                        </tr>
                        {(() => {
                          const preview = calcularPreviewDescuentos(snapshot)
                          return snapshot.serviciosBase?.map((servicio) => {
                            const servicioPreview = preview.serviciosBase.desglose.find(s => s.id === servicio.id)
                            const descuento = servicioPreview?.descuentoAplicado || 0
                            const precioConDescuento = servicioPreview?.conDescuento || servicio.precio
                            return (
                              <tr key={servicio.id} className="hover:bg-gh-bg-secondary/30 transition-colors">
                                <td className="px-3 py-2 text-gh-text">
                                  {servicio.nombre}
                                  {descuento > 0 && (
                                    <span className="ml-1.5 text-gh-success text-[10px] font-semibold">
                                      (↓ -{descuento.toFixed(1)}%)
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">
                                  <span className="inline-flex items-center justify-center min-w-[20px] px-1 py-0.5 bg-gh-success/10 text-gh-success rounded text-[10px] font-medium">
                                    {servicio.mesesGratis}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">
                                  <span className="inline-flex items-center justify-center min-w-[20px] px-1 py-0.5 bg-gh-border/50 text-gh-text rounded text-[10px] font-medium">
                                    {servicio.mesesPago}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-right font-mono text-gh-text">
                                  {descuento > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="line-through text-gh-text-muted text-[10px]">
                                        ${servicio.precio.toFixed(0)}
                                      </span>
                                      <span className="text-gh-success">
                                        ${precioConDescuento.toFixed(0)}
                                      </span>
                                    </div>
                                  ) : (
                                    `$${servicio.precio.toFixed(0)}`
                                  )}
                                </td>
                                <td className="px-2 py-2 text-right font-mono text-gh-text">
                                  {descuento > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="line-through text-gh-text-muted text-[10px]">
                                        ${(servicio.precio * servicio.mesesPago).toFixed(0)}
                                      </span>
                                      <span className="text-gh-success">
                                        ${(precioConDescuento * servicio.mesesPago).toFixed(0)}
                                      </span>
                                    </div>
                                  ) : (
                                    `$${(servicio.precio * servicio.mesesPago).toFixed(0)}`
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-gh-text">
                                  {descuento > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="line-through text-gh-text-muted text-[10px]">
                                        ${(servicio.precio * 12).toFixed(0)}
                                      </span>
                                      <span className="text-gh-success">
                                        ${(precioConDescuento * 12).toFixed(0)}
                                      </span>
                                    </div>
                                  ) : (
                                    `$${(servicio.precio * 12).toFixed(0)}`
                                  )}
                                </td>
                              </tr>
                            )
                          })
                        })() || (
                          <tr>
                            <td colSpan={6} className="px-3 py-2 text-center text-gh-text-muted italic text-[10px]">
                              Sin servicios base
                            </td>
                          </tr>
                        )}

                        {/* Desarrollo - Header */}
                        <tr className="bg-gh-bg-secondary/50">
                          <td colSpan={6} className="px-3 py-1.5">
                            <span className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-wider">
                              Desarrollo
                            </span>
                          </td>
                        </tr>
                        {(() => {
                          const preview = calcularPreviewDescuentos(snapshot)
                          const descuentoDesarrollo = preview.desarrollo > 0 
                            ? ((1 - preview.desarrolloConDescuento / preview.desarrollo) * 100)
                            : 0
                          return (
                            <tr className="hover:bg-gh-bg-secondary/30 transition-colors">
                              <td className="px-3 py-2 text-gh-text">
                                Costo de desarrollo
                                {descuentoDesarrollo > 0 && (
                                  <span className="ml-1.5 text-gh-success text-[10px] font-semibold">
                                    (↓ -{descuentoDesarrollo.toFixed(1)}%)
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">—</td>
                              <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">—</td>
                              <td className="px-2 py-2 text-right font-mono text-gh-text">
                                {descuentoDesarrollo > 0 ? (
                                  <div className="flex flex-col items-end">
                                    <span className="line-through text-gh-text-muted text-[10px]">
                                      ${snapshot.paquete.desarrollo.toFixed(0)}
                                    </span>
                                    <span className="text-gh-success">
                                      ${preview.desarrolloConDescuento.toFixed(0)}
                                    </span>
                                  </div>
                                ) : (
                                  `$${snapshot.paquete.desarrollo.toFixed(0)}`
                                )}
                              </td>
                              <td className="px-2 py-2 text-right font-mono text-gh-text">
                                {descuentoDesarrollo > 0 ? (
                                  <div className="flex flex-col items-end">
                                    <span className="line-through text-gh-text-muted text-[10px]">
                                      ${snapshot.paquete.desarrollo.toFixed(0)}
                                    </span>
                                    <span className="text-gh-success">
                                      ${preview.desarrolloConDescuento.toFixed(0)}
                                    </span>
                                  </div>
                                ) : (
                                  `$${snapshot.paquete.desarrollo.toFixed(0)}`
                                )}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-gh-text-muted">—</td>
                            </tr>
                          )
                        })()}

                        {/* Otros Servicios */}
                        {snapshot.otrosServicios.length > 0 && (
                          <>
                            <tr className="bg-gh-bg-secondary/50">
                              <td colSpan={6} className="px-3 py-1.5">
                                <span className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-wider">
                                  Servicios Adicionales
                                </span>
                              </td>
                            </tr>
                            {(() => {
                              const preview = calcularPreviewDescuentos(snapshot)
                              return snapshot.otrosServicios.map((servicio, sIdx) => {
                                const servicioPreview = preview.otrosServicios.desglose.find(s => s.id === (servicio.id || `otro-${sIdx}`))
                                const descuento = servicioPreview?.descuentoAplicado || 0
                                const precioConDescuento = servicioPreview?.conDescuento || servicio.precio
                                return (
                                  <tr key={servicio.id || sIdx} className="hover:bg-gh-bg-secondary/30 transition-colors">
                                    <td className="px-3 py-2 text-gh-text">
                                      {servicio.nombre}
                                      {descuento > 0 && (
                                        <span className="ml-1.5 text-gh-success text-[10px] font-semibold">
                                          (↓ -{descuento.toFixed(1)}%)
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">
                                      <span className="inline-flex items-center justify-center min-w-[20px] px-1 py-0.5 bg-gh-success/10 text-gh-success rounded text-[10px] font-medium">
                                        {servicio.mesesGratis}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">
                                      <span className="inline-flex items-center justify-center min-w-[20px] px-1 py-0.5 bg-gh-border/50 text-gh-text rounded text-[10px] font-medium">
                                        {servicio.mesesPago}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-right font-mono text-gh-text">
                                      {descuento > 0 ? (
                                        <div className="flex flex-col items-end">
                                          <span className="line-through text-gh-text-muted text-[10px]">
                                            ${servicio.precio.toFixed(0)}
                                          </span>
                                          <span className="text-gh-success">
                                            ${precioConDescuento.toFixed(0)}
                                          </span>
                                        </div>
                                      ) : (
                                        `$${servicio.precio.toFixed(0)}`
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-right font-mono text-gh-text">
                                      {descuento > 0 ? (
                                        <div className="flex flex-col items-end">
                                          <span className="line-through text-gh-text-muted text-[10px]">
                                            ${(servicio.precio * servicio.mesesPago).toFixed(0)}
                                          </span>
                                          <span className="text-gh-success">
                                            ${(precioConDescuento * servicio.mesesPago).toFixed(0)}
                                          </span>
                                        </div>
                                      ) : (
                                        `$${(servicio.precio * servicio.mesesPago).toFixed(0)}`
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-gh-text">
                                      {descuento > 0 ? (
                                        <div className="flex flex-col items-end">
                                          <span className="line-through text-gh-text-muted text-[10px]">
                                            ${(servicio.precio * 12).toFixed(0)}
                                          </span>
                                          <span className="text-gh-success">
                                            ${(precioConDescuento * 12).toFixed(0)}
                                          </span>
                                        </div>
                                      ) : (
                                        `$${(servicio.precio * 12).toFixed(0)}`
                                      )}
                                    </td>
                                  </tr>
                                )
                              })
                            })()}
                          </>
                        )}
                      </tbody>
                      {/* Footer - Totales */}
                      <tfoot className="bg-gh-bg-secondary border-t-2 border-gh-border">
                        {(() => {
                          const preview = calcularPreviewDescuentos(snapshot)
                          const descuentoTotal = preview.subtotalOriginal > 0 
                            ? ((preview.subtotalOriginal - preview.subtotalConDescuentos) / preview.subtotalOriginal * 100)
                            : 0
                          
                          return (
                            <>
                              <tr>
                                <td colSpan={6} className="px-3 py-1.5">
                                  <span className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-wider">
                                    Resumen de Costos
                                    {descuentoTotal > 0 && (
                                      <span className="ml-2 text-gh-success">
                                        (↓ -{descuentoTotal.toFixed(1)}% descuento total)
                                      </span>
                                    )}
                                  </span>
                                </td>
                              </tr>
                              <tr className="border-t border-gh-border">
                                <td colSpan={3} className="px-3 py-2 text-gh-text font-medium">
                                  Pago Inicial
                                </td>
                                <td colSpan={3} className="px-3 py-2 text-right">
                                  {descuentoTotal > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="font-mono text-gh-text-muted text-xs line-through">
                                        ${preview.subtotalOriginal.toLocaleString('es-CO')}
                                      </span>
                                      <span className="font-mono font-bold text-gh-success text-sm">
                                        ${snapshot.costos.inicial.toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-mono font-bold text-gh-text text-sm">
                                      ${snapshot.costos.inicial.toLocaleString('es-CO')}
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr className="border-t border-gh-border">
                                <td colSpan={3} className="px-3 py-2 text-gh-text font-medium">Total Año 1</td>
                                <td colSpan={3} className="px-3 py-2 text-right">
                                  {descuentoTotal > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="font-mono text-gh-text-muted text-xs line-through">
                                        ${(() => {
                                          const serviciosBaseAnual = snapshot.serviciosBase.reduce((sum, s) => sum + (s.precio * 12), 0)
                                          const otrosServiciosAnual = snapshot.otrosServicios.reduce((sum, s) => sum + (s.precio * 12), 0)
                                          return (preview.desarrollo + serviciosBaseAnual + otrosServiciosAnual).toLocaleString('es-CO')
                                        })()}
                                      </span>
                                      <span className="font-mono font-bold text-gh-success text-sm">
                                        ${snapshot.costos.año1.toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-mono font-bold text-gh-success text-sm">
                                      ${snapshot.costos.año1.toLocaleString('es-CO')}
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr className="border-t border-gh-border">
                                <td colSpan={3} className="px-3 py-2 text-gh-text font-medium">Total Año 2</td>
                                <td colSpan={3} className="px-3 py-2 text-right">
                                  {descuentoTotal > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="font-mono text-gh-text-muted text-xs line-through">
                                        ${(() => {
                                          const serviciosBaseAnual = snapshot.serviciosBase.reduce((sum, s) => sum + (s.precio * 12), 0)
                                          const otrosServiciosAnual = snapshot.otrosServicios.reduce((sum, s) => sum + (s.precio * 12), 0)
                                          return (serviciosBaseAnual + otrosServiciosAnual).toLocaleString('es-CO')
                                        })()}
                                      </span>
                                      <span className="font-mono font-bold text-gh-text text-sm">
                                        ${snapshot.costos.año2.toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-mono font-bold text-gh-text text-sm">
                                      ${snapshot.costos.año2.toLocaleString('es-CO')}
                                    </span>
                                  )}
                                </td>
                              </tr>
                              <tr className="border-t border-gh-border bg-gh-bg">
                                <td colSpan={6} className="px-3 py-1.5 text-center">
                                  <span className="text-[10px] text-gh-text-muted italic">
                                    Año 2 no incluye desarrollo (pago único en Año 1)
                                  </span>
                                </td>
                              </tr>
                            </>
                          )
                        })()}
                      </tfoot>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
        ) : (
          <div className="bg-gh-bg rounded-lg border border-dashed border-gh-border p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gh-bg-secondary flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-sm text-gh-text font-medium">No hay paquetes creados</p>
            <p className="text-xs text-gh-text-muted mt-1">Crea tu primer paquete completando los datos arriba</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Sección: Paquetes Inactivos */}
      {snapshots.filter(s => !s.activo).length > 0 && (
        <CollapsibleSection
          id="paquetes-inactivos"
          title={`Paquetes Inactivos (${snapshots.filter(s => !s.activo).length})`}
          icon=""
          defaultOpen={false}
        >
          <div className="space-y-4">
            {snapshots.filter(s => !s.activo).map((snapshot, idx) => (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gh-bg-secondary rounded-lg border border-dashed border-gh-border p-4 opacity-50 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gh-text text-lg">{snapshot.nombre}</h3>
                    {snapshot.paquete.tipo && (
                      <p className="text-xs font-semibold tracking-wide text-gh-text-muted uppercase mt-1">
                        {snapshot.paquete.tipo}
                      </p>
                    )}
                    {snapshot.paquete.descripcion && (
                      <p className="text-sm text-gh-text-muted italic mt-1">
                        {snapshot.paquete.descripcion}
                      </p>
                    )}
                    <p className="text-sm text-gh-text-muted mt-2">
                      {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={procesandoId === snapshot.id}
                      onClick={() => handleToggleActivo(snapshot)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                        procesandoId === snapshot.id
                          ? 'opacity-50 cursor-not-allowed bg-gh-border text-gh-text-muted'
                          : 'bg-gh-success text-white hover:bg-gh-success/90'
                      }`}
                    >
                      {procesandoId === snapshot.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      Activar
                    </motion.button>
                    <motion.button
                      aria-label={`Eliminar paquete ${snapshot.nombre}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEliminarConValidacion(snapshot)}
                      className="w-9 h-9 bg-gh-bg text-gh-text-muted hover:bg-gh-border transition-colors flex items-center justify-center rounded-lg"
                    >
                      <FaTrash size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
