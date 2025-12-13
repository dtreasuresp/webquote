/**
 * Custom hooks para animaciones
 */

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useInView, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { viewport as viewportConfig } from './config'

// ============================================
// useScrollAnimation - Animación basada en scroll
// ============================================

interface UseScrollAnimationOptions {
  offset?: [string, string]
  smooth?: number
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { offset = ['start end', 'end start'], smooth = 0.1 } = options
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as ["start end", "end start"]
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return { ref, scrollYProgress, smoothProgress }
}

// ============================================
// useParallax - Efecto parallax
// ============================================

interface UseParallaxOptions {
  speed?: number
  direction?: 'up' | 'down'
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5, direction = 'up' } = options
  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const multiplier = direction === 'up' ? -1 : 1
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier])

  return { ref, y }
}

// ============================================
// useCountUp - Animación de contador
// ============================================

interface UseCountUpOptions {
  start?: number
  end: number
  duration?: number
  decimals?: number
  startOnView?: boolean
}

export function useCountUp(options: UseCountUpOptions) {
  const { start = 0, end, duration = 2, decimals = 0, startOnView = true } = options
  const [count, setCount] = useState(start)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!startOnView || (isInView && !hasStarted.current)) {
      hasStarted.current = true
      const startTime = Date.now()
      const endTime = startTime + duration * 1000

      const updateCount = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / (duration * 1000), 1)
        
        // Easing function (ease out cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentCount = start + (end - start) * easeOutCubic

        setCount(Number(currentCount.toFixed(decimals)))

        if (progress < 1) {
          requestAnimationFrame(updateCount)
        }
      }

      requestAnimationFrame(updateCount)
    }
  }, [isInView, start, end, duration, decimals, startOnView])

  return { count, ref }
}

// ============================================
// useTypewriter - Efecto máquina de escribir
// ============================================

interface UseTypewriterOptions {
  text: string
  speed?: number
  delay?: number
  startOnView?: boolean
}

export function useTypewriter(options: UseTypewriterOptions) {
  const { text, speed = 50, delay = 0, startOnView = true } = options
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!startOnView || (isInView && !hasStarted.current)) {
      hasStarted.current = true
      let currentIndex = 0

      const timeout = setTimeout(() => {
        const interval = setInterval(() => {
          if (currentIndex < text.length) {
            setDisplayText(text.slice(0, currentIndex + 1))
            currentIndex++
          } else {
            setIsComplete(true)
            clearInterval(interval)
          }
        }, speed)

        return () => clearInterval(interval)
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [isInView, text, speed, delay, startOnView])

  return { displayText, isComplete, ref }
}

// ============================================
// useMousePosition - Posición del mouse para efectos
// ============================================

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return mousePosition
}

// ============================================
// useMouseFollow - Seguimiento del mouse con suavizado
// ============================================

export function useMouseFollow(smoothness = 0.1) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 })
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [mouseX, mouseY])

  return { x: smoothX, y: smoothY }
}

// ============================================
// useTilt3D - Efecto de inclinación 3D con mouse
// ============================================

export function useTilt3D(intensity = 15) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const smoothRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const smoothRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const percentX = (e.clientX - centerX) / (rect.width / 2)
    const percentY = (e.clientY - centerY) / (rect.height / 2)

    rotateX.set(-percentY * intensity)
    rotateY.set(percentX * intensity)
  }, [intensity, rotateX, rotateY])

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  return {
    ref,
    style: {
      rotateX: smoothRotateX,
      rotateY: smoothRotateY,
      transformStyle: 'preserve-3d' as const
    },
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave
    }
  }
}

// ============================================
// useReducedMotion - Respetar preferencias del usuario
// ============================================

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

// ============================================
// useElementVisibility - Detectar visibilidad
// ============================================

interface UseElementVisibilityOptions {
  threshold?: number
  rootMargin?: string
}

export function useElementVisibility(options: UseElementVisibilityOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px' } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasBeenVisible(true)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, isVisible, hasBeenVisible }
}
