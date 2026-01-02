'use client'

import { motion } from 'framer-motion'
import { PackageSnapshot } from '@/lib/types'
import { Package, CheckCircle2, Clock } from 'lucide-react'

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
      icono: Package,
      id: 'total-paquetes'
    },
    {
      titulo: 'Paquetes Activos',
      valor: paquetesActivos,
      icono: CheckCircle2,
      id: 'paquetes-activos'
    },
    {
      titulo: 'Último Cambio',
      valor: ultimoCambio,
      icono: Clock,
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
            whileHover={{ translateY: -2, scale: 1.02 }}
            className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 cursor-pointer hover:border-gh-success/50 transition-all shadow-lg shadow-black/20"
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
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Icon className="text-gh-success w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}




