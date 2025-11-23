'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaPlus, FaTrash, FaDownload, FaArrowLeft, FaEdit, FaTimes, FaCheck, FaCreditCard, FaChevronDown, FaSave, FaFileAlt, FaMapMarkerAlt, FaEnvelope, FaTag, FaCalendar, FaDollarSign, FaGlobe, FaHeadset, FaPercent, FaPalette, FaHistory, FaGift, FaCog, FaToggleOn, FaToggleOff, FaEye, FaUser, FaBriefcase } from 'react-icons/fa'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import TabsModal from '@/components/TabsModal'
import Historial from '@/components/Historial'
import Toast from '@/components/Toast'
import { useToast } from '@/lib/hooks/useToast'
import { jsPDF } from 'jspdf'
import { obtenerSnapshots, crearSnapshot, actualizarSnapshot, eliminarSnapshot, obtenerSnapshotsCompleto } from '@/lib/snapshotApi'
import { useSnapshotsRefresh } from '@/lib/hooks/useSnapshots'
import type { ServicioBase, GestionConfig, Package, Servicio, OtroServicio, OtroServicioSnapshot, PackageSnapshot, QuotationConfig, UserPreferences } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'
import type { TabItem } from '@/components/TabsModal'

// UI Components
import KPICards from '@/features/admin/components/KPICards'
import SnapshotFilters from '@/features/admin/components/SnapshotFilters'
import SectionBadge from '@/features/admin/components/SectionBadge'
import CollapsibleSection from '@/features/admin/components/CollapsibleSection'
import SkeletonLoader from '@/features/admin/components/SkeletonLoader'

