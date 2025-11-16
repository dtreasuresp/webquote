'use client'

import { PackageSnapshot } from '@/lib/types'
import { FaCreditCard } from 'react-icons/fa'

interface PaymentOptionsProps {
  snapshot: PackageSnapshot | null
}

export default function PaymentOptions({ snapshot }: PaymentOptionsProps) {
  if (!snapshot) {
    return null
  }

  const desarrollo = snapshot.paquete.desarrollo || 0
  const opcionesPago = snapshot.paquete.opcionesPago || []
  const descuentoPagoUnico = snapshot.paquete.descuentoPagoUnico || 0

  // Si hay opciones de pago configuradas, mostrarlas
  if (opcionesPago.length > 0) {
    const totalDesarrollo = desarrollo

    return (
      <div className="mt-10">
        <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
          <FaCreditCard /> Opciones de Pago
        </h4>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Opción 1: Pagos en cuotas */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h5 className="text-xl font-bold text-gray-900 mb-4">📊 Opción 1: Estándar</h5>
            <div className="space-y-3">
              {opcionesPago.map((opcion, index) => {
                const monto = (totalDesarrollo * opcion.porcentaje) / 100
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold">
                        Pago {index + 1} ({opcion.porcentaje}%)
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${monto.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="text-center text-gray-600 -mt-2 text-sm">
                      {opcion.descripcion}
                    </div>
                  </div>
                )
              })}
              <div className="border-t-2 border-gray-300 pt-4">
                <p className="text-center font-bold text-gray-900">
                  Total: ${totalDesarrollo.toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          {/* Opción 2: Descuento por pago único */}
          {descuentoPagoUnico > 0 && (
            <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent">
              <div className="flex items-center gap-2 mb-4">
                <h5 className="text-xl font-bold text-secondary">🎁 Opción 2: Descuento</h5>
                <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{descuentoPagoUnico}%
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-gray-900">Pago único adelantado</span>
                  <span className="text-lg font-bold text-neutral-400 line-through">
                    ${totalDesarrollo.toFixed(2)} USD
                  </span>
                </div>
                <p className="text-center text-gray-700 font-bold">
                  CON DESCUENTO {descuentoPagoUnico}%
                </p>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-accent">
                  <span className="font-bold text-lg text-gray-900">Total a Pagar</span>
                  <span className="text-2xl font-bold text-accent">
                    ${(totalDesarrollo * (1 - descuentoPagoUnico / 100)).toFixed(2)} USD
                  </span>
                </div>
                <p className="text-center text-gray-700 text-sm">
                  Al iniciar (+ infraestructura y servicios)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Fallback: mostrar solo si no hay opciones configuradas
  return null
}
