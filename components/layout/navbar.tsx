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
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-40 transition-all duration-200',
          scrolled
            ? 'bg-white border-b border-border shadow-sm'
            : 'bg-surface-orange/80 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="https://softdreams.vn/wp-content/uploads/2024/07/logoweb.png"
                alt="SoftDreams"
                width={140}
                height={29}
                className="h-8 w-auto object-contain"
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
                      'relative px-4 py-2 text-sm font-semibold transition-colors',
                      active
                        ? 'text-primary'
                        : 'text-foreground/70 hover:text-primary',
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
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-foreground"
              >
                <Menu size={24} />
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
