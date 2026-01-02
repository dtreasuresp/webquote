'use client';

/**
 * UserProfileMenu - Menú de perfil de usuario con avatar
 * 
 * Diseño profesional y moderno:
 * - Dark variant: GitHub Dark theme (coherente con DialogoGenericoDinamico)
 * - Light variant: Microsoft Fluent Design 2 con glassmorphism
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaKey, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { HiShieldCheck, HiUserCircle, HiBriefcase, HiCog8Tooth } from 'react-icons/hi2';
import { getRoleColor, ROLE_COLORS } from '@/lib/constants/roles';

interface UserProfileMenuProps {
  /** Logo de Identidad Visual (base64) */
  logoUrl?: string;
  /** Callback cuando se abre el diálogo de cambiar contraseña */
  onChangePassword?: () => void;
  /** Callback cuando se quiere ir a preferencias */
  onPreferences?: () => void;
  /** Variante de tema: dark para admin, light para página pública */
  variant?: 'dark' | 'light';
  /** Clase CSS adicional */
  className?: string;
}

// Obtener iniciales del usuario
function getInitials(name: string, username: string): string {
  if (name?.trim()) {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
}

// Configuración de roles con estilos por variante (dark/light)
const roleConfig = {
  SUPER_ADMIN: { 
    label: 'Super Admin', 
    icon: HiShieldCheck,
    color: ROLE_COLORS.SUPER_ADMIN,
    dark: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      border: 'border-red-500/40',
    },
    light: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  },
  ADMIN: { 
    label: 'Administrador', 
    icon: HiBriefcase,
    color: ROLE_COLORS.ADMIN,
    dark: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/40',
    },
    light: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
  },
  CLIENT: { 
    label: 'Cliente', 
    icon: HiUserCircle,
    color: ROLE_COLORS.CLIENT,
    dark: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
    },
    light: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
  },
};

