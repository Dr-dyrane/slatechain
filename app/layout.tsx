import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { Layout } from '@/components/layout';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SlateChain',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
