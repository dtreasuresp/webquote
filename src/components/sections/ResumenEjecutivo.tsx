'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle, FaArrowRight, FaFileAlt } from 'react-icons/fa'
import type { ResumenEjecutivoTextos, VisibilidadConfig } from '@/lib/types'

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
    <section id="resumen" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Título e Introducción (controlados por tituloSeccion) */}
          {isVisible('tituloSeccion') && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-light-info-bg rounded-full mb-4">
                <FaFileAlt className="text-light-accent" size={20} />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
                {data?.tituloSeccion || 'Presentación del Proyecto'}
              </h2>
              {data?.subtitulo && (
                <p className="text-sm text-light-text-muted mb-2">
                  {data.subtitulo}
                </p>
              )}
              <p className="text-sm text-light-text-secondary max-w-3xl mx-auto">
                {introduccion}
              </p>
            </div>
          )}

          {/* Beneficios Principales */}
          {isVisible('beneficiosPrincipales') && (
            <div className="mb-12">
              <div className="grid sm:grid-cols-2 gap-3">
                {beneficios.map((benefit, index) => (
                  <motion.div
                    key={`benefit-${benefit.slice(0, 30).replaceAll(' ', '-')}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-4 bg-light-success-bg/50 rounded-md border border-light-success/20"
                  >
                    <FaCheckCircle className="text-light-success flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-sm text-light-text">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Párrafo Paquetes */}
          {isVisible('parrafoPaquetes') && (
            <div className="mb-12 p-4 bg-light-bg-secondary rounded-md border border-light-border">
              <p className="text-sm text-light-text-secondary">
                {data?.parrafoPaquetes || 'La propuesta está diseñada en 3 paquetes de inversión para que elijas según tus necesidades y presupuesto, todas con calidad profesional garantizada.'}
              </p>
            </div>
          )}

          {/* Diferencias Claves */}
          {isVisible('diferenciasClave') && (
            <div className="mb-12 rounded-lg border border-light-border overflow-hidden">
              <div className="bg-light-bg-secondary px-5 py-3 border-b border-light-border">
                <h3 className="text-sm font-semibold text-light-text uppercase tracking-wide">
                  {data?.diferenciasClave?.tituloSeccion || 'Diferencias Clave'}
                </h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-light-text-secondary mb-4">
                  {data?.diferenciasClave?.parrafoIntroduccion || 'A diferencia de otras propuestas donde el cliente gestiona su propio sitio, en este caso has solicitado que nosotros nos encargamos de toda la administración y gestión del sitio web.'}
                </p>
                
                <div className="space-y-2 mb-6">
                  {diferencias.map((item, index) => (
                    <div key={`dif-${item.slice(0, 30).replaceAll(' ', '-')}-${index}`} className="flex items-start gap-2 text-sm">
                      <FaCheckCircle className="text-light-success flex-shrink-0 mt-0.5" size={14} />
                      <span className="text-light-text">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-light-border">
                  <p className="text-xs font-semibold text-light-text-secondary uppercase tracking-wide mb-3">
                    Beneficios del modelo
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modeloBeneficios.map((benefit, index) => (
                      <span 
                        key={`modelo-${benefit.slice(0, 20).replaceAll(' ', '-')}-${index}`} 
                        className="inline-flex items-center px-2.5 py-1 bg-light-info-bg text-light-accent text-xs font-medium rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Responsabilidades Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Lo que NOSOTROS hacemos */}
            {isVisible('responsabilidadesProveedor') && (
              <div className="rounded-lg border border-light-border overflow-hidden">
                <div className="bg-light-success-bg px-5 py-3 border-b border-light-success/20">
                  <h3 className="text-sm font-semibold text-light-success flex items-center gap-2">
                    <FaCheckCircle size={14} />
                    Nosotros nos encargamos de
                  </h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-2">
                    {[
                      ...responsabilidades.contenido,
                      ...responsabilidades.tecnico,
                      ...responsabilidades.comunicacion,
                    ].map((item, index) => (
                      <li key={`resp-${item.slice(0, 30).replaceAll(' ', '-')}-${index}`} className="flex items-start gap-2 text-sm text-light-text">
                        <span className="text-light-success mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Lo que el cliente NO hace */}
            {isVisible('clienteNoHace') && (
              <div className="rounded-lg border border-light-border overflow-hidden">
                <div className="bg-light-danger-bg px-5 py-3 border-b border-light-danger/20">
                  <h3 className="text-sm font-semibold text-light-danger flex items-center gap-2">
                    <FaTimesCircle size={14} />
                    No tienes que preocuparte de
                  </h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-2">
                    {clienteNoHace.map((item, index) => (
                      <li key={`nohace-${item.slice(0, 30).replaceAll(' ', '-')}-${index}`} className="flex items-start gap-2 text-sm text-light-text">
                        <span className="text-light-danger mt-0.5">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Flujo de Comunicación */}
          {isVisible('flujoComunicacion') && (
            <div className="rounded-lg border border-light-border overflow-hidden">
              <div className="bg-light-bg-secondary px-5 py-3 border-b border-light-border">
                <h3 className="text-sm font-semibold text-light-text uppercase tracking-wide">
                  Flujo de Comunicación
                </h3>
                <p className="text-xs text-light-text-muted mt-1">
                  Proceso simple y transparente de gestión de cambios
                </p>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {flujoComunicacion.map((step, index) => (
                    <motion.div
                      key={`flujo-${step.paso}-${step.titulo.slice(0, 20).replaceAll(' ', '-')}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4"
                    >
                      {/* Número de paso */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                        step.actor === 'cliente' ? 'bg-light-accent' : 'bg-light-success'
                      }`}>
                        {step.paso}
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 pb-4 border-b border-light-border last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{step.icono}</span>
                          <h4 className="text-sm font-semibold text-light-text">{step.titulo}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            step.actor === 'cliente' 
                              ? 'bg-light-info-bg text-light-accent' 
                              : 'bg-light-success-bg text-light-success'
                          }`}>
                            {step.actor === 'cliente' ? nombreCliente : nombreProveedor}
                          </span>
                        </div>
                        <p className="text-sm text-light-text-secondary">{step.descripcion}</p>
                      </div>
                      
                      {/* Flecha */}
                      {index < flujoComunicacion.length - 1 && (
                        <FaArrowRight className="text-light-border-muted hidden md:block mt-2" size={12} />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-light-border">
                  <div className="flex items-center gap-2 text-xs text-light-text-secondary">
                    <div className="w-3 h-3 rounded-full bg-light-accent" />
                    Cliente ({nombreCliente})
                  </div>
                  <div className="flex items-center gap-2 text-xs text-light-text-secondary">
                    <div className="w-3 h-3 rounded-full bg-light-success" />
                    Nosotros ({nombreProveedor})
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
