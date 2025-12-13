/**
 * Componentes de Animación Reutilizables
 * 
 * @example
 * import { 
 *   AnimatedSection, 
 *   AnimatedCard, 
 *   AnimatedList,
 *   AnimatedText,
 *   AnimatedCounter,
 *   // Microsoft Fluent Design
 *   FluentCard,
 *   FluentSection,
 *   FluentButton,
 *   FluentList
 * } from '@/components/motion'
 */

// Componentes base
export { default as AnimatedSection } from './AnimatedSection'
export { default as AnimatedCard } from './AnimatedCard'
export { default as AnimatedList, AnimatedListItem } from './AnimatedList'
export { default as AnimatedText } from './AnimatedText'
export { default as AnimatedCounter, AnimatedCounterGroup } from './AnimatedCounter'
export { default as AnimatedImage } from './AnimatedImage'
export { default as ParallaxSection, ParallaxLayer } from './ParallaxSection'
export { default as Tilt3DCard } from './Tilt3DCard'

// Microsoft Fluent Design Components - Core
export { default as FluentCard } from './FluentCard'
export { default as FluentSection, FluentSectionItem } from './FluentSection'
export { default as FluentButton } from './FluentButton'
export { default as FluentList, FluentListItem } from './FluentList'

// Microsoft Fluent Design 2 - Optimized Materials
export { FluentGlass } from './FluentGlass'
export { FluentSurface } from './FluentSurface'
export { FluentReveal, FluentRevealGroup, FluentRevealItem } from './FluentReveal'
export { FluentHover, FluentTap } from './FluentHover'
export { FluentAcrylicNav, FluentAcrylicHeader } from './FluentAcrylicNav'
export { FluentMica, FluentMicaCard } from './FluentMica'

// Re-export animations for convenience
export { 
  fluentSlideUp,
  fluentStaggerContainer,
  fluentStaggerItem 
} from '@/lib/animations/variants'
export { viewport, spring } from '@/lib/animations/config'

