'use client'

import { PackageSnapshot } from '@/lib/types'
import { FaCreditCard, FaPercent, FaGift } from 'react-icons/fa'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

interface PaymentOptionsProps {
  readonly snapshot: PackageSnapshot | null
}

export default function PaymentOptions({ snapshot }: PaymentOptionsProps) {
  if (!snapshot) {
    return null
  }

  // Usar el nuevo sistema de descuentos
  const preview = calcularPreviewDescuentos(snapshot)
  
  const desarrollo = snapshot.paquete.desarrollo || 0
  const descuentoPagoUnico = snapshot.paquete.configDescuentos?.descuentoPagoUnico || snapshot.paquete.descuentoPagoUnico || 0
  const descuentoDirecto = snapshot.paquete.configDescuentos?.descuentoDirecto || 0
  const tipoDescuento = preview.tipoDescuentoAplicado || 'ninguno'
  const hayDescuentos = tipoDescuento !== 'ninguno' || descuentoPagoUnico > 0 || descuentoDirecto > 0
  
  // Opciones por defecto si no hay configuradas (compatibilidad con datos existentes)
  const opcionesPagoPorDefecto = [
    { nombre: 'Inicial', porcentaje: 30, descripcion: 'Al firmar contrato' },
    { nombre: 'Avance', porcentaje: 40, descripcion: 'A mitad del proyecto' },
    { nombre: 'Final', porcentaje: 30, descripcion: 'Al entregar proyecto' },
  ]
  
  const opcionesPago = snapshot.paquete.opcionesPago && snapshot.paquete.opcionesPago.length > 0 
    ? snapshot.paquete.opcionesPago 
    : opcionesPagoPorDefecto

  // Calcular totales usando preview
  const totalOriginal = preview.totalOriginal
  const totalConDescuentos = preview.totalConDescuentos
  const ahorroTotal = preview.totalAhorro
  const porcentajeAhorro = preview.porcentajeAhorro

  // Cálculos para Opción 1 (Pago en cuotas - sin descuento pago único)
  const desarrolloOp1 = preview.desarrolloConDescuento + (preview.desarrolloConDescuento * descuentoPagoUnico / 100) // Revertir descuento pago único
  const serviciosBaseOp1 = preview.serviciosBase.conDescuento
  const otrosServiciosOp1 = preview.otrosServicios.conDescuento
  const subtotalOp1 = desarrolloOp1 + serviciosBaseOp1 + otrosServiciosOp1
  const totalOp1 = descuentoDirecto > 0 ? subtotalOp1 * (1 - descuentoDirecto / 100) : subtotalOp1

  // Cálculos para Opción 2 (Pago único - con todos los descuentos)
  const totalOp2 = totalConDescuentos

  return (
    <div className="mt-10">
      <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <FaCreditCard /> Opciones de Pago
      </h4>

      {/* Resumen de descuentos aplicados */}
      {hayDescuentos && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <FaPercent className="text-green-600" />
            <h5 className="font-bold text-green-800">Descuentos Aplicados</h5>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {tipoDescuento !== 'ninguno' && (
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <span className="text-gray-600">Tipo:</span>
                <span className="ml-2 font-semibold text-green-700 capitalize">{tipoDescuento}</span>
              </div>
            )}
            {descuentoPagoUnico > 0 && (
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <span className="text-gray-600">Pago Único:</span>
                <span className="ml-2 font-semibold text-orange-600">{descuentoPagoUnico}% al desarrollo</span>
              </div>
            )}
            {descuentoDirecto > 0 && (
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <span className="text-gray-600">Directo:</span>
                <span className="ml-2 font-semibold text-blue-600">{descuentoDirecto}% al total</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Opción 1: Pagos en cuotas */}
        {opcionesPago.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <h5 className="text-xl font-bold text-gray-900 mb-4">📊 Opción 1: Pago en Cuotas</h5>
            <div className="space-y-3">
              {/* Cuotas de Desarrollo */}
              <div className="pb-3 border-b-2 border-gray-200">
                <p className="text-sm font-semibold text-secondary mb-3">💳 CUOTAS DE DESARROLLO</p>
                {opcionesPago.map((opcion, index) => {
                  const monto = (desarrolloOp1 * opcion.porcentaje) / 100
                  return (
                    <div key={`pago-${opcion.nombre || index}`} className="mb-2">
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
                  <div className="text-right">
                    {desarrolloOp1 < desarrollo ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">${desarrollo.toFixed(2)}</span>
                        <span className="font-bold text-primary">${desarrolloOp1.toFixed(2)} USD</span>
                      </div>
                    ) : (
                      <span className="font-bold text-primary">${desarrolloOp1.toFixed(2)} USD</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Servicios Base */}
              {preview.serviciosBase.desglose.length > 0 && (
                <div className="pb-3 border-b-2 border-gray-200">
                  <p className="text-sm font-semibold text-secondary mb-3">🏢 SERVICIOS BASE</p>
                  <div className="space-y-2">
                    {preview.serviciosBase.desglose.map((servicio) => (
                      <div key={`servicio-base-${servicio.id}`} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{servicio.nombre}</span>
                        <div className="text-right">
                          {servicio.descuentoAplicado > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 line-through">${servicio.original.toFixed(2)}</span>
                              <span className="font-semibold text-green-600">${servicio.conDescuento.toFixed(2)}</span>
                              <span className="text-xs text-orange-500">(-{servicio.descuentoAplicado}%)</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-secondary">${servicio.original.toFixed(2)} USD</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg mt-2">
                    <span className="font-semibold text-secondary">Subtotal Base:</span>
                    <span className="font-bold text-accent">${serviciosBaseOp1.toFixed(2)} USD</span>
                  </div>
                </div>
              )}

              {/* Otros Servicios */}
              {preview.otrosServicios.desglose.length > 0 && (
                <div className="pb-3 border-b-2 border-gray-200">
                  <p className="text-sm font-semibold text-secondary mb-3">⚙️ SERVICIOS ADICIONALES</p>
                  <div className="space-y-2">
                    {preview.otrosServicios.desglose.map((servicio) => (
                      <div key={`otro-servicio-${servicio.id}`} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{servicio.nombre}</span>
                        <div className="text-right">
                          {servicio.descuentoAplicado > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 line-through">${servicio.original.toFixed(2)}</span>
                              <span className="font-semibold text-green-600">${servicio.conDescuento.toFixed(2)}</span>
                              <span className="text-xs text-orange-500">(-{servicio.descuentoAplicado}%)</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-secondary">${servicio.original.toFixed(2)} USD</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-lg mt-2">
                    <span className="font-semibold text-secondary">Subtotal Adicionales:</span>
                    <span className="font-bold text-secondary">${otrosServiciosOp1.toFixed(2)} USD</span>
                  </div>
                </div>
              )}

              {/* Total General Opción 1 */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border-2 border-primary/30">
                {descuentoDirecto > 0 && (
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-primary/20">
                    <span className="text-sm text-gray-600">Descuento Directo ({descuentoDirecto}%):</span>
                    <span className="text-green-600">-${(subtotalOp1 - totalOp1).toFixed(2)} USD</span>
                  </div>
                )}
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

        {/* Opción 2: Pago único */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent">
          <div className="flex items-center gap-2 mb-4">
            <h5 className="text-xl font-bold text-secondary">🎁 Opción 2: Pago Único</h5>
            {ahorroTotal > 0 && (
              <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <FaGift size={12} />
                {porcentajeAhorro.toFixed(0)}% OFF
              </span>
            )}
          </div>
          <div className="space-y-4">
            {/* Desarrollo */}
            <div className="pb-3 border-b-2 border-accent/20">
              <p className="text-sm font-semibold text-secondary mb-2">💳 DESARROLLO</p>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg mb-2">
                <span className="font-semibold text-gray-900">Pago único</span>
                {preview.desarrolloConDescuento < preview.desarrollo ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-neutral-400 line-through">${preview.desarrollo.toFixed(2)}</span>
                    <span className="text-lg font-bold text-green-600">${preview.desarrolloConDescuento.toFixed(2)} USD</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-primary">${preview.desarrollo.toFixed(2)} USD</span>
                )}
              </div>
              {descuentoPagoUnico > 0 && (
                <div className="text-xs text-orange-600 text-right">
                  Incluye {descuentoPagoUnico}% de descuento por pago único
                </div>
              )}
            </div>

            {/* Servicios Base */}
            {preview.serviciosBase.desglose.length > 0 && (
              <div className="pb-3 border-b-2 border-accent/20">
                <p className="text-sm font-semibold text-secondary mb-2">🏢 SERVICIOS BASE</p>
                <div className="space-y-2 mb-2">
                  {preview.serviciosBase.desglose.map((servicio) => (
                    <div key={`op2-base-${servicio.id}`} className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">{servicio.nombre}</span>
                      <div className="text-right">
                        {servicio.descuentoAplicado > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 line-through">${servicio.original.toFixed(2)}</span>
                            <span className="font-semibold text-green-600">${servicio.conDescuento.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-secondary">${servicio.original.toFixed(2)} USD</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-secondary">Subtotal:</span>
                  <span className="font-bold text-accent">${preview.serviciosBase.conDescuento.toFixed(2)} USD</span>
                </div>
              </div>
            )}

            {/* Otros Servicios */}
            {preview.otrosServicios.desglose.length > 0 && (
              <div className="pb-3 border-b-2 border-accent/20">
                <p className="text-sm font-semibold text-secondary mb-2">⚙️ SERVICIOS ADICIONALES</p>
                <div className="space-y-2 mb-2">
                  {preview.otrosServicios.desglose.map((servicio) => (
                    <div key={`op2-otro-${servicio.id}`} className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">{servicio.nombre}</span>
                      <div className="text-right">
                        {servicio.descuentoAplicado > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 line-through">${servicio.original.toFixed(2)}</span>
                            <span className="font-semibold text-green-600">${servicio.conDescuento.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-secondary">${servicio.original.toFixed(2)} USD</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-secondary">Subtotal:</span>
                  <span className="font-bold text-accent">${preview.otrosServicios.conDescuento.toFixed(2)} USD</span>
                </div>
              </div>
            )}

            {/* Total Final Opción 2 */}
            <div className="bg-gradient-to-r from-accent to-accent-dark rounded-lg p-4">
              {ahorroTotal > 0 && (
                <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-white/20">
                  <span className="font-semibold text-white">Total Inicial:</span>
                  <span className="line-through text-white/70">${totalOriginal.toFixed(2)} USD</span>
                </div>
              )}
              {descuentoDirecto > 0 && (
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/20">
                  <span className="text-sm text-white/80">Descuento Directo ({descuentoDirecto}%):</span>
                  <span className="text-green-300">-${(preview.subtotalConDescuentos - totalOp2).toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-white">Total a Pagar</span>
                <span className="text-3xl font-bold text-white">
                  ${totalOp2.toFixed(2)} USD
                </span>
              </div>
              {ahorroTotal > 0 && (
                <div className="mt-2 text-center">
                  <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                    🎉 Ahorro: ${ahorroTotal.toFixed(2)} USD
                  </span>
                </div>
              )}
            </div>
            <p className="text-center text-gray-700 text-xs">
              <strong>Todos los descuentos aplicados</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
