'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Loader2, Layout } from 'lucide-react'
import AdminSidebar from '@/features/admin/components/AdminSidebar'

interface ModulePlaceholderTabProps {
  title: string
  description: string
  icon: LucideIcon
  moduleName?: string
}

export default function ModulePlaceholderTab({ title, description, icon: Icon, moduleName }: ModulePlaceholderTabProps) {
  const displayModuleName = moduleName || title.replace('Módulo de ', '')
  
  const sidebarItems = [
    { id: 'overview', label: 'Vista General', icon: Layout },
  ]

  return (
    <div className="
      flex h-[calc(100vh-180px)] min-h-[600px] 
      bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl 
      overflow-hidden shadow-xl shadow-black/20
    ">
      {/* Sidebar de navegación interna usando AdminSidebar */}
      <AdminSidebar
        items={sidebarItems}
        activeItem="overview"
        onItemClick={() => {}}
        title={displayModuleName}
        titleIcon={Icon}
      />

      {/* Contenedor principal */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        <div className="flex-shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-white/60" />
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-white/40 mt-0.5">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
            <Icon className="w-10 h-10 text-white/20" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Módulo de {displayModuleName}</h2>
          <p className="text-sm text-white/40 max-w-md mb-8">
            Estamos trabajando en la implementación de este módulo. Pronto podrás gestionar {displayModuleName.toLowerCase()} directamente desde aquí.
          </p>
          <div className="flex items-center gap-3 text-white/20">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium tracking-widest uppercase">Próximamente</span>
          </div>
        </div>
      </main>
    </div>
  )
}
