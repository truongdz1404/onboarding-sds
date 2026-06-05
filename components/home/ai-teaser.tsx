'use client'

import Link from 'next/link'
import { Brain, ArrowRight, Bot } from 'lucide-react'
import { FadeUp } from '@/components/shared/fade-up'

export function AITeaser() {
  return (
    <section className="relative overflow-hidden bg-[#fff7f0] py-20 text-foreground">
      <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rotate-12 rounded-lg bg-primary/10" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-primary/5" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <FadeUp>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left */}
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/15">
                <Brain size={32} className="text-primary" strokeWidth={2} />
              </div>
              <h3 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl text-balance">
                Mọi câu hỏi hội nhập — đã có SoftBot
              </h3>
              <p className="mt-4 max-w-md text-lg text-muted-foreground">
                Hỏi về nội quy, chấm công, phúc lợi, thuế TNCN... SoftBot trả
                lời ngay lập tức, 24/7.
              </p>
              <Link href="/chat" className="btn-primary mt-8">
                Trò chuyện với SoftBot
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Right — flat chat preview */}
            <div className="rounded-lg bg-white border border-border shadow-sm p-6">
              <div className="flex items-center gap-3 border-b-2 border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                  <Bot size={22} className="text-white" />
                </span>
                <div>
                  <div className="font-semibold">SoftBot</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Đang hoạt động
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="ml-auto w-fit max-w-[80%] rounded-lg bg-primary px-4 py-2.5 text-sm text-white">
                  Giờ làm việc của công ty thế nào?
                </div>
                <div className="w-fit max-w-[85%] rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground">
                  Sáng 8:00–12:00, chiều 13:30–17:30. Thứ 2–6 bắt buộc, thứ 7
                  làm cách tuần. Chấm công qua Wifi & GPS trên EasyHRM nhé!
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
