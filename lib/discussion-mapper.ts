import type { UserVote } from '@/lib/vote-helpers'

export function mapDiscussionPost(
  id: string,
  d: Record<string, unknown>,
  extras?: { userVote?: UserVote; isSaved?: boolean },
) {
  return {
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
    archived: (d.archived as boolean) ?? false,
    status: (d.status as 'pending' | 'approved' | 'rejected') ?? undefined,
    moderatedAt: d.moderatedAt ? new Date(d.moderatedAt as number).toISOString() : undefined,
    userVote: extras?.userVote ?? null,
    isSaved: extras?.isSaved ?? false,
  }
}

import type { Database } from 'firebase-admin/database'

export async function fetchPostsByIds(
  db: Database,
  ids: string[],
): Promise<Record<string, Record<string, unknown>>> {
  const result: Record<string, Record<string, unknown>> = {}
  await Promise.all(
    ids.map(async (id) => {
      const snap = await db.ref(`discussions/${id}`).get()
      if (snap.exists()) result[id] = snap.val() as Record<string, unknown>
    }),
  )
  return result
}
