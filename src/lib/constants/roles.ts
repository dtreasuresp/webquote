/**
 * Constantes globales para roles y sus colores asociados
 * Coherente con la base de datos y el componente RolesContent
 */

export const ROLE_COLORS = {
  SUPER_ADMIN: '#DC2626', // red-600
  ADMIN: '#2563EB',       // blue-600
  CLIENT: '#16A34A',      // green-600
  USER: '#6B7280',        // gray-500 (fallback)
} as const;

export type UserRoleType = keyof typeof ROLE_COLORS;

/**
 * Obtiene el color asociado a un rol
 * @param role Nombre del rol (ej: 'SUPER_ADMIN')
 * @returns Hexadecimal del color
 */
export const getRoleColor = (role: string | null | undefined): string => {
  if (!role) return ROLE_COLORS.USER;
  const upperRole = role.toUpperCase();
  
  if (upperRole in ROLE_COLORS) {
    return ROLE_COLORS[upperRole as UserRoleType];
  }
  
  return ROLE_COLORS.USER;
};

/**
 * Configuración visual de roles para componentes UI
 */
export const ROLE_UI_CONFIG = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: ROLE_COLORS.SUPER_ADMIN,
    badge: 'bg-red-500/20 text-red-400',
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/20',
    light: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    dark: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/40',
    }
  },
  ADMIN: {
    label: 'Administrador',
    color: ROLE_COLORS.ADMIN,
    badge: 'bg-blue-500/20 text-blue-400',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    light: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    dark: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/40',
    }
  },
  CLIENT: {
    label: 'Cliente',
    color: ROLE_COLORS.CLIENT,
    badge: 'bg-green-500/20 text-green-400',
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/20',
    light: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    dark: {
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      border: 'border-green-500/40',
    }
  },
  USER: {
    label: 'Usuario',
    color: ROLE_COLORS.USER,
    badge: 'bg-gray-500/20 text-gray-400',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
    },
    dark: {
      bg: 'bg-gray-500/15',
      text: 'text-gray-400',
      border: 'border-gray-500/40',
    }
  }
} as const;
