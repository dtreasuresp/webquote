/**
 * Prisma Middleware para Row-Level Security (RLS)
 * 
 * Implementa filtrado automático de datos basado en el usuario actual.
 * Evita tener que agregar filtros manuales en cada query.
 * 
 * IMPORTANTE: Este middleware requiere que se pase el userId en el contexto
 * de cada operación de Prisma. Ver documentación para uso correcto.
 */

import { Prisma } from '@prisma/client'

/**
 * Contexto de usuario para RLS
 * Debe ser establecido antes de cada operación de Prisma
 */
export interface RLSContext {
  userId: string
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT'
  quotationAssignedId?: string | null
}

/**
 * Middleware de Prisma para implementar RLS
 * 
 * @example
 * ```typescript
 * // En API route:
 * const prismaWithRLS = prisma.$extends(createRLSMiddleware(session.user))
 * const quotations = await prismaWithRLS.quotationConfig.findMany() // Auto-filtrado
 * ```
 */
export function createRLSMiddleware(context: RLSContext) {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        // RLS para QuotationConfig
        quotationConfig: {
          async findMany({ args, query }) {
            // SUPER_ADMIN y ADMIN sin asignación ven todas las globales
            if (
              (context.userRole === 'SUPER_ADMIN' || context.userRole === 'ADMIN') &&
              !context.quotationAssignedId
            ) {
              args.where = {
                ...args.where,
                isGlobal: true
              }
            }
            // Usuarios con asignación solo ven su cotización
            else if (context.quotationAssignedId) {
              args.where = {
                ...args.where,
                OR: [
                  { id: context.quotationAssignedId },
                  { isGlobal: true }
                ]
              }
            }
            // CLIENT sin asignación solo ve globales
            else {
              args.where = {
                ...args.where,
                isGlobal: true
              }
            }

            return query(args)
          },

          async findFirst({ args, query }) {
            // Aplicar mismo filtro que findMany
            if (
              (context.userRole === 'SUPER_ADMIN' || context.userRole === 'ADMIN') &&
              !context.quotationAssignedId
            ) {
              args.where = {
                ...args.where,
                isGlobal: true
              }
            } else if (context.quotationAssignedId) {
              args.where = {
                ...args.where,
                OR: [
                  { id: context.quotationAssignedId },
                  { isGlobal: true }
                ]
              }
            } else {
              args.where = {
                ...args.where,
                isGlobal: true
              }
            }

            return query(args)
          }
        },

        // RLS para AuditLog
        auditLog: {
          async findMany({ args, query }) {
            // Solo SUPER_ADMIN y ADMIN pueden ver todos los logs
            if (context.userRole !== 'SUPER_ADMIN' && context.userRole !== 'ADMIN') {
              args.where = {
                ...args.where,
                userId: context.userId
              }
            }

            return query(args)
          }
        },

        // RLS para UserBackup
        userBackup: {
          async findMany({ args, query }) {
            // Solo SUPER_ADMIN puede ver todos los backups
            if (context.userRole !== 'SUPER_ADMIN') {
              args.where = {
                ...args.where,
                userId: context.userId
              }
            }

            return query(args)
          },

          async findFirst({ args, query }) {
            if (context.userRole !== 'SUPER_ADMIN') {
              args.where = {
                ...args.where,
                userId: context.userId
              }
            }

            return query(args)
          },

          async findUnique({ args, query }) {
            // Verificar ownership después de query
            const result = await query(args)
            
            if (result && context.userRole !== 'SUPER_ADMIN') {
              if (result.userId !== context.userId) {
                throw new Error('No tienes permiso para acceder a este backup')
              }
            }

            return result
          }
        },

        // RLS para User (solo SUPER_ADMIN y ADMIN pueden ver todos los usuarios)
        user: {
          async findMany({ args, query }) {
            if (context.userRole === 'CLIENT') {
              args.where = {
                ...args.where,
                id: context.userId
              }
            }

            return query(args)
          }
        },

        // RLS para UserPreferences
        userPreferences: {
          async findUnique({ args, query }) {
            // Sobrescribir userId en where para asegurar que solo accede a sus propias preferencias
            if (context.userRole !== 'SUPER_ADMIN') {
              args.where = {
                userId: context.userId
              }
            }

            return query(args)
          },

          async upsert({ args, query }) {
            // Asegurar que solo modifica sus propias preferencias
            if (context.userRole !== 'SUPER_ADMIN') {
              args.where = {
                userId: context.userId
              }
              args.create = {
                ...args.create,
                userId: context.userId
              }
            }

            return query(args)
          }
        }
      }
    })
  })
}

