'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import { 
  DollarSign, 
  CreditCard, 
  Percent, 
  Tags, 
  Gift, 
  Eye, 
  Plus, 
  Trash2,
  CheckCircle,
  StickyNote,
  Bookmark,
  Save,
  Check,
  Edit,
  Info,
  Monitor,
  Wallet
} from 'lucide-react'

import { ToggleSwitchWithLabel } from '@/features/admin/components/ToggleSwitch'
import { 
  ServicioBase, 
  Servicio, 
  OpcionPago, 
  ConfigDescuentos,
  TipoDescuento,
  MetodoPreferido,
  FinancialTemplate,
  DialogConfig
} from '@/lib/types'
import { useEventTracking, useAdminAudit, useAdminPermissions } from '@/features/admin/hooks'
import { MetodosPagoData, defaultMetodosPago } from './MetodosPagoContent'
import SectionHeader from '@/features/admin/components/SectionHeader'

export interface FinancieroContentProps {
  // Desarrollo
  desarrolloCosto: number
  setDesarrolloCosto: (v: number) => void
  descuentoBase: number
  setDescuentoBase: (v: number) => void
  
  // Esquema de Pagos (LEGACY - mantener para compatibilidad)
  opcionesPago: OpcionPago[]
  setOpcionesPago: (ops: OpcionPago[]) => void
  
  // Método y Notas (LEGACY - mantener para compatibilidad)
  metodoPagoPreferido: string
  setMetodoPagoPreferido: (m: string) => void
  notasPago: string
  setNotasPago: (n: string) => void
  
  // Múltiples Métodos de Pago Preferidos
  metodosPreferidos: MetodoPreferido[]
  setMetodosPreferidos: (m: MetodoPreferido[]) => void
  
  // Configuración de Descuentos
  configDescuentos: ConfigDescuentos
  setConfigDescuentos: (c: ConfigDescuentos) => void
  
  // Para cálculos de vista previa
  serviciosBase: ServicioBase[]
  serviciosOpcionales: Servicio[]
  
  // Métodos de Pago (sección integrada)
  metodosPagoData?: MetodosPagoData
  onMetodosPagoChange?: (data: MetodosPagoData) => void
  
