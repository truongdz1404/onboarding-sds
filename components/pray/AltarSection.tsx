'use client'

import React, { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

interface AltarSectionProps {
  isSoundOn: boolean
  onAddLog: (message: string) => void
}

export default function AltarSection({ isSoundOn, onAddLog }: AltarSectionProps) {
  const [candleLit, setCandleLit] = useState(false)
  const [candleTimer, setCandleTimer] = useState(0)
  const [candleCount, setCandleCount] = useState(0)
  const [isPraying, setIsPraying] = useState(false)
  const [prayCount, setPrayCount] = useState(0)
  const [offeredFlower, setOfferedFlower] = useState<'lotus' | 'marigold' | 'lily' | 'rose' | null>(null)

  useEffect(() => {
    setCandleCount(Number(localStorage.getItem('zen_candle_count') || 0))
    setPrayCount(Number(localStorage.getItem('zen_pray_count') || 0))
    setOfferedFlower((localStorage.getItem('zen_offered_flower') as any) || null)
  }, [])
  const [petals, setPetals] = useState<{ id: number; delay: number; left: number; symbol: string; size: number }[]>([])
  const [bellRinging, setBellRinging] = useState(false)
  const [bellText, setBellText] = useState<string | null>(null)

  const playBell = () => {
    if (!isSoundOn) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = ctx.currentTime
      ;[440, 660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)
        gain.gain.setValueAtTime(i === 0 ? 0.3 : 0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3 - i * 0.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 3)
      })
    } catch {}
  }

  const playChime = () => {
    if (!isSoundOn) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, now)
      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.8)
    } catch {}
  }

  // Candle auto-extinguish
  useEffect(() => {
    if (!candleLit || candleTimer <= 0) return
    const id = setInterval(() => {
      setCandleTimer(prev => {
        if (prev <= 1) {
          setCandleLit(false)
          onAddLog('Ngọn nến đã tắt, ánh sáng ước nguyện vẫn còn mãi trong tim.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [candleLit, candleTimer])

  const handleLightCandle = () => {
    if (candleLit) {
      setCandleLit(false)
      setCandleTimer(0)
      onAddLog('Bạn đã tắt ngọn nến.')
      return
    }
    playChime()
    setCandleLit(true)
    setCandleTimer(120)
    const newCount = candleCount + 1
    setCandleCount(newCount)
    localStorage.setItem('zen_candle_count', String(newCount))
    const msgs = [
      'Một ngọn nến ước nguyện vừa được thắp sáng...',
      'Ánh sáng của hy vọng luôn xua tan bóng tối.',
      'Ngọn nến nhỏ, nhưng đủ soi sáng con đường phía trước.',
    ]
    onAddLog(msgs[Math.floor(Math.random() * msgs.length)])
  }

  const handlePray = () => {
    if (isPraying) return
    setIsPraying(true)
    playBell()
    const msgs = [
      'Một khoảnh khắc tĩnh lặng, tâm trí nhẹ nhàng hơn.',
      'Gửi đi ước nguyện, đón nhận bình yên.',
      'Đôi khi chỉ cần dừng lại và thở, mọi thứ sẽ ổn hơn.',
      'Ước nguyện chân thành luôn tìm được con đường của nó.',
    ]
    onAddLog(msgs[Math.floor(Math.random() * msgs.length)])
    setTimeout(() => {
      setIsPraying(false)
      const newCount = prayCount + 1
      setPrayCount(newCount)
      localStorage.setItem('zen_pray_count', String(newCount))
    }, 2500)
  }

  const handleOfferFlower = (type: 'lotus' | 'marigold' | 'lily' | 'rose') => {
    setOfferedFlower(type)
    localStorage.setItem('zen_offered_flower', type)
    playChime()
    const names = { lotus: 'hoa sen', marigold: 'hoa cúc vàng', lily: 'hoa huệ trắng', rose: 'hoa hồng' }
    const symbols: Record<string, string[]> = {
      lotus: ['🪷', '🌸', '✨'], marigold: ['🌼', '💛', '✨'], lily: ['💮', '🤍', '✨'], rose: ['🌹', '❤️', '✨']
    }
    const syms = symbols[type]
    const newPetals = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      delay: Math.random() * 6,
      left: Math.random() * 96 + 2,
      symbol: syms[Math.floor(Math.random() * syms.length)],
      size: Math.random() * 1.2 + 0.8,
    }))
    setPetals(newPetals)
    onAddLog(`Bạn vừa dâng ${names[type]} — lời chúc lành gửi đến những người thân yêu.`)
    setTimeout(() => setPetals([]), 12000)
  }

  const handleRingBell = () => {
    playBell()
    setBellRinging(true)
    const texts = ['Bình an 🕊️', 'An lành ✨', 'Hy vọng 🌟', 'Yêu thương 💛']
    setBellText(texts[Math.floor(Math.random() * texts.length)])
    onAddLog('Tiếng chuông ngân vang — mang theo lời chúc bình an đến muôn nơi.')
    setTimeout(() => { setBellRinging(false); setBellText(null) }, 1500)
  }

  const handleClear = () => {
    setOfferedFlower(null)
    localStorage.removeItem('zen_offered_flower')
    setCandleLit(false)
    setCandleTimer(0)
    onAddLog('Không gian được làm mới, sẵn sàng cho những ước nguyện tiếp theo.')
    playChime()
  }

  const flowerImages: Record<string, string> = {
    lotus: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=300&q=80',
    marigold: 'https://images.unsplash.com/photo-1596200234477-9be7f6f96dfa?auto=format&fit=crop&w=300&q=80',
    lily: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80',
    rose: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-full h-full flex flex-col justify-between bg-transparent select-none gap-3">

      {/* Petal shower */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-30 overflow-hidden">
        {petals.map(p => (
          <div key={p.id} className="absolute animate-flower-fall pointer-events-none"
            style={{ left: `${p.left}%`, top: '-40px', animationDelay: `${p.delay}s`, fontSize: `${p.size}rem` }}>
            {p.symbol}
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex justify-between items-center bg-stone-50 rounded-xl px-4 py-2 border border-stone-100 text-xs">
        <div className="flex gap-4 text-stone-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${candleLit ? 'bg-amber-400 animate-pulse' : 'bg-stone-300'}`} />
            Nến thắp: <strong className="text-stone-700">{candleCount}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Nguyện cầu: <strong className="text-stone-700">{prayCount}</strong>
          </span>
        </div>
        {(offeredFlower || candleLit) && (
          <button onClick={handleClear}
            className="text-[10px] text-stone-500 hover:text-stone-700 font-semibold flex items-center gap-1 cursor-pointer hover:bg-stone-100 px-2 py-1 rounded-lg transition-all">
            <RotateCcw size={10} /> Làm mới
          </button>
        )}
      </div>

      {/* Altar visual */}
      <div className="relative w-full flex-grow flex items-center justify-center min-h-[160px]">
        <div className={`relative w-full overflow-hidden aspect-[16/9] bg-white transition-all duration-500
          ${isPraying ? 'animate-first-person-bow' : ''}`}
          style={{ perspective: '800px' }}>

          {/* Shrine video - autoplay loop like GIF */}
          <video
            src="/den-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          />

          {/* Soft overlay to blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-sky-50/40 via-transparent to-transparent pointer-events-none" />

          {/* Ambient glow when candle lit */}
          {candleLit && (
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl pointer-events-none transition-all duration-1000" />
          )}

          {/* Left lantern glow (matches image lantern ~14% left, 62% top) */}
          <div className="absolute pointer-events-none z-10" style={{ left: '13%', top: '60%' }}>
            {candleLit
              ? <div className="w-3 h-4 bg-amber-400 rounded-full blur-[3px] shadow-[0_0_14px_6px_rgba(251,191,36,0.55)] candle-flame-wiggle" />
              : <div className="w-2 h-3 bg-amber-200/40 rounded-full blur-[2px]" />
            }
          </div>

          {/* Right lantern glow (matches image lantern ~86% left, 62% top) */}
          <div className="absolute pointer-events-none z-10" style={{ left: '85%', top: '60%' }}>
            {candleLit
              ? <div className="w-3 h-4 bg-amber-400 rounded-full blur-[3px] shadow-[0_0_14px_6px_rgba(251,191,36,0.55)] candle-flame-wiggle" />
              : <div className="w-2 h-3 bg-amber-200/40 rounded-full blur-[2px]" />
            }
          </div>

          {/* Center candle smoke (user's) */}
          {candleLit && (
            <div className="absolute pointer-events-none z-20" style={{ left: '50%', top: '55%', transform: 'translateX(-50%)' }}>
              <div className="relative flex flex-col items-center">
                <div className="w-4 h-5 bg-amber-300 rounded-full blur-[4px] shadow-[0_0_20px_8px_rgba(251,191,36,0.6)] candle-flame-wiggle" />
                <div className="absolute -top-8 w-10 h-16 flex justify-center">
                  <span className="absolute animate-incense-smoke-clear bg-gradient-to-t from-white/25 to-transparent w-2 h-7 rounded-full" style={{ filter: 'blur(2px)' }} />
                  <span className="absolute animate-incense-smoke-clear bg-gradient-to-t from-white/15 to-transparent w-3 h-5 rounded-full" style={{ animationDelay: '2s', filter: 'blur(3px)' }} />
                </div>
              </div>
            </div>
          )}

          {/* Flower on altar stone basin (~50% left, 78% top) */}
          {offeredFlower && (
            <div className="absolute z-10 animate-altar-item pointer-events-none" style={{ left: '50%', top: '72%', transform: 'translateX(-50%)' }}>
              <img alt="Hoa dâng" src={flowerImages[offeredFlower]}
                className="w-9 h-9 object-cover rounded-full border-2 border-amber-200/60 shadow-md" />
            </div>
          )}

          {/* Bell ripple effect */}
          {bellRinging && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="animate-ripple absolute w-20 h-20 rounded-full border-2 border-amber-400/50" />
              <div className="animate-ripple absolute w-20 h-20 rounded-full border-2 border-amber-400/30" style={{ animationDelay: '0.3s' }} />
              {bellText && (
                <span className="absolute top-[30%] text-sm font-bold text-stone-700 drop-shadow-sm animate-bounce bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-200">
                  {bellText}
                </span>
              )}
            </div>
          )}

          {/* Prayer overlay */}
          {isPraying && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
              <div className="w-16 h-16 rounded-full border-2 border-sky-300/60 animate-pulse flex items-center justify-center bg-white/60">
                <span className="text-3xl">🕊️</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-600 italic">Một khoảnh khắc tĩnh lặng...</p>
            </div>
          )}

          {/* Flicker overlay when lit */}
          {candleLit && <div className="absolute inset-0 bg-amber-400/[0.03] pointer-events-none flicker-candles" />}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

        {/* Thắp nến */}
        <button onClick={handleLightCandle}
          className={`rounded-2xl border-2 p-3.5 flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer
            ${candleLit
              ? 'bg-amber-50 border-amber-400 shadow-[0_4px_14px_rgba(251,191,36,0.2)]'
              : 'bg-stone-50 border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'}`}>
          <span className="text-2xl">{candleLit ? '🕯️' : '🕯️'}</span>
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
            {candleLit ? 'Tắt nến' : 'Thắp nến'}
          </span>
          {candleLit && (
            <span className="text-[9px] text-amber-600 font-semibold">{candleTimer}s</span>
          )}
        </button>

        {/* Nguyện cầu */}
        <button onClick={handlePray} disabled={isPraying}
          className={`rounded-2xl border-2 p-3.5 flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer
            ${isPraying
              ? 'bg-sky-50 border-sky-300 cursor-not-allowed'
              : 'bg-stone-50 border-stone-200 hover:border-sky-300 hover:bg-sky-50/50'}`}>
          <span className="text-2xl">🙏</span>
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
            {isPraying ? 'Đang cầu...' : 'Nguyện cầu'}
          </span>
        </button>

        {/* Dâng hoa */}
        <div className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-2 transition-all
          ${offeredFlower ? 'bg-rose-50 border-rose-300' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-2xl">🌸</span>
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-0.5">Dâng hoa</span>
          <div className="grid grid-cols-2 gap-1 w-full">
            {(['lotus', 'marigold', 'lily', 'rose'] as const).map((type) => {
              const labels = { lotus: 'Sen', marigold: 'Cúc', lily: 'Huệ', rose: 'Hồng' }
              return (
                <button key={type} onClick={() => handleOfferFlower(type)}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer active:scale-95
                    ${offeredFlower === type
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-rose-300'}`}>
                  {labels[type]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Gõ chuông */}
        <button onClick={handleRingBell}
          className={`rounded-2xl border-2 p-3.5 flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer
            ${bellRinging
              ? 'bg-amber-50 border-amber-400 scale-105'
              : 'bg-stone-50 border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'}`}>
          <span className={`text-2xl ${bellRinging ? 'animate-bounce' : ''}`}>🔔</span>
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Gõ chuông</span>
        </button>

      </div>
    </div>
  )
}
