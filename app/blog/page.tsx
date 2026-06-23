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
    filter === 'Tất cả' ? POSTS : POSTS.filter((post) => post.category === filter)

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white pt-28 pb-14">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-amber-400/8 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-3">
            <span className="block h-px w-8 shrink-0 bg-primary" />
            <span className="eyebrow text-primary">Blog nội bộ</span>
          </div>
          <h1 className="max-w-3xl text-balance text-5xl font-extrabold text-text-dark md:text-6xl" style={{ lineHeight: '0.9' }}>
            Kiến thức <span className="gradient-text">thực chiến</span> từ đội ngũ SoftDreams
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Hướng dẫn, mẹo và quy trình được biên soạn bởi chính các thành viên giúp bạn hội nhập nhanh và làm việc hiệu quả.
          </p>
        </div>
      </section>

      <section className="bg-surface-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = filter === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'border border-border bg-white text-foreground hover:bg-surface-orange',
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="relative mt-10 overflow-hidden rounded-xl border border-primary/20 bg-white p-8 md:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/5" />
            <div className="pointer-events-none absolute right-1/4 bottom-0 h-32 w-32 rotate-45 bg-primary/3" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex items-center gap-2">
                  <span className="block h-px w-6 shrink-0 bg-primary" />
                  <span className="eyebrow text-primary">Nổi bật</span>
                </div>
                <h2 className="text-balance text-3xl font-extrabold text-text-dark">
                  {FEATURED.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {FEATURED.excerpt}
                </p>
                <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-orange">
                    <User size={18} className="text-primary" />
                  </span>
                  <div>
                    <div className="font-semibold text-text-dark">Phòng Nhân sự</div>
                    <div>{FEATURED.readTime} đọc · {FEATURED.views} lượt xem</div>
                  </div>
                </div>
                <Link href={`/blog/${FEATURED.slug}`} className="btn-primary mt-7 !h-12">
                  Đọc bài viết
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="hidden items-center justify-center md:flex">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-14 w-14 rounded-xl',
                        i % 3 === 0
                          ? 'bg-primary/12'
                          : i % 3 === 1
                            ? 'bg-primary/6'
                            : 'bg-surface-orange',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

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
