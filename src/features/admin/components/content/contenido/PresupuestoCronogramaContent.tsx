'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaDollarSign, FaClock, FaBox, FaSort, FaFileImport, FaGripVertical } from 'react-icons/fa'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ContentHeader from './ContentHeader'
import ArrayFieldGH from './ArrayFieldGH'
import ArrayFieldDraggable from './ArrayFieldDraggable'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import DialogoGenerico from '@/features/admin/components/DialogoGenerico'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import { getPaquetesDesglose } from '@/lib/utils/priceRangeCalculator'
import type { SeccionesColapsadasConfig } from '@/lib/types'

// Tipos para Presupuesto y Cronograma
export interface RangoPresupuesto {
  paquete: string
  rangoMin: number
  rangoMax: number
  descripcion: string
  caracteristicas: string[]
}

export interface MetodoPago {
  nombre: string
  porcentaje?: number
  descripcion: string
}

export interface FaseCronograma {
  nombre: string
  duracionDias: number
  descripcion: string
  entregables: string[]
}

export interface PresupuestoCronogramaData {
  titulo: string
  subtitulo: string
  presupuesto: {
    visible: boolean
    titulo: string
    descripcion: string
    rangos: RangoPresupuesto[]
    notaImportante: string
  }
  metodosPago: {
    visible: boolean
    titulo: string
    opciones: MetodoPago[]
  }
  cronograma: {
    visible: boolean
    titulo: string
    descripcion: string
    duracionTotal: string
    fases: FaseCronograma[]
  }
  /** Características editables por paquete (clave = nombre del paquete desde snapshots) */
  caracteristicasPorPaquete?: {
    [nombrePaquete: string]: string[]
  }
  /** Orden personalizado de paquetes (array de IDs) */
  ordenPaquetes?: string[]
}

