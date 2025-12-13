'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaArrowRight, FaFileAlt } from 'react-icons/fa'
import type { ResumenEjecutivoTextos, VisibilidadConfig } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { 
  fluentStaggerContainer, 
  fluentStaggerItem
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

interface ResumenEjecutivoProps {
  readonly data?: ResumenEjecutivoTextos
  readonly visibilidad?: VisibilidadConfig
  readonly nombreCliente?: string
  readonly nombreProveedor?: string
}

export default function ResumenEjecutivo({ data, visibilidad, nombreCliente = 'Urbanísima Constructora S.R.L', nombreProveedor = 'DGTECNOVA' }: ResumenEjecutivoProps) {
  // Si no hay datos, no renderizar nada
  if (!data) {
    return null
  }

  // Usar datos de BD
  const introduccion = data.parrafoIntroduccion || ''
  const beneficios = data.beneficiosPrincipales || []
  const diferencias = data.diferenciasClave?.items || []
  const modeloBeneficios = data.diferenciasClave?.beneficiosModelo || []
  const responsabilidades = data.responsabilidadesProveedor || { contenido: [], tecnico: [], comunicacion: [] }
  const clienteNoHace = data.clienteNoHace || []
  const flujoComunicacion = data.flujoComunicacion || []

  // Helpers para visibilidad (default: visible)
  const isVisible = (key: keyof VisibilidadConfig) => visibilidad?.[key] !== false

  return (
    <FluentSection
      id="resumen"
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-white to-light-bg"
    >
      <div className="max-w-6xl mx-auto">
        {/* Título e Introducción (controlados por tituloSeccion) */}
        {isVisible('tituloSeccion') && (
          <motion.div 
            className="text-center mb-6"
            variants={fluentStaggerItem}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-accent/20 to-light-accent/5 backdrop-blur-sm rounded-2xl mb-4 border border-light-accent/20"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <FaFileAlt className="text-light-accent" size={24} />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {data?.tituloSeccion || 'Presentación del Proyecto'}
            </h2>
            {data?.subtitulo && (
              <p className="text-sm text-light-text-muted mb-2">
                {data.subtitulo}
              </p>
            )}
            <p className="text-sm text-light-text-secondary max-w-3xl mx-auto leading-relaxed">
              {introduccion}
            </p>
          </motion.div>
        )}

        {/* Beneficios Principales */}
        {isVisible('beneficiosPrincipales') && (
          <FluentRevealGroup className="mb-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {beneficios.map((benefit, index) => (
                <FluentRevealItem key={`benefit-${benefit.slice(0, 30).replaceAll(' ', '-')}-${index}`}>
                  <FluentGlass
                    variant="subtle"
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-light-success/5 to-light-success/10 rounded-xl border border-light-success/20 hover:border-light-success/40 h-full"
                  >
                    <FaCheckCircle className="text-light-success flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-light-text leading-relaxed">{benefit}</span>
                  </FluentGlass>
                </FluentRevealItem>
              ))}
            </div>
          </FluentRevealGroup>
        )}

        {/* Párrafo Paquetes */}
        {isVisible('parrafoPaquetes') && (
          <FluentReveal className="mb-6">
            <FluentGlass variant="subtle" className="p-5 rounded-2xl">
              <p className="text-sm text-light-text-secondary leading-relaxed">
                {data?.parrafoPaquetes || 'La propuesta está diseñada en 3 paquetes de inversión para que elijas según tus necesidades y presupuesto, todas con calidad profesional garantizada.'}
              </p>
            </FluentGlass>
          </FluentReveal>
        )}

        {/* Diferencias Claves */}
        {isVisible('diferenciasClave') && (
          <FluentReveal className="mb-6">
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary px-6 py-4 border-b border-light-border/50">
                <h3 className="text-sm font-semibold text-light-text uppercase tracking-wide">
                  {data?.diferenciasClave?.tituloSeccion || 'Diferencias Clave'}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-light-text-secondary mb-5 leading-relaxed">
                  {data?.diferenciasClave?.parrafoIntroduccion || 'A diferencia de otras propuestas donde el cliente gestiona su propio sitio, en este caso has solicitado que nosotros nos encargamos de toda la administración y gestión del sitio web.'}
                </p>
                
                <motion.div 
                  className="space-y-3 mb-6"
                  variants={fluentStaggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport.default}
                >
                  {diferencias.map((item, index) => (
                    <motion.div 
                      key={`dif-${item.slice(0, 30).replaceAll(' ', '-')}-${index}`} 
                      className="flex items-start gap-3 text-sm"
                      variants={fluentStaggerItem}
                    >
                      <FaCheckCircle className="text-light-success flex-shrink-0 mt-0.5" size={14} />
                      <span className="text-light-text">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="pt-5 border-t border-light-border/50">
                  <p className="text-xs font-semibold text-light-text-secondary uppercase tracking-wide mb-4">
                    Beneficios del modelo
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modeloBeneficios.map((benefit, index) => (
                      <motion.span 
                        key={`modelo-${benefit.slice(0, 20).replaceAll(' ', '-')}-${index}`} 
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-light-accent/10 to-light-accent/5 text-light-accent text-xs font-medium rounded-full border border-light-accent/20"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={spring.fluent}
                      >
                        {benefit}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </FluentGlass>
          </FluentReveal>
        )}

        {/* Responsabilidades Grid */}
        <FluentRevealGroup className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Lo que NOSOTROS hacemos */}
          {isVisible('responsabilidadesProveedor') && (
            <FluentRevealItem>
              <FluentGlass
                variant="normal"
                className="rounded-2xl overflow-hidden h-full"
              >
                <div className="bg-gradient-to-r from-light-success/10 to-light-success/5 px-6 py-4 border-b border-light-success/20">
                  <h3 className="text-sm font-semibold text-light-success flex items-center gap-2">
                    <FaCheckCircle size={16} />
                    Nosotros nos encargamos de
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {[
                      ...responsabilidades.contenido,
                      ...responsabilidades.tecnico,
                      ...responsabilidades.comunicacion,
                    ].map((item, index) => (
                      <motion.li 
                        key={`resp-${item.slice(0, 30).replaceAll(' ', '-')}-${index}`} 
                        className="flex items-start gap-3 text-sm text-light-text"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <span className="text-light-success mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FluentGlass>
            </FluentRevealItem>
          )}

          {/* Lo que el cliente NO hace */}
          {isVisible('clienteNoHace') && (
            <FluentRevealItem>
              <FluentGlass
                variant="normal"
                className="rounded-2xl overflow-hidden h-full"
              >
                <div className="bg-gradient-to-r from-light-danger/10 to-light-danger/5 px-6 py-4 border-b border-light-danger/20">
                  <h3 className="text-sm font-semibold text-light-danger flex items-center gap-2">
                    <FaTimesCircle size={16} />
                    No tienes que preocuparte de
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {clienteNoHace.map((item, index) => (
                      <motion.li 
                        key={`nohace-${item.slice(0, 30).replaceAll(' ', '-')}-${index}`} 
                        className="flex items-start gap-3 text-sm text-light-text"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <span className="text-light-danger mt-0.5 flex-shrink-0">✕</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </FluentGlass>
            </FluentRevealItem>
          )}
        </FluentRevealGroup>

        {/* Flujo de Comunicación */}
        {isVisible('flujoComunicacion') && (
          <FluentReveal>
            <FluentGlass
              variant="normal"
              className="rounded-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary px-6 py-4 border-b border-light-border/50">
                <h3 className="text-sm font-semibold text-light-text uppercase tracking-wide">
                  Flujo de Comunicación
                </h3>
                <p className="text-xs text-light-text-muted mt-1">
                  Proceso simple y transparente de gestión de cambios
                </p>
              </div>
              <div className="p-6">
                <motion.div 
                  className="space-y-5"
                  variants={fluentStaggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport.default}
                >
                  {flujoComunicacion.map((step, index) => (
                    <motion.div
                      key={`flujo-${step.paso}-${step.titulo.slice(0, 20).replaceAll(' ', '-')}`}
                      variants={fluentStaggerItem}
                      className="flex items-start gap-4"
                    >
                      {/* Número de paso */}
                      <motion.div 
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold text-white shadow-lg ${
                          step.actor === 'cliente' 
                            ? 'bg-gradient-to-br from-light-accent to-blue-600' 
                            : 'bg-gradient-to-br from-light-success to-emerald-600'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={spring.fluent}
                      >
                        {step.paso}
                      </motion.div>
                      
                      {/* Contenido */}
                      <div className="flex-1 pb-5 border-b border-light-border/30 last:border-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-lg">{step.icono}</span>
                          <h4 className="text-sm font-semibold text-light-text">{step.titulo}</h4>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            step.actor === 'cliente' 
                              ? 'bg-light-accent/10 text-light-accent border border-light-accent/20' 
                              : 'bg-light-success/10 text-light-success border border-light-success/20'
                          }`}>
                            {step.actor === 'cliente' ? nombreCliente : nombreProveedor}
                          </span>
                        </div>
                        <p className="text-sm text-light-text-secondary leading-relaxed">{step.descripcion}</p>
                      </div>
                      
                      {/* Flecha */}
                      {index < flujoComunicacion.length - 1 && (
                        <FaArrowRight className="text-light-border-muted hidden md:block mt-3" size={12} />
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 mt-6 pt-5 border-t border-light-border/50">
                  <div className="flex items-center gap-2 text-xs text-light-text-secondary">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-light-accent to-blue-600" />
                    Cliente ({nombreCliente})
                  </div>
                  <div className="flex items-center gap-2 text-xs text-light-text-secondary">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-light-success to-emerald-600" />
                    Nosotros ({nombreProveedor})
                  </div>
                </div>
              </div>
            </FluentGlass>
          </FluentReveal>
        )}
      </div>
    </FluentSection>
  )
}
