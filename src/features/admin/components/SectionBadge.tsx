'use client'

import { motion } from 'framer-motion'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

interface SectionBadgeProps {
  readonly isValid: boolean
  readonly title: string
}

export default function SectionBadge({ isValid, title }: SectionBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      {isValid ? (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
          <FaCheckCircle className="text-green-400 text-sm" />
          <span className="text-xs font-medium text-green-300">{title}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
          <FaExclamationCircle className="text-red-400 text-sm" />
          <span className="text-xs font-medium text-red-300">{title}</span>
        </div>
      )}
    </motion.div>
  )
}
