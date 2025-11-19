'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Logo from '@/img/logo_urbanisima_constructora_S.R.L.png'

export default function AnalisisRequisitos() {
  return (
    <section id="analisis" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Requerimientos solicitados por ti
          </h2>

          <div className="space-y-12">
            {/* Información General */}
            <InfoCard title="📋 Información general del cliente">
              <table className="w-full text-sm md:text-base">
                <tbody className="space-y-4">
                  <TableRow label="Empresa" value="Urbanísima Constructora S.R.L" />
                  <TableRow label="Sector" value="Construcción" />
                  <TableRow label="Ubicación" value="Calle 12/2da y 3ra, No 36, Ampliación de Marbella, Habana del Este, La Habana, Cuba" />
                  <TableRow label="Trayectoria" value="15 años en el mercado" />
                </tbody>
              </table>
            </InfoCard>

            {/* Propuesta de Valor */}
            <InfoCard title="🎯 Propuesta de valor y posicionamiento">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-primary mb-2">Descripción del negocio del cliente</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Servicios constructivos y de mantenimiento de áreas verdes</li>
                    <li>Comercialización de materiales de construcción y carpintería</li>
                    <li>Empresa enfocada en la excelencia</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-primary mb-2">Misión de Urbanísima Constructora S.R.L</h4>
                  <p className="text-gray-700">Brindar servicios generales de la construcción y satisfacer las necesidades del cliente.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-primary mb-2">Público objetivo</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Personas de 18 a 70 años</li>
                    <li>Ningún género tiene preferencia, ambos acceden por igual</li>
                    <li>Todos sus clientes tienen oportunidades en Urbanísima Constructora S.R.L</li>
                    <li>Están ubicados en Marbella, Habana del Este, La Habana, Cuba</li>
                  </ul>
                </div>
              </div>
            </InfoCard>

            {/* Identidad Visual */}
            <InfoCard title="🎨 Identidad Visual">
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {/* Columna 1: Colores Corporativos */}
                <div>
                  <h4 className="font-bold text-lg mb-4 text-primary">Colores Corporativos</h4>
                  <p className="text-sm mb-4 text-gray-700">Deseados por ti</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary rounded-lg shadow-md border-4 border-primary flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Rojo</p>
                        <p className="text-sm text-gray-600">#DC2626</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-black rounded-lg shadow-md border-4 border-black flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Negro</p>
                        <p className="text-sm text-gray-600">#000000</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Colores a evitar */}
                <div>
                  <h4 className="font-bold text-lg mb-4 text-primary">Colores a evitar</h4>
                  <p className="text-sm mb-4 text-gray-700">Evitar su uso en todo el sitio</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-pink-500 rounded-lg shadow-md border-4 border-pink-500 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Rosado</p>
                      <p className="text-sm text-gray-600">#FFC0CB</p>
                    </div>
                  </div>
                </div>

                {/* Columna 3: Estilo visual */}
                <div>
                  <h4 className="font-bold text-lg mb-4 text-primary">Estilo visual</h4>
                  <p className="text-sm mb-4 text-gray-700">Profesional y Corporativo</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-primary rounded-lg shadow-md border-4 border-primary mb-2"></div>
                      <p className="font-semibold text-xs text-gray-900">Rojo</p>
                      <p className="text-xs text-gray-600">#DC2626</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-black rounded-lg shadow-md border-4 border-black mb-2"></div>
                      <p className="font-semibold text-xs text-gray-900">Negro</p>
                      <p className="text-xs text-gray-600">#000000</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-black rounded-lg shadow-md mb-2"></div>
                      <p className="font-semibold text-xs text-gray-900">Mixto</p>
                      <p className="text-xs text-gray-600">Rojo-Negro</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-accent rounded-lg shadow-md border-4 border-accent mb-2"></div>
                      <p className="font-semibold text-xs text-gray-900">Dorado</p>
                      <p className="text-xs text-gray-600">#F59E0B</p>
                    </div>
                  </div>
                </div>

                {/* Columna 4: Logo de tu negocio */}
                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
                  <h4 className="font-bold text-lg mb-6 text-primary">Logo</h4>
                  <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md">
                    <Image
                      src={Logo}
                      alt="Logo de Urbanísima Constructora S.R.L"
                      width={Math.max(80, Math.round(Logo.width * 0.4))}
                      height={Math.round(Logo.height * (Math.max(80, Math.round(Logo.width * 0.4)) / Logo.width))}
                      className="rounded-lg"
                      placeholder="empty"
                      sizes="(max-width: 768px) 150px, 200px"
                      priority
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="font-bold mb-2">Contenido que tienes</h4>
                <div className="space-y-2 mt-4">
                  {[
                    { item: 'Videos corporativos', status: '✅ Está disponible', note: 'El cliente cuenta con el material' },
                    { item: 'Textos/Contenidos', status: '❌ No Disponible', note: 'Será desarrollados por el nosotros' },
                    { item: 'Manual de identidad visual', status: '❌ No Disponible', note: 'Será creado una versión básica, cuya propiedad será nuestra. Puedes adquirir la versión profesional con un costo adicional' },
                  ].map((item) => (
                    <div key={item.item} className="flex justify-between items-start p-4 border-l-4 border-primary bg-primary/5 rounded">
                      <div>
                        <p className="font-bold text-gray-900">{item.item}</p>
                        <p className="text-sm text-gray-600">{item.note}</p>
                      </div>
                      <span className="font-bold text-primary">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>

            {/* Objetivos del Sitio */}
            <InfoCard title="💼 Objetivos principales del Sitio Web">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-lg text-primary mb-3">Metas Principales</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Mostrar el catálogo de productos/servicios que ofreces</li>
                    <li>Educar a tus clientes sobre el correcto uso de los productos/servicios que ofertas</li>
                    <li>Informar sobre las novedades de los productos/servicios que ofertas</li>
                    <li>Establecer credibilidad sobre tu negocio</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-primary mb-3">Acciones Esperadas de los visitantes del Sitio Web</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>✅ Contactarte por WhatsApp</li>
                    <li>✅ Llamarte por teléfono</li>
                    <li>✅ Visitar tu establecimiento o negocio</li>
                    <li>✅ Seguirte a ti y a tu negocio en redes sociales</li>
                    <li>✅ Suscribirse a noticias por correo</li>
                  </ul>
                </div>
              </div>
            </InfoCard>

            {/* Estructura del Catálogo */}
            <InfoCard title="📄 Estructura y contenido del Sitio Web">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-lg text-primary mb-3">Páginas/Secciones requeridas</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Catálogo de Productos/Servicios que ofreces</li>
                    <li>Galería de Proyectos/Trabajos realizados por tu negocio</li>
                    <li>Página de Contacto</li>
                    <li>Ubicación/Cómo Llegar a tu negocio (Google Maps)</li>
                    <li>Nosotros/Quiénes Somos</li>
                    <li>Blog/Noticias</li>
                    <li>Enlaces a Redes Sociales (Facebook, Instagram, YouTube, TikTok, Telegram)</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-primary mb-3">Especificaciones a mostrar en el Catálogo</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <TableRow label="Cantidad de Productos" value="~10 productos" />
                      <TableRow label="Categorías Principales" value="1 categoría principal" />
                      <TableRow label="Fotos por Producto" value="4 fotografías" />
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                  <h4 className="font-bold text-lg text-primary mb-3 mt-5">Información a mostrar por producto</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Nombre',
                      'Descripción corta',
                      'Descripción detallada',
                      'Fotografías (4 por producto)',
                      'Especificaciones técnicas',
                      'Precio referencial',
                      'Disponibilidad',
                      'Videos demostrativos',
                      'Documentos descargables (fichas técnicas)',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-gray-700 bg-accent/10 p-2 rounded">
                        <span className="text-primary font-bold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </InfoCard>

            {/* Funcionalidades */}
            <InfoCard title="🔧 Funcionalidades especiales requeridas">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-lg text-primary mb-3">Características del Sitio Web</h4>
                  <ul className="space-y-2 text-gray-700">
                    {[
                      'Buscador de productos',
                      'Filtros por categoría/características',
                      'Comparador de productos',
                      'Chat vía WhatsApp',
                      'Integración con Google Maps',
                      'Calendario de eventos/disponibilidad',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="text-accent font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-primary mb-3">Integraciones Digitales</h4>
                  <ul className="space-y-2 text-gray-700">
                    {[
                      'Facebook (enlace/referencias)',
                      'Instagram (enlace/referencias)',
                      'YouTube (enlace/referencias)',
                      'TikTok (enlace/referencias)',
                      'Telegram (enlace/referencias)',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="text-accent font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </InfoCard>

          </div>
        </motion.div>
      </div>
    </section>
  )
}

function InfoCard({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-primary"
    >
      <h3 className="text-2xl font-bold mb-6 text-gray-900">{title}</h3>
      {children}
    </motion.div>
  )
}

function TableRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4 font-semibold text-gray-900 w-1/3">{label}</td>
      <td className="py-3 px-4 text-gray-700">{value}</td>
    </tr>
  )
}
