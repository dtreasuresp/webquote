'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaCheckCircle, FaTimesCircle, FaClock, FaDownload } from 'react-icons/fa'
import { useAnalytics } from '../contexts/AnalyticsContext'
import { useAnalyticsMetrics } from '../hooks/useAnalyticsMetrics'

/**
 * PHASE 13: Dashboard de Analytics
 * Visualiza métricas, eventos y performance del panel administrativo
 */

interface AnalyticsDashboardProps {
  className?: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const { state, clearAnalytics, exportAnalytics } = useAnalytics()
  const {
    getAggregateMetrics,
    getComponentMetrics,
    getActionMetrics,
    getPerformanceMetrics,
    getErrorRate,
    getSuccessRate,
    getAverageDuration,
  } = useAnalyticsMetrics()

  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'actions' | 'performance'>('overview')

  const aggregateMetrics = getAggregateMetrics()
  const componentMetrics = getComponentMetrics()
  const actionMetrics = getActionMetrics()
  const performanceMetrics = getPerformanceMetrics()
  const errorRate = getErrorRate
  const successRate = getSuccessRate
  const avgDuration = getAverageDuration

  const handleExportAnalytics = () => {
    const data = exportAnalytics()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics_${data.sessionId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearAnalytics = () => {
    if (confirm('¿Estás seguro de que deseas limpiar todos los datos analíticos?')) {
      clearAnalytics()
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-gh-accent-blue text-2xl" />
          <div>
            <h2 className="text-2xl font-bold text-gh-text">Analytics Dashboard</h2>
            {state.sessionId && <p className="text-sm text-gh-text-muted">Session ID: {state.sessionId}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportAnalytics}
            className="px-4 py-2 bg-gh-success text-white rounded-lg hover:bg-gh-success-hover transition-all text-sm font-semibold flex items-center gap-2"
          >
            <FaDownload /> Exportar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAnalytics}
            className="px-4 py-2 bg-gh-danger text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
          >
            Limpiar
          </motion.button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {(['overview', 'components', 'actions', 'performance'] as const).map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
              activeTab === tab
                ? 'bg-gh-accent-blue text-white'
                : 'bg-gh-bg-secondary border border-gh-border text-gh-text hover:bg-gh-card'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Events */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gh-text-muted text-sm font-semibold">Total Eventos</span>
              <FaChartLine className="text-gh-accent-blue text-xl" />
            </div>
            <p className="text-3xl font-bold text-gh-text">{aggregateMetrics.totalEvents}</p>
            <p className="text-xs text-gh-text-muted mt-1">registrados</p>
          </motion.div>

          {/* Total Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gh-text-muted text-sm font-semibold">Acciones</span>
              <FaClock className="text-gh-warning text-xl" />
            </div>
            <p className="text-3xl font-bold text-gh-text">{aggregateMetrics.totalActions}</p>
            <p className="text-xs text-gh-text-muted mt-1">rastreadas</p>
          </motion.div>

          {/* Success Rate */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gh-text-muted text-sm font-semibold">Tasa Éxito</span>
              <FaCheckCircle className="text-gh-success text-xl" />
            </div>
            <p className="text-3xl font-bold text-gh-success">{successRate.toFixed(1)}%</p>
            <p className="text-xs text-gh-text-muted mt-1">acciones exitosas</p>
          </motion.div>

          {/* Error Rate */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-gh-bg-secondary to-gh-bg rounded-xl border border-gh-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gh-text-muted text-sm font-semibold">Tasa Error</span>
              <FaTimesCircle className="text-gh-error text-xl" />
            </div>
            <p className="text-3xl font-bold text-gh-error">{errorRate.toFixed(1)}%</p>
            <p className="text-xs text-gh-text-muted mt-1">acciones fallidas</p>
          </motion.div>
        </div>
      )}

      {/* COMPONENTS TAB */}
      {activeTab === 'components' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gh-text mb-4">Métricas por Componente</h3>
          {componentMetrics.length === 0 ? (
            <p className="text-gh-text-muted text-center py-8">Sin datos de componentes</p>
          ) : (
            <div className="space-y-3">
              {componentMetrics.map((comp) => (
                <motion.div
                  key={comp.component}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gh-bg-secondary border border-gh-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gh-text">{comp.component}</h4>
                    <span className="text-xs px-2 py-1 bg-gh-accent-blue/20 text-gh-accent-blue rounded">
                      {comp.totalActions} acciones
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gh-text-muted">Duración promedio</p>
                      <p className="font-semibold text-gh-text">{formatDuration(comp.averageDuration)}</p>
                    </div>
                    <div>
                      <p className="text-gh-text-muted">Tasa éxito</p>
                      <p className="font-semibold text-gh-success">{comp.successRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIONS TAB */}
      {activeTab === 'actions' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gh-text mb-4">Métricas por Acción</h3>
          {actionMetrics.length === 0 ? (
            <p className="text-gh-text-muted text-center py-8">Sin datos de acciones</p>
          ) : (
            <div className="space-y-3">
              {actionMetrics.map((act) => (
                <motion.div
                  key={act.action}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gh-bg-secondary border border-gh-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gh-text">{act.action}</h4>
                    <span className="text-xs px-2 py-1 bg-gh-warning/20 text-gh-warning rounded">
                      {act.totalCount} veces
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gh-text-muted">Éxitos</p>
                      <p className="font-semibold text-gh-success">{act.successCount}</p>
                    </div>
                    <div>
                      <p className="text-gh-text-muted">Errores</p>
                      <p className="font-semibold text-gh-error">{act.failureCount}</p>
                    </div>
                    <div>
                      <p className="text-gh-text-muted">Duración prom.</p>
                      <p className="font-semibold text-gh-text">{formatDuration(act.averageDuration)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PERFORMANCE TAB */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gh-text mb-4">Métricas de Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gh-bg-secondary border border-gh-border rounded-lg p-4"
            >
              <p className="text-gh-text-muted text-sm mb-2">Duración Promedio</p>
              <p className="text-2xl font-bold text-gh-accent-blue">{formatDuration(avgDuration)}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-gh-bg-secondary border border-gh-border rounded-lg p-4"
            >
              <p className="text-gh-text-muted text-sm mb-2">Acción Más Rápida</p>
              <p className="text-sm font-semibold text-gh-text">{performanceMetrics.fastestAction?.action}</p>
              <p className="text-xl font-bold text-gh-success">
                {formatDuration(performanceMetrics.fastestAction?.duration || 0)}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gh-bg-secondary border border-gh-border rounded-lg p-4"
            >
              <p className="text-gh-text-muted text-sm mb-2">Acción Más Lenta</p>
              <p className="text-sm font-semibold text-gh-text">{performanceMetrics.slowestAction?.action}</p>
              <p className="text-xl font-bold text-gh-error">
                {formatDuration(performanceMetrics.slowestAction?.duration || 0)}
              </p>
            </motion.div>
          </div>

          {/* Top Components */}
          <div>
            <h4 className="text-md font-semibold text-gh-text mb-3">Componentes Más Activos</h4>
            <div className="space-y-2">
              {aggregateMetrics.topComponents.map((comp, idx) => (
                <div key={comp.component} className="flex items-center justify-between bg-gh-bg-secondary p-3 rounded-lg">
                  <span className="text-gh-text">
                    <span className="font-semibold">{idx + 1}.</span> {comp.component}
                  </span>
                  <span className="bg-gh-accent-blue/20 text-gh-accent-blue px-3 py-1 rounded text-sm font-semibold">
                    {comp.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Events */}
          <div>
            <h4 className="text-md font-semibold text-gh-text mb-3">Eventos Más Frecuentes</h4>
            <div className="space-y-2">
              {aggregateMetrics.topEvents.map((evt, idx) => (
                <div key={evt.eventType} className="flex items-center justify-between bg-gh-bg-secondary p-3 rounded-lg">
                  <span className="text-gh-text">
                    <span className="font-semibold">{idx + 1}.</span> {evt.eventType}
                  </span>
                  <span className="bg-gh-warning/20 text-gh-warning px-3 py-1 rounded text-sm font-semibold">
                    {evt.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
