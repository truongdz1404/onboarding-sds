'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, FileText, MapPin, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/culture', label: 'Văn hóa', icon: Target },
  { href: '/blog', label: 'Blog', icon: FileText },
  { href: '/office', label: 'Văn phòng', icon: MapPin },
  { href: '/chat', label: 'SoftBot', icon: Bot },
]

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background border-t-2 border-border">
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.href
          const Icon = tab.icon
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded-md transition-colors',
                    active && 'bg-primary/10',
                  )}
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
