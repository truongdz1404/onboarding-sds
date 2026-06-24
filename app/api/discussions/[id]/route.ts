import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const snapshot = await db.ref(`discussions/${id}`).get()
    if (!snapshot.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const d = snapshot.val() as Record<string, unknown>

    if (d.status === 'pending') {
      const decoded = await verifyRequest(req)
      if (!decoded) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const role = await getRole(decoded.uid)
      if (role !== 'admin' && role !== 'moderator' && decoded.uid !== (d.uid as string)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    return NextResponse.json({
      post: {
        id,
        title: d.title,
        description: (d.description as string) ?? '',
        author: d.isAnonymous ? 'Ẩn danh' : d.author,
        authorInitials: d.isAnonymous ? '?' : d.authorInitials,
        photoURL: d.isAnonymous ? null : ((d.photoURL as string) ?? null),
        uid: (d.uid as string) ?? null,
        isAnonymous: (d.isAnonymous as boolean) ?? false,
        category: (d.category as string) ?? 'Chung',
        tags: (d.tags as string[]) ?? [],
        upvoteCount: (d.upvoteCount as number) ?? 0,
        commentCount: (d.commentCount as number) ?? 0,
        createdAt: new Date(d.createdAt as number).toISOString(),
        status: (d.status as string) ?? undefined,
        moderatedAt: d.moderatedAt ? new Date(d.moderatedAt as number).toISOString() : undefined,
        media: Array.isArray(d.media)
          ? d.media
          : Array.isArray(d.images)
            ? (d.images as string[]).map((url: string) => ({ url, type: 'image' }))
            : [],
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const snap = await db.ref(`discussions/${id}`).get()
    if (!snap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const d = snap.val() as Record<string, unknown>
    if (d.uid !== decoded.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (d.status !== 'draft') return NextResponse.json({ error: 'Only drafts can be edited' }, { status: 400 })

    const body = await req.json() as Record<string, unknown>
    const updates: Record<string, unknown> = { updatedAt: Date.now() }

    if (body.title !== undefined) updates.title = (body.title as string).trim()
    if (body.description !== undefined) updates.description = (body.description as string)?.trim() ?? ''
    if (body.category !== undefined) updates.category = body.category
    if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : []
    if (body.isAnonymous !== undefined) updates.isAnonymous = body.isAnonymous
    if (body.media !== undefined) {
      updates.media = Array.isArray(body.media)
        ? (body.media as unknown[]).filter((m) => {
            const item = m as Record<string, unknown>
            return item && typeof item.url === 'string' && ['image', 'video'].includes(item.type as string)
          })
        : []
    }
    if ('isDraft' in body) {
      updates.status = body.isDraft === false ? 'pending' : 'draft'
    }

    await db.ref(`discussions/${id}`).update(updates)
    return NextResponse.json({ id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const snap = await db.ref(`discussions/${id}`).get()
    if (!snap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const d = snap.val() as Record<string, unknown>
    if (d.uid !== decoded.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (d.status !== 'draft') return NextResponse.json({ error: 'Only drafts can be deleted this way' }, { status: 400 })

    await db.ref(`discussions/${id}`).remove()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 })
  }
}
