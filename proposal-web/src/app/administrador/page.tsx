'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { FaCalculator, FaPlus, FaTrash, FaDownload, FaArrowLeft, FaEdit, FaTimes, FaCheck } from 'react-icons/fa'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { jsPDF } from 'jspdf'
import { obtenerSnapshots, crearSnapshot, actualizarSnapshot, eliminarSnapshot } from '@/lib/snapshotApi'

interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface GestionConfig {
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface Package {
  nombre: string
  desarrollo: number
  descuento: number
  activo: boolean
  tipo?: string
  descripcion?: string
}

interface Servicio {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface OtroServicio {
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface OtroServicioSnapshot extends OtroServicio {}

interface PackageSnapshot {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  gestion: {
    precio: number
    mesesGratis: number
    mesesPago: number
  }
  paquete: {
    desarrollo: number
    descuento: number
    tipo?: string
    descripcion?: string
  }
  otrosServicios: OtroServicioSnapshot[]
  costos: {
    inicial: number
    año1: number
    año2: number
  }
  activo: boolean
  createdAt: string
}

export default function Administrador() {
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
  const [snapshotEditando, setSnapshotEditando] = useState<PackageSnapshot | null>(null)
  // Estado para comparar cambios en el modal (versión original serializada)
  const [snapshotOriginalJson, setSnapshotOriginalJson] = useState<string | null>(null)
  // Ref para foco inicial en modal
  const nombrePaqueteInputRef = useRef<HTMLInputElement | null>(null)
  const [cargandoSnapshots, setCargandoSnapshots] = useState(true)
  const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)

  // Cargar snapshots desde la API y configuración del localStorage al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoSnapshots(true)
        setErrorSnapshots(null)
        
        // Cargar snapshots desde la API
        const snapshotsDelServidor = await obtenerSnapshots()
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

    const mesesPagoGestion = snapshot.gestion.mesesPago
    const gestionCosto = snapshot.gestion.precio * mesesPagoGestion

    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      const mesesServicio = s.mesesPago
      return sum + s.precio * mesesServicio
    }, 0)

    return desarrolloConDescuento + serviciosBaseCosto + gestionCosto + otrosServiciosTotal
  }

  // Calcular costo año 2 para un snapshot
  const calcularCostoAño2Snapshot = (snapshot: PackageSnapshot) => {
    // Año 2: no se consideran meses gratis, todo a 12 meses, sin desarrollo
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * 12)
    }, 0)

    const gestionCosto = snapshot.gestion.precio * 12

    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * 12
    }, 0)

    return serviciosBaseCosto + gestionCosto + otrosServiciosTotal
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

      alert('✅ Paquete creado y guardado correctamente')
    } catch (error) {
      console.error('Error al crear paquete:', error)
      alert('❌ Error al guardar el paquete. Por favor intenta de nuevo.')
    }
  }

  const abrirModalEditar = (snapshot: PackageSnapshot) => {
    setSnapshotEditando({ ...snapshot })
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
      setShowModalEditar(false)
      setSnapshotEditando(null)
      alert('✅ Paquete actualizado correctamente')
      setSnapshotOriginalJson(JSON.stringify(snapshotActualizado))
    } catch (error) {
      console.error('Error al guardar edición:', error)
      alert('❌ Error al actualizar el paquete. Por favor intenta de nuevo.')
    }
  }

  // Cerrar modal con validación de cambios sin guardar
  const handleCerrarModalEditar = () => {
    if (snapshotEditando && snapshotOriginalJson) {
      const actual = JSON.stringify(snapshotEditando)
      if (actual !== snapshotOriginalJson) {
        const confirmar = confirm('Hay cambios sin guardar. ¿Deseas cerrar y descartar los cambios?')
        if (!confirmar) return
      }
    }
    setShowModalEditar(false)
    setSnapshotEditando(null)
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

  const guardarConfiguracionActual = () => {
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
    alert('✅ Configuración y paquetes guardados correctamente en localStorage')
  }

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
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all flex items-center gap-2 font-semibold border border-white/30 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
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

            {/* Sección 3: Gestión */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border-l-4 border-accent p-8"
            >
              <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                <span className="text-3xl">🛠️</span>
                3. Gestión (Opcional)
              </h2>

              <div className="space-y-4 p-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border-2 border-accent/20">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="gestionPrecio" className="block font-semibold text-secondary mb-2">
                      💵 Precio (USD/mes) *
                    </label>
                    <input
                      id="gestionPrecio"
                      type="number"
                      placeholder="0"
                      value={gestion.precio}
                      onChange={(e) =>
                        setGestion({
                          ...gestion,
                          precio: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="gestionMesesGratis" className="block font-semibold text-secondary mb-2">
                      🎁 Meses Gratis
                    </label>
                    <input
                      id="gestionMesesGratis"
                      type="number"
                      placeholder="0"
                      value={gestion.mesesGratis}
                      onChange={(e) => {
                        const gratis = parseInt(e.target.value) || 0
                        setGestion({
                          ...gestion,
                          mesesGratis: gratis,
                          mesesPago: Math.max(0, 12 - gratis),
                        })
                      }}
                                            max="12"
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="gestionMesesPago" className="block font-semibold text-secondary mb-2">
                      📅 Meses de Pago *
                    </label>
                    <input
                      id="gestionMesesPago"
                      type="number"
                      placeholder="12"
                      value={gestion.mesesPago}
                      onChange={(e) => {
                        const pago = parseInt(e.target.value) || 12;
                        const pagoValidado = Math.max(1, Math.min(pago, 12));
                        setGestion({
                          ...gestion,
                          mesesPago: pagoValidado,
                        })
                      }}
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="1"
                      max="12"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sección 4: Otros Servicios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border-l-4 border-accent p-8"
            >
              <h2 className="text-2xl font-bold text-secondary mb-6">4. Servicios Opcionales</h2>

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
                  Paquetes Creados ({snapshots.length})
                </h2>

                <div className="space-y-6 md:grid md:grid-cols-2 gap-10 md:space-y-0">
                  {snapshots.map((snapshot, idx) => (
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
                            <div className="flex items-center gap-2">
                              <input
                                id={`snapshot-activo-${snapshot.id}`}
                                type="checkbox"
                                checked={snapshot.activo}
                                onChange={(e) => {
                                  const actualizado = { ...snapshot, activo: e.target.checked }
                                  setSnapshots(snapshots.map(s => s.id === snapshot.id ? actualizado : s))
                                }}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <label htmlFor={`snapshot-activo-${snapshot.id}`} className="font-semibold text-secondary text-sm">Activo</label>
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
                              <tr className="border-b border-secondary/20">
                                <td colSpan={5} className="p-2 font-bold bg-primary/10 text-primary">
                                  💰 Servicios Base
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

                              {/* Gestión */}
                              <tr className="border-b border-secondary/20">
                                <td colSpan={5} className="p-2 font-bold bg-amber-50 text-amber-900">
                                  🛠️ Gestión
                                </td>
                              </tr>
                              <tr className="border-b border-secondary/20">
                                <td className="p-2 text-secondary">Precio</td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.gestion.mesesGratis}
                                </td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.gestion.mesesPago}
                                </td>
                                <td className="p-2 text-right font-semibold text-amber-700 bg-primary/5">
                                  ${snapshot.gestion.precio.toFixed(2)}/mes
                                </td>
                                <td className="p-2 text-right font-semibold text-amber-700 bg-accent/5">
                                  ${(snapshot.gestion.precio * snapshot.gestion.mesesPago).toFixed(2)}/año
                                </td>
                              </tr>

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
            className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
            onClick={handleCerrarModalEditar}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-editar-titulo"
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex justify-between items-center border-b-4 border-accent">
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

              <div className="p-6 space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block font-semibold text-secondary mb-2">
                    📦 Nombre del Paquete
                  </label>
                  <input
                    type="text"
                    value={snapshotEditando.nombre}
                    onChange={(e) =>
                      setSnapshotEditando({ ...snapshotEditando, nombre: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                    ref={nombrePaqueteInputRef}
                    aria-describedby="ayuda-nombre-paquete"
                  />
                  <p id="ayuda-nombre-paquete" className="mt-1 text-xs text-neutral-500">Nombre visible en listado y PDF.</p>
                </div>

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

                {/* Gestión */}
                <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">🛠️ Gestión (USD/mes)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        Precio
                      </label>
                      <input
                        type="number"
                        value={snapshotEditando.gestion.precio}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            gestion: {
                              ...snapshotEditando.gestion,
                              precio: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        🎁 Meses Gratis
                      </label>
                      <input
                        type="number"
                        value={snapshotEditando.gestion.mesesGratis}
                        onChange={(e) => {
                          const gratis = parseInt(e.target.value) || 0;
                          const pagoCalculado = Math.max(1, 12 - gratis);
                          setSnapshotEditando({
                            ...snapshotEditando,
                            gestion: {
                              ...snapshotEditando.gestion,
                              mesesGratis: Math.min(gratis, 12),
                              mesesPago: pagoCalculado,
                            },
                          })
                        }}
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
                        min="0"
                        max="12"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        📅 Meses Pago
                      </label>
                      <input
                        type="number"
                        value={snapshotEditando.gestion.mesesPago}
                        onChange={(e) => {
                          const pago = parseInt(e.target.value) || 12;
                          const pagoValidado = Math.max(1, Math.min(pago, 12));
                          setSnapshotEditando({
                            ...snapshotEditando,
                            gestion: {
                              ...snapshotEditando.gestion,
                              mesesPago: pagoValidado,
                            },
                          })
                        }}
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
                        min="1"
                        max="12"
                      />
                    </div>
                  </div>
                </div>

                {/* Paquete */}
                <div className="bg-accent/5 p-6 rounded-xl border-2 border-accent/20">
                  <h3 className="text-lg font-bold text-accent mb-4">📦 Costo del Paquete (USD/mes)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        🧑‍💻Desarrollo
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
                        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        💸 Descuento (%)
                      </label>
                      <input
                        type="number"
                        value={snapshotEditando.paquete.descuento}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            paquete: {
                              ...snapshotEditando.paquete,
                              descuento: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo y Descripción */}
                <div className="bg-secondary/5 p-6 rounded-xl border-2 border-secondary/20">
                  <h3 className="text-lg font-bold text-secondary mb-4">📝 Información del Paquete</h3>
                  <div className="grid md:grid-cols-2 gap-4">
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
                        placeholder="Ej: Básico, Profesional, Premium, VIP"
                        className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none"
                      />
                    </div>
                    <div>
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
                        className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

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

                {/* Botones de Acción */}
                <div className="flex gap-4 pt-4 border-t-2 border-neutral-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={guardarEdicion}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <FaCheck /> Guardar Cambios
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCerrarModalEditar}
                    className="flex-1 py-3 bg-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-400 transition-all flex items-center justify-center gap-2 font-semibold"
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

