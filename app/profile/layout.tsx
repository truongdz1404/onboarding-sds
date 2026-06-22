import { AuthProvider } from '@/lib/auth-context'
import { LoginModal } from '@/components/discussions/login-modal'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <LoginModal />
    </AuthProvider>
  )
}
