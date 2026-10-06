import Link from 'next/link'
import { cn } from '@/lib/utils'

export function CultMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden>
      <defs>
        <linearGradient id="cult-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.95 0.01 285)" />
          <stop offset="0.55" stopColor="oklch(0.66 0.21 296)" />
          <stop offset="1" stopColor="oklch(0.4 0.18 296)" />
        </linearGradient>
      </defs>
      <path d="M16 2 28 9v14l-12 7-12-7V9z" fill="none" stroke="url(#cult-mark)" strokeWidth="1.6" />
      <path d="M16 8 23 12v8l-7 4-7-4v-8z" fill="url(#cult-mark)" opacity="0.18" />
      <path d="M20.5 12.5a6 6 0 1 0 0 7" fill="none" stroke="url(#cult-mark)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function CultLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}>
      <CultMark />
      <span className="font-display text-lg font-bold tracking-[0.18em] metal-text">$CULT</span>
      <span className="sr-only">CT Card Universe home</span>
    </Link>
  )
}
