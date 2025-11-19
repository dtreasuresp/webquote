'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaDownload, FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { obtenerSnapshotsCompleto } from '@/lib/snapshotApi'
import { useSnapshotsRefresh } from '@/lib/hooks/useSnapshots'
import type { ServicioBase, GestionConfig, Package, Servicio, PackageSnapshot } from '@/lib/types'

import ServiciosBaseSection from './components/ServiciosBaseSection'
import PaqueteSection from './components/PaqueteSection'
import ServiciosOpcionalesSection from './components/ServiciosOpcionalesSection'
import DescuentosSection from './components/DescuentosSection'
import SnapshotsTableSection from './components/SnapshotsTableSection'
import { usePdfExport } from './hooks/usePdfExport'
import { generateSnapshotPDF } from '@/features/pdf-export/utils/generator'

export default function AdminPage() {
  // Obtener función de refresh global
  const refreshSnapshots = useSnapshotsRefresh()

  // Estados principales
  const [serviciosBase, setServiciosBase] = useState<ServicioBase[]>([
    { id: '1', nombre: 'Hosting', precio: 28, mesesGratis: 3, mesesPago: 9 },
    { id: '2', nombre: 'Mailbox', precio: 4, mesesGratis: 3, mesesPago: 9 },
    { id: '3', nombre: 'Dominio', precio: 18, mesesGratis: 3, mesesPago: 9 },
  ])

  const [gestion, setGestion] = useState<GestionConfig>({
    precio: 0,
    mesesGratis: 0,
    mesesPago: 12,
  })

  const [paqueteActual, setPaqueteActual] = useState<Package>({
    nombre: '',
    desarrollo: 0,
    descuento: 0,
    activo: true,
    tipo: '',
    descripcion: '',
  })

  const [serviciosOpcionales, setServiciosOpcionales] = useState<Servicio[]>([])
  const [snapshots, setSnapshots] = useState<PackageSnapshot[]>([])
  const [cargandoSnapshots, setCargandoSnapshots] = useState(true)
  const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)

  // Cargar snapshots desde la API al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoSnapshots(true)
        setErrorSnapshots(null)
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
        const fusion: Servicio[] = (config.serviciosOpcionales || []).map((s: any) => ({
          id: s.id || `${Date.now()}-${Math.random()}`,
          nombre: s.nombre,
          precio: s.precio,
          mesesGratis: s.mesesGratis,
          mesesPago: s.mesesPago,
        }))
        setServiciosOpcionales(fusion)
      } catch (e) {
        console.error('Error cargando configuración:', e)
      }
    }
  }, [])

  // Validaciones
  const paqueteEsValido = !!(paqueteActual.nombre && paqueteActual.desarrollo > 0)
  const serviciosBaseValidos = serviciosBase.length > 0 && serviciosBase.every(s => s.precio > 0 && s.nombre)
  const gestionValida = gestion.precio === 0 || (gestion.precio > 0 && gestion.mesesPago > gestion.mesesGratis)
  const todoEsValido = paqueteEsValido && serviciosBaseValidos && gestionValida

  // Funciones de PDF
  const handleDescargarPdf = () => {
    if (snapshots.length === 0) {
      alert('No hay paquetes para descargar. Por favor, crea un paquete primero.')
      return
    }
    const ultimoSnapshot = snapshots.at(-1)
    if (ultimoSnapshot) generateSnapshotPDF(ultimoSnapshot)
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
    localStorage.setItem('paquetesSnapshots', JSON.stringify(snapshots))
    
    console.log('🔄 Refresh global disparado desde botón Guardar')
    await refreshSnapshots()
    
    alert('✅ Configuración y paquetes guardados correctamente')
  }

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-secondary via-secondary-light to-secondary-dark">
      {/* Overlay dorado sutil */}
      {/* Overlay dorado sutil */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-400/5" />
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
            {/* Sección 1: Servicios Base */}
            <ServiciosBaseSection
              serviciosBase={serviciosBase}
              setServiciosBase={setServiciosBase}
            />

            {/* Sección 2: Paquete */}
            <PaqueteSection
              paqueteActual={paqueteActual}
              setPaqueteActual={setPaqueteActual}
            />

            {/* Sección 3: Servicios Opcionales */}
            <ServiciosOpcionalesSection
              serviciosOpcionales={serviciosOpcionales}
              setServiciosOpcionales={setServiciosOpcionales}
              snapshots={snapshots}
              setSnapshots={setSnapshots}
              serviciosBase={serviciosBase}
              paqueteActual={paqueteActual}
              gestion={gestion}
              todoEsValido={todoEsValido}
              refreshSnapshots={refreshSnapshots}
            />

            {/* Sección 4: Descuentos */}
            <DescuentosSection />

            {/* Sección 5: Snapshots */}
            <SnapshotsTableSection
              snapshots={snapshots}
              setSnapshots={setSnapshots}
              cargandoSnapshots={cargandoSnapshots}
              errorSnapshots={errorSnapshots}
              refreshSnapshots={refreshSnapshots}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
