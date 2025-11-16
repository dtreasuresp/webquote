'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowLeft, FaCheckCircle, FaCalendar, FaCreditCard } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import PackageCostSummary from '@/components/PackageCostSummary'
import PaymentOptions from '@/components/PaymentOptions'
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

export default function ObraMaestraPage() {
  const [snapshotObraMaestra, setSnapshotObraMaestra] = useState<PackageSnapshot | null>(null)
  const [cargando, setCargando] = useState(true)
  const [medallaEmoji, setMedallaEmoji] = useState('📦')
  const [esRecomendado, setEsRecomendado] = useState(false)

  useEffect(() => {
    const cargarSnapshot = async () => {
      try {
        const snapshots = await obtenerSnapshotsCompleto()
        const activos = snapshots.filter(s => s.activo)
        
        // Ordenar por inversión anual (año1)
        const ordenados = [...activos].sort((a, b) => a.costos.año1 - b.costos.año1)
        
        const obraMaestra = snapshots.find(
          s => s.nombre.toLowerCase() === 'obra maestra' && s.activo
        )
        
        if (obraMaestra) {
          setSnapshotObraMaestra(obraMaestra)
          
          // Asignar medalla según posición
          const posicion = ordenados.findIndex(s => s.nombre.toLowerCase() === 'obra maestra')
          const iconos = ['🥉', '🥈', '🥇']
          
          if (ordenados.length <= 3) {
            // Solo medallas: 🥉, 🥈, 🥇
            if (posicion >= 0 && posicion < iconos.length) {
              setMedallaEmoji(iconos[posicion])
            }
          } else {
            // Con estrella para el de mayor inversión
            if (posicion === ordenados.length - 1) {
              setMedallaEmoji('⭐')
            } else if (posicion >= 0 && posicion < iconos.length) {
              setMedallaEmoji(iconos[posicion])
            } else {
              setMedallaEmoji('🥇')
            }
          }
          
          // Validar si es recomendado (segundo paquete - posición 1)
          if (posicion === 1) {
            setEsRecomendado(true)
          }
        }
      } catch (error) {
        console.error('Error cargando snapshot Obra Maestra:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">OBRA MAESTRA</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary to-primary-dark text-white">
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
              Paquete {snapshotObraMaestra?.paquete.tipo || 'Paquete'}
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {snapshotObraMaestra?.nombre || 'OBRA MAESTRA'}
            </h2>
            <p className="text-xl md:text-2xl mb-6 text-white">
              {snapshotObraMaestra?.paquete.tagline || 'Máximo impacto digital y profesionalismo'}
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-5xl font-bold mb-2">${snapshotObraMaestra?.costos.inicial || 257} USD</div>
              <p className="text-lg">Inversión inicial</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Descripción General */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-8 text-gray-900">¿Para quién es este paquete?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl border-2 border-accent">
                <h4 className="text-xl font-bold text-secondary mb-3">🎯 Máximo Impacto</h4>
                <p className="text-gray-700">
                  Empresas que desean máximo impacto digital y profesionalismo en su presencia online.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-8 rounded-xl border-2 border-primary">
                <h4 className="text-xl font-bold text-secondary mb-3">💼 Captación</h4>
                <p className="text-gray-700">
                  Estar listas para captar clientes desde el primer día con herramientas avanzadas.
                </p>
              </div>
              <div className="bg-gradient-to-br from-secondary/10 to-neutral-200 p-8 rounded-xl border-2 border-secondary">
                <h4 className="text-xl font-bold text-secondary mb-3">📈 Crecimiento</h4>
                <p className="text-gray-700">
                  Mejor relación calidad-precio con escalabilidad y opciones de crecimiento futuro.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Infraestructura */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">⚙️ Detalles del Hosting</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Característica</th>
                  <th className="px-6 py-3 text-left">Costo mensual</th>
                  <th className="px-6 py-3 text-left">Costo anual</th>
                  <th className="px-6 py-3 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Hosting (0-3 meses)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-gray-600">Incluido en el plan inicial</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-accent/5">
                  <td className="px-6 py-4 font-semibold">Hosting (desde 4 meses)</td>
                  <td className="px-6 py-4 text-primary font-bold">$35 USD/mes</td>
                  <td className="px-6 py-4 text-primary font-bold">$315 USD/anual</td>
                  <td className="px-6 py-4 text-gray-600">Costo mensual del servidor premium</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Mailbox (0-3 meses)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-gray-600">Cuentas de correo corporativo</td>
                </tr>
                <tr className="hover:bg-gray-50  bg-accent/5">
                  <td className="px-6 py-4 font-semibold">Mailbox (desde 4 meses)</td>
                  <td className="px-6 py-4 text-primary font-bold">$4 USD/mes</td>
                  <td className="px-6 py-4 text-primary font-bold">$36 USD/anual</td>
                  <td className="px-6 py-4 text-gray-600">Por cada buzón @tudominio.com</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Dominio (0-3 meses)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-gray-600">Dirección web personalizada</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-accent/5">
                  <td className="px-6 py-4 font-semibold">Dominio (desde 4 meses)</td>
                  <td className="px-6 py-4 text-primary font-bold">$18 USD/mes</td>
                  <td className="px-6 py-4 text-primary font-bold">$162 USD/anual</td>
                  <td className="px-6 py-4 text-gray-600">Renovación del dominio</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">⚙️ Detalles de la Infraestructura</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Característica</th>
                  <th className="px-6 py-3 text-left">Costo mensual</th>
                  <th className="px-6 py-3 text-left">Costo anual</th>
                  <th className="px-6 py-3 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">SSL/HTTPS</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis 🔒</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis 🔒</td>
                  <td className="px-6 py-4 text-gray-600">Certificado de seguridad incluido</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Almacenamiento</td>
                  <td className="px-6 py-4 font-bold">~50 GB (NVMe)</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Espacio rápido y eficiente</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Ancho de banda</td>
                  <td className="px-6 py-4 font-bold text-accent">Ilimitado ∞</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Tráfico sin restricciones</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Uptime</td>
                  <td className="px-6 py-4 font-bold text-accent">99.9%</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Disponibilidad garantizada</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Backup automático</td>
                  <td className="px-6 py-4 font-bold">Diario</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Copias de seguridad protegidas</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Sitios múltiples</td>
                  <td className="px-6 py-4 font-bold">Hasta 100</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Posibilidad de alojar múltiples sitios web</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Soporte hosting</td>
                  <td className="px-6 py-4 font-bold">24/7</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Siempre disponible. Resolución en 3 horas como máximo</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">CDN Global</td>
                  <td className="px-6 py-4 font-bold text-accent">Incluido ⚡</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Velocidad máxima worldwide</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Páginas y Estructura */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">📄 Páginas y Estructura</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {[
              '✓ Página de Inicio con banner + slider',
              '✓ Sección "Nosotros / Quiénes Somos" mejorada',
              '✓ Catálogo de 10 productos/servicios con detalle',
              '✓ Galería de Proyectos (hasta 20 fotos con efectos)',
              '✓ Página de Contacto avanzada',
              '✓ Ubicación con Google Maps + Street View',
              '✓ Blog / Noticias (con categorías)',
              '✓ Página de FAQ (Preguntas Frecuentes)',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 bg-gradient-to-r from-accent/10 to-accent/20 p-4 rounded-lg border border-accent/30"
              >
                <FaCheckCircle className="text-accent mt-1 flex-shrink-0" />
                <span className="text-gray-800">{item}</span>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center mt-8 text-lg text-gray-600 font-semibold">
            <strong>Total: 8+ páginas principales + expandibles</strong>
          </p>
        </div>
      </section>

      {/* Funcionalidades Avanzadas */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">⚙️ Funcionalidades Avanzadas</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: '🔍 Buscador Inteligente',
                  items: ['Búsqueda con filtros avanzados', 'Filtrado por categoría, precio', 'Búsqueda automática mientras escribes'],
                },
                {
                  title: '💬 Comunicación',
                  items: [
                    'Enlace a WhatsApp',
                    'Botones directos para llamadas',
                    'Formulario de contacto avanzado',
                    'Newsletter automático',
                  ],
                },
                {
                  title: '📸 Galería y Media',
                  items: [
                    'Galería con efecto zoom',
                    'Videos incrustados optimizados',
                    'Comparador de servicios',
                    'Sistema de comentarios/reviews',
                  ],
                },
                {
                  title: '📊 Marketing',
                  items: [
                    'Meta Pixel integrado',
                    'Seguimiento de conversiones',
                    'Botones para redes sociales',
                    'Google Analytics avanzado',
                  ],
                },
                {
                  title: '🌐 Integraciones',
                  items: [
                    'Redes sociales',
                    'Google Maps + direcciones',
                    'Responsive en todos los dispositivos',
                  ],
                },
                {
                  title: '⚡ Optimización',
                  items: [
                    'SEO optimizado completo',
                    'Velocidad < 2 segundos',
                    'Caché automático',
                    'Compresión de imágenes',
                  ],
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
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">📝 Contenidos y Materiales Premium</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-4"
          >
            {[
              'Redacción profesional mejorada',
              'Diseño de gráficos y banners personalizados',
              'Edición básica de videos',
              'Optimización de fotografías profesional',
              'Descripción SEO de cada servicio',
              'Meta títulos y descripciones optimizadas',
              'Estructura de contenido estratégica',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-gradient-to-r from-accent/10 to-accent/20 rounded-lg border border-accent/30"
              >
                <span className="text-accent font-bold text-lg">✓</span>
                <span className="text-gray-800">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Capacitación y Soporte */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">🎓 Capacitación y Soporte Extendido</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-gradient-to-br from-secondary/10 to-neutral-200 p-8 rounded-xl border-2 border-secondary">
              <h4 className="text-2xl font-bold text-secondary mb-4">📚 Capacitación</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-gray-800"><strong>3 horas</strong> de capacitación virtual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-gray-800">Sesión para <strong>equipo completo</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-gray-800">Manual de usuario <strong>detallado en PDF</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-gray-800"><strong>Videos tutoriales</strong> personalizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-gray-800">Acceso a <strong>documentación técnica</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-8 rounded-xl border-2 border-primary">
              <h4 className="text-2xl font-bold text-secondary mb-4">🛠️ Soporte Técnico</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800"><strong>60 días</strong> de garantía técnica</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800">Corrección de <strong>bugs sin costo</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800"><strong>Actualizaciones</strong> de seguridad</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800">Soporte <strong>prioritario por WhatsApp</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-gray-800">Respuesta en <strong>máx 3 horas</strong></span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Gestión Mensual */}
          <div className="mt-8 bg-gradient-to-r from-accent/10 to-accent/20 p-8 rounded-xl border-2 border-accent">
            <h4 className="text-2xl font-bold text-secondary mb-4">📝 Gestión Mensual - ILIMITADA</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Actualizaciones MENSUALES sin límite',
                'Agregar/editar productos ilimitados',
                'Cambiar precios y disponibilidad',
                'Subir fotos y videos',
                'Escribir y publicar artículos de blog',
                'Gestionar comentarios',
                'Optimizar SEO mensual',
                'Monitoreo de tráfico',
                'Reporte mensual detallado con métricas',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-accent font-bold">✓</span>
                  <span className="text-gray-800">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-secondary font-bold text-lg">
              Cambios incluidos: ILIMITADOS (durante horario laboral 9am-6pm)
            </p>
          </div>
        </div>
      </section>

      {/* Inversión y Tabla de Costos */}
      <section className="py-16 px-4">
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
            ) : snapshotObraMaestra ? (
              <PackageCostSummary snapshot={snapshotObraMaestra} />
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800">
                  No se encontró la configuración del paquete Obra Maestra. Utiliza el panel administrativo para configurarlo.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Opciones de Pago */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-2">
            <FaCreditCard /> Opciones de Pago
          </h3>
          <PaymentOptions snapshot={snapshotObraMaestra} />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 bg-accent/10 p-6 rounded-lg border-l-4 border-accent"
          >
            <p className="text-gray-800">
              <strong>💳 Gestión mensual:</strong> $12/mes desde el mes 2 (facturación separada). El primer mes de despliegue en internet es gratis
            </p>
            <p className="text-gray-800 mt-4">
              <strong>💳 Pago inicial: </strong>El costo total del pago inicial es la suma del desarrollo inicial (restando los descuentos si procede) y la infraestructura.
            </p>
            <p className="text-gray-800 mt-4">
              <strong>💳 Pago de la infraestructura:</strong> La infraestructura se paga en el pago inicial y los primeros 3 meses es gratis. En el cuarto mes comienza a pagar una cotización mensual.
            </p> 
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-2">
            <FaCalendar /> Tiempo de Entrega: 5-6 Semanas
          </h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              {[
                {
                  week: 1,
                  title: 'Descubrimiento Profundo',
                  description: 'Análisis estratégico y planificación del proyecto',
                  color: 'from-secondary via-secondary-light to-neutral-800',
                },
                {
                  week: 2,
                  title: 'Diseño Profesional',
                  description: 'Crear mockups y obtener aprobaciones',
                  color: 'from-primary via-primary-dark to-secondary',
                },
                {
                  week: '3-4',
                  title: 'Desarrollo Avanzado',
                  description: 'Funcionalidades, integraciones y optimizaciones',
                  color: 'from-accent via-accent-dark to-primary',
                },
                {
                  week: 5,
                  title: 'Gestión de Contenidos',
                  description: 'Fotos, videos y redacción profesional',
                  color: 'from-primary to-primary-dark',
                },
                {
                  week: 6,
                  title: 'Testing y Lanzamiento',
                  description: 'Exhaustivo, optimizaciones finales y publicación',
                  color: 'from-accent to-accent-dark',
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

      {/* Bonus Exclusivo */}
      <section className="py-16 px-4 bg-gradient-to-r from-accent/10 to-accent/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-accent to-accent-dark rounded-2xl p-8 text-center"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">🎁 BONUS EXCLUSIVO</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl mb-3">🎨</div>
                <p className="font-bold text-lg text-gray-900">2 Banners para Redes</p>
                <p className="text-gray-700">Diseñados profesionalmente para tus campañas en redes sociales</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="text-4xl mb-3">💰</div>
                <p className="font-bold text-lg text-gray-900">Descuento 5%</p>
                <p className="text-gray-700">En futuros servicios y upgrades</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
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
              OBRA MAESTRA es la solución perfecta para empresas que buscan máximo impacto profesional
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
