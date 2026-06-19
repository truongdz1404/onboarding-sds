import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, Globe, MapPin } from 'lucide-react'
import { NAV_LINKS, COMPANY } from '@/lib/site'

export function Footer() {
  return (
    <footer style={{ background: '#0f171f' }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <Image
              src="https://softdreams.vn/wp-content/uploads/2024/07/logoweb.png"
              alt="SoftDreams"
              width={160}
              height={33}
              className="h-9 w-auto object-contain brightness-0 invert"
            />
            <p className="text-sm font-semibold text-primary">{COMPANY.slogan}</p>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Internal Onboarding Hub — đồng hành cùng bạn trong hành trình hội
              nhập gia đình SoftDreams.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Điều hướng</p>
            <nav className="flex flex-col gap-3">
              {[...NAV_LINKS, { href: '/chat', label: 'SoftBot AI' }].map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors w-fit text-sm"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Liên hệ</p>
            <ul className="flex flex-col gap-3 text-white/60 text-sm">
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

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-sm text-white/30">
            © 2024 SoftDreams · Dành cho nhân viên nội bộ
          </p>
        </div>
      </div>
    </footer>
  )
}
