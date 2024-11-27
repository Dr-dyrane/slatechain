import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from "./ClientLayout";
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'

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
              <div className="flex flex-col h-screen md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar />
                  <main className="flex-1 p-4 overflow-auto">
                    <ClientLayout>{children}</ClientLayout>
                  </main>
                </div>
              </div>
            </ErrorBoundary>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
