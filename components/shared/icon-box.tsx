import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'solid' | 'muted' | 'dark'

const sizeMap = {
  sm: 'w-11 h-11',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
}

export function IconBox({
  icon: Icon,
  variant = 'solid',
  size = 'md',
  iconSize = 28,
  className,
}: {
  icon: LucideIcon
  variant?: Variant
  size?: keyof typeof sizeMap
  iconSize?: number
  className?: string
}) {
  const base =
    'rounded-lg flex items-center justify-center transition-all duration-200 shrink-0'

  if (variant === 'muted') {
    return (
      <div
        className={cn(
          base,
          sizeMap[size],
          'bg-muted group-hover:bg-primary',
          className,
        )}
      >
        <Icon
          size={iconSize}
          strokeWidth={2}
          className="text-foreground group-hover:text-white transition-colors"
        />
      </div>
    )
  }

  if (variant === 'dark') {
    return (
      <div className={cn(base, sizeMap[size], 'bg-white/10', className)}>
        <Icon size={iconSize} strokeWidth={2} className="text-accent" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        base,
        sizeMap[size],
        'bg-primary group-hover:scale-110',
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={2} className="text-white" />
    </div>
  )
}
