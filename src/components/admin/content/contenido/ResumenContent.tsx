'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaFileAlt, FaUserTie, FaUserSlash, FaExchangeAlt, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import ContentHeader from '@/features/admin/components/content/contenido/ContentHeader'
import ArrayFieldGH from '@/features/admin/components/content/contenido/ArrayFieldGH'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { ResumenEjecutivoTextos, VisibilidadConfig, SeccionesColapsadasConfig } from '@/lib/types'

interface ResumenContentProps {
  readonly data: ResumenEjecutivoTextos
  readonly onChange: (data: ResumenEjecutivoTextos) => void
  readonly visibilidad: VisibilidadConfig
  readonly onVisibilidadChange: (key: keyof VisibilidadConfig, value: boolean) => void
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

export default function ResumenContent({ data, onChange, visibilidad, onVisibilidadChange, visible, onVisibleChange, updatedAt, onGuardar, onReset, guardando, hasChanges, seccionesColapsadas, onSeccionColapsadaChange }: ResumenContentProps) {
  console.log('[DEBUG ResumenContent] seccionesColapsadas recibidas:', seccionesColapsadas)
  
  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    diferencias: seccionesColapsadas.resumen_diferencias ?? true,
    responsabilidades: seccionesColapsadas.resumen_responsabilidades ?? false,
    clienteNoHace: seccionesColapsadas.resumen_clienteNoHace ?? false,
    flujo: seccionesColapsadas.resumen_flujo ?? false,
  }
  
