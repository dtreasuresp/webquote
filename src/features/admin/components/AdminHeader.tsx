'use client'

import React, { useState } from 'react'
import { FaSave, FaFileDownload, FaPlus, FaCog, FaEllipsisV } from 'react-icons/fa'
import { useToast } from '@/lib/hooks/useToast'

export interface AdminHeaderProps {
  onSave?: () => Promise<void>
  onPdfExport?: () => Promise<void>
  onNewQuote?: () => void
  onSettings?: () => void
  isSaving?: boolean
  isPdfGenerating?: boolean
  hasChanges?: boolean
  quoteName?: string
}

export default function AdminHeader({
  onSave,
  onPdfExport,
  onNewQuote,
  onSettings,
  isSaving = false,
  isPdfGenerating = false,
  hasChanges = false,
  quoteName = 'Nueva Cotización',
}: AdminHeaderProps) {
  const { success: toastSuccess, error: toastError } = useToast()
  const [showMenu, setShowMenu] = useState(false)

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave()
        toastSuccess('Cotización guardada exitosamente')
      }
    } catch (error) {
      toastError('Error al guardar la cotización')
    }
  }

  const handlePdfExport = async () => {
    try {
      if (onPdfExport) {
        await onPdfExport()
        toastSuccess('PDF generado exitosamente')
      }
    } catch (error) {
      toastError('Error al generar PDF')
    }
  }

  const handleNewQuote = () => {
    if (onNewQuote) {
      onNewQuote()
    }
  }

  const handleSettings = () => {
    if (onSettings) {
      onSettings()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-gh-bg-overlay to-gh-bg-secondary border-b border-gh-border-color shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 space-x-4">
        {/* Left Section - Title and Status */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gh-text-primary truncate">
              {quoteName}
            </h1>
            {hasChanges && (
              <p className="text-sm text-gh-text-secondary">
                Cambios sin guardar
              </p>
            )}
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-200 ease-out
              ${
                hasChanges
                  ? 'bg-gh-accent-blue hover:bg-gh-accent-blue/90 text-white shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-gh-bg-tertiary text-gh-text-secondary cursor-not-allowed opacity-50'
              }
              ${isSaving ? 'opacity-75 cursor-wait' : ''}
              active:scale-95
            `}
            title={hasChanges ? 'Guardar cambios' : 'Sin cambios para guardar'}
          >
            <FaSave className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isSaving ? 'Guardando...' : 'Guardar'}
            </span>
          </button>

          {/* PDF Export Button */}
          <button
            onClick={handlePdfExport}
            disabled={isPdfGenerating}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-200 ease-out
              bg-gh-accent-green hover:bg-gh-accent-green/90 text-white
              shadow-md hover:shadow-lg hover:scale-105
              ${isPdfGenerating ? 'opacity-75 cursor-wait' : ''}
              active:scale-95
            `}
            title="Descargar como PDF"
          >
            <FaFileDownload className={`w-4 h-4 ${isPdfGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isPdfGenerating ? 'Generando...' : 'PDF'}
            </span>
          </button>

          {/* New Quote Button */}
          <button
            onClick={handleNewQuote}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-200 ease-out
              bg-gh-accent-cyan hover:bg-gh-accent-cyan/90 text-white
              shadow-md hover:shadow-lg hover:scale-105
              active:scale-95
            `}
            title="Crear nueva cotización"
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={handleSettings}
            className={`
              flex items-center justify-center p-2 rounded-lg
              transition-all duration-200 ease-out
              bg-gh-bg-tertiary hover:bg-gh-bg-tertiary/80 text-gh-text-primary
              shadow-md hover:shadow-lg hover:scale-105
              active:scale-95
            `}
            title="Configuración"
          >
            <FaCog className="w-4 h-4" />
          </button>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`
                flex items-center justify-center p-2 rounded-lg
                transition-all duration-200 ease-out
                bg-gh-bg-tertiary hover:bg-gh-bg-tertiary/80 text-gh-text-primary
                shadow-md hover:shadow-lg hover:scale-105
                active:scale-95
              `}
              title="Más opciones"
            >
              <FaEllipsisV className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gh-bg-secondary border border-gh-border-color rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    // TODO: Implement duplicate functionality
                    toastSuccess('Función de duplicar cotización')
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gh-bg-tertiary transition-colors first:rounded-t-lg text-gh-text-primary"
                >
                  Duplicar cotización
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement share functionality
                    toastSuccess('Función de compartir cotización')
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gh-bg-tertiary transition-colors text-gh-text-primary"
                >
                  Compartir cotización
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement print functionality
                    toastSuccess('Función de imprimir cotización')
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gh-bg-tertiary transition-colors text-gh-text-primary"
                >
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement history functionality
                    toastSuccess('Función de historial de cambios')
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gh-bg-tertiary transition-colors last:rounded-b-lg text-gh-text-primary border-t border-gh-border-color"
                >
                  Ver historial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicator - Optional */}
      {hasChanges && (
        <div className="h-1 bg-gh-accent-blue/20">
          <div className="h-full bg-gh-accent-blue w-3/4 animate-pulse" />
        </div>
      )}
    </header>
  )
}
