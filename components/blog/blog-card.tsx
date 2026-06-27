'use client'

import { motion } from 'motion/react'
import { Clock, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/lib/blog-data'

export function BlogCard({ post, index, viewCount }: { post: Post; index: number; viewCount?: number }) {
  const views = viewCount && viewCount > 0 ? viewCount : post.views

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        {/* Image / fallback — 16:9 */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(232,96,26,0.06) 0%, rgba(244,148,74,0.10) 100%)' }}
            >
              <FileText size={56} className="text-primary/20" strokeWidth={1.5} />
            </div>
          )}
          <span className="eyebrow absolute left-4 top-4 rounded-md bg-primary px-2.5 py-1 text-white">
            {post.category}
          </span>
        </div>

        {/* Text content */}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-text-dark transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-4 border-t border-primary/12 pt-4 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {post.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {views}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
