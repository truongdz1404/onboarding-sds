'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Building2, Target, FileText, MapPin, ArrowRight } from 'lucide-react'
import { IconBox } from '@/components/shared/icon-box'
import { SectionHeader } from '@/components/shared/section-header'

const items = [
  {
    icon: Building2,
    title: 'Về SoftDreams',
    desc: 'Lịch sử, sứ mệnh, cơ cấu tổ chức',
    href: '/#timeline',
  },
  {
    icon: Target,
    title: 'Văn hóa & Nội quy',
    desc: 'Cách chúng ta làm việc cùng nhau',
    href: '/culture',
  },
  {
    icon: FileText,
    title: 'Blog nội bộ',
    desc: 'Hướng dẫn thực chiến từ đội ngũ',
    href: '/blog',
  },
  {
    icon: MapPin,
    title: 'Văn phòng 360°',
    desc: 'Tour ảo không gian làm việc',
    href: '/office',
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const card = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function QuickAccess() {
  return (
    <section className="bg-surface-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Bắt đầu từ đâu?"
          title="4 điểm dừng đầu tiên của bạn"
          description="Khám phá những thông tin quan trọng nhất để hòa nhập nhanh chóng."
        />

        <motion.div
          className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={card}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link
                href={item.href}
                className="group flex h-full flex-col gap-4 rounded-xl bg-white border border-border shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <IconBox icon={item.icon} />
                <h3 className="text-xl font-bold tracking-tight text-text-dark">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {item.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Xem ngay
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
