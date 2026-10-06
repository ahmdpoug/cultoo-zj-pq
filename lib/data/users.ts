import type { Archetype, CultCard, Rarity } from '@/lib/types'
import { buildCard, mockXProfile } from '@/lib/game/scoring'

interface MockUserSeed {
  handle: string
  archetype: Archetype
  guildId: string
  rarity?: Rarity
  boost?: number
}

export const MOCK_USER_SEEDS: MockUserSeed[] = [
  { handle: 'alpha', archetype: 'alpha', guildId: 'alpha-order', rarity: 'mythic', boost: 8 },
  { handle: 'trader', archetype: 'trader', guildId: 'trader-cult', rarity: 'legendary', boost: 7 },
  { handle: 'builder', archetype: 'builder', guildId: 'builders', rarity: 'legendary', boost: 6 },
  { handle: 'meme', archetype: 'meme', guildId: 'meme-army', rarity: 'legendary', boost: 6 },
  { handle: 'researcher', archetype: 'researcher', guildId: 'alpha-order', rarity: 'epic', boost: 5 },
  { handle: 'gigabrain', archetype: 'alpha', guildId: 'alpha-order', rarity: 'epic', boost: 4 },
  { handle: 'degenking', archetype: 'trader', guildId: 'trader-cult', rarity: 'epic', boost: 4 },
  { handle: 'shipooor', archetype: 'builder', guildId: 'builders', rarity: 'epic', boost: 3 },
  { handle: 'frogmaxi', archetype: 'meme', guildId: 'meme-army', rarity: 'epic', boost: 3 },
  { handle: 'og_satoshi_fan', archetype: 'og', guildId: 'alpha-order', rarity: 'legendary', boost: 5 },
  { handle: 'chartwizard', archetype: 'trader', guildId: 'trader-cult', rarity: 'rare', boost: 2 },
  { handle: 'zkdev', archetype: 'builder', guildId: 'builders', rarity: 'rare', boost: 2 },
  { handle: 'liquidlarry', archetype: 'trader', guildId: 'trader-cult', rarity: 'rare' },
  { handle: 'threadooor', archetype: 'researcher', guildId: 'builders', rarity: 'rare' },
  { handle: 'pepe_priest', archetype: 'meme', guildId: 'meme-army', rarity: 'rare' },
  { handle: 'onchainsleuth', archetype: 'researcher', guildId: 'alpha-order', rarity: 'epic', boost: 3 },
  { handle: 'nodeoperator', archetype: 'builder', guildId: 'builders', rarity: 'common' },
  { handle: 'wagmi_wendy', archetype: 'meme', guildId: 'meme-army', rarity: 'common' },
  { handle: 'perpqueen', archetype: 'trader', guildId: 'trader-cult', rarity: 'rare', boost: 1 },
  { handle: 'genesisgrey', archetype: 'og', guildId: 'alpha-order', rarity: 'epic', boost: 3 },
  { handle: 'mevmonk', archetype: 'alpha', guildId: 'builders', rarity: 'rare', boost: 1 },
  { handle: 'airdropandy', archetype: 'meme', guildId: 'meme-army', rarity: 'common' },
  { handle: 'gaslessgabe', archetype: 'builder', guildId: 'builders', rarity: 'common' },
  { handle: 'vaultvera', archetype: 'og', guildId: 'trader-cult', rarity: 'rare' },
]

export const MOCK_CARDS: CultCard[] = MOCK_USER_SEEDS.map((u) => {
  const profile = { ...mockXProfile(u.handle, u.boost ?? 0), archetype: u.archetype }
  return buildCard(profile, { rarity: u.rarity })
})

export function getMockCard(handle: string) {
  return MOCK_CARDS.find((c) => c.handle === handle)
}

export function guildForHandle(handle: string) {
  return MOCK_USER_SEEDS.find((u) => u.handle === handle)?.guildId
}
