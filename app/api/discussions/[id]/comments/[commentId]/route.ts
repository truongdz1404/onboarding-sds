import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, commentId } = await params
    const commentRef = db.ref(`comments/${id}/${commentId}`)
    const snap = await commentRef.get()
    if (!snap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data = snap.val() as Record<string, unknown>
    if (data.uid !== decoded.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (data.deleted) return NextResponse.json({ error: 'Comment deleted' }, { status: 400 })

    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Missing content' }, { status: 400 })

    await commentRef.update({ content: content.trim(), isEdited: true })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, commentId } = await params
    const commentRef = db.ref(`comments/${id}/${commentId}`)
    const snap = await commentRef.get()
    if (!snap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data = snap.val() as Record<string, unknown>
    if (data.uid !== decoded.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await commentRef.update({ deleted: true })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
