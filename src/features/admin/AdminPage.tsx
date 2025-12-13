'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import { obtenerSnapshotsCompleto } from '@/lib/snapshotApi'
import { useSnapshotsRefresh } from '@/features/admin/hooks/useSnapshots'

// Sistema de caché
import { useQuotationCache } from '@/hooks'
import { SyncStatusIndicator } from '@/features/admin/components/SyncStatusIndicator'
import type { ConflictInfo, ConflictResolution } from '@/lib/cache/types'
import { AlertTriangle, Cloud, Monitor, GitBranch } from 'lucide-react'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 
    trackCotizacionCreated, 
    trackPaqueteCreated,
    trackSnapshotCreated,
    startTracking,
    endTracking 
  } = useEventTracking()

  // ==================== SISTEMA DE CACHÉ ====================
  
  // Callback para manejar conflictos
  const handleConflict = useCallback((conflict: ConflictInfo) => {
    setShowConflictModal(true)
  }, [])

  // Callback cuando otra pestaña actualiza
  const handleRemoteUpdate = useCallback(() => {
    setDialogoConfig({
      tipo: 'info',
      titulo: 'Actualización Remota',
      descripcion: 'Los datos han sido actualizados desde otra pestaña.',
      accion: () => setShowDialogoConfirmacion(false),
    })
    setShowDialogoConfirmacion(true)
  }, [])

  // Hook principal de caché
  const {
    quotation: cachedQuotation,
    snapshots: cachedSnapshots,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading: isCacheLoading,
    isDirty: isCacheDirty,
    syncStatus,
    isOnline,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: cacheError,
    pendingConflict,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateQuotation: updateCachedQuotation,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    saveToServer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refreshFromServer,
    resolveConflict,
  } = useQuotationCache({
    quotationId: cotizacionConfig?.id || null,
    enabled: !!cotizacionConfig?.id,
    autoSaveInterval: 5000, // 5 segundos
    onConflict: handleConflict,
    onRemoteUpdate: handleRemoteUpdate,
  })

  // ==================== ESTADO LOCAL ====================
  
  const [cargandoSnapshots, setCargandoSnapshots] = useState(true)
  const [errorSnapshots, setErrorSnapshots] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showDialogoConfirmacion, setShowDialogoConfirmacion] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)
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

    // Cargar configuración desde la BD (API) - solo si no hay caché
    const cargarConfiguracionBD = async () => {
      // Si ya tenemos datos del caché, usarlos
      if (cachedQuotation) {
        setCotizacionConfig(cachedQuotation)
        if (cachedQuotation.serviciosBaseTemplate) {
          setServiciosBase(cachedQuotation.serviciosBaseTemplate)
        }
        if (cachedQuotation.serviciosOpcionalesTemplate) {
          // Mapear OtroServicio[] a Servicio[] asegurando que id exista
          const serviciosConId = cachedQuotation.serviciosOpcionalesTemplate.map((s, idx) => ({
            ...s,
            id: s.id || `opcional-${idx}`
          }))
          setServiciosOpcionales(serviciosConId)
        }
        return
      }

      try {
        const response = await fetch('/api/quotation-config')
        if (response.ok) {
          const config = await response.json()
          if (config) {
            setCotizacionConfig(config)
            // Cargar templates desde la configuración de BD
            if (config.serviciosBaseTemplate) {
              setServiciosBase(config.serviciosBaseTemplate)
            }
            if (config.serviciosOpcionalesTemplate) {
              setServiciosOpcionales(config.serviciosOpcionalesTemplate)
            }
            // Cargar paquete si está en editorState
            if (config.editorState) {
              const editorState = config.editorState as { paqueteActual?: typeof paqueteActual }
              if (editorState.paqueteActual) setPaqueteActual(editorState.paqueteActual)
            }
          }
        }
      } catch (error) {
        console.error('Error cargando configuración desde BD:', error)
      }
    }

    cargarDatos()
    cargarConfiguracionBD()
  }, [cachedQuotation])

  // Sincronizar snapshots desde caché
  useEffect(() => {
    if (cachedSnapshots && cachedSnapshots.length > 0) {
      setSnapshots(cachedSnapshots)
    }
  }, [cachedSnapshots, setSnapshots])

  // Detectar cambios - combinar con estado del caché
  useEffect(() => {
    setHasChanges(true)
  }, [cotizacionConfig, serviciosBase, paqueteActual, serviciosOpcionales])

  // Mostrar modal de conflicto cuando hay uno pendiente
  useEffect(() => {
    if (pendingConflict) {
      setShowConflictModal(true)
    }
  }, [pendingConflict])

  // Handler para resolver conflictos
  const handleResolveConflict = async (resolution: ConflictResolution) => {
    setShowConflictModal(false)
    await resolveConflict(resolution)
    
    if (resolution !== 'cancel') {
      // Determinar mensaje según la resolución
      const getResolutionMessage = (res: ConflictResolution): string => {
        switch (res) {
          case 'keep-local':
            return 'Se mantuvieron tus cambios locales.'
          case 'keep-server':
            return 'Se cargaron los datos del servidor.'
          case 'merge':
            return 'Los cambios fueron fusionados.'
          default:
            return 'Conflicto resuelto.'
        }
      }
      
      setDialogoConfig({
        tipo: 'success',
        titulo: 'Conflicto Resuelto',
        descripcion: getResolutionMessage(resolution),
        accion: () => setShowDialogoConfirmacion(false),
      })
      setShowDialogoConfirmacion(true)
    }
  }

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

      // Preparar datos para guardar en BD
      const configParaBD = {
        ...cotizacionConfig,
        serviciosBaseTemplate: serviciosBase,
        serviciosOpcionalesTemplate: serviciosOpcionales,
        editorState: {
          paqueteActual,
          timestamp: new Date().toISOString(),
        },
      }

      // Guardar en BD via API
      const url = cotizacionConfig?.id 
        ? `/api/quotation-config/${cotizacionConfig.id}` 
        : '/api/quotation-config'
      const method = cotizacionConfig?.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configParaBD),
      })

      if (!response.ok) {
        throw new Error('Error al guardar en la base de datos')
      }

      const configGuardada = await response.json()
      setCotizacionConfig(configGuardada)
      
      await refreshSnapshots()
      setHasChanges(false)
      
      setDialogoConfig({
        tipo: 'success',
        titulo: 'Guardado',
        descripcion: 'Configuración y paquetes guardados correctamente en la base de datos',
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
        hasChanges={hasChanges || isCacheDirty}
        quoteName={cotizacionConfig?.numero || 'Nueva Cotización'}
      />

      {/* Indicador de Estado de Sincronización - Fixed bottom right */}
      <div className="fixed bottom-4 right-4 z-40">
        <SyncStatusIndicator
          status={syncStatus}
          isOnline={isOnline}
          isDirty={isCacheDirty}
          isLoading={isCacheLoading}
          showText={true}
          size="md"
        />
      </div>

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
                <ArrowLeft /> Volver
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

      {/* Modal de Conflictos - Usando DialogoGenerico directamente */}
      <DialogoGenerico
        isOpen={showConflictModal && !!pendingConflict}
        onClose={() => setShowConflictModal(false)}
        title="Conflicto de sincronización"
        description="Los datos han sido modificados en otra sesión"
        icon={AlertTriangle}
        variant="premium"
        type="warning"
        size="md"
        closeOnEscape={true}
        closeOnBackdropClick={false}
        footer={
          <button
            onClick={() => handleResolveConflict('cancel')}
            className="px-4 py-2 text-sm text-gh-text-secondary hover:text-gh-text transition-colors"
          >
            Cancelar y decidir después
          </button>
        }
      >
        {pendingConflict && (
          <div className="space-y-4">
            {/* Versiones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gh-accent-blue/10 rounded-lg border border-gh-accent-blue/30">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="w-4 h-4 text-gh-accent-blue" />
                  <span className="text-sm font-medium text-gh-accent-blue">Tu versión local</span>
                </div>
                <p className="text-xs text-gh-accent-blue/80">Versión {pendingConflict.localVersion}</p>
                <p className="text-xs text-gh-accent-blue/60 mt-1">
                  Editada: {new Date(pendingConflict.localUpdatedAt).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Versión del servidor</span>
                </div>
                <p className="text-xs text-purple-400/80">Versión {pendingConflict.serverVersion}</p>
                <p className="text-xs text-purple-400/60 mt-1">
                  Guardada: {new Date(pendingConflict.serverUpdatedAt).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            {/* Campos en conflicto */}
            {pendingConflict.conflictingFields.length > 0 && (
              <div className="p-3 bg-gh-bg-tertiary rounded-lg">
                <p className="text-sm font-medium text-gh-text mb-2">Campos modificados:</p>
                <ul className="text-sm text-gh-text-secondary space-y-1">
                  {pendingConflict.conflictingFields.map(field => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gh-accent-orange rounded-full" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opciones de resolución */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gh-text">¿Cómo deseas resolver el conflicto?</p>
              
              <button
                onClick={() => handleResolveConflict('keep-local')}
                className="w-full p-3 text-left border border-gh-border rounded-lg hover:border-gh-accent-blue hover:bg-gh-accent-blue/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gh-text-secondary group-hover:text-gh-accent-blue" />
                  <div>
                    <p className="font-medium text-gh-text group-hover:text-gh-accent-blue">Mantener mis cambios</p>
                    <p className="text-xs text-gh-text-secondary">Sobrescribir la versión del servidor con tus cambios locales</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleResolveConflict('keep-server')}
                className="w-full p-3 text-left border border-gh-border rounded-lg hover:border-purple-400 hover:bg-purple-500/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-gh-text-secondary group-hover:text-purple-400" />
                  <div>
                    <p className="font-medium text-gh-text group-hover:text-purple-400">Usar versión del servidor</p>
                    <p className="text-xs text-gh-text-secondary">Descartar tus cambios y usar la versión más reciente</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleResolveConflict('merge')}
                className="w-full p-3 text-left border border-gh-border rounded-lg hover:border-gh-accent-green hover:bg-gh-accent-green/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-5 h-5 text-gh-text-secondary group-hover:text-gh-accent-green" />
                  <div>
                    <p className="font-medium text-gh-text group-hover:text-gh-accent-green">Fusionar cambios</p>
                    <p className="text-xs text-gh-text-secondary">Intentar combinar ambas versiones automáticamente</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </DialogoGenerico>
    </div>
  )
}


