'use client'

import { AlertTriangle } from 'lucide-react'

// 8:00 -> 18:00 window = 10 hours
const blocks = [
  { label: 'Sáng', from: '8:00', to: '12:00', span: 4, type: 'work' },
  { label: 'Nghỉ trưa', from: '12:00', to: '13:30', span: 1.5, type: 'break' },
  { label: 'Chiều', from: '13:30', to: '17:30', span: 4, type: 'work' },
  { label: '', from: '', to: '18:00', span: 0.5, type: 'pad' },
]

const pills = [
  { label: 'Thứ 2–6 bắt buộc', cls: 'bg-secondary text-white' },
  { label: 'Thứ 7 cách tuần', cls: 'bg-primary text-white' },
  { label: 'Chấm công Wifi + GPS', cls: 'bg-muted text-foreground' },
]

export function WorkSchedule() {
  const total = blocks.reduce((s, b) => s + b.span, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Bar */}
      <div>
        <div className="flex h-16 w-full overflow-hidden rounded-md">
          {blocks.map((b, i) => (
            <div
              key={i}
              style={{ width: `${(b.span / total) * 100}%` }}
              className={
                b.type === 'work'
                  ? 'flex items-center justify-center bg-primary text-sm font-semibold text-white'
                  : b.type === 'break'
                    ? 'flex items-center justify-center bg-muted text-xs font-medium text-muted-foreground'
                    : 'bg-border'
              }
            >
              {b.type !== 'pad' ? b.label : ''}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>8:00</span>
          <span>12:00</span>
          <span>13:30</span>
          <span>17:30</span>
        </div>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-3">
        {pills.map((p) => (
          <span
            key={p.label}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${p.cls}`}
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* Penalty callout */}
      <div className="flex gap-4 rounded-lg border-l-4 border-primary bg-primary/5 p-5">
        <AlertTriangle size={22} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold">Quy định đi muộn</p>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Muộn ≤ 60 phút → tính nhân đôi. Muộn {'>'} 60 phút → tính theo thực
            tế. Tối đa 3 lần giải trình mỗi tháng.
          </p>
        </div>
      </div>
    </div>
  )
}
