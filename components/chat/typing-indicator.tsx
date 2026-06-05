export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-lg bg-muted px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}
