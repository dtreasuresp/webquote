'use client'

import { motion } from 'framer-motion'
import { FaStar, FaBox, FaCheck } from 'react-icons/fa'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import type { OtroServicioSnapshot } from '@/lib/types'
import { spring, fluentShadow } from '@/lib/animations/config'
import { 
  FluentReveal, 
  FluentRevealGroup, 
  FluentRevealItem,
  FluentGlass,
  FluentSurface,
  FluentHover,
  FluentTap
} from '@/components/motion'

function slugify(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .split('')
    .filter((c) => {
      const cp = c.codePointAt(0) ?? 0
      return cp < 0x0300 || cp > 0x036f
    })
    .join('')
    .split(/[^a-z0-9\s-]/u)
    .join('')
    .trim()
    .split(/\s+/)
    .join('-')
}

// Función para parsear semanas desde tiempoEntrega
function parseSemanasFromTiempoEntrega(tiempoEntrega: string): number | null {
  if (!tiempoEntrega) return null
  
  // Buscar patrones como "4 semanas", "5-6 semanas", "4-6 Semanas"
  const semanasMatch = tiempoEntrega.match(/(\d+)(?:-(\d+))?\s*semanas?/i)
  if (semanasMatch) {
    // Si es rango (5-6), usar el mayor
    return semanasMatch[2] ? parseInt(semanasMatch[2]) : parseInt(semanasMatch[1])
  }
  
  // Si dice "días", convertir a semanas
  const diasMatch = tiempoEntrega.match(/(\d+)\s*d[ií]as?/i)
  if (diasMatch) {
    return Math.ceil(parseInt(diasMatch[1]) / 7)
  }
  
  return null // No se pudo parsear
}

interface PackageData {
  id: string
  nombre: string
  slug: string
  href: string
  icon: string
  nivelProfesional: string
  tipo?: string
  subtitulo: string
  pagoInicial: number
  inversionAnio1: number
  description: string
  features: Array<{ category: string; items: string[] }>
  serviciosOpcionales?: Array<{ nombre: string; precio: number; mesesGratis: number; mesesPago: number; acumulado: number }>
  pages: string  // Opcional - si vacío no se muestra
  timelineWeeks: number | null  // Opcional - si null no se muestra
  colorScheme: 'rojo' | 'dorado' | 'negro' | 'neutro'
  recomendado: boolean
}

