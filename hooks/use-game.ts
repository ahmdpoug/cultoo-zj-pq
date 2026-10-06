'use client'

import { useSyncExternalStore } from 'react'
import { gameStore as store } from '@/lib/store/game-store'
import { cultPower } from '@/lib/game/scoring'

export function useGame() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  const mainCard = state.cards.find((c) => c.id === state.mainCardId) ?? null
  return {
    state,
    mainCard,
    hasPlayer: Boolean(mainCard),
    totalPower: mainCard ? cultPower(mainCard) : 0,
    reset: store.reset,
    setMainCard: (id: string) => store.set((s) => ({ ...s, mainCardId: id })),
  }
}

const noop = () => () => {}
/** True after hydration; use to gate client-only values like countdowns. */
export function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}