  // Templates Financieros
  financialTemplates?: FinancialTemplate[]
  setFinancialTemplates?: (templates: FinancialTemplate[]) => void
  onSaveFinancialTemplate?: (data: Omit<FinancialTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<FinancialTemplate>
  onUpdateFinancialTemplate?: (id: string, data: Partial<FinancialTemplate>) => Promise<FinancialTemplate>
  onDeleteFinancialTemplate?: (id: string) => Promise<void>
  onNuevaOfertaFinanciera?: () => void
  
  // Toast y Dialog
  toast?: {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
    warning: (message: string) => void
  }
  mostrarDialogoGenerico?: (config: DialogConfig) => void
  updatedAt?: string | null
}

// Valores por defecto para ConfigDescuentos
const defaultConfigDescuentos: ConfigDescuentos = {
  tipoDescuento: 'ninguno',
  descuentoGeneral: {
    porcentaje: 0,
    aplicarA: { desarrollo: false, serviciosBase: false, otrosServicios: false }
  },
  descuentosGranulares: {
    desarrollo: 0,
    serviciosBase: {},
    otrosServicios: {}
  },
  descuentoPagoUnico: 0,
  descuentoDirecto: 0
}

export default function FinancieroContent({
  desarrolloCosto,
  setDesarrolloCosto,
  descuentoBase,
  setDescuentoBase,
  opcionesPago,
  setOpcionesPago,
  metodoPagoPreferido,
  setMetodoPagoPreferido,
  notasPago,
  setNotasPago,
  metodosPreferidos = [],
  setMetodosPreferidos,
  configDescuentos = defaultConfigDescuentos,
  setConfigDescuentos,
  serviciosBase,
  serviciosOpcionales,
  metodosPagoData = defaultMetodosPago,
  onMetodosPagoChange,
  financialTemplates = [],
  setFinancialTemplates,
  onSaveFinancialTemplate,
  onUpdateFinancialTemplate,
  onDeleteFinancialTemplate,
  onNuevaOfertaFinanciera,
  toast,
  mostrarDialogoGenerico,
  updatedAt,
}: Readonly<FinancieroContentProps>) {
  // Hooks de auditoría y permisos
  const { logAction } = useAdminAudit()
  const { canEdit, canCreate, canDelete } = useAdminPermissions()

  // Hook de tracking
  const { 
    trackDescuentoConfigured
  } = useEventTracking()

  // Validaciones
  const tieneDescuentos = configDescuentos.tipoDescuento !== 'ninguno' || 
                          configDescuentos.descuentoPagoUnico > 0 || 
                          configDescuentos.descuentoDirecto > 0
  const tieneMetodoPago = metodosPreferidos.length > 0 || (metodoPagoPreferido && metodoPagoPreferido.trim() !== '')

  // Cálculo de porcentajes de métodos de pago (para mostrar información en header)
  const metodosConPorcentaje = metodosPagoData?.opciones?.filter(m => m.porcentaje !== undefined && m.porcentaje > 0) || []
  const totalPorcentaje = metodosConPorcentaje.reduce((sum, m) => sum + (m.porcentaje || 0), 0)

  // Helper para obtener texto de métodos de pago (evita ternarios anidados)
  const getMetodoPagoTexto = useCallback(() => {
    const metodoLabelsLocal: Record<string, string> = {
      transferencia: 'Transferencia Bancaria',
      tarjeta: 'Tarjeta de Crédito/Débito',
      cheque: 'Cheque',
      paypal: 'PayPal',
      efectivo: 'Efectivo',
    }
    if (metodosPreferidos.length > 0) {
      return metodosPreferidos.map(m => metodoLabelsLocal[m.metodo] || m.metodo).join(', ')
    }
    if (metodoPagoPreferido && metodoPagoPreferido.trim() !== '') {
      return metodoLabelsLocal[metodoPagoPreferido] || metodoPagoPreferido
    }
    return '—'
  }, [metodosPreferidos, metodoPagoPreferido])

  // Helpers para actualizar configDescuentos con tracking
  const updateTipoDescuento = useCallback((tipo: TipoDescuento) => {
    setConfigDescuentos({ ...configDescuentos, tipoDescuento: tipo })
    trackDescuentoConfigured(tipo, 0)
  }, [configDescuentos, setConfigDescuentos, trackDescuentoConfigured])

  const updateDescuentoGeneral = (field: string, value: number | boolean) => {
    if (field === 'porcentaje') {
      setConfigDescuentos({
        ...configDescuentos,
        descuentoGeneral: { ...configDescuentos.descuentoGeneral, porcentaje: value as number }
      })
      trackDescuentoConfigured('general', value as number)
    } else {
      setConfigDescuentos({
        ...configDescuentos,
        descuentoGeneral: {
          ...configDescuentos.descuentoGeneral,
          aplicarA: { ...configDescuentos.descuentoGeneral.aplicarA, [field]: value }
        }
      })
    }
  }

  const updateDescuentoGranular = (categoria: 'desarrollo' | 'serviciosBase' | 'otrosServicios', id: string | null, valor: number) => {
    if (categoria === 'desarrollo') {
      setConfigDescuentos({
        ...configDescuentos,
        descuentosGranulares: { ...configDescuentos.descuentosGranulares, desarrollo: valor }
      })
      trackDescuentoConfigured('granular', valor)
    } else if (id) {
      setConfigDescuentos({
        ...configDescuentos,
        descuentosGranulares: {
          ...configDescuentos.descuentosGranulares,
          [categoria]: { ...configDescuentos.descuentosGranulares[categoria], [id]: valor }
        }
      })
      trackDescuentoConfigured('granular', valor)
    }
  }

  // Cálculos para Vista Previa
  const calcularVistaPrevia = () => {
    let desarrolloOriginal = desarrolloCosto
    let desarrolloConDescuento = desarrolloCosto * (1 - descuentoBase / 100)
    
    // Aplicar descuentos adicionales al desarrollo
    if (configDescuentos.tipoDescuento === 'general' && configDescuentos.descuentoGeneral.aplicarA.desarrollo) {
      desarrolloConDescuento *= (1 - configDescuentos.descuentoGeneral.porcentaje / 100)
    } else if (configDescuentos.tipoDescuento === 'granular') {
      desarrolloConDescuento *= (1 - (configDescuentos.descuentosGranulares.desarrollo || 0) / 100)
    }

    // Servicios Base
    const serviciosBaseDesglose = serviciosBase.map(s => {
      const original = s.precio * s.mesesPago
      let descuentoAplicado = 0
      
      if (configDescuentos.tipoDescuento === 'general' && configDescuentos.descuentoGeneral.aplicarA.serviciosBase) {
        descuentoAplicado = configDescuentos.descuentoGeneral.porcentaje
      } else if (configDescuentos.tipoDescuento === 'granular') {
        descuentoAplicado = configDescuentos.descuentosGranulares.serviciosBase[s.id] || 0
      }
      
      const conDescuento = original * (1 - descuentoAplicado / 100)
      return { ...s, original, conDescuento, descuentoAplicado }
    })
    
    const totalServiciosBase = serviciosBaseDesglose.reduce((sum, s) => sum + s.original, 0)
    const totalServiciosBaseConDesc = serviciosBaseDesglose.reduce((sum, s) => sum + s.conDescuento, 0)

    // Servicios Opcionales
    const serviciosOpcionalesDesglose = serviciosOpcionales.map((s, idx) => {
      const original = s.precio * s.mesesPago
      let descuentoAplicado = 0
      
      if (configDescuentos.tipoDescuento === 'general' && configDescuentos.descuentoGeneral.aplicarA.otrosServicios) {
        descuentoAplicado = configDescuentos.descuentoGeneral.porcentaje
      } else if (configDescuentos.tipoDescuento === 'granular') {
        const key = s.id || `otro-${idx}`
        descuentoAplicado = configDescuentos.descuentosGranulares.otrosServicios[key] || 0
      }
      
      const conDescuento = original * (1 - descuentoAplicado / 100)
      return { ...s, original, conDescuento, descuentoAplicado }
    })
    
    const totalOpcionales = serviciosOpcionalesDesglose.reduce((sum, s) => sum + s.original, 0)
    const totalOpcionalesConDesc = serviciosOpcionalesDesglose.reduce((sum, s) => sum + s.conDescuento, 0)

    // Subtotal antes de descuento directo
    const subtotalConDescuentos = desarrolloConDescuento + totalServiciosBaseConDesc + totalOpcionalesConDesc
    const subtotalOriginal = desarrolloOriginal + totalServiciosBase + totalOpcionales

    // Aplicar descuento directo al final
    const totalFinal = subtotalConDescuentos * (1 - (configDescuentos.descuentoDirecto || 0) / 100)
    const ahorroTotal = subtotalOriginal - totalFinal
    const porcentajeAhorro = subtotalOriginal > 0 ? (ahorroTotal / subtotalOriginal) * 100 : 0

    return {
      desarrollo: { original: desarrolloOriginal, conDescuento: desarrolloConDescuento },
      serviciosBase: { desglose: serviciosBaseDesglose, total: totalServiciosBase, conDescuento: totalServiciosBaseConDesc },
      serviciosOpcionales: { desglose: serviciosOpcionalesDesglose, total: totalOpcionales, conDescuento: totalOpcionalesConDesc },
      subtotalOriginal,
      subtotalConDescuentos,
      totalFinal,
      ahorroTotal,
      porcentajeAhorro
    }
  }

  const preview = calcularVistaPrevia()

  // Validar si métodos de pago tiene opciones configuradas
  const tieneMetodosPagoConfigurados = metodosPagoData.opciones.length > 0

  // Badge de estado
  const getBadge = () => {
    if (tieneDescuentos && tieneMetodosPagoConfigurados && tieneMetodoPago) {
      return { text: 'Completo ✓', className: 'bg-gh-success/10 text-gh-success' }
    } else if (tieneDescuentos || tieneMetodosPagoConfigurados || tieneMetodoPago) {
      return { text: 'En progreso', className: 'bg-gh-warning/10 text-gh-warning' }
    }
    return { text: 'Sin configurar', className: 'bg-gh-bg-secondary text-gh-text-muted' }
  }

  const badge = getBadge()

  // Estado para templates financieros
  const [templateEditandoId, setTemplateEditandoId] = useState<string | null>(null)
  const [guardandoTemplate, setGuardandoTemplate] = useState(false)

  // === HANDLERS PARA TEMPLATES FINANCIEROS ===

  // Obtener la configuración actual para guardar como template
  const obtenerConfigActual = useCallback(() => {
    return {
      nombre: '',
      desarrollo: desarrolloCosto,
      descuento: descuentoBase,
      opcionesPago: opcionesPago,
      tituloSeccionPago: metodosPagoData.titulo,
      subtituloSeccionPago: metodosPagoData.subtitulo,
      metodosPreferidos: metodosPreferidos,
      configDescuentos: configDescuentos,
      descuentoPagoUnico: configDescuentos.descuentoPagoUnico,
      notasPago: notasPago,
    }
  }, [desarrolloCosto, descuentoBase, opcionesPago, metodosPagoData, metodosPreferidos, configDescuentos, notasPago])

  // Cargar un template en el formulario
  const handleCargarTemplate = useCallback((template: FinancialTemplate) => {
    setDesarrolloCosto(template.desarrollo)
    setDescuentoBase(template.descuento)
    if (template.opcionesPago) {
      setOpcionesPago(template.opcionesPago)
    }
    if (template.metodosPreferidos) {
      setMetodosPreferidos(template.metodosPreferidos)
    }
    if (template.configDescuentos) {
      setConfigDescuentos(template.configDescuentos)
    }
    if (template.notasPago !== undefined) {
      setNotasPago(template.notasPago || '')
    }
    if (onMetodosPagoChange && (template.tituloSeccionPago || template.subtituloSeccionPago)) {
      onMetodosPagoChange({
        ...metodosPagoData,
        titulo: template.tituloSeccionPago || metodosPagoData.titulo,
        subtitulo: template.subtituloSeccionPago || metodosPagoData.subtitulo,
      })
    }
    toast?.success(`Configuración "${template.nombre}" cargada`)
  }, [setDesarrolloCosto, setDescuentoBase, setOpcionesPago, setMetodosPreferidos, setConfigDescuentos, setNotasPago, onMetodosPagoChange, metodosPagoData, toast])

  // Guardar configuración actual como nuevo template
  const handleGuardarTemplate = useCallback(async () => {
    if (!onSaveFinancialTemplate || !mostrarDialogoGenerico) return
    if (templateEditandoId ? !canEdit('OFFERS') : !canCreate('OFFERS')) return

    mostrarDialogoGenerico({
      titulo: templateEditandoId ? 'Actualizar Configuración' : 'Guardar Nueva Configuración',
      mensaje: templateEditandoId 
        ? '¿Deseas actualizar la configuración guardada con los valores actuales?'
        : 'Ingresa un nombre para guardar esta configuración financiera:',
      tipo: 'info',
      input: templateEditandoId ? undefined : {
        placeholder: 'Nombre de la configuración',
        defaultValue: '',
      },
      botones: [
        {
          label: templateEditandoId ? 'Actualizar' : 'Guardar',
          action: async (inputValue?: string) => {
            const nombre = templateEditandoId 
              ? financialTemplates.find(t => t.id === templateEditandoId)?.nombre || ''
              : inputValue?.trim() || ''
            
            if (!nombre) {
              toast?.error('El nombre es requerido')
              return false
            }

            // Verificar duplicado solo para nuevos
            if (!templateEditandoId) {
              const existente = financialTemplates.find(
                t => t.nombre.toLowerCase() === nombre.toLowerCase()
              )
              if (existente) {
                toast?.error(`Ya existe una configuración con el nombre "${nombre}"`)
                return false
              }
            }

            setGuardandoTemplate(true)
            try {
              const configActual = obtenerConfigActual()
              
              if (templateEditandoId && onUpdateFinancialTemplate) {
                // Actualizar existente
                const actualizado = await onUpdateFinancialTemplate(templateEditandoId, {
                  ...configActual,
                  nombre,
                })
                if (setFinancialTemplates) {
                  setFinancialTemplates(
                    financialTemplates.map(t => t.id === templateEditandoId ? actualizado : t)
                  )
                }
                logAction('UPDATE', 'OFFERS', templateEditandoId, `Configuración Financiera Actualizada: ${nombre}`)
                toast?.success('Configuración actualizada correctamente')
                setTemplateEditandoId(null)
              } else {
                // Crear nuevo
                const nuevo = await onSaveFinancialTemplate({
                  ...configActual,
                  nombre,
                })
                if (setFinancialTemplates) {
                  setFinancialTemplates([...financialTemplates, nuevo])
                }
                logAction('CREATE', 'OFFERS', nuevo.id, `Configuración Financiera Guardada: ${nombre}`)
                toast?.success('Configuración guardada correctamente')
              }
              return true
            } catch (error) {
              console.error('Error guardando template:', error)
              toast?.error('Error al guardar la configuración')
              return false
            } finally {
              setGuardandoTemplate(false)
            }
          },
          style: 'primary'
        },
        {
          label: 'Cancelar',
          action: () => true,
          style: 'secondary'
        }
      ]
    })
  }, [
    onSaveFinancialTemplate, onUpdateFinancialTemplate, mostrarDialogoGenerico, 
    templateEditandoId, financialTemplates, setFinancialTemplates, 
    obtenerConfigActual, toast, canEdit, canCreate, logAction
  ])

  // Editar un template existente
  const handleEditarTemplate = useCallback((template: FinancialTemplate) => {
    if (!mostrarDialogoGenerico) return
    if (!canEdit('OFFERS')) return

    mostrarDialogoGenerico({
      titulo: 'Editar Nombre de Configuración',
      mensaje: 'Ingresa el nuevo nombre para esta configuración:',
      tipo: 'info',
      input: {
        placeholder: 'Nombre de la configuración',
        defaultValue: template.nombre,
      },
      botones: [
        {
          label: 'Guardar',
          action: async (inputValue?: string) => {
            const nuevoNombre = inputValue?.trim()
            if (!nuevoNombre) {
              toast?.error('El nombre es requerido')
              return false
            }
            
            // Verificar duplicado
            const existente = financialTemplates.find(
              t => t.id !== template.id && t.nombre.toLowerCase() === nuevoNombre.toLowerCase()
            )
            if (existente) {
              toast?.error(`Ya existe una configuración con el nombre "${nuevoNombre}"`)
              return false
            }

            if (onUpdateFinancialTemplate && setFinancialTemplates) {
              try {
                const actualizado = await onUpdateFinancialTemplate(template.id, { nombre: nuevoNombre })
                setFinancialTemplates(
                  financialTemplates.map(t => t.id === template.id ? actualizado : t)
                )
                logAction('UPDATE', 'OFFERS', template.id, `Configuración Financiera Renombrada: ${nuevoNombre}`)
                toast?.success('Nombre actualizado correctamente')
                return true
              } catch (error) {
                console.error('Error actualizando template:', error)
                toast?.error('Error al actualizar el nombre')
                return false
              }
            }
            return true
          },
          style: 'primary'
        },
        {
          label: 'Cancelar',
          action: () => true,
          style: 'secondary'
        }
      ]
    })
  }, [mostrarDialogoGenerico, financialTemplates, setFinancialTemplates, onUpdateFinancialTemplate, toast, canEdit, logAction])

  // Eliminar un template
  const handleEliminarTemplate = useCallback((template: FinancialTemplate) => {
    if (!mostrarDialogoGenerico || !onDeleteFinancialTemplate) return
    if (!canDelete('OFFERS')) return

    mostrarDialogoGenerico({
      titulo: 'Eliminar Configuración',
      mensaje: `¿Estás seguro de que deseas eliminar la configuración "${template.nombre}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      botones: [
        {
          label: 'Eliminar',
          action: async () => {
            try {
              await onDeleteFinancialTemplate(template.id)
              if (setFinancialTemplates) {
                setFinancialTemplates(financialTemplates.filter(t => t.id !== template.id))
              }
              if (templateEditandoId === template.id) {
                setTemplateEditandoId(null)
              }
              logAction('DELETE', 'OFFERS', template.id, `Configuración Financiera Eliminada: ${template.nombre}`)
              toast?.success('Configuración eliminada correctamente')
              return true
            } catch (error) {
              console.error('Error eliminando template:', error)
              toast?.error('Error al eliminar la configuración')
              return false
            }
          },
          style: 'danger'
        },
        {
          label: 'Cancelar',
          action: () => true,
          style: 'secondary'
        }
      ]
    })
  }, [mostrarDialogoGenerico, onDeleteFinancialTemplate, financialTemplates, setFinancialTemplates, templateEditandoId, toast, canDelete, logAction])

  // Nueva Oferta Financiera (reiniciar valores)
  const handleNuevaOfertaFinancieraLocal = useCallback(() => {
    if (!canCreate('OFFERS')) return
    const hayDatos = desarrolloCosto > 0 || descuentoBase > 0 || 
                     opcionesPago.length > 0 || metodosPreferidos.length > 0 ||
                     configDescuentos.tipoDescuento !== 'ninguno'
    
    if (!hayDatos) {
      // No hay datos, simplemente limpiar
      setDesarrolloCosto(0)
      setDescuentoBase(0)
      setOpcionesPago([])
      setMetodosPreferidos([])
      setConfigDescuentos(defaultConfigDescuentos)
      setNotasPago('')
      setTemplateEditandoId(null)
      logAction('CREATE', 'OFFERS', 'new-financial-config', 'Nueva Configuración Financiera (Limpia)')
      toast?.info('Formulario listo para nueva oferta')
      return
    }

    // Hay datos, mostrar diálogo
    if (!mostrarDialogoGenerico) {
      // Sin diálogo, ejecutar callback si existe
      onNuevaOfertaFinanciera?.()
      return
    }

    mostrarDialogoGenerico({
      titulo: 'Nueva Oferta Financiera',
      mensaje: 'Tienes datos financieros configurados. ¿Qué deseas hacer?',
      tipo: 'warning',
      botones: [
        {
          label: 'Guardar y Nueva',
          action: async () => {
            await handleGuardarTemplate()
            return false // No cerrar aún, el otro diálogo se encargará
          },
          style: 'primary'
        },
        {
          label: 'Descartar y Nueva',
          action: () => {
            setDesarrolloCosto(0)
            setDescuentoBase(0)
            setOpcionesPago([])
            setMetodosPreferidos([])
            setConfigDescuentos(defaultConfigDescuentos)
            setNotasPago('')
            setTemplateEditandoId(null)
            logAction('CREATE', 'OFFERS', 'new-financial-config', 'Nueva Configuración Financiera (Confirmada)')
            toast?.info('Formulario reiniciado')
            return true
          },
          style: 'danger'
        },
        {
          label: 'Cancelar',
          action: () => true,
          style: 'secondary'
        }
      ]
    })
  }, [
    desarrolloCosto, descuentoBase, opcionesPago, metodosPreferidos, configDescuentos,
    setDesarrolloCosto, setDescuentoBase, setOpcionesPago, setMetodosPreferidos, 
    setConfigDescuentos, setNotasPago, mostrarDialogoGenerico, onNuevaOfertaFinanciera,
    handleGuardarTemplate, toast, canCreate, logAction
  ])

  // Ver detalles de un template
  const handleVerDetallesTemplate = useCallback((template: FinancialTemplate) => {
    if (!mostrarDialogoGenerico) return

    // Labels para métodos de pago
    const metodoLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria',
      tarjeta: 'Tarjeta de Crédito/Débito',
      cheque: 'Cheque',
      paypal: 'PayPal',
      efectivo: 'Efectivo',
    }

    // Labels para tipos de descuento
    const tipoDescuentoLabels: Record<string, string> = {
      'ninguno': 'Sin descuento',
      'sin-descuento': 'Sin descuento',
      'general': 'Descuento Global',
      'por-servicio': 'Descuento por Servicio',
      'directo': 'Descuento Directo',
    }

    // Construir contenido HTML del mensaje
    const buildDetallesHTML = () => {
      const sections: string[] = []

      // 1. Desarrollo y Descuento Base
      sections.push(`
        <div class="mb-4">
          <h4 class="text-xs font-semibold text-gh-text-muted uppercase mb-2">💰 Costos Base</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-gh-text-muted">Desarrollo:</span> <span class="font-medium text-gh-text">$${template.desarrollo.toLocaleString()}</span></div>
            <div><span class="text-gh-text-muted">Descuento:</span> <span class="font-medium text-gh-text">${template.descuento}%</span></div>
          </div>
        </div>
      `)

      // 2. Esquema de Pagos
      const opciones = template.opcionesPago
      if (opciones && opciones.length > 0) {
        const opcionesList = opciones.map(op => `• ${op.nombre} (${op.porcentaje}%)`).join('<br/>')
        sections.push(`
          <div class="mb-4">
            <h4 class="text-xs font-semibold text-gh-text-muted uppercase mb-2">📋 Esquema de Pagos (${opciones.length} opciones)</h4>
            <div class="text-xs font-medium text-gh-text pl-2">${opcionesList}</div>
          </div>
        `)
      }

      // 3. Título y Subtítulo de Sección
      if (template.tituloSeccionPago || template.subtituloSeccionPago) {
        sections.push(`
          <div class="mb-4">
            <h4 class="text-xs font-semibold text-gh-text-muted uppercase mb-2">🏷️ Sección de Pago (Público)</h4>
            <div class="text-sm">
              ${template.tituloSeccionPago ? `<div><span class="text-gh-text-muted">Título:</span> <span class="font-medium text-gh-text">${template.tituloSeccionPago}</span></div>` : ''}
              ${template.subtituloSeccionPago ? `<div><span class="text-gh-text-muted">Subtítulo:</span> <span class="text-gh-text">${template.subtituloSeccionPago}</span></div>` : ''}
            </div>
          </div>
        `)
      }

      // 4. Preferencias de Pago (Métodos Preferidos)
      const metodos = template.metodosPreferidos
      if (metodos && metodos.length > 0) {
        const metodosList = metodos.map(m => {
          const nombre = metodoLabels[m.metodo] || m.metodo
          const notaText = m.nota ? ` <span class="text-gh-text-muted italic">(${m.nota})</span>` : ''
          return `• ${nombre}${notaText}`
        }).join('<br/>')
        sections.push(`
          <div class="mb-4">
            <h4 class="text-xs font-semibold text-gh-text-muted uppercase mb-2">💳 Métodos Preferidos (${metodos.length})</h4>
            <div class="text-xs font-medium text-gh-text pl-2">${metodosList}</div>
          </div>
        `)
      }

      // 5. Notas Generales
      if (template.notasPago) {
        sections.push(`
          <div class="mb-4">
            <h4 class="text-xs font-semibold text-gh-text-muted uppercase mb-2">📝 Notas Generales</h4>
            <div class="text-xs font-medium text-gh-text bg-gh-bg-secondary p-2 rounded border border-gh-border italic">${template.notasPago}</div>
          </div>
        `)
      }

      // 6. Configuración de Descuentos
      const descuentos = template.configDescuentos as ConfigDescuentos | undefined
      if (descuentos) {
        const tipoLabel = tipoDescuentoLabels[descuentos.tipoDescuento] || descuentos.tipoDescuento
        let descuentoInfo = `<div><span class="text-gh-text-muted">Tipo:</span> <span class="font-medium text-gh-text">${tipoLabel}</span></div>`
        
        if (descuentos.tipoDescuento === 'general' && descuentos.descuentoGeneral) {
          descuentoInfo += `<div><span class="text-gh-text-muted">Porcentaje:</span> <span class="text-gh-success">${descuentos.descuentoGeneral.porcentaje}%</span></div>`
        }
        if (descuentos.descuentoPagoUnico > 0) {
          descuentoInfo += `<div><span class="text-gh-text-muted">Por pago único:</span> <span class="text-gh-success">${descuentos.descuentoPagoUnico}%</span></div>`
        }
        if (descuentos.descuentoEspecial?.habilitado) {
          descuentoInfo += `<div><span class="text-gh-text-muted">Especial:</span> <span class="text-gh-warning">${descuentos.descuentoEspecial.porcentaje}%</span> - ${descuentos.descuentoEspecial.motivo || 'Sin motivo'}</div>`
        }

        sections.push(`
          <div class="mb-4">
            <h4 class="text-xs font-semibold text-gh-text-muted uppercase mb-2">🎁 Descuentos</h4>
            <div class="text-sm pl-2">${descuentoInfo}</div>
          </div>
        `)
      }

      // Si no hay datos adicionales
      if (sections.length === 1) {
        sections.push(`<div class="text-xs font-medium text-gh-text-muted italic">Solo contiene costos base configurados.</div>`)
      }

      return sections.join('')
    }

    mostrarDialogoGenerico({
      titulo: `Detalles: ${template.nombre}`,
      mensaje: '', // Requerido pero vacío porque usamos mensajeHTML
      mensajeHTML: buildDetallesHTML(),
      tipo: 'info',
      botones: [
        {
          label: 'Cerrar',
          action: () => true,
          style: 'secondary'
        }
      ]
    })
  }, [mostrarDialogoGenerico])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header with SectionHeader */}
      <SectionHeader
        title="Financiero"
        description="Costos, descuentos y opciones de pago de la oferta"
        icon={<DollarSign className="w-4 h-4" />}
        statusIndicator={updatedAt ? 'guardado' : 'sin-modificar'}
        updatedAt={updatedAt}
        variant="accent"
        onAdd={canCreate('OFFERS') ? handleNuevaOfertaFinancieraLocal : undefined}
        badges={[{ label: 'Estado', value: badge.text, color: badge.className.includes('success') ? 'success' : 'warning' }]}
        actions={
          <div className="flex items-center gap-2">
            {onSaveFinancialTemplate && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGuardarTemplate}
                disabled={guardandoTemplate || !canEdit('OFFERS')}
                className="flex items-center gap-2 px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 hover:border-gh-accent/50 rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-gh-accent" />
                <span>{templateEditandoId ? 'Actualizar Configuración' : 'Guardar'}</span>
              </motion.button>
            )}
          </div>
        }
      />

      {/* SECCIÓN DE CONFIGURACIONES GUARDADAS */}
      {setFinancialTemplates && financialTemplates.length > 0 && (
        <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
            <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-gh-accent" /> Configuraciones Financieras Guardadas
            </h5>
          </div>
          <div className="p-4 space-y-2">
            {financialTemplates.map((template) => (
              <div
                key={template.id}
                className={`flex items-center justify-between p-3 bg-gh-bg-tertiary/50 border rounded-md transition-colors ${
                  templateEditandoId === template.id
                    ? 'border-gh-accent bg-gh-accent/5'
                    : 'border-gh-border/30 hover:border-gh-border'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs font-medium text-gh-text truncate">
                      {template.nombre}
                    </span>
                    {templateEditandoId === template.id && (
                      <span className="text-xs px-1.5 py-0.5 bg-gh-accent/20 text-gh-accent rounded">
                        Editando
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gh-text-muted">
                    <span>Desarrollo: ${template.desarrollo.toLocaleString()}</span>
                    {template.descuento > 0 && (
                      <span>Descuento: {template.descuento}%</span>
                    )}
                    {template.metodosPreferidos && template.metodosPreferidos.length > 0 && (
                      <span>{template.metodosPreferidos.length} método(s) de pago</span>
                    )}
                    {template.opcionesPago?.length ? (
                      <span>{template.opcionesPago.length} opción(es) de pago</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <button
                    type="button"
                    onClick={() => handleCargarTemplate(template)}
                    className="flex items-center gap-1 px-2 py-1 bg-gh-success/10 text-gh-success border border-gh-success/30 rounded hover:bg-gh-success/20 transition-colors text-xs"
                    title="Usar esta configuración"
                  >
                    <Check className="w-3 h-3" /> Usar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerDetallesTemplate(template)}
                    className="p-1.5 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded transition-colors"
                    title="Ver detalles completos"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditarTemplate(template)}
                    className="p-1.5 text-gh-text-muted hover:text-gh-accent hover:bg-gh-accent/10 rounded transition-colors"
                    title="Editar nombre"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminarTemplate(template)}
                    className="p-1.5 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                    title="Eliminar configuración"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay configuraciones guardadas pero se puede guardar */}
      {setFinancialTemplates && financialTemplates.length === 0 && onSaveFinancialTemplate && (
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
          <div className="flex items-center gap-3 text-xs text-gh-text-muted">
            <Bookmark className="text-gh-info" />
            <span>
              No hay configuraciones guardadas. Configura los valores financieros y haz clic en{' '}
              <span className="text-gh-info font-medium">"Guardar Configuración"</span> para reutilizarla.
            </span>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: DESARROLLO */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5 text-gh-info" /> Desarrollo
          </h5>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Costo de Desarrollo ($)
              </label>
              <input
                type="number"
                min={0}
                value={desarrolloCosto}
                onChange={(e) => setDesarrolloCosto(Math.max(0, Number.parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-xs font-medium text-gh-text outline-none transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Descuento Base (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={descuentoBase}
                onChange={(e) => setDescuentoBase(Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-xs font-medium text-gh-text outline-none transition"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: MÉTODOS DE PAGO */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center justify-between">
          <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-gh-info" /> Métodos de Pago
          </h5>
          {metodosConPorcentaje.length > 0 && (
            <div className={`p-2 rounded-md border ${
              totalPorcentaje === 100 ? 'bg-gh-success/10 border-gh-success/30' : 'bg-gh-warning/10 border-gh-warning/30'
            }`}>
              <p className="text-[10px] text-gh-text-muted flex items-center gap-1">
                {totalPorcentaje === 100 ? (
                  <span className="text-gh-success flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Los métodos con porcentaje suman correctamente 100%
                  </span>
                ) : (
                  <span className="text-gh-warning flex items-center gap-1">
                    ⚠️ Los métodos con porcentaje suman {totalPorcentaje}% (deberían sumar 100%)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">

          {/* Info sobre porcentajes ahora se muestra en el encabezado */}

          {/* Lista de Métodos de Pago */}
          <div className="space-y-2">
            {metodosPagoData.opciones.length === 0 ? (
              <p className="text-gh-text-muted text-xs italic py-2 text-center border border-dashed border-gh-border rounded-md">
                No hay métodos de pago configurados. Agrega al menos un método.
              </p>
            ) : (
              metodosPagoData.opciones.map((metodo, index) => (
                <div
                  key={`metodo-pago-${index}`}
                  className="grid grid-cols-[1.2fr,0.5fr,3fr,auto] gap-2 p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-md items-end"
                >
                  <div>
                    <label className="block text-[10px] font-medium text-gh-text-muted mb-1">Nombre</label>
                    <input
                      type="text"
                      value={metodo.nombre}
                      onChange={(e) => {
                        const newOpciones = [...metodosPagoData.opciones]
                        newOpciones[index] = { ...newOpciones[index], nombre: e.target.value }
                        onMetodosPagoChange?.({ ...metodosPagoData, opciones: newOpciones })
                      }}
                      placeholder="Ej: Transferencia"
                      className="w-full px-2 py-1.5 bg-gh-bg border border-gh-border/30 rounded text-xs text-gh-text focus:border-gh-info focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gh-text-muted mb-1">%</label>
                    <input
                      type="number"
                      value={metodo.porcentaje ?? ''}
                      onChange={(e) => {
                        const newOpciones = [...metodosPagoData.opciones]
                        newOpciones[index] = { 
                          ...newOpciones[index], 
                          porcentaje: e.target.value ? Number(e.target.value) : undefined 
                        }
                        onMetodosPagoChange?.({ ...metodosPagoData, opciones: newOpciones })
                      }}
                      placeholder="-"
                      min={0}
                      max={100}
                      className="w-full px-2 py-1.5 bg-gh-bg border border-gh-border/30 rounded text-xs text-gh-text focus:border-gh-info focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gh-text-muted mb-1">Descripción</label>
                    <input
                      type="text"
                      value={metodo.descripcion}
                      onChange={(e) => {
                        const newOpciones = [...metodosPagoData.opciones]
                        newOpciones[index] = { ...newOpciones[index], descripcion: e.target.value }
                        onMetodosPagoChange?.({ ...metodosPagoData, opciones: newOpciones })
                      }}
                      placeholder="Ej: Al iniciar el proyecto"
                      className="w-full px-2 py-1.5 bg-gh-bg border border-gh-border/30 rounded text-xs text-gh-text focus:border-gh-info focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newOpciones = metodosPagoData.opciones.filter((_, i) => i !== index)
                      onMetodosPagoChange?.({ ...metodosPagoData, opciones: newOpciones })
                    }}
                    className="w-8 h-8 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors flex items-center justify-center"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => {
              const newMetodo = { nombre: 'Nuevo método', porcentaje: undefined, descripcion: '' }
              onMetodosPagoChange?.({ ...metodosPagoData, opciones: [...metodosPagoData.opciones, newMetodo] })
            }}
            className="px-3 py-1.5 bg-gh-info hover:bg-gh-info/80 text-white rounded-md transition-colors flex items-center gap-2 font-medium text-xs"
          >
            <Plus className="w-3 h-3" /> Agregar Método
          </button>
        </div>
      </div>

      {/* SECCIÓN 3: PREFERENCIAS DE PAGO */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-gh-accent" /> Preferencias de Pago
          </h5>
        </div>
        <div className="p-4 space-y-3">
          
          {/* Lista de métodos preferidos */}
          <div className="space-y-3">
            {metodosPreferidos.map((metodo, index) => (
              <div 
                key={metodo.id} 
                className="p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gh-text-muted">
                    Método #{index + 1}
                  </span>
                  <button
                    onClick={() => {
                      setMetodosPreferidos(metodosPreferidos.filter(m => m.id !== metodo.id))
                    }}
                    className="p-1.5 text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                    title="Eliminar método"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-[1fr_3fr] gap-3">
                  <div>
                    <DropdownSelect
                      label="Método de Pago"
                      value={metodo.metodo}
                      onChange={(val) => {
                        setMetodosPreferidos(metodosPreferidos.map(m => 
                          m.id === metodo.id ? { ...m, metodo: val } : m
                        ))
                      }}
                      options={[
                        { value: '', label: 'Selecciona un método' },
                        { value: 'transferencia', label: 'Transferencia Bancaria' },
                        { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
                        { value: 'cheque', label: 'Cheque' },
                        { value: 'paypal', label: 'PayPal' },
                        { value: 'efectivo', label: 'Efectivo' },
                        { value: 'cripto', label: 'Criptomonedas' },
                        { value: 'financiamiento', label: 'Financiamiento' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gh-text mb-1">
                      <StickyNote className="inline mr-1" /> Nota para este método
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Cuenta: XXXX-XXXX, a nombre de..."
                      value={metodo.nota}
                      onChange={(e) => {
                        setMetodosPreferidos(metodosPreferidos.map(m => 
                          m.id === metodo.id ? { ...m, nota: e.target.value } : m
                        ))
                      }}
                      className="w-full px-3 py-2 bg-gh-bg border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-xs font-medium text-gh-text outline-none transition resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {metodosPreferidos.length === 0 && (
              <div className="text-center py-4 text-gh-text-muted text-xs border border-dashed border-gh-border rounded-lg">
                No hay métodos de pago preferidos configurados
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              const nuevoMetodo: MetodoPreferido = {
                id: `metodo-${Date.now()}`,
                metodo: '',
                nota: ''
              }
              setMetodosPreferidos([...metodosPreferidos, nuevoMetodo])
            }}
            className="px-3 py-1.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white rounded-md transition-colors flex items-center gap-2 font-medium text-xs"
          >
            <Plus className="w-3 h-3" /> Agregar Método Preferido
          </button>
          
          {/* Campo de notas de pago generales - siempre visible */}
          <div className="mt-3 pt-3 border-t border-gh-border">
            <label className="block text-xs font-medium text-gh-text mb-1">
              <StickyNote className="inline mr-1" /> Notas de Pago Generales
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Pago inicial del 50%, resto a la entrega..."
              value={notasPago}
              onChange={(e) => setNotasPago(e.target.value)}
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-xs font-medium text-gh-text outline-none transition resize-none"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: TIPOS DE DESCUENTO */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
            <Tags className="w-3.5 h-3.5 text-gh-warning" /> Tipos de Descuento
          </h5>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'ninguno' as TipoDescuento, label: '❌ Ninguno', activeClass: 'bg-gh-text-muted/10 border-gh-text-muted' },
              { id: 'granular' as TipoDescuento, label: '🎯 Granular', activeClass: 'bg-gh-warning/10 border-gh-warning' },
              { id: 'general' as TipoDescuento, label: '📊 General', activeClass: 'bg-gh-success/10 border-gh-success' },
            ].map(({ id, label, activeClass }) => (
              <label
                key={id}
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border transition-all ${
                  configDescuentos.tipoDescuento === id
                    ? activeClass
                    : 'border-gh-border/30 hover:bg-gh-bg-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="tipoDescuento"
                  checked={configDescuentos.tipoDescuento === id}
                  onChange={() => updateTipoDescuento(id)}
                  className="accent-gh-accent"
                />
                <span className="text-xs text-gh-text">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-[10px] text-gh-text-muted">
            Granulares: % individual por servicio | General: Un % uniforme para categorías
          </p>

          {/* SECCIÓN 4.1: DESCUENTO GENERAL (condicional) */}
          {configDescuentos.tipoDescuento === 'general' && (
            <div className="space-y-3 p-4 bg-gh-success/5 border border-gh-success/30 rounded-lg mt-3">
            <h5 className="text-xs font-semibold text-gh-text flex items-center gap-2">
              <Percent className="text-gh-success" /> Configuración de Descuento General
            </h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gh-text mb-1">Porcentaje</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={configDescuentos.descuentoGeneral.porcentaje}
                    onChange={(e) => updateDescuentoGeneral('porcentaje', Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                    min={0}
                    max={100}
                    className="flex-1 px-3 py-2 bg-gh-bg border border-gh-border/30 rounded-md focus:border-gh-success focus:outline-none text-xs font-medium text-gh-text"
                  />
                  <span className="text-gh-text-muted">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gh-text mb-1">Aplicar a:</label>
                <div className="space-y-1">
                  {[
                    { key: 'desarrollo', label: '💻 Desarrollo' },
                    { key: 'serviciosBase', label: '🔧 Servicios Base' },
                    { key: 'otrosServicios', label: '✨ Otros Servicios' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-gh-text">
                      <ToggleSwitchWithLabel
                        enabled={configDescuentos.descuentoGeneral.aplicarA[key as keyof typeof configDescuentos.descuentoGeneral.aplicarA]}
                        onChange={(v) => updateDescuentoGeneral(key, v)}
                        label={label}
                        size="sm"
                        labelPosition="right"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 4.2: DESCUENTOS GRANULARES (condicional) */}
        {configDescuentos.tipoDescuento === 'granular' && (
          <div className="space-y-3 p-4 bg-gh-warning/5 border border-gh-warning/30 rounded-lg mt-3">
            <h5 className="text-xs font-semibold text-gh-text flex items-center gap-2">
              <Tags className="text-gh-warning" /> Descuentos por Servicio
            </h5>
            
            {/* Grid de 3 columnas */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Columna 1: Desarrollo */}
              <div className="space-y-2">
                <h6 className="text-[10px] font-medium text-gh-text-muted uppercase tracking-wide flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> Desarrollo
                </h6>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-gh-bg rounded border border-gh-border">
                    <span className="text-xs text-gh-text truncate mr-2">Costo de Desarrollo</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <input
                        type="number"
                        value={configDescuentos.descuentosGranulares.desarrollo}
                        onChange={(e) => updateDescuentoGranular('desarrollo', null, Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                        min={0}
                        max={100}
                        className="w-14 px-2 py-1 bg-gh-bg-secondary border border-gh-border/30 rounded text-xs text-gh-text text-center"
                      />
                      <span className="text-[10px] text-gh-text-muted">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 2: Servicios Base */}
              <div className="space-y-2">
                <h6 className="text-[10px] font-medium text-gh-text-muted uppercase tracking-wide flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Servicios Base
                  {serviciosBase.length > 0 && (
                    <span className="text-gh-text-muted/60">({serviciosBase.length})</span>
                  )}
                </h6>
                <div className="space-y-1">
                  {serviciosBase.length > 0 ? (
                    serviciosBase.map((servicio) => (
                      <div key={servicio.id} className="flex items-center justify-between p-2 bg-gh-bg rounded border border-gh-border">
                        <span className="text-xs text-gh-text truncate mr-2" title={servicio.nombre}>{servicio.nombre}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <input
                            type="number"
                            value={configDescuentos.descuentosGranulares.serviciosBase[servicio.id] || 0}
                            onChange={(e) => updateDescuentoGranular('serviciosBase', servicio.id, Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                            min={0}
                            max={100}
                            className="w-14 px-2 py-1 bg-gh-bg-secondary border border-gh-border/30 rounded text-xs text-gh-text text-center"
                          />
                          <span className="text-[10px] text-gh-text-muted">%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[10px] text-gh-text-muted border border-dashed border-gh-border rounded">
                      Sin servicios base
                    </div>
                  )}
                </div>
              </div>

              {/* Columna 3: Servicios Opcionales */}
              <div className="space-y-2">
                <h6 className="text-[10px] font-medium text-gh-text-muted uppercase tracking-wide flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Opcionales
                  {serviciosOpcionales.length > 0 && (
                    <span className="text-gh-text-muted/60">({serviciosOpcionales.length})</span>
                  )}
                </h6>
                <div className="space-y-1">
                  {serviciosOpcionales.length > 0 ? (
                    serviciosOpcionales.map((servicio, idx) => {
                      const key = servicio.id || `otro-${idx}`
                      return (
                        <div key={key} className="flex items-center justify-between p-2 bg-gh-bg rounded border border-gh-border">
                          <span className="text-xs text-gh-text truncate mr-2" title={servicio.nombre}>{servicio.nombre}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <input
                              type="number"
                              value={configDescuentos.descuentosGranulares.otrosServicios[key] || 0}
                              onChange={(e) => updateDescuentoGranular('otrosServicios', key, Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))}
                              min={0}
                              max={100}
                              className="w-14 px-2 py-1 bg-gh-bg-secondary border border-gh-border/30 rounded text-xs text-gh-text text-center"
                            />
                            <span className="text-[10px] text-gh-text-muted">%</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-3 text-center text-[10px] text-gh-text-muted border border-dashed border-gh-border rounded">
                      Sin servicios opcionales
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* SECCIÓN 5: DESCUENTOS ESPECIALES */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
            <Gift className="w-3.5 h-3.5 text-gh-accent" /> Descuentos Especiales
          </h5>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Descuento Pago Único (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={configDescuentos.descuentoPagoUnico}
                onChange={(e) => setConfigDescuentos({ ...configDescuentos, descuentoPagoUnico: Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)) })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-xs font-medium text-gh-text outline-none transition"
              />
              <p className="text-[10px] text-gh-text-muted mt-1">Aplica solo al desarrollo si paga todo de una vez</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">
                Descuento Directo (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={configDescuentos.descuentoDirecto}
                onChange={(e) => setConfigDescuentos({ ...configDescuentos, descuentoDirecto: Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)) })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/50 text-xs font-medium text-gh-text outline-none transition"
              />
              <p className="text-[10px] text-gh-text-muted mt-1">Se aplica al total final, después de otros descuentos</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 6: VISTA PREVIA */}
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <h5 className="text-xs font-medium text-gh-text flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-gh-accent" /> Vista Previa
          </h5>
        </div>
        <div className="p-4 space-y-3">
          
          <div className="p-4 bg-gh-bg border border-gh-border/30 rounded-lg space-y-4">
            {/* Desarrollo */}
            <div className="border-b border-gh-border pb-3">
              <div className="flex justify-between text-xs text-gh-text-muted uppercase mb-1">
                <span>💻 Desarrollo</span>
                {preview.desarrollo.conDescuento < preview.desarrollo.original && (
                  <span className="text-gh-success">-{Math.round((1 - preview.desarrollo.conDescuento / preview.desarrollo.original) * 100)}%</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gh-text">Costo</span>
                <div className="text-right">
                  {preview.desarrollo.conDescuento < preview.desarrollo.original && (
                    <span className="line-through text-gh-text-muted text-xs mr-2">${preview.desarrollo.original.toFixed(2)}</span>
                  )}
                  <span className="font-bold text-gh-success">${preview.desarrollo.conDescuento.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Servicios Base */}
            {preview.serviciosBase.desglose.length > 0 && (
              <div className="border-b border-gh-border pb-3">
                <div className="flex justify-between text-xs text-gh-text-muted uppercase mb-1">
                  <span>🔧 Servicios Base</span>
                  {preview.serviciosBase.conDescuento < preview.serviciosBase.total && (
                    <span className="text-gh-success">-{Math.round((1 - preview.serviciosBase.conDescuento / preview.serviciosBase.total) * 100)}%</span>
                  )}
                </div>
                <div className="space-y-1 pl-2">
                  {preview.serviciosBase.desglose.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gh-text">{s.nombre} (${s.precio} × {s.mesesPago}m)</span>
                      <div className="text-right">
                        {s.descuentoAplicado > 0 && (
                          <span className="line-through text-gh-text-muted mr-2">${s.original.toFixed(2)}</span>
                        )}
                        <span className={s.descuentoAplicado > 0 ? 'text-gh-success' : 'text-gh-text'}>${s.conDescuento.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gh-border/50 text-xs">
                  <span className="text-gh-text-muted">Subtotal</span>
                  <span className="font-medium text-gh-text">${preview.serviciosBase.conDescuento.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Servicios Opcionales */}
            {preview.serviciosOpcionales.desglose.length > 0 && (
              <div className="border-b border-gh-border pb-3">
                <div className="flex justify-between text-xs text-gh-text-muted uppercase mb-1">
                  <span>✨ Servicios Opcionales</span>
                  {preview.serviciosOpcionales.conDescuento < preview.serviciosOpcionales.total && (
                    <span className="text-gh-success">-{Math.round((1 - preview.serviciosOpcionales.conDescuento / preview.serviciosOpcionales.total) * 100)}%</span>
                  )}
                </div>
                <div className="space-y-1 pl-2">
                  {preview.serviciosOpcionales.desglose.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gh-text">{s.nombre} (${s.precio} × {s.mesesPago}m)</span>
                      <div className="text-right">
                        {s.descuentoAplicado > 0 && (
                          <span className="line-through text-gh-text-muted mr-2">${s.original.toFixed(2)}</span>
                        )}
                        <span className={s.descuentoAplicado > 0 ? 'text-gh-success' : 'text-gh-text'}>${s.conDescuento.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gh-border/50 text-xs">
                  <span className="text-gh-text-muted">Subtotal</span>
                  <span className="font-medium text-gh-text">${preview.serviciosOpcionales.conDescuento.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Esquema de Pagos - Vista Previa */}
            {opcionesPago.length > 0 && desarrolloCosto > 0 && (
              <div className="border-b border-gh-border pb-3">
                <div className="text-xs text-gh-text-muted uppercase mb-2">📊 Esquema de Pagos (Desarrollo: ${preview.desarrollo.conDescuento.toFixed(2)})</div>
                <div className="space-y-1 pl-2">
                  {opcionesPago.map((op, idx) => {
                    const monto = (preview.desarrollo.conDescuento * (op.porcentaje || 0)) / 100
                    return (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gh-text">{op.nombre || `Pago ${idx + 1}`} ({op.porcentaje}%)</span>
                        <span className="font-medium text-gh-text">${monto.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gh-border/50 text-xs">
                  <span className="font-bold text-gh-text">TOTAL</span>
                  <span className="font-bold text-gh-success">
                    ${preview.desarrollo.conDescuento.toFixed(2)} ✓
                  </span>
                </div>
              </div>
            )}

            {/* Método de Pago */}
            {tieneMetodoPago && (
              <div className="border-b border-gh-border pb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gh-text-muted uppercase">💳 Método de Pago</span>
                  <span className="text-gh-text">{getMetodoPagoTexto()}</span>
                </div>
              </div>
            )}

            {/* Descuentos Aplicados */}
            {tieneDescuentos && (
              <div className="bg-gh-bg-secondary p-3 rounded-md border-b border-gh-border">
                <div className="text-xs font-medium text-gh-text mb-2 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-gh-warning" /> Descuentos Aplicados
                </div>
                <div className="text-[10px] text-gh-text-muted space-y-0.5">
                  {configDescuentos.tipoDescuento === 'general' && (
                    <div>• Descuento general del {configDescuentos.descuentoGeneral.porcentaje}%</div>
                  )}
                  {configDescuentos.tipoDescuento === 'granular' && (
                    <div>• Descuentos granulares por servicio</div>
                  )}
                  {configDescuentos.descuentoPagoUnico > 0 && (
                    <div>• Pago único: {configDescuentos.descuentoPagoUnico}% al desarrollo</div>
                  )}
                  {configDescuentos.descuentoDirecto > 0 && (
                    <div>• Descuento directo: {configDescuentos.descuentoDirecto}% al total final</div>
                  )}
                </div>
              </div>
            )}

            {/* Total Final */}
            <div className="bg-gradient-to-r from-gh-success/10 to-gh-bg rounded-lg p-4 border border-gh-success/30">
              {/* Subtotal (antes de desc. directo) */}
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gh-text-muted">Subtotal (antes de desc. directo)</span>
                <span className="text-gh-text">${preview.subtotalOriginal.toFixed(2)}</span>
              </div>
              {/* Total Final */}
              <div className="flex justify-between font-bold">
                <span className="text-gh-text">💰 Total Final</span>
                <span className="text-gh-success text-lg">${preview.totalFinal.toFixed(2)}</span>
              </div>
              {/* Ahorro Total - solo si hay ahorro */}
              {preview.ahorroTotal > 0 && (
                <div className="flex justify-between text-xs text-gh-success mt-1">
                  <span>🎉 Ahorro Total</span>
                  <span className="font-bold">${preview.ahorroTotal.toFixed(2)} ({preview.porcentajeAhorro.toFixed(1)}% OFF)</span>
                </div>
              )}
            </div>

            {/* Notas de Pago */}
            {notasPago && notasPago.trim() !== '' && (
              <div className="bg-gh-bg-tertiary p-3 rounded-md">
                <div className="text-xs text-gh-text-muted uppercase mb-1 flex items-center gap-1">
                  <StickyNote className="w-3 h-3" /> Notas de Pago
                </div>
                <p className="text-xs text-gh-text italic">&quot;{notasPago}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-gh-bg-secondary rounded-lg border border-gh-border text-xs flex flex-wrap gap-4 items-center justify-between">
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Cuotas: <span className="font-medium text-gh-text">{opcionesPago.length}</span>
        </span>
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Método: <span className="font-medium text-gh-text">{getMetodoPagoTexto()}</span>
        </span>
        <span className="text-gh-text-muted flex items-center gap-1.5">
          Desc: <span className="font-medium text-gh-text">{configDescuentos.tipoDescuento === 'ninguno' ? 'Ninguno' : configDescuentos.tipoDescuento}</span>
        </span>
        {preview.ahorroTotal > 0 && (
          <span className="text-gh-success flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" /> Ahorro: {preview.porcentajeAhorro.toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}


