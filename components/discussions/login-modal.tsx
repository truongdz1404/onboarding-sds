'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/lib/auth-context'

export function LoginModal() {
  const { loginModalOpen, closeLoginModal, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch {
      setError('Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeLoginModal}
          />

          {/* Centering wrapper — flex so the modal is always exactly in the middle */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-orange-400 to-amber-400" />

              <div className="p-10">
                {/* Close */}
                <button
                  onClick={closeLoginModal}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
                >
                  <X size={18} />
                </button>

                {/* Logo + heading */}
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm shadow-primary/10">
                    <span className="text-2xl font-extrabold text-primary leading-none">SD</span>
                  </div>
                  <h2 className="text-2xl font-bold text-text-dark" style={{ letterSpacing: '-0.02em' }}>
                    Tham gia thảo luận
                  </h2>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                    Đăng nhập để vote, bình luận<br />và chia sẻ bài viết với đồng nghiệp.
                  </p>
                </div>

                {/* Google button */}
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border bg-white px-6 py-4 text-[15px] font-semibold text-foreground shadow-sm transition-all hover:border-foreground/25 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin text-primary" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" className="flex-shrink-0">
                      <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.314 0-9.822-3.422-11.423-8.183l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                      <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.848 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                    </svg>
                  )}
                  {loading ? 'Đang đăng nhập...' : 'Tiếp tục với Google'}
                </button>

                {error && (
                  <p className="mt-3 text-center text-sm text-red-500">{error}</p>
                )}

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">Chỉ dành cho</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Footer note */}
                <div className="flex items-center justify-center gap-2">
                  <div className="flex -space-x-1.5">
                    {['SD', 'DX', 'EC'].map((initials) => (
                      <div
                        key={initials}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary/10 text-[10px] font-bold text-primary"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    thành viên <span className="font-semibold text-text-dark">SoftDreams</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
