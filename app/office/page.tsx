'use client'

import { useState } from 'react'
import { MapPin, Navigation, Copy, Check, Building2 } from 'lucide-react'
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
  const loc = LOCATIONS.find((l) => l.id === active)!

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    loc.query,
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  const streetSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    loc.query,
  )}&t=k&z=17&ie=UTF8&iwloc=&output=embed`

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(loc.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary pt-28 pb-16 text-white">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-40 w-40 rotate-12 rounded-lg bg-primary/10" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
            <MapPin size={32} className="text-accent" strokeWidth={2} />
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
            Khám phá không gian làm việc của bạn
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Tham quan trụ sở và chi nhánh SoftDreams qua bản đồ và hình ảnh thực
            tế trước ngày đầu đi làm.
          </p>

          {/* Location tabs */}
          <div className="mt-8 flex flex-wrap gap-3">
            {LOCATIONS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActive(l.id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors',
                  active === l.id
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20',
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
      <section className="bg-background py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="overflow-hidden rounded-lg border-2 border-border">
            <iframe
              key={`view-${active}`}
              title={`Toàn cảnh khu vực ${loc.label}`}
              src={streetSrc}
              className="h-[420px] w-full md:h-[560px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Map + address */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeader eyebrow="Địa chỉ" title="Tìm đường đến văn phòng" />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Address card */}
            <div className="flex flex-col gap-5 rounded-lg bg-background p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                  <MapPin size={24} className="text-white" />
                </span>
                <div>
                  <h3 className="text-xl font-bold">{loc.label}</h3>
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
            <div className="overflow-hidden rounded-lg border-2 border-border">
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
      <section className="bg-background py-16">
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
