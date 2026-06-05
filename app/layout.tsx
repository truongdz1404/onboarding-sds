import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingBot } from '@/components/layout/floating-bot'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'SoftDreams · Onboarding Hub',
  description:
    'Internal onboarding hub for SoftDreams — Make IT Simple. Văn hóa, nội quy, blog nội bộ, văn phòng 360° và trợ lý AI SoftBot.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1a2240',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${outfit.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Navbar />
        <main className="min-h-screen pb-16 md:pb-0">{children}</main>
        <Footer />
        <FloatingBot />
        <MobileTabBar />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
