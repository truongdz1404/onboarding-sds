'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight, MessageCircle } from 'lucide-react'

const stats = [
  { value: '11+', label: 'Năm phát triển', accent: true },
  { value: '06', label: 'Sản phẩm chủ lực', accent: false },
  { value: '500+', label: 'Thành viên', accent: true },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary text-white">
      {/* Flat geometric decoration */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-white/5" />
      <div className="pointer-events-none absolute bottom-20 left-10 h-48 w-48 rotate-12 rounded-lg bg-primary/10" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 rounded-md border-2 border-primary/30 bg-primary/20 px-4 py-2 mb-8">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="eyebrow text-accent">
                Onboarding Hub · SoftDreams
              </span>
            </div>

            <h1 className="hero-title text-white text-balance">
              Chào mừng bạn đến{' '}
              <span className="text-accent">gia đình SD</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              Mọi thứ bạn cần để hội nhập nhanh tại SoftDreams — văn hóa, nội
              quy, phúc lợi và trợ lý AI luôn sẵn sàng giải đáp.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/culture" className="btn-primary">
                Bắt đầu hội nhập
                <ArrowRight size={18} />
              </Link>
              <Link href="/chat" className="btn-ghost">
                <MessageCircle size={18} />
                Hỏi SoftBot
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 border-t-2 border-white/10 pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <div
                    className={`text-4xl font-bold tabular-nums ${
                      s.accent ? 'text-accent' : 'text-white'
                    }`}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm uppercase tracking-wider text-white/60">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/images/team.png"
                alt="Đội ngũ SoftDreams làm việc tại văn phòng"
                width={720}
                height={560}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-md bg-primary px-4 py-2 font-semibold text-white">
              Est. 2012 · Make IT Simple
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
