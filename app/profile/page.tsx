import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ProfilePageClient from './profile-client'

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center pt-28">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      }
    >
      <ProfilePageClient />
    </Suspense>
  )
}
