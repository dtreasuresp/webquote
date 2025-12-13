'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Package, ArrowUpDown, FileInput, GripVertical, Clock, ArrowRight, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import ContentHeader from '@/features/admin/components/content/contenido/ContentHeader'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DialogoGenerico from '@/features/admin/components/DialogoGenerico'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import { getPaquetesDesglose } from '@/lib/utils/priceRangeCalculator'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PaquetesCaracteristicasData {
  /** Título de la sección */
  titulo: string
  /** Subtítulo de la sección */
  subtitulo: string
  /** Nota importante para mostrar */
  notaImportante: string
  /** Características editables por paquete (clave = nombre del paquete desde snapshots) */
  caracteristicasPorPaquete: {
    [nombrePaquete: string]: string[]
  }
  /** Orden personalizado de paquetes (array de IDs) */
  ordenPaquetes: string[]
}

export interface PaquetesCaracteristicasContentProps {
  readonly data: PaquetesCaracteristicasData
  readonly onChange: (data: PaquetesCaracteristicasData) => void
  /** Indica si la configuración de cotización aún está cargando */
  readonly isConfigLoading?: boolean
  readonly updatedAt?: string | null
}

// Tipo para el paquete desde snapshots
interface PaqueteDesglose {
  id: string
  nombre: string
  emoji: string
  tagline?: string
  tiempoEntrega?: string
  desarrollo: number
  costoInicial: number
  costoAnio1: number
  serviciosBase: Array<{ nombre: string; precio: number; mesesPago: number }>
  serviciosOpcionales: Array<{ nombre: string; precio: number; mesesPago?: number }>
}

// Props para el componente de paquete arrastrable
interface SortablePaqueteCardProps {
  readonly paq: PaqueteDesglose
  readonly caracteristicasItems: CaracteristicaItem[]
  readonly onUpdateCaracteristica: (id: string, texto: string) => void
  readonly onRemoveCaracteristica: (id: string) => void
  readonly onAddCaracteristica: (paqueteNombre: string, texto: string) => void
  readonly getPaquetesConCaracteristicas: (excluir: string) => string[]
  readonly paqueteImportarDesde: { [key: string]: string }
  readonly setPaqueteImportarDesde: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  readonly handleImportarClick: (nombre: string) => void
  readonly menuOrdenarAbierto: string | null
  readonly setMenuOrdenarAbierto: React.Dispatch<React.SetStateAction<string | null>>
  readonly menuOrdenarRef: React.RefObject<HTMLDivElement | null>
  readonly sortCaracteristicas: (nombre: string, tipo: 'az' | 'za' | 'short' | 'long') => void
  readonly isExpanded: boolean
  readonly onToggleExpand: (paqueteId: string) => void
  readonly isOverPaquete: boolean
  readonly getCaracteristicasPaquete: (nombre: string) => string[]
}

