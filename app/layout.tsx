import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Layout } from '@/components/layout';
import MouseMoveEffect from './mouse-move-effect';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SupplyCycles',
  description: 'Modern supply chain management platform',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <Providers>
          <Layout><MouseMoveEffect />{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
