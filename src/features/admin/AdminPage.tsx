'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import { obtenerSnapshotsCompleto } from '@/lib/snapshotApi'
import { useSnapshotsRefresh } from '@/lib/hooks/useSnapshots'

// Hooks del admin
import { useAdminState, useAdvancedValidation, useEventTracking } from './hooks'

// Componentes del admin
import { AdminHeader, DialogoGenerico, ValidationStatusBar, AnalyticsDashboard } from './components'
import ServiciosBaseSection from './components/ServiciosBaseSection'

// Context
import { AnalyticsProvider } from './contexts'
import PaqueteSection from './components/PaqueteSection'
import ServiciosOpcionalesSection from './components/ServiciosOpcionalesSection'
import DescuentosSection from './components/DescuentosSection'
import SnapshotsTableSection from './components/SnapshotsTableSection'

// Utilities
import { generateSnapshotPDF } from '@/features/pdf-export/utils/generator'

export default function AdminPage() {
  return (
    <AnalyticsProvider>
      <AdminPageContent />
    </AnalyticsProvider>
  )
}

function AdminPageContent() {
  
  // Estado principal del admin
  const {
    cotizacionConfig,
    setCotizacionConfig,
    serviciosBase,
    setServiciosBase,
    gestion,
    setGestion,
    paqueteActual,
    setPaqueteActual,
    serviciosOpcionales,
    setServiciosOpcionales,
    snapshots,
    setSnapshots,
  } = useAdminState()

  // Refresh global
  const refreshSnapshots = useSnapshotsRefresh()

  // ==================== HOOKS DE VALIDACIÓN ====================
  const { 
    validationResult, 
    validarTodo,
    getValidationContext 
  } = useAdvancedValidation()

  // ==================== HOOKS DE TRACKING ====================
  const { 
    trackCotizacionCreated, 
    trackPaqueteCreated,
    trackSnapshotCreated,
    startTracking,
    endTracking 
  } = useEventTracking()

  // ==================== ESTADO LOCAL ====================
  
  const [cargandoSnapshots, setCargandoSnapshots] = useState(true)
  const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showDialogoConfirmacion, setShowDialogoConfirmacion] = useState(false)
  const [dialogoConfig, setDialogoConfig] = useState({
    tipo: 'info' as 'info' | 'warning' | 'error' | 'success',
    titulo: '',
    descripcion: '',
    accion: () => {},
  })

  // ==================== EFECTOS ====================

  // Cargar datos al montar
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

    // Cargar configuración desde localStorage
    const configGuardada = localStorage.getItem('configuracionAdministrador')
    if (configGuardada) {
      try {
        const config = JSON.parse(configGuardada)
        if (config.cotizacionConfig) setCotizacionConfig(config.cotizacionConfig)
        if (config.serviciosBase) setServiciosBase(config.serviciosBase)
        if (config.gestion) setGestion(config.gestion)
        if (config.paqueteActual) setPaqueteActual(config.paqueteActual)
        if (config.serviciosOpcionales) setServiciosOpcionales(config.serviciosOpcionales)
      } catch (e) {
        console.error('Error cargando configuración:', e)
      }
    }
  }, [])

  // Detectar cambios
  useEffect(() => {
    setHasChanges(true)
  }, [cotizacionConfig, serviciosBase, paqueteActual, serviciosOpcionales])

  // ==================== HANDLERS ====================

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Validar configuración antes de guardar
      const validationContext = getValidationContext(
        cotizacionConfig,
        [], // No necesitamos los packages para esta validación inicial
        serviciosOpcionales
      )
      
      const validation = await validarTodo(validationContext)
      
      // Si hay errores, mostrar feedback y no guardar
      if (!validation.valido) {
        setDialogoConfig({
          tipo: 'error',
          titulo: 'Errores de Validación',
          descripcion: validation.errores.join('\n'),
          accion: () => setShowDialogoConfirmacion(false),
        })
        setShowDialogoConfirmacion(true)
        return
      }

      const configActual = {
        cotizacionConfig,
        serviciosBase,
        gestion,
        paqueteActual,
        serviciosOpcionales,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem('configuracionAdministrador', JSON.stringify(configActual))
      localStorage.setItem('paquetesSnapshots', JSON.stringify(snapshots))
      
      await refreshSnapshots()
      setHasChanges(false)
      
      setDialogoConfig({
        tipo: 'success',
        titulo: 'Guardado',
        descripcion: 'Configuración y paquetes guardados correctamente',
        accion: () => setShowDialogoConfirmacion(false),
      })
      setShowDialogoConfirmacion(true)
    } catch (error) {
      console.error('Error guardando:', error)
      setDialogoConfig({
        tipo: 'error',
        titulo: 'Error',
        descripcion: 'Error al guardar la configuración',
        accion: () => setShowDialogoConfirmacion(false),
      })
      setShowDialogoConfirmacion(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePdfExport = async () => {
    if (snapshots.length === 0) {
      setDialogoConfig({
        tipo: 'warning',
        titulo: 'Sin Snapshots',
        descripcion: 'No hay paquetes para descargar. Por favor, crea un paquete primero.',
        accion: () => setShowDialogoConfirmacion(false),
      })
      setShowDialogoConfirmacion(true)
      return
    }

    setIsPdfGenerating(true)
    try {
      const ultimoSnapshot = snapshots.at(-1)
      if (ultimoSnapshot) {
        generateSnapshotPDF(ultimoSnapshot)
      }
    } catch (error) {
      console.error('Error generando PDF:', error)
      setDialogoConfig({
        tipo: 'error',
        titulo: 'Error',
        descripcion: 'Error al generar el PDF',
        accion: () => setShowDialogoConfirmacion(false),
      })
      setShowDialogoConfirmacion(true)
    } finally {
      setIsPdfGenerating(false)
    }
  }

  const handleNewQuote = () => {
    // Crear nueva cotización limpia
    setPaqueteActual({
      nombre: '',
      desarrollo: 0,
      descuento: 0,
      activo: true,
      tipo: '',
      descripcion: '',
    })
    setServiciosOpcionales([])
  }

  const handleSettings = () => {
    // Abrir configuración
  }

  // ==================== RENDER ====================

  return (
    <div className="relative overflow-hidden min-h-screen bg-gh-bg text-gh-text">
      {/* Overlay dorado sutil */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-400/5" />
      
      {/* Navigation */}
      <Navigation />

      {/* Admin Header - Sticky */}
      <AdminHeader
        onSave={handleSave}
        onPdfExport={handlePdfExport}
        onNewQuote={handleNewQuote}
        onSettings={handleSettings}
        isSaving={isSaving}
        isPdfGenerating={isPdfGenerating}
        hasChanges={hasChanges}
        quoteName={cotizacionConfig?.numero || 'Nueva Cotización'}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 pt-32">
        {/* Barra de estado de validación */}
        {validationResult && !validationResult.valido && (
          <div className="mb-6">
            <ValidationStatusBar 
              contexto={getValidationContext(
                cotizacionConfig,
                [],
                serviciosOpcionales
              )}
            />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Título */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gh-border pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gh-text mb-2">
                Panel Administrativo
              </h1>
              <p className="text-sm text-gh-text-muted">
                Calculadora de Presupuestos y Gestión de Servicios
              </p>
            </div>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gh-btn-secondary text-gh-text rounded-lg hover:bg-gh-bg transition-all flex items-center gap-2 font-semibold border border-gh-border backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-gh-border focus-visible:ring-offset-2 focus-visible:ring-offset-gh-bg-absolute"
              >
                <FaArrowLeft /> Volver
              </motion.button>
            </Link>
          </div>

          {/* Contenido Principal */}
          <div className="space-y-8">
            {/* Servicios Base */}
            <ServiciosBaseSection
              serviciosBase={serviciosBase}
              setServiciosBase={setServiciosBase}
            />

            {/* Paquete */}
            <PaqueteSection
              paqueteActual={paqueteActual}
              setPaqueteActual={setPaqueteActual}
            />

            {/* Servicios Opcionales */}
            <ServiciosOpcionalesSection
              serviciosOpcionales={serviciosOpcionales}
              setServiciosOpcionales={setServiciosOpcionales}
              snapshots={snapshots}
              setSnapshots={setSnapshots}
              serviciosBase={serviciosBase}
              paqueteActual={paqueteActual}
              gestion={gestion}
              todoEsValido={true}
              refreshSnapshots={refreshSnapshots}
            />

            {/* Descuentos */}
            <DescuentosSection />

            {/* Snapshots Table */}
            <SnapshotsTableSection
              snapshots={snapshots}
              setSnapshots={setSnapshots}
              cargandoSnapshots={cargandoSnapshots}
              errorSnapshots={errorSnapshots}
              refreshSnapshots={refreshSnapshots}
            />

            {/* Analytics Dashboard (Phase 13) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gh-bg-secondary rounded-2xl border border-gh-border p-6"
            >
              <AnalyticsDashboard />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Diálogo Genérico */}
      <DialogoGenerico
        isOpen={showDialogoConfirmacion}
        onClose={() => setShowDialogoConfirmacion(false)}
        title={dialogoConfig.titulo}
        description={dialogoConfig.descripcion}
        type={dialogoConfig.tipo}
        size="md"
        footer={
          <button
            onClick={dialogoConfig.accion}
            className="px-4 py-2 bg-gh-accent-blue hover:bg-gh-accent-blue/90 text-white rounded-lg transition-all"
          >
            Aceptar
          </button>
        }
      >
        <p className="text-gh-text-secondary">{dialogoConfig.descripcion}</p>
      </DialogoGenerico>
    </div>
  )
}


