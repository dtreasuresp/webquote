'use client'

import { useCallback, useRef } from 'react'
import { useAnalytics } from '../contexts/AnalyticsContext'

/**
 * PHASE 13: Hook para rastrear eventos de usuario
 * Proporciona métodos para tracking de interacciones comunes
 */

export function useEventTracking() {
  const { trackEvent, trackAction } = useAnalytics()
  const startTimeRef = useRef<number>(0)

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const endTracking = useCallback((action: string, component: string, success: boolean, error?: string) => {
    const duration = Date.now() - startTimeRef.current
    trackAction(action, component, duration, success, error)
  }, [trackAction])

  // Eventos comunes
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
    startTracking,
    endTracking,
    trackCotizacionCreated,
    trackCotizacionEdited,
    trackCotizacionDeleted,
    trackPaqueteCreated,
    trackPaqueteEdited,
    trackPaqueteDeleted,
    trackSnapshotCreated,
    trackSnapshotCompared,
    trackSnapshotTimelineViewed,
    trackPdfGenerated,
    trackFormValidationError,
    trackTabSwitch,
    trackModalOpened,
    trackModalClosed,
    trackFilterApplied,
    trackSearchExecuted,
    trackExportInitiated,
    trackExportCompleted,
  }
}
