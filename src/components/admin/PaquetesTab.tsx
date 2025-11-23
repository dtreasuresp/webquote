'use client'

import React from 'react'
import { FaCalculator, FaEdit, FaTrash } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { PackageSnapshot } from '@/lib/types'
import CollapsibleSection from '@/features/admin/components/CollapsibleSection'

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
}: PaquetesTabProps) {
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
            className="bg-[#111] rounded-xl border border-[#333] p-8 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <FaCalculator className="text-[#ededed] text-3xl" />
              </motion.div>
              <p className="text-lg text-[#ededed] font-semibold">Cargando paquetes...</p>
            </div>
          </motion.div>
        ) : errorSnapshots ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#111] rounded-xl border border-red-500/30 p-8"
          >
            <p className="text-[#ededed] font-semibold">❌ {errorSnapshots}</p>
          </motion.div>
        ) : snapshots.length > 0 ? (
            <div className="space-y-4 md:grid md:grid-cols-2 gap-2 md:space-y-0">
              {snapshots.filter(s => s.activo).map((snapshot, idx) => (
                <motion.div
                  key={snapshot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#111] rounded-xl border border-[#333] overflow-hidden"
                >
                  {/* Header del Snapshot */}
                  <div className="bg-[#111] p-4 border-b border-[#333] relative">
                    {/* Contenido Principal */}
                    <div className="pr-4">
                      <h3 className="text-xl font-bold text-[#ededed]">
                        {snapshot.nombre}
                      </h3>
                      {snapshot.paquete.tipo && (
                        <p className="text-xs font-semibold tracking-wide text-[#888888] uppercase mt-1">
                          {snapshot.paquete.tipo}
                        </p>
                      )}
                      {snapshot.paquete.descripcion && (
                        <p className="text-sm text-[#888888] italic mt-1 line-clamp-3 min-h-[4rem]">
                          {snapshot.paquete.descripcion}
                        </p>
                      )}
                      <p className="text-sm text-[#888888] mt-2">
                        {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    {/* Botones FAB Flotantes Horizontales */}
                    <div className="absolute top-2 right-2 flex flex-row gap-1.5 bg-[#111] p-1.5 rounded-lg border border-[#333]">
                      {/* FAB Toggle Activo */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          const marcado = !snapshot.activo
                          const provisional = { ...snapshot, activo: marcado }
                          setSnapshots(snapshots.map(s => s.id === snapshot.id ? provisional : s))
                          try {
                            const actualizado = { ...provisional }
                            actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
                            actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
                            actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
                            const guardado = await actualizarSnapshot(actualizado.id, actualizado)
                            setSnapshots(snapshots.map(s => s.id === snapshot.id ? guardado : s))
                            console.log(`✅ Estado Activo actualizado para ${snapshot.nombre}: ${marcado}`)
                            await refreshSnapshots()
                          } catch (err) {
                            console.error('Error al autoguardar estado activo:', err)
                            setSnapshots(snapshots.map(s => s.id === snapshot.id ? { ...s, activo: !marcado } : s))
                            alert('❌ No se pudo actualizar el estado Activo. Intenta nuevamente.')
                          }
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          snapshot.activo
                            ? 'bg-[#ededed] text-black hover:bg-[#fff]'
                            : 'bg-[#222] text-[#888888] hover:bg-[#333]'
                        }`}
                        title={snapshot.activo ? 'Desactivar' : 'Activar'}
                      >
                        {snapshot.activo ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </motion.button>

                      {/* FAB Editar */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => abrirModalEditar(snapshot)}
                        className="w-7 h-7 rounded-full bg-[#ededed] text-black hover:bg-[#fff] transition-all flex items-center justify-center"
                        title="Editar paquete"
                      >
                        <FaEdit size={12} />
                      </motion.button>

                      {/* FAB Eliminar */}
                      <motion.button
                        aria-label={`Eliminar paquete ${snapshot.nombre}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEliminarSnapshot(snapshot.id)}
                        className="w-7 h-7 rounded-full bg-[#222] text-[#888888] hover:bg-[#333] transition-all flex items-center justify-center"
                        title="Eliminar paquete"
                      >
                        <FaTrash size={11} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Detalle del Snapshot - Tabla */}
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#333] bg-[#111] text-pretty">
                            <th className="text-left p-1.5 font-bold text-[#ededed] text-xs">Concepto</th>
                            <th className="text-center p-1.5 font-bold text-[#ededed] text-xs">Meses Gratis</th>
                            <th className="text-center p-1.5 font-bold text-[#ededed] text-xs">Meses Pago</th>
                            <th className="text-right p-1.5 font-bold text-[#ededed] bg-[#222] text-xs">Costo Mensual</th>
                            <th className="text-right p-1.5 font-bold text-[#ededed] bg-[#222] text-xs">Año 1</th>
                            <th className="text-right p-1.5 font-bold text-[#ededed] bg-[#222] text-xs">Año 2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Servicios Base */}
                          <tr className="border-b border-[#333] bg-[#111]">
                            <td className="p-1.5 font-bold text-[#ededed] text-xs" colSpan={3}>
                              Servicios Base
                            </td>
                            <td className="p-1.5 text-right font-bold text-[#ededed] bg-[#222] text-xs">
                              ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0), 0)).toFixed(2)}
                            </td>
                            <td className="p-1.5 text-right font-bold text-[#ededed] bg-[#222] text-xs">
                              ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0) * (s.mesesPago ?? 0), 0)).toFixed(2)}
                            </td>
                            <td className="p-1.5 text-right font-bold text-[#ededed] bg-[#222] text-xs">
                              ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0) * 12, 0)).toFixed(2)}
                            </td>
                          </tr>
                          {snapshot.serviciosBase?.map((servicio) => (
                            <tr key={servicio.id} className="border-b border-[#333] hover:bg-[#222] transition-colors">
                              <td className="p-1.5 text-[#ededed] text-xs">{servicio.nombre}</td>
                              <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                {servicio.mesesGratis}
                              </td>
                              <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                {servicio.mesesPago}
                              </td>
                              <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                ${servicio.precio.toFixed(2)}
                              </td>
                              <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                              </td>
                              <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                ${(servicio.precio * 12).toFixed(2)}
                              </td>
                            </tr>
                          )) || (
                            <tr className="border-b border-[#333]">
                              <td colSpan={6} className="p-1.5 text-center text-[#888888] italic text-xs">
                                No hay servicios base definidos
                              </td>
                            </tr>
                          )}

                          {/* Paquete */}
                          <tr className="border-b border-[#333]">
                            <td colSpan={6} className="p-1.5 font-bold bg-[#111] text-[#ededed] text-xs">
                              Costo del desarrollo
                            </td>
                          </tr>
                          <tr className="border-b border-[#333] hover:bg-[#222] transition-colors">
                            <td className="p-1.5 text-[#ededed] text-xs">Desarrollo</td>
                            <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                            <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                            <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                              ${snapshot.paquete.desarrollo.toFixed(2)}
                            </td>
                            <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                              ${snapshot.paquete.desarrollo.toFixed(2)}
                            </td>
                            <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                              -
                            </td>
                          </tr>
                          {snapshot.paquete.descuento > 0 && (
                            <tr className="border-b border-[#333] hover:bg-[#222] transition-colors">
                              <td className="p-1.5 text-[#ededed] text-xs">Descuento</td>
                              <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                              <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                              <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                {snapshot.paquete.descuento}%
                              </td>
                              <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                {snapshot.paquete.descuento}%
                              </td>
                              <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                -
                              </td>
                            </tr>
                          )}

                          {/* Otros Servicios */}
                          {snapshot.otrosServicios.length > 0 && (
                            <>
                              <tr className="border-b border-[#333]">
                                <td colSpan={6} className="p-1.5 font-bold bg-[#111] text-[#ededed] text-xs">
                                  Otros Servicios
                                </td>
                              </tr>
                              {snapshot.otrosServicios.map((servicio, sIdx) => (
                                <motion.tr
                                  key={sIdx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: sIdx * 0.05 }}
                                  className="border-b border-[#333] hover:bg-[#222] transition-colors"
                                >
                                  <td className="p-1.5 text-[#ededed] text-xs">
                                    {servicio.nombre}
                                  </td>
                                  <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                    {servicio.mesesGratis}
                                  </td>
                                  <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                    {servicio.mesesPago}
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    ${servicio.precio.toFixed(2)}
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    ${(servicio.precio * 12).toFixed(2)}
                                  </td>
                                </motion.tr>
                              ))}
                            </>
                          )}

                          {/* Costos Finales */}
                          <tr className="border-b border-[#333]">
                            <td colSpan={6} className="p-1.5 font-bold bg-[#111] text-[#ededed] text-xs">
                              Costos totales
                            </td>
                          </tr>
                          <tr className="border-b border-[#333] bg-[#111]">
                            <td className="p-1.5 font-semibold text-[#ededed] text-xs">Pago Inicial</td>
                            <td colSpan={5} className="p-1.5 text-right font-bold text-[#ededed] text-sm">
                              ${snapshot.costos.inicial.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-[#333] bg-[#111]">
                            <td className="p-1.5 font-semibold text-[#ededad] text-xs">Año 1</td>
                            <td colSpan={5} className="p-1.5 text-right font-bold text-[#ededad] text-sm">
                              ${snapshot.costos.año1.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="bg-[#111]">
                            <td className="p-1.5 font-semibold text-[#ededad] text-xs">Año 2</td>
                            <td colSpan={5} className="p-1.5 text-right font-bold text-[#ededad] text-sm">
                              ${snapshot.costos.año2.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="bg-[#222]">
                            <td colSpan={6} className="p-1.5 text-xs text-[#888888] italic text-center">
                              Año 2 no incluye desarrollo (pago único realizado en Año 1)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        ) : (
          <div className="bg-[#111] rounded-xl border border-[#333] p-8 text-center">
            <p className="text-lg text-[#888888] font-semibold">📭 No hay paquetes creados aún</p>
            <p className="text-sm text-[#888888] mt-2">Crea tu primer paquete completando los datos arriba</p>
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
                className="bg-[#111] rounded-lg border border-dashed border-[#333] p-4 opacity-50 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#ededed] text-lg">{snapshot.nombre}</h3>
                    {snapshot.paquete.tipo && (
                      <p className="text-xs font-semibold tracking-wide text-[#666] uppercase mt-1">
                        {snapshot.paquete.tipo}
                      </p>
                    )}
                    {snapshot.paquete.descripcion && (
                      <p className="text-sm text-[#666] italic mt-1">
                        {snapshot.paquete.descripcion}
                      </p>
                    )}
                    <p className="text-sm text-[#666] mt-2">
                      {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 relative">
                      <input
                        id={`snapshot-inactivo-${snapshot.id}`}
                        type="checkbox"
                        checked={snapshot.activo}
                        onChange={async (e) => {
                          const marcado = e.target.checked
                          const provisional = { ...snapshot, activo: marcado }
                          setSnapshots(snapshots.map(s => s.id === snapshot.id ? provisional : s))
                          try {
                            const actualizado = { ...provisional }
                            actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
                            actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
                            actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
                            const guardado = await actualizarSnapshot(actualizado.id, actualizado)
                            setSnapshots(snapshots.map(s => s.id === snapshot.id ? guardado : s))
                            console.log(`Estado Activo actualizado para ${snapshot.nombre}: ${marcado}`)
                            await refreshSnapshots()
                          } catch (err) {
                            console.error('Error al actualizar estado activo:', err)
                            setSnapshots(snapshots.map(s => s.id === snapshot.id ? { ...s, activo: !marcado } : s))
                            alert('❌ No se pudo actualizar el estado. Intenta nuevamente.')
                          }
                        }}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <label htmlFor={`snapshot-inactivo-${snapshot.id}`} className="font-semibold text-[#888888] text-sm">Activar</label>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEliminarSnapshot(snapshot.id)}
                      className="w-9 h-9 bg-[#222] text-[#888888] hover:bg-[#333] transition-colors flex items-center justify-center rounded-lg"
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
