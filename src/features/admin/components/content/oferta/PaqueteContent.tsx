'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FaBox, FaCheck, FaExclamationTriangle, FaPlus, FaTimes, FaEdit, FaTrash, FaSave, FaBookmark } from 'react-icons/fa'
import { Package, DescripcionPaqueteTemplate, DialogConfig } from '@/lib/types'

// Opciones predefinidas de tipo de paquete
const TIPOS_PAQUETE = [
  { value: '', label: 'Seleccionar...' },
  { value: 'Básico', label: 'Básico' },
  { value: 'Profesional', label: 'Profesional' },
  { value: 'Avanzado', label: 'Avanzado' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'VIP', label: 'VIP' },
  { value: '__custom__', label: '✏️ Personalizado...' },
]

// Valores iniciales vacíos para el paquete
const PAQUETE_VACIO: Package = {
  nombre: '',
  desarrollo: 0,
  descuento: 0,
  activo: false,
  tipo: '',
  tagline: '',
  descripcion: '',
  tiempoEntrega: '',
  cantidadPaginas: '',
}

interface ToastHandler {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

export interface PaqueteContentProps {
  paqueteActual: Package
  setPaqueteActual: (paquete: Package) => void
  descripcionTextareaRef: React.RefObject<HTMLTextAreaElement | null>
  modoEdicion?: boolean
  setModoEdicion?: (modo: boolean) => void
  descripcionesTemplate?: DescripcionPaqueteTemplate[]
  setDescripcionesTemplate?: (templates: DescripcionPaqueteTemplate[]) => void
  mostrarDialogoGenerico?: (config: DialogConfig) => void
  toast?: ToastHandler
}

export default function PaqueteContent({
  paqueteActual,
  setPaqueteActual,
  descripcionTextareaRef,
  modoEdicion: modoEdicionExterno,
  setModoEdicion: setModoEdicionExterno,
  descripcionesTemplate = [],
  setDescripcionesTemplate,
  mostrarDialogoGenerico,
  toast,
}: Readonly<PaqueteContentProps>) {
  // Estado interno para modo edición (si no se proporciona externamente)
  const [modoEdicionInterno, setModoEdicionInterno] = useState(false)
  
  // Estado para saber qué template estamos editando (null = nuevo)
  const [templateEditandoId, setTemplateEditandoId] = useState<string | null>(null)
  
  // Usar estado externo si se proporciona, sino usar interno
  const modoEdicion = modoEdicionExterno ?? modoEdicionInterno
  const setModoEdicion = setModoEdicionExterno ?? setModoEdicionInterno
  
  // Variable derivada: inputs deshabilitados solo si NO está en modo edición Y NO tiene datos
  const estaConfigurado = paqueteActual.nombre.trim() !== ''
  const inputsDeshabilitados = !modoEdicion && !estaConfigurado
  
  // Guardar copia del paquete al iniciar edición para poder cancelar
  const [paqueteBackup, setPaqueteBackup] = useState<Package | null>(null)
  
  // Determinar si el tipo actual es personalizado (no está en la lista predefinida)
  const tipoActualEsPredefinido = TIPOS_PAQUETE.some(
    (t) => t.value === paqueteActual.tipo && t.value !== '__custom__'
  )
  const [mostrarInputPersonalizado, setMostrarInputPersonalizado] = useState(
    !tipoActualEsPredefinido && paqueteActual.tipo !== '' && paqueteActual.tipo !== undefined
  )
  
  // Handlers para modo edición
  const handleNuevoPaquete = useCallback(() => {
    // Verificar si hay datos configurados
    if (estaConfigurado && mostrarDialogoGenerico) {
      // Mostrar diálogo genérico de confirmación
      mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Datos existentes',
        mensaje: 'Ya tienes datos en la descripción del paquete. ¿Qué deseas hacer con ellos antes de crear una nueva oferta?',
        subtitulo: `Paquete actual: ${paqueteActual.nombre}`,
        botones: [
          {
            label: 'Guardar como Plantilla',
            action: () => handleGuardarComoPlantillaYNuevo(),
            style: 'primary'
          },
          {
            label: 'Descartar datos',
            action: () => handleDescartarYNuevo(),
            style: 'danger'
          },
          {
            label: 'Cancelar',
            action: () => {},
            style: 'secondary'
          }
        ]
      })
    } else {
      // No hay datos, proceder directamente
      setPaqueteBackup({ ...paqueteActual })
      setPaqueteActual({ ...PAQUETE_VACIO })
      setModoEdicion(true)
    }
  }, [estaConfigurado, paqueteActual, setPaqueteActual, setModoEdicion, mostrarDialogoGenerico])
  
  // Handler para editar el paquete actual (sin limpiar datos)
  const handleEditarPaquete = useCallback(() => {
    setPaqueteBackup({ ...paqueteActual })
    setModoEdicion(true)
  }, [paqueteActual, setModoEdicion])
  
  const handleGuardar = useCallback(() => {
    // Solo guardar si tiene nombre (mínimo requerido)
    if (paqueteActual.nombre.trim()) {
      setModoEdicion(false)
      setPaqueteBackup(null)
      setTemplateEditandoId(null)
    }
  }, [paqueteActual.nombre, setModoEdicion])
  
  const handleCancelar = useCallback(() => {
    // Restaurar el paquete original
    if (paqueteBackup) {
      setPaqueteActual(paqueteBackup)
    }
    setModoEdicion(false)
    setPaqueteBackup(null)
    setMostrarInputPersonalizado(false)
    setTemplateEditandoId(null)
  }, [paqueteBackup, setPaqueteActual, setModoEdicion])
  
  // Handlers del diálogo de confirmación
  const handleGuardarComoPlantillaYNuevo = useCallback((): boolean => {
    // Validar si ya existe una plantilla con el mismo nombre
    const existePlantilla = descripcionesTemplate.some(
      t => t.nombre.toLowerCase().trim() === paqueteActual.nombre.toLowerCase().trim()
    )
    
    if (existePlantilla) {
      // Mostrar toast de error y retornar false para NO cerrar el modal
      if (toast) {
        toast.error(`Ya existe una plantilla con el nombre "${paqueteActual.nombre}". Selecciona otra opción.`)
      }
      return false
    }
    
    // Guardar como plantilla primero
    if (setDescripcionesTemplate && paqueteActual.nombre.trim()) {
      const ahora = new Date().toISOString()
      const nuevaPlantilla: DescripcionPaqueteTemplate = {
        id: `template-${Date.now()}`,
        nombre: paqueteActual.nombre,
        descripcion: paqueteActual.descripcion || '',
        tipo: paqueteActual.tipo || '',
        tagline: paqueteActual.tagline || '',
        tiempoEntrega: paqueteActual.tiempoEntrega || '',
        createdAt: ahora,
        updatedAt: ahora,
      }
      setDescripcionesTemplate([...descripcionesTemplate, nuevaPlantilla])
      
      // Mostrar toast de éxito
      if (toast) {
        toast.success(`Plantilla "${paqueteActual.nombre}" guardada correctamente`)
      }
    }
    // Luego limpiar y activar edición
    setPaqueteActual({ ...PAQUETE_VACIO })
    setModoEdicion(true)
    return true
  }, [paqueteActual, descripcionesTemplate, setDescripcionesTemplate, setPaqueteActual, setModoEdicion, toast])
  
  const handleDescartarYNuevo = useCallback(() => {
    setPaqueteActual({ ...PAQUETE_VACIO })
    setModoEdicion(true)
  }, [setPaqueteActual, setModoEdicion])

  const handleTipoChange = (value: string) => {
    if (value === '__custom__') {
      setMostrarInputPersonalizado(true)
      setPaqueteActual({ ...paqueteActual, tipo: '' })
    } else {
      setMostrarInputPersonalizado(false)
      setPaqueteActual({ ...paqueteActual, tipo: value })
    }
  }

  // === HANDLERS PARA TEMPLATES ===
  
  // Usar una plantilla: cargar datos en el formulario
  const handleUsarTemplate = useCallback((template: DescripcionPaqueteTemplate) => {
    setPaqueteActual({
      ...paqueteActual,
      nombre: template.nombre,
      descripcion: template.descripcion,
      tipo: template.tipo || '',
      tagline: template.tagline || '',
      tiempoEntrega: template.tiempoEntrega || '',
    })
    // Activar modo edición para que pueda modificar
    setModoEdicion(true)
    setPaqueteBackup(null)
    setTemplateEditandoId(null)
  }, [paqueteActual, setPaqueteActual, setModoEdicion])

  // Editar una plantilla existente
  const handleEditarTemplate = useCallback((template: DescripcionPaqueteTemplate) => {
    setPaqueteActual({
      ...paqueteActual,
      nombre: template.nombre,
      descripcion: template.descripcion,
      tipo: template.tipo || '',
      tagline: template.tagline || '',
      tiempoEntrega: template.tiempoEntrega || '',
    })
    setModoEdicion(true)
    setPaqueteBackup(null)
    setTemplateEditandoId(template.id)
  }, [paqueteActual, setPaqueteActual, setModoEdicion])

  // Eliminar una plantilla
  const handleEliminarTemplate = useCallback((templateId: string) => {
    if (!setDescripcionesTemplate) return
    const nuevasPlantillas = descripcionesTemplate.filter(t => t.id !== templateId)
    setDescripcionesTemplate(nuevasPlantillas)
  }, [descripcionesTemplate, setDescripcionesTemplate])

  // Guardar el paquete actual como nueva plantilla o actualizar existente
  const handleGuardarComoTemplate = useCallback(() => {
    if (!setDescripcionesTemplate) return
    if (!paqueteActual.nombre.trim()) {
      toast?.error('El nombre del paquete es requerido')
      return
    }

    const ahora = new Date().toISOString()
    
    if (templateEditandoId) {
      // Actualizar plantilla existente
      const nuevasPlantillas = descripcionesTemplate.map(t => 
        t.id === templateEditandoId
          ? {
              ...t,
              nombre: paqueteActual.nombre,
              descripcion: paqueteActual.descripcion || '',
              tipo: paqueteActual.tipo || '',
              tagline: paqueteActual.tagline || '',
              tiempoEntrega: paqueteActual.tiempoEntrega || '',
              updatedAt: ahora,
            }
          : t
      )
      setDescripcionesTemplate(nuevasPlantillas)
      toast?.success('Plantilla actualizada correctamente')
    } else {
      // Validar duplicado antes de crear nueva plantilla
      const existePlantilla = descripcionesTemplate.some(
        t => t.nombre.toLowerCase().trim() === paqueteActual.nombre.toLowerCase().trim()
      )
      
      if (existePlantilla) {
        toast?.error(`Ya existe una plantilla con el nombre "${paqueteActual.nombre}"`)
        return
      }

      // Crear nueva plantilla
      const nuevaPlantilla: DescripcionPaqueteTemplate = {
        id: `template-${Date.now()}`,
        nombre: paqueteActual.nombre,
        descripcion: paqueteActual.descripcion || '',
        tipo: paqueteActual.tipo || '',
        tagline: paqueteActual.tagline || '',
        tiempoEntrega: paqueteActual.tiempoEntrega || '',
        createdAt: ahora,
        updatedAt: ahora,
      }
      setDescripcionesTemplate([...descripcionesTemplate, nuevaPlantilla])
      toast?.success('Plantilla guardada correctamente')
    }
    
    setTemplateEditandoId(null)
  }, [paqueteActual, templateEditandoId, descripcionesTemplate, setDescripcionesTemplate, toast])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-gh-text flex items-center gap-2 uppercase tracking-wide">
            <FaBox className="text-gh-info" /> Descripción del Paquete
          </h4>
          <span className="text-gh-text-muted">•</span>
          <span className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
            estaConfigurado 
              ? 'bg-gh-success/10 text-gh-success' 
              : 'bg-gh-warning/10 text-gh-warning'
          }`}>
            {estaConfigurado ? (
              <>
                <FaCheck size={10} /> Configurado
              </>
            ) : (
              <>
                <FaExclamationTriangle size={10} /> Incompleto
              </>
            )}
          </span>
        </div>
        
        {/* Botones de modo edición */}
        <div className="flex items-center gap-2">
          {modoEdicion ? (
            <>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={!paqueteActual.nombre.trim()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-xs font-medium ${
                  paqueteActual.nombre.trim()
                    ? 'bg-gh-success/10 text-gh-success border border-gh-success/30 hover:bg-gh-success/20'
                    : 'bg-gh-bg-secondary text-gh-text-muted border border-gh-border cursor-not-allowed'
                }`}
              >
                <FaCheck size={10} /> Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-danger/10 text-gh-danger border border-gh-danger/30 rounded-md hover:bg-gh-danger/20 transition-colors text-xs font-medium"
              >
                <FaTimes size={10} /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleNuevoPaquete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors text-xs font-medium"
              >
                <FaPlus size={10} /> Nueva Oferta
              </button>
              {estaConfigurado && (
                <button
                  type="button"
                  onClick={handleEditarPaquete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-info/10 text-gh-info border border-gh-info/30 rounded-md hover:bg-gh-info/20 transition-colors text-xs font-medium"
                >
                  <FaEdit size={10} /> Editar
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sección de Plantillas - PRIMERA SECCIÓN */}
      {setDescripcionesTemplate && (estaConfigurado || (modoEdicion && paqueteActual.nombre.trim()) || descripcionesTemplate.length > 0) && (
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-gh-text uppercase tracking-wide flex items-center gap-2">
              <FaBookmark className="text-gh-info" /> Plantillas Guardadas
            </h5>
            {modoEdicion && (
              <button
                type="button"
                onClick={handleGuardarComoTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gh-info/10 text-gh-info border border-gh-info/30 rounded-md hover:bg-gh-info/20 transition-colors text-xs font-medium"
              >
                <FaSave size={10} />
                {templateEditandoId ? 'Actualizar Plantilla' : 'Guardar como Plantilla'}
              </button>
            )}
          </div>

          {descripcionesTemplate.length === 0 ? (
            <div className="text-center py-4 text-gh-text-muted text-xs">
              No hay plantillas guardadas. Crea una descripción y guárdala como plantilla para reutilizarla.
            </div>
          ) : (
            <div className="space-y-2">
              {descripcionesTemplate.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-3 bg-gh-bg-secondary border rounded-md transition-colors ${
                    templateEditandoId === template.id
                      ? 'border-gh-info bg-gh-info/5'
                      : 'border-gh-border hover:border-gh-border-light'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gh-text truncate">
                        {template.nombre}
                      </span>
                      {template.tipo && (
                        <span className="text-xs px-1.5 py-0.5 bg-gh-bg rounded text-gh-text-muted">
                          {template.tipo}
                        </span>
                      )}
                      {templateEditandoId === template.id && (
                        <span className="text-xs px-1.5 py-0.5 bg-gh-info/20 text-gh-info rounded">
                          Editando
                        </span>
                      )}
                    </div>
                    {template.descripcion && (
                      <p className="text-xs text-gh-text-muted truncate mt-0.5">
                        {template.descripcion.substring(0, 80)}{template.descripcion.length > 80 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    <button
                      type="button"
                      onClick={() => handleUsarTemplate(template)}
                      className="flex items-center gap-1 px-2 py-1 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded hover:bg-gh-success/20 transition-colors text-xs"
                      title="Usar esta plantilla"
                    >
                      <FaCheck size={9} /> Usar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditarTemplate(template)}
                      className="p-1.5 text-gh-text-muted hover:text-gh-info hover:bg-gh-info/10 rounded transition-colors"
                      title="Editar plantilla"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminarTemplate(template.id)}
                      className="p-1.5 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                      title="Eliminar plantilla"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulario */}
      <div className={`space-y-4 p-6 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity ${
        inputsDeshabilitados ? 'opacity-50 pointer-events-none' : ''
      }`}>
        {/* Mensaje cuando no está en modo edición y sin datos */}
        {inputsDeshabilitados && !estaConfigurado && (
          <div className="text-center py-2 px-4 bg-gh-bg-secondary/50 border border-gh-border rounded-md mb-4">
            <p className="text-xs text-gh-text-muted">
              Haz clic en <span className="text-gh-success font-medium">"Nueva Oferta"</span> para comenzar a configurarla
            </p>
          </div>
        )}
        
        {/* Fila 1: Nombre, Tipo */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="paqueteNombre" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Nombre del Paquete *
            </label>
            <input
              id="paqueteNombre"
              type="text"
              placeholder="Ej: Constructor"
              value={paqueteActual.nombre}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, nombre: e.target.value })
              }
              disabled={inputsDeshabilitados}
              className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition ${
                inputsDeshabilitados 
                  ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed' 
                  : 'bg-gh-bg-secondary border-gh-border text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
              }`}
            />
          </div>
          <div>
            <label htmlFor="paqueteTipo" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Tipo de Paquete
            </label>
            {mostrarInputPersonalizado ? (
              <div className="flex gap-2">
                <input
                  id="paqueteTipo"
                  type="text"
                  placeholder="Escribe el tipo..."
                  value={paqueteActual.tipo || ''}
                  onChange={(e) =>
                    setPaqueteActual({ ...paqueteActual, tipo: e.target.value })
                  }
                  disabled={inputsDeshabilitados}
                  className={`flex-1 px-3 py-2 border rounded-md text-sm outline-none transition ${
                    inputsDeshabilitados 
                      ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed' 
                      : 'bg-gh-bg-secondary border-gh-border text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setMostrarInputPersonalizado(false)
                    setPaqueteActual({ ...paqueteActual, tipo: '' })
                  }}
                  disabled={inputsDeshabilitados}
                  className={`px-3 py-2 bg-gh-border text-gh-text-muted rounded-md hover:bg-gh-border-light transition-colors text-xs ${
                    inputsDeshabilitados ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  title="Volver a lista"
                >
                  ✕
                </button>
              </div>
            ) : (
              <select
                id="paqueteTipo"
                value={paqueteActual.tipo || ''}
                onChange={(e) => handleTipoChange(e.target.value)}
                disabled={inputsDeshabilitados}
                className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition ${
                  inputsDeshabilitados 
                    ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed' 
                    : 'bg-gh-bg-secondary border-gh-border text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 cursor-pointer'
                }`}
              >
                {TIPOS_PAQUETE.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Fila 2: Tagline, Tiempo de Entrega */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="paqueteTagline" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Tagline
            </label>
            <input
              id="paqueteTagline"
              type="text"
              placeholder="Ej: Presencia digital confiable"
              value={paqueteActual.tagline || ''}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, tagline: e.target.value })
              }
              disabled={inputsDeshabilitados}
              className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition ${
                inputsDeshabilitados 
                  ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed' 
                  : 'bg-gh-bg-secondary border-gh-border text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
              }`}
            />
            <p className="text-gh-text-muted text-xs mt-1">Frase corta descriptiva del paquete</p>
          </div>
          <div>
            <label htmlFor="paqueteTiempoEntrega" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Tiempo de Entrega
            </label>
            <input
              id="paqueteTiempoEntrega"
              type="text"
              placeholder="Ej: 14 días, 4 semanas"
              value={paqueteActual.tiempoEntrega || ''}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, tiempoEntrega: e.target.value })
              }
              disabled={inputsDeshabilitados}
              className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition ${
                inputsDeshabilitados 
                  ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed' 
                  : 'bg-gh-bg-secondary border-gh-border text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
              }`}
            />
            <p className="text-gh-text-muted text-xs mt-1">Tiempo estimado de entrega del proyecto</p>
          </div>
          <div>
            <label htmlFor="paqueteCantidadPaginas" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
              Cantidad de Páginas
            </label>
            <input
              id="paqueteCantidadPaginas"
              type="text"
              placeholder="Ej: 8, 10+, 15"
              value={paqueteActual.cantidadPaginas || ''}
              onChange={(e) =>
                setPaqueteActual({ ...paqueteActual, cantidadPaginas: e.target.value })
              }
              disabled={inputsDeshabilitados}
              className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition ${
                inputsDeshabilitados 
                  ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed' 
                  : 'bg-gh-bg-secondary border-gh-border text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
              }`}
            />
            <p className="text-gh-text-muted text-xs mt-1">Opcional - Si vacío no se muestra en la página</p>
          </div>
        </div>

        {/* Fila 3: Descripción */}
        <div>
          <label htmlFor="paqueteDescripcion" className="block font-medium text-xs mb-2 uppercase tracking-wide text-gh-text">
            Descripción del Paquete
          </label>
          <textarea
            id="paqueteDescripcion"
            placeholder="Ej: Paquete personalizado para empresas constructoras que incluye..."
            value={paqueteActual.descripcion || ''}
            onChange={(e) => {
              setPaqueteActual({ ...paqueteActual, descripcion: e.target.value })
              if (descripcionTextareaRef.current) {
                descripcionTextareaRef.current.style.height = 'auto'
                descripcionTextareaRef.current.style.height = descripcionTextareaRef.current.scrollHeight + 'px'
              }
            }}
            ref={descripcionTextareaRef}
            disabled={inputsDeshabilitados}
            className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition resize-none ${
              inputsDeshabilitados 
                ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed' 
                : 'bg-gh-bg-secondary border-gh-border text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50'
            }`}
            rows={3}
          />
          <p className="text-gh-text-muted text-xs mt-1">Descripción que aparecerá en la cotización</p>
        </div>
      </div>

      {/* Vista Previa del Hero */}
      <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
        <h5 className="text-xs font-semibold text-gh-text mb-3 uppercase tracking-wide">Vista Previa del Hero</h5>
        <div className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-lg p-6 text-center border border-gh-border">
          <div className="text-5xl mb-2">🏅</div>
          <div className="text-[10px] text-gh-text-muted mb-3 bg-gh-bg-secondary/50 px-2 py-1 rounded inline-block">
            Emoji asignado automáticamente según costo
          </div>
          <div className="text-xs font-bold text-gh-text-muted uppercase tracking-wider mb-2">
            {paqueteActual.tipo || 'Tipo'}
          </div>
          <h3 className="text-2xl font-bold text-gh-text mb-2">
            {paqueteActual.nombre || 'Nombre del Paquete'}
          </h3>
          <p className="text-sm text-gh-text-muted mb-3">
            {paqueteActual.tagline || 'Tagline descriptivo'}
          </p>
          {paqueteActual.tiempoEntrega && (
            <div className="text-xs text-gh-info flex items-center justify-center gap-1">
              ⏱️ {paqueteActual.tiempoEntrega}
            </div>
          )}
        </div>
      </div>

      {/* Footer Resumen */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Nombre: <span className="text-gh-text font-medium">{paqueteActual.nombre || '—'}</span>
        </span>
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Tipo: <span className="text-gh-text font-medium">{paqueteActual.tipo || '—'}</span>
        </span>
        {paqueteActual.tiempoEntrega && (
          <span className="text-gh-text-muted flex items-center gap-1.5">
            Entrega: <span className="text-gh-info font-medium">{paqueteActual.tiempoEntrega}</span>
          </span>
        )}
      </div>
    </motion.div>
  )
}
