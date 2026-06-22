'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bot, MessageCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { SOFTBOT_WELCOME } from '@/lib/softbot-config'
import { SoftBotChat } from '@/components/chat/softbot-chat'

const TEASER_KEY = 'softbot-teaser-dismissed'

export function FloatingBot() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [showTeaser, setShowTeaser] = useState(false)

  useEffect(() => {
    if (pathname === '/chat') return
    const dismissed = sessionStorage.getItem(TEASER_KEY)
    if (!dismissed) {
      const timer = setTimeout(() => setShowTeaser(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  if (pathname === '/chat') return null

  function dismissTeaser() {
    setShowTeaser(false)
    sessionStorage.setItem(TEASER_KEY, '1')
  }

  function toggleChat() {
    setOpen((prev) => !prev)
    dismissTeaser()
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 origin-bottom-right"
          >
            <SoftBotChat variant="widget" onClose={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showTeaser && !open ? (
          <motion.div
            key="teaser"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-[calc(100%+12px)] right-0 w-[min(300px,calc(100vw-2rem))]"
          >
            <div className="relative rounded-2xl border border-border bg-white p-4 pt-6 shadow-xl">
              <button
                type="button"
                onClick={dismissTeaser}
                aria-label="Đóng gợi ý"
                className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={14} />
              </button>

              <span className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-primary/10 ring-4 ring-white">
                <Bot size={20} className="text-primary" />
              </span>

              <p className="text-center text-sm leading-relaxed text-foreground">
                {SOFTBOT_WELCOME.teaser}
              </p>

              <button
                type="button"
                onClick={toggleChat}
                className="mt-3 w-full rounded-xl bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Bắt đầu trò chuyện
              </button>
            </div>
            <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-border bg-white" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative flex justify-end">
        {!open ? (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary pointer-events-none"
            animate={{ scale: [1, 1.75], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        ) : null}

        <motion.button
          type="button"
          onClick={toggleChat}
          aria-label={open ? 'Đóng SoftBot' : 'Mở SoftBot — trợ lý AI'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4, type: 'spring', stiffness: 200, damping: 16 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            open ? 'bg-secondary' : 'bg-primary',
          )}
        >
          {open ? <X size={26} strokeWidth={2} /> : <MessageCircle size={28} strokeWidth={2} />}
        </motion.button>
      </div>
    </div>
  )
}