/**
 * Middleware de Prisma para auditoría automática en modelo User
 * Detecta cambios de contraseña y crea diffs automáticamente
 */
export function createAuditMiddleware() {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      query: {
        user: {
          async update({ args, query }) {
            // Obtener estado anterior del usuario
            const before = await prisma.user.findUnique({
              where: args.where,
              select: {
                id: true,
                username: true,
                email: true,
                passwordHash: true,
                role: true,
                roleId: true,
                nombre: true,
                empresa: true,
                activo: true,
              },
            })

            if (!before) {
              // Usuario no encontrado, continuar normalmente
              return await query(args)
            }

            // Ejecutar el update
            const result = await query(args)

            // Importar helpers de auditoría
            const { createAuditLog, generateDiff, logPasswordChange } = await import('@/lib/audit/auditHelper')

            // Tipos seguros para resultado
            const resultId = (result as any)?.id as string
            const username = ((result as any)?.username || before.username || 'unknown') as string

            // Detectar cambio de contraseña
            if (
              args.data.passwordHash &&
              before.passwordHash !== args.data.passwordHash
            ) {
              await logPasswordChange(resultId, username, resultId)
            }

            // Generar diff para otros campos modificados
            const allowedFields = ['username', 'email', 'role', 'roleId', 'nombre', 'empresa', 'activo']
            const diff = generateDiff(before, result as any, allowedFields)

            if (Object.keys(diff.before).length > 0) {
              await createAuditLog({
                action: 'USER_UPDATED',
                entityType: 'USER',
                entityId: resultId,
                actorId: resultId,
                actorName: username,
                details: diff,
              })
            }

            return result
          },

          async delete({ args, query }) {
            // Obtener datos del usuario antes de borrar
            const before = await prisma.user.findUnique({
              where: args.where,
              select: { id: true, username: true, email: true, role: true },
            })

            const result = await query(args)

            if (before) {
              const { createAuditLog } = await import('@/lib/audit/auditHelper')
              
              await createAuditLog({
                action: 'USER_DELETED',
                entityType: 'USER',
                entityId: before.id,
                actorName: 'system',
                details: {
                  username: before.username,
                  email: before.email,
                  role: before.role,
                },
              })
            }

            return result
          },
        },
      },
    })
  })
}

/**
 * Helper para crear cliente Prisma con RLS
 * 
 * @example
 * ```typescript
 * // En API route:
 * export async function GET(request: NextRequest) {
 *   const { session, error } = await requireAuth()
 *   if (error) return error
 *   
 *   const prismaRLS = createPrismaWithRLS({
 *     userId: session.user.id,
 *     userRole: session.user.role,
 *     quotationAssignedId: session.user.quotationAssignedId
 *   })
 *   
 *   // Queries automáticamente filtrados
 *   const quotations = await prismaRLS.quotationConfig.findMany()
 *   const logs = await prismaRLS.auditLog.findMany()
 * }
 * ```
 */
export function createPrismaWithRLS(context: RLSContext) {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  return prisma.$extends(createRLSMiddleware(context))
}

/**
 * Tipos para Prisma con RLS
 */
export type PrismaWithRLS = ReturnType<typeof createPrismaWithRLS>
