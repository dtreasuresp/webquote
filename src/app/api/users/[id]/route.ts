/**
 * API para usuario específico
 * GET: Obtener usuario por ID
 * PATCH: Actualizar usuario
 * DELETE: Eliminar usuario
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Obtener usuario por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        nombre: true,
        empresa: true,
        telefono: true,
        quotationAssignedId: true,
        activo: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        QuotationConfig: {
          select: {
            id: true,
            empresa: true,
            numero: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar usuario
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, email, telefono, quotationId, activo, resetPassword } = body;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar email único si se cambia
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 }
        );
      }
    }

    // Verificar cotización no asignada a otro usuario
    if (quotationId && quotationId !== existingUser.quotationAssignedId) {
      const quotationAssigned = await prisma.user.findUnique({
        where: { quotationAssignedId: quotationId },
      });
      if (quotationAssigned) {
        return NextResponse.json(
          { error: "Esta cotización ya está asignada a otro usuario" },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {};
    
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email || null;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (quotationId !== undefined) updateData.quotationAssignedId = quotationId || null;
    if (activo !== undefined) updateData.activo = activo;

    // Reset de contraseña si se solicita
    let newPassword: string | null = null;
    if (resetPassword) {
      newPassword = generateTemporaryPassword();
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        nombre: true,
        empresa: true,
        telefono: true,
        quotationAssignedId: true,
        activo: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user,
      ...(newPassword && { newPassword }),
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar sesiones del usuario primero
    await prisma.session.deleteMany({ where: { userId: id } });

    // Eliminar usuario
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
