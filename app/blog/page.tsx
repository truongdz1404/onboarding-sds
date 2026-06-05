'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CATEGORIES, FEATURED, POSTS } from '@/lib/blog-data'
import { BlogCard } from '@/components/blog/blog-card'

export default function BlogPage() {
  const [filter, setFilter] = useState('Tất cả')

  const visible =
    filter === 'Tất cả' ? POSTS : POSTS.filter((p) => p.category === filter)

  return (
    <>
      {/* Hero */}
      <section className="bg-muted pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow inline-block rounded-md bg-primary px-3 py-1.5 text-white">
            Blog nội bộ
          </span>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
            Kiến thức thực chiến từ đội ngũ SoftDreams
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Hướng dẫn, mẹo và quy trình được biên soạn bởi chính các thành viên
            — giúp bạn hội nhập nhanh và làm việc hiệu quả.
          </p>
        </div>
      </section>

      <section className="bg-background py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = filter === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-[#e5e7eb]',
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Featured */}
          <div className="relative mt-10 overflow-hidden rounded-lg bg-secondary p-8 text-white md:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rotate-45 bg-primary/10" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="eyebrow inline-block rounded-md bg-primary px-2.5 py-1 text-white">
                  Featured
                </span>
                <h2 className="mt-4 text-balance text-3xl font-bold leading-snug tracking-tight">
                  {FEATURED.title}
                </h2>
                <p className="mt-3 text-white/70 leading-relaxed">
                  {FEATURED.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-3 text-sm text-white/60">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                    <User size={18} className="text-accent" />
                  </span>
                  <div>
                    <div className="font-semibold text-white">Phòng Nhân sự</div>
                    <div>{FEATURED.readTime} đọc · {FEATURED.views} lượt xem</div>
                  </div>
                </div>
                <button type="button" className="btn-ghost mt-7 !h-12">
                  Đọc bài viết
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-16 w-16 rounded-md',
                        i % 3 === 0
                          ? 'bg-primary/40'
                          : i % 3 === 1
                            ? 'bg-white/10'
                            : 'bg-accent/30',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          {visible.length === 0 ? (
            <p className="mt-10 text-center text-muted-foreground">
              Chưa có bài viết nào trong chủ đề này.
            </p>
          ) : null}

          <p className="mt-12 text-center text-sm text-muted-foreground">
            Cần thông tin cụ thể hơn?{' '}
            <Link href="/chat" className="font-semibold text-primary hover:underline">
              Hỏi SoftBot ngay
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
