import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const callerRole = await getRole(decoded.uid)
    if (callerRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { uid } = await params
    const { role } = await req.json()
    if (!['admin', 'moderator', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await db.ref(`userRoles/${uid}`).set({
      role,
      updatedAt: Date.now(),
      updatedBy: decoded.uid,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}
