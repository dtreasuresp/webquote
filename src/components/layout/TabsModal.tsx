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
}

interface TooltipPosition {
  top: number
  left: number
  visible: boolean
}

export default function TabsModal({ tabs, activeTab, onTabChange, scrollContainerRef }: TabsModalProps) {
  const activeTabItem = tabs.find(tab => tab.id === activeTab)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    visible: false,
  })
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)
  const tabButtonsRef = useRef<(HTMLButtonElement | null)[]>([])

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

  return (
    <>
      {/* Tab Bar - Mejorado con mejor UI/UX */}
      <div className="flex border-b border-[#333] bg-black sticky top-0 z-40 overflow-x-auto shadow-lg">
        <div className="flex w-full">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              ref={(el) => {
                tabButtonsRef.current[index] = el
              }}
              onClick={() => handleTabClick(tab.id)}
              disabled={tab.disabled}
              onMouseEnter={() => handleMouseEnter(tab.id, index)}
              onMouseLeave={handleMouseLeave}
              whileHover={!tab.disabled ? { backgroundColor: '#1a1a1a' } : {}}
              whileTap={!tab.disabled ? { scale: 0.98 } : {}}
              className={`flex-1 min-w-max px-4 py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap relative group cursor-pointer ${
                tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                activeTab === tab.id
                  ? 'text-[#ededed] bg-[#111]'
                  : 'text-[#888888] bg-black hover:text-[#b0b0b0]'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
              aria-disabled={tab.disabled}
            >
              {/* Icono */}
              <motion.span
                className="text-lg flex items-center justify-center w-5 h-5"
                animate={activeTab === tab.id ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {typeof tab.icon === 'string' ? <span>{tab.icon}</span> : tab.icon}
              </motion.span>

              {/* Label */}
              <span className="hidden sm:inline">{tab.label}</span>

              {/* Indicador de cambios sin guardar */}
              {tab.hasChanges && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"
                  title="Cambios sin guardar"
                />
              )}

              {/* Underline animado (activo) */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ededed] to-[#888888]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tooltip con posicionamiento fixed */}
      <AnimatePresence>
        {hoveredTabId && tooltipPosition.visible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bg-[#222] text-[#ededed] text-xs px-3 py-1.5 rounded border border-[#444] shadow-lg pointer-events-none z-[999] whitespace-nowrap"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {tabs.find(t => t.id === hoveredTabId)?.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area - Con transiciones mejoradas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -20, y: 10 }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className="overflow-hidden"
        >
          <div className="w-full">
            {activeTabItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="bg-black"
              >
                {activeTabItem.content}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
