// Modal original (mantener para compatibilidad)
export { default as PackageHistoryModal } from './PackageHistoryModal'

// Componentes de contenido para usar con DialogoGenericoDinamico
export { PackageHistoryContent } from './PackageHistoryContent'
export type { 
  PackageHistoryContentProps, 
  PackageVersion 
} from './PackageHistoryContent'

export { PaquetesComparisonContent } from './PaquetesComparisonContent'
export type { PaquetesComparisonContentProps } from './PaquetesComparisonContent'

// Comparación individual de dos paquetes seleccionados
export { PackageCompareContent } from './PackageCompareContent'
export type { PackageCompareContentProps } from './PackageCompareContent'
