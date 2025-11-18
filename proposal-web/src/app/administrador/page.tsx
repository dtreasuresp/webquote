'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaPlus, FaTrash, FaDownload, FaArrowLeft, FaEdit, FaTimes, FaCheck, FaCreditCard } from 'react-icons/fa'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import TabsModal from '@/components/TabsModal'
import { jsPDF } from 'jspdf'
import { obtenerSnapshots, crearSnapshot, actualizarSnapshot, eliminarSnapshot, obtenerSnapshotsCompleto } from '@/lib/snapshotApi'
import { useSnapshotsRefresh } from '@/lib/hooks/useSnapshots'
import type { ServicioBase, GestionConfig, Package, Servicio, OtroServicio, OtroServicioSnapshot, PackageSnapshot } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

export default function Administrador() {
  // Obtener función de refresh global
  const refreshSnapshots = useSnapshotsRefresh()

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
  const [activeModalTab, setActiveModalTab] = useState<string>('general')
  const [snapshotEditando, setSnapshotEditando] = useState<PackageSnapshot | null>(null)
  // Estado para comparar cambios en el modal (versión original serializada)
  const [snapshotOriginalJson, setSnapshotOriginalJson] = useState<string | null>(null)
  // Ref para foco inicial en modal
  const nombrePaqueteInputRef = useRef<HTMLInputElement | null>(null)
  // Ref para scroll del contenedor modal
  const modalScrollContainerRef = useRef<HTMLDivElement>(null)
  const [cargandoSnapshots, setCargandoSnapshots] = useState(true)
  const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)

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
          otrosServicios: snapshot.otrosServicios.map(s => ({
            servicioId: s.id,
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
    setActiveModalTab('general')
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
    
    // Disparar refresh global para sincronizar todos los componentes
    console.log('🔄 Refresh global disparado desde botón Guardar')
    await refreshSnapshots()
    
    alert('✅ Configuración y paquetes guardados correctamente')
  }

  // ---- Autoguardado de configuración general fuera del modal ----
  // Autoguardado general fuera del modal eliminado: solo se mantiene autoguardado dentro del modal de edición

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-secondary via-secondary-light to-secondary-dark">
      {/* Overlay dorado sutil para coherencia de marca */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(closest-side, rgba(245, 158, 11, 0.6), rgba(245, 158, 11, 0.0))' }}
        />
      </div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-20 px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header con botones de acción */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Panel Administrativo
              </h1>
              <p className="text-xl text-neutral-200">
                Calculadora de Presupuestos y Gestión de Servicios
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDescargarPdf}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
              >
                <FaDownload /> Descargar PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={guardarConfiguracionActual}
                className="px-6 py-3 bg-gradient-to-r from-accent to-accent-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
              >
                💾 Guardar
              </motion.button>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/30 text-white rounded-lg hover:bg-white/40 transition-all flex items-center gap-2 font-semibold border border-white/50 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                >
                  <FaArrowLeft /> Volver
                </motion.button>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            {/* Sección 1: Definición de Precios de Servicios Base */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border-l-4 border-primary p-8"
            >
              <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
                <span className="text-3xl">➡️</span>
                1. Definición de Precios de Servicios Base
              </h2>

              {/* Lista de Servicios Base Existentes */}
              {serviciosBase.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="text-sm font-semibold text-secondary mb-3 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 px-2 text-left">
                    <span>📝 Nombre</span>
                    <span>💰 Precio (USD)</span>
                    <span>🎁 Meses Gratis</span>
                    <span>🗓️ Meses Pago</span>
                    <span>💵 Subtotal</span>
                    <span className="text-center">⚙️Acciones</span>
                  </div>
                  {serviciosBase.map((servicio) => (
                    <div
                      key={servicio.id}
                      className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,1fr] gap-3 items-center bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border-2 border-primary/20"
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
                            className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
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
                            className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
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
                            className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
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
                            className="px-3 py-2 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none"
                            min="1"
                            max="12"
                          />
                          <span className="text-lg font-bold text-primary">
                            ${((servicioBaseEditando?.precio || 0) * (servicioBaseEditando?.mesesPago || 0)).toFixed(2)}
                          </span>
                          <div className="flex gap-2 justify-center">
                            <button
                              aria-label="Guardar servicio base"
                              onClick={guardarEditarServicioBase}
                              className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                              <FaCheck />
                            </button>
                            <button
                              aria-label="Cancelar edición servicio base"
                              onClick={cancelarEditarServicioBase}
                              className="px-3 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-secondary">{servicio.nombre}</span>
                          <span className="text-primary font-bold">${servicio.precio.toFixed(2)}</span>
                          <span className="text-secondary">{servicio.mesesGratis}m</span>
                          <span className="text-secondary">{servicio.mesesPago}m</span>
                          <span className="text-lg font-bold text-primary">
                            ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                          </span>
                          <div className="flex gap-2 justify-center">
                            <button
                              aria-label={`Editar servicio base ${servicio.nombre}`}
                              onClick={() => abrirEditarServicioBase(servicio)}
                              className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                              <FaEdit />
                            </button>
                            <button
                              aria-label={`Eliminar servicio base ${servicio.nombre}`}
                              onClick={() => eliminarServicioBase(servicio.id)}
                              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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

              {/* Formulario para Agregar Nuevo Servicio Base */}
              <div className="space-y-4 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border-2 border-dashed border-primary/40">
                <h3 className="font-bold text-secondary mb-4">➕ Agregar Nuevo Servicio Base</h3>
                <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end">
                  <div>
                    <label htmlFor="nuevoServicioBaseNombre" className="block font-semibold text-secondary mb-2 text-sm">
                      📝 Nombre del Servicio
                    </label>
                    <input
                      id="nuevoServicioBaseNombre"
                      type="text"
                      placeholder="Ej: Hosting, SSL, etc."
                      value={nuevoServicioBase.nombre}
                      onChange={(e) =>
                        setNuevoServicioBase({ ...nuevoServicioBase, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoServicioBasePrecio" className="block font-semibold text-secondary mb-2 text-sm">
                      💵 Precio (USD)
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
                      className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoServicioBaseMesesGratis" className="block font-semibold text-secondary mb-2 text-sm">
                      🎁 Meses Gratis
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
                      className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                      min="0"
                      max="12"
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoServicioBaseMesesPago" className="block font-semibold text-secondary mb-2 text-sm">
                      💳 Meses Pago
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
                      className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                      min="1"
                      max="12"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={agregarServicioBase}
                    disabled={!nuevoServicioBase.nombre || nuevoServicioBase.precio <= 0}
                    className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      nuevoServicioBase.nombre && nuevoServicioBase.precio > 0
                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <FaPlus /> Agregar
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Sección 2: Definición de Paquetes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border-l-4 border-accent p-8"
            >
              <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                <FaCalculator className="text-accent" />
                2. Definición de Paquetes
              </h2>

              <div className="space-y-4 p-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border-2 border-accent/20">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="paqueteNombre" className="block font-semibold text-secondary mb-2">
                      📦 Nombre del Paquete *
                    </label>
                    <input
                      id="paqueteNombre"
                      type="text"
                      placeholder="Ej: Constructor"
                      value={paqueteActual.nombre}
                      onChange={(e) =>
                        setPaqueteActual({ ...paqueteActual, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="paqueteDesarrollo" className="block font-semibold text-secondary mb-2">
                      💵 Desarrollo (USD) *
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
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="paqueteDescuento" className="block font-semibold text-secondary mb-2">
                      🏷️ Descuento (%)
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
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="paqueteTipo" className="block font-semibold text-secondary mb-2">
                      🏆 Tipo de Paquete (Básico, Profesional, Premium, VIP)
                    </label>
                    <input
                      id="paqueteTipo"
                      type="text"
                      placeholder="Ej: Básico"
                      value={paqueteActual.tipo || ''}
                      onChange={(e) =>
                        setPaqueteActual({ ...paqueteActual, tipo: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="paqueteDescripcion" className="block font-semibold text-secondary mb-2">
                      📝 Descripción del Paquete
                    </label>
                    <input
                      id="paqueteDescripcion"
                      type="text"
                      placeholder="Ej: Paquete personalizado para empresas..."
                      value={paqueteActual.descripcion || ''}
                      onChange={(e) =>
                        setPaqueteActual({ ...paqueteActual, descripcion: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sección 3: Servicios Opcionales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border-l-4 border-accent p-8"
            >
              <h2 className="text-2xl font-bold text-secondary mb-6">3. Servicios Opcionales</h2>

              {serviciosOpcionales.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="text-sm font-semibold text-secondary mb-3 grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,auto] gap-3 px-2 text-left">
                    <span>📝 Nombre</span>
                    <span>💰 Precio</span>
                    <span>🎁 Gratis</span>
                    <span>📅 Pago</span>
                    <span>💵 Subtotal Año 1</span>
                    <span className="text-center">⚙️ Acciones</span>
                  </div>
                  {serviciosOpcionales.map(serv => (
                    <div
                      key={serv.id}
                      className="grid md:grid-cols-[3fr,1fr,1fr,1fr,1fr,auto] gap-3 items-center bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-xl border-2 border-accent/20"
                    >
                      {editandoServicioId === serv.id ? (
                        <>
                          <input
                            type="text"
                            value={servicioEditando?.nombre || ''}
                            aria-label="Nombre servicio opcional"
                            onChange={(e) => setServicioEditando({ ...servicioEditando!, nombre: e.target.value })}
                            className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
                          />
                          <input
                            type="number"
                            value={servicioEditando?.precio || 0}
                            aria-label="Precio mensual servicio opcional"
                            min={0}
                            onChange={(e) => setServicioEditando({ ...servicioEditando!, precio: Number.parseFloat(e.target.value) || 0 })}
                            className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
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
                            className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
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
                            className="px-3 py-2 border-2 border-accent/30 rounded-lg focus:border-accent focus:outline-none"
                          />
                          <span className="text-primary font-bold">${((servicioEditando?.precio || 0) * (servicioEditando?.mesesPago || 0)).toFixed(2)}</span>
                          <div className="flex gap-2 justify-center">
                            <button
                              aria-label="Guardar servicio opcional"
                              onClick={guardarEditarServicioOpcional}
                              className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                              disabled={!(servicioEditando?.nombre.trim() && (servicioEditando?.precio || 0) > 0)}
                            >
                              <FaCheck />
                            </button>
                            <button
                              aria-label="Cancelar edición servicio opcional"
                              onClick={cancelarEditarServicioOpcional}
                              className="px-3 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-secondary">{serv.nombre}</span>
                          <span className="text-primary font-bold">${serv.precio.toFixed(2)}</span>
                          <span className="text-secondary">{serv.mesesGratis}m</span>
                          <span className="text-secondary">{serv.mesesPago}m</span>
                          <span className="text-primary font-bold">${(serv.precio * serv.mesesPago).toFixed(2)}</span>
                          <div className="flex gap-2 justify-center">
                            <button
                              aria-label="Editar servicio opcional"
                              onClick={() => abrirEditarServicioOpcional(serv)}
                              className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                              <FaEdit />
                            </button>
                            <button
                              aria-label="Eliminar servicio opcional"
                              onClick={() => eliminarServicioOpcional(serv.id)}
                              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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

              <div className="space-y-4 p-6 bg-gradient-to-r from-accent/5 to-primary/10 rounded-xl border-2 border-dashed border-accent/40">
                <h3 className="font-bold text-secondary mb-4">➕ Agregar Servicio Opcional</h3>
                <div className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end">
                  <div>
                    <label htmlFor="servOpcNombre" className="block font-semibold text-secondary mb-2 text-sm">📝 Nombre</label>
                    <input
                      id="servOpcNombre"
                      type="text"
                      placeholder="Ej: SEO Premium"
                      value={nuevoServicio.nombre}
                      onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="servOpcPrecio" className="block font-semibold text-secondary mb-2 text-sm">💰 Precio (USD)</label>
                    <input
                      id="servOpcPrecio"
                      type="number"
                      min={0}
                      value={nuevoServicio.precio}
                      placeholder="0"
                      onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="servOpcGratis" className="block font-semibold text-secondary mb-2 text-sm">🎁 Gratis</label>
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
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="servOpcPago" className="block font-semibold text-secondary mb-2 text-sm">📅 Pago</label>
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
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={agregarServicioOpcional}
                    disabled={!(nuevoServicio.nombre.trim() && nuevoServicio.precio > 0)}
                    className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      nuevoServicio.nombre.trim() && nuevoServicio.precio > 0
                        ? 'bg-gradient-to-r from-accent to-primary text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <FaPlus /> Agregar
                  </motion.button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30 text-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <span className="font-semibold text-secondary">Servicios opcionales: {serviciosOpcionales.length}</span>
                <span className="text-secondary">Total Año 1: ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * s.mesesPago, 0).toFixed(2)}</span>
                <span className="text-secondary">Total Anual (Año 2+): ${serviciosOpcionales.reduce((sum, s) => sum + s.precio * 12, 0).toFixed(2)}</span>
              </div>
              {!serviciosOpcionalesValidos && serviciosOpcionales.length > 0 && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  ⚠️ Revisa meses (Gratis + Pago deben sumar 12) y que todos tengan nombre y precio.
                </p>
              )}

              {/* Botón Crear Paquete */}
              <div className="mt-8 pt-6 border-t-2 border-accent/30">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={crearPaqueteSnapshot}
                  disabled={!todoEsValido}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    todoEsValido
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <FaPlus /> Crear Paquete con esta Configuración
                </motion.button>
                {!todoEsValido && (
                  <p className="text-sm text-primary mt-2 text-center">
                    ⚠️ Completa: Nombre del paquete, Desarrollo, Precios servicios y Meses válidos
                  </p>
                )}
              </div>
            </motion.div>

            {/* Sección 4: Paquetes Creados */}
            {cargandoSnapshots ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl border-l-4 border-secondary p-8 text-center"
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <FaCalculator className="text-secondary text-3xl" />
                  </motion.div>
                  <p className="text-lg text-secondary font-semibold">Cargando paquetes...</p>
                </div>
              </motion.div>
            ) : errorSnapshots ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl border-l-4 border-red-500 p-8"
              >
                <p className="text-red-600 font-semibold">❌ {errorSnapshots}</p>
              </motion.div>
            ) : snapshots.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl border-l-4 border-secondary p-8"
              >
                <h2 className="text-2xl font-bold text-secondary mb-6">
                  Paquetes Creados ({snapshots.filter(s => s.activo).length})
                </h2>

                <div className="space-y-6 md:grid md:grid-cols-2 gap-10 md:space-y-0">
                  {snapshots.filter(s => s.activo).map((snapshot, idx) => (
                    <motion.div
                      key={snapshot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gradient-to-r from-secondary/5 to-accent/5 rounded-xl border-2 border-secondary/20 overflow-hidden"
                    >
                      {/* Header del Snapshot */}
                      <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-4 border-b-2 border-secondary/20">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-secondary">
                              📦 {snapshot.nombre}
                            </h3>
                            {snapshot.paquete.tipo && (
                              <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase mt-1">
                                🏆 {snapshot.paquete.tipo}
                              </p>
                            )}
                            {snapshot.paquete.descripcion && (
                              <p className="text-sm text-neutral-600 italic mt-1">
                                {snapshot.paquete.descripcion}
                              </p>
                            )}
                            <p className="text-sm text-neutral-500 mt-2">
                              {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 relative">
                              <input
                                id={`snapshot-activo-${snapshot.id}`}
                                type="checkbox"
                                checked={snapshot.activo}
                                onChange={async (e) => {
                                  const marcado = e.target.checked
                                  // Actualización optimista inmediata
                                  const provisional = { ...snapshot, activo: marcado }
                                  setSnapshots(prev => prev.map(s => s.id === snapshot.id ? provisional : s))
                                  try {
                                    // Recalcular costos por consistencia (aunque activo no afecta costos)
                                    const actualizado = { ...provisional }
                                    actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
                                    actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
                                    actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
                                    const guardado = await actualizarSnapshot(actualizado.id, actualizado)
                                    setSnapshots(prev => prev.map(s => s.id === snapshot.id ? guardado : s))
                                    console.log(`✅ Estado Activo actualizado para ${snapshot.nombre}: ${marcado}`)
                                    // Disparar refresh global inmediatamente
                                    await refreshSnapshots()
                                  } catch (err) {
                                    console.error('Error al autoguardar estado activo:', err)
                                    // Revertir si falla
                                    setSnapshots(prev => prev.map(s => s.id === snapshot.id ? { ...s, activo: !marcado } : s))
                                    alert('❌ No se pudo actualizar el estado Activo. Intenta nuevamente.')
                                  }
                                }}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <label htmlFor={`snapshot-activo-${snapshot.id}`} className="font-semibold text-secondary text-sm">Activo</label>
                              {/* Feedback rápido */}
                              <span className="text-[10px] absolute -bottom-4 left-0 text-neutral-500">{snapshot.activo ? '✓' : '–'}</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => abrirModalEditar(snapshot)}
                              className="px-4 py-2 bg-gradient-to-r from-accent to-accent-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm"
                            >
                              <FaEdit /> Editar
                            </motion.button>
                            <motion.button
                              aria-label={`Eliminar paquete ${snapshot.nombre}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEliminarSnapshot(snapshot.id)}
                              className="w-9 h-9 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                            >
                              <FaTrash size={14} />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Detalle del Snapshot - Tabla */}
                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b-2 border-secondary bg-neutral-100 text-pretty">
                                <th className="text-left p-2 font-bold text-secondary w-1/5">Concepto</th>
                                <th className="text-center p-2 font-bold text-secondary w-1/5">Meses Gratis</th>
                                <th className="text-center p-2 font-bold text-secondary w-1/5">Meses Pago</th>
                                <th className="text-right p-2 font-bold text-secondary bg-primary/5 w-1/5">Costo Mensual</th>
                                <th className="text-right p-2 font-bold text-secondary bg-accent/5 w-1/5">Costo Anual</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Servicios Base */}
                              <tr className="border-b border-secondary/20 bg-primary/10">
                                {/* Título de sección */}
                                <td className="p-2 font-bold text-primary" colSpan={3}>
                                  💰 Servicios Base
                                </td>
                                {/* Subtotal Mensual */}
                                <td className="p-2 text-right font-bold text-primary bg-primary/5">
                                  ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0), 0)).toFixed(2)}/mes
                                </td>
                                {/* Subtotal Anual */}
                                <td className="p-2 text-right font-bold text-accent bg-accent/5">
                                  ${((snapshot.serviciosBase ?? []).reduce((sum, s) => sum + (s.precio ?? 0) * (s.mesesPago ?? 0), 0)).toFixed(2)}/año
                                </td>
                              </tr>
                              {snapshot.serviciosBase?.map((servicio) => (
                                <tr key={servicio.id} className="border-b border-secondary/20">
                                  <td className="p-2 text-secondary w-2/5">{servicio.nombre}</td>
                                  <td className="p-2 text-center font-semibold text-secondary w-1/5">
                                    {servicio.mesesGratis}
                                  </td>
                                  <td className="p-2 text-center font-semibold text-secondary w-1/5">
                                    {servicio.mesesPago}
                                  </td>
                                  <td className="p-2 text-right font-semibold text-primary bg-primary/5 w-1/5">
                                    ${servicio.precio.toFixed(2)}/mes
                                  </td>
                                  <td className="p-2 text-right font-semibold text-accent bg-accent/5 w-1/5">
                                    ${(servicio.precio * servicio.mesesPago).toFixed(2)}/año
                                  </td>
                                </tr>
                              )) || (
                                <tr className="border-b border-secondary/20">
                                  <td colSpan={5} className="p-2 text-center text-neutral-400 italic">
                                    No hay servicios base definidos
                                  </td>
                                </tr>
                              )}

                              {/* Paquete */}
                              <tr className="border-b border-secondary/20">
                                <td colSpan={5} className="p-2 font-bold bg-accent/10 text-accent">
                                  📦 Costo del desarrollo
                                </td>
                              </tr>
                              <tr className="border-b border-secondary/20">
                                <td className="p-2 text-secondary">Desarrollo</td>
                                <td className="p-2 text-center font-semibold text-secondary">-</td>
                                <td className="p-2 text-center font-semibold text-secondary">-</td>
                                <td className="p-2 text-right font-semibold text-accent bg-primary/5">
                                  ${snapshot.paquete.desarrollo.toFixed(2)}
                                </td>
                                <td className="p-2 text-right font-semibold text-accent bg-accent/5">
                                  ${snapshot.paquete.desarrollo.toFixed(2)}
                                </td>
                              </tr>
                              {snapshot.paquete.descuento > 0 && (
                                <tr className="border-b border-secondary/20">
                                  <td className="p-2 text-secondary">Descuento</td>
                                  <td className="p-2 text-center font-semibold text-secondary">-</td>
                                  <td className="p-2 text-center font-semibold text-secondary">-</td>
                                  <td className="p-2 text-right font-semibold text-accent bg-primary/5">
                                    {snapshot.paquete.descuento}%
                                  </td>
                                  <td className="p-2 text-right font-semibold text-accent bg-accent/5">
                                    {snapshot.paquete.descuento}%
                                  </td>
                                </tr>
                              )}

                              {/* Otros Servicios */}
                              {snapshot.otrosServicios.length > 0 && (
                                <>
                                  <tr className="border-b border-secondary/20">
                                    <td colSpan={5} className="p-2 font-bold bg-secondary/5 text-secondary">
                                      🎁 Otros Servicios
                                    </td>
                                  </tr>
                                  {snapshot.otrosServicios.map((servicio, sIdx) => (
                                    <motion.tr
                                      key={sIdx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: sIdx * 0.05 }}
                                      className="border-b border-secondary/20"
                                    >
                                      <td className="p-2 text-secondary">
                                        {servicio.nombre}
                                      </td>
                                      <td className="p-2 text-center font-semibold text-secondary">
                                        {servicio.mesesGratis}
                                      </td>
                                      <td className="p-2 text-center font-semibold text-secondary">
                                        {servicio.mesesPago}
                                      </td>
                                      <td className="p-2 text-right font-semibold text-secondary bg-primary/5">
                                        ${servicio.precio.toFixed(2)}/mes
                                      </td>
                                      <td className="p-2 text-right font-semibold text-amber-700 bg-accent/5">
                                        ${(servicio.precio * servicio.mesesPago).toFixed(2)}/año
                                      </td>
                                    </motion.tr>
                                  ))}
                                </>
                              )}

                              {/* Costos Finales */}
                              <tr className="border-b border-secondary/20">
                                <td colSpan={5} className="p-2 font-bold bg-gradient-to-r from-primary/10 to-accent/10 text-primary">
                                  💳 Costos totales
                                </td>
                              </tr>
                              <tr className="border-b border-secondary/20 bg-primary/5">
                                <td className="p-2 font-semibold text-primary">Pago Inicial</td>
                                <td colSpan={4} className="p-2 text-right font-bold text-primary text-lg">
                                  ${snapshot.costos.inicial.toFixed(2)}
                                </td>
                              </tr>
                              <tr className="border-b border-secondary/20 bg-accent/5">
                                <td className="p-2 font-semibold text-accent">Año 1</td>
                                <td colSpan={4} className="p-2 text-right font-bold text-accent text-lg">
                                  ${snapshot.costos.año1.toFixed(2)}
                                </td>
                              </tr>
                              <tr className="bg-secondary/5">
                                <td className="p-2 font-semibold text-secondary">Año 2</td>
                                <td colSpan={4} className="p-2 text-right font-bold text-secondary text-lg">
                                  ${snapshot.costos.año2.toFixed(2)}
                                </td>
                              </tr>
                              <tr className="bg-blue-50">
                                <td colSpan={5} className="p-2 text-xs text-blue-600 italic text-center">
                                  ℹ️ Año 2 no incluye desarrollo (pago único realizado en Año 1)
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl border-l-4 border-secondary p-8 text-center"
              >
                <p className="text-lg text-neutral-500 font-semibold">📭 No hay paquetes creados aún</p>
                <p className="text-sm text-neutral-400 mt-2">Crea tu primer paquete completando los datos arriba</p>
              </motion.div>
            )}

            {/* Sección 5: Paquetes Inactivos */}
            {snapshots.filter(s => !s.activo).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl border-l-4 border-neutral-400 p-8"
              >
                <h2 className="text-2xl font-bold text-neutral-500 mb-6">
                  🗂️ Paquetes Inactivos ({snapshots.filter(s => !s.activo).length})
                </h2>

                <div className="space-y-4">
                  {snapshots.filter(s => !s.activo).map((snapshot, idx) => (
                    <motion.div
                      key={snapshot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 p-4 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-600 text-lg">{snapshot.nombre}</h3>
                          {snapshot.paquete.tipo && (
                            <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase mt-1">
                              🏆 {snapshot.paquete.tipo}
                            </p>
                          )}
                          {snapshot.paquete.descripcion && (
                            <p className="text-sm text-neutral-500 italic mt-1">
                              {snapshot.paquete.descripcion}
                            </p>
                          )}
                          <p className="text-sm text-neutral-400 mt-2">
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
                                  console.log(`✅ Estado Activo actualizado para ${snapshot.nombre}: ${marcado}`)
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
                            <label htmlFor={`snapshot-inactivo-${snapshot.id}`} className="font-semibold text-neutral-500 text-sm">Activar</label>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEliminarSnapshot(snapshot.id)}
                            className="w-9 h-9 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                          >
                            <FaTrash size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
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
            className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-start justify-center pt-4 p-4"
            onClick={handleCerrarModalEditar}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-editar-titulo"
            >
              {/* Header Fijo */}
              <div className="flex-shrink-0 bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex justify-between items-center border-b-4 border-accent">
                <h2 id="modal-editar-titulo" className="text-2xl font-bold flex items-center gap-2">
                  <FaEdit /> Editar Paquete: {snapshotEditando.nombre}
                </h2>
                <button
                  aria-label="Cerrar modal edición"
                  onClick={handleCerrarModalEditar}
                  className="text-2xl hover:scale-110 transition-transform"
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
                      id: 'general',
                      label: 'General',
                      icon: '📦',
                      content: (
                        <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                          {/* Información General del Paquete */}
                          <div className="bg-gradient-to-r from-secondary/5 to-accent/5 p-6 rounded-xl border-2 border-secondary/20">
                            <h3 className="text-lg font-bold text-secondary mb-4">📦 Información General del Paquete</h3>
                  
                  {/* Nombre - Full width */}
                  <div className="mb-4">
                    <label className="block font-semibold text-secondary mb-2">
                    📦 Nombre del Paquete
                    </label>
                    <input
                      type="text"
                      value={snapshotEditando.nombre}
                      onChange={(e) =>
                        setSnapshotEditando({ ...snapshotEditando, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none"
                      ref={nombrePaqueteInputRef}
                      aria-describedby="ayuda-nombre-paquete"
                    />
                    <p id="ayuda-nombre-paquete" className="mt-1 text-xs text-neutral-500">Nombre visible en listado y PDF.</p>
                  </div>

                  {/* Tipo, Descripción, Emoji y Tagline */}
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        🏆 Tipo de Paquete
                      </label>
                      <input
                        type="text"
                        value={snapshotEditando.paquete.tipo || ''}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            paquete: {
                              ...snapshotEditando.paquete,
                              tipo: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: Básico"
                        className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        😊 Emoji del Paquete
                      </label>
                      <input
                        type="text"
                        value={snapshotEditando.paquete.emoji || ''}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            paquete: {
                              ...snapshotEditando.paquete,
                              emoji: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: 🥉"
                        className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        📋 Descripción del Paquete
                      </label>
                      <input
                        type="text"
                        value={snapshotEditando.paquete.descripcion || ''}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            paquete: {
                              ...snapshotEditando.paquete,
                              descripcion: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: Paquete personalizado para empresas..."
                        className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Tagline, CostoInfra y TiempoEntrega */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        ✨ Tagline (Subtítulo Hero)
                      </label>
                      <input
                        type="text"
                        value={snapshotEditando.paquete.tagline || ''}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            paquete: {
                              ...snapshotEditando.paquete,
                              tagline: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: Presencia digital confiable, simple pero efectiva"
                        className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        ⏱️ Tiempo de Entrega
                      </label>
                      <input
                        type="text"
                        value={snapshotEditando.paquete.tiempoEntrega || ''}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            paquete: {
                              ...snapshotEditando.paquete,
                              tiempoEntrega: e.target.value,
                            },
                          })
                        }
                        placeholder="Ej: 4 Semanas"
                        className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                </div>
                          </div>
                        ),
                      },
                      {
                        id: 'servicios',
                        label: 'Servicios Base',
                        icon: '🌐',
                        content: (
                          <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                          {/* Servicios Base */}
                <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20">
                  <h3 className="text-lg font-bold text-primary mb-4">💰 Servicios Base</h3>
                  <div className="space-y-3">
                    {snapshotEditando.serviciosBase?.map((servicio, index) => (
                      <div key={servicio.id} className="grid md:grid-cols-[2fr,1fr,1fr,1fr] gap-4 p-4 bg-white rounded-lg border border-primary/20">
                        <div>
                          <label className="block font-semibold text-secondary mb-2 text-xs">
                            📝 Nombre
                          </label>
                            <input
                            type="text"
                            value={servicio.nombre}
                            onChange={(e) => {
                              const nuevosServicios = [...snapshotEditando.serviciosBase]
                              nuevosServicios[index].nombre = e.target.value
                              setSnapshotEditando({
                                ...snapshotEditando,
                                serviciosBase: nuevosServicios,
                              })
                            }}
                            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                              aria-label={`Nombre servicio base ${index + 1}`}
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-secondary mb-2 text-xs">
                            💵 Precio (USD)
                          </label>
                            <input
                            type="number"
                            value={servicio.precio}
                            onChange={(e) => {
                              const nuevosServicios = [...snapshotEditando.serviciosBase]
                                nuevosServicios[index].precio = Number.parseFloat(e.target.value) || 0
                              setSnapshotEditando({
                                ...snapshotEditando,
                                serviciosBase: nuevosServicios,
                              })
                            }}
                            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                            min="0"
                              aria-label={`Precio servicio base ${servicio.nombre || index + 1}`}
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-secondary mb-2 text-xs">
                            🎁 Meses Gratis
                          </label>
                            <input
                            type="number"
                            value={servicio.mesesGratis}
                            onChange={(e) => {
                              const nuevosServicios = [...snapshotEditando.serviciosBase]
                                const gratis = Number.parseInt(e.target.value) || 0;
                              const pagoCalculado = Math.max(1, 12 - gratis);
                              nuevosServicios[index].mesesGratis = Math.min(gratis, 12);
                              nuevosServicios[index].mesesPago = pagoCalculado;
                              setSnapshotEditando({
                                ...snapshotEditando,
                                serviciosBase: nuevosServicios,
                              })
                            }}
                            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                            min="0"
                            max="12"
                              aria-label={`Meses gratis servicio base ${servicio.nombre || index + 1}`}
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-secondary mb-2 text-xs">
                            💳 Meses Pago
                          </label>
                            <input
                            type="number"
                            value={servicio.mesesPago}
                            onChange={(e) => {
                              const nuevosServicios = [...snapshotEditando.serviciosBase]
                                const pago = Number.parseInt(e.target.value) || 12;
                              const pagoValidado = Math.max(1, Math.min(pago, 12));
                              nuevosServicios[index].mesesPago = pagoValidado;
                              setSnapshotEditando({
                                ...snapshotEditando,
                                serviciosBase: nuevosServicios,
                              })
                            }}
                            className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                            min="1"
                            max="12"
                              aria-label={`Meses pago servicio base ${servicio.nombre || index + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                          </div>
                        ),
                      },
                      {
                        id: 'costos',
                        label: 'Costos',
                        icon: '💰',
                        content: (
                          <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                
                {/* Opciones de Pago */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border-2 border-primary/20">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <FaCreditCard /> Opciones de Pago
                  </h3>

                  {/* Desarrollo en la misma sección */}
                  <div className="grid md:grid-cols-1 gap-4 mb-6">
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        🧑‍💻Desarrollo del sistio web
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
                        className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Lista de Opciones de Pago */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block font-semibold text-secondary text-sm">
                        📊 Opciones de Pago Estándar (en cuotas)
                      </label>
                      {(() => {
                        const opcionesPago = snapshotEditando.paquete.opcionesPago || []
                        const totalPorcentaje = opcionesPago.reduce((sum, op) => sum + (op.porcentaje || 0), 0)
                        const esValido = totalPorcentaje === 100
                        return (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            esValido 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            Total: {totalPorcentaje}% {esValido ? '✓' : '⚠️ Debe ser 100%'}
                          </span>
                        )
                      })()}
                    </div>

                    {(snapshotEditando.paquete.opcionesPago || []).length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {(snapshotEditando.paquete.opcionesPago || []).map((opcion, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-lg border-2 border-primary/20 grid md:grid-cols-[2fr,1fr,3fr,auto] gap-3 items-end"
                          >
                            <div>
                              <label className="block font-semibold text-secondary text-sm mb-1">
                                📝 Nombre
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
                                className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                                placeholder="Ej: Inicial"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-secondary text-sm mb-1">
                                📊 Porcentaje
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
                                className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                                min="0"
                                max="100"
                                placeholder="30"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-secondary text-sm mb-1">
                                📋 Descripción
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
                                className="w-full px-3 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none text-sm"
                                placeholder="Ej: Al firmar contrato"
                              />
                            </div>
                            <button
                              aria-label={`Eliminar opción de pago ${opcion.nombre || idx + 1}`}
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
                              className="w-8 h-8 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500 text-sm mb-4 italic">
                        Sin opciones de pago configuradas. Se usará el esquema por defecto (30-40-30).
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
                      className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm"
                    >
                      <FaPlus /> Agregar Opción de Pago
                    </button>
                  </div>

                  {/* Preview de montos */}
                  {(snapshotEditando.paquete.opcionesPago || []).length > 0 && snapshotEditando.paquete.desarrollo > 0 && (
                    <div className="mt-4 p-4 bg-white rounded-lg border-2 border-primary/30">
                      <h4 className="font-semibold text-secondary text-sm mb-3">💰 Vista Previa de Montos</h4>
                      <div className="space-y-2">
                        {(snapshotEditando.paquete.opcionesPago || []).map((opcion, idx) => {
                          const monto = (snapshotEditando.paquete.desarrollo * (opcion.porcentaje || 0)) / 100
                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-neutral-700">
                                {opcion.nombre || `Pago ${idx + 1}`} ({opcion.porcentaje}%)
                              </span>
                              <span className="font-bold text-primary">
                                ${monto.toFixed(2)} USD
                              </span>
                            </div>
                          )
                        })}
                        <div className="border-t-2 border-primary/20 pt-2 mt-2 flex justify-between font-bold">
                          <span className="text-secondary">Total:</span>
                          <span className="text-primary">
                            ${snapshotEditando.paquete.desarrollo.toFixed(2)} USD
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
                        id: 'ajustes',
                        label: 'Descuentos',
                        icon: '💵',
                        content: (
                          <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                            {/* DESCUENTOS GENERALES */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-xl border-2 border-purple-300/20">
                              <h3 className="text-lg font-bold text-purple-600 mb-6 flex items-center gap-2">
                                💸 Descuentos Generales
                              </h3>

                              {/* Checkboxes para aplicar descuentos */}
                              <div className="space-y-3 mb-6 bg-white p-4 rounded-lg border border-purple-200/30">
                                <label className="flex items-center gap-3 cursor-pointer">
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
                                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                                  />
                                  <span className="text-sm font-medium text-secondary">Aplicar a Desarrollo</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
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
                                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                                  />
                                  <span className="text-sm font-medium text-secondary">Aplicar a Servicios Base</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
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
                                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                                  />
                                  <span className="text-sm font-medium text-secondary">Aplicar a Otros Servicios</span>
                                </label>
                              </div>

                              {/* Campos de porcentaje */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block font-semibold text-secondary mb-2 text-sm">
                                    💸 Descuento General (%)
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
                                    className="w-full px-4 py-2 border-2 border-purple-300/20 rounded-lg focus:border-purple-500 focus:outline-none"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold text-secondary mb-2 text-sm">
                                    🎁 Descuento por Pay Full (%)
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
                                    className="w-full px-4 py-2 border-2 border-purple-300/20 rounded-lg focus:border-purple-500 focus:outline-none"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                  />
                                  <p className="text-xs text-neutral-500 mt-1">
                                    Se aplica si el cliente paga el desarrollo completo por adelantado.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* DESCUENTOS POR TIPO DE SERVICIO */}
                            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 rounded-xl border-2 border-blue-300/20">
                              <h3 className="text-lg font-bold text-blue-600 mb-6 flex items-center gap-2">
                                🎯 Descuentos por Tipo de Servicio
                              </h3>

                              {/* Checkboxes para habilitar descuentos por tipo */}
                              <div className="space-y-3 mb-6 bg-white p-4 rounded-lg border border-blue-200/30">
                                <label className="flex items-center gap-3 cursor-pointer">
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
                                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                                  />
                                  <span className="text-sm font-medium text-secondary">Aplicar Descuentos Independientes a Servicios Base</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
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
                                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                                  />
                                  <span className="text-sm font-medium text-secondary">Aplicar Descuentos Independientes a Otros Servicios</span>
                                </label>
                              </div>

                              {/* Servicios Base */}
                              {snapshotEditando.paquete.descuentosPorServicio?.aplicarAServiciosBase && (
                                <div className="mb-6">
                                  <h4 className="font-bold text-blue-600 mb-3 text-sm">📦 Servicios Base</h4>
                                  <div className="space-y-3 bg-white p-4 rounded-lg border border-blue-200/30">
                                    {snapshotEditando.serviciosBase.map((servicio) => {
                                      const descuento = snapshotEditando.paquete.descuentosPorServicio?.serviciosBase.find(d => d.servicioId === servicio.id)
                                      return (
                                        <div key={servicio.id} className="flex gap-3 items-end pb-3 border-b border-blue-100/50 last:border-b-0 last:pb-0">
                                          <div className="flex-1">
                                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                              <input
                                                type="checkbox"
                                                checked={descuento?.aplicarDescuento || false}
                                                onChange={(e) => {
                                                  const updated = { ...snapshotEditando }
                                                  const idx = updated.paquete.descuentosPorServicio.serviciosBase.findIndex(d => d.servicioId === servicio.id)
                                                  if (idx >= 0) {
                                                    updated.paquete.descuentosPorServicio.serviciosBase[idx].aplicarDescuento = e.target.checked
                                                  }
                                                  setSnapshotEditando(updated)
                                                }}
                                                className="w-4 h-4 accent-blue-500 cursor-pointer"
                                              />
                                              <span className="text-sm font-medium text-secondary">{servicio.nombre}</span>
                                            </label>
                                          </div>
                                          {descuento?.aplicarDescuento && (
                                            <input
                                              type="number"
                                              value={descuento.porcentajeDescuento}
                                              onChange={(e) => {
                                                const updated = { ...snapshotEditando }
                                                const idx = updated.paquete.descuentosPorServicio.serviciosBase.findIndex(d => d.servicioId === servicio.id)
                                                if (idx >= 0) {
                                                  updated.paquete.descuentosPorServicio.serviciosBase[idx].porcentajeDescuento = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                                                }
                                                setSnapshotEditando(updated)
                                              }}
                                              className="w-20 px-3 py-2 border-2 border-blue-300/20 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                              min="0"
                                              max="100"
                                              placeholder="0%"
                                            />
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Otros Servicios */}
                              {snapshotEditando.paquete.descuentosPorServicio?.aplicarAOtrosServicios && (
                                <div>
                                  <h4 className="font-bold text-blue-600 mb-3 text-sm">🎁 Otros Servicios</h4>
                                  <div className="space-y-3 bg-white p-4 rounded-lg border border-blue-200/30">
                                    {snapshotEditando.otrosServicios.map((servicio, idx) => {
                                      const descuento = snapshotEditando.paquete.descuentosPorServicio?.otrosServicios[idx]
                                      return (
                                        <div key={idx} className="flex gap-3 items-end pb-3 border-b border-blue-100/50 last:border-b-0 last:pb-0">
                                          <div className="flex-1">
                                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                              <input
                                                type="checkbox"
                                                checked={descuento?.aplicarDescuento || false}
                                                onChange={(e) => {
                                                  const updated = { ...snapshotEditando }
                                                  updated.paquete.descuentosPorServicio.otrosServicios[idx].aplicarDescuento = e.target.checked
                                                  setSnapshotEditando(updated)
                                                }}
                                                className="w-4 h-4 accent-blue-500 cursor-pointer"
                                              />
                                              <span className="text-sm font-medium text-secondary">{servicio.nombre}</span>
                                            </label>
                                          </div>
                                          {descuento?.aplicarDescuento && (
                                            <input
                                              type="number"
                                              value={descuento.porcentajeDescuento}
                                              onChange={(e) => {
                                                const updated = { ...snapshotEditando }
                                                updated.paquete.descuentosPorServicio.otrosServicios[idx].porcentajeDescuento = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                                                setSnapshotEditando(updated)
                                              }}
                                              className="w-20 px-3 py-2 border-2 border-blue-300/20 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                              min="0"
                                              max="100"
                                              placeholder="0%"
                                            />
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* VISTA PREVIA DE MONTOS COMPLETA */}
                            {snapshotEditando && (
                              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-6 rounded-xl border-2 border-emerald-300/20">
                                <h3 className="text-lg font-bold text-emerald-600 mb-6 flex items-center gap-2">
                                  💰 Vista Previa de Montos Completa
                                </h3>

                                {(() => {
                                  const preview = calcularPreviewDescuentos(snapshotEditando)

                                  return (
                                    <div className="space-y-4">
                                      {/* Desarrollo */}
                                      {preview.desarrollo > 0 && (
                                        <div className="bg-white p-4 rounded-lg border border-emerald-200/30">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-secondary">🧑‍💻 Desarrollo</span>
                                            <div className="flex gap-2 items-center">
                                              <span className="line-through text-neutral-400 text-sm">
                                                ${preview.desarrollo.toFixed(2)}
                                              </span>
                                              <span className="font-bold text-emerald-600">
                                                ${preview.desarrolloConDescuento.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          {preview.desarrollo !== preview.desarrolloConDescuento && (
                                            <div className="text-xs text-emerald-600 font-semibold">
                                              Ahorro: ${(preview.desarrollo - preview.desarrolloConDescuento).toFixed(2)} ({(((preview.desarrollo - preview.desarrolloConDescuento) / preview.desarrollo) * 100).toFixed(1)}%)
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Servicios Base */}
                                      {preview.serviciosBase.total > 0 && (
                                        <div className="bg-white p-4 rounded-lg border border-emerald-200/30">
                                          <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium text-secondary">📦 Servicios Base</span>
                                            <div className="flex gap-2 items-center">
                                              <span className="line-through text-neutral-400 text-sm">
                                                ${preview.serviciosBase.total.toFixed(2)}
                                              </span>
                                              <span className="font-bold text-emerald-600">
                                                ${preview.serviciosBase.conDescuento.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          {preview.serviciosBase.desglose.length > 0 && (
                                            <div className="space-y-1 text-xs text-neutral-600 mb-2 pl-2 border-l-2 border-emerald-200">
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
                                            <div className="text-xs text-emerald-600 font-semibold">
                                              Ahorro: ${(preview.serviciosBase.total - preview.serviciosBase.conDescuento).toFixed(2)} ({(((preview.serviciosBase.total - preview.serviciosBase.conDescuento) / preview.serviciosBase.total) * 100).toFixed(1)}%)
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Otros Servicios */}
                                      {preview.otrosServicios.total > 0 && (
                                        <div className="bg-white p-4 rounded-lg border border-emerald-200/30">
                                          <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium text-secondary">🎁 Otros Servicios</span>
                                            <div className="flex gap-2 items-center">
                                              <span className="line-through text-neutral-400 text-sm">
                                                ${preview.otrosServicios.total.toFixed(2)}
                                              </span>
                                              <span className="font-bold text-emerald-600">
                                                ${preview.otrosServicios.conDescuento.toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                          {preview.otrosServicios.desglose.length > 0 && (
                                            <div className="space-y-1 text-xs text-neutral-600 mb-2 pl-2 border-l-2 border-emerald-200">
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
                                            <div className="text-xs text-emerald-600 font-semibold">
                                              Ahorro: ${(preview.otrosServicios.total - preview.otrosServicios.conDescuento).toFixed(2)} ({(((preview.otrosServicios.total - preview.otrosServicios.conDescuento) / preview.otrosServicios.total) * 100).toFixed(1)}%)
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Total General */}
                                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border-2 border-emerald-300/50 mt-4">
                                        <div className="flex justify-between items-center">
                                          <span className="text-base font-bold text-emerald-700">Total General</span>
                                          <div className="flex gap-3 items-center">
                                            <div className="text-right">
                                              <div className="line-through text-neutral-500 text-sm">
                                                ${preview.totalOriginal.toFixed(2)}
                                              </div>
                                              <div className="font-bold text-2xl text-emerald-600">
                                                ${preview.totalConDescuentos.toFixed(2)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {preview.totalAhorro > 0 && (
                                          <div className="mt-3 pt-3 border-t-2 border-emerald-200/50 flex justify-between items-center">
                                            <span className="text-sm font-semibold text-emerald-700">💚 Ahorro Total</span>
                                            <span className="text-lg font-bold text-emerald-600">
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
                      {
                        id: 'otros',
                        label: 'Otros Servicios',
                        icon: '🎁',
                        content: (
                          <div className="space-y-6 p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {/* Otros Servicios */}
                <div className="bg-secondary/5 p-6 rounded-xl border-2 border-secondary/20">
                  <h3 className="text-lg font-bold text-secondary mb-4">🎁 Otros Servicios</h3>
                  {snapshotEditando.otrosServicios.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {snapshotEditando.otrosServicios.map((servicio, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-lg border-2 border-secondary/20 grid md:grid-cols-[2.2fr,1fr,1fr,1fr,auto] gap-3 items-end"
                        >
                          <div>
                            <label className="block font-semibold text-secondary text-sm mb-1">
                              Nombre
                            </label>
                            <input
                              type="text"
                              value={servicio.nombre}
                              onChange={(e) => {
                                const actualizado = [...snapshotEditando.otrosServicios]
                                actualizado[idx].nombre = e.target.value
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  otrosServicios: actualizado,
                                })
                              }}
                              className="w-full px-3 py-2 border-2 border-secondary/30 rounded-lg focus:border-secondary focus:outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-secondary text-sm mb-1">
                              Precio
                            </label>
                            <input
                              type="number"
                              value={servicio.precio}
                              onChange={(e) => {
                                const actualizado = [...snapshotEditando.otrosServicios]
                                actualizado[idx].precio = Number.parseFloat(e.target.value) || 0
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  otrosServicios: actualizado,
                                })
                              }}
                              className="w-full px-3 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                              min="0"
                              aria-label={`Precio servicio opcional ${servicio.nombre || idx + 1}`}
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-secondary text-sm mb-1">
                              Gratis
                            </label>
                            <input
                              type="number"
                              value={servicio.mesesGratis}
                              onChange={(e) => {
                                const actualizado = [...snapshotEditando.otrosServicios]
                                const gratis = Number.parseInt(e.target.value) || 0;
                                const pagoCalculado = Math.max(1, 12 - gratis);
                                actualizado[idx].mesesGratis = Math.min(gratis, 12);
                                actualizado[idx].mesesPago = pagoCalculado;
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  otrosServicios: actualizado,
                                })
                              }}
                              className="w-full px-3 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                              min="0"
                              max="12"
                              aria-label={`Meses gratis servicio opcional ${servicio.nombre || idx + 1}`}
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-secondary text-sm mb-1">
                              Pago
                            </label>
                            <input
                              type="number"
                              value={servicio.mesesPago}
                              onChange={(e) => {
                                const actualizado = [...snapshotEditando.otrosServicios]
                                const pago = Number.parseInt(e.target.value) || 12;
                                const pagoValidado = Math.max(1, Math.min(pago, 12));
                                actualizado[idx].mesesPago = pagoValidado;
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  otrosServicios: actualizado,
                                })
                              }}
                              className="w-full px-3 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                              min="1"
                              max="12"
                              aria-label={`Meses pago servicio opcional ${servicio.nombre || idx + 1}`}
                            />
                          </div>
                          <button
                            aria-label={`Eliminar otro servicio ${servicio.nombre || 'sin nombre'}`}
                            onClick={() => {
                              const actualizado = snapshotEditando.otrosServicios.filter(
                                (_, i) => i !== idx
                              )
                              setSnapshotEditando({
                                ...snapshotEditando,
                                otrosServicios: actualizado,
                              })
                            }}
                            className="w-8 h-8 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm mb-4">Sin otros servicios agregados</p>
                  )}
                  <button
                    onClick={() => {
                      setSnapshotEditando({
                        ...snapshotEditando,
                        otrosServicios: [
                          ...snapshotEditando.otrosServicios,
                          {
                            nombre: '',
                            precio: 0,
                            mesesGratis: 0,
                            mesesPago: 12,
                          },
                        ],
                      })
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-accent to-accent-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm"
                  >
                    <FaPlus /> Agregar Servicio
                  </button>
                </div>
                          </div>
                        ),
                      },
                    ]}
                    activeTab={activeModalTab}
                    onTabChange={setActiveModalTab}
                    scrollContainerRef={modalScrollContainerRef}
                  />
              </div>
              {/* Fin Contenido Scrollable */}

              {/* Footer Fijo */}
              <div className="flex-shrink-0 bg-secondary-light border-t-2 border-neutral-200 px-6 py-4 flex justify-between items-center">
                {/* Indicador de autoguardado a la izquierda */}
                <div className="flex items-center gap-3">
                  {autoSaveStatus === 'saving' && (
                    <span className="text-sm text-accent animate-pulse">Guardando cambios...</span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-sm text-green-600">✓ Cambios guardados</span>
                  )}
                  {autoSaveStatus === 'error' && (
                    <span className="text-sm text-red-600">❌ Error al guardar. Reintentando...</span>
                  )}
                </div>
                {/* Botones a la derecha */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={guardarEdicion}
                    className="py-2 px-6 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <FaCheck /> Guardar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCerrarModalEditar}
                    className="py-2 px-6 bg-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-400 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <FaTimes /> Cancelar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

