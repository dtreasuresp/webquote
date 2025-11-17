'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface TabItem {
  id: string
  label: string
  icon: string
  content: ReactNode
}

interface TabsModalProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function TabsModal({ tabs, activeTab, onTabChange }: TabsModalProps) {
  const activeTabItem = tabs.find(tab => tab.id === activeTab)

  return (
    <>
      {/* Tab Bar */}
      <div className="flex border-b-2 border-neutral-200 bg-white sticky top-0 z-40 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-max px-6 py-4 text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary border-b-3 border-accent bg-white shadow-sm'
                : 'text-secondary-light border-b-3 border-transparent bg-neutral-50 hover:bg-neutral-100'
            }`}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {activeTabItem && (
            <div className="p-8 bg-white">
              {activeTabItem.content}
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
