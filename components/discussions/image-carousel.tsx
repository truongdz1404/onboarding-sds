'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import type { PostMedia } from '@/lib/discussion-types'

/* ── Blurred slide background ── */
function SlideBackground({ item }: { item: PostMedia }) {
  if (item.type === 'video') {
    return (
      <div
        className="absolute inset-0 scale-110"
        style={{ filter: 'blur(24px)', opacity: 0.6 }}
      >
        <video src={item.url} className="h-full w-full object-cover" muted preload="none" />
      </div>
    )
  }
  return (
    <img
      src={item.url}
      aria-hidden
      className="absolute inset-0 h-full w-full scale-110 object-cover"
      style={{ filter: 'blur(24px)', opacity: 0.8 }}
      loading="lazy"
    />
  )
}

/* ── Nav arrow ── */
function NavBtn({ onClick, dir, label }: { onClick: (e: React.MouseEvent) => void; dir: 'prev' | 'next'; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70',
        dir === 'prev' ? 'left-2' : 'right-2',
      )}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5">
        {dir === 'prev'
          ? <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          : <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        }
      </svg>
    </button>
  )
}

/* ── Fullscreen Lightbox ── */
function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: PostMedia[]
  startIndex: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(startIndex)

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent((i) => (i - 1 + items.length) % items.length)
  }, [items.length])

  const next = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent((i) => (i + 1) % items.length)
  }, [items.length])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrent((i) => (i - 1 + items.length) % items.length)
      if (e.key === 'ArrowRight') setCurrent((i) => (i + 1) % items.length)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [items.length, onClose])

  const item = items[current]

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={(e) => { e.stopPropagation(); onClose() }}
    >
      {/* Blurred background for letterboxed media */}
      <div className="absolute inset-0 overflow-hidden">
        <SlideBackground item={item} />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Media */}
      <div
        className="relative z-10 flex h-full w-full max-h-screen items-center justify-center p-4 md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg shadow-2xl"
          />
        ) : (
          <img
            key={item.url}
            src={item.url}
            alt={`Ảnh ${current + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <NavBtn onClick={prev} dir="prev" label="Trước" />
          <NavBtn onClick={next} dir="next" label="Tiếp" />
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
          <div className="absolute right-4 top-4 z-20 mr-11 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {current + 1}&thinsp;/&thinsp;{items.length}
          </div>
        </>
      )}
    </div>,
    document.body,
  )
}

/* ── Main carousel ── */
interface ImageCarouselProps {
  items: PostMedia[]
  maxHeight?: number
  className?: string
}

export function ImageCarousel({ items, maxHeight = 480, className }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const prev = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent((i) => (i - 1 + items.length) % items.length)
  }, [items.length])

  const next = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrent((i) => (i + 1) % items.length)
  }, [items.length])

  if (!items?.length) return null

  return (
    <>
      <div className={cn('relative overflow-hidden rounded-xl', className)} style={{ maxHeight }}>
        {/* Sliding strip */}
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="relative flex min-w-full cursor-pointer items-center justify-center overflow-hidden"
              style={{ maxHeight }}
              onClick={(e) => {
                if (item.type !== 'video') {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrent(i)
                  setLightboxOpen(true)
                }
              }}
            >
              {/* Blurred background */}
              <SlideBackground item={item} />

              {/* Foreground media */}
              <div className="relative z-10 flex items-center justify-center" style={{ maxHeight }}>
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    controls
                    className="max-w-full object-contain"
                    style={{ maxHeight }}
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={`Ảnh ${i + 1}`}
                    className="max-w-full object-contain"
                    style={{ maxHeight }}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next */}
        {items.length > 1 && (
          <>
            <NavBtn onClick={prev} dir="prev" label="Trước" />
            <NavBtn onClick={next} dir="next" label="Tiếp theo" />

            <div className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {current + 1}&thinsp;/&thinsp;{items.length}
            </div>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i) }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Expand hint for images */}
        {items[current]?.type !== 'video' && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxOpen(true) }}
            aria-label="Xem toàn màn hình"
            className="absolute bottom-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-3.5">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox items={items} startIndex={current} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}
