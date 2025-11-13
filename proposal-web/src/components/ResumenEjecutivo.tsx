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
            🎯 Resumen Ejecutivo
          </h2>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Tenemos el placer de presentar esta propuesta profesional para el desarrollo de tu sitio web corporativo.
            </p>

            <p className="text-lg text-gray-700 mb-8">
              Luego de analizar detalladamente tus respuestas del cuestionario y las necesidades específicas de Urbanisma Constructora, ofrecemos una <strong className="text-primary">solución dinámica</strong> que te permitirá:
            </p>

            {/* Beneficios Principales */}
            <div className="grid md:grid-cols-2 gap-6 my-12">
              {[
                'Mostrar profesionalmente tu catálogo de 10 servicios/productos',
                'Actualizar contenido fácilmente SIN necesidad de programador',
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
                  className="flex items-start gap-3 bg-green-50 p-4 rounded-lg border-l-4 border-green-500"
                >
                  <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-800">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <p className="text-lg text-gray-700 mb-6">
              La propuesta está diseñada en <strong className="text-primary">3 opciones de inversión</strong> para que elijas según tus necesidades y presupuesto, todas con calidad profesional garantizada.
            </p>

            {/* Diferencia Clave */}
            <div className="bg-gradient-to-r from-primary/10 to-black/5 border-l-8 border-primary p-8 rounded-lg my-12">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                DIFERENCIA CLAVE
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                A diferencia de otras propuestas donde el cliente gestiona su propio sitio, en este caso:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  '✅ NOSOTROS administramos TODO el sitio web',
                  '✅ El cliente NO tendrá acceso al panel administrativo',
                  '✅ El cliente solo solicita cambios vía email o WhatsApp',
                  '✅ Nosotros realizamos las actualizaciones',
                  '✅ El cliente solo ve el sitio web público',
                  '✅ Máxima seguridad y profesionalismo',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-gray-800">
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-lg text-gray-700 mb-4">Este modelo es:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  '🟢 Más seguro (solo nosotros tenemos acceso)',
                  '🟢 Más profesional (evita errores del usuario)',
                  '🟢 Mejor mantenido (actualizaciones garantizadas)',
                  '🟢 Más confiable (soporte 24/7 de nuestro lado)',
                ].map((benefit, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm text-gray-800">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* Responsabilidades */}
            <div className="grid md:grid-cols-2 gap-8 my-12">
              {/* Lo que NOSOTROS hacemos */}
              <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-200">
                <h3 className="text-2xl font-bold mb-6 text-green-900 flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  NOSOTROS SOMOS RESPONSABLES DE:
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-green-900 mb-3">Contenidos:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>✓ Actualizar productos/servicios</li>
                      <li>✓ Cambiar precios y disponibilidad</li>
                      <li>✓ Agregar nuevas fotos</li>
                      <li>✓ Subir videos</li>
                      <li>✓ Escribir o publicar artículos de blog</li>
                      <li>✓ Actualizar información de contacto</li>
                      <li>✓ Cambiar banners y promociones</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-900 mb-3">Técnico:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>✓ Actualizaciones de la plataforma web</li>
                      <li>✓ Actualizaciones de plugins</li>
                      <li>✓ Backups automáticos</li>
                      <li>✓ Seguridad y monitoreo</li>
                      <li>✓ Corrección de errores técnicos</li>
                      <li>✓ Optimización de velocidad</li>
                      <li>✓ Configuración de SEO</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-900 mb-3">Comunicación:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>✓ Reporte mensual de cambios realizados</li>
                      <li>✓ Sugerencias de mejoras</li>
                      <li>✓ Análisis de tráfico y conversiones</li>
                      <li>✓ Respuesta a solicitudes en 24-48 horas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lo que el cliente NO hace */}
              <div className="bg-red-50 p-8 rounded-2xl border-2 border-red-200">
                <h3 className="text-2xl font-bold mb-6 text-red-900 flex items-center gap-2">
                  <span>❌</span>
                  TU NO HARÁS NINGUNA DE ESTAS TAREAS:
                </h3>
                
                <ul className="space-y-3 text-gray-700">
                  <li>❌ No ingresa al panel administrativo, a menos que sea para demostraciones o control de negocios</li>
                  <li>❌ No instala plugins</li>
                  <li>❌ No hace backups</li>
                  <li>❌ No actualiza la plataforma web</li>
                  <li>❌ No maneja seguridad</li>
                  <li>❌ No toma decisiones técnicas</li>
                </ul>
              </div>
            </div>

            {/* Flujo de Comunicación */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200 my-12">
              <h3 className="text-2xl font-bold mb-8 text-center text-gray-900">
                💬 FLUJO DE COMUNICACIÓN
              </h3>
              
              <div className="flex flex-col items-center gap-6">
                <FlowStep 
                  icon="👤"
                  label="Cliente"
                  text="Quiero agregar un nuevo servicio con estas fotos"
                  color="blue"
                />
                <Arrow />
                <FlowStep 
                  icon="📧"
                  label="Nosotros"
                  text="Recibimos el email/WhatsApp"
                  color="green"
                />
                <Arrow />
                <FlowStep 
                  icon="🔧"
                  label="Nosotros"
                  text="Entramos al panel administrativo"
                  color="green"
                />
                <Arrow />
                <FlowStep 
                  icon="✏️"
                  label="Nosotros"
                  text="Agregamos el servicio, fotos y contenido"
                  color="green"
                />
                <Arrow />
                <FlowStep 
                  icon="🎯"
                  label="Nosotros"
                  text="Optimizamos para SEO"
                  color="green"
                />
                <Arrow />
                <FlowStep 
                  icon="✅"
                  label="Nosotros"
                  text='Notificamos: "Hecho, está publicado"'
                  color="green"
                />
                <Arrow />
                <FlowStep 
                  icon="🎉"
                  label="Cliente"
                  text="Ve el sitio actualizado en vivo"
                  color="blue"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FlowStep({ icon, label, text, color }: { icon: string; label: string; text: string; color: string }) {
  const colorClasses = color === 'blue' 
    ? 'bg-blue-100 border-blue-400' 
    : 'bg-green-100 border-green-400'

  return (
    <div className={`${colorClasses} border-2 rounded-lg p-6 w-full max-w-md shadow-md`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="font-bold text-gray-900">{label}:</span>
      </div>
      <p className="text-gray-700 italic">&quot;{text}&quot;</p>
    </div>
  )
}

function Arrow() {
  return (
    <div className="text-4xl text-gray-400">↓</div>
  )
}
