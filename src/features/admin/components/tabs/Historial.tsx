'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Edit, Trash2, Eye, History, Check, Download } from 'lucide-react'
import type { QuotationConfig, PackageSnapshot } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'
import { extractBaseQuotationNumber } from '@/lib/utils/quotationNumber'
import { getStateColor, getStateIconComponent, getStateLabel } from '@/lib/utils/quotationStateHelper'
import { useEventTracking, useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import { useChangeQuotationState } from '@/features/admin/hooks/useChangeQuotationState'
import { useQuotationListener } from '@/hooks/useQuotationSync'
import DialogoGenerico from '../DialogoGenerico'
import DialogoGenericoDinamico from '../DialogoGenericoDinamico'
import CotizacionTimeline from '../CotizacionTimeline'
import CotizacionComparison from '../CotizacionComparison'
import { PaquetesComparisonContent } from '../comparisons/PaquetesComparisonContent'
import SectionHeader from '@/features/admin/components/SectionHeader'

interface HistorialProps {
  snapshots: PackageSnapshot[]
  quotations?: QuotationConfig[]
  onEdit?: (quotation: QuotationConfig) => void
  onDelete?: (quotationId: string) => void
  onToggleActive?: (quotationId: string, status: { activo: boolean; isGlobal: boolean }) => void
  onViewProposal?: (quotation: QuotationConfig) => void
  onRestaurarVersion?: (version: QuotationConfig) => void
  onDuplicarVersion?: (version: QuotationConfig) => void
  /** Mostrar botón de activar en modo selección post-eliminación */
  showActivateButton?: boolean
  /** Handler para activar cotización desde modo selección */
  onActivarCotizacion?: (quotationId: string) => void
}

/**
 * Tipo para agrupar cotizaciones por número base
 */
interface CotizacionAgrupada {
  numeroBase: string
  versionActiva: QuotationConfig
  todasLasVersiones: QuotationConfig[]
  totalVersiones: number
}

export default function Historial({
  snapshots = [],
  quotations = [],
  onEdit,
  onDelete,
  onToggleActive,
  onViewProposal,
  onRestaurarVersion,
  onDuplicarVersion,
  showActivateButton = false,
  onActivarCotizacion,
}: Readonly<HistorialProps>) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  
  // Estados para el timeline
  const [showTimeline, setShowTimeline] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationConfig | null>(null)
  
  // Estados para comparación
  const [showComparacion, setShowComparacion] = useState(false)
  const [versionesParaComparar, setVersionesParaComparar] = useState<[QuotationConfig, QuotationConfig] | null>(null)
  
  // Estados para comparación de paquetes
  const [showComparacionPaquetes, setShowComparacionPaquetes] = useState(false)
  const [versionesParaCompararPaquetes, setVersionesParaCompararPaquetes] = useState<[QuotationConfig, QuotationConfig] | null>(null)

  // Estados para diálogo de conflicto de cotización
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictData, setConflictData] = useState<{
    quotationId: string
    newState: string
    numero?: string
    existingQuotation?: any
  } | null>(null)
  
  // Hooks
  const { 
    trackHistorialViewed, 
    trackCotizacionExpanded, 
    trackCotizacionCollapsed,
    trackProposalViewed,
    trackCotizacionActivated,
    trackCotizacionDeactivated,
    trackCotizacionDeleted
  } = useEventTracking()
  const { changeState, changeStateWithForce } = useChangeQuotationState()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  
  // Handler para cambiar estado con validación de conflicto
  const handleChangeState = useCallback(async (quotationId: string, newState: string, numero?: string, emailCliente?: string) => {
    try {
      console.log(`📝 Cambiando estado de ${numero} a ${newState}...`)
      
      // Intentar cambio de estado
      const result = await changeState(quotationId, newState, emailCliente)
      
      if (result.success) {
        console.log(`✅ Estado cambiado exitosamente a ${newState}`)
        logAction('UPDATE', 'QUOTATIONS', quotationId, `Estado cambiado a ${newState}`)
        
        // Forzar actualización de datos emitiendo evento
        globalThis.dispatchEvent(new CustomEvent('quotation:updated', {
          detail: { quotationId, newState }
        }))
      } else if (result.existingQuotation) {
        // Hay conflicto - mostrar diálogo
        console.log(`⚠️ Conflicto: Cliente ya tiene cotización activa`, result.existingQuotation)
        setConflictData({
          quotationId,
          newState,
          numero,
          existingQuotation: result.existingQuotation,
        })
        setShowConflictDialog(true)
      }
    } catch (error) {
      console.error(`❌ Error al cambiar estado:`, error)
    }
  }, [changeState])

  // Handler para confirmar reemplazo de cotización
  const handleConfirmReplace = useCallback(async () => {
    if (!conflictData) return

    try {
      console.log(`🔄 Reemplazando cotización anterior...`)
      await changeStateWithForce(conflictData.quotationId, conflictData.newState)
      console.log(`✅ Cotización reemplazada exitosamente`)
      logAction('UPDATE', 'QUOTATIONS', conflictData.quotationId, `Estado forzado a ${conflictData.newState} (Reemplazo)`)

      // Cerrar diálogo
      setShowConflictDialog(false)
      setConflictData(null)

      // Forzar actualización
      globalThis.dispatchEvent(new CustomEvent('quotation:updated', {
        detail: { quotationId: conflictData.quotationId, newState: conflictData.newState }
      }))
    } catch (error) {
      console.error(`❌ Error al reemplazar cotización:`, error)
    }
  }, [conflictData, changeStateWithForce])

  // Handler para cancelar cambio
  const handleCancelChange = useCallback(() => {
    setShowConflictDialog(false)
    setConflictData(null)
  }, [])
  const cotizacionesAgrupadas = useMemo((): CotizacionAgrupada[] => {
    // Agrupar por número base (sin la versión)
    const grupos = new Map<string, QuotationConfig[]>()
    
    for (const q of quotations) {
      const numeroBase = extractBaseQuotationNumber(q.numero)
      if (!grupos.has(numeroBase)) {
        grupos.set(numeroBase, [])
      }
      grupos.get(numeroBase)!.push(q)
    }
    
    // Convertir a array de grupos, ordenar versiones y elegir la activa
    const resultado: CotizacionAgrupada[] = []
    
    for (const [numeroBase, versiones] of grupos) {
      // Ordenar por versionNumber descendente
      const versionesOrdenadas = [...versiones].sort((a, b) => b.versionNumber - a.versionNumber)
      
      // La versión activa es la que tiene isGlobal: true, o la más reciente
      const versionActiva = versionesOrdenadas.find(v => v.isGlobal) || versionesOrdenadas[0]
      
      resultado.push({
        numeroBase,
        versionActiva,
        todasLasVersiones: versionesOrdenadas,
        totalVersiones: versionesOrdenadas.length
      })
    }
    
    // Ordenar grupos por fecha de actualización más reciente
    return resultado.sort((a, b) => 
      new Date(b.versionActiva.updatedAt).getTime() - new Date(a.versionActiva.updatedAt).getTime()
    )
  }, [quotations])
  
  // Trackear cuando se visualiza el historial
  useEffect(() => {
    trackHistorialViewed(cotizacionesAgrupadas.length)
  }, [cotizacionesAgrupadas.length, trackHistorialViewed])

  // ✅ NUEVA: Escuchar eventos de sincronización de cotizaciones
  // Cuando se actualiza, crea o activa una cotización, el componente
  // recibe notificación automáticamente y sus datos se recalculan
  useQuotationListener(
    ['quotation:updated', 'quotation:created', 'quotation:activated'],
    useCallback((event) => {
      console.log(`🔄 HistorialTAB: Evento recibido:`, event.type, event.quotationId)
      // El cambio en el prop 'quotations' dispara useMemo nuevamente
      // cotizacionesAgrupadas se recalcula automáticamente
    }, [])
  )

  const toggleExpanded = useCallback((id: string, numero?: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
      trackCotizacionCollapsed(id)
    } else {
      newSet.add(id)
      trackCotizacionExpanded(id, numero)
    }
    setExpandedIds(newSet)
  }, [expandedIds, trackCotizacionExpanded, trackCotizacionCollapsed])
  
  // Handlers con tracking
  const handleViewProposal = useCallback((quotation: QuotationConfig) => {
    trackProposalViewed(quotation.id, quotation.numero)
    onViewProposal?.(quotation)
  }, [onViewProposal, trackProposalViewed])
  
  const handleDelete = useCallback((quotationId: string) => {
    if (!canDelete('QUOTATIONS')) return
    trackCotizacionDeleted(quotationId)
    logAction('DELETE', 'QUOTATIONS', quotationId, `Cotización Eliminada`)
    onDelete?.(quotationId)
  }, [onDelete, trackCotizacionDeleted, canDelete, logAction])

  // Handler para abrir timeline
  const handleShowTimeline = useCallback((quotation: QuotationConfig) => {
    setSelectedQuotation(quotation)
    setShowTimeline(true)
  }, [])

  // Handler para cerrar timeline
  const handleCloseTimeline = useCallback(() => {
    setShowTimeline(false)
    setSelectedQuotation(null)
  }, [])

  // Handler para restaurar versión
  const handleRestaurarVersion = useCallback((version: QuotationConfig) => {
    if (!canEdit('QUOTATIONS')) return
    logAction('UPDATE', 'QUOTATIONS', version.id, `Versión Restaurada: ${version.numero}`)
    onRestaurarVersion?.(version)
    handleCloseTimeline()
  }, [onRestaurarVersion, handleCloseTimeline, canEdit, logAction])

  // Handler para duplicar versión
  const handleDuplicarVersion = useCallback((version: QuotationConfig) => {
    if (!canCreate('QUOTATIONS')) return
    logAction('CREATE', 'QUOTATIONS', version.id, `Versión Duplicada: ${version.numero}`)
    onDuplicarVersion?.(version)
    handleCloseTimeline()
  }, [onDuplicarVersion, handleCloseTimeline, canCreate, logAction])

  // Handler para comparar versiones
  const handleCompararVersiones = useCallback((v1: QuotationConfig, v2: QuotationConfig) => {
    // Ordenar por versionNumber: v1 siempre es la más antigua
    const [older, newer] = v1.versionNumber < v2.versionNumber 
      ? [v1, v2] 
      : [v2, v1]
    
    setVersionesParaComparar([older, newer])
    setShowComparacion(true)
    // Cerrar el timeline al abrir comparación
    handleCloseTimeline()
  }, [handleCloseTimeline])

  // Handler para cerrar comparación
  const handleCloseComparacion = useCallback(() => {
    setShowComparacion(false)
    setVersionesParaComparar(null)
  }, [])

  // Handler para comparar paquetes entre versiones
  const handleCompararPaquetes = useCallback((v1: QuotationConfig, v2: QuotationConfig) => {
    // Ordenar por versionNumber: v1 siempre es la más antigua
    const [older, newer] = v1.versionNumber < v2.versionNumber 
      ? [v1, v2] 
      : [v2, v1]
    
    setVersionesParaCompararPaquetes([older, newer])
    setShowComparacionPaquetes(true)
    // Cerrar el timeline al abrir comparación de paquetes
    handleCloseTimeline()
  }, [handleCloseTimeline])

  // Handler para cerrar comparación de paquetes
  const handleCloseComparacionPaquetes = useCallback(() => {
    setShowComparacionPaquetes(false)
    setVersionesParaCompararPaquetes(null)
  }, [])

  // Obtener versiones de la cotización seleccionada (mismo número base, sin versión)
  const versionesSeleccionadas = selectedQuotation 
    ? quotations.filter(q => extractBaseQuotationNumber(q.numero) === extractBaseQuotationNumber(selectedQuotation.numero))
    : []

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
      <SectionHeader
        title="Historial de Cotizaciones"
        description="Consulta y gestiona todas las versiones de tus propuestas comerciales"
        icon={<History className="w-4 h-4" />}
        itemCount={quotations.length}
        variant="accent"
      />
      <div className="space-y-0 border border-gh-border/30 rounded-lg overflow-hidden bg-gh-bg">
        {/* Encabezado de la tabla - Estilo GitHub */}
        <div className="text-center bg-gh-bg-secondary border-b border-gh-border px-4 py-3 grid grid-cols-[1fr_0.5fr_1fr_1.4fr_1fr_1fr_1fr_1fr] gap-2 text-xs font-semibold text-gh-text">
          <div>Número</div>
          <div>Versiones</div>
          <div>Empresa</div>
          <div>Profesional</div>
          <div>Cliente Asignado</div>
          <div>Creada</div>
          <div>Última Actualización</div>
          <div>Estado</div>
        </div>

        {/* Filas de cotizaciones - Agrupadas por número */}
        {cotizacionesAgrupadas.map((grupo) => {
          const quotation = grupo.versionActiva
          const isExpanded = expandedIds.has(quotation.id)
          // Obtener paquetes de la versión activa
          const quotationSnapshots = snapshots.filter(
            (s) => s.quotationConfigId === quotation.id
          )
          // Filtrar solo paquetes ACTIVOS para "PAQUETES CONFIGURADOS"
          const paquetesConfigurados = quotationSnapshots.filter(s => s.activo)

          // Calcular fecha de creación de la PRIMERA versión
          const primeraVersion = grupo.todasLasVersiones.at(-1)
          const fechaCreacionOriginal = primeraVersion.createdAt

          // Calcular fecha de actualización de la ÚLTIMA versión (más reciente)
          const ultimaVersion = grupo.todasLasVersiones[0]
          const fechaActualizacionReciente = ultimaVersion.updatedAt

          return (
            <div key={grupo.numeroBase} className="border-b border-gh-border last:border-b-0">
              {/* Fila principal - Tabla de resumen */}
              <div className="bg-gh-bg hover:bg-gh-bg-secondary transition-colors px-4 py-3">
                <div className="text-center grid grid-cols-[1fr_0.5fr_1fr_1.4fr_1fr_1fr_1fr_1fr] gap-2 items-center text-sm">
                  {/* Número base (sin versión) */}
                  <div className="text-gh-text font-semibold">#{grupo.numeroBase}</div>

                  {/* Total de versiones con badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-gh-text-muted">v.{quotation.versionNumber}</span>
                    {grupo.totalVersiones > 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                        +{grupo.totalVersiones - 1}
                      </span>
                    )}
                  </div>

                  {/* Empresa */}
                  <div className="text-gh-text-muted truncate" title={quotation.empresa}>
                    {quotation.empresa || '—'}
                  </div>

                  {/* Profesional */}
                  <div className="text-gh-text-muted truncate" title={quotation.profesional}>
                    {quotation.profesional || '—'}
                  </div>

                  {/* Cliente Asignado */}
                  <div className="text-gh-text-muted truncate" title={(quotation as any).User?.nombre || (quotation as any).User?.username || 'Global'}>
                    {(quotation as any).User?.nombre || (quotation as any).User?.username || (
                      <span className="text-gh-accent/70 font-medium">Global</span>
                    )}
                  </div>

                  {/* Fecha de Creación (Primera Versión) */}
                  <div className="text-gh-text-muted text-xs flex items-center justify-center py-1 px-2 bg-gh-bg-secondary rounded border border-gh-border/30">
                    <span className="font-semibold text-gh-text">
                      {new Date(fechaCreacionOriginal).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Fecha de Última Actualización (Última Versión) */}
                  <div className="text-gh-text-muted text-xs flex items-center justify-center py-1 px-2 bg-gh-bg-secondary rounded border border-gh-border/30">
                    <span className="font-semibold text-gh-text">
                      {new Date(fechaActualizacionReciente).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Estado y Expandir */}
                  <div className="flex items-center justify-end gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
                      getStateColor(quotation.estado as any)
                    }`}>
                      {(() => {
                        const StateIcon = getStateIconComponent(quotation.estado as any)
                        return <StateIcon className="w-3.5 h-3.5" />
                      })()}
                      <span>{getStateLabel(quotation.estado as any)}</span>
                    </div>
                    <motion.button
                      onClick={() => toggleExpanded(quotation.id, quotation.numero)}
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-gh-text-muted hover:text-gh-text transition-colors p-1 rounded hover:bg-gh-border"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
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
                      {/* SECCIÓN A: Información de Versión de la Cotización - AHORA CON TODAS LAS VERSIONES */}
                      <div>
                        <h4 className="text-xs font-semibold text-gh-text mb-3 flex items-center gap-2">
                          VERSIONES DE ESTA COTIZACIÓN
                          {grupo.totalVersiones > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                              {grupo.totalVersiones} versiones
                            </span>
                          )}
                        </h4>
                        <div className="bg-gh-bg rounded-lg border border-gh-border/30 p-3">
                          {/* Versión activa */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md text-purple-400 font-mono text-sm font-bold">
                                v.{quotation.versionNumber}
                              </span>
                              <div>
                                <p className="text-xs text-gh-text font-medium">Versión {quotation.isGlobal ? 'activa' : 'más reciente'}</p>
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
                          
                          {/* Lista de versiones anteriores */}
                          {grupo.totalVersiones > 1 && (
                            <div className="mt-3 pt-3 border-t border-gh-border">
                              <p className="text-[10px] text-gh-text-muted mb-2">
                                Versiones anteriores ({grupo.totalVersiones - 1}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {grupo.todasLasVersiones
                                  .filter(v => v.id !== quotation.id)
                                  .map(v => (
                                    <span 
                                      key={v.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gh-bg-secondary border border-gh-border/30 rounded text-[10px] text-gh-text-muted"
                                      title={`Actualizada: ${new Date(v.updatedAt).toLocaleDateString('es-CO')}`}
                                    >
                                      v.{v.versionNumber}
                                      <span className="text-[8px] opacity-60">
                                        ({new Date(v.updatedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })})
                                      </span>
                                    </span>
                                  ))
                                }
                              </div>
                              <p className="text-[10px] text-gh-text-muted italic mt-2">
                                💡 Use el botón &quot;Historial&quot; para restaurar o comparar versiones anteriores
                              </p>
                            </div>
                          )}
                          
                          {grupo.totalVersiones === 1 && quotation.versionNumber > 1 && (
                            <div className="mt-2 pt-2 border-t border-gh-border">
                              <p className="text-[10px] text-gh-text-muted italic">
                                Esta cotización ha sido editada {quotation.versionNumber - 1} {quotation.versionNumber === 2 ? 'vez' : 'veces'} desde su creación.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SECCIÓN B: Paquetes Configurados - Grid 3 columnas simplificado */}
                      <div>
                        <h4 className="text-xs font-semibold text-gh-text mb-3 flex items-center gap-2">
                          PAQUETES CONFIGURADOS ({paquetesConfigurados.length})
                        </h4>
                        {paquetesConfigurados.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      {/* SECCIÓN C: Acciones - 3 Grids con botones en fila */}
                      <div className="border-t border-gh-border/20 pt-4 mt-2">
                        <div className="grid grid-cols-3 gap-3">
                          {/* Grid 1: EDITAR */}
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-widest">Editar</h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => onEdit?.(quotation)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gh-bg-secondary hover:bg-gh-border text-gh-text text-[11px] font-medium rounded-sm transition-colors duration-150"
                                title="Editar cotización"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => handleViewProposal(quotation)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-purple-500/10 hover:bg-purple-500/15 text-purple-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                title="Visualizar propuesta"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Ver</span>
                              </button>
                              <button
                                onClick={() => handleDelete(quotation.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/15 text-red-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                title="Eliminar cotización"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>

                          {/* Grid 2: ESTADO */}
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-widest">Estado</h5>
                            <div className="flex gap-1">
                              {quotation.estado === 'CARGADA' && (
                                <button
                                  onClick={() => handleChangeState(quotation.id, 'ACTIVA', quotation.numero, quotation.emailCliente)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-500/10 hover:bg-green-500/15 text-green-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                  title="Publicar cotización"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Publicar</span>
                                </button>
                              )}
                              {quotation.estado === 'ACTIVA' && (
                                <>
                                  <button
                                    onClick={() => handleChangeState(quotation.id, 'CARGADA', quotation.numero)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                    title="Cargar en edición"
                                  >
                                    <Edit className="w-3 h-3" />
                                    <span>Cargar</span>
                                  </button>
                                  <button
                                    onClick={() => handleChangeState(quotation.id, 'INACTIVA', quotation.numero)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/15 text-red-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                    title="Inactivar cotización"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Inactivar</span>
                                  </button>
                                </>
                              )}
                              {quotation.estado === 'INACTIVA' && (
                                <button
                                  onClick={() => handleChangeState(quotation.id, 'ACTIVA', quotation.numero, quotation.emailCliente)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-500/10 hover:bg-green-500/15 text-green-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                  title="Reactivar cotización"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Reactivar</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleShowTimeline(quotation)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/15 text-blue-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                title="Ver historial de versiones"
                              >
                                <History className="w-3 h-3" />
                                <span>Historial</span>
                              </button>
                            </div>
                          </div>

                          {/* Grid 3: EXPORTAR */}
                          <div className="space-y-1.5">
                            <h5 className="text-[10px] font-semibold text-gh-text-muted uppercase tracking-widest">Exportar</h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {}}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-orange-500/10 hover:bg-orange-500/15 text-orange-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                title="Descargar PDF"
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                              <button
                                onClick={() => {}}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/15 text-blue-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                title="Descargar Word"
                              >
                                <Download className="w-3 h-3" />
                                <span>Word</span>
                              </button>
                              <button
                                onClick={() => {}}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-500/10 hover:bg-green-500/15 text-green-300 text-[11px] font-medium rounded-sm transition-colors duration-150"
                                title="Descargar Excel"
                              >
                                <Download className="w-3 h-3" />
                                <span>Excel</span>
                              </button>
                            </div>
                          </div>
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

      {/* Modal de Timeline de Cotización */}
      {showTimeline && selectedQuotation && (
        <DialogoGenerico
          isOpen={showTimeline}
          onClose={handleCloseTimeline}
          title={`Historial de Cotización #${selectedQuotation.numero}`}
          icon={History}
          size="2xl"
          type="info"
          variant="premium"
        >
          <CotizacionTimeline
            cotizacionActual={selectedQuotation}
            versiones={versionesSeleccionadas}
            onRestaurar={handleRestaurarVersion}
            onDuplicar={handleDuplicarVersion}
            onComparar={handleCompararVersiones}
            onCompararPaquetes={handleCompararPaquetes}
            showActivateButton={showActivateButton}
            onActivarCotizacion={onActivarCotizacion}
          />
        </DialogoGenerico>
      )}

      {/* Modal de Comparación de Cotizaciones */}
      <AnimatePresence>
        {showComparacion && versionesParaComparar && (
          <CotizacionComparison
            cotizacion1={versionesParaComparar[0]}
            cotizacion2={versionesParaComparar[1]}
            snapshots1={snapshots.filter(s => s.quotationConfigId === versionesParaComparar[0].id)}
            snapshots2={snapshots.filter(s => s.quotationConfigId === versionesParaComparar[1].id)}
            onClose={handleCloseComparacion}
            onRestaurar={onRestaurarVersion}
            showRestaurarButton={!!onRestaurarVersion}
          />
        )}
      </AnimatePresence>

      {/* Modal de Comparación de Paquetes - Usando DialogoGenericoDinamico */}
      {showComparacionPaquetes && versionesParaCompararPaquetes && (
        <DialogoGenericoDinamico
          isOpen={showComparacionPaquetes}
          onClose={handleCloseComparacionPaquetes}
          title="Comparación de Paquetes"
          description={`Comparando paquetes entre v${versionesParaCompararPaquetes[0].versionNumber || 1} y v${versionesParaCompararPaquetes[1].versionNumber || 1}`}
          contentType="custom"
          content={
            <PaquetesComparisonContent
              cotizacion1={versionesParaCompararPaquetes[0]}
              cotizacion2={versionesParaCompararPaquetes[1]}
              snapshots1={snapshots.filter(s => s.quotationConfigId === versionesParaCompararPaquetes[0].id)}
              snapshots2={snapshots.filter(s => s.quotationConfigId === versionesParaCompararPaquetes[1].id)}
            />
          }
          size="xl"
          type="info"
          variant="premium"
          maxHeight="85vh"
        />
      )}

      {/* Diálogo de Conflicto: Cliente ya tiene cotización activa */}
      {showConflictDialog && conflictData && (
        <DialogoGenericoDinamico
          isOpen={showConflictDialog}
          onClose={handleCancelChange}
          title="Conflicto de asignación de cotización"
          description={`Cotización No. ${conflictData.existingQuotation?.numero || 'desconocida'} ya asignada`}
          type="warning"
          size="md"
          variant="premium"
          contentType="text"
          content={
            <div className="space-y-3">
              <p className="text-gh-text-secondary">
                <strong>Cliente:</strong> {conflictData.existingQuotation?.User?.username || 'Desconocido'}
              </p>
              <p className="text-gh-text-secondary">
                <strong>Email:</strong> {conflictData.existingQuotation?.emailCliente}
              </p>
              <p className="text-gh-text-secondary">
                <strong>Cotización Actual:</strong> {conflictData.existingQuotation?.numero}
              </p>
              <p className="text-gh-text-secondary mt-4">
                ¿Deseas reemplazar esta cotización con la nueva?
              </p>
            </div>
          }
          actions={[
            {
              id: 'cancel',
              label: 'Cancelar',
              variant: 'secondary',
              onClick: handleCancelChange,
            },
            {
              id: 'confirm',
              label: 'Sí, Reemplazar',
              variant: 'primary',
              onClick: handleConfirmReplace,
            },
          ]}
        />
      )}
    </div>
  )
}


