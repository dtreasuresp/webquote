'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaClipboardList, FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaImage, FaUpload, FaLink, FaSpinner, FaCheck, FaPalette } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ArrayFieldGH from './ArrayFieldGH'
import ToggleSwitch from '@/components/admin/shared/ToggleSwitch'
import ColorPickerInput from '@/components/admin/shared/ColorPickerInput'
import DialogoGenerico, { DialogTab } from '@/features/admin/components/DialogoGenerico'
import { getColorLabel, sortColorsByFrequency } from '@/lib/utils/colorSystem'
// @ts-expect-error - colorthief no tiene tipos
import ColorThief from 'colorthief'

// Tipos para el contenido de Análisis de Requisitos
export interface InformacionCliente {
  empresa: string
  sector: string
  ubicacion: string
  trayectoria: string
}

export interface PropuestaValor {
  descripcionNegocio: string[]
  mision: string
  publicoObjetivo: string[]
}

export interface IdentidadVisual {
  logoCorporativo?: string // Base64 del logo importado
  logoFileName?: string // Nombre del archivo del logo
  coloresCorporativos: Array<{ nombre: string; hex: string }>
  coloresEvitar: Array<{ nombre: string; hex: string }>
  estiloVisual: string
  contenidoDisponible: Array<{ item: string; status: string; note: string }>
}

export interface ObjetivosSitio {
  metasPrincipales: string[]
  accionesEsperadas: string[]
}

export interface EstructuraCatalogo {
  paginasRequeridas: string[]
  cantidadProductos: string
  categoriasPrincipales: string
  fotosPorProducto: string
  infoProducto: string[]
}

export interface Funcionalidades {
  caracteristicas: string[]
  integraciones: string[]
}

export interface AnalisisRequisitosData {
  titulo: string
  subtitulo: string
  informacionCliente: InformacionCliente
  propuestaValor: PropuestaValor
  identidadVisual: IdentidadVisual
  objetivosSitio: ObjetivosSitio
  estructuraCatalogo: EstructuraCatalogo
  funcionalidades: Funcionalidades
}

interface VisibilidadAnalisis {
  informacion: boolean
  propuesta: boolean
  identidad: boolean
  objetivos: boolean
  estructura: boolean
  funcionalidades: boolean
}

