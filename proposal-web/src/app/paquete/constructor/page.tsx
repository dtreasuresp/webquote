'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowLeft, FaCheckCircle, FaCalendar, FaCreditCard } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import PackageCostSummary from '@/components/PackageCostSummary'
import { obtenerSnapshotsCompleto } from '@/lib/snapshotApi'

interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface OtroServicio {
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

interface PackageSnapshot {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  gestion: {
    precio: number
    mesesGratis: number
    mesesPago: number
  }
  paquete: {
    desarrollo: number
    descuento: number
    tipo?: string
    descripcion?: string
    emoji?: string
    tagline?: string
    precioHosting?: number
    precioMailbox?: number
    precioDominio?: number
    tiempoEntrega?: string
  }
  otrosServicios: OtroServicio[]
  costos: {
    inicial: number
    año1: number
    año2: number
  }
  activo: boolean
  createdAt: string
}

export default function ConstructorPage() {
  const [snapshotConstructor, setSnapshotConstructor] = useState<PackageSnapshot | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarSnapshot = async () => {
      try {
        const snapshots = await obtenerSnapshotsCompleto()
        const constructor = snapshots.find(
          s => s.nombre.toLowerCase() === 'constructor' && s.activo
        )
        if (constructor) {
          setSnapshotConstructor(constructor)
        }
      } catch (error) {
        console.error('Error cargando snapshot Constructor:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarSnapshot()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header con navegación */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/#paquetes"
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          >
            <FaArrowLeft /> Volver a Paquetes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">CONSTRUCTOR</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 px-4 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">{snapshotConstructor?.paquete.emoji || '📦'}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Paquete {snapshotConstructor?.paquete.tipo || 'Paquete'}
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {snapshotConstructor?.nombre || 'CONSTRUCTOR'}
            </h2>
            <p className="text-xl md:text-2xl mb-6 text-white">
              {snapshotConstructor?.paquete.tagline || 'Solución digital personalizada'}
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-5xl font-bold mb-2">${snapshotConstructor?.costos.inicial || 200} USD</div>
              <p className="text-lg">Inversión inicial</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Páginas y Estructura */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">📄 Páginas y Estructura</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {[
              '✓ Página de Inicio con banner profesional',
              '✓ Sección Nosotros / Quiénes Somos',
              '✓ Catálogo de 10 productos/servicios',
              '✓ Galería de Proyectos (hasta 15 fotos)',
              '✓ Página de Contacto con formulario',
              '✓ Ubicación con Google Maps integrado',
              '✓ BBlog / Noticias (básico)',
              '✓ Footer con links a redes sociales',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 bg-gradient-to-r from-accent/10 to-accent/20 p-4 rounded-lg"
              >
                <FaCheckCircle className="text-accent mt-1 flex-shrink-0" />
                <span className="text-gray-800">{item}</span>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center mt-8 text-lg text-gray-600 font-semibold">
            <strong>Total: 8 páginas principales</strong>
          </p>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">⚙️ Funcionalidades Incluidas</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: '🔍 Búsqueda Básica',
                  items: ['Búsqueda simple de productos', 'Filtrado básico por categoría', 'Resultados rápidos'],
                },
                {
                  title: '💬 Comunicación',
                  items: [, 'Botones de llamada por diferentes vías', 'Formulario de contacto'],
                },
                {
                  title: '📸 Galería',
                  items: ['Galería de imágenes', 'Videos incrustados de corta duración', 'Efectos visuales básicos'],
                },
                {
                  title: '📊 Marketing e integración',
                  items: ['Google Analytics básico', 'Meta Pixel integrado', 'Reportes de tráfico'],
                },
                {
                  title: '🌐 Integraciones',
                  items: ['Facebook integrado', 'Enlaces a redes sociales', 'Google Maps'],
                },
                {
                  title: '⚡ Rendimiento',
                  items: ['SEO básico', 'Velocidad <3 segundos', 'Responsive design 100%'],
                },
              ].map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-xl font-bold text-primary mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-accent font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contenidos y Materiales */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">📝 Contenidos Incluidos</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-4"
          >
            {[
              'Redacción profesional de textos',
              'Integración de logo existente',
              'Carga de imágenes (4x productos)',
              'Optimización básica de imágenes',
              'Meta títulos y descripciones',
              'Estructuración de información de servicios',
              'Descripciones SEO de servicios',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-gradient-to-r from-accent/10 to-accent/20 rounded-lg"
              >
                <span className="text-accent font-bold text-lg">✓</span>
                <span className="text-gray-800">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Capacitación y Soporte */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">🎓 Capacitación y Soporte</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-6 rounded-xl">
              <h4 className="text-2xl font-bold text-secondary mb-4">📚 Capacitación</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="text-gray-800"><strong>2 horas</strong> de capacitación virtual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="text-gray-800">Manual de usuario en <strong>PDF</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="text-gray-800"><strong>Guía para actualizar </strong> el contenido</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">✓</span>
                  <span className="text-gray-800">Demostración del panel de admin</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-6 rounded-xl">
              <h4 className="text-2xl font-bold text-primary-dark mb-4">🛠️ Soporte</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800"><strong>30 días</strong> de garantía técnica</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800">Corrección de <strong>bugs sin costo</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800">Soporte por <strong>email</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800">Respuesta en <strong>máx 24 horas</strong></span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Gestión Mensual */}
          <div className="mt-6 bg-gradient-to-r from-accent/10 to-accent/20 p-6 rounded-xl">
            <h4 className="text-2xl font-bold text-accent-dark mb-4">📝 Gestión Mensual</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Actualizaciones mensuales (2 cambios)',
                'Agregar/editar productos (2 productos)',
                'Cambiar precios y disponibilidad',
                'Subir fotos nuevas (4 imágenes x productos)',
                'Revisar y responder comentarios',
                'Optimizar SEO básico',
                'Monitoreo de tráfico',
                'Reporte mensual',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-gray-800">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-accent-dark font-bold text-lg">
              Cambios incluidos en el paquete: 2 actualizaciones al mes. Los cambios adicionales tienen un costo extra de $1.50 USD cada uno.
            </p>
          </div>
        </div>
      </section>

      {/* Inversión y Tabla de Costos */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">💰 Inversión Anual</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {cargando ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando información de precios...</p>
              </div>
            ) : snapshotConstructor ? (
              <PackageCostSummary snapshot={snapshotConstructor} />
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800">
                  No se encontró la configuración del paquete Constructor. Utiliza el panel administrativo para configurarlo.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Opciones de Pago */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-2">
            <FaCreditCard /> Sobre el pago
          </h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">📊 Opción 1: 2 pagos</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Pago 1 (50%)</span>
                  <span className="text-lg font-bold text-gray-900">${snapshotConstructor ? (snapshotConstructor.paquete.desarrollo / 2).toFixed(2) : '75'} USD</span>
                </div>
                <p className="text-center text-gray-600">Al iniciar</p>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Pago 2 (50%)</span>
                  <span className="text-lg font-bold text-gray-900">${snapshotConstructor ? (snapshotConstructor.paquete.desarrollo / 2).toFixed(2) : '75'} USD</span>
                </div>
                <p className="text-center text-gray-600">Al publicar</p>

                <div className="border-t-2 border-gray-300 pt-4">
                  <p className="text-center font-bold text-gray-900">Total desarrollo: ${snapshotConstructor?.paquete.desarrollo || 150} USD</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent">
              <h4 className="text-2xl font-bold text-accent-dark mb-4">🎁 Opción 2: Pago único</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-gray-900">Pago adelantado</span>
                  <span className="text-lg font-bold text-accent">${snapshotConstructor?.paquete.desarrollo || 150} USD</span>
                </div>
                <p className="text-center text-gray-700">El pago único adelantado sólo es para el desarrollo del sitio</p>
                <p className="text-center font-bold text-gray-900">El costo de la infraestructura y la gestión se facturan aparte</p>
                <p className="text-center font-bold text-gray-900">
                  Al iniciar (+ ${snapshotConstructor?.paquete.precioHosting || 0} hosting, ${snapshotConstructor?.paquete.precioMailbox || 0} mailbox, ${snapshotConstructor?.paquete.precioDominio || 0} dominio) = $
                  {snapshotConstructor 
                    ? ((snapshotConstructor.paquete.desarrollo || 0) + 
                       (snapshotConstructor.paquete.precioHosting || 0) + 
                       (snapshotConstructor.paquete.precioMailbox || 0) + 
                       (snapshotConstructor.paquete.precioDominio || 0)).toFixed(2)
                    : 207
                  } USD
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 bg-accent/10 p-4 rounded-lg border-l-4 border-accent"
          >
            <p className="text-gray-800">
              <strong>💳 Gestión mensual:</strong> $8/mes desde el mes 2 (facturación separada). El primer mes de despliegue en internet es gratis
            </p>
            <p className="text-gray-800 mt-4">
              <strong>💳 Pago inicial: </strong>El costo total del pago inicial es la suma del desarrollo y la infraestructura.
            </p>
            <p className="text-gray-800 mt-4">
              <strong>💳 Pago de la infraestructura:</strong> La infraestructura se paga en el pago inicial y los primeros 3 meses es gratis. En el cuarto mes comienza a pagar una cotización mensual.
            </p> 
            <p className="text-gray-800 mt-4">   
              <strong>💳 Gestión de cambios:</strong> Este paquete incluye <strong>2 cambios/mes</strong> planificados, tales como actualizaciones de precios, cambios de fotos. Los cambios adicionales ascienden a <strong>$1.50 USD</strong> c/u.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-2">
            <FaCalendar /> Tiempo de Entrega: 4 Semanas
          </h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="space-y-4">
              {[
                {
                  week: 1,
                  title: 'Descubrimiento',
                  description: 'Análisis de requisitos y planificación del proyecto',
                  color: 'from-primary to-primary-dark',
                },
                {
                  week: 2,
                  title: 'Diseño',
                  description: 'Crear mockups y obtener aprobaciones',
                  color: 'from-secondary to-secondary-light',
                },
                {
                  week: 3,
                  title: 'Desarrollo',
                  description: 'Implementación técnica y funcionalidades',
                  color: 'from-accent to-accent-dark',
                },
                {
                  week: 4,
                  title: 'Testing y Lanzamiento',
                  description: 'QA exhaustivo y publicación en producción',
                  color: 'from-primary-dark to-primary',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-6 items-start p-6 bg-gradient-to-r ${item.color} text-white rounded-lg hover:shadow-lg transition-shadow`}
                >
                  <div className="text-4xl font-bold min-w-fit">Sem {item.week}</div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-white/90">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              ¿Listo para tu transformación digital?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              CONSTRUCTOR es el punto de partida perfecto para una presencia digital confiable
            </p>
            <Link
              href="/#contacto"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition-all transform hover:scale-105"
            >
              Solicitar Presupuesto
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
