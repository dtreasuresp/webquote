'use client'

import React, { useState } from 'react'
import { Settings, RefreshCw, Users, ShieldCheck, Shield, Key, LayoutGrid, FileText, ChevronRight, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type SidebarSection = 'general' | 'sincronizacion' | 'usuarios' | 'seguridad'
export type SecuritySubSection = 'roles' | 'permisos' | 'matriz' | 'usuarios-permisos' | 'logs'

interface PreferenciasSidebarProps {
  activeSection: SidebarSection
  onSectionChange: (section: SidebarSection) => void
  activeSecuritySubSection?: SecuritySubSection
  onSecuritySubSectionChange?: (subSection: SecuritySubSection) => void
}

const sections = [
  {
    id: 'general' as SidebarSection,
    label: 'Configuración General',
    icon: Settings,
    description: 'Preferencias generales de la aplicación',
  },
  {
    id: 'sincronizacion' as SidebarSection,
    label: 'Sincronización',
    icon: RefreshCw,
    description: 'Configuración de sincronización y caché',
  },
  {
    id: 'usuarios' as SidebarSection,
    label: 'Gestión de Usuarios',
    icon: Users,
    description: 'Administración de usuarios del sistema',
  },
  {
    id: 'seguridad' as SidebarSection,
    label: 'Seguridad y Acceso',
    icon: ShieldCheck,
    description: 'Roles, permisos y auditoría',
    isParent: true,
  },
]

// Sub-secciones de seguridad
const securitySubSections = [
  {
    id: 'roles' as SecuritySubSection,
    label: 'Roles',
    icon: Shield,
  },
  {
    id: 'permisos' as SecuritySubSection,
    label: 'Permisos',
    icon: Key,
  },
  {
    id: 'matriz' as SecuritySubSection,
    label: 'Matriz de Acceso',
    icon: LayoutGrid,
  },
  {
    id: 'usuarios-permisos' as SecuritySubSection,
    label: 'Permisos por Usuario',
    icon: Users,
  },
  {
    id: 'logs' as SecuritySubSection,
    label: 'Logs de Auditoría',
    icon: FileText,
  },
]

export default function PreferenciasSidebar({
  activeSection,
  onSectionChange,
  activeSecuritySubSection = 'roles',
  onSecuritySubSectionChange,
}: Readonly<PreferenciasSidebarProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<SidebarSection | SecuritySubSection | null>(null)

  const handleSectionClick = (section: SidebarSection) => {
    onSectionChange(section)
    // Si se hace clic en seguridad y hay callback, activar la primera subsección
    if (section === 'seguridad' && onSecuritySubSectionChange) {
      onSecuritySubSectionChange('roles')
    }
    setIsOpen(false)
  }

  const handleSecuritySubSectionClick = (subSection: SecuritySubSection) => {
    if (onSecuritySubSectionChange) {
      onSecuritySubSectionChange(subSection)
    }
    // Asegurar que la sección principal sea 'seguridad'
    if (activeSection !== 'seguridad') {
      onSectionChange('seguridad')
    }
    setIsOpen(false)
  }

  const sidebarContent = (
    <div className="h-full bg-gh-bg-secondary border border-gh-border/30 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gh-border/20 bg-gh-bg-tertiary/30">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gh-accent" />
          <span className="text-xs font-medium text-gh-text">Preferencias</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-1.5 space-y-0.5">
        {sections.map((section, index) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const isHovered = hoveredItem === section.id
          const isParent = 'isParent' in section && section.isParent

          // Calcular clase del botón
          const getButtonClass = () => {
            if (isActive && !isParent) return 'bg-gh-accent/10 text-gh-accent'
            if (isParent) return 'text-gh-text cursor-default mt-2 mb-0.5'
            return 'text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary/40'
          }

          return (
            <React.Fragment key={section.id}>
              <motion.button
                onClick={() => !isParent && handleSectionClick(section.id)}
                onMouseEnter={() => setHoveredItem(section.id)}
                onMouseLeave={() => setHoveredItem(null)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.15 }}
                className={`
                  group relative w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs
                  transition-colors duration-150
                  ${getButtonClass()}
                `}
              >
                {/* Indicador activo - solo para items no-padre */}
                {isActive && !isParent && (
                  <motion.div
                    layoutId="sidebarIndicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gh-accent rounded-r"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                {(() => {
                  let iconClass = 'text-gh-text-muted'
                  if (isActive && !isParent) {
                    iconClass = 'text-gh-accent'
                  } else if (isHovered && !isParent) {
                    iconClass = 'text-gh-text'
                  } else if (isParent) {
                    iconClass = 'text-gh-accent'
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

                {/* Chevron para item activo */}
                {isActive && !isParent && (
                  <ChevronRight className="w-3 h-3 text-gh-accent/60" />
                )}
              </motion.button>

              {/* Sub-secciones de Seguridad - siempre visibles */}
              {isParent && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gh-border/30 pl-2">
                  {securitySubSections.map((subSection, subIndex) => {
                    const SubIcon = subSection.icon
                    const isSubActive = activeSection === 'seguridad' && activeSecuritySubSection === subSection.id
                    const isSubHovered = hoveredItem === subSection.id

                    return (
                      <motion.button
                        key={subSection.id}
                        onClick={() => handleSecuritySubSectionClick(subSection.id)}
                        onMouseEnter={() => setHoveredItem(subSection.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + subIndex) * 0.03, duration: 0.15 }}
                        className={`
                          group relative w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs
                          transition-colors duration-150
                          ${isSubActive 
                            ? 'bg-gh-accent/10 text-gh-accent' 
                            : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary/40'
                          }
                        `}
                      >
                        {/* Indicador activo para sub-item */}
                        {isSubActive && (
                          <motion.div
                            layoutId="subSidebarIndicator"
                            className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gh-accent rounded-full"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}

                        {/* Sub Icon */}
                        {(() => {
                          let subIconClass = 'text-gh-text-muted'
                          if (isSubActive) subIconClass = 'text-gh-accent'
                          else if (isSubHovered) subIconClass = 'text-gh-text'
                          return <SubIcon className={`w-3.5 h-3.5 ${subIconClass}`} />
                        })()}

                        {/* Sub Label */}
                        <span className="flex-1 text-left truncate">
                          {subSection.label}
                        </span>

                        {/* Chevron para sub-item activo */}
                        {isSubActive && (
                          <ChevronRight className="w-3 h-3 text-gh-accent/60" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile: FAB discreto */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        className="
          md:hidden fixed bottom-5 left-5 z-50 
          w-10 h-10 rounded-full
          bg-gh-bg-tertiary/95 border border-gh-border/50
          text-gh-text-muted hover:text-gh-text
          flex items-center justify-center
          shadow-md shadow-black/20
          transition-colors
        "
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <X className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Menu className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile: Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile: Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="
              md:hidden fixed top-0 left-0 bottom-0 w-56
              bg-gh-bg-secondary/98 backdrop-blur-sm
              border-r border-gh-border/30 z-50
            "
          >
            <div className="pt-3 px-2 h-full">
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop: Sidebar con estilo de card */}
      <aside className="hidden md:block w-52 flex-shrink-0 self-stretch">
        <div className="h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}