interface AnalisisRequisitosContentProps {
  readonly data: AnalisisRequisitosData
  readonly onChange: (data: AnalisisRequisitosData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly visibilidad?: VisibilidadAnalisis
  readonly onVisibilidadChange?: (key: keyof VisibilidadAnalisis, value: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
}

/**
 * Obtiene las clases CSS para el badge de rol de color corporativo
 */
function getColorRoleBadgeClasses(index: number): string {
  switch (index) {
    case 0: return 'bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30' // Primario
    case 1: return 'bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/30' // Secundario
    case 2: return 'bg-[#d29922]/20 text-[#d29922] border border-[#d29922]/30' // Terciario
    default: return 'bg-[#8b949e]/20 text-[#8b949e] border border-[#8b949e]/30' // Alterno
  }
}

// Datos por defecto
export const defaultAnalisisRequisitos: AnalisisRequisitosData = {
  titulo: 'Análisis de Requisitos',
  subtitulo: 'Entendiendo las necesidades de tu proyecto',
  informacionCliente: {
    empresa: 'Urbanísima Constructora S.R.L',
    sector: 'Construcción',
    ubicacion: 'Calle 12/2da y 3ra, No 36, Ampliación de Marbella, Habana del Este, La Habana, Cuba',
    trayectoria: '15 años en el mercado',
  },
  propuestaValor: {
    descripcionNegocio: [
      'Servicios constructivos y de mantenimiento de áreas verdes',
      'Comercialización de materiales de construcción y carpintería',
      'Empresa enfocada en la excelencia',
    ],
    mision: 'Brindar servicios generales de la construcción y satisfacer las necesidades del cliente.',
    publicoObjetivo: [
      'Personas de 18 a 70 años',
      'Ningún género tiene preferencia, ambos acceden por igual',
      'Todos sus clientes tienen oportunidades en Urbanísima Constructora S.R.L',
      'Están ubicados en Marbella, Habana del Este, La Habana, Cuba',
    ],
  },
  identidadVisual: {
    coloresCorporativos: [
      { nombre: 'Rojo', hex: '#DC2626' },
      { nombre: 'Negro', hex: '#000000' },
    ],
    coloresEvitar: [
      { nombre: 'Rosado', hex: '#FFC0CB' },
    ],
    estiloVisual: 'Profesional y Corporativo',
    contenidoDisponible: [
      { item: 'Videos corporativos', status: '✅ Está disponible', note: 'El cliente cuenta con el material' },
      { item: 'Textos/Contenidos', status: 'No Disponible', note: 'Será desarrollados por el nosotros' },
      { item: 'Manual de identidad visual', status: 'No Disponible', note: 'Será creado una versión básica, cuya propiedad será nuestra. Puedes adquirir la versión profesional con un costo adicional' },
    ],
  },
  objetivosSitio: {
    metasPrincipales: [
      'Mostrar el catálogo de productos/servicios que ofreces',
      'Educar a tus clientes sobre el correcto uso de los productos/servicios que ofertas',
      'Informar sobre las novedades de los productos/servicios que ofertas',
      'Establecer credibilidad sobre tu negocio',
    ],
    accionesEsperadas: [
      'Contactarte por WhatsApp',
      'Llamarte por teléfono',
      'Visitar tu establecimiento o negocio',
      'Seguirte a ti y a tu negocio en redes sociales',
      'Suscribirse a noticias por correo',
    ],
  },
  estructuraCatalogo: {
    paginasRequeridas: [
      'Catálogo de Productos/Servicios que ofreces',
      'Galería de Proyectos/Trabajos realizados por tu negocio',
      'Página de Contacto',
      'Ubicación/Cómo Llegar a tu negocio (Google Maps)',
      'Nosotros/Quiénes Somos',
      'Blog/Noticias',
      'Enlaces a Redes Sociales (Facebook, Instagram, YouTube, TikTok, Telegram)',
    ],
    cantidadProductos: '~10 productos',
    categoriasPrincipales: '1 categoría principal',
    fotosPorProducto: '4 fotografías',
    infoProducto: [
      'Nombre',
      'Descripción corta',
      'Descripción detallada',
      'Fotografías (4 por producto)',
      'Especificaciones técnicas',
      'Precio referencial',
      'Disponibilidad',
      'Videos demostrativos',
      'Documentos descargables (fichas técnicas)',
    ],
  },
  funcionalidades: {
    caracteristicas: [
      'Buscador de productos',
      'Filtros por categoría/características',
      'Comparador de productos',
      'Chat vía WhatsApp',
      'Integración con Google Maps',
      'Calendario de eventos/disponibilidad',
    ],
    integraciones: [
      'Facebook (enlace/referencias)',
      'Instagram (enlace/referencias)',
      'YouTube (enlace/referencias)',
      'TikTok (enlace/referencias)',
      'Telegram (enlace/referencias)',
    ],
  },
}

export default function AnalisisRequisitosContent({
  data,
  onChange,
  visible,
  onVisibleChange,
  visibilidad,
  onVisibilidadChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges,
}: AnalisisRequisitosContentProps) {
  const [expandedSections, setExpandedSections] = useState({
    informacion: true,
    propuesta: false,
    identidad: false,
    objetivos: false,
    estructura: false,
    funcionalidades: false,
  })

  // Estados para modales de importación y detección de colores
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isColorDetectionModalOpen, setIsColorDetectionModalOpen] = useState(false)
  const [importedImageForDetection, setImportedImageForDetection] = useState<string | null>(null)

  // Estados para ImportModal inline
  const [isDragging, setIsDragging] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [importPreview, setImportPreview] = useState<string | null>(null)
  const [importFileName, setImportFileName] = useState('')
  const [importIsLoading, setImportIsLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maxSizeMB = 5
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  const acceptedFormats = 'image/png, image/jpeg, image/svg+xml, image/webp'

  // Estados para ColorDetectionModal inline
  interface DetectedColor { hex: string; selected: boolean }
  const [detectedColors, setDetectedColors] = useState<DetectedColor[]>([])
  const [colorDetectionLoading, setColorDetectionLoading] = useState(false)
  const [colorDetectionError, setColorDetectionError] = useState<string | null>(null)

  // Valores por defecto para visibilidad
  const vis = visibilidad || { informacion: true, propuesta: true, identidad: true, objetivos: true, estructura: true, funcionalidades: true }
  const handleVisChange = (key: keyof VisibilidadAnalisis, value: boolean) => {
    if (onVisibilidadChange) onVisibilidadChange(key, value)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // ═══════════════════════════════════════════════════════════════
  // FUNCIONES PARA IMPORT MODAL INLINE
  // ═══════════════════════════════════════════════════════════════
  
  const resetImportState = useCallback(() => {
    setImportPreview(null)
    setImportFileName('')
    setImageUrl('')
    setImportError(null)
    setImportIsLoading(false)
  }, [])

  const handleCloseImportModal = useCallback(() => {
    resetImportState()
    setIsImportModalOpen(false)
  }, [resetImportState])

  const processFile = useCallback((file: File) => {
    setImportError(null)
    if (!file.type.startsWith('image/')) {
      setImportError('Por favor, selecciona un archivo de imagen válido.')
      return
    }
    if (file.size > maxSizeBytes) {
      setImportError(`El archivo excede el tamaño máximo de ${maxSizeMB}MB.`)
      return
    }
    setImportFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setImportPreview(e.target?.result as string)
    reader.onerror = () => setImportError('Error al leer el archivo.')
    reader.readAsDataURL(file)
  }, [maxSizeBytes])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleUrlImport = useCallback(async () => {
    if (!imageUrl.trim()) {
      setImportError('Por favor, ingresa una URL válida.')
      return
    }
    setImportIsLoading(true)
    setImportError(null)
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('No se pudo cargar la imagen.')
      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) throw new Error('La URL no contiene una imagen válida.')
      if (blob.size > maxSizeBytes) throw new Error(`La imagen excede el tamaño máximo de ${maxSizeMB}MB.`)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportPreview(e.target?.result as string)
        setImportFileName(imageUrl.split('/').pop() || 'imagen-importada')
      }
      reader.readAsDataURL(blob)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Error al cargar la imagen desde la URL.')
    } finally {
      setImportIsLoading(false)
    }
  }, [imageUrl, maxSizeBytes])

