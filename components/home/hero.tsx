'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight, MessageCircle } from 'lucide-react'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const stats = [
  { value: '11+', label: 'Năm phát triển' },
  { value: '06', label: 'Sản phẩm chủ lực' },
  { value: '500+', label: 'Thành viên' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface-alt">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-60 left-1/2 -translate-x-1/3 h-[700px] w-[700px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-20 h-72 w-72 rounded-full bg-amber-400/10 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-border" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left — staggered entrance */}
          <motion.div variants={container} initial="hidden" animate="show">

            {/* Glassmorphism badge */}
              <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 mb-10"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="eyebrow text-primary">Onboarding Hub · SoftDreams</span>
            </motion.div>

            <motion.h1 variants={item} className="hero-title text-text-dark text-balance">
              Chào mừng bạn đến{' '}
              <span className="gradient-text">gia đình SD</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-lg text-xl leading-relaxed text-muted-foreground"
            >
              Mọi thứ bạn cần để hội nhập nhanh tại SoftDreams — văn hóa, nội
              quy, phúc lợi và trợ lý AI luôn sẵn sàng giải đáp.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
              <Link href="/culture" className="btn-dark">
                Bắt đầu hội nhập
                <ArrowRight size={18} />
              </Link>
              <Link href="/chat" className="btn-outline">
                <MessageCircle size={18} />
                Hỏi SoftBot
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={item}
              className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-4xl font-extrabold tabular-nums gradient-text">
                    {s.value}
                  </div>
                  <div className="mt-1.5 text-sm font-medium text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — slide in */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
          >
            {/* Glow behind image */}
            <div className="absolute inset-0 -m-4 rounded-3xl bg-primary/8 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
              <Image
                src="/images/team.png"
                alt="Đội ngũ SoftDreams làm việc tại văn phòng"
                width={720}
                height={560}
                priority
                className="h-full w-full object-cover"
              />
            </div>

            <motion.div
              className="absolute -bottom-4 -left-5 flex items-center gap-3 rounded-2xl bg-white border border-border px-5 py-3 shadow-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: EASE_OUT_EXPO }}
            >
              <span className="text-xl font-extrabold gradient-text">Est. 2012</span>
              <span className="text-sm text-muted-foreground">· Make IT Simple</span>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
