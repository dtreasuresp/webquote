'use client'

import React from 'react'
import { FaPalette } from 'react-icons/fa'

interface EstilosYDisenoTabProps {
  // Placeholder for future styling configuration props
}

export default function EstilosYDisenoTab({}: EstilosYDisenoTabProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gh-bg-overlay p-6 rounded-lg border border-gh-border space-y-6">
        <h3 className="text-sm font-semibold text-gh-text mb-4 flex items-center gap-2 uppercase tracking-wide">
          <FaPalette size={16} /> Configuración de Estilos
        </h3>
        
        <div className="text-center text-gh-text-muted py-12 space-y-3">
          <p className="text-sm font-medium">✨ Configuración visual para personalizar tu cotización</p>
          <p className="text-xs text-gh-text-secondary">Los estilos se aplicarán automáticamente a tu propuesta</p>
        </div>
      </div>
    </div>
  )
}