// Tipo para característica individual con ID único
interface CaracteristicaItem {
  id: string
  texto: string
  paqueteNombre: string
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Característica individual arrastrable
// ═══════════════════════════════════════════════════════════════

function SortableCaracteristica({ 
  item, 
  onUpdate, 
  onRemove 
}: {
  readonly item: CaracteristicaItem
  readonly onUpdate: (id: string, texto: string) => void
  readonly onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    data: {
      type: 'caracteristica',
      item,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex gap-3 items-center p-3 bg-gh-info/20 border-2 border-dashed border-gh-info rounded-lg opacity-50"
      >
        <div className="p-2"><GripVertical className="w-3.5 h-3.5 text-gh-info" /></div>
        <span className="text-sm text-gh-info">{item.texto}</span>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-center p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-lg hover:border-gh-info/50 transition-all"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="p-2 rounded transition-colors text-gh-text-muted hover:text-gh-info hover:bg-gh-info/10 cursor-grab"
        title="Arrastrar para reordenar o mover a otro paquete"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      
      <input
        type="text"
        value={item.texto}
        onChange={(e) => onUpdate(item.id, e.target.value)}
        className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-info focus:ring-1 focus:ring-gh-info/50 focus:outline-none text-xs font-medium text-gh-text transition-colors"
      />
      
      <button
        onClick={() => onRemove(item.id)}
        type="button"
        className="p-2 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
        title="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Zona droppable para características
// ═══════════════════════════════════════════════════════════════

function DroppableCaracteristicasZone({
  paqueteNombre,
  items,
  onUpdate,
  onRemove,
  onAdd,
  isOver,
}: {
  readonly paqueteNombre: string
  readonly items: CaracteristicaItem[]
  readonly onUpdate: (id: string, texto: string) => void
  readonly onRemove: (id: string) => void
  readonly onAdd: (texto: string) => void
  readonly isOver: boolean
}) {
  const [newItem, setNewItem] = useState('')
  
  const { setNodeRef } = useDroppable({
    id: `drop-${paqueteNombre}`,
    data: {
      type: 'paquete-drop',
      paqueteNombre,
    }
  })

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim())
      setNewItem('')
    }
  }

  const itemIds = items.map(i => i.id)

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-2 min-h-[60px] p-2 -m-2 rounded-lg transition-all ${
        isOver 
          ? 'bg-gh-info/10 ring-2 ring-gh-info ring-dashed' 
          : ''
      }`}
    >
      {isOver && (
        <div className="flex items-center justify-center gap-2 py-2 text-gh-info text-xs font-medium animate-pulse">
          <ArrowRight className="w-3 h-3" />
          <span>Soltar aquí para mover a este paquete</span>
        </div>
      )}
      
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {items.length === 0 && !isOver ? (
          <div className="text-center py-4 bg-gh-bg-secondary border border-dashed border-gh-border rounded-lg">
            <p className="text-xs font-medium text-gh-text-muted">No hay características</p>
          </div>
        ) : (
          items.map((item) => (
            <SortableCaracteristica
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))
        )}
      </SortableContext>
      
      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Ej: Diseño responsive, SEO básico..."
          className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border border-dashed rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-xs font-medium text-gh-text placeholder-gh-text-muted transition-colors"
        />
        <button
          onClick={handleAdd}
          type="button"
          disabled={!newItem.trim()}
          className="px-4 py-2 text-xs font-medium bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE TARJETA DE PAQUETE ARRASTRABLE
// ═══════════════════════════════════════════════════════════════

function SortablePaqueteCard({
  paq,
  caracteristicasItems,
  onUpdateCaracteristica,
  onRemoveCaracteristica,
  onAddCaracteristica,
  getPaquetesConCaracteristicas,
  paqueteImportarDesde,
  setPaqueteImportarDesde,
  handleImportarClick,
  menuOrdenarAbierto,
  setMenuOrdenarAbierto,
  menuOrdenarRef,
  sortCaracteristicas,
  isExpanded,
  onToggleExpand,
  isOverPaquete,
  getCaracteristicasPaquete,
}: SortablePaqueteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: paq.id,
    data: {
      type: 'paquete',
      paquete: paq,
    },
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? 'none' : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gh-bg-secondary border rounded-xl ${isDragging ? 'border-transparent' : 'border-gh-border hover:border-gh-info/30'}`}
    >
      {/* Header con nombre del paquete */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gh-border">
        {/* Handle de arrastre */}
        <button
          {...attributes}
          {...listeners}
          type="button"
          className={`p-1.5 rounded transition-all ${isDragging ? 'text-gh-info bg-gh-info/20 cursor-grabbing' : 'text-gh-text-muted hover:text-gh-info hover:bg-gh-info/10 cursor-grab'}`}
          title="Arrastrar para reordenar paquete"
        >
          <GripVertical className="w-3 h-3" />
        </button>

        {/* Emoji + Nombre + Tiempo */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{paq.emoji}</span>
          <h5 className="text-sm font-bold text-gh-text">{paq.nombre}</h5>
          {paq.tiempoEntrega && (
            <span className="ml-2 flex items-center gap-1 text-xs text-gh-info">
              <Clock className="w-3 h-3" /> {paq.tiempoEntrega}
            </span>
          )}
        </div>
      </div>

      {/* Métricas en grid estilo captura */}
      <div className="grid grid-cols-3 divide-x divide-gh-border">
        {/* Pago Inicial */}
        <div className="py-3 px-4 text-center">
          <p className="text-xs text-gh-text-muted mb-1">Pago Inicial</p>
          <p className="text-lg font-bold text-gh-text">${paq.costoInicial.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Primer Año */}
        <div className="py-3 px-4 text-center">
          <p className="text-xs text-gh-text-muted mb-1">Primer Año</p>
          <p className="text-lg font-bold text-gh-info">${paq.costoAnio1.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-gh-text-muted">incluye desarrollo</p>
        </div>

        {/* Desarrollo (como referencia adicional) */}
        <div className="py-3 px-4 text-center">
          <p className="text-xs text-gh-text-muted mb-1">Desarrollo</p>
          <p className="text-lg font-bold text-gh-accent">${paq.desarrollo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Características Incluidas (EDITABLE con drag & drop) */}
      <div className="border-t border-gh-border/20 bg-gh-bg-tertiary/30">
        <button
          type="button"
          onClick={() => onToggleExpand(paq.id)}
          className="w-full px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-gh-bg-tertiary/50 transition-colors"
        >
          <h6 className="text-xs font-medium text-gh-text flex items-center gap-2">
            Características Incluidas
            <span className="text-gh-text-muted font-normal">({getCaracteristicasPaquete(paq.nombre).length})</span>
          </h6>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gh-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gh-text-muted" />
            )}
          </div>
        </button>
        
        {/* Contenido expandible */}
        <motion.div
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-3 flex items-center justify-end gap-2">
            {/* Dropdown Importar desde otro paquete */}
            {getPaquetesConCaracteristicas(paq.nombre).length > 0 && (
              <div className="flex items-center gap-1.5">
                <DropdownSelect
                  value={paqueteImportarDesde[paq.nombre] || ''}
                  onChange={(val) => setPaqueteImportarDesde(prev => ({ ...prev, [paq.nombre]: val }))}
                  options={[
                    { value: '', label: 'Importar desde...' },
                    ...getPaquetesConCaracteristicas(paq.nombre).map(nombrePaq => ({
                      value: nombrePaq,
                      label: `${nombrePaq} (${getCaracteristicasPaquete(nombrePaq).length})`
                    }))
                  ]}
                  className="flex-1"
                />
                <button
                  onClick={() => handleImportarClick(paq.nombre)}
                  disabled={!paqueteImportarDesde[paq.nombre]}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    paqueteImportarDesde[paq.nombre]
                      ? 'bg-gh-info/20 border border-gh-info/40 text-gh-info hover:bg-gh-info/30 hover:shadow-md'
                      : 'bg-gh-bg-secondary border border-gh-border text-gh-text-muted opacity-50 cursor-not-allowed'
                  }`}
                  title="Importar características"
                >
                  <FileInput className="text-sm" />
                </button>
              </div>
            )}

            {/* Botón Ordenar (ahora con click) */}
            {getCaracteristicasPaquete(paq.nombre).length > 1 && (
              <div className="relative" ref={menuOrdenarAbierto === paq.nombre ? menuOrdenarRef : null}>
                <button
                  onClick={() => setMenuOrdenarAbierto(menuOrdenarAbierto === paq.nombre ? null : paq.nombre)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                    menuOrdenarAbierto === paq.nombre
                      ? 'bg-gh-accent/20 border-gh-accent/40 text-gh-accent shadow-md'
                      : 'bg-gh-bg-secondary border-gh-border text-gh-text-muted hover:bg-gh-bg-tertiary hover:border-gh-border-hover'
                  }`}
                >
                  <ArrowUpDown className="text-sm" /> Ordenar
                </button>
                {menuOrdenarAbierto === paq.nombre && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-gh-bg-secondary border border-gh-border/30 rounded-xl shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'az')}
                      className="w-full px-4 py-2.5 text-left text-xs text-gh-text hover:bg-gh-info/10 hover:text-gh-info transition-all flex items-center gap-2"
                    >
                      <span className="text-sm">🔤</span> Alfabético A-Z
                    </button>
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'za')}
                      className="w-full px-4 py-2.5 text-left text-xs text-gh-text hover:bg-gh-info/10 hover:text-gh-info transition-all flex items-center gap-2"
                    >
                      <span className="text-sm">🔤</span> Alfabético Z-A
                    </button>
                    <div className="border-t border-gh-border" />
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'short')}
                      className="w-full px-4 py-2.5 text-left text-xs text-gh-text hover:bg-gh-info/10 hover:text-gh-info transition-all flex items-center gap-2"
                    >
                      <span className="text-sm">📏</span> Corto → Largo
                    </button>
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'long')}
                      className="w-full px-4 py-2.5 text-left text-xs text-gh-text hover:bg-gh-info/10 hover:text-gh-info transition-all flex items-center gap-2"
                    >
                      <span className="text-sm">📏</span> Largo → Corto
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="px-4 pb-4">
            <DroppableCaracteristicasZone
              paqueteNombre={paq.nombre}
              items={caracteristicasItems}
              onUpdate={onUpdateCaracteristica}
              onRemove={onRemoveCaracteristica}
              onAdd={(texto) => onAddCaracteristica(paq.nombre, texto)}
              isOver={isOverPaquete}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DATOS POR DEFECTO
