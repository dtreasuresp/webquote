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
      color: 'from-accent to-accent-dark',
      bg: 'bg-gradient-to-br from-accent/25 to-accent/12',
        
      id: 'total-snapshots'
    },
    {
      titulo: 'Paquetes Activos',
      valor: paquetesActivos,
      icono: FaCheckCircle,
      color: 'from-primary to-primary-dark',
      bg: 'bg-gradient-to-br from-primary/25 to-primary/12',
      border: 'border-primary',
      id: 'paquetes-activos'
    },
    {
      titulo: 'Último Cambio',
      valor: ultimoCambio,
      icono: FaClock,
      color: 'from-secondary-light to-secondary',
      bg: 'bg-gradient-to-br from-secondary/35 to-secondary/20',
      border: 'border-secondary/40',
      id: 'ultimo-cambio'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icono
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            whileHover={{ translateY: -6 }}
            className={`${kpi.bg} backdrop-blur-md rounded-lg p-6 border ${kpi.border} cursor-pointer shadow-xl hover:shadow-2xl transition-all`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-2">{kpi.titulo}</p>
                <p className="text-3xl font-bold text-white">
                  {cargandoSnapshots ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    kpi.valor
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                <Icon className="text-white text-xl" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
