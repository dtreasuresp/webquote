import { QuotationState } from '@/lib/types'
import React from 'react'
import { 
  FileText,
  CheckCircle2,
  Clock,
  Trophy,
  XCircle,
  Lightbulb,
  AlertTriangle,
  LucideIcon
} from 'lucide-react'


/**
 * Obtiene el color Tailwind para un estado de cotización
 */
export function getStateColor(estado: QuotationState | undefined | null): string {
  const colors: Record<QuotationState, string> = {
    CARGADA: 'bg-gray-500/10 text-gray-400',
    ACTIVA: 'bg-green-500/10 text-green-400',
    INACTIVA: 'bg-yellow-500/10 text-yellow-400',
    ACEPTADA: 'bg-emerald-500/10 text-emerald-400',
    RECHAZADA: 'bg-red-500/10 text-red-400',
    NUEVA_PROPUESTA: 'bg-blue-500/10 text-blue-400',
    EXPIRADA: 'bg-slate-500/10 text-slate-400',
  }
  if (!estado || !colors[estado as QuotationState]) {
    return 'bg-gray-500/10 text-gray-400'
  }
  return colors[estado as QuotationState]
}

/**
 * Obtiene el ícono emoji para un estado de cotización
 * Obtiene el componente ícono de lucide-react para un estado
 * @returns LucideIcon component
 */
export function getStateIconComponent(estado: QuotationState | undefined | null): LucideIcon {
  const icons: Record<QuotationState, LucideIcon> = {
    CARGADA: FileText,        // 📄 Archivo de texto
    ACTIVA: CheckCircle2,     // ✅ Check circle
    INACTIVA: Clock,          // 🕐 Reloj
    ACEPTADA: Trophy,         // 🏆 Trofeo
    RECHAZADA: XCircle,       // ✗ X circle
    NUEVA_PROPUESTA: Lightbulb, // 💡 Bombilla
    EXPIRADA: AlertTriangle,  // ⚠️ Advertencia
  }
  if (!estado) {
    return AlertTriangle
  }
  return icons[estado as QuotationState] ?? AlertTriangle
}

/**
 * Obtiene el label en español para un estado de cotización
 */
export function getStateLabel(estado: QuotationState | undefined | null): string {
  const labels: Record<QuotationState, string> = {
    CARGADA: 'Cargada',
    ACTIVA: 'Activa',
    INACTIVA: 'Inactiva',
    ACEPTADA: 'Aceptada',
    RECHAZADA: 'Rechazada',
    NUEVA_PROPUESTA: 'Nueva Propuesta',
    EXPIRADA: 'Expirada',
  }
  if (!estado || !labels[estado as QuotationState]) {
    return 'Desconocido'
  }
  return labels[estado as QuotationState]
}

/**
 * Obtiene la descripción de un estado de cotización
 */
export function getStateDescription(estado: QuotationState): string {
  const descriptions: Record<QuotationState, string> = {
    CARGADA: 'En edición - No pública',
    ACTIVA: 'Publicada - Visible para clientes',
    INACTIVA: 'Archivada - No visible',
    ACEPTADA: 'Aceptada por el cliente',
    RECHAZADA: 'Rechazada por el cliente',
    NUEVA_PROPUESTA: 'Esperando nueva propuesta',
    EXPIRADA: 'Tiempo de validez expirado',
  }
  return descriptions[estado] || ''
}

/**
 * Obtiene las transiciones válidas desde un estado
 */
export function getValidTransitions(estado: QuotationState): QuotationState[] {
  const transiciones: Record<QuotationState, QuotationState[]> = {
    CARGADA: ['ACTIVA', 'INACTIVA'],
    ACTIVA: ['CARGADA', 'INACTIVA', 'EXPIRADA'],
    INACTIVA: ['CARGADA', 'ACTIVA'],
    ACEPTADA: ['CARGADA', 'NUEVA_PROPUESTA'],
    RECHAZADA: ['CARGADA', 'NUEVA_PROPUESTA'],
    NUEVA_PROPUESTA: ['ACTIVA', 'CARGADA'],
    EXPIRADA: ['CARGADA', 'ACTIVA'],
  }
  return transiciones[estado] || []
}

/**
 * Verifica si se puede transicionar de un estado a otro
 */
export function canTransition(desde: QuotationState, hacia: QuotationState): boolean {
  return getValidTransitions(desde).includes(hacia)
}

/**
 * Obtiene el botón de acción para un estado
 */
export interface StateAction {
  label: string
  color: string
  icon: string
  description: string
  action: 'activar' | 'inactivar' | 'cargar'
}

export function getStateAction(estado: QuotationState): StateAction {
  const actions: Record<QuotationState, StateAction> = {
    CARGADA: {
      label: 'Publicar',
      color: 'bg-green-600 hover:bg-green-700 text-white',
      icon: '✅',
      description: 'Publicar cotización para que sea visible',
      action: 'activar',
    },
    ACTIVA: {
      label: 'Inactivar',
      color: 'bg-red-600 hover:bg-red-700 text-white',
      icon: '🚫',
      description: 'Archivar cotización',
      action: 'inactivar',
    },
    INACTIVA: {
      label: 'Reactivar',
      color: 'bg-green-600 hover:bg-green-700 text-white',
      icon: '✅',
      description: 'Reactivar cotización',
      action: 'activar',
    },
    ACEPTADA: {
      label: 'Aceptada',
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: '🎉',
      description: 'Cotización aceptada por el cliente',
      action: 'activar',
    },
    RECHAZADA: {
      label: 'Rechazada',
      color: 'bg-red-600 hover:bg-red-700 text-white',
      icon: '❌',
      description: 'Cotización rechazada por el cliente',
      action: 'inactivar',
    },
    NUEVA_PROPUESTA: {
      label: 'Nueva Propuesta',
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: '💡',
      description: 'Cliente solicita nueva propuesta',
      action: 'activar',
    },
    EXPIRADA: {
      label: 'Expirada',
      color: 'bg-slate-600 hover:bg-slate-700 text-white',
      icon: '⏰',
      description: 'Cotización expirada',
      action: 'inactivar',
    },
  }
  return actions[estado]
}
