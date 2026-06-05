'use client'

import { motion } from 'motion/react'
import { Clock, Eye, FileText } from 'lucide-react'
import type { Post } from '@/lib/blog-data'

export function BlogCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg bg-muted transition-all duration-200 hover:scale-[1.02]"
    >
      {/* Cover block (flat color, no photo) */}
      <div className={`relative flex h-40 items-center justify-center ${post.accent}`}>
        <FileText
          size={56}
          className="text-foreground/15"
          strokeWidth={1.5}
        />
        <span
          className={`eyebrow absolute left-4 top-4 rounded-md px-2.5 py-1 ${post.badge}`}
        >
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-4 border-t-2 border-border pt-4 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {post.readTime}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Eye size={14} /> {post.views}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
