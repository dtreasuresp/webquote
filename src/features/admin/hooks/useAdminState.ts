'use client'

import { useState, useRef } from 'react'
import type { ServicioBase, Package, Servicio, PackageSnapshot, QuotationConfig, UserPreferences, DialogConfig } from '@/lib/types'

type ValidationState = 'ok' | 'pendiente' | 'error'

export function useAdminState() {
  // ==================== ESTADOS COTIZACIÓN ====================
  const [cotizacionConfig, setCotizacionConfig] = useState<QuotationConfig | null>(null)
  const [cargandoCotizacion, setCargandoCotizacion] = useState(false)
  const [erroresValidacionCotizacion, setErroresValidacionCotizacion] = useState<{
    emailProveedor?: string
    whatsappProveedor?: string
    emailCliente?: string
    whatsappCliente?: string
    fechas?: string
    empresa?: string
    profesional?: string
    numero?: string
    version?: string
  }>({})

  // Estados principales
  const [serviciosBase, setServiciosBase] = useState<ServicioBase[]>([
    { id: '1', nombre: 'Hosting', precio: 28, mesesGratis: 3, mesesPago: 9 },
    { id: '2', nombre: 'Mailbox', precio: 4, mesesGratis: 3, mesesPago: 9 },
    { id: '3', nombre: 'Dominio', precio: 18, mesesGratis: 3, mesesPago: 9 },
  ])

  const [nuevoServicioBase, setNuevoServicioBase] = useState<{
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
  }>({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })

  const [editandoServicioBaseId, setEditandoServicioBaseId] = useState<string | null>(null)
  const [servicioBaseEditando, setServicioBaseEditando] = useState<ServicioBase | null>(null)

  // Definición de Paquetes
  const [paqueteActual, setPaqueteActual] = useState<Package>({
    nombre: '',
    desarrollo: 0,
    descuento: 0,
    activo: true,
    tipo: '',
    descripcion: '',
  })

  // Estados legacy eliminados: otrosServicios y servicios (ahora unificados en serviciosOpcionales)
  const [nuevoServicio, setNuevoServicio] = useState<{
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
  }>({ 
    nombre: '', 
    precio: 0,
    mesesGratis: 0,
    mesesPago: 12
  })
  const [editandoServicioId, setEditandoServicioId] = useState<string | null>(null)
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null)
  
  // Estado unificado (fase inicial): representación única para servicios opcionales evitando duplicados en snapshot.
  // En esta primera fase se poblará desde ambos arrays legacy (otrosServicios y servicios) al cargar configuración.
  const [serviciosOpcionales, setServiciosOpcionales] = useState<Servicio[]>([])
  const [snapshots, setSnapshots] = useState<PackageSnapshot[]>([])
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [activePageTab, setActivePageTab] = useState<string>('cotizacion')
  const [snapshotEditando, setSnapshotEditando] = useState<PackageSnapshot | null>(null)
  
  // Estado para comparar cambios en el modal (versión original serializada)
  const [snapshotOriginalJson, setSnapshotOriginalJson] = useState<string | null>(null)
  
  // Ref para foco inicial en modal
  const nombrePaqueteInputRef = useRef<HTMLInputElement | null>(null)
  
  // Ref para scroll del contenedor modal
  const modalScrollContainerRef = useRef<HTMLDivElement>(null)
  const descripcionTextareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [cargandoSnapshots, setCargandoSnapshots] = useState(true)
  const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)
  
  // ==================== ESTADOS QUOTATIONS Y PREFERENCIAS ====================
  const [quotations, setQuotations] = useState<QuotationConfig[]>([])
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  
  // Estado para la cotización actual (información general)
  const [cotizacionActual, setCotizacionActual] = useState<Partial<QuotationConfig>>({
    numero: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    tiempoValidez: 30,
    empresa: '',
    sector: '',
    ubicacion: '',
    emailCliente: '',
    whatsappCliente: '',
    profesional: '',
    empresaProveedor: '',
    emailProveedor: '',
    whatsappProveedor: '',
    ubicacionProveedor: '',
    heroTituloMain: 'Propuesta de Cotización',
    heroTituloSub: 'Cotización personalizada',
  })
  
  // ==================== FIN ESTADOS QUOTATIONS ====================
  
  // ==================== NUEVOS ESTADOS FASES 3-6 ====================
  const [readOnly, setReadOnly] = useState(false)
  const [alertaMostradaEnSesion, setAlertaMostradaEnSesion] = useState(false)
  
  // ==================== NUEVOS ESTADOS PARA MODAL 3 FILAS ====================
  const [activeTabFila1, setActiveTabFila1] = useState<string>('cotizacion')
  const [activeTabFila2, setActiveTabFila2] = useState<string>('')
  const [activeTabFila3, setActiveTabFila3] = useState<string>('descripcion')
  const [quotationEnModal, setQuotationEnModal] = useState<QuotationConfig | null>(null)
  const [snapshotsModalActual, setSnapshotsModalActual] = useState<PackageSnapshot[]>([])
  // ==================== FIN NUEVOS ESTADOS ====================

  // ==================== NUEVOS ESTADOS PARA VALIDACIÓN POR TAB ====================
  const [estadoValidacionTabs, setEstadoValidacionTabs] = useState<{
    cotizacion: ValidationState
    oferta: ValidationState
    paquetes: ValidationState
    estilos: ValidationState
  }>({
    cotizacion: 'pendiente',
    oferta: 'pendiente',
    paquetes: 'pendiente',
    estilos: 'pendiente',
  })
  // ==================== FIN ESTADOS VALIDACIÓN ====================

  // ==================== ESTADOS PARA DIÁLOGO GENÉRICO ====================
  const [mostrarDialogo, setMostrarDialogo] = useState(false)
  const [datosDialogo, setDatosDialogo] = useState<DialogConfig | null>(null)
  // ==================== FIN ESTADOS DIÁLOGO GENÉRICO ====================

  // ==================== FASE 12: ESTADO PARA TRACKING DE CAMBIOS ====================
  const [quotationEstadoAntes, setQuotationEstadoAntes] = useState<{
    wasGlobal: boolean
    wasActive: boolean
    wasId: string
  } | null>(null)
  // ==================== FIN ESTADOS TRACKING ====================
  
  // Estado para expandibles en descuentos por servicio
  const [expandidosDescuentos, setExpandidosDescuentos] = useState<{ [key: string]: boolean }>({
    serviciosBase: false,
    otrosServicios: false,
  })

  // Estado para autoguardado y control de cambios
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedJson, setLastSavedJson] = useState<string | null>(null)
  const autoSaveDelay = 800
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  return {
    // Cotización
    cotizacionConfig,
    setCotizacionConfig,
    cargandoCotizacion,
    setCargandoCotizacion,
    erroresValidacionCotizacion,
    setErroresValidacionCotizacion,

    // Servicios Base
    serviciosBase,
    setServiciosBase,
    nuevoServicioBase,
    setNuevoServicioBase,
    editandoServicioBaseId,
    setEditandoServicioBaseId,
    servicioBaseEditando,
    setServicioBaseEditando,

    // Paquete Actual
    paqueteActual,
    setPaqueteActual,

    // Servicios Opcionales
    nuevoServicio,
    setNuevoServicio,
    editandoServicioId,
    setEditandoServicioId,
    servicioEditando,
    setServicioEditando,
    serviciosOpcionales,
    setServiciosOpcionales,

    // Snapshots
    snapshots,
    setSnapshots,
    showModalEditar,
    setShowModalEditar,
    activePageTab,
    setActivePageTab,
    snapshotEditando,
    setSnapshotEditando,
    snapshotOriginalJson,
    setSnapshotOriginalJson,
    cargandoSnapshots,
    setCargandoSnapshots,
    errorSnapshots,
    setErrorSnapshots,

    // Quotations y Preferencias
    quotations,
    setQuotations,
    userPreferences,
    setUserPreferences,
    cotizacionActual,
    setCotizacionActual,

    // Estados UI
    readOnly,
    setReadOnly,
    alertaMostradaEnSesion,
    setAlertaMostradaEnSesion,
    activeTabFila1,
    setActiveTabFila1,
    activeTabFila2,
    setActiveTabFila2,
    activeTabFila3,
    setActiveTabFila3,
    quotationEnModal,
    setQuotationEnModal,
    snapshotsModalActual,
    setSnapshotsModalActual,

    // Validación por TAB
    estadoValidacionTabs,
    setEstadoValidacionTabs,

    // Diálogo Genérico
    mostrarDialogo,
    setMostrarDialogo,
    datosDialogo,
    setDatosDialogo,

    // Tracking de cambios
    quotationEstadoAntes,
    setQuotationEstadoAntes,

    // Expandibles
    expandidosDescuentos,
    setExpandidosDescuentos,

    // Autoguardado
    autoSaveStatus,
    setAutoSaveStatus,
    lastSavedJson,
    setLastSavedJson,
    autoSaveDelay,
    autoSaveTimeoutRef,

    // Refs
    nombrePaqueteInputRef,
    modalScrollContainerRef,
    descripcionTextareaRef,
  }
}
