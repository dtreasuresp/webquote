'use client'

import { motion } from 'framer-motion'
import type { PresupuestoCronogramaData, MetodoPreferido, OpcionPago, ConfigDescuentos, CuotasData, PackageSnapshot } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal, FluentRevealGroup, FluentRevealItem } from '@/components/motion'
import { fluentSlideUp } from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'
import useSnapshots from '@/features/admin/hooks/useSnapshots'
import { 
  formatMetodoPago,
  getDescuentoResumen,
  agruparPorOpciones,
  agruparPorDescuentos,
  tieneDescuentosReales
} from '@/lib/utils/paymentComparison'

interface MetodosPagoPublicProps {
  readonly data?: PresupuestoCronogramaData
  readonly cuotasData?: CuotasData
}

// Helper: Obtener clave única para agrupar métodos de pago
function getMetodosKey(metodos: MetodoPreferido[]): string {
  return metodos.map(m => m.metodo).sort((a, b) => a.localeCompare(b)).join('|')
}

// Helper: Agrupar paquetes por métodos de pago iguales
function agruparPorMetodos(snapshots: PackageSnapshot[]): { nombres: string[]; metodos: MetodoPreferido[] }[] {
  const grupos = new Map<string, { nombres: string[]; metodos: MetodoPreferido[] }>()
  
  for (const snapshot of snapshots) {
    const metodos = snapshot.paquete.metodosPreferidos || []
    const key = getMetodosKey(metodos)
    
    if (grupos.has(key)) {
      grupos.get(key)!.nombres.push(snapshot.nombre)
    } else {
      grupos.set(key, { nombres: [snapshot.nombre], metodos })
    }
  }
  
  return Array.from(grupos.values())
}

