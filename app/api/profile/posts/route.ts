import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { readVote, toUserVote } from '@/lib/vote-helpers'
import { fetchPostsByIds, mapDiscussionPost } from '@/lib/discussion-mapper'
import type { ProfileTab } from '@/lib/profile-types'

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tab = (req.nextUrl.searchParams.get('tab') ?? 'posts') as ProfileTab
    const uid = decoded.uid
    let postIds: string[] = []

    if (tab === 'posts' || tab === 'hidden' || tab === 'pending') {
      const snap = await db.ref('discussions').get()
      if (snap.exists()) {
        snap.forEach((child) => {
          const d = child.val() as Record<string, unknown>
          if (d.uid !== uid) return
          if (tab === 'posts') {
            if (d.archived) return
          }
          if (tab === 'hidden' && !d.archived) return
          if (tab === 'pending' && d.status !== 'pending') return
          postIds.push(child.key!)
        })
      }
      const raw: Record<string, Record<string, unknown>> = {}
      if (snap.exists()) {
        snap.forEach((child) => {
          if (postIds.includes(child.key!)) raw[child.key!] = child.val() as Record<string, unknown>
        })
      }
      postIds.sort((a, b) => ((raw[b]?.createdAt as number) ?? 0) - ((raw[a]?.createdAt as number) ?? 0))
      const posts = await enrichPosts(uid, postIds, raw)
      return NextResponse.json({ posts })
    }

    if (tab === 'saved') {
      const snap = await db.ref(`userSaved/${uid}`).get()
      if (snap.exists()) {
        const entries: { id: string; at: number }[] = []
        snap.forEach((child) => {
          entries.push({ id: child.key!, at: (child.val() as { savedAt?: number })?.savedAt ?? 0 })
        })
        entries.sort((a, b) => b.at - a.at)
        postIds = entries.map((e) => e.id)
      }
    } else if (tab === 'history') {
      const snap = await db.ref(`userHistory/${uid}`).get()
      if (snap.exists()) {
        const entries: { id: string; at: number }[] = []
        snap.forEach((child) => {
          entries.push({ id: child.key!, at: (child.val() as { viewedAt?: number })?.viewedAt ?? 0 })
        })
        entries.sort((a, b) => b.at - a.at)
        postIds = entries.map((e) => e.id)
      }
    } else if (tab === 'comments') {
      const snap = await db.ref(`userCommentPosts/${uid}`).get()
      if (snap.exists()) {
        const entries: { id: string; at: number }[] = []
        snap.forEach((child) => {
          entries.push({ id: child.key!, at: (child.val() as { lastCommentAt?: number })?.lastCommentAt ?? 0 })
        })
        entries.sort((a, b) => b.at - a.at)
        postIds = entries.map((e) => e.id)
      }
    } else if (tab === 'upvoted' || tab === 'downvoted') {
      const target = tab === 'upvoted' ? 1 : -1
      const snap = await db.ref(`userVotes/${uid}`).get()
      if (snap.exists()) {
        const entries: { id: string; at: number }[] = []
        snap.forEach((child) => {
          const val = child.val()
          const v = readVote(typeof val === 'object' && val?.vote != null ? val.vote : val)
          if (v === target) {
            entries.push({
              id: child.key!,
              at: typeof val === 'object' && val?.votedAt ? val.votedAt : 0,
            })
          }
        })
        entries.sort((a, b) => b.at - a.at)
        postIds = entries.map((e) => e.id)
      }
    } else {
      return NextResponse.json({ posts: [] })
    }

    if (postIds.length === 0) return NextResponse.json({ posts: [] })

    const raw = await fetchPostsByIds(db, postIds)
    const posts = await enrichPosts(uid, postIds, raw)
    const ordered = postIds
      .map((id) => posts.find((p) => p.id === id))
      .filter(Boolean)
      .filter((p) => !p!.archived) as ReturnType<typeof mapDiscussionPost>[]
    return NextResponse.json({ posts: ordered })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

async function enrichPosts(
  uid: string,
  ids: string[],
  raw: Record<string, Record<string, unknown>>,
) {
  const savedSnap = await db.ref(`userSaved/${uid}`).get()
  const saved = new Set<string>()
  if (savedSnap.exists()) savedSnap.forEach((c) => { saved.add(c.key!) })

  const results = await Promise.all(
    ids.map(async (id) => {
      const d = raw[id]
      if (!d) return null
      const voteSnap = await db.ref(`votes/${id}/${uid}`).get()
      return mapDiscussionPost(id, d, {
        userVote: voteSnap.exists() ? toUserVote(readVote(voteSnap.val())) : null,
        isSaved: saved.has(id),
      })
    }),
  )
  return results.filter(Boolean) as ReturnType<typeof mapDiscussionPost>[]
}
