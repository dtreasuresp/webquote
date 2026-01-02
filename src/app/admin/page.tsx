'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Download, ArrowLeft, Edit, X, Check, CreditCard, Save, FileText, Globe, Headphones, Percent, History, Gift, Settings, User, Users, Briefcase, Tags, AlertTriangle, Eye, Book, LineChart, Loader2, BarChart3, Building2, ShoppingCart, Wallet, Package, Monitor, Key, } from 'lucide-react'
import Link from 'next/link'
import { DropdownSelect } from '@/components/ui/DropdownSelect'
import DatePicker from '@/components/ui/DatePicker'
import Navigation from '@/components/layout/Navigation'
import { extractBaseQuotationNumber } from '@/lib/utils/quotationNumber'
// Tipos para nuevas secciones en OfertaTab
import type { PaquetesCaracteristicasData, MetodosPagoData } from '@/features/admin/components/content/oferta'
import { defaultPaquetesCaracteristicas, defaultMetodosPago } from '@/features/admin/components/content/oferta'
// Tipos para presupuestoCronograma
import type { FaseCronograma, PresupuestoCronogramaData, MetodoPagoCuotas } from '@/lib/types'
import { useToast } from '@/components/providers/ToastProvider'
import { obtenerSnapshotsCompleto, crearSnapshot, actualizarSnapshot, eliminarSnapshot } from '@/lib/snapshotApi'
import { useSnapshotsRefresh } from '@/features/admin/hooks/useSnapshots'
import { compararQuotations, validarQuotation } from '@/lib/utils/validation'
import type { ServicioBase, Package, Servicio, OtroServicio, PackageSnapshot, QuotationConfig, UserPreferences, DialogConfig, ConfigDescuentos, TipoDescuento, OpcionPago, DescripcionPaqueteTemplate, MetodoPreferido, FinancialTemplate, CuotasData } from '@/lib/types'
import { calcularPreviewDescuentos, getDefaultConfigDescuentos } from '@/lib/utils/discountCalculator'
import type { TabItem } from '@/components/layout/TabsModal'

// ✅ LAZY LOADING: Componentes pesados se cargan solo cuando se necesitan
const TabsModal = lazy(() => import('@/components/layout/TabsModal'))
const Historial = lazy(() => import('@/features/admin/components/tabs/Historial'))
const CotizacionTimeline = lazy(() => import('@/features/admin/components/CotizacionTimeline'))
const CotizacionTab = lazy(() => import('@/features/admin/components/tabs/CotizacionTab'))
const OfertaTab = lazy(() => import('@/features/admin/components/tabs/OfertaTab'))
const ContenidoTab = lazy(() => import('@/features/admin/components/tabs/ContenidoTab'))
const PreferenciasTab = lazy(() => import('@/features/admin/components/tabs/PreferenciasTab'))
const PaqueteContenidoTab = lazy(() => import('@/features/admin/components/tabs/PaqueteContenidoTab'))
const CrmTab = lazy(() => import('@/features/admin/components/tabs/CrmTab'))
const AnalyticsTab = lazy(() => import('@/features/admin/components/tabs/AnalyticsTab'))
const ModulePlaceholderTab = lazy(() => import('@/features/admin/components/tabs/ModulePlaceholderTab'))
const UnifiedAdminSidebar = lazy(() => import('@/features/admin/components/UnifiedAdminSidebar'))
const FloatingAdminFooter = lazy(() => import('@/features/admin/components/FloatingAdminFooter'))
const AdminBreadcrumbs = lazy(() => import('@/features/admin/components/AdminBreadcrumbs'))
const KPICards = lazy(() => import('@/features/admin/components/KPICards'))
const DialogoGenerico = lazy(() => import('@/features/admin/components/DialogoGenerico'))
const DialogoGenericoDinamico = lazy(() => import('@/features/admin/components/DialogoGenericoDinamico'))
const SyncStatusIndicator = lazy(() => import('@/features/admin/components/SyncStatusIndicator'))
// jsPDF se cargará solo cuando se necesite (en handleDescargarPdf)
const loadJsPDF = () => import('jspdf').then(mod => mod.jsPDF)

// Sistema de Caché y Sincronización
import { useQuotationCache } from '@/hooks/useQuotationCache'
import { useLoadingPhase } from '@/features/admin/hooks/useLoadingPhase'
import { useConnectionRecovery, type DataDifference } from '@/features/admin/hooks/useConnectionRecovery'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useInitialLoad } from '@/hooks/useInitialLoad'
import { useConnectionPolling } from '@/hooks/useConnectionPolling'
import { 
  cacheSnapshots, getCachedSnapshots,
  cacheQuotations, getCachedQuotations,
  cachePreferences, getCachedPreferences,
  cacheConfig, getCachedConfig,
  updateCacheMetadata, hasCachedData
} from '@/lib/cache/localCache'

// Analytics y Tracking
import { AnalyticsProvider } from '@/features/admin/contexts'
import { useEventTracking } from '@/features/admin/hooks'
import { useUserPreferencesStore, useQuotationStore, useServicesStore, useDiscountsStore, usePaymentStore, useSnapshotStore, useValidationStore, useTemplateStore, useModalStore, useCrmStore } from '@/stores'
import { useUIStore } from '@/stores/uiStore'
import { useDataStore } from '@/stores/dataStore'
import { useModalDataStore } from '@/stores/modalDataStore'
import { useQuotationSyncStore } from '@/stores/quotationSyncStore'
import { useSidebarStore, type SidebarSection } from '@/stores/sidebarStore'
import { useQuotationSync } from '@/hooks/useQuotationSync'
const PackageHistoryContent = lazy(() => import('@/features/admin/components/comparisons').then(mod => ({ default: mod.PackageHistoryContent })))
const PackageCompareContent = lazy(() => import('@/features/admin/components/comparisons').then(mod => ({ default: mod.PackageCompareContent })))

// ✅ Componente de loading para Suspense
const ComponentLoader = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-6 h-6 animate-spin text-gh-accent" />
  </div>
)

