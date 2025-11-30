'use client'

import { motion } from 'framer-motion'
import { FaCalendarAlt, FaDollarSign } from 'react-icons/fa'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import { 
  getDevelopmentRange, 
  getHostingRange, 
  getDomainRange, 
  getMailboxRange, 
  getManagementRange,
  getOtherServicesInfo 
} from '@/lib/utils/priceRangeCalculator'
import type { PresupuestoCronogramaData } from '@/lib/types'

interface PresupuestoYCronogramaProps {
  readonly data?: PresupuestoCronogramaData
}

export default function PresupuestoYCronograma({ data }: PresupuestoYCronogramaProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const presupuestoData = data
  const { snapshots, loading } = useSnapshots()
  return (
    <section id="presupuesto" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-success-bg rounded-full mb-4">
              <FaDollarSign className="text-light-success" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {presupuestoData.titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {presupuestoData.subtitulo}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Presupuesto */}
            {presupuestoData.presupuesto.visible !== false && (
            <div className="bg-light-bg-secondary rounded-md p-6 border border-light-border">
              <div className="flex items-center gap-2 mb-5">
                <FaDollarSign className="text-light-success text-xl" />
                <h3 className="text-xl font-semibold text-light-text">{presupuestoData.presupuesto.titulo}</h3>
              </div>

              <div className="space-y-4">
                {/* Presupuesto Total */}
                <div className="bg-light-bg rounded-md p-4 border border-light-border">
                  <p className="text-light-text-secondary text-sm mb-1">Presupuesto disponible por el cliente</p>
                  <p className="text-2xl font-bold text-light-accent">{presupuestoData.presupuesto.descripcion}</p>
                  <p className="text-xs text-light-text-secondary mt-2">{presupuestoData.presupuesto.notaImportante}</p>
                </div>

                {/* Desglose */}
                <div className="bg-light-bg rounded-md p-4 border border-light-border">
                  <h4 className="font-medium text-light-text mb-3 text-sm">Desglose por elementos según paquete contratado:</h4>
                  {loading ? (
                    <div className="space-y-2">
                      {['desarrollo', 'hosting', 'dominio', 'mailbox', 'gestion'].map((item) => (
                        <div key={`skeleton-${item}`} className="flex justify-between items-center py-2 border-b border-light-border">
                          <div className="h-3 bg-light-bg-tertiary rounded w-24 animate-pulse"></div>
                          <div className="h-3 bg-light-bg-tertiary rounded w-20 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <BudgetItem label="Desarrollo" value={getDevelopmentRange(snapshots)} />
                      <BudgetItem label="Hosting" value={getHostingRange(snapshots)} />
                      <BudgetItem label="Dominio" value={getDomainRange(snapshots)} />
                      <BudgetItem label="Correo" value={getMailboxRange(snapshots)} />
                      <BudgetItem label="Gestión" value={getManagementRange(snapshots)} />
                      {getOtherServicesInfo(snapshots).length > 0 && (
                        <>
                          <div className="border-t border-light-border pt-2 mt-2">
                            <p className="font-medium text-light-text text-xs mb-2">Servicios Adicionales</p>
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
                {presupuestoData.metodosPago.visible !== false && (
                <div className="bg-light-bg rounded-md p-4 border border-light-border">
                  <h4 className="font-medium text-light-text mb-3 text-sm">{presupuestoData.metodosPago.titulo}:</h4>
                  <ul className="space-y-1 text-sm text-light-text-secondary">
                    {presupuestoData.metodosPago.opciones.map((metodo) => (
                      <li key={`pago-${metodo.nombre.replaceAll(' ', '-')}`} className="flex items-center gap-2">
                        <span className="text-light-success">✓</span> {metodo.nombre} {metodo.descripcion && `(${metodo.descripcion})`}
                      </li>
                    ))}
                  </ul>
                </div>
                )}
              </div>
            </div>
            )}

            {/* Cronograma */}
            {presupuestoData.cronograma.visible !== false && (
            <div className="bg-light-bg-secondary rounded-md p-6 border border-light-border">
              <div className="flex items-center gap-2 mb-5">
                <FaCalendarAlt className="text-light-accent text-xl" />
                <h3 className="text-xl font-semibold text-light-text">{presupuestoData.cronograma.titulo}</h3>
              </div>
              
              {presupuestoData.cronograma.duracionTotal && (
                <p className="text-sm text-light-text-secondary mb-4">
                  <strong>Duración estimada:</strong> {presupuestoData.cronograma.duracionTotal}
                </p>
              )}

              <div className="space-y-4">
                <div className="bg-light-bg rounded-md p-4 border border-light-border">
                  {presupuestoData.cronograma.fases.map((fase, index) => (
                    <div key={`fase-${fase.nombre.replaceAll(' ', '-')}`} className={`flex items-start gap-3 ${index < presupuestoData.cronograma.fases.length - 1 ? 'mb-5' : ''}`}>
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-light-accent text-white text-sm font-semibold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-light-text text-sm">{fase.nombre} ({fase.descripcion})</h4>
                        <p className="text-xs text-light-text-secondary mt-1">
                          {fase.entregables.map((entregable, i) => (
                            <span key={`entregable-${entregable.replaceAll(' ', '-')}`}>
                              {i > 0 && ' | '}Semana {i + 1}: {entregable}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-light-warning/10 border-l-2 border-light-warning rounded-md p-3">
                  <p className="text-xs text-light-text">
                    <strong>📌 Nota importante:</strong> Todas las fechas son estimadas y pueden variar según disponibilidad de recursos del cliente.
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>

          
        </motion.div>
      </div>
    </section>
  )
}

function BudgetItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-light-border">
      <span className="text-light-text-secondary text-sm">{label}</span>
      <span className="font-medium text-light-text text-sm">{value}</span>
    </div>
  )
}
