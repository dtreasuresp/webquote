/**
 * Presets de animaciones combinadas
 * Combinaciones predefinidas para casos de uso comunes
 */

import type { Variants } from 'framer-motion'
import { duration, easing, stagger, offset } from './config'
import * as variants from './variants'

// ============================================
// PRESETS PARA SECCIONES
// ============================================

export const sectionPresets = {
  // Sección estándar - fade con slide sutil
  default: {
    variants: variants.fadeSlideUp,
    viewport: { once: true, margin: '-50px' },
  },
  
  // Sección hero - más dramática
  hero: {
    variants: variants.blurSlideUp,
    viewport: { once: true, margin: '0px' },
  },
  
  // Sección con reveal
  reveal: {
    variants: variants.clipRevealUp,
    viewport: { once: true, margin: '-100px' },
  },
  
  // Sección con spring
  spring: {
    variants: variants.springUp,
    viewport: { once: true, margin: '-50px' },
  },
}

// ============================================
// PRESETS PARA CARDS
// ============================================

export const cardPresets = {
  // Card estándar
  default: {
    initial: variants.fadeSlideUp.hidden,
    whileInView: variants.fadeSlideUp.visible,
    whileHover: variants.hoverLift,
    whileTap: variants.tapShrink,
    viewport: { once: true },
  },
  
  // Card con escala
  scale: {
    initial: variants.scaleIn.hidden,
    whileInView: variants.scaleIn.visible,
    whileHover: variants.hoverScale,
    whileTap: variants.tapShrink,
    viewport: { once: true },
  },
  
  // Card con pop
  pop: {
    initial: variants.popIn.hidden,
    whileInView: variants.popIn.visible,
    whileHover: variants.hoverScaleLarge,
    whileTap: variants.tapPush,
    viewport: { once: true },
  },
  
  // Card interactiva (3D tilt)
  interactive: {
    initial: variants.fadeSlideUp.hidden,
    whileInView: variants.fadeSlideUp.visible,
    whileHover: { ...variants.hoverLift, ...variants.hoverTilt },
    whileTap: variants.tapShrink,
    viewport: { once: true },
  },
  
  // Card con glow
  glow: {
    initial: variants.fadeIn.hidden,
    whileInView: variants.fadeIn.visible,
    whileHover: { ...variants.hoverLift, ...variants.hoverGlow },
    whileTap: variants.tapShrink,
    viewport: { once: true },
  },
}

// ============================================
// PRESETS PARA LISTAS
// ============================================

export const listPresets = {
  // Lista con stagger estándar
  default: {
    container: variants.staggerContainer,
    item: variants.fadeSlideUp,
  },
  
  // Lista rápida
  fast: {
    container: variants.staggerContainerFast,
    item: variants.fadeSlideUp,
  },
  
  // Lista con scale
  scale: {
    container: variants.staggerContainer,
    item: variants.scaleIn,
  },
  
  // Lista con slide lateral
  slideLeft: {
    container: variants.staggerContainer,
    item: variants.fadeSlideLeft,
  },
  
  // Lista con slide desde la derecha
  slideRight: {
    container: variants.staggerContainer,
    item: variants.fadeSlideRight,
  },
  
  // Lista con pop
  pop: {
    container: variants.staggerContainerSlow,
    item: variants.popIn,
  },
}

// ============================================
// PRESETS PARA TEXTOS
// ============================================

export const textPresets = {
  // Título principal
  title: {
    variants: variants.fadeSlideUp,
    transition: { duration: duration.slow, ease: easing.easeOut },
  },
  
  // Subtítulo
  subtitle: {
    variants: variants.fadeIn,
    transition: { duration: duration.normal, ease: easing.smooth, delay: 0.1 },
  },
  
  // Párrafo
  paragraph: {
    variants: variants.fadeIn,
    transition: { duration: duration.normal, ease: easing.smooth, delay: 0.2 },
  },
  
  // Texto con blur
  blur: {
    variants: variants.blurIn,
    transition: { duration: duration.slow, ease: easing.smooth },
  },
}

// ============================================
// PRESETS PARA BOTONES
// ============================================

export const buttonPresets = {
  default: {
    whileHover: { scale: 1.02, y: -1 },
    whileTap: { scale: 0.98 },
    transition: { duration: duration.fast },
  },
  
  bounce: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },
  
  glow: {
    whileHover: { 
      scale: 1.02,
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
    },
    whileTap: { scale: 0.98 },
    transition: { duration: duration.fast },
  },
}

// ============================================
// PRESETS PARA ICONOS
// ============================================

export const iconPresets = {
  default: {
    whileHover: { scale: 1.1, rotate: 5 },
    whileTap: { scale: 0.9 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  },
  
  bounce: {
    whileHover: { y: -3 },
    transition: { type: 'spring', stiffness: 300, damping: 10 },
  },
  
  spin: {
    whileHover: { rotate: 180 },
    transition: { duration: duration.normal, ease: easing.easeInOut },
  },
  
  pulse: {
    animate: { 
      scale: [1, 1.1, 1],
    },
    transition: { 
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    },
  },
}

// ============================================
// PRESETS PARA IMÁGENES
// ============================================

export const imagePresets = {
  default: {
    initial: { opacity: 0, scale: 1.1 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: duration.slow, ease: easing.easeOut },
    viewport: { once: true },
  },
  
  zoom: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    whileHover: { scale: 1.05 },
    transition: { duration: duration.normal, ease: easing.smooth },
    viewport: { once: true },
  },
  
  reveal: {
    initial: { 
      opacity: 0, 
      clipPath: 'inset(0% 0% 100% 0%)' 
    },
    whileInView: { 
      opacity: 1, 
      clipPath: 'inset(0% 0% 0% 0%)' 
    },
    transition: { duration: duration.slow, ease: easing.easeOut },
    viewport: { once: true },
  },
}

// ============================================
// PRESETS PARA NAVEGACIÓN
// ============================================

export const navPresets = {
  // Link de navegación
  link: {
    whileHover: { x: 2 },
    whileTap: { scale: 0.98 },
    transition: { duration: duration.fast },
  },
  
  // Menú móvil
  mobileMenu: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  
  // Dropdown
  dropdown: {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    transition: { duration: duration.fast, ease: easing.easeOut },
  },
}

// ============================================
// PRESETS PARA MODALES/OVERLAYS
// ============================================

export const modalPresets = {
  // Overlay de fondo
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.fast },
  },
  
  // Modal con scale
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  
  // Modal desde abajo
  drawer: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

export type SectionPreset = keyof typeof sectionPresets
export type CardPreset = keyof typeof cardPresets
export type ListPreset = keyof typeof listPresets
export type TextPreset = keyof typeof textPresets
export type ButtonPreset = keyof typeof buttonPresets
