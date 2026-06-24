import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import { getAuth } from 'firebase-admin/auth'

async function getRole(uid: string) {
  const snap = await db.ref(`userRoles/${uid}/role`).get()
  return (snap.val() as string) ?? 'user'
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getRole(decoded.uid)
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const listResult = await getAuth().listUsers(500)
    const rolesSnap = await db.ref('userRoles').get()
    const rolesMap: Record<string, string> = {}
    if (rolesSnap.exists()) {
      rolesSnap.forEach((child) => {
        const val = child.val() as { role?: string }
        rolesMap[child.key!] = val?.role ?? 'user'
      })
    }

    const users = listResult.users.map((u) => ({
      uid: u.uid,
      name: u.displayName ?? '',
      email: u.email ?? '',
      photoURL: u.photoURL ?? null,
      role: rolesMap[u.uid] ?? 'user',
    }))

    return NextResponse.json({ users })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
