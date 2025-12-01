'use client'

import { motion } from 'framer-motion'
import { FaCalendarAlt, FaDollarSign, FaClock, FaCheck } from 'react-icons/fa'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import { 
  getPaquetesDesglose,
  type PaqueteDesglose
} from '@/lib/utils/priceRangeCalculator'
import type { PresupuestoCronogramaData } from '@/lib/types'

interface PresupuestoYCronogramaProps {
  readonly data?: PresupuestoCronogramaData
}

// Componente para renderizar una card de paquete
interface PaqueteCardProps {
  readonly paquete: PaqueteDesglose
  readonly caracteristicas: string[]
}

function PaqueteCard({ paquete, caracteristicas }: PaqueteCardProps) {
  return (
    <div className="bg-light-bg-secondary rounded-lg border border-light-border overflow-hidden flex flex-col h-full">
      {/* Header del paquete */}
      <div className="p-4 bg-light-bg-tertiary/30 border-b border-light-border">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xl">{paquete.emoji}</span>
          <h4 className="text-lg font-semibold text-light-text">{paquete.nombre}</h4>
          <span className="text-xs text-light-accent flex items-center gap-1">
            • <FaClock /> {paquete.tiempoEntrega || 'Consultar'}
          </span>
        </div>
        {paquete.tagline && (
          <p className="text-xs text-light-text-secondary italic">&quot;{paquete.tagline}&quot;</p>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex-grow space-y-4">
        {/* Servicios Base */}
        {paquete.serviciosBase.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-light-text-secondary uppercase mb-2">Servicios Base</p>
            <div className="space-y-1">
              {paquete.serviciosBase.map((srv) => (
                <div key={srv.nombre} className="flex justify-between items-center text-sm">
                  <span className="text-light-text flex items-center gap-1">
                    <FaCheck className="text-light-success text-xs" /> {srv.nombre}
                  </span>
                  <span className="text-light-text-secondary">
                    ${srv.precio}/mes <span className="text-xs">({srv.mesesPago}m)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios Opcionales */}
        {paquete.serviciosOpcionales.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-light-text-secondary uppercase mb-2">Servicios Opcionales</p>
            <div className="space-y-1">
              {paquete.serviciosOpcionales.map((srv) => (
                <div key={srv.nombre} className="flex justify-between items-center text-sm">
                  <span className="text-light-text-secondary flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border border-light-border inline-block"></span> {srv.nombre}
                  </span>
                  <span className="text-light-text-secondary">
                    ${srv.precio}{srv.mesesPago ? `/mes (${srv.mesesPago}m)` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Características Incluidas */}
        {caracteristicas.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-light-text-secondary uppercase mb-2">Características Incluidas</p>
            <ul className="space-y-1">
              {caracteristicas.map((car, idx) => (
                <li key={`car-${idx}`} className="text-sm text-light-text flex items-start gap-2">
                  <FaCheck className="text-light-success text-xs mt-1 flex-shrink-0" />
                  <span>{car}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer con precios */}
      <div className="p-4 bg-light-success/5 border-t border-light-border mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-light-text-secondary">Desarrollo:</span>
          <span className="text-lg font-bold text-light-accent">${paquete.desarrollo.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-light-text">Total Inicial:</span>
          <span className="text-xl font-bold text-light-success">${paquete.costoInicial.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default function PresupuestoYCronograma({ data }: PresupuestoYCronogramaProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const presupuestoData = data
  const { snapshots, loading } = useSnapshots()
  
  // Obtener datos dinámicos de los paquetes activos
  const paquetes = getPaquetesDesglose(snapshots)

  // Función para obtener características de un paquete
  const getCaracteristicas = (nombrePaquete: string): string[] => {
    return presupuestoData.caracteristicasPorPaquete?.[nombrePaquete] || []
  }

  return (
    <section id="presupuesto" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-6xl mx-auto">
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

          {/* Presupuesto - Cards de Paquetes Dinámicos */}
          {presupuestoData.presupuesto.visible !== false && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <FaDollarSign className="text-light-success text-xl" />
                <h3 className="text-xl font-semibold text-light-text">{presupuestoData.presupuesto.titulo}</h3>
              </div>
              
              {presupuestoData.presupuesto.descripcion && (
                <p className="text-sm text-light-text-secondary mb-6">{presupuestoData.presupuesto.descripcion}</p>
              )}

              {/* Loading skeleton */}
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={`skeleton-${i}`} className="bg-light-bg-secondary rounded-lg border border-light-border p-4 animate-pulse">
                      <div className="h-6 bg-light-bg-tertiary rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-light-bg-tertiary rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-light-bg-tertiary rounded w-2/3 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-light-bg-tertiary rounded"></div>
                        <div className="h-3 bg-light-bg-tertiary rounded"></div>
                        <div className="h-3 bg-light-bg-tertiary rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paquetes.length === 0 ? (
                <div className="bg-light-warning/10 border border-light-warning/30 rounded-md p-4 text-center">
                  <p className="text-sm text-light-text-secondary">No hay paquetes configurados</p>
                </div>
              ) : (
                /* Cards de Paquetes */
                <div className={`grid gap-6 ${paquetes.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : paquetes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                  {paquetes.map((paq) => (
                    <PaqueteCard 
                      key={paq.id} 
                      paquete={paq} 
                      caracteristicas={getCaracteristicas(paq.nombre)} 
                    />
                  ))}
                </div>
              )}

              {/* Nota importante */}
              {presupuestoData.presupuesto.notaImportante && (
                <div className="mt-6 bg-light-warning/10 border-l-2 border-light-warning rounded-md p-3">
                  <p className="text-xs text-light-text">
                    <strong>📌 Nota importante:</strong> {presupuestoData.presupuesto.notaImportante}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cronograma */}
          {presupuestoData.cronograma.visible !== false && (
            <div className="bg-light-bg-secondary rounded-md p-6 border border-light-border mb-10">
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
                        <h4 className="font-medium text-light-text text-sm">
                          {fase.nombre} ({fase.descripcion})
                          {fase.duracionDias > 0 && (
                            <span className="text-light-accent ml-2">• 📅 {fase.duracionDias} días</span>
                          )}
                        </h4>
                        <p className="text-xs text-light-text-secondary mt-1">
                          {fase.entregables.map((entregable, i) => (
                            <span key={`entregable-${entregable.replaceAll(' ', '-')}`}>
                              {i > 0 && ' | '}{entregable}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-light-warning/10 border-l-2 border-light-warning rounded-md p-3">
                  <p className="text-xs text-light-text">
                    <strong>📌 Nota importante:</strong> Este cronograma corresponde al paquete de mayor complejidad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Métodos de Pago - Sección Independiente */}
          {presupuestoData.metodosPago?.visible !== false && (
          <div className="bg-light-bg-secondary rounded-md p-6 border border-light-border">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">💳</span>
              <h3 className="text-xl font-semibold text-light-text">{presupuestoData.metodosPago?.titulo || 'Métodos de Pago'}</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {presupuestoData.metodosPago?.opciones?.map((metodo) => (
                <div key={`pago-${metodo.nombre.replaceAll(' ', '-')}`} className="bg-light-bg rounded-md p-4 border border-light-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-light-success text-lg">✓</span>
                    <span className="font-medium text-light-text text-sm">{metodo.nombre}</span>
                  </div>
                  {metodo.porcentaje && (
                    <p className="text-xs text-light-accent font-semibold">{metodo.porcentaje}%</p>
                  )}
                  {metodo.descripcion && (
                    <p className="text-xs text-light-text-secondary mt-1">{metodo.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}
          
        </motion.div>
      </div>
    </section>
  )
}
