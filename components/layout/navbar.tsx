'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, MessageCircle, Sparkles } from 'lucide-react'
import { NAV_LINKS } from '@/lib/site'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const onHero = pathname === '/' || pathname === '/office'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // dark transparent bar over hero, solid white after scroll
  const darkMode = onHero && !scrolled

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 transition-colors duration-200',
        darkMode
          ? 'bg-secondary'
          : 'bg-background border-b-2 border-border',
      )}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Sparkles size={20} className="text-white" strokeWidth={2.5} />
            </span>
            <span
              className={cn(
                'text-xl font-extrabold tracking-tight',
                darkMode ? 'text-white' : 'text-foreground',
              )}
            >
              Soft<span className="text-primary">Dreams</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'text-primary'
                      : darkMode
                        ? 'text-white/80 hover:text-white'
                        : 'text-foreground hover:text-primary',
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute left-4 right-4 -bottom-0.5 h-0.5 bg-primary origin-left transition-transform duration-200',
                      active ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="hidden sm:inline-flex btn-primary !h-11 !px-5 text-sm"
            >
              <MessageCircle size={18} strokeWidth={2} />
              Hỏi SoftBot
            </Link>
            <button
              type="button"
              aria-label="Mở menu"
              onClick={() => setOpen(true)}
              className={cn(
                'md:hidden flex h-10 w-10 items-center justify-center rounded-md transition-colors',
                darkMode ? 'text-white' : 'text-foreground',
              )}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {open ? (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
          <div className="flex h-16 items-center justify-between px-5 border-b-2 border-border">
            <span className="text-xl font-extrabold">
              Soft<span className="text-primary">Dreams</span>
            </span>
            <button
              type="button"
              aria-label="Đóng menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-md"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-2 p-5">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-4 py-4 text-lg font-bold transition-colors',
                    active
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link href="/chat" className="btn-primary mt-4">
              <MessageCircle size={18} />
              Hỏi SoftBot
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