  console.log('[DEBUG ResumenContent] expandedSections calculados:', expandedSections)

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`resumen_${section}`, newValue)
  }

  // Helpers para flujo de comunicación
  const handleAddFlujoStep = () => {
    const currentFlujo = data.flujoComunicacion || []
    const newStep = {
      paso: currentFlujo.length + 1,
      icono: '📌',
      titulo: '',
      descripcion: '',
      actor: 'proveedor' as const,
    }
    onChange({ ...data, flujoComunicacion: [...currentFlujo, newStep] })
  }

  const handleRemoveFlujoStep = (index: number) => {
    const currentFlujo = data.flujoComunicacion || []
    const newFlujo = currentFlujo
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, paso: i + 1 }))
    onChange({ ...data, flujoComunicacion: newFlujo })
  }

  const handleUpdateFlujoStep = (index: number, field: string, value: string) => {
    const currentFlujo = data.flujoComunicacion || []
    const newFlujo = [...currentFlujo]
    newFlujo[index] = { ...newFlujo[index], [field]: value }
    onChange({ ...data, flujoComunicacion: newFlujo })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader 
        title="Resumen Ejecutivo" 
        icon={<FaFileAlt className="text-gh-info" />}
        updatedAt={updatedAt}
        onGuardar={onGuardar}
        onReset={onReset}
        guardando={guardando}
        hasChanges={hasChanges}
      />

      {/* Toggle de visibilidad global - Fila 2 */}
      <div className="flex items-center justify-between p-3 bg-gh-bg-secondary border border-gh-border rounded-lg">
        <span className="text-sm text-gh-text">Mostrar sección en la página pública</span>
        <ToggleSwitch enabled={visible} onChange={onVisibleChange} />
      </div>

      {/* Contenedores independientes para cada subsección */}
      <div className={`space-y-4 transition-opacity duration-200 ${visible ? '' : 'opacity-50'}`}>
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 📌 TÍTULO Y SUBTÍTULO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.tituloSeccion === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={visibilidad.tituloSeccion !== false} 
              onChange={(v) => onVisibilidadChange('tituloSeccion', v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={data.tituloSeccion}
                onChange={(e) => onChange({ ...data, tituloSeccion: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                placeholder="Resumen Ejecutivo"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo || ''}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
                placeholder="Presentación general del proyecto"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PÁRRAFO DE INTRODUCCIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.parrafoIntroduccion === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs uppercase tracking-wide flex items-center gap-2">
              <FaFileAlt className="text-gh-info" /> Párrafo de Introducción
            </span>
            <ToggleSwitch 
              enabled={visibilidad.parrafoIntroduccion !== false} 
              onChange={(v) => onVisibilidadChange('parrafoIntroduccion', v)}
            />
          </div>
          <textarea
            value={data.parrafoIntroduccion}
            onChange={(e) => onChange({ ...data, parrafoIntroduccion: e.target.value })}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted min-h-[100px]"
            rows={4}
            placeholder="Texto de introducción..."
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BENEFICIOS PRINCIPALES */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.beneficiosPrincipales === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs uppercase tracking-wide flex items-center gap-2">
              ✅ Beneficios Principales
            </span>
            <ToggleSwitch 
              enabled={visibilidad.beneficiosPrincipales !== false} 
              onChange={(v) => onVisibilidadChange('beneficiosPrincipales', v)}
            />
          </div>
          <ArrayFieldGH
            label=""
            items={data.beneficiosPrincipales}
            onChange={(items) => onChange({ ...data, beneficiosPrincipales: items })}
            placeholder="Nuevo beneficio..."
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PÁRRAFO SOBRE PAQUETES */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.parrafoPaquetes === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gh-text font-medium text-xs uppercase tracking-wide flex items-center gap-2">
              📦 Párrafo sobre Paquetes
            </span>
            <ToggleSwitch 
              enabled={visibilidad.parrafoPaquetes !== false} 
              onChange={(v) => onVisibilidadChange('parrafoPaquetes', v)}
            />
          </div>
          <textarea
            value={data.parrafoPaquetes}
            onChange={(e) => onChange({ ...data, parrafoPaquetes: e.target.value })}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted"
            rows={3}
            placeholder="Descripción de paquetes..."
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* DIFERENCIAS CLAVE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.diferenciasClave === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => toggleSection('diferencias')}
              className="flex items-center gap-2 text-xs font-medium text-gh-text uppercase tracking-wide hover:text-gh-info transition-colors"
            >
              <FaFileAlt className="text-gh-warning" /> Diferencias Clave
              {expandedSections.diferencias ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <ToggleSwitch 
              enabled={visibilidad.diferenciasClave !== false} 
              onChange={(v) => onVisibilidadChange('diferenciasClave', v)}
            />
          </div>
          
          {expandedSections.diferencias && (
            <div className="space-y-4 pt-3 border-t border-gh-border/50">
              <div>
                <span className="block text-gh-text-muted font-medium text-xs mb-2">Título</span>
                <input
                  type="text"
                  value={data.diferenciasClave.tituloSeccion}
                  onChange={(e) => onChange({ 
                    ...data, 
                    diferenciasClave: { ...data.diferenciasClave, tituloSeccion: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                />
              </div>

              <div>
                <span className="block text-gh-text-muted font-medium text-xs mb-2">Párrafo Introducción</span>
                <textarea
                  value={data.diferenciasClave.parrafoIntroduccion}
                  onChange={(e) => onChange({ 
                    ...data, 
                    diferenciasClave: { ...data.diferenciasClave, parrafoIntroduccion: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                  rows={2}
                />
              </div>

              <ArrayFieldGH
                label="Items de Diferencias"
                items={data.diferenciasClave.items}
                onChange={(items) => onChange({ 
                  ...data, 
                  diferenciasClave: { ...data.diferenciasClave, items }
                })}
                placeholder="Nueva diferencia..."
              />

              <ArrayFieldGH
                label="Beneficios del Modelo"
                items={data.diferenciasClave.beneficiosModelo}
                onChange={(items) => onChange({ 
                  ...data, 
                  diferenciasClave: { ...data.diferenciasClave, beneficiosModelo: items }
                })}
                placeholder="Nuevo beneficio..."
              />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RESPONSABILIDADES DEL PROVEEDOR */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.responsabilidadesProveedor === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => toggleSection('responsabilidades')}
              className="flex items-center gap-2 text-xs font-medium text-gh-text uppercase tracking-wide hover:text-gh-info transition-colors"
            >
              <FaUserTie className="text-gh-success" /> Responsabilidades del Proveedor
              {expandedSections.responsabilidades ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <ToggleSwitch 
              enabled={visibilidad.responsabilidadesProveedor !== false} 
              onChange={(v) => onVisibilidadChange('responsabilidadesProveedor', v)}
            />
          </div>
          
          {expandedSections.responsabilidades && (
            <div className="pt-3 border-t border-gh-border/50">
              <ArrayFieldGH
                label="Lista de responsabilidades del proveedor"
                items={data.responsabilidadesProveedor?.contenido || []}
                onChange={(items) => onChange({ 
                  ...data, 
                  responsabilidadesProveedor: { 
                    contenido: items,
                    tecnico: data.responsabilidadesProveedor?.tecnico || [],
                    comunicacion: data.responsabilidadesProveedor?.comunicacion || [],
                  }
                })}
                placeholder="Nueva responsabilidad..."
              />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LO QUE EL CLIENTE NO HACE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.clienteNoHace === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => toggleSection('clienteNoHace')}
              className="flex items-center gap-2 text-xs font-medium text-gh-text uppercase tracking-wide hover:text-gh-info transition-colors"
            >
              <FaUserSlash className="text-gh-danger" /> Lo que el Cliente NO Hace
              {expandedSections.clienteNoHace ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <ToggleSwitch 
              enabled={visibilidad.clienteNoHace !== false} 
              onChange={(v) => onVisibilidadChange('clienteNoHace', v)}
            />
          </div>
          
          {expandedSections.clienteNoHace && (
            <div className="pt-3 border-t border-gh-border/50">
              <ArrayFieldGH
                label="El cliente NO tiene que preocuparse de"
                items={data.clienteNoHace || []}
                onChange={(items) => onChange({ ...data, clienteNoHace: items })}
                placeholder="Nueva actividad que el cliente no hace..."
              />
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FLUJO DE COMUNICACIÓN */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${visibilidad.flujoComunicacion === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => toggleSection('flujo')}
              className="flex items-center gap-2 text-xs font-medium text-gh-text uppercase tracking-wide hover:text-gh-info transition-colors"
            >
              <FaExchangeAlt className="text-gh-info" /> Flujo de Comunicación ({(data.flujoComunicacion || []).length} pasos)
              {expandedSections.flujo ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <ToggleSwitch 
              enabled={visibilidad.flujoComunicacion !== false} 
              onChange={(v) => onVisibilidadChange('flujoComunicacion', v)}
            />
          </div>
          
          {expandedSections.flujo && (
            <div className="space-y-3 pt-3 border-t border-gh-border/50">
              {(data.flujoComunicacion || []).map((step, index) => (
                <div key={`flujo-step-${step.paso}`} className="p-3 bg-gh-bg-secondary border border-gh-border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gh-text-muted">Paso {step.paso}</span>
                    <button
                      onClick={() => handleRemoveFlujoStep(index)}
                      className="p-1.5 text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                      title="Eliminar paso"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <span className="block text-gh-text-muted text-xs mb-1">Icono (emoji)</span>
                      <input
                        type="text"
                        value={step.icono}
                        onChange={(e) => handleUpdateFlujoStep(index, 'icono', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gh-bg-tertiary border border-gh-border rounded text-sm text-gh-text"
                        placeholder="👤"
                      />
                    </div>
                    <div>
                      <span className="block text-gh-text-muted text-xs mb-1">Actor</span>
                      <select
                        value={step.actor}
                        onChange={(e) => handleUpdateFlujoStep(index, 'actor', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gh-bg-tertiary border border-gh-border rounded text-sm text-gh-text"
                      >
                        <option value="cliente">Cliente</option>
                        <option value="proveedor">Proveedor</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <span className="block text-gh-text-muted text-xs mb-1">Título</span>
                    <input
                      type="text"
                      value={step.titulo}
                      onChange={(e) => handleUpdateFlujoStep(index, 'titulo', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gh-bg-tertiary border border-gh-border rounded text-sm text-gh-text"
                      placeholder="Título del paso..."
                    />
                  </div>
                  
                  <div>
                    <span className="block text-gh-text-muted text-xs mb-1">Descripción</span>
                    <input
                      type="text"
                      value={step.descripcion}
                      onChange={(e) => handleUpdateFlujoStep(index, 'descripcion', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gh-bg-tertiary border border-gh-border rounded text-sm text-gh-text"
                      placeholder="Descripción del paso..."
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleAddFlujoStep}
                className="w-full px-3 py-2 text-xs font-medium text-gh-text-muted hover:text-gh-text bg-gh-bg-secondary border border-gh-border border-dashed rounded-md hover:bg-gh-bg-tertiary transition-colors flex items-center justify-center gap-1.5"
              >
                <FaPlus size={10} /> Agregar Paso
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
