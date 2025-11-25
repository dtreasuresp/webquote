'use client'

import { useCallback, useMemo } from 'react'
import { useAnalytics } from '../contexts/AnalyticsContext'
import type { UserAction } from '../contexts/AnalyticsContext'

/**
 * PHASE 13: Hook para calcular métricas analíticas
 * Proporciona agregaciones y análisis de datos de tracking
 */

export interface MetricsAggregate {
  totalEvents: number
  totalActions: number
  averageActionDuration: number
  successRate: number
  errorRate: number
  topComponents: Array<{ component: string; count: number }>
  topActions: Array<{ action: string; count: number }>
  topEvents: Array<{ eventType: string; count: number }>
}

export interface ComponentMetrics {
  component: string
  totalActions: number
  successCount: number
  failureCount: number
  averageDuration: number
  successRate: number
}

export interface ActionMetrics {
  action: string
  totalCount: number
  successCount: number
  failureCount: number
  averageDuration: number
  successRate: number
}

export interface PerformanceMetrics {
  totalActionsTracked: number
  timeRange: { start: Date; end: Date }
  peakHour?: string
  slowestAction?: { action: string; duration: number }
  fastestAction?: { action: string; duration: number }
}

export function useAnalyticsMetrics() {
  const { state } = useAnalytics()

  // Calcular métricas agregadas
  const getAggregateMetrics = useCallback((): MetricsAggregate => {
    const successfulActions = state.userActions.filter((a) => a.success).length
    const failedActions = state.userActions.filter((a) => !a.success).length
    const totalDuration = state.userActions.reduce((sum, a) => sum + a.duration, 0)
    const avgDuration = state.userActions.length > 0 ? totalDuration / state.userActions.length : 0

    // Top components
    const componentMap = new Map<string, number>()
    state.userActions.forEach((a) => {
      componentMap.set(a.component, (componentMap.get(a.component) || 0) + 1)
    })
    const topComponents = Array.from(componentMap.entries())
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top actions
    const actionMap = new Map<string, number>()
    state.userActions.forEach((a) => {
      actionMap.set(a.action, (actionMap.get(a.action) || 0) + 1)
    })
    const topActions = Array.from(actionMap.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top events
    const eventMap = new Map<string, number>()
    state.events.forEach((e) => {
      eventMap.set(e.eventType, (eventMap.get(e.eventType) || 0) + 1)
    })
    const topEvents = Array.from(eventMap.entries())
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const successRate = state.userActions.length > 0 ? (successfulActions / state.userActions.length) * 100 : 0
    const errorRate = state.userActions.length > 0 ? (failedActions / state.userActions.length) * 100 : 0

    return {
      totalEvents: state.totalEvents,
      totalActions: state.totalActions,
      averageActionDuration: avgDuration,
      successRate,
      errorRate,
      topComponents,
      topActions,
      topEvents,
    }
  }, [state])

  // Obtener métricas por componente
  const getComponentMetrics = useCallback((): ComponentMetrics[] => {
    const componentMap = new Map<string, UserAction[]>()

    state.userActions.forEach((a) => {
      if (!componentMap.has(a.component)) {
        componentMap.set(a.component, [])
      }
      componentMap.get(a.component)!.push(a)
    })

    return Array.from(componentMap.entries()).map(([component, actions]) => {
      const successCount = actions.filter((a) => a.success).length
      const failureCount = actions.filter((a) => !a.success).length
      const avgDuration = actions.reduce((sum, a) => sum + a.duration, 0) / actions.length
      const successRate = (successCount / actions.length) * 100

      return {
        component,
        totalActions: actions.length,
        successCount,
        failureCount,
        averageDuration: avgDuration,
        successRate,
      }
    })
  }, [state.userActions])

  // Obtener métricas por acción
  const getActionMetrics = useCallback((): ActionMetrics[] => {
    const actionMap = new Map<string, UserAction[]>()

    state.userActions.forEach((a) => {
      if (!actionMap.has(a.action)) {
        actionMap.set(a.action, [])
      }
      actionMap.get(a.action)!.push(a)
    })

    return Array.from(actionMap.entries()).map(([action, actions]) => {
      const successCount = actions.filter((a) => a.success).length
      const failureCount = actions.filter((a) => !a.success).length
      const avgDuration = actions.reduce((sum, a) => sum + a.duration, 0) / actions.length
      const successRate = (successCount / actions.length) * 100

      return {
        action,
        totalCount: actions.length,
        successCount,
        failureCount,
        averageDuration: avgDuration,
        successRate,
      }
    })
  }, [state.userActions])

  // Obtener métricas de performance
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    if (state.userActions.length === 0) {
      return {
        totalActionsTracked: 0,
        timeRange: { start: state.startTime, end: new Date() },
      }
    }

    const slowest = state.userActions.reduce((max, a) => (a.duration > max.duration ? a : max), state.userActions[0])
    const fastest = state.userActions.reduce((min, a) => (a.duration < min.duration ? a : min), state.userActions[0])

    return {
      totalActionsTracked: state.userActions.length,
      timeRange: { start: state.startTime, end: new Date() },
      slowestAction: { action: slowest.action, duration: slowest.duration },
      fastestAction: { action: fastest.action, duration: fastest.duration },
    }
  }, [state])

  // Obtener tasa de error
  const getErrorRate = useMemo(() => {
    if (state.userActions.length === 0) return 0
    const errors = state.userActions.filter((a) => !a.success).length
    return (errors / state.userActions.length) * 100
  }, [state.userActions])

  // Obtener tasa de éxito
  const getSuccessRate = useMemo(() => {
    if (state.userActions.length === 0) return 0
    const successes = state.userActions.filter((a) => a.success).length
    return (successes / state.userActions.length) * 100
  }, [state.userActions])

  // Obtener duración promedio
  const getAverageDuration = useMemo(() => {
    if (state.userActions.length === 0) return 0
    const total = state.userActions.reduce((sum, a) => sum + a.duration, 0)
    return total / state.userActions.length
  }, [state.userActions])

  return {
    getAggregateMetrics,
    getComponentMetrics,
    getActionMetrics,
    getPerformanceMetrics,
    getErrorRate,
    getSuccessRate,
    getAverageDuration,
  }
}
