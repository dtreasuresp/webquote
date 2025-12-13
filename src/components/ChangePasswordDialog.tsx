'use client';

/**
 * ChangePasswordDialog - Diálogo para cambiar contraseña
 * 
 * Utiliza DialogoGenericoDinamico como base.
 * Permite al usuario cambiar su propia contraseña o a un admin resetear la de otro usuario.
 */

import React, { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FaEye, FaEyeSlash, FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DialogoGenericoDinamico from '@/features/admin/components/DialogoGenericoDinamico';

interface ChangePasswordDialogProps {
  /** Si el diálogo está abierto */
  isOpen: boolean;
  /** Callback para cerrar el diálogo */
  onClose: () => void;
  /** Callback cuando se cambia la contraseña exitosamente */
  onSuccess?: () => void;
  /** ID del usuario a quien se le cambia la contraseña (null = usuario actual) */
  targetUserId?: string | null;
  /** Nombre del usuario objetivo (para mostrar en el título) */
  targetUserName?: string;
  /** Si es un reset de admin (no requiere contraseña actual) */
  isAdminReset?: boolean;
}

// Validación de fortaleza de contraseña
interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function checkPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const strengthMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Muy débil', color: 'bg-red-500' },
    1: { label: 'Débil', color: 'bg-orange-500' },
    2: { label: 'Regular', color: 'bg-yellow-500' },
    3: { label: 'Buena', color: 'bg-blue-500' },
    4: { label: 'Fuerte', color: 'bg-green-500' },
    5: { label: 'Muy fuerte', color: 'bg-green-600' },
  };

  return {
    score,
    label: strengthMap[score].label,
    color: strengthMap[score].color,
    checks,
  };
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
  onSuccess,
  targetUserId = null,
  targetUserName,
  isAdminReset = false,
}: ChangePasswordDialogProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isSelfChange = !targetUserId || targetUserId === session?.user?.id;
  const needsCurrentPassword = isSelfChange && !isAdminReset;
  const passwordStrength = checkPasswordStrength(newPassword);

  const resetForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = async () => {
    setError(null);

    // Validaciones
    if (needsCurrentPassword && !currentPassword) {
      setError('La contraseña actual es requerida');
      return;
    }

    if (!newPassword) {
      setError('La nueva contraseña es requerida');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (needsCurrentPassword && currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId || session?.user?.id,
          currentPassword: needsCurrentPassword ? currentPassword : undefined,
          newPassword,
          isAdminReset,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const title = isSelfChange 
    ? 'Cambiar Contraseña' 
    : `Resetear Contraseña de ${targetUserName || 'Usuario'}`;

  const description = isSelfChange
    ? 'Ingresa tu contraseña actual y la nueva contraseña'
    : `Asignar una nueva contraseña para ${targetUserName || 'el usuario'}`;

  // Renderizado personalizado del contenido
  const renderContent = () => (
    <div className="space-y-5">
      {/* Mensaje de éxito */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <FaCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-green-300 font-medium">
              ¡Contraseña cambiada exitosamente!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <FaTimes className="w-4 h-4 text-white" />
            </div>
            <span className="text-red-300 font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <>
          {/* Contraseña actual (solo para cambio propio) */}
          {needsCurrentPassword && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Contraseña actual
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <FaLock className="w-4 h-4" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Ingresa tu contraseña actual"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showCurrentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Nueva contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Nueva contraseña
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <FaLock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Ingresa la nueva contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>

            {/* Indicador de fortaleza */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      className={`h-full ${passwordStrength.color} rounded-full transition-all`}
                    />
                  </div>
                  <span className="text-xs text-white/60">{passwordStrength.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-400' : 'text-white/40'}`}>
                    {passwordStrength.checks.length ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-400' : 'text-white/40'}`}>
                    {passwordStrength.checks.uppercase ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
                    <span>Mayúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-400' : 'text-white/40'}`}>
                    {passwordStrength.checks.lowercase ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
                    <span>Minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-400' : 'text-white/40'}`}>
                    {passwordStrength.checks.number ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
                    <span>Número</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.checks.special ? 'text-green-400' : 'text-white/40'}`}>
                    {passwordStrength.checks.special ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
                    <span>Caracter especial</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <FaLock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : confirmPassword && confirmPassword === newPassword
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
                placeholder="Confirma la nueva contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <FaTimes className="w-3 h-3" />
                Las contraseñas no coinciden
              </p>
            )}
            {confirmPassword && confirmPassword === newPassword && newPassword.length >= 8 && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <FaCheck className="w-3 h-3" />
                Las contraseñas coinciden
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <DialogoGenericoDinamico
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      contentType="custom"
      content={renderContent()}
      variant="premium"
      type="info"
      size="md"
      zIndex={isAdminPage ? 60 : 50}
      actions={success ? [] : [
        {
          id: 'cancel',
          label: 'Cancelar',
          variant: 'secondary',
          onClick: handleClose,
        },
        {
          id: 'submit',
          label: isLoading ? 'Guardando...' : 'Cambiar Contraseña',
          variant: 'primary',
          onClick: handleSubmit,
          loading: isLoading,
        },
      ]}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    />
  );
}

export default ChangePasswordDialog;
