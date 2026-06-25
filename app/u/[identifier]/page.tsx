import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { PublicProfileClient } from './public-profile-client'

export default async function UserProfilePage({ params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center pt-28">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      }
    >
      <PublicProfileClient identifier={identifier} />
    </Suspense>
  )
}
