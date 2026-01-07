import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BarPulse | Real-time bar discovery by day & activity',
  description: 'BarPulse helps patrons find bars and live offerings by day, activity, and what is happening right now—powered by owner updates and subscriptions.',
  keywords: 'bars, nightlife, happy hour, trivia, karaoke, live music, map search, bar discovery',
  metadataBase: new URL('https://barpulse.com'),
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

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
