'use client'

import React, { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ArrayFieldDraggableProps {
  readonly label: string
  readonly items: string[]
  readonly onChange: (items: string[]) => void
  readonly placeholder?: string
}

interface SortableItemProps {
  readonly id: string
  readonly value: string
  readonly index: number
  readonly onUpdate: (index: number, value: string) => void
  readonly onRemove: (index: number) => void
}

function SortableItem({ id, value, index, onUpdate, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 items-center p-3 bg-gh-bg-secondary border rounded-lg transition-shadow ${isDragging ? 'border-gh-info shadow-xl ring-2 ring-gh-info/40 opacity-90' : 'border-gh-border hover:border-gh-info/50'}`}
    >
      {/* Handle de arrastre */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className={`p-2 rounded transition-colors ${isDragging ? 'text-gh-info bg-gh-info/20 cursor-grabbing' : 'text-gh-text-muted hover:text-gh-info hover:bg-gh-info/10 cursor-grab'}`}
        title="Arrastrar para reordenar"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onUpdate(index, e.target.value)}
        className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-info focus:ring-1 focus:ring-gh-info/50 focus:outline-none text-xs font-medium text-gh-text transition-colors"
      />
      <button
        onClick={() => onRemove(index)}
        type="button"
        className="p-2 text-gh-text-muted hover:text-gh-danger hover:bg-gh-danger/10 rounded transition-colors"
        title="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function ArrayFieldDraggable({ 
  label, 
  items, 
  onChange, 
  placeholder = 'Nuevo item...' 
}: ArrayFieldDraggableProps) {
  const [newItem, setNewItem] = useState('')

  // Crear IDs únicos para cada item basados en su índice y contenido
  const itemIds = items.map((item, index) => `item-${index}-${item.slice(0, 10)}`)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Necesita mover 5px antes de activar el drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(active.id as string)
      const newIndex = itemIds.indexOf(over.id as string)
      onChange(arrayMove(items, oldIndex, newIndex))
    }
  }

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleUpdate = (index: number, value: string) => {
    const updated = [...items]
    updated[index] = value
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-gh-text font-medium text-xs mb-3">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {items.length === 0 ? (
              <div className="text-center py-6 bg-gh-bg-secondary border border-dashed border-gh-border rounded-lg">
                <p className="text-xs font-medium text-gh-text-muted">No hay items agregados</p>
              </div>
            ) : (
              items.map((item, index) => (
                <SortableItem
                  key={itemIds[index]}
                  id={itemIds[index]}
                  value={item}
                  index={index}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
        
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
    </div>
  )
}




