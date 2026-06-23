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
    <section className="relative overflow-hidden bg-[#f7f5f1]">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-black/8" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.3fr] xl:gap-20">

          {/* Left — staggered entrance */}
          <motion.div variants={container} initial="hidden" animate="show">

            {/* Glassmorphism badge */}
            <motion.h1 variants={item} className="hero-title text-text-dark text-balance">
              Chào mừng bạn đến{' '}
              <span className="text-primary">gia đình SDS</span>
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
            className="relative hidden lg:block xl:-mr-16 xl:mt-8 xl:ml-8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)] ring-1 ring-black/8">
              <Image
                src="/images/team-building.jpg"
                alt="Đội ngũ SoftDreams làm việc tại văn phòng"
                width={920}
                height={640}
                priority
                className="h-full w-full object-cover"
              />
            </div>

            <motion.div
              className="absolute -bottom-4 -left-5 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl ring-1 ring-black/8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: EASE_OUT_EXPO }}
            >
              <span className="text-xl font-extrabold text-primary">Est. 2012</span>
              <span className="text-sm text-muted-foreground">· Make IT Simple</span>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
