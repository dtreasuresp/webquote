'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { FaPlus, FaTrash, FaDownload, FaArrowLeft, FaEdit, FaTimes, FaCheck, FaCreditCard, FaChevronDown, FaSave, FaFileAlt, FaGlobe, FaHeadset, FaPercent, FaPalette, FaHistory, FaGift, FaCog, FaUser, FaBriefcase, FaTags, FaExclamationTriangle, FaEye } from 'react-icons/fa'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import TabsModal from '@/components/layout/TabsModal'
import Historial from '@/components/admin/Historial'
import CotizacionTab from '@/components/admin/CotizacionTab'
import OfertaTab from '@/components/admin/OfertaTab'
import PaquetesTab from '@/components/admin/PaquetesTab'
import EstilosYDisenoTab from '@/components/admin/EstilosYDisenoTab'
import PreferenciasTab from '@/components/admin/PreferenciasTab'
import PaqueteContenidoTab from '@/components/admin/PaqueteContenidoTab'
import Toast from '@/components/layout/Toast'
import { useToast } from '@/lib/hooks/useToast'
import { jsPDF } from 'jspdf'
import { obtenerSnapshotsCompleto, crearSnapshot, actualizarSnapshot, eliminarSnapshot } from '@/lib/snapshotApi'
import { useSnapshotsRefresh } from '@/lib/hooks/useSnapshots'
import { compararQuotations, validarQuotation } from '@/lib/utils/validation'
import type { ServicioBase, GestionConfig, Package, Servicio, OtroServicio, PackageSnapshot, QuotationConfig, UserPreferences, DialogConfig, ConfigDescuentos, TipoDescuento } from '@/lib/types'
import { calcularPreviewDescuentos, getDefaultConfigDescuentos } from '@/lib/utils/discountCalculator'
import type { TabItem } from '@/components/layout/TabsModal'

// UI Components
import KPICards from '@/features/admin/components/KPICards'

