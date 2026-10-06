'use client'

import { PlayerGate } from '@/components/cards/player-gate'
import { ProfileView } from '@/components/profile/profile-view'

export default function ProfilePage() {
  return <PlayerGate message="Create your player profile by scanning your CT or entering demo mode.">{(card) => <ProfileView card={card} />}</PlayerGate>
}
