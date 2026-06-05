import Link from 'next/link'
import { Mail, Phone, Globe, Sparkles } from 'lucide-react'
import { NAV_LINKS, COMPANY } from '@/lib/site'

export function Footer() {
  return (
    <footer className="bg-[#0d1117] text-white border-t-4 border-primary">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Sparkles size={20} className="text-white" strokeWidth={2.5} />
              </span>
              <span className="text-xl font-extrabold">
                Soft<span className="text-accent">Dreams</span>
              </span>
            </div>
            <p className="text-lg font-semibold">{COMPANY.slogan}</p>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed">
              Internal Onboarding Hub — đồng hành cùng bạn trong hành trình hội
              nhập gia đình SoftDreams.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <p className="eyebrow text-accent">Điều hướng</p>
            <nav className="flex flex-col gap-3">
              {[...NAV_LINKS, { href: '/chat', label: 'SoftBot AI' }].map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white/70 hover:text-accent transition-colors w-fit"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <p className="eyebrow text-accent">Liên hệ</p>
            <ul className="flex flex-col gap-3 text-white/70">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-accent shrink-0" />
                {COMPANY.email}
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-accent shrink-0" />
                {COMPANY.hotline}
              </li>
              <li className="flex items-center gap-3">
                <Globe size={16} className="text-accent shrink-0" />
                {COMPANY.website}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t-2 border-white/10 pt-6">
          <p className="text-sm text-white/40">
            © 2024 SoftDreams · Dành cho nhân viên nội bộ
          </p>
        </div>
      </div>
    </footer>
  )
}
