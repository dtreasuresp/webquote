/**
 * Indicador visual del estado de sincronización
 */

'use client'

import React from 'react'
import { 
  FaCloud, 
  FaCloudUploadAlt, 
  FaSync, 
  FaExclamationTriangle, 
  FaCheck,
  FaSpinner
} from 'react-icons/fa'
import type { SyncStatus } from '@/lib/cache/types'

export interface SyncStatusIndicatorProps {
  /** Estado de sincronización */
  status: SyncStatus | null
  /** Si está online */
  isOnline: boolean
  /** Si hay cambios sin guardar */
  isDirty: boolean
  /** Si está cargando */
  isLoading?: boolean
  /** Timestamp del último guardado */
  lastSaved?: Date | null
  /** Mostrar texto descriptivo */
  showText?: boolean
  /** Tamaño del indicador */
  size?: 'sm' | 'md' | 'lg'
}

export function SyncStatusIndicator({
  status,
  isOnline,
  isDirty,
  isLoading = false,
  lastSaved = null,
  showText = true,
  size = 'md'
}: Readonly<SyncStatusIndicatorProps>) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const iconSize = sizeClasses[size]

  // Determinar estado visual
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: FaCloud,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        text: 'Sin conexión',
        pulse: false,
        spin: false,
        strikethrough: true
      }
    }

    if (isLoading) {
      return {
        icon: FaSpinner,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        text: 'Cargando...',
        pulse: false,
        spin: true
      }
    }

    switch (status) {
      case 'synced':
        return {
          icon: FaCheck,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          text: 'Sincronizado',
          pulse: false,
          spin: false
        }
      
      case 'pending':
        return {
          icon: FaSync,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          text: isDirty ? 'Cambios sin guardar' : 'Pendiente',
          pulse: true,
          spin: false
        }
      
      case 'syncing':
        return {
          icon: FaSync,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          text: 'Sincronizando...',
          pulse: false,
          spin: true
        }
      
      case 'conflict':
        return {
          icon: FaExclamationTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          text: 'Conflicto detectado',
          pulse: true,
          spin: false
        }
      
      case 'error':
        return {
          icon: FaExclamationTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          text: 'Error de sincronización',
          pulse: false,
          spin: false
        }
      
      default:
        if (isDirty) {
          return {
            icon: FaCloudUploadAlt,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
            text: 'Cambios sin guardar',
            pulse: true,
            spin: false
          }
        }
        return {
          icon: FaCloud,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          text: 'Listo',
          pulse: false,
          spin: false
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const formatLastSaved = () => {
    if (!lastSaved) return null
    
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'hace un momento'
    if (minutes === 1) return 'hace 1 minuto'
    if (minutes < 60) return `hace ${minutes} minutos`
    
    return lastSaved.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`
        flex items-center justify-center rounded-full p-1.5
        ${config.bgColor}
        ${config.pulse ? 'animate-pulse' : ''}
      `}>
        <Icon 
          className={`
            ${iconSize} 
            ${config.color}
            ${config.spin ? 'animate-spin' : ''}
          `} 
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
          {lastSaved && status === 'synced' && (
            <span className="text-xs text-gray-400">
              Guardado {formatLastSaved()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default SyncStatusIndicator
