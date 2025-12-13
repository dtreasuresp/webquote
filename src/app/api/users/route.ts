/**
 * API para gestión de usuarios
 * GET: Listar todos los usuarios
 * POST: Crear nuevo usuario
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";
import { hashPassword, generateUsername, generateTemporaryPassword } from "@/lib/auth";

// GET: Listar usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión y permisos
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includePermissions = searchParams.get('includePermissions') === 'true'

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
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
        roleId: true,
        roleRef: includePermissions ? {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        } : false,
        UserPermission: includePermissions ? {
          include: {
            Permission: true,
          },
        } : false,
        QuotationConfig: {
          select: {
            id: true,
            empresa: true,
            numero: true,
          },
        },
      },
    });

    // Si se solicitan permisos, devolver array plano para compatibilidad
    if (includePermissions) {
      const res = NextResponse.json(users)
      res.headers.set('x-user-id', session.user.id || '')
      res.headers.set('x-user-role', session.user.role || '')
      return res
    }

    const res = NextResponse.json({ users })
    res.headers.set('x-user-id', session.user.id || '')
    res.headers.set('x-user-role', session.user.role || '')
    return res
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST: Crear usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión y permisos
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json();
    const { empresa, nombre, email, telefono, quotationId, role = "CLIENT" } = body;

    if (!empresa) {
      return NextResponse.json(
        { error: "El nombre de empresa es requerido" },
        { status: 400 }
      );
    }

    // Generar username basado en empresa
    let username = generateUsername(empresa);
    
    // Verificar que el username sea único
    let existingUser = await prisma.user.findUnique({ where: { username } });
    let attempts = 0;
    while (existingUser && attempts < 10) {
      username = generateUsername(empresa);
      existingUser = await prisma.user.findUnique({ where: { username } });
      attempts++;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "No se pudo generar un username único" },
        { status: 500 }
      );
    }

    // Verificar email único si se proporciona
    if (email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 }
        );
      }
    }

    // Verificar que la cotización no esté asignada a otro usuario
    if (quotationId) {
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

    // Generar contraseña temporal
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        passwordHash,
        role,
        nombre: nombre || "",
        empresa,
        telefono: telefono || "",
        quotationAssignedId: quotationId || null,
        activo: true,
      },
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
        createdAt: true,
      },
    });

    return NextResponse.json({
      user,
      temporaryPassword, // Solo se muestra una vez al crear
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
