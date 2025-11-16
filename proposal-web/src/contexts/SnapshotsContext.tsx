'use client'

/**
 * Context para centralizar todas las variables de snapshots de paquetes
 * Proporciona acceso a variables nominadas: constructorDesarrollo, imperiodigitalEmoji, etc
 */

import React, { createContext } from 'react'
import type { PackageSnapshot } from '@/lib/types'

export interface SnapshotsContextType {
  // Snapshots crudos
  snapshots: Record<string, PackageSnapshot | null>

  // Variables nominadas (constructorDesarrollo, imperioDigitalEmoji, etc)
  nominatedVariables: Record<string, any>

  // Funciones de actualización
  updateSnapshot: (paqueteName: string, snapshot: PackageSnapshot) => void
  updateMultipleSnapshots: (snapshots: Record<string, PackageSnapshot>) => void

  // Funciones de acceso
  getSnapshot: (paqueteName: string) => PackageSnapshot | null
  getVariable: (variableName: string) => any
  getVariablesForPaquete: (paqueteName: string) => Record<string, any>

  // Estado de carga
  isLoading: boolean
  error: string | null
}

export const SnapshotsContext = createContext<SnapshotsContextType | undefined>(
  undefined
)

SnapshotsContext.displayName = 'SnapshotsContext'
