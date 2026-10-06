import type { CultCard, TxReceipt } from '@/lib/types'
import { BATTLE_REWARDS, resolveBattle } from '@/lib/game/battle'
import { RARITY_META, nextRarity } from '@/lib/game/rarity'
import { createRng, randomId } from '@/lib/game/rng'
import { buildCard, mockXProfile, normalizeHandle } from '@/lib/game/scoring'
import {
  gameStore,
  grantXp,
  logActivity,
  progressQuest,
  unlock,
  updateCard,
  type GameState,
} from '@/lib/store/game-store'
import { InsufficientBalanceError, type CultServices, type OnboardingService, type SocialService } from './types'

const STARTER = { balance: 12_500, fragments: 240, materials: 36 }
export const UPGRADE_COST = { cult: 400, materials: 6, xp: 1200 }

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function receipt(): TxReceipt {
  const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return { hash: `0x${hex}`, simulated: true, at: Date.now() }
}

function requireBalance(s: GameState, amount: number) {
  if (s.economy.balance < amount) throw new InsufficientBalanceError(amount)
}

function debit(s: GameState, amount: number): GameState {
  return { ...s, economy: { ...s.economy, balance: s.economy.balance - amount } }
}

function starterInventory(owner: string): CultCard[] {
  const rng = createRng(`${owner}:inventory`)
  const plan = ['common', 'common', 'common', 'rare', 'rare', 'rare', 'rare', 'epic'] as const
  return plan.map((rarity, i) => {
    const handle = `${['ape', 'anon', 'gm', 'wen', 'fren', 'degen', 'shill', 'hodl'][i]}${rng.int(10, 999)}`
    const card = buildCard(mockXProfile(handle), { owner, rarity, level: rng.int(3, 24), id: randomId('card') })
    return { ...card, createdAt: Date.now() - i * 60_000 }
  })
}

const mockSocial: SocialService = {
  async getProfile(handle) {
    await delay(900)
    return mockXProfile(handle)
  },
  shareUrl(text, url) {
    const params = new URLSearchParams({ text })
    if (url) params.set('url', url)
    return `https://x.com/intent/post?${params.toString()}`
  },
}

export function createOnboarding(social: SocialService): OnboardingService {
  return {
    async createPlayer(handleRaw, opts) {
      const handle = normalizeHandle(handleRaw) || `anon${Math.floor(Math.random() * 9999)}`
      const profile = opts?.demo ? mockXProfile(handle, 4) : await social.getProfile(handle)
      const s0 = gameStore.getSnapshot()
      const owner = s0.cards.find((c) => c.id === s0.mainCardId)?.handle ?? profile.handle
      const card: CultCard = { ...buildCard(profile, { owner }), id: randomId('card'), createdAt: Date.now() }
      gameStore.set((s) => {
        const isFirst = !s.mainCardId
        let next: GameState = {
          ...s,
          mainCardId: isFirst ? card.id : s.mainCardId,
          cards: isFirst ? [card, ...starterInventory(profile.handle)] : [card, ...s.cards],
          economy: isFirst ? { ...s.economy, ...STARTER } : s.economy,
        }
        next = logActivity(next, 'scan', `Scanned @${profile.handle} — ${RARITY_META[card.rarity].label} pulled`)
        next = progressQuest(unlock(next, 'first-scan'), 'scan')
        return next
      })
      return { card, profile }
    },
  }
}