export function UserProfileMenu({
  logoUrl,
  onChangePassword,
  onPreferences,
  variant = 'dark',
  className = '',
}: Readonly<UserProfileMenuProps>) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menú con Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const displayName = user.nombre || user.username;
  const initials = getInitials(user.nombre, user.username);
  const isAdminPage = pathname === '/admin';
  const roleInfo = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.CLIENT;
  const RoleIcon = roleInfo.icon;
  const roleStyle = roleInfo[variant];

  const handleSignOut = async () => {
    setIsOpen(false);
    
    // Registrar logout en audit log antes de cerrar sesión
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error logging logout:', error);
    }
    
    await signOut({ callbackUrl: '/login' });
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    onChangePassword?.();
  };

  const handlePreferences = () => {
    setIsOpen(false);
    onPreferences?.();
  };

  const handleGoToAdmin = () => {
    setIsOpen(false);
    router.push('/admin');
  };

  // ==================== ESTILOS POR VARIANTE ====================
  const styles = {
    // DARK: GitHub Dark Theme (coherente con DialogoGenericoDinamico)
    dark: {
      button: {
        base: 'bg-transparent hover:bg-[#21262d] border-transparent hover:border-[#30363d]',
        active: 'bg-[#21262d] border-[#30363d]',
        ring: 'focus-visible:ring-[#58a6ff]/50',
      },
      avatar: {
        bg: 'bg-gradient-to-br from-[#21262d] to-[#161b22]',
        text: 'text-[#8b949e]',
        onlineRing: 'ring-[#0d1117]',
      },
      name: 'text-[#c9d1d9]',
      arrow: 'text-[#484f58]',
      dropdown: {
        // Coherente con DialogoGenericoDinamico
        bg: 'bg-gradient-to-b from-[#161b22] to-[#0d1117]',
        border: 'border border-[#30363d]',
        shadow: 'shadow-2xl shadow-black/60',
        ring: 'ring-1 ring-white/[0.03]',
        blur: '',
      },
      header: {
        bg: 'bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22]',
        border: 'border-[#30363d]',
        name: 'text-[#f0f6fc]',
        username: 'text-[#8b949e]',
        onlineRing: 'ring-[#161b22]',
      },
      menu: {
        text: 'text-[#c9d1d9]',
        hover: 'hover:bg-[#21262d]/80',
        icon: 'text-[#8b949e] group-hover:text-[#c9d1d9]',
        border: 'border-[#21262d]',
        danger: 'text-[#f85149] hover:bg-[#f85149]/10',
      },
    },
    // LIGHT: Microsoft Fluent Design 2 (glassmorphism profesional)
    light: {
      button: {
        base: 'bg-white/60 hover:bg-white/80 border-black/[0.06] hover:border-black/[0.1] shadow-sm hover:shadow',
        active: 'bg-white/90 border-black/[0.1] shadow',
        ring: 'focus-visible:ring-[#0078d4]/40',
      },
      avatar: {
        bg: 'bg-gradient-to-br from-[#0078d4] to-[#106ebe]',
        text: 'text-white',
        onlineRing: 'ring-white',
      },
      name: 'text-gray-800',
      arrow: 'text-gray-400',
      dropdown: {
        // Fluent Glass Effect
        bg: 'bg-white/95',
        border: 'border border-black/[0.08]',
        shadow: 'shadow-2xl shadow-black/15',
        ring: 'ring-1 ring-black/[0.04]',
        blur: 'backdrop-blur-xl backdrop-saturate-150',
      },
      header: {
        bg: 'bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80',
        border: 'border-gray-200/60',
        name: 'text-gray-900',
        username: 'text-gray-500',
        onlineRing: 'ring-white',
      },
      menu: {
        text: 'text-gray-700',
        hover: 'hover:bg-[#0078d4]/[0.08]',
        icon: 'text-gray-500 group-hover:text-[#0078d4]',
        border: 'border-gray-200/80',
        danger: 'text-red-600 hover:bg-red-500/10',
      },
    },
  };

  const s = styles[variant];

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Botón trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg
          border transition-all duration-200 ease-out
          ${s.button.base}
          focus:outline-none focus-visible:ring-2 ${s.button.ring}
          ${isOpen ? s.button.active : ''}
        `}
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar con indicador online */}
        <div className="relative">
          <div 
            className="w-8 h-8 rounded-full overflow-hidden ring-2"
            style={{ boxShadow: `0 0 0 2px ${user.roleColor || getRoleColor(user.role)}` }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${s.avatar.bg} ${s.avatar.text} font-semibold text-xs`}>
                {initials}
              </div>
            )}
          </div>
          {/* Indicador de estado online */}
          <span className={`absolute -bottom-0.5 -right-0.5 block w-1.5 h-1.5 bg-emerald-500 rounded-full ring-1 animate-pulse ${s.avatar.onlineRing}`} />
        </div>

        {/* Nombre del usuario */}
        <span className={`hidden sm:block ${s.name} text-sm font-medium max-w-[120px] truncate`}>
          {displayName}
        </span>

        {/* Flecha */}
        <FaChevronDown
          className={`w-2.5 h-2.5 ${s.arrow} transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menú desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ 
              duration: 0.15, 
              ease: [0.16, 1, 0.3, 1] // Fluent easing
            }}
            className={`
              absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden z-50
              ${s.dropdown.bg}
              ${s.dropdown.border}
              ${s.dropdown.shadow}
              ${s.dropdown.ring}
              ${s.dropdown.blur}
            `}
          >
            {/* Header con información del usuario */}
            <div className={`px-4 py-3.5 border-b ${s.header.border} ${s.header.bg}`}>
              <div className="flex items-start gap-3">
                {/* Avatar grande */}
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-12 h-12 rounded-full overflow-hidden ring-2 flex justify-center"
                    style={{ boxShadow: `0 0 0 2px ${user.roleColor || getRoleColor(user.role)}` }}
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${s.avatar.bg} ${s.avatar.text} font-bold text-sm`}>
                        {initials}
                      </div>
                    )}
                  </div>
                  {/* Indicador online */}
                  <span className={`absolute -bottom-0.5 -right-0.5 block w-3.5 h-3.5 bg-emerald-500 rounded-full ring-[3px] animate-pulse ${s.header.onlineRing}`} />
                </div>
                {/* Info del usuario */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`${s.header.name} font-semibold text-sm truncate leading-tight`}>
                      {displayName}
                    </p>
                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[6px] font-medium rounded-full border transition-colors`}
                      style={user.roleColor ? {
                        backgroundColor: `${user.roleColor}26`, // 15% opacidad
                        color: user.roleColor,
                        borderColor: `${user.roleColor}66`     // 40% opacidad
                      } : {}}
                    >
                      <RoleIcon className="w-2.5 h-2.5" />
                      <span>{roleInfo.label}</span>
                    </div>
                  </div>
                  <p className={`${s.header.username} text-xs truncate mt-0.5`}>
                    Usuario: @{user.username}
                  </p>
                  <p className={`${s.header.username} text-xs truncate mt-0.5`}>
                    Email: {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Opciones del menú */}
            <div className="py-1.5">
              {/* Panel de Administración - Solo visible para admins fuera de la página admin */}
              {!isAdminPage && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
                <MenuItemStyled
                  icon={<HiCog8Tooth className="w-4 h-4" />}
                  label="Panel de Administración"
                  onClick={handleGoToAdmin}
                  styles={s.menu}
                />
              )}

              <MenuItemStyled
                icon={<FaKey className="w-3.5 h-3.5" />}
                label="Cambiar contraseña"
                onClick={handleChangePassword}
                styles={s.menu}
              />

              {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && isAdminPage && (
                <MenuItemStyled
                  icon={<FaCog className="w-3.5 h-3.5" />}
                  label="Preferencias"
                  onClick={handlePreferences}
                  styles={s.menu}
                />
              )}
            </div>

            {/* Separador */}
            <div className={`border-t ${s.menu.border} mx-3`} />

            {/* Cerrar sesión */}
            <div className="py-1.5">
              <MenuItemStyled
                icon={<FaSignOutAlt className="w-3.5 h-3.5" />}
                label="Cerrar sesión"
                onClick={handleSignOut}
                styles={s.menu}
                variant="danger"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente de item del menú con estilos dinámicos
interface MenuItemStyledProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  styles: {
    text: string;
    hover: string;
    icon: string;
    danger: string;
  };
  variant?: 'default' | 'danger';
}

function MenuItemStyled({ icon, label, onClick, styles, variant = 'default' }: Readonly<MenuItemStyledProps>) {
  const isDanger = variant === 'danger';
  
  return (
    <button
      onClick={onClick}
      className={`
        group w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
        transition-colors duration-150
        ${isDanger ? styles.danger : `${styles.text} ${styles.hover}`}
      `}
    >
      <span className={`transition-colors duration-150 ${isDanger ? '' : styles.icon}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

// Mantener compatibilidad con el componente MenuItem anterior
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

function MenuItem({ icon, label, onClick, variant = 'default' }: Readonly<MenuItemProps>) {
  const baseClasses = "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors";
  const variantClasses = variant === 'danger'
    ? "text-[#f85149] hover:bg-[#f85149]/10"
    : "text-[#c9d1d9] hover:bg-[#21262d]";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span className="text-[#8b949e]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default UserProfileMenu;
