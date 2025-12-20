import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/debug/org-permissions
 * Verificar permisos de organizaciones del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado', session },
        { status: 401 }
      )
    }

    // Obtener usuario con roles y permisos
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roleRef: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        },
        UserPermission: {
          include: {
            Permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Compilar permisos
    const rolePermissions = user.roleRef?.permissions.map(rp => rp.permission.code) || []
    const userPermissions = user.UserPermission.map(up => up.Permission.code)
    const allPermissions = [...new Set([...rolePermissions, ...userPermissions])]

    const orgPermissions = allPermissions.filter(p => p.startsWith('org.'))

    return NextResponse.json({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: {
        name: user.roleRef?.name || user.role,
        id: user.roleId
      },
      allPermissions,
      orgPermissions,
      hasOrgView: allPermissions.includes('org.view'),
      hasOrgCreate: allPermissions.includes('org.create'),
      hasOrgUpdate: allPermissions.includes('org.update'),
      hasOrgDelete: allPermissions.includes('org.delete')
    })
  } catch (error) {
    console.error('[Debug Org Permissions]', error)
    return NextResponse.json(
      { error: 'Error al verificar permisos', details: error instanceof Error ? error.message : 'Desconocido' },
      { status: 500 }
    )
  }
}
