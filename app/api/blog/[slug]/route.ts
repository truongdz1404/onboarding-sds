import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

async function requireAdmin(req: NextRequest) {
  const decoded = await verifyRequest(req)
  if (!decoded) return null
  const roleSnap = await db.ref(`userRoles/${decoded.uid}/role`).get()
  return roleSnap.val() === 'admin' ? decoded : null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await params
  const body = await req.json()

  await db.ref(`blogPosts/${slug}`).update({
    ...body,
    updatedAt: new Date().toISOString().split('T')[0],
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { slug } = await params
  await db.ref(`blogPosts/${slug}`).remove()

  return NextResponse.json({ success: true })
}
