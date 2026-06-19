'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { NAV_LINKS } from '@/lib/site'
import { cn } from '@/lib/utils'
import { ScrollProgress } from '@/components/shared/scroll-progress'

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <ScrollProgress />
      {/* Floating pill navbar */}
      <header className="fixed top-4 inset-x-0 z-40 px-5 lg:px-8">
        <div
          className={cn(
            'mx-auto max-w-6xl rounded-2xl transition-all duration-300',
            scrolled
              ? 'border border-black/[0.06] px-6'
              : 'px-2',
          )}
          style={scrolled ? {
            background: '#fffffff5',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
          } : {
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex h-14 items-center justify-between px-5">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="https://softdreams.vn/wp-content/uploads/2024/07/logoweb.png"
                alt="SoftDreams"
                width={130}
                height={27}
                className="h-7 w-auto object-contain"
                priority
              />
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
                      'relative px-4 py-2 text-sm font-semibold rounded-full transition-colors',
                      active
                        ? 'text-primary bg-primary/8'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted',
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-2">
              <Link
                href="/chat"
                className="hidden sm:inline-flex btn-dark !h-9 !px-4 text-sm"
              >
                <MessageCircle size={16} strokeWidth={2} />
                Hỏi SoftBot
              </Link>
              <button
                type="button"
                aria-label="Mở menu"
                onClick={() => setOpen(true)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile full-screen menu */}
        <AnimatePresence>
          {open ? (
            <motion.div
              key="mobile-menu"
              className="fixed inset-0 z-50 bg-white md:hidden flex flex-col"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex h-16 items-center justify-between px-5 border-b border-border">
                <Image
                  src="https://softdreams.vn/wp-content/uploads/2024/07/logoweb.png"
                  alt="SoftDreams"
                  width={120}
                  height={25}
                  className="h-7 w-auto object-contain"
                />
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
                {NAV_LINKS.map((link, i) => {
                  const active = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'block rounded-md px-4 py-4 text-lg font-bold transition-colors',
                          active
                            ? 'bg-primary/10 text-primary border-l-4 border-primary'
                            : 'text-foreground hover:bg-surface-orange',
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                })}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: NAV_LINKS.length * 0.06 }}
                >
                  <Link href="/chat" className="btn-primary mt-4 w-full">
                    <MessageCircle size={18} />
                    Hỏi SoftBot
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  )
}
