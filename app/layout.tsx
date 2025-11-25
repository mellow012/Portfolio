import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-provider'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portfolio - Full Stack Developer',
  description: 'Personal portfolio showcasing projects and skills in modern web development',
  keywords: ['portfolio', 'developer', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'Wisdom Mellow Mlambia' }],
  creator: 'Wisdom Mellow Mlambia',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portfolio.example.com',
    title: 'Portfolio - Full Stack Developer',
    description: 'Personal portfolio showcasing projects and skills in modern web development',
    siteName: 'Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio - Full Stack Developer',
    description: 'Personal portfolio showcasing projects and skills in modern web development',
    creator: '@portfolio',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="portfolio-theme"
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

