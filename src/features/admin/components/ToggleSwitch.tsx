'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ToggleSwitchProps {
  readonly enabled: boolean
  readonly onChange: (enabled: boolean) => void
  readonly label?: string
  readonly size?: 'sm' | 'md'
  readonly disabled?: boolean
}

export default function ToggleSwitch({ 
  enabled, 
  onChange, 
  label,
  size = 'sm',
  disabled = false
}: ToggleSwitchProps) {
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translateOn: 16,
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translateOn: 20,
    },
  }

  const currentSize = sizes[size]
  const translateX = enabled ? currentSize.translateOn : 2

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-gh-success/50 focus:ring-offset-2 focus:ring-offset-gh-bg-primary
        ${currentSize.track}
        ${enabled 
          ? 'bg-gh-success' 
          : 'bg-gh-border'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:opacity-90'
        }
      `}
    >
      <motion.span
        animate={{ x: translateX }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`
          inline-block rounded-full bg-white shadow-sm
          ${currentSize.thumb}
        `}
      />
      
      {/* Indicadores visuales ON/OFF */}
      <span className="sr-only">{enabled ? 'Activado' : 'Desactivado'}</span>
    </button>
  )
}

/** Componente wrapper que incluye el label junto al toggle */
interface ToggleSwitchWithLabelProps extends ToggleSwitchProps {
  readonly labelPosition?: 'left' | 'right'
  readonly description?: string
}

export function ToggleSwitchWithLabel({
  enabled,
  onChange,
  label,
  labelPosition = 'left',
  description,
  size = 'sm',
  disabled = false,
}: ToggleSwitchWithLabelProps) {
  return (
    <div className={`flex items-center gap-3 ${labelPosition === 'right' ? 'flex-row-reverse justify-end' : ''}`}>
      {label && (
        <div className="flex-1 min-w-0">
          <span className={`
            block text-xs font-medium uppercase tracking-wide
            ${enabled ? 'text-gh-text' : 'text-gh-text-muted'}
            ${disabled ? 'opacity-50' : ''}
          `}>
            {label}
          </span>
          {description && (
            <span className="block text-xs text-gh-text-muted mt-0.5 truncate">
              {description}
            </span>
          )}
        </div>
      )}
      <ToggleSwitch
        enabled={enabled}
        onChange={onChange}
        size={size}
        disabled={disabled}
      />
    </div>
  )
}
