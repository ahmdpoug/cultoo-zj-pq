import type { Metadata, Viewport } from 'next'
import { Geist, Chakra_Petch } from 'next/font/google'
import { SiteHeader } from '@/components/layout/site-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import { AuthProvider } from '@/components/providers/auth-provider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const chakra = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-chakra', display: 'swap' })

export const metadata: Metadata = {
  title: { default: '$CULT — CT Card Universe', template: '%s · $CULT' },
  description:
    'CT is the game. Turn your Crypto Twitter identity into a collectible card, battle the community, forge legends and ascend through the CULT.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0a10',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${chakra.variable} bg-background`}>
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 md:pt-12">{children}</main>
          <SiteFooter />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  )
}