  // Handler para importar logo (movido aquí para evitar uso antes de declaración)
  const handleLogoImport = useCallback((imageData: string, fileName: string) => {
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        logoCorporativo: imageData,
        logoFileName: fileName,
      },
    })
    // Abrir modal de detección de colores
    setImportedImageForDetection(imageData)
    setIsColorDetectionModalOpen(true)
  }, [data, onChange])

  const handleConfirmImport = useCallback(() => {
    if (importPreview && importFileName) {
      handleLogoImport(importPreview, importFileName)
      handleCloseImportModal()
    }
  }, [importPreview, importFileName, handleLogoImport, handleCloseImportModal])

  // ═══════════════════════════════════════════════════════════════
  // FUNCIONES PARA COLOR DETECTION MODAL INLINE
  // ═══════════════════════════════════════════════════════════════
  
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
  }

  const getColorName = (hex: string): string => {
    const color = hex.toUpperCase()
    const colorNames: Record<string, string> = {
      '#000000': 'Negro', '#FFFFFF': 'Blanco', '#FF0000': 'Rojo',
      '#00FF00': 'Verde', '#0000FF': 'Azul', '#FFFF00': 'Amarillo',
    }
    if (colorNames[color]) return colorNames[color]
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
      if (r < 50) return 'Negro'
      if (r < 100) return 'Gris Oscuro'
      if (r < 180) return 'Gris'
      if (r < 230) return 'Gris Claro'
      return 'Blanco'
    }
    const max = Math.max(r, g, b)
    if (r === max) {
      if (g > 150 && b < 100) return 'Naranja'
      if (g > 100 && b > 100) return 'Rosa'
      if (b > 100) return 'Magenta'
      return 'Rojo'
    }
    if (g === max) {
      if (r > 150) return 'Amarillo Verdoso'
      if (b > 100) return 'Turquesa'
      return 'Verde'
    }
    if (b === max) {
      if (r > 100) return 'Púrpura'
      if (g > 100) return 'Cian'
      return 'Azul'
    }
    return 'Color'
  }

  const getColorRoleBadgeClass = (index: number): string => {
    switch (index) {
      case 0: return 'bg-[#58a6ff]/20 text-[#58a6ff]'
      case 1: return 'bg-[#3fb950]/20 text-[#3fb950]'
      case 2: return 'bg-[#d29922]/20 text-[#d29922]'
      default: return 'bg-[#8b949e]/20 text-[#8b949e]'
    }
  }

  // Detectar colores cuando se abre el modal con una imagen
  useEffect(() => {
    const detectColors = async () => {
      if (!isColorDetectionModalOpen || !importedImageForDetection) return
      setColorDetectionLoading(true)
      setColorDetectionError(null)
      try {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Error al cargar la imagen'))
          img.src = importedImageForDetection
        })
        const colorThief = new ColorThief()
        const palette = colorThief.getPalette(img, 8) as number[][]
        const colorItems = palette.map(([r, g, b], index) => ({
          nombre: getColorName(rgbToHex(r, g, b)),
          hex: rgbToHex(r, g, b),
          count: palette.length - index
        }))
        const sortedColors = sortColorsByFrequency(colorItems)
        setDetectedColors(sortedColors.map(item => ({ hex: item.hex, selected: true })))
      } catch (err) {
        console.error('Error detectando colores:', err)
        setColorDetectionError('No se pudieron detectar los colores de la imagen.')
      } finally {
        setColorDetectionLoading(false)
      }
    }
    detectColors()
  }, [isColorDetectionModalOpen, importedImageForDetection])

  const toggleColorSelection = useCallback((index: number) => {
    setDetectedColors(prev => prev.map((color, i) => i === index ? { ...color, selected: !color.selected } : color))
  }, [])

  const selectAllColors = useCallback(() => {
    setDetectedColors(prev => prev.map(color => ({ ...color, selected: true })))
  }, [])

  const deselectAllColors = useCallback(() => {
    setDetectedColors(prev => prev.map(color => ({ ...color, selected: false })))
  }, [])

  // Handler para confirmar colores detectados (movido aquí para evitar uso antes de declaración)
  const handleColorsConfirm = useCallback((colors: Array<{ nombre: string; hex: string }>, mode: 'add' | 'replace') => {
    if (mode === 'replace') {
      // Sustituir todos los colores existentes
      onChange({
        ...data,
        identidadVisual: {
          ...data.identidadVisual,
          coloresCorporativos: colors,
        },
      })
    } else {
      // Añadir colores detectados a colores corporativos (evitar duplicados)
      const existingHexes = new Set(data.identidadVisual.coloresCorporativos.map(c => c.hex.toUpperCase()))
      const newColors = colors.filter(c => !existingHexes.has(c.hex.toUpperCase()))
      
      if (newColors.length > 0) {
        onChange({
          ...data,
          identidadVisual: {
            ...data.identidadVisual,
            coloresCorporativos: [...data.identidadVisual.coloresCorporativos, ...newColors],
          },
        })
      }
    }
    setImportedImageForDetection(null)
  }, [data, onChange])

  const handleColorAdd = useCallback(() => {
    const selectedColors = detectedColors.filter(c => c.selected).map(c => ({ nombre: getColorName(c.hex), hex: c.hex }))
    handleColorsConfirm(selectedColors, 'add')
    setIsColorDetectionModalOpen(false)
    setImportedImageForDetection(null)
  }, [detectedColors, handleColorsConfirm])

  const handleColorReplace = useCallback(() => {
    const selectedColors = detectedColors.filter(c => c.selected).map(c => ({ nombre: getColorName(c.hex), hex: c.hex }))
    handleColorsConfirm(selectedColors, 'replace')
    setIsColorDetectionModalOpen(false)
    setImportedImageForDetection(null)
  }, [detectedColors, handleColorsConfirm])

  const selectedColorCount = detectedColors.filter(c => c.selected).length
  const hasExistingColors = data.identidadVisual.coloresCorporativos.length > 0

  // Tabs para el modal de importación
  const importTabs: DialogTab[] = useMemo(() => [
    {
      id: 'upload',
      label: 'Subir Archivo',
      icon: FaUpload,
      content: (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-[#238636] bg-[#238636]/10' : 'border-[#30363d] hover:border-[#238636]/50 hover:bg-[#161b22]'}`}
          >
            <input ref={fileInputRef} type="file" accept={acceptedFormats} onChange={handleFileSelect} className="hidden" />
            <FaUpload className={`mx-auto text-3xl mb-3 ${isDragging ? 'text-[#3fb950]' : 'text-[#8b949e]'}`} />
            <p className="text-sm text-[#c9d1d9] font-medium mb-1">
              {isDragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz click para seleccionar'}
            </p>
            <p className="text-xs text-[#8b949e]">PNG, JPG, SVG o WebP (máx. {maxSizeMB}MB)</p>
          </div>
          {importError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded-md">
              <p className="text-sm text-[#f85149]">{importError}</p>
            </motion.div>
          )}
          {importPreview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <p className="text-xs text-[#8b949e] mb-2">Vista previa:</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border border-[#30363d] rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <img src={importPreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#c9d1d9] font-medium truncate">{importFileName}</p>
                  <p className="text-xs text-[#3fb950] flex items-center gap-1 mt-1"><FaCheck /> Imagen cargada correctamente</p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      ),
    },
    {
      id: 'url',
      label: 'Desde URL',
      icon: FaLink,
      content: (
        <>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[#8b949e] mb-2">URL de la imagen</label>
              <div className="flex gap-2">
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/logo.png" className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] focus:border-[#238636] focus:ring-1 focus:ring-[#238636]/50 focus:outline-none" />
                <button onClick={handleUrlImport} disabled={importIsLoading || !imageUrl.trim()} className="px-4 py-2 bg-gradient-to-r from-[#238636] to-[#2ea043] text-white rounded-md text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {importIsLoading ? <FaSpinner className="animate-spin" /> : 'Cargar'}
                </button>
              </div>
            </div>
          </div>
          {importError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded-md">
              <p className="text-sm text-[#f85149]">{importError}</p>
            </motion.div>
          )}
          {importPreview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <p className="text-xs text-[#8b949e] mb-2">Vista previa:</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border border-[#30363d] rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <img src={importPreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#c9d1d9] font-medium truncate">{importFileName}</p>
                  <p className="text-xs text-[#3fb950] flex items-center gap-1 mt-1"><FaCheck /> Imagen cargada correctamente</p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      ),
    },
  ], [isDragging, imageUrl, importIsLoading, importPreview, importFileName, importError, handleDragOver, handleDragLeave, handleDrop, handleFileSelect, handleUrlImport])

  // Handler para eliminar logo
  const handleLogoRemove = useCallback(() => {
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        logoCorporativo: undefined,
        logoFileName: undefined,
      },
    })
  }, [data, onChange])

  // Handlers para colores
  const handleAddColor = (tipo: 'coloresCorporativos' | 'coloresEvitar') => {
    const newColor = { nombre: '', hex: '#000000' }
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        [tipo]: [...data.identidadVisual[tipo], newColor],
      },
    })
  }

  const handleRemoveColor = (tipo: 'coloresCorporativos' | 'coloresEvitar', index: number) => {
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        [tipo]: data.identidadVisual[tipo].filter((_, i) => i !== index),
      },
    })
  }

  const handleUpdateColor = (tipo: 'coloresCorporativos' | 'coloresEvitar', index: number, field: 'nombre' | 'hex', value: string) => {
    const newColors = [...data.identidadVisual[tipo]]
    newColors[index] = { ...newColors[index], [field]: value }
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        [tipo]: newColors,
      },
    })
  }

  // Handler para contenido disponible
  const handleAddContenido = () => {
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        contenidoDisponible: [...data.identidadVisual.contenidoDisponible, { item: '', status: '', note: '' }],
      },
    })
  }

  const handleRemoveContenido = (index: number) => {
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        contenidoDisponible: data.identidadVisual.contenidoDisponible.filter((_, i) => i !== index),
      },
    })
  }

  const handleUpdateContenido = (index: number, field: 'item' | 'status' | 'note', value: string) => {
    const newContenido = [...data.identidadVisual.contenidoDisponible]
    newContenido[index] = { ...newContenido[index], [field]: value }
    onChange({
      ...data,
      identidadVisual: {
        ...data.identidadVisual,
        contenidoDisponible: newContenido,
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
        title="Análisis de Requisitos"
        icon={<FaClipboardList className="text-gh-info" />}
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
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 📌 TÍTULO Y SUBTÍTULO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
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
                placeholder="Análisis de Requisitos"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                placeholder="Entendiendo las necesidades de tu proyecto"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* INFORMACIÓN DEL CLIENTE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.informacion === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('informacion')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                📋 Información General del Cliente
              </span>
              {expandedSections.informacion ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.informacion !== false} 
              onChange={(v) => handleVisChange('informacion', v)}
            />
          </div>

          {expandedSections.informacion && (
            <div className="mt-4 space-y-3 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Empresa</label>
                  <input
                    type="text"
                    value={data.informacionCliente.empresa}
                    onChange={(e) => onChange({ ...data, informacionCliente: { ...data.informacionCliente, empresa: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Sector</label>
                  <input
                    type="text"
                    value={data.informacionCliente.sector}
                    onChange={(e) => onChange({ ...data, informacionCliente: { ...data.informacionCliente, sector: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Ubicación</label>
                <input
                  type="text"
                  value={data.informacionCliente.ubicacion}
                  onChange={(e) => onChange({ ...data, informacionCliente: { ...data.informacionCliente, ubicacion: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Trayectoria</label>
                <input
                  type="text"
                  value={data.informacionCliente.trayectoria}
                  onChange={(e) => onChange({ ...data, informacionCliente: { ...data.informacionCliente, trayectoria: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PROPUESTA DE VALOR */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.propuesta === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('propuesta')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                🎯 Propuesta de Valor y Posicionamiento
              </span>
              {expandedSections.propuesta ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.propuesta !== false} 
              onChange={(v) => handleVisChange('propuesta', v)}
            />
          </div>

          {expandedSections.propuesta && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <ArrayFieldGH
                label="Descripción del negocio"
                items={data.propuestaValor.descripcionNegocio}
                onChange={(items) => onChange({ ...data, propuestaValor: { ...data.propuestaValor, descripcionNegocio: items } })}
                placeholder="Nueva descripción..."
              />
              <div>
                <label className="block text-gh-text-muted text-xs mb-1">Misión</label>
                <textarea
                  value={data.propuestaValor.mision}
                  onChange={(e) => onChange({ ...data, propuestaValor: { ...data.propuestaValor, mision: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                  rows={2}
                />
              </div>
              <ArrayFieldGH
                label="Público objetivo"
                items={data.propuestaValor.publicoObjetivo}
                onChange={(items) => onChange({ ...data, propuestaValor: { ...data.propuestaValor, publicoObjetivo: items } })}
                placeholder="Nuevo segmento..."
              />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* IDENTIDAD VISUAL */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.identidad === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('identidad')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                🎨 Identidad Visual
              </span>
              {expandedSections.identidad ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.identidad !== false} 
              onChange={(v) => handleVisChange('identidad', v)}
            />
          </div>

          {expandedSections.identidad && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              
              {/* Logo Corporativo */}
              <div>
                <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">🖼️ Logo Corporativo</label>
                <div className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                  {data.identidadVisual.logoCorporativo ? (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border border-gh-border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={data.identidadVisual.logoCorporativo}
                          alt="Logo corporativo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gh-text font-medium truncate">
                          {data.identidadVisual.logoFileName || 'Logo'}
                        </p>
                        <p className="text-xs text-gh-text-muted mt-1">Logo importado correctamente</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="px-3 py-1.5 text-xs font-medium text-gh-info bg-gh-info/10 border border-gh-info/30 rounded-md hover:bg-gh-info/20 transition-colors flex items-center gap-1.5"
                          >
                            <FaUpload size={10} /> Cambiar
                          </button>
                          <button
                            onClick={handleLogoRemove}
                            className="px-3 py-1.5 text-xs font-medium text-gh-danger bg-gh-danger/10 border border-gh-danger/30 rounded-md hover:bg-gh-danger/20 transition-colors flex items-center gap-1.5"
                          >
                            <FaTrash size={10} /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FaImage className="mx-auto text-3xl text-gh-text-muted mb-2" />
                      <p className="text-sm text-gh-text-muted mb-3">No hay logo importado</p>
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-4 py-2 text-xs font-medium text-white bg-gh-success rounded-md hover:bg-gh-success/90 transition-colors flex items-center gap-1.5 mx-auto"
                      >
                        <FaUpload size={10} /> Importar Logo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colores Corporativos */}
              <div>
                <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">🎨 Colores Corporativos</label>
                <p className="text-gh-text-muted text-xs mb-3 italic">
                  El orden define la jerarquía: el primer color será el Primario, el segundo el Secundario, etc.
                </p>
                <div className="space-y-2">
                  {data.identidadVisual.coloresCorporativos.map((color, index) => (
                    <div key={`corp-${index}`} className="flex items-center gap-2">
                      {/* Badge de rol de color */}
                      <span className={`
                        text-[10px] px-2 py-1 rounded font-medium min-w-[70px] text-center
                        ${getColorRoleBadgeClasses(index)}
                      `}>
                        {getColorLabel(index)}
                      </span>
                      <ColorPickerInput
                        value={color.hex}
                        onChange={(hex) => handleUpdateColor('coloresCorporativos', index, 'hex', hex)}
                        className="flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={color.nombre}
                        onChange={(e) => handleUpdateColor('coloresCorporativos', index, 'nombre', e.target.value)}
                        placeholder="Nombre del color"
                        className="flex-1 px-3 py-1.5 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                      <button
                        onClick={() => handleRemoveColor('coloresCorporativos', index)}
                        className="p-1.5 text-gh-danger hover:bg-gh-danger/10 rounded"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddColor('coloresCorporativos')}
                    className="w-full px-3 py-2 text-xs font-medium text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border border-dashed rounded-md hover:bg-gh-bg-tertiary transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FaPlus size={10} /> Agregar Color
                  </button>
                </div>
              </div>

              {/* Colores a Evitar */}
              <div>
                <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">🚫 Colores a Evitar</label>
                <div className="space-y-2">
                  {data.identidadVisual.coloresEvitar.map((color, index) => (
                    <div key={`evitar-${index}`} className="flex items-center gap-2">
                      <ColorPickerInput
                        value={color.hex}
                        onChange={(hex) => handleUpdateColor('coloresEvitar', index, 'hex', hex)}
                        className="flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={color.nombre}
                        onChange={(e) => handleUpdateColor('coloresEvitar', index, 'nombre', e.target.value)}
                        placeholder="Nombre del color"
                        className="flex-1 px-3 py-1.5 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                      <button
                        onClick={() => handleRemoveColor('coloresEvitar', index)}
                        className="p-1.5 text-gh-danger hover:bg-gh-danger/10 rounded"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddColor('coloresEvitar')}
                    className="w-full px-3 py-2 text-xs font-medium text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border border-dashed rounded-md hover:bg-gh-bg-tertiary transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FaPlus size={10} /> Agregar Color a Evitar
                  </button>
                </div>
              </div>

              {/* Estilo Visual */}
              <div>
                <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">✨ Estilo Visual</label>
                <select
                  value={data.identidadVisual.estiloVisual}
                  onChange={(e) => onChange({ ...data, identidadVisual: { ...data.identidadVisual, estiloVisual: e.target.value } })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                >
                  <option value="Profesional y Corporativo">Profesional y Corporativo</option>
                  <option value="Minimalista">Minimalista</option>
                  <option value="Moderno">Moderno</option>
                  <option value="Clásico">Clásico</option>
                  <option value="Creativo">Creativo</option>
                  <option value="Elegante">Elegante</option>
                  <option value="Juvenil">Juvenil</option>
                  <option value="Tecnológico">Tecnológico</option>
                </select>
              </div>

              {/* Contenido Disponible */}
              <div>
                <label className="block text-gh-text font-medium text-xs mb-2 uppercase tracking-wide">📄 Contenido Disponible</label>
                <div className="space-y-2">
                  {data.identidadVisual.contenidoDisponible.map((contenido, index) => (
                    <div key={`contenido-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gh-text-muted">Item {index + 1}</span>
                        <button
                          onClick={() => handleRemoveContenido(index)}
                          className="p-1.5 text-gh-danger hover:bg-gh-danger/10 rounded"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={contenido.item}
                          onChange={(e) => handleUpdateContenido(index, 'item', e.target.value)}
                          placeholder="Item"
                          className="px-2 py-1.5 bg-gh-bg-secondary border border-gh-border rounded text-sm text-gh-text"
                        />
                        <input
                          type="text"
                          value={contenido.status}
                          onChange={(e) => handleUpdateContenido(index, 'status', e.target.value)}
                          placeholder="Estado"
                          className="px-2 py-1.5 bg-gh-bg-secondary border border-gh-border rounded text-sm text-gh-text"
                        />
                        <input
                          type="text"
                          value={contenido.note}
                          onChange={(e) => handleUpdateContenido(index, 'note', e.target.value)}
                          placeholder="Nota"
                          className="px-2 py-1.5 bg-gh-bg-secondary border border-gh-border rounded text-sm text-gh-text"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddContenido}
                    className="w-full px-3 py-2 text-xs font-medium text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border border-dashed rounded-md hover:bg-gh-bg-tertiary transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FaPlus size={10} /> Agregar Contenido
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* OBJETIVOS DEL SITIO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.objetivos === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('objetivos')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                💼 Objetivos del Sitio Web
              </span>
              {expandedSections.objetivos ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.objetivos !== false} 
              onChange={(v) => handleVisChange('objetivos', v)}
            />
          </div>

          {expandedSections.objetivos && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <ArrayFieldGH
                label="Metas Principales"
                items={data.objetivosSitio.metasPrincipales}
                onChange={(items) => onChange({ ...data, objetivosSitio: { ...data.objetivosSitio, metasPrincipales: items } })}
                placeholder="Nueva meta..."
              />
              <ArrayFieldGH
                label="Acciones Esperadas de los Visitantes"
                items={data.objetivosSitio.accionesEsperadas}
                onChange={(items) => onChange({ ...data, objetivosSitio: { ...data.objetivosSitio, accionesEsperadas: items } })}
                placeholder="Nueva acción esperada..."
              />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ESTRUCTURA DEL CATÁLOGO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.estructura === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('estructura')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                📄 Estructura y Contenido del Sitio
              </span>
              {expandedSections.estructura ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.estructura !== false} 
              onChange={(v) => handleVisChange('estructura', v)}
            />
          </div>

          {expandedSections.estructura && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <ArrayFieldGH
                label="Páginas/Secciones Requeridas"
                items={data.estructuraCatalogo.paginasRequeridas}
                onChange={(items) => onChange({ ...data, estructuraCatalogo: { ...data.estructuraCatalogo, paginasRequeridas: items } })}
                placeholder="Nueva página..."
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Cantidad de Productos</label>
                  <input
                    type="text"
                    value={data.estructuraCatalogo.cantidadProductos}
                    onChange={(e) => onChange({ ...data, estructuraCatalogo: { ...data.estructuraCatalogo, cantidadProductos: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Categorías Principales</label>
                  <input
                    type="text"
                    value={data.estructuraCatalogo.categoriasPrincipales}
                    onChange={(e) => onChange({ ...data, estructuraCatalogo: { ...data.estructuraCatalogo, categoriasPrincipales: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Fotos por Producto</label>
                  <input
                    type="text"
                    value={data.estructuraCatalogo.fotosPorProducto}
                    onChange={(e) => onChange({ ...data, estructuraCatalogo: { ...data.estructuraCatalogo, fotosPorProducto: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                  />
                </div>
              </div>
              <ArrayFieldGH
                label="Información a Mostrar por Producto"
                items={data.estructuraCatalogo.infoProducto}
                onChange={(items) => onChange({ ...data, estructuraCatalogo: { ...data.estructuraCatalogo, infoProducto: items } })}
                placeholder="Nuevo campo..."
              />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FUNCIONALIDADES */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.funcionalidades === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('funcionalidades')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                🔧 Funcionalidades Especiales
              </span>
              {expandedSections.funcionalidades ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.funcionalidades !== false} 
              onChange={(v) => handleVisChange('funcionalidades', v)}
            />
          </div>

          {expandedSections.funcionalidades && (
            <div className="mt-4 space-y-4 p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
              <ArrayFieldGH
                label="Características del Sitio Web"
                items={data.funcionalidades.caracteristicas}
                onChange={(items) => onChange({ ...data, funcionalidades: { ...data.funcionalidades, caracteristicas: items } })}
                placeholder="Nueva característica..."
              />
              <ArrayFieldGH
                label="Integraciones Digitales"
                items={data.funcionalidades.integraciones}
                onChange={(items) => onChange({ ...data, funcionalidades: { ...data.funcionalidades, integraciones: items } })}
                placeholder="Nueva integración..."
              />
            </div>
          )}
        </div>

      </div>

      {/* Modal para importar logo - Usando DialogoGenerico directamente */}
      <DialogoGenerico
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        title="Importar Logo Corporativo"
        icon={FaImage}
        variant="premium"
        type="neutral"
        size="md"
        tabs={importTabs}
        defaultTab="upload"
        onTabChange={resetImportState}
        closeOnEscape={true}
        closeOnBackdropClick={true}
        maxHeight="max-h-[70vh]"
        zIndex={1000}
        footer={
          <>
            <button onClick={handleCloseImportModal} className="px-4 py-2 text-sm font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors">
              Cancelar
            </button>
            <button onClick={handleConfirmImport} disabled={!importPreview} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#238636]/20">
              <FaCheck /> Importar Logo
            </button>
          </>
        }
      />

      {/* Modal para detección de colores - Usando DialogoGenerico directamente */}
      <DialogoGenerico
        isOpen={isColorDetectionModalOpen}
        onClose={() => {
          setIsColorDetectionModalOpen(false)
          setImportedImageForDetection(null)
        }}
        title="Colores Detectados del Logo"
        icon={FaPalette}
        iconClassName="text-white text-sm"
        variant="premium"
        type="warning"
        size="md"
        closeOnEscape={true}
        closeOnBackdropClick={true}
        maxHeight="max-h-[70vh]"
        zIndex={1000}
        footer={
          <>
            <button onClick={() => { setIsColorDetectionModalOpen(false); setImportedImageForDetection(null) }} className="px-4 py-2 text-sm font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors">
              Cancelar
            </button>
            {hasExistingColors && (
              <button onClick={handleColorReplace} disabled={selectedColorCount === 0} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#d29922] to-[#f0b429] rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#d29922]/20">
                <FaCheck /> Sustituir ({selectedColorCount})
              </button>
            )}
            <button onClick={handleColorAdd} disabled={selectedColorCount === 0} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#238636]/20">
              <FaCheck /> Agregar ({selectedColorCount})
            </button>
          </>
        }
      >
        {/* Preview de la imagen */}
        {importedImageForDetection && (
          <div className="mb-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="w-full h-24 flex items-center justify-center">
              <img src={importedImageForDetection} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        )}

        {/* Loading */}
        {colorDetectionLoading && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-2xl text-[#58a6ff] mr-2" />
            <span className="text-[#8b949e]">Detectando colores...</span>
          </div>
        )}

        {/* Error */}
        {colorDetectionError && (
          <div className="p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded-md mb-4">
            <p className="text-sm text-[#f85149]">{colorDetectionError}</p>
          </div>
        )}

        {/* Colores detectados */}
        {!colorDetectionLoading && detectedColors.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#8b949e]">{selectedColorCount} de {detectedColors.length} colores seleccionados</span>
              <div className="flex gap-2">
                <button onClick={selectAllColors} className="text-xs text-[#58a6ff] hover:underline">Todos</button>
                <span className="text-[#8b949e]">|</span>
                <button onClick={deselectAllColors} className="text-xs text-[#58a6ff] hover:underline">Ninguno</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {detectedColors.map((color, index) => (
                <button
                  key={`${color.hex}-${index}`}
                  onClick={() => toggleColorSelection(index)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${color.selected ? 'border-[#238636] bg-[#238636]/10' : 'border-[#30363d] bg-[#161b22] hover:border-[#3d444d]'}`}
                >
                  <div className="w-10 h-10 rounded-md border border-[#30363d] flex-shrink-0" style={{ backgroundColor: color.hex }} />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#c9d1d9] truncate">{getColorName(color.hex)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getColorRoleBadgeClass(index)}`}>{getColorLabel(index)}</span>
                    </div>
                    <p className="text-xs text-[#8b949e] font-mono uppercase">{color.hex}</p>
                  </div>
                  {color.selected && <FaCheck className="text-[#3fb950] flex-shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}
      </DialogoGenerico>
    </motion.div>
  )
}
