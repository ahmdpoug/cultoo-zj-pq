import type { XProfile } from '@/lib/types'
import { authBridge } from '@/lib/auth/bridge'
import { buildCard, mockXProfile, normalizeHandle } from '@/lib/game/scoring'
import { gameStore } from '@/lib/store/game-store'
import type { SocialService } from './types'

export class XLookupError extends Error {}

/**
 * Live X profiles via `/api/x/profile` (X API v2, gated by the Privy session).
 * Falls back to generated stats when live data is unavailable, while still
 * using the signed-in user's real X name and avatar for their own card.
 */
export const xSocial: SocialService = {
  async getProfile(raw) {
    const handle = normalizeHandle(raw)
    const token = await authBridge.getAccessToken().catch(() => null)

    if (token) {
      const res = await fetch(`/api/x/profile?handle=${encodeURIComponent(handle)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) return ((await res.json()) as { profile: XProfile }).profile
      if (res.status === 404 || res.status === 400) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string }
        throw new XLookupError(error ?? `@${handle} doesn't exist on X.`)
      }
    }

    const base: XProfile = { ...mockXProfile(handle), source: 'generated' }
    const me = authBridge.getXIdentity()
    if (me && me.username.toLowerCase() === handle.toLowerCase()) {
      return { ...base, handle: me.username, displayName: me.name || me.username, avatarUrl: me.avatarUrl, xId: me.subject }
    }
    return base
  },

  shareUrl(text, url) {
    const params = new URLSearchParams({ text })
    if (url) params.set('url', url)
    return `https://x.com/intent/post?${params.toString()}`
  },
}

/**
 * Refreshes the player's main card from their connected X account so followers,
 * stats, CT score and rarity reflect live data. Keeps progression (id, XP, record, mint).
 */
export async function syncMainCardFromX(username: string): Promise<boolean> {
  const s = gameStore.getSnapshot()
  const main = s.cards.find((c) => c.id === s.mainCardId)
  if (!main || main.handle.toLowerCase() !== username.toLowerCase()) return false

  const profile = await xSocial.getProfile(username).catch(() => null)
  if (!profile || profile.source !== 'x') return false

  const fresh = buildCard(profile, { owner: main.owner, id: main.id })
  gameStore.set((st) => ({
    ...st,
    cards: st.cards.map((c) =>
      c.id === main.id
        ? {
            ...fresh,
            number: c.number,
            xp: c.xp,
            wins: c.wins,
            losses: c.losses,
            edition: c.edition,
            season: c.season,
            minted: c.minted,
            createdAt: c.createdAt,
            level: Math.max(c.level, fresh.level),
          }
        : c,
    ),
  }))
  return true
}
