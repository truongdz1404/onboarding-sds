import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { readVote, toUserVote } from '@/lib/vote-helpers'

function makeInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const decoded = await verifyRequest(req)
    const snapshot = await db.ref(`comments/${id}`).orderByChild('createdAt').get()

    const userVotes: Record<string, ReturnType<typeof toUserVote>> = {}
    if (decoded) {
      const votesSnap = await db.ref(`commentVotes/${id}`).get()
      if (votesSnap.exists()) {
        votesSnap.forEach((commentSnap) => {
          const userSnap = commentSnap.child(decoded.uid)
          if (userSnap.exists()) {
            userVotes[commentSnap.key!] = toUserVote(readVote(userSnap.val()))
          }
        })
      }
    }

    const comments: Record<string, unknown>[] = []
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const d = child.val() as Record<string, unknown>
        comments.push({
          id: child.key,
          postId: id,
          content: d.content,
          author: d.isAnonymous ? 'Ẩn danh' : d.author,
          authorInitials: d.isAnonymous ? '?' : d.authorInitials,
          photoURL: d.isAnonymous ? null : ((d.photoURL as string) ?? null),
          isAnonymous: (d.isAnonymous as boolean) ?? false,
          createdAt: new Date(d.createdAt as number).toISOString(),
          parentId: (d.parentId as string) ?? null,
          upvoteCount: (d.upvoteCount as number) ?? 0,
          userVote: userVotes[child.key!] ?? null,
        })
      })
    }

    return NextResponse.json({ comments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { content, isAnonymous, parentId } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Missing content' }, { status: 400 })

    const displayName = decoded.name ?? decoded.email ?? 'Unknown'
    const newRef = db.ref(`comments/${id}`).push()

    await newRef.set({
      content: content.trim(),
      author: displayName,
      authorInitials: makeInitials(displayName),
      photoURL: decoded.picture ?? null,
      uid: decoded.uid,
      isAnonymous: isAnonymous ?? false,
      createdAt: Date.now(),
      parentId: parentId ?? null,
      upvoteCount: 0,
    })

    await db.ref(`discussions/${id}/commentCount`).transaction(
      (count: number | null) => (count ?? 0) + 1,
    )

    await db.ref(`userCommentPosts/${decoded.uid}/${id}`).set({ lastCommentAt: Date.now() })

    // Write to global recentComments feed
    const postSnap = await db.ref(`discussions/${id}`).get()
    if (postSnap.exists()) {
      const pd = postSnap.val() as Record<string, unknown>
      if (pd.status === 'approved' || !pd.status) {
        await db.ref('recentComments').push().set({
          commentId: newRef.key,
          postId: id,
          postTitle: (pd.title as string) ?? '',
          postCategory: (pd.category as string) ?? 'Chung',
          content: content.trim().slice(0, 200),
          author: (isAnonymous ?? false) ? 'Ẩn danh' : displayName,
          authorInitials: (isAnonymous ?? false) ? '?' : makeInitials(displayName),
          photoURL: (isAnonymous ?? false) ? null : (decoded.picture ?? null),
          isAnonymous: isAnonymous ?? false,
          createdAt: Date.now(),
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
