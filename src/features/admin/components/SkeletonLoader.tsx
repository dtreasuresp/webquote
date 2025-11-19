'use client'

import { motion } from 'framer-motion'

export default function SkeletonLoader() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="space-y-4"
    >
      <div className="h-10 bg-white/10 rounded-lg" />
      <div className="h-32 bg-white/10 rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-white/10 rounded-lg" />
        <div className="h-20 bg-white/10 rounded-lg" />
      </div>
    </motion.div>
  )
}