// ═══════════════════════════════════════════════════════════════

export const defaultPaquetesCaracteristicas: PaquetesCaracteristicasData = {
  titulo: 'Paquetes Disponibles',
  subtitulo: 'Características incluidas en cada paquete',
  notaImportante: 'Los precios pueden variar según requerimientos específicos. Se entregará cotización formal después de evaluar el proyecto.',
  caracteristicasPorPaquete: {},
  ordenPaquetes: [],
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function PaquetesCaracteristicasContent({
  data,
  onChange,
  isConfigLoading,
  updatedAt,
}: PaquetesCaracteristicasContentProps) {
  // Cargar paquetes desde snapshots
  const { snapshots, loading: loadingSnapshots } = useSnapshots()
  const paquetesSnapshot = getPaquetesDesglose(snapshots)

  // Estado para evitar flash de reordenamiento
  // Esperamos a que: 1) config cargada, 2) snapshots cargados
  const [isDataReady, setIsDataReady] = useState(false)

  // Detectar cuando los datos están listos para mostrar
  useEffect(() => {
    // Si la configuración o snapshots aún se están cargando, no mostrar aún
    if (isConfigLoading || loadingSnapshots) {
      setIsDataReady(false)
      return
    }

    // Config y snapshots están listos, mostrar contenido
    setIsDataReady(true)
  }, [isConfigLoading, loadingSnapshots])

  // ═══════════════════════════════════════════════════════════════
  // Estados para menú ordenar (click) y diálogo de importación
  // ═══════════════════════════════════════════════════════════════
  const [menuOrdenarAbierto, setMenuOrdenarAbierto] = useState<string | null>(null)
  const [paqueteImportarDesde, setPaqueteImportarDesde] = useState<{ [key: string]: string }>({})
  const menuOrdenarRef = useRef<HTMLDivElement>(null)
  
  // Estado para expandir/colapsar características de cada paquete
  const [expandedPaquetes, setExpandedPaquetes] = useState<{ [key: string]: boolean }>(() => {
    // Cargar estado desde localStorage al iniciar
    if (globalThis.window !== undefined) {
      const saved = localStorage.getItem('paquetes-caracteristicas-expanded')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return {}
        }
      }
    }
    return {}
  })

  // Guardar estado de expansión en localStorage cuando cambie
  useEffect(() => {
    if (globalThis.window !== undefined && Object.keys(expandedPaquetes).length > 0) {
      localStorage.setItem('paquetes-caracteristicas-expanded', JSON.stringify(expandedPaquetes))
    }
  }, [expandedPaquetes])

  // Toggle para expandir/colapsar un paquete
  const handleToggleExpand = (paqueteId: string) => {
    setExpandedPaquetes(prev => ({
      ...prev,
      [paqueteId]: !prev[paqueteId]
    }))
  }
  
  // Estado para el diálogo de confirmación
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [dialogoConfig, setDialogoConfig] = useState<{
    titulo: string
    mensaje: string
    tipo: 'info' | 'warning' | 'success'
    paqueteDestino: string
    paqueteOrigen: string
  } | null>(null)

  // Cerrar menú ordenar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOrdenarRef.current && !menuOrdenarRef.current.contains(event.target as Node)) {
        setMenuOrdenarAbierto(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // Drag & Drop de Paquetes
  // ═══════════════════════════════════════════════════════════════
  const sensorsPaquetes = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Ordenar paquetes según el orden guardado o por defecto
  const paquetesOrdenados = useMemo(() => {
    if (!data.ordenPaquetes || data.ordenPaquetes.length === 0) {
      return paquetesSnapshot
    }
    // Ordenar según el array guardado, paquetes nuevos van al final
    const ordenMap = new Map(data.ordenPaquetes.map((id, index) => [id, index]))
    return [...paquetesSnapshot].sort((a, b) => {
      const indexA = ordenMap.get(a.id) ?? Infinity
      const indexB = ordenMap.get(b.id) ?? Infinity
      return indexA - indexB
    })
  }, [paquetesSnapshot, data.ordenPaquetes])

  const paqueteIds = paquetesOrdenados.map(p => p.id)

  // ═══════════════════════════════════════════════════════════════
  // Sistema de Características con IDs únicos para drag entre paquetes
  // ═══════════════════════════════════════════════════════════════
  
  // Convertir características string[] a CaracteristicaItem[] con IDs únicos
  const toCaracteristicaItems = useCallback((paqueteNombre: string, items: string[]): CaracteristicaItem[] => {
    return items.map((texto, index) => ({
      id: `${paqueteNombre}::${index}::${texto.slice(0, 20)}`,
      texto,
      paqueteNombre,
    }))
  }, [])

  // Obtener todas las características como items para todos los paquetes
  const allCaracteristicasItems = useMemo(() => {
    const items: CaracteristicaItem[] = []
    for (const paq of paquetesOrdenados) {
      const paqItems = toCaracteristicaItems(paq.nombre, data.caracteristicasPorPaquete?.[paq.nombre] || [])
      items.push(...paqItems)
    }
    return items
  }, [paquetesOrdenados, data.caracteristicasPorPaquete, toCaracteristicaItems])

  // Estado para tracking del drag de características y paquetes
  const [activeCaracteristica, setActiveCaracteristica] = useState<CaracteristicaItem | null>(null)
  const [activePaquete, setActivePaquete] = useState<PaqueteDesglose | null>(null)
  const [overPaquete, setOverPaquete] = useState<string | null>(null)

  // Manejadores para drag de características y paquetes
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'caracteristica') {
      setActiveCaracteristica(active.data.current.item as CaracteristicaItem)
      setActivePaquete(null)
    } else if (active.data.current?.type === 'paquete') {
      // Es un paquete (usamos el data que agregamos al useSortable)
      setActivePaquete(active.data.current.paquete as PaqueteDesglose)
      setActiveCaracteristica(null)
    } else {
      // Fallback: buscar por ID
      const paq = paquetesOrdenados.find(p => p.id === active.id)
      if (paq) {
        setActivePaquete(paq)
        setActiveCaracteristica(null)
      }
    }
  }

  const handleDragOverCaracteristica = (event: DragOverEvent) => {
    const { over } = event
    if (over?.data.current?.type === 'paquete-drop') {
      setOverPaquete(over.data.current.paqueteNombre as string)
    } else if (over?.data.current?.type === 'caracteristica') {
      // Si está sobre otra característica, obtener el paquete de esa característica
      const item = over.data.current.item as CaracteristicaItem
      setOverPaquete(item.paqueteNombre)
    } else {
      setOverPaquete(null)
    }
  }

  const handleDragEndCaracteristica = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveCaracteristica(null)
    setOverPaquete(null)
    
    if (!over) return

    const activeData = active.data.current
    if (activeData?.type !== 'caracteristica') return

    const activeItem = activeData.item as CaracteristicaItem
    
    // Determinar el paquete destino
    const overData = over.data.current
    const { targetPaquete, targetIndex } = (() => {
      if (overData?.type === 'paquete-drop') {
        return { targetPaquete: overData.paqueteNombre as string, targetIndex: null as number | null }
      }
      if (overData?.type === 'caracteristica') {
        const overItem = overData.item as CaracteristicaItem
        const paq = overItem.paqueteNombre
        const items = data.caracteristicasPorPaquete?.[paq] || []
        const idx = items.indexOf(overItem.texto)
        return { targetPaquete: paq, targetIndex: idx >= 0 ? idx : null }
      }
      return { targetPaquete: null, targetIndex: null as number | null }
    })()

    if (!targetPaquete) return

    const sourcePaquete = activeItem.paqueteNombre

    // Mismo paquete: reordenar
    if (sourcePaquete === targetPaquete) {
      const items = [...(data.caracteristicasPorPaquete?.[sourcePaquete] || [])]
      const oldIndex = items.indexOf(activeItem.texto)
      
      if (oldIndex === -1 || targetIndex === null || oldIndex === targetIndex) return
      
      updateCaracteristicasPaquete(sourcePaquete, arrayMove(items, oldIndex, targetIndex))
      return
    }
    
    // Diferente paquete: mover
    const sourceItems = [...(data.caracteristicasPorPaquete?.[sourcePaquete] || [])]
    const destItems = [...(data.caracteristicasPorPaquete?.[targetPaquete] || [])]
    
    const itemIndex = sourceItems.indexOf(activeItem.texto)
    if (itemIndex === -1) return
    
    sourceItems.splice(itemIndex, 1)
    
    if (targetIndex !== null) {
      destItems.splice(targetIndex, 0, activeItem.texto)
    } else {
      destItems.push(activeItem.texto)
    }
    
    onChange({
      ...data,
      caracteristicasPorPaquete: {
        ...data.caracteristicasPorPaquete,
        [sourcePaquete]: sourceItems,
        [targetPaquete]: destItems,
      },
    })
  }

  // Handlers para características individuales
  const handleUpdateCaracteristica = (id: string, texto: string) => {
    // Extraer paquete del ID
    const paqueteNombre = id.split('::')[0]
    const items = data.caracteristicasPorPaquete?.[paqueteNombre] || []
    const itemTextoOriginal = allCaracteristicasItems.find(i => i.id === id)?.texto
    if (!itemTextoOriginal) return
    
    const newItems = items.map(t => t === itemTextoOriginal ? texto : t)
    updateCaracteristicasPaquete(paqueteNombre, newItems)
  }

  const handleRemoveCaracteristica = (id: string) => {
    const paqueteNombre = id.split('::')[0]
    const items = data.caracteristicasPorPaquete?.[paqueteNombre] || []
    const itemTexto = allCaracteristicasItems.find(i => i.id === id)?.texto
    if (!itemTexto) return
    
    const newItems = items.filter(t => t !== itemTexto)
    updateCaracteristicasPaquete(paqueteNombre, newItems)
  }

  const handleAddCaracteristica = (paqueteNombre: string, texto: string) => {
    const items = data.caracteristicasPorPaquete?.[paqueteNombre] || []
    updateCaracteristicasPaquete(paqueteNombre, [...items, texto])
  }

  // Combinar manejo de drag para paquetes
  const handleDragEndPaquetes = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Limpiar estados de drag
    setActivePaquete(null)
    
    // Si es una característica, usar el handler de características
    if (active.data.current?.type === 'caracteristica') {
      handleDragEndCaracteristica(event)
      return
    }
    
    // Si no hay over, no hacer nada
    if (!over) return
    
    // El active.id es el ID del paquete que estamos arrastrando
    const draggedPaqueteId = active.id as string
    
    // Determinar el ID del paquete destino
    let targetPaqueteId: string | null = null
    
    // Si el over tiene data type 'paquete', usar directamente
    if (over.data.current?.type === 'paquete') {
      targetPaqueteId = over.id as string
    }
    // Si over.id es directamente un ID de paquete válido
    else if (paqueteIds.includes(over.id as string)) {
      targetPaqueteId = over.id as string
    }
    // Si el over es una característica, obtener el ID del paquete padre
    else if (over.data.current?.type === 'caracteristica') {
      const item = over.data.current.item as CaracteristicaItem
      const targetPaq = paquetesOrdenados.find(p => p.nombre === item.paqueteNombre)
      if (targetPaq) {
        targetPaqueteId = targetPaq.id
      }
    }
    // Si el over es una zona de paquete
    else if (over.data.current?.type === 'paquete-drop') {
      const targetPaq = paquetesOrdenados.find(p => p.nombre === over.data.current?.paqueteNombre)
      if (targetPaq) {
        targetPaqueteId = targetPaq.id
      }
    }
    
    // Si no encontramos destino válido o es el mismo, no hacer nada
    if (!targetPaqueteId || draggedPaqueteId === targetPaqueteId) return
    
    // Obtener índices
    const oldIndex = paqueteIds.indexOf(draggedPaqueteId)
    const newIndex = paqueteIds.indexOf(targetPaqueteId)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const nuevoOrden = arrayMove(paqueteIds, oldIndex, newIndex)
      onChange({
        ...data,
        ordenPaquetes: nuevoOrden,
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Características por Paquete (dinámico desde snapshots)
  // ═══════════════════════════════════════════════════════════════
  const updateCaracteristicasPaquete = (nombrePaquete: string, caracteristicas: string[]) => {
    onChange({
      ...data,
      caracteristicasPorPaquete: {
        ...data.caracteristicasPorPaquete,
        [nombrePaquete]: caracteristicas,
      },
    })
  }

  const getCaracteristicasPaquete = (nombrePaquete: string): string[] => {
    return data.caracteristicasPorPaquete?.[nombrePaquete] || []
  }

  // Función para ordenar características
  const sortCaracteristicas = (nombrePaquete: string, sortType: 'az' | 'za' | 'short' | 'long') => {
    const caracteristicas = [...getCaracteristicasPaquete(nombrePaquete)]
    
    switch (sortType) {
      case 'az':
        caracteristicas.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
        break
      case 'za':
        caracteristicas.sort((a, b) => b.localeCompare(a, 'es', { sensitivity: 'base' }))
        break
      case 'short':
        caracteristicas.sort((a, b) => a.length - b.length)
        break
      case 'long':
        caracteristicas.sort((a, b) => b.length - a.length)
        break
    }
    
    updateCaracteristicasPaquete(nombrePaquete, caracteristicas)
    setMenuOrdenarAbierto(null) // Cerrar menú después de ordenar
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Importar características desde otro paquete
  // ═══════════════════════════════════════════════════════════════
  
  // Obtener paquetes que tienen características (para el dropdown)
  const getPaquetesConCaracteristicas = (excluirPaquete: string): string[] => {
    return paquetesSnapshot
      .filter(p => p.nombre !== excluirPaquete)
      .filter(p => (data.caracteristicasPorPaquete?.[p.nombre]?.length || 0) > 0)
      .map(p => p.nombre)
  }

  // Abrir diálogo de confirmación para importar
  const handleImportarClick = (paqueteDestino: string) => {
    const paqueteOrigen = paqueteImportarDesde[paqueteDestino]
    if (!paqueteOrigen) return

    const caracteristicasDestino = getCaracteristicasPaquete(paqueteDestino)
    const tieneCaracteristicas = caracteristicasDestino.length > 0

    setDialogoConfig({
      titulo: tieneCaracteristicas ? '¿Cómo deseas importar?' : 'Confirmar importación',
      mensaje: tieneCaracteristicas 
        ? `El paquete "${paqueteDestino}" ya tiene ${caracteristicasDestino.length} característica(s). ¿Deseas reemplazarlas o agregarlas a las existentes?`
        : `Se importarán las características del paquete "${paqueteOrigen}" al paquete "${paqueteDestino}".`,
      tipo: tieneCaracteristicas ? 'warning' : 'info',
      paqueteDestino,
      paqueteOrigen,
    })
    setDialogoAbierto(true)
  }

  // Ejecutar la importación
  const ejecutarImportacion = (modo: 'reemplazar' | 'agregar') => {
    if (!dialogoConfig) return

    const { paqueteDestino, paqueteOrigen } = dialogoConfig
    const caracteristicasOrigen = getCaracteristicasPaquete(paqueteOrigen)
    const caracteristicasDestino = getCaracteristicasPaquete(paqueteDestino)

    let nuevasCaracteristicas: string[]
    if (modo === 'reemplazar') {
      nuevasCaracteristicas = [...caracteristicasOrigen]
    } else {
      // Agregar solo las que no existen
      const existentes = new Set(caracteristicasDestino.map(c => c.toLowerCase()))
      const nuevas = caracteristicasOrigen.filter(c => !existentes.has(c.toLowerCase()))
      nuevasCaracteristicas = [...caracteristicasDestino, ...nuevas]
    }

    updateCaracteristicasPaquete(paqueteDestino, nuevasCaracteristicas)
    
    // Limpiar estados
    setDialogoAbierto(false)
    setDialogoConfig(null)
    setPaqueteImportarDesde(prev => ({ ...prev, [paqueteDestino]: '' }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header Principal con ContentHeader */}
      <ContentHeader
        title="Características por Paquete"
        subtitle="Configura las características incluidas en cada paquete"
        icon={Package}
        statusIndicator={updatedAt ? 'guardado' : 'sin-modificar'}
        updatedAt={updatedAt}
        badge={`${paquetesSnapshot.length} paquete${paquetesSnapshot.length !== 1 ? 's' : ''}`}
      />

      {/* Título, Subtítulo y Nota Importante */}
      <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg space-y-4">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 -m-4 mb-4">
          <h5 className="text-xs font-medium text-gh-text">Presentación de la sección</h5>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
            <input
              type="text"
              value={data.titulo}
              onChange={(e) => onChange({ ...data, titulo: e.target.value })}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-info focus:ring-1 focus:ring-gh-info/50 focus:outline-none transition-colors"
              placeholder="Paquetes Disponibles"
            />
          </div>
          <div>
            <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
            <input
              type="text"
              value={data.subtitulo}
              onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-info focus:ring-1 focus:ring-gh-info/50 focus:outline-none transition-colors"
              placeholder="Características incluidas en cada paquete"
            />
          </div>
        </div>

        <div>
          <label className="block text-gh-text-muted text-xs mb-1">Nota Importante</label>
          <textarea
            value={data.notaImportante}
            onChange={(e) => onChange({ ...data, notaImportante: e.target.value })}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-info focus:ring-1 focus:ring-gh-info/50 focus:outline-none transition-colors resize-y min-h-[60px]"
            rows={2}
            placeholder="Los precios pueden variar según requerimientos específicos..."
          />
        </div>
      </div>

      {/* Info de contexto */}
      <div className="p-3 bg-gh-info/10 border border-gh-info/30 rounded-md">
        <p className="text-xs text-gh-text-muted">
          <strong className="text-gh-info">ℹ️ Info:</strong> Los datos de cada oferta (nombre, tagline, tiempo de entrega, servicios y precios) 
          se cargan automáticamente desde los <strong>Snapshots</strong>. Aquí solo puedes editar las <strong>características incluidas</strong> que 
          se mostrarán en la página pública.
        </p>
      </div>

      {/* Lista de Características Incluidas */}
      <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 -m-4 mb-4">
          <h5 className="text-xs font-medium text-gh-text">
            Características Incluidas ({paquetesSnapshot.length})
          </h5>
        </div>

        {(loadingSnapshots || !isDataReady) ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={`skeleton-paq-${i}`} className="p-4 bg-gh-bg-tertiary border border-gh-border/30 rounded-md animate-pulse">
                <div className="h-5 w-32 bg-gh-bg-secondary rounded mb-3"></div>
                <div className="h-4 w-48 bg-gh-bg-secondary rounded mb-2"></div>
                <div className="h-4 w-24 bg-gh-bg-secondary rounded"></div>
              </div>
            ))}
          </div>
        ) : paquetesSnapshot.length === 0 ? (
          <div className="p-4 bg-gh-warning/10 border border-gh-warning/30 rounded-md text-center">
            <p className="text-sm text-gh-warning">No hay paquetes activos configurados.</p>
            <p className="text-xs text-gh-text-muted mt-1">Ve a la sección &quot;Paquetes&quot; para crear o activar paquetes.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensorsPaquetes}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOverCaracteristica}
            onDragEnd={handleDragEndPaquetes}
          >
            <SortableContext items={paqueteIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {paquetesOrdenados.map((paq) => {
                  const paqCaracteristicas = toCaracteristicaItems(paq.nombre, data.caracteristicasPorPaquete?.[paq.nombre] || [])
                  return (
                    <SortablePaqueteCard
                      key={paq.id}
                      paq={paq}
                      caracteristicasItems={paqCaracteristicas}
                      onUpdateCaracteristica={handleUpdateCaracteristica}
                      onRemoveCaracteristica={handleRemoveCaracteristica}
                      onAddCaracteristica={handleAddCaracteristica}
                      getPaquetesConCaracteristicas={getPaquetesConCaracteristicas}
                      paqueteImportarDesde={paqueteImportarDesde}
                      setPaqueteImportarDesde={setPaqueteImportarDesde}
                      handleImportarClick={handleImportarClick}
                      menuOrdenarAbierto={menuOrdenarAbierto}
                      setMenuOrdenarAbierto={setMenuOrdenarAbierto}
                      menuOrdenarRef={menuOrdenarRef}
                      sortCaracteristicas={sortCaracteristicas}
                      isExpanded={expandedPaquetes[paq.id] ?? true}
                      onToggleExpand={handleToggleExpand}
                      isOverPaquete={overPaquete === paq.nombre}
                      getCaracteristicasPaquete={getCaracteristicasPaquete}
                    />
                  )
                })}
              </div>
            </SortableContext>
            
            {/* Overlay para mostrar el item que se está arrastrando */}
            <DragOverlay>
              {activeCaracteristica ? (
                <div className="flex gap-3 items-center p-3 bg-gh-bg-secondary border-2 border-gh-info rounded-lg shadow-2xl opacity-95">
                  <div className="p-2 text-gh-info"><GripVertical className="w-3.5 h-3.5" /></div>
                  <span className="text-xs font-medium text-gh-text">{activeCaracteristica.texto}</span>
                </div>
              ) : activePaquete ? (
                <div className="bg-gh-bg-secondary border-2 border-gh-info rounded-xl shadow-2xl opacity-95 w-80">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gh-border">
                    <div className="p-1.5 text-gh-info"><GripVertical className="w-3 h-3" /></div>
                    <span className="text-lg">{activePaquete.emoji}</span>
                    <h5 className="text-sm font-bold text-gh-text">{activePaquete.nombre}</h5>
                    {activePaquete.tiempoEntrega && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-gh-info">
                        <Clock className="w-3 h-3" /> {activePaquete.tiempoEntrega}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-gh-border">
                    <div className="py-2 px-3 text-center">
                      <p className="text-[10px] text-gh-text-muted">Pago Inicial</p>
                      <p className="text-sm font-bold text-gh-text">${activePaquete.costoInicial.toLocaleString('en-US')}</p>
                    </div>
                    <div className="py-2 px-3 text-center">
                      <p className="text-[10px] text-gh-text-muted">Primer Año</p>
                      <p className="text-sm font-bold text-gh-info">${activePaquete.costoAnio1.toLocaleString('en-US')}</p>
                    </div>
                    <div className="py-2 px-3 text-center">
                      <p className="text-[10px] text-gh-text-muted">Desarrollo</p>
                      <p className="text-sm font-bold text-gh-accent">${activePaquete.desarrollo.toLocaleString('en-US')}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Diálogo de confirmación para importar características */}
      <DialogoGenerico
        isOpen={dialogoAbierto}
        onClose={() => {
          setDialogoAbierto(false)
          setDialogoConfig(null)
        }}
        title={dialogoConfig?.titulo || 'Importar características'}
        type={dialogoConfig?.tipo === 'warning' ? 'warning' : 'info'}
        size="sm"
        variant="premium"
        footer={
          dialogoConfig?.tipo === 'warning' ? (
            // Si tiene características existentes, mostrar opciones
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setDialogoAbierto(false)
                  setDialogoConfig(null)
                }}
                className="flex-1 px-3 py-2 bg-gh-bg-tertiary hover:bg-gh-border text-gh-text-muted rounded-md transition-colors text-sm font-medium border border-gh-border"
              >
                Cancelar
              </button>
              <button
                onClick={() => ejecutarImportacion('agregar')}
                className="flex-1 px-3 py-2 bg-gh-info/20 hover:bg-gh-info/30 text-gh-info rounded-md transition-colors text-sm font-medium border border-gh-info/30"
              >
                Agregar
              </button>
              <button
                onClick={() => ejecutarImportacion('reemplazar')}
                className="flex-1 px-3 py-2 bg-gh-warning/20 hover:bg-gh-warning/30 text-gh-warning rounded-md transition-colors text-sm font-medium border border-gh-warning/30"
              >
                Reemplazar
              </button>
            </div>
          ) : (
            // Si no tiene características, solo confirmar
            <div className="flex gap-2 w-full justify-end">
              <button
                onClick={() => {
                  setDialogoAbierto(false)
                  setDialogoConfig(null)
                }}
                className="px-4 py-2 bg-gh-bg-tertiary hover:bg-gh-border text-gh-text-muted rounded-md transition-colors text-sm font-medium border border-gh-border"
              >
                Cancelar
              </button>
              <button
                onClick={() => ejecutarImportacion('reemplazar')}
                className="px-4 py-2 bg-gh-success/20 hover:bg-gh-success/30 text-gh-success rounded-md transition-colors text-sm font-medium border border-gh-success/30"
              >
                Importar
              </button>
            </div>
          )
        }
      >
        <p className="text-xs font-medium text-gh-text-muted">{dialogoConfig?.mensaje}</p>
      </DialogoGenerico>
    </motion.div>
  )
}


