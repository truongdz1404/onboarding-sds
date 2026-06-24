import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/lib/verify-token'

const ALLOWED_FOLDERS = ['post', 'avatar'] as const
const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyRequest(req)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = ((formData.get('folder') as string) || 'post') as (typeof ALLOWED_FOLDERS)[number]
    const mediaType = (formData.get('mediaType') as string) || 'image'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_FOLDERS.includes(folder)) return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })

    if (mediaType === 'video') {
      if (!file.type.startsWith('video/')) return NextResponse.json({ error: 'File must be a video' }, { status: 400 })
      if (file.size > MAX_VIDEO_BYTES) return NextResponse.json({ error: 'File too large (max 100 MB)' }, { status: 400 })
    } else {
      if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
      if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
    }

    const cloudForm = new FormData()
    cloudForm.append('file', file)
    cloudForm.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET!)
    cloudForm.append('folder', folder)

    const endpoint = mediaType === 'video' ? 'video' : 'image'
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`,
      { method: 'POST', body: cloudForm },
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('Cloudinary error:', text)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const data = await res.json() as { secure_url: string; public_id: string }
    return NextResponse.json({ url: data.secure_url, publicId: data.public_id, type: mediaType })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
