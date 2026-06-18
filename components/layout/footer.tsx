import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, Globe, MapPin } from 'lucide-react'
import { NAV_LINKS, COMPANY } from '@/lib/site'

export function Footer() {
  return (
    <footer className="bg-surface-orange border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <Image
              src="https://softdreams.vn/wp-content/uploads/2024/07/logoweb.png"
              alt="SoftDreams"
              width={160}
              height={33}
              className="h-9 w-auto object-contain"
            />
            <p className="text-sm font-semibold text-primary">{COMPANY.slogan}</p>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Internal Onboarding Hub — đồng hành cùng bạn trong hành trình hội
              nhập gia đình SoftDreams.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="block h-px w-5 bg-primary shrink-0" />
              <p className="eyebrow text-primary">Điều hướng</p>
            </div>
            <nav className="flex flex-col gap-3">
              {[...NAV_LINKS, { href: '/chat', label: 'SoftBot AI' }].map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors w-fit"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="block h-px w-5 bg-primary shrink-0" />
              <p className="eyebrow text-primary">Liên hệ</p>
            </div>
            <ul className="flex flex-col gap-3 text-muted-foreground text-sm">
              <li className="flex items-start gap-3">
                <Mail size={15} className="text-primary shrink-0 mt-0.5" />
                {COMPANY.email}
              </li>
              <li className="flex items-start gap-3">
                <Phone size={15} className="text-primary shrink-0 mt-0.5" />
                {COMPANY.hotline}
              </li>
              <li className="flex items-start gap-3">
                <Globe size={15} className="text-primary shrink-0 mt-0.5" />
                {COMPANY.website}
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{COMPANY.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            © 2024 SoftDreams · Dành cho nhân viên nội bộ
          </p>
        </div>
      </div>
    </footer>
  )
}
