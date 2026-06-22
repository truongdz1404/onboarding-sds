'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  QUICK_ACTIONS,
  SOFTBOT_NAME,
  SOFTBOT_WELCOME,
} from '@/lib/softbot-config'
import { ChatMessage } from '@/components/chat/chat-message'
import { TypingIndicator } from '@/components/chat/typing-indicator'

type SoftBotChatProps = {
  variant?: 'widget' | 'page'
  onClose?: () => void
  className?: string
}

export function SoftBotChat({ variant = 'widget', onClose, className }: SoftBotChatProps) {
  const [input, setInput] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'submitted' || status === 'streaming'
  const hasConversation = messages.length > 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSend(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    setShowWelcome(false)
    sendMessage({ text: trimmed })
    setInput('')
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden bg-white',
        variant === 'widget'
          ? 'h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] rounded-2xl shadow-2xl ring-1 ring-black/5'
          : 'min-h-[calc(100dvh-4rem)] rounded-2xl border border-border shadow-sm',
        className,
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between bg-secondary px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Bot size={20} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-secondary bg-emerald-400" />
          </span>
          <div>
            <p className="font-semibold text-white">{SOFTBOT_NAME}</p>
            <p className="text-xs text-white/50">Trợ lý quy định & văn hóa</p>
          </div>
        </div>
        {variant === 'widget' && onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {showWelcome && !hasConversation ? (
          <div className="space-y-3">
            <ChatMessage role="assistant" text={SOFTBOT_WELCOME.intro} />
            <ChatMessage role="assistant" text={SOFTBOT_WELCOME.hint} showAvatar={false} />

            <div className="grid grid-cols-2 gap-2 pt-1">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(action.prompt)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-left text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-surface-orange disabled:opacity-50"
                  >
                    <Icon size={14} className="shrink-0 text-primary" />
                    <span className="leading-tight">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {messages.map((message) => {
          const text = message.parts
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join('')

          if (!text) return null

          return (
            <div key={message.id} className="mb-3 last:mb-0">
              <ChatMessage role={message.role as 'user' | 'assistant'} text={text} />
            </div>
          )
        })}

        {isLoading ? (
          <div className="mt-3 flex gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot size={16} />
            </span>
            <TypingIndicator />
          </div>
        ) : null}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-muted/40 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }}
          className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Hỏi về quy định, văn hóa, phúc lợi..."
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Gửi tin nhắn"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-opacity disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Nội dung AI có thể chưa chính xác — liên hệ HR nếu cần xác nhận.
        </p>
      </div>
    </div>
  )
}
