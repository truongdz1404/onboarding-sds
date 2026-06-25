import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'

// Returns uid from a username match, or returns identifier as-is (assumed uid)
async function resolveUid(identifier: string): Promise<string> {
  const snap = await db.ref('userProfiles').get()
  if (snap.exists()) {
    let byUsername: string | null = null
    snap.forEach((child) => {
      if ((child.val() as Record<string, unknown>).username === identifier) {
        byUsername = child.key!
        return true
      }
    })
    if (byUsername) return byUsername
  }
  return identifier
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ identifier: string }> },
) {
  try {
    const { identifier } = await params
    const uid = await resolveUid(identifier)

    const [profileSnap, authUser] = await Promise.all([
      db.ref(`userProfiles/${uid}`).get(),
      getAuth().getUser(uid).catch(() => null),
    ])

    // Neither source has this user
    if (!profileSnap.exists() && !authUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const p = profileSnap.exists() ? (profileSnap.val() as Record<string, unknown>) : null
    const joinedAt = authUser ? new Date(authUser.metadata.creationTime).getTime() : null

    const disSnap = await db.ref('discussions').get()
    let postCount = 0
    if (disSnap.exists()) {
      disSnap.forEach((child) => {
        const d = child.val() as Record<string, unknown>
        if (d.uid === uid && d.status === 'approved' && !d.hiddenByMod && !d.archived) postCount++
      })
    }

    const commentSnap = await db.ref(`userCommentPosts/${uid}`).get()
    let commentCount = 0
    if (commentSnap.exists()) commentSnap.forEach(() => { commentCount++ })

    return NextResponse.json({
      profile: {
        uid,
        name: (p?.name as string) || (authUser?.displayName ?? ''),
        username: (p?.username as string) || uid,
        headline: (p?.headline as string) ?? '',
        about: (p?.about as string) ?? '',
        links: Array.isArray(p?.links) ? p!.links : [],
        photoURL: (p?.photoURL as string) || (authUser?.photoURL ?? undefined),
        joinedAt,
        postCount,
        commentCount,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
