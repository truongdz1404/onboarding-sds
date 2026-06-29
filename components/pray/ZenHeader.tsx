'use client'

import React, { useState } from 'react';
import { VolumeX, Volume2, Volume1 } from 'lucide-react';

interface ZenHeaderProps {
  isSoundOn: boolean;
  setIsSoundOn: (on: boolean) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
}

export default function ZenHeader({
  isSoundOn,
  setIsSoundOn,
  isMusicPlaying,
  setIsMusicPlaying,
  musicVolume,
  setMusicVolume
}: ZenHeaderProps) {
  const [lastVolume, setLastVolume] = useState(0.25);

  const handleToggleMuteMusic = () => {
    if (musicVolume > 0) {
      setLastVolume(musicVolume);
      setMusicVolume(0);
    } else {
      setMusicVolume(lastVolume > 0 ? lastVolume : 0.25);
    }
  };

  return (
    <header className="w-full bg-white border-b border-orange-100 shadow-xs select-none">
      <div className="flex justify-between items-center h-14 px-4 md:px-8 max-w-[1360px] mx-auto">

        <div className="flex items-center gap-2 font-extrabold text-lg md:text-xl tracking-tight text-orange-600 select-none">
          <span className="text-xl drop-shadow-sm">🌸</span>
          <span>SDS Pray</span>
          <span className="text-[10px] font-semibold text-orange-400/70 ml-1 hidden sm:block">• Góc Tâm Linh SoftDreams</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-full px-3 py-1">
            <button
              onClick={() => {
                const nextState = !isSoundOn;
                setIsSoundOn(nextState);
                setIsMusicPlaying(nextState);
              }}
              title={isSoundOn ? "Tắt âm thanh thanh tịnh" : "Bật âm thanh thanh tịnh"}
              className={`p-1.5 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer ${
                isSoundOn
                  ? 'bg-orange-500 text-white shadow-xs animate-pulse'
                  : 'bg-white border border-zinc-200 text-orange-500 hover:bg-orange-50'
              }`}
            >
              {isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
            </button>

            <div className="flex items-center gap-1.5 border-l border-zinc-200/80 pl-2">
              <button
                onClick={handleToggleMuteMusic}
                title={musicVolume > 0 ? "Tắt tiếng nhạc nền" : "Bật tiếng nhạc nền"}
                className="p-1 hover:bg-zinc-100 rounded-full transition-all text-zinc-500 hover:text-orange-600 cursor-pointer"
              >
                {musicVolume > 0 ? <Volume1 size={13} /> : <VolumeX size={13} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-12 sm:w-16 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
                title={`Âm lượng nhạc nền: ${Math.round(musicVolume * 100)}%`}
              />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
