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
  Cloud, 
  CloudUpload, 
  RefreshCw, 
  AlertTriangle, 
  Check,
  Loader2,
  Database,
  ArrowLeftRight,
  GitBranch,
  Wifi,
  Hand
} from 'lucide-react'
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
  /** Variante de estilo: default (con fondo) o statusbar (para barra de estado) */
  variant?: 'default' | 'statusbar'
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
    icon: Hand,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    text: '¡Bienvenido a WebQuote!',
    pulse: false,
    spin: false
  },
  'checking-connection': {
    icon: Wifi,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Estamos verificando si hay conexión a la nube...',
    pulse: false,
    spin: true
  },
  'syncing-from-db': {
    icon: Database,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Existe conexión! Sincronizando desde la nube...',
    pulse: false,
    spin: true
  },
  'updating-analytics': {
    icon: RefreshCw,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Estamos actualizando la analítica...',
    pulse: false,
    spin: true
  },
  'synced': {
    icon: Check,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    text: 'Listo! WebQuote está sincronizado desde la nube',
    pulse: false,
    spin: false
  },
  'offline-cached': {
    icon: Cloud,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    text: 'Lo siento, no hay conexión a la nube. Mostrando datos locales',
    pulse: false,
    spin: false
  },
  'offline-empty': {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    text: 'Qué mal, no hay conexión a la nube y tampoco datos locales',
    pulse: true,
    spin: false
  },
  'reconnecting': {
    icon: Wifi,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    text: 'Perfecto, se ha restablecido la conexión con la nube. Procedemos a sincronizar...',
    pulse: true,
    spin: true
  },
  'merging': {
    icon: GitBranch,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    text: 'Según tu elección, estamos fusionando los datos entre la nube y los locales...',
    pulse: false,
    spin: true
  },
  'comparing': {
    icon: ArrowLeftRight,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    text: 'Comparando diferencias entre la nube y los locales...',
    pulse: false,
    spin: true
  },
  'error': {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    text: 'Atención! Hubo un error de sincronización con la nube',
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
  loadingPhase = 'welcome',
  variant = 'default'
}: Readonly<SyncStatusIndicatorProps>) {
  const isStatusBar = variant === 'statusbar'
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  // Tamaños de texto según size
  const textSizeClasses = {
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm'
  }

  // Padding del contenedor del icono según size
  const iconPaddingClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-1.5'
  }

  const iconSize = sizeClasses[size]
  const textSize = textSizeClasses[size]
  const iconPadding = iconPaddingClasses[size]

  // Determinar estado visual
  const getStatusConfig = (): StatusConfig => {
    // Prioridad 1: Si hay una fase de carga definida, usarla
    if (loadingPhase && PHASE_CONFIGS[loadingPhase]) {
      return PHASE_CONFIGS[loadingPhase]
    }

    // Prioridad 2: Estado de no online sin loadingPhase
    if (!isOnline) {
      return {
        icon: Cloud,
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
        icon: Loader2,
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
          icon: RefreshCw,
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
          icon: AlertTriangle,
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
            icon: CloudUpload,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
            text: 'Cambios sin guardar',
            pulse: true,
            spin: false
          }
        }
        return {
          icon: Cloud,
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
    <div className={`flex items-center ${isStatusBar ? 'gap-1' : 'gap-1.5'}`}>
      <div className={`
        flex items-center justify-center rounded-full
        ${isStatusBar ? '' : iconPadding}
        ${isStatusBar ? '' : config.bgColor}
        ${config.pulse ? 'animate-pulse' : ''}
      `}>
        <Icon 
          className={`
            ${iconSize} 
            ${isStatusBar ? config.color : config.color}
            ${config.spin ? 'animate-spin' : ''}
          `}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSize} font-medium leading-tight ${isStatusBar ? 'text-gh-text-muted' : config.color}`}>
            {config.text}
          </span>
          {mounted && lastSaved && loadingPhase === 'synced' && !isStatusBar && (
            <span className="text-[9px] text-gray-400 leading-tight">
              Guardado {formatLastSaved()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default SyncStatusIndicator


