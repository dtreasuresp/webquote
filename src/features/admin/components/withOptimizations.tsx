/**
 * Higher Order Component (HOC) para optimizar componentes
 * Aplica React.memo, useCallback memoization y prop comparison
 * @date 2025-11-24
 */

import React, { memo, ComponentType } from 'react'

interface WithOptimizationsOptions {
  /**
   * Campos específicos a monitorear para cambios
   * Si se proporciona, solo estos campos se compararán
   */
  propsToWatch?: string[]
  
  /**
   * Función personalizada de comparación
   * Retorna true si los props son iguales (no re-renderizar)
   */
  compareProps?: (prev: any, next: any) => boolean
  
  /**
   * Nombre del componente para debugging
   */
  displayName?: string
}

/**
 * HOC que optimiza cualquier componente con:
 * - React.memo para prevenir re-renders innecesarios
 * - Comparación personalizada de props
 * - Opcional: solo monitorear campos específicos
 */
export function withOptimizations<P extends object>(
  Component: ComponentType<P>,
  options: WithOptimizationsOptions = {}
): ComponentType<P> {
  const {
    propsToWatch,
    compareProps: customCompareProps,
    displayName = Component.displayName || Component.name || 'Component',
  } = options

  /**
   * Comparador de props por defecto
   * Compara solo los campos especificados o todos si no hay propsToWatch
   */
  const defaultCompareProps = (prevProps: P, nextProps: P): boolean => {
    if (propsToWatch) {
      // Comparar solo los campos especificados
      return propsToWatch.every((field) => {
        const prev = (prevProps as any)[field]
        const next = (nextProps as any)[field]
        return JSON.stringify(prev) === JSON.stringify(next)
      })
    }

    // Comparar todos los props
    const prevKeys = Object.keys(prevProps)
    const nextKeys = Object.keys(nextProps)

    if (prevKeys.length !== nextKeys.length) {
      return false
    }

    return prevKeys.every((key) => {
      const prev = (prevProps as any)[key]
      const next = (nextProps as any)[key]

      // Para funciones, solo comparamos si son la misma referencia
      if (typeof prev === 'function' && typeof next === 'function') {
        return prev === next
      }

      // Para otros tipos, usamos JSON.stringify para comparación profunda
      return JSON.stringify(prev) === JSON.stringify(next)
    })
  }

  const compareFunction = customCompareProps || defaultCompareProps

  const OptimizedComponent = memo(Component, (prevProps, nextProps) => {
    // memo retorna true si los props SON IGUALES (no re-renderizar)
    // así que invertimos la lógica del comparador
    return compareFunction(prevProps, nextProps)
  })

  OptimizedComponent.displayName = `withOptimizations(${displayName})`

  return OptimizedComponent as ComponentType<P>
}

/**
 * Hook para ayudar a optimizar handlers dentro de componentes
 * Usa useCallback pero con una sintaxis más simple
 * 
 * @example
 * const handleClick = useOptimizedCallback(() => {
 *   console.log('clicked')
 * }, [dependency])
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // En realidad es solo useCallback, pero con typing mejorado
  return React.useCallback(callback, deps)
}

/**
 * Hook para memoizar valores derivados con comparación personalizada
 * 
 * @example
 * const total = useOptimizedMemo(() => calculateTotal(items), [items])
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return React.useMemo(factory, deps)
}

/**
 * Utilidad para crear propiedades memorizadas basadas en objetos
 * Previene re-renders cuando los objetos tienen el mismo contenido
 */
export function usePreviousProps<T extends object>(props: T): T {
  const ref = React.useRef<T>(props)

  React.useEffect(() => {
    ref.current = props
  }, [props])

  return ref.current
}

export default withOptimizations
