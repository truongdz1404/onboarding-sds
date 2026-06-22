import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const postSnap = await db.ref(`discussions/${id}`).get()
    if (!postSnap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const post = postSnap.val() as Record<string, unknown>
    if (post.uid !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.ref(`discussions/${id}`).update({
      archived: true,
      archivedAt: Date.now(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to archive' }, { status: 500 })
  }
}
