'use client'

import { motion } from 'framer-motion'
import { PackageSnapshot } from '@/lib/types'
import { FaBox, FaCheckCircle, FaClock } from 'react-icons/fa'

interface KPICardsProps {
  readonly snapshots: readonly PackageSnapshot[]
  readonly cargandoSnapshots: boolean
}

export default function KPICards({ snapshots, cargandoSnapshots }: KPICardsProps) {
  const totalSnapshots = snapshots.length
  const paquetesActivos = snapshots.filter(s => s.activo).length
  
  // Obtener fecha del último cambio
  const ultimoCambio = snapshots.length > 0 
    ? new Date(snapshots.at(-1)!.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      })
    : '-'

  const kpis = [
    {
      titulo: 'Total Paquetes',
      valor: totalSnapshots,
      icono: FaBox,
      id: 'total-paquetes'
    },
    {
      titulo: 'Paquetes Activos',
      valor: paquetesActivos,
      icono: FaCheckCircle,
      id: 'paquetes-activos'
    },
    {
      titulo: 'Último Cambio',
      valor: ultimoCambio,
      icono: FaClock,
      id: 'ultimo-cambio'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icono
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            whileHover={{ translateY: -2 }}
            className="bg-gh-bg-secondary rounded-md p-4 border border-gh-border cursor-pointer hover:border-gh-success transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gh-text-muted mb-1 font-medium">{kpi.titulo}</p>
                <p className="text-2xl font-bold text-gh-text">
                  {cargandoSnapshots ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    kpi.valor
                  )}
                </p>
              </div>
              <div className="p-2 rounded bg-gh-bg border border-gh-border">
                <Icon className="text-gh-text text-sm" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}


