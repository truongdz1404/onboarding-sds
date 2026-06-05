'use client'

import { motion } from 'motion/react'
import {
  Calendar,
  Umbrella,
  UtensilsCrossed,
  Car,
  Plane,
  Star,
  Zap,
  BookOpen,
  Award,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconBox } from '@/components/shared/icon-box'

const benefits: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Calendar, title: 'Nghỉ lễ tết đủ ngày', desc: 'Theo quy định nhà nước' },
  { icon: Umbrella, title: '12 ngày phép/năm', desc: 'Tối đa 3 ngày mỗi lần' },
  { icon: UtensilsCrossed, title: 'Tiền ăn 30.000đ/ngày', desc: 'Hỗ trợ bữa trưa' },
  { icon: Car, title: 'Gửi xe 100.000đ/tháng', desc: 'Phụ cấp đi lại' },
  { icon: Plane, title: 'Du lịch hàng năm', desc: 'Company trip toàn công ty' },
  { icon: Star, title: 'Sinh nhật & Gala', desc: 'Quà tặng & sự kiện' },
  { icon: Zap, title: 'Thể thao & Team building', desc: 'Hoạt động gắn kết' },
  { icon: BookOpen, title: 'Đào tạo & phát triển', desc: 'Nâng cao kỹ năng' },
  { icon: Award, title: 'Đồng phục thứ 2', desc: 'Đầu tuần năng động' },
]

export function Benefits() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {benefits.map((b, i) => (
        <motion.div
          key={b.title}
          className="group flex items-start gap-4 rounded-lg bg-muted p-5 transition-all duration-200 hover:scale-[1.02] hover:bg-[#ebedf0]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
        >
          <IconBox icon={b.icon} size="sm" iconSize={22} />
          <div>
            <h3 className="font-bold leading-tight">{b.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
