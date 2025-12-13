/**
 * Configuración de NextAuth.js
 * Sistema de autenticación para administradores y clientes
 */

import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
      avatarUrl?: string | null;
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
    avatarUrl?: string | null;
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
    avatarUrl?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Credenciales requeridas");
        }

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
          throw new Error("Usuario no encontrado");
        }

        if (!user.activo) {
          throw new Error("Usuario desactivado. Contacte al administrador.");
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Contraseña incorrecta");
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

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
        token.avatarUrl = user.avatarUrl;
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
          avatarUrl: token.avatarUrl,
        };
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
    error: "/login",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  
  // Configuración de cookies para producción (Vercel)
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
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
