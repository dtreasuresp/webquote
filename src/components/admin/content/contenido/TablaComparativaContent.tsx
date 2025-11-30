'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaTable, FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'
import ContentHeader from './ContentHeader'
import ToggleSwitch from '@/components/admin/shared/ToggleSwitch'
import type { SeccionesColapsadasConfig } from '@/lib/types'

// Tipos para Tabla Comparativa
export interface PackageFeature {
  name: string
  basic: boolean | string
  professional: boolean | string
  enterprise: boolean | string
}

export interface ComparisonCategory {
  category: string
  items: PackageFeature[]
}

export interface PackageInfo {
  name: string
  price: string
  description: string
  popular?: boolean
  cta: string
}

export interface TablaComparativaData {
  titulo: string
  subtitulo: string
  paquetes: {
    basic: PackageInfo
    professional: PackageInfo
    enterprise: PackageInfo
  }
  categorias: ComparisonCategory[]
  notaPie: string
}

interface VisibilidadTabla {
  titulos: boolean
  paquetes: boolean
  categorias: boolean
  notaPie: boolean
}

interface TablaComparativaContentProps {
  readonly data: TablaComparativaData
  readonly onChange: (data: TablaComparativaData) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly visibilidad?: VisibilidadTabla
  readonly onVisibilidadChange?: (key: keyof VisibilidadTabla, value: boolean) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
  readonly seccionesColapsadas: SeccionesColapsadasConfig
  readonly onSeccionColapsadaChange: (key: string, isExpanded: boolean) => void
}

// Datos por defecto
export const defaultTablaComparativa: TablaComparativaData = {
  titulo: 'Tabla Comparativa de Paquetes',
  subtitulo: 'Encuentra el plan perfecto para tu proyecto',
  paquetes: {
    basic: {
      name: 'Básico',
      price: '$500 - $1,000',
      description: 'Ideal para emprendedores',
      cta: 'Elegir Básico',
    },
    professional: {
      name: 'Profesional',
      price: '$1,000 - $2,500',
      description: 'Para empresas en crecimiento',
      popular: true,
      cta: 'Elegir Profesional',
    },
    enterprise: {
      name: 'Enterprise',
      price: '$2,500 - $5,000',
      description: 'Soluciones corporativas',
      cta: 'Contactar Ventas',
    },
  },
  categorias: [
    {
      category: 'Diseño y Desarrollo',
      items: [
        { name: 'Páginas incluidas', basic: 'Hasta 5', professional: 'Hasta 15', enterprise: 'Ilimitadas' },
        { name: 'Diseño personalizado', basic: true, professional: true, enterprise: true },
        { name: 'Diseño responsive', basic: true, professional: true, enterprise: true },
        { name: 'Animaciones avanzadas', basic: false, professional: true, enterprise: true },
      ],
    },
    {
      category: 'Funcionalidades',
      items: [
        { name: 'Formulario de contacto', basic: true, professional: true, enterprise: true },
        { name: 'Blog integrado', basic: false, professional: true, enterprise: true },
        { name: 'Panel de administración', basic: false, professional: true, enterprise: true },
        { name: 'E-commerce', basic: false, professional: false, enterprise: true },
        { name: 'Integraciones personalizadas', basic: false, professional: 'Básicas', enterprise: 'Avanzadas' },
      ],
    },
    {
      category: 'SEO y Marketing',
      items: [
        { name: 'SEO básico', basic: true, professional: true, enterprise: true },
        { name: 'SEO avanzado', basic: false, professional: true, enterprise: true },
        { name: 'Google Analytics', basic: true, professional: true, enterprise: true },
        { name: 'Search Console', basic: false, professional: true, enterprise: true },
      ],
    },
    {
      category: 'Soporte',
      items: [
        { name: 'Soporte por email', basic: true, professional: true, enterprise: true },
        { name: 'Soporte prioritario', basic: false, professional: true, enterprise: true },
        { name: 'Capacitación', basic: '1 hora', professional: '3 horas', enterprise: 'Ilimitada' },
        { name: 'Mantenimiento incluido', basic: '1 mes', professional: '3 meses', enterprise: '6 meses' },
      ],
    },
  ],
  notaPie: 'Todos los paquetes incluyen hosting gratuito por el primer año y certificado SSL.',
}

