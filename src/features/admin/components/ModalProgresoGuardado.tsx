'use client'

import React, { useMemo } from 'react'
import DialogoGenericoDinamico from './DialogoGenericoDinamico'
import type { DialogProgressConfig } from './DialogoGenericoDinamico'

export interface ModalProgresoGuardadoProps {
  isOpen: boolean
  onClose: () => void
  
  // Estado del guardado
  pasos: Array<{
    id: string
    label: string
    estado: 'pendiente' | 'activo' | 'completado' | 'error' | 'cancelado'
  }>
  
  // Resultado final
  resultado?: 'progresando' | 'exito' | 'cancelado' | 'error'
  totalProgreso?: number // 0-100
}

/**
 * Modal de progreso para guardar cotización
 * Wrapper reutilizable sobre DialogoGenericoDinamico
 */
export default function ModalProgresoGuardado({
  isOpen,
  onClose,
  pasos,
  resultado = 'progresando',
  totalProgreso = 0,
}: ModalProgresoGuardadoProps) {
  
  // Convertir pasos a formato DialogProgressConfig
  const progressConfig = useMemo<DialogProgressConfig>(() => ({
    steps: pasos.map(paso => ({
      id: paso.id,
      label: paso.label,
      status: paso.estado as 'pending' | 'active' | 'completed' | 'error' | 'cancelled',
    })),
    overallStatus:
      resultado === 'exito'
        ? 'success'
        : resultado === 'error'
        ? 'error'
        : resultado === 'cancelado'
        ? 'cancelled'
        : 'progress',
    totalProgress: totalProgreso,
  }), [pasos, resultado, totalProgreso])

  // Determinar título y tipo
  const getTitle = () => {
    switch (resultado) {
      case 'exito':
        return '✅ Cotización Guardada'
      case 'cancelado':
        return '⚠️ Guardado Cancelado'
      case 'error':
        return '❌ Error al Guardar'
      default:
        return '💾 Guardando Cotización...'
    }
  }

  const getType = () => {
    switch (resultado) {
      case 'exito':
        return 'success'
      case 'cancelado':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'progress'
    }
  }

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      contentType="progress"
      progressConfig={progressConfig}
      variant="premium"
      type={getType() as any}
      size="md"
      closeOnBackdropClick={resultado !== 'progresando'}
      closeOnEscape={resultado !== 'progresando'}
      showCloseButton={resultado !== 'progresando'}
      actions={
        resultado !== 'progresando'
          ? [
              {
                id: 'close',
                label: resultado === 'exito' ? '✓ Entendido' : 'Cerrar',
                variant: resultado === 'exito' ? 'success' : 'secondary',
                onClick: onClose,
              },
            ]
          : []
      }
    />
  )
}


