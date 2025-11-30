import { useEffect, useState, useCallback, useRef } from 'react'
import type { PackageSnapshot } from '@/lib/types'
import { obtenerSnapshots, crearSnapshot, actualizarSnapshot, eliminarSnapshot } from '@/lib/snapshotApi'

// Listeners globales para cambios de snapshots
const listeners = new Set<() => void>()

export interface UseSnapshotsResult {
  snapshots: PackageSnapshot[]
  loading: boolean
  error: string | null
  load: () => Promise<void>
  create: (snapshot: PackageSnapshot) => Promise<PackageSnapshot>
  update: (id: string, data: PackageSnapshot) => Promise<PackageSnapshot>
  remove: (id: string) => Promise<void>
  last: PackageSnapshot | null
}

/**
 * Hook que permite refrescar globalmente todos los datos de snapshots
 * Debe ser usado en administrador después de cambios
 */
export function useSnapshotsRefresh() {
  return useCallback(async () => {
    // Notificar a todos los listeners para refrescar
    listeners.forEach(listener => listener())
  }, [])
}

/**
 * Registra un listener para cambios globales de snapshots
 */
function subscribeToChanges(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export default function useSnapshots(): UseSnapshotsResult {
  const [snapshots, setSnapshots] = useState<PackageSnapshot[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await obtenerSnapshots()
      setSnapshots(data as PackageSnapshot[])
    } catch (e: any) {
      setError(e?.message || 'Error al cargar los paquetes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Carga inicial
    load()

    // Suscribirse a cambios globales
    unsubscribeRef.current = subscribeToChanges(() => {
      load()
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [load])

  const create = useCallback(async (snapshot: PackageSnapshot) => {
    const saved = await crearSnapshot(snapshot)
    setSnapshots(prev => [...prev, saved as PackageSnapshot])
    // Notificar cambios globales
    listeners.forEach(listener => listener())
    return saved as PackageSnapshot
  }, [])

  const update = useCallback(async (id: string, data: PackageSnapshot) => {
    const saved = await actualizarSnapshot(id, data)
    setSnapshots(prev => prev.map(s => (s.id === id ? (saved as PackageSnapshot) : s)))
    // Notificar cambios globales
    listeners.forEach(listener => listener())
    return saved as PackageSnapshot
  }, [])

  const remove = useCallback(async (id: string) => {
    await eliminarSnapshot(id)
    setSnapshots(prev => prev.filter(s => s.id !== id))
    // Notificar cambios globales
    listeners.forEach(listener => listener())
  }, [])

  const last = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null

  return { snapshots, loading, error, load, create, update, remove, last }
}
