'use client'

import React from 'react'
import { FaCalculator, FaEdit, FaTrash, FaBox, FaCheck } from 'react-icons/fa'
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
        icon={<FaBox className="text-cyan-400" />}
        defaultOpen={true}
      >
        {cargandoSnapshots ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gh-bg-overlay to-gh-bg-secondary rounded-lg border border-gh-border p-8 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <FaCalculator className="text-cyan-400 text-3xl" />
              </motion.div>
              <p className="text-lg text-gh-text font-semibold">Cargando paquetes...</p>
            </div>
          </motion.div>
        ) : errorSnapshots ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg border border-red-500/30 p-8"
          >
            <p className="text-red-400 font-semibold">⚠️ {errorSnapshots}</p>
          </motion.div>
        ) : snapshots.length > 0 ? (
          <div className="space-y-4 md:grid md:grid-cols-2 gap-4 md:space-y-0">
            {snapshots.filter(s => s.activo).map((snapshot, idx) => (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg-overlay rounded-lg border border-gh-border/50 overflow-hidden hover:border-cyan-400/30 hover:shadow-lg transition-all"
              >
                {/* Header del Snapshot */}
                <div className="bg-gradient-to-r from-gh-bg-secondary via-gh-bg-overlay to-gh-bg-secondary p-4 border-b border-gh-border/30">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gh-text">{snapshot.nombre}</h3>
                      {snapshot.paquete.tipo && (
                        <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mt-1">
                          {snapshot.paquete.tipo}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {snapshot.paquete.descripcion && (
                    <p className="text-xs text-gh-text-muted italic line-clamp-2 mb-2">
                      {snapshot.paquete.descripcion}
                    </p>
                  )}
                  
                  <p className="text-xs text-gh-text-muted">
                    📅 {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                  </p>

                  {/* Botones de Acción */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gh-border/30">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        const marcado = !snapshot.activo
                        const provisional = { ...snapshot, activo: marcado }
                        setSnapshots(snapshots.map(s => s.id === snapshot.id ? provisional : s))
                        try {
                          const actualizado = { ...provisional } as PackageSnapshot
                          actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
                          actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
                          actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
                          const guardado = await actualizarSnapshot(actualizado.id, actualizado)
                          setSnapshots(snapshots.map(s => s.id === snapshot.id ? guardado : s))
                          await refreshSnapshots()
                        } catch (err) {
                          console.error('Error al autoguardar estado activo:', err)
                          setSnapshots(snapshots.map(s => s.id === snapshot.id ? { ...s, activo: !marcado } : s))
                          alert('No se pudo actualizar el estado. Intenta nuevamente.')
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-semibold ${
                        snapshot.activo
                          ? 'bg-emerald-500/80 text-white hover:bg-emerald-600'
                          : 'bg-gh-border text-gh-text-muted hover:bg-gh-border/70'
                      }`}
                    >
                      <FaCheck size={12} /> {snapshot.activo ? 'Activo' : 'Inactivo'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => abrirModalEditar(snapshot)}
                      className="flex-1 px-3 py-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <FaEdit size={12} /> Editar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (confirm(`¿Eliminar paquete ${snapshot.nombre}?`)) {
                          handleEliminarSnapshot(snapshot.id)
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <FaTrash size={12} /> Eliminar
                    </motion.button>
                  </div>
                </div>

                {/* Detalles de Costos */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gh-bg-secondary/50 p-3 rounded-lg border border-gh-border/30">
                      <p className="text-xs text-gh-text-muted mb-1">Inicial</p>
                      <p className="text-lg font-bold text-emerald-400">
                        ${calcularCostoInicialSnapshot(snapshot).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gh-bg-secondary/50 p-3 rounded-lg border border-gh-border/30">
                      <p className="text-xs text-gh-text-muted mb-1">Año 1</p>
                      <p className="text-lg font-bold text-blue-400">
                        ${calcularCostoAño1Snapshot(snapshot).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gh-bg-secondary/50 p-3 rounded-lg border border-gh-border/30">
                      <p className="text-xs text-gh-text-muted mb-1">Año 2+</p>
                      <p className="text-lg font-bold text-purple-400">
                        ${calcularCostoAño2Snapshot(snapshot).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBox className="text-gh-text-muted text-4xl mx-auto mb-3 opacity-50" />
            <p className="text-gh-text-muted">No hay paquetes creados aún</p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
