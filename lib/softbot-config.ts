import { Clock, Heart, FileText, Receipt, type LucideIcon } from 'lucide-react'
import { FEATURED, POSTS, type Post } from '@/lib/blog-data'

export const SOFTBOT_NAME = 'SoftBot'

export const SOFTBOT_WELCOME = {
  teaser:
    '👋 Cần hỏi về quy định, văn hóa hay phúc lợi công ty? SoftBot sẵn sàng hỗ trợ bạn!',
  intro:
    '👋 Xin chào! Tôi là SoftBot — trợ lý AI hội nhập nội bộ SoftDreams. Tôi có thể giúp bạn về quy định, văn hóa, chấm công, phúc lợi, thuế và đề xuất bài blog liên quan.',
  hint: 'Hỏi tôi hoặc chọn một chủ đề bên dưới nhé.',
}

export type QuickAction = {
  label: string
  prompt: string
  icon: LucideIcon
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Giờ làm & chấm công',
    prompt: 'Giờ làm việc và quy định chấm công của công ty như thế nào?',
    icon: Clock,
  },
  {
    label: 'Văn hóa công ty',
    prompt: '6 nguyên tắc văn hóa làm việc tại SoftDreams là gì?',
    icon: Heart,
  },
  {
    label: 'Nghỉ phép & phúc lợi',
    prompt: 'Quy định nghỉ phép và các phúc lợi nhân viên được hưởng?',
    icon: FileText,
  },
  {
    label: 'Thuế & BHXH',
    prompt: 'Thuế TNCN và quy trình đăng ký BHXH cho nhân viên mới?',
    icon: Receipt,
  },
]

export const ALL_BLOG_POSTS: Post[] = [FEATURED, ...POSTS]

export function getBlogPost(slug: string): Post | undefined {
  return ALL_BLOG_POSTS.find((p) => p.slug === slug)
}

export function formatBlogCatalogForPrompt(): string {
  return ALL_BLOG_POSTS.map(
    (p) => `- slug: "${p.slug}" | ${p.title} | Chủ đề: ${p.category} | ${p.excerpt}`,
  ).join('\n')
}

/** Parse [[blog:slug]] tags emitted by the model into blog cards */
export const BLOG_TAG_REGEX = /\[\[blog:([a-z0-9-]+)\]\]/gi

export function stripBlogTags(text: string): string {
  return text.replace(BLOG_TAG_REGEX, '').replace(/\n{3,}/g, '\n\n').trim()
}

export function extractBlogSlugs(text: string): string[] {
  const slugs: string[] = []
  for (const match of text.matchAll(BLOG_TAG_REGEX)) {
    if (match[1] && !slugs.includes(match[1])) slugs.push(match[1])
  }
  return slugs
}
