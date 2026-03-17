import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-provider'
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

/**
 * This script runs BEFORE React hydrates, setting the correct theme class
 * on <html> so there's never a flash of wrong theme.
 * It must be a plain string — no JSX, no imports.
 */
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('portfolio-theme');
    var theme = stored && ['light','dark','system'].includes(stored) ? stored : 'system';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Blocking inline script — must run before any CSS or React renders.
          dangerouslySetInnerHTML is intentional and safe here: no user input.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="portfolio-theme">
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}