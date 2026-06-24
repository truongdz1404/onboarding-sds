import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const snap = await db.ref('recentComments').get()
    const all: Record<string, unknown>[] = []
    if (snap.exists()) {
      snap.forEach((child) => {
        const d = child.val() as Record<string, unknown>
        all.push({ ...d, id: child.key })
      })
    }
    const comments = all
      .sort((a, b) => (b.createdAt as number) - (a.createdAt as number))
      .slice(0, 30)
      .map((d) => ({ ...d, createdAt: new Date(d.createdAt as number).toISOString() }))
    return NextResponse.json({ comments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
