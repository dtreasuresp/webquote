'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import type { QuotationConfig, PackageSnapshot } from '@/lib/types'

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
        <p className="text-[#888888] mb-2">📋 No hay cotizaciones guardadas</p>
        <p className="text-xs text-[#666666]">
          Las cotizaciones que crees aparecerán aquí para futuras consultas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0 border border-[#333] rounded-lg overflow-hidden bg-black">
      {/* Encabezado de la tabla */}
      <div className="bg-[#111] border-b border-[#333] px-4 py-3 grid grid-cols-6 gap-2 text-xs font-bold text-[#ededed]">
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

        return (
          <div key={quotation.id} className="border-b border-[#333] last:border-b-0">
            {/* Fila principal - Tabla de resumen */}
            <div className="bg-black hover:bg-[#0a0a0a] transition-colors px-4 py-3">
              <div className="grid grid-cols-6 gap-2 items-center text-sm">
                {/* Número */}
                <div className="text-[#ededed] font-semibold">#{quotation.numero}</div>

                {/* Versión */}
                <div className="text-[#b0b0b0]">v.{quotation.versionNumber}</div>

                {/* Empresa */}
                <div className="text-[#b0b0b0] truncate" title={quotation.empresa}>
                  {quotation.empresa || '—'}
                </div>

                {/* Profesional */}
                <div className="text-[#b0b0b0] truncate" title={quotation.profesional}>
                  {quotation.profesional || '—'}
                </div>

                {/* Fecha */}
                <div className="text-[#888888] text-xs">
                  {new Date(quotation.updatedAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit',
                  })}
                </div>

                {/* Estado y Expandir */}
                <div className="flex items-center justify-end gap-2">
                  <div className={`text-xs font-semibold px-2 py-1 rounded ${
                    quotation.isGlobal
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {quotation.isGlobal ? 'Activa' : 'Inactiva'}
                  </div>
                  <motion.button
                    onClick={() => toggleExpanded(quotation.id)}
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-[#888888] hover:text-[#ededed] transition-colors"
                  >
                    <FaChevronDown size={16} />
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
                  className="bg-[#050505] border-t border-[#333] overflow-hidden"
                >
                  <div className="px-4 py-4 space-y-4">
                    {/* SECCIÓN A: Versiones */}
                    <div>
                      <h4 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                        📌 VERSIONES ({quotationSnapshots.length})
                      </h4>
                      <div className="pl-4 space-y-1">
                        {quotationSnapshots.length > 0 ? (
                          quotationSnapshots.map((snapshot, idx) => (
                            <div
                              key={snapshot.id}
                              className="text-xs text-[#b0b0b0] py-1"
                            >
                              v.{quotation.versionNumber - idx} —{' '}
                              {new Date(snapshot.createdAt).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-[#666666]">Sin versiones registradas</div>
                        )}
                      </div>
                    </div>

                    {/* SECCIÓN B: Paquetes Configurados */}
                    <div>
                      <h4 className="text-xs font-bold text-[#ededen] mb-2 flex items-center gap-2">
                        📦 PAQUETES CONFIGURADOS ({quotationSnapshots.length})
                      </h4>
                      <div className="pl-4 space-y-2">
                        {quotationSnapshots.length > 0 ? (
                          quotationSnapshots.map((snapshot) => (
                            <div
                              key={snapshot.id}
                              className="bg-[#111] rounded p-2 text-xs text-[#b0b0b0] border border-[#333]"
                            >
                              <div className="font-semibold text-[#ededed]">
                                {snapshot.nombre}
                              </div>
                              <div className="text-[#888888] mt-1">
                                <div>
                                  Desarrollo: ${snapshot.costoInicial?.toLocaleString('es-CO') || 0}
                                </div>
                                <div>Año 1: ${snapshot.costoAño1?.toLocaleString('es-CO') || 0}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-[#666666]">Sin paquetes configurados</div>
                        )}
                      </div>
                    </div>

                    {/* SECCIÓN C: Acciones */}
                    <div className="border-t border-[#333] pt-3">
                      <h4 className="text-xs font-bold text-[#ededed] mb-2">ACCIONES</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onEdit?.(quotation)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded transition-colors"
                          title="Editar cotización"
                        >
                          <FaEdit size={12} /> Editar
                        </button>

                        <button
                          onClick={() => onViewProposal?.(quotation)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold rounded transition-colors"
                          title="Ver propuesta"
                        >
                          <FaEye size={12} /> Ver
                        </button>

                        <button
                          onClick={() => onDelete?.(quotation.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded transition-colors"
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
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                            quotation.isGlobal
                              ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                              : 'bg-gray-500/10 hover:bg-gray-500/20 text-gray-400'
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
  )
}
