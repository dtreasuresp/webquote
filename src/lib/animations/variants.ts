/**
 * Variants de Framer Motion reutilizables
 * Definiciones de animaciones para usar con motion components
 * Incluye animaciones estilo Microsoft Fluent Design
 */

import type { Variants, Transition } from 'framer-motion'
import { duration, easing, offset, scale, stagger, spring, fluentShadow, fluentBlur } from './config'

// ============================================
// ANIMACIONES DE ENTRADA (Fade + Slide)
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: duration.normal, ease: easing.smooth }
  }
}

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: offset.medium },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: duration.normal, ease: easing.smooth }
  }
}

export const fadeSlideDown: Variants = {
  hidden: { opacity: 0, y: -offset.medium },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: duration.normal, ease: easing.smooth }
  }
}

export const fadeSlideLeft: Variants = {
  hidden: { opacity: 0, x: offset.medium },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: duration.normal, ease: easing.smooth }
  }
}

export const fadeSlideRight: Variants = {
  hidden: { opacity: 0, x: -offset.medium },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: duration.normal, ease: easing.smooth }
  }
}

// ============================================
// ANIMACIONES DE ESCALA
// ============================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: scale.small },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: duration.normal, ease: easing.bouncy }
  }
}

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: scale.large },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: duration.slow, ease: easing.easeOut }
  }
}

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
}

// ============================================
// ANIMACIONES DE ROTACIÓN
// ============================================

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -10, y: offset.small },
  visible: { 
    opacity: 1, 
    rotate: 0,
    y: 0,
    transition: { duration: duration.normal, ease: easing.smooth }
  }
}

export const flipIn: Variants = {
  hidden: { opacity: 0, rotateX: 90 },
  visible: { 
    opacity: 1, 
    rotateX: 0,
    transition: { duration: duration.slow, ease: easing.easeOut }
  }
}

// ============================================
// ANIMACIONES DE BLUR
// ============================================

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)',
    transition: { duration: duration.slow, ease: easing.smooth }
  }
}

export const blurSlideUp: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)', y: offset.medium },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: duration.slow, ease: easing.smooth }
  }
}

// ============================================
// ANIMACIONES DE CLIP/REVEAL
// ============================================

export const clipRevealUp: Variants = {
  hidden: { 
    clipPath: 'inset(100% 0% 0% 0%)',
    opacity: 0
  },
  visible: { 
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: { duration: duration.slow, ease: easing.easeOut }
  }
}

export const clipRevealDown: Variants = {
  hidden: { 
    clipPath: 'inset(0% 0% 100% 0%)',
    opacity: 0
  },
  visible: { 
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: { duration: duration.slow, ease: easing.easeOut }
  }
}

export const clipRevealLeft: Variants = {
  hidden: { 
    clipPath: 'inset(0% 100% 0% 0%)',
    opacity: 0
  },
  visible: { 
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: { duration: duration.slow, ease: easing.easeOut }
  }
}

export const clipRevealRight: Variants = {
  hidden: { 
    clipPath: 'inset(0% 0% 0% 100%)',
    opacity: 0
  },
  visible: { 
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: { duration: duration.slow, ease: easing.easeOut }
  }
}

// ============================================
// ANIMACIONES DE BOUNCE/SPRING
// ============================================

export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3, y: offset.large },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  }
}

export const springUp: Variants = {
  hidden: { opacity: 0, y: offset.large },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
}

// ============================================
// ANIMACIONES MICROSOFT FLUENT DESIGN
// ============================================

// Fade con blur estilo Fluent (principal)
export const fluentFade: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    filter: `blur(${fluentBlur.normal}px)` 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { 
      duration: duration.slow, 
      ease: easing.fluent 
    }
  }
}

// Reveal desde abajo con escala (impactante)
export const fluentRevealUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: duration.slower, 
      ease: easing.fluent 
    }
  }
}

// Reveal desde la izquierda
export const fluentRevealLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -60, 
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      duration: duration.slow, 
      ease: easing.fluent 
    }
  }
}

// Reveal desde la derecha
export const fluentRevealRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60, 
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      duration: duration.slow, 
      ease: easing.fluent 
    }
  }
}

// Scale con blur (para cards destacadas)
export const fluentScaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9, 
    filter: `blur(${fluentBlur.subtle}px)` 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { 
      ...spring.fluent
    }
  }
}

// Pop con spring Fluent
export const fluentPop: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.85 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      ...spring.fluentBouncy
    }
  }
}

// Slide up suave (para texto)
export const fluentSlideUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 24 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: duration.normal, 
      ease: easing.fluentDecelerate 
    }
  }
}

// Container con stagger Fluent
export const fluentStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.fluent,
      delayChildren: 0.1
    }
  }
}

// Container con stagger más rápido
export const fluentStaggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.fluentFast,
      delayChildren: 0.05
    }
  }
}

// Container con stagger lento (para secciones hero)
export const fluentStaggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.fluentSlow,
      delayChildren: 0.15
    }
  }
}

// Item para usar dentro de stagger containers
export const fluentStaggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    filter: `blur(${fluentBlur.subtle}px)` 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { 
      duration: duration.normal, 
      ease: easing.fluent 
    }
  }
}

// ============================================
// HOVER EFFECTS MICROSOFT FLUENT
// ============================================

