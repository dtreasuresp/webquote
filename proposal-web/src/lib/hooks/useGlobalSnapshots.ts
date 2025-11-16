'use client'

/**
 * Hook personalizado para acceder al contexto de snapshots
 * Uso: const { constructorDesarrollo, imperioDigitalEmoji } = useGlobalSnapshots()
 */

import { useContext } from 'react'
import { SnapshotsContext } from '@/contexts/SnapshotsContext'

export function useGlobalSnapshots() {
  const context = useContext(SnapshotsContext)

  if (context === undefined) {
    throw new Error(
      'useGlobalSnapshots debe usarse dentro de SnapshotsProvider'
    )
  }

  return context
}

/**
 * Hook alternativo que retorna solo las variables nominadas
 * Más ligero si solo necesitas acceso a variables
 */
export function useNominatedVariables() {
  const { nominatedVariables, isLoading, error } = useGlobalSnapshots()
  return { variables: nominatedVariables, isLoading, error }
}

/**
 * Hook para acceder a un paquete específico
 */
export function usePackageSnapshot(paqueteName: string) {
  const context = useGlobalSnapshots()
  const snapshot = context.getSnapshot(paqueteName)
  const variables = context.getVariablesForPaquete(paqueteName)

  return {
    snapshot,
    variables,
    isLoading: context.isLoading,
    error: context.error,
  }
}
