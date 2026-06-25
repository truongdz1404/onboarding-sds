import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { readVote, toUserVote } from '@/lib/vote-helpers'

function makeInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const ROOT_PAGE_SIZE = 5

type FlatComment = {
  id: string
  postId: string
  content: unknown
  author: string
  authorInitials: string
  photoURL: string | null
  uid: string | null
  isAnonymous: boolean
  createdAt: string
  parentId: string | null
  upvoteCount: number
  userVote: ReturnType<typeof toUserVote>
  deleted: boolean
  isEdited: boolean
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const rootPage = Math.max(0, parseInt(req.nextUrl.searchParams.get('rootPage') || '0', 10))

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

    const allFlat: FlatComment[] = []
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const d = child.val() as Record<string, unknown>
        const isDeleted = (d.deleted as boolean) ?? false
        if (isDeleted) {
          allFlat.push({
            id: child.key!,
            postId: id,
            content: '',
            author: '',
            authorInitials: '',
            photoURL: null,
            uid: null,
            isAnonymous: false,
            createdAt: new Date(d.createdAt as number).toISOString(),
            parentId: (d.parentId as string) ?? null,
            upvoteCount: 0,
            userVote: null,
            deleted: true,
            isEdited: false,
          })
          return
        }
        allFlat.push({
          id: child.key!,
          postId: id,
          content: d.content,
          author: d.isAnonymous ? 'Ẩn danh' : (d.author as string),
          authorInitials: d.isAnonymous ? '?' : (d.authorInitials as string),
          photoURL: d.isAnonymous ? null : ((d.photoURL as string) ?? null),
          uid: d.isAnonymous ? null : ((d.uid as string) ?? null),
          isAnonymous: (d.isAnonymous as boolean) ?? false,
          createdAt: new Date(d.createdAt as number).toISOString(),
          parentId: (d.parentId as string) ?? null,
          upvoteCount: (d.upvoteCount as number) ?? 0,
          userVote: userVotes[child.key!] ?? null,
          deleted: false,
          isEdited: (d.isEdited as boolean) ?? false,
        })
      })
    }

    // Root comments sorted by createdAt asc (from Firebase orderByChild), reversed → newest first
    const roots = allFlat.filter((c) => !c.parentId).reverse()
    const start = rootPage * ROOT_PAGE_SIZE
    const pageRoots = roots.slice(start, start + ROOT_PAGE_SIZE)
    const hasMore = start + ROOT_PAGE_SIZE < roots.length

    if (pageRoots.length === 0) {
      return NextResponse.json({ comments: [], hasMore: false })
    }

    const pageRootIds = new Set(pageRoots.map((r) => r.id))
    const commentById = new Map(allFlat.map((c) => [c.id, c]))

    // Walk up parentId chain to find root ancestor
    function getRootAncestor(commentId: string): string | undefined {
      const c = commentById.get(commentId)
      if (!c) return undefined
      if (!c.parentId) return commentId
      return getRootAncestor(c.parentId)
    }

    // Include only comments whose root ancestor is in this page
    const comments = allFlat.filter((c) => {
      const root = getRootAncestor(c.id)
      return root !== undefined && pageRootIds.has(root)
    })

    return NextResponse.json({ comments, hasMore })
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

    return NextResponse.json({ ok: true, id: newRef.key })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
