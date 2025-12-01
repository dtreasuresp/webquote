'use client'

import { motion } from 'framer-motion'
import { FaClipboardList, FaImage } from 'react-icons/fa'
import type { AnalisisRequisitosData } from '@/lib/types'

interface AnalisisRequisitosProps {
  readonly data?: AnalisisRequisitosData
}

export default function AnalisisRequisitos({ data }: AnalisisRequisitosProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const analisisData = data
  return (
    <section id="analisis" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-info-bg rounded-full mb-4">
              <FaClipboardList className="text-light-accent" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {analisisData.titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {analisisData.subtitulo}
            </p>
          </div>

          <div className="space-y-8">
            {/* Información General */}
            <InfoCard title="📋 Información general del cliente">
              <table className="w-full text-sm">
                <tbody>
                  <TableRow label="Empresa" value={analisisData.informacionCliente.empresa} />
                  <TableRow label="Sector" value={analisisData.informacionCliente.sector} />
                  <TableRow label="Ubicación" value={analisisData.informacionCliente.ubicacion} />
                  <TableRow label="Trayectoria" value={analisisData.informacionCliente.trayectoria} />
                </tbody>
              </table>
            </InfoCard>

            {/* Propuesta de Valor */}
            <InfoCard title="🎯 Propuesta de valor y posicionamiento">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-light-text mb-2">Descripción del negocio</h4>
                  <ul className="list-disc list-inside space-y-1 text-light-text-secondary text-sm">
                    {analisisData.propuestaValor.descripcionNegocio.map((item) => (
                      <li key={`desc-${item.slice(0, 30).replaceAll(' ', '-')}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-light-text mb-2">Misión</h4>
                  <p className="text-light-text-secondary text-sm">{analisisData.propuestaValor.mision}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-light-text mb-2">Público objetivo</h4>
                  <ul className="list-disc list-inside space-y-1 text-light-text-secondary text-sm">
                    {analisisData.propuestaValor.publicoObjetivo.map((item) => (
                      <li key={`pub-${item.slice(0, 30).replaceAll(' ', '-')}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </InfoCard>

            {/* Identidad Visual */}
            <InfoCard title="🎨 Identidad Visual">
              <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-6 mb-6">
                {/* Columna 1: Colores Corporativos */}
                <div>
                  <h4 className="font-semibold mb-3 text-light-text">Colores Corporativos</h4>
                  <p className="text-xs mb-3 text-light-text-secondary">Paleta definida</p>
                  <div className="grid grid-cols-2 gap-3">
                    {analisisData.identidadVisual.coloresCorporativos.map((color) => (
                      <div key={`corp-color-${color.hex}`} className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-md border border-light-border flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-light-text text-xs truncate">{color.nombre}</p>
                          <p className="text-[10px] text-light-text-secondary uppercase">{color.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna 2: Colores a evitar */}
                {analisisData.identidadVisual.coloresEvitar.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-light-text">Colores a evitar</h4>
                    <p className="text-xs mb-3 text-light-text-secondary">No usar en el sitio</p>
                    <div className="space-y-3">
                      {analisisData.identidadVisual.coloresEvitar.map((color) => (
                        <div key={`evitar-color-${color.hex}`} className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-md border border-light-border flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <p className="font-medium text-light-text text-sm">{color.nombre}</p>
                            <p className="text-xs text-light-text-secondary uppercase">{color.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Columna 3: Estilo visual */}
                <div>
                  <h4 className="font-semibold mb-3 text-light-text">Estilo visual</h4>
                  <p className="text-sm text-light-text-secondary">{analisisData.identidadVisual.estiloVisual}</p>
                </div>

                {/* Columna 4: Logo */}
                <div className="flex flex-col items-center justify-center p-4 bg-light-bg rounded-md border border-light-border">
                  <h4 className="font-semibold mb-4 text-light-text">Logo</h4>
                  <div className="flex items-center justify-center p-3 bg-white rounded-md border border-light-border">
                    {analisisData.identidadVisual.logoCorporativo ? (
                      <img 
                        src={analisisData.identidadVisual.logoCorporativo} 
                        alt="Logo corporativo"
                        className="max-w-[150px] max-h-[100px] object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-light-text-muted p-4">
                        <FaImage className="text-3xl mb-2" />
                        <span className="text-xs">Sin logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido disponible */}
              {analisisData.identidadVisual.contenidoDisponible.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-light-text">Contenido disponible</h4>
                  <div className="space-y-2">
                    {analisisData.identidadVisual.contenidoDisponible.map((item) => (
                      <div key={`contenido-${item.item.slice(0, 20).replaceAll(' ', '-')}`} className="flex justify-between items-start p-3 border-l-2 border-light-accent bg-light-accent/5 rounded-md">
                        <div>
                          <p className="font-medium text-light-text text-sm">{item.item}</p>
                          <p className="text-xs text-light-text-secondary">{item.note}</p>
                        </div>
                        <span className="font-medium text-light-accent text-sm">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </InfoCard>

            {/* Objetivos del Sitio */}
            <InfoCard title="💼 Objetivos principales del Sitio Web">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-light-text mb-3">Metas Principales</h4>
                  <ol className="list-decimal list-inside space-y-1 text-light-text-secondary text-sm">
                    {analisisData.objetivosSitio.metasPrincipales.map((item) => (
                      <li key={`meta-${item.slice(0, 30).replaceAll(' ', '-')}`}>{item}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-light-text mb-3">Acciones Esperadas de los visitantes</h4>
                  <ul className="list-none space-y-1 text-light-text-secondary text-sm">
                    {analisisData.objetivosSitio.accionesEsperadas.map((item) => (
                      <li key={`accion-${item.slice(0, 30).replaceAll(' ', '-')}`} className="flex items-center gap-2">
                        <span className="text-light-success">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </InfoCard>

            {/* Estructura del Catálogo */}
            <InfoCard title="📄 Estructura y contenido del Sitio Web">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-light-text mb-3">Páginas/Secciones requeridas</h4>
                  <ol className="list-decimal list-inside space-y-1 text-light-text-secondary text-sm">
                    {analisisData.estructuraCatalogo.paginasRequeridas.map((item) => (
                      <li key={`pagina-${item.replaceAll(' ', '-')}`}>{item}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-light-text mb-3">Especificaciones del Catálogo</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <TableRow label="Cantidad de Productos" value={analisisData.estructuraCatalogo.cantidadProductos} />
                      <TableRow label="Categorías Principales" value={analisisData.estructuraCatalogo.categoriasPrincipales} />
                      <TableRow label="Fotos por Producto" value={analisisData.estructuraCatalogo.fotosPorProducto} />
                    </tbody>
                  </table>
                </div>
              </div>
              {analisisData.estructuraCatalogo.infoProducto.length > 0 && (
                <div>
                  <h4 className="font-semibold text-light-text mb-3 mt-5">Información a mostrar por producto</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {analisisData.estructuraCatalogo.infoProducto.map((item) => (
                      <div key={`info-${item.replaceAll(' ', '-')}`} className="flex items-center gap-2 text-light-text-secondary bg-light-accent/5 p-2 rounded-md text-sm">
                        <span className="text-light-success">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </InfoCard>

            {/* Funcionalidades */}
            <InfoCard title="🔧 Funcionalidades especiales requeridas">
              <div className="grid md:grid-cols-[3fr_1fr] gap-6 items-top">
                <div>
                  <h4 className="font-semibold text-light-text mb-3">Características a implementar en la Tienda Virtual</h4>
                  <ul className="space-y-1 text-light-text-secondary text-sm grid md:grid-cols-[1fr_1fr] gap-2">
                    {analisisData.funcionalidades.caracteristicas.map((item) => (
                      <li key={`caract-${item.replaceAll(' ', '-')}`} className="flex items-center gap-2">
                        <span className="text-light-success">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-light-text mb-3">Integraciones Digitales</h4>
                  <ul className="space-y-1 text-light-text-secondary text-sm">
                    {analisisData.funcionalidades.integraciones.map((item) => (
                      <li key={`integ-${item.replaceAll(' ', '-')}`} className="flex items-center gap-2">
                        <span className="text-light-success">✓</span>
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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-light-bg p-6 rounded-md border border-light-border"
    >
      <h3 className="text-lg font-semibold mb-4 text-light-text">{title}</h3>
      {children}
    </motion.div>
  )
}

function TableRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <tr className="border-b border-light-border hover:bg-light-bg-secondary/50">
      <td className="py-2.5 px-3 font-medium text-light-text w-1/3">{label}</td>
      <td className="py-2.5 px-3 text-light-text-secondary">{value}</td>
    </tr>
  )
}
