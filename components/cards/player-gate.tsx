'use client'

import type { ReactNode } from 'react'
import { ScanLine, Sparkles } from 'lucide-react'
import type { CultCard } from '@/lib/types'
import { useGame, useMounted } from '@/hooks/use-game'
import { CultButton, CultLink } from '@/components/ui-kit/cult-button'
import { XLogo } from '@/components/layout/account-button'
import { useCultAuth } from '@/lib/auth/cult-auth'
import { EmptyState, Skeleton } from '@/components/ui-kit/primitives'

/** Renders children only once the player has a card; otherwise shows onboarding. */
export function PlayerGate({ children, message }: { children: (card: CultCard) => ReactNode; message?: string }) {
  const mounted = useMounted()
  const { mainCard } = useGame()
  const auth = useCultAuth()

  if (!mounted) {
    return (
      <div className="grid gap-6 md:grid-cols-[20rem_1fr]">
        <Skeleton className="aspect-[5/7] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (!mainCard) {
    return (
      <EmptyState
        icon={<ScanLine className="size-6" aria-hidden />}
        title="No card in your hand"
        description={message ?? 'Scan your CT identity or jump straight in with a random demo profile to unlock this area.'}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {auth.configured && !auth.authenticated ? (
              <CultButton onClick={auth.login} icon={<XLogo className="size-3.5" />}>
                Connect X
              </CultButton>
            ) : (
              <CultLink href="/scan" icon={<ScanLine className="size-4" />}>
                Scan Your CT
              </CultLink>
            )}
            <CultLink href="/scan?demo=1" variant="outline" icon={<Sparkles className="size-4" />}>
              Enter Demo
            </CultLink>
          </div>
        }
      />
    )
  }

  return <>{children(mainCard)}</>
}
