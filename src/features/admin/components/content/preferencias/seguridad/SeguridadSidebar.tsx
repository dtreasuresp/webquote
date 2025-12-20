'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Key, 
  LayoutGrid, 
  Users, 
  FileText,
  Database,
  ChevronRight
} from 'lucide-react'

export type SecuritySection = 'roles' | 'permisos' | 'matriz' | 'usuarios-permisos' | 'logs' | 'backups'

interface SeguridadSidebarProps {
  activeSection: SecuritySection
  onSectionChange: (section: SecuritySection) => void
}

const securitySections = [
  {
    id: 'roles' as SecuritySection,
    label: 'Roles',
    icon: Shield,
    description: 'Gestionar roles del sistema',
  },
  {
    id: 'permisos' as SecuritySection,
    label: 'Permisos',
    icon: Key,
    description: 'Catálogo de permisos',
  },
  {
    id: 'matriz' as SecuritySection,
    label: 'Matriz de Acceso',
    icon: LayoutGrid,
    description: 'Asignar permisos a roles',
  },
  {
    id: 'usuarios-permisos' as SecuritySection,
    label: 'Permisos por Usuario',
    icon: Users,
    description: 'Permisos individuales',
  },
  {
    id: 'logs' as SecuritySection,
    label: 'Logs de Auditoría',
    icon: FileText,
    description: 'Historial de cambios',
  },
  {
    id: 'backups' as SecuritySection,
    label: 'Backups',
    icon: Database,
    description: 'Copias de seguridad',
  },
]

export default function SeguridadSidebar({
  activeSection,
  onSectionChange,
}: Readonly<SeguridadSidebarProps>) {
  const [hoveredItem, setHoveredItem] = useState<SecuritySection | null>(null)

  return (
    <div className="w-48 flex-shrink-0">
      <div className="bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-gh-accent" />
            <span className="text-xs font-medium text-gh-text">Seguridad</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-1.5 space-y-0.5">
          {securitySections.map((section, index) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            const isHovered = hoveredItem === section.id

            return (
              <motion.button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                onMouseEnter={() => setHoveredItem(section.id)}
                onMouseLeave={() => setHoveredItem(null)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.15 }}
                className={`
                  group relative w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs
                  transition-colors duration-150
                  ${isActive 
                    ? 'bg-gh-accent/10 text-gh-accent' 
                    : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary/40'
                  }
                `}
              >
                {/* Indicador activo */}
                {isActive && (
                  <motion.div
                    layoutId="securitySidebarIndicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gh-accent rounded-r"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                {(() => {
                  let iconClass = 'text-gh-text-muted'
                  if (isActive) {
                    iconClass = 'text-gh-accent'
                  } else if (isHovered) {
                    iconClass = 'text-gh-text'
                  }
                  return (
                    <div className={`flex items-center justify-center w-5 h-5 rounded transition-colors duration-150 ${iconClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  )
                })()}

                {/* Label */}
                <span className="flex-1 text-left truncate">
                  {section.label}
                </span>

                {/* Chevron */}
                {isActive && (
                  <ChevronRight className="w-3 h-3 text-gh-accent/60" />
                )}
              </motion.button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}


