import type { ActivityItem, BattleRecord, CultCard, QuestAction } from '@/lib/types'
import { applyXp } from '@/lib/game/progression'
import { randomId } from '@/lib/game/rng'
import { QUESTS } from '@/lib/data/world'

export interface GameState {
  version: 1
  mainCardId: string | null
  cards: CultCard[]
  wallet: { address: string | null }
  economy: { balance: number; fragments: number; materials: number; seasonXp: number }
  battles: BattleRecord[]
  achievements: string[]
  quests: Record<string, number>
  claimedQuests: string[]
  tournaments: string[]
  activity: ActivityItem[]
}

const STORAGE_KEY = 'cult-demo-state-v1'

export const INITIAL_STATE: GameState = {
  version: 1,
  mainCardId: null,
  cards: [],
  wallet: { address: null },
  economy: { balance: 0, fragments: 0, materials: 0, seasonXp: 0 },
  battles: [],
  achievements: [],
  quests: {},
  claimedQuests: [],
  tournaments: [],
  activity: [],
}

let state: GameState = INITIAL_STATE
let hydrated = false
let storageKey = STORAGE_KEY
const listeners = new Set<() => void>()

function load() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as GameState
      if (parsed.version === 1) state = { ...INITIAL_STATE, ...parsed }
    }
  } catch {
    state = INITIAL_STATE
  }
}

function persist() {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    /* storage full or disabled; demo continues in memory */
  }
}

export const gameStore = {
  getSnapshot(): GameState {
    load()
    return state
  },
  getServerSnapshot(): GameState {
    return INITIAL_STATE
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  set(updater: (s: GameState) => GameState) {
    load()
    state = updater(state)
    persist()
    listeners.forEach((l) => l())
  },
  reset() {
    state = INITIAL_STATE
    persist()
    listeners.forEach((l) => l())
  },
  /** Switch to the save slot for a Privy user (or the guest slot when null). */
  bindUser(userId: string | null) {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    if (key === storageKey && hydrated) return
    storageKey = key
    hydrated = false
    state = INITIAL_STATE
    load()
    listeners.forEach((l) => l())
  },
}

/* ---------- Reducer helpers (pure) ---------- */

export function logActivity(s: GameState, type: ActivityItem['type'], label: string): GameState {
  const item: ActivityItem = { id: randomId('act'), type, label, at: Date.now() }
  return { ...s, activity: [item, ...s.activity].slice(0, 40) }
}

export function unlock(s: GameState, ...ids: string[]): GameState {
  const next = ids.filter((id) => !s.achievements.includes(id))
  return next.length ? { ...s, achievements: [...s.achievements, ...next] } : s
}

export function progressQuest(s: GameState, action: QuestAction, amount = 1): GameState {
  const quests = { ...s.quests }
  for (const q of QUESTS) {
    if (q.action === action) quests[q.id] = Math.min(q.target, (quests[q.id] ?? 0) + amount)
  }
  return { ...s, quests }
}

export function updateCard(s: GameState, id: string, fn: (c: CultCard) => CultCard): GameState {
  return { ...s, cards: s.cards.map((c) => (c.id === id ? fn(c) : c)) }
}

export function grantXp(s: GameState, cardId: string, xp: number) {
  let levelsGained = 0
  let next = updateCard(s, cardId, (c) => {
    const r = applyXp(c.level, c.xp, xp)
    levelsGained = r.levelsGained
    return { ...c, level: r.level, xp: r.xp }
  })
  next = { ...next, economy: { ...next.economy, seasonXp: next.economy.seasonXp + xp } }
  const card = next.cards.find((c) => c.id === cardId)
  if (levelsGained > 0 && card) next = logActivity(next, 'level', `Reached level ${card.level}`)
  if (card && card.level >= 100) next = unlock(next, 'cult-legend')
  return { state: next, levelsGained }
}
