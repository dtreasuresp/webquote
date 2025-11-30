/**
 * Modal para resolución de conflictos de sincronización
 */

'use client'

import React from 'react'
import { FaExclamationTriangle, FaCloud, FaDesktop, FaCodeBranch, FaTimes } from 'react-icons/fa'
import type { ConflictInfo, ConflictResolution } from '@/lib/cache/types'

export interface ConflictModalProps {
  /** Si el modal está abierto */
  isOpen: boolean
  /** Información del conflicto */
  conflict: ConflictInfo | null
  /** Callback cuando se selecciona una resolución */
  onResolve: (resolution: ConflictResolution) => void
  /** Callback para cerrar sin resolver */
  onClose: () => void
}

export function ConflictModal({
  isOpen,
  conflict,
  onResolve,
  onClose
}: Readonly<ConflictModalProps>) {
  if (!isOpen || !conflict) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      nombreCotizacion: 'Nombre de la cotización',
      descripcionCotizacion: 'Descripción',
      notasCotizacion: 'Notas',
      terminosCondiciones: 'Términos y condiciones',
      serviciosSeleccionados: 'Servicios seleccionados',
      seccionesContenido: 'Secciones de contenido',
      caracteristicasProyecto: 'Características del proyecto',
      estructuraCostos: 'Estructura de costos'
    }
    return fieldNames[field] || field
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <button 
        type="button"
        className="fixed inset-0 bg-black/50 transition-opacity cursor-default"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <FaExclamationTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Conflicto de sincronización
              </h3>
              <p className="text-sm text-gray-500">
                Los datos han sido modificados en otra sesión
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Versiones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <FaDesktop className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Tu versión local
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Versión {conflict.localVersion}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Editada: {formatDate(conflict.localUpdatedAt)}
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <FaCloud className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    Versión del servidor
                  </span>
                </div>
                <p className="text-xs text-purple-700">
                  Versión {conflict.serverVersion}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Guardada: {formatDate(conflict.serverUpdatedAt)}
                </p>
              </div>
            </div>

            {/* Campos en conflicto */}
            {conflict.conflictingFields.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Campos modificados:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {conflict.conflictingFields.map(field => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {formatFieldName(field)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opciones */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                ¿Cómo deseas resolver el conflicto?
              </p>
              
              <button
                onClick={() => onResolve('keep-local')}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FaDesktop className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-900">
                      Mantener mis cambios
                    </p>
                    <p className="text-xs text-gray-500">
                      Sobrescribir la versión del servidor con tus cambios locales
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => onResolve('keep-server')}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FaCloud className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-purple-900">
                      Usar versión del servidor
                    </p>
                    <p className="text-xs text-gray-500">
                      Descartar tus cambios y usar la versión más reciente del servidor
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => onResolve('merge')}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FaCodeBranch className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-green-900">
                      Fusionar cambios
                    </p>
                    <p className="text-xs text-gray-500">
                      Intentar combinar ambas versiones automáticamente
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              onClick={() => onResolve('cancel')}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar y decidir después
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
