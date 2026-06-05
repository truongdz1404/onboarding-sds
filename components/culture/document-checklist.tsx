'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOCS = [
  'Sơ yếu lý lịch',
  'CCCD công chứng (2 bản)',
  'Giấy khám sức khỏe',
  'Xác nhận cư trú',
  'Bằng cấp / chứng chỉ gần nhất',
]

const STORAGE_KEY = 'sd-onboarding-checklist'

export function DocumentChecklist() {
  const [checked, setChecked] = useState<boolean[]>(() => DOCS.map(() => false))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length === DOCS.length) {
          setChecked(parsed)
        }
      }
    } catch {
      // ignore
    }
    setReady(true)
  }, [])

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const done = ready ? checked.filter(Boolean).length : 0
  const pct = (done / DOCS.length) * 100

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          <span>{done}/{DOCS.length} tài liệu đã chuẩn bị</span>
          <span className="tabular-nums text-primary">{Math.round(pct)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-md bg-muted">
          <div
            className="h-full rounded-md bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <ul className="flex flex-col gap-3">
        {DOCS.map((doc, i) => {
          const isChecked = checked[i]
          return (
            <li key={doc}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="group flex w-full items-center gap-4 rounded-lg bg-muted px-5 py-4 text-left transition-all duration-200 hover:scale-[1.01]"
                aria-pressed={isChecked}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                    isChecked
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-border bg-background',
                  )}
                >
                  {isChecked ? <Check size={16} strokeWidth={2.5} /> : null}
                </span>
                <span
                  className={cn(
                    'font-medium transition-colors',
                    isChecked && 'text-muted-foreground line-through',
                  )}
                >
                  {doc}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
