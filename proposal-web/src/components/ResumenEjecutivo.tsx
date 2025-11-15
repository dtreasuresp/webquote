'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaShieldAlt, FaClock, FaUsers } from 'react-icons/fa'

export default function ResumenEjecutivo() {
  return (
    <section id="resumen" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Presentación del proyecto
          </h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Tenemos el placer de presentar esta propuesta profesional para el desarrollo de tu sitio web corporativo. Luego de analizar detalladamente tus respuestas del cuestionario y las necesidades específicas de Urbanísima Constructora S.R.L, ofrecemos una <strong className="text-primary">solución dinámica</strong> que te permitirá:
            </p>

            {/* Beneficios Principales */}
            <div className="grid md:grid-cols-2 gap-6 my-12">
              {[
                'Mostrar profesionalmente tu catálogo de 10 servicios/productos',
                'Actualizar contenido fácilmente sin necesidad de programador',
                'Posicionarte como empresa confiable en tu sector',
                'Captar clientes a través de WhatsApp, llamadas y contactos',
                'Administrar todo desde un panel intuitivo',
                'Crecer sin limitaciones técnicas',
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-accent/10 p-4 rounded-lg border-l-4 border-accent"
                >
                  <FaCheckCircle className="text-accent flex-shrink-0" size={20} />
                  <span className="text-secondary">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <p className="text-lg text-gray-700 mb-6">
              La propuesta está diseñada en <strong className="text-primary">3 paquetes de inversión</strong> para que elijas según tus necesidades y presupuesto, todas con calidad profesional garantizada.
            </p>

            {/* Diferencias Claves */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-l-8 border-primary p-8 rounded-lg my-12">
              <h3 className="text-2xl font-bold mb-6 text-secondary">
                DIFERENCIAS CLAVES
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                A diferencia de otras propuestas donde el cliente gestiona su propio sitio, en este caso has solicitado que <strong className="text-primary">nosotros nos encargamos de toda la administración y gestión del sitio web</strong>. Esto significa que:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  '✅ El cliente accede al panel administrativo con permisos limitados',
                  '✅ El cliente puede solicitar cambios vía email, WhatsApp o llamada',
                  '✅ El proveedor realiza las actualizaciones y te informa su finalización',
                  '✅ El cliente ve el sitio web público para verificar los cambios',
                  '✅ Se garantiza máxima seguridad y profesionalismo',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-secondary font-semibold">
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-lg text-gray-700 mb-4">Este modelo es:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  '🔴 Más seguro',
                  '🔴 Ofrece mejor mantenimiento',
                  '🟠 Permite mayor flexibilidad',
                  '🟠 Asegura actualizaciones constantes',
                  '🟡 Facilita la gestión de cambios',
                  '🟡 Reduce la carga del cliente',
                  '🟢 Mejora la experiencia del usuario final',
                  '🟢 Aumenta la satisfacción del cliente',
                ].map((benefit, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm text-secondary font-medium">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* Responsabilidades */}

            <p className="text-lg text-gray-700 mb-6">
              Teniendo en cuenta lo anterior, las <strong className="text-primary">responsabilidades</strong> de ambas partes son las siguientes:
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-12">
              
              {/* Lo que NOSOTROS hacemos */}
              <div className="bg-accent/10 p-8 rounded-2xl border-2 border-accent">
                <h3 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                  <FaCheckCircle className="text-accent" />
                  NOSOTROS NOS ENCARGAMOS DE:
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-secondary mb-3">Todo el contenido:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>✓ Actualizar productos/servicios</li>
                      <li>✓ Cambiar precios y disponibilidad</li>
                      <li>✓ Agregar nuevas fotos</li>
                      <li>✓ Subir videos entregados por el cliente o escogidos</li>
                      <li>✓ Escribir o publicar artículos de blog</li>
                      <li>✓ Actualizar información de contacto</li>
                      <li>✓ Cambiar banners y promociones</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-secondary mb-3">La parte técnica:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>✓ Actualizaciones de la plataforma web</li>
                      <li>✓ Actualizaciones de componentes</li>
                      <li>✓ Salvas automáticas</li>
                      <li>✓ Seguridad y monitoreo</li>
                      <li>✓ Corrección de errores técnicos</li>
                      <li>✓ Optimización de velocidad</li>
                      <li>✓ Configuración de SEO para que te encuentren en internet</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-secondary mb-3">Comunicarnos contigo:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>✓ Reporte de los cambios realizados cuando no son iniciados por ti</li>
                      <li>✓ Sugerencias de mejoras</li>
                      <li>✓ Análisis de tráfico y conversiones</li>
                      <li>✓ Respondemos en un plazo de 30 minutos hasta 6 horas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lo que el cliente NO hace */}
              <div className="bg-primary/10 p-8 rounded-2xl border-2 border-primary">
                <h3 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                  <span>❌</span>
                  NO TIENES QUE PREOCUPARTE DE:
                </h3>
                
                <ul className="space-y-3 text-gray-700">
                  <li>❌ Ingresar al panel administrativo, a menos que sea para demostraciones o control de negocios</li>
                  <li>❌ Instalar complementos</li>
                  <li>❌ Hacer salvas</li>
                  <li>❌ Actualizar la plataforma</li>
                  <li>❌ Preocuparte de la seguridad</li>
                  <li>❌ Tomar decisiones técnicas</li>
                </ul>
              </div>
            </div>

            {/* Flujo de Comunicación */}
            <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-8 md:p-12 rounded-2xl border-2 border-accent my-12">
              <h3 className="text-3xl font-bold mb-4 text-center text-secondary">
                FLUJO DE COMUNICACIÓN CLIENTE - PROVEEDOR
              </h3>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Proceso simple y transparente de gestión de cambios
              </p>
              
              {/* Timeline Container */}
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {/* Barra vertical dorada */}
                  <div className="absolute left-8 md:left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent to-accent"></div>
                  
                  {/* Steps */}
                  <div className="space-y-8">
                    <TimelineStep 
                      step={1}
                      icon="👤"
                      title="Solicitud de un cambio"
                      description="Quiero agregar un nuevo servicio con estas fotos"
                      color="primary"
                      delay={0}
                    />
                    <TimelineStep 
                      step={2}
                      icon="📧"
                      title="Recepción del cambio"
                      description="Recibimos el email, WhatsApp o tu llamada y confirmamos"
                      color="accent"
                      delay={0.1}
                    />
                    <TimelineStep 
                      step={3}
                      icon="🔧"
                      title="Acceso al sistema"
                      description="Entramos al panel administrativo"
                      color="accent"
                      delay={0.2}
                    />
                    <TimelineStep 
                      step={4}
                      icon="✏️"
                      title="Edición"
                      description="Agregamos el servicio, fotos y contenido solicitado por ti"
                      color="accent"
                      delay={0.3}
                    />
                    <TimelineStep 
                      step={5}
                      icon="🎯"
                      title="Optimización SEO"
                      description="Optimizamos el contenido para que los buscadores en internet lo encuentren"
                      color="accent"
                      delay={0.4}
                    />
                    <TimelineStep 
                      step={6}
                      icon="✅"
                      title="Notificación"
                      description="Te notificamos cuando el trabajo esté listo y publicado"
                      color="accent"
                      delay={0.5}
                    />
                    <TimelineStep 
                      step={7}
                      icon="🎉"
                      title="Cliente verifica"
                      description="Vas al sitio actualizado en vivo y confirmas si estás de acuerdo"
                      color="primary"
                      delay={0.6}
                    />
                  </div>
                </div>
              </div>

              {/* Leyenda */}
              <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="text-sm font-semibold text-gray-700">Cliente (Urbanísima Constructora S.R.L)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-accent"></div>
                  <span className="text-sm font-semibold text-gray-700">Nosotros (DGTECNOVA)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TimelineStep({ 
  step, 
  icon, 
  title, 
  description, 
  color, 
  delay 
}: { 
  step: number; 
  icon: string; 
  title: string; 
  description: string; 
  color: string; 
  delay: number 
}) {
  const colorClasses = 
    color === 'primary'
      ? 'border-primary bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15' 
      : color === 'accent'
      ? 'border-accent bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/15'
      : 'border-secondary bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/15'

  const badgeClasses = 
    color === 'primary'
      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
      : color === 'accent'
      ? 'bg-accent text-white shadow-lg shadow-accent/30'
      : 'bg-secondary text-white shadow-lg shadow-secondary/30'

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="relative flex items-start gap-6 pl-16 md:pl-24"
    >
      {/* Badge numerado sobre la barra */}
      <div className={`${badgeClasses} w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl absolute left-2 md:left-6 top-0 z-10 ring-4 ring-white`}>
        {step}
      </div>

      {/* Card del paso */}
      <div className={`${colorClasses} border-2 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex-1 bg-white`}>
        <div className="flex items-start gap-4">
          <div className="text-5xl flex-shrink-0">{icon}</div>
          <div className="flex-1">
            <h4 className="font-bold text-secondary text-lg mb-2">{title}</h4>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
