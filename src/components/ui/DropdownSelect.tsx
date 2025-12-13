'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

import { ReactNode } from 'react'

interface DropdownSelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
  label?: ReactNode
  className?: string
  id?: string
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  label,
  className = '',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Esperar a que el componente se monte para usar createPortal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calcular posición del dropdown
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [])

  // Actualizar posición cuando se abre
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, updatePosition])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current && 
        !buttonRef.current.contains(target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
  }

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) updatePosition()
      setIsOpen(!isOpen)
    }
  }

  // Renderizar el dropdown en un portal
  const dropdownMenu = isOpen && !disabled && mounted ? createPortal(
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 99999
        }}
        className="bg-gh-bg-secondary/95 border border-gh-border/70 rounded-md shadow-xl overflow-hidden"
      >
        <div className="max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gh-text-muted">
              Sin opciones disponibles
            </div>
          ) : (
            options.map((option, index) => {
              const isSelected = value === option.value
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.02 }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-gh-success/10 text-gh-success'
                      : 'text-gh-text hover:bg-gh-bg-tertiary/40'
                  }`}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 ml-2 text-gh-success flex-shrink-0" />
                  )}
                </motion.button>
              )
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gh-text mb-2">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between rounded-md transition-all duration-200 ${
            disabled
              ? 'bg-gh-bg-tertiary border-gh-border/50 text-gh-text-muted cursor-not-allowed'
              : isOpen
                ? 'bg-gh-bg-secondary border-gh-success ring-2 ring-gh-success/20 text-gh-text'
                : 'bg-gh-bg-secondary border-gh-border/30 text-gh-text hover:border-gh-border/50 focus:border-gh-success focus:ring-2 focus:ring-gh-success/20 focus:outline-none'
          } border`}
        >
          <span className={`flex-1 truncate ${!selectedOption ? 'text-gh-text-muted' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 ml-2"
          >
            <ChevronDown className="w-4 h-4 text-gh-text-muted" />
          </motion.div>
        </button>
      </div>

      {dropdownMenu}
    </div>
  )
}

export default DropdownSelect
