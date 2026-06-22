'use client'

import { Bot } from 'lucide-react'
import { SoftBotChat } from '@/components/chat/softbot-chat'

export default function ChatPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-white pt-28 pb-8 border-b border-border">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-5 lg:px-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-primary shrink-0" />
            <span className="eyebrow text-primary">SoftBot AI</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
              <Bot size={28} />
            </span>
            <div>
              <h1
                className="text-balance font-extrabold text-4xl md:text-5xl text-text-dark"
                style={{ letterSpacing: '-0.04em', lineHeight: '0.95' }}
              >
                Trợ lý <span className="gradient-text">hội nhập</span> nội bộ
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Hỏi về quy định, văn hóa, chấm công, phúc lợi, thuế — SoftBot trả lời
                ngay và gợi ý bài blog liên quan nếu có.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-alt py-10">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <SoftBotChat variant="page" className="min-h-[560px]" />
        </div>
      </section>
    </>
  )
}