export default function Administrador() {
  // Obtener función de refresh global
  const refreshSnapshots = useSnapshotsRefresh()
  
  // Hook para notificaciones toast
  const toast = useToast()

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
    frecuenciaPago: 'mensual' | 'anual'
  }>({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12, frecuenciaPago: 'mensual' })

  const [editandoServicioBaseId, setEditandoServicioBaseId] = useState<string | null>(null)
  const [servicioBaseEditando, setServicioBaseEditando] = useState<ServicioBase | null>(null)

  const [gestion, setGestion] = useState<GestionConfig>({
    precio: 0,
    mesesGratis: 0,
    mesesPago: 12,
  })

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
    frecuenciaPago: 'mensual' | 'anual'
  }>({ 
    nombre: '', 
    precio: 0,
    mesesGratis: 0,
    mesesPago: 12,
    frecuenciaPago: 'mensual'
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
    heroTituloMain: 'Mi Propuesta',
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
    cotizacion: 'ok' | 'pendiente' | 'error'
    oferta: 'ok' | 'pendiente' | 'error'
    paquetes: 'ok' | 'pendiente' | 'error'
    estilos: 'ok' | 'pendiente' | 'error'
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

  // Cargar snapshots desde la API y configuración del localStorage al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoSnapshots(true)
        setErrorSnapshots(null)
        
        // Cargar snapshots desde la API (activos e inactivos)
        const snapshotsDelServidor = await obtenerSnapshotsCompleto()
        setSnapshots(snapshotsDelServidor)
      } catch (error) {
        console.error('Error cargando snapshots:', error)
        setErrorSnapshots('Error al cargar los paquetes')
      } finally {
        setCargandoSnapshots(false)
      }
    }

    cargarDatos()

    // Cargar Quotations desde la API
    const cargarQuotations = async () => {
      try {
        const response = await fetch('/api/quotations')
        const data = await response.json()
        if (data.success) {
          setQuotations(data.data || [])
        }
      } catch (error) {
        console.error('Error cargando quotations:', error)
      }
    }

    // Cargar Preferences del usuario
    const cargarPreferences = async () => {
      try {
        const response = await fetch('/api/preferences')
        const data = await response.json()
        if (data.success) {
          setUserPreferences(data.data || null)
        }
      } catch (error) {
        console.error('Error cargando preferences:', error)
      }
    }

    cargarQuotations()
    cargarPreferences()

    // Cargar configuración guardada desde localStorage
    const configGuardada = localStorage.getItem('configuracionAdministrador')
    if (configGuardada) {
      try {
        const config = JSON.parse(configGuardada)
        if (config.serviciosBase) setServiciosBase(config.serviciosBase)
        if (config.gestion) setGestion(config.gestion)
        if (config.paqueteActual) setPaqueteActual(config.paqueteActual)
        const fusionFuenteServicios: Servicio[] = (config.servicios || []).map((s: any) => ({
          id: s.id || `${Date.now()}-${Math.random()}`,
          nombre: s.nombre,
          precio: s.precio,
          mesesGratis: s.mesesGratis,
          mesesPago: s.mesesPago,
        }))
        const fusionFuenteOtros: Servicio[] = (config.otrosServicios || []).map((s: any, idx: number) => ({
          id: s.id || `legacy-${Date.now()}-${idx}`,
          nombre: s.nombre,
          precio: s.precio,
          mesesGratis: s.mesesGratis,
          mesesPago: s.mesesPago,
        }))
        const fusionFuenteUnificada: Servicio[] = (config.serviciosOpcionales || []).map((s: any) => ({
          id: s.id || `${Date.now()}-${Math.random()}`,
          nombre: s.nombre,
          precio: s.precio,
          mesesGratis: s.mesesGratis,
          mesesPago: s.mesesPago,
        }))
        // Prioridad: serviciosOpcionales > servicios > otrosServicios
        const fusion: Servicio[] = [...fusionFuenteOtros, ...fusionFuenteServicios, ...fusionFuenteUnificada]
        const vistos = new Set<string>()
        const dedup = fusion.filter(s => {
          if (vistos.has(s.nombre)) return false
          vistos.add(s.nombre)
          return true
        })
        setServiciosOpcionales(dedup)
      } catch (e) {
        console.error('Error cargando configuración:', e)
      }
    }
  }, [])

  // Ajustar altura del textarea de descripción automáticamente
  useEffect(() => {
    if (descripcionTextareaRef.current) {
      descripcionTextareaRef.current.style.height = 'auto';
      descripcionTextareaRef.current.style.height = descripcionTextareaRef.current.scrollHeight + 'px';
    }
  }, [paqueteActual.descripcion])

  // Ya no necesitamos guardar snapshots en localStorage, se guardan en la API
  // El segundo useEffect que guardaba en localStorage se elimina

  // Validaciones
  const paqueteEsValido = paqueteActual.nombre && paqueteActual.desarrollo > 0
  const serviciosBaseValidos = serviciosBase.length > 0 && serviciosBase.every(s => s.precio > 0 && s.nombre)
  // Gestión es OPCIONAL
  const gestionValida = gestion.precio === 0 || (gestion.precio > 0 && gestion.mesesPago > gestion.mesesGratis)
  // Servicios opcionales (opcionales, no bloquean creación): si existen, cada uno debe sumar 12 meses y tener precio/nombre
  const serviciosOpcionalesValidos = serviciosOpcionales.every(s => s.nombre && s.precio > 0 && (s.mesesGratis + s.mesesPago === 12))
  const todoEsValido = paqueteEsValido && serviciosBaseValidos && gestionValida

  // ==================== FUNCIONES COTIZACIÓN ====================

  // Formatear fecha ISO a "largo" (ej: "20 de noviembre de 2025")
  const formatearFechaLarga = (isoString: string): string => {
    const fecha = new Date(isoString)
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
  }

  // Calcular fecha vencimiento: fechaEmision + tiempoValidez (días)
  const calcularFechaVencimiento = (fechaEmision: Date, dias: number): Date => {
    const vencimiento = new Date(fechaEmision)
    vencimiento.setDate(vencimiento.getDate() + dias)
    return vencimiento
  }

  // Validar email
  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validar teléfono WhatsApp (básico: +XXX XXXXXXXXX)
  const validarWhatsApp = (whatsapp: string): boolean => {
    const regex = /^\+\d{1,3}\s?\d{6,14}$/
    return regex.test(whatsapp.replace(/\s/g, ''))
  }

  // Validar que vencimiento > emisión
  const validarFechas = (emisión: string, vencimiento: string): boolean => {
    return new Date(vencimiento) > new Date(emisión)
  }

  // ==================== FUNCIONES DE VALIDACIÓN POR TAB ====================
  
  /**
   * Valida TAB Cotización: Campos requeridos con datos correctos
   */
  const validarTabCotizacion = (): { valido: boolean; errores: string[] } => {
    const errores: string[] = []

    if (!cotizacionConfig?.empresa?.trim()) {
      errores.push('Empresa requerida')
    }
    if (!cotizacionConfig?.profesional?.trim()) {
      errores.push('Profesional requerido')
    }
    if (!cotizacionConfig?.sector?.trim()) {
      errores.push('Sector requerido')
    }
    if (!cotizacionConfig?.ubicacion?.trim()) {
      errores.push('Ubicación cliente requerida')
    }
    if (cotizacionConfig?.emailProveedor && !validarEmail(cotizacionConfig.emailProveedor)) {
      errores.push('Email proveedor inválido')
    }
    if (cotizacionConfig?.whatsappProveedor && !validarWhatsApp(cotizacionConfig.whatsappProveedor)) {
      errores.push('WhatsApp proveedor inválido')
    }
    if (cotizacionConfig && !validarFechas(cotizacionConfig.fechaEmision, cotizacionConfig.fechaVencimiento)) {
      errores.push('Fecha vencimiento debe ser mayor a emisión')
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  /**
   * Valida TAB Oferta: Servicios base + descripción paquete requeridos
   */
  const validarTabOferta = (): { valido: boolean; errores: string[] } => {
    const errores: string[] = []

    if (!serviciosBase || serviciosBase.length === 0) {
      errores.push('Debe haber al menos un servicio base')
    }
    if (!paqueteActual?.nombre?.trim()) {
      errores.push('Descripción del paquete (nombre) es requerida')
    }
    if (!paqueteActual?.descripcion?.trim()) {
      errores.push('Descripción detallada del paquete es requerida')
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  /**
   * Valida TAB Paquetes: Debe haber al menos 1 paquete
   */
  const validarTabPaquetes = (): { valido: boolean; errores: string[] } => {
    const errores: string[] = []

    if (!snapshots || snapshots.filter(s => s.activo).length === 0) {
      errores.push('Debe crear al menos un paquete activo')
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  /**
   * Valida TAB Estilos: Simplemente verifica que el TAB exista
   */
  const validarTabEstilos = (): { valido: boolean; errores: string[] } => {
    // Este TAB es más informativo, casi siempre OK
    return {
      valido: true,
      errores: [],
    }
  }

  /**
   * Actualiza estado de validación de todos los TABs
   */
  const actualizarEstadoValidacionTabs = () => {
    const estadoCotizacion = validarTabCotizacion()
    const estadoOferta = validarTabOferta()
    const estadoPaquetes = validarTabPaquetes()
    const estadoEstilos = validarTabEstilos()

    setEstadoValidacionTabs({
      cotizacion: estadoCotizacion.valido ? 'ok' : 'error',
      oferta: estadoOferta.valido ? 'ok' : 'error',
      paquetes: estadoPaquetes.valido ? 'ok' : 'error',
      estilos: estadoEstilos.valido ? 'ok' : 'error',
    })
  }

  /**
   * Interceptor de cambio de TAB: valida antes de cambiar
   */
  // FASE 15: Función mejorada para cambiar TABs con validación de dependencias
  const handleCambioTab = (nuevoTab: string) => {
    const tabActual = activePageTab
    
    // Validar TAB ACTUAL antes de salir
    let resultado: { valido: boolean; errores: string[] } | null = null

    if (tabActual === 'cotizacion') {
      resultado = validarTabCotizacion()
    } else if (tabActual === 'oferta') {
      resultado = validarTabOferta()
    } else if (tabActual === 'paquetes') {
      resultado = validarTabPaquetes()
    } else if (tabActual === 'estilos') {
      resultado = validarTabEstilos()
    }

    if (resultado && !resultado.valido) {
      toast.error(`❌ ${resultado.errores[0]}`)
      return
    }

    // FASE 15: Validar DEPENDENCIAS del TAB DESTINO
    // Antes de entrar a "Paquetes": validar que existe descripción
    if (nuevoTab === 'paquetes') {
      if (!paqueteActual.descripcion || paqueteActual.descripcion.trim() === '') {
        toast.error('❌ Completa la descripción en TAB Oferta antes de crear paquetes')
        return
      }
    }

    // Antes de entrar a "Estilos": validar que existe al menos 1 paquete
    if (nuevoTab === 'estilos') {
      if (snapshots.length === 0) {
        toast.error('❌ Crea al menos un paquete en TAB Paquetes antes de configurar estilos')
        return
      }
    }

    // Si pasó validación, cambiar TAB
    setActivePageTab(nuevoTab)
    
    // Actualizar validación del nuevo TAB
    actualizarEstadoValidacionTabs()
  }

  // Cargar cotización de la BD al montar
  useEffect(() => {
    const cargarCotizacion = async () => {
      try {
        setCargandoCotizacion(true)
        const response = await fetch('/api/quotation-config')
        if (response.status === 404) {
          // Si no existe, crear una por defecto
          console.log('No hay cotización, creando una por defecto...')
          const responseCrear = await fetch('/api/quotation-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              version: '1.0',
              tiempoValidez: 30,
              presupuesto: 'Menos de $300 USD',
              moneda: 'USD',
              empresa: 'Urbanísima Constructora S.R.L',
              sector: 'Construcción y montaje',
              ubicacion: 'Calle 12/2da y 3ra, No 36, Ampliación de Marbella, Habana del Este, La Habana, CUBA',
              profesional: 'Daniel Treasure Espinosa',
              empresaProveedor: 'DGTECNOVA',
              email: 'dgtecnova@gmail.com',
              whatsapp: '+535 856 9291',
              ubicacionProveedor: 'Arroyo 203, e/ Lindero y Nueva del Pilar, Centro Habana, La Habana, CUBA',
              tiempoVigenciaValor: 12,
              tiempoVigenciaUnidad: 'meses',
              heroTituloMain: 'PROPUESTA DE COTIZACIÓN',
              heroTituloSub: 'PÁGINA CATÁLOGO DINÁMICA',
            }),
          })
          if (responseCrear.ok) {
            const data = await responseCrear.json()
            setCotizacionConfig(data)
          }
          return
        }
        if (response.ok) {
          const data = await response.json()
          setCotizacionConfig(data)
        }
      } catch (error) {
        console.error('Error cargando cotización:', error)
      } finally {
        setCargandoCotizacion(false)
      }
    }
    cargarCotizacion()
  }, [])

  // Guardar cotización en BD
  // FUNCIÓN ELIMINADA: guardarCotizacion() ha sido unificada en guardarConfiguracionActual()

  // Calcular costo inicial para un snapshot
  const calcularCostoInicialSnapshot = (snapshot: PackageSnapshot) => {
    const preview = calcularPreviewDescuentos(snapshot)
    const desarrolloConDescuento = preview.desarrolloConDescuento
    
    // Servicios base del mes 1 (Hosting, Mailbox, Dominio - sin Gestión)
    const serviciosBaseMes1 = snapshot.serviciosBase.reduce((sum, s) => {
      if (s.nombre.toLowerCase() !== 'gestión') {
        return sum + (s.precio || 0)
      }
      return sum
    }, 0)
    
    // Pago inicial: Desarrollo con descuento + Servicios Base mes 1
    return desarrolloConDescuento + serviciosBaseMes1
  }

  // Calcular costo año 1 para un snapshot
  const calcularCostoAño1Snapshot = (snapshot: PackageSnapshot) => {
    const preview = calcularPreviewDescuentos(snapshot)
    const desarrolloConDescuento = preview.desarrolloConDescuento
    // Año 1: se facturan los meses de pago para cada servicio base
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * s.mesesPago)
    }, 0)

    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      const mesesServicio = s.mesesPago
      return sum + s.precio * mesesServicio
    }, 0)

    return desarrolloConDescuento + serviciosBaseCosto + otrosServiciosTotal
  }

  // Calcular costo año 2 para un snapshot
  const calcularCostoAño2Snapshot = (snapshot: PackageSnapshot) => {
    // Año 2: no se consideran meses gratis, todo a 12 meses, sin desarrollo
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * 12)
    }, 0)

    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * 12
    }, 0)

    return serviciosBaseCosto + otrosServiciosTotal
  }

  // Funciones CRUD para Servicios Base
  const agregarServicioBase = () => {
    if (nuevoServicioBase.nombre && nuevoServicioBase.precio > 0) {
      const nuevoServ: ServicioBase = {
        id: Date.now().toString(),
        nombre: nuevoServicioBase.nombre,
        precio: nuevoServicioBase.precio,
        mesesGratis: nuevoServicioBase.mesesGratis,
        mesesPago: nuevoServicioBase.mesesPago,
        frecuenciaPago: nuevoServicioBase.frecuenciaPago,
      }
      setServiciosBase([...serviciosBase, nuevoServ])
      setNuevoServicioBase({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12, frecuenciaPago: 'mensual' })
    }
  }

  const abrirEditarServicioBase = (servicio: ServicioBase) => {
    setServicioBaseEditando({ ...servicio })
    setEditandoServicioBaseId(servicio.id)
  }

  const guardarEditarServicioBase = () => {
    if (servicioBaseEditando && servicioBaseEditando.nombre && servicioBaseEditando.precio > 0) {
      setServiciosBase(serviciosBase.map(s => s.id === servicioBaseEditando.id ? servicioBaseEditando : s))
      setEditandoServicioBaseId(null)
      setServicioBaseEditando(null)
    }
  }

  const cancelarEditarServicioBase = () => {
    setEditandoServicioBaseId(null)
    setServicioBaseEditando(null)
  }

  const eliminarServicioBase = (id: string) => {
    if (serviciosBase.length > 1) {
      setServiciosBase(serviciosBase.filter(s => s.id !== id))
    } else {
      mostrarDialogoGenerico({
        tipo: 'error',
        titulo: 'No se puede eliminar',
        icono: '⚠️',
        mensaje: 'Debe haber al menos un servicio base. No puedes eliminar el último.',
        botones: [
          {
            label: 'Entendido',
            action: () => {},
            style: 'primary'
          }
        ]
      })
    }
  }

  // Eliminadas funciones legacy agregar/eliminar otros servicios (unificadas)

  // Funciones para Servicios (Sección 4)
  // Unificación de lógica CRUD para servicios opcionales usando 'serviciosOpcionales'
  const normalizarMeses = (mesesGratis: number, mesesPago: number) => {
    let g = Math.max(0, Math.min(mesesGratis, 12))
    let p = Math.max(0, Math.min(mesesPago, 12))
    if (g + p !== 12) {
      if (g > 0) p = 12 - g
      else if (p > 0) g = 12 - p
      else p = 12 // ambos 0 -> 12 meses pago
    }
    if (g === 12) return { mesesGratis: 12, mesesPago: 0 }
    if (p === 0) return { mesesGratis: g, mesesPago: 1 } // asegurar al menos 1 pago si no todo gratis
    return { mesesGratis: g, mesesPago: p }
  }

  const agregarServicioOpcional = () => {
    if (nuevoServicio.nombre.trim() && nuevoServicio.precio > 0) {
      const { mesesGratis, mesesPago } = normalizarMeses(nuevoServicio.mesesGratis, nuevoServicio.mesesPago)
      const nuevoServ: Servicio = {
        id: Date.now().toString(),
        nombre: nuevoServicio.nombre.trim(),
        precio: nuevoServicio.precio,
        mesesGratis,
        mesesPago,
        frecuenciaPago: nuevoServicio.frecuenciaPago,
      }
      setServiciosOpcionales(prev => {
        const existente = prev.find(s => s.nombre.toLowerCase() === nuevoServ.nombre.toLowerCase())
        if (existente) return prev.map(s => s.id === existente.id ? { ...nuevoServ, id: existente.id } : s)
        return [...prev, nuevoServ]
      })
      setNuevoServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12, frecuenciaPago: 'mensual' })
    }
  }

  const abrirEditarServicioOpcional = (servicio: Servicio) => {
    setServicioEditando({ ...servicio })
    setEditandoServicioId(servicio.id)
  }

  const guardarEditarServicioOpcional = () => {
    if (servicioEditando && servicioEditando.nombre.trim() && servicioEditando.precio > 0) {
      const nm = normalizarMeses(servicioEditando.mesesGratis, servicioEditando.mesesPago)
      const actualizado: Servicio = { ...servicioEditando, ...nm, nombre: servicioEditando.nombre.trim() }
      setServiciosOpcionales(prev => prev.map(s => s.id === actualizado.id ? actualizado : s))
      setEditandoServicioId(null)
      setServicioEditando(null)
    }
  }

  const cancelarEditarServicioOpcional = () => {
    setEditandoServicioId(null)
    setServicioEditando(null)
  }

  const eliminarServicioOpcional = (id: string) => {
    setServiciosOpcionales(prev => prev.filter(s => s.id !== id))
  }

  const crearPaqueteSnapshot = async () => {
    // PROPUESTA 1: Validar que cotizacionConfig exista ✅
    if (!cotizacionConfig?.id) {
      toast.error('Cotización no cargada - Primero debes crear o cargar una cotización antes de agregar paquetes.')
      return
    }

    if (!todoEsValido) {
      mostrarDialogoGenerico({
        tipo: 'error',
        titulo: 'Campos incompletos',
        icono: '⚠️',
        mensaje: 'Por favor completa todos los campos requeridos: Nombre del paquete, Desarrollo, Precios de servicios, y Meses válidos.',
        botones: [
          {
            label: 'Entendido',
            action: () => {},
            style: 'primary'
          }
        ]
      })
      return
    }

    try {
      // Conversión directa desde el estado unificado
      const otrosServiciosUnificados: OtroServicio[] = serviciosOpcionales.map(s => ({
        nombre: s.nombre,
        precio: s.precio,
        mesesGratis: s.mesesGratis,
        mesesPago: s.mesesPago,
      }))

      const nuevoSnapshot: PackageSnapshot = {
        id: Date.now().toString(),
        nombre: paqueteActual.nombre,
        quotationConfigId: cotizacionConfig?.id, // ✅ Vinculación automática a cotización activa
        serviciosBase: serviciosBase.map(s => ({ ...s })),
        gestion: {
          precio: gestion.precio,
          mesesGratis: gestion.mesesGratis,
          mesesPago: gestion.mesesPago,
        },
        paquete: {
          desarrollo: paqueteActual.desarrollo,
          descuento: paqueteActual.descuento,
          tipo: paqueteActual.tipo || '',
          descripcion: paqueteActual.descripcion || 'Paquete personalizado para empresas.',
          // Sistema de descuentos reinventado
          configDescuentos: getDefaultConfigDescuentos(),
        },
        otrosServicios: otrosServiciosUnificados,
        costos: {
          inicial: 0,
          año1: 0,
          año2: 0,
        },
        activo: true,
        createdAt: new Date().toISOString(),
      }

      // Calcular costos
      nuevoSnapshot.costos.inicial = calcularCostoInicialSnapshot(nuevoSnapshot)
      nuevoSnapshot.costos.año1 = calcularCostoAño1Snapshot(nuevoSnapshot)
      nuevoSnapshot.costos.año2 = calcularCostoAño2Snapshot(nuevoSnapshot)

      // Guardar en la API
      const snapshotGuardado = await crearSnapshot(nuevoSnapshot)
      setSnapshots([...snapshots, snapshotGuardado])
      
      // Limpiar campos
      setPaqueteActual({ nombre: '', desarrollo: 0, descuento: 0, tipo: '', descripcion: '', activo: true })
      // Limpiar estados legacy
      // Legacy ya removido, solo limpiar serviciosOpcionales
      setServiciosOpcionales([])
      setNuevoServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })

      // Llamar refresh global para notificar a todos los componentes
      await refreshSnapshots()

      // PROPUESTA 2: Toast mejorado con información de vinculación ✅
      toast.success(`✅ Paquete creado y vinculado: "${paqueteActual.nombre}" a cotización ${cotizacionConfig?.numero || cotizacionConfig?.id}`)
    } catch (error) {
      console.error('Error al crear paquete:', error)
      mostrarDialogoGenerico({
        tipo: 'error',
        titulo: 'Error al guardar',
        icono: '❌',
        mensaje: 'Ocurrió un error al guardar el paquete. Por favor intenta de nuevo.',
        botones: [
          {
            label: 'Entendido',
            action: () => {},
            style: 'primary'
          }
        ]
      })
    }
  }

  /**
   * FASE 10: Obtener la cotización activa actual
   */
  const obtenerCotizacionActiva = () => {
    return quotations.find(q => q.activo === true && q.isGlobal === true)
  }

  /**
   * FASE 10 + 11 + 12: Lógica centralizada para abrir modal de editar/ver
   * Verifica si la cotización está activa, y si no, muestra diálogo
   */
  const abrirModalConActivacion = (quotation: QuotationConfig, modo: 'editar' | 'ver') => {
    const cotizacionActiva = obtenerCotizacionActiva()
    
    // Guardar estado ANTES de abrir (para luego comparar) - FASE 12
    setQuotationEstadoAntes({
      wasGlobal: quotation.isGlobal,
      wasActive: quotation.activo,
      wasId: quotation.id
    })
    
    // Si NO es la cotización activa, mostrar diálogo de confirmación
    if (!quotation.activo || !quotation.isGlobal) {
      mostrarDialogoGenerico({
        tipo: 'activar',
        titulo: 'Cotización Inactiva',
        icono: '⚠️',
        mensaje: `La cotización "${quotation.numero || 'Sin número'}" no está activa actualmente.${
          modo === 'editar'
            ? ' Para editarla, primero debe activarla. Esto desactivará todas las demás cotizaciones.'
            : ' Puede verla en modo lectura o activarla para editarla.'
        }`,
        modoAbrir: modo,
        quotation: quotation,
        botones: []
      })
    } 
    // FASE 11: Si es cotización ACTIVA Y modo EDITAR, mostrar diálogo de confirmación
    else if (modo === 'editar' && quotation.isGlobal === true) {
      mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Cotización Activa',
        icono: '⚠️',
        mensaje: 'Esta es la cotización ACTIVA actualmente. Los cambios serán guardados inmediatamente. ¿Deseas continuar editando?',
        subtitulo: quotation.numero || 'Sin número',
        botones: [
          {
            label: 'Cancelar',
            action: () => {
              setQuotationEstadoAntes(null)
            },
            style: 'secondary'
          },
          {
            label: 'Continuar editando',
            action: () => {
              abrirModalEditarInterno(quotation, modo)
            },
            style: 'primary'
          }
        ]
      })
    }
    // Si ya está activa Y modo VER
    else {
      abrirModalEditarInterno(quotation, modo)
    }
  }

  /**
   * FASE 10: Función interna para abrir el modal sin verificación
   */
  const abrirModalEditarInterno = (quotation: QuotationConfig, modo: 'editar' | 'ver') => {
    // 1. Cargar snapshots de esta quotation (solo activos)
    const snapshotsFiltrados = snapshots.filter(
      s => s.quotationConfigId === quotation.id && s.activo !== false
    )

    // 2. Guardar contexto
    setQuotationEnModal(quotation)
    setSnapshotsModalActual(snapshotsFiltrados)

    // 3. Seleccionar primer snapshot
    if (snapshotsFiltrados.length > 0) {
      const firstSnapshot = snapshotsFiltrados[0]

      // Inicializar configDescuentos si no existe (nuevo sistema)
      const snapshotConDescuentos = {
        ...firstSnapshot,
        paquete: {
          ...firstSnapshot.paquete,
          // Usar configDescuentos del snapshot o inicializar con defaults
          configDescuentos: firstSnapshot.paquete.configDescuentos || getDefaultConfigDescuentos(),
        },
      }

      setSnapshotEditando(snapshotConDescuentos)
      setSnapshotOriginalJson(JSON.stringify(firstSnapshot))
      setActiveTabFila2(firstSnapshot.id)
    }

    // 4. Inicializar TABs
    setActiveTabFila1('cotizacion')
    setActiveTabFila3('descripcion')

    // 5. Establecer modo según parámetro
    if (modo === 'ver') {
      setReadOnly(true)
    } else {
      setReadOnly(false)
    }
    setAlertaMostradaEnSesion(false)

    // 6. Mostrar modal
    setShowModalEditar(true)
  }

  /**
   * FASE 10: Función para activar la cotización y luego abrir el modal
   */
  const activarYAbrirModal = async () => {
    if (!datosDialogo?.quotation) return

    try {
      // Desactivar todas las demás
      await desactivarTodas(datosDialogo.quotation.id)

      // Recargar cotizaciones para tener el estado actualizado
      await recargarQuotations()

      // Abrir el modal
      abrirModalEditarInterno(datosDialogo.quotation, datosDialogo.modoAbrir || 'editar')

      // Cerrar diálogo
      setMostrarDialogo(false)
      setDatosDialogo(null)

      toast.success('✓ Cotización activada. Abriendo para editar...')
    } catch (error) {
      console.error('Error al activar cotización:', error)
      toast.error('Error al activar la cotización')
    }
  }

  /**
   * FASE 10: Función para abrir sin activar (solo lectura)
   */
  const abrirSinActivar = () => {
    if (!datosDialogo?.quotation) return
    
    abrirModalEditarInterno(datosDialogo.quotation, datosDialogo.modoAbrir || 'ver')
    setMostrarDialogo(false)
    setDatosDialogo(null)
  }

  const abrirModalEditar = (quotation: QuotationConfig) => {
    abrirModalConActivacion(quotation, 'editar')
  }

  const abrirModalVer = (quotation: QuotationConfig) => {
    abrirModalConActivacion(quotation, 'ver')
  }

  // FASE 14: Función para detectar cambios en el snapshot
  const hayCambiosEnSnapshot = (): boolean => {
    if (!snapshotEditando || !snapshotOriginalJson) return false
    
    const snapshotActual = JSON.stringify(snapshotEditando)
    return snapshotActual !== snapshotOriginalJson
  }

  // FASE 14: Función para cerrar modal con validación de cambios sin guardar
  const cerrarModalConValidacion = () => {
    if (readOnly) {
      // Modo lectura → Cerrar sin preguntar
      setShowModalEditar(false)
      setSnapshotEditando(null)
      setQuotationEstadoAntes(null)
      return
    }

    if (hayCambiosEnSnapshot()) {
      // Hay cambios → Preguntar
      mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Cambios sin guardar',
        icono: '⚠️',
        mensaje: '¿Estás seguro de que deseas cerrar? Los cambios se perderán.',
        botones: [
          {
            label: 'Seguir editando',
            action: () => {},
            style: 'secondary'
          },
          {
            label: 'Descartar cambios',
            action: () => {
              setShowModalEditar(false)
              setSnapshotEditando(null)
              setQuotationEstadoAntes(null)
              setSnapshotOriginalJson(null)
            },
            style: 'danger'
          }
        ]
      })
    } else {
      // No hay cambios → Cerrar directamente
      setShowModalEditar(false)
      setSnapshotEditando(null)
      setQuotationEstadoAntes(null)
    }
  }

  const guardarEdicion = async () => {
    if (!snapshotEditando) return

    try {
      const actualizado = { ...snapshotEditando }
      actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
      actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
      actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)

      // Actualizar en la API
      const snapshotActualizado = await actualizarSnapshot(actualizado.id, actualizado)
      setSnapshots(snapshots.map(s => s.id === actualizado.id ? snapshotActualizado : s))
      
      // Llamar refresh global para notificar a todos los componentes
      await refreshSnapshots()
      
      // FASE 13: Lógica de activación al guardar desde cotización INACTIVA
      if (quotationEstadoAntes?.wasGlobal === false && quotationEnModal) {
        // Era INACTIVA → Preguntar si activar
        mostrarDialogoGenerico({
          tipo: 'confirmacion',
          titulo: '¡Cambios guardados!',
          icono: '✅',
          mensaje: '¿Deseas activar esta cotización ahora? Al activarla, las demás serán desactivadas.',
          subtitulo: quotationEnModal.numero || 'Sin número',
          botones: [
            {
              label: 'Dejar inactiva',
              action: () => {
                toast.success('✓ Cambios guardados (cotización sigue inactiva)')
              },
              style: 'secondary'
            },
            {
              label: 'Activar ahora',
              action: async () => {
                // Desactivar todas las demás
                await desactivarTodas(quotationEnModal.id)
                await recargarQuotations()
                
                toast.success('✓ Cotización activada y cambios guardados')
              },
              style: 'success'
            }
          ]
        })
      } else {
        // Era ACTIVA → Solo guardar cambios sin preguntar
        toast.success('✓ Cotización actualizada')
      }

      // Cerrar modal solo si la preferencia está activa
      if (userPreferences?.cerrarModalAlGuardar) {
        setShowModalEditar(false)
        setSnapshotEditando(null)
        setQuotationEstadoAntes(null)
      }
      setSnapshotOriginalJson(JSON.stringify(snapshotActualizado))
    } catch (error) {
      console.error('Error al guardar edición:', error)
      toast.error('❌ Error al actualizar el paquete. Por favor intenta de nuevo.')
    }
  }

  // Estado para autoguardado y control de cambios
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedJson, setLastSavedJson] = useState<string | null>(null)
  const autoSaveDelay = 800 // ms
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Función de autoguardado debounced
  useEffect(() => {
    if (!snapshotEditando) return

    const currentJson = JSON.stringify({
      id: snapshotEditando.id,
      nombre: snapshotEditando.nombre,
      paquete: snapshotEditando.paquete,
      serviciosBase: snapshotEditando.serviciosBase,
      gestion: snapshotEditando.gestion,
      otrosServicios: snapshotEditando.otrosServicios,
      costos: snapshotEditando.costos,
      activo: snapshotEditando.activo,
    })

    // Si no hay cambios respecto al último guardado, no programar autoguardado
    if (lastSavedJson && lastSavedJson === currentJson) {
      return
    }

    // Limpiar timeout previo
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)

    // Programar autoguardado
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving')
      try {
        const actualizado = { ...snapshotEditando }
        actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
        actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
        actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
        const snapshotActualizado = await actualizarSnapshot(actualizado.id, actualizado)
        setSnapshots(prev => prev.map(s => s.id === actualizado.id ? snapshotActualizado : s))
        
        // Llamar refresh global para notificar a otros componentes
        await refreshSnapshots()
        
        const savedJson = JSON.stringify({
          id: snapshotActualizado.id,
          nombre: snapshotActualizado.nombre,
          paquete: snapshotActualizado.paquete,
          serviciosBase: snapshotActualizado.serviciosBase,
          gestion: snapshotActualizado.gestion,
          otrosServicios: snapshotActualizado.otrosServicios,
          costos: snapshotActualizado.costos,
          activo: snapshotActualizado.activo,
        })
        setLastSavedJson(savedJson)
        setAutoSaveStatus('saved')
        // Después de breve tiempo, volver a idle
        setTimeout(() => setAutoSaveStatus('idle'), 1500)
      } catch (e) {
        console.error('Error en autoguardado:', e)
        setAutoSaveStatus('error')
        // Reintentar luego
        setTimeout(() => setAutoSaveStatus('idle'), 4000)
      }
    }, autoSaveDelay)

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    }
  }, [snapshotEditando])

  // Ajustar lógica de cierre para considerar autoguardado
  const tieneCambiosSinGuardar = () => {
    if (!snapshotEditando) return false
    const currentJson = JSON.stringify({
      id: snapshotEditando.id,
      nombre: snapshotEditando.nombre,
      paquete: snapshotEditando.paquete,
      serviciosBase: snapshotEditando.serviciosBase,
      gestion: snapshotEditando.gestion,
      otrosServicios: snapshotEditando.otrosServicios,
      costos: snapshotEditando.costos,
      activo: snapshotEditando.activo,
    })
    return !lastSavedJson || lastSavedJson !== currentJson
  }

  // Detectar si una pestaña específica tiene cambios
  const pestañaTieneCambios = (tabId: string): boolean => {
    if (!snapshotEditando || !snapshotOriginalJson) return false
    
    const original = JSON.parse(snapshotOriginalJson)
    
    switch (tabId) {
      case 'descripcion':
        return (
          snapshotEditando.nombre !== original.nombre ||
          JSON.stringify(snapshotEditando.paquete) !== JSON.stringify(original.paquete)
        )
      case 'servicios-base':
        return JSON.stringify(snapshotEditando.serviciosBase) !== JSON.stringify(original.serviciosBase) ||
               JSON.stringify(snapshotEditando.gestion) !== JSON.stringify(original.gestion)
      case 'otros-servicios':
        return JSON.stringify(snapshotEditando.otrosServicios) !== JSON.stringify(original.otrosServicios)
      case 'descuentos':
        // Usar configDescuentos para comparación (nuevo sistema)
        return JSON.stringify(snapshotEditando.paquete.configDescuentos) !== JSON.stringify(original.paquete.configDescuentos) ||
               snapshotEditando.paquete.descuento !== original.paquete.descuento
      default:
        return false
    }
  }

  // Cerrar modal con validación de cambios sin guardar
  const handleCerrarModalEditar = () => {
    // FASE 14: Usar nueva función mejorada para cerrar con validación
    if (readOnly) {
      // Modo lectura → Cerrar sin preguntar
      setShowModalEditar(false)
      setSnapshotEditando(null)
      setQuotationEstadoAntes(null)
      setSnapshotOriginalJson(null)
      return
    }

    if (hayCambiosEnSnapshot()) {
      // Hay cambios → Preguntar
      mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Cambios sin guardar',
        icono: '⚠️',
        mensaje: '¿Estás seguro de que deseas cerrar? Los cambios se perderán.',
        botones: [
          {
            label: 'Seguir editando',
            action: () => {},
            style: 'secondary'
          },
          {
            label: 'Descartar cambios',
            action: () => {
              setShowModalEditar(false)
              setSnapshotEditando(null)
              setQuotationEstadoAntes(null)
              setSnapshotOriginalJson(null)
            },
            style: 'danger'
          }
        ]
      })
    } else {
      // No hay cambios → Cerrar directamente
      setShowModalEditar(false)
      setSnapshotEditando(null)
      setQuotationEstadoAntes(null)
      setSnapshotOriginalJson(null)
    }
  }

  // Foco inicial al abrir modal
  useEffect(() => {
    if (showModalEditar && nombrePaqueteInputRef.current) {
      nombrePaqueteInputRef.current.focus()
    }
  }, [showModalEditar])

  // Manejo de tecla Escape dentro del modal
  useEffect(() => {
    if (!showModalEditar) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCerrarModalEditar()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showModalEditar, snapshotEditando, snapshotOriginalJson])

  // FASE 4: Mostrar alerta si no hay cotizaciones activas
  useEffect(() => {
    if (quotations.length > 0) {
      verificarCotizacionesActivas(quotations)
    }
  }, [quotations])

  // ==================== USEEFFECT PARA ACTUALIZAR VALIDACIÓN DE TABS ====================
  useEffect(() => {
    // Actualizar estado de validación cada vez que cambian los datos principales
    actualizarEstadoValidacionTabs()
  }, [
    cotizacionConfig,
    serviciosBase,
    paqueteActual,
    snapshots,
  ])

  // ==================== USEEFFECT PARA MIGRAR SNAPSHOTS ACTIVOS SIN VINCULACIÓN ====================
  useEffect(() => {
    const migrarSnapshotsSinVinculacion = async () => {
      // Solo ejecutar si hay cotizacionConfig y snapshots cargados
      if (!cotizacionConfig?.id || !snapshots || snapshots.length === 0) {
        console.log('⏭️ Saltando migración - cotizacionConfig:', !!cotizacionConfig?.id, 'snapshots:', snapshots?.length)
        return
      }

      // Buscar snapshots ACTIVOS sin quotationConfigId
      const paquetesActivosSinVinculacion = snapshots.filter(s => s.activo && !s.quotationConfigId)
      
      console.log('📊 Snapshots activos:', snapshots.filter(s => s.activo).length)
      console.log('📊 Snapshots activos sin vinculación:', paquetesActivosSinVinculacion.length)
      
      if (paquetesActivosSinVinculacion.length === 0) {
        console.log('✅ Todos los paquetes activos ya están vinculados')
        return
      }

      console.warn(`⚠️ Detectados ${paquetesActivosSinVinculacion.length} paquete(s) activo(s) sin vinculación. Migrando a ${cotizacionConfig.id}...`)

      try {
        // Actualizar cada snapshot ACTIVO sin vinculación con el quotationConfigId actual
        for (const snapshot of paquetesActivosSinVinculacion) {
          console.log(`🔄 Vinculando snapshot ${snapshot.id} a cotización ${cotizacionConfig.id}`)
          const snapshotActualizado = {
            ...snapshot,
            quotationConfigId: cotizacionConfig.id,
          }
          
          // Guardar en la API
          await actualizarSnapshot(snapshotActualizado)
          console.log(`✅ Snapshot ${snapshot.id} vinculado correctamente`)
        }

        // Recargar snapshots después de la migración
        console.log('🔄 Recargando snapshots desde la API...')
        const snapshotsActualizados = await obtenerSnapshotsCompleto()
        setSnapshots(snapshotsActualizados)
        console.log(`✅ ${paquetesActivosSinVinculacion.length} paquete(s) activo(s) vinculados correctamente`)
        
        toast.info(`✅ ${paquetesActivosSinVinculacion.length} paquete(s) activo(s) vinculados correctamente`)
      } catch (error) {
        console.error('❌ Error migrando snapshots:', error)
        toast.error('Error al vincular paquetes. Intenta recargar la página.')
      }
    }

    migrarSnapshotsSinVinculacion()
  }, [cotizacionConfig?.id, snapshots.length])

  const handleEliminarSnapshot = async (id: string) => {
    mostrarDialogoGenerico({
      tipo: 'confirmacion',
      titulo: '¿Eliminar paquete?',
      icono: '🗑️',
      mensaje: '¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.',
      botones: [
        {
          label: 'Cancelar',
          action: () => {},
          style: 'secondary'
        },
        {
          label: 'Eliminar',
          action: async () => {
            try {
              await eliminarSnapshot(id)
              
              // Actualizar estado local inmediatamente para reflejar el cambio en la UI
              setSnapshots(prev => prev.filter(s => s.id !== id))
              
              // También actualizar snapshotsModalActual si el modal está abierto
              setSnapshotsModalActual(prev => prev.filter(s => s.id !== id))
              
              // Llamar refresh global para notificar a todos los componentes externos
              await refreshSnapshots()
              
              // Toast de éxito
              toast.success('✅ Paquete eliminado de la base de datos')
            } catch (error) {
              console.error('Error al eliminar snapshot:', error)
              // Toast de error
              toast.error('❌ Error al eliminar el paquete')
            }
          },
          style: 'danger'
        }
      ]
    })
  }

  // ==================== FUNCIONES AUXILIARES FASES 3-6 ====================

  /**
   * Desactiva todas las cotizaciones excepto la especificada
   */
  const desactivarTodas = async (exceptoId: string) => {
    try {
      const response = await fetch('/api/quotations/deactivate-others', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exceptoId }),
      })
      if (!response.ok) throw new Error('Error desactivando cotizaciones')
      return true
    } catch (error) {
      console.error('Error en desactivarTodas:', error)
      toast.error('Error al desactivar otras cotizaciones')
      return false
    }
  }

  /**
   * Recarga la lista de cotizaciones desde la BD
   */
  const recargarQuotations = async () => {
    try {
      const response = await fetch('/api/quotations')
      const data = await response.json()
      if (data.success) {
        setQuotations(data.data || [])
      }
    } catch (error) {
      console.error('Error recargando quotations:', error)
    }
  }

  /**
   * PROPUESTA 3: Calcula resumen de paquetes para la confirmación
   */
  const calcularResumenPaquetes = () => {
    const totalPaquetes = snapshots.length
    const totalServicios = snapshots.reduce((sum, s) => sum + s.serviciosBase.length, 0)
    const costoTotalInicial = snapshots.reduce((sum, s) => sum + (s.costos?.inicial || 0), 0)
    const costoTotalAño1 = snapshots.reduce((sum, s) => sum + (s.costos?.año1 || 0), 0)
    const costoTotalAño2 = snapshots.reduce((sum, s) => sum + (s.costos?.año2 || 0), 0)
    
    return {
      totalPaquetes,
      totalServicios,
      costoTotalInicial,
      costoTotalAño1,
      costoTotalAño2,
    }
  }

  /**
   * Verifica si hay cotizaciones activas y muestra alerta si no las hay
   */
  const verificarCotizacionesActivas = (quotations: QuotationConfig[]) => {
    const tieneActiva = quotations.some(q => q.isGlobal === true)
    if (!tieneActiva && !alertaMostradaEnSesion && quotations.length > 0) {
      toast.warning(
        '⚠️ No hay cotizaciones activas. Por favor, crea o activa una para iniciar cotizaciones a clientes'
      )
      setAlertaMostradaEnSesion(true)
    }
  }

  /**
   * Crea una NUEVA cotización con ID único
   */
  const crearNuevaCotizacion = async () => {
    try {
      toast.info('⏳ Creando nueva cotización...')

      const response = await fetch('/api/quotation-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0',
          tiempoValidez: 30,
          presupuesto: 'Menos de $300 USD',
          moneda: 'USD',
          empresa: '',
          sector: '',
          ubicacion: '',
          profesional: '',
          empresaProveedor: 'Urbanísima Constructora S.R.L',
          emailProveedor: '',
          whatsappProveedor: '',
          ubicacionProveedor: '',
          heroTituloMain: 'Mi Propuesta',
          heroTituloSub: 'Cotización personalizada',
        }),
      })

      if (!response.ok) throw new Error('Error creando cotización')

      const nuevaCotizacion = await response.json()

      // Cargar la nueva cotización en la UI
      setCotizacionConfig(nuevaCotizacion)

      // Resetear estado de validación de TABs
      setEstadoValidacionTabs({
        cotizacion: 'pendiente',
        oferta: 'pendiente',
        paquetes: 'pendiente',
        estilos: 'pendiente',
      })

      // Resetear snapshots (paquetes)
      setSnapshots([])

      // Ir al TAB Cotización
      setActivePageTab('cotizacion')

      toast.success('✅ Nueva cotización creada. Comienza completando el TAB Cotización.')
      
      // Recargar cotizaciones
      await recargarQuotations()
    } catch (error) {
      console.error('Error creando nueva cotización:', error)
      toast.error('Error al crear nueva cotización')
    }
  }

  /**
   * PROPUESTA 3: Mostrar modal de confirmación con resumen de paquetes antes de guardar
   */
  const mostrarConfirmacionGuardar = async () => {
    if (!cotizacionConfig) {
      mostrarDialogoGenerico({
        tipo: 'error',
        titulo: 'Sin cotización activa',
        icono: '⚠️',
        mensaje: 'No hay cotización cargada. Por favor, carga o crea una cotización primero.',
        botones: [
          {
            label: 'Entendido',
            action: () => {},
            style: 'primary'
          }
        ]
      })
      return
    }

    const resumen = calcularResumenPaquetes()

    // Crear contenido del modal
    const mensaje = `
📋 RESUMEN DE COTIZACIÓN:

Empresa: ${cotizacionConfig.empresa || 'Sin especificar'}
Profesional: ${cotizacionConfig.profesional || 'Sin especificar'}

📦 PAQUETES: ${resumen.totalPaquetes}
🔧 SERVICIOS TOTALES: ${resumen.totalServicios}

💰 COSTOS:
• Inicial: $${resumen.costoTotalInicial.toFixed(2)}
• Año 1: $${resumen.costoTotalAño1.toFixed(2)}
• Año 2: $${resumen.costoTotalAño2.toFixed(2)}`

    mostrarDialogoGenerico({
      tipo: 'confirmacion',
      titulo: 'Guardar Cotización',
      icono: '💾',
      mensaje: mensaje,
      subtitulo: '¿Deseas guardar esta cotización con todos sus paquetes?',
      botones: [
        {
          label: 'Cancelar',
          action: () => {},
          style: 'secondary'
        },
        {
          label: 'Guardar',
          action: async () => {
            await guardarConfiguracionActual()
          },
          style: 'primary'
        }
      ]
    })
  }

  /**
   * Función helper genérica para mostrar diálogos
   * Centraliza toda la lógica de diálogos en un solo lugar
   */
  const mostrarDialogoGenerico = (config: DialogConfig) => {
    setDatosDialogo(config)
    setMostrarDialogo(true)
  }

  /**
   * Guarda la configuración de cotización en el header (Guardar Paquete)
   * VERSIÓN MEJORADA: Valida todos los TABs de forma integrada
   */
  const guardarConfiguracionActual = async () => {
    // PASO 0: Actualizar estado de validación de todos los TABs
    actualizarEstadoValidacionTabs()

    // PASO 1: Validar que hay cotización cargada
    if (!cotizacionConfig) {
      toast.error('No hay cotización cargada')
      return
    }

    // PASO 2: Validar que todos los TABs están OK
    const validarCotizacion = validarTabCotizacion()
    const validarOferta = validarTabOferta()
    const validarPaquetes = validarTabPaquetes()

    if (!validarCotizacion.valido) {
      toast.error(`Cotización incompleto:\n${validarCotizacion.errores.join('\n')}`)
      setActivePageTab('cotizacion')
      return
    }

    if (!validarOferta.valido) {
      toast.error(`Oferta incompleto:\n${validarOferta.errores.join('\n')}`)
      setActivePageTab('oferta')
      return
    }

    if (!validarPaquetes.valido) {
      toast.error(`Paquetes incompleto:\n${validarPaquetes.errores.join('\n')}`)
      setActivePageTab('paquetes')
      return
    }

    // PASO 3: INTENTAR VINCULAR automáticamente paquetes activos sin vinculación
    const paquetesActivosSinVinculacion = snapshots.filter(s => s.activo && !s.quotationConfigId)
    if (paquetesActivosSinVinculacion.length > 0) {
      console.log(`⏳ Intentando vincular ${paquetesActivosSinVinculacion.length} paquete(s) activo(s)...`)
      try {
        for (const snapshot of paquetesActivosSinVinculacion) {
          const snapshotActualizado = {
            ...snapshot,
            quotationConfigId: cotizacionConfig?.id,
          }
          await actualizarSnapshot(snapshotActualizado)
        }
        // Recargar snapshots después de vincular
        const snapshotsActualizados = await obtenerSnapshotsCompleto()
        setSnapshots(snapshotsActualizados)
        toast.info(`✅ ${paquetesActivosSinVinculacion.length} paquete(s) vinculado(s) correctamente`)
      } catch (error) {
        console.error('Error vinculando paquetes:', error)
        toast.error(`Error al vincular ${paquetesActivosSinVinculacion.length} paquete(s). Por favor intenta de nuevo.`)
        return
      }
    }

    // PASO 4: Validaciones específicas de campos requeridos
    const errores: typeof erroresValidacionCotizacion = {}

    if (!cotizacionConfig?.empresa?.trim()) {
      errores.empresa = 'Requerido'
    }
    if (!cotizacionConfig?.profesional?.trim()) {
      errores.profesional = 'Requerido'
    }
    if (cotizacionConfig?.emailProveedor && !validarEmail(cotizacionConfig.emailProveedor)) {
      errores.emailProveedor = 'Email inválido'
    }
    if (cotizacionConfig?.whatsappProveedor && !validarWhatsApp(cotizacionConfig.whatsappProveedor)) {
      errores.whatsappProveedor = 'WhatsApp inválido (ej: +535 856 9291)'
    }
    if (cotizacionConfig && !validarFechas(cotizacionConfig.fechaEmision, cotizacionConfig.fechaVencimiento)) {
      errores.fechas = 'Fecha vencimiento debe ser > emisión'
    }

    if (Object.keys(errores).length > 0) {
      setErroresValidacionCotizacion(errores)
      toast.error('⚠️ Hay errores en los datos. Revisa los campos resaltados.')
      setActivePageTab('cotizacion')
      return
    }

    // PASO 5: Validar si está habilitada la validación completa
    if (userPreferences?.validarDatosAntes) {
      const { valido, errores: erroresCompletos } = validarQuotation(cotizacionConfig)
      if (!valido) {
        toast.error(`Errores de validación:\n${erroresCompletos.slice(0, 3).join('\n')}`)
        return
      }
    }

    // PASO 6: Comparar con datos guardados para evitar duplicados
    const sonIguales = compararQuotations(cotizacionConfig, {
      numero: cotizacionConfig.numero,
      empresa: cotizacionConfig.empresa,
      sector: cotizacionConfig.sector,
      ubicacion: cotizacionConfig.ubicacion,
      emailCliente: cotizacionConfig.emailCliente,
      whatsappCliente: cotizacionConfig.whatsappCliente,
      profesional: cotizacionConfig.profesional,
      empresaProveedor: cotizacionConfig.empresaProveedor,
      emailProveedor: cotizacionConfig.emailProveedor,
      whatsappProveedor: cotizacionConfig.whatsappProveedor,
      ubicacionProveedor: cotizacionConfig.ubicacionProveedor,
      heroTituloMain: cotizacionConfig.heroTituloMain,
      heroTituloSub: cotizacionConfig.heroTituloSub,
    })

    if (sonIguales) {
      toast.info('ℹ️ La cotización ya está configurada con estos datos')
      return
    }

    try {
      // PASO 7: Guardar en BD - Incrementar versión
      toast.info('⏳ Guardando cotización...')
      
      // Incrementar versionNumber cada vez que se guarda
      const cotizacionConVersionActualizada = {
        ...cotizacionConfig,
        versionNumber: (cotizacionConfig.versionNumber || 1) + 1,
      }
      
      const response = await fetch(`/api/quotation-config/${cotizacionConfig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cotizacionConVersionActualizada),
      })

      if (!response.ok) throw new Error('Error guardando')

      // PASO 8: Actualizar estado local con la nueva versión
      setCotizacionConfig(cotizacionConVersionActualizada)

      // PASO 9: Desactivar todas y activar esta
      const desactivOk = await desactivarTodas(cotizacionConfig.id)
      if (!desactivOk) return

      // PASO 10: Mostrar éxito
      setErroresValidacionCotizacion({})
      toast.success(
        '✅ Cotización guardada correctamente. El resto han sido puestas en modo inactivo'
      )

      // PASO 11: Recargar datos
      await recargarQuotations()

      // PASO 12: Mostrar confirmación adicional si preferencia está activa
      if (userPreferences?.mostrarConfirmacionGuardado) {
        toast.info('✓ Cambios guardados exitosamente')
      }

      // PASO 13: Cerrar modal si preferencia está activa
      if (userPreferences?.cerrarModalAlGuardar && showModalEditar) {
        handleCerrarModalEditar()
      }
    } catch (error) {
      console.error('Error guardando:', error)
      toast.error('Error al guardar cotización. Intenta de nuevo.')
    }
  }

  // ==================== FIN FUNCIONES AUXILIARES ====================

  // Funciones para PDF y Guardar Configuración
  const handleDescargarPdf = () => {
    if (snapshots.length === 0) {
      mostrarDialogoGenerico({
        tipo: 'error',
        titulo: 'Sin paquetes',
        icono: '📦',
        mensaje: 'No hay paquetes para descargar. Por favor, crea un paquete primero.',
        botones: [
          {
            label: 'Entendido',
            action: () => {},
            style: 'primary'
          }
        ]
      })
      return
    }
    const ultimoSnapshot = snapshots[snapshots.length - 1]
    generarPdfDesdeSnapshot(ultimoSnapshot)
  }

  const generarPdfDesdeSnapshot = (snapshot: PackageSnapshot) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin

    // Colores RGB (paleta corporativa: rojo, negro y dorado)
    // Primario: Rojo (#DC2626)
    const colorPrimario = [220, 38, 38] as [number, number, number]
    // Secundario de sección: Dorado claro (#FCD34D) para resaltar encabezados
    const colorSecundario = [252, 211, 77] as [number, number, number]

    // Encabezado
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
    doc.rect(0, 0, pageWidth, 35, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.text('PRESUPUESTO', margin, 20)
    yPos = 45

    // Información básica
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(`Proyecto: ${snapshot.nombre}`, margin, yPos)
    yPos += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const fecha = new Date(snapshot.createdAt).toLocaleDateString('es-ES')
    doc.text(`Fecha: ${fecha}`, margin, yPos)
    yPos += 15

    // Función para crear secciones
    const crearSeccion = (titulo: string, contenido: string[]) => {
      if (yPos > pageHeight - 35) {
        doc.addPage()
        yPos = margin
      }
      
      doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
      doc.rect(margin - 2, yPos - 6, contentWidth + 4, 8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      // Títulos de sección en rojo corporativo
      doc.setTextColor(220, 38, 38)
      doc.text(titulo, margin + 2, yPos)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(0, 0, 0)
      contenido.forEach((linea) => {
        if (yPos > pageHeight - 12) {
          doc.addPage()
          yPos = margin
        }
        doc.text(linea, margin + 5, yPos)
        yPos += 5
      })
      yPos += 5
    }

    // Sección Paquete - Usar el nuevo sistema de descuentos
    const preview = calcularPreviewDescuentos(snapshot)
    const paqueteContent = [
      `• Costo desarrollo: $${snapshot.paquete.desarrollo.toFixed(2)}`,
      ...(preview.desarrolloConDescuento < snapshot.paquete.desarrollo 
        ? [`• Descuento aplicado: ${((1 - preview.desarrolloConDescuento / snapshot.paquete.desarrollo) * 100).toFixed(1)}%`]
        : []
      ),
      `• Total neto: $${preview.desarrolloConDescuento.toFixed(2)}`,
    ]
    crearSeccion('📦 PAQUETE', paqueteContent)

    // Sección Servicios Base
    const serviciosContent = snapshot.serviciosBase.map(s => 
      `• ${s.nombre}: $${s.precio.toFixed(2)}/mes (${s.mesesGratis} meses gratis, ${s.mesesPago} meses pago)`
    )
    crearSeccion('🌐 SERVICIOS BASE', serviciosContent)

    // Sección Gestión (si aplica)
    if (snapshot.gestion.precio > 0) {
      const gestionContent = [
        `• Precio mensual de gestión: $${snapshot.gestion.precio.toFixed(2)}`,
        `• Período sin costo: ${snapshot.gestion.mesesGratis} meses`,
        `• Período a pagar: ${snapshot.gestion.mesesPago} meses`,
      ]
      crearSeccion('📋 GESTIÓN MENSUAL', gestionContent)
    }

    // Sección Otros Servicios
    if (snapshot.otrosServicios.length > 0) {
      const otrosContent = snapshot.otrosServicios.map(
        (s) => `• ${s.nombre}: $${s.precio.toFixed(2)}/mes (${s.mesesGratis} meses gratis, ${s.mesesPago} meses pago)`
      )
      crearSeccion('⚙️ OTROS SERVICIOS', otrosContent)
    }

    // Resumen de Costos (más destacado)
    if (yPos > pageHeight - 50) {
      doc.addPage()
      yPos = margin
    }
    
    // Resumen de costos en dorado (accent oscuro #D97706)
    doc.setFillColor(217, 119, 6)
    doc.rect(margin - 2, yPos - 6, contentWidth + 4, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text('💰 RESUMEN DE COSTOS', margin + 2, yPos)
    yPos += 12

    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const costos = [
      { label: 'Pago Inicial:', valor: snapshot.costos.inicial.toFixed(2) },
      { label: 'Año 1 (9 meses restantes):', valor: snapshot.costos.año1.toFixed(2) },
      { label: 'Año 2 en adelante (anual):', valor: snapshot.costos.año2.toFixed(2) },
    ]

    costos.forEach((costo, idx) => {
      doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal')
      doc.setFontSize(idx === 0 ? 11 : 10)
      doc.text(costo.label, margin + 5, yPos)
      doc.setFont('helvetica', 'bold')
      // Valores destacados en rojo corporativo
      doc.setTextColor(220, 38, 38)
      doc.setFontSize(11)
      doc.text(`$${costo.valor}`, pageWidth - margin - 25, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 8
    })

    // Pie de página
    yPos = pageHeight - 12
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Este presupuesto fue generado automáticamente el ' + fecha + '. Válido por 30 días.', margin, yPos)

    doc.save(`presupuesto-${snapshot.nombre.replace(/\s+/g, '-')}.pdf`)
  }

  // ---- Autoguardado de configuración general fuera del modal ----
  // Autoguardado general fuera del modal eliminado: solo se mantiene autoguardado dentro del modal de edición

  // Definir pestañas principales
  const pageTabs: TabItem[] = [
    {
      id: 'cotizacion',
      label: `Cotización ${estadoValidacionTabs.cotizacion === 'error' ? '⚠️' : estadoValidacionTabs.cotizacion === 'ok' ? '✓' : ''}`,
      icon: <FaFileAlt size={16} />,
      content: <div />, // Placeholder
      hasChanges: estadoValidacionTabs.cotizacion === 'error',
    },
    {
      id: 'oferta',
      label: `Oferta ${estadoValidacionTabs.oferta === 'error' ? '⚠️' : estadoValidacionTabs.oferta === 'ok' ? '✓' : ''}`,
      icon: <FaGlobe size={16} />,
      content: <div />, // Placeholder
      hasChanges: estadoValidacionTabs.oferta === 'error',
    },
    {
      id: 'paquetes',
      label: `Paquetes ${estadoValidacionTabs.paquetes === 'error' ? '⚠️' : estadoValidacionTabs.paquetes === 'ok' ? '✓' : ''}`,
      icon: <FaGift size={16} />,
      content: <div />, // Placeholder
      hasChanges: estadoValidacionTabs.paquetes === 'error',
    },
    {
      id: 'estilos',
      label: `Estilos y Diseño ${estadoValidacionTabs.estilos === 'error' ? '⚠️' : estadoValidacionTabs.estilos === 'ok' ? '✓' : ''}`,
      icon: <FaPalette size={16} />,
      content: <div />, // Placeholder
      hasChanges: estadoValidacionTabs.estilos === 'error',
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <FaHistory size={16} />,
      content: (
        <Historial 
          quotations={quotations} 
          snapshots={snapshots}
          onEdit={(quotation) => {
            abrirModalEditar(quotation)
          }}
            onDelete={async (quotationId) => {
              // Guardar el estado actual por si acaso necesitamos revertir
              const quotationsAnteriores = quotations
              
              console.log('🔴 DELETE HANDLER: Iniciando eliminación de cotización:', quotationId)
              console.log('📊 Estado actual - Total cotizaciones:', quotationsAnteriores.length)
              
              try {
                // PASO 1: Eliminar localmente del estado INMEDIATAMENTE para UI responsiva
                const quotationsActualizadas = quotationsAnteriores.filter(q => q.id !== quotationId)
                setQuotations(quotationsActualizadas)
                console.log('✅ DELETE HANDLER: Estado actualizado localmente. Cotizaciones restantes:', quotationsActualizadas.length)
                
                // PASO 2: Enviar DELETE a la API
                console.log('🔄 DELETE HANDLER: Enviando DELETE a /api/quotations/' + quotationId)
                const response = await fetch(`/api/quotations/${quotationId}`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' }
                })
                
                console.log('📌 DELETE HANDLER: Respuesta HTTP status:', response.status, 'ok:', response.ok)
                
                if (!response.ok) {
                  // Si falla, restaurar inmediatamente
                  console.error('DELETE HANDLER: HTTP Error - restaurando estado')
                  setQuotations(quotationsAnteriores)
                  throw new Error(`HTTP ${response.status}`)
                }
                
                const resultData = await response.json()
                console.log('📋 DELETE HANDLER: Respuesta JSON:', resultData)
                
                if (resultData.success) {
                  // Éxito confirmado - mantener el estado actualizado
                  console.log('✅ DELETE HANDLER: Eliminación exitosa en base de datos')
                  toast.success('✅ Cotización eliminada correctamente')
                } else {
                  // API retorna error - restaurar
                  console.error('DELETE HANDLER: API error:', resultData.error)
                  setQuotations(quotationsAnteriores)
                  toast.error('Error en el servidor: ' + (resultData.error || 'Error desconocido'))
                }
              } catch (error) {
                console.error('Error eliminando cotización:', error)
                // Restaurar el estado original en caso de error
                setQuotations(quotationsAnteriores)
                toast.error('Error al eliminar la cotización. Por favor intenta de nuevo.')
              }
            }}
            onToggleActive={async (quotationId, newStatus) => {
              try {
                // FASE 3: Si va a activarse, desactivar todas las otras
                if (newStatus.isGlobal === true) {
                  await desactivarTodas(quotationId)
                  toast.success('✓ Cotización activada. El resto de cotizaciones han sido desactivadas')
                } else {
                  // Si va a desactivarse, solo actualizar este registro
                  const response = await fetch(`/api/quotations/${quotationId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      activo: newStatus.activo,
                      isGlobal: newStatus.isGlobal
                    })
                  })
                  if (response.ok) {
                    toast.success('✓ Cotización desactivada')
                  } else {
                    throw new Error('Error al desactivar')
                  }
                }
                // Recargar cotizaciones
                await recargarQuotations()
              } catch (error) {
                console.error('Error actualizando cotización:', error)
                toast.error('Error al actualizar el estado')
              }
            }}
            onViewProposal={(quotation) => {
              abrirModalVer(quotation)
            }}
          />
      ),
      hasChanges: false,
    },
    {
      id: 'preferencias',
      label: 'Preferencias',
      icon: <FaCog size={16} />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
  ]

  return (
    <div className="relative min-h-screen bg-gh-bg text-gh-text">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header con botones de acción */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gh-border pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gh-text mb-2">
                Panel Administrativo
              </h1>
              <p className="text-sm text-gh-text-muted">
                Gestione toda la configuración de su propuesta de cotización.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDescargarPdf}
                className="px-6 py-2.5 bg-gh-success text-white rounded-lg hover:bg-gh-success-hover transition-all flex items-center gap-2 text-sm font-semibold active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gh-success/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg"
              >
                <FaDownload /> Descargar PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={crearNuevaCotizacion}
                className="px-6 py-2.5 bg-gh-success text-white rounded-lg hover:bg-gh-success-hover transition-all flex items-center gap-2 text-sm font-semibold active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gh-success/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg"
              >
                <FaPlus /> Nueva Cotización
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={mostrarConfirmacionGuardar}
                className="px-6 py-2.5 bg-gh-success text-white rounded-lg hover:bg-gh-success-hover transition-all flex items-center gap-2 text-sm font-semibold active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gh-success/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg-absolute"
              >
                <FaSave /> Guardar Cotización
              </motion.button>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/30 text-white rounded-lg hover:bg-white/40 transition-all flex items-center gap-2 text-xs font-semibold border border-white/50 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                >
                  <FaArrowLeft /> Volver
                </motion.button>
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards snapshots={snapshots} cargandoSnapshots={cargandoSnapshots} />

          {/* Tab Navigation */}
          <div>
            <TabsModal
              tabs={pageTabs}
              activeTab={activePageTab}
              onTabChange={handleCambioTab}
            />
          </div>

          {/* Tab Content - usando componentes */}
          <div className="bg-gh-bg rounded-b-md border-b border-l border-r border-gh-border">
            {/* TAB 1: COTIZACIÓN */}
            {activePageTab === 'cotizacion' && (
              <CotizacionTab
                cotizacionConfig={cotizacionConfig}
                setCotizacionConfig={setCotizacionConfig}
                cargandoCotizacion={cargandoCotizacion}
                erroresValidacionCotizacion={erroresValidacionCotizacion}
                setErroresValidacionCotizacion={setErroresValidacionCotizacion}
                validarEmail={validarEmail}
                validarWhatsApp={validarWhatsApp}
                validarFechas={validarFechas}
                formatearFechaLarga={formatearFechaLarga}
                calcularFechaVencimiento={calcularFechaVencimiento}
              />
            )}

            {/* TAB 2: OFERTA */}
            {activePageTab === 'oferta' && (
              <OfertaTab
                serviciosBase={serviciosBase}
                setServiciosBase={setServiciosBase}
                nuevoServicioBase={nuevoServicioBase}
                setNuevoServicioBase={setNuevoServicioBase}
                editandoServicioBaseId={editandoServicioBaseId}
                setEditandoServicioBaseId={setEditandoServicioBaseId}
                servicioBaseEditando={servicioBaseEditando}
                setServicioBaseEditando={setServicioBaseEditando}
                paqueteActual={paqueteActual}
                setPaqueteActual={setPaqueteActual}
                serviciosOpcionales={serviciosOpcionales}
                setServiciosOpcionales={setServiciosOpcionales}
                nuevoServicio={nuevoServicio}
                setNuevoServicio={setNuevoServicio}
                editandoServicioId={editandoServicioId}
                setEditandoServicioId={setEditandoServicioId}
                servicioEditando={servicioEditando}
                setServicioEditando={setServicioEditando}
                descripcionTextareaRef={descripcionTextareaRef}
                agregarServicioBase={agregarServicioBase}
                abrirEditarServicioBase={abrirEditarServicioBase}
                guardarEditarServicioBase={guardarEditarServicioBase}
                cancelarEditarServicioBase={cancelarEditarServicioBase}
                eliminarServicioBase={eliminarServicioBase}
                agregarServicioOpcional={agregarServicioOpcional}
                abrirEditarServicioOpcional={abrirEditarServicioOpcional}
                guardarEditarServicioOpcional={guardarEditarServicioOpcional}
                cancelarEditarServicioOpcional={cancelarEditarServicioOpcional}
                eliminarServicioOpcional={eliminarServicioOpcional}
                normalizarMeses={normalizarMeses}
                serviciosOpcionalesValidos={serviciosOpcionalesValidos}
                todoEsValido={!!todoEsValido}
                // Props para PaquetesContent (sidebar integrado)
                snapshots={snapshots}
                setSnapshots={setSnapshots}
                cargandoSnapshots={cargandoSnapshots}
                errorSnapshots={errorSnapshots}
                abrirModalEditar={(snapshot) => {
                  const quotation = quotations.find(q => q.id === snapshot.quotationConfigId)
                  if (quotation) {
                    abrirModalEditar(quotation)
                  }
                }}
                handleEliminarSnapshot={handleEliminarSnapshot}
                calcularCostoInicialSnapshot={calcularCostoInicialSnapshot}
                calcularCostoAño1Snapshot={calcularCostoAño1Snapshot}
                calcularCostoAño2Snapshot={calcularCostoAño2Snapshot}
                actualizarSnapshot={actualizarSnapshot}
                refreshSnapshots={refreshSnapshots}
                toast={{ success: (m) => toast.success(m), error: (m) => toast.error(m), info: (m) => toast.info(m), warning: (m) => toast.warning(m) }}
                mostrarDialogoGenerico={mostrarDialogoGenerico}
                cotizacionConfig={cotizacionConfig}
              />
            )}

            {/* TAB 3: PAQUETES */}
            {activePageTab === 'paquetes' && (
              <PaquetesTab
                snapshots={snapshots}
                setSnapshots={setSnapshots}
                cargandoSnapshots={cargandoSnapshots}
                errorSnapshots={errorSnapshots}
                abrirModalEditar={(snapshot) => {
                  // Encontrar la quotation del snapshot
                  const quotation = quotations.find(q => q.id === snapshot.quotationConfigId)
                  if (quotation) {
                    abrirModalEditar(quotation)
                  }
                }}
                handleEliminarSnapshot={handleEliminarSnapshot}
                calcularCostoInicialSnapshot={calcularCostoInicialSnapshot}
                calcularCostoAño1Snapshot={calcularCostoAño1Snapshot}
                calcularCostoAño2Snapshot={calcularCostoAño2Snapshot}
                actualizarSnapshot={actualizarSnapshot}
                refreshSnapshots={refreshSnapshots}
                toast={toast}
                mostrarDialogoGenerico={mostrarDialogoGenerico}
                cotizacionConfig={cotizacionConfig}
              />
            )}

            {/* TAB 4: ESTILOS Y DISEÑO */}
            {activePageTab === 'estilos' && (
              <EstilosYDisenoTab />
            )}



            {/* TAB 5: PREFERENCIAS */}
            {activePageTab === 'preferencias' && (
              <PreferenciasTab
                userPreferences={userPreferences}
                setUserPreferences={setUserPreferences}
                guardarPreferencias={async () => {
                  if (!userPreferences) return
                  try {
                    const response = await fetch('/api/preferences', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: 'default-user',
                        cerrarModalAlGuardar: userPreferences.cerrarModalAlGuardar,
                        mostrarConfirmacionGuardado: userPreferences.mostrarConfirmacionGuardado,
                        validarDatosAntes: userPreferences.validarDatosAntes,
                      })
                    })
                    if (response.ok) {
                      const result = await response.json()
                      setUserPreferences(result.data)
                      toast.success('✓ Preferencias guardadas correctamente')
                    } else {
                      toast.error('Error al guardar preferencias')
                    }
                  } catch (error) {
                    console.error('Error guardando preferencias:', error)
                    toast.error('Error al guardar preferencias')
                  }
                }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal Editar Snapshot - DISEÑO GITHUB MODERNO */}
      <AnimatePresence>
        {showModalEditar && quotationEnModal && snapshotEditando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center pt-8 px-4 pb-4 overflow-y-auto scrollbar-hide"
            onClick={handleCerrarModalEditar}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="bg-gradient-to-b from-[#161b22] to-[#0d1117] rounded-xl border border-[#30363d] max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-editar-titulo"
            >
              {/* Header Premium con gradiente */}
              <div className="flex-shrink-0 bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22] text-[#c9d1d9] py-4 px-6 flex justify-between items-center border-b border-[#30363d] relative overflow-hidden">
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
                
                <div className="relative z-10 flex items-center gap-4">
                  {/* Icono con fondo */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#238636] to-[#2ea043] flex items-center justify-center shadow-lg shadow-[#238636]/20">
                    <FaEdit size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 id="modal-editar-titulo" className="text-lg font-bold text-white tracking-tight">
                        {snapshotEditando.nombre}
                      </h2>
                      {readOnly && (
                        <span className="text-[10px] bg-[#388bfd]/20 text-[#58a6ff] px-2.5 py-1 rounded-full border border-[#388bfd]/30 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
                          Solo lectura
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8b949e] mt-0.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#238636]" />
                      {readOnly ? 'Visualizando configuración del paquete' : 'Editando configuración del paquete'}
                    </p>
                  </div>
                </div>
                
                <button
                  aria-label="Cerrar modal edición"
                  onClick={handleCerrarModalEditar}
                  className="relative z-10 text-[#8b949e] hover:text-white text-lg transition-all p-2 rounded-lg hover:bg-white/10 active:scale-95"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Barra de navegación de Paquetes - Estilo Pills moderno */}
              <div className="flex-shrink-0 bg-[#0d1117]/80 backdrop-blur-sm border-b border-[#30363d] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider mr-2 flex-shrink-0">Paquetes:</span>
                  <div className="flex gap-2 flex-wrap">
                    {snapshotsModalActual.map((snapshot, index) => (
                      <motion.button
                        key={snapshot.id}
                        onClick={() => {
                          setSnapshotEditando(snapshot)
                          setActiveTabFila2(snapshot.id)
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          activeTabFila2 === snapshot.id
                            ? 'bg-gradient-to-r from-[#238636] to-[#2ea043] text-white shadow-lg shadow-[#238636]/25'
                            : 'bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] border border-[#30363d]'
                        }`}
                      >
                        {activeTabFila2 === snapshot.id && (
                          <motion.div
                            layoutId="activePackageIndicator"
                            className="absolute inset-0 bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-lg"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="text-base">{snapshot.paquete?.emoji || '📦'}</span>
                          {snapshot.nombre}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenido Principal con scroll */}
              <div ref={modalScrollContainerRef} className="flex-1 overflow-y-auto modal-scroll-container bg-[#0d1117]">
                <TabsModal
                  tabsPerRow={5}
                  tabs={[
                    {
                      id: 'descripcion',
                      label: 'Descripción',
                      icon: <FaFileAlt />,
                      hasChanges: pestañaTieneCambios('descripcion'),
                      content: (
                        <div className="space-y-6">
                          {/* Fila 1: nombre, tipo, emoji, tagline, tiempo de entrega, costo desarrollo */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Nombre</label>
                              <input
                                type="text"
                                value={snapshotEditando.nombre}
                                onChange={(e) => setSnapshotEditando({ ...snapshotEditando, nombre: e.target.value })}
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                ref={nombrePaqueteInputRef}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Tipo</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.tipo || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tipo: e.target.value}})}
                                placeholder="Básico"
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Emoji</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.emoji || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, emoji: e.target.value}})}
                                placeholder=""
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Tagline</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.tagline || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tagline: e.target.value}})}
                                placeholder="Presencia digital confiable"
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Tiempo Entrega</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.tiempoEntrega || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tiempoEntrega: e.target.value}})}
                                placeholder="14 días"
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Costo Desarrollo</label>
                              <input
                                type="number"
                                value={snapshotEditando.paquete.desarrollo}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, desarrollo: Number.parseFloat(e.target.value) || 0}})}
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                min="0"
                              />
                            </div>
                          </div>

                          {/* Fila 2: Descripción */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Descripción del Paquete</label>
                            <textarea
                              value={snapshotEditando.paquete.descripcion || ''}
                              onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, descripcion: e.target.value}})}
                              placeholder="Paquete personalizado para empresas..."
                              disabled={readOnly}
                              className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                              rows={3}
                            />
                          </div>

                          {/* Vista Previa del Hero */}
                          <div className="bg-[#161b22] p-4 rounded-md border border-[#30363d]">
                            <h3 className="text-xs font-bold text-[#c9d1d9] mb-2">Vista Previa del Hero</h3>
                            <div className="bg-[#0d1117] text-[#c9d1d9] p-4 rounded-md text-center border border-[#30363d]">
                              <div className="text-5xl mb-3">{snapshotEditando.paquete.emoji || ''}</div>
                              <div className="text-sm font-bold text-[#8b949e] mb-2">{snapshotEditando.paquete.tipo || 'Tipo'}</div>
                              <h2 className="text-3xl font-bold mb-3 text-[#c9d1d9]">{snapshotEditando.nombre || 'Nombre del Paquete'}</h2>
                              <p className="text-lg text-[#8b949e] mb-4">{snapshotEditando.paquete.tagline || 'Tagline descriptivo'}</p>
                              <div className="bg-[#21262d] rounded-md p-4 inline-block border border-[#30363d]">
                                <div className="text-4xl font-bold text-[#c9d1d9]">${snapshotEditando.costos?.inicial || 0} USD</div>
                                <div className="text-sm text-[#8b949e]">Inversión inicial</div>
                              </div>
                              {snapshotEditando.paquete.tiempoEntrega && (
                                <div className="mt-4 text-sm text-[#8b949e]">⏱️ {snapshotEditando.paquete.tiempoEntrega}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    },
                      {
                        id: 'servicios-base',
                        label: 'Servicios Base',
                        icon: <FaGlobe />,
                        hasChanges: pestañaTieneCambios('servicios-base'),
                        content: (
                          <div className="space-y-6">
                            {/* Servicios Base - Lista */}
                            <div>
                              <h3 className="text-xs text-[#c9d1d9] mb-2">Servicios Base</h3>
                              <div className="space-y-2">
                                {snapshotEditando.serviciosBase?.map((servicio, index) => (
                                  <div key={servicio.id} className="grid md:grid-cols-[2fr,1fr,1fr,1fr] gap-2 p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                                    <div>
                                      <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Nombre</label>
                                      <input
                                        type="text"
                                        value={servicio.nombre}
                                        onChange={(e) => {
                                          const nuevosServicios = [...snapshotEditando.serviciosBase]
                                          nuevosServicios[index].nombre = e.target.value
                                          setSnapshotEditando({...snapshotEditando, serviciosBase: nuevosServicios})
                                        }}
                                        disabled={readOnly}
                                        className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Precio</label>
                                      <input
                                        type="number"
                                        value={servicio.precio}
                                        onChange={(e) => {
                                          const nuevosServicios = [...snapshotEditando.serviciosBase]
                                          nuevosServicios[index].precio = Number.parseFloat(e.target.value) || 0
                                          setSnapshotEditando({...snapshotEditando, serviciosBase: nuevosServicios})
                                        }}
                                        disabled={readOnly}
                                        className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Gratis</label>
                                      <input
                                        type="number"
                                        value={servicio.mesesGratis}
                                        onChange={(e) => {
                                          const nuevosServicios = [...snapshotEditando.serviciosBase]
                                          const gratis = Number.parseInt(e.target.value) || 0
                                          nuevosServicios[index].mesesGratis = Math.min(gratis, 12)
                                          nuevosServicios[index].mesesPago = Math.max(1, 12 - gratis)
                                          setSnapshotEditando({...snapshotEditando, serviciosBase: nuevosServicios})
                                        }}
                                        disabled={readOnly}
                                        className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                        min="0"
                                        max="12"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Pago</label>
                                      <input
                                        type="number"
                                        value={servicio.mesesPago}
                                        onChange={(e) => {
                                          const nuevosServicios = [...snapshotEditando.serviciosBase]
                                          const pago = Number.parseInt(e.target.value) || 12
                                          nuevosServicios[index].mesesPago = Math.max(1, Math.min(pago, 12))
                                          setSnapshotEditando({...snapshotEditando, serviciosBase: nuevosServicios})
                                        }}
                                        disabled={readOnly}
                                        className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                        min="1"
                                        max="12"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Vista Previa de Montos - Servicios Base */}
                            <div className="mt-4 p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                              <h4 className="text-[10px] font-bold text-[#c9d1d9] mb-2">Vista Previa</h4>
                              <div className="space-y-1">
                                {snapshotEditando.serviciosBase?.map((servicio) => {
                                  const subtotal = servicio.precio * servicio.mesesPago
                                  return (
                                    <div key={servicio.id} className="flex justify-between text-xs">
                                      <span className="text-[#8b949e]">{servicio.nombre} (${servicio.precio} × {servicio.mesesPago} meses)</span>
                                      <span className="font-medium text-[#c9d1d9]">${subtotal.toFixed(2)}</span>
                                    </div>
                                  )
                                })}
                                <div className="border-t border-[#30363d] pt-2 mt-2 flex justify-between">
                                  <span className="font-bold text-[#c9d1d9] text-xs">TOTAL AÑO 1</span>
                                  <span className="font-bold text-[#3fb950] text-base">
                                    ${snapshotEditando.serviciosBase?.reduce((sum, s) => sum + (s.precio * s.mesesPago), 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'otros-servicios',
                        label: 'Otros Servicios',
                        icon: <FaHeadset />,
                        hasChanges: pestañaTieneCambios('otros-servicios'),
                        content: (
                          <div className="space-y-6">
                            {/* Otros Servicios - Lista */}
                            <div>
                              <h3 className="text-xs text-[#c9d1d9] mb-2">Otros Servicios</h3>
                              {snapshotEditando.otrosServicios.length > 0 ? (
                                <div className="space-y-2">
                                  {snapshotEditando.otrosServicios.map((servicio, idx) => (
                                    <div key={idx} className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-2 p-3 bg-[#161b22] border border-[#30363d] rounded-md items-end">
                                      <div>
                                        <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Nombre</label>
                                        <input
                                          type="text"
                                          value={servicio.nombre}
                                          onChange={(e) => {
                                            const actualizado = [...snapshotEditando.otrosServicios]
                                            actualizado[idx].nombre = e.target.value
                                            setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                          }}
                                          disabled={readOnly}
                                          className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Precio</label>
                                        <input
                                          type="number"
                                          value={servicio.precio}
                                          onChange={(e) => {
                                            const actualizado = [...snapshotEditando.otrosServicios]
                                            actualizado[idx].precio = Number.parseFloat(e.target.value) || 0
                                            setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                          }}
                                          disabled={readOnly}
                                          className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                          min="0"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Gratis</label>
                                        <input
                                          type="number"
                                          value={servicio.mesesGratis}
                                          onChange={(e) => {
                                            const actualizado = [...snapshotEditando.otrosServicios]
                                            const gratis = Number.parseInt(e.target.value) || 0
                                            actualizado[idx].mesesGratis = Math.min(gratis, 12)
                                            actualizado[idx].mesesPago = Math.max(1, 12 - gratis)
                                            setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                          }}
                                          disabled={readOnly}
                                          className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                          min="0"
                                          max="12"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-[#c9d1d9] mb-0.5">Pago</label>
                                        <input
                                          type="number"
                                          value={servicio.mesesPago}
                                          onChange={(e) => {
                                            const actualizado = [...snapshotEditando.otrosServicios]
                                            const pago = Number.parseInt(e.target.value) || 12
                                            actualizado[idx].mesesPago = Math.max(1, Math.min(pago, 12))
                                            setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                          }}
                                          disabled={readOnly}
                                          className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                          min="1"
                                          max="12"
                                        />
                                      </div>
                                      <button
                                        onClick={() => {
                                          const actualizado = snapshotEditando.otrosServicios.filter((_, i) => i !== idx)
                                          setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                        }}
                                        className="w-8 h-8 bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#f85149] hover:border-[#f85149] rounded-md transition-colors flex items-center justify-center"
                                      >
                                        <FaTrash size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[#8b949e] text-sm mb-3">Sin otros servicios agregados</p>
                              )}
                              <button
                                onClick={() => {
                                  setSnapshotEditando({
                                    ...snapshotEditando,
                                    otrosServicios: [
                                      ...snapshotEditando.otrosServicios,
                                      {nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12}
                                    ]
                                  })
                                }}
                                className="mt-2 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors flex items-center gap-2 font-medium text-xs"
                              >
                                <FaPlus size={10} /> Agregar Servicio
                              </button>
                            </div>

                            {/* Vista Previa de Montos - Otros Servicios */}
                            {snapshotEditando.otrosServicios.length > 0 && (
                              <div className="mt-4 p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                                <h4 className="text-[10px] font-bold text-[#c9d1d9] mb-2">Vista Previa</h4>
                                <div className="space-y-1">
                                  {snapshotEditando.otrosServicios.map((servicio, idx) => {
                                    const subtotal = servicio.precio * servicio.mesesPago
                                    return (
                                      <div key={idx} className="flex justify-between text-xs">
                                        <span className="text-[#8b949e]">{servicio.nombre || `Servicio ${idx + 1}`} (${servicio.precio} × {servicio.mesesPago} meses)</span>
                                        <span className="font-medium text-[#c9d1d9]">${subtotal.toFixed(2)}</span>
                                      </div>
                                    )
                                  })}
                                  <div className="border-t border-[#30363d] pt-2 mt-2 flex justify-between">
                                    <span className="font-bold text-[#c9d1d9] text-xs">TOTAL AÑO 1</span>
                                    <span className="font-bold text-[#3fb950] text-base">
                                      ${snapshotEditando.otrosServicios.reduce((sum, s) => sum + (s.precio * s.mesesPago), 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        id: 'opciones-pago',
                        label: 'Opciones de Pago',
                        icon: '',
                        content: (
                          <div className="space-y-6">
                
                {/* Opciones de Pago */}
                <div>
                  <h3 className="text-xs font-bold text-[#c9d1d9] mb-2 flex items-center gap-2">
                    <FaCreditCard /> Opciones de Pago
                  </h3>

                  {/* Desarrollo en la misma sección */}
                  <div className="mb-4">
                    <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-1">
                      Desarrollo del sitio web
                    </label>
                    <input
                      type="number"
                      value={snapshotEditando.paquete.desarrollo}
                      onChange={(e) =>
                        setSnapshotEditando({
                          ...snapshotEditando,
                          paquete: {
                            ...snapshotEditando.paquete,
                            desarrollo: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      disabled={readOnly}
                      className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                      min="0"
                    />
                  </div>

                  {/* Lista de Opciones de Pago */}
                  <div className="mt-4 p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-bold text-[#c9d1d9] mb-2 flex items-center gap-2">
                        Esquema de Pagos (Debe sumar 100%)
                      </h4>
                      {(() => {
                        const opcionesPago = snapshotEditando.paquete.opcionesPago || []
                        const totalPorcentaje = opcionesPago.reduce((sum, op) => sum + (op.porcentaje || 0), 0)
                        const esValido = totalPorcentaje === 100
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            esValido 
                              ? 'bg-[#238636]/20 border-[#238636] text-[#3fb950]' 
                              : 'bg-[#da3633]/20 border-[#da3633] text-[#f85149]'
                          }`}>
                            Total: {totalPorcentaje}% {esValido ? '✓' : '⚠️'}
                          </span>
                        )
                      })()}
                    </div>

                    {(snapshotEditando.paquete.opcionesPago || []).length > 0 ? (
                      <div className="space-y-1 mb-3">
                        {(snapshotEditando.paquete.opcionesPago || []).map((opcion, idx) => (
                          <div
                            key={idx}
                            className="bg-[#161b22] border border-[#30363d] rounded-md p-3 grid md:grid-cols-[2fr,1fr,3fr,auto] gap-2 items-end"
                          >
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">
                                Nombre
                              </label>
                              <input
                                type="text"
                                value={opcion.nombre || ''}
                                onChange={(e) => {
                                  const actualizado = [...(snapshotEditando.paquete.opcionesPago || [])]
                                  actualizado[idx] = { ...actualizado[idx], nombre: e.target.value }
                                  setSnapshotEditando({
                                    ...snapshotEditando,
                                    paquete: {
                                      ...snapshotEditando.paquete,
                                      opcionesPago: actualizado,
                                    },
                                  })
                                }}
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                placeholder="Ej: Inicial"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">
                                %
                              </label>
                              <input
                                type="number"
                                value={opcion.porcentaje || 0}
                                onChange={(e) => {
                                  const actualizado = [...(snapshotEditando.paquete.opcionesPago || [])]
                                  actualizado[idx] = { 
                                    ...actualizado[idx], 
                                    porcentaje: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                                  }
                                  setSnapshotEditando({
                                    ...snapshotEditando,
                                    paquete: {
                                      ...snapshotEditando.paquete,
                                      opcionesPago: actualizado,
                                    },
                                  })
                                }}
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                min="0"
                                max="100"
                                placeholder="30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">
                                Descripción
                              </label>
                              <input
                                type="text"
                                value={opcion.descripcion || ''}
                                onChange={(e) => {
                                  const actualizado = [...(snapshotEditando.paquete.opcionesPago || [])]
                                  actualizado[idx] = { ...actualizado[idx], descripcion: e.target.value }
                                  setSnapshotEditando({
                                    ...snapshotEditando,
                                    paquete: {
                                      ...snapshotEditando.paquete,
                                      opcionesPago: actualizado,
                                    },
                                  })
                                }}
                                disabled={readOnly}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                placeholder="Ej: Al firmar contrato"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const actualizado = (snapshotEditando.paquete.opcionesPago || []).filter(
                                  (_, i) => i !== idx
                                )
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  paquete: {
                                    ...snapshotEditando.paquete,
                                    opcionesPago: actualizado,
                                  },
                                })
                              }}
                              className="w-7 h-7 text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] rounded-md transition-colors flex items-center justify-center"
                              title="Eliminar opción"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#8b949e] text-xs mb-4 italic">
                        Sin opciones de pago configuradas.
                      </p>
                    )}

                    <button
                      onClick={() => {
                        setSnapshotEditando({
                          ...snapshotEditando,
                          paquete: {
                            ...snapshotEditando.paquete,
                            opcionesPago: [
                              ...(snapshotEditando.paquete.opcionesPago || []),
                              {
                                nombre: '',
                                porcentaje: 0,
                                descripcion: '',
                              },
                            ],
                          },
                        })
                      }}
                      className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors flex items-center gap-2 font-medium text-xs"
                    >
                      <FaPlus size={10} /> Agregar Opción
                    </button>
                  </div>

                  {/* Vista Previa de Montos */}
                  {(snapshotEditando.paquete.opcionesPago || []).length > 0 && snapshotEditando.paquete.desarrollo > 0 && (
                    <div className="mt-4 p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                      <h4 className="text-[10px] font-bold text-[#c9d1d9] mb-2">Vista Previa</h4>
                      <div className="space-y-1">
                        {(snapshotEditando.paquete.opcionesPago || []).map((opcion, idx) => {
                          const monto = (snapshotEditando.paquete.desarrollo * (opcion.porcentaje || 0)) / 100
                          return (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-[#8b949e]">
                                {opcion.nombre || `Pago ${idx + 1}`} ({opcion.porcentaje}%)
                              </span>
                              <span className="font-medium text-[#c9d1d9]">
                                ${monto.toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                        <div className="border-t border-[#30363d] pt-2 mt-2 flex justify-between">
                          <span className="font-bold text-[#c9d1d9] text-xs">TOTAL</span>
                          <span className="font-bold text-[#3fb950] text-base">
                            ${snapshotEditando.paquete.desarrollo.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                          </div>
                        ),
                      },
                      {
                        id: 'descuentos',
                        label: 'Descuentos',
                        icon: <FaPercent />,
                        hasChanges: pestañaTieneCambios('descuentos'),
                        content: (
                          <div className="space-y-4">
                            {/* SECCIÓN 1: Tipo de Descuento (mutuamente excluyentes) */}
                            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-3">
                              <h3 className="text-xs font-bold text-[#c9d1d9] mb-3 flex items-center gap-2">
                                <FaTags size={10} className="text-[#58a6ff]" />
                                Tipo de Descuento
                              </h3>
                              <div className="grid grid-cols-3 gap-2">
                                {/* Opción: Ninguno */}
                                <label className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border transition-all ${
                                  (snapshotEditando.paquete.configDescuentos?.tipoDescuento || 'ninguno') === 'ninguno'
                                    ? 'bg-[#21262d] border-[#58a6ff]'
                                    : 'border-[#30363d] hover:bg-[#21262d]'
                                }`}>
                                  <input
                                    type="radio"
                                    name="tipoDescuento"
                                    checked={(snapshotEditando.paquete.configDescuentos?.tipoDescuento || 'ninguno') === 'ninguno'}
                                    onChange={() => setSnapshotEditando({
                                      ...snapshotEditando,
                                      paquete: {
                                        ...snapshotEditando.paquete,
                                        configDescuentos: {
                                          ...snapshotEditando.paquete.configDescuentos!,
                                          tipoDescuento: 'ninguno',
                                        },
                                      },
                                    })}
                                    disabled={readOnly}
                                    className="accent-[#58a6ff]"
                                  />
                                  <span className="text-xs text-[#c9d1d9]">❌ Ninguno</span>
                                </label>

                                {/* Opción: Granulares */}
                                <label className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border transition-all ${
                                  snapshotEditando.paquete.configDescuentos?.tipoDescuento === 'granular'
                                    ? 'bg-[#21262d] border-[#f0883e]'
                                    : 'border-[#30363d] hover:bg-[#21262d]'
                                }`}>
                                  <input
                                    type="radio"
                                    name="tipoDescuento"
                                    checked={snapshotEditando.paquete.configDescuentos?.tipoDescuento === 'granular'}
                                    onChange={() => setSnapshotEditando({
                                      ...snapshotEditando,
                                      paquete: {
                                        ...snapshotEditando.paquete,
                                        configDescuentos: {
                                          ...snapshotEditando.paquete.configDescuentos!,
                                          tipoDescuento: 'granular',
                                        },
                                      },
                                    })}
                                    disabled={readOnly}
                                    className="accent-[#f0883e]"
                                  />
                                  <span className="text-xs text-[#c9d1d9]">🎯 Granulares</span>
                                </label>

                                {/* Opción: General */}
                                <label className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border transition-all ${
                                  snapshotEditando.paquete.configDescuentos?.tipoDescuento === 'general'
                                    ? 'bg-[#21262d] border-[#3fb950]'
                                    : 'border-[#30363d] hover:bg-[#21262d]'
                                }`}>
                                  <input
                                    type="radio"
                                    name="tipoDescuento"
                                    checked={snapshotEditando.paquete.configDescuentos?.tipoDescuento === 'general'}
                                    onChange={() => setSnapshotEditando({
                                      ...snapshotEditando,
                                      paquete: {
                                        ...snapshotEditando.paquete,
                                        configDescuentos: {
                                          ...snapshotEditando.paquete.configDescuentos!,
                                          tipoDescuento: 'general',
                                        },
                                      },
                                    })}
                                    disabled={readOnly}
                                    className="accent-[#3fb950]"
                                  />
                                  <span className="text-xs text-[#c9d1d9]">📊 General</span>
                                </label>
                              </div>
                              <p className="text-[9px] text-[#8b949e] mt-2">
                                Granulares: % individual por servicio | General: Un % para todo
                              </p>
                            </div>

                            {/* SECCIÓN 2: Configuración Condicional */}
                            {snapshotEditando.paquete.configDescuentos?.tipoDescuento === 'general' && (
                              <div className="bg-[#161b22] border border-[#3fb950]/50 rounded-md p-3">
                                <h3 className="text-xs font-bold text-[#c9d1d9] mb-3 flex items-center gap-2">
                                  <FaPercent size={10} className="text-[#3fb950]" />
                                  Descuento General
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] text-[#8b949e] mb-1">Porcentaje</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={snapshotEditando.paquete.configDescuentos?.descuentoGeneral?.porcentaje || 0}
                                        onChange={(e) => setSnapshotEditando({
                                          ...snapshotEditando,
                                          paquete: {
                                            ...snapshotEditando.paquete,
                                            configDescuentos: {
                                              ...snapshotEditando.paquete.configDescuentos!,
                                              descuentoGeneral: {
                                                ...snapshotEditando.paquete.configDescuentos!.descuentoGeneral!,
                                                porcentaje: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                              },
                                            },
                                          },
                                        })}
                                        disabled={readOnly}
                                        className="flex-1 px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#3fb950] focus:outline-none text-sm font-mono text-[#c9d1d9]"
                                        min="0" max="100"
                                      />
                                      <span className="text-[#8b949e]">%</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#8b949e] mb-1">Aplicar a:</label>
                                    <div className="space-y-1">
                                      {[
                                        { key: 'desarrollo', label: '💻 Desarrollo' },
                                        { key: 'serviciosBase', label: '🔧 Servicios Base' },
                                        { key: 'otrosServicios', label: '➕ Otros Servicios' },
                                      ].map(({ key, label }) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-[#c9d1d9]">
                                          <input
                                            type="checkbox"
                                            checked={snapshotEditando.paquete.configDescuentos?.descuentoGeneral?.aplicarA?.[key as 'desarrollo' | 'serviciosBase' | 'otrosServicios'] || false}
                                            onChange={(e) => setSnapshotEditando({
                                              ...snapshotEditando,
                                              paquete: {
                                                ...snapshotEditando.paquete,
                                                configDescuentos: {
                                                  ...snapshotEditando.paquete.configDescuentos!,
                                                  descuentoGeneral: {
                                                    ...snapshotEditando.paquete.configDescuentos!.descuentoGeneral!,
                                                    aplicarA: {
                                                      ...snapshotEditando.paquete.configDescuentos!.descuentoGeneral!.aplicarA,
                                                      [key]: e.target.checked,
                                                    },
                                                  },
                                                },
                                              },
                                            })}
                                            disabled={readOnly}
                                            className="w-3.5 h-3.5 accent-[#3fb950]"
                                          />
                                          {label}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {snapshotEditando.paquete.configDescuentos?.tipoDescuento === 'granular' && (
                              <div className="bg-[#161b22] border border-[#f0883e]/50 rounded-md p-3">
                                <h3 className="text-xs font-bold text-[#c9d1d9] mb-3 flex items-center gap-2">
                                  <FaTags size={10} className="text-[#f0883e]" />
                                  Descuentos Granulares por Servicio
                                </h3>
                                <div className="space-y-3">
                                  {/* Desarrollo */}
                                  <div>
                                    <h4 className="text-[10px] text-[#8b949e] mb-1 uppercase tracking-wider">Desarrollo</h4>
                                    <div className="flex items-center justify-between p-2 bg-[#0d1117] rounded border border-[#30363d]">
                                      <span className="text-xs text-[#c9d1d9]">💻 Costo de Desarrollo</span>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          value={snapshotEditando.paquete.configDescuentos?.descuentosGranulares?.desarrollo || 0}
                                          onChange={(e) => setSnapshotEditando({
                                            ...snapshotEditando,
                                            paquete: {
                                              ...snapshotEditando.paquete,
                                              configDescuentos: {
                                                ...snapshotEditando.paquete.configDescuentos!,
                                                descuentosGranulares: {
                                                  ...snapshotEditando.paquete.configDescuentos!.descuentosGranulares!,
                                                  desarrollo: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                                },
                                              },
                                            },
                                          })}
                                          disabled={readOnly}
                                          className="w-16 px-2 py-1 bg-[#161b22] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9]"
                                          min="0" max="100"
                                        />
                                        <span className="text-[10px] text-[#8b949e]">%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Servicios Base */}
                                  {snapshotEditando.serviciosBase.length > 0 && (
                                    <div>
                                      <h4 className="text-[10px] text-[#8b949e] mb-1 uppercase tracking-wider">Servicios Base</h4>
                                      <div className="space-y-1">
                                        {snapshotEditando.serviciosBase.map((servicio) => (
                                          <div key={servicio.id} className="flex items-center justify-between p-2 bg-[#0d1117] rounded border border-[#30363d]">
                                            <span className="text-xs text-[#c9d1d9]">🔧 {servicio.nombre}</span>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="number"
                                                value={snapshotEditando.paquete.configDescuentos?.descuentosGranulares?.serviciosBase?.[servicio.id] || 0}
                                                onChange={(e) => setSnapshotEditando({
                                                  ...snapshotEditando,
                                                  paquete: {
                                                    ...snapshotEditando.paquete,
                                                    configDescuentos: {
                                                      ...snapshotEditando.paquete.configDescuentos!,
                                                      descuentosGranulares: {
                                                        ...snapshotEditando.paquete.configDescuentos!.descuentosGranulares!,
                                                        serviciosBase: {
                                                          ...snapshotEditando.paquete.configDescuentos!.descuentosGranulares?.serviciosBase,
                                                          [servicio.id]: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                                        },
                                                      },
                                                    },
                                                  },
                                                })}
                                                disabled={readOnly}
                                                className="w-16 px-2 py-1 bg-[#161b22] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9]"
                                                min="0" max="100"
                                              />
                                              <span className="text-[10px] text-[#8b949e]">%</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Otros Servicios (Opcionales) */}
                                  {snapshotEditando.otrosServicios && snapshotEditando.otrosServicios.length > 0 && (
                                    <div>
                                      <h4 className="text-[10px] text-[#8b949e] mb-1 uppercase tracking-wider">Servicios Opcionales</h4>
                                      <div className="space-y-1">
                                        {snapshotEditando.otrosServicios.map((servicio, idx) => {
                                          const servicioKey = servicio.id || `otro-${idx}`
                                          return (
                                            <div key={servicioKey} className="flex items-center justify-between p-2 bg-[#0d1117] rounded border border-[#30363d]">
                                              <span className="text-xs text-[#c9d1d9]">✨ {servicio.nombre}</span>
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type="number"
                                                  value={snapshotEditando.paquete.configDescuentos?.descuentosGranulares?.otrosServicios?.[servicioKey] || 0}
                                                  onChange={(e) => setSnapshotEditando({
                                                    ...snapshotEditando,
                                                    paquete: {
                                                      ...snapshotEditando.paquete,
                                                      configDescuentos: {
                                                        ...snapshotEditando.paquete.configDescuentos!,
                                                        descuentosGranulares: {
                                                          ...snapshotEditando.paquete.configDescuentos!.descuentosGranulares!,
                                                          otrosServicios: {
                                                            ...snapshotEditando.paquete.configDescuentos!.descuentosGranulares?.otrosServicios,
                                                            [servicioKey]: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                                          },
                                                        },
                                                      },
                                                    },
                                                  })}
                                                  disabled={readOnly}
                                                  className="w-16 px-2 py-1 bg-[#161b22] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9]"
                                                  min="0" max="100"
                                                />
                                                <span className="text-[10px] text-[#8b949e]">%</span>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* SECCIÓN 3: Descuentos Finales */}
                            <div className="bg-[#161b22] border border-[#58a6ff]/50 rounded-md p-3">
                              <h3 className="text-xs font-bold text-[#c9d1d9] mb-3 flex items-center gap-2">
                                <FaGift size={10} className="text-[#58a6ff]" />
                                Descuentos Finales
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] text-[#8b949e] mb-1">
                                    Pago Único (solo desarrollo)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={snapshotEditando.paquete.configDescuentos?.descuentoPagoUnico || 0}
                                      onChange={(e) => setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          configDescuentos: {
                                            ...snapshotEditando.paquete.configDescuentos!,
                                            descuentoPagoUnico: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                          },
                                        },
                                      })}
                                      disabled={readOnly}
                                      className="flex-1 px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-none text-sm font-mono text-[#c9d1d9]"
                                      min="0" max="100"
                                    />
                                    <span className="text-[#8b949e]">%</span>
                                  </div>
                                  <p className="text-[8px] text-[#8b949e] mt-1">Aplica al desarrollo si paga todo de una vez</p>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-[#8b949e] mb-1">
                                    Descuento Directo (al total final)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={snapshotEditando.paquete.configDescuentos?.descuentoDirecto || 0}
                                      onChange={(e) => setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          configDescuentos: {
                                            ...snapshotEditando.paquete.configDescuentos!,
                                            descuentoDirecto: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                          },
                                        },
                                      })}
                                      disabled={readOnly}
                                      className="flex-1 px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-none text-sm font-mono text-[#c9d1d9]"
                                      min="0" max="100"
                                    />
                                    <span className="text-[#8b949e]">%</span>
                                  </div>
                                  <p className="text-[8px] text-[#8b949e] mt-1">Se aplica DESPUÉS de todos los demás descuentos</p>
                                </div>
                              </div>
                            </div>

                            {/* VISTA PREVIA DETALLADA */}
                            {snapshotEditando && (
                              <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                                <h4 className="text-[10px] font-bold text-[#c9d1d9] mb-3 flex items-center gap-2">
                                  <FaEye size={10} className="text-[#58a6ff]" />
                                  Vista Previa de Costos
                                </h4>
                                {(() => {
                                  const preview = calcularPreviewDescuentos(snapshotEditando)
                                  const tipoDesc = preview.tipoDescuentoAplicado
                                  const hayDescuentos = tipoDesc && tipoDesc !== 'ninguno'
                                  
                                  return (
                                    <div className="space-y-3">
                                      {/* Desarrollo */}
                                      <div className="border-b border-[#30363d] pb-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">💻 Desarrollo</span>
                                          {preview.desarrolloConDescuento < preview.desarrollo ? (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950]">
                                              -{((1 - preview.desarrolloConDescuento / preview.desarrollo) * 100).toFixed(0)}%
                                            </span>
                                          ) : null}
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                          <span className="text-xs text-[#c9d1d9]">Costo Desarrollo</span>
                                          <div className="text-right">
                                            {preview.desarrolloConDescuento < preview.desarrollo ? (
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#8b949e] line-through">${preview.desarrollo.toFixed(2)}</span>
                                                <span className="text-xs font-bold text-[#3fb950]">${preview.desarrolloConDescuento.toFixed(2)}</span>
                                              </div>
                                            ) : (
                                              <span className="text-xs text-[#c9d1d9]">${preview.desarrollo.toFixed(2)}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Servicios Base */}
                                      {preview.serviciosBase.desglose.length > 0 && (
                                        <div className="border-b border-[#30363d] pb-2">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">🔧 Servicios Base</span>
                                            {preview.serviciosBase.conDescuento < preview.serviciosBase.total ? (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950]">
                                                -{((1 - preview.serviciosBase.conDescuento / preview.serviciosBase.total) * 100).toFixed(0)}%
                                              </span>
                                            ) : null}
                                          </div>
                                          <div className="space-y-1 pl-2">
                                            {preview.serviciosBase.desglose.map((s, idx) => (
                                              <div key={idx} className="flex items-center justify-between text-[11px]">
                                                <span className="text-[#c9d1d9]">{s.nombre}</span>
                                                <div className="text-right">
                                                  {s.descuentoAplicado > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-[#8b949e] line-through">${s.original.toFixed(2)}</span>
                                                      <span className="font-medium text-[#3fb950]">${s.conDescuento.toFixed(2)}</span>
                                                      <span className="text-[9px] text-[#f0883e]">(-{s.descuentoAplicado}%)</span>
                                                    </div>
                                                  ) : (
                                                    <span className="text-[#c9d1d9]">${s.original.toFixed(2)}</span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#21262d]">
                                            <span className="text-[10px] text-[#8b949e]">Subtotal Servicios Base</span>
                                            <span className="text-xs font-medium text-[#c9d1d9]">${preview.serviciosBase.conDescuento.toFixed(2)}</span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Otros Servicios (Opcionales) */}
                                      {preview.otrosServicios.desglose.length > 0 && (
                                        <div className="border-b border-[#30363d] pb-2">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">✨ Servicios Opcionales</span>
                                            {preview.otrosServicios.conDescuento < preview.otrosServicios.total ? (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950]">
                                                -{((1 - preview.otrosServicios.conDescuento / preview.otrosServicios.total) * 100).toFixed(0)}%
                                              </span>
                                            ) : null}
                                          </div>
                                          <div className="space-y-1 pl-2">
                                            {preview.otrosServicios.desglose.map((s, idx) => (
                                              <div key={idx} className="flex items-center justify-between text-[11px]">
                                                <span className="text-[#c9d1d9]">{s.nombre}</span>
                                                <div className="text-right">
                                                  {s.descuentoAplicado > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-[#8b949e] line-through">${s.original.toFixed(2)}</span>
                                                      <span className="font-medium text-[#3fb950]">${s.conDescuento.toFixed(2)}</span>
                                                      <span className="text-[9px] text-[#f0883e]">(-{s.descuentoAplicado}%)</span>
                                                    </div>
                                                  ) : (
                                                    <span className="text-[#c9d1d9]">${s.original.toFixed(2)}</span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#21262d]">
                                            <span className="text-[10px] text-[#8b949e]">Subtotal Servicios Opcionales</span>
                                            <span className="text-xs font-medium text-[#c9d1d9]">${preview.otrosServicios.conDescuento.toFixed(2)}</span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Resumen de Descuentos Aplicados */}
                                      {hayDescuentos && (
                                        <div className="bg-[#161b22] rounded p-2 border border-[#30363d]">
                                          <div className="flex items-center gap-2 mb-1">
                                            <FaPercent size={8} className="text-[#f0883e]" />
                                            <span className="text-[10px] font-medium text-[#c9d1d9]">
                                              Descuentos Aplicados ({tipoDesc === 'granular' ? 'Granular' : 'General'})
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-[#8b949e] space-y-0.5">
                                            {tipoDesc === 'general' && (
                                              <div>• Descuento general del {snapshotEditando.paquete.configDescuentos?.descuentoGeneral?.porcentaje || 0}%</div>
                                            )}
                                            {(snapshotEditando.paquete.configDescuentos?.descuentoPagoUnico || 0) > 0 && (
                                              <div>• Pago único: {snapshotEditando.paquete.configDescuentos?.descuentoPagoUnico}% al desarrollo</div>
                                            )}
                                            {(snapshotEditando.paquete.configDescuentos?.descuentoDirecto || 0) > 0 && (
                                              <div>• Descuento directo: {snapshotEditando.paquete.configDescuentos?.descuentoDirecto}% al total final</div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Totales Finales */}
                                      <div className="bg-gradient-to-r from-[#238636]/20 to-[#0d1117] rounded p-2 border border-[#238636]/30">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                          <span className="text-[#8b949e]">Subtotal (antes de desc. directo)</span>
                                          <span className="text-[#c9d1d9]">${preview.subtotalOriginal.toFixed(2)}</span>
                                        </div>
                                        {(preview.descuentoDirectoAplicado ?? 0) > 0 && (
                                          <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-[#8b949e]">Descuento Directo ({preview.descuentoDirectoAplicado}%)</span>
                                            <span className="text-[#f0883e]">-${(preview.subtotalConDescuentos - preview.totalConDescuentos).toFixed(2)}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm font-bold border-t border-[#238636]/30 pt-1 mt-1">
                                          <span className="text-[#c9d1d9]">💰 Total Final</span>
                                          <span className="text-[#3fb950] text-base">${preview.totalConDescuentos.toFixed(2)}</span>
                                        </div>
                                        {preview.totalAhorro > 0 && (
                                          <div className="flex items-center justify-between text-[10px] mt-1">
                                            <span className="text-[#238636]">🎉 Ahorro Total</span>
                                            <span className="text-[#3fb950] font-bold">
                                              ${preview.totalAhorro.toFixed(2)} ({preview.porcentajeAhorro.toFixed(1)}% OFF)
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            )}
                          </div>
                        ),
                      },
                      // FILA 1: Nuevas pestañas de información general de la cotización
                      {
                        id: 'cotizacion',
                        label: 'Cotización',
                        icon: <FaFileAlt />,
                        hasChanges: pestañaTieneCambios('cotizacion'),
                        content: (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Número</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.numero || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, numero: e.target.value})}
                                  className="w-full px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-none text-xs text-[#c9d1d9]"
                                  placeholder="CZ-001"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Fecha de Emisión</label>
                                <input
                                  type="date"
                                  value={cotizacionActual.fechaEmision || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, fechaEmision: e.target.value})}
                                  className="w-full px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-none text-xs text-[#c9d1d9]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Tiempo Validez (días)</label>
                                <input
                                  type="number"
                                  value={cotizacionActual.tiempoValidez || 30}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, tiempoValidez: Number.parseInt(e.target.value) || 30})}
                                  className="w-full px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-none text-xs text-[#c9d1d9]"
                                  min="1"
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'cliente',
                        label: 'Cliente',
                        icon: <FaUser />,
                        hasChanges: pestañaTieneCambios('cliente'),
                        content: (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Empresa</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.empresa || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, empresa: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="Nombre de la empresa"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Sector</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.sector || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, sector: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="Industria/Sector"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Ubicación</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.ubicacion || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, ubicacion: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="Ciudad/País"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Email Cliente</label>
                                <input
                                  type="email"
                                  value={cotizacionActual.emailCliente || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, emailCliente: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="cliente@empresa.com"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">WhatsApp Cliente</label>
                                <input
                                  type="tel"
                                  value={cotizacionActual.whatsappCliente || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, whatsappCliente: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="+34 600 000 000"
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'profesional',
                        label: 'Profesional',
                        icon: <FaBriefcase />,
                        hasChanges: pestañaTieneCambios('profesional'),
                        content: (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Profesional</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.profesional || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, profesional: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="Nombre del profesional"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Empresa Proveedor</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.empresaProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, empresaProveedor: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="Nombre de la empresa"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Email</label>
                                <input
                                  type="email"
                                  value={cotizacionActual.emailProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, emailProveedor: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="profesional@empresa.com"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">WhatsApp</label>
                                <input
                                  type="tel"
                                  value={cotizacionActual.whatsappProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, whatsappProveedor: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="+34 600 000 000"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Ubicación Proveedor</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.ubicacionProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, ubicacionProveedor: e.target.value})}
                                  disabled={readOnly}
                                  className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                  placeholder="Ciudad/País"
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'contenido',
                        label: 'Contenido',
                        icon: <FaFileAlt />,
                        hasChanges: pestañaTieneCambios('contenido'),
                        content: (
                          <div className="space-y-6">
                            <PaqueteContenidoTab 
                              snapshot={snapshotEditando} 
                              readOnly={readOnly}
                              onChange={(updated) => setSnapshotEditando(updated)}
                            />
                          </div>
                        ),
                      },
                    ]}
                    activeTab={activeTabFila3}
                    onTabChange={setActiveTabFila3}
                    scrollContainerRef={modalScrollContainerRef}
                  />
              </div>
              {/* Fin Contenido Scrollable */}

              {/* Footer Premium con gradiente */}
              <div className="flex-shrink-0 bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22] border-t border-[#30363d] px-6 py-4 flex justify-between items-center relative overflow-hidden">
                {/* Efecto de línea superior brillante */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#30363d] to-transparent" />
                
                {/* Indicador de autoguardado a la izquierda */}
                <div className="flex items-center gap-3">
                  {readOnly && (
                    <span className="text-sm text-[#58a6ff] bg-gradient-to-r from-[#58a6ff]/15 to-[#388bfd]/10 px-4 py-1.5 rounded-lg flex items-center gap-2 border border-[#388bfd]/20 shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-[#58a6ff] animate-pulse" />
                      Modo de solo lectura
                    </span>
                  )}
                  {!readOnly && autoSaveStatus === 'saving' && (
                    <span className="text-sm text-[#c9d1d9] animate-pulse flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-[#58a6ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando cambios...
                    </span>
                  )}
                  {!readOnly && autoSaveStatus === 'saved' && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm text-[#3fb950] flex items-center gap-2 bg-[#238636]/10 px-3 py-1.5 rounded-lg border border-[#238636]/20"
                    >
                      <FaCheck className="text-[#3fb950]" /> Cambios guardados
                    </motion.span>
                  )}
                  {!readOnly && autoSaveStatus === 'error' && (
                    <span className="text-sm text-[#f85149] flex items-center gap-2 bg-[#da3633]/10 px-3 py-1.5 rounded-lg border border-[#da3633]/20">
                      <FaExclamationTriangle className="text-[#f85149]" /> Error al guardar. Reintentando...
                    </span>
                  )}
                </div>
                {/* Botones a la derecha */}
                <div className="flex gap-3">
                  {!readOnly && (
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(35, 134, 54, 0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={guardarEdicion}
                      className="py-2.5 px-8 bg-gradient-to-r from-[#238636] to-[#2ea043] text-white rounded-lg hover:from-[#2ea043] hover:to-[#3fb950] transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-[#238636]/25 border border-[#3fb950]/20"
                    >
                      <FaCheck /> Guardar Cambios
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#30363d' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCerrarModalEditar}
                    className="py-2 px-5 bg-[#21262d] text-[#c9d1d9] rounded-lg hover:text-white border border-[#30363d] transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FaTimes size={12} /> Cerrar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante FAB - Crear Paquete (solo visible en pestaña Paquetes) */}
      <AnimatePresence>
        {todoEsValido && activePageTab === 'paquetes' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-8 right-8 z-50 group"
          >
            <motion.button
              onClick={crearPaqueteSnapshot}
              className="w-16 h-16 bg-gh-success text-white 
                         rounded-full shadow-2xl hover:shadow-gh-success-hover/30
                         transition-all flex items-center justify-center
                         border-2 border-gh-success/20"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaPlus className="text-2xl transition-transform group-hover:rotate-90" />
            </motion.button>
            
            {/* Tooltip */}
            <motion.div
              className="absolute right-20 top-1/2 -translate-y-1/2 bg-gh-bg text-gh-text 
                         px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap
                         border border-gh-border pointer-events-none opacity-0 
                         group-hover:opacity-100 transition-opacity shadow-xl"
            >
              Crear Paquete
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* DIÁLOGO GENÉRICO - Diseño estilo GitHub/Vercel */}
      <AnimatePresence>
        {mostrarDialogo && datosDialogo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
            onClick={() => setMostrarDialogo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg shadow-xl shadow-black/50 max-w-md w-full mx-4 bg-[#0d1117] border border-[#30363d] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
                <span className={`text-lg ${
                  datosDialogo.tipo === 'error' ? 'text-[#f85149]'
                    : datosDialogo.tipo === 'advertencia' ? 'text-[#d29922]'
                    : datosDialogo.tipo === 'success' ? 'text-[#3fb950]'
                    : datosDialogo.tipo === 'activar' ? 'text-[#3fb950]'
                    : 'text-[#8b949e]'
                }`}>
                  {datosDialogo.icono || '✓'}
                </span>
                <h3 className="text-[#c9d1d9] font-semibold text-base">
                  {datosDialogo.titulo}
                </h3>
              </div>

              {/* Body */}
              <div className="px-4 py-4">
                {datosDialogo.subtitulo && (
                  <p className="text-xs text-[#8b949e] mb-2">{datosDialogo.subtitulo}</p>
                )}
                <p className="text-[#c9d1d9] text-sm leading-relaxed">{datosDialogo.mensaje}</p>
              </div>

              {/* Footer - Botones */}
              <div className="flex gap-3 px-4 py-3 border-t border-[#30363d] bg-[#161b22] justify-end">
                {datosDialogo.modoAbrir === 'editar' ? (
                  <>
                    <button
                      onClick={() => setMostrarDialogo(false)}
                      className="min-w-[90px] px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md transition-colors text-sm font-medium border border-[#30363d] whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        if (datosDialogo.quotation) {
                          await activarYAbrirModal()
                        }
                        setMostrarDialogo(false)
                      }}
                      className="min-w-[90px] px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <FaCheck size={12} /> Activar y Editar
                    </button>
                  </>
                ) : datosDialogo.tipo === 'activar' && datosDialogo.quotation ? (
                  <>
                    <button
                      onClick={async () => {
                        if (datosDialogo.quotation) {
                          await abrirSinActivar()
                        }
                        setMostrarDialogo(false)
                      }}
                      className="min-w-[90px] px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md transition-colors text-sm font-medium border border-[#30363d] whitespace-nowrap"
                    >
                      Ver Solo Lectura
                    </button>
                    <button
                      onClick={async () => {
                        if (datosDialogo.quotation) {
                          await activarYAbrirModal()
                        }
                        setMostrarDialogo(false)
                      }}
                      className="min-w-[90px] px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <FaCheck size={12} /> Activar y Editar
                    </button>
                  </>
                ) : (
                  /* Botones genéricos */
                  datosDialogo.botones.map((boton, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        await boton.action()
                        setMostrarDialogo(false)
                      }}
                      className={`min-w-[90px] px-4 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap ${
                        boton.style === 'primary'
                          ? 'bg-[#238636] hover:bg-[#2ea043] text-white'
                          : boton.style === 'danger'
                          ? 'bg-[#da3633] hover:bg-[#f85149] text-white'
                          : boton.style === 'success'
                          ? 'bg-[#238636] hover:bg-[#2ea043] text-white'
                          : 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]'
                      }`}
                    >
                      {boton.label}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast Notifications */}
      <Toast messages={toast.messages} onRemove={toast.removeToast} />
    </div>
  )
}