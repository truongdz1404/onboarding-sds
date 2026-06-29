'use client'

import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface AltarSectionProps {
  isSoundOn: boolean;
  onOpenCongDuc: () => void;
  onAddLog: (message: string) => void;
}

export default function AltarSection({
  isSoundOn,
  onOpenCongDuc,
  onAddLog
}: AltarSectionProps) {
  const [incenseCount, setIncenseCount] = useState(() => typeof window !== 'undefined' ? Number(localStorage.getItem('zen_incense_count') || 0) : 0);
  const [bowCount, setBowCount] = useState(() => typeof window !== 'undefined' ? Number(localStorage.getItem('zen_bow_count') || 0) : 0);
  const [isBowing, setIsBowing] = useState(false);
  const [litIncenseType, setLitIncenseType] = useState<number | null>(null);
  const [incenseTimer, setIncenseTimer] = useState(0);
  const [offeredFlower, setOfferedFlower] = useState<'lotus' | 'marigold' | 'lily' | 'rose' | null>(() => {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem('zen_offered_flower') as any) || null;
  });

  const [isStrikingMo, setIsStrikingMo] = useState(false);
  const [isStrikingKhanh, setIsStrikingKhanh] = useState(false);
  const [showRipples, setShowRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [petals, setPetals] = useState<{ id: number; delay: number; left: number; symbol: string; size: number; duration: number }[]>([]);
  const [moCount, setMoCount] = useState(0);
  const [gongs, setGongs] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  const playZenBell = () => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const frequencies = [293.66, 440.00, 587.33, 880.00];
      frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const duration = 4 - idx * 0.7;
        gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.5);
      });
    } catch (e) {}
  };

  const playMoSound = () => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  };

  const playKhanhSound = () => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
    } catch (e) {}
  };

  useEffect(() => {
    let interval: any;
    if (litIncenseType !== null && incenseTimer > 0) {
      interval = setInterval(() => {
        setIncenseTimer((prev) => {
          if (prev <= 1) {
            setLitIncenseType(null);
            onAddLog("Nhang thơm đã tàn, lòng tôn kính thành kính đã dâng lên chư Phật.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [litIncenseType, incenseTimer]);

  const handleThapNhang = (sticks: number) => {
    const word = sticks === 1 ? 'Một nén (Cầu Khẩn Thầm Lặng)' : (sticks === 3 ? 'Ba nén (Tam Bảo Chứng Giám)' : 'Năm nén (Ngũ Phần Pháp Thân Hương)');
    const term = sticks === 1 ? '1 nén' : (sticks === 3 ? '3 nén' : '5 nén');
    const newCount = incenseCount + sticks;
    setIncenseCount(newCount);
    localStorage.setItem('zen_incense_count', String(newCount));
    setLitIncenseType(sticks);
    setIncenseTimer(sticks * 30);
    playKhanhSound();
    onAddLog(`Bạn đã thắp thành công ${term} nhang kính niệm: ${word}. Khói trầm đang lan tỏa tịnh gia.`);
  };

  const handleVaiLay = () => {
    if (isBowing) return;
    setIsBowing(true);
    playZenBell();
    const messages = [
      "Quỳ trước án thờ tôn nghiêm, cúi lạy thành tâm xua tan tự mãn.",
      "Cúi đầu đảnh lễ sát đất, tâm bồ đề tỏa sáng rực rỡ.",
      "Cung nghinh chư Phật chư tổ chứng giám lòng trung hiếu nghĩa nhân.",
      "Cúi đầu bái kính, cầu chúc cha mẹ bách niên giai lão gia an."
    ];
    const phrase = messages[Math.floor(Math.random() * messages.length)];
    onAddLog(phrase);
    setTimeout(() => {
      setIsBowing(false);
      const newCount = bowCount + 1;
      setBowCount(newCount);
      localStorage.setItem('zen_bow_count', String(newCount));
    }, 2200);
  };

  const handleDangHoa = (type: 'lotus' | 'marigold' | 'lily' | 'rose') => {
    const names = {
      lotus: 'Bình Hoa Sen Hồng (Đại diện cho vô nhiễm thanh tịnh)',
      marigold: 'Bình Hoa Cúc Vàng (Tượng trưng cho cát tường trường thọ)',
      lily: 'Bình Hoa Huệ Trắng (Thanh khiết hiếu thảo trí tuệ)',
      rose: 'Bình Hoa Hồng Thắm (Dâng hiến tấm lòng thành kính nhất)'
    };
    setOfferedFlower(type);
    localStorage.setItem('zen_offered_flower', type);

    const flowerSymbols = {
      lotus: ['🪷', '🌸', '🌸', '🪷', '✨'],
      marigold: ['🌼', '🏵️', '💛', '🌼', '✨'],
      lily: ['💮', '🤍', '🪻', '💮', '✨'],
      rose: ['🌹', '🥀', '❤️', '🌹', '✨']
    };

    const symbols = flowerSymbols[type] || ['🌸'];
    const newPetals = Array.from({ length: 45 }).map((_, i) => ({
      id: Date.now() + i,
      delay: Math.random() * 9.5,
      left: Math.random() * 96 + 2,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: Math.random() * 1.3 + 0.9,
      duration: Math.random() * 2.5 + 6.0
    }));
    setPetals(newPetals);
    playKhanhSound();
    onAddLog(`Bạn đã kính cẩn dâng ${names[type]} tỉ mỉ kề cận bình sứ cổ.`);
    setTimeout(() => setPetals([]), 17000);
  };

  const handleGoMo = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMoCount(prev => prev + 1);
    playMoSound();
    setIsStrikingMo(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setShowRipples(prev => [...prev, newRipple]);
    const phrases = ["Công Đức +1 ✨", "An Nhiên +1 🌸", "Tĩnh Tâm +1 🧘", "Giải Thoát +1 🕊️", "Trí Tuệ +1 💡"];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const newGong = { id: Date.now() + 1, text: phrase, x: x + (Math.random() * 40 - 20), y: y - 30 };
    setGongs(prev => [...prev, newGong]);
    setTimeout(() => setIsStrikingMo(false), 150);
    setTimeout(() => {
      setGongs(prev => prev.filter(g => g.id !== newGong.id));
      setShowRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1200);
  };

  const handleGoKhanh = (e: React.MouseEvent<HTMLButtonElement>) => {
    playKhanhSound();
    setIsStrikingKhanh(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setShowRipples(prev => [...prev, newRipple]);
    const newGong = { id: Date.now() + 2, text: "Boongggg... 🔔", x: x + (Math.random() * 30 - 15), y: y - 30 };
    setGongs(prev => [...prev, newGong]);
    setTimeout(() => setIsStrikingKhanh(false), 150);
    setTimeout(() => {
      setGongs(prev => prev.filter(g => g.id !== newGong.id));
      setShowRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1200);
  };

  const handleClearAltar = () => {
    setOfferedFlower(null);
    localStorage.removeItem('zen_offered_flower');
    setLitIncenseType(null);
    setIncenseTimer(0);
    onAddLog("Bạn đã lau dọn án thờ tịnh khiết, bày dọn chuẩn bị gieo duyên mới.");
    playKhanhSound();
  };

  const flowerImages = {
    lotus: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=300&q=80',
    marigold: 'https://images.unsplash.com/photo-1596200234477-9be7f6f96dfa?auto=format&fit=crop&w=300&q=80',
    lily: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80',
    rose: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80'
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-transparent select-none">

      {/* Falling petals overlay */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-30 overflow-hidden">
        {petals.map(p => (
          <div
            key={p.id}
            className="absolute select-none animate-flower-fall font-serif pointer-events-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
            style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`, fontSize: `${p.size}rem`, top: '-40px' }}
          >
            {p.symbol}
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="w-full flex justify-between items-center bg-orange-50/50 rounded-2xl px-4 py-2 border border-orange-100/80 mb-2 text-xs">
        <div className="flex gap-3 items-center text-zinc-600 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Đã thắp: <strong className="text-orange-600 font-bold ml-0.5">{incenseCount}</strong> nén
          </span>
          <span className="text-zinc-300">|</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Lễ bái: <strong className="text-rose-600 font-bold ml-0.5">{bowCount}</strong> lần
          </span>
        </div>
        <div>
          {offeredFlower && (
            <button
              onClick={handleClearAltar}
              className="text-[10px] text-orange-700 hover:scale-105 active:scale-95 transition-all font-bold bg-white/80 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200/50 flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <RotateCcw size={10} /> Dọn dẹp
            </button>
          )}
        </div>
      </div>

      {/* Main altar */}
      <div className="relative w-full flex-grow flex flex-col items-center justify-center min-h-[180px] lg:min-h-0">
        <div
          className={`relative w-full bg-orange-50 rounded-[24px] shadow-lg overflow-hidden border-4 border-orange-500 aspect-[16/10] select-none ${
            isBowing ? 'animate-first-person-bow' : 'animate-altar-breathe transition-transform duration-500'
          }`}
          style={{ perspective: '800px' }}
        >
          {/* Altar background: gradient + decorative SVG thay cho ảnh bên ngoài */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 pointer-events-none" />
          {/* Decorative altar backdrop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top arch / shrine header */}
            <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-red-900/80 to-transparent" />
            {/* Central altar table */}
            <div className="absolute bottom-0 inset-x-0 h-2/5 bg-gradient-to-t from-amber-950 to-transparent" />
            {/* Gold ornamental band */}
            <div className="absolute top-[28%] inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
            <div className="absolute top-[30%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent" />
            {/* Center shrine glow */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
            {/* Left & Right columns */}
            <div className="absolute top-0 bottom-0 left-[12%] w-[6%] bg-gradient-to-b from-red-800/60 via-red-900/40 to-amber-950/80 rounded-sm" />
            <div className="absolute top-0 bottom-0 right-[12%] w-[6%] bg-gradient-to-b from-red-800/60 via-red-900/40 to-amber-950/80 rounded-sm" />
            {/* Buddha silhouette area */}
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-24 h-28 bg-gradient-to-b from-yellow-300/20 via-yellow-400/15 to-transparent rounded-full blur-xl" />
            {/* Altar table top */}
            <div className="absolute bottom-[36%] inset-x-[8%] h-[4px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent rounded-full" />
            {/* Red cloth drape */}
            <div className="absolute bottom-0 inset-x-[18%] top-[62%] bg-gradient-to-b from-red-800/30 to-red-900/50 rounded-t-sm" />
            {/* Gold lattice pattern overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="altar-lattice" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 20h40M20 0v40" stroke="#f59e0b" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#altar-lattice)" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none flicker-candles" />

          <div className="absolute top-[37.2%] left-[17.5%] pointer-events-none z-10 flex flex-col items-center">
            <div className="w-2.5 h-4 bg-orange-500 rounded-full blur-xs shadow-[0_0_12px_4px_rgba(239,120,40,0.85)] candle-flame-wiggle" />
          </div>
          <div className="absolute top-[37.2%] left-[82.3%] pointer-events-none z-10 flex flex-col items-center">
            <div className="w-2.5 h-4 bg-orange-500 rounded-full blur-xs shadow-[0_0_12px_4px_rgba(239,120,40,0.85)] candle-flame-wiggle" />
          </div>

          {isBowing && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-center z-20 transition-all duration-300">
              <p className="text-base md:text-lg font-serif font-bold italic text-orange-200 drop-shadow-md">
                Vạn pháp quy tâm • Đảnh lễ kính cẩn
              </p>
              <p className="text-[10px] text-orange-100/70 mt-1 font-sans">Kính bái trang nghiêm đài sen tịnh độ</p>
            </div>
          )}

          {isBowing && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none z-30">
              <div className="animate-first-person-hands flex flex-col items-center relative scale-75 origin-bottom">
                <div className="absolute -top-16 w-48 h-48 bg-gradient-to-tr from-amber-400/20 via-orange-500/30 to-yellow-300/10 rounded-full blur-2xl animate-pulse" />
                <svg viewBox="0 0 100 120" className="w-40 h-40 text-orange-200/90 drop-shadow-[0_0_20px_rgba(251,191,36,0.85)] filter brightness-110" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="goldHandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fffefe" stopOpacity="0.95" />
                      <stop offset="45%" stopColor="#ffedd5" stopOpacity="0.9" />
                      <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#78350f" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  <g opacity="0.45">
                    <line x1="50" y1="12" x2="50" y2="4" stroke="#fcd34d" strokeWidth="1.5" />
                    <line x1="18" y1="36" x2="8" y2="31" stroke="#fcd34d" strokeWidth="1.5" />
                    <line x1="82" y1="36" x2="92" y2="31" stroke="#fcd34d" strokeWidth="1.5" />
                  </g>
                  <circle cx="50" cy="60" r="32" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.55" />
                  <path d="M50,15 C46,30 38,55 33,68 C29,78 25,86 25,96 C25,108 36,110 50,111 Z" fill="url(#goldHandGrad)" />
                  <path d="M50,15 C54,30 62,55 67,68 C71,78 75,86 75,96 C75,108 64,110 50,111 Z" fill="url(#goldHandGrad)" />
                  <path d="M50,15 L50,111" stroke="#854d0e" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M42,36 C44,46 47,62 50,82" stroke="#ea580c" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
                  <path d="M58,36 C56,46 53,62 50,82" stroke="#ea580c" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
                  <g transform="translate(42, 68) scale(0.32)">
                    <path d="M24,2 C24,2 15,12 15,19 C15,24 19,28 24,28 C29,28 33,24 33,19 C33,12 24,2 24,2 Z" fill="#f43f5e" />
                    <path d="M24,7 C24,7 18,14 18,19 C18,22 21,25 24,25 C27,25 30,22 30,19 C30,14 24,7 24,7 Z" fill="#fda4af" />
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* Incense sticks */}
          {litIncenseType !== null && (
            <div className="absolute top-[61.5%] left-[50.2%] -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center">
              <div className="absolute bottom-1 origin-bottom transform -skew-x-[3deg] flex flex-col items-center">
                <div className="w-[4px] h-10 bg-gradient-to-b from-amber-600 via-amber-800 to-amber-950 rounded-t-full shadow-md relative border-[0.5px] border-amber-500/25">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1.5px] w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_3px_rgba(251,146,60,0.9)] animate-pulse" />
                </div>
                <div className="w-[2px] h-3 bg-gradient-to-b from-red-800 to-red-900" />
              </div>

              {litIncenseType >= 3 && (
                <>
                  <div className="absolute bottom-1 origin-bottom transform skew-x-[6deg] -translate-x-2 flex flex-col items-center">
                    <div className="w-[4px] h-[36px] bg-gradient-to-b from-amber-500 via-amber-800 to-amber-950 rounded-t-full shadow-md relative border-[0.5px] border-amber-500/25">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1.5px] w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_3px_rgba(251,146,60,0.9)] animate-pulse" />
                    </div>
                    <div className="w-[2px] h-3 bg-gradient-to-b from-red-800 to-red-900" />
                  </div>
                  <div className="absolute bottom-1 origin-bottom transform -skew-x-[6deg] translate-x-2 flex flex-col items-center">
                    <div className="w-[4px] h-[36px] bg-gradient-to-b from-amber-500 via-amber-800 to-amber-950 rounded-t-full shadow-md relative border-[0.5px] border-amber-500/25">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1.5px] w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_3px_rgba(251,146,60,0.9)] animate-pulse" />
                    </div>
                    <div className="w-[2px] h-3 bg-gradient-to-b from-red-800 to-red-900" />
                  </div>
                </>
              )}

              {litIncenseType >= 5 && (
                <>
                  <div className="absolute bottom-1 origin-bottom transform skew-x-[12deg] -translate-x-4 flex flex-col items-center">
                    <div className="w-[4px] h-[32px] bg-gradient-to-b from-amber-500 via-amber-800 to-amber-950 rounded-t-full shadow-md relative border-[0.5px] border-amber-500/25">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1.5px] w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_3px_rgba(251,146,60,0.9)] animate-pulse" />
                    </div>
                    <div className="w-[2px] h-3 bg-gradient-to-b from-red-800 to-red-900" />
                  </div>
                  <div className="absolute bottom-1 origin-bottom transform -skew-x-[12deg] translate-x-4 flex flex-col items-center">
                    <div className="w-[4px] h-[32px] bg-gradient-to-b from-amber-500 via-amber-800 to-amber-950 rounded-t-full shadow-md relative border-[0.5px] border-amber-500/25">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1.5px] w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_3px_rgba(251,146,60,0.9)] animate-pulse" />
                    </div>
                    <div className="w-[2px] h-3 bg-gradient-to-b from-red-800 to-red-900" />
                  </div>
                </>
              )}

              <div className="absolute bottom-8 w-12 h-32 flex justify-center pointer-events-none">
                <span className="absolute animate-incense-smoke-clear bg-gradient-to-t from-zinc-200/40 via-zinc-300/25 to-transparent w-3 h-8 rounded-full shadow-sm" style={{ animationDelay: '0s', filter: 'blur(2px)' }} />
                <span className="absolute animate-incense-smoke-clear bg-gradient-to-t from-zinc-300/45 via-zinc-100/20 to-transparent w-4 h-6 rounded-full shadow-sm" style={{ animationDelay: '1.5s', filter: 'blur(3px)' }} />
                <span className="absolute animate-incense-smoke-clear bg-gradient-to-t from-orange-100/25 via-zinc-200/10 to-transparent w-3 h-7 rounded-full shadow-xs" style={{ animationDelay: '3s', filter: 'blur(2.5px)' }} />
              </div>
            </div>
          )}

          {/* Flowers on vases */}
          {offeredFlower && (
            <>
              <div className="absolute top-[41.5%] left-[28.5%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 z-10 animate-altar-item pointer-events-none">
                <img alt="Flower Altar" src={flowerImages[offeredFlower]} className="w-full h-full object-cover rounded-full border border-amber-300/50 shadow-sm ring-2 ring-amber-500/5" />
              </div>
              <div className="absolute top-[41.5%] left-[71.5%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 z-10 animate-altar-item pointer-events-none">
                <img alt="Flower Altar" src={flowerImages[offeredFlower]} className="w-full h-full object-cover rounded-full border border-amber-300/50 shadow-sm ring-2 ring-amber-500/5" />
              </div>
            </>
          )}

        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-3">

        <div className="bg-gradient-to-b from-amber-50/40 to-orange-50/15 p-4 rounded-[20px] border-2 border-orange-200 flex flex-col justify-between items-center text-center gap-3.5 hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)] transition-all shadow-[0_4px_14px_rgba(249,115,22,0.08)] h-full">
          <div className="flex items-center gap-1.5 text-[12px] font-black text-orange-950 uppercase tracking-widest shrink-0">
            <span>🕯️</span> Thắp Hương
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="grid grid-cols-2 gap-1.5 w-full">
              {[1, 3, 5].map((sticks) => (
                <button
                  key={sticks}
                  onClick={() => handleThapNhang(sticks)}
                  className={`py-2 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer text-center flex items-center justify-center shadow-xs active:scale-95 ${
                    sticks === 5 ? 'col-span-2' : ''
                  } ${
                    litIncenseType === sticks
                      ? 'bg-orange-500 border-orange-600 text-white shadow-md ring-2 ring-orange-300'
                      : 'bg-white text-orange-900 border border-orange-200 hover:bg-orange-50 hover:border-orange-400'
                  }`}
                >
                  {sticks}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-amber-50/40 to-orange-50/15 p-4 rounded-[20px] border-2 border-orange-200 flex flex-col justify-between items-center text-center gap-3.5 hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)] transition-all shadow-[0_4px_14px_rgba(249,115,22,0.08)] h-full">
          <div className="flex items-center gap-1.5 text-[12px] font-black text-orange-950 uppercase tracking-widest shrink-0">
            <span>🙇</span> Vái Lạy
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <button
              disabled={isBowing}
              onClick={handleVaiLay}
              className={`w-full h-[74px] text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center uppercase tracking-wider ${
                isBowing
                  ? 'bg-orange-500 border-orange-600 text-white shadow-md ring-2 ring-orange-300 cursor-not-allowed'
                  : 'bg-white text-orange-900 border border-orange-200 hover:bg-orange-50 hover:border-orange-400'
              }`}
            >
              {isBowing ? "Bái sám..." : "Hành Lễ"}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-amber-50/40 to-orange-50/15 p-4 rounded-[20px] border-2 border-orange-200 flex flex-col justify-between items-center text-center gap-3.5 hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)] transition-all shadow-[0_4px_14px_rgba(249,115,22,0.08)] h-full">
          <div className="flex items-center gap-1.5 text-[12px] font-black text-orange-950 uppercase tracking-widest shrink-0">
            <span>💐</span> Dâng Hoa
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="grid grid-cols-2 gap-1.5 w-full">
              {(['lotus', 'marigold', 'lily', 'rose'] as const).map((type) => {
                const label = type === 'lotus' ? 'Sen' : type === 'marigold' ? 'Cúc' : type === 'lily' ? 'Huệ' : 'Hồng';
                return (
                  <button
                    key={type}
                    onClick={() => handleDangHoa(type)}
                    className={`py-2 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer text-center flex items-center justify-center shadow-xs active:scale-95 ${
                      offeredFlower === type
                        ? 'bg-orange-500 border-orange-600 text-white shadow-md ring-2 ring-orange-300'
                        : 'bg-white text-orange-900 border border-orange-200 hover:bg-orange-50 hover:border-orange-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-amber-50/40 to-orange-50/15 p-4 rounded-[20px] border-2 border-orange-200 flex flex-col justify-between items-center text-center gap-3.5 hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)] transition-all shadow-[0_4px_14px_rgba(249,115,22,0.08)] h-full">
          <div className="flex items-center gap-1.5 text-[12px] font-black text-orange-950 uppercase tracking-widest shrink-0">
            <span>💰</span> Gieo Duyên
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <button
              onClick={onOpenCongDuc}
              className="w-full h-[74px] text-[11px] font-extrabold rounded-lg border border-orange-200 bg-white text-orange-900 hover:bg-orange-50 hover:border-orange-400 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center uppercase tracking-wider"
            >
              Công Đức
            </button>
          </div>
        </div>

      </div>

      {/* Gõ Mõ & Khánh */}
      <div className="w-full bg-gradient-to-b from-amber-50/40 to-orange-50/15 rounded-[20px] p-4 border-2 border-orange-200 flex items-center justify-between gap-4 mt-3 hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)] transition-all shadow-[0_4px_14px_rgba(249,115,22,0.08)]">

        <div className="flex-1 min-w-0">
          <h4 className="font-black text-orange-950 text-[12px] flex items-center gap-1.5 uppercase tracking-widest">
            <span>🧘</span> Chánh Niệm
          </h4>
          <p className="text-[10px] text-zinc-500 leading-tight mt-1 font-semibold truncate">
            Thỉnh âm tịnh hóa giải nghiệp, gõ tích phước báo. ({moCount} lần)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative">
          {gongs.map(gong => (
            <span
              key={gong.id}
              className="absolute text-[9px] font-bold text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-100 shadow-sm animate-bounce z-40"
              style={{ left: -20, top: -24 }}
            >
              {gong.text}
            </span>
          ))}

          <div className="relative">
            <button
              onClick={handleGoMo}
              className={`px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 hover:border-orange-400 rounded-2xl flex items-center gap-2 active:scale-95 transition-all outline-none cursor-pointer shadow-md ${
                isStrikingMo ? 'scale-110 border-orange-500 bg-orange-100/30' : ''
              }`}
            >
              <span className="text-xl select-none animate-pulse">🪵</span>
              <span className="text-[13px] font-extrabold text-orange-900 tracking-wide">Gõ Mõ</span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={handleGoKhanh}
              className={`px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 hover:border-orange-400 rounded-2xl flex items-center gap-2 active:scale-95 transition-all outline-none cursor-pointer shadow-md ${
                isStrikingKhanh ? 'scale-110 border-orange-500 bg-orange-100/30' : ''
              }`}
            >
              <span className="text-xl select-none animate-pulse">🔔</span>
              <span className="text-[13px] font-extrabold text-orange-900 tracking-wide">Khánh</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
