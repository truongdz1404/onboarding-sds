'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Heart,
  MessageSquare,
  Clock,
  Fingerprint,
  Gift,
  Receipt,
  FolderCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FadeUp } from '@/components/shared/fade-up'
import { WorkValues } from '@/components/culture/work-values'
import { CommunicationGuide } from '@/components/culture/communication-guide'
import { WorkSchedule } from '@/components/culture/work-schedule'
import { Benefits } from '@/components/culture/benefits'
import { TaxInfo } from '@/components/culture/tax-info'
import { DocumentChecklist } from '@/components/culture/document-checklist'

type Section = {
  id: string
  label: string
  icon: LucideIcon
  title: string
  desc: string
  content: React.ReactNode
}

const sections: Section[] = [
  {
    id: 'culture',
    label: 'Văn hóa làm việc',
    icon: Heart,
    title: '6 nguyên tắc làm việc',
    desc: 'Những giá trị định hình cách mỗi thành viên SoftDreams làm việc mỗi ngày.',
    content: <WorkValues />,
  },
  {
    id: 'communication',
    label: 'Giao tiếp',
    icon: MessageSquare,
    title: 'Ứng xử & giao tiếp',
    desc: 'Cách chúng ta giao tiếp với cấp trên, đồng nghiệp, khách hàng và cộng đồng.',
    content: <CommunicationGuide />,
  },
  {
    id: 'schedule',
    label: 'Giờ làm việc',
    icon: Clock,
    title: 'Biểu thời gian làm việc',
    desc: 'Khung giờ làm việc tiêu chuẩn và quy định chấm công tại SoftDreams.',
    content: <WorkSchedule />,
  },
  {
    id: 'attendance',
    label: 'Chấm công',
    icon: Fingerprint,
    title: 'Quy định chấm công',
    desc: 'Chấm công qua Wifi và GPS trên ứng dụng EasyHRM, minh bạch và chính xác.',
    content: (
      <div className="rounded-xl bg-white border border-border p-6 leading-relaxed text-muted-foreground shadow-sm">
        Nhân viên chấm công vào/ra qua ứng dụng{' '}
        <strong className="text-foreground">EasyHRM</strong> bằng kết nối Wifi nội
        bộ kết hợp định vị GPS. Mọi điều chỉnh cần được quản lý trực tiếp phê duyệt
        trên hệ thống.
      </div>
    ),
  },
  {
    id: 'benefits',
    label: 'Phúc lợi',
    icon: Gift,
    title: 'Chế độ & phúc lợi',
    desc: 'Những quyền lợi giúp bạn yên tâm cống hiến và phát triển lâu dài.',
    content: <Benefits />,
  },
  {
    id: 'tax',
    label: 'Thuế TNCN',
    icon: Receipt,
    title: 'Thuế thu nhập cá nhân',
    desc: 'Cách tính và khấu trừ thuế TNCN cho từng nhóm nhân sự.',
    content: <TaxInfo />,
  },
  {
    id: 'documents',
    label: 'Hồ sơ cần nộp',
    icon: FolderCheck,
    title: 'Checklist hồ sơ onboarding',
    desc: 'Tích vào từng mục khi hoàn thành — tiến độ được lưu tự động trên thiết bị.',
    content: <DocumentChecklist />,
  },
]

export default function CulturePage() {
  const [active, setActive] = useState(sections[0].id)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.current?.observe(el)
    })
    return () => observer.current?.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden bg-white pt-28 pb-16 border-b border-border">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-amber-400/8 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-primary shrink-0" />
            <span className="eyebrow text-primary">Văn hóa & Nội quy</span>
          </div>
          <h1 className="text-balance font-extrabold text-5xl md:text-6xl text-text-dark" style={{ letterSpacing: '-0.04em', lineHeight: '0.9' }}>
            Cách chúng ta làm việc <span className="gradient-text">cùng nhau</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Tất cả nguyên tắc, quy định và phúc lợi bạn cần nắm khi gia nhập gia
            đình SoftDreams.
          </p>
        </div>
      </section>

      {/* Layout */}
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:w-60 lg:shrink-0">
            <nav className="lg:sticky lg:top-24 flex gap-2 overflow-x-auto rounded-xl bg-white border border-border shadow-sm p-2 lg:flex-col lg:overflow-visible">
              {sections.map((s) => {
                const Icon = s.icon
                const isActive = active === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-colors lg:w-full',
                      isActive
                        ? 'bg-primary text-white font-semibold'
                        : 'text-foreground hover:bg-surface-orange hover:text-primary',
                    )}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {s.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-24">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <FadeUp>
                  <div className="mb-8">
                    <h2 className="section-title text-balance">{s.title}</h2>
                    <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                  {s.content}
                </FadeUp>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