export default function Administrador() {
  // ==================== AUTENTICACIÓN CLIENT-SIDE ====================
  // ✅ Auth client-side es MÁS RÁPIDO que server-side getServerSession
  // porque no bloquea el rendering inicial
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // Redirect si no está autenticado (cliente hace el redirect, no el servidor)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin')
    } else if (status === 'authenticated' && session?.user.role !== 'ADMIN' && session?.user.role !== 'SUPER_ADMIN') {
      router.push('/sin-cotizacion')
    }
  }, [status, session, router])
  
  // Obtener función de refresh global
  const refreshSnapshots = useSnapshotsRefresh()
  
  // Hook para notificaciones toast
  const toast = useToast()

  // ==================== SINCRONIZACIÓN GLOBAL DE COTIZACIONES ====================
  // Hook para emitir eventos de sincronización cuando se guardan cotizaciones
  const emitQuotationSync = useQuotationSync()

  // ==================== SISTEMA DE CACHÉ Y SINCRONIZACIÓN ====================
  // Estado para el ID de cotización actual (se establece al seleccionar/crear cotización)
  // 🟢 PHASE 4: quotationId moved to store selector
  const quotationId = useQuotationStore((s) => s.quotationId)
  
  // 🟢 PHASE 1.2: Selectores del quotationStore (Integración gradual)
  // Estos mantienen sincronización con useState sin reemplazarlos aún
  const storeQuotationId = useQuotationStore((s) => s.quotationId)
  const storeConfig = useQuotationStore((s) => s.config)
  const storeCurrent = useQuotationStore((s) => s.current)
  const storeIsLoading = useQuotationStore((s) => s.isLoading)
  const storeErrors = useQuotationStore((s) => s.errors)
  const storeReadOnly = useQuotationStore((s) => s.readOnly)
  const storeIsDirty = useQuotationStore((s) => s.isDirty)
  const storeHasShownAlert = useQuotationStore((s) => s.hasShownAlert)
  const { loadQuotation, updateQuotation, saveQuotation, resetQuotation, setReadOnly: setStoreReadOnly, setHasShownAlert: setStoreHasShownAlert, setValidationErrors: setStoreValidationErrors } = useQuotationStore()
  
  // 🟢 PHASE 1.2: Selectores del servicesStore (Integración gradual)
  const storeBaseServices = useServicesStore((s) => s.baseServices)
  const storeNewBaseService = useServicesStore((s) => s.newBaseService)
  const storeEditingBaseId = useServicesStore((s) => s.editingBaseId)
  const storeEditingBase = useServicesStore((s) => s.editingBase)
  const storeNewService = useServicesStore((s) => s.newService)
  const storeEditingId = useServicesStore((s) => s.editingId)
  const storeEditing = useServicesStore((s) => s.editing)
  const storeOptionalServices = useServicesStore((s) => s.optionalServices)
  const storeServicesIsLoading = useServicesStore((s) => s.isLoading)
  const storeServicesErrors = useServicesStore((s) => s.errors)
  const { loadBaseServices, addBaseService, updateBaseService, deleteBaseService, startEditingBase, cancelEditingBase, setNewBaseService, loadOptionalServices, addOptionalService, updateOptionalService, deleteOptionalService, startEditing, cancelEditing, setNewService, setBaseServices, setOptionalServices } = useServicesStore()
  
  // 🟢 PHASE 1.2: Selectores del discountsStore (Integración gradual)
  const storeDiscountsConfig = useDiscountsStore((s) => s.config)
  const storeDiscountsLoading = useDiscountsStore((s) => s.isLoading)
  const storeDiscountsErrors = useDiscountsStore((s) => s.errors)
  const storeExpandedGroups = useDiscountsStore((s) => s.expandedGroups)
  const { loadConfig: loadDiscountsConfig, updateConfig: updateDiscountsConfig, saveConfig: saveDiscountsConfig, setConfig: setDiscountsConfig, toggleExpanded: toggleExpandedDiscounts, resetDiscounts } = useDiscountsStore()
  
  // 🟢 PHASE 1.2: Selectores del paymentStore (Integración gradual)
  const storeCurrentPackage = usePaymentStore((s) => s.currentPackage)
  const storePaymentOptions = usePaymentStore((s) => s.paymentOptions)
  const storePreferredMethod = usePaymentStore((s) => s.preferredMethod)
  const storePaymentNotes = usePaymentStore((s) => s.notes)
  const storePreferredMethods = usePaymentStore((s) => s.preferredMethods)
  const storePaymentLoading = usePaymentStore((s) => s.isLoading)
  const storePaymentErrors = usePaymentStore((s) => s.errors)
  const { setCurrentPackage: setStoreCurrentPackage, setPaymentOptions: setStorePaymentOptions, setPreferredMethod: setStorePreferredMethod, setPreferredMethods: setStorePreferredMethods, updateNotes: updateStoreNotes, loadPaymentMethods, savePaymentPreferences } = usePaymentStore()
  
  // 🟢 PHASE 2.1: Selectores del snapshotStore (Integración gradual)
  const storeSnapshots = useSnapshotStore((s) => s.snapshots)
  const storeSnapshotActual = useSnapshotStore((s) => s.snapshotActual)
  const storeSnapshotSeleccionado = useSnapshotStore((s) => s.snapshotSeleccionado)
  const storeEditandoSnapshotId = useSnapshotStore((s) => s.editandoSnapshotId)
  const storeNuevoSnapshot = useSnapshotStore((s) => s.nuevoSnapshot)
  const storeComparando = useSnapshotStore((s) => s.comparando)
  const storeResultadoComparacion = useSnapshotStore((s) => s.resultadoComparacion)
  const storeSnapshotsHistoria = useSnapshotStore((s) => s.snapshotsHistoria)
  const storeSnapshotLoading = useSnapshotStore((s) => s.isLoading)
  const storeSnapshotErrors = useSnapshotStore((s) => s.errors)
  const isCompact = useSidebarStore((s) => s.isCompact)
  const { loadSnapshots: loadSnapshotsStore, createSnapshot, updateSnapshot, deleteSnapshot, compareSnapshots, selectSnapshot, setSnapshotActual, startEditing: startEditingSnapshot, cancelEditing: cancelEditingSnapshot, setNewSnapshot, startComparison, resetSnapshots, setSnapshots, setSnapshotEditando } = useSnapshotStore()
  
  // 🟢 PHASE 2.2: Selectores del validationStore (Integración gradual)
  const storeTabValidation = useValidationStore((s) => s.tabValidation)
  const storeCurrentTab = useValidationStore((s) => s.currentTab)
  const storeIsValidating = useValidationStore((s) => s.isValidating)
  const storeValidationErrors = useValidationStore((s) => s.errors)
  const storeQuotationFieldErrors = useValidationStore((s) => s.quotationFieldErrors)
  const { validateTab, setTabValid, clearTabValidation, clearAllValidations, setCurrentTab: setStoreCurrentTab, setQuotationFieldErrors: setStoreQuotationFieldErrors, clearQuotationFieldErrors: clearStoreQuotationFieldErrors } = useValidationStore()
  
  // 🟢 PHASE 2.3: Selectores del templateStore (Integración gradual)
  const storeDescriptionTemplates = useTemplateStore((s) => s.descriptionTemplates)
  const storeFinancialTemplates = useTemplateStore((s) => s.financialTemplates)
  const storeSelectedDescriptionTemplate = useTemplateStore((s) => s.selectedDescriptionTemplate)
  const storeSelectedFinancialTemplate = useTemplateStore((s) => s.selectedFinancialTemplate)
  const storeTemplateLoading = useTemplateStore((s) => s.isLoading)
  
  // 🟢 SIDEBAR STORE: Estado de la sidebar unificada
  const activeSidebarSection = useSidebarStore((s) => s.activeSection)
  const setActiveSidebarSection = useSidebarStore((s) => s.setActiveSection)
  const storeTemplateErrors = useTemplateStore((s) => s.errors)
  const { loadDescriptionTemplates, createDescriptionTemplate, updateDescriptionTemplate, deleteDescriptionTemplate, loadFinancialTemplates, createFinancialTemplate, updateFinancialTemplate, deleteFinancialTemplate, selectDescriptionTemplate, selectFinancialTemplate, setDescriptionTemplates: setStoreDescriptionTemplates, setFinancialTemplates: setStoreFinancialTemplates } = useTemplateStore()
  
  // PHASE 3.1: modalStore integration
  const storeModals = useModalStore((s) => s.modals)
  const storeActiveModalId = useModalStore((s) => s.activeModalId)
  const storeIsAnyModalOpen = useModalStore((s) => Object.keys(s.modals).length > 0)
  const { openModal, closeModal, closeAllModals, setActiveModal, updateModalConfig, setModalLoading, setModalError, resetModals } = useModalStore()
  
  // Detectar estado de conexión
  const { isOnline, wasOffline } = useOfflineStatus()
  
  // Hook para caché local con sincronización entre pestañas
  const {
    syncStatus,
    isDirty: hasUnsavedChanges,
    pendingConflict: conflictInfo,
    isOnline: cacheIsOnline,
    isLoading,
    resolveConflict,
    saveToServer: forceSync,
    quotation: cachedQuotation,
    refreshFromServer
  } = useQuotationCache({
    quotationId,
    enabled: !!quotationId,
    autoSaveInterval: 5000
  })

  // Detectar recuperación de conexión y diferencias
  const connectionRecovery = useConnectionRecovery({
    isOnline,
    wasOffline,
    quotationId,
    enabled: !!quotationId,
    onRecovery: (state) => {
      if (state.wasOfflineNow && state.hasDifferences) {
        // Se encontraron diferencias, mostrar modal
        setShowConnectionRecoveryDialog(true)
      } else if (state.wasOfflineNow && !state.hasDifferences) {
        // Sin diferencias, mostrar toast y sincronizar
        toast.success('✅ Conexión restablecida, datos sincronizados')
        refreshFromServer()
      }
    }
  })

  // Hook para verificación periódica de conexión con intervalo configurable
  // El intervalo inicial es 30 segundos, se actualiza cuando se cargan las preferencias
  const connectionPolling = useConnectionPolling({
    interval: 30000, // 30 segundos por defecto, se actualiza con useEffect
    enabled: true,
    onReconnect: () => {
      console.log('🔄 Conexión restablecida')
    },
    onDisconnect: () => {
      console.log('⚠️ Conexión perdida - Trabajando en modo offline')
    },
    onCheck: (connected) => {
      console.log(`🔍 Verificación de conexión: ${connected ? 'Online' : 'Offline'}`)
    }
  })

  // ==================== SISTEMA DE CARGA INICIAL UNIFICADO ====================
  // Funciones de carga extraídas para uso con useInitialLoad
  // AHORA CON SOPORTE DE CACHÉ LOCAL PARA MODO OFFLINE
  
  const loadSnapshotsCallback = async () => {
    try {
      console.log('📦 [loadSnapshotsCallback] Cargando snapshots desde BD...')
      const snapshotsDelServidor = await obtenerSnapshotsCompleto()
      console.log('📦 [loadSnapshotsCallback] Snapshots cargados:', snapshotsDelServidor.length)
      setSnapshots(snapshotsDelServidor)
      // ✅ Guardar en cache local para modo offline
      cacheSnapshots(snapshotsDelServidor)
      console.log('💾 [loadSnapshotsCallback] Snapshots guardados en cache local')
    } catch (error) {
      console.error('Error cargando snapshots:', error)
      // ✅ Intentar cargar desde cache local si BD falla
      const cachedData = getCachedSnapshots<typeof snapshots>()
      if (cachedData) {
        console.log('📦 [loadSnapshotsCallback] Usando snapshots desde cache local')
        setSnapshots(cachedData)
        return // No relanzar error si tenemos cache
      }
      throw error
    }
  }

  const loadQuotationsCallback = async () => {
    try {
      console.log('📋 [loadQuotationsCallback] Cargando quotations desde BD...')
      const response = await fetch('/api/quotations')
      const data = await response.json()
      if (data.success) {
        console.log('📋 [loadQuotationsCallback] Quotations cargadas:', data.data?.length || 0)
        setQuotations(data.data || [])
        // ✅ Guardar en cache local para modo offline
        cacheQuotations(data.data || [])
        console.log('💾 [loadQuotationsCallback] Quotations guardados en cache local')
      }
    } catch (error) {
      console.error('Error cargando quotations:', error)
      // ✅ Intentar cargar desde cache local si BD falla
      const cachedData = getCachedQuotations<typeof quotations>()
      if (cachedData) {
        console.log('📋 [loadQuotationsCallback] Usando quotations desde cache local')
        setQuotations(cachedData)
        return
      }
      throw error
    }
  }

  const loadPreferencesCallback = async () => {
    try {
      console.log('⚙️ [loadPreferencesCallback] Delegando carga de preferencias al store...')
      await useUserPreferencesStore.getState().loadPreferences()
      console.log('⚙️ [loadPreferencesCallback] Preferencias cargadas en store')
    } catch (error) {
      console.error('Error cargando preferences via store:', error)
      // Intentar cargar desde cache local como fallback
      const cachedData = getCachedPreferences<any>()
      if (cachedData) {
        console.log('⚙️ [loadPreferencesCallback] Usando preferencias desde cache local')
        useUserPreferencesStore.setState(cachedData as any)
        return
      }
      throw error
    }
  }

  const loadConfigCallback = async () => {
    try {
      const response = await fetch('/api/quotation-config')
      if (response.ok) {
        const config = await response.json()
        if (config) {
          console.log('📋 [loadConfigCallback] Configuración cargada:', config.id, config.numero)
          
          // ✅ CARGAR LA COTIZACIÓN ACTIVA (esto es lo que faltaba!)
          setCotizacionConfig(config)
          
          // ✅ Guardar en cache local para modo offline
          cacheConfig(config)
          console.log('💾 [loadConfigCallback] Config guardado en cache local')
          
          // Cargar templates desde la configuración de BD
          if (config.serviciosBaseTemplate) {
            setServiciosBase(config.serviciosBaseTemplate)
          }
          if (config.serviciosOpcionalesTemplate) {
            setServiciosOpcionales(config.serviciosOpcionalesTemplate)
          }
          // Cargar templates de descripción de paquete
          if (config.descripcionesPaqueteTemplates) {
            setDescripcionesTemplate(config.descripcionesPaqueteTemplates)
          }
          // Cargar opciones de pago y configuración financiera
          if (config.opcionesPagoTemplate) {
            setOpcionesPagoActual(config.opcionesPagoTemplate)
          }
          if (config.configDescuentosTemplate) {
            setConfigDescuentosActual(config.configDescuentosTemplate)
          }
          if (config.metodoPagoPreferido) {
            setMetodoPagoPreferido(config.metodoPagoPreferido)
          }
          if (config.notasPago) {
            setNotasPago(config.notasPago)
          }
          if (config.metodosPreferidos) {
            setMetodosPreferidos(config.metodosPreferidos)
          }
          // Cargar paquete si está en editorState
          if (config.editorState) {
            const editorState = config.editorState as { 
              paqueteActual?: typeof paqueteActual 
            }
            if (editorState.paqueteActual) setPaqueteActual(editorState.paqueteActual)
          }
        }
      } else if (response.status === 404) {
        console.log('📋 [loadConfigCallback] No hay cotización en BD, se usará estado inicial')
      }
    } catch (error) {
      console.error('Error cargando configuración desde BD:', error)
      // ✅ Intentar cargar desde cache local si BD falla
      const cachedConfig = getCachedConfig<QuotationConfig>()
      if (cachedConfig) {
        console.log('📋 [loadConfigCallback] Usando config desde cache local')
        setCotizacionConfig(cachedConfig)
        // También restaurar templates desde cache
        if (cachedConfig.serviciosBaseTemplate) {
          setServiciosBase(cachedConfig.serviciosBaseTemplate as ServicioBase[])
        }
        if (cachedConfig.serviciosOpcionalesTemplate) {
          setServiciosOpcionales(cachedConfig.serviciosOpcionalesTemplate as Servicio[])
        }
        return
      }
      throw error
    }
  }

  // Hook de carga inicial - orquesta todo el flujo de carga
  const initialLoad = useInitialLoad({
    welcomeDelay: 600,
    loadSnapshots: loadSnapshotsCallback,
    loadQuotations: loadQuotationsCallback,
    loadPreferences: loadPreferencesCallback,
    loadConfig: loadConfigCallback,
    hasCachedData: hasCachedData, // ✅ Función para verificar si hay cache local
    onComplete: (isConnected) => {
      if (isConnected) {
        console.log('✅ Carga inicial completada - Conectado a BD')
        // ✅ Actualizar metadatos de sincronización exitosa
        updateCacheMetadata(true)
      } else {
        console.log('📦 Carga inicial completada - Modo offline')
        // Los datos se cargaron desde cache local
        if (hasCachedData()) {
          toast.info('📦 Trabajando con datos en cache local (modo offline)')
        }
      }
      // 🟢 PHASE 4.2: cargandoSnapshots state now from store - no need to set it
    },
    onError: (error) => {
      console.error('❌ Error en carga inicial:', error)
      // ✅ Actualizar metadatos de sincronización fallida
      updateCacheMetadata(false)
      // 🟢 PHASE 4.2: setErrorSnapshots now managed by store
      // setErrorSnapshots(error)
    }
  })

  // Hook para mapear estado de carga a fase visual
  // Usa el nuevo sistema unificado de fases con soporte para polling
  const { phase: loadingPhase, phaseText, isActiveLoading, setPhase } = useLoadingPhase({
    initialLoadPhase: initialLoad.phase,
    isLoading: isLoading || false,
    syncStatus,
    isConnected: initialLoad.isConnected || cacheIsOnline,
    isPollingConnected: connectionPolling.isConnected,
    hasReconnected: connectionPolling.hasReconnected
  })

  // Estado para el dialog de recuperación de conexión
  const [showConnectionRecoveryDialog, setShowConnectionRecoveryDialog] = useState(false)
  const [isResolvingRecovery, setIsResolvingRecovery] = useState(false)

  // Manejar resolución del dialog de recuperación de conexión
  const handleConnectionRecoveryResolve = async (action: 'use-cache' | 'use-server' | 'merge') => {
    setIsResolvingRecovery(true)
    setPhase('syncing-from-db') // Mostrar estado de sincronización
    
    try {
      if (action === 'use-server') {
        // Usar datos del servidor - descartar cambios locales
        await refreshFromServer()
        toast.success('✅ Datos del servidor cargados - Cambios locales descartados')
      } else if (action === 'use-cache') {
        // Mantener datos del caché - sincronizar a servidor
        await forceSync()
        toast.success('✅ Cambios locales guardados en servidor')
      } else if (action === 'merge') {
        // Por ahora merge = cargar del servidor pero sin perder cambios locales importantes
        // TODO: Implementar comparación campo por campo
        setPhase('comparing')
        await refreshFromServer()
        toast.info('ℹ️ Datos del servidor cargados - Revisa tus cambios')
      }
      
      setShowConnectionRecoveryDialog(false)
      setHasPendingLocalChanges(false)
      
      // Limpiar flag de reconexión después de resolver
      connectionPolling.clearReconnectionFlag()
      setPhase('synced')
      
    } catch (error) {
      toast.error('❌ Error al resolver conflicto')
      console.error(error)
      setPhase('error')
    } finally {
      setIsResolvingRecovery(false)
    }
  }

  // ==================== ESTADOS COTIZACIÓN ====================
  // 🟢 PHASE 5.1: cotizacionConfig migrado a storeConfig
  const cotizacionConfig = storeConfig
  const { setConfig: setStoreConfig } = useQuotationStore()
  const setCotizacionConfig = (config: QuotationConfig | null) => {
    setStoreConfig(config as any)
    if (config?.id && quotationId !== config.id) {
      loadQuotation(config.id)
    }
  }

  // 🟢 PHASE 4: quotationId sync - now directly using store selector

  const erroresValidacionCotizacion = storeQuotationFieldErrors
  const setErroresValidacionCotizacion = setStoreQuotationFieldErrors
  const clearErroresValidacionCotizacion = clearStoreQuotationFieldErrors

  // Estados principales
  const serviciosBase = storeBaseServices
  const setServiciosBase = setBaseServices

  const nuevoServicioBase = storeNewBaseService
  const setNuevoServicioBase = setNewBaseService

  const editandoServicioBaseId = storeEditingBaseId
  const setEditandoServicioBaseId = (id: string | null) => id ? null : cancelEditingBase()
  const servicioBaseEditando = storeEditingBase
  const setServicioBaseEditando = (svc: ServicioBase | null) => svc ? startEditingBase(svc) : cancelEditingBase()

  // Definición de Paquetes
  const paqueteActual = storeCurrentPackage
  const setPaqueteActual = setStoreCurrentPackage

  // ==================== ESTADOS FINANCIERO (para OfertaTab) ====================
  const opcionesPagoActual = storePaymentOptions
  const setOpcionesPagoActual = setStorePaymentOptions
  const metodoPagoPreferido = storePreferredMethod
  const setMetodoPagoPreferido = setStorePreferredMethod
  const notasPago = storePaymentNotes
  const setNotasPago = updateStoreNotes
  const metodosPreferidos = storePreferredMethods
  const setMetodosPreferidos = setStorePreferredMethods
  const configDescuentosActual = storeDiscountsConfig
  const setConfigDescuentosActual = setDiscountsConfig

  // Estados legacy eliminados: otrosServicios y servicios (ahora unificados en serviciosOpcionales)
  const nuevoServicio = storeNewService
  const setNuevoServicio = setNewService
  const editandoServicioId = storeEditingId
  const setEditandoServicioId = (id: string | null) => id ? null : cancelEditing()
  const servicioEditando = storeEditing
  const setServicioEditando = (svc: Servicio | null) => svc ? startEditing(svc) : cancelEditing()
  
  // Estado unificado (fase inicial): representación única para servicios opcionales evitando duplicados en snapshot.
  // En esta primera fase se poblará desde ambos arrays legacy (otrosServicios y servicios) al cargar configuración.
  const serviciosOpcionales = storeOptionalServices
  const setServiciosOpcionales = setOptionalServices
  // 🟢 PHASE 4.3: Snapshot migrations from useState to Zustand
  const snapshots = useSnapshotStore((s) => s.snapshots)
  // 🟢 PHASE 5.2: showModalEditar migrated to uiStore
  const showModalEditar = useUIStore((s) => s.showModalEditar)
  const setShowModalEditar = useUIStore((s) => s.setShowModalEditar)
  const activePageTab = useUIStore((s) => s.activePageTab)
  const setActivePageTab = useUIStore((s) => s.setActivePageTab)
  const { trackAdminTabViewed } = useEventTracking()
  const snapshotEditando = useSnapshotStore((s) => s.snapshotSeleccionado)
  // Estado para comparar cambios en el modal (versión original serializada)
  const snapshotOriginalJson = useDataStore((s) => s.snapshotOriginalJson)
  const setSnapshotOriginalJson = useDataStore((s) => s.setSnapshotOriginalJson)
  // Ref para foco inicial en modal
  const nombrePaqueteInputRef = useRef<HTMLInputElement | null>(null)
  // Ref para scroll del contenedor modal
  const modalScrollContainerRef = useRef<HTMLDivElement>(null)
  const descripcionTextareaRef = useRef<HTMLTextAreaElement>(null)
  // 🟢 PHASE 4.2: snapshot loading state moved to store selector
  const cargandoSnapshots = storeSnapshotLoading
  // 🟢 PHASE 4.2: snapshot errors - convert from Record to string for component compatibility
  const errorSnapshots = storeSnapshotErrors ? Object.values(storeSnapshotErrors)[0] || null : null
  
  // ==================== ESTADOS QUOTATIONS Y PREFERENCIAS ====================
  const quotations = useDataStore((s) => s.quotations)
  const setQuotations = useDataStore((s) => s.setQuotations)
  // User preferences are managed by Zustand store - use individual selectors to avoid infinite loop
  const userPreferencesId = useUserPreferencesStore((s) => s.id)
  const prefIntervalo = useUserPreferencesStore((s) => s.intervaloVerificacionConexion)
  const prefUnidad = useUserPreferencesStore((s) => s.unidadIntervaloConexion)
  
  // Estado para controlar si hay cambios locales pendientes (para modal de reconexión)
  const hasPendingLocalChanges = useDataStore((s) => s.hasPendingLocalChanges)
  const setHasPendingLocalChanges = (v: boolean) => useDataStore.getState().setPendingChanges(v)
  
  // Ref para guardar el intervalo inicial (se aplica solo al guardar preferencias)
  const intervaloInicialRef = useRef<number | null>(null)
  
  // Ref para auto-guardado de características y orden de paquetes
  const autoSaveCaracteristicasTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Efecto para guardar el intervalo inicial cuando se cargan preferencias por primera vez
  useEffect(() => {
    if (userPreferencesId && intervaloInicialRef.current === null) {
      const valor = prefIntervalo || 30
      const unidad = prefUnidad || 'segundos'
      const intervaloMs = unidad === 'minutos' ? valor * 60 * 1000 : valor * 1000
      intervaloInicialRef.current = intervaloMs
      // Aplicar el intervalo guardado en BD al cargar
      connectionPolling.setInterval(intervaloMs)
      console.log(`⏱️ Intervalo inicial de polling aplicado: ${intervaloMs}ms`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferencesId]) // Solo cuando cambia el ID (primera carga)

  // Efecto para manejar reconexión con lógica inteligente
  useEffect(() => {
    if (connectionPolling.hasReconnected) {
      console.log('🔄 Conexión restablecida detectada')
      
      // Verificar si hay cambios locales pendientes
      const hayPendientes = hasUnsavedChanges || hasPendingLocalChanges
      
      if (hayPendientes) {
        // Hay cambios locales - mostrar modal de resolución
        console.log('⚠️ Hay cambios locales pendientes - mostrando modal de resolución')
        setShowConnectionRecoveryDialog(true)
      } else {
        // No hay cambios locales - sincronizar automáticamente si está habilitado
        if (useUserPreferencesStore.getState().sincronizarAlRecuperarConexion !== false) {
          console.log('🔄 Sin cambios locales - Sincronizando automáticamente...')
          refreshFromServer().then(() => {
            // Limpiar flag de reconexión después de sincronizar
            connectionPolling.clearReconnectionFlag()
            setPhase('synced')
          })
        } else {
          // No sincronizar automáticamente - solo limpiar flag
          console.log('ℹ️ Sincronización automática deshabilitada')
          connectionPolling.clearReconnectionFlag()
          setPhase('synced')
        }
      }
      
      // Mostrar notificación si está habilitado
      if (useUserPreferencesStore.getState().mostrarNotificacionCacheLocal !== false) {
        toast.success('✅ Conexión a la base de datos restablecida')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionPolling.hasReconnected])
  
  // 🟢 PHASE 4.3: Store synchronization deferred to PHASE 5
  // Batch 3 requires type harmonization between stores and lib/types
  // Recommended approach: Create type adapters or update store types to match lib/types
  // This will be completed in PHASE 5 cleanup
  
  // Estado para la cotización actual (información general)
  // 🟢 PHASE 5.1: cotizacionActual migrado a storeCurrent
  const cotizacionActual = storeCurrent
  const setCotizacionActual = (config: any) => updateQuotation(config)
  
  // ==================== FIN ESTADOS QUOTATIONS ====================
  
  // ==================== NUEVOS ESTADOS FASES 3-6 ====================
  // 🟢 PHASE 5.1: readOnly y alertaMostradaEnSesion migrados a store
  const readOnly = storeReadOnly
  const setReadOnly = setStoreReadOnly
  const alertaMostradaEnSesion = storeHasShownAlert
  const setAlertaMostradaEnSesion = setStoreHasShownAlert
  // ==================== NUEVOS ESTADOS PARA MODAL 3 FILAS ====================
  // 🟢 PHASE 5.2: activeTabFila1-3 migrated to uiStore
  const activeTabFila1 = useUIStore((s) => s.activeTabFila1)
  const setActiveTabFila1 = useUIStore((s) => s.setActiveTabFila1)
  const activeTabFila2 = useUIStore((s) => s.activeTabFila2)
  const setActiveTabFila2 = useUIStore((s) => s.setActiveTabFila2)
  const activeTabFila3 = useUIStore((s) => s.activeTabFila3)
  const setActiveTabFila3 = useUIStore((s) => s.setActiveTabFila3)
  const quotationEnModal = useModalDataStore((s) => s.quotationEnModal)
  const setQuotationEnModal = useModalDataStore((s) => s.setQuotationEnModal)
  const snapshotsModalActual = useModalDataStore((s) => s.snapshotsModalActual)
  const setSnapshotsModalActual = useModalDataStore((s) => s.setSnapshotsModalActual)
  // ==================== ESTADO PARA MODAL HISTORIAL DE PAQUETE ====================
  const showPackageHistoryModal = useUIStore((s) => s.showPackageHistoryModal)
  const packageHistorySnapshot = useUIStore((s) => s.packageHistorySnapshot)
  const closePackageHistoryModal = useUIStore((s) => s.closePackageHistoryModal)
  // ==================== ESTADO PARA COMPARACIÓN INDIVIDUAL DE PAQUETES ====================
  const paqueteParaComparar = useUIStore((s) => s.paqueteParaComparar)
  const setPaqueteParaComparar = useUIStore((s) => s.setPaqueteParaComparar)
  const showPackageCompareModal = useUIStore((s) => s.showPackageCompareModal)
  const paquetesAComparar = useUIStore((s) => s.paquetesAComparar)
  const setPaquetesAComparar = useUIStore((s) => s.setPaquetesAComparar)
  // ==================== FIN NUEVOS ESTADOS ====================

  // ==================== NUEVOS ESTADOS PARA VALIDACIÓN POR TAB ====================
  const estadoValidacionTabs = useUIStore((s) => s.estadoValidacionTabs)
  const setEstadoValidacionTabs = useUIStore((s) => s.setEstadoValidacionTabs)
  
  // Estado para modo edición de descripción del paquete en OfertaTab
  // Cuando está en false, permite navegación libre y guardar cotización
  const modoEdicionPaquete = useUIStore((s) => s.modoEdicionPaquete)
  const setModoEdicionPaquete = useUIStore((s) => s.setModoEdicionPaquete)
  
  // 🟢 PHASE 5.4: descripcionesTemplate migrado a store
  const descripcionesTemplate = storeDescriptionTemplates
  const setDescripcionesTemplate = setStoreDescriptionTemplates
  
  // 🟢 PHASE 5.4: financialTemplates migrado a store
  const financialTemplates = storeFinancialTemplates
  const setFinancialTemplates = setStoreFinancialTemplates
  // ==================== FIN ESTADOS VALIDACIÓN ====================

  // ==================== ESTADOS DERIVADOS PARA CARACTERÍSTICAS Y MÉTODOS DE PAGO ====================
  // Datos de características de paquetes desde contenidoGeneral.presupuestoCronograma
  const paquetesCaracteristicasData: PaquetesCaracteristicasData = useMemo(() => {
    const presupuestoCronograma = cotizacionConfig?.contenidoGeneral?.presupuestoCronograma as {
      titulo?: string
      subtitulo?: string
      presupuesto?: { notaImportante?: string }
      caracteristicasPorPaquete?: { [nombrePaquete: string]: string[] }
      ordenPaquetes?: string[]
    } | undefined
    
    return {
      titulo: presupuestoCronograma?.titulo || defaultPaquetesCaracteristicas.titulo,
      subtitulo: presupuestoCronograma?.subtitulo || defaultPaquetesCaracteristicas.subtitulo,
      notaImportante: presupuestoCronograma?.presupuesto?.notaImportante || defaultPaquetesCaracteristicas.notaImportante,
      caracteristicasPorPaquete: presupuestoCronograma?.caracteristicasPorPaquete || {},
      ordenPaquetes: presupuestoCronograma?.ordenPaquetes || [],
    }
  }, [cotizacionConfig?.contenidoGeneral?.presupuestoCronograma])

  // Datos de métodos de pago desde contenidoGeneral.cuotas.metodosPago
  const metodosPagoOfertaData: MetodosPagoData = useMemo(() => {
    const cuotasData = cotizacionConfig?.contenidoGeneral?.cuotas as {
      metodosPago?: {
        visible?: boolean
        titulo?: string
        subtitulo?: string
        opciones?: Array<{ nombre: string; porcentaje?: number; descripcion: string }>
      }
    } | undefined
    const metodosPago = cuotasData?.metodosPago
    
    return {
      visible: metodosPago?.visible ?? defaultMetodosPago.visible,
      titulo: metodosPago?.titulo || defaultMetodosPago.titulo,
      subtitulo: metodosPago?.subtitulo || defaultMetodosPago.subtitulo,
      opciones: metodosPago?.opciones || defaultMetodosPago.opciones,
    }
  }, [cotizacionConfig?.contenidoGeneral?.cuotas])

  // Handler para actualizar características de paquetes (con auto-save)
  const handlePaquetesCaracteristicasChange = useCallback((data: PaquetesCaracteristicasData) => {
    if (!cotizacionConfig) return
    
    const presupuestoCronogramaActual = (cotizacionConfig.contenidoGeneral?.presupuestoCronograma || {}) as Partial<PresupuestoCronogramaData>
    
    const newPresupuestoCronograma: PresupuestoCronogramaData = {
      titulo: data.titulo || presupuestoCronogramaActual.titulo || 'Presupuesto y Cronograma',
      subtitulo: data.subtitulo || presupuestoCronogramaActual.subtitulo || '',
      presupuesto: {
        visible: presupuestoCronogramaActual.presupuesto?.visible ?? true,
        titulo: presupuestoCronogramaActual.presupuesto?.titulo || 'Presupuesto',
        descripcion: presupuestoCronogramaActual.presupuesto?.descripcion || '',
        rangos: presupuestoCronogramaActual.presupuesto?.rangos || [],
        notaImportante: data.notaImportante || presupuestoCronogramaActual.presupuesto?.notaImportante || '',
      },
      cronograma: {
        visible: presupuestoCronogramaActual.cronograma?.visible ?? true,
        titulo: presupuestoCronogramaActual.cronograma?.titulo || 'Cronograma',
        descripcion: presupuestoCronogramaActual.cronograma?.descripcion || '',
        duracionTotal: presupuestoCronogramaActual.cronograma?.duracionTotal || '',
        fases: presupuestoCronogramaActual.cronograma?.fases || [],
      },
      caracteristicasPorPaquete: data.caracteristicasPorPaquete,
      ordenPaquetes: data.ordenPaquetes,
    }
    
    // Actualizar estado local inmediatamente
    setCotizacionConfig({
      ...cotizacionConfig,
      contenidoGeneral: {
        ...cotizacionConfig.contenidoGeneral,
        presupuestoCronograma: newPresupuestoCronograma,
      },
    } as any)
    
    // Auto-guardar con debounce (800ms)
    if (autoSaveCaracteristicasTimeoutRef.current) {
      clearTimeout(autoSaveCaracteristicasTimeoutRef.current)
    }
    
    autoSaveCaracteristicasTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/quotation-config/${cotizacionConfig.id}/contenido`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seccion: 'presupuesto',
            datos: newPresupuestoCronograma,
            timestamp: new Date().toISOString(),
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Actualizar estado con datos de la BD (silenciosamente)
            useDataStore.getState().updateQuotations((prev: any) => prev.map((q: any) => 
              q.id === cotizacionConfig.id ? result.data : q
            ))
            console.log('✓ Auto-guardado características y orden de paquetes')
          }
        } else {
          console.error('Error en auto-guardado de características:', await response.text())
        }
      } catch (error) {
        console.error('Error en auto-guardado de características:', error)
      }
    }, 800)
  }, [cotizacionConfig])

  // Handler para actualizar métodos de pago (ahora en cuotas)
  const handleMetodosPagoOfertaChange = (data: MetodosPagoData) => {
    if (!cotizacionConfig) return
    
    const cuotasActual = (cotizacionConfig.contenidoGeneral?.cuotas || {}) as Partial<CuotasData>
    
    // Convertir opciones de MetodosPagoData a MetodoPagoCuotas[]
    const opcionesConvertidas: MetodoPagoCuotas[] = data.opciones.map(op => ({
      nombre: op.nombre,
      porcentaje: op.porcentaje,
      descripcion: op.descripcion,
    }))
    
    const newCuotas: CuotasData = {
      titulo: cuotasActual.titulo || 'Opciones de Pago',
      subtitulo: cuotasActual.subtitulo || 'Cuotas y financiamiento disponibles',
      metodosPago: {
        visible: data.visible,
        titulo: data.titulo,
        opciones: opcionesConvertidas,
      },
      presupuesto: cuotasActual.presupuesto || {
        visible: true,
        titulo: 'Rangos de Presupuesto',
        descripcion: '',
        rangos: [],
        notaImportante: '',
      },
    }
    
    setCotizacionConfig({
      ...cotizacionConfig,
      contenidoGeneral: {
        ...cotizacionConfig.contenidoGeneral,
        cuotas: newCuotas,
      },
    } as any)
  }
  // ==================== FIN ESTADOS DERIVADOS ====================

  // ==================== ESTADOS PARA DIÁLOGO GENÉRICO ====================
  const [mostrarDialogo, setMostrarDialogo] = useState(false)
  const [datosDialogo, setDatosDialogo] = useState<DialogConfig | null>(null)
  const [dialogoInputValue, setDialogoInputValue] = useState('')
  // ==================== FIN ESTADOS DIÁLOGO GENÉRICO ====================

  // ==================== ESTADOS PARA FLUJO ELIMINACIÓN COTIZACIÓN ACTIVA ====================
  const [modoSeleccionCotizacion, setModoSeleccionCotizacion] = useState(false)
  const [modalListaCotizacionesPostEliminacion, setModalListaCotizacionesPostEliminacion] = useState(false)
  const [modalTimelinePostEliminacion, setModalTimelinePostEliminacion] = useState(false)
  const [cotizacionSeleccionadaPostEliminacion, setCotizacionSeleccionadaPostEliminacion] = useState<QuotationConfig | null>(null)
  // 🟢 PHASE 5.2: quotationIdPendienteEliminar migrated to uiStore
  const quotationIdPendienteEliminar = useUIStore((s) => s.quotationIdPendienteEliminar)
  const setQuotationIdPendienteEliminar = useUIStore((s) => s.setQuotationIdPendienteEliminar)
  // ==================== FIN ESTADOS ELIMINACIÓN ====================

  // ==================== ESTADO PARA GUARDADO DE COTIZACIÓN ====================
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false)
  // Flag para indicar que el usuario solicitó cancelar el guardado
  const [cancelarGuardadoSolicitado, setCancelarGuardadoSolicitado] = useState(false)
  // ID de la versión creada durante el guardado (para posible rollback)
  // IMPORTANTE: Usamos refs en lugar de state para acceso sincrónico y evitar race conditions
  const idVersionCreadaRef = useRef<string | null>(null)
  // ID de la versión anterior (para restaurar en caso de rollback)
  const idVersionAnteriorRef = useRef<string | null>(null)
  // Mensaje de estado del guardado para la barra inferior
  const [mensajeGuardado, setMensajeGuardado] = useState<string>('')
  // Modal de confirmación de cancelación
  const [showModalConfirmarCancelacion, setShowModalConfirmarCancelacion] = useState(false)
  // Modal de resultado de cancelación
  const [showModalResultadoCancelacion, setShowModalResultadoCancelacion] = useState(false)
  const [resultadoCancelacionExitoso, setResultadoCancelacionExitoso] = useState(false)
  // AbortController para poder cancelar peticiones en curso
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // ==================== MODAL DE PROGRESO DE GUARDADO ====================
  // Modal visual de progreso de guardado
  const [showModalProgresoGuardado, setShowModalProgresoGuardado] = useState(false)
  // Estado del resultado: guardando, exito, cancelado, error
  const [resultadoGuardado, setResultadoGuardado] = useState<'guardando' | 'exito' | 'cancelado' | 'error'>('guardando')
  // Mensaje de resumen final
  const [resumenGuardado, setResumenGuardado] = useState<string>('')
  // Pasos del proceso de guardado con estado real
  const [pasosGuardado, setPasosGuardado] = useState<{
    id: string
    label: string
    estado: 'pendiente' | 'activo' | 'completado' | 'error' | 'cancelado'
    detalle?: string
  }[]>([
    { id: 'validar', label: 'Validando datos', estado: 'pendiente' },
    { id: 'version', label: 'Creando nueva versión', estado: 'pendiente' },
    { id: 'duplicar', label: 'Reasignando paquetes', estado: 'pendiente' },
    { id: 'activar', label: 'Activando versión', estado: 'pendiente' },
    { id: 'finalizar', label: 'Finalizando', estado: 'pendiente' },
  ])
  // Progreso en porcentaje (0-100)
  const progresoGuardado = useMemo(() => {
    const completados = pasosGuardado.filter(p => p.estado === 'completado').length
    const activo = pasosGuardado.find(p => p.estado === 'activo')
    // Cada paso completado = 20%, paso activo = +10% parcial
    return Math.min(100, completados * 20 + (activo ? 10 : 0))
  }, [pasosGuardado])
  // ==================== FIN MODAL PROGRESO GUARDADO ====================
  
  // ==================== FIN ESTADO GUARDADO ====================

  // ==================== FASE 12: ESTADO PARA TRACKING DE CAMBIOS ====================
  // 🟢 PHASE 5.2: quotationEstadoAntes migrated to dataStore
  const quotationEstadoAntes = useDataStore((s) => s.quotationEstadoAntes)
  const setQuotationEstadoAntes = useDataStore((s) => s.setQuotationEstadoAntes)
  // ==================== FIN ESTADOS TRACKING ====================
  
  // 🟢 PHASE 5.4: expandidosDescuentos migrado a store (ahora expandedGroups en discountsStore)
  const expandidosDescuentos = storeExpandedGroups
  const setExpandidosDescuentos = toggleExpandedDiscounts

  // NOTA: La carga de datos ahora se maneja por useInitialLoad hook
  // Se ha eliminado el useEffect manual que cargaba snapshots, quotations, preferences y config

  // Cargar financial templates al montar el componente
  useEffect(() => {
    const fetchFinancialTemplates = async () => {
      try {
        const response = await fetch('/api/financial-templates?userId=admin')
        if (response.ok) {
          const data = await response.json()
          setFinancialTemplates(data)
        }
      } catch (error) {
        console.error('Error cargando financial templates:', error)
      }
    }
    fetchFinancialTemplates()
  }, [])

  // Ajustar altura del textarea de descripción automáticamente
  useEffect(() => {
    if (descripcionTextareaRef.current) {
      descripcionTextareaRef.current.style.height = 'auto';
      descripcionTextareaRef.current.style.height = descripcionTextareaRef.current.scrollHeight + 'px';
    }
  }, [paqueteActual?.descripcion])

  // Ya no necesitamos guardar snapshots en localStorage, se guardan en la API
  // El segundo useEffect que guardaba en localStorage se elimina

  const paqueteEsValido = paqueteActual && paqueteActual.nombre && paqueteActual.desarrollo > 0
  const serviciosBaseValidos = serviciosBase.length > 0 && serviciosBase.every(s => s.precio > 0 && s.nombre)
  // Servicios opcionales (opcionales, no bloquean creación): si existen, cada uno debe sumar 12 meses y tener precio/nombre
  const serviciosOpcionalesValidos = serviciosOpcionales.every(s => s.nombre && s.precio > 0 && (s.mesesGratis + s.mesesPago === 12))
  const todoEsValido = paqueteEsValido && serviciosBaseValidos

  // ==================== FUNCIONES FINANCIAL TEMPLATES ====================

  // Guardar nuevo template financiero
  const handleSaveFinancialTemplate = async (
    data: Omit<FinancialTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<FinancialTemplate> => {
    const response = await fetch('/api/financial-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId: 'admin' }),
    })
    if (!response.ok) {
      throw new Error('Error guardando template financiero')
    }
    return response.json()
  }

  // Actualizar template financiero existente
  const handleUpdateFinancialTemplate = async (
    id: string,
    data: Partial<FinancialTemplate>
  ): Promise<FinancialTemplate> => {
    const response = await fetch(`/api/financial-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Error actualizando template financiero')
    }
    return response.json()
  }

  // Eliminar template financiero
  const handleDeleteFinancialTemplate = async (id: string): Promise<void> => {
    const response = await fetch(`/api/financial-templates/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Error eliminando template financiero')
    }
  }

  // Resetear configuración financiera a valores por defecto
  const handleNuevaOfertaFinanciera = () => {
    // Resetear costos de desarrollo
    setPaqueteActual((prev: any) => ({
      ...prev,
      desarrollo: 0,
      descuento: 0,
    }))
    // Resetear opciones de pago
    setOpcionesPagoActual([])
    // Resetear métodos preferidos
    setMetodosPreferidos([])
    // Resetear método y notas legacy
    setMetodoPagoPreferido('')
    setNotasPago('')
    // Resetear configuración de descuentos
    setConfigDescuentosActual(getDefaultConfigDescuentos() as any)
  }

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
    if (cotizacionConfig?.fechaEmision && cotizacionConfig?.fechaVencimiento && !validarFechas(cotizacionConfig.fechaEmision, cotizacionConfig.fechaVencimiento)) {
      errores.push('Fecha vencimiento debe ser mayor a emisión')
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  /**
   * Valida TAB Oferta: Servicios base + descripción paquete requeridos
   * IMPORTANTE: Si modoEdicionPaquete === false, la validación de descripción no bloquea
   * Esto permite navegar libremente cuando no se está editando activamente
   */
  const validarTabOferta = (): { valido: boolean; errores: string[] } => {
    const errores: string[] = []

    // Servicios base siempre son requeridos
    if (!serviciosBase || serviciosBase.length === 0) {
      errores.push('Debe haber al menos un servicio base')
    }
    
    // Solo validar descripción del paquete si está en modo edición activo
    if (modoEdicionPaquete) {
      if (!paqueteActual?.nombre?.trim()) {
        errores.push('Completa el nombre del paquete o cancela la edición')
      }
      if (!paqueteActual?.descripcion?.trim()) {
        errores.push('Completa la descripción del paquete o cancela la edición')
      }
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
   * Actualiza estado de validación de todos los TABs
   */
  const actualizarEstadoValidacionTabs = () => {
    const estadoCotizacion = validarTabCotizacion()
    const estadoOferta = validarTabOferta()
    const estadoPaquetes = validarTabPaquetes()

    setEstadoValidacionTabs({
      cotizacion: estadoCotizacion.valido ? 'ok' : 'error',
      oferta: estadoOferta.valido ? 'ok' : 'error',
      paquetes: estadoPaquetes.valido ? 'ok' : 'error',
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
    }

    if (resultado && !resultado.valido) {
      toast.error(`❌ ${resultado.errores[0]}`)
      return
    }

    // FASE 15: Validar DEPENDENCIAS del TAB DESTINO
    // Antes de entrar a "Paquetes": validar que existe descripción
    if (nuevoTab === 'paquetes') {
      if (!paqueteActual || !paqueteActual.descripcion || paqueteActual.descripcion.trim() === '') {
        toast.error('❌ Completa la descripción en TAB Oferta antes de crear paquetes')
        return
      }
    }

    // Si pasó validación, cambiar TAB
    setActivePageTab(nuevoTab)
    
    // Actualizar validación del nuevo TAB
    actualizarEstadoValidacionTabs()
  }

  /**
   * 🟢 SIDEBAR UNIFICADA: Mapeo de SidebarSection a activePageTab
   * Traduce clicks de la sidebar a cambios de tabs
   */
  const handleSidebarSectionChange = (section: SidebarSection) => {
    // Mapeo completo de secciones a tabs (NovaSuite 10 Módulos)
    const sectionToTabMap: Record<SidebarSection, string> = {
      // Analytics
      'analytics-dashboard': 'analytics',
      'analytics-ventas': 'analytics',
      'analytics-clientes': 'analytics',
      // CRM
      'crm-dashboard': 'crm',
      'crm-clientes': 'crm',
      'crm-contactos': 'crm',
      'crm-oportunidades': 'crm',
      'crm-interacciones': 'crm',
      'crm-productos': 'crm',
      'crm-historial': 'crm',
      'crm-pricing': 'crm',
      'crm-suscripciones': 'crm',
      'crm-facturas': 'crm',
      'crm-cotizaciones': 'crm',
      'crm-reportes': 'crm',
      'crm-compliance': 'crm',
      'crm-reglas': 'crm',
      'crm-plantillas': 'crm',
      'crm-configuracion': 'crm',
      // Sales
      'sales-cotizaciones': 'sales',
      'sales-pedidos': 'sales',
      'sales-facturas': 'sales',
      'sales-descuentos': 'sales',
      'sales-reportes': 'sales',
      // Inventory
      'inv-productos': 'inventory',
      'inv-stock': 'inventory',
      'inv-movimientos': 'inventory',
      'inv-categorias': 'inventory',
      // Finance
      'fin-cobros': 'finance',
      'fin-pagos': 'finance',
      'fin-impuestos': 'finance',
      'fin-contabilidad': 'finance',
      // People
      'ppl-empleados': 'people',
      'ppl-nomina': 'people',
      'ppl-asistencia': 'people',
      // Projects
      'prj-proyectos': 'projects',
      'prj-tareas': 'projects',
      'prj-recursos': 'projects',
      // POS
      'pos-venta': 'pos',
      'pos-caja': 'pos',
      'pos-tickets': 'pos',
      // eCommerce
      'eco-tiendas': 'ecommerce',
      'eco-pedidos': 'ecommerce',
      'eco-clientes': 'ecommerce',
      // Licensing
      'lic-suscripciones': 'licensing',
      'lic-planes': 'licensing',
      'lic-modulos': 'licensing',
      // Settings
      'set-general': 'settings',
      'set-personalizacion': 'settings',
      'set-integraciones': 'settings',
      // Legacy / Contextual
      'cot-info': 'cotizacion',
      'cot-cliente': 'cotizacion',
      'cot-proveedor': 'cotizacion',
      'oferta-desc': 'oferta',
      'oferta-base': 'oferta',
      'oferta-opt': 'oferta',
      'oferta-fin': 'oferta',
      'oferta-paq': 'oferta',
      'oferta-caract': 'oferta',
      'cont-resumen': 'contenido',
      'cont-analisis': 'contenido',
      'cont-fortale': 'contenido',
      'cont-compar': 'contenido',
      'cont-crono': 'contenido',
      'cont-cuotas': 'contenido',
      'cont-paq': 'contenido',
      'cont-notas': 'contenido',
      'cont-concl': 'contenido',
      'cont-faq': 'contenido',
      'cont-garant': 'contenido',
      'cont-contact': 'contenido',
      'cont-terminos': 'contenido',
      // Historial (1 sección → 1 tab, pero no existe actualmente)
      'hist-versiones': 'historial',
      // Preferencias (11 secciones → 1 tab)
      'pref-config': 'preferencias',
      'pref-sync': 'preferencias',
      'pref-usuarios': 'preferencias',
      'pref-org': 'preferencias',
      'pref-roles': 'preferencias',
      'pref-permisos': 'preferencias',
      'pref-matriz': 'preferencias',
      'pref-permuser': 'preferencias',
      'pref-logs': 'preferencias',
      'pref-backups': 'preferencias',
      'pref-reportes': 'preferencias',
    }

    const targetTab = sectionToTabMap[section]
    
    // Sincronizar con CRM Store si la sección es de CRM
    if (section.startsWith('crm-')) {
      const crmSection = section.replace('crm-', '') as any
      // Mapeo especial para nombres que no coinciden exactamente
      const crmMapping: Record<string, string> = {
        'clientes': 'clients',
        'contactos': 'contacts',
        'productos': 'products',
        'oportunidades': 'opportunities',
        'interacciones': 'interactions',
        'historial': 'history',
        'facturas': 'invoices',
        'cotizaciones': 'quotes',
        'reportes': 'reports',
        'configuracion': 'settings',
        'plantillas': 'templates',
        'reglas': 'rules'
      }
      const finalCrmSection = crmMapping[crmSection] || crmSection
      useCrmStore.getState().setActiveSection(finalCrmSection)
    }

    // Cambiar sección en el store
    setActiveSidebarSection(section)
    
    // Actualizar URL sin recargar la página
    const url = new URL(window.location.href)
    url.searchParams.set('section', section)
    window.history.replaceState({}, '', url.toString())
    
    // Cambiar tab si es diferente al actual
    if (targetTab && targetTab !== activePageTab) {
      handleCambioTab(targetTab)
    }
  }

  // Sincronizar cambios de tab hacia la sidebar
  useEffect(() => {
    // Mapeo de secciones a tabs para validación (NovaSuite)
    const sectionToTabMap: Record<string, string> = {
      'analytics-dashboard': 'analytics',
      'crm-dashboard': 'crm',
      'sales-cotizaciones': 'sales',
      'inv-productos': 'inventory',
      'fin-cobros': 'finance',
      'ppl-empleados': 'people',
      'prj-proyectos': 'projects',
      'pos-venta': 'pos',
      'eco-tiendas': 'ecommerce',
      'lic-suscripciones': 'licensing',
      'set-general': 'settings',
      'cot-info': 'cotizacion',
      'oferta-desc': 'oferta',
      'cont-resumen': 'contenido',
      'hist-versiones': 'historial',
    }

    // Mapeo de tabs a sección por defecto
    const tabToSectionMap: Record<string, SidebarSection> = {
      'analytics': 'analytics-dashboard',
      'crm': 'crm-dashboard',
      'sales': 'sales-cotizaciones',
      'inventory': 'inv-productos',
      'finance': 'fin-cobros',
      'people': 'ppl-empleados',
      'projects': 'prj-proyectos',
      'pos': 'pos-venta',
      'ecommerce': 'eco-tiendas',
      'licensing': 'lic-suscripciones',
      'settings': 'set-general',
      'cotizacion': 'cot-info',
      'oferta': 'oferta-desc',
      'contenido': 'cont-resumen',
      'historial': 'hist-versiones',
      'preferencias': 'pref-config',
      'crm': 'crm-dashboard',
    }
    
    // Solo sincronizar si la sección actual NO pertenece al tab actual
    // Esto evita que al cambiar de sección dentro del mismo tab, se resetee a la primera
    const currentSectionTab = sectionToTabMap[activeSidebarSection]
    
    if (currentSectionTab !== activePageTab) {
      const newSection = tabToSectionMap[activePageTab] as SidebarSection | undefined
      if (newSection) {
        setActiveSidebarSection(newSection)
      }
    }
  }, [activePageTab, setActiveSidebarSection]) // Eliminamos activeSidebarSection de dependencias para evitar loops y resets indeseados

  // ✅ Sincronizar sección desde la URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sectionParam = params.get('section') as SidebarSection | null
    
    if (sectionParam) {
      // Pequeño delay para asegurar que el store esté listo
      setTimeout(() => {
        handleSidebarSectionChange(sectionParam)
      }, 100)
    }
  }, [])

  // Cotización se carga automáticamente desde useQuotationCache hook
  // No necesitamos useEffect adicional aquí - el cache system maneja offline y online

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
    if (nuevoServicioBase.nombre && nuevoServicioBase.precio! > 0) {
      const nuevoServ: ServicioBase = {
        id: Date.now().toString(),
        nombre: nuevoServicioBase.nombre,
        precio: nuevoServicioBase.precio!,
        mesesGratis: nuevoServicioBase.mesesGratis!,
        mesesPago: nuevoServicioBase.mesesPago!,
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
    if (nuevoServicio.nombre?.trim() && nuevoServicio.precio! > 0) {
      const { mesesGratis, mesesPago } = normalizarMeses(nuevoServicio.mesesGratis!, nuevoServicio.mesesPago!)
      const nuevoServ: Servicio = {
        id: Date.now().toString(),
        nombre: nuevoServicio.nombre!.trim(),
        precio: nuevoServicio.precio!,
        mesesGratis,
        mesesPago,
        frecuenciaPago: nuevoServicio.frecuenciaPago,
      }
      setServiciosOpcionales((() => {
        const prev = serviciosOpcionales
        const existente = prev.find(s => s.nombre.toLowerCase() === nuevoServ.nombre.toLowerCase())
        if (existente) return prev.map(s => s.id === existente.id ? { ...nuevoServ, id: existente.id } : s)
        return [...prev, nuevoServ]
      })())
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
      const actualizado: Servicio = { ...servicioEditando, ...nm, nombre: servicioEditando.nombre.trim() } as any
      setServiciosOpcionales(serviciosOpcionales.map(s => s.id === actualizado.id ? actualizado : s))
      setEditandoServicioId(null)
      setServicioEditando(null)
    }
  }

  const cancelarEditarServicioOpcional = () => {
    setEditandoServicioId(null)
    setServicioEditando(null)
  }

  const eliminarServicioOpcional = (id: string) => {
    setServiciosOpcionales(serviciosOpcionales.filter(s => s.id !== id))
  }

  /**
   * Compara si un paquete nuevo es duplicado de uno existente
   * Verifica: nombre, desarrollo, servicios base y servicios opcionales
   */
  const esPaqueteDuplicado = (nuevoNombre: string, nuevoDesarrollo: number): PackageSnapshot | null => {
    // Solo comparar con paquetes de la misma cotización
    const paquetesCotizacionActual = snapshots.filter(s => s.quotationConfigId === cotizacionConfig?.id)
    
    for (const snapshot of paquetesCotizacionActual) {
      // Comparar nombre (ignorando mayúsculas/minúsculas y espacios extra)
      const nombreIgual = snapshot.nombre.trim().toLowerCase() === nuevoNombre.trim().toLowerCase()
      
      // Comparar desarrollo
      const desarrolloIgual = snapshot.paquete.desarrollo === nuevoDesarrollo
      
      // Comparar servicios base (cantidad y contenido)
      const serviciosBaseIguales = (() => {
        if (snapshot.serviciosBase.length !== serviciosBase.length) return false
        return serviciosBase.every(sb => 
          snapshot.serviciosBase.some(ssb => 
            ssb.nombre === sb.nombre && 
            ssb.precio === sb.precio && 
            ssb.mesesGratis === sb.mesesGratis && 
            ssb.mesesPago === sb.mesesPago
          )
        )
      })()
      
      // Comparar servicios opcionales
      const serviciosOpcionalesIguales = (() => {
        if (snapshot.otrosServicios.length !== serviciosOpcionales.length) return false
        return serviciosOpcionales.every(so => 
          snapshot.otrosServicios.some(sso => 
            sso.nombre === so.nombre && 
            sso.precio === so.precio && 
            sso.mesesGratis === so.mesesGratis && 
            sso.mesesPago === so.mesesPago
          )
        )
      })()
      
      // Si todo es igual, es duplicado
      if (nombreIgual && desarrolloIgual && serviciosBaseIguales && serviciosOpcionalesIguales) {
        return snapshot
      }
      
      // Si solo el nombre es igual, advertir pero permitir (podría ser variante)
      if (nombreIgual && (!desarrolloIgual || !serviciosBaseIguales || !serviciosOpcionalesIguales)) {
        // No es duplicado exacto, pero tiene el mismo nombre
        continue
      }
    }
    
    return null
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

    // VALIDACIÓN DE DUPLICADOS: Verificar si ya existe un paquete idéntico
    if (!paqueteActual) return
    const paqueteDuplicado = esPaqueteDuplicado(paqueteActual.nombre, paqueteActual.desarrollo)
    if (paqueteDuplicado) {
      mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Paquete duplicado',
        icono: '⚠️',
        mensaje: `Ya existe un paquete idéntico llamado "${paqueteDuplicado.nombre}" con los mismos servicios y configuración. ¿Deseas editarlo en lugar de crear uno nuevo?`,
        botones: [
          {
            label: 'Cancelar',
            action: () => {},
            style: 'secondary'
          },
          {
            label: 'Editar existente',
            action: () => {
              // Buscar la QuotationConfig asociada al snapshot duplicado
              const quotation = quotations.find(q => q.id === paqueteDuplicado.quotationConfigId)
              if (quotation) {
                abrirModalEditar(quotation)
              } else {
                toast.error('No se encontró la cotización asociada al paquete')
              }
            },
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
        nombre: paqueteActual!.nombre,
        quotationConfigId: cotizacionConfig?.id, // ✅ Vinculación automática a cotización activa
        serviciosBase: serviciosBase.map(s => ({ ...s })),
        paquete: {
          desarrollo: paqueteActual!.desarrollo,
          descuento: paqueteActual!.descuento,
          tipo: paqueteActual!.tipo || '',
          descripcion: paqueteActual!.descripcion || 'Paquete personalizado para empresas.',
          // ✅ Sistema de descuentos configurado por el usuario
          configDescuentos: configDescuentosActual as any,
          // ✅ Opciones de pago configuradas por el usuario
          opcionesPago: opcionesPagoActual as any,
          // ✅ Título y subtítulo de sección de pago para página pública
          tituloSeccionPago: metodosPagoOfertaData.titulo || 'Opciones de Pago',
          subtituloSeccionPago: metodosPagoOfertaData.subtitulo || '',
          // ✅ Método de pago y notas (legacy)
          metodoPagoPreferido: metodoPagoPreferido as any,
          notasPago: (notasPago || '') as any,
          // ✅ Múltiples métodos de pago preferidos
          metodosPreferidos: metodosPreferidos,
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
      
      // ✅ Limpiar SOLO campos específicos del paquete (mantener templates)
      setPaqueteActual({ nombre: '', desarrollo: 0, descuento: 0, tipo: '', descripcion: '', activo: true })
      // NO limpiar: serviciosBase, serviciosOpcionales, opcionesPago, configDescuentos (son templates)
      setNuevoServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12, frecuenciaPago: 'mensual' })

      // Llamar refresh global para notificar a todos los componentes
      await refreshSnapshots()

      // PROPUESTA 2: Toast mejorado con información de vinculación ✅
      toast.success(`✅ Paquete creado y vinculado: "${paqueteActual!.nombre}" a cotización ${cotizacionConfig?.numero || cotizacionConfig?.id}`)
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
    
    // 2.1 Sincronizar cotizacionActual con los datos de la quotation
    setCotizacionActual({
      numero: quotation.numero || '',
      fechaEmision: quotation.fechaEmision ? new Date(quotation.fechaEmision).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tiempoValidez: quotation.tiempoValidez || 30,
      empresa: quotation.empresa || '',
      sector: quotation.sector || '',
      ubicacion: quotation.ubicacion || '',
      emailCliente: quotation.emailCliente || '',
      whatsappCliente: quotation.whatsappCliente || '',
      profesional: quotation.profesional || '',
      empresaProveedor: quotation.empresaProveedor || '',
      emailProveedor: quotation.emailProveedor || '',
      whatsappProveedor: quotation.whatsappProveedor || '',
      ubicacionProveedor: quotation.ubicacionProveedor || '',
      heroTituloMain: quotation.heroTituloMain || 'Propuesta de Cotización',
      heroTituloSub: quotation.heroTituloSub || 'Cotización personalizada',
    })

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

  /**
   * Función para guardar los cambios en la cotización actual (QuotationConfig)
   * Se usa cuando se editan campos en el TAB "Cotización" del modal
   * CAMBIO 1: Garantizar que cotizacionActual nunca envíe undefined
   */
  const guardarCotizacionActual = async () => {
    if (!cotizacionActual) return

    try {
      // CAMBIO 1: Normalizar cotizacionActual para evitar undefined
      const datosParaGuardar = {
        heroTituloMain: cotizacionActual.heroTituloMain ?? '',
        heroTituloSub: cotizacionActual.heroTituloSub ?? '',
        numero: cotizacionActual.numero ?? '',
        fechaEmision: cotizacionActual.fechaEmision ?? '',
        tiempoValidez: cotizacionActual.tiempoValidez ?? 30,
        empresa: cotizacionActual.empresa ?? '',
        sector: cotizacionActual.sector ?? '',
        ubicacion: cotizacionActual.ubicacion ?? '',
        emailCliente: cotizacionActual.emailCliente ?? '',
        whatsappCliente: cotizacionActual.whatsappCliente ?? '',
        profesional: cotizacionActual.profesional ?? '',
        empresaProveedor: cotizacionActual.empresaProveedor ?? '',
        emailProveedor: cotizacionActual.emailProveedor ?? '',
        whatsappProveedor: cotizacionActual.whatsappProveedor ?? '',
        ubicacionProveedor: cotizacionActual.ubicacionProveedor ?? '',
      }

      const response = await fetch(`/api/quotation-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaGuardar),
      })

      if (!response.ok) {
        let errorDetails = `Status: ${response.status}`
        try {
          const errorBody = await response.json()
          errorDetails = errorBody.message || errorBody.error || JSON.stringify(errorBody)
        } catch {
          errorDetails = await response.text() || errorDetails
        }
        throw new Error(`Error guardando cotización: ${errorDetails}`)
      }

      const result = await response.json()
      
      // Actualizar el estado local con los datos guardados
      setCotizacionConfig(result.data || result)
      
      return result.data || result
    } catch (error) {
      console.error('Error al guardar cotización:', error)
      throw error
    }
  }

  const guardarEdicion = async () => {
    if (!snapshotEditando) return

    try {
      const actualizado = { ...snapshotEditando }
      actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
      actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
      actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)

      // FASE 16: Guardar en paralelo tanto el snapshot como la cotización
      // Esto asegura que los cambios en el TAB "Cotización" se persistan
      const [snapshotActualizado] = await Promise.all([
        actualizarSnapshot(actualizado.id, actualizado),
        guardarCotizacionActual()
      ])

      setSnapshots(snapshots.map(s => s.id === actualizado.id ? snapshotActualizado : s))
      
      // ✅ NUEVA: Recargar todas las cotizaciones para mantener sincronización global
      // CRÍTICO: Esto es lo que faltaba - sin esto, los otros componentes no ven los cambios
      await recargarQuotations()
      
      // ✅ NUEVA: Emitir evento de sincronización para notificar a todos los componentes
      // que una cotización ha sido actualizada
      if (quotationEnModal?.id) {
        emitQuotationSync('quotation:updated', {
          quotationId: quotationEnModal.id,
          quotationNumber: quotationEnModal.numero,
          data: {
            snapshot: snapshotActualizado,
            config: cotizacionConfig
          }
        })
      }
      
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
                
                // ✅ NUEVA: Emitir evento de activación
                emitQuotationSync('quotation:activated', {
                  quotationId: quotationEnModal.id,
                  quotationNumber: quotationEnModal.numero
                })
                
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

      // CAMBIO 3: Implementar el autoguardado del toggle correctamente
      // Solo cerrar modal si la preferencia está activa (cerrarModalAlGuardar === true)
      // Si está desactiva (false), mantener el modal abierto después de guardar
      const debeCerrarModal = useUserPreferencesStore.getState().cerrarModalAlGuardar
      
      if (debeCerrarModal) {
        setShowModalEditar(false)
        setSnapshotEditando(null)
        setQuotationEstadoAntes(null)
      } else {
        // Modal permanece abierto, pero mostramos confirmación de guardado
        toast.success('✓ Cambios guardados (modal abierto para continuar editando)')
      }
      
      setSnapshotOriginalJson(JSON.stringify(snapshotActualizado))
    } catch (error) {
      console.error('Error al guardar edición:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      
      // Si es un error de cotización, mostrar mensaje específico
      if (errorMsg.includes('Error guardando cotización')) {
        toast.error(`❌ ${errorMsg}`)
      } else {
        toast.error('❌ Error al actualizar el paquete. Por favor intenta de nuevo.')
      }
    }
  }

  // Estado para autoguardado y control de cambios
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  // 🟢 PHASE 5.2: lastSavedJson migrated to dataStore
  const lastSavedJson = useDataStore((s) => s.lastSavedJson)
  const setLastSavedJson = useDataStore((s) => s.setLastSavedJson)
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
        setSnapshots((prev: any) => prev.map((s: any) => s.id === actualizado.id ? snapshotActualizado : s))
        
        // Llamar refresh global para notificar a otros componentes
        await refreshSnapshots()
        
        const savedJson = JSON.stringify({
          id: snapshotActualizado.id,
          nombre: snapshotActualizado.nombre,
          paquete: snapshotActualizado.paquete,
          serviciosBase: snapshotActualizado.serviciosBase,
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
        return JSON.stringify(snapshotEditando.serviciosBase) !== JSON.stringify(original.serviciosBase)
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

  // Tracking de vistas de TAB del Administrador (TTL en hook)
  useEffect(() => {
    if (typeof trackAdminTabViewed === 'function') {
      trackAdminTabViewed(activePageTab)
    }
  }, [activePageTab, trackAdminTabViewed])

  // ==================== USEEFFECT PARA MIGRAR SNAPSHOTS ACTIVOS SIN VINCULACIÓN ====================
  useEffect(() => {
    const migrarSnapshotsSinVinculacion = async () => {
      // Solo ejecutar si hay cotizacionConfig y snapshots cargados
      // Durante carga inicial, simplemente retornar sin loguear
      if (!cotizacionConfig?.id || !snapshots || snapshots.length === 0) {
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
              setSnapshots((prev: any) => prev.filter((s: any) => s.id !== id))
              
              // También actualizar snapshotsModalActual si el modal está abierto
              useModalDataStore.getState().updateSnapshotsModalActual((prev: any) => prev.filter((s: any) => s.id !== id))
              
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

  /**
   * Abre el modal de historial de versiones para un paquete específico
   * Permite comparar la versión actual con versiones anteriores del mismo paquete
   */
  const handleCompararPaquete = (snapshot: PackageSnapshot) => {
    useUIStore.getState().setPackageHistorySnapshot(snapshot)
    useUIStore.getState().setShowPackageHistoryModal(true)
  }

  /**
   * Handler para comparación individual de dos paquetes seleccionados
   * Primer clic marca el paquete, segundo clic abre modal de comparación
   */
  const handleCompararPaqueteIndividual = (snapshot: PackageSnapshot) => {
    if (paqueteParaComparar && paqueteParaComparar.id !== snapshot.id) {
      // Segundo paquete seleccionado - abrir modal
      useUIStore.getState().setPaquetesAComparar({
        paquete1: paqueteParaComparar,
        paquete2: snapshot,
      })
      useUIStore.getState().setShowPackageCompareModal(true)
      useUIStore.getState().setPaqueteParaComparar(null)
    } else if (paqueteParaComparar) {
      // Mismo paquete clickeado - deseleccionar
      useUIStore.getState().setPaqueteParaComparar(null)
    } else {
      // Primer paquete seleccionado
      useUIStore.getState().setPaqueteParaComparar(snapshot)
    }
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
      const response = await fetch('/api/quotations', { cache: 'no-store' })
      const data = await response.json()
      if (data.success) {
        setQuotations(data.data || [])
      }
    } catch (error) {
      console.error('Error recargando quotations:', error)
    }
  }

  /**
   * Restaurar una versión anterior de cotización
   * Ahora usa un flujo de 2 pasos:
   * 1. Comparar paquetes y mostrar diferencias
   * 2. Ejecutar restauración basada en elección del usuario
   */
  const handleRestaurarVersion = async (version: QuotationConfig) => {
    try {
      toast.info(`⏳ Comparando paquetes de V${version.versionNumber}...`)
      
      // PASO 1: Llamar API en modo 'compare' para obtener diferencias
      const compareResponse = await fetch('/api/quotation-config/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId: version.id,
          currentId: cotizacionConfig?.id,
          mode: 'compare'
        })
      })

      const compareData = await compareResponse.json()
      
      if (!compareData.success) {
        throw new Error(compareData.error || 'Error al comparar versiones')
      }

      // Si la versión histórica no tiene snapshot, proceder sin comparación
      if (!compareData.hasHistoricSnapshot) {
        toast.warning('⚠️ La versión histórica no tiene snapshot de paquetes')
        // Ejecutar directamente con paquetes actuales
        await ejecutarRestauracion(version.id, 'actual')
        return
      }

      // Si hay diferencias, mostrar DialogoGenerico
      // La API devuelve: comparacion.sonIguales, comparacion.diferencias, comparacion.resumen
      const hayDiferencias = !compareData.comparacion?.sonIguales
      const diferenciasAPI = compareData.comparacion?.diferencias || []
      
      if (hayDiferencias && diferenciasAPI.length > 0) {
        // Agrupar diferencias por paquete para la tabla
        const diferenciasPorPaquete = new Map<string, Array<{ campo: string; valorActual: unknown; valorHistorico: unknown }>>()
        for (const diff of diferenciasAPI) {
          if (!diferenciasPorPaquete.has(diff.paquete)) {
            diferenciasPorPaquete.set(diff.paquete, [])
          }
          diferenciasPorPaquete.get(diff.paquete)!.push({
            campo: diff.campo,
            valorActual: diff.valorActual,
            valorHistorico: diff.valorHistorico
          })
        }

        let htmlTabla = `
          <div class="text-sm mb-4">
            <p class="mb-2">Se encontraron diferencias entre los paquetes de la versión actual (V${compareData.versionActual}) 
            y la versión que desea restaurar (V${compareData.versionARestaurar}).</p>
            <p class="font-semibold text-amber-600">¿Qué paquetes desea conservar?</p>
          </div>
          <div class="max-h-64 overflow-y-auto border rounded">
          <table class="w-full text-xs">
            <thead class="bg-gray-100 sticky top-0">
              <tr>
                <th class="p-2 text-left">Paquete</th>
                <th class="p-2 text-left">Campo</th>
                <th class="p-2 text-left">Valor Actual</th>
                <th class="p-2 text-left">Valor Histórico</th>
              </tr>
            </thead>
            <tbody>
        `

        for (const [paqueteNombre, diffs] of diferenciasPorPaquete) {
          for (const diff of diffs) {
            const valorActualStr = typeof diff.valorActual === 'object' 
              ? JSON.stringify(diff.valorActual).substring(0, 50) + '...'
              : String(diff.valorActual).substring(0, 50)
            const valorHistoricoStr = typeof diff.valorHistorico === 'object'
              ? JSON.stringify(diff.valorHistorico).substring(0, 50) + '...'
              : String(diff.valorHistorico).substring(0, 50)
            
            htmlTabla += `
              <tr class="border-b hover:bg-gray-50">
                <td class="p-2 font-medium">${paqueteNombre}</td>
                <td class="p-2">${diff.campo}</td>
                <td class="p-2 text-green-600">${valorActualStr}</td>
                <td class="p-2 text-blue-600">${valorHistoricoStr}</td>
              </tr>
            `
          }
        }

        htmlTabla += `</tbody></table></div>`

        // Mostrar diálogo con opciones
        mostrarDialogoGenerico({
          tipo: 'confirmacion',
          titulo: '📦 Diferencias en Paquetes',
          mensajeHTML: htmlTabla,
          size: 'lg',
          botones: [
            {
              label: '🔵 Usar paquetes actuales',
              style: 'primary',
              action: async () => {
                cerrarDialogoGenerico()
                await ejecutarRestauracion(version.id, 'actual')
              }
            },
            {
              label: '🔄 Restaurar paquetes históricos',
              style: 'secondary',
              action: async () => {
                cerrarDialogoGenerico()
                await ejecutarRestauracion(version.id, 'historico')
              }
            },
            {
              label: 'Cancelar',
              style: 'danger',
              action: () => {
                toast.info('Restauración cancelada')
              }
            }
          ]
        })
      } else {
        // No hay diferencias, proceder directamente
        toast.info('✅ No hay diferencias en paquetes, restaurando...')
        await ejecutarRestauracion(version.id, 'actual')
      }
    } catch (error) {
      console.error('Error comparando versiones:', error)
      toast.error('❌ Error al comparar versiones')
    }
  }

  /**
   * Ejecutar la restauración efectiva después de que el usuario eligió
   * @param packageOption 'actual' = mantener paquetes actuales, 'historico' = restaurar paquetes históricos
   */
  const ejecutarRestauracion = async (versionId: string, packageOption: 'actual' | 'historico') => {
    try {
      toast.info('⏳ Restaurando versión...')
      
      const response = await fetch('/api/quotation-config/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId,
          currentId: cotizacionConfig?.id,
          mode: 'execute',
          packageOption
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Actualizar estado local con la nueva cotización restaurada
        setCotizacionConfig({
          ...data.data,
          isGlobal: true,
        })
        
        toast.success(`✅ Versión restaurada como V${data.nuevaVersion}`)
        
        // Recargar lista de cotizaciones Y snapshots en paralelo
        // (igual que en guardarConfiguracionActual para evitar gap temporal)
        const [snapshotsActualizados, quotationsData] = await Promise.all([
          obtenerSnapshotsCompleto(),
          fetch('/api/quotations', { cache: 'no-store' }).then(r => r.json())
        ])
        
        // Actualizar ambos estados juntos
        setSnapshots(snapshotsActualizados)
        if (quotationsData.success) {
          setQuotations(quotationsData.data || [])
        }
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('Error ejecutando restauración:', error)
      toast.error('❌ Error al restaurar la versión')
    }
  }

  /**
   * Duplicar una versión de cotización como nueva cotización
   */
  const handleDuplicarVersion = async (version: QuotationConfig) => {
    try {
      toast.info(`⏳ Duplicando versión V${version.versionNumber}...`)
      
      // Generar nuevo número de cotización
      const response = await fetch('/api/quotation-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...version,
          id: undefined, // Nuevo ID
          numero: undefined, // Nuevo número
          versionNumber: 1, // Nueva versión
          isGlobal: false, // No activar automáticamente
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`✅ Cotización duplicada como ${data.data.numero}`)
        
        // Recargar lista de cotizaciones
        await recargarQuotations()
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('Error duplicando versión:', error)
      toast.error('❌ Error al duplicar la cotización')
    }
  }

  /**
   * Ejecuta la eliminación de una cotización (sin verificar si es activa)
   */
  const ejecutarEliminacionCotizacionSimple = async (quotationId: string) => {
    const quotationsAnteriores = quotations
    
    try {
      // Actualizar UI inmediatamente
      const quotationsActualizadas = quotationsAnteriores.filter(q => q.id !== quotationId)
      setQuotations(quotationsActualizadas)
      
      // Enviar DELETE a la API
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        setQuotations(quotationsAnteriores)
        throw new Error(`HTTP ${response.status}`)
      }
      
      const resultData = await response.json()
      
      if (resultData.success) {
        toast.success('✅ Cotización eliminada correctamente')
      } else {
        setQuotations(quotationsAnteriores)
        toast.error('Error en el servidor: ' + (resultData.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error eliminando cotización:', error)
      setQuotations(quotationsAnteriores)
      toast.error('Error al eliminar la cotización')
    }
  }

  /**
   * Ejecuta la eliminación de la cotización ACTIVA y muestra diálogo de opciones
   */
  const ejecutarEliminacionCotizacion = async (quotationId: string) => {
    const quotationsAnteriores = quotations
    
    try {
      // Actualizar UI inmediatamente
      const quotationsActualizadas = quotationsAnteriores.filter(q => q.id !== quotationId)
      setQuotations(quotationsActualizadas)
      
      // Enviar DELETE a la API
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        setQuotations(quotationsAnteriores)
        throw new Error(`HTTP ${response.status}`)
      }
      
      const resultData = await response.json()
      
      if (resultData.success) {
        toast.success('Cotización eliminada correctamente')
        
        // Limpiar cotización activa del estado
        setCotizacionConfig(null)
        setQuotationIdPendienteEliminar(null)
        
        // Verificar si hay otras cotizaciones disponibles
        if (quotationsActualizadas.length > 0) {
          // Mostrar DialogoGenerico #2 con opciones post-eliminación
          mostrarDialogoGenerico({
            tipo: 'info',
            titulo: '¿Qué deseas hacer ahora?',
            icono: '📋',
            mensaje: 'La cotización activa ha sido eliminada. Selecciona una opción para continuar.',
            botones: [
              {
                label: 'Nueva Cotización',
                style: 'success',
                action: async () => {
                  cerrarDialogoGenerico()
                  await crearNuevaCotizacion()
                  return false // Evitar cierre automático
                },
              },
              {
                label: 'Ver Cotizaciones Existentes',
                style: 'primary',
                action: () => {
                  cerrarDialogoGenerico()
                  setModoSeleccionCotizacion(true)
                  setModalListaCotizacionesPostEliminacion(true)
                  return false // Evitar cierre automático
                },
              },
            ],
          })
        } else {
          // No hay cotizaciones, crear una nueva automáticamente
          mostrarDialogoGenerico({
            tipo: 'info',
            titulo: 'Sin Cotizaciones',
            icono: '📋',
            mensaje: 'No hay más cotizaciones disponibles. Se creará una nueva cotización automáticamente.',
            botones: [
              {
                label: 'Crear Nueva',
                style: 'primary',
                action: async () => {
                  cerrarDialogoGenerico()
                  await crearNuevaCotizacion()
                },
              },
            ],
          })
        }
      } else {
        setQuotations(quotationsAnteriores)
        toast.error('Error en el servidor: ' + (resultData.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error eliminando cotización:', error)
      setQuotations(quotationsAnteriores)
      toast.error('Error al eliminar la cotización')
    }
  }



  /**
   * PROPUESTA 3: Calcula resumen completo de la cotización para la confirmación
   */
  const calcularResumenCotizacion = () => {
    // Filtrar solo snapshots activos de la cotización actual
    const snapshotsActivos = snapshots.filter(s => s.activo && s.quotationConfigId === cotizacionConfig?.id)
    
    // Características por paquete desde contenidoGeneral
    const caracteristicasPorPaqueteData = cotizacionConfig?.contenidoGeneral?.presupuestoCronograma?.caracteristicasPorPaquete || {}
    
    // Helper para contar descuentos activos de un paquete
    const contarDescuentosPaquete = (config: ConfigDescuentos | undefined | null): number => {
      if (!config || config.tipoDescuento === 'ninguno') return 0
      
      let count = 0
      
      if (config.tipoDescuento === 'general' && config.descuentoGeneral?.porcentaje > 0) {
        // Descuento general: contar cuántas categorías tienen descuento
        if (config.descuentoGeneral.aplicarA?.desarrollo) count++
        if (config.descuentoGeneral.aplicarA?.serviciosBase) count++
        if (config.descuentoGeneral.aplicarA?.otrosServicios) count++
      } else if (config.tipoDescuento === 'granular' && config.descuentosGranulares) {
        // Descuentos granulares: contar los que tienen valor > 0
        if (config.descuentosGranulares.desarrollo > 0) count++
        const serviciosBaseCount = Object.values(config.descuentosGranulares.serviciosBase || {}).filter(v => v > 0).length
        const otrosServiciosCount = Object.values(config.descuentosGranulares.otrosServicios || {}).filter(v => v > 0).length
        count += serviciosBaseCount + otrosServiciosCount
      }
      
      // Descuentos adicionales
      if (config.descuentoPagoUnico > 0) count++
      if (config.descuentoDirecto > 0) count++
      if (config.descuentoEspecial?.habilitado && config.descuentoEspecial?.porcentaje > 0) count++
      
      return count
    }
    
    // Datos completos por paquete
    const paquetesInfo = snapshotsActivos.map(s => ({
      nombre: s.nombre,
      inversion: s.costos?.año1 || 0,
      serviciosBase: s.serviciosBase?.length || 0,
      serviciosOpcionales: s.otrosServicios?.length || 0,
      caracteristicas: caracteristicasPorPaqueteData[s.nombre]?.length || 0,
      descuentosActivos: contarDescuentosPaquete(s.paquete?.configDescuentos),
      // Opciones de pago: desde el paquete si existe, si no desde el estado global
      opcionesPago: s.paquete?.opcionesPago?.length ?? opcionesPagoActual?.length ?? 0,
      // Métodos preferidos: desde el paquete si existe, si no desde el estado global
      metodosPago: s.paquete?.metodosPreferidos?.length ?? metodosPreferidos?.length ?? 0,
    }))
    
    // Detectar si la configuración de pago es igual en todos los paquetes
    const configPagoIgual = paquetesInfo.length <= 1 || paquetesInfo.every(p => 
      p.opcionesPago === paquetesInfo[0].opcionesPago && 
      p.metodosPago === paquetesInfo[0].metodosPago
    )
    
    // Totales globales (para cuando la config es igual)
    const totalPaquetes = snapshotsActivos.length
    const opcionesPagoGlobal = paquetesInfo[0]?.opcionesPago ?? opcionesPagoActual?.length ?? 0
    const metodosPagoGlobal = paquetesInfo[0]?.metodosPago ?? metodosPreferidos?.length ?? 0
    
    // Calcular inversión total sumando todos los paquetes
    const inversionTotal = paquetesInfo.reduce((sum, p) => sum + (p.inversion || 0), 0)
    
    return {
      paquetesInfo,
      totalPaquetes,
      configPagoIgual,
      opcionesPagoGlobal,
      metodosPagoGlobal,
      inversionTotal,
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

      // ✅ Guardar templates actuales si la preferencia está desactivada
      const deberiaLimpiar = useUserPreferencesStore.getState().limpiarFormulariosAlCrear ?? true
      
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
          heroTituloMain: 'Propuesta de Cotización',
          heroTituloSub: 'Cotización personalizada',
          // ✅ Guardar templates si no se limpia
          ...(deberiaLimpiar ? {} : {
            serviciosBaseTemplate: serviciosBase,
            serviciosOpcionalesTemplate: serviciosOpcionales,
            opcionesPagoTemplate: opcionesPagoActual,
            configDescuentosTemplate: configDescuentosActual,
            metodoPagoPreferido: metodoPagoPreferido,
            notasPago: notasPago,
            metodosPreferidos: metodosPreferidos,
          }),
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
      })

      // Resetear snapshots (paquetes) - siempre se resetean
      setSnapshots([])

      // ✅ Limpiar formularios SOLO si la preferencia está activa
      if (deberiaLimpiar) {
        // Limpiar todos los estados de formulario
        setPaqueteActual({ nombre: '', desarrollo: 0, descuento: 0, tipo: '', descripcion: '', activo: true })
        setServiciosBase([
          { id: '1', nombre: 'Hosting', precio: 28, mesesGratis: 3, mesesPago: 9 },
          { id: '2', nombre: 'Mailbox', precio: 4, mesesGratis: 3, mesesPago: 9 },
          { id: '3', nombre: 'Dominio', precio: 18, mesesGratis: 3, mesesPago: 9 },
        ])
        setServiciosOpcionales([])
        setOpcionesPagoActual([])
        setConfigDescuentosActual(getDefaultConfigDescuentos() as any)
        setMetodoPagoPreferido('')
        setNotasPago('')
        setMetodosPreferidos([])
      } else {
        // ✅ Solo limpiar datos específicos del paquete
        setPaqueteActual({ nombre: '', desarrollo: 0, descuento: 0, tipo: '', descripcion: '', activo: true })
      }

      // Ir al TAB Cotización
      setActivePageTab('cotizacion')

      toast.success(`✅ Nueva cotización creada. ${deberiaLimpiar ? 'Formularios reiniciados.' : 'Templates mantenidos.'}`)
      
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

    const resumen = calcularResumenCotizacion()

    // Formatear fecha de emisión
    const fechaEmision = cotizacionConfig.fechaEmision 
      ? new Date(cotizacionConfig.fechaEmision).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : 'Sin especificar'

    // Crear contenido HTML moderno para el modal con tarjetas por paquete
    const mensajeHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Sección Datos de la Cotización -->
        <div style="background: rgba(88, 166, 255, 0.08); border-radius: 8px; padding: 12px 14px; border-left: 3px solid #58a6ff;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #58a6ff; margin-bottom: 8px; font-weight: 600;">Datos de la Cotización</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; font-size: 13px;">
            <div><span style="color: #8b949e;">Número:</span> <span style="color: #c9d1d9;">${cotizacionConfig.numero || 'Sin asignar'}${cotizacionConfig.versionNumber ? ` (v${cotizacionConfig.versionNumber})` : ''}</span></div>
            <div><span style="color: #8b949e;">Fecha:</span> <span style="color: #c9d1d9;">${fechaEmision}</span></div>
            <div><span style="color: #8b949e;">Moneda:</span> <span style="color: #c9d1d9;">${cotizacionConfig.moneda || 'USD'}</span></div>
            <div><span style="color: #8b949e;">Validez:</span> <span style="color: #c9d1d9;">${cotizacionConfig.tiempoValidez || 30} días</span></div>
            <div><span style="color: #8b949e;">Cliente:</span> <span style="color: #c9d1d9;">${cotizacionConfig.empresa || 'Sin especificar'}</span></div>
            <div><span style="color: #8b949e;">Proveedor:</span> <span style="color: #c9d1d9;">${cotizacionConfig.profesional || 'Sin especificar'}</span></div>
          </div>
        </div>

        <!-- Sección Paquetes con tarjetas individuales -->
        <div style="background: rgba(35, 134, 54, 0.08); border-radius: 8px; padding: 12px 14px; border-left: 3px solid #238636;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #3fb950; margin-bottom: 12px; font-weight: 600;">Paquetes Incluidos (${resumen.paquetesInfo.length})</div>
          ${resumen.paquetesInfo.length > 0 
            ? `<div style="display: flex; flex-direction: column; gap: 10px;">
                ${resumen.paquetesInfo.map(p => `
                  <div style="background: rgba(13, 17, 23, 0.6); border-radius: 6px; padding: 10px 12px; border: 1px solid rgba(48, 54, 61, 0.6);">
                    <!-- Header del paquete -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(48, 54, 61, 0.4);">
                      <span style="color: #c9d1d9; font-weight: 600; font-size: 14px;">${p.nombre}</span>
                      <span style="color: #3fb950; font-weight: 600; font-size: 14px;"><span style="color: #8b949e;">Valor del contrato: </span>$${(p.inversion || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}/año</span>
                    </div>
                    <!-- Métricas del paquete -->
                    <div style="display: grid; grid-template-columns: ${resumen.configPagoIgual ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'}; gap: 6px; font-size: 11px;">
                      <div style="text-align: center; padding: 4px; background: rgba(88, 166, 255, 0.1); border-radius: 4px;">
                        <div style="color: #58a6ff; font-size: 14px; font-weight: 600;">${p.serviciosBase}</div>
                        <div style="color: #8b949e; font-size: 9px;">Serv. Base</div>
                      </div>
                      <div style="text-align: center; padding: 4px; background: rgba(88, 166, 255, 0.1); border-radius: 4px;">
                        <div style="color: #58a6ff; font-size: 14px; font-weight: 600;">${p.serviciosOpcionales}</div>
                        <div style="color: #8b949e; font-size: 9px;">Serv. Opc.</div>
                      </div>
                      <div style="text-align: center; padding: 4px; background: rgba(210, 153, 34, 0.1); border-radius: 4px;">
                        <div style="color: #e3b341; font-size: 14px; font-weight: 600;">${p.caracteristicas}</div>
                        <div style="color: #8b949e; font-size: 9px;">Características</div>
                      </div>
                      <div style="text-align: center; padding: 4px; background: rgba(63, 185, 80, 0.1); border-radius: 4px;">
                        <div style="color: #3fb950; font-size: 14px; font-weight: 600;">${p.descuentosActivos}</div>
                        <div style="color: #8b949e; font-size: 9px;">Descuentos</div>
                      </div>
                      ${!resumen.configPagoIgual ? `
                        <div style="text-align: center; padding: 4px; background: rgba(139, 148, 158, 0.1); border-radius: 4px;">
                          <div style="color: #c9d1d9; font-size: 14px; font-weight: 600;">${p.opcionesPago}</div>
                          <div style="color: #8b949e; font-size: 9px;">Opc. Pago</div>
                        </div>
                        <div style="text-align: center; padding: 4px; background: rgba(139, 148, 158, 0.1); border-radius: 4px;">
                          <div style="color: #c9d1d9; font-size: 14px; font-weight: 600;">${p.metodosPago}</div>
                          <div style="color: #8b949e; font-size: 9px;">Métodos Pref.</div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>`
            : '<div style="color: #8b949e; font-size: 13px;">Sin paquetes activos</div>'
          }
        </div>

        ${resumen.configPagoIgual && resumen.paquetesInfo.length > 0 ? `
        <!-- Sección Configuración de Pago (común a todos) -->
        <div style="background: rgba(139, 148, 158, 0.08); border-radius: 8px; padding: 12px 14px; border-left: 3px solid #8b949e;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #8b949e; margin-bottom: 8px; font-weight: 600;">Configuración de Pago (común a todos)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div style="text-align: center; padding: 8px; background: rgba(13, 17, 23, 0.5); border-radius: 6px;">
              <div style="color: #58a6ff; font-size: 18px; font-weight: 600;">${resumen.opcionesPagoGlobal}</div>
              <div style="color: #8b949e; font-size: 10px;">Cuotas de Pago</div>
            </div>
            <div style="text-align: center; padding: 8px; background: rgba(13, 17, 23, 0.5); border-radius: 6px;">
              <div style="color: #58a6ff; font-size: 18px; font-weight: 600;">${resumen.metodosPagoGlobal}</div>
              <div style="color: #8b949e; font-size: 10px;">Métodos Preferidos</div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `

    // Usar DialogoGenerico con HTML completo
    mostrarDialogoGenerico({
      tipo: 'confirmacion',
      titulo: 'Guardar Cotización',
      subtitulo: '¿Deseas guardar esta cotización con todos sus paquetes?',
      mensajeHTML,
      size: 'xl',
      botones: [
        {
          label: 'Cancelar',
          action: () => {},
          style: 'secondary'
        },
        {
          label: 'Guardar',
          action: async () => {
            // Solo iniciar el proceso - guardarConfiguracionActual maneja todos los estados
            setGuardandoCotizacion(true)
            await guardarConfiguracionActual()
            // No limpiar estados aquí - el modal de progreso los maneja
          },
          style: 'primary'
        }
      ]
    })
  }

  /**
   * Función para hacer rollback de una versión de cotización creada
   * Se usa cuando el usuario cancela el proceso de guardado
   */
  const rollbackGuardado = async (versionToDelete: string, previousVersionId: string): Promise<boolean> => {
    try {
      setMensajeGuardado('Revirtiendo cambios...')
      const response = await fetch('/api/quotation-config/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionToDelete, previousVersionId }),
      })

      const data = await response.json()

      if (data.success) {
        // Recargar datos para reflejar el estado anterior
        await recargarQuotations()
        const snapshotsActualizados = await obtenerSnapshotsCompleto()
        setSnapshots(snapshotsActualizados)
        return true
      } else {
        console.error('Error en rollback:', data.error)
        toast.error('Error al revertir los cambios')
        return false
      }
    } catch (error) {
      console.error('Error en rollback:', error)
      toast.error('Error al revertir los cambios')
      return false
    } finally {
      setMensajeGuardado('')
      idVersionCreadaRef.current = null
      idVersionAnteriorRef.current = null
    }
  }

  /**
   * Muestra diálogo de confirmación para cancelar el guardado
   */
  const confirmarCancelacionGuardado = () => {
    setShowModalConfirmarCancelacion(true)
  }

  /**
   * Ejecuta la cancelación del guardado
   * Aborta la solicitud fetch en curso y hace rollback si es necesario
   * NOTA: Esta función solo marca la cancelación. El rollback real se hace en el catch de guardarConfiguracionActual
   */
  const ejecutarCancelacionGuardado = async () => {
    // Abortar la solicitud fetch en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      // No limpiar el ref aquí - lo hace el proceso principal
    }
    
    setCancelarGuardadoSolicitado(true)
    setShowModalConfirmarCancelacion(false)
    
    // Marcar paso activo como cancelado en el modal de progreso
    setPasosGuardado(prev => prev.map(paso => 
      paso.estado === 'activo' 
        ? { ...paso, estado: 'cancelado' as const, detalle: '(cancelado)' }
        : paso
    ))
    
    // IMPORTANTE: El rollback se maneja en el catch de guardarConfiguracionActual
    // para evitar race conditions. Aquí solo marcamos la UI.
    setResumenGuardado('🔄 Cancelando operación...')
    
    // No hacer rollback aquí - esperar a que el proceso principal lo maneje
    // Esto evita race conditions entre el abort y la continuación del proceso
  }

  /**
   * Helper para actualizar un paso específico del guardado
   */
  const actualizarPasoGuardado = (
    pasoId: string, 
    estado: 'pendiente' | 'activo' | 'completado' | 'error' | 'cancelado',
    detalle?: string
  ) => {
    setPasosGuardado(prev => prev.map(paso => 
      paso.id === pasoId 
        ? { ...paso, estado, detalle } 
        : paso
    ))
  }

  /**
   * Reinicia los pasos del guardado al estado inicial
   */
  const reiniciarPasosGuardado = () => {
    setPasosGuardado([
      { id: 'validar', label: 'Validando datos', estado: 'pendiente' },
      { id: 'version', label: 'Creando nueva versión', estado: 'pendiente' },
      { id: 'duplicar', label: 'Reasignando paquetes', estado: 'pendiente' },
      { id: 'activar', label: 'Activando versión', estado: 'pendiente' },
      { id: 'finalizar', label: 'Finalizando', estado: 'pendiente' },
    ])
    setResultadoGuardado('guardando')
    setResumenGuardado('')
  }

  /**
   * Función helper genérica para mostrar diálogos
   * Centraliza toda la lógica de diálogos en un solo lugar
   */
  const mostrarDialogoGenerico = (config: DialogConfig) => {
    setDatosDialogo(config)
    setDialogoInputValue(config.input?.defaultValue || '')
    setMostrarDialogo(true)
  }

  /**
   * Función helper para cerrar diálogos
   */
  const cerrarDialogoGenerico = () => {
    setMostrarDialogo(false)
    setDatosDialogo(null)
    setDialogoInputValue('')
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
    if (cotizacionConfig && !validarFechas(cotizacionConfig.fechaEmision || '', cotizacionConfig.fechaVencimiento || '')) {
      errores.fechas = 'Fecha vencimiento debe ser > emisión'
    }

    if (Object.keys(errores).length > 0) {
      setErroresValidacionCotizacion(errores)
      toast.error('⚠️ Hay errores en los datos. Revisa los campos resaltados.')
      setActivePageTab('cotizacion')
      return
    }

    // PASO 5: Validar si está habilitada la validación completa
    if (useUserPreferencesStore.getState().validarDatosAntes) {
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

    // ⚠️ IMPORTANTE: Capturar la versión actual ANTES de iniciar el proceso
    // Esto permite detectar si se creó una versión durante el guardado incluso si el usuario cancela
    const versionAnteriorAlGuardar = cotizacionConfig.id
    const versionNumberAnterior = cotizacionConfig.versionNumber || 1
    
    // Establecer refs inmediatamente (acceso sincrónico, sin race conditions)
    idVersionAnteriorRef.current = versionAnteriorAlGuardar
    idVersionCreadaRef.current = null

    try {
      // Reiniciar estados de cancelación de ejecuciones anteriores
      setCancelarGuardadoSolicitado(false)
      abortControllerRef.current = null
      
      // Inicializar modal de progreso
      reiniciarPasosGuardado()
      setShowModalProgresoGuardado(true)
      
      // PASO: Validando datos
      actualizarPasoGuardado('validar', 'activo')
      
      // Crear AbortController para poder cancelar la operación
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal
      
      // Simular pequeña pausa para que el usuario vea el paso
      await new Promise(resolve => setTimeout(resolve, 300))
      actualizarPasoGuardado('validar', 'completado', '✓ Datos válidos')
      
      // PASO: Creando nueva versión
      actualizarPasoGuardado('version', 'activo')
      setMensajeGuardado('Su cotización está siendo sincronizada en la nube, por favor espere...')
      
      // Incrementar versionNumber y sincronizar TODOS los templates con estados locales
      const cotizacionConVersionActualizada = {
        ...cotizacionConfig,
        versionNumber: versionNumberAnterior + 1,
        // ✅ SINCRONIZAR TEMPLATES CON ESTADOS LOCALES
        serviciosBaseTemplate: serviciosBase,
        serviciosOpcionalesTemplate: serviciosOpcionales,
        opcionesPagoTemplate: opcionesPagoActual,
        configDescuentosTemplate: configDescuentosActual,
        metodoPagoPreferido: metodoPagoPreferido,
        notasPago: notasPago,
        metodosPreferidos: metodosPreferidos,
        descripcionesPaqueteTemplates: descripcionesTemplate,
        // Estado del editor
        editorState: {
          paqueteActual,
        },
      }
      
      // Verificar si se canceló antes del fetch
      if (signal.aborted) throw new DOMException('Operación cancelada', 'AbortError')
      
      const response = await fetch(`/api/quotation-config/${cotizacionConfig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cotizacionConVersionActualizada),
        signal, // Pasar signal para poder abortar
      })

      if (!response.ok) throw new Error('Error guardando')

      // PASO 8: Obtener nueva cotización con nuevo ID desde la respuesta
      const responseData = await response.json()
      const nuevaCotizacion = responseData.data
      
      // Marcar versión como completada
      actualizarPasoGuardado('version', 'completado', `V${nuevaCotizacion.versionNumber} creada`)
      
      // Guardar ID de versión creada en ref (acceso sincrónico)
      idVersionCreadaRef.current = nuevaCotizacion.id
      
      // Verificar si el usuario solicitó cancelación durante el guardado
      if (signal.aborted || cancelarGuardadoSolicitado) {
        // Hacer rollback inmediatamente antes de lanzar el error
        await rollbackGuardado(nuevaCotizacion.id, cotizacionConfig.id)
        throw new DOMException('Operación cancelada', 'AbortError')
      }
      
      // PASO: Verificando paquetes (ya NO se duplican, se reasignan en el API)
      actualizarPasoGuardado('duplicar', 'activo')
      setMensajeGuardado('Verificando paquetes reasignados...')
      
      // Los paquetes ya fueron reasignados en el API, solo verificamos
      const paquetesActivos = snapshots.filter(s => s.activo)
      console.log(`📦 Paquetes activos reasignados: ${paquetesActivos.length}`)
      
      // Verificar cancelación
      if (signal.aborted) throw new DOMException('Operación cancelada', 'AbortError')
      
      // ⚡ FIX: Cargar snapshots Y quotations en PARALELO para evitar gap temporal
      // Esto evita que React renderice con snapshots nuevos pero quotations antiguas
      const [snapshotsActualizados, quotationsResponse] = await Promise.all([
        obtenerSnapshotsCompleto(),
        fetch('/api/quotations', { cache: 'no-store' }).then(r => r.json())
      ])
      
      // Actualizar AMBOS estados juntos para evitar inconsistencias
      setSnapshots(snapshotsActualizados)
      if (quotationsResponse.success) {
        setQuotations(quotationsResponse.data || [])
      }
      
      if (paquetesActivos.length > 0) {
        actualizarPasoGuardado('duplicar', 'completado', `${paquetesActivos.length} paquete(s) ✓`)
      } else {
        actualizarPasoGuardado('duplicar', 'completado', 'Sin paquetes')
      }
      
      // Verificar cancelación antes del paso 4
      if (signal.aborted) throw new DOMException('Operación cancelada', 'AbortError')
      
      // PASO: Activando versión
      actualizarPasoGuardado('activar', 'activo')
      
      // Actualizar estado local con la nueva cotización (nuevo ID)
      setCotizacionConfig({
        ...cotizacionConVersionActualizada,
        id: nuevaCotizacion.id,
        versionNumber: nuevaCotizacion.versionNumber,
        numero: nuevaCotizacion.numero,
      } as any)

      // PASO 9: Desactivar todas excepto la nueva (ya marcada como isGlobal:true en API)
      const desactivOk = await desactivarTodas(nuevaCotizacion.id)
      
      // Verificar cancelación después de desactivar
      if (signal.aborted) throw new DOMException('Operación cancelada', 'AbortError')
      
      if (!desactivOk) {
        actualizarPasoGuardado('activar', 'error', 'Error al activar')
        return
      }
      actualizarPasoGuardado('activar', 'completado', '✓ Versión activa')
      
      // Verificar cancelación antes del paso 5
      if (signal.aborted) throw new DOMException('Operación cancelada', 'AbortError')
      
      // PASO: Finalizando
      actualizarPasoGuardado('finalizar', 'activo')

      // PASO 10: Mostrar éxito
      setErroresValidacionCotizacion({})

      // NOTA: recargarQuotations() ya se ejecutó en paralelo con obtenerSnapshotsCompleto()
      // para evitar el gap temporal que causaba que los paquetes no se mostraran
      
      // Verificar cancelación después de recargar
      if (signal.aborted) throw new DOMException('Operación cancelada', 'AbortError')

      // PASO 12: Mostrar confirmación adicional si preferencia está activa
      if (useUserPreferencesStore.getState().mostrarConfirmacionGuardado) {
        toast.info('✓ Cambios guardados exitosamente')
      }

      // PASO 13: Cerrar modal si preferencia está activa
      if (useUserPreferencesStore.getState().cerrarModalAlGuardar && showModalEditar) {
        handleCerrarModalEditar()
      }
      
      // Marcar finalización como completada
      const paquetesActualesCount = snapshots.filter(s => s.activo).length
      actualizarPasoGuardado('finalizar', 'completado', '✓ Listo')
      
      // Actualizar resumen y estado del modal
      setResumenGuardado(`🎉 Nueva versión V${nuevaCotizacion.versionNumber} creada correctamente\n${paquetesActualesCount} paquete(s) duplicados exitosamente`)
      setResultadoGuardado('exito')
      
      // PASO 14: Limpiar refs y estados de guardado
      idVersionCreadaRef.current = null
      idVersionAnteriorRef.current = null
      setMensajeGuardado('')
      setCancelarGuardadoSolicitado(false)
      abortControllerRef.current = null
    } catch (error) {
      // Obtener valores de refs de forma sincrónica
      const versionCreada = idVersionCreadaRef.current
      const versionAnterior = idVersionAnteriorRef.current
      
      // Manejar cancelación con rollback directo
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('⚠️ Guardado cancelado por el usuario')
        
        // IMPORTANTE: Hacer rollback aquí directamente para evitar race conditions
        let rollbackExitoso = true
        if (versionCreada && versionAnterior) {
          setResumenGuardado('🔄 Revirtiendo cambios...')
          rollbackExitoso = await rollbackGuardado(versionCreada, versionAnterior)
        } else if (versionAnterior && !versionCreada) {
          // CASO: La versión se creó en el servidor pero no llegó la respuesta
          setResumenGuardado('🔍 Verificando versiones...')
          try {
            const response = await fetch('/api/quotation-config')
            if (response.ok) {
              const data = await response.json()
              const versionGlobalActual = data.data?.id
              if (versionGlobalActual && versionGlobalActual !== versionAnterior) {
                setResumenGuardado('🔄 Eliminando versión parcial...')
                rollbackExitoso = await rollbackGuardado(versionGlobalActual, versionAnterior)
              }
            }
          } catch (fetchError) {
            console.warn('No se pudo verificar versiones huérfanas:', fetchError)
          }
        }
        
        // Actualizar UI con resultado
        setResultadoCancelacionExitoso(rollbackExitoso)
        setResumenGuardado(rollbackExitoso 
          ? '✅ Operación cancelada y datos restaurados' 
          : '⚠️ Cancelado con posibles datos parciales')
        setResultadoGuardado('cancelado')
        
        // Limpiar estados
        setGuardandoCotizacion(false)
        setCancelarGuardadoSolicitado(false)
        setMensajeGuardado('')
        idVersionCreadaRef.current = null
        idVersionAnteriorRef.current = null
        abortControllerRef.current = null
        return
      }
      
      console.error('Error guardando:', error)
      
      // Marcar paso activo como error
      setPasosGuardado(prev => prev.map(paso => 
        paso.estado === 'activo' 
          ? { ...paso, estado: 'error' as const, detalle: 'Error' }
          : paso
      ))
      setResumenGuardado('❌ Error al guardar la cotización. Intenta de nuevo.')
      setResultadoGuardado('error')
      
      // Intentar rollback si se creó una versión
      if (versionCreada && versionAnterior) {
        await rollbackGuardado(versionCreada, versionAnterior)
      }
      
      // Limpiar estados
      setGuardandoCotizacion(false)
      setMensajeGuardado('')
      idVersionCreadaRef.current = null
      idVersionAnteriorRef.current = null
      abortControllerRef.current = null
    }
  }

  // ==================== FIN FUNCIONES AUXILIARES ====================

  // Funciones para PDF y Guardar Configuración
  const handleDescargarPdf = async () => {
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
    // ✅ Cargar jsPDF solo cuando se necesita
    const jsPDF = await loadJsPDF()
    const ultimoSnapshot = snapshots[snapshots.length - 1]
    generarPdfDesdeSnapshot(ultimoSnapshot, jsPDF)
  }

  const generarPdfDesdeSnapshot = (snapshot: PackageSnapshot, jsPDF: any) => {
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
  // Lógica de indicadores:
  // - ✓ aparece cuando el tab está validado correctamente Y no hay edición pendiente
  // - hasChanges (punto amarillo) aparece cuando hay edición en progreso
  const getOfertaLabel = () => {
    // Si está en modo edición, no mostrar check (está pendiente)
    if (modoEdicionPaquete) return 'Oferta'
    // Si no está en modo edición y hay servicios base, está OK
    if (serviciosBase && serviciosBase.length > 0) return 'Oferta ✓'
    return 'Oferta'
  }
  
  const pageTabs: TabItem[] = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <LineChart className="w-4 h-4" />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
    {
      id: 'cotizacion',
      label: `Cotización${estadoValidacionTabs.cotizacion === 'ok' ? ' ✓' : ''}`,
      icon: <FileText className="w-4 h-4" />,
      content: <div />, // Placeholder
      hasChanges: estadoValidacionTabs.cotizacion === 'error',
    },
    {
      id: 'oferta',
      label: getOfertaLabel(),
      icon: <Globe className="w-4 h-4" />,
      content: <div />, // Placeholder
      hasChanges: modoEdicionPaquete, // Punto amarillo solo cuando está en modo edición
    },
    {
      id: 'contenido',
      label: 'Contenido',
      icon: <Book className="w-4 h-4" />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: <Users className="w-4 h-4" />,
      content: <div />, // Placeholder
      hasChanges: false,
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <History className="w-4 h-4" />,
      content: <div />,
      hasChanges: false,
    },
    {
      id: 'preferencias',
      label: 'Preferencias',
      icon: <Settings className="w-4 h-4" />,
      content: <div />,
      hasChanges: false,
    },
  ]

  // ✅ Mostrar loading mientras verifica sesión (sin bloquear rendering)
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gh-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gh-accent" />
      </div>
    )
  }

  // ✅ No mostrar nada si no está autenticado (el useEffect hará redirect)
  if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null
  }

  return (
    <AnalyticsProvider>
      <div 
        className="relative min-h-screen text-gh-text"
        style={{
          background: 'linear-gradient(135deg, #0d1117ff 0%, #161b22 25%, #0d1117 50%, #161b22 75%, #0d1117ff 100%)'
        }}
      >
      {/* Overlay con efecto de luz sutil */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 0%, rgba(88, 166, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(56, 139, 253, 0.05) 0%, transparent 50%)'
        }}
      />
      <Navigation />
      
      {/* Barra de estado inferior moderna con glassmorphism - SIEMPRE visible por encima de todo */}
      <div className="fixed bottom-0 left-0 right-0 z-[1200]">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gh-border to-transparent" />
        <div className={`h-7 backdrop-blur-md flex items-center justify-between px-4 text-[10px] select-none ${
          guardandoCotizacion 
            ? 'bg-blue-950/20' 
            : 'bg-gh-bg/80'
        }`}>
          {/* Lado izquierdo - Estado de conexión o mensaje de guardado */}
          <div className="flex items-center gap-3">
            {/* Mostrar mensaje de guardado si está activo */}
            {guardandoCotizacion && mensajeGuardado ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-2.5 h-2.5 text-blue-500 animate-spin" />
                <span className="text-[11px] font-medium text-gh-text-muted">{mensajeGuardado}</span>
              </div>
            ) : (
              <>
                <SyncStatusIndicator
                  status={syncStatus}
                  isOnline={isOnline}
                  isDirty={hasUnsavedChanges}
                  showText={true}
                  size="sm"
                  loadingPhase={loadingPhase}
                  variant="statusbar"
                />
                {/* Cotización activa */}
                {quotationEnModal?.numero && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gh-info/10 border border-gh-info/20">
                    <FileText className="w-2 h-2 text-gh-info" />
                    <span className="text-gh-info font-medium">{quotationEnModal.numero}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Lado derecho - Info adicional */}
          <div className="flex items-center gap-3 text-gh-text-secondary">
            <div className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-gh-success animate-pulse" />
              <span className="font-medium">Admin</span>
            </div>
            <div className="w-px h-3 bg-gh-border" />
            <span className="tabular-nums opacity-60">
              {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de resolución de conflictos de conexión */}
      {showConnectionRecoveryDialog && connectionRecovery.differences && connectionRecovery.differences.length > 0 && (
        <DialogoGenerico
          isOpen={showConnectionRecoveryDialog}
          onClose={() => setShowConnectionRecoveryDialog(false)}
          title="✅ Conexión restablecida"
          description="Se detectaron cambios. Compara los datos del caché con la base de datos."
          type="info"
          size="lg"
          zIndex={100}
          footer={
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleConnectionRecoveryResolve('use-cache')}
                disabled={isResolvingRecovery}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all"
              >
                📦 Usar Caché
              </button>
              <button
                onClick={() => handleConnectionRecoveryResolve('use-server')}
                disabled={isResolvingRecovery}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                🔄 Usar BD
              </button>
              <button
                onClick={() => handleConnectionRecoveryResolve('merge')}
                disabled={isResolvingRecovery}
                className="px-4 py-2 bg-gh-success text-white rounded-lg hover:bg-gh-success-hover disabled:opacity-50 transition-all"
              >
                ✨ Fusionar
              </button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gh-border">
                  <th className="text-left p-3 font-semibold text-gh-text-muted bg-gh-bg-secondary">Campo</th>
                  <th className="text-left p-3 font-semibold text-gh-text-muted bg-gh-bg-secondary">Caché</th>
                  <th className="text-left p-3 font-semibold text-gh-text-muted bg-gh-bg-secondary">Base de Datos</th>
                </tr>
              </thead>
              <tbody>
                {connectionRecovery.differences.map((diff, idx) => (
                  <tr key={idx} className="border-b border-gh-border hover:bg-gh-bg-secondary/50 transition-colors">
                    <td className="p-3 font-medium text-gh-text">{diff.field}</td>
                    <td className="p-3 text-amber-600 font-mono break-words max-w-sm">
                      {typeof diff.cacheValue === 'string' ? diff.cacheValue : JSON.stringify(diff.cacheValue)}
                    </td>
                    <td className="p-3 text-blue-600 font-mono break-words max-w-sm">
                      {typeof diff.serverValue === 'string' ? diff.serverValue : JSON.stringify(diff.serverValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogoGenerico>
      )}

      {/* Modal #3: Lista simple de cotizaciones post-eliminación */}
      <DialogoGenerico
        isOpen={modalListaCotizacionesPostEliminacion}
        onClose={() => {
          setModalListaCotizacionesPostEliminacion(false)
          setModoSeleccionCotizacion(false)
        }}
        title="Cotizaciones Disponibles"
        icon={FileText}
        type="info"
        size="lg"
        variant="premium"
        zIndex={100}
      >
        <p className="text-[#8b949e] text-sm mb-4">
          Selecciona una cotización para ver su historial de versiones
        </p>
        <div className="space-y-3">
          {quotations.length === 0 ? (
            <p className="text-center text-[#8b949e] py-8">No hay cotizaciones disponibles</p>
          ) : (
            quotations.map((quotation, index) => (
              <motion.div
                key={quotation.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-[#161b22] hover:bg-[#1c2128] rounded-lg border border-[#30363d] hover:border-[#58a6ff]/50 transition-all cursor-pointer group"
                onClick={() => {
                  setCotizacionSeleccionadaPostEliminacion(quotation as QuotationConfig)
                  setModalListaCotizacionesPostEliminacion(false)
                  setModalTimelinePostEliminacion(true)
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#c9d1d9]">#{quotation.numero}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      v.{quotation.versionNumber}
                    </span>
                  </div>
                  <p className="text-sm text-[#8b949e]">{quotation.empresa || 'Sin empresa'}</p>
                  <p className="text-xs text-[#6e7681]">
                    {new Date(quotation.updatedAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#58a6ff]/10 group-hover:bg-[#58a6ff]/20 text-[#58a6ff] text-sm font-semibold rounded-lg border border-[#58a6ff]/30 transition-colors">
                  <History className="w-3.5 h-3.5" /> Ver Historial
                </div>
              </motion.div>
            ))
          )}
        </div>
      </DialogoGenerico>

      {/* Modal #4: Timeline de versiones post-eliminación (con botón Activar Esta) */}
      <DialogoGenerico
        isOpen={modalTimelinePostEliminacion && cotizacionSeleccionadaPostEliminacion !== null}
        onClose={() => {
          setModalTimelinePostEliminacion(false)
          setCotizacionSeleccionadaPostEliminacion(null)
          // Volver a la lista de cotizaciones
          setModalListaCotizacionesPostEliminacion(true)
        }}
        title={`Historial de Cotización #${cotizacionSeleccionadaPostEliminacion?.numero || ''}`}
        icon={History}
        type="info"
        size="5xl"
        variant="premium"
        zIndex={100}
      >
        {cotizacionSeleccionadaPostEliminacion && (
          <CotizacionTimeline
            cotizacionActual={cotizacionSeleccionadaPostEliminacion}
            versiones={quotations.filter(q => 
              extractBaseQuotationNumber(q.numero) === extractBaseQuotationNumber(cotizacionSeleccionadaPostEliminacion.numero)
            ) as QuotationConfig[]}
            onRestaurar={(version) => {
              setModalTimelinePostEliminacion(false)
              setCotizacionSeleccionadaPostEliminacion(null)
              setModoSeleccionCotizacion(false)
              handleRestaurarVersion(version)
            }}
            onDuplicar={(version) => {
              setModalTimelinePostEliminacion(false)
              setCotizacionSeleccionadaPostEliminacion(null)
              setModoSeleccionCotizacion(false)
              handleDuplicarVersion(version)
            }}
            showActivateButton={true}
            onActivarCotizacion={async (quotationId) => {
              await desactivarTodas(quotationId)
              setModalTimelinePostEliminacion(false)
              setCotizacionSeleccionadaPostEliminacion(null)
              setModoSeleccionCotizacion(false)
              toast.success('✅ Cotización activada correctamente')
              await recargarQuotations()
              const cotizacionActivada = quotations.find(q => q.id === quotationId)
              if (cotizacionActivada) {
                setCotizacionConfig(cotizacionActivada as QuotationConfig)
              }
            }}
          />
        )}
      </DialogoGenerico>
      
      {/* 🟢 LAYOUT PRINCIPAL CON SIDEBAR UNIFICADA */}
      <div className="flex relative z-10 pt-[60px]">
        {/* SIDEBAR UNIFICADA - Nueva (anchura dinámica) */}
        <aside className={`${isCompact ? 'w-16' : 'w-56'} flex-shrink-0 sticky top-[60px] h-[calc(100vh-60px-28px)] overflow-hidden transition-all duration-300`}>
          <Suspense fallback={<ComponentLoader />}>
            <UnifiedAdminSidebar 
              onSectionChange={handleSidebarSectionChange}
            />
          </Suspense>
        </aside>
        
        {/* CONTENIDO PRINCIPAL - Modificado para flex-1 y ancho completo */}
        <main className="flex-1 min-w-0 pb-12">
          <div className="w-full py-6 px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header Minimalista */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Panel Administrativo
                  </h1>
                  <p className="text-[11px] text-white/40 mt-1">
                    Gestión integral de la plataforma NovaSuite
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDescargarPdf}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all flex items-center gap-2 text-xs font-medium backdrop-blur-md"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={crearNuevaCotizacion}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all flex items-center gap-2 text-xs font-medium backdrop-blur-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nueva Cotización
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={mostrarConfirmacionGuardar}
                    className="px-4 py-2 bg-gh-success/20 hover:bg-gh-success/30 text-gh-success rounded-xl border border-gh-success/30 transition-all flex items-center gap-2 text-xs font-bold backdrop-blur-md"
                  >
                    <Save className="w-3.5 h-3.5" /> Guardar Cambios
                  </motion.button>
                </div>
              </div>

          {/* Tab Navigation */}
          <Suspense fallback={<ComponentLoader />}>
            <div>
              <TabsModal
                tabs={pageTabs}
                activeTab={activePageTab}
                onTabChange={handleCambioTab}
              />
            </div>
          </Suspense>

          {/* Tab Content - usando componentes con transparencia y blur */}
          <div className="bg-transparent rounded-b-md border-b border-l border-r border-gh-border backdrop-blur-[2px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePageTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* TAB 0: ANALYTICS */}
                {activePageTab === 'analytics' && (
                  <Suspense fallback={<ComponentLoader />}>
                    <AnalyticsTab 
                      activeSectionId={activeSidebarSection}
                      snapshots={snapshots as any}
                      cargandoSnapshots={cargandoSnapshots}
                    />
                  </Suspense>
                )}

                {/* TAB: SALES */}
                {activePageTab === 'sales' && (
                  <ModulePlaceholderTab 
                    title="Módulo de Ventas" 
                    description="Gestión de pedidos, facturación y descuentos." 
                    icon={ShoppingCart} 
                  />
                )}

                {/* TAB: INVENTORY */}
                {activePageTab === 'inventory' && (
                  <ModulePlaceholderTab 
                    title="Módulo de Inventario" 
                    description="Control de stock, productos y movimientos." 
                    icon={Package} 
                  />
                )}

                {/* TAB: FINANCE */}
                {activePageTab === 'finance' && (
                  <ModulePlaceholderTab 
                    title="Módulo de Finanzas" 
                    description="Cuentas por cobrar, pagar e impuestos." 
                    icon={Wallet} 
                  />
                )}

                {/* TAB: PEOPLE */}
                {activePageTab === 'people' && (
                  <ModulePlaceholderTab 
                    title="Módulo de Personal" 
                    description="Gestión de empleados y nómina." 
                    icon={Users} 
                  />
                )}

                {/* TAB: PROJECTS */}
                {activePageTab === 'projects' && (
                  <ModulePlaceholderTab 
                    title="Módulo de Proyectos" 
                    description="Gestión de proyectos y tareas." 
                    icon={Briefcase} 
                  />
                )}

                {/* TAB: POS */}
                {activePageTab === 'pos' && (
                  <ModulePlaceholderTab 
                    title="Módulo POS" 
                    description="Terminal de punto de venta y cierre de caja." 
                    icon={Monitor} 
                  />
                )}

                {/* TAB: ECOMMERCE */}
                {activePageTab === 'ecommerce' && (
                  <ModulePlaceholderTab 
                    title="Módulo eCommerce" 
                    description="Gestión de tiendas online y pedidos web." 
                    icon={Globe} 
                  />
                )}

                {/* TAB: LICENSING */}
                {activePageTab === 'licensing' && (
                  <ModulePlaceholderTab 
                    title="Módulo de Licenciamiento" 
                    description="Gestión de suscripciones y planes." 
                    icon={Key} 
                  />
                )}

                {/* TAB 1: COTIZACIÓN */}
                {activePageTab === 'cotizacion' && (
                  <Suspense fallback={<ComponentLoader />}>
                    <CotizacionTab
                      activeSectionId={activeSidebarSection}
                      cotizacionConfig={cotizacionConfig as any}
                      setCotizacionConfig={setCotizacionConfig as any}
                      erroresValidacionCotizacion={erroresValidacionCotizacion}
                      setErroresValidacionCotizacion={setErroresValidacionCotizacion}
                      validarEmail={validarEmail}
                      validarWhatsApp={validarWhatsApp}
                      validarFechas={validarFechas}
                      formatearFechaLarga={formatearFechaLarga}
                      calcularFechaVencimiento={calcularFechaVencimiento}
                    />
                  </Suspense>
                )}

                {/* TAB 2: OFERTA */}
                {activePageTab === 'oferta' && (
                  <Suspense fallback={<ComponentLoader />}>
                    <OfertaTab
                    activeSectionId={activeSidebarSection}
                    serviciosBase={serviciosBase as any}
                    setServiciosBase={setServiciosBase as any}
                    nuevoServicioBase={nuevoServicioBase as any}
                    setNuevoServicioBase={setNuevoServicioBase as any}
                    editandoServicioBaseId={editandoServicioBaseId}
                    setEditandoServicioBaseId={setEditandoServicioBaseId}
                    servicioBaseEditando={servicioBaseEditando as any}
                    setServicioBaseEditando={setServicioBaseEditando as any}
                    paqueteActual={paqueteActual as any}
                    setPaqueteActual={setPaqueteActual as any}
                    serviciosOpcionales={serviciosOpcionales as any}
                    setServiciosOpcionales={setServiciosOpcionales as any}
                    nuevoServicio={nuevoServicio as any}
                    setNuevoServicio={setNuevoServicio as any}
                    editandoServicioId={editandoServicioId}
                    setEditandoServicioId={setEditandoServicioId}
                    servicioEditando={servicioEditando as any}
                    setServicioEditando={setServicioEditando as any}
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
                    cotizacionConfig={cotizacionConfig as any}
                    onCompararPaquete={handleCompararPaquete}
                    onCompararPaqueteIndividual={handleCompararPaqueteIndividual}
                    paqueteParaComparar={paqueteParaComparar}
                    // Props para FinancieroContent
                    opcionesPago={opcionesPagoActual as any}
                    setOpcionesPago={setOpcionesPagoActual}
                    metodoPagoPreferido={metodoPagoPreferido as any}
                    setMetodoPagoPreferido={setMetodoPagoPreferido}
                    notasPago={notasPago as any}
                    setNotasPago={setNotasPago}
                    metodosPreferidos={metodosPreferidos}
                    setMetodosPreferidos={setMetodosPreferidos}
                    configDescuentos={configDescuentosActual as any}
                    setConfigDescuentos={(c: any) => setConfigDescuentosActual(c)}
                    // Props para modo edición del paquete (descripción)
                    modoEdicionPaquete={modoEdicionPaquete}
                    setModoEdicionPaquete={setModoEdicionPaquete}
                    // Props para templates de descripción de paquete
                    descripcionesTemplate={descripcionesTemplate as any}
                    setDescripcionesTemplate={(t: any) => setDescripcionesTemplate(t)}
                    // Props para Características de Paquetes
                    paquetesCaracteristicasData={paquetesCaracteristicasData}
                    onPaquetesCaracteristicasChange={handlePaquetesCaracteristicasChange}
                    // Indica si la configuración aún está cargando (para evitar flash de reordenamiento)
                    isConfigLoading={!initialLoad.isComplete}
                    // Props para Métodos de Pago (contenido)
                    metodosPagoData={metodosPagoOfertaData}
                    onMetodosPagoChange={handleMetodosPagoOfertaChange}
                    // Props para Financial Templates
                    financialTemplates={financialTemplates as any}
                    setFinancialTemplates={setFinancialTemplates as any}
                    onSaveFinancialTemplate={handleSaveFinancialTemplate}
                    onUpdateFinancialTemplate={handleUpdateFinancialTemplate}
                    onDeleteFinancialTemplate={handleDeleteFinancialTemplate}
                    onNuevaOfertaFinanciera={handleNuevaOfertaFinanciera}
                  />
                  </Suspense>
                )}

                {/* TAB 3: CONTENIDO */}
                {activePageTab === 'contenido' && (
                  <Suspense fallback={<ComponentLoader />}>
                    <ContenidoTab
                    activeSectionId={activeSidebarSection}
                    cotizacionConfig={cotizacionConfig as any}
                    setCotizacionConfig={setCotizacionConfig as any}
                    onSave={async (config: QuotationConfig) => {
                      try {
                        const response = await fetch(`/api/quotation-config/${config.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(config)
                        })
                        if (!response.ok) throw new Error('Error al guardar')
                        const result = await response.json()
                        if (result.success) {
                          // Actualizar quotations y cotizacionConfig con los datos devueltos
                          useDataStore.getState().updateQuotations((prev: any) => prev.map((q: any) => 
                            q.id === config.id ? result.data : q
                          ))
                          setCotizacionConfig(result.data)
                        }
                      } catch (error) {
                        console.error('Error guardando contenido:', error)
                        throw error
                      }
                    }}
                    onSaveSeccion={async (id: string, seccion: string, datos: unknown, timestamp: string, visibilidad?: Record<string, boolean>) => {
                      // API optimizada: solo envía la sección que cambió + visibilidad
                      const response = await fetch(`/api/quotation-config/${id}/contenido`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ seccion, datos, timestamp, visibilidad })
                      })
                      if (!response.ok) throw new Error('Error al guardar sección')
                      const result = await response.json()
                      if (result.success) {
                        // Actualizar quotations y cotizacionConfig con los datos devueltos
                        useDataStore.getState().updateQuotations((prev: any) => prev.map((q: any) => 
                          q.id === id ? result.data : q
                        ))
                        setCotizacionConfig(result.data)
                        console.log(`[OPTIMIZADO] Guardado exitoso: ${result.meta?.payloadSize || 'N/A'} bytes`)
                      }
                    }}
                    toast={{ 
                      success: (m) => toast.success(m), 
                      error: (m) => toast.error(m),
                      info: (m) => toast.info(m), 
                      warning: (m) => toast.warning(m) 
                    }}
                  />
                  </Suspense>
                )}

                {/* TAB 5: PREFERENCIAS */}
                {activePageTab === 'preferencias' && (
                  <Suspense fallback={<ComponentLoader />}>
                    <PreferenciasTab
                    activeSectionId={activeSidebarSection}
                    quotations={quotations.map(q => ({ id: q.id, nombre: q.empresa, numero: q.numero }))}
                    guardarPreferencias={async () => {
                      try {
                        await useUserPreferencesStore.getState().persistPreferences()
                        const prefs = useUserPreferencesStore.getState()
                        cachePreferences(prefs as any)

                        const valor = prefs.intervaloVerificacionConexion || 30
                        const unidad = prefs.unidadIntervaloConexion || 'segundos'
                        const nuevoIntervalo = unidad === 'minutos' ? valor * 60 * 1000 : valor * 1000
                        connectionPolling.setInterval(nuevoIntervalo)
                        console.log(`⏱️ Intervalo de polling actualizado al guardar: ${nuevoIntervalo}ms`)

                        toast.success('✓ Preferencias guardadas correctamente')
                      } catch (error) {
                        console.error('Error guardando preferencias:', error)
                        toast.error('Error al guardar preferencias')
                      }
                    }}
                  />
                  </Suspense>
                )}

                {/* TAB 6: HISTORIAL */}
                {activePageTab === 'historial' && (
                  <div className="p-6">
                    <Historial 
                      quotations={quotations} 
                      snapshots={snapshots}
                      showActivateButton={modoSeleccionCotizacion}
                      onEdit={(quotation) => {
                        abrirModalEditar(quotation)
                      }}
                      onRestaurarVersion={handleRestaurarVersion}
                      onDuplicarVersion={handleDuplicarVersion}
                      onActivarCotizacion={async (quotationId) => {
                        // Handler para activar cotización desde el modo selección
                        await desactivarTodas(quotationId)
                        setModoSeleccionCotizacion(false)
                        toast.success('✅ Cotización activada correctamente')
                        await recargarQuotations()
                        // Cargar la cotización activada
                        const cotizacionActivada = quotations.find(q => q.id === quotationId)
                        if (cotizacionActivada) {
                          setCotizacionConfig(cotizacionActivada as QuotationConfig)
                        }
                      }}
                      onDelete={(quotationId) => {
                        // Verificar si es la cotización activa
                        const esCotizacionActiva = cotizacionConfig?.id === quotationId
                        
                        if (esCotizacionActiva) {
                          // Guardar el ID para eliminar después de confirmación
                          setQuotationIdPendienteEliminar(quotationId)
                          // Mostrar diálogo de confirmación
                          mostrarDialogoGenerico({
                            tipo: 'warning',
                            titulo: '¿Eliminar Cotización Activa?',
                            icono: '🗑️',
                            mensaje: 'Estás a punto de eliminar la cotización que está actualmente activa. Después de eliminarla, deberás crear una nueva o activar una existente.',
                            botones: [
                              {
                                label: 'Cancelar',
                                style: 'secondary',
                                action: () => {
                                  setQuotationIdPendienteEliminar(null)
                                  cerrarDialogoGenerico()
                                },
                              },
                              {
                                label: 'Eliminar',
                                style: 'danger',
                                action: async () => {
                                  cerrarDialogoGenerico()
                                  await ejecutarEliminacionCotizacion(quotationId)
                                  return false // Evitar que el renderizado cierre el diálogo recién abierto
                                },
                              },
                            ],
                          })
                        } else {
                          // No es activa, eliminar directamente con confirmación simple
                          mostrarDialogoGenerico({
                            tipo: 'warning',
                            titulo: 'Confirmar Eliminación',
                            icono: '🗑️',
                            mensaje: '¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.',
                            botones: [
                              {
                                label: 'Cancelar',
                                style: 'secondary',
                                action: () => cerrarDialogoGenerico(),
                              },
                              {
                                label: 'Eliminar',
                                style: 'danger',
                                action: async () => {
                                  cerrarDialogoGenerico()
                                  await ejecutarEliminacionCotizacionSimple(quotationId)
                                },
                              },
                            ],
                          })
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
                  </div>
                )}

                {/* TAB 7: CRM */}
                {activePageTab === 'crm' && (
                  <Suspense fallback={<ComponentLoader />}>
                    <CrmTab activeSectionId={activeSidebarSection} />
                  </Suspense>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
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
                    <Edit className="w-4.5 h-4.5 text-white" />
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
                  <X />
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
                          // Inicializar configDescuentos si no existe (fix: descuentos servicios opcionales)
                          const snapshotConDescuentos = {
                            ...snapshot,
                            paquete: {
                              ...snapshot.paquete,
                              configDescuentos: snapshot.paquete.configDescuentos || getDefaultConfigDescuentos(),
                            },
                          }
                          setSnapshotEditando(snapshotConDescuentos)
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
                      icon: <FileText />,
                      hasChanges: pestañaTieneCambios('descripcion'),
                      content: (
                        <div className="space-y-6">
                          {/* Fila 1: nombre, tipo, tagline, tiempo de entrega, costo desarrollo */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
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
                              {(() => {
                                const TIPOS_PAQUETE_MODAL = [
                                  { value: '', label: 'Seleccionar...' },
                                  { value: 'Básico', label: 'Básico' },
                                  { value: 'Profesional', label: 'Profesional' },
                                  { value: 'Avanzado', label: 'Avanzado' },
                                  { value: 'Premium', label: 'Premium' },
                                  { value: 'Enterprise', label: 'Enterprise' },
                                  { value: 'VIP', label: 'VIP' },
                                ]
                                const tipoActual = snapshotEditando.paquete.tipo || ''
                                const esPredefinido = TIPOS_PAQUETE_MODAL.some(t => t.value === tipoActual)
                                
                                if (!esPredefinido && tipoActual !== '') {
                                  // Mostrar el valor personalizado como input
                                  return (
                                    <div className="flex gap-1">
                                      <input
                                        type="text"
                                        value={tipoActual}
                                        onChange={(e) => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tipo: e.target.value}})}
                                        disabled={readOnly}
                                        className={`flex-1 px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9]`}
                                      />
                                      {!readOnly && (
                                        <button
                                          type="button"
                                          onClick={() => setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tipo: ''}})}
                                          className="px-2 py-1.5 bg-[#30363d] text-[#8b949e] rounded-md hover:bg-[#3d444d] transition-colors text-[10px]"
                                          title="Volver a lista"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  )
                                }
                                
                                return (
                                  <DropdownSelect
                                    value={tipoActual}
                                    onChange={(val) => {
                                      if (val === '__custom__') {
                                        setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tipo: ''}})
                                        // El próximo render mostrará el input porque tipo será '' pero queremos mostrar input
                                        // Usamos un valor especial temporal
                                        setTimeout(() => {
                                          const input = document.querySelector('input[data-custom-tipo]') as HTMLInputElement
                                          if (input) input.focus()
                                        }, 0)
                                      } else {
                                        setSnapshotEditando({...snapshotEditando, paquete: {...snapshotEditando.paquete, tipo: val}})
                                      }
                                    }}
                                    disabled={readOnly}
                                    options={[
                                      ...TIPOS_PAQUETE_MODAL.map((tipo) => ({
                                        value: tipo.value,
                                        label: tipo.label
                                      })),
                                      { value: '__custom__', label: '✏️ Personalizado...' }
                                    ]}
                                  />
                                )
                              })()}
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
                            <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Descripción de la oferta</label>
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
                              <div className="text-5xl mb-2">🏅</div>
                              <div className="text-[10px] text-[#8b949e] mb-3 bg-[#21262d]/50 px-2 py-1 rounded inline-block">Emoji asignado automáticamente según costo</div>
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
                        icon: <Globe />,
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
                        icon: <Headphones />,
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
                                        <Trash2 className="w-3 h-3" />
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
                                <Plus className="w-2.5 h-2.5" /> Agregar Servicio
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
                          <div className="grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-6">
                
                {/* COLUMNA IZQUIERDA: Opciones de Pago */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#c9d1d9] mb-2 flex items-center gap-2">
                    <CreditCard /> Opciones de Pago
                  </h3>

                  {/* Desarrollo en la misma sección */}
                  <div>
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
                  <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-bold text-[#c9d1d9] mb-2 flex items-center gap-2">
                        Esquema de Pagos (Debe sumar 100%)
                      </h4>
                      {(() => {
                        const opcionesPago = snapshotEditando.paquete.opcionesPago || []
                        const totalPorcentaje = opcionesPago.reduce((sum: number, op: any) => sum + (op.porcentaje || 0), 0)
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
                        {(snapshotEditando.paquete.opcionesPago || []).map((opcion: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#161b22] border border-[#30363d] rounded-md p-3 grid md:grid-cols-[1.1fr,0.5fr,3fr,auto] gap-2 items-end"
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
                            <div className="flex flex-col">
                              <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">
                                Descripción
                              </label>
                              <textarea
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
                                rows={1}
                                className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#0d1117]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9] resize-y min-h-[32px]`}
                                placeholder="Ej: Al firmar contrato"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const actualizado = (snapshotEditando.paquete.opcionesPago || []).filter(
                                  (_: any, i: number) => i !== idx
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
                              <Trash2 className="w-2.5 h-2.5" />
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
                      <Plus className="w-2.5 h-2.5" /> Agregar Opción
                    </button>
                  </div>

                  {/* Vista Previa de Montos */}
                  {(snapshotEditando.paquete.opcionesPago || []).length > 0 && snapshotEditando.paquete.desarrollo > 0 && (
                    <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                      <h4 className="text-[10px] font-bold text-[#c9d1d9] mb-2">Vista Previa</h4>
                      <div className="space-y-1">
                        {(snapshotEditando.paquete.opcionesPago || []).map((opcion: any, idx: number) => {
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

                {/* COLUMNA DERECHA: Métodos de Pago Preferidos + Notas */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#c9d1d9] mb-2 flex items-center gap-2">
                    💳 Métodos de Pago Preferidos
                  </h3>

                  {/* Lista de métodos preferidos */}
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {(snapshotEditando.paquete.metodosPreferidos || []).map((metodo: any, index: number) => (
                      <div 
                        key={metodo.id} 
                        className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-[#8b949e]">
                            Método #{index + 1}
                          </span>
                          {!readOnly && (
                            <button
                              onClick={() => {
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  paquete: {
                                    ...snapshotEditando.paquete,
                                    metodosPreferidos: (snapshotEditando.paquete.metodosPreferidos || []).filter((m: any) => m.id !== metodo.id),
                                  },
                                })
                              }}
                              className="p-1 text-[#f85149] hover:bg-[#f85149]/10 rounded transition-colors"
                              title="Eliminar método"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-[1fr_2fr] gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-[#c9d1d9] mb-1">
                              Método de Pago
                            </label>
                            <DropdownSelect
                              value={metodo.metodo}
                              onChange={(val) => {
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  paquete: {
                                    ...snapshotEditando.paquete,
                                    metodosPreferidos: (snapshotEditando.paquete.metodosPreferidos || []).map((m: any) => 
                                      m.id === metodo.id ? { ...m, metodo: val } : m
                                    ),
                                  },
                                })
                              }}
                              disabled={readOnly}
                              options={[
                                { value: '', label: 'Seleccionar...' },
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
                            <label className="block text-[10px] font-medium text-[#c9d1d9] mb-1">
                              📝 Nota para este método
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Ej: Cuenta: XXXX-XXXX, a nombre de..."
                              value={metodo.nota}
                              onChange={(e) => {
                                setSnapshotEditando({
                                  ...snapshotEditando,
                                  paquete: {
                                    ...snapshotEditando.paquete,
                                    metodosPreferidos: (snapshotEditando.paquete.metodosPreferidos || []).map((m: any) => 
                                      m.id === metodo.id ? { ...m, nota: e.target.value } : m
                                    ),
                                  },
                                })
                              }}
                              disabled={readOnly}
                              className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed resize-none' : 'bg-[#161b22]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9] resize-none`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!snapshotEditando.paquete.metodosPreferidos || snapshotEditando.paquete.metodosPreferidos.length === 0) && (
                      <div className="text-center py-4 text-[#8b949e] text-xs border border-dashed border-[#30363d] rounded-lg">
                        No hay métodos de pago preferidos configurados
                      </div>
                    )}
                  </div>
                  
                  {!readOnly && (
                    <button
                      onClick={() => {
                        const nuevoMetodo: MetodoPreferido = {
                          id: `metodo-${Date.now()}`,
                          metodo: '',
                          nota: ''
                        }
                        setSnapshotEditando({
                          ...snapshotEditando,
                          paquete: {
                            ...snapshotEditando.paquete,
                            metodosPreferidos: [...(snapshotEditando.paquete.metodosPreferidos || []), nuevoMetodo],
                          },
                        })
                      }}
                      className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors flex items-center gap-2 font-medium text-xs"
                    >
                      <Plus className="w-2.5 h-2.5" /> Agregar Método Preferido
                    </button>
                  )}

                  {/* Notas de Pago Generales */}
                  <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md flex-1 mt-3 pt-3 border-t border-[#30363d]">
                    <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-1">
                      📋 Notas de Pago Generales
                    </label>
                    <textarea
                      value={snapshotEditando.paquete.notasPago || ''}
                      onChange={(e) =>
                        setSnapshotEditando({
                          ...snapshotEditando,
                          paquete: {
                            ...snapshotEditando.paquete,
                            notasPago: e.target.value,
                          },
                        })
                      }
                      placeholder="Ej: Pago inicial del 50%, resto a la entrega..."
                      disabled={readOnly}
                      rows={3}
                      className={`w-full px-2 py-1.5 rounded-md ${readOnly ? 'bg-[#21262d] text-[#8b949e] cursor-not-allowed' : 'bg-[#161b22]'} border border-[#30363d] ${!readOnly && 'focus:border-[#58a6ff] focus:outline-none'} text-xs text-[#c9d1d9] resize-y min-h-[60px]`}
                    />
                    <p className="text-[9px] text-[#8b949e] mt-1">
                      Notas generales sobre el proceso de pago, facturación, etc.
                    </p>
                  </div>
                </div>
                          </div>
                        ),
                      },
                      {
                        id: 'descuentos',
                        label: 'Descuentos',
                        icon: <Percent />,
                        hasChanges: pestañaTieneCambios('descuentos'),
                        content: (
                          <div className="space-y-4">
                            {/* SECCIÓN 1: Tipo de Descuento (mutuamente excluyentes) */}
                            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-3">
                              <h3 className="text-xs font-bold text-[#c9d1d9] mb-3 flex items-center gap-2">
                                <Tags className="w-2.5 h-2.5 text-[#58a6ff]" />
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
                                  <Percent className="w-2.5 h-2.5 text-[#3fb950]" />
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
                                  <Tags className="w-2.5 h-2.5 text-[#f0883e]" />
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
                                <Gift className="w-2.5 h-2.5 text-[#58a6ff]" />
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
                                  <Eye className="w-2.5 h-2.5 text-[#58a6ff]" />
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
                                            <Percent className="w-2 h-2 text-[#f0883e]" />
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
                        icon: <FileText />,
                        hasChanges: pestañaTieneCambios('cotizacion'),
                        content: (
                          <div className="space-y-4">
                            {/* Fila 1: Títulos del Hero */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Título Principal (Hero)</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.heroTituloMain || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, heroTituloMain: e.target.value})}
                                  className="w-full px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-none text-xs text-[#c9d1d9]"
                                  placeholder="Propuesta de Cotización"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-[#c9d1d9] mb-0.5">Subtítulo (Hero)</label>
                                <input
                                  type="text"
                                  value={cotizacionActual.heroTituloSub || ''}
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, heroTituloSub: e.target.value})}
                                  className="w-full px-2 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:outline-none text-xs text-[#c9d1d9]"
                                  placeholder="Página Catálogo Dinámica"
                                />
                              </div>
                            </div>
                            {/* Fila 2: Número, Fecha, Validez */}
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
                                <DatePicker
                                  value={cotizacionActual.fechaEmision || null}
                                  onChange={(iso) => setCotizacionActual({...cotizacionActual, fechaEmision: iso || ''})}
                                  className="w-full"
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
                        icon: <User />,
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
                        icon: <Briefcase />,
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
                                  onChange={(e) => setCotizacionActual({...cotizacionActual, ubicacionProveedor: e.target.value} as any)}
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
                        icon: <FileText />,
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
                  {/* Indicador de guardando cotización completa */}
                  {!readOnly && guardandoCotizacion && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-[#f0883e] bg-gradient-to-r from-[#f0883e]/15 to-[#d29922]/10 px-4 py-1.5 rounded-lg flex items-center gap-2 border border-[#f0883e]/20 shadow-inner"
                    >
                      <svg className="animate-spin h-4 w-4 text-[#f0883e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      WebQuote está guardando información en la nube, espere por favor...
                    </motion.span>
                  )}
                  {!readOnly && !guardandoCotizacion && autoSaveStatus === 'saving' && (
                    <span className="text-sm text-[#c9d1d9] animate-pulse flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-[#58a6ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando cambios...
                    </span>
                  )}
                  {!readOnly && !guardandoCotizacion && autoSaveStatus === 'saved' && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm text-[#3fb950] flex items-center gap-2 bg-[#238636]/10 px-3 py-1.5 rounded-lg border border-[#238636]/20"
                    >
                      <Check className="text-[#3fb950]" /> Cambios guardados
                    </motion.span>
                  )}
                  {!readOnly && !guardandoCotizacion && autoSaveStatus === 'error' && (
                    <span className="text-sm text-[#f85149] flex items-center gap-2 bg-[#da3633]/10 px-3 py-1.5 rounded-lg border border-[#da3633]/20">
                      <AlertTriangle className="text-[#f85149]" /> Error al guardar. Reintentando...
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
                      <Check /> Guardar Cambios
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#30363d' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCerrarModalEditar}
                    className="py-2 px-5 bg-[#21262d] text-[#c9d1d9] rounded-lg hover:text-white border border-[#30363d] transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <X className="w-3 h-3" /> Cerrar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante FAB - Crear Paquete (solo visible en pestaña Oferta) */}
      <AnimatePresence>
        {todoEsValido && activePageTab === 'oferta' && (
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
              <Plus className="text-2xl transition-transform group-hover:rotate-90" />
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1000]"
            onClick={() => setMostrarDialogo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/5 w-full mx-4 bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#30363d] overflow-hidden ${
                datosDialogo.size === 'sm' ? 'max-w-sm' :
                datosDialogo.size === 'lg' ? 'max-w-lg' :
                datosDialogo.size === 'xl' ? 'max-w-xl' :
                datosDialogo.size === 'full' ? 'max-w-4xl' :
                'max-w-md'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                  datosDialogo.tipo === 'error' 
                    ? 'bg-gradient-to-br from-[#f85149] to-[#da3633] shadow-[#f85149]/20'
                    : datosDialogo.tipo === 'advertencia' 
                    ? 'bg-gradient-to-br from-[#d29922] to-[#e3b341] shadow-[#d29922]/20'
                    : datosDialogo.tipo === 'success' || datosDialogo.tipo === 'activar'
                    ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] shadow-[#238636]/20'
                    : 'bg-gradient-to-br from-[#58a6ff] to-[#388bfd] shadow-[#58a6ff]/20'
                }`}>
                  <AlertTriangle className="text-white text-sm" />
                </div>
                <h3 className="text-white font-semibold text-base">
                  {datosDialogo.titulo}
                </h3>
              </div>

              {/* Body */}
              <div className="px-4 py-4">
                {datosDialogo.subtitulo && (
                  <p className="text-xs text-[#8b949e] mb-2">{datosDialogo.subtitulo}</p>
                )}
                {datosDialogo.mensajeHTML ? (
                  <div 
                    className="text-[#c9d1d9] text-sm leading-relaxed max-h-[60vh] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: datosDialogo.mensajeHTML }}
                  />
                ) : (
                  <p className="text-[#c9d1d9] text-sm leading-relaxed whitespace-pre-line max-h-[60vh] overflow-y-auto">{datosDialogo.mensaje}</p>
                )}
                {/* Campo de input opcional */}
                {datosDialogo.input && (
                  <input
                    type={datosDialogo.input.type || 'text'}
                    value={dialogoInputValue}
                    onChange={(e) => setDialogoInputValue(e.target.value)}
                    placeholder={datosDialogo.input.placeholder}
                    className="mt-3 w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#6e7681] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/50 outline-none transition"
                    autoFocus
                  />
                )}
              </div>

              {/* Footer - Botones */}
              <div className="flex gap-3 px-4 py-3 border-t border-[#30363d] bg-[#161b22]/80 justify-end">
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
                      className="min-w-[90px] px-4 py-2 bg-gradient-to-r from-[#238636] to-[#2ea043] hover:opacity-90 text-white rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-[#238636]/20"
                    >
                      <Check className="w-3 h-3" /> Activar y Editar
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
                      className="min-w-[90px] px-4 py-2 bg-gradient-to-r from-[#238636] to-[#2ea043] hover:opacity-90 text-white rounded-md transition-all text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-[#238636]/20"
                    >
                      <Check className="w-3 h-3" /> Activar y Editar
                    </button>
                  </>
                ) : (
                  /* Botones genéricos */
                  datosDialogo.botones.map((boton, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        const resultado = await boton.action(dialogoInputValue)
                        // Solo cerrar si no retorna false explícitamente
                        if (resultado !== false) {
                          setMostrarDialogo(false)
                          setDialogoInputValue('')
                        }
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

      {/* ==================== MODAL PROGRESO GUARDADO ==================== */}
      <AnimatePresence>
        {showModalProgresoGuardado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1100]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/5 w-full mx-4 max-w-md bg-gradient-to-b from-[#161b22] to-[#0d1117] border overflow-hidden ${
                resultadoGuardado === 'exito' ? 'border-[#238636]' :
                resultadoGuardado === 'cancelado' ? 'border-[#d29922]' :
                resultadoGuardado === 'error' ? 'border-[#da3633]' :
                'border-[#30363d]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                  resultadoGuardado === 'exito' ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] shadow-[#238636]/20' :
                  resultadoGuardado === 'cancelado' ? 'bg-gradient-to-br from-[#d29922] to-[#e3b341] shadow-[#d29922]/20' :
                  resultadoGuardado === 'error' ? 'bg-gradient-to-br from-[#da3633] to-[#f85149] shadow-[#da3633]/20' :
                  'bg-gradient-to-br from-[#58a6ff] to-[#388bfd] shadow-[#58a6ff]/20'
                }`}>
                  {resultadoGuardado === 'exito' ? (
                    <Check className="text-white text-sm" />
                  ) : resultadoGuardado === 'cancelado' ? (
                    <AlertTriangle className="text-white text-sm" />
                  ) : resultadoGuardado === 'error' ? (
                    <X className="text-white text-sm" />
                  ) : (
                    <Loader2 className="text-white text-sm animate-spin" />
                  )}
                </div>
                <h3 className="text-white font-semibold text-base">
                  {resultadoGuardado === 'exito' ? '✅ Cotización Guardada' :
                   resultadoGuardado === 'cancelado' ? '⚠️ Guardado Cancelado' :
                   resultadoGuardado === 'error' ? '❌ Error al Guardar' :
                   '💾 Guardando Cotización...'}
                </h3>
              </div>

              {/* Body - Pasos */}
              <div className="px-4 py-4 space-y-3">
                {/* Lista de pasos */}
                <div className="space-y-2">
                  {pasosGuardado.map((paso) => (
                    <div key={paso.id} className="flex items-center gap-3">
                      {/* Icono de estado */}
                      <div className="w-5 h-5 flex items-center justify-center">
                        {paso.estado === 'completado' ? (
                          <Check className="text-[#238636] text-sm" />
                        ) : paso.estado === 'activo' ? (
                          <Loader2 className="text-[#58a6ff] text-sm animate-spin" />
                        ) : paso.estado === 'error' ? (
                          <X className="text-[#da3633] text-sm" />
                        ) : paso.estado === 'cancelado' ? (
                          <X className="text-[#d29922] text-sm" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#30363d]" />
                        )}
                      </div>
                      {/* Texto del paso */}
                      <div className="flex-1 flex items-center gap-2">
                        <span className={`text-sm ${
                          paso.estado === 'completado' ? 'text-[#c9d1d9]' :
                          paso.estado === 'activo' ? 'text-white font-medium' :
                          paso.estado === 'error' || paso.estado === 'cancelado' ? 'text-[#8b949e]' :
                          'text-[#484f58]'
                        }`}>
                          {paso.label}
                        </span>
                        {paso.detalle && (
                          <span className={`text-xs ${
                            paso.estado === 'error' ? 'text-[#da3633]' :
                            paso.estado === 'cancelado' ? 'text-[#d29922]' :
                            'text-[#8b949e]'
                          }`}>
                            {paso.detalle}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${
                        resultadoGuardado === 'exito' ? 'bg-gradient-to-r from-[#238636] to-[#2ea043]' :
                        resultadoGuardado === 'cancelado' ? 'bg-gradient-to-r from-[#d29922] to-[#e3b341]' :
                        resultadoGuardado === 'error' ? 'bg-gradient-to-r from-[#da3633] to-[#f85149]' :
                        'bg-gradient-to-r from-[#58a6ff] to-[#388bfd]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progresoGuardado}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-[#8b949e] tabular-nums">{progresoGuardado}%</span>
                  </div>
                </div>

                {/* Mensaje de advertencia durante guardado */}
                {resultadoGuardado === 'guardando' && (
                  <div className="mt-3 p-3 bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg">
                    <p className="text-[#e3b341] text-xs leading-relaxed">
                      ⚠️ Cancelar detendrá el proceso y revertirá cualquier cambio parcial en la base de datos.
                    </p>
                  </div>
                )}

                {/* Resumen final */}
                {resumenGuardado && resultadoGuardado !== 'guardando' && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    resultadoGuardado === 'exito' ? 'bg-[#238636]/10 border border-[#238636]/30' :
                    resultadoGuardado === 'cancelado' ? 'bg-[#d29922]/10 border border-[#d29922]/30' :
                    'bg-[#da3633]/10 border border-[#da3633]/30'
                  }`}>
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${
                      resultadoGuardado === 'exito' ? 'text-[#7ee787]' :
                      resultadoGuardado === 'cancelado' ? 'text-[#e3b341]' :
                      'text-[#f85149]'
                    }`}>
                      {resumenGuardado}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer - Botones */}
              <div className="flex gap-3 px-4 py-3 border-t border-[#30363d] bg-[#161b22]/80 justify-end">
                {resultadoGuardado === 'guardando' ? (
                  <button
                    onClick={confirmarCancelacionGuardado}
                    disabled={cancelarGuardadoSolicitado}
                    className="min-w-[160px] px-4 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded-md transition-colors text-sm font-medium border border-[#da3633] whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-3 h-3" />
                    Cancelar Guardado
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowModalProgresoGuardado(false)
                      setGuardandoCotizacion(false)
                      idVersionCreadaRef.current = null
                      idVersionAnteriorRef.current = null
                    }}
                    className={`min-w-[120px] px-4 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 ${
                      resultadoGuardado === 'exito' 
                        ? 'bg-[#238636] hover:bg-[#2ea043] text-white' 
                        : 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]'
                    }`}
                  >
                    {resultadoGuardado === 'exito' ? (
                      <>
                        <Check className="w-3 h-3" />
                        Cerrar
                      </>
                    ) : (
                      'Entendido'
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL CONFIRMAR CANCELACIÓN ==================== */}
      <AnimatePresence>
        {showModalConfirmarCancelacion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1100]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/5 w-full mx-4 max-w-md bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#d29922] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br from-[#d29922] to-[#e3b341] shadow-[#d29922]/20">
                  <AlertTriangle className="text-white text-sm" />
                </div>
                <h3 className="text-white font-semibold text-base">
                  Cancelar Guardado
                </h3>
              </div>

              {/* Body */}
              <div className="px-4 py-4">
                <p className="text-[#c9d1d9] text-sm leading-relaxed">
                  ¿Estás seguro de que deseas cancelar el proceso de guardado de la cotización?
                </p>
                <div className="mt-3 p-3 bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg">
                  <p className="text-[#e3b341] text-xs leading-relaxed">
                    ⚠️ Esta acción detendrá el guardado y eliminará cualquier dato que se haya introducido parcialmente en la base de datos.
                  </p>
                </div>
              </div>

              {/* Footer - Botones */}
              <div className="flex gap-3 px-4 py-3 border-t border-[#30363d] bg-[#161b22]/80 justify-end">
                <button
                  onClick={() => setShowModalConfirmarCancelacion(false)}
                  className="min-w-[140px] px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md transition-colors text-sm font-medium border border-[#30363d] whitespace-nowrap"
                >
                  No, continuar guardando
                </button>
                <button
                  onClick={ejecutarCancelacionGuardado}
                  className="min-w-[140px] px-4 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded-md transition-colors text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <X className="w-3 h-3" />
                  Sí, cancelar guardado
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL RESULTADO CANCELACIÓN ==================== */}
      <AnimatePresence>
        {showModalResultadoCancelacion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1100]"
            onClick={() => setShowModalResultadoCancelacion(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/5 w-full mx-4 max-w-md bg-gradient-to-b from-[#161b22] to-[#0d1117] border ${
                resultadoCancelacionExitoso ? 'border-[#238636]' : 'border-[#da3633]'
              } overflow-hidden`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                  resultadoCancelacionExitoso 
                    ? 'bg-gradient-to-br from-[#238636] to-[#2ea043] shadow-[#238636]/20'
                    : 'bg-gradient-to-br from-[#da3633] to-[#f85149] shadow-[#da3633]/20'
                }`}>
                  {resultadoCancelacionExitoso ? (
                    <Check className="text-white text-sm" />
                  ) : (
                    <X className="text-white text-sm" />
                  )}
                </div>
                <h3 className="text-white font-semibold text-base">
                  {resultadoCancelacionExitoso ? '✅ Proceso Cancelado' : '❌ Error al Cancelar'}
                </h3>
              </div>

              {/* Body */}
              <div className="px-4 py-4">
                {resultadoCancelacionExitoso ? (
                  <div className="space-y-2">
                    <p className="text-[#c9d1d9] text-sm leading-relaxed">
                      El proceso de guardado ha sido cancelado correctamente.
                    </p>
                    <div className="p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg space-y-1">
                      <p className="text-[#3fb950] text-xs flex items-center gap-2">
                        <Check className="w-2.5 h-2.5" /> No se guardaron datos en la Base de Datos
                      </p>
                      <p className="text-[#3fb950] text-xs flex items-center gap-2">
                        <Check className="w-2.5 h-2.5" /> La cotización permanece en su estado anterior
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#c9d1d9] text-sm leading-relaxed">
                    Hubo un error al intentar revertir los cambios. Por favor, revisa la cotización manualmente.
                  </p>
                )}
              </div>

              {/* Footer - Botones */}
              <div className="flex gap-3 px-4 py-3 border-t border-[#30363d] bg-[#161b22]/80 justify-end">
                <button
                  onClick={() => setShowModalResultadoCancelacion(false)}
                  className={`min-w-[100px] px-4 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap ${
                    resultadoCancelacionExitoso
                      ? 'bg-[#238636] hover:bg-[#2ea043] text-white'
                      : 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]'
                  }`}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal de Historial de Paquete - Usando DialogoGenericoDinamico */}
      {showPackageHistoryModal && packageHistorySnapshot && (
        <DialogoGenericoDinamico
          isOpen={showPackageHistoryModal}
          onClose={() => {
            useUIStore.getState().setShowPackageHistoryModal(false)
            useUIStore.getState().setPackageHistorySnapshot(null)
          }}
          title={`Historial de la oferta: ${packageHistorySnapshot.nombre}`}
          description="Compara versiones históricas de esta oferta"
          contentType="custom"
          content={
            <PackageHistoryContent
              currentSnapshot={packageHistorySnapshot}
            />
          }
          size="4xl"
          type="info"
          variant="premium"
          maxHeight="90vh"
        />
      )}

      {/* Modal de Comparación Individual de Paquetes */}
      {showPackageCompareModal && paquetesAComparar && (
        <DialogoGenericoDinamico
          isOpen={showPackageCompareModal}
          onClose={() => {
            useUIStore.getState().setShowPackageCompareModal(false)
            useUIStore.getState().setPaquetesAComparar(null)
          }}
          title="Comparación de Paquetes"
          description={`Comparando "${paquetesAComparar.paquete1.nombre}" con "${paquetesAComparar.paquete2.nombre}"`}
          contentType="custom"
          content={
            <PackageCompareContent
              paquete1={paquetesAComparar.paquete1}
              paquete2={paquetesAComparar.paquete2}
            />
          }
          size="4xl"
          type="info"
          variant="premium"
          maxHeight="90vh"
          closeOnEscape={true}
          closeOnBackdropClick={true}
        />
      )}
      
      </div>
      {/* Footer Flotante */}
      <Suspense fallback={null}>
        <FloatingAdminFooter />
      </Suspense>
    </AnalyticsProvider>
  )
}
