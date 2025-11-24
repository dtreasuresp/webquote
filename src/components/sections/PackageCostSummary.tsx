'use client'

import { motion } from 'framer-motion'

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
  gestion: {
    precio: number
    mesesGratis: number
    mesesPago: number
  }
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
  snapshot: PackageSnapshot
}

export default function PackageCostSummary({ snapshot }: PackageCostSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="overflow-x-auto"
    >
      <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-primary text-white">
          <tr>
            <th className="px-6 py-3 text-left">Periodo</th>
            <th className="px-6 py-3 text-center">Desarrollo</th>
            <th className="px-6 py-3 text-center">Hosting</th>
            <th className="px-6 py-3 text-center">Mailbox</th>
            <th className="px-6 py-3 text-center">Dominio</th>
            <th className="px-6 py-3 text-center">Gestión</th>
            <th className="px-6 py-3 text-center">Costo anual</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {/* Pago Inicial */}
          <tr className="bg-accent/5 font-bold hover:bg-accent/10">
            <td className="px-6 py-4">Pago Inicial</td>
            <td className="px-6 py-4 text-center">
              ${(snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${(snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${(snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${(snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">$0 USD</td>
            <td className="px-6 py-4 text-center text-primary">
              ${snapshot.costos.inicial.toFixed(0)} USD
            </td>
          </tr>

          {/* 3 Meses (Gratis) */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 font-semibold">3 Meses (Gratis)</td>
            <td className="px-6 py-4 text-center text-accent">N/A</td>
            <td className="px-6 py-4 text-center text-accent">$0</td>
            <td className="px-6 py-4 text-center text-accent">$0</td>
            <td className="px-6 py-4 text-center text-accent">$0</td>
            <td className="px-6 py-4 text-center text-accent">
              ${((snapshot.gestion.precio * (3 - snapshot.gestion.mesesGratis)) || 0).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center text-accent font-bold">
              ${((snapshot.gestion.precio * (3 - snapshot.gestion.mesesGratis)) || 0).toFixed(0)} USD
            </td>
          </tr>

          {/* Año 1 (meses 4–12) */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 font-semibold">Año 1 (meses 4–12)</td>
            <td className="px-6 py-4 text-center text-accent">N/A</td>
            <td className="px-6 py-4 text-center">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0) * (snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.mesesPago || 12)).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0) * (snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.mesesPago || 12)).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0) * (snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.mesesPago || 12)).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${(snapshot.gestion.precio * snapshot.gestion.mesesPago).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center font-bold">
              ${snapshot.costos.año1.toFixed(0)} USD
            </td>
          </tr>

          {/* Año 2+ */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 font-semibold">Año 2+</td>
            <td className="px-6 py-4 text-center text-accent">N/A</td>
            <td className="px-6 py-4 text-center">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0) * 12).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0) * 12).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${((snapshot.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0) * 12).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center">
              ${(snapshot.gestion.precio * 12).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-center font-bold">
              ${snapshot.costos.año2.toFixed(0)} USD
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-gray-600 mt-3">
        ➡️ Nota: La <strong>gestión mensual</strong> inicia desde el mes 2 (1 mes gratis).
      </p>
    </motion.div>
  )
}
