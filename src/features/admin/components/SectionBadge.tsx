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
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/50 rounded-full">
          <FaCheckCircle className="text-accent text-sm" />
          <span className="text-xs font-medium text-accent">{title}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/50 rounded-full">
          <FaExclamationCircle className="text-primary text-sm" />
          <span className="text-xs font-medium text-primary">{title}</span>
        </div>
      )}
    </motion.div>
  )
}
