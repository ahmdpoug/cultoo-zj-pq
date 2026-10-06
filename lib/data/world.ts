import type { Achievement, Guild, LeaderboardEntry, Quest, Tournament } from '@/lib/types'
import { createRng } from '@/lib/game/rng'
import { cultPower } from '@/lib/game/scoring'
import { rarityFromScore } from '@/lib/game/rarity'
import { MOCK_CARDS } from './users'

export const SEASON = {
  id: 'genesis-s01',
  name: 'Genesis',
  label: 'Genesis — Season 01',
  endsAt: Date.UTC(2026, 6, 1, 18, 0, 0),
  players: 48_216,
  prizePool: 2_500_000,
  qualifyTop: 100,
}

export const TOURNAMENTS: Tournament[] = [
  { id: 'genesis-cup', name: 'Genesis Cup', tagline: 'The first blood of the season.', players: 1024, maxPlayers: 1024, entry: 500, prize: 250_000, startsInHours: 0, status: 'live', minRarity: 'rare' },
  { id: 'weekly-clash', name: 'Weekly CT Clash', tagline: 'Every week. Every timeline.', players: 412, maxPlayers: 512, entry: 150, prize: 40_000, startsInHours: 6, status: 'registering', minRarity: 'common' },
  { id: 'alpha-masters', name: 'Alpha Masters', tagline: 'Only the sharpest calls survive.', players: 188, maxPlayers: 256, entry: 1200, prize: 120_000, startsInHours: 30, status: 'registering', minRarity: 'epic' },
  { id: 'meme-lords', name: 'Meme Lords', tagline: 'Engagement is the weapon.', players: 64, maxPlayers: 512, entry: 100, prize: 25_000, startsInHours: 72, status: 'upcoming', minRarity: 'common' },
  { id: 'builders-champ', name: 'Builders Championship', tagline: 'Ship, compete, ascend.', players: 128, maxPlayers: 128, entry: 800, prize: 90_000, startsInHours: -48, status: 'completed', minRarity: 'rare' },
]

export const BRACKET_ROUNDS = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2]

export const GUILDS: Guild[] = [
  { id: 'alpha-order', name: 'The Alpha Order', tag: 'ALPH', motto: 'First to know. First to move.', archetype: 'alpha', members: 4820, xp: 9_820_400, rank: 1, wins: 18_240, seasonPoints: 412_800, leader: 'alpha' },
  { id: 'trader-cult', name: 'The Trader Cult', tag: 'TRDR', motto: 'Charts are scripture.', archetype: 'trader', members: 5210, xp: 9_104_100, rank: 2, wins: 17_012, seasonPoints: 398_450, leader: 'trader' },
  { id: 'builders', name: 'The Builders', tag: 'BLDR', motto: 'We ship while they sleep.', archetype: 'builder', members: 3390, xp: 8_220_900, rank: 3, wins: 14_880, seasonPoints: 361_200, leader: 'builder' },
  { id: 'meme-army', name: 'The Meme Army', tag: 'MEME', motto: 'Culture is the alpha.', archetype: 'meme', members: 7740, xp: 7_906_300, rank: 4, wins: 15_330, seasonPoints: 344_900, leader: 'meme' },
]

export const QUESTS: Quest[] = [
  { id: 'q-scan', title: 'Scan 3 CT profiles', target: 3, xp: 100, action: 'scan' },
  { id: 'q-win', title: 'Win 2 Arena battles', target: 2, xp: 250, action: 'win' },
  { id: 'q-upgrade', title: 'Upgrade a card', target: 1, xp: 150, action: 'upgrade' },
  { id: 'q-tournament', title: 'Enter a tournament', target: 1, xp: 200, action: 'tournament' },
  { id: 'q-share', title: 'Share your card', target: 1, xp: 100, action: 'share' },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-scan', title: 'First Scan', description: 'Generated your first CT card.', tier: 'common' },
  { id: 'first-battle', title: 'First Battle', description: 'Entered the Arena.', tier: 'common' },
  { id: 'first-win', title: 'First Win', description: 'Claimed your first victory.', tier: 'rare' },
  { id: 'forge-master', title: 'Forge Master', description: 'Forged a card in The Forge.', tier: 'epic' },
  { id: 'tournament-winner', title: 'Tournament Winner', description: 'Won a CULT tournament.', tier: 'epic' },
  { id: 'top-100', title: 'Top 100', description: 'Entered the CULT 100.', tier: 'legendary' },
  { id: 'ct-champion', title: 'CT Champion', description: 'Won the seasonal championship.', tier: 'mythic' },
  { id: 'cult-legend', title: 'Cult Legend', description: 'Reached level 100.', tier: 'mythic' },
]

const FILLER = ['vibes', 'basedanon', 'rektguard', 'fomo', 'bagholdr', 'apeinto', 'ngmi', 'ser', 'kek', 'lfg', 'moonboi', 'gm', 'solmaxi', 'ethpilled', 'cypher', 'bullpost', 'onchain', 'larp', 'chad', 'nfa']

export const LEADERBOARD: LeaderboardEntry[] = (() => {
  const rng = createRng('cult100')
  const archetypes = ['trader', 'builder', 'meme', 'alpha', 'og', 'researcher'] as const
  const fromCards: Omit<LeaderboardEntry, 'rank'>[] = MOCK_CARDS.map((c) => ({
    handle: c.handle,
    displayName: c.displayName,
    archetype: c.archetype,
    rarity: c.rarity,
    cultPower: cultPower(c) + (c.handle.length < 8 ? 1400 : 0),
    ctScore: c.stats.ctScore,
    wins: c.wins,
    losses: c.losses,
    seasonPoints: 0,
    cardNumber: c.number,
  }))
  const filler: Omit<LeaderboardEntry, 'rank'>[] = Array.from({ length: 100 - fromCards.length }, (_, i) => {
    const ctScore = rng.int(62, 91)
    const wins = rng.int(20, 160)
    return {
      handle: `${rng.pick(FILLER)}${rng.int(1, 999)}`,
      displayName: '',
      archetype: rng.pick(archetypes),
      rarity: rarityFromScore(ctScore),
      cultPower: ctScore * 72 + rng.int(0, 900) + i,
      ctScore,
      wins,
      losses: rng.int(10, 90),
      seasonPoints: 0,
      cardNumber: rng.int(100, 99000),
    }
  })
  return [...fromCards, ...filler]
    .map((e) => ({ ...e, seasonPoints: Math.round(e.cultPower * 1.6 + e.wins * 22) }))
    .sort((a, b) => b.cultPower - a.cultPower)
    .map((e, i) => ({ ...e, rank: i + 1 }))
})()
