'use client'

import { ReactNode, useEffect, useRef, RefObject, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TabItem {
  id: string
  label: string
  icon: ReactNode | string
  content: ReactNode
  hasChanges?: boolean
  disabled?: boolean
}

interface TabsModalProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  /** Número de tabs por fila. Si se proporciona, las tabs se dividirán en múltiples filas */
  tabsPerRow?: number
}

interface TooltipPosition {
  top: number
  left: number
  visible: boolean
}

export default function TabsModal({ tabs, activeTab, onTabChange, scrollContainerRef, tabsPerRow }: TabsModalProps) {
  const activeTabItem = tabs.find(tab => tab.id === activeTab)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    visible: false,
  })
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)
  const tabButtonsRef = useRef<(HTMLButtonElement | null)[]>([])

  // Dividir tabs en filas si se especifica tabsPerRow
  const tabRows: TabItem[][] = tabsPerRow 
    ? tabs.reduce((rows: TabItem[][], tab, index) => {
        const rowIndex = Math.floor(index / tabsPerRow)
        if (!rows[rowIndex]) rows[rowIndex] = []
        rows[rowIndex].push(tab)
        return rows
      }, [])
    : [tabs]

  // Scroll automático hacia arriba al cambiar de pestaña
  useEffect(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [activeTab, scrollContainerRef])

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab?.disabled) {
      onTabChange(tabId)
    }
  }

  const handleMouseEnter = (tabId: string, index: number) => {
    const button = tabButtonsRef.current[index]
    if (button) {
      const rect = button.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top - 40,
        left: rect.left + rect.width / 2,
        visible: true,
      })
      setHoveredTabId(tabId)
    }
  }

  const handleMouseLeave = () => {
    setTooltipPosition({ top: 0, left: 0, visible: false })
    setHoveredTabId(null)
  }

  // Obtener el índice global de un tab
  const getGlobalIndex = (rowIndex: number, tabIndex: number): number => {
    let index = 0
    for (let i = 0; i < rowIndex; i++) {
      index += tabRows[i].length
    }
    return index + tabIndex
  }

  return (
    <>
      {/* Tab Bar - Diseño GitHub Premium con soporte multi-fila */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[#161b22] to-[#0d1117] border-b border-[#30363d]">
        {tabRows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`flex px-2 ${rowIndex === 0 ? 'pt-2' : ''} ${rowIndex === tabRows.length - 1 ? '' : 'border-b border-[#21262d]'}`}
          >
            {row.map((tab, tabIndex) => {
              const globalIndex = getGlobalIndex(rowIndex, tabIndex)
              return (
                <motion.button
                  key={tab.id}
                  ref={(el) => {
                    tabButtonsRef.current[globalIndex] = el
                  }}
                  onClick={() => handleTabClick(tab.id)}
                  disabled={tab.disabled}
                  onMouseEnter={() => handleMouseEnter(tab.id, globalIndex)}
                  onMouseLeave={handleMouseLeave}
                  whileHover={!tab.disabled ? { y: -1 } : {}}
                  whileTap={!tab.disabled ? { scale: 0.98 } : {}}
                  className={`relative flex-1 px-3 py-2 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer rounded-t-md mx-0.5 ${
                    tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    activeTab === tab.id
                      ? 'text-white bg-[#0d1117] border-t border-l border-r border-[#30363d] border-b-0 -mb-px z-10'
                      : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50'
                  }`}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                  aria-disabled={tab.disabled}
                >
                  {/* Icono con animación */}
                  <motion.span
                    className={`text-sm flex items-center justify-center w-4 h-4 ${
                      activeTab === tab.id ? 'text-[#58a6ff]' : ''
                    }`}
                    animate={activeTab === tab.id ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {typeof tab.icon === 'string' ? <span>{tab.icon}</span> : tab.icon}
                  </motion.span>

                  {/* Label - siempre visible */}
                  <span>{tab.label}</span>

                  {/* Indicador de cambios sin guardar */}
                  {tab.hasChanges && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg shadow-yellow-500/30"
                      title="Cambios sin guardar"
                    >
                      <span className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-75" />
                    </motion.div>
                  )}

                  {/* Barra inferior activa con gradiente */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabBar"
                      className="absolute -bottom-px left-1 right-1 h-0.5 bg-gradient-to-r from-[#238636] via-[#3fb950] to-[#238636] rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Tooltip Premium */}
      <AnimatePresence>
        {hoveredTabId && tooltipPosition.visible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="fixed bg-[#1c2128] text-[#c9d1d9] text-xs px-3 py-1.5 rounded-lg border border-[#30363d] shadow-xl shadow-black/40 pointer-events-none z-[999] whitespace-nowrap"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="flex items-center gap-1.5">
              {tabs.find(t => t.id === hoveredTabId)?.label}
            </span>
            {/* Flecha del tooltip */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1c2128] border-r border-b border-[#30363d] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area - Con padding y transiciones suaves, sin scroll visible */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            className="w-full"
          >
            {activeTabItem && (
              <div className="bg-[#0d1117] p-4">
                {activeTabItem.content}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
