import type { Listing } from '@/lib/types'
import { createRng } from '@/lib/game/rng'
import { RARITY_META } from '@/lib/game/rarity'
import { MOCK_CARDS } from './users'

const BASE_PRICE = { common: 900, rare: 3200, epic: 9500, legendary: 25000, mythic: 88000 }
const LISTING_EPOCH = Date.UTC(2026, 4, 1)

export const MOCK_LISTINGS: Listing[] = MOCK_CARDS.map((card, i) => {
  const rng = createRng(`listing:${card.handle}`)
  const price = Math.round((BASE_PRICE[card.rarity] * rng.float(0.8, 1.4) + card.level * 40) / 50) * 50
  return {
    id: `L${String(card.number).padStart(5, '0')}`,
    card: { ...card, id: `listed_${card.handle}`, minted: true, level: card.level + RARITY_META[card.rarity].tier * 4 },
    seller: card.handle,
    price,
    listedAt: LISTING_EPOCH + i * 3_600_000 * rng.int(1, 9),
  }
})

export function getListing(id: string) {
  return MOCK_LISTINGS.find((l) => l.id === id)
}
