import type { Metadata } from 'next'
import { Plus, Shield, Users } from 'lucide-react'
import { GUILDS } from '@/lib/data/world'
import { MOCK_CARDS, MOCK_USER_SEEDS } from '@/lib/data/users'
import { compact, num } from '@/lib/game/format'
import { ARCHETYPE_LABEL } from '@/lib/game/scoring'
import { PageHeader } from '@/components/ui-kit/primitives'
import { CardAvatar } from '@/components/cards/card-avatar'

export const metadata: Metadata = { title: 'Guilds — The Sanctum' }

const HUES: Record<string, number> = { 'alpha-order': 296, 'trader-cult': 220, builders: 160, 'meme-army': 340 }

export default function GuildsPage() {
  return (
    <>
      <PageHeader eyebrow="Sector 06 · The Sanctum" title="Guilds" subtitle="Four orders compete for season points. Guild XP is the sum of every member's battles, forges and tournaments." />
      <ul className="grid gap-5 md:grid-cols-2">
        {GUILDS.map((g) => {
          const hue = HUES[g.id] ?? 296
          const members = MOCK_USER_SEEDS.filter((u) => u.guildId === g.id).slice(0, 5)
          return (
            <li key={g.id}>
              <article
                className="glass relative h-full overflow-hidden rounded-2xl p-6 sm:p-8"
                style={{ backgroundImage: `radial-gradient(70% 80% at 100% 0%, oklch(0.4 0.14 ${hue} / 0.3), transparent 70%)` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className="flex size-14 items-center justify-center rounded-2xl border bg-black/40"
                      style={{ borderColor: `oklch(0.7 0.14 ${hue} / 0.5)`, color: `oklch(0.85 0.1 ${hue})` }}
                    >
                      <Shield className="size-6" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.3em] text-muted-foreground">[{g.tag}] · {ARCHETYPE_LABEL[g.archetype]}</p>
                      <h2 className="font-display text-2xl font-bold uppercase">{g.name}</h2>
                    </div>
                  </div>
                  <span className="font-display text-4xl font-bold metal-text">#{g.rank}</span>
                </div>
                <p className="mt-4 italic text-muted-foreground">&ldquo;{g.motto}&rdquo;</p>
                <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['Members', num(g.members)],
                    ['Guild XP', compact(g.xp)],
                    ['Wins', compact(g.wins)],
                    ['Season Pts', compact(g.seasonPoints)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
                      <dd className="mt-1 font-display text-lg font-bold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {members.map((m) => (
                      <CardAvatar key={m.handle} handle={m.handle} className="w-9 ring-2 ring-background" />
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" aria-hidden /> Led by @{g.leader} · CT {MOCK_CARDS.find((c) => c.handle === g.leader)?.stats.ctScore ?? '—'}
                  </p>
                </div>
              </article>
            </li>
          )
        })}
        <li className="md:col-span-2">
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border border-white/10 text-muted-foreground">
              <Plus className="size-5" aria-hidden />
            </span>
            <p className="font-display text-lg font-bold uppercase">Found your own guild</p>
            <p className="max-w-md text-sm text-muted-foreground">Guild creation unlocks in a future season and will cost $CULT to charter. Stay tuned.</p>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Coming soon</span>
          </div>
        </li>
      </ul>
    </>
  )
}
