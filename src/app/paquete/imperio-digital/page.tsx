'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowLeft, FaCheckCircle, FaCalendar } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import PackageCostSummary from '@/components/sections/PackageCostSummary'
import PaymentOptions from '@/components/sections/PaymentOptions'
import { obtenerSnapshots } from '@/lib/snapshotApi'
import SECTION_STYLES from '@/lib/styleConstants'

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

export default function ImperioDigitalPage() {
  const [snapshotImperio, setSnapshotImperio] = useState<PackageSnapshot | null>(null)
  const [cargando, setCargando] = useState(true)
  const [medallaEmoji, setMedallaEmoji] = useState('📦')
  const [esRecomendado, setEsRecomendado] = useState(false)

  useEffect(() => {
    const cargarSnapshot = async () => {
      try {
        const snapshots = await obtenerSnapshots()
        const activos = snapshots.filter(s => s.activo)
        
        // Ordenar por inversión anual (año1)
        const ordenados = [...activos].sort((a, b) => a.costos.año1 - b.costos.año1)
        
        const imperio = snapshots.find(
          s => s.nombre.toLowerCase() === 'imperio digital' && s.activo
        )
        
        if (imperio) {
          setSnapshotImperio(imperio)
          
          // Asignar medalla según posición
          const posicion = ordenados.findIndex(s => s.nombre.toLowerCase() === 'imperio digital')
          const iconos = ['🥉', '🥈', '🥇']
          
          const asignarMedalla = () => {
            if (posicion >= 0 && posicion < iconos.length) {
              return iconos[posicion]
            }
            if (ordenados.length > 3 && posicion === ordenados.length - 1) {
              return '⭐'
            }
            return '🥇'
          }
          
          setMedallaEmoji(asignarMedalla())
          setEsRecomendado(posicion === 1)
        }
      } catch (error) {
        console.error('Error cargando snapshot Imperio Digital:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">IMPERIO DIGITAL</h1>
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
              <span className="text-5xl">{medallaEmoji}</span>
            </div>
            {esRecomendado && (
              <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm mb-4">
                ⭐ RECOMENDADO
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Paquete {snapshotImperio?.paquete.tipo || 'Paquete'}
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {snapshotImperio?.nombre || 'IMPERIO DIGITAL'}
            </h2>
            <p className="text-xl md:text-2xl mb-6 text-white">
              {snapshotImperio?.paquete.tagline || 'Presencia digital de clase mundial'}
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-5xl font-bold mb-2">${snapshotImperio?.costos.inicial || 300} USD</div>
              <p className="text-lg">Inversión inicial</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Páginas y Estructura Ilimitada */}
      <section className={SECTION_STYLES.section}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>📄 Páginas y Estructura Ilimitada</h3>
          <p className="text-xl text-gray-600 mb-6">Igual que el paquete Obra Maestra incluyendo:</p>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={SECTION_STYLES.gridCols3}>
            {[
              'Página de servicios con comparativa',
              'Testimonios y casos de éxito',
              'Equipo (con perfiles de empleados)',
              'Certificaciones y acreditaciones',
              'Área de recursos (descargas)',
              'Blog completo con categorías',
              'Políticas legales',
              'Página de presupuestos/cotizaciones',
              'Preguntas frecuentes (FAQ)',
            ].map((item, index) => (
              <motion.div
                key={`pages-${item}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`${SECTION_STYLES.card} ${SECTION_STYLES.itemGap}`}
              >
                <FaCheckCircle className="text-primary mt-1 flex-shrink-0" />
                <span className={SECTION_STYLES.textGray800}>{item}</span>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center mt-6 text-lg text-gray-600 font-semibold">
            <strong>Total: 8+ páginas principales + ilimitadas expandibles</strong>
          </p>
        </div>
      </section>

      {/* Funcionalidades Premium Avanzadas */}
      <section className={SECTION_STYLES.sectionBg}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>⚙️ Funcionalidades Premium Avanzadas</h3>
          <p className="text-xl text-gray-600 mb-6">Igual que el paquete Obra Maestra incluyendo:</p>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className={SECTION_STYLES.gridCols3}>
              {[
                {
                  title: '🔎 Búsaqueda inteligente',
                  items: ['Búsqueda mejor estructurada', 'Filtros múltiples', 'Sugerencias automáticas'],
                },
                {
                  title: '💬 Comunicación Avanzada',
                  items: ['Formularios dinámicos'],
                },
                {
                  title: '🛒 Reservas',
                  items: ['Reservas online', 'Formulario de presupuesto'],
                },
                {
                  title: '📣 Ingeniería Social',
                  items: ['Calificaciones y reviews', 'Carrusel de testimonios', 'Contador de clientes'],
                },
                {
                  title: '📈 Analítica y Optimización',
                  items: ['Mapa de calor', 'Reporte mensual', 'Dashboard personalizado'],
                },
                {
                  title: '🎯 Marketing Integrado',
                  items: ['Facebook', 'Google', 'Control de clientes básico', 'Automatización de correos'],
                },
                {
                  title: '🔍 Gestión de Contenido Avanzado',
                  items: ['Ruta de archivos', 'Direcciones web amigables', 'Estructura estratégica'],
                },
              ].map((section, index) => (
                <motion.div
                  key={`func-${section.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={SECTION_STYLES.cardHover}
                >
                  <h4 className="text-xl font-bold text-primary mb-4">{section.title}</h4>
                  <ul className={SECTION_STYLES.itemSpacing}>
                    {section.items.map((item) => (
                      <li key={`item-${item}`} className={`${SECTION_STYLES.itemGap} ${SECTION_STYLES.textGray800}`}>
                        <span className="text-primary font-bold">✓</span>
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

      {/* Contenidos audiovisuales profesionales */}
      <section className={SECTION_STYLES.section}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>📝 Contenidos y Materiales Premium</h3>
          <p className="text-xl text-gray-600 mb-6">Igual que el paquete Obra Maestra incluyendo:</p>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={SECTION_STYLES.gridCols3}>
            {[
              'Producción de video corporativo (máx 2 minutos)',
              'Fotografía profesional de productos (sesión hasta 4 horas)',
              'Edición profesional y optimización para web',
              'Infografías personalizadas (2-3) con animación básica',
              'Animaciones personalizadas',
              'Redacción estratégica de textos',
              'Estructuración de contenido para marketing',
            ].map((item, index) => (
              <motion.div
                key={`content-${item}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`${SECTION_STYLES.card} ${SECTION_STYLES.itemGap}`}
              >
                <span className="text-primary font-bold text-lg">✓</span>
                <span className={SECTION_STYLES.textGray800}>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Capacitación, Soporte y Gestión */}
      <section className={SECTION_STYLES.sectionBg}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>🎓 Capacitación Integral y Consultoría</h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={SECTION_STYLES.gridCols2}>
            <div className={SECTION_STYLES.card}>
              <h4 className="text-2xl font-bold text-primary mb-4">📚 Capacitación</h4>
              <ul className={SECTION_STYLES.itemSpacing}>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}><strong>6 horas</strong> de capacitación</span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Sesión para <strong>tu equipo</strong></span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Prácticas interactivas</span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Manual de usuario</span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Documentación técnica</span></li>
              </ul>
            </div>

            <div className={SECTION_STYLES.card}>
              <h4 className="text-2xl font-bold text-primary mb-4">🛠️ Soporte Técnico</h4>
              <ul className={SECTION_STYLES.itemSpacing}>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}><strong>90 días</strong> de garantía técnica</span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Soporte <strong>24/7</strong> por WhatsApp</span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Respuesta en <strong>máx 6 horas</strong></span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Actualizaciones de seguridad automáticas</span></li>
                <li className={SECTION_STYLES.itemGap}><span className="text-primary font-bold">✓</span><span className={SECTION_STYLES.textGray800}>Monitoreo proactivo</span></li>
              </ul>
            </div>

          </motion.div>

          {/* Gestión Mensual */}
          <div className={`mt-6 ${SECTION_STYLES.card}`}>
            <h4 className="text-2xl font-bold text-primary mb-4">📝 Gestión Mensual - ILIMITADA</h4>
            <div className={SECTION_STYLES.gridCols3}>
              {[
                'Actualizaciones diarias si es necesario',
                'Gestión completa de contenidos multimedia',
                'Agregar/editar productos sin límite',
                'Publicación de artículos de blog',
                'Campaña de marketing mensual propuesta',
                'Análisis competitivo mensual',
                'Reporte mensual ejecutivo con recomendaciones',
                'Consultoría estratégica (1 hora/mes)',
              ].map((item, index) => (
                <div key={`mgmt-${item}`} className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-primary font-bold text-lg">
              Cambios incluidos: ILIMITADOS (durante horario laboral 9am-6pm)
            </p>
          </div>
        </div>
      </section>

      {/* Inversión y Tabla de Costos */}
      <section className={SECTION_STYLES.section}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>💰 Inversión Anual</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {cargando ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando información de precios...</p>
              </div>
            ) : (
              <>
                {snapshotImperio ? (
                  <PackageCostSummary snapshot={snapshotImperio} />
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800 font-semibold">
                      No se encontró la configuración del paquete Imperio Digital. Utiliza el panel administrativo para configurarlo.
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Opciones de Pago */}
      <section className={SECTION_STYLES.sectionBg}>
        <div className={SECTION_STYLES.container}>
          <PaymentOptions snapshot={snapshotImperio} />

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent mt-6">
            <p className="text-gray-800">
              <strong>💳 Pago inicial: </strong>El costo total del pago inicial es la suma del desarrollo inicial (restando los descuentos si procede) y la infraestructura.
            </p>
            <p className="text-gray-800 mt-4">
              <strong>💳 Pago de la infraestructura:</strong> La infraestructura se paga en el pago inicial y los primeros 3 meses es gratis. En el cuarto mes comienza a pagar una cotización mensual.
            </p> 
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-bold text-gray-900">El costo de la infraestructura y la gestión se facturan aparte</p>
              <p className="text-center font-bold text-gray-900">
                  Al iniciar (+ ${snapshotImperio?.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0} hosting, ${snapshotImperio?.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0} mailbox, ${snapshotImperio?.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0} dominio) = $
                  {snapshotImperio 
                    ? ((snapshotImperio.paquete.desarrollo || 0) + 
                       (snapshotImperio.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0) + 
                       (snapshotImperio.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0) + 
                       (snapshotImperio.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0)).toFixed(2)
                    : 207
                  } USD
                </p>
              </div>
            <p className="text-gray-800 mt-4">
              <strong>💳 Gestión de cambios:</strong> Este paquete incluye <strong>cambios ilimitados en el mes</strong>, tales como actualizaciones de precios, cambios de fotos. El horario de atención es de lunes a viernes, 9am-6pm.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className={SECTION_STYLES.section}>
        <div className={SECTION_STYLES.container}>
          <h3 className={`${SECTION_STYLES.title} flex items-center gap-2`}>
            <FaCalendar /> Tiempo de Entrega: 7-8 Semanas
          </h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="space-y-4">
              {[
                { week: 1, title: 'Descubrimiento estratégico', description: 'Objetivos y planificación' },
                { week: 2, title: 'Identidad visual', description: 'Rediseño de marca' },
                { week: '3-4', title: 'Producción audiovisual', description: 'Fotos, video e infografías' },
                { week: '5-6', title: 'Desarrollo personalizado', description: 'Funcionalidades premium' },
                { week: 7, title: 'Testing', description: 'Pruebas de funcionalidades' },
                { week: 8, title: 'Lanzamiento', description: 'Capacitación, pruebas y publicación' },
              ].map((item, index) => (
                <motion.div
                  key={`week-${item.week}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`${SECTION_STYLES.card} border-l-4 flex gap-6 items-start`}
                >
                  <div className="text-2xl font-bold text-primary min-w-fit">Sem {item.week}</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className={SECTION_STYLES.textGray600}>{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bonus Exclusivo */}
      <section className={SECTION_STYLES.sectionBg}>
        <div className={SECTION_STYLES.container}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-lg border-l-4 border-primary p-4">
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">🎁 BONUS EXCLUSIVO</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200"><div className="text-4xl mb-3">🎨</div><p className="font-bold text-lg text-gray-900">4 Banners para Redes</p><p className="text-gray-600">Diseñados profesionalmente para tus campañas en redes sociales</p></div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200"><div className="text-4xl mb-3">💰</div><p className="font-bold text-lg text-gray-900">Descuento 5%</p><p className="text-gray-600">En futuros servicios</p></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={SECTION_STYLES.section}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">¿Listo para dominar tu mercado?</h2>
            <p className="text-xl text-gray-600 mb-6">IMPERIO DIGITAL es la opción para liderazgo y expansión.</p>
            <Link href="/#contacto" className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition-all transform hover:scale-105">
              Solicitar Presupuesto
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
