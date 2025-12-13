'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, Calendar, ArrowLeftRight, Check } from 'lucide-react'
import { PackageSnapshot, QuotationConfig } from '@prisma/client'
import { useState, useMemo, useCallback } from 'react'

interface PackageHistoryModalProps {
  /** El snapshot del paquete que se está comparando */
  currentSnapshot: PackageSnapshot
  /** Todos los snapshots disponibles para encontrar versiones del mismo paquete */
  allSnapshots: PackageSnapshot[]
  /** Todas las cotizaciones para mostrar información de contexto */
  quotations: QuotationConfig[]
  /** Handler para cerrar el modal */
  onClose: () => void
}

interface PackageVersion {
  snapshot: PackageSnapshot
  quotation: QuotationConfig | null
  isCurrentVersion: boolean
}

/**
 * Modal que muestra el historial de versiones de un paquete específico
 * y permite comparar la versión actual con versiones anteriores
 */
export default function PackageHistoryModal({
  currentSnapshot,
  allSnapshots,
  quotations,
  onClose
}: Readonly<PackageHistoryModalProps>) {
  // Estado para la versión seleccionada para comparar
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // Encontrar todas las versiones de este paquete (mismo nombre)
  const packageVersions = useMemo<PackageVersion[]>(() => {
    const versions = allSnapshots
      .filter(snap => snap.nombre === currentSnapshot.nombre)
      .map(snap => ({
        snapshot: snap,
        quotation: quotations.find(q => q.id === snap.quotationConfigId) ?? null,
        isCurrentVersion: snap.id === currentSnapshot.id
      }))
      .sort((a, b) => {
        // Ordenar por fecha de creación descendente
        return new Date(b.snapshot.createdAt).getTime() - new Date(a.snapshot.createdAt).getTime()
      })

    return versions
  }, [allSnapshots, currentSnapshot, quotations])

  const selectedVersion = useMemo(() => {
    if (!selectedVersionId) return null
    return packageVersions.find(v => v.snapshot.id === selectedVersionId)
  }, [selectedVersionId, packageVersions])

  const handleSelectVersion = useCallback((id: string) => {
    setSelectedVersionId(id === selectedVersionId ? null : id)
    setShowComparison(false)
  }, [selectedVersionId])

  const handleCompare = useCallback(() => {
    if (selectedVersionId) {
      setShowComparison(true)
    }
  }, [selectedVersionId])

  // Formatear valor para mostrar
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Sí' : 'No'
    if (typeof value === 'number') return value.toLocaleString('es-MX')
    if (Array.isArray(value) || typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    // Solo strings u otros primitivos llegan aquí
    return typeof value === 'string' ? value : JSON.stringify(value)
  }

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Formatear fecha
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Campos a comparar con tipos definidos
  interface FieldDefinition {
    key: string
    label: string
    isCurrency?: boolean
    isJson?: boolean
  }

  const fieldsToCompare: FieldDefinition[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'emoji', label: 'Emoji' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'tiempoEntrega', label: 'Tiempo de Entrega' },
    { key: 'desarrollo', label: 'Desarrollo', isCurrency: true },
    { key: 'descuento', label: 'Descuento (%)' },
    { key: 'costoInicial', label: 'Costo Inicial', isCurrency: true },
    { key: 'costoAño1', label: 'Costo Año 1', isCurrency: true },
    { key: 'costoAño2', label: 'Costo Año 2+', isCurrency: true },
    { key: 'descuentoPagoUnico', label: 'Descuento Pago Único (%)' },
    { key: 'serviciosBase', label: 'Servicios Base', isJson: true },
    { key: 'otrosServicios', label: 'Otros Servicios', isJson: true },
    { key: 'opcionesPago', label: 'Opciones de Pago', isJson: true },
    { key: 'activo', label: 'Estado Activo' },
  ]

  // Determinar si hay diferencia en un campo
  const hasDifference = (key: string): boolean => {
    if (!selectedVersion) return false
    const val1 = currentSnapshot[key as keyof PackageSnapshot]
    const val2 = selectedVersion.snapshot[key as keyof PackageSnapshot]
    
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      return JSON.stringify(val1) !== JSON.stringify(val2)
    }
    return val1 !== val2
  }

  // Funciones helper para clases CSS (evitar ternarios anidados)
  const getVersionCardClass = (version: PackageVersion): string => {
    if (version.isCurrentVersion) {
      return 'bg-cyan-900/30 border-cyan-500/50 cursor-default'
    }
    if (selectedVersionId === version.snapshot.id) {
      return 'bg-purple-900/30 border-purple-500/50'
    }
    return 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
  }

  const getAvatarClass = (version: PackageVersion): string => {
    if (version.isCurrentVersion) {
      return 'bg-cyan-500 text-white'
    }
    if (version.snapshot.activo) {
      return 'bg-emerald-500/20 text-emerald-400'
    }
    return 'bg-slate-600/50 text-slate-400'
  }

  const formatFieldValue = (value: unknown, field: FieldDefinition): React.ReactNode => {
    if (field.isCurrency) {
      return formatCurrency(Number(value) || 0)
    }
    if (field.isJson) {
      return (
        <code className="text-xs bg-slate-900/50 px-2 py-1 rounded block max-w-xs overflow-x-auto">
          {formatValue(value).substring(0, 100)}...
        </code>
      )
    }
    return formatValue(value)
  }

  // Renderizar contenido principal
  const renderContent = () => {
    if (packageVersions.length <= 1) {
      return (
        <div className="text-center py-12">
          <Layers className="text-slate-600 text-5xl mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            Este paquete solo tiene una versión disponible.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            No hay versiones anteriores para comparar.
          </p>
        </div>
      )
    }

    if (showComparison) {
      return renderComparisonView()
    }

    return renderVersionList()
  }

  // Renderizar lista de versiones
  const renderVersionList = () => (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="text-cyan-400" />
          Selecciona una versión para comparar
        </h3>
        <div className="space-y-3">
          {packageVersions.map((version, index) => (
            <motion.div
              key={version.snapshot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${getVersionCardClass(version)}`}
              onClick={() => !version.isCurrentVersion && handleSelectVersion(version.snapshot.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getAvatarClass(version)}`}>
                    {version.snapshot.emoji || '📦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {version.quotation?.numero || 'Sin cotización'}
                      </span>
                      {version.isCurrentVersion && (
                        <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                          Versión Actual
                        </span>
                      )}
                      {version.snapshot.activo ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {formatDate(version.snapshot.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold">
                      {formatCurrency(version.snapshot.costoInicial)}
                    </p>
                    <p className="text-slate-500 text-xs">
                      Costo Inicial
                    </p>
                  </div>
                  {!version.isCurrentVersion && (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedVersionId === version.snapshot.id 
                        ? 'border-purple-400 bg-purple-400' 
                        : 'border-slate-600'
                    }`}>
                      {selectedVersionId === version.snapshot.id && (
                        <Check className="text-white text-xs" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedVersionId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={handleCompare}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            <ArrowLeftRight />
            Comparar con versión seleccionada
          </button>
        </motion.div>
      )}
    </>
  )

  // Renderizar vista de comparación
  const renderComparisonView = () => (
    <>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setShowComparison(false)}
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm"
        >
          ← Volver a la lista
        </button>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/50 rounded-lg text-cyan-300">
            Versión Actual
          </span>
          <ArrowLeftRight className="text-slate-500" />
          <span className="px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-lg text-purple-300">
            {selectedVersion?.quotation?.numero || 'Versión Anterior'}
          </span>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Campo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Actual</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-purple-400">Anterior</th>
            </tr>
          </thead>
          <tbody>
            {fieldsToCompare.map((field) => {
              const currentVal = currentSnapshot[field.key as keyof PackageSnapshot]
              const previousVal = selectedVersion?.snapshot[field.key as keyof PackageSnapshot]
              const isDifferent = hasDifference(field.key)
              
              return (
                <tr 
                  key={field.key}
                  className={`border-t border-slate-700/50 ${isDifferent ? 'bg-amber-900/10' : ''}`}
                >
                  <td className={`px-4 py-3 text-sm ${isDifferent ? 'text-amber-400 font-medium' : 'text-slate-400'}`}>
                    {field.label}
                    {isDifferent && (
                      <span className="ml-2 text-xs bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                        Modificado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {formatFieldValue(currentVal, field)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {formatFieldValue(previousVal, field)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-2">Resumen</h4>
        <p className="text-slate-400 text-sm">
          Se encontraron{' '}
          <span className="text-amber-400 font-semibold">
            {fieldsToCompare.filter(f => hasDifference(f.key)).length}
          </span>
          {' '}diferencias entre las versiones.
        </p>
      </div>
    </>
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="text-white text-xl" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  Historial de la oferta: {currentSnapshot.nombre}
                </h2>
                <p className="text-cyan-100 text-sm">
                  {packageVersions.length} versiones encontradas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Cerrar"
            >
              <X className="text-white text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


