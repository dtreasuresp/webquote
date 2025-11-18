'use client'

import { PackageSnapshot } from '@/lib/types'
import { FaCreditCard } from 'react-icons/fa'

interface PaymentOptionsProps {
  readonly snapshot: PackageSnapshot | null
}

export default function PaymentOptions({ snapshot }: PaymentOptionsProps) {
  if (!snapshot) {
    return null
  }

  const desarrollo = snapshot.paquete.desarrollo || 0
  
  // Opciones por defecto si no hay configuradas (compatibilidad con datos existentes)
  const opcionesPagoPorDefecto = [
    { nombre: 'Inicial', porcentaje: 30, descripcion: 'Al firmar contrato' },
    { nombre: 'Avance', porcentaje: 40, descripcion: 'A mitad del proyecto' },
    { nombre: 'Final', porcentaje: 30, descripcion: 'Al entregar proyecto' },
  ]
  
  const opcionesPago = snapshot.paquete.opcionesPago && snapshot.paquete.opcionesPago.length > 0 
    ? snapshot.paquete.opcionesPago 
    : opcionesPagoPorDefecto
    
  const descuentoPagoUnico = snapshot.paquete.descuentoPagoUnico || 0

  const totalDesarrollo = desarrollo

  return (
    <div className="mt-10">
      <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <FaCreditCard /> Opciones de Pago
      </h4>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Opción 1: Pagos en cuotas (si existen) */}
        {opcionesPago.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h5 className="text-xl font-bold text-gray-900 mb-4">📊 Opción 1: Estándar</h5>
            <div className="space-y-3">
              {opcionesPago.map((opcion, index) => {
                const monto = (totalDesarrollo * opcion.porcentaje) / 100
                return (
                  <div key={`pago-${opcion.nombre}`}>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold">
                        {opcion.nombre || `Pago ${index + 1}`} ({opcion.porcentaje}%)
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${monto.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="text-center text-gray-600 -mt-10 text-sm p-2">
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
        )}

        {/* Opción 2: Pago único (con o sin descuento) */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent">
          <div className="flex items-center gap-2 mb-4">
            <h5 className="text-xl font-bold text-secondary">🎁 Opción 2: Pago único</h5>
            {descuentoPagoUnico > 0 && (
              <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                -{descuentoPagoUnico}%
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="font-semibold text-gray-900">Pago único adelantado</span>
              {descuentoPagoUnico > 0 ? (
                <span className="text-lg font-bold text-neutral-400 line-through">
                  ${totalDesarrollo.toFixed(2)} USD
                </span>
              ) : (
                <span className="text-lg font-bold text-primary">
                  ${totalDesarrollo.toFixed(2)} USD
                </span>
              )}
            </div>
            <p className="text-center text-gray-700 font-bold">
              {descuentoPagoUnico > 0 ? `CON DESCUENTO ${descuentoPagoUnico}%` : 'Sin descuento vigente'}
            </p>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-accent">
              <span className="font-bold text-lg text-gray-900">Total a Pagar</span>
              <span className="text-2xl font-bold text-accent">
                ${(totalDesarrollo * (1 - descuentoPagoUnico / 100)).toFixed(2)} USD
              </span>
            </div>
            <p className="text-center text-gray-700 text-sm">
              <strong>Desarrollo</strong> + <strong>infraestructura</strong> y <strong>servicios</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
