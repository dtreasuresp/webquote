'use client'

import React from 'react'
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'
import ToggleSwitch from '@/features/admin/components/ToggleSwitch'

interface CollapsibleSectionHeaderProps {
  readonly title: string
  readonly isExpanded: boolean
  readonly onToggle: () => void
  readonly icon?: string | LucideIcon
  readonly badge?: string | number
  readonly isVisible?: boolean
  readonly onVisibilityChange?: (visible: boolean) => void
  readonly className?: string
}

export default function CollapsibleSectionHeader({
  title,
  isExpanded,
  onToggle,
  icon,
  badge,
  isVisible = true,
  onVisibilityChange,
  className = '',
}: CollapsibleSectionHeaderProps) {
  const IconComponent = typeof icon === 'function' ? icon : null

  return (
    <div className={`px-4 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30 flex items-center justify-between ${className}`}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-xs font-medium text-gh-text hover:text-gh-info transition-colors flex-1"
      >
        {/* Icono: puede ser emoji string o Lucide icon component */}
        {typeof icon === 'string' ? (
          <span className="text-base">{icon}</span>
        ) : IconComponent ? (
          <IconComponent className="w-3.5 h-3.5 text-gh-info" />
        ) : null}

        {/* Título */}
        <span>{title}</span>

        {/* Badge (opcional) */}
        {badge !== undefined && (
          <span className="text-gh-text-muted font-normal">({badge})</span>
        )}

        {/* Chevron */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gh-text-muted ml-auto" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gh-text-muted ml-auto" />
        )}
      </button>

      {/* Toggle de visibilidad (opcional) */}
      {onVisibilityChange && (
        <ToggleSwitch enabled={isVisible} onChange={onVisibilityChange} />
      )}
    </div>
  )
}
