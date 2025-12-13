'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Layers,
  Circle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ArrowRight,
  Download,
  Package,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  Plus,
  Clock,
  Percent,
  ChevronDown,
  ChevronUp,
  Tag,
  AlignLeft,
  CreditCard,
  User,
  History
} from 'lucide-react'
import type { PackageSnapshot } from '@/lib/types'
import { SnapshotComparison } from '../SnapshotComparison'
import { compararSnapshots } from '../../utils/snapshotComparison'

// ============================================================================
// Tipos
// ============================================================================

/** Paquete histórico con metadata de la cotización origen */
interface HistoricalPackage {
  id?: string
  nombre: string
  serviciosBase?: unknown[]
  desarrollo?: number
  descuento?: number
  tipo?: string
  descripcion?: string
  emoji?: string
  tagline?: string
  tiempoEntrega?: string
  opcionesPago?: unknown[]
  descuentoPagoUnico?: number
  otrosServicios?: unknown[]
  costoInicial?: number
  costoAño1?: number
  costoAño2?: number
  activo?: boolean
  _quotationId: string
  _quotationNumero: string
  _quotationVersionNumber: number
  _quotationCreatedAt: Date | string
  _isCurrentVersion: boolean
}

export interface PackageVersion {
  snapshot: PackageSnapshot
  quotation?: {
    id: string
    numero: string
    versionNumber?: number
    createdAt: Date
  } | null
  isCurrentVersion: boolean
}

// ============================================================================
// Helpers: Convertir HistoricalPackage a PackageSnapshot
// ============================================================================
function convertToPackageSnapshot(pkg: HistoricalPackage): PackageSnapshot {
  // Generar ID único: quotationId + nombre del paquete
  // Esto asegura que cada versión del paquete en cada cotización tenga un ID único
  const uniqueId = `${pkg._quotationId}_${pkg.nombre}`
  
  return {
    id: uniqueId,
    nombre: pkg.nombre,
    serviciosBase: (pkg.serviciosBase || []) as PackageSnapshot['serviciosBase'],
    paquete: {
      desarrollo: pkg.desarrollo || 0,
      descuento: pkg.descuento || 0,
      tipo: pkg.tipo || '',
      descripcion: pkg.descripcion || '',
      emoji: pkg.emoji || '',
      tagline: pkg.tagline || '',
      tiempoEntrega: pkg.tiempoEntrega || '',
      opcionesPago: (pkg.opcionesPago || []) as PackageSnapshot['paquete']['opcionesPago'],
      descuentoPagoUnico: pkg.descuentoPagoUnico || 0,
    },
    otrosServicios: (pkg.otrosServicios || []) as PackageSnapshot['otrosServicios'],
    costos: {
      inicial: pkg.costoInicial || 0,
      año1: pkg.costoAño1 || 0,
      año2: pkg.costoAño2 || 0,
    },
    activo: pkg.activo ?? true,
    createdAt: new Date(pkg._quotationCreatedAt).toISOString(),
    quotationConfigId: pkg._quotationId,
  }
}

// ============================================================================
// Componente: Timeline Item (Izquierda)
// ============================================================================
interface TimelineVersionProps {
  readonly version: PackageVersion
  readonly isSelected: boolean
  readonly onSelect: (versionId: string) => void
  readonly quotationInfo: { numero: string; fecha: string; id: string }
}

