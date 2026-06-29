'use client'

import React, { useState } from 'react'
import { Sparkles, Check, Heart } from 'lucide-react'
import { Prayer } from '@/lib/pray-types'

interface PrayerWallProps {
  prayers: Prayer[]
  onAddPrayer: (p: Omit<Prayer, 'id' | 'timestamp' | 'likes'>) => void
  onLikePrayer: (id: string) => void
}

export default function PrayerWall({ prayers, onAddPrayer, onLikePrayer }: PrayerWallProps) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [category, setCategory] = useState<Prayer['category']>('Cầu an')
  const [showSuccess, setShowSuccess] = useState(false)

  const categories: Prayer['category'][] = ['Cầu an', 'Công việc', 'Gia đạo', 'Bản thân', 'Học tập', 'Tình duyên']

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!content.trim()) return

    onAddPrayer({
      category,
      content: content.trim(),
      author: isAnonymous ? 'Ẩn danh' : (author.trim() || 'Bạn'),
      isAnonymous,
    })

    setContent('')
    setAuthor('')
    setIsAnonymous(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 min-h-0">

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-semibold text-sm animate-bounce pointer-events-none">
          <Check size={16} className="bg-white text-emerald-600 rounded-full p-0.5" />
          Ước nguyện đã được gửi đi!
        </div>
      )}

      {/* Form */}
      <div className="shrink-0 border border-stone-200 rounded-2xl p-4 bg-stone-50/50 hover:border-stone-300 transition-all">

        <h3 className="font-bold text-sm text-stone-800 mb-3 flex items-center gap-2">
          <Sparkles size={15} className="text-amber-500" />
          Gửi ước nguyện của bạn
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Category */}
          <div className="grid grid-cols-3 gap-1.5">
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={`py-1.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer truncate
                  ${category === cat
                    ? 'bg-amber-500 border-amber-600 text-white'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Content */}
          <textarea
            rows={3} required value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết điều bạn ước nguyện, hy vọng hoặc muốn chia sẻ..."
            className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 resize-none outline-none text-stone-800 placeholder-stone-400 transition-all"
          />

          {/* Author row */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-500 shrink-0">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded accent-amber-500 cursor-pointer" />
              Gửi ẩn danh
            </label>
            {!isAnonymous && (
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tên của bạn..."
                className="flex-1 min-w-0 text-[11px] px-3 py-1.5 bg-white rounded-lg border border-stone-200 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none text-stone-700" />
            )}
          </div>

          <button type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-xs tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
            <Sparkles size={13} />
            Gửi ước nguyện
          </button>

        </form>
      </div>

      {/* Prayer list */}
      <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/30">
        <h3 className="font-bold text-sm text-stone-700 mb-3 flex items-center gap-1.5">
          <Heart size={13} className="text-rose-400" />
          Ước nguyện của mọi người
        </h3>
        <div className="flex flex-col gap-2 overflow-y-auto pr-0.5" style={{ maxHeight: '300px' }}>
          {prayers.length === 0 ? (
            <p className="text-xs text-stone-400 text-center italic py-6">Chưa có ước nguyện nào. Hãy là người đầu tiên!</p>
          ) : (
            [...prayers].reverse().map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-3 border border-stone-100 hover:border-stone-200 transition-all shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {p.category}
                  </span>
                  <span className="text-[9px] text-stone-400 font-medium">{p.author}</span>
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">{p.content}</p>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[9px] text-stone-300">{p.timestamp}</span>
                  <button onClick={() => onLikePrayer(p.id)}
                    className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-rose-500 transition-colors cursor-pointer font-semibold">
                    <Heart size={11} className={p.likes > 0 ? 'fill-rose-300 text-rose-400' : ''} />
                    {p.likes || 0}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
