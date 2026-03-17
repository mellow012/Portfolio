/**
 * Next.js Instrumentation Hook
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * This file runs ONCE before the application starts, on the server/Node side.
 * We use it to neutralize the broken `localStorage` global that gets injected
 * when Node.js is started with `--localstorage-file=<invalid-path>`.
 *
 * Root cause:
 *   VS Code (and some launch configs) start the Next.js dev server with the
 *   `--localstorage-file` Node.js flag. When the path is invalid, Node creates
 *   a `localStorage` global whose methods (getItem, setItem, etc.) are
 *   `undefined` — not callable functions. Every `typeof localStorage` check
 *   passes, but any actual call crashes with:
 *     TypeError: localStorage.getItem is not a function
 *
 * Fix: if we detect this broken polyfill, delete it so that all downstream
 *   `typeof localStorage === 'undefined'` guards work correctly.
 */
export async function register() {
  // Only patch on the server side (Node.js runtime)
  if (typeof window !== 'undefined') return

  const g = globalThis as Record<string, unknown>

  if (
    'localStorage' in g &&
    (typeof g.localStorage !== 'object' ||
      g.localStorage === null ||
      typeof (g.localStorage as Storage).getItem !== 'function')
  ) {
    // The broken polyfill is present. Remove it so SSR code sees
    // `typeof localStorage === 'undefined'` as expected.
    try {
      delete g.localStorage
    } catch {
      // Non-configurable — overwrite with undefined instead
      g.localStorage = undefined
    }

    // Also patch sessionStorage if it's similarly broken
    if (
      'sessionStorage' in g &&
      (typeof g.sessionStorage !== 'object' ||
        g.sessionStorage === null ||
        typeof (g.sessionStorage as Storage).getItem !== 'function')
    ) {
      try {
        delete g.sessionStorage
      } catch {
        g.sessionStorage = undefined
      }
    }
  }
}