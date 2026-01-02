'use client'

import React, { useState } from 'react'
import { Settings, RefreshCw, Users, ShieldCheck, Shield, Key, LayoutGrid, FileText, ChevronRight, Menu, X, BarChart3, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type SidebarSection = 'general' | 'sincronizacion' | 'usuarios' | 'organizaciones' | 'seguridad' | 'logs' | 'backups' | 'reportes'
export type SecuritySubSection = 'roles' | 'permisos' | 'matriz' | 'usuarios-permisos'

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
    id: 'organizaciones' as SidebarSection,
    label: 'Estructura Organizacional',
    icon: Building2,
    description: 'Gestión de la jerarquía organizacional',
  },
  {
    id: 'seguridad' as SidebarSection,
    label: 'Seguridad y Acceso',
    icon: ShieldCheck,
    description: 'Roles, permisos y matriz de acceso',
    isParent: true,
  },
  {
    id: 'logs' as SidebarSection,
    label: 'Logs de Auditoría',
    icon: FileText,
    description: 'Registro detallado de eventos del sistema',
  },
  {
    id: 'backups' as SidebarSection,
    label: 'Backups',
    icon: Shield,
    description: 'Gestión de copias de seguridad',
  },
  {
    id: 'reportes' as SidebarSection,
    label: 'Reportes de Auditoría',
    icon: BarChart3,
    description: 'Reportes automáticos de auditoría',
  },
]

// Sub-secciones de seguridad - ahora SOLO contiene Roles, Permisos, Matriz y Usuarios-Permisos
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
    <div className="h-full bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col w-64">
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Preferencias</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Configuración</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-none">
        {sections.map((section, index) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const isHovered = hoveredItem === section.id
          const isParent = 'isParent' in section && section.isParent

          return (
            <React.Fragment key={section.id}>
              <motion.button
                onClick={() => !isParent && handleSectionClick(section.id)}
                onMouseEnter={() => setHoveredItem(section.id)}
                onMouseLeave={() => setHoveredItem(null)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`
                  group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-200
                  ${isActive && !isParent 
                    ? 'bg-white/10 text-white shadow-lg shadow-black/10' 
                    : isParent
                      ? 'text-white/40 cursor-default mt-6 mb-2 px-1'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                  ${isActive && !isParent ? 'bg-white/10 text-white' : 'text-white/40 group-hover:text-white'}
                `}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label */}
                <span className={`flex-1 text-left font-medium ${isParent ? 'text-[11px] uppercase tracking-widest' : ''}`}>
                  {section.label}
                </span>

                {/* Active Indicator */}
                {isActive && !isParent && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  />
                )}
              </motion.button>

              {/* Sub-secciones de Seguridad */}
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
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + subIndex) * 0.03 }}
                        className={`
                          group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs
                          transition-all duration-200
                          ${isSubActive 
                            ? 'bg-white/10 text-white' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        {/* Sub Icon */}
                        <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />

                        {/* Sub Label */}
                        <span className="flex-1 text-left font-medium">
                          {subSection.label}
                        </span>
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
          md:hidden fixed bottom-6 left-6 z-50 
          w-12 h-12 rounded-2xl
          bg-white/10 backdrop-blur-xl border border-white/20
          text-white flex items-center justify-center
          shadow-2xl shadow-black/40
          transition-all duration-300
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
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Menu className="w-5 h-5" />
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
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile: Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="
              md:hidden fixed top-0 left-0 bottom-0 w-64
              bg-black/40 backdrop-blur-2xl
              border-r border-white/10 z-50
            "
          >
            <div className="h-full">
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop: Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 self-stretch">
        <div className="h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}


