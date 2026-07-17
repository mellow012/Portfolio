'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => null,
})

/**
 * Safely read from localStorage.
 * Guards against:
 *  - SSR (typeof window === 'undefined')
 *  - Broken polyfills where localStorage exists but getItem is not a function
 *    (this is what causes the "--localstorage-file" Node.js warning)
 *  - Private/restricted browser modes that throw on access
 */
function readStorage(key: string): string | null {
  try {
    if (
      typeof window === 'undefined' ||
      typeof window.localStorage === 'undefined' ||
      typeof window.localStorage.getItem !== 'function'
    ) {
      return null
    }
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Safely write to localStorage. Same guards as readStorage. */
function writeStorage(key: string, value: string): void {
  try {
    if (
      typeof window === 'undefined' ||
      typeof window.localStorage === 'undefined' ||
      typeof window.localStorage.setItem !== 'function'
    ) {
      return
    }
    window.localStorage.setItem(key, value)
  } catch {
    // Quota exceeded, private mode, etc. — silently ignore.
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'portfolio-theme',
  ...props
}: ThemeProviderProps) {
  // Always start with defaultTheme on server + client to avoid hydration mismatch.
  // The real stored value is hydrated in useEffect (client-only).
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const stored = readStorage(storageKey)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
    }
  }, [storageKey])

  useEffect(() => {
    // The blocking <script> in layout.tsx handles the first paint.
    // This keeps the class in sync on subsequent theme changes.
    try {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      const resolved =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : theme
      root.classList.add(resolved)
      root.setAttribute('data-theme', resolved)
    } catch { /* no-op */ }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    writeStorage(storageKey, newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}