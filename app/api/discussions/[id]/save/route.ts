import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ saved: false })

    const { id } = await params
    const snap = await db.ref(`userSaved/${decoded.uid}/${id}`).get()
    return NextResponse.json({ saved: snap.exists() })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to check save' }, { status: 500 })
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
    const ref = db.ref(`userSaved/${decoded.uid}/${id}`)
    const snap = await ref.get()

    if (snap.exists()) {
      await ref.remove()
      return NextResponse.json({ saved: false })
    }
    await ref.set({ savedAt: Date.now() })
    return NextResponse.json({ saved: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
