/**
 * API para cambiar contraseña de usuario
 * 
 * PUT /api/users/password
 * 
 * Permite:
 * - A un usuario cambiar su propia contraseña (requiere contraseña actual)
 * - A SUPER_ADMIN resetear contraseña de ADMIN o CLIENT
 * - A ADMIN resetear contraseña solo de CLIENT
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canResetPassword } from '@/lib/auth/permissions';
import { requireAuth } from '@/lib/apiProtection';

export async function PUT(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword, isAdminReset } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    const targetUserId = userId || session.user.id;
    const isSelfChange = targetUserId === session.user.id;

    // Obtener usuario objetivo
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos para reset de admin
    if (!isSelfChange) {
      // Verificar que el actor puede resetear la contraseña del objetivo
      const actorRole = session.user.role as 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT';
      const targetRole = targetUser.role as 'SUPER_ADMIN' | 'ADMIN' | 'CLIENT';

      if (!canResetPassword(actorRole, targetRole)) {
        return NextResponse.json(
          { error: 'No tienes permiso para resetear la contraseña de este usuario' },
          { status: 403 }
        );
      }
    }

    // Si es cambio propio, verificar contraseña actual
    if (isSelfChange && !isAdminReset) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'La contraseña actual es requerida' },
          { status: 400 }
        );
      }

      const isValidCurrentPassword = await verifyPassword(
        currentPassword,
        targetUser.passwordHash
      );

      if (!isValidCurrentPassword) {
        return NextResponse.json(
          { error: 'La contraseña actual es incorrecta' },
          { status: 400 }
        );
      }

      // Verificar que la nueva contraseña sea diferente
      const isSamePassword = await verifyPassword(
        newPassword,
        targetUser.passwordHash
      );

      if (isSamePassword) {
        return NextResponse.json(
          { error: 'La nueva contraseña debe ser diferente a la actual' },
          { status: 400 }
        );
      }
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // Log de la acción
    console.log(
      `[PASSWORD_CHANGE] Usuario ${session.user.username} (${session.user.role}) ` +
      `${isSelfChange ? 'cambió su propia contraseña' : `reseteó la contraseña de ${targetUser.username} (${targetUser.role})`}`
    );

    return NextResponse.json({
      success: true,
      message: isSelfChange 
        ? 'Contraseña cambiada exitosamente' 
        : `Contraseña de ${targetUser.username} reseteada exitosamente`,
    });

  } catch (error) {
    console.error('[PASSWORD_CHANGE_ERROR]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
