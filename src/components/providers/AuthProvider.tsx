"use client";

/**
 * Proveedor de Autenticación
 * Envuelve la aplicación con el SessionProvider de NextAuth
 */

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={5 * 60}> {/* Refrescar cada 5 minutos */}
      {children}
    </SessionProvider>
  );
}
