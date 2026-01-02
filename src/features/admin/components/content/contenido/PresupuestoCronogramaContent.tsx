'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronDown, ChevronUp, Plus, Trash2, Clock } from 'lucide-react'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { useAdminAudit } from '../../../hooks/useAdminAudit'
import { useAdminPermissions } from '../../../hooks/useAdminPermissions'
import ArrayFieldGH from './ArrayFieldGH'
import ToggleItem from '@/features/admin/components/ToggleItem'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { SeccionesColapsadasConfig, PresupuestoCronogramaData, FaseCronograma } from '@/lib/types'

// Re-exportar tipos para compatibilidad
export type { FaseCronograma, PresupuestoCronogramaData }

interface PresupuestoCronogramaContentProps {
  readonly data: PresupuestoCronogramaData
  readonly onChange: (data: PresupuestoCronogramaData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
  readonly seccionesColapsadas: SeccionesColapsadasConfig
  readonly onSeccionColapsadaChange: (key: string, isExpanded: boolean) => void
}

// Datos por defecto
export const defaultPresupuestoCronograma: PresupuestoCronogramaData = {
  titulo: 'Presupuesto y Cronograma',
  subtitulo: 'Inversión y tiempos de desarrollo',
  cronograma: {
    visible: true,
    titulo: 'Cronograma de Desarrollo',
    descripcion: 'Proceso estructurado para garantizar entregas de calidad',
    duracionTotal: '4-8 semanas según complejidad',
    fases: [
      {
        nombre: 'Descubrimiento y Planificación',
        duracionDias: 5,
        descripcion: 'Análisis de requisitos y definición del alcance',
        entregables: ['Documento de especificaciones', 'Wireframes', 'Plan de proyecto'],
      },
      {
        nombre: 'Diseño',
        duracionDias: 7,
        descripcion: 'Creación del diseño visual y experiencia de usuario',
        entregables: ['Mockups', 'Guía de estilos', 'Prototipo interactivo'],
      },
      {
        nombre: 'Desarrollo',
        duracionDias: 14,
        descripcion: 'Implementación del código y funcionalidades',
        entregables: ['Sitio funcional', 'Panel de administración', 'Integraciones'],
      },
      {
        nombre: 'Pruebas y Lanzamiento',
        duracionDias: 5,
        descripcion: 'Testing, ajustes finales y despliegue',
        entregables: ['Sitio en producción', 'Documentación', 'Capacitación'],
      },
    ],
  },
  presupuesto: {
    visible: true,
    titulo: 'Presupuesto',
    descripcion: 'Desglose de costos por paquete',
    rangos: [],
    notaImportante: '',
  },
  caracteristicasPorPaquete: {},
  ordenPaquetes: [],
}

export default function PresupuestoCronogramaContent({
  data,
  onChange,
  visible,
  onVisibleChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges,
  seccionesColapsadas,
  onSeccionColapsadaChange,
}: PresupuestoCronogramaContentProps) {
  const { logAction } = useAdminAudit()
  const { canEdit: canEditFn } = useAdminPermissions()
  const canEdit = canEditFn('CONTENT')
  
  // Estado de sección colapsable viene de props (se persiste al guardar)
  const expandedCronograma = seccionesColapsadas.presupuesto_cronograma ?? true

  const toggleCronograma = () => {
    onSeccionColapsadaChange('presupuesto_cronograma', !expandedCronograma)
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Fases del Cronograma
  // ═══════════════════════════════════════════════════════════════
  const addFase = () => {
    const newFase: FaseCronograma = {
      nombre: 'Nueva Fase',
      duracionDias: 7,
      descripcion: '',
      entregables: [],
    }
    onChange({
      ...data,
      cronograma: {
        ...data.cronograma,
        fases: [...data.cronograma.fases, newFase],
      },
    })
  }

  const updateFase = (index: number, field: keyof FaseCronograma, value: string | number | string[]) => {
    const newFases = [...data.cronograma.fases]
    newFases[index] = { ...newFases[index], [field]: value }
    onChange({
      ...data,
      cronograma: { ...data.cronograma, fases: newFases },
    })
  }

  const removeFase = (index: number) => {
    onChange({
      ...data,
      cronograma: {
        ...data.cronograma,
        fases: data.cronograma.fases.filter((_, i) => i !== index),
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <SectionHeader 
        title="Presupuesto y Cronograma"
        description="Inversión y tiempos de desarrollo"
        icon={<Calendar className="w-4 h-4" />}
        updatedAt={updatedAt}
        onSave={() => {
          onGuardar()
          logAction('UPDATE', 'CONTENT', 'save-presupuesto-cronograma', 'Guardado Presupuesto y Cronograma')
        }}
        onCancel={onReset}
        isSaving={guardando}
        statusIndicator={hasChanges ? 'modificado' : 'guardado'}
        variant="accent"
      />

      {/* Toggle de visibilidad global - Fila 2 */}
      <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
        <span className="text-xs font-medium text-gh-text">Mostrar sección en la página pública</span>
        <ToggleItem enabled={visible} onChange={onVisibleChange} title="" showBadge={false} />
      </div>

      {/* Contenedor con opacity si global OFF */}
      <div className={`space-y-4 transition-opacity duration-200 ${!visible ? 'opacity-50' : ''}`}>
        
        {/* Subsección: Títulos */}
        <div className="p-4 bg-gh-bg-secondary border border-gh-border/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-medium text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={data.titulo}
                onChange={(e) => onChange({ ...data, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CRONOGRAMA */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center justify-between">
            <button
              onClick={toggleCronograma}
              className="flex items-center gap-2 text-xs font-medium text-gh-text hover:text-gh-info transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-gh-info" /> Cronograma de Desarrollo
              {expandedCronograma ? <ChevronUp className="w-4 h-4 text-gh-text-muted" /> : <ChevronDown className="w-4 h-4 text-gh-text-muted" />}
            </button>
            <ToggleSwitch
              enabled={data.cronograma.visible}
              onChange={(v) => onChange({ ...data, cronograma: { ...data.cronograma, visible: v } })}
            />
          </div>

          {expandedCronograma && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={data.cronograma.titulo}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, titulo: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                  <input
                    type="text"
                    value={data.cronograma.descripcion}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, descripcion: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                  />
                </div>
                <div>
                  <label className="block text-gh-text-muted text-xs mb-1">Duración Total</label>
                  <input
                    type="text"
                    value={data.cronograma.duracionTotal}
                    onChange={(e) => onChange({ ...data, cronograma: { ...data.cronograma, duracionTotal: e.target.value } })}
                    className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                  />
                </div>
              </div>

              {/* Lista de Fases */}
              {data.cronograma.fases.map((fase, index) => (
                <div key={`fase-${index}`} className="p-3 bg-gh-bg-tertiary border border-gh-border/30 rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gh-text">Fase {index + 1}: {fase.nombre}</span>
                    <button
                      onClick={() => removeFase(index)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs"
                    >
                      <Trash2 />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre de la fase</label>
                      <input
                        type="text"
                        value={fase.nombre}
                        onChange={(e) => updateFase(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Duración (días)</label>
                      <input
                        type="number"
                        value={fase.duracionDias}
                        onChange={(e) => updateFase(index, 'duracionDias', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                    <input
                      type="text"
                      value={fase.descripcion}
                      onChange={(e) => updateFase(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md text-xs font-medium text-gh-text"
                    />
                  </div>
                  <ArrayFieldGH
                    label="Entregables"
                    items={fase.entregables}
                    onChange={(items) => updateFase(index, 'entregables', items)}
                    placeholder="Nuevo entregable..."
                  />
                </div>
              ))}

              <button
                onClick={addFase}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <Plus /> Agregar Fase
              </button>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  )
}




