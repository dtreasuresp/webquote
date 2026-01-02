'use client'

import React, { useState } from 'react'
import { Calculator, Edit, Trash2, Layers, ArrowLeftRight, Scale } from 'lucide-react'
import { motion } from 'framer-motion'
import { PackageSnapshot, QuotationConfig, DialogConfig } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'
import { formatCurrency } from '@/lib/utils'
import { useEventTracking, useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import SectionHeader from '@/features/admin/components/SectionHeader'

interface ToastHandler {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

export interface PaquetesContentProps {
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
  toast: ToastHandler
  mostrarDialogoGenerico: (config: DialogConfig) => void
  cotizacionConfig: QuotationConfig | null
  /** Handler para comparar un paquete específico con versiones anteriores */
  onCompararPaquete?: (snapshot: PackageSnapshot) => void
  /** Handler para comparar dos paquetes individuales */
  onCompararPaqueteIndividual?: (snapshot: PackageSnapshot) => void
  /** Paquete actualmente seleccionado para comparación individual */
  paqueteParaComparar?: PackageSnapshot | null
  updatedAt?: string | null
}

export default function PaquetesContent({
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
  onCompararPaquete,
  onCompararPaqueteIndividual,
  paqueteParaComparar,
  updatedAt,
}: Readonly<PaquetesContentProps>) {
  const [procesandoId, setProcesandoId] = useState<string | null>(null)
  
  // Hooks de auditoría y permisos
  const { logAction } = useAdminAudit()
  const { canEdit, canDelete } = useAdminPermissions()

  // Hook de tracking
  const { trackSnapshotActivated, trackSnapshotDeactivated, trackPaqueteDeleted, trackModalOpened } = useEventTracking()

  const esUltimoPaqueteActivo = (snapshotId: string): boolean => {
    const paquetesActivos = snapshots.filter(
      s => s.activo && s.quotationConfigId === cotizacionConfig?.id
    )
    return paquetesActivos.length === 1 && paquetesActivos[0].id === snapshotId
  }

  const handleToggleActivo = async (snapshot: PackageSnapshot) => {
    if (!canEdit('OFFERS')) return
    const nuevoEstado = !snapshot.activo

    if (!nuevoEstado) {
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
              logAction('UPDATE', 'OFFERS', snapshot.id, `Paquete Desactivado: ${snapshot.nombre}`)
            },
            style: 'danger'
          }
        ]
      })
    } else {
      await ejecutarToggle(snapshot, true)
      logAction('UPDATE', 'OFFERS', snapshot.id, `Paquete Activado: ${snapshot.nombre}`)
    }
  }

  const ejecutarToggle = async (snapshot: PackageSnapshot, nuevoEstado: boolean) => {
    setProcesandoId(snapshot.id)
    try {
      const actualizado = { ...snapshot, activo: nuevoEstado }
      actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
      actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
      actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
      const guardado = await actualizarSnapshot(actualizado.id, actualizado)
      setSnapshots(snapshots.map(s => s.id === snapshot.id ? guardado : s))
      await refreshSnapshots()
      
      // Tracking de activación/desactivación
      if (nuevoEstado) {
        trackSnapshotActivated(snapshot.id, snapshot.nombre)
      } else {
        trackSnapshotDeactivated(snapshot.id, snapshot.nombre)
      }
      
      toast.success(nuevoEstado ? '✅ Paquete activado' : '✅ Paquete desactivado')
    } catch (err) {
      console.error('Error al cambiar estado activo:', err)
      toast.error(nuevoEstado ? '❌ Error al activar el paquete' : '❌ Error al desactivar el paquete')
    } finally {
      setProcesandoId(null)
    }
  }

  const handleEliminarConValidacion = (snapshot: PackageSnapshot) => {
    if (!canDelete('OFFERS')) return
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

    mostrarDialogoGenerico({
      tipo: 'confirmacion',
      titulo: '¿Eliminar paquete?',
      icono: '🗑️',
      mensaje: `Esta acción no se puede deshacer. El paquete "${snapshot.nombre}" será eliminado permanentemente.`,
      botones: [
        { label: 'Cancelar', action: () => {}, style: 'secondary' },
        {
          label: 'Eliminar',
          action: () => {
            handleEliminarSnapshot(snapshot.id)
            trackPaqueteDeleted(snapshot.id, snapshot.nombre)
            logAction('DELETE', 'OFFERS', snapshot.id, `Paquete Eliminado: ${snapshot.nombre}`)
          },
          style: 'danger'
        }
      ]
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header with SectionHeader */}
      <SectionHeader
        title="Ofertas Creadas"
        description="Gestiona los paquetes disponibles en la cotización"
        icon={<Layers className="w-4 h-4" />}
        statusIndicator={updatedAt ? 'guardado' : 'sin-modificar'}
        updatedAt={updatedAt}
        itemCount={snapshots.length}
        variant="accent"
      />

      {/* Contenido Principal */}
      {cargandoSnapshots ? (
          <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg p-8">
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Calculator className="w-5 h-5 text-gh-text-muted" />
              </motion.div>
              <p className="text-xs text-gh-text-muted">Cargando paquetes...</p>
            </div>
          </div>
        ) : errorSnapshots ? (
          <div className="bg-gh-danger/5 border border-gh-danger/30 rounded-lg p-4">
            <p className="text-xs text-gh-danger">{errorSnapshots}</p>
          </div>
        ) : snapshots.length > 0 ? (
            <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
                <h5 className="text-xs font-medium text-gh-text">Ofertas Activas</h5>
              </div>
              <div className="p-3 grid md:grid-cols-2 gap-3">
              {snapshots.filter(s => s.activo).map((snapshot, idx) => (
                <motion.div
                  key={snapshot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gh-bg border border-gh-border/30 rounded-lg overflow-hidden hover:border-gh-accent/30 transition-colors"
                >
                  <div className="px-4 py-3 border-b border-gh-border/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gh-accent to-gh-info flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gh-text leading-tight">
                              {snapshot.nombre}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {snapshot.paquete.tipo && (
                                <span className="text-[10px] font-medium text-gh-text-muted bg-gh-bg-secondary px-2 py-0.5 rounded">
                                  {snapshot.paquete.tipo}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gh-success">
                                <span className="w-1.5 h-1.5 rounded-full bg-gh-success"></span>
                                Activo
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

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
                          <Edit className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Botón Historial - Comparar con versiones anteriores del mismo paquete */}
                        {onCompararPaquete && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCompararPaquete(snapshot)}
                            className="w-8 h-8 rounded-md bg-gh-bg hover:bg-cyan-500/10 text-gh-text-muted hover:text-cyan-400 transition-all flex items-center justify-center border border-gh-border hover:border-cyan-500/30"
                            title="Comparar con versiones anteriores"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </motion.button>
                        )}

                        {/* Botón Comparar - Comparar dos paquetes individuales */}
                        {onCompararPaqueteIndividual && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCompararPaqueteIndividual(snapshot)}
                            className={`w-8 h-8 rounded-md transition-all flex items-center justify-center border ${
                              paqueteParaComparar?.id === snapshot.id
                                ? 'bg-gh-info text-white border-gh-info'
                                : 'bg-gh-bg hover:bg-gh-info/10 text-gh-text-muted hover:text-gh-info border-gh-border hover:border-gh-info/30'
                            }`}
                            title={paqueteParaComparar ? 'Seleccionar segundo paquete para comparar' : 'Comparar con otro paquete'}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </motion.button>
                        )}

                        <motion.button
                          aria-label={`Eliminar paquete ${snapshot.nombre}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEliminarConValidacion(snapshot)}
                          className="w-8 h-8 rounded-md bg-gh-bg hover:bg-red-500/10 text-gh-text-muted hover:text-red-400 transition-all flex items-center justify-center border border-gh-border hover:border-red-500/30"
                          title="Eliminar paquete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>

                    {snapshot.paquete.descripcion && (
                      <p className="text-xs text-gh-text-muted/80 mt-3 line-clamp-2 leading-relaxed pl-[52px]">
                        {snapshot.paquete.descripcion}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 pl-[52px] text-[10px] text-gh-text-muted/50">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(snapshot.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {snapshot.serviciosBase?.length || 0} servicios
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gh-bg-secondary/50">
                          <th className="text-left px-4 py-3 font-medium text-gh-text-muted text-[11px]">Servicio</th>
                          <th className="text-center px-2 py-3 font-medium text-gh-text-muted text-[11px] hidden sm:table-cell">Gratis</th>
                          <th className="text-center px-2 py-3 font-medium text-gh-text-muted text-[11px] hidden sm:table-cell">Pago</th>
                          <th className="text-right px-2 py-3 font-medium text-gh-text-muted text-[11px]">Mensual</th>
                          <th className="text-right px-2 py-3 font-medium text-gh-text-muted text-[11px]">Año 1</th>
                          <th className="text-right px-4 py-3 font-medium text-gh-text-muted text-[11px]">Año 2</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gh-border">
                        <tr className="border-t border-gh-border/30">
                          <td colSpan={6} className="px-4 py-2 bg-gh-bg-secondary/30">
                            <span className="text-[10px] font-semibold text-gh-text-muted">Servicios Base</span>
                          </td>
                        </tr>
                        {(() => {
                          const preview = calcularPreviewDescuentos(snapshot)
                          return snapshot.serviciosBase?.map((servicio) => {
                            const servicioPreview = preview.serviciosBase.desglose.find(s => s.id === servicio.id)
                            const descuento = servicioPreview?.descuentoAplicado || 0
                            const precioConDescuento = servicioPreview?.conDescuento || servicio.precio
                            return (
                              <tr key={servicio.id} className="group hover:bg-gh-bg-secondary/20 transition-colors">
                                <td className="px-4 py-2.5 text-gh-text">
                                  <span className="flex items-center gap-2">
                                    {servicio.nombre}
                                    {descuento > 0 && (
                                      <span className="text-[9px] font-medium text-gh-success bg-gh-success/10 px-1.5 py-0.5 rounded">
                                        -{descuento.toFixed(0)}%
                                      </span>
                                    )}
                                  </span>
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
                                        {formatCurrency(servicio.precio)}
                                      </span>
                                      <span className="text-gh-success">
                                        {formatCurrency(precioConDescuento)}
                                      </span>
                                    </div>
                                  ) : (
                                    formatCurrency(servicio.precio)
                                  )}
                                </td>
                                <td className="px-2 py-2 text-right font-mono text-gh-text">
                                  {descuento > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="line-through text-gh-text-muted text-[10px]">
                                        {formatCurrency(servicio.precio * servicio.mesesPago)}
                                      </span>
                                      <span className="text-gh-success">
                                        {formatCurrency(precioConDescuento * servicio.mesesPago)}
                                      </span>
                                    </div>
                                  ) : (
                                    formatCurrency(servicio.precio * servicio.mesesPago)
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-gh-text">
                                  {descuento > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="line-through text-gh-text-muted text-[10px]">
                                        {formatCurrency(servicio.precio * 12)}
                                      </span>
                                      <span className="text-gh-success">
                                        {formatCurrency(precioConDescuento * 12)}
                                      </span>
                                    </div>
                                  ) : (
                                    formatCurrency(servicio.precio * 12)
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

                        <tr className="border-t border-gh-border/30">
                          <td colSpan={6} className="px-4 py-2 bg-gh-bg-secondary/30">
                            <span className="text-[10px] font-semibold text-gh-text-muted">Desarrollo</span>
                          </td>
                        </tr>
                        {(() => {
                          const preview = calcularPreviewDescuentos(snapshot)
                          const descuentoDesarrollo = preview.desarrollo > 0 
                            ? ((1 - preview.desarrolloConDescuento / preview.desarrollo) * 100)
                            : 0
                          return (
                            <tr className="group hover:bg-gh-bg-secondary/20 transition-colors">
                              <td className="px-4 py-2.5 text-gh-text">
                                <span className="flex items-center gap-2">
                                  Costo de desarrollo
                                  {descuentoDesarrollo > 0 && (
                                    <span className="text-[9px] font-medium text-gh-success bg-gh-success/10 px-1.5 py-0.5 rounded">
                                      -{descuentoDesarrollo.toFixed(0)}%
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">—</td>
                              <td className="px-2 py-2 text-center text-gh-text-muted hidden sm:table-cell">—</td>
                              <td className="px-2 py-2 text-right font-mono text-gh-text">
                                {descuentoDesarrollo > 0 ? (
                                  <div className="flex flex-col items-end">
                                    <span className="line-through text-gh-text-muted text-[10px]">
                                      {formatCurrency(snapshot.paquete.desarrollo)}
                                    </span>
                                    <span className="text-gh-success">
                                      {formatCurrency(preview.desarrolloConDescuento)}
                                    </span>
                                  </div>
                                ) : (
                                  formatCurrency(snapshot.paquete.desarrollo)
                                )}
                              </td>
                              <td className="px-2 py-2 text-right font-mono text-gh-text">
                                {descuentoDesarrollo > 0 ? (
                                  <div className="flex flex-col items-end">
                                    <span className="line-through text-gh-text-muted text-[10px]">
                                      {formatCurrency(snapshot.paquete.desarrollo)}
                                    </span>
                                    <span className="text-gh-success">
                                      {formatCurrency(preview.desarrolloConDescuento)}
                                    </span>
                                  </div>
                                ) : (
                                  formatCurrency(snapshot.paquete.desarrollo)
                                )}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-gh-text-muted">—</td>
                            </tr>
                          )
                        })()}

                        {snapshot.otrosServicios.length > 0 && (
                          <>
                            <tr className="border-t border-gh-border/30">
                              <td colSpan={6} className="px-4 py-2 bg-gh-bg-secondary/30">
                                <span className="text-[10px] font-semibold text-gh-text-muted">Servicios Adicionales</span>
                              </td>
                            </tr>
                            {(() => {
                              const preview = calcularPreviewDescuentos(snapshot)
                              return snapshot.otrosServicios.map((servicio, sIdx) => {
                                const servicioPreview = preview.otrosServicios.desglose.find(s => s.id === (servicio.id || `otro-${sIdx}`))
                                const descuento = servicioPreview?.descuentoAplicado || 0
                                const precioConDescuento = servicioPreview?.conDescuento || servicio.precio
                                return (
                                  <tr key={servicio.id || sIdx} className="group hover:bg-gh-bg-secondary/20 transition-colors">
                                    <td className="px-4 py-2.5 text-gh-text">
                                      <span className="flex items-center gap-2">
                                        {servicio.nombre}
                                        {descuento > 0 && (
                                          <span className="text-[9px] font-medium text-gh-success bg-gh-success/10 px-1.5 py-0.5 rounded">
                                            -{descuento.toFixed(0)}%
                                          </span>
                                        )}
                                      </span>
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
                                            {formatCurrency(servicio.precio)}
                                          </span>
                                          <span className="text-gh-success">
                                            {formatCurrency(precioConDescuento)}
                                          </span>
                                        </div>
                                      ) : (
                                        formatCurrency(servicio.precio)
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-right font-mono text-gh-text">
                                      {descuento > 0 ? (
                                        <div className="flex flex-col items-end">
                                          <span className="line-through text-gh-text-muted text-[10px]">
                                            {formatCurrency(servicio.precio * servicio.mesesPago)}
                                          </span>
                                          <span className="text-gh-success">
                                            {formatCurrency(precioConDescuento * servicio.mesesPago)}
                                          </span>
                                        </div>
                                      ) : (
                                        formatCurrency(servicio.precio * servicio.mesesPago)
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-gh-text">
                                      {descuento > 0 ? (
                                        <div className="flex flex-col items-end">
                                          <span className="line-through text-gh-text-muted text-[10px]">
                                            {formatCurrency(servicio.precio * 12)}
                                          </span>
                                          <span className="text-gh-success">
                                            {formatCurrency(precioConDescuento * 12)}
                                          </span>
                                        </div>
                                      ) : (
                                        formatCurrency(servicio.precio * 12)
                                      )}
                                    </td>
                                  </tr>
                                )
                              })
                            })()}
                          </>
                        )}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const preview = calcularPreviewDescuentos(snapshot)
                          // Usar porcentajeAhorro que incluye el descuentoDirecto
                          const descuentoTotal = preview.porcentajeAhorro
                          
                          // Verificar si hay descuentos REALES para mostrar
                          const tieneDescuentoGranular = preview.tipoDescuentoAplicado === 'granular'
                          const tieneDescuentoGeneral = preview.tipoDescuentoAplicado === 'general' && preview.descuentoGeneral && preview.descuentoGeneral.porcentaje > 0
                          const tieneDescuentoPagoUnico = preview.descuentoPagoUnico > 0
                          const tieneDescuentoDirecto = preview.descuentoDirectoAplicado > 0
                          
                          // Solo mostrar si hay AL MENOS UN descuento real
                          const mostrarDesglose = tieneDescuentoGranular || tieneDescuentoGeneral || tieneDescuentoPagoUnico || tieneDescuentoDirecto
                          
                          return (
                            <>
                              {/* Resumen de Costos - Diseño limpio */}
                              <tr>
                                <td colSpan={6} className="p-4 bg-gh-bg-secondary/30 border-t border-gh-border/50">
                                  <div className="space-y-4">
                                    {/* Header con ahorro */}
                                    {descuentoTotal > 0 && (
                                      <div className="flex items-center justify-between pb-3 border-b border-gh-border/30">
                                        <span className="text-sm font-medium text-gh-text">Resumen de Inversión</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gh-text-muted">Ahorro total:</span>
                                          <span className="text-sm font-semibold text-gh-success bg-gh-success/10 px-2 py-1 rounded">
                                            {formatCurrency(preview.totalAhorro)} ({preview.porcentajeAhorro.toFixed(0)}%)
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Grid de costos */}
                                    <div className="grid grid-cols-3 gap-4">
                                      {/* Pago Inicial */}
                                      <div className="text-center">
                                        <div className="text-[10px] text-gh-text-muted mb-1">Pago Inicial</div>
                                        {descuentoTotal > 0 ? (
                                          <div>
                                            <div className="text-[10px] text-gh-text-muted/50 line-through">
                                              {formatCurrency(preview.totalOriginal)}
                                            </div>
                                            <div className="text-lg font-semibold text-gh-success font-mono">
                                              {formatCurrency(preview.totalConDescuentos)}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-lg font-semibold text-gh-text font-mono">
                                            {formatCurrency(snapshot.costos.inicial)}
                                          </div>
                                        )}
                                      </div>

                                      {/* Primer Año */}
                                      <div className="text-center border-x border-gh-border/30 px-4">
                                        <div className="text-[10px] text-gh-text-muted mb-1">Primer Año</div>
                                        {descuentoTotal > 0 ? (
                                          <div>
                                            <div className="text-[10px] text-gh-text-muted/50 line-through">
                                              {formatCurrency(snapshot.costos.año1)}
                                            </div>
                                            <div className="text-lg font-semibold text-gh-success font-mono">
                                              {formatCurrency(snapshot.costos.año1 - preview.totalAhorro)}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-lg font-semibold text-gh-text font-mono">
                                            {formatCurrency(snapshot.costos.año1)}
                                          </div>
                                        )}
                                        <div className="text-[9px] text-gh-text-muted/50 mt-0.5">incluye desarrollo</div>
                                      </div>

                                      {/* Segundo Año */}
                                      <div className="text-center">
                                        <div className="text-[10px] text-gh-text-muted mb-1">Segundo Año</div>
                                        <div className="text-lg font-semibold text-gh-text font-mono">
                                          {formatCurrency(snapshot.costos.año2)}
                                        </div>
                                        <div className="text-[9px] text-gh-text-muted/50 mt-0.5">solo servicios</div>
                                      </div>
                                    </div>

                                    {/* Descuentos aplicados - solo si hay */}
                                    {mostrarDesglose && (
                                      <div className="pt-3 border-t border-gh-border/30">
                                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                          <span className="text-gh-text-muted">Descuentos aplicados:</span>
                                          {tieneDescuentoGranular && (
                                            <span className="px-2 py-0.5 bg-gh-bg-secondary rounded text-gh-text-muted">Por servicio</span>
                                          )}
                                          {tieneDescuentoGeneral && (
                                            <span className="px-2 py-0.5 bg-gh-bg-secondary rounded text-gh-text-muted">
                                              General {preview.descuentoGeneral?.porcentaje.toFixed(0)}%
                                            </span>
                                          )}
                                          {tieneDescuentoPagoUnico && (
                                            <span className="px-2 py-0.5 bg-gh-bg-secondary rounded text-gh-text-muted">
                                              Pago único {preview.descuentoPagoUnico.toFixed(0)}%
                                            </span>
                                          )}
                                          {tieneDescuentoDirecto && (
                                            <span className="px-2 py-0.5 bg-gh-success/10 rounded text-gh-success font-medium">
                                              Directo {preview.descuentoDirectoAplicado.toFixed(0)}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
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
            </div>
        ) : (
          <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg p-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-gh-bg-tertiary flex items-center justify-center">
              <span className="text-xl">📭</span>
            </div>
            <p className="text-sm font-medium text-gh-text">No hay ofertas creadas</p>
            <p className="text-xs text-gh-text-muted mt-1">Crea tu primer paquete completando los datos arriba</p>
          </div>
        )}

      {/* Paquetes Inactivos */}
      {snapshots.some(s => !s.activo) && (
        <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden mt-4">
          <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center justify-between">
            <h5 className="text-xs font-medium text-gh-text-muted">Paquetes Inactivos</h5>
            <span className="text-xs px-2 py-0.5 rounded-md bg-gh-border/30 text-gh-text-muted">
              {snapshots.filter(s => !s.activo).length}
            </span>
          </div>
          <div className="p-3 space-y-2">
            {snapshots.filter(s => !s.activo).map((snapshot, idx) => (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-gh-bg border border-dashed border-gh-border/30 rounded-lg p-3 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gh-text truncate">{snapshot.nombre}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {snapshot.paquete.tipo && (
                        <span className="text-[10px] text-gh-text-muted">{snapshot.paquete.tipo}</span>
                      )}
                      <span className="text-[10px] text-gh-text-muted">
                        {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={procesandoId === snapshot.id}
                      onClick={() => handleToggleActivo(snapshot)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        procesandoId === snapshot.id
                          ? 'opacity-50 cursor-not-allowed bg-gh-border/30 text-gh-text-muted'
                          : 'bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20'
                      }`}
                    >
                      {procesandoId === snapshot.id ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      Activar
                    </button>
                    <button
                      aria-label={`Eliminar paquete ${snapshot.nombre}`}
                      onClick={() => handleEliminarConValidacion(snapshot)}
                      className="w-7 h-7 bg-gh-bg-tertiary/50 text-gh-text-muted hover:bg-gh-danger/10 hover:text-gh-danger transition-colors flex items-center justify-center rounded-md border border-gh-border/30"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Resumen */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span className="text-gh-text-muted">
          Activos: <span className="text-gh-success font-medium">{snapshots.filter(s => s.activo).length}</span>
        </span>
        <span className="text-gh-text-muted">
          Inactivos: <span className="text-gh-text font-medium">{snapshots.filter(s => !s.activo).length}</span>
        </span>
        <span className="text-gh-text-muted">
          Total: <span className="text-gh-text font-medium">{snapshots.length} paquete{snapshots.length !== 1 ? 's' : ''}</span>
        </span>
      </div>
    </motion.div>
  )
}


