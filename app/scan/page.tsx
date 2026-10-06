import type { Metadata } from 'next'
import { CTScanner } from '@/components/scanner/ct-scanner'
import { PageHeader } from '@/components/ui-kit/primitives'

export const metadata: Metadata = { title: 'Scan Your CT' }

export default async function ScanPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams
  return (
    <>
      <PageHeader
        eyebrow="The Gate"
        title="Scan Your CT"
        subtitle="Enter an X username. We read the footprint, weigh the reputation, and strike a card that is yours alone."
      />
      <CTScanner key={demo ?? 'manual'} autoDemo={demo === '1'} />
    </>
  )
}