export const mockServices: CultServices = {
  social: mockSocial,

  wallet: {
    async connect() {
      await delay(700)
      const address = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      gameStore.set((s) => ({ ...s, wallet: { address } }))
      return address
    },
    async disconnect() {
      gameStore.set((s) => ({ ...s, wallet: { address: null } }))
    },
  },

  token: {
    balanceOf() {
      return gameStore.getSnapshot().economy.balance
    },
    async spend(amount, reason) {
      requireBalance(gameStore.getSnapshot(), amount)
      await delay(500)
      gameStore.set((s) => logActivity(debit(s, amount), 'buy', reason))
      return receipt()
    },
  },

  onboarding: createOnboarding(mockSocial),

  nft: {
    async mint(cardId) {
      await delay(1600)
      const r = receipt()
      gameStore.set((s) => logActivity(updateCard(s, cardId, (c) => ({ ...c, minted: true })), 'mint', 'Minted card (simulated)'))
      return r
    },
  },

  marketplace: {
    async buy(listing) {
      requireBalance(gameStore.getSnapshot(), listing.price)
      await delay(1200)
      const s0 = gameStore.getSnapshot()
      const owner = s0.cards.find((c) => c.id === s0.mainCardId)?.handle ?? 'you'
      const card: CultCard = { ...listing.card, id: randomId('card'), owner, createdAt: Date.now() }
      gameStore.set((s) =>
        logActivity({ ...debit(s, listing.price), cards: [...s.cards, card] }, 'buy', `Bought @${card.handle} for ${listing.price} $CULT`),
      )
      return { receipt: receipt(), card }
    },
  },

  forge: {
    async forge(cardIds) {
      const s0 = gameStore.getSnapshot()
      const inputs = s0.cards.filter((c) => cardIds.includes(c.id))
      const out = inputs[0] ? nextRarity(inputs[0].rarity) : null
      if (inputs.length !== 3 || !out || inputs.some((c) => c.rarity !== inputs[0].rarity)) {
        throw new Error('Select 3 cards of the same rarity.')
      }
      const cost = RARITY_META[out].forgeCost
      requireBalance(s0, cost)
      await delay(2400)
      const best = [...inputs].sort((a, b) => b.stats.ctScore - a.stats.ctScore)[0]
      const bump = (v: number) => Math.min(99, v + 3)
      const card: CultCard = {
        ...best,
        id: randomId('card'),
        rarity: out,
        level: Math.max(...inputs.map((c) => c.level)),
        stats: {
          ctScore: bump(best.stats.ctScore),
          reputation: bump(best.stats.reputation),
          influence: bump(best.stats.influence),
          engagement: bump(best.stats.engagement),
          consistency: bump(best.stats.consistency),
          alpha: bump(best.stats.alpha),
        },
        minted: false,
        createdAt: Date.now(),
      }
      gameStore.set((s) => {
        let next: GameState = {
          ...s,
          cards: [...s.cards.filter((c) => !cardIds.includes(c.id)), card],
          economy: { ...s.economy, balance: s.economy.balance - cost, materials: s.economy.materials + 4 },
        }
        if (cardIds.includes(s.mainCardId ?? '')) next.mainCardId = card.id
        next = logActivity(next, 'forge', `Forged a ${RARITY_META[out].label} card`)
        return progressQuest(unlock(next, 'forge-master'), 'upgrade')
      })
      return { receipt: receipt(), card }
    },

    async upgrade(cardId) {
      const s0 = gameStore.getSnapshot()
      requireBalance(s0, UPGRADE_COST.cult)
      if (s0.economy.materials < UPGRADE_COST.materials) throw new Error('Not enough forge materials.')
      await delay(900)
      let levelsGained = 0
      gameStore.set((s) => {
        const charged: GameState = {
          ...s,
          economy: { ...s.economy, balance: s.economy.balance - UPGRADE_COST.cult, materials: s.economy.materials - UPGRADE_COST.materials },
        }
        const r = grantXp(charged, cardId, UPGRADE_COST.xp)
        levelsGained = r.levelsGained
        return progressQuest(logActivity(r.state, 'level', `Upgraded card (+${UPGRADE_COST.xp} XP)`), 'upgrade')
      })
      return { receipt: receipt(), levelsGained }
    },
  },

  arena: {
    async battle(playerCardId, opponent) {
      const player = gameStore.getSnapshot().cards.find((c) => c.id === playerCardId)
      if (!player) throw new Error('Card not found.')
      const { rounds, result } = resolveBattle(player, opponent)
      const reward = BATTLE_REWARDS[result]
      const record = {
        id: randomId('battle'),
        playerCardId,
        opponentHandle: opponent.handle,
        opponentRarity: opponent.rarity,
        result,
        xp: reward.xp,
        reward: reward.cult,
        rounds,
        at: Date.now(),
      }
      let levelsGained = 0
      gameStore.set((s) => {
        let next = updateCard(s, playerCardId, (c) =>
          result === 'victory' ? { ...c, wins: c.wins + 1 } : { ...c, losses: c.losses + 1 },
        )
        const r = grantXp(next, playerCardId, reward.xp)
        levelsGained = r.levelsGained
        next = {
          ...r.state,
          battles: [record, ...r.state.battles].slice(0, 30),
          economy: { ...r.state.economy, balance: r.state.economy.balance + reward.cult, fragments: r.state.economy.fragments + (result === 'victory' ? 12 : 3) },
        }
        next = logActivity(next, 'battle', `${result === 'victory' ? 'Defeated' : 'Lost to'} @${opponent.handle}`)
        next = unlock(next, 'first-battle')
        if (result === 'victory') next = progressQuest(unlock(next, 'first-win'), 'win')
        return progressQuest(next, 'battle')
      })
      return { ...record, levelsGained }
    },
  },

  tournament: {
    async enter(tournamentId, entry) {
      requireBalance(gameStore.getSnapshot(), entry)
      await delay(1000)
      gameStore.set((s) => {
        const next = logActivity({ ...debit(s, entry), tournaments: [...s.tournaments, tournamentId] }, 'tournament', `Entered ${tournamentId}`)
        return progressQuest(next, 'tournament')
      })
      return receipt()
    },
  },
}
