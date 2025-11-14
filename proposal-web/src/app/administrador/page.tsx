'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaCalculator, FaPlus, FaTrash, FaDownload, FaArrowLeft, FaEdit, FaTimes, FaCheck } from 'react-icons/fa'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { jsPDF } from 'jspdf'
import { obtenerSnapshots, crearSnapshot, actualizarSnapshot, eliminarSnapshot } from '@/lib/snapshotApi'

interface ServicePrice {
  hosting: number
  mailbox: number
  dominio: number
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
  servicios: {
    hosting: number
    mailbox: number
    dominio: number
    mesesGratis: number
    mesesPago: number
  }
  gestion: {
    precio: number
    mesesGratis: number
    mesesPago: number
  }
  paquete: {
    desarrollo: number
    descuento: number
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
  const [precios, setPrecios] = useState<ServicePrice>({
    hosting: 28,
    mailbox: 4,
    dominio: 18,
  })

  const [gestion, setGestion] = useState<GestionConfig>({
    precio: 0,
    mesesGratis: 0,
    mesesPago: 12,
  })

  const [mesesGratis, setMesesGratis] = useState(3)
  const [mesesPago, setMesesPago] = useState(9)

  // Definición de Paquetes
  const [paqueteActual, setPaqueteActual] = useState<Package>({
    nombre: '',
    desarrollo: 0,
    descuento: 0,
    activo: true,
  })

  // Otros Servicios
  const [otrosServicios, setOtrosServicios] = useState<OtroServicio[]>([])
  const [nuevoOtroServicio, setNuevoOtroServicio] = useState<{
    nombre: string
    precio: number
    mesesGratis: number
    mesesPago: number
  }>({ 
    nombre: '', 
    precio: 0,
    mesesGratis: 0,
    mesesPago: 12,
  })

  // Servicios (Sección 4)
  const [servicios, setServicios] = useState<Servicio[]>([])
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
  const [snapshots, setSnapshots] = useState<PackageSnapshot[]>([])
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null)
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [snapshotEditando, setSnapshotEditando] = useState<PackageSnapshot | null>(null)
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
        if (config.precios) setPrecios(config.precios)
        if (config.gestion) setGestion(config.gestion)
        if (config.mesesGratis !== undefined) setMesesGratis(config.mesesGratis)
        if (config.mesesPago !== undefined) setMesesPago(config.mesesPago)
        if (config.paqueteActual) setPaqueteActual(config.paqueteActual)
        if (config.otrosServicios) setOtrosServicios(config.otrosServicios)
        if (config.servicios) setServicios(config.servicios)
      } catch (e) {
        console.error('Error cargando configuración:', e)
      }
    }
  }, [])

  // Ya no necesitamos guardar snapshots en localStorage, se guardan en la API
  // El segundo useEffect que guardaba en localStorage se elimina

  // Validaciones
  const paqueteEsValido = paqueteActual.nombre && paqueteActual.desarrollo > 0
  const preciosValidos = precios.hosting > 0 || precios.mailbox > 0 || precios.dominio > 0
  const serviciosValidos = mesesGratis >= 0 && mesesPago > mesesGratis
  // Gestión es OPCIONAL
  const gestionValida = gestion.precio === 0 || (gestion.precio > 0 && gestion.mesesPago > gestion.mesesGratis)
  const todoEsValido = paqueteEsValido && preciosValidos && serviciosValidos && gestionValida

  // Calcular costo inicial para un snapshot
  const calcularCostoInicialSnapshot = (snapshot: PackageSnapshot) => {
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
    const serviciosBase =
      snapshot.servicios.hosting +
      snapshot.servicios.mailbox +
      snapshot.servicios.dominio
    // Pago inicial: desarrollo con descuento + precios base de hosting, mailbox y dominio
    return desarrolloConDescuento + serviciosBase
  }

  // Calcular costo año 1 para un snapshot
  const calcularCostoAño1Snapshot = (snapshot: PackageSnapshot) => {
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
    // Año 1: se facturan los meses de pago (12 - meses gratis) para cada grupo
    const mesesPagoServicios = snapshot.servicios.mesesPago
    const serviciosBase =
      snapshot.servicios.hosting * mesesPagoServicios +
      snapshot.servicios.mailbox * mesesPagoServicios +
      snapshot.servicios.dominio * mesesPagoServicios

    const mesesPagoGestion = snapshot.gestion.mesesPago
    const gestionCosto = snapshot.gestion.precio * mesesPagoGestion

    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      const mesesServicio = s.mesesPago
      return sum + s.precio * mesesServicio
    }, 0)

    return desarrolloConDescuento + serviciosBase + gestionCosto + otrosServiciosTotal
  }

  // Calcular costo año 2 para un snapshot
  const calcularCostoAño2Snapshot = (snapshot: PackageSnapshot) => {
    // Año 2: no se consideran meses gratis, todo a 12 meses, sin desarrollo
    const serviciosBase =
      snapshot.servicios.hosting * 12 +
      snapshot.servicios.mailbox * 12 +
      snapshot.servicios.dominio * 12

    const gestionCosto = snapshot.gestion.precio * 12

    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * 12
    }, 0)

    return serviciosBase + gestionCosto + otrosServiciosTotal
  }

  const actualizarPrecio = (servicio: keyof ServicePrice, valor: number) => {
    setPrecios({ ...precios, [servicio]: valor })
  }

  // Funciones para Otros Servicios (legacy para snapshots)
  const agregarOtroServicio = () => {
    if (nuevoOtroServicio.nombre && nuevoOtroServicio.precio > 0) {
      setOtrosServicios([
        ...otrosServicios,
        {
          nombre: nuevoOtroServicio.nombre,
          precio: nuevoOtroServicio.precio,
          mesesGratis: nuevoOtroServicio.mesesGratis,
          mesesPago: nuevoOtroServicio.mesesPago,
        }
      ])
      setNuevoOtroServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })
    }
  }

  const eliminarOtroServicio = (index: number) => {
    setOtrosServicios(otrosServicios.filter((_, i) => i !== index))
  }

  // Funciones para Servicios (Sección 4)
  const agregarServicio = () => {
    if (nuevoServicio.nombre && nuevoServicio.precio > 0) {
      const nuevoServ: Servicio = {
        id: Date.now().toString(),
        nombre: nuevoServicio.nombre,
        precio: nuevoServicio.precio,
        mesesGratis: nuevoServicio.mesesGratis,
        mesesPago: nuevoServicio.mesesPago,
      }
      setServicios([...servicios, nuevoServ])
      setNuevoServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })
    }
  }

  const abrirEditarServicio = (servicio: Servicio) => {
    setServicioEditando({ ...servicio })
    setEditandoServicioId(servicio.id)
  }

  const guardarEditarServicio = () => {
    if (servicioEditando && servicioEditando.nombre && servicioEditando.precio > 0) {
      setServicios(servicios.map(s => s.id === servicioEditando.id ? servicioEditando : s))
      setEditandoServicioId(null)
      setServicioEditando(null)
    }
  }

  const cancelarEditarServicio = () => {
    setEditandoServicioId(null)
    setServicioEditando(null)
  }

  const eliminarServicio = (id: string) => {
    setServicios(servicios.filter(s => s.id !== id))
  }

  const crearPaqueteSnapshot = async () => {
    if (!todoEsValido) {
      alert('Por favor completa todos los campos requeridos: Nombre del paquete, Desarrollo, Precios de servicios, y Meses válidos.')
      return
    }

    try {
      // Convertir servicios a otrosServicios para guardar en snapshot
      const otrosServiciosConvertidos: OtroServicio[] = servicios.map(s => ({
        nombre: s.nombre,
        precio: s.precio,
        mesesGratis: s.mesesGratis,
        mesesPago: s.mesesPago,
      }))

      const nuevoSnapshot: PackageSnapshot = {
        id: Date.now().toString(),
        nombre: paqueteActual.nombre,
        servicios: {
          hosting: precios.hosting,
          mailbox: precios.mailbox,
          dominio: precios.dominio,
          mesesGratis,
          mesesPago,
        },
        gestion: {
          precio: gestion.precio,
          mesesGratis: gestion.mesesGratis,
          mesesPago: gestion.mesesPago,
        },
        paquete: {
          desarrollo: paqueteActual.desarrollo,
          descuento: paqueteActual.descuento,
        },
        otrosServicios: [...otrosServicios, ...otrosServiciosConvertidos],
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
      setPaqueteActual({ nombre: '', desarrollo: 0, descuento: 0, activo: true })
      setOtrosServicios([])
      setServicios([])
      setNuevoOtroServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })
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
    } catch (error) {
      console.error('Error al guardar edición:', error)
      alert('❌ Error al actualizar el paquete. Por favor intenta de nuevo.')
    }
  }

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

    // Colores RGB
    const colorPrimario = [51, 102, 204] as [number, number, number]
    const colorSecundario = [240, 240, 240] as [number, number, number]

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
      doc.setTextColor(51, 102, 204)
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
    const serviciosContent = [
      `• Hosting: $${snapshot.servicios.hosting.toFixed(2)}/mes`,
      `• Mailbox: $${snapshot.servicios.mailbox.toFixed(2)}/mes`,
      `• Dominio: $${snapshot.servicios.dominio.toFixed(2)}/mes`,
      `• Período sin costo: ${snapshot.servicios.mesesGratis} meses`,
      `• Período a pagar: ${snapshot.servicios.mesesPago} meses`,
    ]
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
    
    doc.setFillColor(51, 153, 102)
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
      doc.setTextColor(51, 102, 204)
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
      precios,
      gestion,
      mesesGratis,
      mesesPago,
      paqueteActual,
      otrosServicios,
      servicios,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('configuracionAdministrador', JSON.stringify(configActual))
    // Guardar también los snapshots creados
    localStorage.setItem('paquetesSnapshots', JSON.stringify(snapshots))
    alert('✅ Configuración y paquetes guardados correctamente en localStorage')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary-light to-neutral-900">
      <Navigation />
      <div className="max-w-7xl mx-auto py-20 px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header con botón volver */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Panel Administrativo
              </h1>
              <p className="text-xl text-neutral-200">
                Calculadora de Presupuestos y Gestión de Servicios
              </p>
            </div>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all flex items-center gap-2 font-semibold border border-white/30 backdrop-blur"
              >
                <FaArrowLeft /> Volver
              </motion.button>
            </Link>
          </div>

          <div className="space-y-8">
            {/* Sección 1: Definición de Precios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border-l-4 border-primary p-8"
            >
              <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
                <span className="text-3xl">💰</span>
                1. Definición de Precios de Servicios
              </h2>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary/30">
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      💾 Hosting
                    </label>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all">
                      <input
                        type="number"
                        value={precios.hosting}
                        onChange={(e) =>
                          actualizarPrecio('hosting', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 bg-transparent border-0 focus:ring-0 focus:outline-none font-semibold text-sm"
                      />
                      <span className="text-xs font-bold text-primary whitespace-nowrap">USD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      ✉️ Mailbox
                    </label>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all">
                      <input
                        type="number"
                        value={precios.mailbox}
                        onChange={(e) =>
                          actualizarPrecio('mailbox', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 bg-transparent border-0 focus:ring-0 focus:outline-none font-semibold text-sm"
                      />
                      <span className="text-xs font-bold text-primary whitespace-nowrap">USD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      🌍 Dominio
                    </label>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all">
                      <input
                        type="number"
                        value={precios.dominio}
                        onChange={(e) =>
                          actualizarPrecio('dominio', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 bg-transparent border-0 focus:ring-0 focus:outline-none font-semibold text-sm"
                      />
                      <span className="text-xs font-bold text-primary whitespace-nowrap">USD</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      🎁 Meses Gratis
                    </label>
                    <input
                      type="number"
                      value={mesesGratis}
                      onChange={(e) => {
                        const gratis = parseInt(e.target.value) || 0
                        setMesesGratis(gratis)
                        setMesesPago(Math.max(0, 12 - gratis))
                      }}
                      className="w-full px-3 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none font-semibold focus:ring-2 focus:ring-primary/20"
                      min="0"
                                          max="12"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      📅 Meses de Pago
                    </label>
                    <input
                      type="number"
                      value={mesesPago}
                      onChange={(e) => setMesesPago(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-3 border-2 border-primary/30 rounded-lg focus:border-primary focus:outline-none font-semibold focus:ring-2 focus:ring-primary/20"
                      min="1"
                    />
                  </div>
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
                    <label className="block font-semibold text-secondary mb-2">
                      📦 Nombre del Paquete *
                    </label>
                    <input
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
                    <label className="block font-semibold text-secondary mb-2">
                      💵 Desarrollo (USD) *
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={paqueteActual.desarrollo}
                      onChange={(e) =>
                        setPaqueteActual({
                          ...paqueteActual,
                          desarrollo: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-secondary mb-2">
                      🏷️ Descuento (%)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={paqueteActual.descuento}
                      onChange={(e) =>
                        setPaqueteActual({
                          ...paqueteActual,
                          descuento: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="0"
                      max="100"
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
                    <label className="block font-semibold text-secondary mb-2">
                      💵 Precio (USD/mes) *
                    </label>
                    <input
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
                    <label className="block font-semibold text-secondary mb-2">
                      🎁 Meses Gratis
                    </label>
                    <input
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
                    <label className="block font-semibold text-secondary mb-2">
                      📅 Meses de Pago *
                    </label>
                    <input
                      type="number"
                      placeholder="12"
                      value={gestion.mesesPago}
                      onChange={(e) =>
                        setGestion({
                          ...gestion,
                          mesesPago: parseInt(e.target.value) || 12,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none"
                      min="1"
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
              <h2 className="text-2xl font-bold text-secondary mb-6">
                4. Otros Servicios (Opcional)
              </h2>

              {otrosServicios.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="text-sm font-semibold text-secondary mb-3 grid md:grid-cols-5 gap-3">
                    <span>📝 Nombre</span>
                    <span>💰 Precio (USD)</span>
                    <span>🎁 Meses Gratis</span>
                    <span>📅 Meses Pago</span>
                    <span>🗑️ Acción</span>
                  </div>
                  {otrosServicios.map((servicio, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-neutral-50 p-4 rounded-lg border-2 border-neutral-200 grid md:grid-cols-5 gap-3 items-center"
                    >
                      <p className="font-semibold text-secondary">{servicio.nombre}</p>
                      <p className="text-primary font-bold">${servicio.precio.toFixed(2)} USD</p>
                      <p className="text-secondary font-semibold">{servicio.mesesGratis}</p>
                      <p className="text-secondary font-semibold">{servicio.mesesPago}</p>
                      <div className="flex justify-center">
                        <button
                          onClick={() => eliminarOtroServicio(index)}
                          className="w-8 h-8 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="space-y-4 p-6 bg-gradient-to-r from-accent/5 to-primary/10 rounded-xl border-2 border-dashed border-accent/40">
                <div className="grid md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-3">
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      📝 Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: SEO Premium"
                      value={nuevoOtroServicio.nombre}
                      onChange={(e) =>
                        setNuevoOtroServicio({ ...nuevoOtroServicio, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      💰 Precio (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={nuevoOtroServicio.precio}
                      onChange={(e) =>
                        setNuevoOtroServicio({
                          ...nuevoOtroServicio,
                          precio: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none text-sm"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      🎁 Meses Gratis
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={nuevoOtroServicio.mesesGratis}
                      onChange={(e) =>
                        setNuevoOtroServicio({
                          ...nuevoOtroServicio,
                          mesesGratis: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none text-sm"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block font-semibold text-secondary mb-2 text-sm">
                      📅 Meses Pago
                    </label>
                    <input
                      type="number"
                      placeholder="12"
                      value={nuevoOtroServicio.mesesPago}
                      onChange={(e) =>
                        setNuevoOtroServicio({
                          ...nuevoOtroServicio,
                          mesesPago: parseInt(e.target.value) || 12,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg focus:border-accent focus:outline-none text-sm"
                      min="1"
                    />
                  </div>
                  <div className="flex items-end md:col-span-1">
                    <button
                      onClick={agregarOtroServicio}
                      className="w-full px-4 py-2 bg-gradient-to-r from-accent to-accent-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <FaPlus /> Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón Crear Paquete */}
              <div className="mt-8 pt-6 border-t-2 border-accent/30">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={crearPaqueteSnapshot}
                  disabled={!todoEsValido}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    todoEsValido
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <FaPlus /> Crear Paquete con esta Configuración
                </motion.button>
                {!todoEsValido && (
                  <p className="text-sm text-primary mt-2 text-center">
                    ⚠️ Completa: Nombre paquete, Desarrollo, Precios servicios y Meses válidos
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

                <div className="space-y-6">
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
                            <p className="text-sm text-neutral-500">
                              {new Date(snapshot.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={snapshot.activo}
                                onChange={(e) => {
                                  const actualizado = { ...snapshot, activo: e.target.checked }
                                  setSnapshots(snapshots.map(s => s.id === snapshot.id ? actualizado : s))
                                }}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <label className="font-semibold text-secondary text-sm">Activo</label>
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
                              <tr className="border-b-2 border-secondary bg-neutral-100">
                                <th className="text-left p-2 font-bold text-secondary">📝 Concepto</th>
                                <th className="text-center p-2 font-bold text-secondary">🎁 Meses Gratis</th>
                                <th className="text-center p-2 font-bold text-secondary">📅 Meses Pago</th>
                                <th className="text-right p-2 font-bold text-secondary bg-primary/5">💵 Mensual</th>
                                <th className="text-right p-2 font-bold text-secondary bg-accent/5">💰 Anual</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Servicios Base */}
                              <tr className="border-b border-secondary/20">
                                <td colSpan={5} className="p-2 font-bold bg-primary/10 text-primary">
                                  💰 Servicios Base
                                </td>
                              </tr>
                              <tr className="border-b border-secondary/20">
                                <td className="p-2 text-secondary">Hosting</td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.servicios.mesesGratis}
                                </td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.servicios.mesesPago}
                                </td>
                                <td className="p-2 text-right font-semibold text-primary bg-primary/5">
                                  ${snapshot.servicios.hosting.toFixed(2)}/mes
                                </td>
                                <td className="p-2 text-right font-semibold text-accent bg-accent/5">
                                  ${(snapshot.servicios.hosting * snapshot.servicios.mesesPago).toFixed(2)}
                                </td>
                              </tr>
                              <tr className="border-b border-secondary/20">
                                <td className="p-2 text-secondary">Mailbox</td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.servicios.mesesGratis}
                                </td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.servicios.mesesPago}
                                </td>
                                <td className="p-2 text-right font-semibold text-primary bg-primary/5">
                                  ${snapshot.servicios.mailbox.toFixed(2)}/mes
                                </td>
                                <td className="p-2 text-right font-semibold text-accent bg-accent/5">
                                  ${(snapshot.servicios.mailbox * snapshot.servicios.mesesPago).toFixed(2)}
                                </td>
                              </tr>
                              <tr className="border-b border-secondary/20">
                                <td className="p-2 text-secondary">Dominio</td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.servicios.mesesGratis}
                                </td>
                                <td className="p-2 text-center font-semibold text-secondary">
                                  {snapshot.servicios.mesesPago}
                                </td>
                                <td className="p-2 text-right font-semibold text-primary bg-primary/5">
                                  ${snapshot.servicios.dominio.toFixed(2)}/mes
                                </td>
                                <td className="p-2 text-right font-semibold text-accent bg-accent/5">
                                  ${(snapshot.servicios.dominio * snapshot.servicios.mesesPago).toFixed(2)}
                                </td>
                              </tr>

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
                                  ${(snapshot.gestion.precio * snapshot.gestion.mesesPago).toFixed(2)}
                                </td>
                              </tr>

                              {/* Paquete */}
                              <tr className="border-b border-secondary/20">
                                <td colSpan={5} className="p-2 font-bold bg-accent/10 text-accent">
                                  📦 Paquete
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
                                  ${snapshot.paquete.desarrollo.toFixed(2)} <span className="text-xs">(1 vez)</span>
                                </td>
                              </tr>
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
                                        ${(servicio.precio * servicio.mesesPago).toFixed(2)}
                                      </td>
                                    </motion.tr>
                                  ))}
                                </>
                              )}

                              {/* Costos Finales */}
                              <tr className="border-b border-secondary/20">
                                <td colSpan={5} className="p-2 font-bold bg-gradient-to-r from-primary/10 to-accent/10 text-primary">
                                  💳 Costos Calculados
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

            {/* Sección 6: Acciones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex gap-4 justify-center"
            >
              <button 
                onClick={handleDescargarPdf}
                className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold hover:scale-105 active:scale-95"
              >
                <FaDownload /> Descargar Presupuesto (PDF)
              </button>
              <button 
                onClick={guardarConfiguracionActual}
                className="px-8 py-3 bg-gradient-to-r from-accent to-accent-dark text-white rounded-lg hover:shadow-lg transition-all font-semibold hover:scale-105 active:scale-95"
              >
                💾 Guardar Configuración
              </button>
            </motion.div>
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
            onClick={() => setShowModalEditar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex justify-between items-center border-b-4 border-accent">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FaEdit /> Editar Paquete: {snapshotEditando.nombre}
                </h2>
                <button
                  onClick={() => setShowModalEditar(false)}
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
                  />
                </div>

                {/* Servicios Base */}
                <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20">
                  <h3 className="text-lg font-bold text-primary mb-4">💰 Servicios Base (USD/mes)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'hosting', label: 'Hosting' },
                      { key: 'mailbox', label: 'Mailbox' },
                      { key: 'dominio', label: 'Dominio' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block font-semibold text-secondary mb-2 text-sm">
                          {label}
                        </label>
                        <input
                          type="number"
                          value={snapshotEditando.servicios[key as keyof typeof snapshotEditando.servicios] || 0}
                          onChange={(e) =>
                            setSnapshotEditando({
                              ...snapshotEditando,
                              servicios: {
                                ...snapshotEditando.servicios,
                                [key]: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        🎁 Meses Gratis
                      </label>
                      <input
                        type="number"
                        value={snapshotEditando.servicios.mesesGratis}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            servicios: {
                              ...snapshotEditando.servicios,
                              mesesGratis: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        📅 Meses de Pago
                      </label>
                      <input
                        type="number"
                        value={snapshotEditando.servicios.mesesPago}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            servicios: {
                              ...snapshotEditando.servicios,
                              mesesPago: parseInt(e.target.value) || 1,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                        min="1"
                      />
                    </div>
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
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            gestion: {
                              ...snapshotEditando.gestion,
                              mesesGratis: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        📅 Meses Pago
                      </label>
                      <input
                        type="number"
                        value={snapshotEditando.gestion.mesesPago}
                        onChange={(e) =>
                          setSnapshotEditando({
                            ...snapshotEditando,
                            gestion: {
                              ...snapshotEditando.gestion,
                              mesesPago: parseInt(e.target.value) || 12,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 focus:outline-none"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Paquete */}
                <div className="bg-accent/5 p-6 rounded-xl border-2 border-accent/20">
                  <h3 className="text-lg font-bold text-accent mb-4">📦 Paquete</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-secondary mb-2 text-sm">
                        Desarrollo (USD)
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
                        Descuento (%)
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

                {/* Otros Servicios */}
                <div className="bg-secondary/5 p-6 rounded-xl border-2 border-secondary/20">
                  <h3 className="text-lg font-bold text-secondary mb-4">🎁 Otros Servicios</h3>
                  {snapshotEditando.otrosServicios.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {snapshotEditando.otrosServicios.map((servicio, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-lg border-2 border-secondary/20 grid md:grid-cols-5 gap-3 items-end"
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
                              className="w-full px-3 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
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
                                actualizado[idx].precio = parseFloat(e.target.value) || 0
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  otrosServicios: actualizado,
                                })
                              }}
                              className="w-full px-3 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                              min="0"
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
                                actualizado[idx].mesesGratis = parseInt(e.target.value) || 0
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  otrosServicios: actualizado,
                                })
                              }}
                              className="w-full px-3 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                              min="0"
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
                                actualizado[idx].mesesPago = parseInt(e.target.value) || 12
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  otrosServicios: actualizado,
                                })
                              }}
                              className="w-full px-3 py-2 border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none text-sm"
                              min="1"
                            />
                          </div>
                          <button
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
                    onClick={() => setShowModalEditar(false)}
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
