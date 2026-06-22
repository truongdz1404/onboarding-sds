import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import type { Post } from '@/lib/blog-data'

export function BlogSuggestion({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog?post=${post.slug}`}
      className="group mt-2 flex items-start gap-3 rounded-xl border border-border bg-white p-3 transition-colors hover:border-primary/30 hover:bg-surface-orange/50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Clock size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          {post.category}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-text-dark group-hover:text-primary">
          {post.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{post.readTime} đọc</p>
      </div>
      <ArrowRight
        size={16}
        className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  )
}
