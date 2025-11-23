'use client'

import React from 'react'
import { FaPalette } from 'react-icons/fa'

interface EstilosYDisenoTabProps {
  // Placeholder for future styling configuration props
}

export default function EstilosYDisenoTab({}: EstilosYDisenoTabProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="bg-[#111] p-4 rounded-lg border border-[#333] space-y-4">
        <h3 className="text-sm font-bold text-[#ededed] mb-3 flex items-center gap-2">
          <FaPalette size={16} /> Configuración de Estilos
        </h3>
        
        <div className="text-center text-[#888888] py-8">
          <p className="mb-2">✨ Configuración visual para personalizar tu cotización</p>
          <p className="text-xs">Los estilos se aplicarán automáticamente a tu propuesta</p>
        </div>
      </div>
    </div>
  )
}
