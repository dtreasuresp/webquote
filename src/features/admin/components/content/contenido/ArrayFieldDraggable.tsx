'use client'

import React, { useState } from 'react'
import { FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa'
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
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 items-center ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Handle de arrastre */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="p-2 text-gh-text-muted hover:text-gh-text cursor-grab active:cursor-grabbing transition-colors rounded hover:bg-gh-bg-tertiary"
        title="Arrastrar para reordenar"
      >
        <FaGripVertical size={12} />
      </button>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onUpdate(index, e.target.value)}
        className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text"
      />
      <button
        onClick={() => onRemove(index)}
        type="button"
        className="p-2 text-gh-danger hover:bg-gh-danger/10 rounded-md transition-colors"
        title="Eliminar"
      >
        <FaTrash size={12} />
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
    <div>
      {label && (
        <label className="block text-gh-text font-medium text-xs mb-3 uppercase tracking-wide">
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
            {items.map((item, index) => (
              <SortableItem
                key={itemIds[index]}
                id={itemIds[index]}
                value={item}
                index={index}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        <div className="flex gap-2 pt-2">
          <div className="w-8" /> {/* Spacer para alinear con los items arrastrables */}
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border border-dashed rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-sm text-gh-text placeholder-gh-text-muted"
          />
          <button
            onClick={handleAdd}
            type="button"
            disabled={!newItem.trim()}
            className="px-3 py-2 text-xs font-medium text-white bg-gh-success hover:bg-gh-success/90 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus size={10} /> Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
