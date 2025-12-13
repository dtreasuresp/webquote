'use client'

import { motion } from 'framer-motion'
import { PackageSnapshot } from '@/lib/types'
import { FaCreditCard, FaPercent, FaGift } from 'react-icons/fa'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { 
  fluentSlideUp,
  fluentStaggerContainer,
  fluentStaggerItem
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

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

  // Título y subtítulo dinámicos de la sección
  const tituloSeccion = snapshot.paquete.tituloSeccionPago || 'Opciones de Pago'
  const subtituloSeccion = snapshot.paquete.subtituloSeccionPago || ''

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
    <FluentSection
      id="payment-options"
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-white to-light-bg"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaCreditCard className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {tituloSeccion}
          </h2>
          {subtituloSeccion && (
            <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
              {subtituloSeccion}
            </p>
          )}
        </motion.div>

      {/* Resumen de descuentos aplicados */}
      {hayDescuentos && (
        <FluentGlass
          variant="normal"
          className="mb-6 p-5 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
              <FaPercent size={12} />
            </div>
            <h5 className="font-bold text-green-800">Descuentos Aplicados</h5>
          </div>
          <FluentRevealGroup className="grid md:grid-cols-3 gap-4 text-sm">
            {tipoDescuento !== 'ninguno' && (
              <FluentRevealItem>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200/50 shadow-sm h-full">
                  <span className="text-light-text-secondary text-xs uppercase tracking-wide">Tipo</span>
                  <p className="font-semibold text-light-success capitalize mt-1">{tipoDescuento}</p>
                </div>
              </FluentRevealItem>
            )}
            {descuentoPagoUnico > 0 && (
              <FluentRevealItem>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-light-warning/30 shadow-sm h-full">
                  <span className="text-light-text-secondary text-xs uppercase tracking-wide">Pago Único</span>
                  <p className="font-semibold text-light-warning mt-1">{descuentoPagoUnico}% al desarrollo</p>
                </div>
              </FluentRevealItem>
            )}
            {descuentoDirecto > 0 && (
              <FluentRevealItem>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-light-info/30 shadow-sm h-full">
                  <span className="text-light-text-secondary text-xs uppercase tracking-wide">Directo</span>
                  <p className="font-semibold text-blue-600 mt-1">{descuentoDirecto}% al total</p>
                </div>
              </FluentRevealItem>
            )}
          </FluentRevealGroup>
        </FluentGlass>
      )}

      <FluentRevealGroup className="grid md:grid-cols-2 gap-8">
        {/* Opción 1: Pagos en cuotas */}
        {opcionesPago.length > 0 && (
          <FluentRevealItem>
            <FluentGlass
              variant="normal"
              className="p-6 rounded-2xl h-full"
            >
              <h5 className="text-xl font-bold text-light-text mb-4 flex items-center gap-2">
                📊 Opción 1: Pago en Cuotas
              </h5>
            <div className="space-y-3">
              {/* Cuotas de Desarrollo */}
              <div className="pb-3 border-b-2 border-light-border">
                <p className="text-sm font-semibold text-secondary mb-3">💳 CUOTAS DE DESARROLLO</p>
                {opcionesPago.map((opcion, index) => {
                  const monto = (desarrolloOp1 * opcion.porcentaje) / 100
                  return (
                    <div key={`pago-${opcion.nombre || index}`} className="mb-2">
                      <div className="flex justify-between items-center p-3 bg-light-bg-secondary rounded-lg">
                        <span className="font-semibold">
                          {opcion.nombre || `Pago ${index + 1}`} ({opcion.porcentaje}%)
                        </span>
                        <span className="text-lg font-bold text-primary">
                          ${monto.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="text-center text-light-text-secondary text-xs p-1">
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
                        <span className="text-sm text-light-text-muted line-through">${desarrollo.toFixed(2)}</span>
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
                <div className="pb-3 border-b-2 border-light-border">
                  <p className="text-sm font-semibold text-secondary mb-3">🏢 SERVICIOS BASE</p>
                  <div className="space-y-2">
                    {preview.serviciosBase.desglose.map((servicio) => (
                      <div key={`servicio-base-${servicio.id}`} className="flex justify-between items-center p-2 bg-light-bg-secondary rounded-lg">
                        <span className="text-sm text-light-text-secondary">{servicio.nombre}</span>
                        <div className="text-right">
                          {servicio.descuentoAplicado > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-light-text-muted line-through">${servicio.original.toFixed(2)}</span>
                              <span className="font-semibold text-light-success">${servicio.conDescuento.toFixed(2)}</span>
                              <span className="text-xs text-light-warning">(-{servicio.descuentoAplicado}%)</span>
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
                <div className="pb-3 border-b-2 border-light-border">
                  <p className="text-sm font-semibold text-secondary mb-3">⚙️ SERVICIOS ADICIONALES</p>
                  <div className="space-y-2">
                    {preview.otrosServicios.desglose.map((servicio) => (
                      <div key={`otro-servicio-${servicio.id}`} className="flex justify-between items-center p-2 bg-light-bg-secondary rounded-lg">
                        <span className="text-sm text-light-text-secondary">{servicio.nombre}</span>
                        <div className="text-right">
                          {servicio.descuentoAplicado > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-light-text-muted line-through">${servicio.original.toFixed(2)}</span>
                              <span className="font-semibold text-light-success">${servicio.conDescuento.toFixed(2)}</span>
                              <span className="text-xs text-light-warning">(-{servicio.descuentoAplicado}%)</span>
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
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-xl border border-primary/30 shadow-sm">
                {descuentoDirecto > 0 && (
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-primary/20">
                    <span className="text-sm text-light-text-secondary">Descuento Directo ({descuentoDirecto}%):</span>
                    <span className="text-light-success font-medium">-${(subtotalOp1 - totalOp1).toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-light-text">TOTAL:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalOp1.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
          </FluentGlass>
        </FluentRevealItem>
        )}

        {/* Opción 2: Pago único */}
        <FluentRevealItem>
          <FluentGlass
            variant="elevated"
            className="p-8 rounded-2xl h-full border-2 border-light-accent/50"
          >
            <div className="flex items-center gap-3 mb-5">
              <h5 className="text-xl font-bold text-secondary">🎁 Opción 2: Pago Único</h5>
              {ahorroTotal > 0 && (
                <motion.span 
                  className="bg-gradient-to-r from-accent to-accent-dark text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  transition={spring.fluent}
                >
                  <FaGift size={12} />
                  {porcentajeAhorro.toFixed(0)}% OFF
                </motion.span>
              )}
            </div>
          <div className="space-y-4">
            {/* Desarrollo */}
            <div className="pb-3 border-b-2 border-accent/20">
              <p className="text-sm font-semibold text-secondary mb-2">💳 DESARROLLO</p>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg mb-2">
                <span className="font-semibold text-light-text">Pago único</span>
                {preview.desarrolloConDescuento < preview.desarrollo ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-light-text-muted line-through">${preview.desarrollo.toFixed(2)}</span>
                    <span className="text-lg font-bold text-light-success">${preview.desarrolloConDescuento.toFixed(2)} USD</span>
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
                      <span className="text-sm text-light-text-secondary">{servicio.nombre}</span>
                      <div className="text-right">
                        {servicio.descuentoAplicado > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-light-text-muted line-through">${servicio.original.toFixed(2)}</span>
                            <span className="font-semibold text-light-success">${servicio.conDescuento.toFixed(2)}</span>
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
                      <span className="text-sm text-light-text-secondary">{servicio.nombre}</span>
                      <div className="text-right">
                        {servicio.descuentoAplicado > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-light-text-muted line-through">${servicio.original.toFixed(2)}</span>
                            <span className="font-semibold text-light-success">${servicio.conDescuento.toFixed(2)}</span>
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
            <motion.div 
              className="bg-gradient-to-r from-accent to-accent-dark rounded-2xl p-5 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={spring.fluent}
            >
              {ahorroTotal > 0 && (
                <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-white/20">
                  <span className="font-semibold text-white">Total Inicial:</span>
                  <span className="line-through text-white/70">${totalOriginal.toFixed(2)} USD</span>
                </div>
              )}
              {descuentoDirecto > 0 && (
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/20">
                  <span className="text-sm text-white/80">Descuento Directo ({descuentoDirecto}%):</span>
                  <span className="text-green-300 font-medium">-${(preview.subtotalConDescuentos - totalOp2).toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-white">Total a Pagar</span>
                <span className="text-3xl font-bold text-white">
                  ${totalOp2.toFixed(2)} USD
                </span>
              </div>
              {ahorroTotal > 0 && (
                <motion.div 
                  className="mt-3 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                    🎉 Ahorro: ${ahorroTotal.toFixed(2)} USD
                  </span>
                </motion.div>
              )}
            </motion.div>
            <p className="text-center text-light-text-secondary text-xs mt-3">
              <strong>Todos los descuentos aplicados</strong>
            </p>
          </div>
        </FluentGlass>
      </FluentRevealItem>
    </FluentRevealGroup>
      </div>
    </FluentSection>
  )
}
