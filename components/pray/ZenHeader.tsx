'use client'

import React, { useState } from 'react'
import { VolumeX, Volume2, Volume1 } from 'lucide-react'

interface ZenHeaderProps {
  isSoundOn: boolean
  setIsSoundOn: (on: boolean) => void
  isMusicPlaying: boolean
  setIsMusicPlaying: (playing: boolean) => void
  musicVolume: number
  setMusicVolume: (volume: number) => void
}

export default function ZenHeader({
  isSoundOn,
  setIsSoundOn,
  isMusicPlaying,
  setIsMusicPlaying,
  musicVolume,
  setMusicVolume,
}: ZenHeaderProps) {
  const [lastVolume, setLastVolume] = useState(0.25)

  const handleToggleMute = () => {
    if (musicVolume > 0) {
      setLastVolume(musicVolume)
      setMusicVolume(0)
    } else {
      setMusicVolume(lastVolume > 0 ? lastVolume : 0.25)
    }
  }

  return (
    <header className="w-full bg-white/95 border-b border-stone-100 shadow-xs select-none">
      <div className="flex justify-between items-center h-14 px-4 md:px-8 max-w-[1360px] mx-auto">

        <div className="flex items-center gap-2.5 select-none">
          <span className="text-xl">🕊️</span>
          <div>
            <p className="font-bold text-base text-stone-800 leading-tight">SDS Pray</p>
            <p className="text-[10px] text-stone-400 font-medium leading-none">Không gian tĩnh tâm · Chia sẻ ước nguyện</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-full px-3 py-1.5">
          <button
            onClick={() => { setIsSoundOn(!isSoundOn); setIsMusicPlaying(!isSoundOn) }}
            title={isSoundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className={`p-1.5 rounded-full transition-all active:scale-95 cursor-pointer ${
              isSoundOn ? 'bg-amber-500 text-white' : 'bg-white border border-stone-200 text-stone-400 hover:text-amber-500'
            }`}
          >
            {isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>

          <div className="flex items-center gap-1.5 border-l border-stone-200 pl-2">
            <button
              onClick={handleToggleMute}
              className="p-1 hover:bg-stone-100 rounded-full transition-all text-stone-400 hover:text-amber-500 cursor-pointer"
            >
              {musicVolume > 0 ? <Volume1 size={13} /> : <VolumeX size={13} />}
            </button>
            <input
              type="range" min="0" max="1" step="0.05"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-14 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
            />
          </div>
        </div>

      </div>
    </header>
  )
}
