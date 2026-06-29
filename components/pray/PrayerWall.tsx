'use client'

import React, { useState } from 'react';
import { Edit3, Sparkles, Check } from 'lucide-react';
import { Prayer } from '@/lib/pray-types';

interface PrayerWallProps {
  prayers: Prayer[];
  onAddPrayer: (newPrayer: Omit<Prayer, 'id' | 'timestamp' | 'likes'>) => void;
  onLikePrayer: (id: string) => void;
}

export default function PrayerWall({
  prayers,
  onAddPrayer,
  onLikePrayer
}: PrayerWallProps) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<Prayer['category']>('Cầu an');
  const [showCelebration, setShowCelebration] = useState(false);

  const categories: Prayer['category'][] = ['Cầu an', 'Công việc', 'Gia đạo', 'Bản thân', 'Học tập', 'Tình duyên'];

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Vui lòng ghi lại tâm nguyện của bạn trước khi gửi.");
      return;
    }

    onAddPrayer({
      category,
      content: content.trim(),
      author: isAnonymous ? 'Ẩn danh' : (author.trim() || 'Phật Tử'),
      isAnonymous
    });

    setContent('');
    setAuthor('');
    setIsAnonymous(false);
    triggerCelebration();
  };

  return (
    <div className="w-full h-full relative p-0.5 flex flex-col justify-between gap-5 min-h-0">

      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => {
            const delay = Math.random() * 2;
            const left = Math.random() * 100;
            const duration = 3 + Math.random() * 3;
            const size = 12 + Math.random() * 16;
            const symbol = i % 3 === 0 ? '🌸' : i % 3 === 1 ? '✨' : '🎈';
            return (
              <span
                key={i}
                className="absolute text-center animate-flower-fall select-none"
                style={{
                  left: `${left}%`,
                  top: `-40px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  fontSize: `${size}px`,
                }}
              >
                {symbol}
              </span>
            );
          })}
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm animate-bounce z-[100]">
            <Check size={18} className="bg-white text-orange-600 rounded-full p-0.5" />
            Tâm Nguyện Đã Được Thắp Sáng Cúng Dường!
          </div>
        </div>
      )}

      {/* Prayer form */}
      <div className="flex flex-col gap-3.5 shrink-0 bg-gradient-to-b from-amber-50/40 to-orange-50/15 border-2 border-orange-200 rounded-[20px] p-4 md:p-5 shadow-[0_4px_14px_rgba(249,115,22,0.08)] hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)] transition-all">

        <div className="flex items-center gap-2.5 justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
            <Edit3 size={15} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-sm md:text-base text-zinc-850 tracking-wide uppercase">Gửi Lời Nguyện Ước</h3>
            <p className="text-[10px] text-zinc-400 font-bold tracking-wide">Gieo một ý niệm lành lên án thờ</p>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 text-center leading-relaxed font-sans max-w-sm mx-auto">
          Hãy viết lời tâm nguyện thành kính nhất. Ý niệm thiện lành của đạo hữu sẽ hiện diện nơi Phật đài cát tường.
        </p>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5 w-full">

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-orange-950 uppercase tracking-widest text-center">Cầu Nguyện Về:</label>
            <div className="grid grid-cols-3 gap-1.5 w-full max-w-[320px] mx-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-1 py-1.5 text-[10px] font-extrabold rounded-lg border-2 text-center transition-all cursor-pointer truncate shadow-xs ${
                    category === cat
                      ? 'bg-orange-500 border-orange-600 text-white shadow-xs'
                      : 'bg-white border-zinc-200 text-zinc-650 hover:bg-orange-50/40 hover:border-orange-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <textarea
              rows={2}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập tâm nguyện kính dâng bái lễ..."
              className="w-full text-xs p-3 bg-white/85 rounded-xl border border-zinc-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none outline-none text-zinc-800 placeholder-zinc-400 transition-all font-sans shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                id="check-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 focus:ring-1 border-zinc-300 accent-orange-600 cursor-pointer"
              />
              <label htmlFor="check-anonymous" className="text-[10.5px] font-bold text-zinc-650 cursor-pointer select-none">
                Gửi lời nguyện ẩn danh
              </label>
            </div>

            {!isAnonymous && (
              <input
                type="text"
                placeholder="Tên của bạn (Pháp danh...)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full sm:w-44 text-[11px] px-3 py-1.5 bg-white rounded-lg border border-zinc-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-zinc-850 outline-none font-medium shadow-xs"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-black text-xs tracking-widest hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 outline-none cursor-pointer uppercase border border-orange-600"
          >
            <Sparkles size={13} />
            Dâng Lời Tâm Nguyện
          </button>

        </form>

      </div>

      {/* Prayer list */}
      <div className="flex flex-col flex-grow min-h-[220px] bg-gradient-to-b from-amber-50/40 to-orange-50/15 border-2 border-orange-200 rounded-[20px] p-4 md:p-5 shadow-[0_4px_14px_rgba(249,115,22,0.08)] hover:border-orange-400 hover:shadow-[0_6px_20px_rgba(249,115,22,0.12)] transition-all">
        <div className="flex items-center gap-1 justify-center mb-3 shrink-0">
          <span className="text-[11.5px] font-black text-orange-950 uppercase tracking-widest text-center">📜 Sổ Nguyện Cầu An Lạc 📜</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[280px] xl:max-h-[360px]">
          {prayers.length === 0 ? (
            <p className="text-[10px] text-zinc-400 text-center italic py-4">Chưa có lời nguyện ước nào được đăng.</p>
          ) : (
            [...prayers].reverse().map((p) => (
              <div key={p.id} className="bg-white border border-orange-100/40 rounded-xl p-2.5 flex flex-col gap-1.5 transition-all hover:bg-orange-50/20 shadow-xs">
                <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold">
                  <span className="bg-orange-100/60 text-orange-850 px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-wider">{p.category}</span>
                  <span className="truncate max-w-[120px] font-extrabold text-zinc-700">{p.author}</span>
                </div>
                <p className="text-[10px] text-zinc-700 leading-relaxed whitespace-pre-line font-sans">{p.content}</p>
                <div className="flex justify-between items-center text-[8.5px] text-zinc-400 font-semibold mt-0.5">
                  <span>{p.timestamp}</span>
                  <button
                    onClick={() => onLikePrayer(p.id)}
                    className="flex items-center gap-1.5 hover:text-rose-600 text-zinc-500 transition-colors font-extrabold cursor-pointer"
                  >
                    ❤️ {p.likes || 0}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
