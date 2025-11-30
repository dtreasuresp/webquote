/**
 * Indicador visual del estado de sincronización
 * 
 * FLUJO VISUAL:
 * 1. welcome - "¡Bienvenido!" (icono de saludo)
 * 2. checking-connection - "Verificando conexión a BD..." (spinner)
 * 3. syncing-from-db - "Sincronizando datos de BD a local..." (sync icon)
 * 4. updating-analytics - "Actualizando analítica..." (spinner)
 * 5. synced - "Sincronizado con BD ✓" (check verde)
 * 6. offline-cached - "Sin conexión a BD. Mostrando datos locales" (amber)
 * 7. merging - "Fusionando datos..." (merge icon)
 * 8. comparing - "Comparando diferencias..." (compare icon)
 * 9. error - "Error de sincronización" (error icon)
 */

"use client"

import React, { useEffect, useState } from 'react'
import { 
  FaCloud, 
  FaCloudUploadAlt, 
  FaSync, 
  FaExclamationTriangle, 
  FaCheck,
  FaSpinner,
  FaDatabase,
  FaExchangeAlt,
  FaCodeBranch,
  FaWifi
} from 'react-icons/fa'
import { MdWavingHand } from 'react-icons/md'
import type { SyncStatus } from '@/lib/cache/types'
import type { LoadingPhase } from '../hooks/useLoadingPhase'

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
  /** Fase de carga visual (nueva API unificada) */
  loadingPhase?: LoadingPhase
}

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  text: string
  pulse: boolean
  spin: boolean
  strikethrough?: boolean
}

// Configuración de estados visuales por fase
const PHASE_CONFIGS: Record<LoadingPhase, StatusConfig> = {
  'welcome': {
    icon: MdWavingHand,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    text: '¡Bienvenido!',
    pulse: false,
    spin: false
  },
  'checking-connection': {
    icon: FaWifi,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Verificando conexión a BD...',
    pulse: false,
    spin: true
  },
  'syncing-from-db': {
    icon: FaDatabase,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Sincronizando datos de BD a local...',
    pulse: false,
    spin: true
  },
  'updating-analytics': {
    icon: FaSync,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Actualizando analítica...',
    pulse: false,
    spin: true
  },
  'synced': {
    icon: FaCheck,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    text: 'Sincronizado con BD',
    pulse: false,
    spin: false
  },
  'offline-cached': {
    icon: FaCloud,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    text: 'Sin conexión a BD. Mostrando datos locales',
    pulse: false,
    spin: false
  },
  'merging': {
    icon: FaCodeBranch,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    text: 'Fusionando datos...',
    pulse: false,
    spin: true
  },
  'comparing': {
    icon: FaExchangeAlt,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    text: 'Comparando diferencias...',
    pulse: false,
    spin: true
  },
  'error': {
    icon: FaExclamationTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    text: 'Error de sincronización',
    pulse: true,
    spin: false
  }
}

export function SyncStatusIndicator({
  status,
  isOnline,
  isDirty,
  isLoading = false,
  lastSaved = null,
  showText = true,
  size = 'md',
  loadingPhase = 'welcome'
}: Readonly<SyncStatusIndicatorProps>) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const iconSize = sizeClasses[size]

  // Determinar estado visual
  const getStatusConfig = (): StatusConfig => {
    // Prioridad 1: Si hay una fase de carga definida, usarla
    if (loadingPhase && PHASE_CONFIGS[loadingPhase]) {
      return PHASE_CONFIGS[loadingPhase]
    }

    // Prioridad 2: Estado de no online sin loadingPhase
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

    // Prioridad 3: isLoading genérico
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

    // Prioridad 4: Estado de sync de cotización específica
    switch (status) {
      case 'synced':
        return PHASE_CONFIGS['synced']
      
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
        return PHASE_CONFIGS['syncing-from-db']
      
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
        return PHASE_CONFIGS['error']
      
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

  // En SSR usamos un estado visual estable para evitar mismatches.
  // En CSR (tras mount) usamos el estado real.
  const config = mounted
    ? getStatusConfig()
    : PHASE_CONFIGS['welcome']
  
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
          {mounted && lastSaved && loadingPhase === 'synced' && (
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