export default function Paquetes() {
  const { snapshots, loading } = useSnapshots()

  const activos = snapshots.filter((s) => s.activo)

  // Calcular inversión año 1 y datos por paquete
  const paquetesData: PackageData[] = activos.map((snap) => {
    const pagoInicial = snap.costos.inicial || 0
    const inversionAnio1 = snap.costos.año1 || 0

    // Construcción de features
    const features: Array<{ category: string; items: string[] }> = []
    for (const srv of snap.serviciosBase) {
      if (srv.nombre.toLowerCase() !== 'gestión') {
        const mesesGratis = srv.mesesGratis || 3
        const mesesPago = srv.mesesPago || 9
        const price = srv.precio || 0
        const acumulado = price * mesesPago
        features.push({
          category: srv.nombre,
          items: [`$${price} USD/mes ($${acumulado} USD/${mesesGratis}m gratis/${mesesPago}m pago)`],
        })
      }
    }

    // Servicios opcionales
    const serviciosOpcionales =
      snap.otrosServicios && snap.otrosServicios.length > 0
        ? snap.otrosServicios.map((s: OtroServicioSnapshot) => ({
            nombre: s.nombre,
            precio: s.precio || 0,
            mesesGratis: s.mesesGratis || 0,
            mesesPago: s.mesesPago || 12,
            acumulado: (s.precio || 0) * (s.mesesPago || 12),
          }))
        : undefined

    // Páginas desde datos del paquete (opcional)
    const pages = snap.paquete.cantidadPaginas || ''

    // Semanas desde tiempoEntrega (parsear si es posible)
    const timelineWeeks = parseSemanasFromTiempoEntrega(snap.paquete.tiempoEntrega || '')

    // Nivel profesional basado en tipo o nombre
    const nombreUpper = snap.nombre.toUpperCase()
    let nivelProfesional = snap.paquete.tipo || 'ESTÁNDAR'
    if (!snap.paquete.tipo) {
      if (nombreUpper.includes('CONSTRUCTOR')) {
        nivelProfesional = 'BÁSICO'
      } else if (nombreUpper.includes('OBRA')) {
        nivelProfesional = 'PROFESIONAL'
      } else if (nombreUpper.includes('IMPERIO')) {
        nivelProfesional = 'PREMIUM'
      }
    }

    return {
      id: snap.id,
      nombre: nombreUpper,
      slug: slugify(snap.nombre),
      href: `/paquete/${slugify(snap.nombre)}`,
      icon: '🎁',
      nivelProfesional,
      tipo: snap.paquete.tipo || '',
      subtitulo: `VALOR DEL CONTRATO: $${inversionAnio1} USD`,
      pagoInicial,
      inversionAnio1,
      description: snap.paquete.descripcion || `Paquete personalizado para empresas.`,
      features,
      serviciosOpcionales,
      pages,
      timelineWeeks,
      colorScheme: 'neutro',
      recomendado: false,
    }
  })

  // Asignar colores y emojis según inversión
  if (paquetesData.length > 0) {
    // Sort por inversión (año1)
    paquetesData.sort((a, b) => a.inversionAnio1 - b.inversionAnio1)

    // Asignar emojis según cantidad de paquetes
    if (paquetesData.length <= 3) {
      // Solo medallas: 🥉, 🥈, 🥇
      const iconos = ['🥉', '🥈', '🥇']
      for (let idx = 0; idx < paquetesData.length; idx += 1) {
        paquetesData[idx].icon = iconos[idx]
      }
    } else {
      // Con estrella para el de mayor inversión: 🥉, 🥈, ..., ⭐
      // Todos empiezan como 🥉, 🥈, ..., 🥇
      const iconos = ['🥉', '🥈', '🥇']
      for (let idx = 0; idx < paquetesData.length - 1; idx += 1) {
        if (idx < iconos.length) {
          paquetesData[idx].icon = iconos[idx]
        } else {
          paquetesData[idx].icon = '🥇' // Medalla de oro para los intermedios si hay más de 4
        }
      }
      // El último (mayor inversión) recibe la estrella
      paquetesData[paquetesData.length - 1].icon = '⭐'
    }

    // Asignar colores
    // Rojo: menor costo (primer elemento)
    paquetesData[0].colorScheme = 'rojo'

    // Dorado: segundo elemento O si es ⭐ (VIP)
    if (paquetesData.length >= 2) {
      if (paquetesData[1].icon === '⭐') {
        paquetesData[1].colorScheme = 'dorado'
      } else {
        paquetesData[1].colorScheme = 'dorado'
        paquetesData[1].recomendado = true
      }
    }

    // Si hay ⭐ en posición 2 (índice 2), siempre dorado
    if (paquetesData.length >= 3 && paquetesData[2].icon === '⭐') {
      paquetesData[2].colorScheme = 'dorado'
    }

    // Negro: mayor costo (último elemento)
    if (paquetesData.length > 1) {
      paquetesData.at(-1)!.colorScheme = 'negro'
    }
  }

  return (
    <section id="paquetes" className="py-10 md:py-14 px-4 bg-gradient-to-b from-light-bg via-light-bg-secondary to-white font-github">
      <div className="max-w-6xl mx-auto">
        {/* Header con FluentReveal */}
        <FluentReveal direction="up" blur delay={0.1}>
          <div className="text-center mb-6">
            <FluentHover effect="scale" scaleAmount={1.1}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-5 shadow-lg">
                <FaBox className="text-white" size={28} />
              </div>
            </FluentHover>
            <h2 className="text-3xl md:text-4xl font-bold text-light-text mb-3 tracking-tight">
              Paquetes de Servicios
            </h2>
            <p className="text-lg text-light-text-secondary max-w-xl mx-auto">
              Opciones diseñadas para diferentes necesidades y presupuestos
            </p>
          </div>
        </FluentReveal>

        <FluentRevealGroup stagger={0.1} delay={0.2}>
          <div className={`grid ${activos.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6`}>
            {loading && (
              <>
                {['skel-1', 'skel-2', 'skel-3'].map((id) => (
                  <FluentRevealItem key={id}>
                    <FluentGlass 
                      preset="light" 
                      rounded="2xl" 
                      className="p-6 animate-pulse h-96"
                    />
                  </FluentRevealItem>
                ))}
              </>
            )}
            {!loading &&
              paquetesData.map((paquete) => (
                <FluentRevealItem key={paquete.id}>
                  <PaqueteCard data={paquete} />
                </FluentRevealItem>
              ))}
          </div>
        </FluentRevealGroup>

        {/* Lo que siempre está incluido - con FluentGlass */}
        <FluentReveal direction="up" blur delay={0.4}>
          <FluentGlass 
            preset="frosted" 
            rounded="2xl" 
            elevateOnHover 
            className="mt-14 p-8 border border-light-border/50"
          >
            <FluentHover effect="lift" liftAmount={2}>
              <h3 className="text-xl font-bold mb-6 text-light-text flex items-center gap-3">
                <motion.span 
                  className="text-2xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={spring.fluentBouncy}
                >
                  🎁
                </motion.span> 
                ¿QUÉ ESTÁ INCLUIDO SIEMPRE?
              </h3>
            </FluentHover>
            <p className="text-light-text-secondary mb-8 text-base leading-relaxed">
              Independientemente del paquete que elijas, todos incluyen 3 meses gratis de Hosting y Mailbox, 6 meses de Dominio y 1 mes gratis de gestión de contenidos. También ofrecemos actualizaciones planificadas libres de costo en dependencia del paquete contratado. Además de lo anterior siempre recibes:
            </p>

            <FluentRevealGroup stagger={0.08}>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: '🔒 SEGURIDAD',
                    gradient: 'from-green-500/10 to-emerald-500/5',
                    borderColor: 'border-green-500/20',
                    items: [
                      'Certificado SSL (candado 🔒 en el navegador)',
                      'Protección contra ataques',
                      'Backups automáticos periódicos',
                      'Actualización de seguridad',
                    ]
                  },
                  {
                    title: '⚡ RENDIMIENTO',
                    gradient: 'from-yellow-500/10 to-amber-500/5',
                    borderColor: 'border-yellow-500/20',
                    items: [
                      'Velocidad de carga optimizada',
                      'Funciona perfectamente en móvil',
                      'Servidor rápido y confiable',
                      'Disponibilidad del 99.9% de tu sitio web en internet',
                    ]
                  },
                  {
                    title: '📈 POSICIONAMIENTO',
                    gradient: 'from-blue-500/10 to-cyan-500/5',
                    borderColor: 'border-blue-500/20',
                    items: [
                      'Optimizado para aparecer en Google',
                      'Reportes de tráfico',
                      'Sugerencias de mejora continua',
                    ]
                  },
                  {
                    title: '🎓 CAPACITACIÓN',
                    gradient: 'from-purple-500/10 to-violet-500/5',
                    borderColor: 'border-purple-500/20',
                    items: [
                      '2-6 horas según paquete contratado',
                      'Manual de usuario',
                      'Soporte',
                    ]
                  },
                ].map((section) => (
                  <FluentRevealItem key={section.title}>
                    <FluentSurface 
                      elevation="raised" 
                      elevateOnHover 
                      rounded="xl" 
                      bordered={false}
                      className={`bg-gradient-to-br ${section.gradient} p-5 border ${section.borderColor} h-full`}
                    >
                      <h4 className="font-bold mb-4 text-light-text text-sm">{section.title}</h4>
                      <ul className="space-y-2.5">
                        {section.items.map((item) => (
                          <FluentHover key={`${section.title}-${item}`} effect="none">
                            <motion.li 
                              className="flex items-start gap-2 text-sm text-light-text-secondary"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FaCheck className="text-light-success mt-0.5 flex-shrink-0" size={12} />
                              <span>{item}</span>
                            </motion.li>
                          </FluentHover>
                        ))}
                      </ul>
                    </FluentSurface>
                  </FluentRevealItem>
                ))}
              </div>
            </FluentRevealGroup>
          </FluentGlass>
        </FluentReveal>
      </div>
    </section>
  )
}

