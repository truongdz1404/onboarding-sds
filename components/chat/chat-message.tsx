'use client'

import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  extractBlogSlugs,
  getBlogPost,
  stripBlogTags,
  SOFTBOT_NAME,
} from '@/lib/softbot-config'
import { BlogSuggestion } from '@/components/chat/blog-suggestion'

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function formatParagraphs(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('- ')) {
      return (
        <li key={i} className="ml-4 list-disc">
          {renderInline(trimmed.slice(2))}
        </li>
      )
    }
    return (
      <p key={i} className={i > 0 ? 'mt-2' : undefined}>
        {renderInline(trimmed)}
      </p>
    )
  })
}

export function ChatMessage({
  role,
  text,
  showAvatar = true,
}: {
  role: 'user' | 'assistant'
  text: string
  showAvatar?: boolean
}) {
  const isUser = role === 'user'
  const blogSlugs = isUser ? [] : extractBlogSlugs(text)
  const cleanText = isUser ? text : stripBlogTags(text)

  return (
    <div className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}>
      {!isUser && showAvatar ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot size={16} />
        </span>
      ) : (
        !isUser && <span className="w-8 shrink-0" />
      )}

      <div className={cn('max-w-[85%]', isUser && 'items-end')}>
        {!isUser && showAvatar ? (
          <p className="mb-1 text-xs font-semibold text-muted-foreground">{SOFTBOT_NAME}</p>
        ) : null}

        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-br-sm bg-secondary text-white'
              : 'rounded-bl-sm bg-muted text-foreground',
          )}
        >
          {isUser ? (
            <p>{text}</p>
          ) : (
            <div>{formatParagraphs(cleanText)}</div>
          )}
        </div>

        {!isUser &&
          blogSlugs.map((slug) => {
            const post = getBlogPost(slug)
            return post ? <BlogSuggestion key={slug} post={post} /> : null
          })}
      </div>
    </div>
  )
}
