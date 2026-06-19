'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'
import { auth, signInWithGoogleCentered } from './firebase-client'

type PendingAction = (() => void) | null

type AuthCtx = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  /* Call this to protect an action — opens login modal if not authed */
  requireAuth: (action: () => void) => void
  loginModalOpen: boolean
  closeLoginModal: () => void
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  requireAuth: () => {},
  loginModalOpen: false,
  closeLoginModal: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  /* When user logs in while modal is open, run pending action */
  useEffect(() => {
    if (user && pendingAction) {
      pendingAction()
      setPendingAction(null)
      setLoginModalOpen(false)
    }
  }, [user, pendingAction])

  const signInWithGoogle = useCallback(async () => {
    await signInWithGoogleCentered()
  }, [])

  const signOut = useCallback(async () => {
    await fbSignOut(auth)
  }, [])

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) {
        action()
      } else {
        setPendingAction(() => action)
        setLoginModalOpen(true)
      }
    },
    [user],
  )

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false)
    setPendingAction(null)
  }, [])

  return (
    <Ctx.Provider
      value={{ user, loading, signInWithGoogle, signOut, requireAuth, loginModalOpen, closeLoginModal }}
    >
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
