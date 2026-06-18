'use client'

import { motion } from 'motion/react'
import { SectionHeader } from '@/components/shared/section-header'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const milestones = [
  { year: '2012', text: 'Đặt nền móng, sản phẩm BHXH đầu tiên' },
  { year: '2015', text: 'Ra mắt & phát triển sản phẩm' },
  { year: '2017', text: 'Hội tụ đội ngũ lãnh đạo' },
  { year: '2018', text: 'Mở chi nhánh TP.HCM' },
  { year: '2020', text: 'Thành lập EasyCA' },
  { year: '2022', text: 'Ra đời DXTech' },
  { year: '2023', text: 'EasyPOS, EasyDOC, EasyHRM' },
  { year: '2023+', text: 'Tiếp tục mở rộng hệ sinh thái' },
]

export function Timeline() {
  return (
    <section id="timeline" className="relative overflow-hidden bg-surface-orange-strong py-28">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-primary/8" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Hành trình"
          title="11 năm xây dựng hệ sinh thái"
          description="Từ một sản phẩm BHXH đầu tiên đến hệ sinh thái phần mềm quản trị toàn diện."
        />

        <div className="mt-16 overflow-x-auto pb-4">
          <div className="relative flex min-w-max gap-8 lg:min-w-0 lg:grid lg:grid-cols-8 lg:gap-4">
            {/* animated line draw */}
            <motion.div
              className="absolute left-0 right-0 top-2 h-0.5 bg-primary/30 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
            />
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                className="relative w-44 lg:w-auto"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <motion.span
                  className="relative z-10 block h-4 w-4 rounded-full bg-primary ring-4 ring-surface-orange-strong"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 + 0.4, type: 'spring', stiffness: 260, damping: 18 }}
                />
                <div className="mt-4 text-lg font-bold tabular-nums text-primary">
                  {m.year}
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {m.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
