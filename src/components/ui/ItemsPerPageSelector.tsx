'use client'

import React from 'react'
import { DropdownSelect } from '@/components/ui/DropdownSelect'

interface ItemsPerPageSelectorProps {
  readonly value: number | 'all'
  readonly onChange: (value: number | 'all') => void
  readonly total: number
  readonly displayed?: number
  readonly className?: string
}

/**
 * Selector de elementos por página para paginación
 * Opciones: 10, 30, 50, 100, Todos
 * Default: 10 elementos
 */
export function ItemsPerPageSelector({ 
  value, 
  onChange, 
  total,
  className = '',
  displayed,
}: ItemsPerPageSelectorProps) {
  const options = [
    { value: '10', label: 'Mostrar 10', disabled: total !== 0 && total < 10 },
    { value: '30', label: 'Mostrar 30', disabled: total !== 0 && total < 30 },
    { value: '50', label: 'Mostrar 50', disabled: total !== 0 && total < 50 },
    { value: '100', label: 'Mostrar 100', disabled: total !== 0 && total < 100 },
    { 
      value: 'all', 
      label: `Mostrar todos (${total})`, 
      disabled: total !== 0 && total > 500
    },
  ]

  const handleChange = (newValue: string) => {
    onChange(newValue === 'all' ? 'all' : Number.parseInt(newValue, 10))
  }

  const safeTotal = Number(total) || 0
  const displayValue = value === 'all' ? safeTotal : (Number(value) || 0)
  let shownCount: number
  if (typeof displayed === 'number') {
    shownCount = displayed
  } else if (safeTotal === 0) {
    shownCount = 0
  } else {
    shownCount = Math.min(displayValue, safeTotal)
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-xs text-gh-text-muted whitespace-nowrap">
        Elementos por página:
      </span>
      <DropdownSelect
        value={String(value)}
        onChange={handleChange}
        options={options}
        className="w-[160px]"
      />
          <span className="text-xs text-gh-text-muted whitespace-nowrap">
            Mostrando {shownCount} de {total}
          </span>
    </div>
  )
}
