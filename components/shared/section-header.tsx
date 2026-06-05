import { cn } from '@/lib/utils'

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'eyebrow inline-flex items-center gap-2 rounded-md px-3 py-1.5 w-fit',
            light
              ? 'bg-white/10 text-accent'
              : 'bg-primary/10 text-primary',
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          'section-title text-balance',
          light ? 'text-white' : 'text-foreground',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'text-lg leading-relaxed max-w-2xl text-pretty',
            light ? 'text-white/70' : 'text-muted-foreground',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
