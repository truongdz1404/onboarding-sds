'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Prayer } from '@/lib/pray-types'
import { INITIAL_PRAYERS } from '@/lib/pray-data'
import { ZEN_TRACKS } from '@/lib/zen-tracks'
import ZenHeader from '@/components/pray/ZenHeader'
import AltarSection from '@/components/pray/AltarSection'
import PrayerWall from '@/components/pray/PrayerWall'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase-client'
import {
  collection, addDoc, updateDoc, getDocs, doc, query, where, writeBatch,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'

const PRAYERS_COL = 'pray_prayers'

async function fetchUserPrayers(uid: string): Promise<Prayer[]> {
  const snap = await getDocs(query(collection(db, PRAYERS_COL), where('uid', '==', uid)))
  return snap.docs
    .sort((a, b) => (b.data().createdAt ?? 0) - (a.data().createdAt ?? 0))
    .map(d => ({
      id: d.id,
      category: d.data().category as Prayer['category'],
      content: d.data().content as string,
      author: d.data().author as string,
      isAnonymous: d.data().isAnonymous as boolean,
      timestamp: d.data().timestamp as string,
      likes: d.data().likes as number,
    }))
}

async function migrateLocalToFirestore(uid: string, prayers: Prayer[]) {
  await Promise.all(
    prayers.map(p =>
      addDoc(collection(db, PRAYERS_COL), {
        uid,
        category: p.category,
        content: p.content,
        author: p.author,
        isAnonymous: p.isAnonymous,
        timestamp: p.timestamp,
        likes: p.likes,
        createdAt: Date.now(),
      })
    )
  )
}

export default function PrayPage() {
  const { user, loading: authLoading } = useAuth()
  const prevUserRef = useRef<User | null | 'init'>('init')

  const [isSoundOn, setIsSoundOn] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [musicVolume, setMusicVolume] = useState(0.25)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [prayers, setPrayers] = useState<Prayer[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRAYERS
    const saved = localStorage.getItem('zen_prayers_v2')
    return saved ? JSON.parse(saved) : INITIAL_PRAYERS
  })

  const [liveLog, setLiveLog] = useState('Chào mừng bạn đến với không gian tĩnh tâm SDS Pray 🕊️')

  // Auth-aware prayer loading & migration
  useEffect(() => {
    if (authLoading) return

    const prev = prevUserRef.current
    prevUserRef.current = user

    if (!user) {
      // User just logged out — reload from localStorage
      if (prev !== 'init' && prev !== null) {
        const saved = localStorage.getItem('zen_prayers_v2')
        setPrayers(saved ? JSON.parse(saved) : INITIAL_PRAYERS)
      }
      return
    }

    // User is logged in
    const justLoggedIn = prev === 'init' || prev === null

    if (justLoggedIn) {
      // Migrate any user-added localStorage prayers to Firestore
      try {
        const saved = localStorage.getItem('zen_prayers_v2')
        if (saved) {
          const local: Prayer[] = JSON.parse(saved)
          const userAdded = local.filter(p => !INITIAL_PRAYERS.some(ip => ip.id === p.id))
          if (userAdded.length > 0) {
            migrateLocalToFirestore(user.uid, userAdded).then(() => {
              localStorage.removeItem('zen_prayers_v2')
              addLog('Ước nguyện của bạn đã được đồng bộ vào tài khoản.')
            }).catch(() => {})
          }
        }
      } catch {}
    }

    // Load from Firestore
    fetchUserPrayers(user.uid).then(list => {
      setPrayers(list.length > 0 ? list : INITIAL_PRAYERS)
    }).catch(() => {})
  }, [user, authLoading])

  // Save to localStorage only when not logged in
  useEffect(() => {
    if (user || authLoading) return
    localStorage.setItem('zen_prayers_v2', JSON.stringify(prayers))
  }, [prayers, user, authLoading])

  // Background music
  useEffect(() => {
    if (isMusicPlaying && !audioRef.current) {
      const audio = new Audio(ZEN_TRACKS[0].url)
      audio.loop = true
      audio.volume = musicVolume
      audioRef.current = audio
    }
    if (audioRef.current) {
      audioRef.current.volume = musicVolume
      if (isMusicPlaying) {
        audioRef.current.play().catch(() =>
          setLiveLog('💡 Hãy click vào màn hình trước rồi bật nhạc lại để nghe âm thanh nhé!')
        )
      } else {
        audioRef.current.pause()
      }
    }
  }, [isMusicPlaying, musicVolume])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const addLog = (msg: string) => setLiveLog(msg)

  const handleAddPrayer = async (newPrayer: Omit<Prayer, 'id' | 'timestamp' | 'likes'>) => {
    if (user) {
      const docRef = await addDoc(collection(db, PRAYERS_COL), {
        uid: user.uid,
        ...newPrayer,
        timestamp: 'Vừa xong',
        likes: 0,
        createdAt: Date.now(),
      })
      setPrayers(prev => [{ ...newPrayer, id: docRef.id, timestamp: 'Vừa xong', likes: 0 }, ...prev])
    } else {
      setPrayers(prev => [{
        ...newPrayer,
        id: 'p_' + Date.now(),
        timestamp: 'Vừa xong',
        likes: 0,
      }, ...prev])
    }
    addLog(`Một ước nguyện mới vừa được gửi đi: "${newPrayer.content.slice(0, 50)}..."`)
  }

  const handleLikePrayer = (id: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id !== id) return p
      if (isSoundOn) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const now = ctx.currentTime
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.setValueAtTime(659, now)
          gain.gain.setValueAtTime(0.15, now)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(now + 0.8)
        } catch {}
      }
      if (user) {
        updateDoc(doc(db, PRAYERS_COL, id), { likes: p.likes + 1 }).catch(() => {})
      }
      addLog(`Bạn vừa đồng hành cùng một ước nguyện — thật ý nghĩa!`)
      return { ...p, likes: p.likes + 1 }
    }))
  }

  const handleReset = async () => {
    if (!confirm('Xoá tất cả dữ liệu cá nhân trong không gian này?')) return
    localStorage.removeItem('zen_prayers_v2')
    localStorage.removeItem('zen_candle_count')
    localStorage.removeItem('zen_pray_count')
    localStorage.removeItem('zen_offered_flower')
    if (user) {
      try {
        const snap = await getDocs(query(collection(db, PRAYERS_COL), where('uid', '==', user.uid)))
        const batch = writeBatch(db)
        snap.docs.forEach(d => batch.delete(d.ref))
        await batch.commit()
      } catch {}
    }
    setPrayers(INITIAL_PRAYERS)
    addLog('Không gian đã được làm mới hoàn toàn.')
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 pt-16 md:pt-[68px] flex flex-col">

      <ZenHeader
        isSoundOn={isSoundOn}
        setIsSoundOn={setIsSoundOn}
        isMusicPlaying={isMusicPlaying}
        setIsMusicPlaying={setIsMusicPlaying}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
      />

      <main className="flex-grow flex flex-col lg:flex-row p-3 md:p-4 gap-4 max-w-[1360px] mx-auto w-full">

        <div className="flex-[1.4] bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col relative overflow-hidden min-h-[420px]">
          <AltarSection isSoundOn={isSoundOn} onAddLog={addLog} />
        </div>

        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <PrayerWall
              prayers={prayers}
              onAddPrayer={handleAddPrayer}
              onLikePrayer={handleLikePrayer}
            />
          </div>

          <div className="border-t border-stone-100 pt-2.5 mt-2 text-[10px] text-stone-400 text-center select-none">
            <p className="font-medium">SDS Pray · Không gian tĩnh tâm của SoftDreams</p>
            <button onClick={handleReset} className="mt-1 text-red-400 hover:text-red-600 font-semibold transition-colors">
              Đặt lại dữ liệu
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}
