/**
 * GUÍA DE USO: Iconos de Font Awesome en QuotationStateHelper
 * ============================================================
 * 
 * Versión: 1.0
 * Fecha: 2025-12-22
 */

// ✅ NUEVO: Importar función para obtener componente de ícono
import { getStateIconComponent } from '@/lib/utils/quotationStateHelper'
import type { QuotationState } from '@/lib/types'

// ============================================================
// EJEMPLO 1: Usar ícono en un componente TSX
// ============================================================

export function QuotationStateDisplay({ estado }: { estado: QuotationState }) {
  // Obtenemos el componente ícono como un tipo IconType
  const IconComponent = getStateIconComponent(estado)
  
  return (
    <div className="flex items-center gap-2">
      {/* Renderizar el ícono - IconComponent es un componente React */}
      <IconComponent className="w-5 h-5 text-green-600" />
      <span className="font-medium">{estado}</span>
    </div>
  )
}

// ============================================================
// EJEMPLO 2: En un botón con ícono
// ============================================================

export function StateActionButton({ estado }: { estado: QuotationState }) {
  const IconComponent = getStateIconComponent(estado)
  
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
      <IconComponent className="w-4 h-4" />
      <span>Cambiar a {estado}</span>
    </button>
  )
}

// ============================================================
// EJEMPLO 3: En un badge/etiqueta
// ============================================================

import { getStateColor, getStateLabel } from '@/lib/utils/quotationStateHelper'

export function StateBadge({ estado }: { estado: QuotationState }) {
  const IconComponent = getStateIconComponent(estado)
  const color = getStateColor(estado)
  const label = getStateLabel(estado)
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${color}`}>
      <IconComponent className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

// ============================================================
// EJEMPLO 4: En un menú o lista
// ============================================================

export function StateList({ estados }: { estados: QuotationState[] }) {
  return (
    <ul className="space-y-2">
      {estados.map((estado) => {
        const IconComponent = getStateIconComponent(estado)
        const label = getStateLabel(estado)
        
        return (
          <li 
            key={estado}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            <IconComponent className="w-5 h-5 text-gray-600" />
            <span>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

// ============================================================
// EJEMPLO 5: Con tamaños y colores personalizados
// ============================================================

export function StateIconCustom({ 
  estado, 
  size = 'w-5 h-5',
  color = 'text-gray-600'
}: { 
  estado: QuotationState
  size?: string
  color?: string
}) {
  const IconComponent = getStateIconComponent(estado)
  
  return <IconComponent className={`${size} ${color}`} />
}

// ============================================================
// BACKWARD COMPATIBILITY: Emoji icons aún disponibles
// ============================================================

import { getStateIcon } from '@/lib/utils/quotationStateHelper'

export function StateEmojiDisplay({ estado }: { estado: QuotationState }) {
  // Para componentes que aún usan emojis
  const emoji = getStateIcon(estado)
  
  return (
    <span className="text-2xl">{emoji}</span>
  )
}

// ============================================================
// MAPPING DE ICONOS
// ============================================================

/**
 * Referencia visual de qué ícono corresponde a cada estado:
 * 
 * CARGADA        → 📄 FaFileAlt (Archivo)
 * ACTIVA         → ✓  FaCheckCircle (Círculo con check)
 * INACTIVA       → 🕐 FaClock (Reloj)
 * ACEPTADA       → 🎉 FaPartyPopper (Confeti/Celebración)
 * RECHAZADA      → ✗  FaTimesCircle (Círculo con X)
 * NUEVA_PROPUESTA → 💡 FaLightbulb (Bombilla)
 * EXPIRADA       → ⚠️ FaExclamationTriangle (Triángulo de advertencia)
 */

// ============================================================
// NOTAS TÉCNICAS
// ============================================================

/**
 * ✅ VENTAJAS DE FONT AWESOME:
 * 1. Modernos y escalables (SVG)
 * 2. Consistentes en todos los navegadores
 * 3. Pueden cambiar de tamaño sin perder calidad
 * 4. Fácil de colorear con Tailwind
 * 5. Mejor accesibilidad
 * 6. Compatible con React como componentes
 * 
 * 📦 PACKAGE: react-icons v5.5.0 (ya instalado)
 * 📚 DOCS: https://react-icons.github.io/react-icons/
 * 
 * 🔄 BACKWARD COMPATIBILITY:
 * - getStateIcon() sigue devolviendo emojis (sin cambios)
 * - getStateIconComponent() es una NUEVA función
 * - No rompe código existente
 * 
 * 💡 MIGRACIÓN GRADUAL:
 * - Usar getStateIconComponent() en componentes nuevos
 * - Actualizar componentes existentes cuando sea necesario
 * - Mantener getStateIcon() para componentes heredados
 */

// ============================================================
// USO EN COMPONENTES EXISTENTES (Ejemplo: Historial.tsx)
// ============================================================

/**
 * Antes (con emojis):
 * <span>{getStateIcon(quotation.estado)}</span>
 * 
 * Después (con Font Awesome):
 * const StateIcon = getStateIconComponent(quotation.estado)
 * <StateIcon className="w-4 h-4" />
 */
