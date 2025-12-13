/**
 * API Route para NextAuth.js
 * Maneja todas las rutas de autenticación: /api/auth/*
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
