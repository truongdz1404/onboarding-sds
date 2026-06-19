import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps()[0] ?? initializeApp(config)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

/** signInWithPopup but with the popup window centered on screen */
export async function signInWithGoogleCentered() {
  const { signInWithPopup } = await import('firebase/auth')

  const W = 500
  const H = 640
  const left = Math.round(window.screenX + (window.outerWidth - W) / 2)
  const top  = Math.round(window.screenY + (window.outerHeight - H) / 2)
  const features = `width=${W},height=${H},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`

  const orig = window.open.bind(window)
  window.open = (url?: string | URL, name?: string) => orig(url, name, features)

  try {
    return await signInWithPopup(auth, googleProvider)
  } finally {
    window.open = orig
  }
}
