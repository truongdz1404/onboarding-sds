import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'

export async function GET(req: NextRequest) {
  const decoded = await verifyRequest(req)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snap = await db.ref(`userRoles/${decoded.uid}/role`).get()
  const role = (snap.val() as string) ?? 'user'
  return NextResponse.json({ role })
}
