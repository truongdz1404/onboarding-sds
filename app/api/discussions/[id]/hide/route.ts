import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

// POST — mod/admin hides a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getRole(decoded.uid)
    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const postSnap = await db.ref(`discussions/${id}`).get()
    if (!postSnap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.ref(`discussions/${id}`).update({
      hiddenByMod: true,
      hiddenBy: decoded.uid,
      hiddenAt: Date.now(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to hide post' }, { status: 500 })
  }
}

// DELETE — mod/admin restores a hidden post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getRole(decoded.uid)
    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const postSnap = await db.ref(`discussions/${id}`).get()
    if (!postSnap.exists()) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.ref(`discussions/${id}`).update({
      hiddenByMod: false,
      hiddenBy: null,
      hiddenAt: null,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to restore post' }, { status: 500 })
  }
}
