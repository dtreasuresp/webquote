'use client'

import { motion } from 'framer-motion'
import { FluentGlass, FluentReveal } from '@/components/motion'
import { fluentStaggerContainer, fluentStaggerItem } from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface OtroServicio {
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface PackageSnapshot {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  paquete: {
    desarrollo: number
    descuento: number
    tipo?: string
    descripcion?: string
  }
  otrosServicios: OtroServicio[]
  costos: {
    inicial: number
    año1: number
    año2: number
  }
  activo: boolean
  createdAt: string
}

interface PackageCostSummaryProps {
  readonly snapshot: PackageSnapshot
}

export default function PackageCostSummary({ snapshot }: PackageCostSummaryProps) {
  const preview = calcularPreviewDescuentos(snapshot as any)
  
  return (
    <FluentReveal className="overflow-x-auto">
      <FluentGlass
        variant="normal"
        className="rounded-2xl overflow-hidden"
      >
        <motion.table 
          className="w-full"
          variants={fluentStaggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
        <thead className="bg-gradient-to-r from-light-accent to-blue-600 text-white">
          <tr>
            <th className="px-5 py-3.5 text-left text-sm font-semibold">Periodo</th>
            <th className="px-5 py-3.5 text-center text-sm font-semibold">Desarrollo</th>
            <th className="px-5 py-3.5 text-center text-sm font-semibold">Hosting</th>
            <th className="px-5 py-3.5 text-center text-sm font-semibold">Mailbox</th>
            <th className="px-5 py-3.5 text-center text-sm font-semibold">Dominio</th>
            <th className="px-5 py-3.5 text-center text-sm font-semibold">Costo anual</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border">
          {/* Pago Inicial */}
          <motion.tr 
            className="bg-light-success/5 font-semibold hover:bg-light-success/10 transition-colors"
            variants={fluentStaggerItem}
            whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
            transition={spring.fluent}
          >
            <td className="px-5 py-4 text-sm text-light-text">Pago Inicial</td>
            <td className="px-5 py-4 text-center text-sm">
              ${preview.desarrolloConDescuento.toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm">
              ${(snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm">
              ${(snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm">
              ${(snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm font-bold text-light-success">
              ${snapshot.costos.inicial.toFixed(0)} USD
            </td>
          </motion.tr>

          {/* 3 Meses (Gratis) */}
          <motion.tr 
            className="hover:bg-light-bg-secondary/50 transition-colors"
            variants={fluentStaggerItem}
          >
            <td className="px-5 py-4 font-medium text-sm text-light-text">3 Meses (Gratis)</td>
            <td className="px-5 py-4 text-center text-xs text-light-text-muted">N/A</td>
            <td className="px-5 py-4 text-center text-sm text-light-success">$0</td>
            <td className="px-5 py-4 text-center text-sm text-light-success">$0</td>
            <td className="px-5 py-4 text-center text-sm text-light-success">$0</td>
            <td className="px-5 py-4 text-center text-sm font-semibold text-light-accent">
              $0 USD
            </td>
          </motion.tr>

          {/* Año 1 (meses 4–12) */}
          <motion.tr 
            className="hover:bg-light-bg-secondary/50 transition-colors"
            variants={fluentStaggerItem}
          >
            <td className="px-5 py-4 font-medium text-sm text-light-text">Año 1 (meses 4–12)</td>
            <td className="px-5 py-4 text-center text-xs text-light-text-muted">N/A</td>
            <td className="px-5 py-4 text-center text-sm text-light-text-secondary">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0) * (snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.mesesPago || 12)).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm text-light-text-secondary">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0) * (snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.mesesPago || 12)).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm text-light-text-secondary">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0) * (snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.mesesPago || 12)).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm font-bold text-light-text">
              ${snapshot.costos.año1.toFixed(0)} USD
            </td>
          </motion.tr>

          {/* Año 2+ */}
          <motion.tr 
            className="hover:bg-light-bg-secondary/50 transition-colors"
            variants={fluentStaggerItem}
          >
            <td className="px-5 py-4 font-medium text-sm text-light-text">Año 2+</td>
            <td className="px-5 py-4 text-center text-xs text-light-text-muted">N/A</td>
            <td className="px-5 py-4 text-center text-sm text-light-text-secondary">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0) * 12).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm text-light-text-secondary">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0) * 12).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm text-light-text-secondary">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0) * 12).toFixed(0)}
            </td>
            <td className="px-5 py-4 text-center text-sm font-bold text-light-text">
              ${snapshot.costos.año2.toFixed(0)} USD
            </td>
          </motion.tr>
        </tbody>
      </motion.table>
    </FluentGlass>
  </FluentReveal>
  )
}
