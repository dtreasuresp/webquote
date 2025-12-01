'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaQuestionCircle, FaPlus, FaTrash } from 'react-icons/fa'
import ContentHeader from '@/features/admin/components/content/contenido/ContentHeader'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'
import type { FAQItem } from '@/lib/types'

interface TituloSubtituloFAQ {
  titulo: string
  subtitulo: string
}

interface FAQContentProps {
  readonly data: FAQItem[]
  readonly onChange: (data: FAQItem[]) => void
  readonly visible: boolean
  readonly onVisibleChange: (visible: boolean) => void
  readonly tituloSubtitulo?: TituloSubtituloFAQ
  readonly onTituloSubtituloChange?: (field: keyof TituloSubtituloFAQ, value: string) => void
  readonly updatedAt?: string | null
  readonly onGuardar: () => void
  readonly onReset: () => void
  readonly guardando: boolean
  readonly hasChanges?: boolean
}

export default function FAQContent({ data, onChange, visible, onVisibleChange, tituloSubtitulo, onTituloSubtituloChange, updatedAt, onGuardar, onReset, guardando, hasChanges }: FAQContentProps) {
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  
  // Valores por defecto para título y subtítulo
  const titSub = tituloSubtitulo || { titulo: 'Preguntas Frecuentes', subtitulo: '' }
  const handleTitSubChange = (field: keyof TituloSubtituloFAQ, value: string) => {
    if (onTituloSubtituloChange) onTituloSubtituloChange(field, value)
  }

  const handleAdd = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      onChange([...data, { question: newQuestion.trim(), answer: newAnswer.trim() }])
      setNewQuestion('')
      setNewAnswer('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  const handleUpdate = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <ContentHeader 
        title="Preguntas Frecuentes (FAQ)" 
        icon={<FaQuestionCircle className="text-gh-info" />}
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
        {/* 📌 TÍTULO Y SUBTÍTULO - No colapsable */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm text-gh-text font-medium">📌 Título y Subtítulo</span>
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
                value={titSub.titulo}
                onChange={(e) => handleTitSubChange('titulo', e.target.value)}
                placeholder="Preguntas Frecuentes"
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gh-text-muted text-xs mb-1">Subtítulo</label>
              <input
                type="text"
                value={titSub.subtitulo}
                onChange={(e) => handleTitSubChange('subtitulo', e.target.value)}
                placeholder="Respuestas a las preguntas más comunes"
                className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LISTA DE FAQS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaQuestionCircle className="text-gh-info" />
              <span className="text-gh-text font-medium text-xs uppercase tracking-wide">
                Preguntas ({data.length})
              </span>
            </div>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          
          <div className="space-y-3">
            {data.map((faq, index) => (
              <div key={`faq-${faq.question.slice(0, 20)}-${index}`} className="p-4 bg-gh-bg-secondary border border-gh-border rounded-md space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gh-text-muted">Pregunta #{index + 1}</span>
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-1.5 text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
                    title="Eliminar"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
                
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdate(index, 'question', e.target.value)}
                  placeholder="Pregunta..."
                  className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text font-medium"
                />
                
                <textarea
                  value={Array.isArray(faq.answer) ? faq.answer.join('\n') : faq.answer}
                  onChange={(e) => handleUpdate(index, 'answer', e.target.value)}
                  placeholder="Respuesta..."
                  className="w-full px-3 py-2 bg-gh-bg-tertiary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* AGREGAR NUEVA PREGUNTA */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="p-4 bg-gh-bg-overlay border border-gh-border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaPlus className="text-gh-success" />
              <span className="text-gh-text font-medium text-xs uppercase tracking-wide">
                Agregar Nueva Pregunta
              </span>
            </div>
            <ToggleSwitch 
              enabled={true} 
              onChange={() => {}} 
            />
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="¿Cuál es la pregunta?"
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
            />
            
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Escribe la respuesta..."
              className="w-full px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
              rows={2}
            />
            
            <button
              onClick={handleAdd}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
              className="px-4 py-2 text-xs font-medium text-white bg-gh-success hover:bg-gh-success/90 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus size={10} /> Agregar Pregunta
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
