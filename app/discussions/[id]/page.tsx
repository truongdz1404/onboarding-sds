import { notFound } from 'next/navigation'
import { db } from '@/lib/firebase-admin'
import { PostDetailClient } from '@/components/discussions/post-detail-client'
import type { DiscussionPost } from '@/lib/discussion-types'

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const snapshot = await db.ref(`discussions/${id}`).get()
  if (!snapshot.exists()) notFound()

  const d = snapshot.val() as Record<string, unknown>
  if (d.archived) notFound()

  const post: DiscussionPost = {
    id,
    title: d.title as string,
    description: (d.description as string) ?? '',
    author: d.isAnonymous ? 'Ẩn danh' : (d.author as string),
    authorInitials: d.isAnonymous ? '?' : (d.authorInitials as string),
    photoURL: d.isAnonymous ? undefined : ((d.photoURL as string) ?? undefined),
    uid: (d.uid as string) ?? undefined,
    isAnonymous: (d.isAnonymous as boolean) ?? false,
    category: (d.category as string) ?? 'Chung',
    tags: (d.tags as string[]) ?? [],
    upvoteCount: (d.upvoteCount as number) ?? 0,
    commentCount: (d.commentCount as number) ?? 0,
    createdAt: new Date(d.createdAt as number).toISOString(),
    status: (d.status as 'pending' | 'approved' | 'rejected') ?? undefined,
    moderatedAt: d.moderatedAt ? new Date(d.moderatedAt as number).toISOString() : undefined,
  }

  return <PostDetailClient post={post} />
}
