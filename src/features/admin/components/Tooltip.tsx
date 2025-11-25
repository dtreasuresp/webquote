'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  readonly text: string
  readonly children: ReactNode
  readonly position?: TooltipPosition
}

const getPositionClasses = (position: TooltipPosition) => {
  switch (position) {
    case 'top':
      return 'bottom-full mb-2 -translate-x-1/2 left-1/2'
    case 'bottom':
      return 'top-full mt-2 -translate-x-1/2 left-1/2'
    case 'left':
      return 'right-full mr-2 top-1/2 -translate-y-1/2'
    case 'right':
      return 'left-full ml-2 top-1/2 -translate-y-1/2'
    default:
      return 'bottom-full mb-2 -translate-x-1/2 left-1/2'
  }
}

const getArrowClasses = (position: TooltipPosition) => {
  switch (position) {
    case 'top':
      return 'bottom-[-5px] left-1/2 -translate-x-1/2'
    case 'bottom':
      return 'top-[-5px] left-1/2 -translate-x-1/2'
    case 'left':
      return 'right-[-5px] top-1/2 -translate-y-1/2'
    case 'right':
      return 'left-[-5px] top-1/2 -translate-y-1/2'
    default:
      return 'bottom-[-5px] left-1/2 -translate-x-1/2'
  }
}

export default function Tooltip({
  text,
  children,
  position = 'top'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label={text}
      >
        {children}
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${getPositionClasses(position)} bg-gh-bg text-gh-text text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 pointer-events-none border border-gh-border backdrop-blur-md`}
          >
            {text}
            <div className={`absolute w-2 h-2 bg-gh-bg border border-gh-border rotate-45 ${getArrowClasses(position)}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

