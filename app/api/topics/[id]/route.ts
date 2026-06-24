import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { slugify } from '../route'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getRole(decoded.uid)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const updates: Record<string, unknown> = {}

    for (const field of ['bg', 'fg', 'iconPath', 'order'] as const) {
      if (field in body) updates[field] = body[field]
    }

    if ('value' in body && body.value?.trim()) {
      const val = String(body.value).trim()
      const slug = slugify(val)
      updates.value = val
      updates.slug = slug
      updates.label = `p/${slug}`
    }

    await db.ref(`discussionTopics/${id}`).update(updates)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 })
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

    const role = await getRole(decoded.uid)
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await db.ref(`discussionTopics/${id}`).remove()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 })
  }
}
