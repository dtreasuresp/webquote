'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function Garantias() {
  return (
    <section id="garantias" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Garantías y Responsabilidades
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Proveedor Responsable */}
            <div className="bg-accent/10 p-8 rounded-2xl border-0 border-accent">
              <h3 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                <FaCheckCircle className="text-accent" />
                EL PROVEEDOR GARANTIZA:
              </h3>
              <ul className="space-y-3">
                {[
                  'Mantener el 99.9% de tiempo activo',
                  'Seguridad SSL/HTTPS garantizada y gratis',
                  'Backups automáticos',
                  'Actualizaciones de seguridad',
                  'Soporte técnico',
                  'Cambios realizados puntualmente',
                  'Diseño profesional de tu sitio',
                  'Hosting, dominio y correo funcionando',
                  'Cumplimiento de normativas legales',
                  'Protección de datos y privacidad',
                  'Soporte post-lanzamiento',
                  'Período de garantía definido (30 a 90 días según paquete)',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <FaCheckCircle className="text-accent mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cliente Responsable */}
            <div className="bg-neutral-50 p-8 rounded-2xl border-0 border-neutral-300">
              <h3 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                <FaTimesCircle className="text-primary" />
                EL CLIENTE ES RESPONSABLE DE:
              </h3>
              <ul className="space-y-3">
                {[
                  'Pagar las inversiones acordadas a tiempo',
                  'Proporcionar contenidos/fotos necesarios',
                  'Aprobar diseños y funcionalidades',
                  'Usar el sitio legalmente',
                  'Notificar si hay problemas',
                  'Solicitar cambios dentro del alcance acordado',
                  'Mantener la confidencialidad de accesos',
                  'No transferir el sitio sin nuestro consentimiento', 
                  'Cumplir con las políticas de uso',
                  'Respetar los términos de servicio',
                  'Seguir las recomendaciones de seguridad',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-800">
                    <FaTimesCircle className="text-primary mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Políticas de Cancelación */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-2xl border-0 border-red-300 mb-16">
            <h3 className="text-2xl font-bold mb-6 text-red-900">
              📋 POLÍTICAS DE CANCELACIÓN
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Si el cliente cancela después del lanzamiento',
                  detail: 'Se devuelve hasta el 50% de la inversión inicial (solo desarrollo)',
                },
                {
                  title: 'Luego del segundo mes de lanzamiento',
                  detail: 'Reembolso de 30% de la inversión inicial (solo desarrollo)',
                },
                {
                  title: 'Después del período de garantía',
                  detail: 'Sin derecho a reembolso',
                },
              ].map((policy, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4">
                  <p className="font-bold text-gray-900">{policy.title}</p>
                  <p className="text-gray-700 text-sm">{policy.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Si Incumple el Proveedor */}
          <div className="bg-gradient-to-r from-secondary/10 to-neutral-100 p-8 rounded-2xl border-0 border-secondary mb-16">
            <h3 className="text-2xl font-bold mb-6 text-secondary">
              ⚖️ SI EL PROVEEDOR INCUMPLE
            </h3>
            <div className="space-y-3">
              {[
                'Procede a compensación al cliente por inactividad (descuento de hasta un 40% en el próximo mes)',
                'Corrección inmediata sin costo adicional',
                'Reembolso parcial según el impacto',
                'Revisión de los términos del contrato',
                'Terminación del contrato si persisten incumplimientos',
                'Notificación formal por escrito',
                'Plazo de 15 días para subsanar el incumplimiento',
                'Acceso a soporte prioritario',
                'Informe detallado de acciones correctivas',
                'Garantía extendida en caso de fallos recurrentes',
                'Suspensión temporal del servicio si es necesario',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-gray-800">
                  <FaCheckCircle className="text-accent mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