function PaqueteCard({
  data,
}: Readonly<{
  data: PackageData
}>) {
  const getCardStyles = () => {
    if (data.colorScheme === 'dorado') {
      return {
        container: 'bg-white/80 backdrop-blur-sm border-2 border-light-warning',
        gradient: 'from-light-warning/10 to-amber-50',
        badge: 'bg-gradient-to-r from-light-warning to-amber-500 text-white',
        priceBox: 'bg-gradient-to-r from-light-warning/10 to-amber-50 border-l-4 border-light-warning',
        priceText: 'text-light-warning',
        iconBg: 'bg-gradient-to-br from-light-warning to-amber-500',
        hoverShadow: fluentShadow.glowWarning,
        button: 'bg-gradient-to-r from-light-warning to-amber-500 text-white hover:shadow-lg',
      }
    }
    if (data.colorScheme === 'rojo') {
      return {
        container: 'bg-white/80 backdrop-blur-sm border border-light-danger/40',
        gradient: 'from-red-50 to-rose-50',
        badge: '',
        priceBox: 'bg-gradient-to-r from-light-danger/10 to-rose-50 border-l-4 border-light-danger',
        priceText: 'text-light-danger',
        iconBg: 'bg-gradient-to-br from-light-danger to-rose-500',
        hoverShadow: fluentShadow.glowDanger,
        button: 'bg-gradient-to-r from-light-danger to-rose-500 text-white hover:shadow-lg',
      }
    }
    if (data.colorScheme === 'negro') {
      return {
        container: 'bg-white/80 backdrop-blur-sm border border-gray-300',
        gradient: 'from-gray-50 to-slate-50',
        badge: '',
        priceBox: 'bg-gradient-to-r from-gray-100 to-slate-50 border-l-4 border-gray-700',
        priceText: 'text-gray-700',
        iconBg: 'bg-gradient-to-br from-gray-700 to-gray-900',
        hoverShadow: fluentShadow.elevated,
        button: 'bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:shadow-lg',
      }
    }
    // neutro
    return {
      container: 'bg-white/80 backdrop-blur-sm border border-light-border/50',
      gradient: 'from-light-bg-secondary to-white',
      badge: '',
      priceBox: 'bg-gradient-to-r from-light-bg-secondary to-white border-l-4 border-light-accent',
      priceText: 'text-light-accent',
      iconBg: 'bg-gradient-to-br from-light-accent to-blue-600',
      hoverShadow: fluentShadow.glow,
      button: 'bg-gradient-to-r from-light-accent to-blue-600 text-white hover:shadow-lg',
    }
  }

  const styles = getCardStyles()

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden transition-all ${styles.container}`}
      whileHover={{ 
        y: -6,
        boxShadow: styles.hoverShadow,
        transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] }
      }}
    >
      {/* Reservar espacio para badge */}
      <div className="h-[44px] relative">
        {data.recomendado && (
          <motion.div 
            className={`absolute top-0 left-0 right-0 ${styles.badge} py-2.5 text-center text-sm font-bold flex items-center justify-center gap-2 z-10`}
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={spring.fluentBouncy}
          >
            <FaStar className="text-xs" /> MÁS POPULAR
          </motion.div>
        )}
      </div>

      <div className="p-6 h-full flex flex-col">
        <div className="text-center mb-5 min-h-[110px] flex flex-col justify-center">
          <FluentHover effect="scale" scaleAmount={1.2}>
            <span className="text-4xl block">{data.icon}</span>
          </FluentHover>
          {data.tipo ? (
            <p className="mt-3 text-xs font-bold tracking-wider text-light-text-muted uppercase">{data.tipo}</p>
          ) : (
            <p className="mt-3 text-xs font-bold tracking-wider text-light-text-muted">{data.nivelProfesional}</p>
          )}
          <h3 className="text-lg font-bold text-light-text mt-2">{data.nombre}</h3>
          <p className={`${styles.priceText} font-bold text-sm`}>{data.subtitulo}</p>
        </div>

        <p className="text-light-text-secondary text-sm text-center mb-5 flex-grow min-h-[50px] leading-relaxed">{data.description}</p>

        <FluentHover effect="scale" scaleAmount={1.02}>
          <div className={`${styles.priceBox} p-4 rounded-xl mb-5`}>
            <p className="text-xs text-light-text-muted font-medium">Pago Inicial</p>
            <p className={`text-3xl font-bold ${styles.priceText}`}>${data.pagoInicial} <span className="text-base font-medium">USD</span></p>
          </div>
        </FluentHover>

        <div className="space-y-3 mb-5 flex-grow">
          {data.features.map((feature) => (
            <FluentHover key={`feat-${feature.category}`} effect="none">
              <motion.div 
                className="text-sm group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <p className="font-semibold text-light-text text-xs leading-tight group-hover:text-light-accent transition-colors">{feature.category}</p>
                <p className="text-light-text-secondary text-xs">{feature.items[0]}</p>
              </motion.div>
            </FluentHover>
          ))}

          {data.serviciosOpcionales && data.serviciosOpcionales.length > 0 && (
            <div key="opcionales" className="text-sm border-t border-light-border/50 pt-3 mt-3">
              <p className="font-semibold text-light-text text-xs leading-tight mb-1">Servicios Opcionales</p>
              {data.serviciosOpcionales.map((srv) => (
                <FluentHover key={srv.nombre} effect="none">
                  <motion.p 
                    className="text-light-text-secondary text-xs"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {srv.nombre}: ${srv.precio} USD/mes (${srv.acumulado} USD/{srv.mesesGratis}m gratis/{srv.mesesPago}m pago)
                  </motion.p>
                </FluentHover>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-light-border/50">
          <FluentHover effect="scale" scaleAmount={1.05}>
            <div className="text-center p-2 rounded-lg bg-light-bg-secondary/50">
              <p className={`text-2xl font-bold ${styles.priceText}`}>{data.pages}</p>
              <p className="text-xs text-light-text-muted font-medium">Páginas</p>
            </div>
          </FluentHover>
          <FluentHover effect="scale" scaleAmount={1.05}>
            <div className="text-center p-2 rounded-lg bg-light-bg-secondary/50">
              <p className={`text-2xl font-bold ${styles.priceText}`}>{data.timelineWeeks}</p>
              <p className="text-xs text-light-text-muted font-medium">Semanas</p>
            </div>
          </FluentHover>
        </div>

        <FluentTap>
          <a
            href={data.href}
            className={`hidden mt-5 py-3 px-4 rounded-xl font-semibold text-sm text-center transition-all ${styles.button}`}
          >
            Ver Detalles
          </a>
        </FluentTap>
      </div>
    </motion.div>
  )
}
