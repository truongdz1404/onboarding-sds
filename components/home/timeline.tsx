'use client'

import { motion } from 'motion/react'
import { SectionHeader } from '@/components/shared/section-header'

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
    <section id="timeline" className="relative overflow-hidden bg-[#111827] py-28 text-white">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rotate-45 rounded-lg bg-white/5" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-40 w-40 rounded-full bg-primary/10" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Hành trình"
          title="11 năm xây dựng hệ sinh thái"
          description="Từ một sản phẩm BHXH đầu tiên đến hệ sinh thái phần mềm quản trị toàn diện."
          light
        />

        <div className="mt-16 overflow-x-auto pb-4">
          <div className="relative flex min-w-max gap-8 lg:min-w-0 lg:grid lg:grid-cols-8 lg:gap-4">
            {/* line */}
            <div className="absolute left-0 right-0 top-2 h-1 bg-primary/40" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                className="relative w-44 lg:w-auto"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <span className="relative z-10 block h-4 w-4 rounded-full bg-primary ring-4 ring-secondary" />
                <div className="mt-4 text-lg font-bold tabular-nums text-accent">
                  {m.year}
                </div>
                <p className="mt-1 text-sm text-white/80 leading-relaxed">
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