// Hover con elevación y sombra Fluent
export const fluentHoverLift = {
  y: -6,
  boxShadow: fluentShadow.hover,
  transition: { ...spring.fluentSnappy }
}

// Hover con glow azul (accent color)
export const fluentHoverGlow = {
  boxShadow: fluentShadow.glow,
  transition: { duration: duration.fast, ease: easing.fluent }
}

// Hover con glow fuerte
export const fluentHoverGlowStrong = {
  boxShadow: fluentShadow.glowStrong,
  transition: { duration: duration.fast, ease: easing.fluent }
}

// Hover con escala sutil
export const fluentHoverScale = {
  scale: 1.02,
  boxShadow: fluentShadow.hover,
  transition: { ...spring.fluent }
}

// Hover para cards (combinación de lift + glow border)
export const fluentHoverCard = {
  y: -4,
  boxShadow: fluentShadow.elevated,
  transition: { ...spring.fluent }
}

// Hover para botones
export const fluentHoverButton = {
  scale: 1.02,
  transition: { ...spring.fluentSnappy }
}

// ============================================
// TAP EFFECTS MICROSOFT FLUENT
// ============================================

export const fluentTapShrink = {
  scale: 0.98,
  transition: { ...spring.fluentSnappy }
}

export const fluentTapPush = {
  scale: 0.96,
  boxShadow: fluentShadow.active,
  transition: { duration: duration.fastest }
}

// ============================================
// ANIMACIONES DE CONTAINER (para stagger)
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.normal,
      delayChildren: 0.1
    }
  }
}

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.fast,
      delayChildren: 0.05
    }
  }
}

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.slow,
      delayChildren: 0.15
    }
  }
}

// ============================================
// ANIMACIONES DE HOVER
// ============================================

export const hoverLift = {
  y: -4,
  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
  transition: { duration: duration.fast, ease: easing.easeOut }
}

export const hoverScale = {
  scale: 1.02,
  transition: { duration: duration.fast, ease: easing.easeOut }
}

export const hoverScaleLarge = {
  scale: 1.05,
  transition: { duration: duration.fast, ease: easing.bouncy }
}

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
  transition: { duration: duration.fast }
}

export const hoverTilt = {
  rotateY: 5,
  rotateX: -5,
  transition: { duration: duration.fast, ease: easing.easeOut }
}

// ============================================
// ANIMACIONES DE TAP
// ============================================

export const tapShrink = {
  scale: 0.98,
  transition: { duration: duration.fastest }
}

export const tapPush = {
  scale: 0.95,
  y: 2,
  transition: { duration: duration.fastest }
}

// ============================================
// MAPA DE VARIANTS POR NOMBRE
// ============================================

export const variantsMap = {
  // Fade básico
  'fade': fadeIn,
  'fadeIn': fadeIn,
  
  // Fade + Slide
  'fadeSlideUp': fadeSlideUp,
  'fadeSlideDown': fadeSlideDown,
  'fadeSlideLeft': fadeSlideLeft,
  'fadeSlideRight': fadeSlideRight,
  
  // Escala
  'scaleIn': scaleIn,
  'scaleUp': scaleUp,
  'popIn': popIn,
  
  // Rotación
  'rotateIn': rotateIn,
  'flipIn': flipIn,
  
  // Blur
  'blurIn': blurIn,
  'blurSlideUp': blurSlideUp,
  
  // Clip/Reveal
  'clipRevealUp': clipRevealUp,
  'clipRevealDown': clipRevealDown,
  'clipRevealLeft': clipRevealLeft,
  'clipRevealRight': clipRevealRight,
  
  // Bounce/Spring
  'bounceIn': bounceIn,
  'springUp': springUp,
  
  // Containers
  'stagger': staggerContainer,
  'staggerFast': staggerContainerFast,
  'staggerSlow': staggerContainerSlow,
  
  // Microsoft Fluent Design
  'fluent': fluentFade,
  'fluentFade': fluentFade,
  'fluentRevealUp': fluentRevealUp,
  'fluentRevealLeft': fluentRevealLeft,
  'fluentRevealRight': fluentRevealRight,
  'fluentScaleIn': fluentScaleIn,
  'fluentPop': fluentPop,
  'fluentSlideUp': fluentSlideUp,
  'fluentStagger': fluentStaggerContainer,
  'fluentStaggerFast': fluentStaggerFast,
  'fluentStaggerSlow': fluentStaggerSlow,
  'fluentItem': fluentStaggerItem,
} as const

export type AnimationVariant = keyof typeof variantsMap

// Helper para obtener variants
export function getVariants(name: AnimationVariant): Variants {
  return variantsMap[name] || fadeSlideUp
}

// Helper para crear variants custom con delay
export function withDelay(variants: Variants, delay: number): Variants {
  return {
    hidden: variants.hidden,
    visible: {
      ...variants.visible,
      transition: {
        ...(variants.visible as { transition?: Transition }).transition,
        delay
      }
    }
  }
}

// Helper para crear variants custom con duración
export function withDuration(variants: Variants, newDuration: number): Variants {
  return {
    hidden: variants.hidden,
    visible: {
      ...variants.visible,
      transition: {
        ...(variants.visible as { transition?: Transition }).transition,
        duration: newDuration
      }
    }
  }
}