interface PresupuestoCronogramaContentProps {
  readonly data: PresupuestoCronogramaData
  readonly onChange: (data: PresupuestoCronogramaData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
  readonly seccionesColapsadas: SeccionesColapsadasConfig
  readonly onSeccionColapsadaChange: (key: string, isExpanded: boolean) => void
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
  serviciosBase: Array<{ nombre: string; precio: number; mesesPago: number }>
  serviciosOpcionales: Array<{ nombre: string; precio: number; mesesPago?: number }>
}

// Props para el componente de paquete arrastrable
interface SortablePaqueteCardProps {
  readonly paq: PaqueteDesglose
  readonly getCaracteristicasPaquete: (nombre: string) => string[]
  readonly updateCaracteristicasPaquete: (nombre: string, items: string[]) => void
  readonly getPaquetesConCaracteristicas: (excluir: string) => string[]
  readonly paqueteImportarDesde: { [key: string]: string }
  readonly setPaqueteImportarDesde: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  readonly handleImportarClick: (nombre: string) => void
  readonly menuOrdenarAbierto: string | null
  readonly setMenuOrdenarAbierto: React.Dispatch<React.SetStateAction<string | null>>
  readonly menuOrdenarRef: React.RefObject<HTMLDivElement | null>
  readonly sortCaracteristicas: (nombre: string, tipo: 'az' | 'za' | 'short' | 'long') => void
}

// Componente de tarjeta de paquete arrastrable
function SortablePaqueteCard({
  paq,
  getCaracteristicasPaquete,
  updateCaracteristicasPaquete,
  getPaquetesConCaracteristicas,
  paqueteImportarDesde,
  setPaqueteImportarDesde,
  handleImportarClick,
  menuOrdenarAbierto,
  setMenuOrdenarAbierto,
  menuOrdenarRef,
  sortCaracteristicas,
}: SortablePaqueteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: paq.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-gh-bg-tertiary border border-gh-border rounded-md ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      {/* Header del paquete con handle de arrastre */}
      <div className="flex items-start gap-3 mb-4">
        {/* Handle de arrastre */}
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="mt-1 p-1.5 text-gh-text-muted hover:text-gh-text cursor-grab active:cursor-grabbing transition-colors rounded hover:bg-gh-bg-secondary"
          title="Arrastrar para reordenar paquete"
        >
          <FaGripVertical size={14} />
        </button>

        <div className="flex-1 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{paq.emoji}</span>
              <span className="text-sm font-semibold text-gh-text">{paq.nombre}</span>
            </div>
            {paq.tagline && (
              <p className="text-xs text-gh-text-muted italic">&quot;{paq.tagline}&quot;</p>
            )}
            {paq.tiempoEntrega && (
              <p className="text-xs text-gh-text-muted mt-1">
                <FaClock className="inline mr-1" /> {paq.tiempoEntrega}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gh-success">${paq.desarrollo.toLocaleString()}</p>
            <p className="text-xs text-gh-text-muted">Desarrollo</p>
          </div>
        </div>
      </div>

      {/* Servicios Base (solo lectura) */}
      {paq.serviciosBase.length > 0 && (
        <div className="mb-3 p-2 bg-gh-bg-secondary/50 rounded">
          <p className="text-xs font-medium text-gh-text-muted mb-2">Servicios Base:</p>
          <div className="flex flex-wrap gap-2">
            {paq.serviciosBase.map((srv) => (
              <span key={srv.nombre} className="text-xs bg-gh-bg-tertiary px-2 py-1 rounded text-gh-text">
                {srv.nombre}: ${srv.precio}/mes ({srv.mesesPago}m)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Servicios Opcionales (solo lectura) */}
      {paq.serviciosOpcionales.length > 0 && (
        <div className="mb-3 p-2 bg-gh-bg-secondary/50 rounded">
          <p className="text-xs font-medium text-gh-text-muted mb-2">Servicios Opcionales:</p>
          <div className="flex flex-wrap gap-2">
            {paq.serviciosOpcionales.map((srv) => (
              <span key={srv.nombre} className="text-xs bg-gh-warning/20 px-2 py-1 rounded text-gh-text">
                {srv.nombre}: ${srv.precio}{srv.mesesPago ? `/mes (${srv.mesesPago}m)` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Costo Total (solo lectura) */}
      <div className="mb-4 p-2 bg-gh-success/10 border border-gh-success/30 rounded flex justify-between items-center">
        <span className="text-xs text-gh-text-muted">Total Inicial:</span>
        <span className="text-sm font-bold text-gh-success">${paq.costoInicial.toLocaleString()}</span>
      </div>

      {/* Características Incluidas (EDITABLE con drag & drop) */}
      <div className="border-t border-gh-border pt-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-xs font-medium text-gh-text-muted">✏️ Características Incluidas (arrastrables)</span>
          
          {/* Controles: Importar + Ordenar */}
          <div className="flex items-center gap-2">
            {/* Dropdown Importar desde otro paquete */}
            {getPaquetesConCaracteristicas(paq.nombre).length > 0 && (
              <div className="flex items-center gap-1">
                <select
                  value={paqueteImportarDesde[paq.nombre] || ''}
                  onChange={(e) => setPaqueteImportarDesde(prev => ({ ...prev, [paq.nombre]: e.target.value }))}
                  className="px-2 py-1 text-xs bg-gh-bg-secondary border border-gh-border rounded text-gh-text-muted focus:outline-none focus:border-gh-info cursor-pointer"
                >
                  <option value="">Importar desde...</option>
                  {getPaquetesConCaracteristicas(paq.nombre).map(nombrePaq => (
                    <option key={nombrePaq} value={nombrePaq}>
                      {nombrePaq} ({getCaracteristicasPaquete(nombrePaq).length})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleImportarClick(paq.nombre)}
                  disabled={!paqueteImportarDesde[paq.nombre]}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    paqueteImportarDesde[paq.nombre]
                      ? 'bg-gh-info/20 border border-gh-info/30 text-gh-info hover:bg-gh-info/30'
                      : 'bg-gh-bg-secondary border border-gh-border text-gh-text-muted opacity-50 cursor-not-allowed'
                  }`}
                  title="Importar características"
                >
                  <FaFileImport className="text-xs" />
                </button>
              </div>
            )}

            {/* Botón Ordenar (ahora con click) */}
            {getCaracteristicasPaquete(paq.nombre).length > 1 && (
              <div className="relative" ref={menuOrdenarAbierto === paq.nombre ? menuOrdenarRef : null}>
                <button
                  onClick={() => setMenuOrdenarAbierto(menuOrdenarAbierto === paq.nombre ? null : paq.nombre)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs border rounded transition-colors ${
                    menuOrdenarAbierto === paq.nombre
                      ? 'bg-gh-bg-tertiary border-gh-border-hover text-gh-text'
                      : 'bg-gh-bg-secondary border-gh-border text-gh-text-muted hover:bg-gh-bg-tertiary'
                  }`}
                >
                  <FaSort className="text-xs" /> Ordenar
                </button>
                {menuOrdenarAbierto === paq.nombre && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-gh-bg-secondary border border-gh-border rounded-md shadow-lg z-10">
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'az')}
                      className="w-full px-3 py-2 text-left text-xs text-gh-text hover:bg-gh-bg-tertiary transition-colors"
                    >
                      🔤 Alfabético A-Z
                    </button>
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'za')}
                      className="w-full px-3 py-2 text-left text-xs text-gh-text hover:bg-gh-bg-tertiary transition-colors"
                    >
                      🔤 Alfabético Z-A
                    </button>
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'short')}
                      className="w-full px-3 py-2 text-left text-xs text-gh-text hover:bg-gh-bg-tertiary transition-colors border-t border-gh-border"
                    >
                      📏 Corto → Largo
                    </button>
                    <button
                      onClick={() => sortCaracteristicas(paq.nombre, 'long')}
                      className="w-full px-3 py-2 text-left text-xs text-gh-text hover:bg-gh-bg-tertiary transition-colors"
                    >
                      📏 Largo → Corto
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <ArrayFieldDraggable
          label=""
          items={getCaracteristicasPaquete(paq.nombre)}
          onChange={(items) => updateCaracteristicasPaquete(paq.nombre, items)}
          placeholder="Ej: Diseño responsive, SEO básico..."
        />
      </div>
    </div>
  )
}

// Datos por defecto
export const defaultPresupuestoCronograma: PresupuestoCronogramaData = {
  titulo: 'Presupuesto y Cronograma',
  subtitulo: 'Inversión y tiempos de desarrollo',
  presupuesto: {
    visible: true,
    titulo: 'Rangos de Presupuesto',
    descripcion: 'Ofrecemos diferentes paquetes adaptados a las necesidades de cada cliente',
    rangos: [
      {
        paquete: 'Básico',
        rangoMin: 500,
        rangoMax: 1000,
        descripcion: 'Ideal para emprendedores y pequeñas empresas',
        caracteristicas: ['Hasta 5 páginas', 'Diseño responsive', 'SEO básico', 'Formulario de contacto'],
      },
      {
        paquete: 'Profesional',
        rangoMin: 1000,
        rangoMax: 2500,
        descripcion: 'Para empresas en crecimiento',
        caracteristicas: ['Hasta 15 páginas', 'Panel de administración', 'Blog integrado', 'Optimización SEO avanzada'],
      },
      {
        paquete: 'Enterprise',
        rangoMin: 2500,
        rangoMax: 5000,
        descripcion: 'Soluciones corporativas completas',
        caracteristicas: ['Páginas ilimitadas', 'E-commerce', 'Integraciones personalizadas', 'Soporte prioritario'],
      },
    ],
    notaImportante: 'Los precios pueden variar según requerimientos específicos. Se entregará cotización formal después de evaluar el proyecto.',
  },
  metodosPago: {
    visible: true,
    titulo: 'Métodos de Pago',
    opciones: [
      { nombre: 'Anticipo', porcentaje: 50, descripcion: 'Al iniciar el proyecto' },
      { nombre: 'Entrega', porcentaje: 50, descripcion: 'Al finalizar y aprobar el proyecto' },
      { nombre: 'Transferencia bancaria', descripcion: 'Nacional e internacional' },
      { nombre: 'Efectivo', descripcion: 'Pagos presenciales' },
    ],
  },
  cronograma: {
    visible: true,
    titulo: 'Cronograma de Desarrollo',
    descripcion: 'Proceso estructurado para garantizar entregas de calidad',
    duracionTotal: '4-8 semanas según complejidad',
    fases: [
      {
        nombre: 'Descubrimiento y Planificación',
        duracionDias: 5,
        descripcion: 'Análisis de requisitos y definición del alcance',
        entregables: ['Documento de especificaciones', 'Wireframes', 'Plan de proyecto'],
      },
      {
        nombre: 'Diseño',
        duracionDias: 7,
        descripcion: 'Creación del diseño visual y experiencia de usuario',
        entregables: ['Mockups', 'Guía de estilos', 'Prototipo interactivo'],
      },
      {
        nombre: 'Desarrollo',
        duracionDias: 14,
        descripcion: 'Implementación del código y funcionalidades',
        entregables: ['Sitio funcional', 'Panel de administración', 'Integraciones'],
      },
      {
        nombre: 'Pruebas y Lanzamiento',
        duracionDias: 5,
        descripcion: 'Testing, ajustes finales y despliegue',
        entregables: ['Sitio en producción', 'Documentación', 'Capacitación'],
      },
    ],
  },
  // Características por paquete (se editan aquí, se combinan con datos de snapshots en página pública)
  caracteristicasPorPaquete: {},
}

export default function PresupuestoCronogramaContent({
  data,
  onChange,
  visible,
  onVisibleChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges,
  seccionesColapsadas,
  onSeccionColapsadaChange,
}: PresupuestoCronogramaContentProps) {
  // Cargar paquetes desde snapshots
  const { snapshots, loading: loadingSnapshots } = useSnapshots()
  const paquetesSnapshot = getPaquetesDesglose(snapshots)

  // ═══════════════════════════════════════════════════════════════
  // Estados para menú ordenar (click) y diálogo de importación
  // ═══════════════════════════════════════════════════════════════
  const [menuOrdenarAbierto, setMenuOrdenarAbierto] = useState<string | null>(null)
  const [paqueteImportarDesde, setPaqueteImportarDesde] = useState<{ [key: string]: string }>({})
  const menuOrdenarRef = useRef<HTMLDivElement>(null)
  
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

  const handleDragEndPaquetes = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = paqueteIds.indexOf(active.id as string)
      const newIndex = paqueteIds.indexOf(over.id as string)
      const nuevoOrden = arrayMove(paqueteIds, oldIndex, newIndex)
      onChange({
        ...data,
        ordenPaquetes: nuevoOrden,
      })
    }
  }

  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    presupuesto: seccionesColapsadas.presupuesto_presupuesto ?? true,
    paquetesDinamicos: seccionesColapsadas.presupuesto_paquetesDinamicos ?? true,
    metodosPago: seccionesColapsadas.presupuesto_metodosPago ?? false,
    cronograma: seccionesColapsadas.presupuesto_cronograma ?? false,
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`presupuesto_${section}`, newValue)
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

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Rangos de Presupuesto (legacy/manual)
  // ═══════════════════════════════════════════════════════════════
  const addRango = () => {
    const newRango: RangoPresupuesto = {
      paquete: 'Nuevo Paquete',
      rangoMin: 0,
      rangoMax: 0,
      descripcion: '',
      caracteristicas: [],
    }
    onChange({
      ...data,
      presupuesto: {
        ...data.presupuesto,
        rangos: [...data.presupuesto.rangos, newRango],
      },
    })
  }

  const updateRango = (index: number, field: keyof RangoPresupuesto, value: string | number | string[]) => {
    const newRangos = [...data.presupuesto.rangos]
    newRangos[index] = { ...newRangos[index], [field]: value }
    onChange({
      ...data,
      presupuesto: { ...data.presupuesto, rangos: newRangos },
    })
  }

  const removeRango = (index: number) => {
    onChange({
      ...data,
      presupuesto: {
        ...data.presupuesto,
        rangos: data.presupuesto.rangos.filter((_, i) => i !== index),
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Métodos de Pago
  // ═══════════════════════════════════════════════════════════════
  const addMetodoPago = () => {
    const newMetodo: MetodoPago = {
      nombre: 'Nuevo método',
      descripcion: '',
    }
    onChange({
      ...data,
      metodosPago: {
        ...data.metodosPago,
        opciones: [...data.metodosPago.opciones, newMetodo],
      },
    })
  }

  const updateMetodoPago = (index: number, field: keyof MetodoPago, value: string | number | undefined) => {
    const newOpciones = [...data.metodosPago.opciones]
    newOpciones[index] = { ...newOpciones[index], [field]: value }
    onChange({
      ...data,
      metodosPago: { ...data.metodosPago, opciones: newOpciones },
    })
  }

  const removeMetodoPago = (index: number) => {
    onChange({
      ...data,
      metodosPago: {
        ...data.metodosPago,
        opciones: data.metodosPago.opciones.filter((_, i) => i !== index),
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Fases del Cronograma
  // ═══════════════════════════════════════════════════════════════
  const addFase = () => {
    const newFase: FaseCronograma = {
      nombre: 'Nueva Fase',
      duracionDias: 7,
      descripcion: '',
      entregables: [],
    }
    onChange({
      ...data,
      cronograma: {
        ...data.cronograma,
        fases: [...data.cronograma.fases, newFase],
      },
    })
  }

  const updateFase = (index: number, field: keyof FaseCronograma, value: string | number | string[]) => {
    const newFases = [...data.cronograma.fases]
    newFases[index] = { ...newFases[index], [field]: value }
    onChange({
      ...data,
      cronograma: { ...data.cronograma, fases: newFases },
    })
  }

  const removeFase = (index: number) => {
    onChange({
      ...data,
      cronograma: {
        ...data.cronograma,
        fases: data.cronograma.fases.filter((_, i) => i !== index),
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader
        title="Presupuesto y Cronograma"
        icon={<FaCalendarAlt className="text-gh-warning" />}
        updatedAt={updatedAt}
        onGuardar={onGuardar}
        onReset={onReset}
        guardando={guardando}
        hasChanges={hasChanges}
      />

      {/* Toggle de visibilidad global - Fila 2 */}
      <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border rounded-lg">
        <span className="text-sm text-gh-text">Mostrar sección en la página pública</span>
        <ToggleSwitch enabled={visible} onChange={onVisibleChange} />
      </div>

      {/* Contenedor con opacity si global OFF */}
      <div className={`space-y-4 transition-opacity duration-200 ${!visible ? 'opacity-50' : ''}`}>
        
        {/* Subsección: Títulos */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={data.titulo}
                onChange={(e) => onChange({ ...data, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PRESUPUESTO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('presupuesto')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                <FaDollarSign className="text-gh-success" /> Rangos de Presupuesto
              </span>
              {expandedSections.presupuesto ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.presupuesto.visible}
              onChange={(v) => onChange({ ...data, presupuesto: { ...data.presupuesto, visible: v } })}
            />
          </div>

          {expandedSections.presupuesto && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={data.presupuesto.titulo}
                    onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.presupuesto.descripcion}
                    onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Rangos */}
              {data.presupuesto.rangos.map((rango, index) => (
                <div key={`rango-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gh-text">{rango.paquete}</span>
                    <button
                      onClick={() => removeRango(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre del paquete</label>
                      <input
                        type="text"
                        value={rango.paquete}
                        onChange={(e) => updateRango(index, 'paquete', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Mínimo ($)</label>
                      <input
                        type="number"
                        value={rango.rangoMin}
                        onChange={(e) => updateRango(index, 'rangoMin', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Máximo ($)</label>
                      <input
                        type="number"
                        value={rango.rangoMax}
                        onChange={(e) => updateRango(index, 'rangoMax', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <input
                      type="text"
                      value={rango.descripcion}
                      onChange={(e) => updateRango(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                    />
                  </div>
                  <ArrayFieldGH
                    label="Características incluidas"
                    items={rango.caracteristicas}
                    onChange={(items) => updateRango(index, 'caracteristicas', items)}
                    placeholder="Nueva característica..."
                  />
                </div>
              ))}

              <button
                onClick={addRango}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Rango
              </button>

              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Nota Importante</label>
                <textarea
                  value={data.presupuesto.notaImportante}
                  onChange={(e) => onChange({ ...data, presupuesto: { ...data.presupuesto, notaImportante: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PAQUETES DINÁMICOS (desde Snapshots) - Características Editables */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('paquetesDinamicos')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                <FaBox className="text-gh-accent" /> Paquetes (Características Incluidas)
              </span>
              {expandedSections.paquetesDinamicos ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <span className="text-xs text-gh-text-muted bg-gh-bg-tertiary px-2 py-1 rounded">
              {paquetesSnapshot.length} paquete{paquetesSnapshot.length !== 1 ? 's' : ''} activo{paquetesSnapshot.length !== 1 ? 's' : ''}
            </span>
          </div>

          {expandedSections.paquetesDinamicos && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              {/* Info de contexto */}
              <div className="p-3 bg-gh-info/10 border border-gh-info/30 rounded-md">
                <p className="text-xs text-gh-text-muted">
                  <strong className="text-gh-info">ℹ️ Info:</strong> Los datos de cada paquete (nombre, tagline, tiempo de entrega, servicios y precios) 
                  se cargan automáticamente desde los <strong>Snapshots</strong>. Aquí solo puedes editar las <strong>características incluidas</strong> que 
                  se mostrarán en la página pública.
                </p>
              </div>

              {loadingSnapshots ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={`skeleton-paq-${i}`} className="p-4 bg-gh-bg-tertiary border border-gh-border rounded-md animate-pulse">
                      <div className="h-5 w-32 bg-gh-bg-secondary rounded mb-3"></div>
                      <div className="h-4 w-48 bg-gh-bg-secondary rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gh-bg-secondary rounded"></div>
                    </div>
                  ))}
                </div>
              ) : paquetesSnapshot.length === 0 ? (
                <div className="p-4 bg-gh-warning/10 border border-gh-warning/30 rounded-md text-center">
                  <p className="text-sm text-gh-warning">No hay paquetes activos configurados.</p>
                  <p className="text-xs text-gh-text-muted mt-1">Ve a la pestaña &quot;Paquetes&quot; para crear o activar paquetes.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensorsPaquetes}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndPaquetes}
                >
                  <SortableContext items={paqueteIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {paquetesOrdenados.map((paq) => (
                        <SortablePaqueteCard
                          key={paq.id}
                          paq={paq}
                          getCaracteristicasPaquete={getCaracteristicasPaquete}
                          updateCaracteristicasPaquete={updateCaracteristicasPaquete}
                          getPaquetesConCaracteristicas={getPaquetesConCaracteristicas}
                          paqueteImportarDesde={paqueteImportarDesde}
                          setPaqueteImportarDesde={setPaqueteImportarDesde}
                          handleImportarClick={handleImportarClick}
                          menuOrdenarAbierto={menuOrdenarAbierto}
                          setMenuOrdenarAbierto={setMenuOrdenarAbierto}
                          menuOrdenarRef={menuOrdenarRef}
                          sortCaracteristicas={sortCaracteristicas}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MÉTODOS DE PAGO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('metodosPago')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                💳 Métodos de Pago
              </span>
              {expandedSections.metodosPago ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.metodosPago.visible}
              onChange={(v) => onChange({ ...data, metodosPago: { ...data.metodosPago, visible: v } })}
            />
          </div>

          {expandedSections.metodosPago && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                <input
                  type="text"
                  value={data.metodosPago.titulo}
                  onChange={(e) => onChange({ ...data, metodosPago: { ...data.metodosPago, titulo: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                />
              </div>

              {data.metodosPago.opciones.map((metodo, index) => (
                <div key={`metodo-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gh-text">{metodo.nombre}</span>
                    <button
                      onClick={() => removeMetodoPago(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-[1.1fr_0.6fr_3fr] gap-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre</label>
                      <input
                        type="text"
                        value={metodo.nombre}
                        onChange={(e) => updateMetodoPago(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Porcentaje (%)</label>
                      <input
                        type="number"
                        value={metodo.porcentaje ?? ''}
                        onChange={(e) => updateMetodoPago(index, 'porcentaje', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                        placeholder="Opcional"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                      <input
                        type="text"
                        value={metodo.descripcion}
                        onChange={(e) => updateMetodoPago(index, 'descripcion', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addMetodoPago}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Método
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CRONOGRAMA */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('cronograma')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                <FaClock className="text-gh-info" /> Cronograma de Desarrollo
              </span>
              {expandedSections.cronograma ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.cronograma.visible}
              onChange={(v) => onChange({ ...data, cronograma: { ...data.cronograma, visible: v } })}
            />
          </div>

          {expandedSections.cronograma && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={data.cronograma.titulo}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.cronograma.descripcion}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Duración Total</label>
                  <input
                    type="text"
                    value={data.cronograma.duracionTotal}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, duracionTotal: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Fases */}
              {data.cronograma.fases.map((fase, index) => (
                <div key={`fase-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gh-text">Fase {index + 1}: {fase.nombre}</span>
                    <button
                      onClick={() => removeFase(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre de la fase</label>
                      <input
                        type="text"
                        value={fase.nombre}
                        onChange={(e) => updateFase(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Duración (días)</label>
                      <input
                        type="number"
                        value={fase.duracionDias}
                        onChange={(e) => updateFase(index, 'duracionDias', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <input
                      type="text"
                      value={fase.descripcion}
                      onChange={(e) => updateFase(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                    />
                  </div>
                  <ArrayFieldGH
                    label="Entregables"
                    items={fase.entregables}
                    onChange={(items) => updateFase(index, 'entregables', items)}
                    placeholder="Nuevo entregable..."
                  />
                </div>
              ))}

              <button
                onClick={addFase}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Fase
              </button>
            </div>
          )}
        </div>

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
        <p className="text-sm text-gh-text-muted">{dialogoConfig?.mensaje}</p>
      </DialogoGenerico>
    </motion.div>
  )
}
