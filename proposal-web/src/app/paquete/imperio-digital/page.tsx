'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowLeft, FaStar, FaCheckCircle, FaCalendar, FaCreditCard } from 'react-icons/fa'

export default function ImperioDigitalPage() {
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
      <section className="py-12 px-4 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaStar className="text-accent" />
              <span className="text-lg font-bold">PREMIUM</span>
              <FaStar className="text-accent" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Paquete Premium
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              IMPERIO DIGITAL
            </h2>
            <p className="text-xl md:text-2xl mb-6 text-white">
              Presencia digital de clase mundial y crecimiento sin límites
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-5xl font-bold mb-2">$300 USD</div>
              <p className="text-lg">Inversión inicial</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ¿Para quién? */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-3xl font-bold mb-8 text-gray-900">¿Para quién es este paquete?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-secondary/10 to-neutral-200 p-8 rounded-xl border-2 border-secondary">
                <h4 className="text-xl font-bold text-secondary mb-3">🏆 Excelencia</h4>
                <p className="text-gray-700">Empresas establecidas que buscan excelencia y diferenciación.</p>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl border-2 border-accent">
                <h4 className="text-xl font-bold text-secondary mb-3">💹 ROI</h4>
                <p className="text-gray-700">Máximo retorno de inversión con estrategia y marketing integrado.</p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-8 rounded-xl border-2 border-primary">
                <h4 className="text-xl font-bold text-secondary mb-3">🚀 Escala</h4>
                <p className="text-gray-700">Crecimiento sin limitaciones y presencia global.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Infraestructura profesional */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">⚙️ Infraestructura y Hosting Profesional</h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="overflow-x-auto">
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
                  <td className="px-6 py-4 text-primary font-bold">$40 USD/mes</td>
                  <td className="px-6 py-4 text-primary font-bold">$360 USD/anual</td>
                  <td className="px-6 py-4 text-gray-600">Servidor premium de alto rendimiento</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Mailbox (0-3 meses)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-gray-600">Cuentas corporativas incluidas</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-accent/5">
                  <td className="px-6 py-4 font-semibold">Mailbox (desde 4 meses)</td>
                  <td className="px-6 py-4 text-primary font-bold">$4 USD/mes</td>
                  <td className="px-6 py-4 text-primary font-bold">$36 USD/anual</td>
                  <td className="px-6 py-4 text-gray-600">Por buzón @tudominio.com</td>
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
                  <td className="px-6 py-4 text-gray-600">Renovación anual</td>
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
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">SSL/HTTPS</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis 🔒</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis 🔒</td>
                  <td className="px-6 py-4 text-gray-600">Certificado de seguridad incluido</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Almacenamiento</td>
                  <td className="px-6 py-4 font-bold">100 GB (NVMe)</td>
                                    <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Espacio amplio y veloz</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Ancho de banda</td>

                  <td className="px-6 py-4 font-bold text-accent">Ilimitado ∞</td>
                  <td className="px-6 py-4 font-bold text-accent">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Tráfico sin restricciones</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Uptime</td>
                  <td className="px-6 py-4 font-bold text-accent">99.9%</td>
                  <td className="px-6 py-4 font-bold text-accent">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Disponibilidad garantizada</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Backup automático</td>
                  <td className="px-6 py-4 font-bold">Diario + manual</td>
                  <td className="px-6 py-4 font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Protección de datos</td>
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
                  <td className="px-6 py-4 text-gray-600">Siempre disponible. Resolución en 30 minutos como máximo</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">CDN Global</td>
                  <td className="px-6 py-4 font-bold text-accent">Incluido ⚡</td>
                  <td className="px-6 py-4 font-bold text-accent">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Velocidad mundial</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Rendimiento</td>
                  <td className="px-6 py-4 font-bold">Superior (optimizado)</td>
                  <td className="px-6 py-4 font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Carga ultra rápida</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Páginas y Estructura Ilimitada */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">📄 Páginas y Estructura Ilimitada</h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
            {[
              'Todas las del Profesional, más:',
              '✓ Página de inicio mega optimizada',
              '✓ Página de servicios con comparativa',
              '✓ Testimonios y casos de éxito',
              '✓ Equipo (con perfiles de empleados)',
              '✓ Certificaciones y acreditaciones',
              '✓ Área de recursos (descargas)',
              '✓ Blog completo con categorías',
              '✓ Políticas legales',
              '✓ Página de presupuestos/cotizaciones',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 bg-gradient-to-r from-secondary/10 to-neutral-200 p-4 rounded-lg border border-secondary/30"
              >
                <FaCheckCircle className="text-accent mt-1 flex-shrink-0" />
                <span className="text-gray-800">{item}</span>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center mt-8 text-lg text-gray-600 font-semibold">
            <strong>Total: 8+ páginas principales + ilimitadas expandibles</strong>
          </p>
        </div>
      </section>

      {/* Funcionalidades Premium Avanzadas */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">⚙️ Funcionalidades Premium Avanzadas</h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: '🔎 Buscador y Filtrado',
                  items: ['Búsqueda inteligente con IA básica', 'Filtros múltiples avanzados', 'Búsqueda por voz', 'Sugerencias automáticas'],
                },
                {
                  title: '💬 Comunicación Avanzada',
                  items: ['WhatsApp', 'Formularios dinámicos', 'Newsletter automatizado', 'Email marketing integrado'],
                },
                {
                  title: '🛒 e‑Commerce de Cotización',
                  items: ['Reserva/compras online', 'Formulario de presupuesto', 'Carrito de compras', 'Integración con pagos'],
                },
                {
                  title: '📣 Social Proof',
                  items: ['Calificaciones y reviews', 'Testimonios automatizados', 'Casos de éxito', 'Carrusel de testimonios', 'Contador de clientes'],
                },
                {
                  title: '📈 Analytics y Optimización',
                  items: ['Heatmaps', 'Seguimiento de comportamiento', 'A/B testing', 'Reporte mensual', 'Dashboard personalizado'],
                },
                {
                  title: '🎯 Marketing Integrado',
                  items: ['Meta Pixel + conversión', 'Pixel de Google', 'Seguimiento de leads', 'CRM básico', 'Automatización de email', 'Recuperación de carritos'],
                },
                {
                  title: '🔍 SEO Avanzado',
                  items: ['Schema markup completo', 'Sitemap XML dinámico', 'Robots.txt optimizado', 'Breadcrumbs', 'URLs amigables', 'Estructura estratégica'],
                },
                {
                  title: '🌐 Integración Social Completa',
                  items: ['Facebook eventos', 'Instagram Feed', 'YouTube galería', 'TikTok embed', 'Telegram botón', 'LinkedIn integrado'],
                },
              ].map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
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

      {/* Contenidos audiovisuales profesionales */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">🎬 Contenidos Audiovisuales Profesionales</h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
            {[
              'Producción de video corporativo (máx 2 minutos)',
              'Guionista profesional y edición',
              'Fotografía profesional de productos (sesión hasta 4 horas)',
              'Edición profesional y optimización para web',
              'Infografías personalizadas (2-3) con animación básica',
              'Animaciones personalizadas',
              'Redacción estratégica de textos',
              'Estructuración de contenido para marketing',
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-primary/30"
              >
                <span className="text-primary font-bold text-lg">✓</span>
                <span className="text-gray-800">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Capacitación, Soporte y Gestión */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">🎓 Capacitación Integral y Consultoría</h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-secondary/10 to-neutral-200 p-8 rounded-xl border-2 border-secondary">
              <h4 className="text-2xl font-bold text-secondary mb-4">📚 Capacitación</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span><span className="text-gray-800"><strong>6 horas</strong> de capacitación completa</span></li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span><span className="text-gray-800">Sesión para <strong>equipo completo</strong></span></li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span><span className="text-gray-800">Práctica interactiva</span></li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span><span className="text-gray-800">Manual de usuario + videos tutoriales</span></li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold">✓</span><span className="text-gray-800">Documentación técnica y guías</span></li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-8 rounded-xl border-2 border-primary">
              <h4 className="text-2xl font-bold text-secondary mb-4">🛠️ Soporte Premium</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-gray-800"><strong>90 días</strong> de garantía técnica</span></li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-gray-800">Soporte <strong>24/7</strong> por WhatsApp</span></li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-gray-800">Respuesta en <strong>máx 6 horas</strong></span></li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-gray-800">Actualizaciones de seguridad automáticas</span></li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span className="text-gray-800">Monitoreo proactivo</span></li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl border-2 border-accent">
              <h4 className="text-2xl font-bold text-secondary mb-4">📝 Gestión Mensual - MÁXIMA</h4>
              <ul className="space-y-3">
                {[
                  'Actualizaciones DIARIAS si es necesario',
                  'Gestión completa de contenidos multimedia',
                  'Agregar/editar productos SIN límite',
                  'Publicación de artículos de blog',
                  'Campaña de marketing mensual propuesta',
                  'Optimización SEO avanzada',
                  'Análisis competitivo mensual',
                  'Reporte mensual ejecutivo con recomendaciones',
                  'Consultoría estratégica (1 hora/mes)',
                  'Soporte 24/7 por WhatsApp',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2"><span className="text-accent font-bold">✓</span><span className="text-gray-800">{item}</span></li>
                ))}
              </ul>
              <p className="text-center mt-6 text-secondary font-bold text-lg">Cambios incluidos: ILIMITADOS (respuesta en máx 1 hora)</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Inversión y Tabla de Costos */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">💰 Inversión</h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Periodo</th>
                  <th className="px-6 py-3 text-center">Desarrollo</th>
                  <th className="px-6 py-3 text-center">Hosting</th>
                  <th className="px-6 py-3 text-center">Mailbox</th>
                  <th className="px-6 py-3 text-center">Dominio</th>
                  <th className="px-6 py-3 text-center">Gestión</th>
                  <th className="px-6 py-3 text-center">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-accent/10 font-bold hover:bg-accent/20">
                  <td className="px-6 py-4">Pago Inicial</td>
                  <td className="px-6 py-4 text-center">$238</td>
                  <td className="px-6 py-4 text-center">$40</td>
                  <td className="px-6 py-4 text-center">$4</td>
                  <td className="px-6 py-4 text-center">$18</td>
                  <td className="px-6 py-4 text-center">$0</td>
                  <td className="px-6 py-4 text-center text-primary font-bold">$300 USD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">3 Meses (Gracia)</td>
                  <td className="px-6 py-4 text-center text-accent">N/A</td>
                  <td className="px-6 py-4 text-center text-accent">$0</td>
                  <td className="px-6 py-4 text-center text-accent">$0</td>
                  <td className="px-6 py-4 text-center text-accent">$0</td>
                  <td className="px-6 py-4 text-center text-accent">$30</td>
                  <td className="px-6 py-4 text-center text-gray-600 font-bold">$30 USD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Año 1</td>
                  <td className="px-6 py-4 text-center">$0</td>
                  <td className="px-6 py-4 text-center">$360</td>
                  <td className="px-6 py-4 text-center">$36</td>
                  <td className="px-6 py-4 text-center">$162</td>
                  <td className="px-6 py-4 text-center">$30</td>
                  <td className="px-6 py-4 text-center font-bold">$796 USD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Año 2+</td>
                  <td className="px-6 py-4 text-center text-accent">N/A</td>
                  <td className="px-6 py-4 text-center">$360</td>
                  <td className="px-6 py-4 text-center">$36</td>
                  <td className="px-6 py-4 text-center">$162</td>
                  <td className="px-6 py-4 text-center">$180</td>
                  <td className="px-6 py-4 text-center font-bold">$558 USD</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-600 mt-3">
              ➡️ Nota: La <strong>gestión mensual ($15/mes)</strong> inicia desde el mes 2 (1 mes gratis).
            </p>
          </motion.div>
          {/* Opciones de Pago */}
          <div className="mt-10">
            <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2"><FaCreditCard /> Opciones de Pago</h4>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h5 className="text-xl font-bold text-gray-900 mb-4">📊 Opción 1: Estándar</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-semibold">Pago 1 (40%)</span><span className="text-lg font-bold text-primary">$95 USD</span></div>
                  <div className="text-center text-gray-600 -mt-2">Al iniciar</div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-semibold">Pago 2 (40%)</span><span className="text-lg font-bold text-primary">$95 USD</span></div>
                  <div className="text-center text-gray-600 -mt-2">Al diseño</div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-semibold">Pago 3 (13%)</span><span className="text-lg font-bold text-primary">$30 USD</span></div>
                  <div className="text-center text-gray-600 -mt-2">Pruebas</div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-semibold">Pago 4 (7%)</span><span className="text-lg font-bold text-primary">$18 USD</span></div>
                  <div className="text-center text-gray-600 -mt-2">Publicar</div>
                  <div className="border-t-2 border-gray-300 pt-4"><p className="text-center font-bold text-gray-900">Total: $238 USD</p></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent">
                <div className="flex items-center gap-2 mb-4">
                  <h5 className="text-xl font-bold text-secondary">🎁 Opción 2: Descuento</h5>
                  <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">-15%</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold text-gray-900">Pago único adelantado</span>
                    <span className="text-lg font-bold text-neutral-400 line-through">$238 USD</span>
                  </div>
                  <p className="text-center text-gray-700 font-bold">CON DESCUENTO 15%</p>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-accent">
                    <span className="font-bold text-lg text-gray-900">Total a Pagar</span>
                    <span className="text-2xl font-bold text-accent">$202 USD</span>
                  </div>
                  <p className="text-center text-gray-700">Al iniciar (+ $40+$4+$18 hosting, mailbox, dominio)</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 bg-accent/10 p-6 rounded-lg border-l-4 border-accent">
            <p className="text-gray-800"><strong>💳 Gestión mensual:</strong> $15/mes (se descuenta automáticamente o se factura)</p>
            <p className="text-gray-700 mt-2 text-sm">A las opciones de pago anterior se suman los costos iniciales de hosting, mailbox y dominio, excepto la gestión del sitio web, el cual se cobra por separado a partir del primer mes de despliegue en la web, con pagos mensuales.</p>
          </motion.div>
        </div>
      </section>

      {/* Bonus Exclusivo */}
      <section className="py-16 px-4 bg-gradient-to-r from-accent/10 to-accent/20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-r from-accent to-accent-dark rounded-2xl p-8 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">🎁 BONUS EXCLUSIVO</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md"><div className="text-4xl mb-3">🎨</div><p className="font-bold text-lg text-gray-900">Rediseño de marca simple</p><p className="text-gray-700">Logo adaptado</p></div>
              <div className="bg-white rounded-lg p-6 shadow-md"><div className="text-4xl mb-3">📣</div><p className="font-bold text-lg text-gray-900">5 Banners para Redes</p><p className="text-gray-700">Para campañas y anuncios</p></div>
              <div className="bg-white rounded-lg p-6 shadow-md"><div className="text-4xl mb-3">📘</div><p className="font-bold text-lg text-gray-900">Guía de marketing digital</p><p className="text-gray-700">PDF profesional</p></div>
              <div className="bg-white rounded-lg p-6 shadow-md"><div className="text-4xl mb-3">🎓</div><p className="font-bold text-lg text-gray-900">Acceso a curso online</p><p className="text-gray-700">Gestión web</p></div>
              <div className="bg-white rounded-lg p-6 shadow-md"><div className="text-4xl mb-3">💰</div><p className="font-bold text-lg text-gray-900">Descuento 10%</p><p className="text-gray-700">En futuros servicios</p></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-2">
            <FaCalendar /> Tiempo de Entrega: 7-8 Semanas
          </h3>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="space-y-4">
              {[
                { week: 1, title: 'Workshop estratégico', description: 'Discovery (3 horas) y planificación', color: 'from-secondary via-secondary-light to-neutral-800' },
                { week: 2, title: 'Identidad visual', description: 'Rediseño de marca', color: 'from-primary via-primary-dark to-secondary' },
                { week: '3-4', title: 'Producción audiovisual', description: 'Fotos, video e infografías', color: 'from-accent via-accent-dark to-primary' },
                { week: '5-6', title: 'Desarrollo personalizado', description: 'Funcionalidades premium', color: 'from-primary to-primary-dark' },
                { week: 7, title: 'Marketing y capacitación', description: 'Estrategia y formación', color: 'from-accent to-accent-dark' },
                { week: 8, title: 'Lanzamiento', description: 'Coordinado y monitoreo inicial', color: 'from-secondary to-neutral-900' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
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
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">¿Listo para dominar tu mercado?</h2>
            <p className="text-xl text-gray-600 mb-8">IMPERIO DIGITAL es la opción para liderazgo y expansión.</p>
            <Link href="/#contacto" className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition-all transform hover:scale-105">
              Solicitar Presupuesto
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
