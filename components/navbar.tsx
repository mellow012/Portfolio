'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Home, 
  User as UserIcon, // Renamed to avoid conflict
  FolderOpen, 
  Code, 
  Mail, 
  LogIn, 
  LogOut,
  BarChart3 
} from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { auth } from '@/lib/firebaseConfig'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { MellowverseLogo } from './Logo'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: UserIcon }, // Updated
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Tech Stack', href: '/tech', icon: Code },
  { name: 'Overview', href: '/overview', icon: BarChart3 },
  { name: 'Contact', href: '/contact', icon: Mail },
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
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  
  // Replace with your specific UID
  const ALLOWED_UID = 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsProfileOpen(false)
      setIsOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Determine if login should be shown (only for the specific allowed user)
  const showLogin = !user && !loading

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <MellowverseLogo />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center space-x-2 ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
            {showLogin && (
              <Link
                href="/login"
                className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center space-x-2 ${
                  pathname === '/login' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Theme Toggle, Profile & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-md hover:bg-accent"
                aria-label="Profile menu"
              >
                <UserIcon className="h-5 w-5" />
              </motion.button>
              {isProfileOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1 z-50"
                >
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center space-x-2"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center space-x-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                  )}
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                      pathname === item.href
                        ? 'text-primary bg-accent'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              {showLogin && (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                    pathname === '/login'
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}