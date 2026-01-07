import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BarLink - Find Bars by Activity & Day',
  description: 'Discover trivia, karaoke, darts, live music, and more at bars near you. Search by day and activity on an interactive map.',
  keywords: 'bars, nightlife, trivia, karaoke, happy hour, live music, bar finder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
