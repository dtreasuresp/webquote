'use client'

import React, { useState } from 'react'
import { Clock, User, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

interface AuditInfoProps {
  module: string
  action: string
  timestamp?: string
  user?: string
  changes?: Record<string, { before: any; after: any }>
}

export default function AuditInfo({
  module,
  action,
  timestamp,
  user,
  changes,
}: Readonly<AuditInfoProps>) {
  const [expandChanges, setExpandChanges] = useState(false)

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-400 bg-green-500/10'
      case 'UPDATE':
        return 'text-blue-400 bg-blue-500/10'
      case 'DELETE':
        return 'text-red-400 bg-red-500/10'
      case 'VIEW':
        return 'text-gray-400 bg-gray-500/10'
      default:
        return 'text-gray-400 bg-gray-500/10'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[10px] bg-gh-bg-secondary/50 border border-gh-border/50 rounded-lg p-2.5 flex items-center gap-2 text-gh-text-muted"
    >
      <Shield className="w-3.5 h-3.5 flex-shrink-0 text-gh-success/70" />

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gh-text">{module}</span>
          <span className={`px-1.5 py-0.5 rounded font-bold ${getActionColor(action)}`}>
            {action}
          </span>
        </div>

        {(timestamp || user) && (
          <div className="flex items-center gap-3 text-[9px]">
            {timestamp && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(timestamp).toLocaleString('es-CO')}</span>
              </div>
            )}
            {user && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{user}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {changes && Object.keys(changes).length > 0 && (
        <button
          onClick={() => setExpandChanges(!expandChanges)}
          className="flex-shrink-0 px-2 py-1 rounded hover:bg-gh-success/10 text-gh-success text-[9px] font-bold"
        >
          {expandChanges ? 'Ocultar' : 'Ver'} cambios ({Object.keys(changes).length})
        </button>
      )}

      {expandChanges && changes && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gh-bg border border-gh-border rounded-lg p-2.5 text-[9px] max-h-48 overflow-y-auto space-y-1.5 z-50">
          {Object.entries(changes).map(([key, { before, after }]) => (
            <div key={key} className="p-1.5 bg-gh-bg-secondary/50 rounded border border-gh-border/30">
              <p className="font-semibold text-gh-text">{key}</p>
              <p className="text-red-400">Antes: {JSON.stringify(before)}</p>
              <p className="text-green-400">Después: {JSON.stringify(after)}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
