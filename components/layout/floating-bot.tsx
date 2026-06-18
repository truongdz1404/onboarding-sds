'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot } from 'lucide-react'
import { motion } from 'motion/react'

export function FloatingBot() {
  const pathname = usePathname()
  if (pathname === '/chat') return null

  return (
    <div className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-40">
      <motion.span
        className="absolute inset-0 rounded-full bg-primary pointer-events-none"
        animate={{ scale: [1, 1.75], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4, type: 'spring', stiffness: 200, damping: 16 }}
        whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
      >
        <Link
          href="/chat"
          aria-label="Mở SoftBot — trợ lý AI"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          <Bot size={30} strokeWidth={2} />
        </Link>
      </motion.div>
    </div>
  )
}
