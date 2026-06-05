'use client'

import { motion } from 'motion/react'
import { Monitor, Coffee, Users, Gamepad2, Printer, Wifi } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconBox } from '@/components/shared/icon-box'

const spaces: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Monitor, title: 'Khu làm việc', desc: 'Open space bố trí theo từng khối' },
  { icon: Coffee, title: 'Pantry & bếp', desc: 'Cà phê, trà miễn phí cả ngày' },
  { icon: Users, title: 'Phòng họp', desc: 'Đặt lịch nhanh qua EasyHRM' },
  { icon: Gamepad2, title: 'Khu thư giãn', desc: 'Giải trí & nạp năng lượng' },
  { icon: Printer, title: 'Thiết bị', desc: 'Máy in, scan, máy chiếu sẵn sàng' },
  { icon: Wifi, title: 'Network', desc: 'Wifi tốc độ cao toàn văn phòng' },
]

export function OfficeSpaces() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {spaces.map((s, i) => (
        <motion.div
          key={s.title}
          className="group flex flex-col gap-4 rounded-lg bg-muted p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-[#ebedf0]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <IconBox icon={s.icon} />
          <div>
            <h3 className="text-lg font-bold tracking-tight">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
