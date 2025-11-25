'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

/**
 * PHASE 13: Analytics y Tracking
 * Context global para rastrear eventos y métricas del panel administrativo
 */

export interface EventData {
  eventType: string
  timestamp: Date
  userId?: string
  sessionId: string
  metadata?: Record<string, unknown>
  duration?: number
}

export interface MetricData {
  name: string
  value: number
  unit?: string
  timestamp: Date
  tags?: Record<string, string>
}

export interface UserAction {
  action: string
  component: string
  timestamp: Date
  duration: number
  success: boolean
  error?: string
}

export interface AnalyticsState {
  events: EventData[]
  metrics: MetricData[]
  userActions: UserAction[]
  sessionId: string
  startTime: Date
  totalEvents: number
  totalActions: number
}

export interface AnalyticsContextType {
  state: AnalyticsState
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => void
  trackMetric: (name: string, value: number, unit?: string) => void
  trackAction: (action: string, component: string, duration: number, success: boolean, error?: string) => void
  getMetricsByName: (name: string) => MetricData[]
  getEventsByType: (eventType: string) => EventData[]
  getActionsByComponent: (component: string) => UserAction[]
  clearAnalytics: () => void
  exportAnalytics: () => AnalyticsState
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

interface AnalyticsProviderProps {
  readonly children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [state, setState] = useState<AnalyticsState>({
    events: [],
    metrics: [],
    userActions: [],
    sessionId: generateSessionId(),
    startTime: new Date(),
    totalEvents: 0,
    totalActions: 0,
  })

  const trackEvent = useCallback((eventType: string, metadata?: Record<string, unknown>) => {
    const eventData: EventData = {
      eventType,
      timestamp: new Date(),
      sessionId: state.sessionId,
      metadata,
    }

    setState((prev) => ({
      ...prev,
      events: [...prev.events, eventData],
      totalEvents: prev.totalEvents + 1,
    }))
  }, [state.sessionId])

  const trackMetric = useCallback((name: string, value: number, unit?: string) => {
    const metricData: MetricData = {
      name,
      value,
      unit,
      timestamp: new Date(),
    }

    setState((prev) => ({
      ...prev,
      metrics: [...prev.metrics, metricData],
    }))
  }, [])

  const trackAction = useCallback((
    action: string,
    component: string,
    duration: number,
    success: boolean,
    error?: string
  ) => {
    const actionData: UserAction = {
      action,
      component,
      timestamp: new Date(),
      duration,
      success,
      error,
    }

    setState((prev) => ({
      ...prev,
      userActions: [...prev.userActions, actionData],
      totalActions: prev.totalActions + 1,
    }))
  }, [])

  const getMetricsByName = useCallback((name: string) => {
    return state.metrics.filter((m) => m.name === name)
  }, [state.metrics])

  const getEventsByType = useCallback((eventType: string) => {
    return state.events.filter((e) => e.eventType === eventType)
  }, [state.events])

  const getActionsByComponent = useCallback((component: string) => {
    return state.userActions.filter((a) => a.component === component)
  }, [state.userActions])

  const clearAnalytics = useCallback(() => {
    setState({
      events: [],
      metrics: [],
      userActions: [],
      sessionId: generateSessionId(),
      startTime: new Date(),
      totalEvents: 0,
      totalActions: 0,
    })
  }, [])

  const exportAnalytics = useCallback(() => {
    return { ...state }
  }, [state])

  const value = React.useMemo<AnalyticsContextType>(() => ({
    state,
    trackEvent,
    trackMetric,
    trackAction,
    getMetricsByName,
    getEventsByType,
    getActionsByComponent,
    clearAnalytics,
    exportAnalytics,
  }), [
    state,
    trackEvent,
    trackMetric,
    trackAction,
    getMetricsByName,
    getEventsByType,
    getActionsByComponent,
    clearAnalytics,
    exportAnalytics,
  ])

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics debe usarse dentro de AnalyticsProvider')
  }
  return context
}

export default AnalyticsContext
