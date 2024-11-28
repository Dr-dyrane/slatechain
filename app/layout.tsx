import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from "./ClientLayout";
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Layout } from '@/components/layout';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SlateChain',
  description: 'Modern supply chain management platform',
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <Layout>{children}</Layout>
            </ErrorBoundary>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
