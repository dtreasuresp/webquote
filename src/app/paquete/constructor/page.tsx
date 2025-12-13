'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
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

export default function ConstructorPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [snapshotConstructor, setSnapshotConstructor] = useState<PackageSnapshot | null>(null)
  const [cargando, setCargando] = useState(true)
  const [medallaEmoji, setMedallaEmoji] = useState('📦')
  const [esRecomendado, setEsRecomendado] = useState(false)

  useEffect(() => {
    const cargarSnapshot = async () => {
      // Esperar a que se cargue el estado de la sesión
      if (status === 'loading') return

      // Si no hay sesión, redirigir al login
      if (status === 'unauthenticated') {
        console.log('[AUTH] Usuario no autenticado - Redirigiendo a login')
        router.push('/login')
        return
      }

      try {
        // Usar obtenerSnapshots (filtrado por usuario) en lugar de obtenerSnapshotsCompleto
        const snapshots = await obtenerSnapshots()
        const activos = snapshots.filter(s => s.activo)
        
        // Ordenar por inversión anual (año1)
        const ordenados = [...activos].sort((a, b) => a.costos.año1 - b.costos.año1)
        
        const constructor = snapshots.find(
          s => s.nombre.toLowerCase() === 'constructor' && s.activo
        )
        
        if (constructor) {
          setSnapshotConstructor(constructor)
          
          // Asignar medalla según posición
          const posicion = ordenados.findIndex(s => s.nombre.toLowerCase() === 'constructor')
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
        console.error('Error cargando snapshot Constructor:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarSnapshot()
  }, [status, router])
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
              <span className="text-5xl">{medallaEmoji}</span>
            </div>
            {esRecomendado && (
              <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm mb-4">
                ⭐ RECOMENDADO
              </div>
            )}
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
      <section className={SECTION_STYLES.section}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>📄 Páginas y Estructura</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={SECTION_STYLES.gridCols3}
          >
            {[
              'Página de Inicio con banner',
              'Sección Nosotros / Quiénes Somos',
              'Catálogo de 10 productos/servicios',
              'Galería de Proyectos (hasta 15 fotos)',
              'Página de Contacto con formulario',
              'Ubicación con Google Maps integrado',
              'Blog / Noticias (básico)',
              'Footer con links a redes sociales',
            ].map((item, index) => (
                <motion.div
                  key={`pages2-${item}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${SECTION_STYLES.card} ${SECTION_STYLES.itemGap}`}
                >
                  <FaCheckCircle className="text-primary mt-1 flex-shrink-0" />
                  <span className={SECTION_STYLES.textGray800}>{item}</span>
                </motion.div>
            ))}
          </motion.div>
          <p className="text-center mt-6 text-lg text-gray-600 font-semibold">
            <strong>Total: 8 páginas principales</strong>
          </p>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className={SECTION_STYLES.sectionBg}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>⚙️ Funcionalidades Incluidas</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className={SECTION_STYLES.gridCols3}>
              {[
                {
                  title: '🔍 Búsqueda Básica',
                  items: ['Búsqueda simple de productos', 'Filtrado básico por categoría'],
                },
                {
                  title: '💬 Comunicación',
                  items: ['Botones de llamada por diferentes vías', 'Formulario de contacto'],
                },
                {
                  title: '📸 Galería',
                  items: ['Galería de imágenes', 'Videos incrustados de corta duración', 'Efectos visuales básicos'],
                },
                {
                  title: '📊 Marketing',
                  items: ['Google', 'Facebook', 'Reportes de tráfico'],
                },
                {
                  title: '🌐 Integraciones',
                  items: ['Enlaces a redes sociales', 'Google Maps'],
                },
                {
                  title: '⚡ Rendimiento',
                  items: ['SEO básico', 'Diseño 100% responsive'],
                },
              ].map((section, index) => (
                <motion.div
                  key={`func-${section.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
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

      {/* Contenidos y Materiales */}
      <section className={SECTION_STYLES.section}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>📝 Contenidos y Materiales Básicos</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={SECTION_STYLES.gridCols3}
            >
            {[
              'Redacción de textos',
              'Integración de logo existente',
              'Carga de imágenes (4x productos)',
              'Meta títulos y descripciones',
              'Estructuración de información de servicios',
              'Descripciones SEO de servicios',
            ].map((item, index) => (
              <motion.div
                key={`content2-${item}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                  className={`${SECTION_STYLES.card} ${SECTION_STYLES.itemGap}`}
                >
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span className={SECTION_STYLES.textGray800}>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Capacitación y Soporte */}
      <section className={SECTION_STYLES.sectionBg}>
        <div className={SECTION_STYLES.container}>
          <h3 className={SECTION_STYLES.title}>🎓 Capacitación y Soporte</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={SECTION_STYLES.gridCols2}
          >
            <div className={SECTION_STYLES.card}>
              <h4 className="text-2xl font-bold text-primary mb-4">📚 Capacitación</h4>
              <ul className={SECTION_STYLES.itemSpacing}>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}><strong>2 horas</strong> de capacitación virtual</span>
                </li>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}>Manual de usuario en <strong>PDF</strong></span>
                </li>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}><strong>Guía para actualizar </strong> el contenido</span>
                </li>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}>Demostración del panel de admin</span>
                </li>
              </ul>
            </div>

            <div className={SECTION_STYLES.card}>
              <h4 className="text-2xl font-bold text-primary mb-4">🛠️ Soporte</h4>
              <ul className={SECTION_STYLES.itemSpacing}>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}><strong>30 días</strong> de garantía técnica</span>
                </li>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}>Corrección de <strong>bugs sin costo</strong></span>
                </li>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}>Soporte por <strong>email</strong></span>
                </li>
                <li className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={`${SECTION_STYLES.textGray800}`}>Respuesta en <strong>máx 24 horas</strong></span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Gestión Mensual */}
          <div className={`mt-6 ${SECTION_STYLES.card}`}>
            <h4 className="text-2xl font-bold text-primary mb-4">📝 Gestión Mensual</h4>
            <div className={SECTION_STYLES.gridCols3}>
              {[
                'Actualizaciones mensuales (2 cambios)',
                'Agregar/editar productos (2 productos)',
                'Cambiar precios y disponibilidad',
                'Subir fotos nuevas (4 imágenes x productos)',
                'Revisar y responder comentarios',
                'Optimizar SEO básico',
                'Monitoreo de tráfico',
                'Reporte mensual',
              ].map((item) => (
                <div key={`mgmt-${item}`} className={SECTION_STYLES.itemGap}>
                  <span className="text-primary font-bold">✓</span>
                  <span className={SECTION_STYLES.textGray800}>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-primary font-bold text-lg">
              Cambios incluidos en el paquete: 2 actualizaciones al mes. Los cambios adicionales tienen un costo extra de $1.50 USD cada uno.
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
                {snapshotConstructor ? (
                  <PackageCostSummary snapshot={snapshotConstructor} />
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800 font-semibold">
                      No se encontró la configuración del paquete Constructor. Utiliza el panel administrativo para configurarlo.
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
          
          <PaymentOptions snapshot={snapshotConstructor} />
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent mt-6"
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
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-center font-bold text-gray-900">El costo de la infraestructura y la gestión se facturan aparte</p>
              <p className="text-center font-bold text-gray-900">
                  Al iniciar (+ ${snapshotConstructor?.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0} hosting, ${snapshotConstructor?.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0} mailbox, ${snapshotConstructor?.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0} dominio) = $
                  {snapshotConstructor 
                    ? ((snapshotConstructor.paquete.desarrollo || 0) + 
                       (snapshotConstructor.serviciosBase.find(s => s.nombre === 'Hosting')?.precio || 0) + 
                       (snapshotConstructor.serviciosBase.find(s => s.nombre === 'Mailbox')?.precio || 0) + 
                       (snapshotConstructor.serviciosBase.find(s => s.nombre === 'Dominio')?.precio || 0)).toFixed(2)
                    : 207
                  } USD
                </p>
              </div>
            <p className="text-gray-800 mt-4">   
              <strong>💳 Gestión de cambios:</strong> Este paquete incluye <strong>2 cambios/mes</strong> planificados, tales como actualizaciones de precios, cambios de fotos. Los cambios adicionales ascienden a <strong>$1.50 USD</strong> c/u.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className={SECTION_STYLES.section}>
        <div className={SECTION_STYLES.container}>
          <h3 className={`${SECTION_STYLES.title} flex items-center gap-2`}>
            <FaCalendar /> Tiempo de Entrega: 4 Semanas
          </h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="space-y-4">
              {[
                {
                  week: 1,
                  title: 'Descubrimiento',
                  description: 'Análisis de requisitos y planificación del proyecto',
                },
                {
                  week: 2,
                  title: 'Diseño',
                  description: 'Crear maquetas y obtener aprobaciones',
                },
                {
                  week: 3,
                  title: 'Desarrollo Web',
                  description: 'Implementación de técnicas, funcionalidades y carga de contenidos',
                },
                {
                  week: 4,
                  title: 'Testing y Lanzamiento',
                  description: 'Capacitación, pruebas y publicación',
                },
              ].map((item, index) => (
                <motion.div
                  key={`week-${item.week}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
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

      {/* CTA Section */}
      <section className={SECTION_STYLES.section}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              ¿Listo para tu transformación digital?
            </h2>
            <p className="text-xl text-gray-600 mb-6">
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