// Helper: Formatear nombres de paquetes
function formatearNombresPaquetes(nombres: string[]): string {
  if (nombres.length === 1) return nombres[0]
  if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`
  return nombres.slice(0, -1).join(', ') + ' y ' + nombres.at(-1)
}

// Subcomponente: Lista de métodos de pago preferidos
function MetodosPreferidosList({ metodos, titulo }: Readonly<{ metodos: MetodoPreferido[]; titulo?: string }>) {
  if (!metodos || metodos.length === 0) return null
  
  // Determinar columnas dinámicamente según cantidad de métodos
  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'sm:grid-cols-2'
    if (count === 3) return 'sm:grid-cols-2 lg:grid-cols-3'
    return 'sm:grid-cols-2 lg:grid-cols-4' // 4+ métodos
  }

  return (
    <div className="space-y-3">
      {titulo && (
        <h4 className="text-sm font-semibold text-light-text flex items-center gap-2">
          <span className="text-light-accent">📦</span> {titulo}
        </h4>
      )}
      <div className={`grid gap-3 ${getGridCols(metodos.length)}`}>
        {metodos.map((metodo) => (
          <div 
            key={metodo.id}
            className="bg-gradient-to-br from-light-bg-secondary to-white rounded-lg p-3 border border-light-border/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-light-success text-sm">✓</span>
              <span className="font-medium text-light-text text-sm">{formatMetodoPago(metodo.metodo)}</span>
            </div>
            {metodo.nota && (
              <p className="text-xs text-light-text-secondary pl-5">{metodo.nota}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Colores para los pasos
const stepColors = [
  { bg: 'from-primary to-primary-dark', text: 'text-primary', border: 'border-primary/30', light: 'bg-primary/10' },
  { bg: 'from-accent to-accent-dark', text: 'text-accent', border: 'border-accent/30', light: 'bg-accent/10' },
  { bg: 'from-secondary to-secondary-dark', text: 'text-secondary', border: 'border-secondary/30', light: 'bg-secondary/10' },
  { bg: 'from-light-info to-cyan-600', text: 'text-light-info', border: 'border-light-info/30', light: 'bg-light-info/10' },
  { bg: 'from-light-success to-emerald-600', text: 'text-light-success', border: 'border-light-success/30', light: 'bg-light-success/10' },
]

// Función para obtener las columnas del grid según la cantidad de opciones
function getCardGridCols(count: number): string {
  if (count === 2) return 'md:grid-cols-2'
  if (count === 3) return 'md:grid-cols-3'
  if (count >= 4) return 'md:grid-cols-2 lg:grid-cols-4'
  return 'grid-cols-1'
}

// Subcomponente: Esquema de pagos - Timeline Horizontal (Propuesta 6)
function EsquemaPagosList({ opciones, titulo }: Readonly<{ opciones: OpcionPago[]; titulo?: string }>) {
  if (!opciones || opciones.length === 0) return null
  
  return (
    <div className="space-y-5">
      {titulo && (
        <h4 className="text-sm font-semibold text-light-text flex items-center gap-2">
          <span className="text-light-accent">📦</span> {titulo}
        </h4>
      )}
      
      {/* Timeline Horizontal */}
      <div className="relative">
        {/* Línea conectora horizontal - visible solo en desktop */}
        <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-1 bg-gradient-to-r from-primary/20 via-accent/20 to-light-success/20 rounded-full" />
        
        {/* Contenedor de pasos */}
        <div className={`grid gap-4 md:gap-6 ${getCardGridCols(opciones.length)}`}>
          {opciones.map((opcion, idx) => {
            const colors = stepColors[idx % stepColors.length]
            const isLast = idx === opciones.length - 1
            
            return (
              <motion.div
                key={`step-${opcion.nombre}-${idx}`}
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
              >
                {/* Círculo del paso con número y porcentaje integrado */}
                <div className="relative z-10 mb-4">
                  <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${colors.bg} text-white shadow-lg ring-4 ring-white`}>
                    <span className="text-xl font-bold leading-none">{idx + 1}</span>
                    {opcion.porcentaje !== undefined && opcion.porcentaje > 0 && (
                      <span className="text-[10px] font-semibold leading-none mt-0.5 opacity-90">{opcion.porcentaje}%</span>
                    )}
                  </div>
                </div>
                
                {/* Flecha entre pasos (solo en mobile) */}
                {!isLast && (
                  <div className="md:hidden absolute -bottom-2 left-1/2 -translate-x-1/2 text-light-accent/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
                
                {/* Card del paso */}
                <div className={`w-full bg-white/95 backdrop-blur-sm rounded-xl border ${colors.border} shadow-md hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden`}>
                  {/* Header */}
                  <div className={`${colors.light} px-4 py-3 text-center border-b ${colors.border}`}>
                    <h5 className={`font-bold ${colors.text} text-sm uppercase tracking-wide`}>
                      {opcion.nombre}
                    </h5>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-4">
                    {opcion.descripcion && (
                      <p className="text-xs text-light-text-secondary leading-relaxed text-center mb-3">
                        {opcion.descripcion}
                      </p>
                    )}
                    
                    {/* Indicador de pago */}
                    <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-light-border/30">
                      <span className="text-sm">💳</span>
                      <span className="text-[10px] font-medium text-light-text-secondary uppercase tracking-wider">Pago</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Subcomponente: Descuentos aplicables
function DescuentosList({ config, titulo }: Readonly<{ config: ConfigDescuentos | undefined; titulo?: string }>) {
  const resumen = getDescuentoResumen(config)
  
  if (resumen.length === 0) return null
  
  return (
    <div className="space-y-3">
      {titulo && (
        <h4 className="text-sm font-semibold text-light-text flex items-center gap-2">
          <span className="text-light-accent">📦</span> {titulo}
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {resumen.map((desc) => (
          <span 
            key={`desc-${desc}`}
            className="inline-flex items-center gap-1 text-xs bg-light-success/10 text-light-success px-3 py-1.5 rounded-full border border-light-success/20"
          >
            <span>🏷️</span> {desc}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MetodosPagoPublic({ data, cuotasData }: MetodosPagoPublicProps) {
  const { snapshots } = useSnapshots()
  const activos = snapshots.filter((s) => s.activo)
  
  // Verificar si cuotas está habilitado (fallback cuando no hay datos de paquetes)
  const cuotasVisible = cuotasData?.metodosPago?.visible !== false
  
  // Verificar si hay datos reales en los paquetes
  const tieneMetodosPreferidos = activos.some(s => (s.paquete.metodosPreferidos?.length || 0) > 0)
  const tieneOpcionesPago = activos.some(s => (s.paquete.opcionesPago?.length || 0) > 0)
  // Usar la función de verificación real de descuentos
  const tieneDescuentos = activos.some(s => tieneDescuentosReales(s.paquete.configDescuentos))
  
  // Verificar si hay datos en cuotas para fallback
  const tieneDatosCuotas = (cuotasData?.metodosPago?.opciones?.length || 0) > 0
  
  // Lógica de visibilidad:
  // 1. Si los paquetes tienen datos de pago → mostrar datos de paquetes
  // 2. Else si cuotas está visible y tiene datos → mostrar datos de cuotas
  // 3. Else → ocultar sección
  const usarDatosPaquetes = tieneMetodosPreferidos || tieneOpcionesPago || tieneDescuentos
  const usarDatosCuotas = !usarDatosPaquetes && cuotasVisible && tieneDatosCuotas
  
  // Si no hay datos para mostrar, no renderizar
  if (!usarDatosPaquetes && !usarDatosCuotas) return null
  if (activos.length === 0 && !usarDatosCuotas) return null

  // Agrupar paquetes con mismas configuraciones (compara en pares, no todos a la vez)
  const gruposOpciones = agruparPorOpciones(activos)
  const gruposDescuentos = agruparPorDescuentos(activos)

  return (
    <FluentSection
      id="metodos-pago"
      animation="stagger"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-info to-cyan-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <span className="text-white text-2xl">💳</span>
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {cuotasData?.titulo || 'Opciones de Pago'}
          </h2>
          {cuotasData?.subtitulo && (
            <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
              {cuotasData?.subtitulo}
            </p>
          )}
        </motion.div>

        <div className="space-y-8">
          {/* SECCIÓN 1: MÉTODOS DE PAGO PREFERIDOS */}
          {tieneMetodosPreferidos && (
            <FluentReveal>
              <FluentGlass variant="normal" className="rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
                  <span className="text-xl">💰</span> Métodos de Pago Aceptados
                </h3>
                
                {/* Agrupar paquetes con métodos iguales */}
                <div className="space-y-6">
                  {agruparPorMetodos(activos).map((grupo) => (
                    <div key={`grupo-metodos-${grupo.nombres.join('-')}`} className="space-y-4">
                      <h4 className="text-sm font-semibold text-light-text flex items-center gap-2">
                        <span className="text-light-accent">📦</span> 
                        {grupo.nombres.length > 1 ? 'Paquetes: ' : ''}{formatearNombresPaquetes(grupo.nombres)}
                      </h4>
                      <MetodosPreferidosList metodos={grupo.metodos} />
                    </div>
                  ))}
                </div>
              </FluentGlass>
            </FluentReveal>
          )}

          {/* SECCIÓN 2: ESQUEMA DE PAGOS */}
          {tieneOpcionesPago && (
            <FluentReveal>
              <FluentGlass variant="normal" className="rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span> Esquema de Pagos
                </h3>
                
                {/* Agrupar paquetes con esquemas iguales */}
                <div className="space-y-8">
                  {gruposOpciones.map((grupo) => (
                    <div key={`grupo-opciones-${grupo.nombres.join('-')}`} className="space-y-4">
                      {/* Mostrar título solo si hay múltiples grupos o el grupo tiene múltiples paquetes */}
                      {(gruposOpciones.length > 1 || grupo.nombres.length > 1) && (
                        <h4 className="text-sm font-semibold text-light-text flex items-center gap-2">
                          <span className="text-light-accent">📦</span> 
                          {grupo.nombres.length > 1 ? 'Paquetes: ' : ''}{formatearNombresPaquetes(grupo.nombres)}
                        </h4>
                      )}
                      <EsquemaPagosList opciones={grupo.opciones} />
                    </div>
                  ))}
                </div>
              </FluentGlass>
            </FluentReveal>
          )}

          {/* SECCIÓN 3: DESCUENTOS APLICABLES */}
          {tieneDescuentos && (
            <FluentReveal>
              <FluentGlass variant="normal" className="rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
                  <span className="text-xl">🏷️</span> Descuentos Aplicables
                </h3>
                
                {/* Agrupar paquetes con descuentos iguales */}
                <div className="space-y-6">
                  {gruposDescuentos.map((grupo) => {
                    // Mostrar título si: hay múltiples paquetes activos (para clarificar cuáles tienen descuentos)
                    const mostrarTitulo = activos.length > 1
                    
                    return (
                      <div key={`grupo-descuentos-${grupo.nombres.join('-')}`} className="space-y-4">
                        {mostrarTitulo && (
                          <h4 className="text-sm font-semibold text-light-text flex items-center gap-2">
                            <span className="text-light-accent">📦</span> 
                            {grupo.nombres.length > 1 ? 'Paquetes: ' : ''}{formatearNombresPaquetes(grupo.nombres)}
                          </h4>
                        )}
                        <DescuentosList config={grupo.config} />
                      </div>
                    )
                  })}
                </div>
              </FluentGlass>
            </FluentReveal>
          )}

          {/* FALLBACK: Datos de Cuotas cuando no hay datos en paquetes */}
          {usarDatosCuotas && cuotasData?.metodosPago?.opciones && (
            <FluentReveal>
              <FluentGlass variant="normal" className="rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
                  <span className="text-xl">💳</span> {cuotasData.metodosPago.titulo || 'Métodos de Pago'}
                </h3>
                <FluentRevealGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cuotasData.metodosPago.opciones.map((metodo, idx) => (
                    <FluentRevealItem key={`cuota-${metodo.nombre.replaceAll(' ', '-')}-${idx}`}>
                      <div className="bg-gradient-to-br from-light-bg-secondary to-white rounded-xl p-4 border border-light-border/50 h-full hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-light-success text-lg">✓</span>
                          <span className="font-medium text-light-text text-sm">{metodo.nombre}</span>
                        </div>
                        {metodo.porcentaje !== undefined && metodo.porcentaje > 0 && (
                          <p className="text-xs text-light-accent font-semibold bg-light-accent/10 inline-block px-2 py-0.5 rounded-full mb-1">
                            {metodo.porcentaje}%
                          </p>
                        )}
                        {metodo.descripcion && (
                          <p className="text-xs text-light-text-secondary mt-1">{metodo.descripcion}</p>
                        )}
                      </div>
                    </FluentRevealItem>
                  ))}
                </FluentRevealGroup>
              </FluentGlass>
            </FluentReveal>
          )}
        </div>
      </div>
    </FluentSection>
  )
}
