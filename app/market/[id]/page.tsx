import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getListing, MOCK_LISTINGS } from '@/lib/data/listings'
import { ListingDetail } from '@/components/marketplace/listing-detail'

export function generateStaticParams() {
  return MOCK_LISTINGS.map((l) => ({ id: l.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const l = getListing(id)
  return { title: l ? `@${l.card.handle} — Cult Market` : 'Listing not found' }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = getListing(id)
  if (!listing) notFound()
  return <ListingDetail listing={listing} />
}
