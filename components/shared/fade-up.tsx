'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

type Direction = 'up' | 'down' | 'left' | 'right'

function getInitial(direction: Direction, distance: number) {
  switch (direction) {
    case 'up':    return { opacity: 0, y: distance }
    case 'down':  return { opacity: 0, y: -distance }
    case 'left':  return { opacity: 0, x: distance }
    case 'right': return { opacity: 0, x: -distance }
  }
}

export function FadeUp({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 0.55,
  once = true,
  className,
}: {
  children: ReactNode
  delay?: number
  direction?: Direction
  distance?: number
  duration?: number
  once?: boolean
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={getInitial(direction, distance)}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  )
}
