'use client'

import React, { useState, useEffect } from 'react'
import { PackageSnapshot } from '@/lib/types'
import { FaTrash, FaPlus } from 'react-icons/fa'

interface PaqueteContenidoTabProps {
  snapshot: PackageSnapshot
  readOnly: boolean
  onChange: (snapshot: PackageSnapshot) => void
}

export default function PaqueteContenidoTab({
  snapshot,
  readOnly,
  onChange,
}: PaqueteContenidoTabProps) {
  const [contenido, setContenido] = useState(
    snapshot.contenido || {
      features: [],
      beneficios: [],
      incluidos: [],
      exclusiones: [],
      terminosCondiciones: '',
      informacionAdicional: '',
    }
  )

  // Sincronizar cuando cambia el snapshot
  useEffect(() => {
    setContenido(
      snapshot.contenido || {
        features: [],
        beneficios: [],
        incluidos: [],
        exclusiones: [],
        terminosCondiciones: '',
        informacionAdicional: '',
      }
    )
  }, [snapshot.id])

  const handleChange = (field: string, value: any) => {
    const updated = { ...contenido, [field]: value }
    setContenido(updated)
    onChange({
      ...snapshot,
      contenido: updated,
    })
  }

  const handleAddItem = (field: 'features' | 'beneficios' | 'incluidos' | 'exclusiones', value: string) => {
    if (value.trim()) {
      const updated = { ...contenido, [field]: [...contenido[field], value.trim()] }
      setContenido(updated)
      onChange({
        ...snapshot,
        contenido: updated,
      })
    }
  }

  const handleRemoveItem = (field: 'features' | 'beneficios' | 'incluidos' | 'exclusiones', index: number) => {
    const updated = {
      ...contenido,
      [field]: contenido[field].filter((_, i) => i !== index),
    }
    setContenido(updated)
    onChange({
      ...snapshot,
      contenido: updated,
    })
  }

  return (
    <div className="paquete-contenido-tab space-y-6 py-6 px-6">
      {/* Características Principales */}
      <ArrayFieldEditor
        label="✨ Características principales"
        items={contenido.features}
        onAddItem={(value) => handleAddItem('features', value)}
        onRemoveItem={(index) => handleRemoveItem('features', index)}
        readOnly={readOnly}
        placeholder="Ej: Diseño responsive, SEO optimizado..."
      />

      {/* Beneficios */}
      <ArrayFieldEditor
        label="🎯 Beneficios"
        items={contenido.beneficios}
        onAddItem={(value) => handleAddItem('beneficios', value)}
        onRemoveItem={(index) => handleRemoveItem('beneficios', index)}
        readOnly={readOnly}
        placeholder="Ej: Aumenta conversiones, mejora visibilidad..."
      />

      {/* Incluidos */}
      <ArrayFieldEditor
        label="✅ ¿Qué está incluido?"
        items={contenido.incluidos}
        onAddItem={(value) => handleAddItem('incluidos', value)}
        onRemoveItem={(index) => handleRemoveItem('incluidos', index)}
        readOnly={readOnly}
        placeholder="Ej: Hosting gratis 3 meses, dominio .com..."
      />

      {/* Exclusiones */}
      <ArrayFieldEditor
        label="¿Qué NO está incluido?"
        items={contenido.exclusiones}
        onAddItem={(value) => handleAddItem('exclusiones', value)}
        onRemoveItem={(index) => handleRemoveItem('exclusiones', index)}
        readOnly={readOnly}
        placeholder="Ej: Email ilimitado, certificados SSL avanzados..."
      />

      {/* Términos y Condiciones */}
      <TextareaField
        label="📋 Términos y Condiciones"
        value={contenido.terminosCondiciones}
        onChange={(value) => handleChange('terminosCondiciones', value)}
        readOnly={readOnly}
        rows={3}
        placeholder="Describe los términos, condiciones y limitaciones de este paquete..."
      />

      {/* Información Adicional */}
      <TextareaField
        label="ℹ️ Información Adicional"
        value={contenido.informacionAdicional}
        onChange={(value) => handleChange('informacionAdicional', value)}
        readOnly={readOnly}
        rows={3}
        placeholder="Información extra, notas importantes, o detalles relevantes..."
      />
    </div>
  )
}

// Subcomponente: ArrayFieldEditor
interface ArrayFieldEditorProps {
  label: string
  items: string[]
  onAddItem: (value: string) => void
  onRemoveItem: (index: number) => void
  readOnly: boolean
  placeholder?: string
}

function ArrayFieldEditor({
  label,
  items,
  onAddItem,
  onRemoveItem,
  readOnly,
  placeholder,
}: ArrayFieldEditorProps) {
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim())
      setNewItem('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="array-field-editor bg-gh-bg-overlay p-6 rounded-lg border border-gh-border space-y-4">
      <label className="block text-sm font-semibold text-gh-text uppercase tracking-wide">{label}</label>

      {/* Lista de items */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-gh-text-muted italic py-4">Sin items agregados</p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gh-bg-secondary border border-gh-border rounded-md px-4 py-3 hover:border-gh-border-light transition-colors"
            >
              <span className="text-sm text-gh-text flex-1">{item}</span>
              {!readOnly && (
                <button
                  onClick={() => onRemoveItem(index)}
                  className="ml-3 p-2 text-gh-warning hover:bg-gh-bg-overlay rounded-md transition-colors"
                  title="Eliminar"
                  aria-label={`Eliminar item: ${item}`}
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input para agregar */}
      {!readOnly && (
        <div className="flex gap-3 pt-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Agregar nuevo...'}
            className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-gh-text outline-none transition"
            disabled={readOnly}
          />
          <button
            onClick={handleAdd}
            disabled={readOnly || !newItem.trim()}
            className="px-4 py-2 bg-gh-success text-white rounded-md text-sm hover:bg-[#1f7935] disabled:bg-gh-bg-secondary disabled:text-gh-text-muted transition-all flex items-center gap-2 font-semibold"
            aria-label="Agregar nuevo item"
          >
            <FaPlus size={14} />
            Agregar
          </button>
        </div>
      )}
    </div>
  )
}

// Subcomponente: TextareaField
interface TextareaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  readOnly: boolean
  rows?: number
  placeholder?: string
}

function TextareaField({
  label,
  value,
  onChange,
  readOnly,
  rows = 3,
  placeholder,
}: TextareaFieldProps) {
  return (
    <div className="textarea-field bg-gh-bg-overlay p-6 rounded-lg border border-gh-border space-y-3">
      <label className="block text-sm font-semibold text-gh-text uppercase tracking-wide">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 text-gh-text outline-none transition disabled:bg-gh-bg-secondary disabled:text-gh-text-muted disabled:opacity-50"
      />
    </div>
  )
}
