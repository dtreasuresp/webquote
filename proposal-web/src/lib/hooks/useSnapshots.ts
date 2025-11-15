import { useEffect, useState, useCallback } from 'react'
import type { PackageSnapshot } from '@/lib/types'
import { obtenerSnapshots, crearSnapshot, actualizarSnapshot, eliminarSnapshot } from '@/lib/snapshotApi'

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

export default function useSnapshots(): UseSnapshotsResult {
  const [snapshots, setSnapshots] = useState<PackageSnapshot[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [load])

  const create = useCallback(async (snapshot: PackageSnapshot) => {
    const saved = await crearSnapshot(snapshot)
    setSnapshots(prev => [...prev, saved as PackageSnapshot])
    return saved as PackageSnapshot
  }, [])

  const update = useCallback(async (id: string, data: PackageSnapshot) => {
    const saved = await actualizarSnapshot(id, data)
    setSnapshots(prev => prev.map(s => (s.id === id ? (saved as PackageSnapshot) : s)))
    return saved as PackageSnapshot
  }, [])

  const remove = useCallback(async (id: string) => {
    await eliminarSnapshot(id)
    setSnapshots(prev => prev.filter(s => s.id !== id))
  }, [])

  const last = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null

  return { snapshots, loading, error, load, create, update, remove, last }
}
