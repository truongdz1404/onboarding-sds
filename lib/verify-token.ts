import '@/lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { NextRequest } from 'next/server'

export async function verifyRequest(req: NextRequest) {
  const header = req.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  try {
    return await getAuth().verifyIdToken(header.replace('Bearer ', ''))
  } catch {
    return null
  }
}
