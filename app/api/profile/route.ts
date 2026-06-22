import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { verifyRequest } from '@/lib/verify-token'
import type { UserProfile } from '@/lib/profile-types'

function defaultUsername(email: string) {
  return email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
}

function mapProfile(uid: string, d: Record<string, unknown> | null, decoded: { name?: string; email?: string; picture?: string; uid: string }): UserProfile {
  const email = decoded.email ?? ''
  return {
    uid,
    name: (d?.name as string) ?? decoded.name ?? '',
    username: (d?.username as string) ?? defaultUsername(email),
    headline: (d?.headline as string) ?? '',
    about: (d?.about as string) ?? '',
    links: Array.isArray(d?.links) ? (d!.links as UserProfile['links']) : [],
    photoURL: (d?.photoURL as string) ?? decoded.picture ?? undefined,
    email: decoded.email,
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const snap = await db.ref(`userProfiles/${decoded.uid}`).get()
    const profile = mapProfile(decoded.uid, snap.exists() ? (snap.val() as Record<string, unknown>) : null, decoded)
    return NextResponse.json({ profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, username, headline, about, links } = body

    const updates: Record<string, unknown> = { updatedAt: Date.now() }
    if (typeof name === 'string') updates.name = name.trim()
    if (typeof username === 'string') updates.username = username.trim().replace(/\s+/g, '_')
    if (typeof headline === 'string') updates.headline = headline.trim()
    if (typeof about === 'string') updates.about = about.trim()
    if (Array.isArray(links)) {
      updates.links = links.filter((l: { label?: string; url?: string }) => l?.label && l?.url)
    }

    await db.ref(`userProfiles/${decoded.uid}`).update(updates)
    const snap = await db.ref(`userProfiles/${decoded.uid}`).get()
    const profile = mapProfile(decoded.uid, snap.val() as Record<string, unknown>, decoded)
    return NextResponse.json({ profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
