'use client'

import { motion } from 'framer-motion'
import { FaCalendarAlt, FaDollarSign, FaClock, FaCheck } from 'react-icons/fa'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import { 
  getPaquetesDesglose,
  type PaqueteDesglose
} from '@/lib/utils/priceRangeCalculator'
import type { PresupuestoCronogramaData } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { 
  fluentSlideUp,
  fluentStaggerContainer, 
  fluentStaggerItem
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

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
    <FluentGlass
      variant="normal"
      className="rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-lg transition-all"
    >
      {/* Header del paquete */}
      <div className="p-5 bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary/50 border-b border-light-border/50">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <motion.span 
            className="text-2xl"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={spring.fluent}
          >
            {paquete.emoji}
          </motion.span>
          <h4 className="text-lg font-semibold text-light-text">{paquete.nombre}</h4>
          <span className="text-xs text-light-accent flex items-center gap-1 bg-light-accent/10 px-2 py-0.5 rounded-full">
            <FaClock size={10} /> {paquete.tiempoEntrega || 'Consultar'}
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
      <div className="p-5 bg-gradient-to-r from-light-success/10 to-emerald-500/5 border-t border-light-border/50 mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-light-text-secondary">Desarrollo:</span>
          <span className="text-lg font-bold text-light-accent">${paquete.desarrollo.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-light-text">Total Inicial:</span>
          <motion.span 
            className="text-xl font-bold text-light-success"
            whileHover={{ scale: 1.05 }}
            transition={spring.fluent}
          >
            ${paquete.costoInicial.toLocaleString()}
          </motion.span>
        </div>
      </div>
    </FluentGlass>
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
    <FluentSection
      id="presupuesto"
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg to-white"
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
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-success to-emerald-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaDollarSign className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {presupuestoData.titulo}
          </h2>
          <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
            {presupuestoData.subtitulo}
          </p>
        </motion.div>

        {/* Presupuesto - Cards de Paquetes Dinámicos */}
        {presupuestoData.presupuesto?.visible !== false && (
          <motion.div 
            className="mb-6"
            variants={fluentSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport.default}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-light-success/20 to-emerald-500/10 rounded-xl">
                <FaDollarSign className="text-light-success text-lg" />
              </div>
              <h3 className="text-xl font-semibold text-light-text">{presupuestoData.presupuesto?.titulo}</h3>
            </div>
            
            {presupuestoData.presupuesto?.descripcion && (
              <p className="text-sm text-light-text-secondary mb-6">{presupuestoData.presupuesto?.descripcion}</p>
            )}

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={`skeleton-${i}`} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-light-border/50 p-5 animate-pulse">
                    <div className="h-6 bg-light-bg-tertiary rounded-lg w-3/4 mb-4"></div>
                    <div className="h-4 bg-light-bg-tertiary rounded-lg w-1/2 mb-2"></div>
                    <div className="h-4 bg-light-bg-tertiary rounded-lg w-2/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-light-bg-tertiary rounded-lg"></div>
                      <div className="h-3 bg-light-bg-tertiary rounded-lg"></div>
                      <div className="h-3 bg-light-bg-tertiary rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paquetes.length === 0 ? (
              <div className="bg-light-warning/10 border border-light-warning/30 rounded-xl p-5 text-center backdrop-blur-sm">
                <p className="text-sm text-light-text-secondary">No hay paquetes configurados</p>
              </div>
            ) : (
              /* Cards de Paquetes */
              <motion.div 
                className={`grid gap-6 ${paquetes.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : paquetes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}
                variants={fluentStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewport.default}
              >
                {paquetes.map((paq) => (
                  <PaqueteCard 
                    key={paq.id} 
                    paquete={paq} 
                    caracteristicas={getCaracteristicas(paq.nombre)} 
                  />
                ))}
              </motion.div>
            )}

            {/* Nota importante */}
            {presupuestoData.presupuesto?.notaImportante && (
              <motion.div 
                className="mt-6 bg-gradient-to-r from-light-warning/10 to-amber-500/5 border-l-4 border-light-warning rounded-xl p-4 backdrop-blur-sm"
                whileHover={{ x: 4 }}
                transition={spring.fluent}
              >
                <p className="text-sm text-light-text">
                  <strong>📌 Nota importante:</strong> {presupuestoData.presupuesto?.notaImportante}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Cronograma */}
        {presupuestoData.cronograma.visible !== false && (
          <FluentReveal className="mb-6">
            <FluentGlass
              variant="normal"
              className="rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-light-accent/20 to-blue-500/10 rounded-xl">
                  <FaCalendarAlt className="text-light-accent text-lg" />
                </div>
                <h3 className="text-xl font-semibold text-light-text">{presupuestoData.cronograma.titulo}</h3>
              </div>
              
              {presupuestoData.cronograma.duracionTotal && (
                <p className="text-sm text-light-text-secondary mb-4">
                  <strong>Duración estimada:</strong> {presupuestoData.cronograma.duracionTotal}
                </p>
              )}

            <div className="space-y-4">
              <motion.div 
                className="bg-gradient-to-br from-light-bg-secondary to-white rounded-xl p-5 border border-light-border/50"
                variants={fluentStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewport.default}
              >
                {presupuestoData.cronograma.fases.map((fase, index) => (
                  <motion.div 
                    key={`fase-${fase.nombre.replaceAll(' ', '-')}`} 
                    className={`flex items-start gap-4 ${index < presupuestoData.cronograma.fases.length - 1 ? 'mb-5 pb-5 border-b border-light-border/30' : ''}`}
                    variants={fluentStaggerItem}
                  >
                    <div className="flex-shrink-0">
                      <motion.div 
                        className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-light-accent to-blue-600 text-white text-sm font-semibold shadow-md"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={spring.fluent}
                      >
                        {index + 1}
                      </motion.div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-light-text text-sm">
                        {fase.nombre} ({fase.descripcion})
                        {fase.duracionDias > 0 && (
                          <span className="text-light-accent ml-2 bg-light-accent/10 px-2 py-0.5 rounded-full text-xs">📅 {fase.duracionDias} días</span>
                        )}
                      </h4>
                      <p className="text-xs text-light-text-secondary mt-1.5">
                        {fase.entregables.map((entregable, i) => (
                          <span key={`entregable-${entregable.replaceAll(' ', '-')}`}>
                            {i > 0 && ' | '}{entregable}
                          </span>
                        ))}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-light-warning/10 to-amber-500/5 border-l-4 border-light-warning rounded-xl p-4"
                whileHover={{ x: 4 }}
                transition={spring.fluent}
              >
                <p className="text-sm text-light-text">
                  <strong>📌 Nota importante:</strong> Este cronograma corresponde al paquete de mayor complejidad.
                </p>
              </motion.div>
            </div>
          </FluentGlass>
        </FluentReveal>
        )}
      </div>
    </FluentSection>
  )
}
