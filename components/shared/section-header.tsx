'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <motion.div
          className="inline-flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <span
            className={cn(
              'block h-px w-8 shrink-0',
              light ? 'bg-white/60' : 'bg-primary',
            )}
          />
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-widest',
              light ? 'text-white/80' : 'text-primary',
            )}
          >
            {eyebrow}
          </span>
        </motion.div>
      ) : null}

      <motion.h2
        className={cn(
          'section-title text-balance',
          light ? 'text-white' : 'text-foreground',
        )}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay: eyebrow ? 0.06 : 0, ease: EASE_OUT_EXPO }}
      >
        {title}
      </motion.h2>

      {description ? (
        <motion.p
          className={cn(
            'text-lg leading-relaxed max-w-2xl text-pretty',
            light ? 'text-white/70' : 'text-muted-foreground',
            align === 'center' && 'mx-auto',
          )}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: eyebrow ? 0.12 : 0.06, ease: EASE_OUT_EXPO }}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  )
}
