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
      titulo: 'Total Snapshots',
      valor: totalSnapshots,
      icono: FaBox,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      id: 'total-snapshots'
    },
    {
      titulo: 'Paquetes Activos',
      valor: paquetesActivos,
      icono: FaCheckCircle,
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-500/10',
      id: 'paquetes-activos'
    },
    {
      titulo: 'Último Cambio',
      valor: ultimoCambio,
      icono: FaClock,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      id: 'ultimo-cambio'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icono
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            whileHover={{ translateY: -4 }}
            className={`${kpi.bg} backdrop-blur-md rounded-lg p-5 border border-white/10 cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-300 mb-1">{kpi.titulo}</p>
                <p className="text-2xl font-bold text-white">
                  {cargandoSnapshots ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    kpi.valor
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                <Icon className="text-white text-lg" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
