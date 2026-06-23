'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Copy, Check, Building2, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FadeUp } from '@/components/shared/fade-up'
import { SectionHeader } from '@/components/shared/section-header'
import { OfficeSpaces } from '@/components/office/office-spaces'

const LOCATIONS = [
  {
    id: 'hn',
    label: 'Hà Nội',
    sub: 'Trụ sở chính',
    address: 'Tầng 3, CT5AB, KĐT Văn Khê, Hà Đông, Hà Nội',
    query: 'Khu đô thị Văn Khê, Hà Đông, Hà Nội',
  },
  {
    id: 'hcm',
    label: 'TP. Hồ Chí Minh',
    sub: 'Chi nhánh',
    address: 'H.54 Huỳnh Tấn Chùa, Đông Hưng Thuận, TP.HCM',
    query: 'Đông Hưng Thuận, Quận 12, TP.HCM',
  },
]

export default function OfficePage() {
  const [active, setActive] = useState(LOCATIONS[0].id)
  const [copied, setCopied] = useState(false)
  const [isPanoeeFullscreen, setIsPanoeeFullscreen] = useState(false)
  const panoeeViewerRef = useRef<HTMLDivElement>(null)
  const loc = LOCATIONS.find((l) => l.id === active)!

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    loc.query,
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  const panoeeSrc =
    'https://tour.panoee.net/6a3810916e5528e87da41b51/panorama_27b67634095b49ae98f4d568dba4183a-1'

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(loc.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsPanoeeFullscreen(document.fullscreenElement === panoeeViewerRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const togglePanoeeFullscreen = async () => {
    try {
      if (document.fullscreenElement === panoeeViewerRef.current) {
        await document.exitFullscreen()
        return
      }

      await panoeeViewerRef.current?.requestFullscreen()
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-28 pb-16 border-b border-border">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="pointer-events-none absolute top-10 -right-10 h-72 w-72 rounded-full bg-amber-400/8 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-primary shrink-0" />
            <span className="eyebrow text-primary">Văn phòng 360°</span>
          </div>
          <h1 className="max-w-3xl text-balance font-extrabold text-5xl md:text-6xl text-text-dark" style={{ letterSpacing: '-0.04em', lineHeight: '0.9' }}>
            Khám phá <span className="gradient-text">không gian</span> làm việc của bạn
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Tham quan trụ sở và chi nhánh SoftDreams qua bản đồ và hình ảnh thực
            tế trước ngày đầu đi làm.
          </p>

          {/* Location tabs */}
          <div className="mt-9 flex flex-wrap gap-3">
            {LOCATIONS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActive(l.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200',
                  active === l.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-white border border-border text-foreground hover:bg-surface-orange hover:border-primary/20',
                )}
              >
                <Building2 size={18} />
                {l.label} — {l.sub}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Aerial / 360 viewer */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div
            ref={panoeeViewerRef}
            className="relative overflow-hidden rounded-2xl border border-border bg-black shadow-xl"
          >
            <iframe
              title="Tour 360 văn phòng"
              src={panoeeSrc}
              className={cn(
                'block w-full',
                isPanoeeFullscreen ? 'h-screen' : 'h-[420px] md:h-[560px]',
              )}
              loading="lazy"
              allow="accelerometer; gyroscope; autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <button
              type="button"
              onClick={togglePanoeeFullscreen}
              title={isPanoeeFullscreen ? 'Thu nhỏ' : 'Mở toàn màn hình'}
              aria-label={isPanoeeFullscreen ? 'Thu nhỏ tour 360' : 'Mở tour 360 toàn màn hình'}
              className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-lg bg-white/95 text-text-dark shadow-lg shadow-black/20 ring-1 ring-black/10 backdrop-blur transition hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {isPanoeeFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </section>

      {/* Map + address */}
      <section className="bg-surface-orange py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeader eyebrow="Địa chỉ" title="Tìm đường đến văn phòng" />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Address card */}
            <div className="flex flex-col gap-5 rounded-xl bg-white border border-border shadow-sm p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <MapPin size={24} className="text-white" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-text-dark">{loc.label}</h3>
                  <p className="text-sm text-muted-foreground">{loc.sub}</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {loc.address}
              </p>
              <div className="mt-auto flex flex-wrap gap-3">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    loc.query,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary !h-12 text-sm"
                >
                  <Navigation size={18} />
                  Chỉ đường
                </a>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="btn-secondary !h-12 text-sm"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Đã copy' : 'Copy địa chỉ'}
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                key={`map-${active}`}
                title={`Bản đồ ${loc.label}`}
                src={mapSrc}
                className="h-[340px] w-full lg:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Office spaces */}
      <section className="bg-surface-white py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeUp>
            <SectionHeader
              eyebrow="Tiện ích"
              title="Không gian & tiện ích văn phòng"
              description="Mọi thứ bạn cần để làm việc thoải mái và hiệu quả mỗi ngày."
            />
          </FadeUp>
          <div className="mt-12">
            <OfficeSpaces />
          </div>
        </div>
      </section>
    </>
  )
}
