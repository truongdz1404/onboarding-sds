'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot } from 'lucide-react'

export function FloatingBot() {
  const pathname = usePathname()
  if (pathname === '/chat') return null

  return (
    <Link
      href="/chat"
      aria-label="Mở SoftBot — trợ lý AI"
      className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
    >
      <Bot size={30} strokeWidth={2} />
    </Link>
  )
}
