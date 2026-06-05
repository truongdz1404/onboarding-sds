'use client'

import { Target, Eye, Heart, ThumbsUp, ShieldCheck, Ear } from 'lucide-react'
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
    <section className="bg-muted py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Kim chỉ nam"
          title="Sứ mệnh · Tầm nhìn · Giá trị"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Mission */}
          <FadeUp>
            <article className="flex h-full flex-col gap-5 rounded-lg bg-secondary p-8 text-white">
              <span className="eyebrow w-fit rounded-md bg-primary px-3 py-1.5 text-white">
                Sứ mệnh
              </span>
              <IconBox icon={Target} variant="dark" />
              <p className="text-2xl font-bold leading-snug tracking-tight">
                Nâng tầm quản trị doanh nghiệp thông qua IT đơn giản hóa
              </p>
            </article>
          </FadeUp>

          {/* Vision */}
          <FadeUp delay={0.08}>
            <article className="flex h-full flex-col gap-5 rounded-lg bg-primary p-8 text-white">
              <span className="eyebrow w-fit rounded-md bg-white/20 px-3 py-1.5 text-white">
                Tầm nhìn
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/15">
                <Eye size={28} className="text-white" strokeWidth={2} />
              </div>
              <p className="text-2xl font-bold leading-snug tracking-tight">
                Top IT Vietnam 2030 · Vươn tầm thế giới 2040
              </p>
            </article>
          </FadeUp>

          {/* Values */}
          <FadeUp delay={0.16}>
            <article className="flex h-full flex-col gap-5 rounded-lg border-l-4 border-primary bg-background p-8">
              <span className="eyebrow w-fit rounded-md bg-primary px-3 py-1.5 text-white">
                Giá trị cốt lõi
              </span>
              <div className="flex flex-col gap-4">
                {values.map((v) => (
                  <div key={v.label} className="group flex items-center gap-4">
                    <IconBox icon={v.icon} variant="muted" size="sm" iconSize={22} />
                    <div>
                      <div className="font-bold">{v.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {v.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
