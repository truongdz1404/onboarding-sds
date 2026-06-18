'use client'

import { Target, Eye, ThumbsUp, ShieldCheck, Ear } from 'lucide-react'
import { motion } from 'motion/react'
import { FadeUp } from '@/components/shared/fade-up'
import { SectionHeader } from '@/components/shared/section-header'
import { IconBox } from '@/components/shared/icon-box'

const values = [
  { icon: ThumbsUp, label: 'Dễ dùng', desc: 'Đơn giản hóa mọi giải pháp' },
  { icon: ShieldCheck, label: 'Tin tưởng', desc: 'Cam kết & minh bạch' },
  { icon: Ear, label: 'Lắng nghe', desc: 'Thấu hiểu khách hàng' },
]

export function MissionVision() {
  return (
    <section className="bg-surface-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Kim chỉ nam"
          title="Sứ mệnh · Tầm nhìn · Giá trị"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Mission — cam đậm */}
          <FadeUp>
            <motion.article
              className="flex h-full flex-col gap-5 rounded-xl bg-white border-2 border-primary p-8"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span className="eyebrow w-fit rounded-md bg-primary/10 px-3 py-1.5 text-primary">
                Sứ mệnh
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                <Target size={28} className="text-primary" strokeWidth={2} />
              </div>
              <p className="text-2xl font-extrabold leading-snug text-text-dark" style={{ letterSpacing: '-0.02em' }}>
                Nâng tầm quản trị doanh nghiệp thông qua{' '}
                <span className="gradient-text">IT đơn giản hóa</span>
              </p>
            </motion.article>
          </FadeUp>

          {/* Vision — cam nhạt */}
          <FadeUp delay={0.08}>
            <motion.article
              className="flex h-full flex-col gap-5 rounded-xl bg-white border border-border shadow-sm p-8"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span className="eyebrow w-fit rounded-md bg-primary/12 px-3 py-1.5 text-primary">
                Tầm nhìn
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                <Eye size={28} className="text-primary" strokeWidth={2} />
              </div>
              <p className="text-2xl font-bold leading-snug tracking-tight text-text-dark">
                Top IT Vietnam 2030 · Vươn tầm thế giới 2040
              </p>
            </motion.article>
          </FadeUp>

          {/* Values — trắng viền cam */}
          <FadeUp delay={0.16}>
            <motion.article
              className="flex h-full flex-col gap-5 rounded-xl border-l-4 border-primary bg-surface-white p-8 shadow-sm"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span className="eyebrow w-fit rounded-md bg-primary/10 px-3 py-1.5 text-primary">
                Giá trị cốt lõi
              </span>
              <div className="flex flex-col gap-4">
                {values.map((v) => (
                  <div key={v.label} className="group flex items-center gap-4">
                    <IconBox icon={v.icon} variant="muted" size="sm" iconSize={22} />
                    <div>
                      <div className="font-bold text-text-dark">{v.label}</div>
                      <div className="text-sm text-muted-foreground">{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
