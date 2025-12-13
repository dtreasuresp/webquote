'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RolesContent from './seguridad/RolesContent'
import PermisosContent from './seguridad/PermisosContent'
import MatrizAccesoContent from './seguridad/MatrizAccesoContent'
import PermisosUsuarioContent from './seguridad/PermisosUsuarioContent'
import LogsAuditoriaContent from './seguridad/LogsAuditoriaContent'

export type SecuritySubSection = 'roles' | 'permisos' | 'matriz' | 'usuarios-permisos' | 'logs'

interface SeguridadContentProps {
  activeSubSection: SecuritySubSection
}

export default function SeguridadContent({ activeSubSection }: Readonly<SeguridadContentProps>) {
  return (
    <div className="w-full">
      {/* Contenido de la sub-sección */}
      <AnimatePresence mode="wait">
        {activeSubSection === 'roles' && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <RolesContent />
          </motion.div>
        )}

        {activeSubSection === 'permisos' && (
          <motion.div
            key="permisos"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <PermisosContent />
          </motion.div>
        )}

        {activeSubSection === 'matriz' && (
          <motion.div
            key="matriz"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <MatrizAccesoContent />
          </motion.div>
        )}

        {activeSubSection === 'usuarios-permisos' && (
          <motion.div
            key="usuarios-permisos"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <PermisosUsuarioContent />
          </motion.div>
        )}

        {activeSubSection === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <LogsAuditoriaContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


