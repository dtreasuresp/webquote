/**
 * API para gestión de usuarios
 * GET: Listar todos los usuarios (require: users.view)
 * POST: Crear nuevo usuario (require: users.create)
 */

import { NextRequest, NextResponse } from "next/server";
import { authOptions, hashPassword, generateUsername, generateTemporaryPassword } from '@/lib/auth'
import { prisma } from "@/lib/prisma";
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'

// GET: Listar usuarios
export async function GET(request: NextRequest) {
  try {
    // ✅ Verificar permiso de lectura
    const { session, error, accessLevel } = await requireReadPermission('users.view')
    if (error) return error

    const { searchParams } = new URL(request.url)
    const includePermissions = searchParams.get('includePermissions') === 'true'

    // Aplicar filtro según Access Level
    const canViewAll = accessLevel === 'full' || accessLevel === 'write'
    
    const users = await prisma.user.findMany({
      // Si no tiene acceso completo, solo ver usuarios de su empresa
      where: canViewAll ? undefined : {
        empresa: session!.user.empresa,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        nombre: true,
        empresa: true,
        telefono: true,
        organizationId: true,
        quotationAssignedId: true,
        activo: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
        roleRef: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
          },
        },
        UserPermission: includePermissions ? {
          include: {
            Permission: true,
          },
        } : false,
        quotationAssigned: {
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
      res.headers.set('x-user-id', session!.user.id || '')
      res.headers.set('x-user-role', session!.user.role || '')
      res.headers.set('x-access-level', accessLevel || 'none')
      return res
    }

    const res = NextResponse.json({ users })
    res.headers.set('x-user-id', session!.user.id || '')
    res.headers.set('x-user-role', session!.user.role || '')
    res.headers.set('x-access-level', accessLevel || 'none')
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
    // ✅ Verificar permiso de escritura para crear usuarios
    const { session, error } = await requireWritePermission('users.create')
    if (error) return error

    const body = await request.json();
    const { empresa, nombre, email, telefono, quotationId, role = "CLIENT", organizationId } = body;

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
        organizationId: organizationId || null,
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
        organizationId: true,
        quotationAssignedId: true,
        activo: true,
        createdAt: true,
      },
    });

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'user.created',
        entityType: 'User',
        entityId: user.id,
        userId: session.user.id || null,
        userName: session.user.username || 'SYSTEM',
        details: {
          username: user.username,
          nombre: user.nombre,
          role: user.role,
          empresa: user.empresa,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

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
