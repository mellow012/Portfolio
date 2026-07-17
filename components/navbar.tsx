'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Home, User as UserIcon, FolderOpen,
  Code, Mail, LogOut, BarChart3, Settings
} from 'lucide-react'
import { auth } from '@/lib/firebaseConfig'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { MellowverseLogo } from './Logo'

// Fallback to hardcoded value so a missing env var never crashes the build
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'

const publicLinks = [
  { name: 'Home', href: '/#hero', icon: Home },
  { name: 'About', href: '/#about', icon: UserIcon },
  { name: 'Projects', href: '/#projects', icon: FolderOpen },
  { name: 'Tech Stack', href: '/#tech', icon: Code },
  { name: 'Contact', href: '/#contact', icon: Mail },
]

const privateLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: Settings },
  { name: 'Profile', href: '/profile', icon: UserIcon },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('')
      const handleScroll = () => setScrolled(window.scrollY > 24)
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 24)
      
      const sections = ['hero', 'about', 'projects', 'tech', 'contact']
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(`/#${section}`)
            break
          }
        }
      }
    }

    const handleHashChange = () => {
      setActiveSection(window.location.hash || '/#hero')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('hashchange', handleHashChange)
    
    // Initial check
    handleScroll()
    handleHashChange()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [pathname])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const isLoggedIn = !loading && !!user
  const isAdmin = user?.uid === ADMIN_UID
  const handleLogout = async () => {
    await signOut(auth)
    setIsOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? 'bg-[#101415]/80 backdrop-blur-xl shadow-md shadow-black/5 border-b border-[#464554]/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
              <MellowverseLogo />
            </motion.div>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {publicLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === '/' 
                ? activeSection === item.href || (item.href === '/#hero' && (activeSection === '' || activeSection === '/#hero'))
                : pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#c0c1ff] bg-[#c0c1ff]/10'
                      : 'text-[#c7c4d7] hover:text-[#e0e3e5] hover:bg-[#272a2c]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c0c1ff]"
                    />
                  )}
                </Link>
              )
            })}

            {isLoggedIn && (
              <>
                <span className="mx-2 w-px h-4 bg-[#464554]/50" />
                {privateLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-[#c0c1ff] bg-[#c0c1ff]/10'
                          : 'text-[#c7c4d7] hover:text-[#e0e3e5] hover:bg-[#272a2c]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1.5">
            {/* Admin logout button */}
            {isLoggedIn && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </motion.button>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[#272a2c] transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  {isOpen ? <X className="h-5 w-5 text-[#c7c4d7]" /> : <Menu className="h-5 w-5 text-[#c7c4d7]" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden bg-[#101415]/95 backdrop-blur-2xl border-b border-[#464554]/60"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
              className="px-4 py-4 flex flex-col gap-1"
            >
              {publicLinks.map((item) => {
                const Icon = item.icon
                const isActive = pathname === '/' 
                  ? activeSection === item.href || (item.href === '/#hero' && (activeSection === '' || activeSection === '/#hero'))
                  : pathname === item.href
                return (
                  <motion.div
                    key={item.name}
                    variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#c0c1ff]/10 text-[#c0c1ff]'
                          : 'text-[#c7c4d7] hover:bg-[#272a2c] hover:text-[#e0e3e5]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </motion.div>
                )
              })}

              {isLoggedIn && (
                <>
                  <div className="my-2 h-px bg-[#464554]/50" />
                  {privateLinks.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#c7c4d7] hover:bg-[#272a2c] hover:text-[#e0e3e5] transition-all"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}