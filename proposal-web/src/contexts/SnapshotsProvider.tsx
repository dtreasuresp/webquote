'use client'

/**
 * Provider para el contexto de snapshots
 * Gestiona la obtención y actualización de snapshots
 * Expone variables nominadas para acceso fácil en componentes
 */

import React, { useEffect, useState, useCallback, ReactNode } from 'react'
import { SnapshotsContext, type SnapshotsContextType } from './SnapshotsContext'
import type { PackageSnapshot } from '@/lib/types'
import {
  normalizeSnapshot,
  createNominatedVariables,
  getAllVariables,
  getVariable as getVariableFromMap,
} from '@/lib/contextHelpers/variableMappers'
import { fetchPackageSnapshot } from '@/lib/snapshotApi'

interface SnapshotsProviderProps {
  children: ReactNode
  paquetes?: string[]
}

export const SnapshotsProvider = ({
  children,
  paquetes = ['constructor', 'imperio-digital', 'obra-maestra'],
}: SnapshotsProviderProps) => {
  // Snapshots crudos del servidor
  const [snapshots, setSnapshots] = useState<Record<string, PackageSnapshot | null>>({})

  // Variables nominadas calculadas
  const [nominatedVariables, setNominatedVariables] = useState<Record<string, any>>({})

  // Estado
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calcula todas las variables nominadas a partir de los snapshots
  const computeNominatedVariables = useCallback(
    (updatedSnapshots: Record<string, PackageSnapshot | null>) => {
      const variables: Record<string, any> = {}

      paquetes.forEach(paqueteName => {
        const snapshot = updatedSnapshots[paqueteName]
        if (snapshot) {
          const paqueteVariables = getAllVariables(paqueteName, snapshot)
          Object.assign(variables, paqueteVariables)
        }
      })

      setNominatedVariables(variables)
    },
    [paquetes]
  )

  // Carga snapshots del servidor al montar
  useEffect(() => {
    const loadSnapshots = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const loadedSnapshots: Record<string, PackageSnapshot | null> = {}

        for (const paqueteName of paquetes) {
          const snapshot = await fetchPackageSnapshot(paqueteName)
          loadedSnapshots[paqueteName] = snapshot
        }

        setSnapshots(loadedSnapshots)
        computeNominatedVariables(loadedSnapshots)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error cargando snapshots'
        setError(message)
        console.error('Error en SnapshotsProvider:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSnapshots()
  }, [paquetes, computeNominatedVariables])

  // Actualiza un snapshot individual
  const updateSnapshot = useCallback(
    (paqueteName: string, snapshot: PackageSnapshot) => {
      const updated = { ...snapshots, [paqueteName]: snapshot }
      setSnapshots(updated)
      computeNominatedVariables(updated)
    },
    [snapshots, computeNominatedVariables]
  )

  // Actualiza múltiples snapshots
  const updateMultipleSnapshots = useCallback(
    (newSnapshots: Record<string, PackageSnapshot>) => {
      const updated = { ...snapshots, ...newSnapshots }
      setSnapshots(updated)
      computeNominatedVariables(updated)
    },
    [snapshots, computeNominatedVariables]
  )

  // Obtiene un snapshot por nombre
  const getSnapshot = useCallback(
    (paqueteName: string): PackageSnapshot | null => {
      return snapshots[paqueteName] || null
    },
    [snapshots]
  )

  // Obtiene una variable nominada específica
  const getVariable = useCallback(
    (variableName: string): any => {
      return getVariableFromMap(nominatedVariables, variableName)
    },
    [nominatedVariables]
  )

  // Obtiene todas las variables de un paquete
  const getVariablesForPaquete = useCallback(
    (paqueteName: string): Record<string, any> => {
      const snapshot = snapshots[paqueteName]
      if (!snapshot) return {}
      return getAllVariables(paqueteName, snapshot)
    },
    [snapshots]
  )

  const value: SnapshotsContextType = {
    snapshots,
    nominatedVariables,
    updateSnapshot,
    updateMultipleSnapshots,
    getSnapshot,
    getVariable,
    getVariablesForPaquete,
    isLoading,
    error,
  }

  return (
    <SnapshotsContext.Provider value={value}>{children}</SnapshotsContext.Provider>
  )
}
