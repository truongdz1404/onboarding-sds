import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Eye, User } from 'lucide-react'
import { db } from '@/lib/firebase-admin'
import { getStaticBlogDetail, type BlogPostDetail } from '@/lib/blog-data'

export const dynamic = 'force-dynamic'

async function getBlogPost(slug: string): Promise<BlogPostDetail | undefined> {
  const snapshot = await db.ref(`blogPosts/${slug}`).get()
  if (snapshot.exists()) return snapshot.val() as BlogPostDetail
  return getStaticBlogDetail(slug)
}

async function incrementViews(slug: string): Promise<number> {
  const viewsRef = db.ref(`blogPosts/${slug}/viewCount`)
  const result = await viewsRef.transaction((current) => (Number(current) || 0) + 1)
  return (result.snapshot.val() as number) ?? 1
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) notFound()

  const views = await incrementViews(slug)

  const relatedPosts = post.relatedSlugs
    .map((relatedSlug) => getStaticBlogDetail(relatedSlug))
    .filter(Boolean) as BlogPostDetail[]

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden border-b border-border bg-surface-orange pt-28 pb-12">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Quay lại blog
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="eyebrow rounded-full bg-primary px-3 py-1 text-white">
              {post.category}
            </span>
            <span className="rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary">
              {post.heroLabel}
            </span>
          </div>

          {post.coverImage && (
            <div className="mt-6 overflow-hidden rounded-2xl">
              <img src={post.coverImage} alt={post.title} className="w-full max-h-72 object-cover" />
            </div>
          )}

          <h1 className="mt-5 max-w-4xl text-balance font-extrabold text-4xl leading-tight text-text-dark md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {post.excerpt}
          </p>

          <div className="mt-8 grid gap-3 text-sm font-semibold text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <span className="inline-flex items-center gap-2">
              <User size={16} className="text-primary" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} className="text-primary" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              {post.readTime} đọc
            </span>
            <span className="inline-flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              {views} lượt xem
            </span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="eyebrow text-primary">Mục lục</p>
              <nav className="mt-4 space-y-3">
                {post.tableOfContents.map((item, index) => (
                  <a
                    key={item}
                    href={`#section-${index + 1}`}
                    className="block text-sm font-semibold leading-snug text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <div className="rounded-xl border border-primary/20 bg-surface-orange p-6">
              <p className="eyebrow text-primary">Điểm cần nhớ</p>
              <p className="mt-3 text-xl font-bold leading-relaxed text-text-dark">
                {post.takeaway}
              </p>
            </div>

            <div className="mt-10 space-y-12">
              {post.sections.map((section, index) => (
                <section
                  key={section.heading}
                  id={`section-${index + 1}`}
                  className="scroll-mt-28"
                >
                  <h2 className="text-2xl font-extrabold tracking-tight text-text-dark md:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground md:text-lg">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.image && (
                    <div className="mt-5 flex justify-center">
                      <img src={section.image} alt={section.heading} className="max-h-160 max-w-full rounded-xl object-contain" />
                    </div>
                  )}
                  {section.bullets ? (
                    <ul className="mt-5 grid gap-3">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 text-sm font-semibold text-text-dark"
                        >
                          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <section className="mt-12 rounded-xl bg-text-dark p-6 text-white md:p-8">
              <p className="eyebrow text-white/70">Checklist nhanh</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {post.checklist.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm font-semibold leading-6">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {relatedPosts.length > 0 ? (
              <section className="mt-12">
                <p className="eyebrow text-primary">Bài liên quan</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="group rounded-xl border border-border bg-white p-5 transition-all hover:border-primary/30 hover:shadow-md"
                    >
                      <span className="text-xs font-semibold text-primary">{related.category}</span>
                      <h3 className="mt-2 text-lg font-bold leading-snug text-text-dark group-hover:text-primary">
                        {related.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {related.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  )
}
