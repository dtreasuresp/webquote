'use client'

import React, { useState } from 'react'
import { Plus, Trash2, GripVertical, ArrowRight } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CaracteristicaItem {
  id: string
  texto: string
  paqueteNombre: string
}

interface SortableCaracteristicaProps {
  readonly item: CaracteristicaItem
  readonly onUpdate: (id: string, texto: string) => void
  readonly onRemove: (id: string) => void
}

interface DroppablePaqueteCaracteristicasProps {
  readonly paqueteNombre: string
  readonly items: CaracteristicaItem[]
  readonly onUpdate: (id: string, texto: string) => void
  readonly onRemove: (id: string) => void
  readonly onAdd: (texto: string) => void
  readonly placeholder?: string
  readonly isOver?: boolean
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Característica individual arrastrable
// ═══════════════════════════════════════════════════════════════

export function SortableCaracteristica({ 
  item, 
  onUpdate, 
  onRemove 
}: SortableCaracteristicaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    data: {
      type: 'caracteristica',
      item,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 items-center p-3 bg-gh-bg-secondary border rounded-lg transition-all ${
        isDragging 
          ? 'border-gh-info shadow-xl ring-2 ring-gh-info/40 opacity-90 scale-[1.02]' 
          : 'border-gh-border hover:border-gh-info/50'
      }`}
    >
      {/* Handle de arrastre */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className={`p-2 rounded transition-colors ${
          isDragging 
            ? 'text-gh-info bg-gh-info/20 cursor-grabbing' 
            : 'text-gh-text-muted hover:text-gh-info hover:bg-gh-info/10 cursor-grab'
        }`}
        title="Arrastrar para reordenar o mover a otro paquete"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      
      <input
        type="text"
        value={item.texto}
        onChange={(e) => onUpdate(item.id, e.target.value)}
        className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-info focus:ring-1 focus:ring-gh-info/50 focus:outline-none text-xs font-medium text-gh-text transition-colors"
      />
      
      <button
        onClick={() => onRemove(item.id)}
        type="button"
        className="p-2 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
        title="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Zona droppable para características de un paquete
// ═══════════════════════════════════════════════════════════════

export function DroppablePaqueteCaracteristicas({
  paqueteNombre,
  items,
  onUpdate,
  onRemove,
  onAdd,
  placeholder = 'Nueva característica...',
  isOver = false,
}: DroppablePaqueteCaracteristicasProps) {
  const [newItem, setNewItem] = useState('')
  
  const { setNodeRef } = useDroppable({
    id: `droppable-${paqueteNombre}`,
    data: {
      type: 'paquete',
      paqueteNombre,
    }
  })

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim())
      setNewItem('')
    }
  }

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-2 min-h-[60px] p-2 rounded-lg transition-all ${
        isOver 
          ? 'bg-gh-info/10 border-2 border-dashed border-gh-info' 
          : 'border-2 border-transparent'
      }`}
    >
      {/* Indicador visual cuando se está arrastrando sobre este paquete */}
      {isOver && (
        <div className="flex items-center justify-center gap-2 py-2 text-gh-info text-xs font-medium">
          <ArrowRight className="w-3 h-3" />
          <span>Soltar aquí para mover a {paqueteNombre}</span>
        </div>
      )}
      
      {items.length === 0 && !isOver ? (
        <div className="text-center py-4 bg-gh-bg-secondary border border-dashed border-gh-border rounded-lg">
          <p className="text-xs font-medium text-gh-text-muted">No hay características</p>
        </div>
      ) : (
        items.map((item) => (
          <SortableCaracteristica
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))
      )}
      
      {/* Input para agregar nueva característica */}
      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border border-dashed rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-xs font-medium text-gh-text placeholder-gh-text-muted transition-colors"
        />
        <button
          onClick={handleAdd}
          type="button"
          disabled={!newItem.trim()}
          className="px-4 py-2 text-xs font-medium bg-gh-success/10 text-gh-success border border-gh-success/30 rounded-md hover:bg-gh-success/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>
    </div>
  )
}



