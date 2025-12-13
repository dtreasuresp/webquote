'use client'

import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface ArrayFieldGHProps {
  readonly label: string
  readonly items: string[]
  readonly onChange: (items: string[]) => void
  readonly placeholder?: string
}

export default function ArrayFieldGH({ label, items, onChange, placeholder = 'Nuevo item...' }: ArrayFieldGHProps) {
  const [newItem, setNewItem] = useState('')

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
      <label className="block text-gh-text font-medium text-xs mb-3">{label}</label>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border/30 rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-xs font-medium text-gh-text"
            />
            <button
              onClick={() => handleRemove(index)}
              className="p-2 text-gh-danger hover:bg-gh-danger/10 rounded-md transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-gh-bg-secondary border border-gh-border border-dashed rounded-md focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none text-xs font-medium text-gh-text placeholder-gh-text-muted"
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="px-3 py-2 text-xs font-medium text-white bg-gh-success hover:bg-gh-success/90 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-2.5 h-2.5" /> Agregar
          </button>
        </div>
      </div>
    </div>
  )
}




