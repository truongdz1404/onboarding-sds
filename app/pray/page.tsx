'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Prayer, Contribution } from '@/lib/pray-types'
import { INITIAL_PRAYERS } from '@/lib/pray-data'
import { ZEN_TRACKS } from '@/lib/zen-tracks'
import ZenHeader from '@/components/pray/ZenHeader'
import AltarSection from '@/components/pray/AltarSection'
import PrayerWall from '@/components/pray/PrayerWall'
import CongDucModal from '@/components/pray/CongDucModal'

export default function PrayPage() {
  const [isSoundOn, setIsSoundOn] = useState(true)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [musicVolume, setMusicVolume] = useState(0.25)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [prayers, setPrayers] = useState<Prayer[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRAYERS
    const saved = localStorage.getItem('zen_prayers_v2')
    return saved ? JSON.parse(saved) : INITIAL_PRAYERS
  })

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('zen_contributions')
    const defaultCons: Contribution[] = [
      { id: 'c1', sender: 'Nguyễn Văn Đạt', amount: 50000, message: 'Cầu cho mẹ già mau chóng bình phục sức khỏe.', timestamp: '1 giờ trước' },
      { id: 'c2', sender: 'Trần Thị Thu', amount: 100000, message: 'Thành kính cúng dường Tam Bảo xây chùa mới.', timestamp: '3 giờ trước' },
    ]
    return saved ? JSON.parse(saved) : defaultCons
  })

  const [peaceLogs, setPeaceLogs] = useState<string[]>([
    'Phật tử Tuệ Minh vừa đảnh lễ bái sám 3 lần cúng dường.',
    'Có ai đó vừa dâng đóa sen tịnh hồng thơm ngát lên án thờ.',
    'Cộng đồng SDS Pray kính chúc Đạo hữu ngày mới tâm an nhiên lạc tự tại!',
  ])

  const [showCongDuc, setShowCongDuc] = useState(false)

  // Background music sync
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
        audioRef.current.play().catch(() => {
          addPeaceLog("💡 Đạo hữu hãy bấm vào màn hình rồi bấm Phát Nhạc lần nữa để nghe âm thanh nhé!")
        })
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

  useEffect(() => {
    localStorage.setItem('zen_prayers_v2', JSON.stringify(prayers))
  }, [prayers])

  useEffect(() => {
    localStorage.setItem('zen_contributions', JSON.stringify(contributions))
  }, [contributions])

  const addPeaceLog = (msg: string) => {
    setPeaceLogs(prev => [msg, ...prev.slice(0, 15)])
  }

  const handleAddPrayer = (newPrayer: Omit<Prayer, 'id' | 'timestamp' | 'likes'>) => {
    const prayerItem: Prayer = {
      ...newPrayer,
      id: 'prayer_' + Date.now(),
      timestamp: 'Vừa xong',
      likes: 0
    }
    setPrayers(prev => [prayerItem, ...prev])
    addPeaceLog(`Lòng thành cầu nguyện vừa được thắp sáng: "${newPrayer.content.slice(0, 42)}..."`)
  }

  const handleLikePrayer = (id: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        addPeaceLog(`Đồng tâm cầu nguyện cùng: "${p.content.slice(0, 42)}..."`)
        if (isSoundOn) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const now = audioCtx.currentTime
            const osc = audioCtx.createOscillator()
            const gain = audioCtx.createGain()
            osc.frequency.setValueAtTime(659.25, now)
            gain.gain.setValueAtTime(0.2, now)
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1)
            osc.connect(gain)
            gain.connect(audioCtx.destination)
            osc.start()
            osc.stop(now + 1)
          } catch (e) {}
        }
        return { ...p, likes: p.likes + 1 }
      }
      return p
    }))
  }

  const handleAddContribution = (newDonation: Omit<Contribution, 'id' | 'timestamp'>) => {
    const conItem: Contribution = {
      ...newDonation,
      id: 'con_' + Date.now(),
      timestamp: 'Vừa xong'
    }
    setContributions(prev => [conItem, ...prev])
    addPeaceLog(`Hội đồng công đức hoan nghênh tinh thần cúng dường ${newDonation.amount.toLocaleString()}đ của Đạo hữu ${newDonation.sender}.`)
  }

  const handleResetAppCaches = () => {
    if (confirm("Bạn có chắc chắn muốn xóa dữ liệu cúng dường của bạn khỏi bộ nhớ không?")) {
      localStorage.removeItem('zen_prayers_v2')
      localStorage.removeItem('zen_contributions')
      localStorage.removeItem('zen_incense_count')
      localStorage.removeItem('zen_bow_count')
      localStorage.removeItem('zen_offered_flower')
      setPrayers(INITIAL_PRAYERS)
      setContributions([])
      addPeaceLog("Cơ sở dữ liệu tịnh tâm đã được phục hồi khởi tạo.")
    }
  }

  return (
    <div className="min-h-screen bg-orange-50/10 text-zinc-800 pt-16 md:pt-[68px] flex flex-col">

      {/* Zen controls bar */}
      <ZenHeader
        isSoundOn={isSoundOn}
        setIsSoundOn={setIsSoundOn}
        isMusicPlaying={isMusicPlaying}
        setIsMusicPlaying={setIsMusicPlaying}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
      />

      {/* Live peace log ticker */}
      {peaceLogs.length > 0 && (
        <div className="w-full bg-amber-50/80 border-b border-orange-100 px-4 py-1.5 overflow-hidden">
          <div className="max-w-[1360px] mx-auto flex items-center gap-2">
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest shrink-0">🔴 Trực tiếp</span>
            <p className="text-[10px] text-zinc-600 truncate font-medium">{peaceLogs[0]}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow flex flex-col lg:flex-row p-3 md:p-4 gap-4 max-w-[1360px] mx-auto w-full">

        {/* Left: Altar */}
        <div className="flex-[1.4] min-h-0 bg-white border border-orange-100/70 rounded-[24px] p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <AltarSection
            isSoundOn={isSoundOn}
            onOpenCongDuc={() => setShowCongDuc(true)}
            onAddLog={addPeaceLog}
          />
        </div>

        {/* Right: Prayer wall + footer */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 bg-white border border-orange-100/70 rounded-[24px] p-4 shadow-sm flex flex-col justify-between min-h-0">
          <div className="flex-1 min-h-0 flex flex-col mb-2">
            <PrayerWall
              prayers={prayers}
              onAddPrayer={handleAddPrayer}
              onLikePrayer={handleLikePrayer}
            />
          </div>

          <div className="border-t border-orange-100/60 pt-2 text-[10px] text-zinc-400 text-center font-sans select-none shrink-0">
            <p className="font-semibold text-orange-600/90">© 2026 SDS Pray • Sứ Mệnh Chánh Niệm Việt</p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <a href="#" onClick={(e) => { e.preventDefault(); alert("SDS Pray - Sứ mệnh bồi đắp an lạc tinh thần Việt."); }} className="hover:text-orange-700 font-medium">Giới thiệu</a>
              <span>•</span>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Mọi dữ liệu công đức được vận hành thiện ý không vụ lợi."); }} className="hover:text-orange-700 font-medium">Điều khoản</a>
              <span>•</span>
              <button onClick={handleResetAppCaches} className="text-red-500 hover:text-red-700 font-bold transition-all">Khởi tạo lại</button>
            </div>
          </div>
        </div>

      </main>

      {/* Modal */}
      {showCongDuc && (
        <CongDucModal
          onClose={() => setShowCongDuc(false)}
          onAddContribution={handleAddContribution}
          isSoundOn={isSoundOn}
        />
      )}
    </div>
  )
}