export default function Administrador() {
  // Obtener función de refresh global
  const refreshSnapshots = useSnapshotsRefresh()
  
  // Hook para notificaciones toast
  const toast = useToast()

  // ==================== ESTADOS COTIZACIÓN ====================
  const [cotizacionConfig, setCotizacionConfig] = useState<QuotationConfig | null>(null)
  const [cargandoCotizacion, setCargandoCotizacion] = useState(false)
  const [erroresValidacionCotizacion, setErroresValidacionCotizacion] = useState<{
    email?: string
    whatsapp?: string
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
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null)
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [activeModalTab, setActiveModalTab] = useState<string>('descripcion')
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
  const [cargandoQuotations, setCargandoQuotations] = useState(true)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [cargandoPreferences, setCargandoPreferences] = useState(true)
  
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
  
  // Estado para expandibles en descuentos por servicio
  const [expandidosDescuentos, setExpandidosDescuentos] = useState<{ [key: string]: boolean }>({
    serviciosBase: false,
    otrosServicios: false,
  })

  // Estado para secciones colapsables principales
  const [seccionesExpandidas, setSeccionesExpandidas] = useState<{ [key: string]: boolean }>({
    serviciosBase: true,
    paquete: true,
    serviciosOpcionales: true,
    paquetesInactivos: false,
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
      } finally {
        setCargandoQuotations(false)
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
      } finally {
        setCargandoPreferences(false)
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
  const guardarCotizacion = async () => {
    const errores: typeof erroresValidacionCotizacion = {}

    if (!cotizacionConfig?.empresa?.trim()) {
      errores.empresa = 'Requerido'
    }
    if (!cotizacionConfig?.profesional?.trim()) {
      errores.profesional = 'Requerido'
    }
    if (cotizacionConfig?.email && !validarEmail(cotizacionConfig.email)) {
      errores.email = 'Email inválido'
    }
    if (cotizacionConfig?.whatsapp && !validarWhatsApp(cotizacionConfig.whatsapp)) {
      errores.whatsapp = 'WhatsApp inválido (ej: +535 856 9291)'
    }
    if (cotizacionConfig && !validarFechas(cotizacionConfig.fechaEmision, cotizacionConfig.fechaVencimiento)) {
      errores.fechas = 'Fecha vencimiento debe ser > emisión'
    }

    if (Object.keys(errores).length > 0) {
      setErroresValidacionCotizacion(errores)
      alert('⚠️ Hay errores en los datos. Revisa los campos resaltados.')
      return
    }

    try {
      if (!cotizacionConfig) return

      const method = cotizacionConfig.id ? 'PUT' : 'POST'
      const url = cotizacionConfig.id
        ? `/api/quotation-config?id=${cotizacionConfig.id}`
        : '/api/quotation-config'

      const fechaEmision = new Date(cotizacionConfig.fechaEmision)
      const fechaVencimiento = calcularFechaVencimiento(fechaEmision, cotizacionConfig.tiempoValidez)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cotizacionConfig,
          fechaEmision: fechaEmision.toISOString(),
          fechaVencimiento: fechaVencimiento.toISOString(),
        }),
      })

      if (response.ok) {
        const saved = await response.json()
        setCotizacionConfig(saved)
        setErroresValidacionCotizacion({})
        alert('✅ Cotización guardada correctamente')
      } else {
        alert('❌ Error al guardar la cotización')
      }
    } catch (error) {
      console.error('Error guardando:', error)
      alert('❌ Error al guardar la cotización')
    }
  }

  // Calcular costo inicial para un snapshot
  const calcularCostoInicialSnapshot = (snapshot: PackageSnapshot) => {
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
    
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
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
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
      }
      setServiciosBase([...serviciosBase, nuevoServ])
      setNuevoServicioBase({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })
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
      alert('⚠️ Debe haber al menos un servicio base')
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
      }
      setServiciosOpcionales(prev => {
        const existente = prev.find(s => s.nombre.toLowerCase() === nuevoServ.nombre.toLowerCase())
        if (existente) return prev.map(s => s.id === existente.id ? { ...nuevoServ, id: existente.id } : s)
        return [...prev, nuevoServ]
      })
      setNuevoServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })
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
    if (!todoEsValido) {
      alert('Por favor completa todos los campos requeridos: Nombre del paquete, Desarrollo, Precios de servicios, y Meses válidos.')
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
          descuentosGenerales: {
            aplicarAlDesarrollo: false,
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            porcentaje: 0,
          },
          descuentosPorServicio: {
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            serviciosBase: serviciosBase.map(s => ({
              servicioId: s.id,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
            otrosServicios: otrosServiciosUnificados.map((s, idx) => ({
              servicioId: `otro-${idx}`,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
          },
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

      alert('✅ Paquete creado y guardado correctamente')
    } catch (error) {
      console.error('Error al crear paquete:', error)
      alert('❌ Error al guardar el paquete. Por favor intenta de nuevo.')
    }
  }

  const abrirModalEditar = (snapshot: PackageSnapshot) => {
    // Inicializar descuentos si no existen
    const snapshotConDescuentos = {
      ...snapshot,
      paquete: {
        ...snapshot.paquete,
        descuentosGenerales: snapshot.paquete.descuentosGenerales || {
          aplicarAlDesarrollo: false,
          aplicarAServiciosBase: false,
          aplicarAOtrosServicios: false,
          porcentaje: 0,
        },
        descuentosPorServicio: snapshot.paquete.descuentosPorServicio || {
          aplicarAServiciosBase: false,
          aplicarAOtrosServicios: false,
          serviciosBase: snapshot.serviciosBase.map(s => ({
            servicioId: s.id,
            aplicarDescuento: false,
            porcentajeDescuento: 0,
          })),
          otrosServicios: snapshot.otrosServicios.map((s, idx) => ({
            servicioId: s.id || `otro-servicio-${idx}`,
            aplicarDescuento: false,
            porcentajeDescuento: 0,
          })),
        },
      },
    }
    setSnapshotEditando(snapshotConDescuentos)
    setShowModalEditar(true)
    setSnapshotOriginalJson(JSON.stringify(snapshot))
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
      
      setShowModalEditar(false)
      setSnapshotEditando(null)
      alert('✅ Paquete actualizado correctamente')
      setSnapshotOriginalJson(JSON.stringify(snapshotActualizado))
    } catch (error) {
      console.error('Error al guardar edición:', error)
      alert('❌ Error al actualizar el paquete. Por favor intenta de nuevo.')
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
        return JSON.stringify(snapshotEditando.paquete.descuentosGenerales) !== JSON.stringify(original.paquete.descuentosGenerales) ||
               JSON.stringify(snapshotEditando.paquete.descuentosPorServicio) !== JSON.stringify(original.paquete.descuentosPorServicio)
      default:
        return false
    }
  }

  // Cerrar modal con validación de cambios sin guardar
  const handleCerrarModalEditar = () => {
    // Usar nueva verificación basada en lastSavedJson y estado de autoguardado
    if (snapshotEditando && tieneCambiosSinGuardar() && autoSaveStatus === 'saving') {
      const confirmar = confirm('Se están guardando cambios. ¿Cerrar igualmente?')
      if (!confirmar) return
    } else if (snapshotEditando && tieneCambiosSinGuardar()) {
      const confirmar = confirm('Hay cambios sin guardar. ¿Cerrar y descartar los cambios?')
      if (!confirmar) return
    }
    setShowModalEditar(false)
    setSnapshotEditando(null)
    setActiveModalTab('descripcion')
    setSnapshotOriginalJson(null)
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

  const handleEliminarSnapshot = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este paquete?')) {
      try {
        await eliminarSnapshot(id)
        setSnapshots(snapshots.filter(s => s.id !== id))
        
        // Llamar refresh global para notificar a todos los componentes
        await refreshSnapshots()
        
        alert('✅ Paquete eliminado correctamente')
      } catch (error) {
        console.error('Error al eliminar snapshot:', error)
        alert('❌ Error al eliminar el paquete. Por favor intenta de nuevo.')
      }
    }
  }

  // Funciones para PDF y Guardar Configuración
  const handleDescargarPdf = () => {
    if (snapshots.length === 0) {
      alert('No hay paquetes para descargar. Por favor, crea un paquete primero.')
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

    // Sección Paquete
    const paqueteContent = [
      `• Costo desarrollo: $${snapshot.paquete.desarrollo.toFixed(2)}`,
      `• Descuento aplicado: ${snapshot.paquete.descuento}%`,
      `• Total neto: $${(snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)).toFixed(2)}`,
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

  const guardarConfiguracionActual = async () => {
    const configActual = {
      serviciosBase,
      gestion,
      paqueteActual,
      serviciosOpcionales,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('configuracionAdministrador', JSON.stringify(configActual))
    // Guardar también los snapshots creados
    localStorage.setItem('paquetesSnapshots', JSON.stringify(snapshots))
    
    // Guardar configuración de la cotización en BD
    try {
      const quotationData = {
        numero: cotizacionActual.numero || 'SIN-NUMERO',
        fechaEmision: cotizacionActual.fechaEmision || new Date().toISOString().split('T')[0],
        tiempoValidez: cotizacionActual.tiempoValidez || 30,
        empresa: cotizacionActual.empresa || '',
        sector: cotizacionActual.sector || '',
        ubicacion: cotizacionActual.ubicacion || '',
        emailCliente: cotizacionActual.emailCliente || '',
        whatsappCliente: cotizacionActual.whatsappCliente || '',
        profesional: cotizacionActual.profesional || '',
        empresaProveedor: cotizacionActual.empresaProveedor || '',
        emailProveedor: cotizacionActual.emailProveedor || '',
        whatsappProveedor: cotizacionActual.whatsappProveedor || '',
        ubicacionProveedor: cotizacionActual.ubicacionProveedor || '',
        heroTituloMain: cotizacionActual.heroTituloMain || 'Mi Propuesta',
        heroTituloSub: cotizacionActual.heroTituloSub || 'Cotización personalizada',
      }
      
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Recargar quotations
          const updatedResponse = await fetch('/api/quotations')
          const data = await updatedResponse.json()
          if (data.success) {
            setQuotations(data.data || [])
            toast.success('✓ Cotización guardada correctamente')
          }
        }
      } else {
        toast.error('❌ Error al guardar la cotización')
      }
    } catch (error) {
      console.error('Error guardando cotización en BD:', error)
      toast.error('❌ Error al guardar la cotización')
    }
    
    // Disparar refresh global para sincronizar todos los componentes
    console.log('🔄 Refresh global disparado desde botón Guardar')
    await refreshSnapshots()
  }

  // ---- Autoguardado de configuración general fuera del modal ----
  // Autoguardado general fuera del modal eliminado: solo se mantiene autoguardado dentro del modal de edición

  // Definir pestañas principales
  const pageTabs: TabItem[] = [
    {
      id: 'cotizacion',
      label: 'Cotización',
      icon: <FaFileAlt size={16} />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
    {
      id: 'oferta',
      label: 'Oferta',
      icon: <FaGlobe size={16} />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
    {
      id: 'paquetes',
      label: 'Paquetes',
      icon: <FaGift size={16} />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
    {
      id: 'estilos',
      label: 'Estilos y Diseño',
      icon: <FaPalette size={16} />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <FaHistory size={16} />,
      content: <div />, // Placeholder
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
    <div className="relative min-h-screen bg-black text-[#ededed]">
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header con botones de acción */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Panel Administrativo
              </h1>
              <p className="text-sm text-white/80">
                Gestione toda la configuración de su propuesta de cotización.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDescargarPdf}
                className="px-4 py-2 bg-white text-[#0a0a0f] rounded-lg hover:bg-white/90 transition-all flex items-center gap-2 text-xs font-semibold active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
              >
                <FaDownload /> Descargar PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={guardarConfiguracionActual}
                className="px-4 py-2 bg-white text-[#0a0a0f] rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-xs font-semibold active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
              >
                <FaSave /> Guardar
              </motion.button>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/30 text-white rounded-lg hover:bg-white/40 transition-all flex items-center gap-2 text-xs font-semibold border border-white/50 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
                >
                  <FaArrowLeft /> Volver
                </motion.button>
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards snapshots={snapshots} cargandoSnapshots={cargandoSnapshots} />

          {/* Tab Navigation */}
          <div className="mt-6">
            <TabsModal
              tabs={pageTabs}
              activeTab={activePageTab}
              onTabChange={setActivePageTab}
            />
          </div>

          {/* Tab Content - renderizado conditionally */}
          <div className="mt-0 bg-black rounded-b-lg border-b border-l border-r border-[#333]">
            {/* TAB 1: COTIZACIÓN */}
            {activePageTab === 'cotizacion' && (
              <div className="p-6 space-y-4">
                {cargandoCotizacion ? (
                  <div className="text-center py-6 text-[#888888]">Cargando cotización...</div>
                ) : (
                  <div className="space-y-4">
                  {/* Grid 2 Columnas */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* COLUMNA 1: Información de Cotización */}
                    <div className="space-y-3 bg-[#111] p-3 rounded-lg border border-[#333]">
                      <h4 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                        <FaFileAlt /> Información de Cotización
                      </h4>

                      {/* Título Secundario (Hero) */}
                      <div className="border-t border-[#333]"></div>
                      <div>
                        <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Nombre de la cotización</label>
                        <input
                          type="text"
                          value={cotizacionConfig?.heroTituloSub || ''}
                          onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, heroTituloSub: e.target.value } : null)}
                          className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                          placeholder="Ej: PÁGINA CATÁLOGO DINÁMICA"
                        />
                        <p className="text-[#888888] text-xs mt-1">Se muestra en la página principal</p>
                      </div>

                      {/* GRUPO 1: Identificación */}
                      <div className="pt-2 border-t border-[#333]">
                        <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                          <FaTag /> Identificación
                        </h5>
                        <div className="grid md:grid-cols-2 gap-2">
                          {/* Número (readonly) */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Número *</label>
                            <input
                              type="text"
                              value={cotizacionConfig?.numero || ''}
                              disabled
                              className="w-full px-3 py-2 bg-[#0a0a0f] text-[#999] border border-[#333] rounded focus:outline-none text-xs cursor-not-allowed"
                              placeholder="Auto-generado"
                            />
                            <p className="text-[#888888] text-xs mt-1">Se genera automáticamente</p>
                          </div>

                          {/* Versión */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Versión *</label>
                            <input
                              type="text"
                              value={cotizacionConfig?.version || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, version: e.target.value } : null)}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* GRUPO 2: Fechas */}
                      <div className="pt-2 border-t border-[#333]">
                        <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                          <FaCalendar /> Fechas
                        </h5>
                        <div className="grid md:grid-cols-3 gap-2">
                          {/* Fecha Emisión */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Fecha Emisión *</label>
                            <input
                              type="date"
                              value={cotizacionConfig?.fechaEmision ? new Date(cotizacionConfig.fechaEmision).toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                const newFecha = new Date(e.target.value)
                                const newFechaVencimiento = calcularFechaVencimiento(newFecha, cotizacionConfig?.tiempoValidez || 30)
                                if (cotizacionConfig) {
                                  setCotizacionConfig({
                                    ...cotizacionConfig,
                                    fechaEmision: newFecha.toISOString(),
                                    fechaVencimiento: newFechaVencimiento.toISOString(),
                                  })
                                }
                              }}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                            />
                          </div>

                          {/* Tiempo Validez */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Validez (días) *</label>
                            <input
                              type="number"
                              value={cotizacionConfig?.tiempoValidez || 30}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 30
                                if (cotizacionConfig) {
                                  const newFechaVencimiento = calcularFechaVencimiento(new Date(cotizacionConfig.fechaEmision), newValue)
                                  setCotizacionConfig({
                                    ...cotizacionConfig,
                                    tiempoValidez: newValue,
                                    fechaVencimiento: newFechaVencimiento.toISOString(),
                                  })
                                }
                              }}
                              min="1"
                              max="365"
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                            />
                          </div>

                          {/* Fecha Vencimiento (readonly) */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Fecha Vencimiento *</label>
                            <input
                              type="text"
                              value={cotizacionConfig?.fechaVencimiento ? formatearFechaLarga(cotizacionConfig.fechaVencimiento) : ''}
                              disabled
                              className="w-full px-3 py-2 bg-[#0a0a0f] text-[#999] border border-[#333] rounded focus:outline-none text-xs cursor-not-allowed"
                            />
                            {erroresValidacionCotizacion.fechas && (
                              <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.fechas}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* GRUPO 3: Presupuesto */}
                      <div className="pt-2 border-t border-[#333]">
                        <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                          <FaDollarSign /> Presupuesto
                        </h5>
                        <div className="grid md:grid-cols-2 gap-2">
                          {/* Presupuesto */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Monto *</label>
                            <input
                              type="text"
                              value={cotizacionConfig?.presupuesto || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, presupuesto: e.target.value } : null)}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                              placeholder="Ej: Menos de $300 USD"
                            />
                          </div>

                          {/* Moneda */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Moneda *</label>
                            <select
                              value={cotizacionConfig?.moneda || 'USD'}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, moneda: e.target.value } : null)}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                            >
                              <option>USD</option>
                              <option>EUR</option>
                              <option>CUP</option>
                              <option>MXN</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* GRUPO 4: Vigencia del Contrato */}
                      <div className="pt-2 border-t border-[#333]">
                        <h5 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                          <FaCalculator /> Vigencia del Contrato
                        </h5>
                        <div className="grid md:grid-cols-3 gap-2">
                          {/* Valor */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Valor</label>
                            <input
                              type="number"
                              value={cotizacionConfig?.tiempoVigenciaValor || 12}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaValor: parseInt(e.target.value) || 12 } : null)}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                              min="1"
                              max="365"
                            />
                          </div>

                          {/* Unidad */}
                          <div className="md:col-span-2">
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Unidad de Tiempo</label>
                            <select
                              value={cotizacionConfig?.tiempoVigenciaUnidad || 'meses'}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, tiempoVigenciaUnidad: e.target.value } : null)}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                            >
                              <option value="días">Días</option>
                              <option value="meses">Meses</option>
                              <option value="años">Años</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA 2: Información Cliente y Proveedor */}
                    <div className="space-y-2">
                      {/* Contenedor Cliente */}
                      <div className="space-y-2 bg-[#111] p-3 rounded-lg border border-[#333]">
                        <h4 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                          <FaMapMarkerAlt /> Información del Cliente
                        </h4>
                        <div className="border-t border-[#333]"></div>
                        {/* Fila 1: Empresa, Sector */}
                        <div className="grid md:grid-cols-2 gap-2">
                          {/* Empresa */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">
                              Empresa {!cotizacionConfig?.empresa && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              value={cotizacionConfig?.empresa || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresa: e.target.value } : null)}
                              className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                                erroresValidacionCotizacion.empresa ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                              }`}
                            />
                            {erroresValidacionCotizacion.empresa && (
                              <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.empresa}</p>
                            )}
                          </div>

                          {/* Sector */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Sector</label>
                            <input
                              type="text"
                              value={cotizacionConfig?.sector || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, sector: e.target.value } : null)}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                            />
                          </div>
                        </div>

                        {/* Fila 2: Email, WhatsApp */}
                        <div className="grid md:grid-cols-2 gap-2">
                          {/* Email Cliente */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Email</label>
                            <input
                              type="email"
                              value={cotizacionConfig?.emailCliente || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, emailCliente: e.target.value } : null)}
                              className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                                erroresValidacionCotizacion.emailCliente ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                              }`}
                            />
                            {erroresValidacionCotizacion.emailCliente && (
                              <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.emailCliente}</p>
                            )}
                          </div>

                          {/* WhatsApp Cliente */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">WhatsApp</label>
                            <input
                              type="tel"
                              value={cotizacionConfig?.whatsappCliente || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsappCliente: e.target.value } : null)}
                              className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                                erroresValidacionCotizacion.whatsappCliente ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                              }`}
                              placeholder="+535 856 9291"
                            />
                            {erroresValidacionCotizacion.whatsappCliente && (
                              <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.whatsappCliente}</p>
                            )}
                          </div>
                        </div>

                        {/* Ubicación Cliente (full-width) */}
                        <div>
                          <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Ubicación</label>
                          <textarea
                            value={cotizacionConfig?.ubicacion || ''}
                            onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacion: e.target.value } : null)}
                            rows={3}
                            className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed] resize-none"
                          />
                        </div>
                      </div>

                      {/* Contenedor Proveedor */}
                      <div className="space-y-2 bg-[#111] p-3 rounded-lg border border-[#333]">
                        <h4 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                          <FaEnvelope /> Información del Proveedor
                        </h4>
                        <div className="border-t border-[#333]"></div>

                        {/* Fila 1: Profesional, Empresa */}
                        <div className="grid md:grid-cols-2 gap-2">
                          {/* Profesional */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">
                              Profesional {!cotizacionConfig?.profesional && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              value={cotizacionConfig?.profesional || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, profesional: e.target.value } : null)}
                              className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                                erroresValidacionCotizacion.profesional ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                              }`}
                            />
                            {erroresValidacionCotizacion.profesional && (
                              <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.profesional}</p>
                            )}
                          </div>

                          {/* Empresa Proveedor */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Empresa</label>
                            <input
                              type="text"
                              value={cotizacionConfig?.empresaProveedor || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, empresaProveedor: e.target.value } : null)}
                              className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                            />
                          </div>
                        </div>

                        {/* Fila 2: Email, WhatsApp */}
                        <div className="grid md:grid-cols-2 gap-2">
                          {/* Email */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Email</label>
                            <input
                              type="email"
                              value={cotizacionConfig?.email || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, email: e.target.value } : null)}
                              className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                                erroresValidacionCotizacion.email ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                              }`}
                            />
                            {erroresValidacionCotizacion.email && (
                              <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.email}</p>
                            )}
                          </div>

                          {/* WhatsApp */}
                          <div>
                            <label className="block text-[#ededed] font-semibold text-[10px] mb-1">WhatsApp</label>
                            <input
                              type="tel"
                              value={cotizacionConfig?.whatsapp || ''}
                              onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, whatsapp: e.target.value } : null)}
                              className={`w-full px-3 py-2 bg-black border rounded focus:outline-none text-xs text-[#ededed] ${
                                erroresValidacionCotizacion.whatsapp ? 'border-red-500 focus:border-red-500' : 'border-[#333] focus:border-[#666]'
                              }`}
                              placeholder="+535 856 9291"
                            />
                            {erroresValidacionCotizacion.whatsapp && (
                              <p className="text-red-500 text-xs mt-1">{erroresValidacionCotizacion.whatsapp}</p>
                            )}
                          </div>
                        </div>

                        {/* Ubicación Proveedor (full-width) */}
                        <div>
                          <label className="block text-[#ededed] font-semibold text-[10px] mb-1">Ubicación</label>
                          <textarea
                            value={cotizacionConfig?.ubicacionProveedor || ''}
                            onChange={(e) => setCotizacionConfig(cotizacionConfig ? { ...cotizacionConfig, ubicacionProveedor: e.target.value } : null)}
                            rows={3}
                            className="w-full px-3 py-2 bg-black border border-[#333] rounded focus:border-[#666] focus:outline-none text-xs text-[#ededed] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones Guardar y Sincronizar */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={guardarCotizacion}
                      className="flex items-center gap-2 px-6 py-2 bg-[#ededed] text-black font-semibold rounded-lg hover:bg-[#ccc] transition-all"
                    >
                      <FaSave /> Guardar Cotización
                    </motion.button>
                  </div>
                </div>
              )}
              </div>
            )}

            {/* TAB 2: OFERTA */}
            {activePageTab === 'oferta' && (
              <div className="p-6 space-y-4">
                {/* Sección: Servicios Base */}
            <CollapsibleSection
              id="servicios-base"
              title="Servicios Base Asociados al Paquete"
              icon=""
              defaultOpen={true}
            >
              {/* Lista de Servicios Base Existentes */}
              {serviciosBase.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="text-xs font-semibold text-[#888888] mb-2 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 px-2 text-left">
                    <span>Nombre</span>
                    <span>Precio</span>
                    <span>Meses Gratis</span>
                    <span>Meses Pago</span>
                    <span>Subtotal</span>
                    <span className="text-center">Acciones</span>
                  </div>
                  {serviciosBase.map((servicio) => (
                    <div
                      key={servicio.id}
                      className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center bg-[#111] p-2 rounded border border-[#333]"
                    >
                      {editandoServicioBaseId === servicio.id ? (
                        <>
                          <input
                            type="text"
                            value={servicioBaseEditando?.nombre || ''}
                            onChange={(e) =>
                              setServicioBaseEditando({
                                ...servicioBaseEditando!,
                                nombre: e.target.value,
                              })
                            }
                            className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                          />
                          <input
                            type="number"
                            value={servicioBaseEditando?.precio || 0}
                            onChange={(e) =>
                              setServicioBaseEditando({
                                ...servicioBaseEditando!,
                                precio: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                            min="0"
                          />
                          <input
                            type="number"
                            value={servicioBaseEditando?.mesesGratis || 0}
                            onChange={(e) =>
                              setServicioBaseEditando({
                                ...servicioBaseEditando!,
                                mesesGratis: parseInt(e.target.value) || 0,
                              })
                            }
                            className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                            min="0"
                            max="12"
                          />
                          <input
                            type="number"
                            value={servicioBaseEditando?.mesesPago || 0}
                            onChange={(e) =>
                              setServicioBaseEditando({
                                ...servicioBaseEditando!,
                                mesesPago: parseInt(e.target.value) || 0,
                              })
                            }
                            className="px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                            min="1"
                            max="12"
                          />
                          <span className="text-sm font-bold text-[#ededed]">
                            ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                          </span>
                          <div className="flex gap-1 justify-center">
                            <button
                              aria-label="Guardar servicio base"
                              onClick={guardarEditarServicioBase}
                              className="p-1.5 bg-white text-black rounded hover:bg-white/90 transition-all"
                            >
                              <FaCheck size={12} />
                            </button>
                            <button
                              aria-label="Cancelar edición servicio base"
                              onClick={cancelarEditarServicioBase}
                              className="p-1.5 bg-[#222] text-[#ededed] rounded hover:bg-[#333] transition-all"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[#888888] text-xs">{servicio.nombre}</span>
                          <span className="text-[#888888] text-xs">${servicio.precio.toFixed(2)}</span>
                          <span className="text-[#888888] text-xs">{servicio.mesesGratis}m</span>
                          <span className="text-[#888888] text-xs">{servicio.mesesPago}m</span>
                          <span className="text-[#888888] text-xs">
                            ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                          </span>
                          <div className="flex gap-1 justify-center">
                            <button
                              aria-label={`Editar servicio base ${servicio.nombre}`}
                              onClick={() => abrirEditarServicioBase(servicio)}
                              className="p-1.5 bg-white text-black rounded hover:bg-white/90 transition-all"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              aria-label={`Eliminar servicio base ${servicio.nombre}`}
                              onClick={() => eliminarServicioBase(servicio.id)}
                              className="p-1.5 bg-white text-black rounded hover:bg-white/90 transition-all"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para Agregar Nuevo Servicio Base */}
              <div className="space-y-2 p-3 bg-[#111] rounded border border-dashed border-[#333]">
                <h3 className="text-xs font-bold text-[#ededed] mb-1">Agregar Nuevo Servicio Base</h3>
                <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-2 items-end">
                  <div>
                    <label htmlFor="nuevoServicioBaseNombre" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                      Nombre del Servicio
                    </label>
                    <input
                      id="nuevoServicioBaseNombre"
                      type="text"
                      placeholder="Ej: Hosting, SSL, etc."
                      value={nuevoServicioBase.nombre}
                      onChange={(e) =>
                        setNuevoServicioBase({ ...nuevoServicioBase, nombre: e.target.value })
                      }
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoServicioBasePrecio" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                      Precio
                    </label>
                    <input
                      id="nuevoServicioBasePrecio"
                      type="number"
                      placeholder="0"
                      value={nuevoServicioBase.precio}
                      onChange={(e) =>
                        setNuevoServicioBase({
                          ...nuevoServicioBase,
                          precio: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoServicioBaseMesesGratis" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                      Meses Gratis
                    </label>
                    <input
                      id="nuevoServicioBaseMesesGratis"
                      type="number"
                      placeholder="0"
                      value={nuevoServicioBase.mesesGratis}
                      onChange={(e) => {
                        const gratis = parseInt(e.target.value) || 0;
                        const pagoCalculado = Math.max(1, 12 - gratis);
                        setNuevoServicioBase({
                          ...nuevoServicioBase,
                          mesesGratis: Math.min(gratis, 12),
                          mesesPago: pagoCalculado,
                        })
                      }}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                      min="0"
                      max="12"
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoServicioBaseMesesPago" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                      Meses Pago
                    </label>
                    <input
                      id="nuevoServicioBaseMesesPago"
                      type="number"
                      placeholder="12"
                      value={nuevoServicioBase.mesesPago}
                      onChange={(e) => {
                        const pago = parseInt(e.target.value) || 12;
                        const pagoValidado = Math.max(1, Math.min(pago, 12));
                        setNuevoServicioBase({
                          ...nuevoServicioBase,
                          mesesPago: pagoValidado,
                        })
                      }}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                      min="1"
                      max="12"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={agregarServicioBase}
                    disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                        ? 'bg-white text-[#0a0a0f] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        : 'bg-white/10 text-white/70 cursor-not-allowed'
                    }`}
                  >
                    <FaPlus /> Agregar
                  </motion.button>
                </div>
              </div>
            </CollapsibleSection>

            {/* Sección: Servicios Opcionales */}
            <CollapsibleSection
              id="paquetes"
              title="Descripción del paquetes"
              icon=""
              defaultOpen={true}
            >
              <div className="space-y-2 p-3 bg-[#111] rounded border border-dashed border-[#333]">
                <h3 className="text-xs font-bold text-[#ededed] mb-1">Agregar Nuevo Paquete</h3>
                <div className="grid md:grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="paqueteNombre" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
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
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                  <div>
                    <label htmlFor="paqueteDesarrollo" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                      Desarrollo*
                    </label>
                    <input
                      id="paqueteDesarrollo"
                      type="number"
                      placeholder="0"
                      value={paqueteActual.desarrollo}
                      onChange={(e) =>
                        setPaqueteActual({
                          ...paqueteActual,
                          desarrollo: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="paqueteDescuento" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                      Descuento (%)
                    </label>
                    <input
                      id="paqueteDescuento"
                      type="number"
                      placeholder="0"
                      value={paqueteActual.descuento}
                      onChange={(e) =>
                        setPaqueteActual({
                          ...paqueteActual,
                          descuento: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label htmlFor="paqueteTipo" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                      Tipo de Paquete
                    </label>
                    <input
                      id="paqueteTipo"
                      type="text"
                      placeholder="Ej: Básico"
                      value={paqueteActual.tipo || ''}
                      onChange={(e) =>
                        setPaqueteActual({ ...paqueteActual, tipo: e.target.value })
                      }
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="paqueteDescripcion" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">
                    Descripción del Paquete
                  </label>
                  <textarea
                    id="paqueteDescripcion"
                    placeholder="Ej: Paquete personalizado para empresas..."
                    value={paqueteActual.descripcion || ''}
                    onChange={(e) => {
                      setPaqueteActual({ ...paqueteActual, descripcion: e.target.value });
                      if (descripcionTextareaRef.current) {
                        descripcionTextareaRef.current.style.height = 'auto';
                        descripcionTextareaRef.current.style.height = descripcionTextareaRef.current.scrollHeight + 'px';
                      }
                    }}
                    ref={descripcionTextareaRef}
                    className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed] resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Sección 3: Servicios Opcionales */}
            <CollapsibleSection
              id="servicios-opcionales"
              title="Servicios Opcionales del Paquete"
              icon=""
              defaultOpen={true}
            >
              {serviciosOpcionales.length > 0 && (
                <div className="mb-6 space-y-2">
                  <div className="text-xs font-semibold text-[#888888] mb-2 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 px-2 text-left">
                    <span>Nombre</span>
                    <span>Precio</span>
                    <span>Meses Gratis</span>
                    <span>Meses Pago</span>
                    <span>Subtotal</span>
                    <span className="text-center">Acciones</span>
                  </div>
                  {serviciosOpcionales.map(serv => (
                    <div
                      key={serv.id}
                      className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center bg-[#111] p-2 rounded border border-[#333]"
                    >
                      {editandoServicioId === serv.id ? (
                        <>
                          <input
                            type="text"
                            value={servicioEditando?.nombre || ''}
                            aria-label="Nombre servicio opcional"
                            onChange={(e) => setServicioEditando({ ...servicioEditando!, nombre: e.target.value })}
                            className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                          />
                          <input
                            type="number"
                            value={servicioEditando?.precio || 0}
                            aria-label="Precio mensual servicio opcional"
                            min={0}
                            onChange={(e) => setServicioEditando({ ...servicioEditando!, precio: Number.parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                          />
                          <input
                            type="number"
                            value={servicioEditando?.mesesGratis || 0}
                            aria-label="Meses gratis servicio opcional"
                            min={0}
                            max={12}
                            onChange={(e) => {
                              const val = Number.parseInt(e.target.value) || 0
                              const nm = normalizarMeses(val, servicioEditando?.mesesPago || 12)
                              setServicioEditando({ ...servicioEditando!, ...nm })
                            }}
                            className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                          />
                          <input
                            type="number"
                            value={servicioEditando?.mesesPago || 0}
                            aria-label="Meses pago servicio opcional"
                            min={0}
                            max={12}
                            onChange={(e) => {
                              const val = Number.parseInt(e.target.value) || 0
                              const nm = normalizarMeses(servicioEditando?.mesesGratis || 0, val)
                              setServicioEditando({ ...servicioEditando!, ...nm })
                            }}
                            className="w-full px-2 py-1 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                          />
                          <span className="text-[#888888] text-xs">${((servicioEditando?.precio || 0) * (servicioEditando?.mesesPago || 0)).toFixed(2)}</span>
                          <div className="flex gap-2 justify-center">
                            <button
                              aria-label="Guardar servicio opcional"
                              onClick={guardarEditarServicioOpcional}
                              className="w-full px-2 py-1.5 bg-white text-black rounded hover:bg-gray-200 transition-all focus:outline-none text-xs"
                              disabled={!(servicioEditando?.nombre.trim() && (servicioEditando?.precio || 0) > 0)}
                            >
                              <FaCheck />
                            </button>
                            <button
                              aria-label="Cancelar edición servicio opcional"
                              onClick={cancelarEditarServicioOpcional}
                              className="w-full px-2 py-1.5 bg-[#222] text-[#ededed] rounded hover:bg-[#333] transition-all focus:outline-none text-xs"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[#888888] text-xs">{serv.nombre}</span>
                          <span className="text-[#888888] text-xs">${serv.precio.toFixed(2)}</span>
                          <span className="text-[#888888] text-xs">{serv.mesesGratis}m</span>
                          <span className="text-[#888888] text-xs">{serv.mesesPago}m</span>
                          <span className="text-[#888888] text-xs">${(serv.precio * serv.mesesPago).toFixed(2)}</span>
                          <div className="flex gap-2 justify-center">
                            <button
                              aria-label="Editar servicio opcional"
                              onClick={() => abrirEditarServicioOpcional(serv)}
                              className="px-2 py-1 bg-white text-black rounded hover:bg-gray-200 transition-all focus:outline-none text-xs"
                            >
                              <FaEdit />
                            </button>
                            <button
                              aria-label="Eliminar servicio opcional"
                              onClick={() => eliminarServicioOpcional(serv.id)}
                              className="px-2 py-1 bg-white text-black rounded hover:bg-gray-200 transition-all focus:outline-none text-xs"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 p-3 bg-[#111] rounded border border-dashed border-[#333]">
                <h3 className="text-xs font-bold text-[#ededed] mb-1">Agregar Nuevo Servicio Opcional</h3>
                <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-2 items-end">
                  <div>
                    <label htmlFor="servOpcNombre" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">Nombre</label>
                    <input
                      id="servOpcNombre"
                      type="text"
                      placeholder="Ej: SEO Premium"
                      value={nuevoServicio.nombre}
                      onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                  <div>
                    <label htmlFor="servOpcPrecio" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">Precio</label>
                    <input
                      id="servOpcPrecio"
                      type="number"
                      min={0}
                      value={nuevoServicio.precio}
                      placeholder="0"
                      onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                  <div>
                    <label htmlFor="servOpcGratis" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">Gratis</label>
                    <input
                      id="servOpcGratis"
                      type="number"
                      min={0}
                      max={12}
                      value={nuevoServicio.mesesGratis}
                      onChange={(e) => {
                        const val = Number.parseInt(e.target.value) || 0
                        const nm = normalizarMeses(val, nuevoServicio.mesesPago)
                        setNuevoServicio({ ...nuevoServicio, ...nm })
                      }}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                  <div>
                    <label htmlFor="servOpcPago" className="block font-semibold text-[#888888] mb-0.5 text-[10px]">Pago</label>
                    <input
                      id="servOpcPago"
                      type="number"
                      min={0}
                      max={12}
                      value={nuevoServicio.mesesPago}
                      onChange={(e) => {
                        const val = Number.parseInt(e.target.value) || 0
                        const nm = normalizarMeses(nuevoServicio.mesesGratis, val)
                        setNuevoServicio({ ...nuevoServicio, ...nm })
                      }}
                      className="w-full px-2 py-1.5 bg-black border border-[#333] rounded focus:border-white/50 focus:outline-none text-xs text-[#ededed]"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={agregarServicioOpcional}
                    disabled={!(nuevoServicio.nombre.trim() && nuevoServicio.precio > 0)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      nuevoServicio.nombre.trim() && nuevoServicio.precio > 0
                        ? 'bg-white text-[#0a0a0f] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        : 'bg-white/10 text-white/70 cursor-not-allowed'
                    }`}
                  >
                    <FaPlus /> Agregar
                  </motion.button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#111] rounded-lg border border-[#333] text-xs flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                <span className="text-[#888888]">Servicios opcionales: {serviciosOpcionales.length}</span>
                <span className="text-[#888888]">Total Año 1: ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span>
                <span className="text-[#888888]">Total Anual (Año 2+): ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span>
              </div>
              {!serviciosOpcionalesValidos && serviciosOpcionales.length > 0 && (
                <p className="mt-1 text-[10px] text-[#888888]">
                  Revisa meses (Meses Gratis + Meses Pago deben sumar 12) y que todos tengan nombre y precio.
                </p>
              )}

              {/* Botón Crear Paquete - Ahora Flotante */}
              {!todoEsValido && (
                <div className="mt-4 pt-3 border-t border-[#333]">
                  <p className="text-xs text-[#888888] text-center bg-[#111] p-3 rounded-lg border border-[#333]">
                    ⚠️ Completa: Nombre del paquete, Desarrollo, Precios servicios y Meses válidos
                  </p>
                </div>
              )}
            </CollapsibleSection>
              </div>
            )}

            {/* TAB 3: PAQUETES */}
            {activePageTab === 'paquetes' && (
              <div className="p-6 space-y-4">
            {/* Sección 4: Paquetes Creados */}
            <CollapsibleSection
              id="paquetes-creados"
              title={`Paquetes Creados (${snapshots.filter(s => s.activo).length})`}
              icon=""
              defaultOpen={true}
            >
            {cargandoSnapshots ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#111] rounded-xl border border-[#333] p-8 text-center"
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <FaCalculator className="text-[#ededed] text-3xl" />
                  </motion.div>
                  <p className="text-lg text-[#ededed] font-semibold">Cargando paquetes...</p>
                </div>
              </motion.div>
            ) : errorSnapshots ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#111] rounded-xl border border-red-500/30 p-8"
              >
                <p className="text-[#ededed] font-semibold">❌ {errorSnapshots}</p>
              </motion.div>
            ) : snapshots.length > 0 ? (
                <div className="space-y-4 md:grid md:grid-cols-2 gap-2 md:space-y-0">
                  {snapshots.filter(s => s.activo).map((snapshot, idx) => (
                    <motion.div
                      key={snapshot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#111] rounded-xl border border-[#333] overflow-hidden"
                    >
                      {/* Header del Snapshot */}
                      <div className="bg-[#111] p-4 border-b border-[#333] relative">
                        {/* Contenido Principal */}
                        <div className="pr-4">
                          <h3 className="text-xl font-bold text-[#ededed]">
                            {snapshot.nombre}
                          </h3>
                          {snapshot.paquete.tipo && (
                            <p className="text-xs font-semibold tracking-wide text-[#888888] uppercase mt-1">
                              {snapshot.paquete.tipo}
                            </p>
                          )}
                          {snapshot.paquete.descripcion && (
                            <p className="text-sm text-[#888888] italic mt-1 line-clamp-3 min-h-[4rem]">
                              {snapshot.paquete.descripcion}
                            </p>
                          )}
                          <p className="text-sm text-[#888888] mt-2">
                            {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>

                        {/* Botones FAB Flotantes Horizontales */}
                        <div className="absolute top-2 right-2 flex flex-row gap-1.5 bg-[#111] p-1.5 rounded-lg border border-[#333]">
                          {/* FAB Toggle Activo */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              const marcado = !snapshot.activo
                              const provisional = { ...snapshot, activo: marcado }
                              setSnapshots(prev => prev.map(s => s.id === snapshot.id ? provisional : s))
                              try {
                                const actualizado = { ...provisional }
                                actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
                                actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
                                actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
                                const guardado = await actualizarSnapshot(actualizado.id, actualizado)
                                setSnapshots(prev => prev.map(s => s.id === snapshot.id ? guardado : s))
                                console.log(`✅ Estado Activo actualizado para ${snapshot.nombre}: ${marcado}`)
                                await refreshSnapshots()
                              } catch (err) {
                                console.error('Error al autoguardar estado activo:', err)
                                setSnapshots(prev => prev.map(s => s.id === snapshot.id ? { ...s, activo: !marcado } : s))
                                alert('❌ No se pudo actualizar el estado Activo. Intenta nuevamente.')
                              }
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              snapshot.activo
                                ? 'bg-[#ededed] text-black hover:bg-[#fff]'
                                : 'bg-[#222] text-[#888888] hover:bg-[#333]'
                            }`}
                            title={snapshot.activo ? 'Desactivar' : 'Activar'}
                          >
                            {snapshot.activo ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </motion.button>

                          {/* FAB Editar */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => abrirModalEditar(snapshot)}
                            className="w-7 h-7 rounded-full bg-[#ededed] text-black hover:bg-[#fff] transition-all flex items-center justify-center"
                            title="Editar paquete"
                          >
                            <FaEdit size={12} />
                          </motion.button>

                          {/* FAB Eliminar */}
                          <motion.button
                            aria-label={`Eliminar paquete ${snapshot.nombre}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEliminarSnapshot(snapshot.id)}
                            className="w-7 h-7 rounded-full bg-[#222] text-[#888888] hover:bg-[#333] transition-all flex items-center justify-center"
                            title="Eliminar paquete"
                          >
                            <FaTrash size={11} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Detalle del Snapshot - Tabla */}
                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[#333] bg-[#111] text-pretty">
                                <th className="text-left p-1.5 font-bold text-[#ededed] text-xs">Concepto</th>
                                <th className="text-center p-1.5 font-bold text-[#ededed] text-xs">Meses Gratis</th>
                                <th className="text-center p-1.5 font-bold text-[#ededed] text-xs">Meses Pago</th>
                                <th className="text-right p-1.5 font-bold text-[#ededed] bg-[#222] text-xs">Costo Mensual</th>
                                <th className="text-right p-1.5 font-bold text-[#ededed] bg-[#222] text-xs">Año 1</th>
                                <th className="text-right p-1.5 font-bold text-[#ededed] bg-[#222] text-xs">Año 2</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Servicios Base */}
                              <tr className="border-b border-[#333] bg-[#111]">
                                {/* Título de sección */}
                                <td className="p-1.5 font-bold text-[#ededed] text-xs" colSpan={3}>
                                  Servicios Base
                                </td>
                                {/* Subtotal Mensual */}
                                <td className="p-1.5 text-right font-bold text-[#ededed] bg-[#222] text-xs">
                                  ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0), 0)).toFixed(2)}
                                </td>
                                {/* Subtotal Año 1 */}
                                <td className="p-1.5 text-right font-bold text-[#ededed] bg-[#222] text-xs">
                                  ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0) * (s.mesesPago ?? 0), 0)).toFixed(2)}
                                </td>
                                {/* Subtotal Año 2 */}
                                <td className="p-1.5 text-right font-bold text-[#ededed] bg-[#222] text-xs">
                                  ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0) * 12, 0)).toFixed(2)}
                                </td>
                              </tr>
                              {snapshot.serviciosBase?.map((servicio) => (
                                <tr key={servicio.id} className="border-b border-[#333] hover:bg-[#222] transition-colors">
                                  <td className="p-1.5 text-[#ededed] text-xs">{servicio.nombre}</td>
                                  <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                    {servicio.mesesGratis}
                                  </td>
                                  <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                    {servicio.mesesPago}
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    ${servicio.precio.toFixed(2)}
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    ${(servicio.precio * 12).toFixed(2)}
                                  </td>
                                </tr>
                              )) || (
                                <tr className="border-b border-[#333]">
                                  <td colSpan={6} className="p-1.5 text-center text-[#888888] italic text-xs">
                                    No hay servicios base definidos
                                  </td>
                                </tr>
                              )}

                              {/* Paquete */}
                              <tr className="border-b border-[#333]">
                                <td colSpan={6} className="p-1.5 font-bold bg-[#111] text-[#ededed] text-xs">
                                  Costo del desarrollo
                                </td>
                              </tr>
                              <tr className="border-b border-[#333] hover:bg-[#222] transition-colors">
                                <td className="p-1.5 text-[#ededed] text-xs">Desarrollo</td>
                                <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                                <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                                <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                  ${snapshot.paquete.desarrollo.toFixed(2)}
                                </td>
                                <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                  ${snapshot.paquete.desarrollo.toFixed(2)}
                                </td>
                                <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                  -
                                </td>
                              </tr>
                              {snapshot.paquete.descuento > 0 && (
                                <tr className="border-b border-[#333] hover:bg-[#222] transition-colors">
                                  <td className="p-1.5 text-[#ededed] text-xs">Descuento</td>
                                  <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                                  <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">-</td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    {snapshot.paquete.descuento}%
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    {snapshot.paquete.descuento}%
                                  </td>
                                  <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                    -
                                  </td>
                                </tr>
                              )}

                              {/* Otros Servicios */}
                              {snapshot.otrosServicios.length > 0 && (
                                <>
                                  <tr className="border-b border-[#333]">
                                    <td colSpan={6} className="p-1.5 font-bold bg-[#111] text-[#ededed] text-xs">
                                      Otros Servicios
                                    </td>
                                  </tr>
                                  {snapshot.otrosServicios.map((servicio, sIdx) => (
                                    <motion.tr
                                      key={sIdx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: sIdx * 0.05 }}
                                      className="border-b border-[#333] hover:bg-[#222] transition-colors"
                                    >
                                      <td className="p-1.5 text-[#ededed] text-xs">
                                        {servicio.nombre}
                                      </td>
                                      <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                        {servicio.mesesGratis}
                                      </td>
                                      <td className="p-1.5 text-center font-semibold text-[#ededed] text-xs">
                                        {servicio.mesesPago}
                                      </td>
                                      <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                        ${servicio.precio.toFixed(2)}
                                      </td>
                                      <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                        ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                                      </td>
                                      <td className="p-1.5 text-right font-semibold text-[#ededed] bg-[#222] text-xs">
                                        ${(servicio.precio * 12).toFixed(2)}
                                      </td>
                                    </motion.tr>
                                  ))}
                                </>
                              )}

                              {/* Costos Finales */}
                              <tr className="border-b border-[#333]">
                                <td colSpan={6} className="p-1.5 font-bold bg-[#111] text-[#ededed] text-xs">
                                  Costos totales
                                </td>
                              </tr>
                              <tr className="border-b border-[#333] bg-[#111]">
                                <td className="p-1.5 font-semibold text-[#ededed] text-xs">Pago Inicial</td>
                                <td colSpan={5} className="p-1.5 text-right font-bold text-[#ededed] text-sm">
                                  ${snapshot.costos.inicial.toFixed(2)}
                                </td>
                              </tr>
                              <tr className="border-b border-[#333] bg-[#111]">
                                <td className="p-1.5 font-semibold text-[#ededed] text-xs">Año 1</td>
                                <td colSpan={5} className="p-1.5 text-right font-bold text-[#ededed] text-sm">
                                  ${snapshot.costos.año1.toFixed(2)}
                                </td>
                              </tr>
                              <tr className="bg-[#111]">
                                <td className="p-1.5 font-semibold text-[#ededed] text-xs">Año 2</td>
                                <td colSpan={5} className="p-1.5 text-right font-bold text-[#ededed] text-sm">
                                  ${snapshot.costos.año2.toFixed(2)}
                                </td>
                              </tr>
                              <tr className="bg-[#222]">
                                <td colSpan={6} className="p-1.5 text-xs text-[#888888] italic text-center">
                                  Año 2 no incluye desarrollo (pago único realizado en Año 1
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            ) : (
              <div className="bg-[#111] rounded-xl border border-[#333] p-8 text-center">
                <p className="text-lg text-[#888888] font-semibold">📭 No hay paquetes creados aún</p>
                <p className="text-sm text-[#888888] mt-2">Crea tu primer paquete completando los datos arriba</p>
              </div>
            )}
            </CollapsibleSection>

            {/* Sección 5: Paquetes Inactivos */}
            {snapshots.filter(s => !s.activo).length > 0 && (
            <CollapsibleSection
              id="paquetes-inactivos"
              title={`Paquetes Inactivos (${snapshots.filter(s => !s.activo).length})`}
              icon=""
              defaultOpen={false}
            >
                <div className="space-y-4">
                  {snapshots.filter(s => !s.activo).map((snapshot, idx) => (
                    <motion.div
                      key={snapshot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#111] rounded-lg border border-dashed border-[#333] p-4 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#ededed] text-lg">{snapshot.nombre}</h3>
                          {snapshot.paquete.tipo && (
                            <p className="text-xs font-semibold tracking-wide text-[#666] uppercase mt-1">
                              {snapshot.paquete.tipo}
                            </p>
                          )}
                          {snapshot.paquete.descripcion && (
                            <p className="text-sm text-[#666] italic mt-1">
                              {snapshot.paquete.descripcion}
                            </p>
                          )}
                          <p className="text-sm text-[#666] mt-2">
                            {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 relative">
                            <input
                              id={`snapshot-inactivo-${snapshot.id}`}
                              type="checkbox"
                              checked={snapshot.activo}
                              onChange={async (e) => {
                                const marcado = e.target.checked
                                const provisional = { ...snapshot, activo: marcado }
                                setSnapshots(prev => prev.map(s => s.id === snapshot.id ? provisional : s))
                                try {
                                  const actualizado = { ...provisional }
                                  actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
                                  actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
                                  actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
                                  const guardado = await actualizarSnapshot(actualizado.id, actualizado)
                                  setSnapshots(prev => prev.map(s => s.id === snapshot.id ? guardado : s))
                                  console.log(`Estado Activo actualizado para ${snapshot.nombre}: ${marcado}`)
                                  // Disparar refresh global inmediatamente
                                  await refreshSnapshots()
                                } catch (err) {
                                  console.error('Error al actualizar estado activo:', err)
                                  setSnapshots(prev => prev.map(s => s.id === snapshot.id ? { ...s, activo: !marcado } : s))
                                  alert('❌ No se pudo actualizar el estado. Intenta nuevamente.')
                                }
                              }}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <label htmlFor={`snapshot-inactivo-${snapshot.id}`} className="font-semibold text-[#888888] text-sm">Activar</label>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEliminarSnapshot(snapshot.id)}
                            className="w-9 h-9 bg-[#222] text-[#888888] hover:bg-[#333] transition-colors flex items-center justify-center rounded-lg"
                          >
                            <FaTrash size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            </CollapsibleSection>
            )}

              </div>
            )}

            {/* TAB 4: ESTILOS Y DISEÑO */}
            {activePageTab === 'estilos' && (
              <div className="p-6 space-y-4">
                <div className="bg-[#111] p-4 rounded-lg border border-[#333] space-y-4">
                  <h3 className="text-sm font-bold text-[#ededed] mb-3 flex items-center gap-2">
                    <FaPalette size={16} /> Configuración de Estilos
                  </h3>
                  
                  <div className="text-center text-[#888888] py-8">
                    <p className="mb-2">✨ Configuración visual para personalizar tu cotización</p>
                    <p className="text-xs">Los estilos se aplicarán automáticamente a tu propuesta</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: HISTORIAL */}
            {activePageTab === 'historial' && (
              <div className="p-6 space-y-4">
                <Historial 
                  quotations={quotations} 
                  snapshots={snapshots}
                  onEdit={(quotation) => {
                    // Cargar cotización en cotizacionActual
                    setCotizacionActual({
                      id: quotation.id,
                      numero: quotation.numero,
                      versionNumber: quotation.versionNumber,
                      fechaEmision: quotation.fechaEmision,
                      tiempoValidez: quotation.tiempoValidez,
                      empresa: quotation.empresa,
                      sector: quotation.sector,
                      ubicacion: quotation.ubicacion,
                      emailCliente: quotation.emailCliente,
                      whatsappCliente: quotation.whatsappCliente,
                      profesional: quotation.profesional,
                      empresaProveedor: quotation.empresaProveedor,
                      emailProveedor: quotation.email,
                      whatsappProveedor: quotation.whatsapp,
                      ubicacionProveedor: quotation.ubicacionProveedor,
                      heroTituloMain: quotation.heroTituloMain,
                      heroTituloSub: quotation.heroTituloSub,
                    })
                    
                    // Cargar el primer snapshot asociado
                    const quotationSnapshot = snapshots.find(s => s.quotationConfigId === quotation.id)
                    if (quotationSnapshot) {
                      setSnapshotEditando(quotationSnapshot)
                    }
                    
                    // Abrir modal
                    setShowModalEditar(true)
                    console.log('Cotización cargada en modal:', quotation.numero)
                  }}
                  onDelete={async (quotationId) => {
                    try {
                      const response = await fetch(`/api/quotations/${quotationId}`, {
                        method: 'DELETE'
                      })
                      if (response.ok) {
                        // Recargar quotations
                        const updatedResponse = await fetch('/api/quotations')
                        const data = await updatedResponse.json()
                        if (data.success) {
                          setQuotations(data.data || [])
                          toast.success('✓ Cotización eliminada correctamente')
                        }
                      } else {
                        toast.error('❌ Error al eliminar la cotización')
                      }
                    } catch (error) {
                      console.error('Error eliminando cotización:', error)
                      toast.error('❌ Error al eliminar la cotización')
                    }
                  }}
                  onToggleActive={async (quotationId, newStatus) => {
                    try {
                      const response = await fetch(`/api/quotations/${quotationId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          activo: newStatus.activo,
                          isGlobal: newStatus.isGlobal
                        })
                      })
                      if (response.ok) {
                        // Recargar quotations
                        const updatedResponse = await fetch('/api/quotations')
                        const data = await updatedResponse.json()
                        if (data.success) {
                          setQuotations(data.data || [])
                          const estado = newStatus.isGlobal ? 'activada' : 'desactivada'
                          toast.success(`✓ Cotización ${estado} correctamente`)
                        }
                      } else {
                        toast.error('❌ Error al actualizar el estado')
                      }
                    } catch (error) {
                      console.error('Error actualizando cotización:', error)
                      toast.error('❌ Error al actualizar el estado')
                    }
                  }}
                  onViewProposal={(quotation) => {
                    console.log('Ver propuesta:', quotation)
                  }}
                />
              </div>
            )}

            {/* TAB 6: PREFERENCIAS */}
            {activePageTab === 'preferencias' && (
              <div className="p-6 space-y-4">
                <div className="bg-[#111] p-6 rounded-lg border border-[#333] space-y-4">
                  <h3 className="text-sm font-bold text-[#ededed] mb-4 flex items-center gap-2">
                    <FaCog size={16} /> Preferencias de Usuario
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#222] rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={userPreferences?.cerrarModalAlGuardar || false}
                        onChange={(e) => {
                          if (userPreferences) {
                            setUserPreferences({
                              ...userPreferences,
                              cerrarModalAlGuardar: e.target.checked
                            })
                          }
                        }}
                        className="w-4 h-4 accent-white cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-medium text-[#ededed]">Cerrar modal al guardar</span>
                        <p className="text-xs text-[#888888] mt-0.5">Cierra automáticamente el modal después de guardar cambios</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#222] rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={userPreferences?.mostrarConfirmacionGuardado || false}
                        onChange={(e) => {
                          if (userPreferences) {
                            setUserPreferences({
                              ...userPreferences,
                              mostrarConfirmacionGuardado: e.target.checked
                            })
                          }
                        }}
                        className="w-4 h-4 accent-white cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-medium text-[#ededed]">Mostrar confirmación al guardar</span>
                        <p className="text-xs text-[#888888] mt-0.5">Muestra un mensaje de confirmación al guardar cambios</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#222] rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={userPreferences?.validarDatosAntes || false}
                        onChange={(e) => {
                          if (userPreferences) {
                            setUserPreferences({
                              ...userPreferences,
                              validarDatosAntes: e.target.checked
                            })
                          }
                        }}
                        className="w-4 h-4 accent-white cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-medium text-[#ededed]">Validar datos antes de guardar</span>
                        <p className="text-xs text-[#888888] mt-0.5">Valida todos los datos antes de permitir guardar</p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#333] flex gap-3 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
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
                            toast.error('❌ Error al guardar preferencias')
                          }
                        } catch (error) {
                          console.error('Error guardando preferencias:', error)
                          toast.error('❌ Error al guardar preferencias')
                        }
                      }}
                      className="px-6 py-2 bg-white text-[#0a0a0f] rounded-lg hover:bg-white/90 transition-all font-semibold text-sm flex items-center gap-2"
                    >
                      <FaSave /> Guardar
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal Editar Snapshot */}
      <AnimatePresence>
        {showModalEditar && snapshotEditando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-4 p-4"
            onClick={handleCerrarModalEditar}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black rounded-xl border border-[#333] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-editar-titulo"
            >
              {/* Header Fijo - Diseño Profesional Minimalista */}
              <div className="flex-shrink-0 bg-[#111] text-[#ededed] py-3 px-5 flex justify-between items-center border-b border-[#333]">
                <div>
                  <h2 id="modal-editar-titulo" className="text-lg font-bold flex items-center gap-2">
                    <FaEdit size={14} /> {snapshotEditando.nombre}
                  </h2>
                  <p className="text-xs text-[#888888] mt-0.5">Editar configuración del paquete</p>
                </div>
                <button
                  aria-label="Cerrar modal edición"
                  onClick={handleCerrarModalEditar}
                  className="text-[#888888] hover:text-[#ededed] text-2xl transition-all hover:scale-110"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Contenido Scrollable */}
              <div ref={modalScrollContainerRef} className="flex-1 overflow-y-auto modal-scroll-container">
                {/* TabsModal Component */}
                <TabsModal
                  tabs={[
                    {
                      id: 'descripcion',
                      label: 'Descripción',
                      icon: <FaFileAlt />,
                      hasChanges: pestañaTieneCambios('descripcion'),
                      content: (
                        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                          {/* Fila 1: nombre, tipo, emoji, tagline, tiempo de entrega, costo desarrollo */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Nombre</label>
                              <input
                                type="text"
                                value={snapshotEditando.nombre}
                                onChange={(e) => setSnapshotEditando({ ...snapshotEditando, nombre: e.target.value })}
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                ref={nombrePaqueteInputRef}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Tipo</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.tipo || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tipo: e.target.value}})}
                                placeholder="Básico"
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Emoji</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.emoji || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, emoji: e.target.value}})}
                                placeholder=""
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Tagline</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.tagline || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tagline: e.target.value}})}
                                placeholder="Presencia digital confiable"
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Tiempo Entrega</label>
                              <input
                                type="text"
                                value={snapshotEditando.paquete.tiempoEntrega || ''}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tiempoEntrega: e.target.value}})}
                                placeholder="14 días"
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Costo Desarrollo</label>
                              <input
                                type="number"
                                value={snapshotEditando.paquete.desarrollo}
                                onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, desarrollo: Number.parseFloat(e.target.value) || 0}})}
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                min="0"
                              />
                            </div>
                          </div>

                          {/* Fila 2: Descripción */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Descripción del Paquete</label>
                            <textarea
                              value={snapshotEditando.paquete.descripcion || ''}
                              onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, descripcion: e.target.value}})}
                              placeholder="Paquete personalizado para empresas..."
                              className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                              rows={3}
                            />
                          </div>

                          {/* Vista Previa del Hero */}
                          <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
                            <h3 className="text-xs font-bold text-[#ededed] mb-2">Vista Previa del Hero</h3>
                            <div className="bg-black text-[#ededed] p-4 rounded-lg text-center border border-[#333]">
                              <div className="text-5xl mb-3">{snapshotEditando.paquete.emoji || ''}</div>
                              <div className="text-sm font-bold text-[#888888] mb-2">{snapshotEditando.paquete.tipo || 'Tipo'}</div>
                              <h2 className="text-3xl font-bold mb-3 text-[#ededed]">{snapshotEditando.nombre || 'Nombre del Paquete'}</h2>
                              <p className="text-lg text-[#888888] mb-4">{snapshotEditando.paquete.tagline || 'Tagline descriptivo'}</p>
                              <div className="bg-[#222] rounded-lg p-4 inline-block border border-[#333]">
                                <div className="text-4xl font-bold text-[#ededed]">${snapshotEditando.costos?.inicial || 0} USD</div>
                                <div className="text-sm text-[#888888]">Inversión inicial</div>
                              </div>
                              {snapshotEditando.paquete.tiempoEntrega && (
                                <div className="mt-4 text-sm text-[#888888]">⏱️ {snapshotEditando.paquete.tiempoEntrega}</div>
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
                          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {/* Servicios Base - Lista */}
                            <div>
                              <h3 className="text-xs text-[#ededed] mb-2">Servicios Base</h3>
                              <div className="space-y-2">
                                {snapshotEditando.serviciosBase?.map((servicio, index) => (
                                  <div key={servicio.id} className="grid md:grid-cols-[2fr,1fr,1fr,1fr] gap-2 p-2 bg-[#111] border border-[#333] rounded-lg">
                                    <div>
                                      <label className="block text-[10px] text-[#ededed] mb-0.5">Nombre</label>
                                      <input
                                        type="text"
                                        value={servicio.nombre}
                                        onChange={(e) => {
                                          const nuevosServicios = [...snapshotEditando.serviciosBase]
                                          nuevosServicios[index].nombre = e.target.value
                                          setSnapshotEditando({...snapshotEditando, serviciosBase: nuevosServicios})
                                        }}
                                        className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#ededed] mb-0.5">Precio</label>
                                      <input
                                        type="number"
                                        value={servicio.precio}
                                        onChange={(e) => {
                                          const nuevosServicios = [...snapshotEditando.serviciosBase]
                                          nuevosServicios[index].precio = Number.parseFloat(e.target.value) || 0
                                          setSnapshotEditando({...snapshotEditando, serviciosBase: nuevosServicios})
                                        }}
                                        className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#ededed] mb-0.5">Gratis</label>
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
                                        className="w-full px-3 py-2 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-sm text-[#ededed]"
                                        min="0"
                                        max="12"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#ededed] mb-0.5">Pago</label>
                                      <input
                                        type="number"
                                        value={servicio.mesesPago}
                                        onChange={(e) => {
                                          const nuevosServicios = [...snapshotEditando.serviciosBase]
                                          const pago = Number.parseInt(e.target.value) || 12
                                          nuevosServicios[index].mesesPago = Math.max(1, Math.min(pago, 12))
                                          setSnapshotEditando({...snapshotEditando, serviciosBase: nuevosServicios})
                                        }}
                                        className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                        min="1"
                                        max="12"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Vista Previa de Montos - Servicios Base */}
                            <div className="mt-4 p-3 bg-black border border-[#333] rounded">
                              <h4 className="text-[10px] font-bold text-[#ededed] mb-2">Vista Previa</h4>
                              <div className="space-y-1">
                                {snapshotEditando.serviciosBase?.map((servicio) => {
                                  const subtotal = servicio.precio * servicio.mesesPago
                                  return (
                                    <div key={servicio.id} className="flex justify-between text-xs">
                                      <span className="text-[#888888]">{servicio.nombre} (${servicio.precio} × {servicio.mesesPago} meses)</span>
                                      <span className="font-medium text-[#ededed]">${subtotal.toFixed(2)}</span>
                                    </div>
                                  )
                                })}
                                <div className="border-t border-[#333] pt-2 mt-2 flex justify-between">
                                  <span className="font-bold text-[#ededed] text-xs">TOTAL AÑO 1</span>
                                  <span className="font-bold text-[#ededed] text-base">
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
                          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {/* Otros Servicios - Lista */}
                            <div>
                              <h3 className="text-xs text-[#ededed] mb-2">Otros Servicios</h3>
                              {snapshotEditando.otrosServicios.length > 0 ? (
                                <div className="space-y-2">
                                  {snapshotEditando.otrosServicios.map((servicio, idx) => (
                                    <div key={idx} className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-2 p-2 bg-[#111] border border-[#333] rounded-lg items-end">
                                      <div>
                                        <label className="block text-[10px] text-[#ededed] mb-0.5">Nombre</label>
                                        <input
                                          type="text"
                                          value={servicio.nombre}
                                          onChange={(e) => {
                                            const actualizado = [...snapshotEditando.otrosServicios]
                                            actualizado[idx].nombre = e.target.value
                                            setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                          }}
                                          className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-[#ededed] mb-0.5">Precio</label>
                                        <input
                                          type="number"
                                          value={servicio.precio}
                                          onChange={(e) => {
                                            const actualizado = [...snapshotEditando.otrosServicios]
                                            actualizado[idx].precio = Number.parseFloat(e.target.value) || 0
                                            setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                          }}
                                          className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                          min="0"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-[#ededed] mb-0.5">Gratis</label>
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
                                          className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                          min="0"
                                          max="12"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-[#ededed] mb-0.5">Pago</label>
                                        <input
                                          type="number"
                                          value={servicio.mesesPago}
                                          onChange={(e) => {
                                            const actualizado = [...snapshotEditando.otrosServicios]
                                            const pago = Number.parseInt(e.target.value) || 12
                                            actualizado[idx].mesesPago = Math.max(1, Math.min(pago, 12))
                                            setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                          }}
                                          className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                          min="1"
                                          max="12"
                                        />
                                      </div>
                                      <button
                                        onClick={() => {
                                          const actualizado = snapshotEditando.otrosServicios.filter((_, i) => i !== idx)
                                          setSnapshotEditando({...snapshotEditando, otrosServicios: actualizado})
                                        }}
                                        className="w-8 h-8 bg-[#111] border border-[#333] text-[#888888] hover:text-[#ededed] hover:bg-[#222] transition-colors flex items-center justify-center"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[#888888] text-sm mb-3">Sin otros servicios agregados</p>
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
                                className="mt-2 px-3 py-1.5 bg-[#ededed] text-black hover:bg-white transition-colors flex items-center gap-2 font-semibold text-xs"
                              >
                                <FaPlus /> Agregar Servicio
                              </button>
                            </div>

                            {/* Vista Previa de Montos - Otros Servicios */}
                            {snapshotEditando.otrosServicios.length > 0 && (
                              <div className="mt-4 p-3 bg-black border border-[#333] rounded">
                                <h4 className="text-[10px] font-bold text-[#ededed] mb-2">Vista Previa</h4>
                                <div className="space-y-1">
                                  {snapshotEditando.otrosServicios.map((servicio, idx) => {
                                    const subtotal = servicio.precio * servicio.mesesPago
                                    return (
                                      <div key={idx} className="flex justify-between text-xs">
                                        <span className="text-[#888888]">{servicio.nombre || `Servicio ${idx + 1}`} (${servicio.precio} × {servicio.mesesPago} meses)</span>
                                        <span className="font-medium text-[#ededed]">${subtotal.toFixed(2)}</span>
                                      </div>
                                    )
                                  })}
                                  <div className="border-t border-[#333] pt-2 mt-2 flex justify-between">
                                    <span className="font-bold text-[#ededed] text-xs">TOTAL AÑO 1</span>
                                    <span className="font-bold text-[#ededed] text-base">
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
                          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                
                {/* Opciones de Pago */}
                <div>
                  <h3 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                    <FaCreditCard /> Opciones de Pago
                  </h3>

                  {/* Desarrollo en la misma sección */}
                  <div className="mb-4">
                    <label className="block text-[10px] font-semibold text-[#ededed] mb-1">
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
                      className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                      min="0"
                    />
                  </div>

                  {/* Lista de Opciones de Pago */}
                  <div className="mt-4 p-3 bg-black border border-[#333] rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-bold text-[#ededed] mb-2 flex items-center gap-2">
                        Esquema de Pagos (Debe sumar 100%)
                      </h4>
                      {(() => {
                        const opcionesPago = snapshotEditando.paquete.opcionesPago || []
                        const totalPorcentaje = opcionesPago.reduce((sum, op) => sum + (op.porcentaje || 0), 0)
                        const esValido = totalPorcentaje === 100
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            esValido 
                              ? 'bg-black border-[#333] text-[#ededed]' 
                              : 'bg-red-900/20 border-red-900 text-red-400'
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
                            className="bg-black border border-[#333] rounded p-2 grid md:grid-cols-[2fr,1fr,3fr,auto] gap-2 items-end"
                          >
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">
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
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                placeholder="Ej: Inicial"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">
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
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                min="0"
                                max="100"
                                placeholder="30"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">
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
                                className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
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
                              className="w-7 h-7 text-[#888888] hover:text-[#ededed] hover:bg-[#222] rounded transition-colors flex items-center justify-center"
                              title="Eliminar opción"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#888888] text-xs mb-4 italic">
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
                      className="px-3 py-1.5 bg-[#ededed] text-black hover:bg-white transition-colors flex items-center gap-2 font-semibold text-xs"
                    >
                      <FaPlus size={10} /> Agregar Opción
                    </button>
                  </div>

                  {/* Vista Previa de Montos */}
                  {(snapshotEditando.paquete.opcionesPago || []).length > 0 && snapshotEditando.paquete.desarrollo > 0 && (
                    <div className="mt-4 p-3 bg-black border border-[#333] rounded">
                      <h4 className="text-[10px] font-bold text-[#ededed] mb-2">Vista Previa</h4>
                      <div className="space-y-1">
                        {(snapshotEditando.paquete.opcionesPago || []).map((opcion, idx) => {
                          const monto = (snapshotEditando.paquete.desarrollo * (opcion.porcentaje || 0)) / 100
                          return (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-[#888888]">
                                {opcion.nombre || `Pago ${idx + 1}`} ({opcion.porcentaje}%)
                              </span>
                              <span className="font-medium text-[#ededed]">
                                ${monto.toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                        <div className="border-t border-[#333] pt-2 mt-2 flex justify-between">
                          <span className="font-bold text-[#ededed] text-xs">TOTAL</span>
                          <span className="font-bold text-[#ededed] text-base">
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
                          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {/* DESCUENTOS GENERALES */}
                            <div>
                              <h3 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                                Descuentos Generales
                              </h3>

                              {/* Checkboxes para aplicar descuentos */}
                              <div className="space-y-2 mb-3 bg-black border border-[#333] rounded p-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={snapshotEditando.paquete.descuentosGenerales?.aplicarAlDesarrollo || false}
                                    onChange={(e) =>
                                      setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          descuentosGenerales: {
                                            ...snapshotEditando.paquete.descuentosGenerales,
                                            aplicarAlDesarrollo: e.target.checked,
                                          },
                                        },
                                      })
                                    }
                                    className="w-3.5 h-3.5 accent-white cursor-pointer"
                                  />
                                  <span className="text-[10px] font-medium text-[#ededed]">Aplicar a Desarrollo</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={snapshotEditando.paquete.descuentosGenerales?.aplicarAServiciosBase || false}
                                    onChange={(e) =>
                                      setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          descuentosGenerales: {
                                            ...snapshotEditando.paquete.descuentosGenerales,
                                            aplicarAServiciosBase: e.target.checked,
                                          },
                                        },
                                      })
                                    }
                                    className="w-3.5 h-3.5 accent-white cursor-pointer"
                                  />
                                  <span className="text-[10px] font-medium text-[#ededed]">Aplicar a Servicios Base</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={snapshotEditando.paquete.descuentosGenerales?.aplicarAOtrosServicios || false}
                                    onChange={(e) =>
                                      setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          descuentosGenerales: {
                                            ...snapshotEditando.paquete.descuentosGenerales,
                                            aplicarAOtrosServicios: e.target.checked,
                                          },
                                        },
                                      })
                                    }
                                    className="w-3.5 h-3.5 accent-white cursor-pointer"
                                  />
                                  <span className="text-[10px] font-medium text-[#ededed]">Aplicar a Otros Servicios</span>
                                </label>
                              </div>

                              {/* Campos de porcentaje */}
                              <div className="grid md:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">
                                    Descuento General (%)
                                  </label>
                                  <input
                                    type="number"
                                    value={snapshotEditando.paquete.descuentosGenerales?.porcentaje || 0}
                                    onChange={(e) =>
                                      setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          descuentosGenerales: {
                                            ...snapshotEditando.paquete.descuentosGenerales,
                                            porcentaje: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                          },
                                        },
                                      })
                                    }
                                    className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">
                                    Descuento por Pago Único (%)
                                  </label>
                                  <input
                                    type="number"
                                    value={snapshotEditando.paquete.descuentoPagoUnico || 0}
                                    onChange={(e) =>
                                      setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          descuentoPagoUnico: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                        },
                                      })
                                    }
                                    className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                  />
                                  <p className="text-[10px] text-[#888888] mt-1">
                                    Se aplica si el cliente paga el desarrollo completo por adelantado.
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">
                                    Descuento Directo (%)
                                  </label>
                                  <input
                                    type="number"
                                    value={snapshotEditando.paquete.descuento}
                                    onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, descuento: Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0))}})}
                                    className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                    min="0"
                                    max="100"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* DESCUENTOS POR TIPO DE SERVICIO */}
                            <div>
                              <h3 className="text-xs font-bold text-[#ededed] mb-2 flex items-center gap-2">
                                Descuentos por Tipo de Servicio
                              </h3>

                              {/* Checkboxes para habilitar descuentos por tipo */}
                              <div className="space-y-2 mb-3 bg-black border border-[#333] rounded p-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={snapshotEditando.paquete.descuentosPorServicio?.aplicarAServiciosBase || false}
                                    onChange={(e) =>
                                      setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          descuentosPorServicio: {
                                            ...snapshotEditando.paquete.descuentosPorServicio,
                                            aplicarAServiciosBase: e.target.checked,
                                          },
                                        },
                                      })
                                    }
                                    className="w-3.5 h-3.5 accent-white cursor-pointer"
                                  />
                                  <span className="text-[10px] font-medium text-[#ededed]">Aplicar Descuentos Independientes a Servicios Base</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={snapshotEditando.paquete.descuentosPorServicio?.aplicarAOtrosServicios || false}
                                    onChange={(e) =>
                                      setSnapshotEditando({
                                        ...snapshotEditando,
                                        paquete: {
                                          ...snapshotEditando.paquete,
                                          descuentosPorServicio: {
                                            ...snapshotEditando.paquete.descuentosPorServicio,
                                            aplicarAOtrosServicios: e.target.checked,
                                          },
                                        },
                                      })
                                    }
                                    className="w-3.5 h-3.5 accent-white cursor-pointer"
                                  />
                                  <span className="text-[10px] font-medium text-[#ededed]">Aplicar Descuentos Independientes a Otros Servicios</span>
                                </label>
                              </div>

                              {/* Servicios Base con Tree Expandible */}
                              {snapshotEditando.paquete.descuentosPorServicio?.aplicarAServiciosBase && (
                                <div className="mb-3">
                                  <motion.button
                                    onClick={() => setExpandidosDescuentos({
                                      ...expandidosDescuentos,
                                      serviciosBase: !expandidosDescuentos.serviciosBase
                                    })}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-2 bg-[#111] hover:bg-[#222] border border-[#333] rounded transition-colors mb-1 group"
                                  >
                                    <div className="flex items-center gap-2 text-left">
                                      <span className="text-xs font-bold text-[#ededed]">Servicios Base</span>
                                    </div>
                                    <motion.div
                                      animate={{ rotate: expandidosDescuentos.serviciosBase ? 180 : 0 }}
                                      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                                      className="flex-shrink-0"
                                    >
                                      <FaChevronDown size={12} className="text-[#888888]" />
                                    </motion.div>
                                  </motion.button>
                                  
                                  <AnimatePresence>
                                    {expandidosDescuentos.serviciosBase && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="space-y-1 bg-black border border-[#333] rounded p-2">
                                          {snapshotEditando.serviciosBase.map((servicio) => {
                                            const descuento = snapshotEditando.paquete.descuentosPorServicio?.serviciosBase?.find(d => d.servicioId === servicio.id)
                                            return (
                                              <div key={servicio.id} className="flex gap-2 items-center pb-1 border-b border-[#333] last:border-b-0 last:pb-0">
                                                <div className="flex-1">
                                                  <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                      type="checkbox"
                                                      checked={descuento?.aplicarDescuento || false}
                                                      onChange={(e) => {
                                                        const updated = { ...snapshotEditando }
                                                        if (updated.paquete.descuentosPorServicio?.serviciosBase) {
                                                          const idx = updated.paquete.descuentosPorServicio.serviciosBase.findIndex(d => d.servicioId === servicio.id)
                                                          if (idx >= 0) {
                                                            updated.paquete.descuentosPorServicio.serviciosBase[idx].aplicarDescuento = e.target.checked
                                                          }
                                                        }
                                                        setSnapshotEditando(updated)
                                                      }}
                                                      className="w-3.5 h-3.5 accent-white cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-medium text-[#ededed]">{servicio.nombre}</span>
                                                  </label>
                                                </div>
                                                {descuento?.aplicarDescuento && (
                                                  <input
                                                    type="number"
                                                    value={descuento.porcentajeDescuento}
                                                    onChange={(e) => {
                                                      const updated = { ...snapshotEditando }
                                                      if (updated.paquete.descuentosPorServicio?.serviciosBase) {
                                                        const idx = updated.paquete.descuentosPorServicio.serviciosBase.findIndex(d => d.servicioId === servicio.id)
                                                        if (idx >= 0) {
                                                          updated.paquete.descuentosPorServicio.serviciosBase[idx].porcentajeDescuento = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                                                        }
                                                      }
                                                      setSnapshotEditando(updated)
                                                    }}
                                                    className="w-16 px-2 py-1 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                                    min="0"
                                                    max="100"
                                                    placeholder="0%"
                                                  />
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}

                              {/* Otros Servicios con Tree Expandible */}
                              {snapshotEditando.paquete.descuentosPorServicio?.aplicarAOtrosServicios && (
                                <div>
                                  <motion.button
                                    onClick={() => setExpandidosDescuentos({
                                      ...expandidosDescuentos,
                                      otrosServicios: !expandidosDescuentos.otrosServicios
                                    })}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-2 bg-[#111] hover:bg-[#222] border border-[#333] rounded transition-colors mb-1 group"
                                  >
                                    <div className="flex items-center gap-2 text-left">
                                      <span className="text-xs font-bold text-[#ededed]">Otros Servicios</span>
                                    </div>
                                    <motion.div
                                      animate={{ rotate: expandidosDescuentos.otrosServicios ? 180 : 0 }}
                                      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                                      className="flex-shrink-0"
                                    >
                                      <FaChevronDown size={12} className="text-[#888888]" />
                                    </motion.div>
                                  </motion.button>
                                  
                                  <AnimatePresence>
                                    {expandidosDescuentos.otrosServicios && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="space-y-1 bg-black border border-[#333] rounded p-2">
                                          {snapshotEditando.otrosServicios.map((servicio, idx) => {
                                            const descuento = snapshotEditando.paquete.descuentosPorServicio?.otrosServicios?.[idx]
                                            return (
                                              <div key={idx} className="flex gap-2 items-center pb-1 border-b border-[#333] last:border-b-0 last:pb-0">
                                                <div className="flex-1">
                                                  <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                      type="checkbox"
                                                      checked={descuento?.aplicarDescuento || false}
                                                      onChange={(e) => {
                                                        const updated = { ...snapshotEditando }
                                                        if (updated.paquete.descuentosPorServicio?.otrosServicios) {
                                                          updated.paquete.descuentosPorServicio.otrosServicios[idx].aplicarDescuento = e.target.checked
                                                        }
                                                        setSnapshotEditando(updated)
                                                      }}
                                                      className="w-3.5 h-3.5 accent-white cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-medium text-[#ededed]">{servicio.nombre}</span>
                                                  </label>
                                                </div>
                                                {descuento?.aplicarDescuento && (
                                                  <input
                                                    type="number"
                                                    value={descuento.porcentajeDescuento}
                                                    onChange={(e) => {
                                                      const updated = { ...snapshotEditando }
                                                      if (updated.paquete.descuentosPorServicio?.otrosServicios) {
                                                        updated.paquete.descuentosPorServicio.otrosServicios[idx].porcentajeDescuento = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                                                      }
                                                      setSnapshotEditando(updated)
                                                    }}
                                                    className="w-16 px-2 py-1 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                                    min="0"
                                                    max="100"
                                                    placeholder="0%"
                                                  />
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>

                            {/* VISTA PREVIA DE MONTOS COMPLETA */}
                            {snapshotEditando && (
                              <div className="mt-4 p-3 bg-black border border-[#333] rounded">
                                <h4 className="text-[10px] font-bold text-[#ededed] mb-2">
                                  Vista Previa de Montos Completa
                                </h4>

                                {(() => {
                                  const preview = calcularPreviewDescuentos(snapshotEditando)

                                  return (
                                    <div className="space-y-1">
                                      {/* Desarrollo */}
                                      {preview.desarrollo > 0 && (
                                        <div className="bg-[#111] border border-[#333] rounded p-2">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-medium text-[#ededed]">Desarrollo</span>
                                            <div className="flex gap-2 items-center">
                                              {preview.desarrollo !== preview.desarrolloConDescuento && (
                                                <span className="line-through text-[#888888] text-[10px]">
                                                  ${preview.desarrollo.toFixed(2)}
                                                </span>
                                              )}
                                              <span className={`font-bold text-base ${preview.desarrollo !== preview.desarrolloConDescuento ? 'text-[#ededed]' : 'text-[#ededed]'}`}>
                                                ${preview.desarrolloConDescuento.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          {preview.desarrollo !== preview.desarrolloConDescuento && (
                                            <div className="text-xs text-[#ededed] font-semibold">
                                              Ahorro: ${(preview.desarrollo - preview.desarrolloConDescuento).toFixed(2)} ({(((preview.desarrollo - preview.desarrolloConDescuento) / preview.desarrollo) * 100).toFixed(1)}%)
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Servicios Base */}
                                      {preview.serviciosBase.total > 0 && (
                                        <div className="bg-[#111] border border-[#333] rounded p-2">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-medium text-[#ededed]">Servicios Base</span>
                                            <div className="flex gap-2 items-center">
                                              {preview.serviciosBase.total !== preview.serviciosBase.conDescuento && (
                                                <span className="line-through text-[#888888] text-[10px]">
                                                  ${preview.serviciosBase.total.toFixed(2)}
                                                </span>
                                              )}
                                              <span className={`font-bold text-base ${preview.serviciosBase.total !== preview.serviciosBase.conDescuento ? 'text-[#ededed]' : 'text-[#ededed]'}`}>
                                                ${preview.serviciosBase.conDescuento.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          {preview.serviciosBase.desglose.length > 0 && (
                                            <div className="space-y-0.5 text-xs text-[#888888] mb-1 pl-2 border-l border-[#333]">
                                              {preview.serviciosBase.desglose.map((item, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                  <span>{item.nombre}</span>
                                                  <span className="font-medium">
                                                    ${item.original.toFixed(2)} → ${item.conDescuento.toFixed(2)}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {preview.serviciosBase.total !== preview.serviciosBase.conDescuento && (
                                            <div className="text-xs text-[#ededed] font-semibold">
                                              Ahorro: ${(preview.serviciosBase.total - preview.serviciosBase.conDescuento).toFixed(2)} ({(((preview.serviciosBase.total - preview.serviciosBase.conDescuento) / preview.serviciosBase.total) * 100).toFixed(1)}%)
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Otros Servicios */}
                                      {preview.otrosServicios.total > 0 && (
                                        <div className="bg-[#111] border border-[#333] rounded p-2">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-medium text-[#ededed]">Otros Servicios</span>
                                            <div className="flex gap-2 items-center">
                                              {preview.otrosServicios.total !== preview.otrosServicios.conDescuento && (
                                                <span className="line-through text-[#888888] text-[10px]">
                                                  ${preview.otrosServicios.total.toFixed(2)}
                                                </span>
                                              )}
                                              <span className={`font-bold text-base ${preview.otrosServicios.total !== preview.otrosServicios.conDescuento ? 'text-[#ededed]' : 'text-[#ededed]'}`}>
                                                ${preview.otrosServicios.conDescuento.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          {preview.otrosServicios.desglose.length > 0 && (
                                            <div className="space-y-0.5 text-xs text-[#888888] mb-1 pl-2 border-l border-[#333]">
                                              {preview.otrosServicios.desglose.map((item, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                  <span>{item.nombre}</span>
                                                  <span className="font-medium">
                                                    ${item.original.toFixed(2)} → ${item.conDescuento.toFixed(2)}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {preview.otrosServicios.total !== preview.otrosServicios.conDescuento && (
                                            <div className="text-xs text-[#ededed] font-semibold">
                                              Ahorro: ${(preview.otrosServicios.total - preview.otrosServicios.conDescuento).toFixed(2)} ({(((preview.otrosServicios.total - preview.otrosServicios.conDescuento) / preview.otrosServicios.total) * 100).toFixed(1)}%)
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Total General */}
                                      <div className="bg-[#111] p-3 border-t border-[#333] rounded-b">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs font-bold text-[#ededed]">Total General</span>
                                          <div className="flex gap-3 items-center">
                                            <div className="text-right">
                                              {preview.totalOriginal !== preview.totalConDescuentos && (
                                                <div className="line-through text-[#888888] text-[10px]">
                                                  ${preview.totalOriginal.toFixed(2)}
                                                </div>
                                              )}
                                              <div className={`font-bold text-lg ${preview.totalOriginal !== preview.totalConDescuentos ? 'text-[#ededed]' : 'text-[#ededed]'}`}>
                                                ${preview.totalConDescuentos.toFixed(2)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {preview.totalAhorro > 0 && (
                                          <div className="mt-2 pt-2 border-t border-[#333] flex justify-between items-center">
                                            <span className="text-[10px] font-semibold text-[#ededed]">🔴 Ahorro Total</span>
                                            <span className="text-xs font-bold text-[#ededed]">
                                              ${preview.totalAhorro.toFixed(2)} ({preview.porcentajeAhorro.toFixed(1)}%)
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
                          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Número</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.numero || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, numero: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="CZ-001"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Fecha de Emisión</label>
                                <input
                                  type="date"
                                  value={cotizacionActual.fechaEmision || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, fechaEmision: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Tiempo Validez (días)</label>
                                <input
                                  type="number"
                                  value={cotizacionActual.tiempoValidez || 30}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, tiempoValidez: Number.parseInt(e.target.value) || 30})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
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
                          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Empresa</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.empresa || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, empresa: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Nombre de la empresa"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Sector</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.sector || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, sector: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Industria/Sector"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Ubicación</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.ubicacion || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, ubicacion: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Ciudad/País"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Email Cliente</label>
                                <input
                                  type="email"
                                  value={cotizacionActual.emailCliente || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, emailCliente: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="cliente@empresa.com"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">WhatsApp Cliente</label>
                                <input
                                  type="tel"
                                  value={cotizacionActual.whatsappCliente || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, whatsappCliente: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
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
                          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Profesional</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.profesional || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, profesional: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Nombre del profesional"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Empresa Proveedor</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.empresaProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, empresaProveedor: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Nombre de la empresa"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Email</label>
                                <input
                                  type="email"
                                  value={cotizacionActual.emailProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, emailProveedor: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="profesional@empresa.com"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">WhatsApp</label>
                                <input
                                  type="tel"
                                  value={cotizacionActual.whatsappProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, whatsappProveedor: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="+34 600 000 000"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Ubicación Proveedor</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.ubicacionProveedor || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, ubicacionProveedor: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Ciudad/País"
                                />
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'estilos-diseno',
                        label: 'Estilos y Diseño',
                        icon: <FaPalette />,
                        hasChanges: pestañaTieneCambios('estilos-diseno'),
                        content: (
                          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Título Principal del Hero</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.heroTituloMain || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, heroTituloMain: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Título principal de tu cotización"
                                />
                                <p className="text-[10px] text-[#888888] mt-1">Se mostrará como encabezado principal en tu propuesta</p>
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#ededed] mb-0.5">Subtítulo del Hero</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.heroTituloSub || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, heroTituloSub: e.target.value})}
                                  className="w-full px-2 py-1.5 bg-black border border-[#333] focus:border-[#666] focus:outline-none text-xs text-[#ededed]"
                                  placeholder="Subtítulo o descripción breve"
                                />
                                <p className="text-[10px] text-[#888888] mt-1">Descripción complementaria debajo del título principal</p>
                              </div>
                              <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
                                <h3 className="text-xs font-bold text-[#ededed] mb-3">Vista Previa del Hero</h3>
                                <div className="bg-black text-[#ededed] p-6 rounded-lg text-center border border-[#333]">
                                  <h1 className="text-3xl font-bold mb-2 text-[#ededed]">{cotizacionActual.heroTituloMain || 'Título principal'}</h1>
                                  <p className="text-lg text-[#888888]">{cotizacionActual.heroTituloSub || 'Subtítulo descriptivo'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      },
                    ]}                    activeTab={activeModalTab}
                    onTabChange={setActiveModalTab}
                    scrollContainerRef={modalScrollContainerRef}
                  />
              </div>
              {/* Fin Contenido Scrollable */}

              {/* Footer Fijo */}
              <div className="flex-shrink-0 bg-[#12121a] border-t border-white/10 px-6 py-4 flex justify-between items-center">
                {/* Indicador de autoguardado a la izquierda */}
                <div className="flex items-center gap-3">
                  {autoSaveStatus === 'saving' && (
                    <span className="text-sm text-white animate-pulse">Guardando cambios...</span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-sm text-white/90">✓ Cambios guardados</span>
                  )}
                  {autoSaveStatus === 'error' && (
                    <span className="text-sm text-white/90">❌ Error al guardar. Reintentando...</span>
                  )}
                </div>
                {/* Botones a la derecha */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={guardarEdicion}
                    className="py-2 px-6 bg-white text-[#0a0a0f] rounded-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <FaCheck /> Guardar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCerrarModalEditar}
                    className="py-1.5 px-4 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-xs font-semibold"
                  >
                    <FaTimes /> Cancelar
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
              className="w-16 h-16 bg-white text-[#0a0a0f] 
                         rounded-full shadow-2xl hover:shadow-white/30
                         transition-all flex items-center justify-center
                         border-2 border-white/20"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaPlus className="text-2xl transition-transform group-hover:rotate-90" />
            </motion.button>
            
            {/* Tooltip */}
            <motion.div
              className="absolute right-20 top-1/2 -translate-y-1/2 bg-[#1a1a24] text-white 
                         px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap
                         border border-white/10 pointer-events-none opacity-0 
                         group-hover:opacity-100 transition-opacity shadow-xl"
            >
              Crear Paquete
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast Notifications */}
      <Toast messages={toast.messages} onRemove={toast.removeToast} />
    </div>
  )
}






