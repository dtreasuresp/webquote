/**
 * Configuración de NextAuth.js
 * Sistema de autenticación para administradores y clientes
 */

import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logLoginSuccess, logLoginFailed, createAuditLog } from "@/lib/audit/auditHelper";

// Tipos de roles disponibles
type UserRoleType = "SUPER_ADMIN" | "ADMIN" | "CLIENT";

// Extender los tipos de NextAuth para incluir campos personalizados
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email?: string | null;
      role: UserRoleType;
      empresa: string;
      nombre: string;
      quotationAssignedId?: string | null;
      organizationId?: string | null;
      avatarUrl?: string | null;
      permissions?: Array<string | { code: string; granted: boolean }>;
    };
  }
  
  interface User {
    id: string;
    username: string;
    email?: string | null;
    role: UserRoleType;
    empresa: string;
    nombre: string;
    quotationAssignedId?: string | null;
    organizationId?: string | null;
    avatarUrl?: string | null;
    permissions?: Array<string | { code: string; granted: boolean }>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: UserRoleType;
    empresa: string;
    nombre: string;
    quotationAssignedId?: string | null;
    organizationId?: string | null;
    avatarUrl?: string | null;
    permissions?: Array<string | { code: string; granted: boolean }>;
    permissionsCacheValidAt?: number; // ✨ FASE 12: Timestamp de validación de caché
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log('[AUTH] ==================== AUTHORIZE INICIADO ====================')
        console.log('[AUTH] Username recibido:', credentials?.username)
        console.log('[AUTH] Password recibido (length):', credentials?.password?.length)
        
        if (!credentials?.username || !credentials?.password) {
          console.log('[AUTH] ERROR: Credenciales faltantes')
          await logLoginFailed(credentials?.username || 'unknown', 'bad-credentials')
          throw new Error("Credenciales requeridas");
        }

        console.log('[AUTH] Buscando usuario en BD...')
        // Buscar usuario por username
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          select: {
            id: true,
            username: true,
            email: true,
            passwordHash: true,
            role: true,
            empresa: true,
            nombre: true,
            quotationAssignedId: true,
            avatarUrl: true,
            activo: true,
          },
        });

        if (!user) {
          console.log('[AUTH] ERROR: Usuario no encontrado')
          await logLoginFailed(credentials.username, 'user-not-found')
          throw new Error("Usuario no encontrado");
        }

        console.log('[AUTH] Usuario encontrado:', user.username, 'activo:', user.activo)

        if (!user.activo) {
          console.log('[AUTH] ERROR: Usuario desactivado')
          await logLoginFailed(credentials.username, 'user-inactive')
          throw new Error("Usuario desactivado. Contacte al administrador.");
        }

        console.log('[AUTH] Verificando contraseña...')
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        console.log('[AUTH] Contraseña válida:', isValidPassword)

        if (!isValidPassword) {
          console.log('[AUTH] ERROR: Contraseña incorrecta')
          await logLoginFailed(credentials.username, 'bad-credentials')
          throw new Error("Contraseña incorrecta");
        }

        console.log('[AUTH] Actualizando último login...')
        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        // Loggear login exitoso usando helper de auditoría
        await logLoginSuccess(user.id, user.username, user.email ?? undefined)

        console.log('[AUTH] ✅ Autenticación exitosa para:', user.username)
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          empresa: user.empresa,
          nombre: user.nombre,
          quotationAssignedId: user.quotationAssignedId,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      // Añadir datos del usuario al token JWT
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.empresa = user.empresa;
        token.nombre = user.nombre;
        token.quotationAssignedId = user.quotationAssignedId;
        token.organizationId = user.organizationId;
        token.avatarUrl = user.avatarUrl;
        
        // Cargar permisos del usuario
        const userFromDb = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            roleId: true,
            UserPermission: {
              include: {
                Permission: {
                  select: { code: true }
                }
              }
            }
          },
        });

        const permissionCodes: string[] = [];

        // 1. Permisos del rol (RolePermissions)
        if (userFromDb?.roleId) {
          const rolePerms = await prisma.rolePermissions.findMany({
            where: { 
              roleId: userFromDb.roleId,
              accessLevel: { not: 'none' }
            },
            include: {
              permission: {
                select: { code: true }
              }
            }
          });
          
          rolePerms.forEach(rp => {
            if (!permissionCodes.includes(rp.permission.code)) {
              permissionCodes.push(rp.permission.code);
            }
          });
        }

        // 2. Permisos directos del usuario (UserPermission)
        userFromDb?.UserPermission.forEach(up => {
          if (!permissionCodes.includes(up.Permission.code)) {
            permissionCodes.push(up.Permission.code);
          }
        });

        token.permissions = permissionCodes;
        
        // ✨ FASE 12: Agregar timestamp para validación de caché
        token.permissionsCacheValidAt = Date.now();
      }
      return token;
    },
    
    async session({ session, token }) {
      // Añadir datos del token a la sesión
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          email: token.email as string | undefined,
          role: token.role,
          empresa: token.empresa,
          nombre: token.nombre,
          quotationAssignedId: token.quotationAssignedId,
          organizationId: token.organizationId,
          avatarUrl: token.avatarUrl,
          permissions: token.permissions as string[] | undefined,
        };
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      try {
        await createAuditLog({
          action: 'LOGOUT',
          entityType: 'AUTH',
          entityId: token?.id,
          actorId: token?.id,
          actorName: String(token?.username ?? 'unknown'),
        })
      } catch (error) {
        console.error('[AUTH_EVENTS] Error en signOut:', error)
      }
    },
  },
  
  pages: {
    signIn: "/login",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === "development",
};

/**
 * Funciones de utilidad para autenticación
 */

/**
 * Hash de contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verificar contraseña contra hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generar username basado en nombre de empresa
 * Formato: primeras letras de cada palabra + número aleatorio
 */
export function generateUsername(empresa: string): string {
  // Limpiar y normalizar el nombre de empresa
  const cleaned = empresa
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replaceAll(/[^a-z0-9\s]/g, "") // Solo alfanuméricos y espacios
    .trim();
  
  // Obtener iniciales o primeras 3 letras de cada palabra
  const words = cleaned.split(/\s+/).filter(Boolean);
  let base = "";
  
  if (words.length === 1) {
    // Una sola palabra: usar las primeras 6 letras
    base = words[0].substring(0, 6);
  } else if (words.length === 2) {
    // Dos palabras: primeras 3 de cada una
    base = words[0].substring(0, 3) + words[1].substring(0, 3);
  } else {
    // Más palabras: iniciales
    base = words.map(w => w[0]).join("").substring(0, 6);
  }
  
  // Añadir número aleatorio de 3 dígitos
  const randomNum = Math.floor(Math.random() * 900) + 100;
  
  return `${base}${randomNum}`;
}

/**
 * Generar contraseña temporal segura
 */
export function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
