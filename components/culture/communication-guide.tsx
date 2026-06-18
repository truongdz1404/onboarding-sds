'use client'

import { useState } from 'react'
import { ChevronDown, ArrowUp, ArrowDown, Users, UserCheck, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const items: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ArrowUp, title: 'Với cấp trên', body: 'Tuân thủ, tôn trọng và làm việc đúng vai trò. Báo cáo trung thực, kịp thời.' },
  { icon: ArrowDown, title: 'Với cấp dưới', body: 'Thấu hiểu, hỗ trợ và tạo điều kiện để mỗi thành viên phát triển tốt nhất.' },
  { icon: Users, title: 'Với đồng nghiệp', body: 'Tôn trọng, hợp tác và chia sẻ. Cùng nhau hướng đến mục tiêu chung của đội.' },
  { icon: UserCheck, title: 'Với khách hàng', body: 'Quy tắc "Bốn Xin": Xin chào – Xin phép – Xin lỗi – Xin cảm ơn.' },
  { icon: Globe, title: 'Với cộng đồng', body: 'Hài hòa lợi ích doanh nghiệp và xã hội, đóng góp giá trị bền vững.' },
]

export function CommunicationGuide() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const Icon = item.icon
        const isOpen = open === i
        return (
          <div
            key={item.title}
            className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:text-primary"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  isOpen ? 'bg-primary text-white' : 'bg-white text-foreground',
                )}
              >
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="flex-1 font-semibold text-text-dark">{item.title}</span>
              <ChevronDown
                size={20}
                className={cn(
                  'shrink-0 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all duration-300',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 pl-[4.75rem] text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
