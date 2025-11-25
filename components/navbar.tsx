'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Moon, Sun, Menu, X, Home, User as UserIcon, FolderOpen, Code, Mail, LogIn, LogOut, BarChart3, Settings 
} from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { auth } from '@/lib/firebaseConfig'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { MellowverseLogo } from './Logo'

// Pull admin UID from env (add to .env.local + Vercel)
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID


const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: UserIcon },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Tech Stack', href: '/tech', icon: Code },
  { name: 'Contact', href: '/contact', icon: Mail },
]

const privateLinks = [
  { name: 'Overview', href: '/overview', icon: BarChart3 },
  { name: 'Dashboard', href: '/dashboard', icon: Settings },
  { name: 'Profile', href: '/profile', icon: UserIcon },
]

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const isLoggedIn = !loading && !!user
  const isAdmin = user?.uid === ADMIN_UID

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  const handleLogout = async () => {
    await signOut(auth)
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <MellowverseLogo />
            </motion.div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {publicLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-5 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* ONLY YOU SEE THIS — completely hidden from public */}
            {isLoggedIn && (
              <>
                {privateLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div layoutId="navbar-indicator" className="absolute -bottom-5 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  )
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Right Side — Theme + Secret Admin Access */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle — always visible */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.button>

            {/* SECRET KEY — Only you see this tiny icon */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-accent/50 transition"
                title="Logout (admin)"
              >
                <UserIcon className="h-5 w-5 text-rose-500" />
              </button>
            )}

            {/* Mobile Menu */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-1">
              {publicLinks.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                  <item.icon className="h-5 w-5" /> {item.name}
                </Link>
              ))}

              {isLoggedIn && privateLinks.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                  <item.icon className="h-5 w-5" /> {item.name}
                </Link>
              ))}

              {isLoggedIn && (
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-accent text-left">
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}