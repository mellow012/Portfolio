import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Mellowverse | Booking Systems & Business Platforms',
  description:
    'Full-stack developer building bus booking systems, church management platforms, and business tools. From Malawi. For clients worldwide.',
  keywords: [
    'booking systems',
    'business platforms',
    'web development',
    'Android apps',
    'Malawi developer',
    'remote developer',
  ],
  authors: [{ name: 'Mellow' }],
  creator: 'Mellow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mellowverse-portfolio.vercel.app',
    title: 'Mellowverse | Booking Systems & Business Platforms',
    description:
      'Full-stack developer building bus booking systems, church management platforms, and business tools.',
    siteName: 'Mellowverse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mellowverse | Booking Systems & Business Platforms',
    description:
      'Full-stack developer building bus booking systems, church management platforms, and business tools.',
    creator: '@melllow012',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}