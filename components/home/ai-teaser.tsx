'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Brain, ArrowRight, Bot } from 'lucide-react'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const chatContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.5, delayChildren: 0.5 } },
}
const chatBubble = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
}

export function AITeaser() {
  return (
    <section className="relative overflow-hidden bg-[#0c0c18] py-24">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/3 top-0 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left */}
            <div>
              <motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Glow behind icon */}
                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl" />
                <Brain size={32} className="relative text-primary" strokeWidth={2} />
              </motion.div>

              <h3 className="mt-7 text-3xl font-extrabold tracking-tight md:text-4xl text-balance text-white" style={{ letterSpacing: '-0.03em' }}>
                Mọi câu hỏi hội nhập —<br />
                <span className="gradient-text">đã có SoftBot</span>
              </h3>
              <p className="mt-4 max-w-md text-lg text-white/50 leading-relaxed">
                Hỏi về nội quy, chấm công, phúc lợi, thuế TNCN... SoftBot trả
                lời ngay lập tức, 24/7.
              </p>

              <Link
                href="/chat"
                className="mt-8 btn-primary inline-flex"
              >
                Trò chuyện với SoftBot
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Right — glassmorphism chat card */}
            <div className="glass-dark rounded-3xl p-7 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <Bot size={20} className="text-white" />
                </span>
                <div>
                  <div className="font-semibold text-white">SoftBot</div>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Đang hoạt động
                  </div>
                </div>
              </div>

              <motion.div
                className="mt-5 space-y-3"
                variants={chatContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <motion.div
                  variants={chatBubble}
                  className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #e8601a 0%, #f27c40 100%)' }}
                >
                  Giờ làm việc của công ty thế nào?
                </motion.div>
                <motion.div
                  variants={chatBubble}
                  className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3 text-sm text-white/90 leading-relaxed"
                >
                  Sáng 8:00–12:00, chiều 13:30–17:30. Thứ 2–6 bắt buộc, thứ 7
                  làm cách tuần. Chấm công qua Wifi & GPS trên EasyHRM nhé!
                </motion.div>
              </motion.div>

              {/* Typing indicator */}
              <motion.div
                className="mt-3 flex items-center gap-1.5 pl-1"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 2 }}
              >
                {[0, 0.15, 0.3].map((d, i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/30"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                  />
                ))}
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