function TimelineVersion({
  version,
  isSelected,
  onSelect,
  quotationInfo
}: TimelineVersionProps) {
  const getIconColor = (): string => {
    if (version.isCurrentVersion) return 'text-gh-success'
    if (isSelected) return 'text-gh-info'
    return 'text-gh-border'
  }

  const getContainerClass = (): string => {
    if (isSelected) return 'bg-gh-info/10 border-gh-info shadow-lg shadow-gh-info/20'
    if (version.isCurrentVersion) return 'bg-gh-success/5 border-gh-success hover:bg-gh-success/10'
    return 'bg-gh-bg-secondary/50 border-gh-border hover:border-gh-info/50'
  }

  const getIcon = (): React.ReactNode => {
    if (version.isCurrentVersion || isSelected) {
      return <CheckCircle2 className={`w-3.5 h-3.5 ${getIconColor()} flex-shrink-0`} />
    }
    return <Circle className={`w-2.5 h-2.5 ${getIconColor()} flex-shrink-0`} />
  }

  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={() => onSelect(version.snapshot.id)}
      className={`w-full text-left p-3 rounded-lg transition-all border ${getContainerClass()}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {getIcon()}

        <span className="text-xs font-semibold text-gh-text truncate">
          {quotationInfo.numero}
        </span>

        {version.isCurrentVersion && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gh-success/20 text-gh-success ml-auto">
            ACTUAL
          </span>
        )}
      </div>

      <div className="text-xs text-gh-text-muted ml-5">
        {quotationInfo.fecha}
      </div>
    </motion.button>
  )
}

// ============================================================================
// Componente: Contenido Derecho - Vista Completa
// ============================================================================
interface ContentPanelProps {
  readonly selectedVersionIds: string[]
  readonly selectedVersions: PackageVersion[]
  readonly formatCurrency: (value: number) => string
  readonly formatDate: (date: Date | string) => string
  readonly getQuotationInfo: (quotationConfigId: string) => { numero: string; fecha: string; id: string; isGlobal: boolean; versionNumber: number }
  readonly onClearSelection: () => void
}

/** Componente para mostrar una fila de información */
function InfoRow({ icon, label, value, highlight = false }: { 
  readonly icon: React.ReactNode
  readonly label: string
  readonly value: string | number
  readonly highlight?: boolean 
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-gh-text-muted mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gh-text-muted">{label}</p>
        <p className={`font-semibold ${highlight ? 'text-gh-success' : 'text-gh-text'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

/** Card expandible para mostrar lista de servicios */
function ExpandableServiceCard({ 
  title, 
  count, 
  color, 
  items,
  formatCurrency,
  isExpanded,
  onToggle
}: {
  readonly title: string
  readonly count: number
  readonly color: 'info' | 'warning' | 'success'
  readonly items: Array<{ nombre: string; precio: number; mesesGratis?: number; mesesPago?: number; porcentaje?: number; descripcion?: string }>
  readonly formatCurrency: (value: number) => string
  readonly isExpanded: boolean
  readonly onToggle: () => void
}) {
  const colorClasses = {
    info: 'text-gh-info',
    warning: 'text-gh-warning',
    success: 'text-gh-success'
  }

  return (
    <div className="bg-gh-bg/50 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gh-bg-secondary/30 transition-colors"
      >
        <div className="text-center flex-1">
          <p className={`text-2xl font-bold ${colorClasses[color]}`}>{count}</p>
          <p className="text-xs text-gh-text-muted">{title}</p>
        </div>
        {count > 0 && (
          <div className="text-gh-text-muted">
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        )}
      </button>
      
      {isExpanded && count > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gh-border/50 px-3 pb-3"
        >
          <ul className="space-y-2 mt-2">
            {items.map((item, idx) => (
              <li key={idx} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gh-text">{item.nombre}</span>
                  <span className="text-gh-text-muted">
                    {item.porcentaje !== undefined 
                      ? `${item.porcentaje}%` 
                      : `${formatCurrency(item.precio)}/mes`
                    }
                  </span>
                </div>
                {(item.mesesGratis !== undefined || item.mesesPago !== undefined) && (
                  <div className="flex gap-2 mt-0.5 text-[10px]">
                    {item.mesesGratis !== undefined && item.mesesGratis > 0 && (
                      <span className="text-gh-success">{item.mesesGratis} mes(es) gratis</span>
                    )}
                    {item.mesesPago !== undefined && (
                      <span className="text-gh-text-muted">{item.mesesPago} mes(es) pago</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

/** Vista cuando hay 1 versión seleccionada - Detalles completos */
function SingleVersionView({ 
  version, 
  formatCurrency,
  formatDate,
  quotationInfo 
}: { 
  readonly version: PackageVersion
  readonly formatCurrency: (value: number) => string
  readonly formatDate: (date: Date | string) => string
  readonly quotationInfo: { numero: string; fecha: string; id: string; isGlobal: boolean; versionNumber: number }
}) {
  const snapshot = version.snapshot
  const serviciosBaseCount = snapshot.serviciosBase?.length || 0
  const otrosServiciosCount = snapshot.otrosServicios?.length || 0
  const opcionesPagoCount = snapshot.paquete?.opcionesPago?.length || 0
  
  // Estado para cards expandibles
  const [expandedCards, setExpandedCards] = useState<{
    serviciosBase: boolean
    otrosServicios: boolean
    opcionesPago: boolean
  }>({
    serviciosBase: false,
    otrosServicios: false,
    opcionesPago: false
  })

  const toggleCard = (card: keyof typeof expandedCards) => {
    setExpandedCards(prev => ({ ...prev, [card]: !prev[card] }))
  }

  // Verificar si hay descuentos configurados
  const tieneDescuentos = (snapshot.paquete?.descuento || 0) > 0 || (snapshot.paquete?.descuentoPagoUnico || 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gh-info/20 flex items-center justify-center text-xl">
            {snapshot.paquete?.emoji || '📦'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gh-text">{snapshot.nombre}</h3>
            <p className="text-xs text-gh-text-muted">{snapshot.paquete?.tipo || 'Paquete'}</p>
          </div>
        </div>
        {version.isCurrentVersion && (
          <span className="text-xs px-2 py-1 rounded-full bg-gh-success/20 text-gh-success font-semibold">
            VERSIÓN ACTUAL
          </span>
        )}
      </div>

      {/* Información de la Cotización */}
      <div className="bg-gh-bg-secondary/50 border border-gh-border/30 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gh-info mb-3 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-3 h-3" />
          Información de la Cotización
        </h4>
        <div className="grid grid-cols-2 gap-x-6">
          <InfoRow 
            icon={<FileText className="w-3.5 h-3.5" />} 
            label="Número de Cotización" 
            value={quotationInfo.numero} 
          />
          <InfoRow 
            icon={<History className="w-3.5 h-3.5" />} 
            label="Versión" 
            value={`V${quotationInfo.versionNumber}`} 
          />
          <InfoRow 
            icon={<Calendar className="w-3.5 h-3.5" />} 
            label="Fecha de Creación" 
            value={quotationInfo.fecha} 
          />
          <InfoRow 
            icon={<Calendar className="w-3.5 h-3.5" />} 
            label="Fecha del Paquete" 
            value={formatDate(snapshot.createdAt)} 
          />
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="bg-gh-bg-secondary/50 border border-gh-border/30 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gh-success mb-3 uppercase tracking-wide flex items-center gap-2">
          <DollarSign className="w-3 h-3" />
          Resumen Financiero
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gh-bg/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gh-text-muted uppercase mb-1">Desarrollo</p>
            <p className="text-lg font-bold text-gh-text">{formatCurrency(snapshot.paquete?.desarrollo || 0)}</p>
          </div>
          <div className="bg-gh-bg/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gh-text-muted uppercase mb-1">Costo Inicial</p>
            <p className="text-lg font-bold text-gh-success">{formatCurrency(snapshot.costos?.inicial || 0)}</p>
          </div>
          <div className="bg-gh-bg/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gh-text-muted uppercase mb-1">Costo Año 1</p>
            <p className="text-lg font-bold text-gh-info">{formatCurrency(snapshot.costos?.año1 || 0)}</p>
          </div>
          <div className="bg-gh-bg/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gh-text-muted uppercase mb-1">Costo Año 2</p>
            <p className="text-lg font-bold text-gh-warning">{formatCurrency(snapshot.costos?.año2 || 0)}</p>
          </div>
        </div>
      </div>

      {/* Descripción de la oferta (NUEVA SECCIÓN) */}
      <div className="bg-gh-bg-secondary/50 border border-gh-border/30 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-purple-400 mb-3 uppercase tracking-wide flex items-center gap-2">
          <AlignLeft className="w-3 h-3" />
          Descripción de la oferta
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Tag className="text-gh-text-muted mt-1 w-3.5 h-3.5" />
            <div className="flex-1">
              <p className="text-xs text-gh-text-muted">Tipo</p>
              <p className="font-semibold text-gh-text">{snapshot.paquete?.tipo || 'No especificado'}</p>
            </div>
          </div>
          {snapshot.paquete?.tagline && (
            <div className="flex items-start gap-3">
              <Tag className="text-gh-text-muted mt-1 w-3.5 h-3.5" />
              <div className="flex-1">
                <p className="text-xs text-gh-text-muted">Tagline</p>
                <p className="font-medium text-gh-text italic">&quot;{snapshot.paquete.tagline}&quot;</p>
              </div>
            </div>
          )}
          {snapshot.paquete?.descripcion && (
            <div className="flex items-start gap-3">
              <AlignLeft className="text-gh-text-muted mt-1 w-3.5 h-3.5" />
              <div className="flex-1">
                <p className="text-xs text-gh-text-muted">Descripción</p>
                <p className="text-xs font-medium text-gh-text leading-relaxed">{snapshot.paquete.descripcion}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Clock className="text-gh-text-muted mt-1 w-3.5 h-3.5" />
            <div className="flex-1">
              <p className="text-xs text-gh-text-muted">Tiempo de Entrega</p>
              <p className="font-semibold text-gh-text">{snapshot.paquete?.tiempoEntrega || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del Paquete - Cards Expandibles */}
      <div className="bg-gh-bg-secondary/50 border border-gh-border/30 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gh-warning mb-3 uppercase tracking-wide flex items-center gap-2">
          <Settings className="w-3 h-3" />
          Contenido del Paquete
          <span className="text-gh-text-muted font-normal ml-1">(click para expandir)</span>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <ExpandableServiceCard
            title="Servicios Base"
            count={serviciosBaseCount}
            color="info"
            items={(snapshot.serviciosBase || []).map(s => ({ 
              nombre: s.nombre, 
              precio: s.precio,
              mesesGratis: s.mesesGratis,
              mesesPago: s.mesesPago
            }))}
            formatCurrency={formatCurrency}
            isExpanded={expandedCards.serviciosBase}
            onToggle={() => toggleCard('serviciosBase')}
          />
          <ExpandableServiceCard
            title="Otros Servicios"
            count={otrosServiciosCount}
            color="warning"
            items={(snapshot.otrosServicios || []).map(s => ({ 
              nombre: s.nombre, 
              precio: s.precio,
              mesesGratis: s.mesesGratis,
              mesesPago: s.mesesPago
            }))}
            formatCurrency={formatCurrency}
            isExpanded={expandedCards.otrosServicios}
            onToggle={() => toggleCard('otrosServicios')}
          />
          <ExpandableServiceCard
            title="Opciones de Pago"
            count={opcionesPagoCount}
            color="success"
            items={(snapshot.paquete?.opcionesPago || []).map(op => ({ 
              nombre: op.nombre,
              precio: 0,
              porcentaje: op.porcentaje || 0,
              descripcion: op.descripcion
            }))}
            formatCurrency={formatCurrency}
            isExpanded={expandedCards.opcionesPago}
            onToggle={() => toggleCard('opcionesPago')}
          />
        </div>
      </div>

      {/* Configuración de Descuentos (condicional - solo si hay descuentos reales) */}
      {tieneDescuentos && (
        <div className="bg-gh-bg-secondary/50 border border-gh-border/30 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gh-danger mb-3 uppercase tracking-wide flex items-center gap-2">
            <Percent className="w-3 h-3" />
            Configuración de Descuentos
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {(snapshot.paquete?.descuento || 0) > 0 && (
              <div className="bg-gh-bg/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="w-3 h-3 text-gh-danger" />
                  <p className="text-[10px] text-gh-text-muted uppercase">Descuento Base</p>
                </div>
                <p className="text-xl font-bold text-gh-danger">{snapshot.paquete?.descuento}%</p>
                <p className="text-[10px] text-gh-text-muted">Aplicado al desarrollo</p>
              </div>
            )}
            {(snapshot.paquete?.descuentoPagoUnico || 0) > 0 && (
              <div className="bg-gh-bg/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-3 h-3 text-gh-success" />
                  <p className="text-[10px] text-gh-text-muted uppercase">Descuento Pago Único</p>
                </div>
                <p className="text-xl font-bold text-gh-success">{snapshot.paquete?.descuentoPagoUnico}%</p>
                <p className="text-[10px] text-gh-text-muted">Por pago de contado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de ayuda */}
      <p className="text-xs text-gh-text-muted text-center py-2">
        Selecciona otra versión para comparar
      </p>
    </motion.div>
  )
}

/** Vista cuando hay 2 versiones idénticas */
function IdenticalVersionsView({ 
  version1, 
  version2, 
  formatCurrency,
  formatDate,
  getQuotationInfo,
  onClearSelection,
  onExportCSV,
  onExportJSON
}: { 
  readonly version1: PackageVersion
  readonly version2: PackageVersion
  readonly formatCurrency: (value: number) => string
  readonly formatDate: (date: Date | string) => string
  readonly getQuotationInfo: (id: string) => { numero: string; fecha: string; id: string; isGlobal: boolean; versionNumber: number }
  readonly onClearSelection: () => void
  readonly onExportCSV: () => void
  readonly onExportJSON: () => void
}) {
  const snap1 = version1.snapshot
  const snap2 = version2.snapshot
  const info1 = getQuotationInfo(snap1.quotationConfigId || snap1.id)
  const info2 = getQuotationInfo(snap2.quotationConfigId || snap2.id)

  const serviciosBase1 = snap1.serviciosBase?.length || 0
  const serviciosBase2 = snap2.serviciosBase?.length || 0
  const otrosServicios1 = snap1.otrosServicios?.length || 0
  const otrosServicios2 = snap2.otrosServicios?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Encabezado con acciones */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClearSelection}
          className="text-gh-info hover:text-gh-info/80 text-xs font-semibold flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3 h-3" />
          Limpiar selección
        </button>
        <div className="flex gap-2">
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 rounded-lg bg-gh-bg-secondary hover:bg-gh-card border border-gh-border text-gh-text text-xs font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
          <button
            onClick={onExportJSON}
            className="px-3 py-1.5 rounded-lg bg-gh-bg-secondary hover:bg-gh-card border border-gh-border text-gh-text text-xs font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-3 h-3" /> JSON
          </button>
        </div>
      </div>

      {/* Comparación lado a lado */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* Columna DESDE */}
        <div className="bg-gh-bg-secondary/50 border border-gh-border/30 rounded-lg p-4 space-y-3">
          <p className="text-xs text-gh-text-muted uppercase tracking-wide text-center font-semibold">Desde</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="text-gh-info w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Paquete</p>
                <p className="font-semibold text-gh-text">{snap1.nombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="text-gh-text-muted w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Fecha de Creación</p>
                <p className="font-semibold text-gh-text">{formatDate(snap1.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="text-gh-text-muted w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Versión de Cotización</p>
                <p className="font-semibold text-gh-text">{info1.numero}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="text-gh-success w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Costo Inicial</p>
                <p className="font-semibold text-gh-success">{formatCurrency(snap1.costos?.inicial || 0)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Settings className="text-gh-warning w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Servicios Base</p>
                <p className="font-semibold text-gh-text">{serviciosBase1} servicios</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Plus className="text-gh-info w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Otros Servicios</p>
                <p className="font-semibold text-gh-text">{otrosServicios1} servicios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Flecha central */}
        <div className="flex items-center justify-center h-full">
          <ArrowRight className="text-gh-info text-xl" />
        </div>

        {/* Columna HACIA */}
        <div className="bg-gh-bg-secondary/50 border border-gh-border/30 rounded-lg p-4 space-y-3">
          <p className="text-xs text-gh-text-muted uppercase tracking-wide text-center font-semibold">Hacia</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="text-gh-info w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Paquete</p>
                <p className="font-semibold text-gh-text">{snap2.nombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="text-gh-text-muted w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Fecha de Creación</p>
                <p className="font-semibold text-gh-text">{formatDate(snap2.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="text-gh-text-muted w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Versión de Cotización</p>
                <p className="font-semibold text-gh-text">{info2.numero}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="text-gh-success w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Costo Inicial</p>
                <p className="font-semibold text-gh-success">{formatCurrency(snap2.costos?.inicial || 0)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Settings className="text-gh-warning w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Servicios Base</p>
                <p className="font-semibold text-gh-text">{serviciosBase2} servicios</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Plus className="text-gh-info w-3.5 h-3.5" />
              <div>
                <p className="text-xs text-gh-text-muted">Otros Servicios</p>
                <p className="font-semibold text-gh-text">{otrosServicios2} servicios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de snapshots idénticos */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gh-success/10 border border-gh-success/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-gh-success w-5 h-5" />
          <div>
            <p className="font-semibold text-gh-success">Los snapshots son idénticos</p>
            <p className="text-xs text-gh-text-muted mt-1">
              No se detectaron cambios en el contenido del paquete entre estas dos versiones de cotización.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ContentPanel({
  selectedVersionIds,
  selectedVersions,
  formatCurrency,
  formatDate,
  getQuotationInfo,
  onClearSelection
}: ContentPanelProps) {
  // Estado vacío
  if (selectedVersionIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-center">
        <div>
          <Layers className="text-gh-text-muted text-4xl mx-auto mb-3 opacity-50" />
          <p className="text-gh-text-muted text-sm">
            Selecciona una o dos versiones para ver detalles
          </p>
        </div>
      </div>
    )
  }

  // 1 versión seleccionada - Vista completa
  if (selectedVersionIds.length === 1) {
    const version = selectedVersions[0]
    const quotationInfo = getQuotationInfo(version.snapshot.quotationConfigId || version.snapshot.id)

    return (
      <SingleVersionView
        version={version}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        quotationInfo={quotationInfo}
      />
    )
  }

  // 2 versiones seleccionadas - Comparación
  const comparison = compararSnapshots(selectedVersions[0].snapshot, selectedVersions[1].snapshot)
  
  // Funciones de exportación
  const handleExportCSV = () => {
    import('../../utils/snapshotDiff').then(({ exportarDiffCSV }) => {
      exportarDiffCSV(comparison)
    })
  }

  const handleExportJSON = () => {
    import('../../utils/snapshotDiff').then(({ exportarDiffJSON }) => {
      exportarDiffJSON(comparison)
    })
  }

  // Si son idénticos, mostrar vista especial
  if (comparison.sonIdénticos) {
    return (
      <IdenticalVersionsView
        version1={selectedVersions[0]}
        version2={selectedVersions[1]}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getQuotationInfo={getQuotationInfo}
        onClearSelection={onClearSelection}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />
    )
  }

  // Si son diferentes, usar el componente SnapshotComparison existente
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClearSelection}
          className="text-gh-info hover:text-gh-info/80 text-xs font-semibold flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3 h-3" />
          Limpiar selección
        </button>
      </div>

      <SnapshotComparison
        snapshot1={selectedVersions[0].snapshot}
        snapshot2={selectedVersions[1].snapshot}
        showRollbackButton={false}
      />
    </motion.div>
  )
}

// ============================================================================
// Componente Principal
// ============================================================================
export interface PackageHistoryContentProps {
  readonly currentSnapshot: PackageSnapshot
}

interface PackagesHistoryResponse {
  success: boolean
  data: {
    packages: HistoricalPackage[]
    quotations: Array<{
      id: string
      numero: string
      versionNumber: number
      isGlobal: boolean
      createdAt: string
      packagesCount: number
    }>
    totalPackages: number
    totalQuotations: number
  }
}

export function PackageHistoryContent({
  currentSnapshot,
}: PackageHistoryContentProps) {
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historicalPackages, setHistoricalPackages] = useState<HistoricalPackage[]>([])
  const [quotationsData, setQuotationsData] = useState<PackagesHistoryResponse['data']['quotations']>([])

  // Cargar datos históricos del nuevo endpoint
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/quotations/packages-history')
        const data: PackagesHistoryResponse = await response.json()
        
        if (data.success) {
          console.log('📦 [PackageHistoryContent] Datos históricos cargados:', {
            totalPackages: data.data.totalPackages,
            totalQuotations: data.data.totalQuotations,
          })
          setHistoricalPackages(data.data.packages)
          setQuotationsData(data.data.quotations)
        } else {
          setError('Error al cargar historial de paquetes')
        }
      } catch (err) {
        console.error('Error cargando historial:', err)
        setError('Error cargando historial. No se pueden obtener los datos. Verifica tu conexión.')
      } finally {
        setLoading(false)
      }
    }

    loadHistoricalData()
  }, [])

  // ============================================================================
  // Helpers de formato
  // ============================================================================
  const formatDate = useCallback((date: Date | string): string => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }, [])

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }, [])

  // Helper para obtener info de cotización
  const getQuotationInfo = useCallback((quotationId: string) => {
    const quotation = quotationsData.find(q => q.id === quotationId)
    return {
      numero: quotation?.numero || 'N/A',
      fecha: quotation?.createdAt ? formatDate(quotation.createdAt) : 'N/A',
      id: quotationId,
      isGlobal: quotation?.isGlobal || false,
      versionNumber: quotation?.versionNumber || 1
    }
  }, [quotationsData, formatDate])

  // Construir lista de versiones ordenadas cronológicamente
  const packageVersions = useMemo<PackageVersion[]>(() => {
    // Filtrar paquetes con el mismo nombre que el actual
    const sameNamePackages = historicalPackages.filter(
      pkg => pkg.nombre === currentSnapshot.nombre
    )

    console.log('📦 [PackageHistoryContent] Paquetes con nombre "' + currentSnapshot.nombre + '":', sameNamePackages.length)

    const versions = sameNamePackages.map(pkg => {
      const snapshot = convertToPackageSnapshot(pkg)
      return {
        snapshot,
        quotation: {
          id: pkg._quotationId,
          numero: pkg._quotationNumero,
          versionNumber: pkg._quotationVersionNumber,
          createdAt: new Date(pkg._quotationCreatedAt)
        },
        isCurrentVersion: pkg._isCurrentVersion
      }
    })

    return versions.sort(
      (a, b) =>
        new Date(b.snapshot.createdAt).getTime() - new Date(a.snapshot.createdAt).getTime()
    )
  }, [historicalPackages, currentSnapshot.nombre])

  // Versiones seleccionadas para comparar
  const selectedVersions = useMemo(() => {
    return selectedVersionIds
      .map(id => packageVersions.find(v => v.snapshot.id === id))
      .filter(Boolean) as PackageVersion[]
  }, [selectedVersionIds, packageVersions])

  // ============================================================================
  // Handlers
  // ============================================================================
  const handleSelectVersion = useCallback((versionId: string) => {
    setSelectedVersionIds(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId)
      } else if (prev.length < 2) {
        return [...prev, versionId]
      }
      return [prev[1], versionId]
    })
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedVersionIds([])
  }, [])

  // ============================================================================
  // Renderizado Principal
  // ============================================================================
  
  // Estado de carga
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="text-gh-info text-4xl mx-auto mb-4 animate-spin" />
        <p className="text-gh-text-muted">Cargando historial de versiones...</p>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="text-center py-12">
        <Layers className="text-gh-danger text-5xl mx-auto mb-4 opacity-50" />
        <p className="text-gh-danger">{error}</p>
      </div>
    )
  }

  // Sin versiones
  if (packageVersions.length <= 1) {
    return (
      <div className="text-center py-12">
        <Layers className="text-gh-text-muted text-5xl mx-auto mb-4 opacity-50" />
        <p className="text-gh-text-muted">Este paquete solo tiene una versión disponible.</p>
        <p className="text-gh-text-muted text-xs mt-2">
          Se encontraron {packageVersions.length} versión(es) de &quot;{currentSnapshot.nombre}&quot;
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Timeline - Izquierda (20-25%) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/4 space-y-2 overflow-y-auto pr-2"
      >
        {packageVersions.map(version => (
          <TimelineVersion
            key={version.snapshot.id}
            version={version}
            isSelected={selectedVersionIds.includes(version.snapshot.id)}
            onSelect={handleSelectVersion}
            quotationInfo={getQuotationInfo(version.snapshot.quotationConfigId || version.snapshot.id)}
          />
        ))}
      </motion.div>

      {/* Contenido - Derecha (75-80%) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 overflow-y-auto"
      >
        <ContentPanel
          selectedVersionIds={selectedVersionIds}
          selectedVersions={selectedVersions}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getQuotationInfo={getQuotationInfo}
          onClearSelection={handleClearSelection}
        />
      </motion.div>
    </div>
  )
}

export default PackageHistoryContent


