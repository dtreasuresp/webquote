'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowLeft, FaCheckCircle, FaCalendar, FaCreditCard } from 'react-icons/fa'

export default function ConstructorPage() {
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
      <section className="py-12 px-4 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">🥉</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Paquete Básico
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              CONSTRUCTOR
            </h2>
            <p className="text-xl md:text-2xl mb-6 text-white">
              Presencia digital confiable, simple pero efectiva
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-5xl font-bold mb-2">$200 USD</div>
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
                <h4 className="text-xl font-bold text-secondary mb-3">💰 Presupuesto</h4>
                <p className="text-gray-700">
                  Empresas que buscan presencia digital confiable con presupuesto limitado.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-8 rounded-xl border-2 border-primary">
                <h4 className="text-xl font-bold text-secondary mb-3">⚡ Inicio Rápido</h4>
                <p className="text-gray-700">
                  Comenzar sin inversión excesiva, manteniendo profesionalismo total.
                </p>
              </div>
              <div className="bg-gradient-to-br from-secondary/10 to-neutral-200 p-8 rounded-xl border-2 border-secondary">
                <h4 className="text-xl font-bold text-secondary mb-3">📝 Actualizaciones</h4>
                <p className="text-gray-700">
                  Ideal para catálogos pequeños-medianos con cambios ocasionales.
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
                  <td className="px-6 py-4 text-primary font-bold">$28 USD/mes</td>
                  <td className="px-6 py-4 text-primary font-bold">$252 USD/año (9 meses)</td>
                  <td className="px-6 py-4 text-gray-600">Costo mensual del servidor</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Mailbox (0-3 meses)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-accent font-bold">$0 USD (Gratis)</td>
                  <td className="px-6 py-4 text-gray-600">Cuentas de correo corporativo</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-accent/5">
                  <td className="px-6 py-4 font-semibold">Mailbox (desde 4 meses)</td>
                  <td className="px-6 py-4 text-primary font-bold">$4 USD/mes</td>
                  <td className="px-6 py-4 text-primary font-bold">$36 USD/año (9 meses)</td>
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
                  <td className="px-6 py-4 text-primary font-bold">$18 USD/año</td>
                  <td className="px-6 py-4 text-primary font-bold">$108 USD/año (6 meses)</td>
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
                  <th className="px-6 py-3 text-left">Especificación</th>
                  <th className="px-6 py-3 text-left">Costo mensual</th>
                  <th className="px-6 py-3 text-left">Costo anual</th>
                  <th className="px-6 py-3 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">SSL/HTTPS</td>
                  <td className="px-6 py-4 font-semibold">Automático</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Certificado de seguridad incluido</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Almacenamiento</td>
                  <td className="px-6 py-4 font-bold">6-20 GB (SSD)</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Espacio eficiente</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Ancho de banda</td>
                  <td className="px-6 py-4 font-bold text-accent">Ilimitado ∞</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Tráfico sin restricciones</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Uptime</td>
                  <td className="px-6 py-4 font-bold text-accent">99.9%</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Disponibilidad garantizada</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Backup automático</td>
                  <td className="px-6 py-4 font-bold">Diario</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Copias de seguridad protegidas</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Soporte hosting</td>
                  <td className="px-6 py-4 font-bold">24/7</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-accent font-bold">Gratis</td>
                  <td className="px-6 py-4 text-gray-600">Siempre disponible. Resolución en 6 horas como máximo</td>
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
      <section className="py-16 px-4 bg-gray-50">
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
      <section className="py-16 px-4">
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">🎓 Capacitación y Soporte</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-8 rounded-xl">
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

            <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-8 rounded-xl">
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
          <div className="mt-8 bg-gradient-to-r from-accent/10 to-accent/20 p-8 rounded-xl">
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
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">💰 Inversión Anual</h3>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Periodo</th>
                  <th className="px-6 py-3 text-center">Desarrollo</th>
                  <th className="px-6 py-3 text-center">Hosting</th>
                  <th className="px-6 py-3 text-center">Mailbox</th>
                  <th className="px-6 py-3 text-center">Dominio</th>
                  <th className="px-6 py-3 text-center">Gestión</th>
                  <th className="px-6 py-3 text-center">Costo anual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-accent/5 font-bold hover:bg-accent/10">
                  <td className="px-6 py-4">Pago Inicial</td>
                  <td className="px-6 py-4 text-center">$150</td>
                  <td className="px-6 py-4 text-center">$28</td>
                  <td className="px-6 py-4 text-center">$4</td>
                  <td className="px-6 py-4 text-center">$18</td>
                  <td className="px-6 py-4 text-center">$0 USD</td>
                  <td className="px-6 py-4 text-center text-primary">$200 USD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">3 Meses (Gratis)</td>
                  <td className="px-6 py-4 text-center text-accent">N/A</td>
                  <td className="px-6 py-4 text-center text-accent">$0</td>
                  <td className="px-6 py-4 text-center text-accent">$0</td>
                  <td className="px-6 py-4 text-center text-accent">$0</td>
                  <td className="px-6 py-4 text-center text-accent">$16</td>
                  <td className="px-6 py-4 text-center text-accent font-bold">$16 USD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Año 1 (meses 4–12)</td>
                  <td className="px-6 py-4 text-center text-accent">N/A</td>
                  <td className="px-6 py-4 text-center">$252</td>
                  <td className="px-6 py-4 text-center">$36</td>
                  <td className="px-6 py-4 text-center">$162</td>
                  <td className="px-6 py-4 text-center">$64</td>
                  <td className="px-6 py-4 text-center font-bold">$306 USD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">Año 2+</td>
                  <td className="px-6 py-4 text-center text-accent">N/A</td>
                  <td className="px-6 py-4 text-center">$252</td>
                  <td className="px-6 py-4 text-center">$36</td>
                  <td className="px-6 py-4 text-center">$162</td>
                  <td className="px-6 py-4 text-center">$88</td>
                  <td className="px-6 py-4 text-center font-bold">$538 USD</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-600 mt-3">
              ➡️ Nota: La <strong>gestión mensual ($8/mes)</strong> inicia desde el mes 2 (1 mes gratis).
            </p>
          </motion.div>
        </div>
      </section>

      {/* Opciones de Pago */}
      <section className="py-16 px-4 bg-gray-50">
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
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">📊 Opción 1: 2 pagos</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Pago 1 (50%)</span>
                  <span className="text-lg font-bold text-gray-900">$75 USD</span>
                </div>
                <p className="text-center text-gray-600">Al iniciar</p>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Pago 2 (50%)</span>
                  <span className="text-lg font-bold text-gray-900">$75 USD</span>
                </div>
                <p className="text-center text-gray-600">Al publicar</p>

                <div className="border-t-2 border-gray-300 pt-4">
                  <p className="text-center font-bold text-gray-900">Total desarrollo: $150 USD</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-accent">
              <h4 className="text-2xl font-bold text-accent-dark mb-4">🎁 Opción 2: Pago único</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-semibold text-gray-900">Pago adelantado</span>
                  <span className="text-lg font-bold text-accent">$150 USD</span>
                </div>
                <p className="text-center text-gray-700">El pago único adelantado sólo es para el desarrollo del sitio</p>
                <p className="text-center font-bold text-gray-900">El costo de la infraestructura y la gestión se facturan aparte</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 bg-accent/10 p-6 rounded-lg border-l-4 border-accent"
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
      <section className="py-16 px-4">
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
