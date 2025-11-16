'use client'

import { motion } from 'framer-motion'
import { FaCalendarAlt, FaDollarSign } from 'react-icons/fa'
import useSnapshots from '@/lib/hooks/useSnapshots'
import { 
  getDevelopmentRange, 
  getHostingRange, 
  getDomainRange, 
  getMailboxRange, 
  getManagementRange,
  getOtherServicesInfo 
} from '@/lib/utils/priceRangeCalculator'

export default function PresupuestoYCronograma() {
  const { snapshots, loading } = useSnapshots()
  return (
    <section id="presupuesto" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Presupuesto y Cronograma
          </h2>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Presupuesto */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-6">
                <FaDollarSign className="text-primary text-3xl" />
                <h3 className="text-3xl font-bold text-gray-900">Presupuesto disponible</h3>
              </div>

              <div className="space-y-6">
                {/* Presupuesto Total */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-600 mb-2">Presupuesto disponible por el cliente</p>
                  <p className="text-4xl font-bold text-primary">Menos de $300 USD</p>
                  <p className="text-sm text-gray-500 mt-3">DGTecnova valora tu presupuesto y somos flexibles según el paquete seleccionado</p>
                </div>

                {/* Desglose */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">Desglose por elementos según paquete contratado:</h4>
                  {loading ? (
                    <div className="space-y-3">
                      {['desarrollo', 'hosting', 'dominio', 'mailbox', 'gestion'].map((item) => (
                        <div key={`skeleton-${item}`} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <BudgetItem label="Desarrollo" value={getDevelopmentRange(snapshots)} />
                      <BudgetItem label="Hosting" value={getHostingRange(snapshots)} />
                      <BudgetItem label="Dominio" value={getDomainRange(snapshots)} />
                      <BudgetItem label="Correo" value={getMailboxRange(snapshots)} />
                      <BudgetItem label="Gestión" value={getManagementRange(snapshots)} />
                      {getOtherServicesInfo(snapshots).length > 0 && (
                        <>
                          <div className="border-t-2 border-gray-300 pt-3 mt-3">
                            <p className="font-semibold text-gray-900 text-sm mb-3">Servicios Adicionales</p>
                          </div>
                          {getOtherServicesInfo(snapshots).map((servicio) => (
                            <BudgetItem
                              key={servicio.nombre}
                              label={servicio.nombre}
                              value={
                                servicio.precioMin === servicio.precioMax
                                  ? `$${servicio.precioMin}`
                                  : `$${servicio.precioMin} - $${servicio.precioMax}`
                              }
                            />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Opciones de Pago */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">Métodos de pago disponibles:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Transferencia bancaria (Nacional o Internacional)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Tarjeta crédito/débito
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Efectivo (si es local)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> PayPal
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Stripe
                    </li>

                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Wise
                    </li>

                  </ul>
                </div>
              </div>
            </div>

            {/* Cronograma */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-6">
                <FaCalendarAlt className="text-primary text-3xl" />
                <h3 className="text-3xl font-bold text-gray-900">Cronograma del proyecto</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-900">Constructor (4 semanas)</h4>
                      <p className="text-sm text-gray-600 mt-1">Semana 1: Descubrimiento | Semana 2: Diseño | Semana 3: Desarrollo | Semana 4: Testing</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-900">Obra Maestra (5-6 semanas)</h4>
                      <p className="text-sm text-gray-600 mt-1">Semana 1: Discovery | Semana 2: Diseño profesional | Semana 3-4: Desarrollo | Semana 5: Contenidos | Semana 6: Optimización</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-900">Imperio Digital (7-8 semanas)</h4>
                      <p className="text-sm text-gray-600 mt-1">Semana 1: Workshop estratégico | Semana 2: Branding | Semana 3-4: Producción audiovisual | Semana 5-6: Desarrollo | Semana 7: Marketing | Semana 8: Lanzamiento</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>📌 Nota importante:</strong> Todas las fechas son estimadas y pueden variar según disponibilidad de recursos del cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          
        </motion.div>
      </div>
    </section>
  )
}

function BudgetItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200">
      <span className="text-gray-700">{label}</span>
      <span className="font-bold text-primary">{value}</span>
    </div>
  )
}
