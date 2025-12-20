import { prisma } from '@/lib/prisma'

/**
 * Niveles organizacionales jerárquicos
 */
export const ORGANIZATION_LEVELS = {
  RAIZ: 'RAIZ',
  EMPRESA: 'EMPRESA',
  DEPARTAMENTO: 'DEPARTAMENTO',
  EQUIPO: 'EQUIPO',
  PROYECTO: 'PROYECTO'
} as const

export type OrganizationLevelType = typeof ORGANIZATION_LEVELS[keyof typeof ORGANIZATION_LEVELS]

/**
 * Orden jerárquico (0 = RAIZ, más bajo = más profundo)
 */
const LEVEL_HIERARCHY = {
  [ORGANIZATION_LEVELS.RAIZ]: 0,
  [ORGANIZATION_LEVELS.EMPRESA]: 1,
  [ORGANIZATION_LEVELS.DEPARTAMENTO]: 2,
  [ORGANIZATION_LEVELS.EQUIPO]: 3,
  [ORGANIZATION_LEVELS.PROYECTO]: 4
}

/**
 * Niveles válidos después de cada nivel
 */
const VALID_CHILDREN: Record<OrganizationLevelType, OrganizationLevelType[]> = {
  [ORGANIZATION_LEVELS.RAIZ]: [ORGANIZATION_LEVELS.EMPRESA],
  [ORGANIZATION_LEVELS.EMPRESA]: [ORGANIZATION_LEVELS.DEPARTAMENTO],
  [ORGANIZATION_LEVELS.DEPARTAMENTO]: [ORGANIZATION_LEVELS.EQUIPO],
  [ORGANIZATION_LEVELS.EQUIPO]: [ORGANIZATION_LEVELS.PROYECTO],
  [ORGANIZATION_LEVELS.PROYECTO]: [] // No puede tener hijos
}

/**
 * Calcula el nivel de una organización basado en su parent
 * @param parentId ID del padre (undefined = RAIZ)
 * @returns Nivel calculado
 */
export async function calculateOrganizationLevel(
  parentId: string | undefined | null
): Promise<OrganizationLevelType> {
  // Sin padre = es RAIZ
  if (!parentId) {
    console.log('[ORG HELPER] No parent, returning RAIZ')
    return ORGANIZATION_LEVELS.RAIZ
  }

  try {
    console.log('[ORG HELPER] Calculating level for parentId:', parentId)
    const parent = await prisma.organization.findUnique({
      where: { id: parentId },
      select: { nivel: true }
    })

    if (!parent) {
      throw new Error('Parent organization not found')
    }

    console.log('[ORG HELPER] Parent found with nivel:', parent.nivel)
    const parentLevel = parent.nivel as OrganizationLevelType
    const nextLevel = getNextLevel(parentLevel)

    if (!nextLevel) {
      throw new Error(`Cannot create children under ${parentLevel}`)
    }

    console.log('[ORG HELPER] Calculated next level:', nextLevel)
    return nextLevel
  } catch (error) {
    console.error('[ORG HELPER] Error calculating level:', error)
    throw new Error(`Failed to calculate organization level: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Obtiene el siguiente nivel jerárquico válido
 */
function getNextLevel(currentLevel: OrganizationLevelType): OrganizationLevelType | null {
  const validChildren = VALID_CHILDREN[currentLevel]
  return validChildren.length > 0 ? validChildren[0] : null
}

/**
 * Valida si una transición jerárquica es válida
 */
export async function validateHierarchyTransition(
  parentId: string | undefined | null
): Promise<{ valid: boolean; reason?: string }> {
  if (!parentId) {
    return { valid: true } // RAIZ siempre es válido
  }

  try {
    const parent = await prisma.organization.findUnique({
      where: { id: parentId },
      select: { nivel: true, id: true }
    })

    if (!parent) {
      return { valid: false, reason: 'Parent organization does not exist' }
    }

    const parentLevel = parent.nivel as OrganizationLevelType
    const validChildren = VALID_CHILDREN[parentLevel]

    if (validChildren.length === 0) {
      return {
        valid: false,
        reason: `Cannot create children under ${parentLevel} organizations`
      }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, reason: 'Failed to validate hierarchy' }
  }
}

/**
 * Obtiene el rango de niveles válidos para ser hijo de un parent
 */
export function getValidChildLevels(parentLevel: OrganizationLevelType): OrganizationLevelType[] {
  return VALID_CHILDREN[parentLevel] || []
}

/**
 * Formatea el nivel para mostrar en UI
 */
export function formatLevel(level: OrganizationLevelType): string {
  const levelNames: Record<OrganizationLevelType, string> = {
    [ORGANIZATION_LEVELS.RAIZ]: 'Organización Superior',
    [ORGANIZATION_LEVELS.EMPRESA]: 'Empresa',
    [ORGANIZATION_LEVELS.DEPARTAMENTO]: 'Departamento',
    [ORGANIZATION_LEVELS.EQUIPO]: 'Equipo',
    [ORGANIZATION_LEVELS.PROYECTO]: 'Proyecto'
  }
  return levelNames[level]
}

/**
 * Obtiene el icono para mostrar en UI
 */
export function getLevelIcon(level: OrganizationLevelType): string {
  const icons: Record<OrganizationLevelType, string> = {
    [ORGANIZATION_LEVELS.RAIZ]: '🏢',
    [ORGANIZATION_LEVELS.EMPRESA]: '🏭',
    [ORGANIZATION_LEVELS.DEPARTAMENTO]: '📂',
    [ORGANIZATION_LEVELS.EQUIPO]: '👥',
    [ORGANIZATION_LEVELS.PROYECTO]: '🎯'
  }
  return icons[level]
}

/**
 * Obtiene el color para mostrar en UI (Tailwind)
 */
export function getLevelColor(level: OrganizationLevelType): string {
  const colors: Record<OrganizationLevelType, string> = {
    [ORGANIZATION_LEVELS.RAIZ]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [ORGANIZATION_LEVELS.EMPRESA]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [ORGANIZATION_LEVELS.DEPARTAMENTO]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [ORGANIZATION_LEVELS.EQUIPO]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [ORGANIZATION_LEVELS.PROYECTO]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return colors[level]
}
