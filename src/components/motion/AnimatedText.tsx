'use client'

/**
 * AnimatedText - Texto con efectos de animación
 * 
 * @example
 * // Texto con fade
 * <AnimatedText>Hello World</AnimatedText>
 * 
 * // Efecto typewriter
 * <AnimatedText effect="typewriter" speed={50}>
 *   Tu transformación digital comienza aquí
 * </AnimatedText>
 * 
 * // Texto por palabras
 * <AnimatedText effect="words">
 *   Cada palabra aparece por separado
 * </AnimatedText>
 * 
 * // Texto por caracteres
 * <AnimatedText effect="characters" className="text-4xl font-bold">
 *   HERO
 * </AnimatedText>
 */

import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useTypewriter, useReducedMotion } from '@/lib/animations/hooks'
import { getVariants } from '@/lib/animations/variants'
import { duration as durationConfig, easing } from '@/lib/animations/config'

type TextEffect = 'fade' | 'slideUp' | 'typewriter' | 'words' | 'characters' | 'blur'

interface AnimatedTextProps {
  children: string
  /** Tipo de efecto */
  effect?: TextEffect
  /** Velocidad para typewriter (ms por caracter) */
  speed?: number
  /** Delay inicial */
  delay?: number
  /** Clases CSS */
  className?: string
  /** Tag HTML */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  /** Ejecutar solo una vez */
  once?: boolean
}

export default function AnimatedText({
  children,
  effect = 'fade',
  speed = 40,
  delay = 0,
  className = '',
  as = 'span',
  once = true,
}: AnimatedTextProps) {
  const reducedMotion = useReducedMotion()
  
  // Si hay movimiento reducido, solo fade simple
  if (reducedMotion) {
    return <FadeText text={children} className={className} as={as} delay={delay} once={once} />
  }

  switch (effect) {
    case 'typewriter':
      return <TypewriterText text={children} speed={speed} delay={delay} className={className} as={as} />
    case 'words':
      return <WordsText text={children} delay={delay} className={className} as={as} once={once} />
    case 'characters':
      return <CharactersText text={children} delay={delay} className={className} as={as} once={once} />
    case 'blur':
      return <BlurText text={children} delay={delay} className={className} as={as} once={once} />
    case 'slideUp':
      return <SlideUpText text={children} delay={delay} className={className} as={as} once={once} />
    case 'fade':
    default:
      return <FadeText text={children} delay={delay} className={className} as={as} once={once} />
  }
}

// Fade simple
function FadeText({ 
  text, 
  delay, 
  className, 
  as,
  once 
}: { 
  text: string
  delay: number
  className: string
  as: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  once: boolean
}) {
  const MotionTag = motion[as]
  
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once }}
      transition={{ duration: durationConfig.normal, delay, ease: easing.smooth }}
    >
      {text}
    </MotionTag>
  )
}

// Slide desde abajo
function SlideUpText({ 
  text, 
  delay, 
  className, 
  as,
  once 
}: { 
  text: string
  delay: number
  className: string
  as: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  once: boolean
}) {
  const MotionTag = motion[as]
  
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once }}
      transition={{ duration: durationConfig.normal, delay, ease: easing.smooth }}
    >
      {text}
    </MotionTag>
  )
}

// Efecto blur
function BlurText({ 
  text, 
  delay, 
  className, 
  as,
  once 
}: { 
  text: string
  delay: number
  className: string
  as: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  once: boolean
}) {
  const MotionTag = motion[as]
  
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      viewport={{ once }}
      transition={{ duration: durationConfig.slow, delay, ease: easing.smooth }}
    >
      {text}
    </MotionTag>
  )
}

// Efecto máquina de escribir
function TypewriterText({ 
  text, 
  speed, 
  delay, 
  className, 
  as 
}: { 
  text: string
  speed: number
  delay: number
  className: string
  as: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}) {
  const { displayText, ref } = useTypewriter({ text, speed, delay })
  
  return (
    <span ref={ref} className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
      />
    </span>
  )
}

// Animación por palabras
function WordsText({ 
  text, 
  delay, 
  className, 
  as,
  once 
}: { 
  text: string
  delay: number
  className: string
  as: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  once: boolean
}) {
  const words = useMemo(() => text.split(' '), [text])
  const MotionTag = motion[as]
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      }
    }
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: easing.easeOut }
    }
  }

  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </MotionTag>
  )
}

// Animación por caracteres
function CharactersText({ 
  text, 
  delay, 
  className, 
  as,
  once 
}: { 
  text: string
  delay: number
  className: string
  as: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  once: boolean
}) {
  const characters = useMemo(() => text.split(''), [text])
  const MotionTag = motion[as]
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      }
    }
  }

  const charVariants = {
    hidden: { opacity: 0, y: 20, rotateX: 90 },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: { 
        type: 'spring' as const,
        stiffness: 200,
        damping: 15
      }
    }
  }

  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {characters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={charVariants}
          className="inline-block"
          style={{ 
            display: char === ' ' ? 'inline' : 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : undefined
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </MotionTag>
  )
}
