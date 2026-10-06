import { LEADERBOARD, SEASON } from '@/lib/data/world'

/** Projects the player's rank against the mock season ladder (scaled to total players). */
export function seasonRank(power: number) {
  const above = LEADERBOARD.filter((e) => e.cultPower > power).length
  if (above < LEADERBOARD.length) return above + 1
  const floor = LEADERBOARD[LEADERBOARD.length - 1].cultPower
  const ratio = Math.max(0, Math.min(1, power / floor))
  return Math.round(100 + (1 - ratio) * (SEASON.players - 100))
}
