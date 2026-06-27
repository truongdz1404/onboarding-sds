import { db } from '@/lib/firebase-admin'
import { FEATURED, POSTS } from '@/lib/blog-data'
import type { Post } from '@/lib/blog-data'
import BlogListClient from './blog-list-client'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const snapshot = await db.ref('blogPosts').get()
  const fbData: Record<string, unknown> = snapshot.exists() ? snapshot.val() : {}

  // All Firebase full posts (have title) — no slug filtering, Firebase takes precedence over static
  const firebasePosts: Post[] = Object.entries(fbData)
    .filter(([, v]) => typeof v === 'object' && v !== null && 'title' in (v as object))
    .map(([slug, post]) => ({ ...(post as object), slug } as Post))
    .sort((a: any, b: any) =>
      new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
    )

  const allSlugs = [FEATURED.slug, ...POSTS.map(p => p.slug), ...firebasePosts.map(p => p.slug)]

  const viewCounts: Record<string, number> = {}
  for (const slug of allSlugs) {
    const node = fbData[slug]
    viewCounts[slug] = (typeof node === 'object' && node !== null && 'viewCount' in node)
      ? (node as any).viewCount ?? 0
      : 0
  }

  return <BlogListClient viewCounts={viewCounts} firebasePosts={firebasePosts} />
}
