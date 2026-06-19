import { notFound } from 'next/navigation'
import { db } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { PostDetailClient } from '@/components/discussions/post-detail-client'
import type { DiscussionPost } from '@/lib/discussion-types'

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const doc = await db.collection('discussions').doc(id).get()
  if (!doc.exists) notFound()

  const d = doc.data()!
  const post: DiscussionPost = {
    id: doc.id,
    title: d.title,
    description: d.description ?? '',
    author: d.author,
    authorInitials: d.authorInitials,
    category: d.category,
    tags: d.tags ?? [],
    upvoteCount: d.upvoteCount ?? 0,
    commentCount: d.commentCount ?? 0,
    createdAt: (d.createdAt as Timestamp).toDate().toISOString(),
  }

  return <PostDetailClient post={post} />
}
