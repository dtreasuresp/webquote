'use client'

import React, { useState, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { motion, AnimatePresence } from 'framer-motion'

interface ColorPickerInputProps {
  readonly value: string
  readonly onChange: (color: string) => void
  readonly placeholder?: string
  readonly className?: string
  readonly showPreview?: boolean
  readonly label?: string
}

/**
 * Input de color con picker integrado
 */
export default function ColorPickerInput({
  value,
  onChange,
  placeholder = '#000000',
  className = '',
  showPreview = true,
  label,
}: ColorPickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar el picker al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Validar y formatear el valor hex
  const formatHexValue = (val: string): string => {
    // Asegurar que comienza con #
    let hex = val.startsWith('#') ? val : `#${val}`
    // Limitar a 7 caracteres (#RRGGBB)
    hex = hex.slice(0, 7)
    return hex
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatHexValue(e.target.value)
    onChange(newValue)
  }

  const handleColorPickerChange = (color: string) => {
    onChange(color)
  }

  // Verificar si es un color válido para mostrar preview
  const isValidColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-gh-text-muted text-xs mb-1">{label}</label>
      )}
      
      <div className="flex items-center gap-2">
        {/* Preview del color */}
        {showPreview && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-8 border border-gh-border rounded cursor-pointer transition-all hover:border-gh-success focus:outline-none focus:ring-2 focus:ring-gh-success/50"
            style={{ backgroundColor: isValidColor ? value : '#ffffff' }}
            title="Abrir selector de color"
            aria-label="Abrir selector de color"
          />
        )}

        {/* Input de texto */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 bg-gh-bg-secondary border border-gh-border rounded-md text-sm text-gh-text focus:border-gh-success focus:ring-1 focus:ring-gh-success/50 focus:outline-none uppercase"
          maxLength={7}
        />
      </div>

      {/* Color Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 p-3 bg-gh-bg-secondary border border-gh-border rounded-lg shadow-xl"
          >
            <HexColorPicker
              color={isValidColor ? value : '#ffffff'}
              onChange={handleColorPickerChange}
            />
            
            {/* Preview del color seleccionado */}
            <div className="mt-3 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-gh-border"
                style={{ backgroundColor: isValidColor ? value : '#ffffff' }}
              />
              <span className="text-sm text-gh-text font-mono uppercase">{value}</span>
            </div>

            {/* Colores predefinidos comunes */}
            <div className="mt-3 grid grid-cols-8 gap-1">
              {[
                '#000000', '#FFFFFF', '#DC2626', '#EA580C',
                '#CA8A04', '#16A34A', '#0891B2', '#2563EB',
                '#7C3AED', '#DB2777', '#64748B', '#78716C',
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorPickerChange(color)}
                  className="w-6 h-6 rounded border border-gh-border/50 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Seleccionar color ${color}`}
                />
              ))}
            </div>

            {/* Botón para cerrar */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full px-3 py-1.5 text-xs font-medium text-gh-text bg-gh-bg-tertiary border border-gh-border rounded-md hover:bg-gh-bg-overlay transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
