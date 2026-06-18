import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingBot } from '@/components/layout/floating-bot'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'

export const metadata: Metadata = {
  title: 'SoftDreams · Onboarding Hub',
  description:
    'Internal onboarding hub for SoftDreams — Make IT Simple. Văn hóa, nội quy, blog nội bộ, văn phòng 360° và trợ lý AI SoftBot.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#e8601a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
