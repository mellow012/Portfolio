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

// Public links — everyone sees
const publicLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: UserIcon },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Tech Stack', href: '/tech', icon: Code },
  { name: 'Contact', href: '/contact', icon: Mail },
]

// Private links — only logged-in users
const privateLinks = [
  { name: 'Overview', href: '/overview', icon: BarChart3 },
  { name: 'Dashboard', href: '/dashboard', icon: Settings },
  { name: 'Profile', href: '/profile', icon: UserIcon },
]

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  const handleLogout = async () => {
    await signOut(auth)
    setIsProfileOpen(false)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = user?.uid === ADMIN_UID

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

          {/* Desktop Navigation */}
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

            {/* Private Links — Only for logged-in users */}
            {!loading && user && privateLinks.map((item) => {
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

            {/* Login / Logout */}
            {!loading && (
              user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-rose-500/30 transition"
                >
                  Login
                </Link>
              )
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-lg hover:bg-accent transition"
              >
                <UserIcon className="h-5 w-5" />
              </motion.button>

              {isProfileOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
                >
                  {!loading && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold truncate">{user.displayName || user.email}</p>
                        {isAdmin && <span className="text-xs text-rose-500 font-medium">Admin</span>}
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition"
                      >
                        <UserIcon className="h-4 w-4" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent text-left text-rose-500 transition"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition"
                    >
                      <LogIn className="h-4 w-4" /> Login
                    </Link>
                  )}
                </motion.div>
              )}
            </div>

            {/* Mobile Menu */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border py-4"
          >
            <div className="flex flex-col space-y-1">
              {publicLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition"
                >
                  <item.icon className="h-5 w-5" /> {item.name}
                </Link>
              ))}

              {!loading && user && privateLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition"
                >
                  <item.icon className="h-5 w-5" /> {item.name}
                </Link>
              ))}

              {!loading && (user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-accent text-left transition"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-rose-600 to-purple-600 text-white"
                >
                  <LogIn className="h-5 w-5" /> Login
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}