export default function TablaComparativaContent({
  data,
  onChange,
  visible,
  onVisibleChange,
  visibilidad,
  onVisibilidadChange,
  updatedAt,
  onGuardar,
  onReset,
  guardando,
  hasChanges,
  seccionesColapsadas,
  onSeccionColapsadaChange,
}: TablaComparativaContentProps) {
  // Estado de secciones colapsables viene de props (se persiste al guardar)
  const expandedSections = {
    paquetes: seccionesColapsadas.tabla_paquetes ?? true,
    categorias: seccionesColapsadas.tabla_categorias ?? false,
  }

  // Valores por defecto para visibilidad
  const vis = visibilidad || { titulos: true, paquetes: true, categorias: true, notaPie: true }
  const handleVisChange = (key: keyof VisibilidadTabla, value: boolean) => {
    if (onVisibilidadChange) onVisibilidadChange(key, value)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    const newValue = !expandedSections[section]
    onSeccionColapsadaChange(`tabla_${section}`, newValue)
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Paquetes
  // ═══════════════════════════════════════════════════════════════
  const updatePackage = (tipo: 'basic' | 'professional' | 'enterprise', field: keyof PackageInfo, value: string | boolean) => {
    onChange({
      ...data,
      paquetes: {
        ...data.paquetes,
        [tipo]: { ...data.paquetes[tipo], [field]: value },
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Categorías
  // ═══════════════════════════════════════════════════════════════
  const addCategoria = () => {
    const newCategoria: ComparisonCategory = {
      category: 'Nueva Categoría',
      items: [],
    }
    onChange({
      ...data,
      categorias: [...data.categorias, newCategoria],
    })
  }

  const updateCategoria = (index: number, category: string) => {
    const newCategorias = [...data.categorias]
    newCategorias[index] = { ...newCategorias[index], category }
    onChange({ ...data, categorias: newCategorias })
  }

  const removeCategoria = (index: number) => {
    onChange({
      ...data,
      categorias: data.categorias.filter((_, i) => i !== index),
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // Funciones para Items dentro de Categorías
  // ═══════════════════════════════════════════════════════════════
  const addItem = (catIndex: number) => {
    const newItem: PackageFeature = {
      name: 'Nueva característica',
      basic: false,
      professional: false,
      enterprise: false,
    }
    const newCategorias = [...data.categorias]
    newCategorias[catIndex] = {
      ...newCategorias[catIndex],
      items: [...newCategorias[catIndex].items, newItem],
    }
    onChange({ ...data, categorias: newCategorias })
  }

  const updateItem = (catIndex: number, itemIndex: number, field: keyof PackageFeature, value: boolean | string) => {
    const newCategorias = [...data.categorias]
    const newItems = [...newCategorias[catIndex].items]
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
    newCategorias[catIndex] = { ...newCategorias[catIndex], items: newItems }
    onChange({ ...data, categorias: newCategorias })
  }

  const removeItem = (catIndex: number, itemIndex: number) => {
    const newCategorias = [...data.categorias]
    newCategorias[catIndex] = {
      ...newCategorias[catIndex],
      items: newCategorias[catIndex].items.filter((_, i) => i !== itemIndex),
    }
    onChange({ ...data, categorias: newCategorias })
  }

  // Helper para renderizar el valor de una feature
  const renderFeatureInput = (
    catIndex: number,
    itemIndex: number,
    field: 'basic' | 'professional' | 'enterprise',
    value: boolean | string
  ) => {
    const isBoolean = typeof value === 'boolean'
    
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateItem(catIndex, itemIndex, field, !isBoolean ? true : !value)}
          className={`p-1.5 rounded border ${
            isBoolean && value 
              ? 'bg-gh-success/20 border-gh-success text-gh-success' 
              : isBoolean 
              ? 'bg-gh-danger/20 border-gh-danger text-gh-danger'
              : 'bg-gh-bg-secondary border-gh-border text-gh-text-muted'
          }`}
          title={isBoolean ? (value ? 'Incluido' : 'No incluido') : 'Texto personalizado'}
        >
          {isBoolean ? (value ? <FaCheck size={10} /> : <FaTimes size={10} />) : '📝'}
        </button>
        {!isBoolean && (
          <input
            type="text"
            value={value}
            onChange={(e) => updateItem(catIndex, itemIndex, field, e.target.value)}
            className="flex-1 px-2 py-1 bg-gh-bg-secondary border border-gh-border rounded text-xs text-gh-text"
            placeholder="Texto..."
          />
        )}
        <button
          onClick={() => updateItem(catIndex, itemIndex, field, isBoolean ? 'Texto' : true)}
          className="text-xs text-gh-text-muted hover:text-gh-text"
          title="Cambiar tipo"
        >
          ↔
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader
        title="Tabla Comparativa"
        icon={<FaTable className="text-gh-accent" />}
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

      {/* Contenedor con opacity si global OFF */}
      <div className={`space-y-4 transition-opacity duration-200 ${!visible ? 'opacity-50' : ''}`}>
        
        {/* Subsección: Títulos */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.titulos === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📌 Título y Subtítulo</span>
            <ToggleSwitch 
              enabled={vis.titulos !== false} 
              onChange={(v) => handleVisChange('titulos', v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Título de la sección</label>
              <input
                type="text"
                value={data.titulo}
                onChange={(e) => onChange({ ...data, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={data.subtitulo}
                onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PAQUETES */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.paquetes === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('paquetes')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                📦 Configuración de Paquetes
              </span>
              {expandedSections.paquetes ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.paquetes !== false} 
              onChange={(v) => handleVisChange('paquetes', v)}
            />
          </div>

          {expandedSections.paquetes && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {(['basic', 'professional', 'enterprise'] as const).map((tipo) => (
                <div key={tipo} className="p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gh-text capitalize">{tipo}</span>
                    {tipo === 'professional' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gh-text-muted">Popular</span>
                        <ToggleSwitch
                          enabled={data.paquetes[tipo].popular ?? false}
                          onChange={(v) => updatePackage(tipo, 'popular', v)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Nombre</label>
                      <input
                        type="text"
                        value={data.paquetes[tipo].name}
                        onChange={(e) => updatePackage(tipo, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Precio</label>
                      <input
                        type="text"
                        value={data.paquetes[tipo].price}
                        onChange={(e) => updatePackage(tipo, 'price', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Descripción</label>
                      <input
                        type="text"
                        value={data.paquetes[tipo].description}
                        onChange={(e) => updatePackage(tipo, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gh-text-muted text-xs mb-1">Texto del botón (CTA)</label>
                      <input
                        type="text"
                        value={data.paquetes[tipo].cta}
                        onChange={(e) => updatePackage(tipo, 'cta', e.target.value)}
                        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CATEGORÍAS Y FEATURES */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.categorias === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('categorias')}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-gh-text font-medium">
                📋 Categorías y Características
              </span>
              {expandedSections.categorias ? <FaChevronUp className="text-gh-text-muted" /> : <FaChevronDown className="text-gh-text-muted" />}
            </button>
            <ToggleSwitch 
              enabled={vis.categorias !== false} 
              onChange={(v) => handleVisChange('categorias', v)}
            />
          </div>

          {expandedSections.categorias && (
            <div className="mt-4 space-y-4">
              {data.categorias.map((categoria, catIndex) => (
                <div key={`cat-${catIndex}`} className="p-4 bg-gh-bg-secondary/50 border border-gh-border/50 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={categoria.category}
                      onChange={(e) => updateCategoria(catIndex, e.target.value)}
                      className="px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm font-medium text-gh-text"
                    />
                    <button
                      onClick={() => removeCategoria(catIndex)}
                      className="text-gh-danger hover:text-gh-danger/80 text-xs p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Items de la categoría */}
                  <div className="space-y-2">
                    {categoria.items.map((item, itemIndex) => (
                      <div key={`item-${catIndex}-${itemIndex}`} className="p-3 bg-gh-bg-tertiary border border-gh-border rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(catIndex, itemIndex, 'name', e.target.value)}
                            className="flex-1 px-2 py-1 bg-gh-bg-secondary border border-gh-border rounded text-sm text-gh-text"
                            placeholder="Nombre de la característica"
                          />
                          <button
                            onClick={() => removeItem(catIndex, itemIndex)}
                            className="text-gh-danger hover:text-gh-danger/80 text-xs"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-gh-text-muted text-xs mb-1">Básico</label>
                            {renderFeatureInput(catIndex, itemIndex, 'basic', item.basic)}
                          </div>
                          <div>
                            <label className="block text-gh-text-muted text-xs mb-1">Profesional</label>
                            {renderFeatureInput(catIndex, itemIndex, 'professional', item.professional)}
                          </div>
                          <div>
                            <label className="block text-gh-text-muted text-xs mb-1">Enterprise</label>
                            {renderFeatureInput(catIndex, itemIndex, 'enterprise', item.enterprise)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addItem(catIndex)}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-gh-info/20 border border-gh-info/30 text-gh-info rounded-md text-xs hover:bg-gh-info/30 transition-colors"
                  >
                    <FaPlus /> Agregar Característica
                  </button>
                </div>
              ))}

              <button
                onClick={addCategoria}
                className="flex items-center gap-2 px-3 py-2 bg-gh-success/20 border border-gh-success/30 text-gh-success rounded-md text-sm hover:bg-gh-success/30 transition-colors"
              >
                <FaPlus /> Agregar Categoría
              </button>
            </div>
          )}
        </div>

        {/* Nota al pie */}
        <div className={`p-4 bg-gh-bg-overlay border border-gh-border rounded-lg transition-opacity duration-200 ${vis.notaPie === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📝 Nota al Pie</span>
            <ToggleSwitch 
              enabled={vis.notaPie !== false} 
              onChange={(v) => handleVisChange('notaPie', v)}
            />
          </div>
          <textarea
            value={data.notaPie}
            onChange={(e) => onChange({ ...data, notaPie: e.target.value })}
            className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text"
            rows={2}
          />
        </div>

      </div>
    </motion.div>
  )
}
