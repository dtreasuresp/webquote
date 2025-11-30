'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import type { QuotationConfig, PackageSnapshot } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

interface HistorialProps {
  snapshots: PackageSnapshot[]
  quotations?: QuotationConfig[]
  onEdit?: (quotation: QuotationConfig) => void
  onDelete?: (quotationId: string) => void
  onToggleActive?: (quotationId: string, status: { activo: boolean; isGlobal: boolean }) => void
  onViewProposal?: (quotation: QuotationConfig) => void
}

export default function Historial({
  snapshots = [],
  quotations = [],
  onEdit,
  onDelete,
  onToggleActive,
  onViewProposal,
}: HistorialProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedIds(newSet)
  }

  if (quotations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gh-text-muted mb-2">📋 No hay cotizaciones guardadas</p>
        <p className="text-xs text-gh-text-muted">
          Las cotizaciones que crees aparecerán aquí para futuras consultas
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-0 border border-gh-border rounded-lg overflow-hidden bg-gh-bg">
        {/* Encabezado de la tabla - Estilo GitHub */}
        <div className="bg-gh-bg-secondary border-b border-gh-border px-4 py-3 grid grid-cols-6 gap-2 text-xs font-semibold text-gh-text">
          <div>Número</div>
          <div>Versión</div>
          <div>Empresa</div>
          <div>Profesional</div>
          <div>Última Actualización</div>
          <div className="text-center">Acción</div>
        </div>

        {/* Filas de cotizaciones */}
        {quotations.map((quotation) => {
          const isExpanded = expandedIds.has(quotation.id)
          const quotationSnapshots = snapshots.filter(
            (s) => s.quotationConfigId === quotation.id
          )
          // Filtrar solo paquetes ACTIVOS para "PAQUETES CONFIGURADOS"
          const paquetesConfigurados = quotationSnapshots.filter(s => s.activo)

          return (
            <div key={quotation.id} className="border-b border-gh-border last:border-b-0">
              {/* Fila principal - Tabla de resumen */}
              <div className="bg-gh-bg hover:bg-gh-bg-secondary transition-colors px-4 py-3">
                <div className="grid grid-cols-6 gap-2 items-center text-sm">
                  {/* Número */}
                  <div className="text-gh-text font-semibold">#{quotation.numero}</div>

                  {/* Versión */}
                  <div className="text-gh-text-muted">v.{quotation.versionNumber}</div>

                  {/* Empresa */}
                  <div className="text-gh-text-muted truncate" title={quotation.empresa}>
                    {quotation.empresa || '—'}
                  </div>

                  {/* Profesional */}
                  <div className="text-gh-text-muted truncate" title={quotation.profesional}>
                    {quotation.profesional || '—'}
                  </div>

                  {/* Fecha */}
                  <div className="text-gh-text-muted text-xs">
                    {new Date(quotation.updatedAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </div>

                  {/* Estado y Expandir */}
                  <div className="flex items-center justify-end gap-2">
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      quotation.isGlobal
                        ? 'bg-gh-success/15 text-gh-success border border-gh-success/30'
                        : 'bg-gh-border/50 text-gh-text-muted border border-gh-border'
                    }`}>
                      {quotation.isGlobal ? 'Activa' : 'Inactiva'}
                    </div>
                    <motion.button
                      onClick={() => toggleExpanded(quotation.id)}
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-gh-text-muted hover:text-gh-text transition-colors p-1 rounded hover:bg-gh-border"
                    >
                      <FaChevronDown size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gh-bg-secondary border-t border-gh-border overflow-hidden"
                  >
                    <div className="px-4 py-4 space-y-4">
                      {/* SECCIÓN A: Información de Versión de la Cotización */}
                      <div>
                        <h4 className="text-xs font-semibold text-gh-text mb-3 flex items-center gap-2">
                          📌 VERSIÓN DE LA COTIZACIÓN
                        </h4>
                        <div className="bg-gh-bg rounded-lg border border-gh-border p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md text-purple-400 font-mono text-sm font-bold">
                                v.{quotation.versionNumber}
                              </span>
                              <div>
                                <p className="text-xs text-gh-text font-medium">Versión actual</p>
                                <p className="text-[10px] text-gh-text-muted flex items-center gap-1 mt-0.5">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Última modificación: {new Date(quotation.updatedAt).toLocaleDateString('es-CO', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gh-text-muted">Creada</p>
                              <p className="text-xs text-gh-text-muted">
                                {new Date(quotation.createdAt).toLocaleDateString('es-CO', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          {quotation.versionNumber > 1 && (
                            <div className="mt-2 pt-2 border-t border-gh-border">
                              <p className="text-[10px] text-gh-text-muted italic">
                                Esta cotización ha sido editada {quotation.versionNumber - 1} {quotation.versionNumber === 2 ? 'vez' : 'veces'} desde su creación.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SECCIÓN B: Paquetes Configurados - Grid 2 columnas simplificado */}
                      <div>
                        <h4 className="text-xs font-semibold text-gh-text mb-3 flex items-center gap-2">
                          📦 PAQUETES CONFIGURADOS ({paquetesConfigurados.length})
                        </h4>
                        {paquetesConfigurados.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paquetesConfigurados.map((snapshot) => {
                              // Calcular preview de descuentos para este snapshot
                              const preview = calcularPreviewDescuentos(snapshot)
                              const subtotal = preview.desarrolloConDescuento + preview.serviciosBase.conDescuento + preview.otrosServicios.conDescuento

                              return (
                                <div
                                  key={snapshot.id}
                                  className="bg-gh-bg rounded-lg border border-gh-border hover:border-gh-success/30 transition-colors overflow-hidden"
                                >
                                  {/* Header del paquete */}
                                  <div className="flex items-start justify-between p-3 border-b border-gh-border">
                                    <div>
                                      <h5 className="font-semibold text-gh-text text-sm">
                                        {snapshot.nombre}
                                      </h5>
                                      {snapshot.paquete?.tipo && (
                                        <span className="text-[10px] text-gh-text-muted uppercase tracking-wide">
                                          {snapshot.paquete.tipo}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gh-success/10 rounded-full">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gh-success"></span>
                                      <span className="text-[10px] text-gh-success font-medium">Activo</span>
                                    </div>
                                  </div>
                                  
                                  {/* Desglose de costos simplificado */}
                                  <div className="p-3 space-y-1.5">
                                    {/* Desarrollo */}
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-gh-text-muted">💻 Desarrollo</span>
                                      <span className="font-mono font-semibold text-gh-text">
                                        ${preview.desarrolloConDescuento.toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                    
                                    {/* Servicios Base */}
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-gh-text-muted">🔧 Servicios Base</span>
                                      <span className="font-mono font-semibold text-gh-text">
                                        ${preview.serviciosBase.conDescuento.toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                    
                                    {/* Servicios Opcionales */}
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-gh-text-muted">➕ Servicios Opcionales</span>
                                      <span className="font-mono font-semibold text-gh-text">
                                        ${preview.otrosServicios.conDescuento.toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                    
                                    {/* Subtotal */}
                                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gh-border">
                                      <span className="text-gh-text font-medium">Subtotal</span>
                                      <span className="font-mono font-bold text-gh-text">
                                        ${subtotal.toLocaleString('es-CO')}
                                      </span>
                                    </div>
                                    
                                    {/* Grid 3 columnas: Primer mes, Año 1, Año 2 */}
                                    <div className="grid grid-cols-3 gap-2 pt-2 mt-1.5 border-t border-gh-border bg-gh-bg-secondary rounded-md p-2">
                                      <div className="text-center">
                                        <p className="text-[9px] text-gh-text-muted uppercase">Mes 1</p>
                                        <p className="font-mono font-bold text-gh-text text-xs">
                                          ${snapshot.costos?.inicial?.toLocaleString('es-CO') || 0}
                                        </p>
                                      </div>
                                      <div className="text-center border-l border-gh-border">
                                        <p className="text-[9px] text-gh-text-muted uppercase">Año 1</p>
                                        <p className="font-mono font-bold text-gh-text text-xs">
                                          ${snapshot.costos?.año1?.toLocaleString('es-CO') || 0}
                                        </p>
                                      </div>
                                      <div className="text-center border-l border-gh-border">
                                        <p className="text-[9px] text-gh-text-muted uppercase">Año 2+</p>
                                        <p className="font-mono font-bold text-gh-text text-xs">
                                          ${snapshot.costos?.año2?.toLocaleString('es-CO') || 0}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-gh-text-muted bg-gh-bg rounded-lg p-4 border border-dashed border-gh-border text-center">
                            Sin paquetes configurados
                          </div>
                        )}
                      </div>

                      {/* SECCIÓN C: Acciones */}
                      <div className="border-t border-gh-border pt-3">
                        <h4 className="text-xs font-semibold text-gh-text mb-3">ACCIONES</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => onEdit?.(quotation)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-bg hover:bg-gh-border text-gh-text text-xs font-semibold rounded-md border border-gh-border transition-colors"
                            title="Editar cotización"
                          >
                            <FaEdit size={12} /> Editar
                          </button>

                          <button
                            onClick={() => onViewProposal?.(quotation)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-md border border-purple-500/30 transition-colors"
                            title="Ver propuesta"
                          >
                            <FaEye size={12} /> Ver
                          </button>

                          <button
                            onClick={() => onDelete?.(quotation.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-md border border-red-500/30 transition-colors"
                            title="Eliminar cotización"
                          >
                            <FaTrash size={12} /> Eliminar
                          </button>

                          <button
                            onClick={() =>
                              onToggleActive?.(quotation.id, {
                                activo: !quotation.activo,
                                isGlobal: !quotation.isGlobal
                              })
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                              quotation.isGlobal
                                ? 'bg-gh-success/10 hover:bg-gh-success/20 text-gh-success border-gh-success/30'
                                : 'bg-gh-bg hover:bg-gh-border text-gh-text-muted border-gh-border'
                            }`}
                            title={quotation.isGlobal ? 'Desactivar' : 'Activar'}
                          >
                            {quotation.isGlobal ? (
                              <>
                                <FaToggleOn size={12} /> Desactivar
                              </>
                            ) : (
                              <>
                                <FaToggleOff size={12} /> Activar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
