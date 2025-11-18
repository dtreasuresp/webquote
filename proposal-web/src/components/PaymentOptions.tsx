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
  const descuentoGeneral = snapshot.paquete.descuento || 0
  const descuentoPagoUnico = snapshot.paquete.descuentoPagoUnico || 0
  
  // Calcular costo de infraestructura mensual (suma de servicios base)
  const costoInfraestructuraMensual = (snapshot.serviciosBase || []).reduce(
    (total, servicio) => total + (servicio.precio || 0),
    0
  )

  // Calcular servicios adicionales del paquete
  const serviciosAdicionales = [
    { nombre: 'Hosting Paquete', precio: snapshot.paquete.precioHosting || 0 },
    { nombre: 'Dominio Paquete', precio: snapshot.paquete.precioMailbox || 0 },
    { nombre: 'SSL', precio: snapshot.paquete.precioDominio || 0 },
    { nombre: 'Gestión', precio: snapshot.gestion?.precio || 0 },
  ].filter(s => s.precio > 0)

  const costoAdicionalesTotal = serviciosAdicionales.reduce((sum, s) => sum + s.precio, 0)
  
  // Opciones por defecto si no hay configuradas (compatibilidad con datos existentes)
  const opcionesPagoPorDefecto = [
    { nombre: 'Inicial', porcentaje: 30, descripcion: 'Al firmar contrato' },
    { nombre: 'Avance', porcentaje: 40, descripcion: 'A mitad del proyecto' },
    { nombre: 'Final', porcentaje: 30, descripcion: 'Al entregar proyecto' },
  ]
  
  const opcionesPago = snapshot.paquete.opcionesPago && snapshot.paquete.opcionesPago.length > 0 
    ? snapshot.paquete.opcionesPago 
    : opcionesPagoPorDefecto

  // Cálculos para Opción 1
  const totalDesarrollo = desarrollo
  const descuentoDesarrolloOp1 = totalDesarrollo * (descuentoGeneral / 100)
  const desarrolloConDescuentoOp1 = totalDesarrollo - descuentoDesarrolloOp1
  
  const descuentoAdicionalesOp1 = costoAdicionalesTotal * (descuentoGeneral / 100)
  const adicionalesConDescuentoOp1 = costoAdicionalesTotal - descuentoAdicionalesOp1

  const totalOp1 = desarrolloConDescuentoOp1 + costoInfraestructuraMensual + adicionalesConDescuentoOp1

  // Cálculos para Opción 2
  const desarrolloSinDescuentos = desarrollo
  const desarrolloConDescuentoGeneral = desarrollo * (1 - descuentoGeneral / 100)
  const desarrolloConAmbosDescuentos = desarrolloConDescuentoGeneral * (1 - descuentoPagoUnico / 100)
  
  const infraestructuraConDescuento = costoInfraestructuraMensual * (1 - descuentoGeneral / 100)
  const adicionalesConDescuento = costoAdicionalesTotal * (1 - descuentoGeneral / 100)

  const totalOp2 = desarrolloConAmbosDescuentos + infraestructuraConDescuento + adicionalesConDescuento

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
              {/* Cuotas de Desarrollo */}
              <div className="pb-3 border-b-2 border-gray-200">
                <p className="text-sm font-semibold text-secondary mb-3">💳 CUOTAS DE DESARROLLO</p>
                {opcionesPago.map((opcion, index) => {
                  const monto = (totalDesarrollo * opcion.porcentaje) / 100
                  return (
                    <div key={`pago-${opcion.nombre}`} className="mb-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold">
                          {opcion.nombre || `Pago ${index + 1}`} ({opcion.porcentaje}%)
                        </span>
                        <span className="text-lg font-bold text-primary">
                          ${monto.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="text-center text-gray-600 text-xs p-1">
                        {opcion.descripcion}
                      </div>
                    </div>
                  )
                })}
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg mt-2">
                  <span className="font-semibold text-secondary">Subtotal Desarrollo:</span>
                  <span className="font-bold text-primary">
                    ${totalDesarrollo.toFixed(2)} USD
                  </span>
                </div>
                {descuentoGeneral > 0 && (
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg mt-2 border-2 border-green-300">
                    <span className="font-semibold text-green-900">Descuento General ({descuentoGeneral}%):</span>
                    <span className="font-bold text-green-900">
                      -${descuentoDesarrolloOp1.toFixed(2)} USD
                    </span>
                  </div>
                )}
                {descuentoGeneral > 0 && (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="font-semibold text-green-800">Desarrollo con descuento:</span>
                    <span className="font-bold text-green-800">
                      ${desarrolloConDescuentoOp1.toFixed(2)} USD
                    </span>
                  </div>
                )}
              </div>

              {/* Infraestructura y Servicios Base */}
              {costoInfraestructuraMensual > 0 && (
                <div className="pb-3 border-b-2 border-gray-200">
                  <p className="text-sm font-semibold text-secondary mb-3">🏢 INFRAESTRUCTURA Y SERVICIOS BASE</p>
                  <div className="space-y-2">
                    {snapshot.serviciosBase?.map((servicio) => (
                      <div key={servicio.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{servicio.nombre}</span>
                        <span className="font-semibold text-secondary">
                          ${servicio.precio.toFixed(2)} USD
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg mt-2">
                    <span className="font-semibold text-secondary">Subtotal Base:</span>
                    <span className="font-bold text-accent">
                      ${costoInfraestructuraMensual.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              )}

              {/* Servicios Adicionales */}
              {serviciosAdicionales.length > 0 && (
                <div className="pb-3 border-b-2 border-gray-200">
                  <p className="text-sm font-semibold text-secondary mb-3">⚙️ SERVICIOS ADICIONALES DEL PAQUETE</p>
                  <div className="space-y-2">
                    {serviciosAdicionales.map((servicio, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{servicio.nombre}</span>
                        <span className="font-semibold text-secondary">
                          ${servicio.precio.toFixed(2)} USD
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-lg mt-2">
                    <span className="font-semibold text-secondary">Subtotal Adicionales:</span>
                    <span className="font-bold text-secondary">
                      ${costoAdicionalesTotal.toFixed(2)} USD
                    </span>
                  </div>
                  {descuentoGeneral > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg mt-2 border-2 border-green-300">
                      <span className="font-semibold text-green-900">Descuento General ({descuentoGeneral}%):</span>
                      <span className="font-bold text-green-900">
                        -${descuentoAdicionalesOp1.toFixed(2)} USD
                      </span>
                    </div>
                  )}
                  {descuentoGeneral > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                      <span className="font-semibold text-green-800">Adicionales con descuento:</span>
                      <span className="font-bold text-green-800">
                        ${adicionalesConDescuentoOp1.toFixed(2)} USD
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Total General */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border-2 border-primary/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">TOTAL:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalOp1.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opción 2: Pago único (con o sin descuento) */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent">
          <div className="flex items-center gap-2 mb-4">
            <h5 className="text-xl font-bold text-secondary">🎁 Opción 2: Pago único</h5>
            {(descuentePagoUnico > 0 || descuentoGeneral > 0) && (
              <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                {descuentoGeneral > 0 && descuentoPagoUnico > 0 
                  ? `${((1 - (1 - descuentoGeneral/100) * (1 - descuentoPagoUnico/100)) * 100).toFixed(0)}%`
                  : descuentoPagoUnico > 0 ? `-${descuentoPagoUnico}%` : `-${descuentoGeneral}%`
                }
              </span>
            )}
          </div>
          <div className="space-y-4">
            {/* Desarrollo */}
            <div className="pb-3 border-b-2 border-accent/20">
              <p className="text-sm font-semibold text-secondary mb-2">💳 DESARROLLO</p>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg mb-2">
                <span className="font-semibold text-gray-900">Pago único adelantado</span>
                {(descuentoGeneral > 0 || descuentoPagoUnico > 0) ? (
                  <span className="text-lg font-bold text-neutral-400 line-through">
                    ${desarrolloSinDescuentos.toFixed(2)} USD
                  </span>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    ${desarrolloSinDescuentos.toFixed(2)} USD
                  </span>
                )}
              </div>
              {descuentoGeneral > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg mb-2 border-2 border-green-300">
                  <span className="font-semibold text-green-900">Descuento General ({descuentoGeneral}%):</span>
                  <span className="font-bold text-green-900">
                    -${(desarrolloSinDescuentos * descuentoGeneral / 100).toFixed(2)} USD
                  </span>
                </div>
              )}
              {descuentoPagoUnico > 0 && (
                <div className="flex justify-between items-center p-3 bg-orange-100 rounded-lg mb-2 border-2 border-orange-300">
                  <span className="font-semibold text-orange-900">Descuento Pago Único ({descuentoPagoUnico}%):</span>
                  <span className="font-bold text-orange-900">
                    -${(desarrolloConDescuentoGeneral * descuentoPagoUnico / 100).toFixed(2)} USD
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-accent/20">
                <span className="font-semibold text-secondary">Desarrollo Final:</span>
                <span className="text-lg font-bold text-accent">
                  ${desarrolloConAmbosDescuentos.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Infraestructura */}
            {costoInfraestructuraMensual > 0 && (
              <div className="pb-3 border-b-2 border-accent/20">
                <p className="text-sm font-semibold text-secondary mb-2">🏢 INFRAESTRUCTURA Y SERVICIOS BASE</p>
                <div className="space-y-2 mb-2">
                  {snapshot.serviciosBase?.map((servicio) => (
                    <div key={servicio.id} className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">{servicio.nombre}</span>
                      <span className="font-semibold text-secondary">
                        ${servicio.precio.toFixed(2)} USD
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-secondary">Subtotal (sin descuento individual):</span>
                  <span className="font-bold text-accent">
                    ${costoInfraestructuraMensual.toFixed(2)} USD
                  </span>
                </div>
              </div>
            )}

            {/* Servicios Adicionales */}
            {serviciosAdicionales.length > 0 && (
              <div className="pb-3 border-b-2 border-accent/20">
                <p className="text-sm font-semibold text-secondary mb-2">⚙️ SERVICIOS ADICIONALES DEL PAQUETE</p>
                <div className="space-y-2 mb-2">
                  {serviciosAdicionales.map((servicio, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">{servicio.nombre}</span>
                      <span className="font-semibold text-secondary">
                        ${servicio.precio.toFixed(2)} USD
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-secondary">Subtotal (sin descuento individual):</span>
                  <span className="font-bold text-accent">
                    ${costoAdicionalesTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>
            )}

            {/* Total Final */}
            <div className="bg-gradient-to-r from-accent to-accent-dark rounded-lg p-4">
              {(descuentoGeneral > 0 || descuentoPagoUnico > 0) && (
                <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-white/20">
                  <span className="font-semibold text-white">Total Inicial:</span>
                  <span className="line-through text-white/70">
                    ${(desarrolloSinDescuentos + costoInfraestructuraMensual + costoAdicionalesTotal).toFixed(2)} USD
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-white">Total a Pagar</span>
                <span className="text-3xl font-bold text-white">
                  ${totalOp2.toFixed(2)} USD
                </span>
              </div>
            </div>
            <p className="text-center text-gray-700 text-xs">
              <strong>Desarrollo</strong> (con descuentos si aplican) <strong>+ Infraestructura + Adicionales</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
