'use client'

import { useCallback, useRef } from 'react'
import { useAnalytics } from '../contexts/AnalyticsContext'

/**
 * PHASE 13: Hook para rastrear eventos de usuario
 * Proporciona métodos para tracking de interacciones comunes
 */

export function useEventTracking() {
  let trackEvent: (name: string, payload?: Record<string, unknown>) => void = () => {}
  let trackAction: (action: string, component: string, duration: number, success: boolean, error?: string) => void = () => {}
  try {
    const analytics = useAnalytics()
    trackEvent = analytics.trackEvent
    trackAction = analytics.trackAction
  } catch {
    // Si no está dentro de AnalyticsProvider, usar no-ops para evitar crash
  }

  const startTimeRef = useRef<number>(0)
  const lastViewTsRef = useRef<Map<string, number>>(new Map())
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const shouldThrottle = (key: string, ttlMs: number) => {
    const now = Date.now()
    const last = lastViewTsRef.current.get(key) || 0
    if (now - last < ttlMs) return true
    lastViewTsRef.current.set(key, now)
    return false
  }

  const debounce = (key: string, delayMs: number, fn: () => void) => {
    const existing = debounceTimersRef.current.get(key)
    if (existing) clearTimeout(existing)
    const t = setTimeout(() => {
      fn()
      debounceTimersRef.current.delete(key)
    }, delayMs)
    debounceTimersRef.current.set(key, t)
  }

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const endTracking = useCallback((action: string, component: string, success: boolean, error?: string) => {
    const duration = Date.now() - startTimeRef.current
    trackAction(action, component, duration, success, error)
  }, [trackAction])

  // ==================== EVENTOS DE COTIZACIÓN ====================
  const trackCotizacionCreated = useCallback((metadata?: Record<string, unknown>) => {
    trackEvent('cotizacion_created', {
      type: 'cotizacion',
      ...metadata,
    })
  }, [trackEvent])

  const trackCotizacionEdited = useCallback((cotizacionId: string, fields?: string[]) => {
    trackEvent('cotizacion_edited', {
      cotizacionId,
      fieldsModified: fields?.length || 0,
      fields,
    })
  }, [trackEvent])

  const trackCotizacionDeleted = useCallback((cotizacionId: string) => {
    trackEvent('cotizacion_deleted', {
      cotizacionId,
    })
  }, [trackEvent])

  const trackCotizacionActivated = useCallback((cotizacionId: string, numero?: string) => {
    trackEvent('cotizacion_activated', {
      cotizacionId,
      numero,
    })
  }, [trackEvent])

  const trackCotizacionDeactivated = useCallback((cotizacionId: string, numero?: string) => {
    trackEvent('cotizacion_deactivated', {
      cotizacionId,
      numero,
    })
  }, [trackEvent])

  // ==================== EVENTOS DE PAQUETES/SNAPSHOTS ====================
  const trackPaqueteCreated = useCallback((metadata?: Record<string, unknown>) => {
    trackEvent('paquete_created', {
      type: 'paquete',
      ...metadata,
    })
  }, [trackEvent])

  const trackPaqueteEdited = useCallback((paqueteId: string, fields?: string[]) => {
    trackEvent('paquete_edited', {
      paqueteId,
      fieldsModified: fields?.length || 0,
      fields,
    })
  }, [trackEvent])

  const trackPaqueteDeleted = useCallback((paqueteId: string) => {
    trackEvent('paquete_deleted', {
      paqueteId,
    })
  }, [trackEvent])

  const trackSnapshotCreated = useCallback((snapshotId: string, metadata?: Record<string, unknown>) => {
    trackEvent('snapshot_created', {
      snapshotId,
      ...metadata,
    })
  }, [trackEvent])

  const trackSnapshotActivated = useCallback((snapshotId: string, nombre: string) => {
    trackEvent('snapshot_activated', {
      snapshotId,
      nombre,
    })
  }, [trackEvent])

  const trackSnapshotDeactivated = useCallback((snapshotId: string, nombre: string) => {
    trackEvent('snapshot_deactivated', {
      snapshotId,
      nombre,
    })
  }, [trackEvent])

  const trackSnapshotCompared = useCallback((snapshot1Id: string, snapshot2Id: string) => {
    trackEvent('snapshot_compared', {
      snapshot1Id,
      snapshot2Id,
    })
  }, [trackEvent])

  const trackSnapshotTimelineViewed = useCallback((snapshotCount: number) => {
    trackEvent('snapshot_timeline_viewed', {
      snapshotCount,
    })
  }, [trackEvent])

  // ==================== EVENTOS DE SERVICIOS BASE ====================
  const trackServicioBaseCreated = useCallback((nombre: string, precio: number) => {
    trackEvent('servicio_base_created', {
      nombre,
      precio,
    })
  }, [trackEvent])

  const trackServicioBaseEdited = useCallback((id: string, nombre?: string) => {
    trackEvent('servicio_base_edited', {
      id,
      nombre,
    })
  }, [trackEvent])

  const trackServicioBaseDeleted = useCallback((id: string, nombre?: string) => {
    trackEvent('servicio_base_deleted', {
      id,
      nombre,
    })
  }, [trackEvent])

  // ==================== EVENTOS DE SERVICIOS OPCIONALES ====================
  const trackServicioOpcionalCreated = useCallback((nombre: string, precio: number) => {
    trackEvent('servicio_opcional_created', {
      nombre,
      precio,
    })
  }, [trackEvent])

  const trackServicioOpcionalEdited = useCallback((id: string, nombre?: string) => {
    trackEvent('servicio_opcional_edited', {
      id,
      nombre,
    })
  }, [trackEvent])

  const trackServicioOpcionalDeleted = useCallback((id: string, nombre?: string) => {
    trackEvent('servicio_opcional_deleted', {
      id,
      nombre,
    })
  }, [trackEvent])

  // ==================== EVENTOS DE NAVEGACIÓN OFERTA ====================
  const trackOfertaSectionViewed = useCallback((section: string) => {
    const key = `view_oferta_section_${section}`
    if (shouldThrottle(key, 2000)) return
    trackEvent('oferta_section_viewed', {
      section,
    })
  }, [trackEvent])

  // ==================== EVENTOS FINANCIEROS ====================
  const trackDescuentoConfigured = useCallback((tipo: string, porcentaje: number) => {
    const key = `fin_desc_${tipo}`
    debounce(key, 400, () => {
      trackEvent('descuento_configured', {
        tipo,
        porcentaje,
      })
    })
  }, [trackEvent])

  const trackOpcionPagoAdded = useCallback((nombreOrIndex: string | number, porcentaje?: number) => {
    const nombre = typeof nombreOrIndex === 'string' ? nombreOrIndex : `Cuota ${nombreOrIndex}`
    const key = `fin_pago_add_${nombre}`
    if (shouldThrottle(key, 2000)) return
    trackEvent('opcion_pago_added', {
      nombre,
      porcentaje: porcentaje || 0,
    })
  }, [trackEvent])

  const trackOpcionPagoRemoved = useCallback((nombre: string) => {
    const key = `fin_pago_remove_${nombre}`
    if (shouldThrottle(key, 2000)) return
    trackEvent('opcion_pago_removed', {
      nombre,
    })
  }, [trackEvent])

  // ==================== EVENTOS DE TEMPLATES ====================
  const trackTemplateUsed = useCallback((templateId: string, templateNombre?: string) => {
    trackEvent('template_used', {
      templateId,
      templateNombre,
    })
  }, [trackEvent])

  // ==================== EVENTOS DE HISTORIAL ====================
  const trackHistorialViewed = useCallback((totalCotizaciones: number) => {
    const key = 'view_historial'
    if (shouldThrottle(key, 60000)) return
    trackEvent('historial_viewed', {
      totalCotizaciones,
    })
  }, [trackEvent])

  const trackAdminTabViewed = useCallback((tab: string) => {
    const key = `view_admin_tab_${tab}`
    if (shouldThrottle(key, 60000)) return
    trackEvent('admin_tab_viewed', { tab })
  }, [trackEvent])

  const trackCotizacionExpanded = useCallback((cotizacionId: string, numero?: string) => {
    trackEvent('cotizacion_expanded', {
      cotizacionId,
      numero,
    })
  }, [trackEvent])

  const trackCotizacionCollapsed = useCallback((cotizacionId: string) => {
    trackEvent('cotizacion_collapsed', {
      cotizacionId,
    })
  }, [trackEvent])

  const trackProposalViewed = useCallback((cotizacionId: string, numero?: string) => {
    trackEvent('proposal_viewed', {
      cotizacionId,
      numero,
    })
  }, [trackEvent])

  // ==================== EVENTOS GENERALES ====================
  const trackPdfGenerated = useCallback((type: string, itemId: string) => {
    trackEvent('pdf_generated', {
      type,
      itemId,
    })
  }, [trackEvent])

  const trackFormValidationError = useCallback((component: string, errors: string[]) => {
    trackEvent('form_validation_error', {
      component,
      errorCount: errors.length,
      errors,
    })
  }, [trackEvent])

  const trackTabSwitch = useCallback((fromTab: string, toTab: string) => {
    trackEvent('tab_switch', {
      fromTab,
      toTab,
    })
  }, [trackEvent])

  const trackModalOpened = useCallback((modalName: string) => {
    trackEvent('modal_opened', {
      modalName,
    })
  }, [trackEvent])

  const trackModalClosed = useCallback((modalName: string) => {
    trackEvent('modal_closed', {
      modalName,
    })
  }, [trackEvent])

  const trackFilterApplied = useCallback((filterType: string, filterValue: unknown) => {
    trackEvent('filter_applied', {
      filterType,
      filterValue,
    })
  }, [trackEvent])

  const trackSearchExecuted = useCallback((searchTerm: string, resultsCount: number) => {
    trackEvent('search_executed', {
      searchTerm,
      resultsCount,
    })
  }, [trackEvent])

  const trackExportInitiated = useCallback((exportType: string, itemCount: number) => {
    trackEvent('export_initiated', {
      exportType,
      itemCount,
    })
  }, [trackEvent])

  const trackExportCompleted = useCallback((exportType: string, itemCount: number, duration: number) => {
    trackEvent('export_completed', {
      exportType,
      itemCount,
      duration,
    })
  }, [trackEvent])

  return {
    // General
    startTracking,
    endTracking,
    trackTabSwitch,
    trackModalOpened,
    trackModalClosed,
    trackFilterApplied,
    trackSearchExecuted,
    trackExportInitiated,
    trackExportCompleted,
    trackPdfGenerated,
    trackFormValidationError,
    // Cotizaciones
    trackCotizacionCreated,
    trackCotizacionEdited,
    trackCotizacionDeleted,
    trackCotizacionActivated,
    trackCotizacionDeactivated,
    // Paquetes/Snapshots
    trackPaqueteCreated,
    trackPaqueteEdited,
    trackPaqueteDeleted,
    trackSnapshotCreated,
    trackSnapshotActivated,
    trackSnapshotDeactivated,
    trackSnapshotCompared,
    trackSnapshotTimelineViewed,
    // Servicios Base
    trackServicioBaseCreated,
    trackServicioBaseEdited,
    trackServicioBaseDeleted,
    // Servicios Opcionales
    trackServicioOpcionalCreated,
    trackServicioOpcionalEdited,
    trackServicioOpcionalDeleted,
    // Navegación Oferta
    trackOfertaSectionViewed,
    // Admin Tabs
    trackAdminTabViewed,
    // Financiero
    trackDescuentoConfigured,
    trackOpcionPagoAdded,
    trackOpcionPagoRemoved,
    // Templates
    trackTemplateUsed,
    // Historial
    trackHistorialViewed,
    trackCotizacionExpanded,
    trackCotizacionCollapsed,
    trackProposalViewed,
  }
}
