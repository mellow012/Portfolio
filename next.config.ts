import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // instrumentation.ts is loaded automatically in Next.js 15 —
  // the experimental.instrumentationHook flag was removed in this version.
  // Just place instrumentation.ts at the project root and it runs on startup.

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },

  // Build-time env fallback so next build never hard-crashes on a
  // missing NEXT_PUBLIC_ADMIN_UID in CI or a fresh clone.
  env: {
    NEXT_PUBLIC_ADMIN_UID:
      process.env.NEXT_PUBLIC_ADMIN_UID ?? 'uQxNQHVIbNhm7hNHl8bnwH2Xc322',
  },
}

export default nextConfig